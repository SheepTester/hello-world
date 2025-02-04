#let text-color = rgb("#cbd5e1")
#let faded = rgb("#64748b")
#let indent = h(1cm)
#let blue = rgb("#0ea5e9")
#let pink = rgb("#ffa1ad")

#let title = "CSE 251A notes"

// formatting options: https://typst.app/docs/tutorial/formatting/#page-setup
// https://piazza.com/class/m5bnm9b0buy1qv/post/81
#set page(paper: "a5", margin: 1cm, fill: rgb("#0f172a"))
#set text(font: "Inter", fill: text-color, size: 11pt)
#set document(title: title, author: "sean")
#set par(spacing: 1em, 
// justify: true
)

#set heading(numbering: "1.1.")
#set footnote(numbering: "[1]")
#set footnote.entry(separator: line(length: 30% + 0pt, stroke: 0.5pt + text-color))

#show figure.caption: content => block(emph(content), width: 80%)
#show quote: set align(center)

#set math.mat(delim: "[")

#let page_break = pagebreak(weak: true)
#let TODO = box(fill: color.red, outset: 3pt)[#text(fill: color.white, weight: "bold", size: 1.5em)[#emoji.warning TODO #emoji.warning]]

#text(size: 2em, weight: "bold")[#title]

= Introduction / Statistical Learning

== The ML Landscape

learning modalities: (1) supervised learning for prediction problems, (2) unsupervised learning for finding good representations, (3) learning through interaction, e.g. reinforcement learning.

goal for both ML and algorithms: develop procedures exhibiting a desired input-output behavior.
- for ML, the mapping can't easily be precisely defined.
- so we just provide examples of input-output pairs and ask the machine to learn the mapping itself.

*input space $cal(X)$*, *output space $cal(Y)$*

after seeing examples $(x, y)$, pick mapping $f : cal(X) -> cal(Y)$ that accurately recovers I/O pattern of examples

categorize prediction problems by output space type:

+ *discrete*:

  - *binary classification*, e.g. $cal(Y) = {"yes", "no"}$
  - *multiclass*, e.g. $cal(Y) = {"politics", "business", "sports", dots}$
  - *structured outputs*, e.g. $cal(Y) = "parse trees"$

+ *continuous*: *regression*

  e.g. $cal(Y) = [0, infinity), [0, 120]$

+ *probability estimation*: $cal(Y) = [0, 1]$ represents probabilities

learning modalities:

+ *supervised learning*

+ *unsupervised learning*: finding structure in data, underlying degrees of freedom

+ *learning thru interaction*

== Nearest neighbor classification

example problem: given image of handwritten digit, say what digit it is

MNIST dataset of handwritten digits:
- *training set* of $60,000$ images and labels
  - images: $x^((1)), x^((2)), dots, x^((60000))$
  - labels: $y^((1)), y^((2)), dots, y^((60000))$ are numbers in range $0$--$9$
- *test set* of $10,000$ images and labels
- images: size $28 times 28$ (total $784$ pixels), each pixel greyscale $0$--$255$

to *classify* new image $x$, find its nearest neighbor amongst $x^((i))$ using euclidean distance in $RR^784$, return $y^((i))$

stretch each image into 784-coord vector: data space $cal(X) = RR^784$, label space $cal(Y) = {0, 1, dots, 9}$

*euclidean distance* between 784-dimensional vectors $x, z$:

$
||x - z|| = sqrt(sum_(i=1)^784 (x_i - z_i)^2)
$
where $x_i$ is $i$th coord of $x$

error rate on training points is zero. *training error* generally overly optimistic predictor of future performance

*test error*: fraction of test pts incorrectly classified
- random classifier expected $90%$ test error
- test error of nearest neighbor: $3.09%$ ($309$ misclassified)

improvements:

