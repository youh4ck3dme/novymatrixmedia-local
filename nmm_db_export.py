import os
import sys
import paramiko

host = "shell.r6.websupport.sk"
port = 27217
user = "uid6237660"
password = os.environ.get("NMM_SSH_PASS", "")

db_host = "db.r6.websupport.sk"
db_name = "ytk8fobx"
db_user = "5v7cIEBJ"
db_pass = "Ta8xphxa$g"

dump_remote = "/tmp/nmm_dump.sql"
dump_local = r"c:\Users\42195\Desktop\work-2projects\novymatrixmedia-local\novymatrixmedia-local\nmm_dump.sql"

print("[EXPLORE] Connecting SSH to find web root...")
client = paramiko.SSHClient()
client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
client.connect(host, port=port, username=user, password=password, timeout=30)
print("      Connected OK")

print("[2/4] Running mysqldump on server...")
# Single quotes around password to prevent bash variable expansion ($g etc.)
cmd = f"mariadb-dump -h {db_host} -P 3306 -u {db_user} -p'{db_pass}' {db_name} --single-transaction --routines --triggers > {dump_remote} ; echo DUMP_OK"
stdin, stdout, stderr = client.exec_command(cmd, timeout=120)
out = stdout.read().decode().strip()
err = stderr.read().decode().strip()
print(f"      stdout: {out}")
if err:
    print(f"      stderr: {err}")
if "DUMP_OK" not in out:
    print("ERROR: dump failed")
    client.close()
    sys.exit(1)

print("[3/4] Downloading dump via SFTP...")
sftp = client.open_sftp()
# Check remote file size
stat = sftp.stat(dump_remote)
print(f"      Remote file size: {stat.st_size} bytes")
sftp.get(dump_remote, dump_local)
sftp.close()
print(f"      Saved to: {dump_local}")

print("[4/4] Cleanup remote tmp...")
client.exec_command(f"rm -f {dump_remote}")
client.close()
print("Done! DB dump ready for local import.")
