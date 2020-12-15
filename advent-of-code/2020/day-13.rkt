#lang racket

; doesn't work rip

(define input-
  (port->string (open-input-file "./day-13-input.txt" #:mode 'text)))

(define input "a\n1789,37,47,1889")

(define buses
  (let ((bus-list (string-split (list-ref (string-split input
                                                        "\n"
                                                        #:trim? #t)
                                          1)
                                ",")))
    (for/list ([i (in-naturals)]
               [bus bus-list]
               #:when (not (equal? bus "x")))
      (cons (string->number bus) i))))
buses

(define sorted-buses
  (sort buses
        >
        #:key car))

(define (iter i step to-mod offset)
  (if (= (modulo i to-mod) offset)
      i
      (iter (+ i step) step to-mod offset)))
; (iter 0 29 41 19)

(define (iter2 i step to-mod offset)
  (if (= (modulo i to-mod) 0)
      (+ i offset)
      (iter2 (+ i step) step to-mod offset)))
; iter2's i must be actual i - offset
; (iter2 -19 29 41 19)

(define (bus-iter start step buses-left)
  (cond ((null? buses-left) start)
        (else
         (define next-bus-id (caar buses-left))
         (define next-bus-offset (cdar buses-left))
         (define next-found (iter start step next-bus-id next-bus-offset))
         (display "found ")
         (display next-bus-id)
         (display " at timestamp ")
         (display next-found)
         (display " so ")
         (display (lcm step next-bus-id))
         (display " is new step size\n")
         (bus-iter next-found
                   (lcm step next-bus-id)
                   (cdr buses-left)))))

(bus-iter (cdar sorted-buses) (caar sorted-buses) (cdr sorted-buses))