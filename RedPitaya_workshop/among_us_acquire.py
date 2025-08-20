import redpitaya_scpi as scpi
import numpy as np
import time
from matplotlib import pyplot as plt

IP = "192.168.111.175"
rp_s = scpi.scpi(IP)  # Establishing socket communication with Red Pitaya

import math

N = 16384
waveform_ch_10 = []
for n in range(0, N):
    x = n / float(N) * 2 * math.pi
    y = 0.0
    t = x
    if 0 <= t < 0.317:
        y = 3 * x
    elif 0.317 <= t < 0.633:
        y = -3 * (x - 0.3) + 1
    elif 0.8 <= t < 0.9:
        y = 10 * (x - 0.8)
    elif 0.9 <= t < 1.15:
        y = -2 * (x - 0.9) + 1
    elif 1.15 <= t < 1.4:
        y = 2 * (x - 1.4) + 1
    elif 1.4 <= t < 1.5:
        y = -10 * (x - 1.4) + 1
    elif 1.6 <= t < 2.2:
        y = 0.5 * math.sqrt(1 - (1 / 0.3 * (x - 1.9)) ** 2) + 0.5
    elif 2.3 <= t < 2.324:
        y = 40 * (x - 2.3)
    elif 2.324 <= t < 2.951:
        y = -1.5 * (x - 2.3) + 1
    elif 2.951 <= t < 2.975:
        y = 40 * (x - 2.95)
    elif 3.1 <= t < 3.524:
        y = 0.5 * math.sqrt(1 - (1 / 0.3 * (x - 3.4)) ** 2) + 0.5
    elif 3.627 <= t < 3.7:
        y = 0.5
    elif 4.2 <= t < 4.8:
        y = (1 / 0.3 * (x - 4.5)) ** 4
    elif 5 <= t < 5.4:
        y = -0.3 * math.sqrt(1 - (1 / 0.2 * (x - 5.2)) ** 2) + 0.3
    elif 5.4 <= t < 5.8:
        y = 0.3 * math.sqrt(1 - (1 / 0.2 * (x - 5.6)) ** 2) + 0.7
    elif 5.8 <= t < 5.88:
        y = 0.7
    waveform_ch_10.append(f"{y:.5f}")
waveform = ", ".join(map(str, waveform_ch_10))

rp_s.tx_txt("GEN:RST")

rp_s.tx_txt("ACQ:RST")


rp_s.tx_txt("SOUR1:FUNC ARBITRARY")  # Reset generator
rp_s.tx_txt("SOUR1:TRAC:DATA:DATA " + waveform)  # Sending custom signal data
rp_s.tx_txt("SOUR1:TRIG:SOUR INT")  # Trigger Source internal
rp_s.tx_txt("OUTPUT1:STATE ON")  # Output 1 turned ON
rp_s.tx_txt("SOUR1:TRIG:INT")


rp_s.tx_txt("ACQ:DATA:FORMAT ASCII")
rp_s.tx_txt("ACQ:DATA:UNITS VOLTS")

# rp_s.tx_txt(f"ACQ:DEC {dec}")  # decimation
# rp_s.tx_txt(f"ACQ:TRIG:DLY {trig_delay}")  # trigger delay in samples

n = 4  # how many times the acquisition process takes place
buff = np.zeros((n, 16384))  # space for the acquired data

for i in range(0, n):

    rp_s.tx_txt(f"ACQ:TRIG:LEV 0.5")
    rp_s.tx_txt("ACQ:START")  # Start the acquisition
    time.sleep(0.5)  # Wait a bit for the buffer to fill
    rp_s.tx_txt("ACQ:TRIG CH1_PE")
    rp_s.tx_txt(
        "SOUR1:TRIG:INT"
    )  # Trigger the burst signal  (needs to be here because we are dealing with burst signals)

    while 1:  # Wait until the triggering moment
        rp_s.tx_txt("ACQ:TRIG:STAT?")  # Did the trigger happen? TD == triggered
        wow = rp_s.rx_txt()
        print(f"Received trigger: {wow}")
        if wow == "TD":
            break

    rp_s.tx_txt("ACQ:SOUR1:DATA?")  # Get the acquired data from Red Pitaya
    buff_string = rp_s.rx_txt()  # Save the data
    buff_string = buff_string.strip("{}\n\r").replace("  ", "").split(",")
    # change the data into the appropriate form for plotting (from string to float)
    buff[i, :] = list(map(float, buff_string))
    # save the data into the prepared space
    print(i)  # index of loop iteration

######## PLOTTING THE DATA #########
fig, axs = plt.subplots(n, sharex=True)  # plot the data (n subplots)
fig.suptitle("Measurements")

for i in range(0, n, 1):  # plotting the acquired buffers
    axs[i].plot(buff[i])

plt.show()

rp_s.close()  # Close socket communication
