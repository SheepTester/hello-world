#!/usr/bin/python

import sys
import time
import redpitaya_scpi as scpi

rp_s = scpi.scpi(sys.argv[1])
print("we be a-connecting")

while 1:
    for led in range(0, 3):
        on = ["MMC", "HB", "ETH"][led]
        rp_s.tx_txt(f"LED:{on} ON")
        off = ["ETH", "MMC", "HB"][led]
        rp_s.tx_txt(f"LED:{off} OFF")
        time.sleep(0.5)
