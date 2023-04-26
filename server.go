package main

import (
    "fmt"
    "log"
    "net/http"
    "net"
)

func main() {
    changeHeaderThenServe := func(h http.Handler) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
            // Set some header.
            w.Header().Add("Cross-Origin-Embedder-Policy", "require-corp")
            w.Header().Add("Cross-Origin-Opener-Policy", "same-origin")
            // Serve with the actual handler.
            h.ServeHTTP(w, r)
        }
    }

    fileServer := changeHeaderThenServe(http.FileServer(http.Dir("./")))
    http.Handle("/", fileServer)

    listener, err := net.Listen("tcp", ":0")
    if err != nil {
        log.Fatal(err)
    }

    fmt.Printf("Starting server at http://localhost:%d/", listener.Addr().(*net.TCPAddr).Port)
    log.Fatal(http.Serve(listener, nil))
}

func main2() {
    changeHeaderThenServe := func(h http.Handler) http.HandlerFunc {
        return func(w http.ResponseWriter, r *http.Request) {
            // Set some header.
            w.Header().Add("Keep-Alive", "300")
            // Serve with the actual handler.
            h.ServeHTTP(w, r)
        }
    }

    http.Handle("/", changeHeaderThenServe(http.FileServer(http.Dir("files"))))
    panic(http.ListenAndServe(":8080", nil))
} 