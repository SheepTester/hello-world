# load.mcfunction
scoreboard objectives add vars dummy
scoreboard players set three vars 3
scoreboard players set five vars 5
scoreboard players set i vars 1

# tick.mcfunction
scoreboard players operation divisibleBy3 vars = i vars
scoreboard players operation divisibleBy3 vars %= three vars
scoreboard players operation divisibleBy5 vars = i vars
scoreboard players operation divisibleBy5 vars %= five vars
execute if score divisibleBy3 vars matches 0 if score divisibleBy5 vars matches 0 run tellraw @a {"text":"FizzBuzz"}
execute if score divisibleBy3 vars matches 0 unless score divisibleBy5 vars matches 0 run tellraw @a {"text":"Fizz"}
execute unless score divisibleBy3 vars matches 0 if score divisibleBy5 vars matches 0 run tellraw @a {"text":"Buzz"}
execute unless score divisibleBy3 vars matches 0 unless score divisibleBy5 vars matches 0 run tellraw @a {"score":{"name":"i","objective":"vars"}}
scoreboard players add i vars 1
