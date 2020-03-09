# Create scoreboard to store stuff
scoreboard objectives add random_board dummy

# Only set Interval if Interval does not exist
execute store success score IntervalExists random_board run scoreboard players get Interval random_board
execute if score IntervalExists random_board matches 0 run scoreboard players set Interval random_board 600

# Initialize Timer by setting it to the Interval value
execute store result score Timer random_board run scoreboard players get Interval random_board

# Make bossbar timer
bossbar add random:timer {"text": "Time until next item"}
bossbar set random:timer color blue
execute store result bossbar random:timer max run scoreboard players get Interval random_board

