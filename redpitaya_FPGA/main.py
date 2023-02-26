import sys
import paramiko
from paramiko.client import SSHClient

if len(sys.argv) != 2:
    print(f"Usage: python {sys.argv[0]} <Red Pitaya IP>")
    exit()


def send(command: str) -> str:
    client = SSHClient()
    client.load_system_host_keys()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(sys.argv[1], username="root", password="root")
    print(command)
    _, stdout, _ = client.exec_command(command)
    value = stdout.read().decode()
    client.close()
    return value


send("cat red_pitaya_top.bit > /dev/xdevcfg")

# stdin, stdout, stderr = client.exec_command(
#     "echo 127.0.0.1 localhost $(hostname) >> /etc/hosts"
# )
# print(stdout.read().decode())
# print(stdout.channel.recv_exit_status())
# stdin.close()


class Addresses:
    BASE = 0x40300000
    ID = BASE + 0x50
    MORSE_UNIT_PERIOD = BASE + 0x54
    PULSE_PERIOD = BASE + 0x58
    PATTERN_LENGTH = BASE + 0x5C
    PATTERN_START = BASE + 0x60
    PATTERN_END = BASE + 0x80
    SAMPLE_PERIOD = BASE + 0x80
    THRESHOLD = BASE + 0x84
    SHOW_OUTPUT = BASE + 0x88
    SAMPLING_CURSOR = BASE + 0x8C
    SAMPLE_START = BASE + 0x90
    SAMPLE_END = BASE + 0xA0

    def write(address: int, value: int) -> None:
        # print(f"/opt/redpitaya/bin/monitor {hex(address)} {value}")
        # stdin, _, _ = client.exec_command(
        #     f"/opt/redpitaya/bin/monitor {hex(address)} {value}"
        # )
        # stdin.write("root\n")
        # stdin.close()
        send(f"/opt/redpitaya/bin/monitor {hex(address)} {value}")

    def read(address: int) -> int:
        # print(f"/opt/redpitaya/bin/monitor {hex(address)}")
        # exit()
        # stdin, stdout, _ = client.exec_command(
        #     f"/opt/redpitaya/bin/monitor {hex(address)}"
        # )
        value = send(f"/opt/redpitaya/bin/monitor {hex(address)}").strip()
        # stdin.write("root\n")
        # # stdin.flush()
        # # stdin.close()
        # print(stdout.channel.recv_exit_status())
        # value = stdout.read().decode().strip()
        # print(value)
        # print(stderr.read().decode())
        return int(value, 0)


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
        (" ".join(morse.get(c) or "/" for c in string.upper()) + " ")
        .replace(".", "10")
        .replace("-", "1110")
        .replace(" ", "00")
        .replace("/", "00")
    )[::-1]
    Addresses.write(Addresses.PATTERN_LENGTH, len(binary))
    binary = binary.rjust(256, "0")
    print(binary)
    for i in range(0, 8):
        print(binary[-i * 32 - 32 : -i * 32 or len(binary)])
        Addresses.write(
            Addresses.PATTERN_START + i * 4,
            int(binary[-i * 32 - 32 : -i * 32 or len(binary)], 2),
        )


set_pattern("sus ")

# print(Addresses.read(Addresses.PATTERN_LENGTH))
# Addresses.write(Addresses.SHOW_OUTPUT, 0)
