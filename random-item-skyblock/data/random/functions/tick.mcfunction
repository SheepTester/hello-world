# If Timer = Interval, then run the give_all function
execute if score Timer random_board >= Interval random_board run function random:give_all

# Add 1 to Timer
scoreboard players add Timer random_board 1

# Set bossbar value to Timer
execute store result bossbar random:timer value run scoreboard players get Timer random_board

# Just in case, aggressively make the bossbar visible to all players, in case new players join
bossbar set random:timer players @a

