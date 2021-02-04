main -> expression

expression -> rule
            | string

rule -> id _ "{" (_ expression):* _ "}"

string -> "\"" stringUnit:* "\""

stringUnit -> char
            | escape

char -> [^\r\n"\\]

escape -> "\\" escapeCode

escapeCode -> "r"
			| "n"
			| "\""
			| "\\"
			| "\r":? "\n"
			| "u" "{" [0-9A-Fa-f]:+ "}"

id -> [\w]:+

_ -> [\s]:*
