# Create scoreboard to store stuff
scoreboard objectives add random_board dummy

# (You can change this) Delay between items in ticks (20 ticks = 1 second)
scoreboard players set Interval random_board 600

# Initialize Timer by setting it to the Interval value
execute store result score Timer random_board run scoreboard players get Interval random_board

# Make bossbar timer
bossbar add random:timer {"text": "Time until next item"}
bossbar set random:timer color blue
execute store result bossbar random:timer max run scoreboard players get Interval random_board