- *$k$-nearest neighbor classification* ($k$-NN): classify pt using labels of $k$ nearest neighbors among training pts
  
  to decide which $k$ is best,
  
  - *hold-out set*:
    + let $S$ be training set
    + choose subset $V subset S$ as _validation set_
    + fraction of $V$ misclassified by finding $k$-NN in $S \\ V$
  - *leave-one-out cross-validation*
    + for each pt $x in S$, find $k$-NN in $S \\ {x}$
    + find fraction misclassified
  
  *$10$-fold cross-validation*:
  
  + divide training set into $10$ eq pieces. training set $S$: $60,000$ pts. call pieces $S_1, S_2, dots, S_10$: $6,000$ pts e/
  + for e/ piece $S_i$
    - classify e/ pt in $S_i$ using $k$-NN w training set $S - S_i$
    - let $epsilon.alt_i =$ fraction of $S_i$ incorrectly classified
  + take avg of those 10 nums:
    $
    #[estimated error with $k$-NN] = (epsilon.alt_1 + dots.c + epsilon.alt_10)/10
    $

- better distance functions, e.g. invariant under:
  - small translations, rotations, e.g. _tangent distance_
  - broader family of natural deformations, e.g. _shape context_

  related: feature selection/reweighting. noisy feature can wreak havoc w NN

algorithmic issue: speed up NN search because naive takes $O(n)$, slow.

- data structures speed up NN search, e.g. locality sensitive hashing, ball trees, $K$-d trees. part of std Python libs for NN

  *$k$-d trees for NN search*: hierarchical, rectilinear spatial partition. for dataset $S subset RR^d$:
  - pick coord $1 <= i <= d$
  - comp $v = "median"({x_i : x in S})$
  - split $S$ into 2 halves, $S_L = {x in S : x_i < v}$, $S_R = {x in S : x_i >= v}$
  - recurse on $S_L$, $S_R$

  types of search, given query $q in RR^d$:
  - *defeatist search*: route $q$ to leaf cell, return NN in that cell. may not be true NN
  - *comprehensive search*: grow search region to other cells that can't be ruled out using triangle ineq

for $n$ data pts in $RR^d$, storage $O(n d)$, time to comp dist $O(d)$ for $cal(l)_p$ norms, geometry can have $2^(O(d))$ pts roughly equidistant from e/o

current methods for fast exact NN search are $O(2^d)$ and $O(log n)$

useful families of dist functions:

- *euclidean distance* (usual choice):

  $
  ||x-z||_2 = sqrt(sum_(i=1)^m (x_i-z_i)^2)
  $

- for $p >= 1$, *$cal(l)_p$ distance*:
  $
  ||x-z||_p = (sum_(i=1)^m (x_i-z_i)^p)^(1/p)
  $
  - $p=2$: euclidean dist
  - $cal(l)$ distance: $||x-z||_1 = sum_(i=1)^m |x_i - z_i|$
  - $cal(l)_infinity$ distance: $||x-z||_infinity = max_i |x_i - z_i|$

- *metric spaces*: if $cal(X)$ is space where data lie, dist function $d : cal(X) times cal(X) -> RR$ is a *metric* if:

  - $d(x, y) >= 0$ (nonnegativity)
  - $d(x, y) = 0$ iff $x = y$
  - $d(x, y) = d(y, x)$ (symmetry)
  - $d(x, z) <= d(x, y) + d(y, z)$ (triangle inequality)

- *kullback-leiber divergence/relative entropy* between probability distribs $p, q$ on set $cal(X)$: (non-metric dist func)

  $
  d(p, q) &= sum_(x in cal(X)) p(x) log p(x) / q(x) >= 0 \
  &= EE_(p(x))[log p(x)/q(x)]
  $
  $p = q &<-> d(p, q) = 0$

  *jensen's inequality*:
  $
  -sum_x p(x) log p(x)/q(x) <= 0
  $

== Statistical learning framework

when does *training data* help develop model that'll work on *future data*? what's the link between the two?

