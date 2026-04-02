import { useEffect } from "react";
import { Outlet, useRouter, useMatches } from "@tanstack/react-router";
import { slides, TOTAL_SLIDES } from "./router";

export function SlideLayout() {
  const router = useRouter();
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname ?? "/1";
  const currentNum = parseInt(currentPath.replace("/", ""), 10) || 1;

  // Bidirectional sync with speaker notes window
  useEffect(() => {
    try {
      const channel = new BroadcastChannel("slides-sync");
      channel.postMessage({ slide: currentNum, source: "deck" });
      localStorage.setItem("slides-current-slide", String(currentNum));

      function onMessage(e: MessageEvent) {
        if (e.data && e.data.slide && e.data.source === "notes") {
          const num = e.data.slide;
          if (num !== currentNum && num >= 1 && num <= TOTAL_SLIDES) {
            router.navigate({ to: `/${num}` });
          }
        }
      }
      channel.addEventListener("message", onMessage);
      return () => {
        channel.removeEventListener("message", onMessage);
        channel.close();
      };
    } catch {
      // BroadcastChannel not supported
    }
  }, [currentNum, router]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        if (currentNum < TOTAL_SLIDES) {
          router.navigate({ to: `/${currentNum + 1}` });
        }
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (currentNum > 1) {
          router.navigate({ to: `/${currentNum - 1}` });
        }
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [currentNum, router]);

  const currentSlide = slides[currentNum - 1];

  return (
    <div className="deck">
      <div className="slide-container">
        <Outlet />
      </div>
      <nav className="slide-nav">
        <button
          className="nav-btn"
          onClick={() => router.navigate({ to: `/${currentNum - 1}` })}
          disabled={currentNum <= 1}
        >
          &larr;
        </button>
        <span className="slide-counter">
          {currentNum} / {TOTAL_SLIDES}
          {currentSlide && (
            <span className="slide-label"> - {currentSlide.title}</span>
          )}
        </span>
        <button
          className="nav-btn"
          onClick={() => router.navigate({ to: `/${currentNum + 1}` })}
          disabled={currentNum >= TOTAL_SLIDES}
        >
          &rarr;
        </button>
      </nav>
    </div>
  );
}
