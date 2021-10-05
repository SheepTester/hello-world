#lang racket
;gunnhacks ctf
(define p 101906381131715765878756560595226102058610793878428371114588750810236757520361192962553851927761702375723359706835794687783726622125200560291532109235689089602192749749802154749074399604536087335000269744990008276598882011208210156465775268220718905750130601490353689153553633652495736148893276532699115229727)
(define q 123637769787418195853104010465152364249094490131043995735652118058404574388899367365700583757481728538012131554420603982109421658310876643213159440323385071628340789407291078072162593156462119240028873304987892141884430639613555951202877144652350607284325051955035546300479994175218837646144901065292456637161)
(define n 12599477690231971212030213702857199264269306275598943519418273280625627236050194854966627289022070602852239854674090814744264860182959879707012408002639242484266678286605600906723596280715527828728031981615382436318286099058534565318950442070332026707730718890958192391014969566199590678831875788941023096101991658117442144338738422827491382827200026184040128895331387513982598056982468555432841793551005464330374562990073171836207083039936156952819675243904711517858893775480768735809834291643605128782908122949466523272085666387228583061597312130723569359795497143401215666460362253305287470623183253980998400085047)
(define e 65537)
(define c 4280220854230421733108799253943482164139626336110667520693791568105911321683123017866732249764351828204215731704252198709559475867291010187507915277392547881213130867481149720176397105924914838648896511955965200390903304958598639198828262001586586381042307858156437651397279769009453078771904667273332094689355150505301686223889118797265092398242395810656120655129947285211345822242294392581108963763793339889934496328144751710942110127279656814040005428011044172459523022275201830326735171513584354070808988555918421076938142192863024037726018030374976885370587379601081717456954295804927670698789272499966616010183)

; https://en.wikipedia.org/wiki/RSA_(cryptosystem)#Operation

(define lam (lcm (- p 1) (- q 1)))

; https://stackoverflow.com/a/9758173
(define (egcd a b)
  (if (= a 0)
      (list b 0 1)
      (let* ((result (egcd (modulo b a) a))
             (g (first result))
             (y (second result))
             (x (third result)))
        (list g
              (- x (* (quotient b a) y))
              y))))
(define (modinv a m)
  (let* ((result (egcd a m))
         (g (first result))
         (x (second result))
         (y (third result)))
    (if (= g 1)
        (modulo x m)
        (error "modular inverse does not exist"))))

(modinv 17 780) ; should return 413

; rip racket D:
(define d (modinv e lam))

(define (mod-expt base power mod)
  (define (iter power result)
    (if (= power 0)
        result
        (iter (- power 1) (modulo (* result base) mod))))
  (iter power 1))

(define (fast-mod-expt b n mod)
  (define (square n) (* n n))
  (define (iter base exponent answer)
    (cond ((= exponent 0)
           answer)
          ((even? exponent)
           (display exponent)
           (display " -> ")
           (display (/ exponent 2))
           (display "\n")
           (iter (square base)
                 (/ exponent 2)
                 1))
                 ;answer))
          (else
           (display exponent)
           (display " -> ")
           (display (- exponent 1))
           (display "\n")
           (iter base
                 (- exponent 1)
                 1))))
                 ;(modulo (* answer base) mod)))))
  (iter b n 1))

(fast-mod-expt 65 17 3233) ; should return 2790
; (define m (fast-mod-expt c d n))