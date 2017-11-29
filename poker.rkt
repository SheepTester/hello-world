; SEAN YEN

; RECURSIVE HIGHER-ORDER FUNCTIONS
; in case we get marked down for using higher order functions
(define (recursive-keep fn sent)
  (if (empty? sent) '()
      (se (if (fn (first sent)) (first sent) '()) (recursive-keep fn (bf sent)))))
(define (recursive-every fn sent)
  (if (empty? sent) '()
      (se (fn (first sent)) (recursive-every fn (bf sent)))))

; MISC USEFUL PROCEDURES
; these procedures aren't specific to cards and can be used in other projects as well
(define (repeat-se sent times) ; (repeat-se 'happy 3) -> '(happy happy happy)
  (if (= times 0) '()
      (se sent (repeat-se sent (- times 1)))))
(define (number-of wd sent) ; finds # of occurences of wd in sent
  (count (recursive-keep (lambda (thing) (equal? thing wd)) sent)))

; CARD HELPER FUNCTIONS
; card-specific procedures
(define (suit-to-English suit)
  (cond ((equal? suit 'd) 'diamonds)
        ((equal? suit 'c) 'clubs)
        ((equal? suit 's) 'spades)
        ((equal? suit 'h) 'hearts)
        (else 'magic))) ; just in case
(define (rank-to-English rank)
  (cond ((equal? rank 'a) 'ace)
        ((equal? rank 'j) 'jack)
        ((equal? rank 'q) 'queen)
        ((equal? rank 'k) 'king)
        ((and (>= rank 2) (<= rank 10)) (item rank '(a two three four five six seven eight nine ten)))
        (else 'mysteries))) ; you'll never know
(define (rank-to-English-plural rank) ; full house uses the plural form - could've also made a "plural" procedure, but English is a terrible language
  (cond ((equal? rank 'a) 'aces)
        ((equal? rank 'j) 'jacks)
        ((equal? rank 'q) 'queens)
        ((equal? rank 'k) 'kings)
        ((and (>= rank 2) (<= rank 10)) (item rank '(a twos threes fours fives sixes sevens eights nines tens)))
        (else 'mysteries))) ; always have a plan B
(define sorted-ranks '(a 2 3 4 5 6 7 8 9 10 j q k)) ; the best way to sort a sentence is to have an already-sorted sentence and remove what isn't needed
(define (next-rank rank)
  (cond ((equal? rank 'a) 2)
        ((equal? rank 10) 'j)
        ((equal? rank 'j) 'q)
        ((equal? rank 'q) 'k)
        ((equal? rank 'k) 'a)
        (else (+ rank 1))))
(define (sort-ranks ranks)
  (recursive-every (lambda (rank) (repeat-se rank (number-of rank ranks))) sorted-ranks))
(define (remove-rank hand rank) ; for two pair to avoid finding the same pair twice
  (recursive-keep (lambda (card) (not (equal? (bf card) rank))) hand))

; VALUE DETECTION
; when given a sentence of cards (the hand), these quasi-predicates will return #f if the value doesn't apply
; or some useful value such as a common suit or the highest value
(define (royal-flush? hand) ; not actually a predicate
  (if (member? (bf (first hand)) '(10 j q k a))
      (if (= (count hand) 1) (first (first hand))
          (let* ((suit (royal-flush? (bf hand))))
            (if (equal? suit (first (first hand))) suit ; suit if is
                #f)))
      #f)) ; false if isn't
(define (straight? hand) ; nothing here is a real predicate
  (let* ((ranks (recursive-every bf hand))
         (unfollowed (recursive-keep (lambda (card) (not (member? (next-rank (bf card)) ranks))) hand)))
    (if (= (count unfollowed) 1) (first unfollowed) #f)))
(define (same-suit? hand)
  (if (= (count hand) 1) (first (first hand))
      (let ((result (same-suit? (bf hand))))
        (and result (and (equal? result (first (first hand))) (first (first hand)))))))
(define (same-rank? hand)
  (if (= (count hand) 1) (bf (first hand))
      (let ((result (same-rank? (bf hand))))
        (and result (and (equal? result (bf (first hand))) (bf (first hand)))))))
(define (of-a-kind? n hand) ; quasipredicate that sees if there is n cards with the same rank
  (find-of-a-kinds n (recursive-every bf hand) sorted-ranks))
(define (find-of-a-kinds num my-ranks ranks)
  (cond ((empty? ranks) #f)
        ((= num (number-of (first ranks) my-ranks)) (first ranks))
        (else (find-of-a-kinds num my-ranks (bf ranks)))))

; THE PROCEDURE
(define (poker-value hand)
  (let* ((royal (royal-flush? hand)) ; the suit if it's a royal flush
         (straight (straight? hand)) ; highest card of straight if straight
         (flush (same-suit? hand)) ; suit if flush
         (four-kind (of-a-kind? 4 hand)) ; rank that is common between four cards
         (three-kind (of-a-kind? 3 hand)) ;                         ^ three cards
         (pair (of-a-kind? 2 hand)) ;                               ^   two cards
         (ranks (recursive-every bf hand)))
    (cond (royal (se '(royal flush -) (suit-to-English royal)))
          ((and straight flush) (se (word (rank-to-English (bf straight)) '-high) '(straight flush -) (suit-to-English flush)))
          (four-kind (se '(four of a kind -) (rank-to-English-plural four-kind)))
          ((and three-kind pair) (se '(full house -) (rank-to-English-plural three-kind) 'over (rank-to-English-plural pair)))
          (flush (se '(flush -) (suit-to-English flush)))
          (straight (se (word (rank-to-English (bf straight)) '-high) 'straight))
          (three-kind (se '(three of a kind -) (rank-to-English three-kind)))
          (pair (let ((second-pair (of-a-kind? 2 (remove-rank hand pair))))
                  (if second-pair
                      (se '(two pair -) (rank-to-English-plural pair) 'and (rank-to-English-plural second-pair))
                      (se '(pair -) (rank-to-English-plural pair)))))
          ((member? 'a ranks) '(high card - ace)) ; ace is considered the highest rank at this point
          (else (se '(high card - ) (rank-to-English (last (sort-ranks ranks))))))))

; TEST CASES: in order of decreasing value
(poker-value '(da dk dq dj d10))
(poker-value '(c8 c7 c6 c5 c4))
(poker-value '(hj dj sj cj d7))
(poker-value '(h10 d10 s10 c9 d9))
(poker-value '(s4 sj s8 s2 s9))
(poker-value '(c9 d8 s7 d6 h5))
(poker-value '(c7 d7 s7 ck d3))
(poker-value '(c4 s4 c3 d3 cq))
(poker-value '(ha da c8 s4 h7))
(poker-value '(ca d2 h3 s5 d7))
(poker-value '(d3 cj s8 h4 s2))