*statistical learning assumption*: all data (past, present, future) is drawn IID (independent, identically distributed) for some (unknown) underlying distribution on $cal(X) times cal(Y)$

three ways to sample from such distrib $P$:

+ draw $(x, y) ~ P$

+ draw $y$ according to its marginal distrib, then draw $x$ according to cond distrib $x | y$

+ draw $x$ then $y | x$

let $mu :$ distribution on $cal(X)$, $eta :$ cond distrib on $y | x$:
- $eta(x) = "Pr"(y = 1 | x) in [0, 1]$

  $eta(x) = {0, 1}$ sometimes, e.g. MNIST digit class; otherwise, inherent uncertainty

*classifier* $h : cal(X) -> cal(Y)$

*risk*: $R(h) = "Pr"_((x, y)~P)(h(x) != y)$

*bayes-optimal classifier*: $h^* : cal(X) -> cal(Y)$ w/ smallest poss risk, when
$
cal(Y) = {0, 1}, h^*(x) = cases(
  1 &"if" eta(x) >= 1/2,
  0 &"otherwise",
)
$

*bayes' risk*: $R^* = R(h^*) = EE[min(eta(x), 1 - eta(x))]$

*consistent*: iff $R(h_n) -> R^*$ as $n -> infinity$, for learning algo returning classifier $h_n$ after seeing $n$ training pts

example: NN class
- pick $n$ pts at random from $P = (mu, eta)$
- let $h_n$ be $1$-NN class trained on data
- $h_n$ not consistent:

  $cal(X) = [0, 1], cal(Y) = {0, 1}, mu$ uniform on $cal(X), eta = 1/4$ elsewhere

  bayes' optimal classifier: $h^* = 0$, risk $R^* = 1/4$

  1-NN classifier:
  
  $"Pr"("error") &= "Pr"("two coins have bias" 1/4 "disagree") \
  &= 2 dot 3/4 dot 1/4 = 3/8 > R^*$

  can show $R(h_n) -> 2R^* (1-R^*)$, at most twice bayes' risk

$k$-NN consistent if $k$ grows w $n$. theorem:

- let $cal(X)$ be metric space, $h_(n, k)$ be $k$-NN classifier based on $n$ training pts $~ P$

- suppose $k$ growing fn of $n$ w $k -> infinity$, $k/n -> 0$; $eta$ continuous

- then $R(h_(n,k)) -> R^*$

proof sketch: pick any py $x in cal(X)$, show $h_(n,k)(x) -> h^*(x)$
- if $eta(x) = 1/2$, doesn't matter what we predict. so w/o loss of generality, let $eta(x) < 1/2$
- by continuity, $eta < 1/2$ in some ball $B$ around $x$. $"Pr"("random pt falls in" B) = mu(B)$
- as $n -> infinity$, $Pr(k"-NN of" x "fall in" B) -> 1, Pr("majority vote of their labels is" 0) -> 1$

assumption may not hold when shifting distribution:
- $mu$ changing, $eta$ fixed, e.g. diff handwriting/speech distribs
- $mu, eta$ both change, e.g. doc categorization (politics, sports, etc.)

= Linear Prediction

== Linear regression

fit line to brunch of pts

- output space $cal(Y) = RR$
- parametric model $h_theta(x)$
- loss: squared loss $(y - h_theta(x))^2$

w no further info, predict *mean*

*variance* of distribution: *mean squared error (MSE)* $EE[("actual" - "predicted")^2]$

*regression* problem has *predictor variable*, *response variable*

line parametrized as $y = a x + b$ ($a$: slope, $b$: intercept)
- $h_theta(x) = a x + b$
- $theta = (a, b)$

*line fitting problem*: pick line $(a, b)$ based on $(x^((1)), y^((1))), dots, (x^((n)), y^((n))) in RR times RR$
- $x^((i))$ predictor, $y^((i))$ response variables
- minimize MSE (*loss function*):
  $
  "MSE"(a, b) = 1/n sum_(i=1)^n (y^((i)) - (a x^((i)) + b))^2
  $

