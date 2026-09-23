#!/usr/bin/env python3
"""OpenCode provider-config contract — apply / verify (idempotent, fail-closed).

Repo is the Source of Truth. This tool never writes a credential anywhere: the
provider credential is resolved at dispatch time from the process environment
(`OLLAMA_API_KEY`), per the canonical config's declared `"env": [...]`.

Modes
-----
verify   Read the live config and report drift against the canonical file. Writes nothing.
         Exit 0 = contract satisfied, exit 1 = drift/invalid, exit 2 = usage/IO error.
apply    Make the live config equal the canonical file. Idempotent. Backs up the existing
         file once (never overwriting an earlier backup) before writing.
probe    verify, then run a real OpenCode dispatch to prove provider auth works end to end.
         Requires OLLAMA_API_KEY in the environment and a clean PWD.
restore  Restore the newest backup (rollback path).

Never prints, logs or persists a credential value.
"""
from __future__ import annotations

import argparse
import json
import os
import shutil
import subprocess
import sys
import time
from pathlib import Path

CANONICAL = (Path(__file__).resolve().parent
             / "opencode-provider-config.canonical.json")
SECRET_KEYS = {"apikey", "password", "token", "secret", "bearer"}
CREDENTIAL_ENV = "OLLAMA_API_KEY"


def default_target() -> Path:
    """Live OpenCode v2 config path (the .cmd wrapper pins XDG_CONFIG_HOME to cli-v2)."""
    root = os.environ.get("OPENCODE_RUNTIME_ROOT", r"D:\AI-Workspace\runtime\opencode")
    return Path(root) / "cli-v2" / "config" / "opencode" / "opencode.json"


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as fh:
        data = json.load(fh)
    if not isinstance(data, dict):
        raise ValueError(f"{path} is not a JSON object")
    return data


def find_credential_leaks(node, trail="") -> list[str]:
    """Return dotted paths of any key that looks like a stored credential."""
    found: list[str] = []
    if isinstance(node, dict):
        for key, value in node.items():
            here = f"{trail}.{key}" if trail else str(key)
            if key.lower() in SECRET_KEYS:
                found.append(here)
            found.extend(find_credential_leaks(value, here))
    elif isinstance(node, list):
        for idx, value in enumerate(node):
            found.extend(find_credential_leaks(value, f"{trail}[{idx}]"))
    return found


def diff(actual, expected, trail="") -> list[str]:
    """Structural diff. Lists of dicts are compared order-insensitively."""
    out: list[str] = []
    if isinstance(expected, dict):
        if not isinstance(actual, dict):
            return [f"{trail or '<root>'}: expected object, got {type(actual).__name__}"]
        for key, value in expected.items():
            here = f"{trail}.{key}" if trail else str(key)
            if key not in actual:
                out.append(f"{here}: missing")
            else:
                out.extend(diff(actual[key], value, here))
        for key in actual:
            if key not in expected:
                here = f"{trail}.{key}" if trail else str(key)
                out.append(f"{here}: unexpected key present")
    elif isinstance(expected, list):
        if not isinstance(actual, list):
            return [f"{trail or '<root>'}: expected list, got {type(actual).__name__}"]
        if len(actual) != len(expected):
            out.append(f"{trail or '<root>'}: length {len(actual)} != {len(expected)}")
        elif expected and all(isinstance(i, dict) for i in expected):
            remaining = list(actual)
            for want in expected:
                match = next((i for i in remaining if diff(i, want, "") == []), None)
                if match is None:
                    out.append(f"{trail or '<root>'}: no entry matching {json.dumps(want, sort_keys=True)}")
                else:
                    remaining.remove(match)
        else:
            for idx, want in enumerate(expected):
                out.extend(diff(actual[idx], want, f"{trail}[{idx}]"))
    else:
        if actual != expected:
            out.append(f"{trail or '<root>'}: {actual!r} != {expected!r}")
    return out


def cmd_verify(args) -> int:
    target = Path(args.target)
    if not CANONICAL.is_file():
        print(f"FAIL canonical file missing: {CANONICAL}")
        return 2
    canonical = load_json(CANONICAL)

    leaks = find_credential_leaks(canonical)
    if leaks:
        print(f"FAIL canonical file stores a credential-like field: {', '.join(leaks)}")
        return 1

    if not target.is_file():
        print(f"FAIL target config missing: {target}")
        return 1

    try:
        live = load_json(target)
    except (OSError, ValueError) as exc:
        print(f"FAIL target config unreadable/invalid: {exc}")
        return 1

    live_leaks = find_credential_leaks(live)
    if live_leaks:
        print(f"FAIL live config stores a credential-like field: {', '.join(live_leaks)}")
        return 1

    problems = diff(live, canonical)
    if problems:
        print("FAIL OPENCODE_PROVIDER_CONFIG_DRIFT")
        for item in problems:
            print(f"  - {item}")
        return 1

    print("PASS OPENCODE_PROVIDER_CONFIG_IN_SYNC")
    print(f"  canonical: {CANONICAL}")
    print(f"  target   : {target}")
    print(f"  credential source: env {CREDENTIAL_ENV} "
          f"(present={bool(os.environ.get(CREDENTIAL_ENV))})")
    return 0


