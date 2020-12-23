#lang racket

; 418976235

;(define data '(3 8 9 1 2 5 4 6 7)) ; example
(define data '(4 1 8 9 7 6 2 3 5))

; (define max 9)
(define max 1000000)

(define circle (mcons (car data) '()))
(define set-cdr-of-next circle)
; number -> its pair
(define table (make-hash))
(hash-set! table (car data) circle)
(for ([i (in-range 1 max)])
  (define num
    (if (< i 9)
        (list-ref data i)
        (+ i 1)))
  (define new-pair (mcons num '()))
  (hash-set! table num new-pair)
  (set-mcdr! set-cdr-of-next new-pair)
  (set! set-cdr-of-next new-pair))
(set-mcdr! set-cdr-of-next circle)

; (define times 2)
; (define times 100)
(define times 10000000)

(define (next-cool-thing a b c start)
  (if (= start 0)
      (next-cool-thing a b c max)
      (if (or (= start a) (= start b) (= start c))
          ; Start is in the taken list, CONTINUE
          (next-cool-thing a b c (- start 1))
          start)))

; Repeat 10000000 times
(for ([n (in-range times)])
  (begin
    (when (= (modulo n 100000) 0)
      (display n)
      (display "\n"))
    (define rest (mcdr (mcdr (mcdr (mcdr circle)))))
    (define taken (mcdr circle))
    ; Close loop
    (set-mcdr! circle rest)
    (define a (mcar taken))
    (define b (mcar (mcdr taken)))
    (define c (mcar (mcdr (mcdr taken))))
    (define next-cup (next-cool-thing a b c (- (mcar circle) 1)))
    ; Find dest (misnamed here as "next") pair
    (define next-pair (hash-ref table next-cup))
    ; Splice into the circle
    (define next-pair-cdr (mcdr next-pair))
    (set-mcdr! (mcdr (mcdr taken)) next-pair-cdr)
    (set-mcdr! next-pair taken)
    (set! circle (mcdr circle))))

(define cup-1 (hash-ref table 1))
(define (print-iter mpairs)
  (if (= (mcar mpairs) 1)
      (display "\n")
      (begin
        (display (mcar mpairs))
        (print-iter (mcdr mpairs)))))
(print "\ndone.\n")
(* (mcar (mcdr cup-1)) (mcar (mcdr (mcdr cup-1))))
;(print-iter (mcdr cup-1))