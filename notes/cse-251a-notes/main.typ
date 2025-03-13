#let text-color = rgb("#cbd5e1")
#let faded = rgb("#64748b")
#let indent = h(1cm)
#let blue = rgb("#0ea5e9")
#let pink = rgb("#ffa1ad")
#let gold = rgb("#ffd230")

#let title = "CSE 251A notes"

// formatting options: https://typst.app/docs/tutorial/formatting/#page-setup
// https://piazza.com/class/m5bnm9b0buy1qv/post/81
#set page(paper: "a4", margin: 1cm, fill: rgb("#0f172a"))
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
// https://forum.typst.app/t/is-it-possible-to-have-the-equations-shown-aligned-left-with-an-indentation/2839
// #show math.equation.where(block: true): pad.with(left: .5cm)
#show math.equation.where(block: true): set align(left)

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


#pagebreak(weak: true)
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
  L(#w) = sum_(i=1)^n (y^((i)) - #w dot #x^((i)))^2 = #text(fill: gold)[$||y - X #w||^2_2$]
  -> (y - X #w)^T (y-X#w)
  $
  minimized at #text(fill: gold)[$#w = (X^T X)^(-1) (X^T y)$]

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
#text(fill: gold)[$Pr(y | x) &= 1 / (1 + e^(-y(w dot x + b)))$] #sym.star\
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

== Summary

Ideal weight vector $w = (X^T X)^(-1) X^T y$, where $X$ is the data matrix. This is $#math.op("arg min", limits: true)_(w in RR^d) L(w)$, the weight with the least loss, so $min_w L(w) = L("arg min"_(w in RR^d) L(w))$..

Training loss: $||X w - y||^2$

If $f(w) = log(g(w, x_i))$, then $gradient f(w) = x_i / g(w, x_i)$ it seems.

Gradient descent update step: $w_(t+1) = w_t - eta_t gradient L(w)$, where $L(w)$ is the loss function.

Ridge regression has a regularization parameter. This is its loss: $L(w) = sum_(i=1)^n (y^((i)) - (w^T x^((i))))^2 + lambda ||w||^2_2$ ("$L_2$"), or $+ lambda ||w||_1$ ("$L_1$"). Less regularization means a greater likelihood of overfitting. $L_1$ is better for sparse (mostly uncorrelated) parameter vectors.

#pagebreak(weak: true)
= Convex Optimization

== Convexity and Optimization

*optimization*: given $f : RR^D -> RR$, find $min_(w in RR^d) f(w)$ and $w^* = arg min_(w in RR^d) f(w)$, where $f$ continuous, differentiable, etc

eg to select weights to minimize loss

analogues:

- 1st derivative -> gradient $gradient f(x)$
- 2nd derivative -> *Hessian* $gradient^2 f(x)$, $d times d$ matrix
  - $
    gradient^2 f(x)_(i i) = (partial^2 f(x)) / (partial x^2_i)
    $
  - $
    gradient^2 f(x)_(i j) = (partial^2 f(x)) / (partial x_i partial x_j)
    $ when $i != j$

$w^*$ locally optimal when:

- necessary conditions: $gradient f(w^*) = 0, gradient^2 f(w^*)$ *positive semidefinite (PSD)*
  - for $d times d$ matrix $A$, when for all $d times 1$ vectors $z$, $z^T A z text(>=, fill: pink) 0$
  - i.e. if $exists B in RR^(d times m), m <= d$ where $A = B B^T$ => $A$ is PSD
- sufficient conditions: $gradient f(w^*) = 0, gradient^2 f(w^*)$ *positive definite (PD)*
  - for $d times d$ matrix $A$, when for all $d times 1$ vectors $z$, $z^T A z text(>, fill: pink) 0$

*convex*:

- for set $S subset.eq RR^d$, iff for any $x, y in S$ and any $0 <= lambda <= 1$
  $
  (lambda x + (1 - lambda) y) in S
  $
  #image("image.png", width: 3in)
- for func $f subset.eq RR^d -> RR$, iff for any $x, y in RR^d$ and any $0 <= lambda <= 1$
  $
  f(lambda x + (1 - lambda) y) <= lambda f(x) + (1 - lambda) f(y)
  $

properties of convex funcs:

- if $f$ differentiable, then for any $x, y$
  $
  f(y) - f(x) >= gradient f(x)^T (y - x)
  $
  "$f$ lies above gradient"

- if $f$ doubly differentiable at $x$, then $gradient^2 f(x)$ PSD

- benefits:

  - local minima are global minima
  - optimal solutions all connected (i.e. think of flat bottom)
  - can always go "downhill" to optimal sol

*gradient descent*: algo, go "downward" along gradient dir

- $w_0 =$ arb pt in $RR^d$
- iterate: $w_t(t+1) = w_t text(-, fill: pink) eta_t gradient f(w_t)$

  $eta_t$ called "learning rate"/"step size"

  - too small -> slow convergence, too big -> sol bounces around
  - in practice, set $eta$ to small const, trial and error
  - or backtracking line search (L-BLGS), much slower but doesn't require automatic step size selection

*backtracking line search*

+ pick $accent(alpha, macron) > 0, c in (0, 1), rho in (0, 1)$, descent dir $d$
+ set $alpha = accent(alpha, macron)$
+ repeat until //$f(x_t + alpha d_t) <= f(x_t) + epsilon$
  $f(x + alpha d_t) <= f(x_t) + c alpha gradient f(x_t)^T d_t$:
  $alpha <- rho alpha$
+ terminate with $eta_t = alpha$

- for grad desc, $d_t = -gradient f(x_t)$, but algo applies even if not going exactly opp to gradient; any dir where $f$ decreases works
- stop when decrease in $f$ is sufficient (hyperparameter $c$)
- in general, better to spend more resources finding better directions to descend along than refining step size
  
// [slide: Backtracking Line Search]

// *backtracking line search*

// + pick $accent(alpha, tilde) > 0, c in (0, 1), rho in (0, 1)$, descent direction $d_t$
// + set $alpha = accent(alpha, tilde)$
// + repeat until $f(x_t + a d_t) <= f(x_t) + c alpha gradient f(x_t)^T d_t$, $alpha <- rho alpha$
// + terminate with $eta_t = alpha$

// - for grad descent $d_t = -gradient f(x_t)$, but algo applies #TODO

*subgradient method*, for if $f$ not differentiable everywhere (e.g. LI reg)

- use "subgradient" to desc along instead of gradient
- like gradient descent, but with small caveats

as a warmup, *subderivative* of $f$ (convex func on $RR$) at $x_0$ is real num $c$ where:
$
f(x) - f(x_0)
 >= c(x - x_0)
$

- if $f$ differentiable at $x_0$, subderivative is $f'(x)$
- else, there's set of subderivatives $[a, b]$ where
  $
  a &= lim_(x -> x_0^#text(fill: pink)[-]) (f(x) - f(x_0)) / (x - x_0) \
  b &= lim_(x -> x_0^#text(fill: pink)[+]) (f(x) - f(x_0)) / (x - x_0)
  $

*subdifferential $partial f(x_0)$*: set of all subderivatives at $x_0$// #TODO

*subgradient*: for real-valued convex func $f : RR^d -> R$, $v in RR^d$ is subgradient iff $f(x) - f(x_0) >= v^T (x - x_0)$

$partial f(x_0)$: set of all subgradients at $x_0$

*convergence* guaranteed for small enough const step size (scaled by gradient norm), but must maintain $f^((t))_"best" = min(f^((t-1))_"best", f(x_t))$, i.e. best solution so far (slow)

// #TODO ??

*linear regression* gradient desc update:
$
w_(t+1) = w_t + 2 eta X (y - X w_t)
$

*logistic regression* gradient descent update:
$
w_(t+1) = w_t + eta sum_(i=1)^n (y^((i)) x^((i))) / (1 + exp(y^((i)) w^T x^((i))))
$

#let X(i) = $x^((#i))$
#let Y(i) = $y^((#i))$

many ML problems: $f(w) = sum^n_(i=1) g(w, x^((i)), y^((i))) = EE_(i~U(1, dots, u))[g(w, #X[i], #Y[i])]$. computing $gradient f(w_t)$ req an entire pass over training data, computationally expensive when training set large (e.g. logistic regression)

*stochastic gradient method (SGD)*: given data pts $(#X[1], #Y[1]), dots, (#X[n], #Y[n])$. at opt step $t$,
- pick $i in {1, dots, n}$ uniformly at random
- $w_(t+1) = w_t - eta_t gradient g(w_t, #X[i], #Y[i]))$

// #TODO?

- $f(w_(t+1))$ may not be $<= f(w_t)$, but on avg will lower $f(w)$
- typically needs multiple passes over data (epochs)
- $eta_t$ has to be diminishing for variance to go to $0$ as $t -> infinity$

can improve with mini-batches: instead of picking single $i$, pick random subset of indices for e/ update. has lower variance than SGD

- i.e., at each time step $t$, let $B_t =$ random subset of ${1, dots, n}$

  $
  w_(t+1) = w_t - eta_t sum_(i in B_t) 1/(|B_t|) gradient g(w_t, x^((i)), y^((i)))
  $

a func $f$ is *$m$-strongly convex* iff for all $x, y in RR^d$ and $0 <= lambda <= 1$, we have
$
f(lambda x + (1 - lambda)y) <= lambda f(x) + (1 - lambda) f(y) - m/2 lambda (1 - lambda) ||x - y||_2^2
$
$m = 0$ gives regular convexity (otherwise, prohibits flat bottoms)

- if $f$ differentiable, definition equivalent to:
  $
  f(y) >= f(x) + gradient f(x)^T &(y-x) + m/2 ||y - x||^2_2 \
  (gradient f(y) - gradient f(x))^T &(y-x) >= m ||x-y||^2_2
  $

- if $f$ doubly differentiable, definition equiv to
  $
  gradient^2 f(x) - m I
  $
  is PSD for all $x$
  
ex:
$
f(x) &= lambda/2 ||x||^2_2 &&#[?] \
f(w) &= lambda/2 ||w||^2_2 + ||X w - y||^2_2 &&#[$lambda$-strongly convex]\
f(w) &= lambda/2 ||w||^2_2 + 1/2 sum_i log(1 + exp(-y^((i)) w^T x^((i)))) #h(0.5cm) &&#[$lambda$-strongly convex]
$

strongly convex optimization has faster convergence (for SGD, GD, etc)

note: if $A - m I$ and $B$ both PSD, then $A + B - m I$ also PSD

if $f$ $m$-strongly convex, $y$ convex, $w_1 = arg min_w f(w), w_2 = arg min_w f(w) + g(w)$, then
$
||w_1 + w_2|| <= (max_w ||gradient g(w)||) / m
$

i.e. $L_2$ regularization implies stability; changing few data pts doesn't change sol much

*constrained optimization*
$
min_(x in RR^n) f(x) \
"where" cases(
  c_i (x) = 0"," i in E & "(equality constraints)",
  c_i (x) >= 0"," i in I & "(inequality constraints)"
)
$

*feasible set* $Omega = {x | forall_(i in E) c_i (x)=0, forall_(i in I) c_i(x) >=0 }$

how to know if $x$ is (local) sol

+ single equality constraint, $c_1(x) = 0$

  // $x$ is local sol if for small $s$, either $f(x+s) > f(x)$ or $x + s in.not Omega$

  // suppose exists small step $s$ where (i.e. not opt $x$) $c_1(x+s) = c_1(x)=0$ and $f(x+s) < f(x)$.
  // then $c_1(x+s) approx c_1(x) + gradient c_1(x)^T s = 0$
  // and $f(x +s)<f(x)$ implies $0>f(x+s)-f(x) approx gradient f(x)^T s$

  optimality conditions: $gradient f(x) = lambda_1 gradient c_1 (x)$ for some scalar $lambda_1$

+ simple inequality constraint, $c_1(x)>=0$

  $gradient f(x) = lambda_1 gradient c_1 (x) $ for $lambda_1 >= 0$

+ general condition

  *Lagrangian function*
  $
  cal(L) (x,lambda) = f(x) - sum_(i in E union I) lambda_i c_i(x)
  $

  *karush-kuhn-tucker (KKT) conditions*: 
  at local sol $x^*$ under some conds, hay lagrange multipliers $lambda^*$ where
  $
  gradient_x cal(L) (x^*, lambda^*) = 0 #h(0.5cm)& \
  c_i(x^* ) = 0  #h(0.5cm) &forall_i in E \
  c_i(x^*) >= 0 #h(0.5cm) &forall_i in I \
  lambda_i^* >= 0  #h(0.5cm) & forall_u in I \ // typo?
  lambda^*_i c_i (x^*) = 0  #h(0.5cm) & forall_i in E union I #h(0.5cm)//#[)]
  $
  last one: "complementary slackness," either $lambda_i^* = 0$ or $c_i (x^*) > 0$

== Perceptron

for binary linear classifier $x in RR^d, y in {-1,+1}$, decision boundary $w dot x + b = 0$, so on pt $x$, predict $"sign"(w dot x + b)$. classifier correct if $y(w dot x + b) > 0$

potential loss func: no loss if correct, loss $= -y(w dot x + b)$

fit classifier to training set with SGD, update with one data pt at a time. no update if correct.

*perceptron algorithm*

+ init $w = 0, b=0 $
+ keep cyc thru training data $(x, y)$
  
  if $y(w dot x + b) <= 0$ (mislabelled),
  $
  w &= w + y x <- w_(t+1) = w_t - gradient g(w_t) \
  b &= b + y
  $

convergence: let $R = max ||x^((i))||$. suppose hay unit vec $w^*$ and some (margin) $gamma > 0$ where
$
y^((i)) (w^* dot x^((i))) >= gamma "for all" i
$
then perceptron algo converges within $R^2 / gamma^2$ updates

== Summary (for quiz)

need to memorize

hessian:

$
gradient^2 f(x)_(i i) = cases(
  (partial^2 f(x)) / (partial x^2_i) "when" i = j,
  (partial^2 f(x)) / (partial x_i partial x_j) "when" i != j
)
$

convexity:

$
lambda x + (1 - lambda) y in S & "for sets" \
f(lambda x + (1 - lambda) y) <= lambda f(x) + (1 - lambda) f(y) & "for funcs" \
gradient^2 f(x) "is PSD" & "for funcs (doubly differentiable), i.e." \
z^T (gradient^2 f(x)) z >= 0  &  "for all" d times 1 "vectors" \
$

note:
$
(partial) / (partial x_i) x^T x &= 2x_i \
gradient x^T M x &= 2 M x "somehow, at least when" M "is PSD"
$
in general just expand out the multiplications and dot products maybe. for $max$ treat it like piecewise

for SGD, an epoch means going through the entire dataset (randomly)

== For project 2

$
gradient_w L(w) = sum_(i=1)^n [(exp(-y^((i)) (w dot x^((i))))) / (1 + exp(-y^((i)) (w dot x^((i))))) * (-y^((i)) x^((i)))]
\
gradient_w L(w) = -sum_(i=1)^n [y^((i)) x^((i)) * (exp(-y^((i)) (w dot x^((i))))) / (1 + exp(-y^((i)) (w dot x^((i)))))]
\
gradient_w L(w) = -sum_(i=1)^n [y^((i)) x^((i)) * exp(-y^((i)) (w dot x^((i)))) / (1 + exp(-y^((i)) (w dot x^((i))))) ]
\
gradient_w L(w) = -sum_(i=1)^n [y^((i)) x^((i)) * σ(-y^((i)) (w dot x^((i))))]

$

#pagebreak(weak: true)
= Quiz 4

== Support Vector Machines (SVM)

for linearly separable dataset, generally many possible separating hyperplanes, perceptron guaranteed to find one of them. but perhaps we want one w most buffer around it

*learning problem*: given training data $(x^((1)), y^((1))), dots, (x^((n)), y^((n))) in RR^d times {-1, +1}$, find $w in RR^d, b in RR$ where $y^((i)) (w dot x^((i)) + b) > 0$ (*"linear score of $x$"*) for all $i$

by scaling $w, b$, can equivly ask for $y^((i)) (w dot x^((i)) + b) >= 1$ for all $i$

$
1 / epsilon y^((i)) (w dot x^((i)) + b) &= epsilon dot 1/epsilon > 0 \
y^((i)) ( w/epsilon dot x^((i)) + b/epsilon) &= 1
$
$
w' = w/epsilon, b' = b/epsilon
$

maximize margin $gamma = 1/(||w||_2)$ by minimizing $||w||$

- $w dot x + b = 0$ is $gamma$ away from $w dot x + b = -1$ and $w dot x + b = 1$ delineating boundaries of two labels

*maximum-margin linear classifier*: where $cal(Y) = {-1, +1}$
$
min_(w in RR^d, b in RR) ||w||^2 "where" y^((i)) (w dot x^((i)) + b) >= 1 "for all" i = 1, 2, dots, n
$

- this is an *convex optimization problem*: convex objective func, linear constraints
- -> optimal sol can be found efficiently, *duality* gives info about sol

*support vectors*: training points right on margin, i.e. $y^((i)) (w dot x^((i)) +b ) = 1$

- solution $w$ is func of just support vecs $
  w = sum_(i=1)^n alpha_i y^((i)) x^((i))
  $
  where $alpha_i$ nonzero only for support vecs

in non-separable case, e/ data pt $x^((i))$ allowed some *slack $xi_i$*:

$
min_(w in RR^d, b in RR, xi in RR^n) ||w||^2 + C sum_(i=1)^n |xi_i| "where" dots " " xi >= 0
$

== Multiclass classification

*binary* logistic regression: for $cal(X) = RR^d$, classifier given by $w in RR^d, b in RR$,
$
Pr(y=1|x) = (e^(w dot x + b)) / (1 + e^(w dot x + b))
$

for labels $cal(Y) = {1, 2, dots, k}$, specify classifier by $w_1, dots, w_k in RR^d, b_1, dots, b_k in RR$:
$
Pr(y = j|k) 
&= e^(w_j dot x + b_j) / (sum_(i=1)^k e^(w_i dot x + b_i)) \ 
&prop e^(w_j dot x + b_j) \
$

to predict, given pt $x$, predict label 
$
op("arg max", limits: #true)_j Pr(y=j|x) = op("arg max", limits: #true)_j (w_j dot x + b_j)
$

=== Multiclass logistic regression

/ label space: $cal(Y) = {1, 2, dots, k}
  $
/ parameterized classifier: $w_1, dots, w_k in RR^d, b_1, dots, b_k in RR$:
  $
  Pr(y=j|x) = e^(w_j dot x + b_j) / (e^(w_1 dot x + b_1) + dots + e^(w_k dot x + b_k))
  $
/ prediction: given pt $x$, predict label
  $
  op("arg max", limits: #true)_j "" (w_j dot x + b_j)
  $
/ learning: given $(x^((i)), y^((i))), dots, (x^((n)), y^((n)))$, find $w_1, dots, w_k in RR^d, b_1, dots, b_k in RR$ that maximize
  $
  product_(i=1)^n Pr(y^((i))|x^((i)))
  $
  taking negative $log$ gives convex minimization problem

=== Multiclass perceptron

learning: given training set,

- init $w_1 = dots = w_k = 0, b_1 = dots = b_k = 0$
- repeat while some training pt $(x, y)$ misclassified:
  $
  "for correct label" y": "&& w_y &= w_y + x \
  && b_y &= b_y + 1 \
  "for predicted label" accent(y, hat)": "&& w_accent(y, hat) &= w_accent(y, hat) - x \
  && b_accent(y, hat) &= b_accent(y, hat) - 1 \
  $

=== Multiclass SVM

learning: given training set,

$
min_(w_1, dots, w_k in RR^d, b_1, dots, b_k in RR, xi in RR^n)
sum_(j=1)^k ||w_j||^2 + C sum_(i=1)^n xi_i
$
where $w_(y^((i))) dot x^((i)) + b_(y^((i))) - w_y dot x^((i)) - b_y >= 1 - xi_i$ for all $i$, all $y != y^((i))$, $xi >= 0$

also a convex optimization problem

== Quiz notes

hard SVM = no slack (because it makes Taylor hard), soft SVM = slack

*perceptrons* find any dividing line "decision boundary" between datasets. *SVMs* maximize the margins around the line (so it'll probably find just one line); the points on this margin are the *supporting vectors*. removing other points wont change the SVM

lines:

- $w^top x + b = plus.minus 1$ margin lines
- $w^top x + b = 0$ decision boundary

points past their margin line (for soft SVMs) are also supporting vectors. more slack -> further from margin line. slack $> 1$ means it's across the decision boundary

for slack: large $C$ penalizes slack more, so more weird points means you'd want smaller $C$

hard SVM may not have a solution / won't converge

#page_break
= Quiz 5

// == Multiclass Classification

== Kernel Methods

what if systematic deviation, but not linearly separable. eg boundary is $x_1 = x_2^2 + 5$. quadratic in $x = (x_1, x_2)$, but linear in $Phi(x) = (x_1, x_2, x_1^2, x_2^2, x_1 x_2)$

*basis expansion*: embed data in higher-dimensional feature space. then can use linear classifier

for *quadratic* boundary, augment regular features with more terms:
$
Phi(x) = (x_1, dots, x_d, x_1^2, dots, x_d^2, x_1 x_2, x_1 x_3, dots, x_(d-1) x_d)
$

perceptron with basis expansion, learning in higher dimensional space:

- $w = 0, b = 0$
- while some $y(w dot Phi(x) + b) <= 0$:
  - $w = w + y Phi(x)$
  - $b = b + y$

issue: number of features increased dramatically

*kernel trick*: implement this without ever writing down vector in high-dimensional space:

- $w = 0, b = 0$
- while some $text(fill: pink, y^((i))) (w dot Phi(text(fill: pink, x^((i)))) + b) <= 0$:
  - $w = w + text(fill: pink, y^((i))) Phi(text(fill: pink, x^((i))))$
  - $b = b + text(fill: pink, y^((i)))$

+ represent $w$ in *dual* form: $alpha = (alpha_1, dots, alpha_n)$
  $
  w = sum_(j=1)^n alpha_j y^((j)) Phi(x^((j)))
  $

+ compute $w dot Phi(x)$ using dual repr
  $
  w dot Phi(x) = sum_(j=1)^n alpha_j y^((j)) (Phi(x^((j))) dot Phi(x))
  $

+ comp $Phi(x) dot Phi(z)$ without ever writing out $Phi(x)$ or $Phi(z)$

example: in 2D, $x = (x_1, x_2)$, so $Phi(x) = (1, sqrt(2) x_1, sqrt(2) x_2, x_1^2, x_2^2, sqrt(2) x_1 x_2)$

- $
  Phi(x) dot Phi(z) = (1 + x dot z)^2
  $

- takes time proportional to original dimension

=== Kernel perceptron

learning from data $(x^((1)), y^((i))), dots, (x^((n)), y^((n))) in cal(X) times {-1, 1}$

*primal form*: see "kernel trick" above

*dual form*: $w = sum_j alpha_j y^((j)) Phi(x^((j)))$ where $alpha in RR^n$

- $alpha = 0, b = 0$
- while some $i$ has $y^((i)) (sum_j alpha_j y^((j)) Phi(x^((j))) dot Phi(x^((i))) + b) <= 0$:
  - $alpha_i = alpha_i + 1$
  - $b = b + y^((i))$

to classify new point $x$: $"sign"(sum_j alpha_j y^((j)) Phi(x^((j))) dot Phi(x) + b)$

=== Kernel SVM

for SVMs:

- primal (see previous quizzes)

- dual:
  $
  max_(alpha in RR^n) sum_(i=1)^n alpha_i - sum_(i,j=1)^n alpha_i alpha_j y^((i)) y^((j)) (underbrace(x^((i)) dot x^((j)), k(x^((i)), x^((j)))))
  "such that"
  sum_(i=1)^n alpha_i y^((i)) = 0, 0 <= alpha_i <= C
  $

  solution: $w = sum_i alpha_i y^((i)) x^((i))$

+ *basis expansion*: map $x |-> Phi(x)$

+ *learning*: solve dual problem (see "dual" above)

  yields $w = sum_i alpha_i y^((i)) x^((i))$, offset $b$ "also follows"

+ *classification*: given new pt $x$, classify as
  $
  "sign"(sum_i alpha_i y^((i)) (underbrace(Phi(x^((i))) dot Phi(x), k(x^((i)), x))) + b)
  $

=== Polynomial decision boundaries

when decision surface is polynomial of order $p$,

- let $Phi(x)$ consist of all terms of order $<= p$, e.g. $x_1 x_2^2 x_3^(p-3)$

- degree-$p$ polynomial in $x$ <=> linear in $Phi(x)$

- same trick works: $Phi(x) dot Phi(z) = (1 + x dot z)^p$

- *kernel function* $k(x, z) = (1 + x dot z)^p$

=== String kernels

for sequence data like protein seqs, text docs, input space $cal(X) = {A,C,G,T}^*$

use infinite-dimensional embedding for var-length seqs $x$

for e/ substr $s$, def feature
$
Phi_s (x) = "# times substr" s "appears in" x
$

let $Phi(x)$ be vec of one coord for e/ str
$
Phi(x) = (Phi_s (x) : "all strs" s)
$

- ex: embedding of "aardvark" has features $Phi_"ar" ("aardvark") = 2, Phi_"th" ("aardvark") = 0, dots$

lin classifier based on such features very expressive

to comp $k(x,z) = Phi(x) dot Phi(z)$, for e/ substr $s$ of $x$, count how often $s$ appears in $z$

- with DP, takes $O(|x| dot |z|)$

never explicitly construct embedding $Phi(x)$, instead use *kernel function* $k(x,z) = Phi(x) dot Phi(z)$

- think of it as _measure of similarity_ entre $x, z$

- rewrite learning algo and final classifier in terms of $k$

=== Choosing kernel function

final classifier is *similarity-weighted vote*:
$
F(x) = alpha_1 y^((1)) k(x^((1)), x) + dots.c + a_n y^((n)) k(x^((n)), x)
$
(plus offset term $b$)

can't choose $k$ as any sim func, need $k(x,z) = Phi(x) dot Phi(z)$ for _some_ embedding $Phi$

*mercer's condition*: same as requiring that for any finite set of pts $x^((1)), dots, x^((m))$, the $m times m$ sim matrix $K$ given by $K_(i j) = k(x^((i)), x^((j)))$ is PSD

*gaussian kernel/RBF kernel*: popular sim func
$
k(x, z) = e^(-(||x-z||^2) / s^2)
$
where $s$ is adjustable scale param

- as $s arrow.t infinity$, kernel $-> 1$
- as $s arrow.b 0$, kernel $-> 0$
- bigger $s$, more smooth; small $s$, more spiky 
- with more data, #TODO

=== Postscript

+ customized kernels
  - for diff domains (NLP, bio, speech)
  - over diff structures (seqs, sets, graphs)
+ learning kernel func
  - given set of plausible kernels, find lin comb that works well
+ speeding up learning, prediction
  - $n times n$ kernel matrix $k(x^((i)), x^((j)))$ bottleneck for large $n$
  - idea:
    - go back to primal space
    - replace embedding $Phi$ w low-dim mapping $accent(Phi, tilde)$ where
      $
      accent(Phi, tilde)(x) dot accent(Phi, tilde)(z) approx Phi(x) dot Phi(z)
      $
    can be done by e.g. writing $Phi$ in fourier basis, randomly sampling features

== Neural Networks

architecture:

- graph with $x$ at bottom, $y$ on top, middle layers $h^((1)), dots, h^((l))$ mixing inputs from prev layer

how $h$ computed from $z_1, dots, z_m$:
$
h = sigma(w_1 z_1 + dots.c + w_m z_m + b)
$
$sigma(dot.c)$ is nonlinear *activation function*, e.g. rectified linear:
$
sigma(u) = cases(
  u & "if" u >= 0,
  0 & "otherwise"
)
$

common activation funcs:

- threshold func / heaviside step func
  $
  sigma(z) = cases(1 & "if" z >= 0, 0 & "otherwise")
  $
  
- sigmoid
  $
  sigma(z) = 1/(1+ e^(-z))
  $

- hyperbolic tangent
  $
  sigma(z) = tanh(z)
  $

- ReLU (rectified linear unit)
  $
  sigma(z) = max(0, z)
  $

why do we need nonlinear activation funcs? idk.. i dont think it matters! last quizzzzzz

#page_break
== Quiz shit

$A$ is PSD (to determine if a function is a kernel) when for all vecs $v$, $v^top A v >= 0$. $A$ may be non-negative but it may still not be PSD

$Phi$ is "feature map" to a vector; $x, z$ don't need to be vectors (could be strings)

$
k(x,z) = Phi(x) dot Phi(z) = sum_(i=1)^n Phi_i (x) Phi_i (z)
$

when creating a new kernel you can change its $Phi$'s length. consider its sum form. use square roots to halve constants

// PSD matrices are symmetric

kernel properties:
$
k'(x, z) &= a space.thin k(x, z) + b space.thin l(x, z); a, b > 0 & phi.alt'(x) &= sqrt(a) phi.alt(x) circle.tiny sqrt(b) psi(x) = (sqrt(a) phi.alt_1 (x), 
//sqrt(a) phi.alt_2 (x), 
dots, sqrt(a) phi.alt_m (x), sqrt(b) psi_1 (x), 
//sqrt(b) psi_2 (x), 
dots, sqrt(b) psi_n (x)) \
k'(x, z) &= k(x, z) space.thin l(x, z) & phi.alt'_((i,j))(x) &= phi.alt_i (x) psi_j (x) \
$

// $;$
