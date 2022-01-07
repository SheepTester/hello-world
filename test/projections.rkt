#lang racket

(define y '(1 -1 -3))
(define u1 '(1 -8 3))
(define u2 '(-3 2 4))

(define (dot u v)
  (apply + (map * u v)))
(define (vector-add . vectors)
  (apply (curry map +) vectors))
(define (vector-scale scalar vector)
  (map (curry * scalar) vector))
(define (vector-subtract . vectors)
  (apply (curry map -) vectors))

(define y^
  (apply vector-add
         (map (lambda (u)
                ; (y . u) / (u . u) * u
                (vector-scale (/ (dot y u) (dot u u)) u))
              (list u1 u2))))

(define z
  (vector-subtract y y^))

(display "y^ = ")
(display y^)
(display "\n")

(display "z = ")
(display z)
(display "\n")

(display "||u1|| = sqrt(")
(display (dot u1 u1))
(display ")\n")

(display "||z|| = sqrt(")
(display (dot z z))
(display ")\n")
