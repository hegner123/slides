binary := "slides"

build:
    go build -o {{binary}} .
    codesign -s - {{binary}}

run: build
    ./{{binary}}

clean:
    rm -f {{binary}}
