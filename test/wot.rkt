(define a '(a))
(define b (cons a 'b))
(set-cdr! a b)

(define c '(c))
(define d (cons 'd c))
(set-cdr! c d)

(list a b c d)