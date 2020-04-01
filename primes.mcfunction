# Recursively calculates and prints prime numbers until a given point
# After loading the datapack, you can run
# /scoreboard players set max vars <value>
# to set the upper limit to which prime numbers will be tested
# (so it'll test integers between 2 and `value`). Then run
# /function primes:calculate-primes
# This assumes the datapack is set up properly, but I don't
# feel like specifying how here.

#= load.mcfunction
# Initialize the `vars` scoreboard

# Prepare vars scoreboard
scoreboard objectives add vars
scoreboard players set max vars 100

#= calculate-primes.mcfunction
# Begin recursively testing each number from 2 to `max`

scoreboard players set n vars 2
function primes:prime-loop

#= prime-loop.mcfunction
# Recursively tests each number (`n`) up to `max`

scoreboard players set isPrime vars 0
scoreboard players operation test vars = n vars

# Test each number under `n` to see if `n` is divisible by it
function primes:prime-test-loop
execute if score isPrime vars matches 1 run tellraw @a {"score":{"name":"n","objective":"vars"}}

# Recursively call prime-loop until done
scoreboard players add n vars 1
execute if score n vars < max vars run function primes:prime-loop

#= prime-test-loop.mcfunction
# Recursively test each number (`test`) under `n` to see if `n` is divisible by it

scoreboard players remove test vars 1

scoreboard players operation divisible vars = n vars
scoreboard players operation divisible vars %= test vars

# Continue recursion if not divisible
execute unless score divisible vars matches 0 if score test vars matches 3.. run function primes:prime-test-loop

# Mark as prime if it has hit the end
execute unless score divisible vars matches 0 unless score test vars matches 3.. run scoreboard players set isPrime vars 1
