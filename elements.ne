main -> _ words _ {% ([, words]) => words %}

words -> word __ words {% ([word, , words]) => [word, ...words] %}
	| word {% ([word]) => [word] %}

word -> elementWrapper:+ {% ([elements]) => elements %}

elementWrapper -> element {% ([[symbol]]) => symbol %}

element -> "H"i
    | "He"i
    | "Li"i
    | "Be"i
    | "B"i
    | "C"i
    | "N"i
    | "O"i
    | "F"i
    | "Ne"i
    | "Na"i
    | "Mg"i
    | "Al"i
    | "Si"i
    | "P"i
    | "S"i
    | "Cl"i
    | "Ar"i
    | "K"i
    | "Ca"i
    | "Sc"i
    | "Ti"i
    | "V"i
    | "Cr"i
    | "Mn"i
    | "Fe"i
    | "Co"i
    | "Ni"i
    | "Cu"i
    | "Zn"i
    | "Ga"i
    | "Ge"i
    | "As"i
    | "Se"i
    | "Br"i
    | "Kr"i
    | "Rb"i
    | "Sr"i
    | "Y"i
    | "Zr"i
    | "Nb"i
    | "Mo"i
    | "Tc"i
    | "Ru"i
    | "Rh"i
    | "Pd"i
    | "Ag"i
    | "Cd"i
    | "In"i
    | "Sn"i
    | "Sb"i
    | "Te"i
    | "I"i
    | "Xe"i
    | "Cs"i
    | "Ba"i
    | "La"i
    | "Ce"i
    | "Pr"i
    | "Nd"i
    | "Pm"i
    | "Sm"i
    | "Eu"i
    | "Gd"i
    | "Tb"i
    | "Dy"i
    | "Ho"i
    | "Er"i
    | "Tm"i
    | "Yb"i
    | "Lu"i
    | "Hf"i
    | "Ta"i
    | "W"i
    | "Re"i
    | "Os"i
    | "Ir"i
    | "Pt"i
    | "Au"i
    | "Hg"i
    | "Tl"i
    | "Pb"i
    | "Bi"i
    | "Po"i
    | "At"i
    | "Rn"i
    | "Fr"i
    | "Ra"i
    | "Ac"i
    | "Th"i
    | "Pa"i
    | "U"i
    | "Np"i
    | "Pu"i
    | "Am"i
    | "Cm"i
    | "Bk"i
    | "Cf"i
    | "Es"i
    | "Fm"i
    | "Md"i
    | "No"i
    | "Lr"i
    | "Rf"i
    | "Db"i
    | "Sg"i
    | "Bh"i
    | "Hs"i
    | "Mt"i
    | "Ds"i
    | "Rg"i
    | "Cn"i
    | "Nh"i
    | "Fl"i
    | "Mc"i
    | "Lv"i
    | "Ts"i
    | "Og"i

_ -> [\s]:* {% () => null %}

__ -> [\s]:+ {% () => null %}
