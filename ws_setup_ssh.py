"""WebSupport SSH key setup script.

Preferred flow:
  1. Upload ~/.ssh/websupport_r6.pub via direct SSH using a fresh WebSupport password.
  2. Verify key-based auth.
  3. Print the remote path for SSH_REMOTE_PATH.
"""

from __future__ import annotations

import os
from pathlib import Path


SSH_HOST = os.getenv("SSH_HOST", "shell.r6.websupport.sk")
SSH_PORT = int(os.getenv("SSH_PORT", "29753"))
SSH_USER = os.getenv("SSH_USER", "uid6237660")
SSH_PASS = os.getenv("SSH_PASS", "6ba1b88908")

PUBKEY_PATH = Path.home() / ".ssh" / "websupport_r6.pub"
PRIVKEY_PATH = Path.home() / ".ssh" / "websupport_r6"


def fail(message: str, code: int = 1) -> None:
    print(f"ERROR: {message}")
    raise SystemExit(code)


def require_paramiko():
    try:
        import paramiko
    except ImportError:
        fail("Missing dependency: paramiko. Install it with: pip install paramiko", 10)
    return paramiko


def read_pubkey() -> str:
    if not PUBKEY_PATH.exists():
        fail(f"Public key not found: {PUBKEY_PATH}", 11)
    return PUBKEY_PATH.read_text(encoding="utf-8").strip()


def upload_key_via_ssh(pubkey_text: str) -> str:
    paramiko = require_paramiko()

    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    print("=== Direct SSH upload ===")
    print(f"Connecting to {SSH_USER}@{SSH_HOST}:{SSH_PORT}")

    try:
        client.connect(
            SSH_HOST,
            port=SSH_PORT,
            username=SSH_USER,
            password=SSH_PASS,
            timeout=20,
        )
    except paramiko.AuthenticationException:
        fail(
            "Password authentication failed. Generate a fresh WebSupport SSH password and try again.",
            2,
        )
    except Exception as exc:
        fail(f"SSH connection failed: {exc}", 3)

    commands = [
        "mkdir -p ~/.ssh && chmod 700 ~/.ssh",
        f'printf "%s\\n" "{pubkey_text}" >> ~/.ssh/authorized_keys',
        "sort -u ~/.ssh/authorized_keys -o ~/.ssh/authorized_keys",
        "chmod 600 ~/.ssh/authorized_keys",
    ]

    for command in commands:
        _, stdout, stderr = client.exec_command(command)
        stdout.read()
        err = stderr.read().decode("utf-8", errors="replace").strip()
        if err:
            print(f"WARN: {err}")

    _, stdout, stderr = client.exec_command("pwd")
    remote_path = stdout.read().decode("utf-8", errors="replace").strip()
    err = stderr.read().decode("utf-8", errors="replace").strip()
    client.close()

    if err:
        fail(f"Could not read remote path: {err}", 4)
    if not remote_path:
        fail("Remote path was empty after SSH login.", 5)

    print("Key uploaded successfully via password-authenticated SSH.")
    print(f"Remote path: {remote_path}")
    return remote_path


def verify_key_auth() -> None:
    paramiko = require_paramiko()

    if not PRIVKEY_PATH.exists():
        fail(f"Private key not found: {PRIVKEY_PATH}", 12)

    print("\n=== Verifying key-based auth ===")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())

    try:
        pkey = paramiko.Ed25519Key(filename=str(PRIVKEY_PATH))
        client.connect(
            SSH_HOST,
            port=SSH_PORT,
            username=SSH_USER,
            pkey=pkey,
            timeout=20,
        )
        _, stdout, stderr = client.exec_command("pwd")
        remote_path = stdout.read().decode("utf-8", errors="replace").strip()
        err = stderr.read().decode("utf-8", errors="replace").strip()
    except Exception as exc:
        fail(f"Key-based authentication failed: {exc}", 6)
    finally:
        client.close()

    if err:
        fail(f"Remote command failed after key login: {err}", 7)

    print("Key-based auth works.")
    print(f"Verified remote path: {remote_path}")
    print("\nUpdate SSH_REMOTE_PATH in .env.production if needed.")


def main() -> None:
    pubkey_text = read_pubkey()
    remote_path = upload_key_via_ssh(pubkey_text)
    verify_key_auth()

    print("\n=== Summary ===")
    print(f"SSH host: {SSH_HOST}")
    print(f"SSH port: {SSH_PORT}")
    print(f"SSH user: {SSH_USER}")
    print(f"SSH remote path: {remote_path}")


if __name__ == "__main__":
    main()
