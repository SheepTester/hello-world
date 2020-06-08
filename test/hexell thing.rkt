#lang racket

(define n 10)

(define table
  (build-vector n (lambda (i) (make-vector n))))

(define row (- n 1))
(define column (floor (/ n 2)))

(for ([k (in-range 1 (+ (* n n) 1))])
  (vector-set! (vector-ref table row) column k)
  (define old-row row)
  (define old-column column)
  (set! row (+ row 1))
  (set! column (+ column 1))
  (when (= row n)
    (set! row 0))
  (when (= column n)
    (set! column 0))
  (when (not (= (vector-ref (vector-ref table row) column) 0))
    (set! row old-row)
    (set! column old-column)
    (set! row (- row 1)))
  ; Deviating from psuedocode:
  ; `row` can become -1, so I guess I'll set it to n - 1 then
  (when (< row 0)
    (set! row (+ n row))))

(for ([table-row table])
  (display table-row)
  (display "\n"))
