package main

import (
	"context"
	"database/sql"
	"embed"
	"fmt"
	"html/template"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"strings"
	"syscall"
	"time"

	_ "modernc.org/sqlite"
)

//go:embed templates/*
var templateFS embed.FS

type Deck struct {
	Slug     string
	Title    string
	Position int
}

type Server struct {
	db      *sql.DB
	rootDir string
	tmpl    *template.Template
}

func main() {
	rootDir, err := os.Getwd()
	if err != nil {
		log.Fatal(err)
	}

	dbPath := filepath.Join(rootDir, "slides.db")
	db, err := sql.Open("sqlite", dbPath)
	if err != nil {
		log.Fatal(err)
	}
	defer db.Close()

	if err := initDB(db); err != nil {
		log.Fatal(err)
	}

	tmpl, err := template.ParseFS(templateFS, "templates/*.html")
	if err != nil {
		log.Fatal(err)
	}

	srv := &Server{
		db:      db,
		rootDir: rootDir,
		tmpl:    tmpl,
	}

	mux := http.NewServeMux()
	mux.HandleFunc("/favicon.ico", srv.handleFavicon)
	mux.HandleFunc("/", srv.handleIndex)
	mux.HandleFunc("/deck/", srv.handleDeck)
	mux.HandleFunc("/notes/", srv.handleNotes)

	httpSrv := &http.Server{
		Addr:         ":6100",
		Handler:      mux,
		ReadTimeout:  5 * time.Second,
		WriteTimeout: 10 * time.Second,
	}

	go func() {
		fmt.Println("Slides server running at http://localhost:6100")
		if err := httpSrv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatal(err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	fmt.Println("\nShutting down...")
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	if err := httpSrv.Shutdown(ctx); err != nil {
		log.Fatal(err)
	}
}

func initDB(db *sql.DB) error {
	_, err := db.Exec(`
		CREATE TABLE IF NOT EXISTS decks (
			slug TEXT PRIMARY KEY,
			title TEXT NOT NULL,
			position INTEGER NOT NULL DEFAULT 0
		)
	`)
	return err
}

func (s *Server) syncDecks() ([]Deck, error) {
	entries, err := os.ReadDir(s.rootDir)
	if err != nil {
		return nil, fmt.Errorf("reading root dir: %w", err)
	}

	var found []string
	for _, e := range entries {
		if !e.IsDir() {
			continue
		}
		name := e.Name()
		if strings.HasPrefix(name, ".") || name == "templates" {
			continue
		}
		indexPath := filepath.Join(s.rootDir, name, "index.html")
		if _, err := os.Stat(indexPath); err == nil {
			found = append(found, name)
		}
	}

	// Insert new decks with next position
	for _, slug := range found {
		var exists bool
		err := s.db.QueryRow("SELECT 1 FROM decks WHERE slug = ?", slug).Scan(&exists)
		if err == sql.ErrNoRows {
			var maxPos int
			s.db.QueryRow("SELECT COALESCE(MAX(position), -1) FROM decks").Scan(&maxPos)
			title := strings.ReplaceAll(slug, "-", " ")
			title = strings.ReplaceAll(title, "_", " ")
			title = strings.Title(title)
			_, err = s.db.Exec("INSERT INTO decks (slug, title, position) VALUES (?, ?, ?)", slug, title, maxPos+1)
			if err != nil {
				return nil, fmt.Errorf("inserting deck %s: %w", slug, err)
			}
		}
	}

	// Remove decks whose directories no longer exist
	foundSet := make(map[string]bool, len(found))
	for _, slug := range found {
		foundSet[slug] = true
	}
	rows, err := s.db.Query("SELECT slug FROM decks")
	if err != nil {
		return nil, fmt.Errorf("querying decks: %w", err)
	}
	defer rows.Close()
	var toRemove []string
	for rows.Next() {
		var slug string
		if err := rows.Scan(&slug); err != nil {
			return nil, err
		}
		if !foundSet[slug] {
			toRemove = append(toRemove, slug)
		}
	}
	for _, slug := range toRemove {
		s.db.Exec("DELETE FROM decks WHERE slug = ?", slug)
	}

	// Return ordered list
	orderedRows, err := s.db.Query("SELECT slug, title, position FROM decks ORDER BY position ASC")
	if err != nil {
		return nil, fmt.Errorf("querying ordered decks: %w", err)
	}
	defer orderedRows.Close()

	var decks []Deck
	for orderedRows.Next() {
		var d Deck
		if err := orderedRows.Scan(&d.Slug, &d.Title, &d.Position); err != nil {
			return nil, err
		}
		decks = append(decks, d)
	}
	return decks, nil
}

func (s *Server) handleIndex(w http.ResponseWriter, r *http.Request) {
	if r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}

	decks, err := s.syncDecks()
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := s.tmpl.ExecuteTemplate(w, "index.html", decks); err != nil {
		log.Printf("template error: %v", err)
	}
}

func (s *Server) handleDeck(w http.ResponseWriter, r *http.Request) {
	// /deck/my-deck/style.css -> slug=my-deck, file=style.css
	path := strings.TrimPrefix(r.URL.Path, "/deck/")
	parts := strings.SplitN(path, "/", 2)
	if len(parts) == 0 || parts[0] == "" {
		http.NotFound(w, r)
		return
	}

	slug := parts[0]
	file := "index.html"
	if len(parts) == 2 && parts[1] != "" {
		file = parts[1]
	}

	// Prevent directory traversal
	if strings.Contains(file, "..") {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	fullPath := filepath.Join(s.rootDir, slug, file)

	// Verify the resolved path is within the deck directory
	deckDir := filepath.Join(s.rootDir, slug)
	absPath, err := filepath.Abs(fullPath)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	absDeck, err := filepath.Abs(deckDir)
	if err != nil {
		http.NotFound(w, r)
		return
	}
	if !strings.HasPrefix(absPath, absDeck+string(filepath.Separator)) && absPath != absDeck {
		http.Error(w, "forbidden", http.StatusForbidden)
		return
	}

	http.ServeFile(w, r, fullPath)
}

func (s *Server) handleNotes(w http.ResponseWriter, r *http.Request) {
	path := strings.TrimPrefix(r.URL.Path, "/notes/")
	parts := strings.SplitN(path, "/", 2)
	if len(parts) == 0 || parts[0] == "" {
		http.NotFound(w, r)
		return
	}

	slug := parts[0]

	// Check if requesting a specific note file: /notes/<slug>/<num>.md
	if len(parts) == 2 && parts[1] != "" {
		file := parts[1]
		if strings.Contains(file, "..") {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
		notePath := filepath.Join(s.rootDir, slug, "notes", file)
		notesDir := filepath.Join(s.rootDir, slug, "notes")
		absPath, err := filepath.Abs(notePath)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		absDir, err := filepath.Abs(notesDir)
		if err != nil {
			http.NotFound(w, r)
			return
		}
		if !strings.HasPrefix(absPath, absDir+string(filepath.Separator)) {
			http.Error(w, "forbidden", http.StatusForbidden)
			return
		}
		http.ServeFile(w, r, notePath)
		return
	}

	// Serve the speaker notes page
	notesDir := filepath.Join(s.rootDir, slug, "notes")
	var noteFiles []string
	entries, err := os.ReadDir(notesDir)
	if err == nil {
		for _, e := range entries {
			if !e.IsDir() && strings.HasSuffix(e.Name(), ".md") {
				noteFiles = append(noteFiles, e.Name())
			}
		}
	}

	data := struct {
		Slug  string
		Files []string
	}{
		Slug:  slug,
		Files: noteFiles,
	}

	w.Header().Set("Content-Type", "text/html; charset=utf-8")
	if err := s.tmpl.ExecuteTemplate(w, "notes.html", data); err != nil {
		log.Printf("notes template error: %v", err)
	}
}

var faviconSVG = []byte(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#e91e9c"/><stop offset="100%" stop-color="#00d4aa"/></linearGradient></defs><rect width="32" height="32" rx="6" fill="#0a0e1a"/><rect x="6" y="8" width="20" height="16" rx="2" fill="url(#g)"/></svg>`)

func (s *Server) handleFavicon(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "image/svg+xml")
	w.Header().Set("Cache-Control", "public, max-age=86400")
	w.Write(faviconSVG)
}
