#lang racket

; racket get-opal-info.rkt --help

(require net/http-easy)
(require json)
(require racket/cmdline)

; gun.opals.pausd.org Gunn HS
; pa.opals.pausd.org  Paly HS
; jls.opals.pausd.org JLS MS
; ter.opals.pausd.org Terman MS
; hoo.opals.pausd.org Hoover ES
; duv.opals.pausd.org Duveneck ES
; nix.opals.pausd.org Nixon ES
; elc.opals.pausd.org El Carmelo ES
; oh.opals.pausd.org  Ohlone ES

(define opal-base
  (make-parameter "gun.opals.pausd.org"))
(define student-id
  (make-parameter "12345"))

(define show-human-readable (make-parameter #t))
(define show-json (make-parameter #f))

(command-line
 #:program "Get information from Opals"
 
 #:once-each
 ["--opals"
  base
  "Specify the domain of the Opals site. (eg \"pa.opals.pausd.org\")"
  (opal-base base)]
 
 [("-r" "--robot")
  "Hide the human-readable output"
  (show-human-readable #f)]
 
 [("-j" "--json")
  "Output the JSON containing the user info"
  (show-json #t)]
 
 #:args
 (id)
 "Get information for a given ID"
 (student-id id))

(define opal-login-url
  (string-append "https://" (opal-base) "/bin/login"))
(define opal-myaccount-url
  (string-append "https://" (opal-base) "/bin/user/myaccount"))

(define get-session-id-regexp #rx"sessionID=([0-9a-fA-F]+);")
(define (get-session-id header)
  (let ((match
            (regexp-match* get-session-id-regexp
                           header
                           #:match-select second)))
    (if (null? match)
        #f
        (car match))))

; Will fail if the JSON contains "};"
; Note that . in Racket does match newlines
(define get-user-info-regexp #rx"\\$scope\\.userInfo=({.+?})\\s*;")
(define (get-user-info resp)
  (let ((match
            (regexp-match* get-user-info-regexp
                           (response-body resp)
                           #:match-select second)))
    (if (null? match)
        (error "Could not find user info in myaccount page.")
        (bytes->jsexpr (car match)))))

(define (get-key json key)
  (let ((value (hash-ref json key 'null)))
    (if (eq? value 'null)
        ""
        value)))

(define (display-user-info user-info)
  (display (get-key user-info 'firstname))
  (display " ")
  (display (get-key user-info 'middlename))
  (display " ")
  (display (get-key user-info 'lastname))
  (display "\nGraduation year: ")
  (display (get-key user-info 'yeargraduation))
  (display " | Grade: ")
  (display (get-key user-info 'grade))
  (display "\nEmail: ")
  (display (get-key user-info 'email))
  (display " | Phone: ")
  (display (get-key user-info 'phone))
  (display "\n\nGuardian(s):")
  (for-each (lambda (guardian)
              (display "\n")
              (display (get-key guardian 'gfirstname))
              (display " ")
              (display (get-key guardian 'glastname))
              (display ": ")
              (display (get-key guardian 'gemail)))
            (hash-ref user-info 'guardianList '()))
  (display "\n\nPrimary directions:\n")
  (display (get-key user-info 'addrLine1))
  (display "\n")
  (let ((line-2 (get-key user-info 'addrLine2)))
    (unless (eq? line-2 "")
      (display line-2)
      (display "\n")))
  (display (get-key user-info 'city))
  (display " ")
  (display (get-key user-info 'state))
  (display " ")
  (display (get-key user-info 'zip))
  (display "\n"))

; Login to Opal
(define login-response
  (post opal-login-url
        #:form `((username . ,(student-id))
                 (password . ""))))

; Get session ID from the Set-Cookie header
(define session-id
  (ormap get-session-id
         (response-headers-ref* login-response 'set-cookie)))

(unless session-id
  (error "Unable to log in. (Student ID probably does not exist)"))

(define myaccount-response
  (get opal-myaccount-url
       #:headers (hasheq 'cookie
                         (bytes-append #"sessionID=" session-id))))

(define user-info (get-user-info myaccount-response))

(when (show-json)
  (display (jsexpr->bytes user-info)))

(when (show-human-readable)
  (display-user-info user-info))
