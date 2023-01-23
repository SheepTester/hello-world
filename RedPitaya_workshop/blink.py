#!/usr/bin/python

import sys
import time
import redpitaya_scpi as scpi

rp_s = scpi.scpi(sys.argv[1])
print("we be a-connecting")

while 1:
    # LED 8 doesn't light
    for led in range(0, 8):
        rp_s.tx_txt(f"DIG:PIN LED{led},1")
        time.sleep(0.2)
    for led in range(0, 8):
        rp_s.tx_txt(f"DIG:PIN LED{led},0")
        time.sleep(0.2)
