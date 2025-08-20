import subprocess

# process = subprocess.run(["ssh", "root@rp-f0ada4.local"])

from subprocess import Popen, PIPE, STDOUT

p = Popen(["ssh", "root@rp-f0ada4.local"], stdout=PIPE, stdin=PIPE, stderr=PIPE)
stdout_data = p.communicate(input="root\n".encode())[0]
