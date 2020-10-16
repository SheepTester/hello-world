#lang racket
; Racket (repl)
(begin (define code '(list 'begin (append '(define code) (list (cons 'quote (list code)))) '(display (eval code)))) (display (eval code)))

; R5RS

; (begin (define code '(list 'begin (append '(define code) (list (cons 'quote (list code)))) '(display (eval code)))) (display (eval code (scheme-report-environment 5))))

(begin
  (define code
    '(list 'begin
           (append '(define code)
                   ; Issue: code isn't defined in this scope.
                   (list (cons 'quote (list code))))
           '(display (eval code))))
  (display (eval code (scheme-report-environment 5))))