minimize loss function given $(x^((1)), y^((1))), dots, (x^((n)), y^((n)))$

$
underbrace(L(a, b), min_(a,b)) &= sum_(i=1)^n (y^((i)) - (underbrace(a x^((i)) + b, a x^2 + b x + c)))^2
$

$gradient_(a,b) L := mat(0; 0)$, $cases((partial L) / (partial a) &:= 0 \ (partial L) / (partial b) &:= 0)$, solve $a, b$ (closed form solution)

example: response $y in RR$, predictors $x in RR^10$. lin func of 10 vars, $f(x) = w_1 x_1 + w_2 x_2 + dots.c + w_10 x_10 + b = w dot x + b$, where $w = (w_1, w_2, dots, w_10)$

penalize error using *squared loss* $(y - (w dot x + b))^2$

*least-squares regression*
- given data $(x^((1)), y^((1))), dots, (x^((n)), y^((n))) in RR^d times RR$
- return linear func given by $w in RR^d$, $b in RR$
- goal: minimize *loss function*:
  $
  underbrace(L(w, b), min_(w,b)) = sum_(i=1)^n (y^((i)) - (w dot x^((i)) + b))^2
  $

to solve:

#let x = math.accent($x$, math.tilde)
#let w = math.accent($w$, math.tilde)

+ assimilate intercept $b$ into $w$:
  - add new feat that's identically $1$: let $#x = (1, x) in RR^(d+1)$

    e.g. $mat(delim: "(", 4, 0, dots.c, 3) ==> mat(delim: "(", 1, 4, 0, dots.c, 3)$
  - set $#w = (b, w) in RR^(d+1)$
  - $f(x) = w dot x + b = #w dot #x$
  find $#w in RR^(d+1)$ minimizing
  $
  L(#w) &= sum_(i=1)^n (y^((i)) - #w dot #x^((i)))^2\
    gradient_#w L &:=   cases(
    reverse: #true,mat(0; 0; 0; 0)
  ) #h(1mm) d+1
  $

