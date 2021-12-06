#lang racket

; @MATX{{};{};{}}
; @MATX{{};{};{};{}}
; @MATX{{};{};{};{};{}}

(define vectors
  (list '(1 -1 -1 1 1)
        '(4 1 6 -6 4)
        '(5 -9 -8 2 1)))

(define (dot u v)
  (apply + (map * u v)))
(define (vector-add . vectors)
  (apply (curry map +) vectors))
(define (vector-scale scalar vector)
  (map (curry * scalar) vector))
(define (vector-subtract . vectors)
  (apply (curry map -) vectors))

(define (orthogonalize vectors)
  (if (<= (length vectors) 1) vectors
      (let ((y (car vectors)) ; vector to project
            (u-basis (orthogonalize (cdr vectors))))
        (define y^ ; projected vector
          (apply vector-add
                 (map (lambda (u)
                        ; (y . u) / (u . u) * u
                        (vector-scale (/ (dot y u) (dot u u)) u))
                      u-basis)))
        (define z ; where y = y^ + z
          (vector-subtract y y^))
        (cons z u-basis))))

; Reversing the list of vectors because my implementation works one way but the
; numbers they give work better the other way
(define orthogonal-basis (orthogonalize (reverse vectors)))
(for ([vector orthogonal-basis]
      [i (in-naturals 1)])
  (display "u")
  (display i)
  (display " = ")
  (display vector)
  (display "; ||u|| = sqrt(")
  (display (dot vector vector))
  (display ")")
  (display "\n"))
(display (string-join (for/list ([vector orthogonal-basis])
                        (string-append "@MATX{"
                                       (string-join (for/list ([entry vector])
                                                      (string-append "{"
                                                                     (number->string entry)
                                                                     "}"))
                                                    ";")
                                       "}"))
                      ","))