def cmd_apply(args) -> int:
    target = Path(args.target)
    canonical = load_json(CANONICAL)

    leaks = find_credential_leaks(canonical)
    if leaks:
        print(f"FAIL refusing to apply: canonical file stores {', '.join(leaks)}")
        return 1

    target.parent.mkdir(parents=True, exist_ok=True)

    if target.is_file():
        try:
            if load_json(target) == canonical:
                print("ALREADY_IN_SYNC (no write)")
                return 0
        except (OSError, ValueError):
            pass
        backup = target.with_name(target.name + ".bak-opencode-contract")
        if backup.exists():
            print(f"NOTE existing backup kept untouched: {backup}")
        else:
            shutil.copy2(target, backup)
            print(f"backup written: {backup}")

    with target.open("w", encoding="utf-8", newline="\n") as fh:
        json.dump(canonical, fh, indent=2)
        fh.write("\n")

    written = load_json(target)
    if written != canonical:
        print("FAIL read-back mismatch after write")
        return 1
    print(f"PASS APPLIED canonical config -> {target}")
    return 0


def cmd_restore(args) -> int:
    target = Path(args.target)
    backup = target.with_name(target.name + ".bak-opencode-contract")
    if not backup.is_file():
        print(f"FAIL no backup to restore: {backup}")
        return 2
    shutil.copy2(backup, target)
    print(f"RESTORED {backup} -> {target}")
    return 0


def cmd_probe(args) -> int:
    rc = cmd_verify(args)
    if rc != 0:
        print("probe aborted: config not in sync")
        return rc
    if not os.environ.get(CREDENTIAL_ENV):
        print(f"FAIL {CREDENTIAL_ENV} not present in the dispatch environment")
        return 1
    if os.environ.get("PWD", "").startswith("/"):
        print("FAIL PWD is an MSYS path; OpenCode v2 will fail its chdir. Clear PWD first.")
        return 1

    exe = args.opencode
    workspace = Path(args.workspace)
    argv = [exe, "run", "--model", args.model, "--format", "json",
            "Reply with exactly READY and nothing else. Do not use tools or modify files."]
    started = time.time()
    completed = subprocess.run(argv, cwd=str(workspace), capture_output=True, text=True,
                              encoding="utf-8", errors="replace", shell=False, timeout=300)
    print(f"dispatch returncode={completed.returncode} elapsed={time.time() - started:.1f}s")
    said = ""
    for line in (completed.stdout or "").splitlines():
        try:
            event = json.loads(line)
        except json.JSONDecodeError:
            continue
        part = event.get("part") if isinstance(event, dict) else None
        if event.get("type") == "text" and isinstance(part, dict):
            said = str(part.get("text", "")).strip()
    print(f"agent said: {said[:120]!r}")
    if completed.returncode != 0 or said != "READY":
        print("FAIL OPENCODE_DISPATCH_PROBE")
        if completed.stderr and completed.stderr.strip():
            print(f"  stderr: {completed.stderr.strip()[-300:]}")
        return 1
    print("PASS OPENCODE_DISPATCH_PROBE")
    return 0


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description=__doc__,
                                     formatter_class=argparse.RawDescriptionHelpFormatter)
    parser.add_argument("mode", choices=["verify", "apply", "probe", "restore"])
    parser.add_argument("--target", default=str(default_target()))
    parser.add_argument("--opencode", default=r"D:\AI-Workspace\runtime\opencode\bin\opencode.cmd")
    parser.add_argument("--model", default="ollama/deepseek-v4.1-flash:cloud")
    parser.add_argument("--workspace", default=str(Path(__file__).resolve().parents[4]))
    args = parser.parse_args(argv)
    try:
        return {"verify": cmd_verify, "apply": cmd_apply,
                "probe": cmd_probe, "restore": cmd_restore}[args.mode](args)
    except OSError as exc:
        print(f"FAIL io error: {exc}")
        return 2


if __name__ == "__main__":
    sys.exit(main())
