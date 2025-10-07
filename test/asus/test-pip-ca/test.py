from curricularanalytics import Course, Curriculum, DegreePlan, Term, co, pre, strict_co
from discord import Client, Intents

A = Course("A", 3)
B = Course("B", 1)
C = Course("C", 2)
D = Course("D", 1)
E = Course("E", 4)
F = Course("F", 1)

E.add_requisite(A, pre)
C.add_requisite(A, pre)
E.add_requisite(B, pre)
F.add_requisite(B, pre)
E.add_requisite(D, co)
E.add_requisite(F, strict_co)

curric = Curriculum("Test Curric", [A, B, C, D, E, F])
curric.graph
terms = [Term([A, B]), Term([C, D]), Term([E, F])]
dp = DegreePlan("Test Plan", curric, terms)

client = Client(intents=Intents.all())
