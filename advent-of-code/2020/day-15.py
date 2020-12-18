import time;

input = [0,12,6,13,20,1,17];
# input = [0,3,6];

dick = {};
turn = 1;
for n in input:
    last_num = n;
    dick[last_num] = turn;
    turn += 1;

start_time = time.time();

for turd in range(turn, 30000000 + 1):
    t = dick.get(last_num);
    dick[last_num] = turd - 1;
    if t and t != turd - 1:
        last_num = turd - 1 - t;
    else:
        last_num = 0;

print("--- %s seconds ---" % (time.time() - start_time));

print(last_num);
