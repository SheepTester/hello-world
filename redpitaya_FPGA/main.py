import sys
import paramiko
from paramiko.client import SSHClient

if len(sys.argv) != 2:
    print(f"Usage: python {sys.argv[0]} <Red Pitaya IP>")
    exit()

client = SSHClient()
client.load_system_host_keys()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(sys.argv[1], username="root", password="root")
stdin, stdout, stderr = client.exec_command("cat red_pitaya_top.bit > /dev/xdevcfg")
# print(stdout.channel.recv_exit_status())
# stdin.close()


class Addresses:
    BASE = 0x40300000
    ID = 0x50
    MORSE_UNIT_PERIOD = 0x54
    PULSE_PERIOD = 0x58
    PATTERN_LENGTH = 0x5C
    PATTERN_START = 0x60
    PATTERN_END = 0x80
    SAMPLE_PERIOD = 0x80
    THRESHOLD = 0x84
    SHOW_OUTPUT = 0x88
    SAMPLING_CURSOR = 0x8C
    SAMPLE_START = 0x90
    SAMPLE_END = 0xA0

    def write(address: int, value: int) -> None:
        stdin, _, _ = client.exec_command(f"~/monitor {address} {value}")
        # stdin.close()

    def read(address: int) -> int:
        print(f"~/monitor {address}")
        # exit()
        stdin, stdout, _ = client.exec_command(f"sudo ~/monitor {address}")
        stdin.write("root\n")
        # stdin.close()
        print(stdout.channel.recv_exit_status())
        value = stdout.read().decode().strip()
        print(value)
        print(stderr.read().decode())
        return int(value)


morse = {
    "0": "-----",
    "1": ".----",
    "2": "..---",
    "3": "...--",
    "4": "....-",
    "5": ".....",
    "6": "-....",
    "7": "--...",
    "8": "---..",
    "9": "----.",
    "A": ".-",
    "B": "-...",
    "C": "-.-.",
    "D": "-..",
    "E": ".",
    "F": "..-.",
    "G": "--.",
    "H": "....",
    "I": "..",
    "J": ".---",
    "K": "-.-",
    "L": ".-..",
    "M": "--",
    "N": "-.",
    "O": "---",
    "P": ".--.",
    "Q": "--.-",
    "R": ".-.",
    "S": "...",
    "T": "-",
    "U": "..-",
    "V": "...-",
    "W": ".--",
    "X": "-..-",
    "Y": "-.--",
    "Z": "--..",
    ".": ".-.-.-",
    ",": "--..--",
    "?": "..--..",
    "/": "-..-.",
    "@": ".--.-.",
    "'": ".----.",
    "!": "-.-.--",
    "(": "-.--.",
    ")": "-.--.-",
    "&": ".-...",
    ":": "---...",
    ";": "-.-.-.",
    "=": "-...-",
    "+": ".-.-.",
    "-": "-....-",
    "_": "..--.-",
    '"': ".-..-.",
    "$": "...-..",
}


def set_pattern(string: str) -> None:
    binary = (
        " ".join(morse.get(c) or "/" for c in string.upper())
        .replace(".", "10")
        .replace("-", "1110")
        .replace(" ", "00")
        .replace("/", "00")
    )


print(Addresses.read(Addresses.PATTERN_LENGTH))
Addresses.write(Addresses.SHOW_OUTPUT, 0)
