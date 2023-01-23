import numpy as np
import math
import time
from matplotlib import pyplot as plt

import redpitaya_scpi as scpi

IP = "169.254.98.119"
rp_s = scpi.scpi(IP)
