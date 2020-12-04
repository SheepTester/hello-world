#lang racket

; Cannot find a procedure for any/all
(define (all pred? ls)
  (define (iter progress)
    (cond ((null? progress) #t)
          ((pred? (car progress)) (iter (cdr progress)))
          (else #f)))
  (iter ls))

; Not sure what Racket calls these, if they exist

(define (map-maybe value map-proc)
  (if value
      (map-proc value)
      value))

(define (between? min num max)
  (and (>= num min)
       (<= num max)))

(define input
  (port->string (open-input-file "./day-04-input.txt" #:mode 'text)))

(define whitespace-regex
  #px"\\s+")

(define double-newline-regex
  ; I don't think they support actual escaped \r and \n
  #px"\r?\n\r?\n")

(define (parse-field entry)
  (define split (string-split entry ":"))
  (if (pair? split)
      (cons (car split) (cadr split))
      #f))

(define (parse-passport entry)
  (define hash-table
    (make-hash (filter-map parse-field (regexp-split whitespace-regex entry))))
  hash-table)

(define passports
  (map parse-passport
       (regexp-split double-newline-regex input)))

(define (passport-checker schema)
  (define (check-passport passport)
    (all
     (lambda (test)
       (define key (car test))
       (define value (hash-ref passport key #f))
       (and value (or (null? (cdr test)) ((cadr test) value))))
     schema))
  check-passport)

(display "Part 1\n")

(define check-passport-part-1
  (passport-checker '(("byr")
                      ("iyr")
                      ("eyr")
                      ("hgt")
                      ("hcl")
                      ("ecl")
                      ("pid"))))

(length (filter check-passport-part-1 passports))

(display "Part 2\n")

(define get-hex-colour-regex
  ; [:xdigit:] didn't work.
  #px"#[0-9a-f]{6}")

(define valid-eye-colours
  (map symbol->string
       '(amb blu brn gry grn hzl oth)))

(define remove-height-units-regex
  #px"cm|in")

(define (valid-height? height-value)
  (define height
    (string->number (string-replace height-value
                                    remove-height-units-regex
                                    "")))
  (cond ((not height) #f)
        ((string-suffix? height-value "cm") (between? 150 height 193))
        ((string-suffix? height-value "in") (between? 59 height 76))
        (else #f)))
         

(define check-passport-part-2
  (passport-checker `(("byr"
                       ,(lambda (year)
                          (map-maybe (string->number year)
                                     (lambda (y)
                                       (between? 1920 y 2002)))))
                      ("iyr"
                       ,(lambda (year)
                          (map-maybe (string->number year)
                                     (lambda (y)
                                       (between? 2010 y 2020)))))
                      ("eyr"
                       ,(lambda (year)
                          (map-maybe (string->number year)
                                     (lambda (y)
                                       (between? 2020 y 2030)))))
                      ("hgt" ,valid-height?)
                      ("hcl"
                       ,(lambda (colour)
                          (regexp-match-exact? get-hex-colour-regex
                                         colour)))
                      ("ecl"
                       ,(lambda (colour)
                          (member colour valid-eye-colours)))
                      ("pid"
                       ,(lambda (id)
                          (= (string-length id) 9))))))

(length (filter check-passport-part-2 passports))