+ #[#set math.mat(delim: "(")
  $
  X = mat(
    <-- #x^((1)) -->;
    <-- #x^((2)) -->;
    dots.v;
    <-- #x^((n)) -->;
  ), y = mat(
    y^((1)); y^((2)); dots.v; y^((n))
  )
  $
  ]
  then loss func is
  $
  L(#w) = sum_(i=1)^n (y^((i)) - #w dot #x^((i)))^2 = ||y - X #w||^2_2
  -> (y - X #w)^T (y-X#w)
  $
  minimized at $#w = (X^T X)^-1 (X^T y)$

generalization: given *training set* $(x^((1)), y^((1))), dots, (x^((n)), y^((n))) in RR^d times RR$, find lin func given by $w in RR^d, b in RR$ minimizing squared loss

$
L(w, b) = sum_(i=1)^n (y^((i)) - (w dot x^((i)) + b))^2
$

better error estimates: *$k$-fold cross-validation* (from earlier):
- divide dataset into $k$ eq-sized groups $S_1, dots, S_k$
- for $i = 1$ to $k$, train regressor on all data except $S_i$, let $E_i$ be error on $S_i$
- error estimate: avg of $E_1, dots, E_k$
when $n$ small, should we be minimizing squared loss?

*ridge regression*: minimize squared loss plus term that penalizes "complex" $w$:

$
L(w, b) = underbrace(sum_(i=1)^n (y^((i)) - (w dot x^((i)) + b))^2, "error on train") + underbrace(underbrace(#text(fill: pink)[$lambda$], "regularization weight") #text(fill: pink)[$||w||^2_2$], "measure of" w "complexity")
$

*regularization*: adding penalty term like this

put predictor vectors in matrix $X$, responses in vector $y$:

$
w = (X^T X + lambda I)^(-1) (X^T y)
$

popular "shrinkage" estimators:

- *ridge regression*
  $
  L(w, b) = sum_(i=1)^n (y^((i)) - (w dot x^((i)) + b))^2 + lambda ||w||^#text(fill: pink)[$2$]_#text(fill: pink)[$2$]
  $
- *lasso*: tends to produce sparse $w$
  $
  L(w, b) = sum_(i=1)^n (y^((i)) - (w dot x^((i)) + b))^2 + lambda ||w||_#text(fill: pink)[$1$]
  $

== Logistic Regression

if enough training data, can we expect perfect classifier? problems:

- inherent uncertainty: avail feats $x$ don't contain enough info to perfectly predict $y$

- limitation of model class: type of classifier used doesn't capture decision boundary, e.g. using linear classifiers w curved boundary

conditional prob est for binary labels
- given dataset of pairs $(x, y)$ where $x in RR^d$, $y in {-1, 1}$
- return classifier that also gives probs $Pr(y = 1 | x)$

simplest case: use lin func of $x$ (+ squatting func)

$
x in RR^u
stretch(->)^(f : "linear")
z = f(x) in RR
stretch(->)^(s : "non-linear but simple")
p = s(z) in RR
$

for data $x in RR^d$, classify and return probs using lin func $f_w(x) = w dot x + b$ where $w = (w_1, dots, w_d)$

prob of $y = 1$ inc as lin func grows, is 50% when lin func is zero

*squashing function* "logistic" "segmoid" (#sym.arrow.l neural nets)
$
s(z) = 1 / (1 + e^(-z))
$
$f : RR^d -> RR, s : RR -> RR$

*logistic regression model*: binary labels $y in {-1, 1}$, model:
$
Pr(y = 1 | x) &= 1 / (1 + e^(-(w dot x + b)))\
Pr(y = -1 | x) &= 1 / (1 + e^(w dot x + b))\
#text(fill: pink)[$Pr(y | x) &= 1 / (1 + e^(-y(w dot x + b)))$] #sym.star\
$
for data $x in RR^d$, binary labels $y in {-1, 1}$, model parametrized by $w in RR^d, b in RR$ (learned from data)

*learning problem*: given $(x^((1)), y^((1))), dots, (x^((n)), y^((n))) in RR^d times {-1, 1}$. max likelihood: pick $w in RR^d, b in R$ that maximizes
$
product_(i=1)^n Pr_(w,b)(y^((i)) | x^((i)))
$
log both sides to get *loss function*:
$
L(w, b) = sum_(i=1)^n ln(1 + e^(-y^((i)) (w dot x^((i)) + b)))
$
goal: minimize this

like lin regression, can absorb $b$ into $w$, yielding simplified loss func $L(w)$

no closed-form solution for $w$, but $L(w)$ is *convex* in $w$, so can find min by *local search*

*gradient descent*: find
$
#math.op("arg min", limits: true)_(w in RR^d) L(w) = sum_(i=1)^n ln(1 + e^(-y^((i)) (w dot x^((i)))))
$
- set $w_0 = 0$
- for $t = 0, 1, 2, dots$ until convergence:
  $
  w_(t+1) = w_t + eta_t sum_(i=1)^n y^((i)) x^((i)) underbrace("Pr"_w_t (-y^((i)) | x^((i))), "doubt"_t (x^((i)), y^((i))))
  $
  where $eta_t$ is a "step size"

=== Handling text data

*bag-of-words*: vectorial repr of text sentences/documents

- fix $V$ = some vocabulary
- treat e/ sentence/doc as vec of len $|V|$:
  $
  x = (x_1, x_2, dots, x_(|V|))
  $
  where $x_i =$ \# times $i$th word appears in sentence

logistic regression approach: code a positive review as $+1$, neg as $-1$

= Convex Optimization

== Convexity and Optimization
