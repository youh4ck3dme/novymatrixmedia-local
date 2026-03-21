import os
import secrets
import string
import subprocess

TMP_HASH_SCRIPT = 'nmm_tmp_hashcli.php'

# Generate secure password
chars = string.ascii_letters + string.digits + '!@#%^&*'
new_pass = ''.join(secrets.choice(chars) for _ in range(16))

PHP = r'C:\Users\42195\AppData\Local\Microsoft\WinGet\Packages\PHP.PHP.8.3_Microsoft.Winget.Source_8wekyb3d8bbwe\php.exe'

# Hash via PHP CLI using phpass directly (no wp-load, no warnings)
php_script = f"""<?php
define('ABSPATH', __DIR__ . '/');
require_once 'wp-includes/class-phpass.php';
$h = new PasswordHash(8, true);
echo $h->HashPassword('{new_pass}');
"""
with open(TMP_HASH_SCRIPT, 'w') as f:
    f.write(php_script)

r = subprocess.run([PHP, TMP_HASH_SCRIPT], capture_output=True, text=True,
                   cwd=r'C:\Users\42195\Desktop\work-2projects\novymatrixmedia-local\novymatrixmedia-local')
hashed = r.stdout.strip()
os.remove(TMP_HASH_SCRIPT)
print(f'Hash: {hashed}')

if not hashed.startswith('$P$'):
    print('ERROR: invalid hash:', repr(hashed))
    exit(1)

# Update DB + fix email
sql = f"UPDATE wp_users SET user_pass='{hashed}', user_email='redakcia@novymatrixmedia.sk' WHERE user_login='admin_nmm';"
r2 = subprocess.run(['mysql', '-u', 'root', 'novymatrixmedia'], input=sql,
                    capture_output=True, text=True)
print('DB update code:', r2.returncode)
if r2.stderr:
    print('STDERR:', r2.stderr)

print()
print('=== PRIHLASOVACIE UDAJE ===')
print('URL   : http://localhost:8080/wp-admin')
print('Login : admin_nmm')
print(f'Heslo : {new_pass}')
print('===========================')
