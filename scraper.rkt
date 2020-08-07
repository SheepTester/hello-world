#lang racket

(require net/http-easy)

(define (get-json url)
  (define res (get url))
  (let ((json (response-json res)))
    (response-close! res)
    (if (eof-object? json)
        #f
        json)))

(get-json "https://httpbin.org/get?foo=12&bar=hello")
