#!/usr/bin/env bash
#
# One-shot setup: clone this repo, run ./setup.sh, and you're ready to flash.
#
# Follows the official guide (https://docs.qmk.fm/newbs_getting_started):
#   1. Installs the qmk CLI + toolchains via the official installer if missing
#   2. Clones ZSA's QMK fork (zsa/qmk_firmware, branch firmware25) via `qmk setup`,
#      which also inits submodules and points the qmk CLI at the checkout
#   3. Installs this repo's node dependencies
#   4. Creates config.js from the template, wired to the QMK checkout path
#   5. Test-compiles the Voyager default keymap to prove the build env works
#
# If config.js already exists and its qmkPath holds a QMK checkout, that
# checkout is reused and the prompt + clone are skipped. Otherwise it asks
# where to put the QMK clone (default: ~/voyager-keyboard/qmk).
# Non-interactive override:  QMK_HOME=/some/path ./setup.sh
set -euo pipefail

QMK_FORK="zsa/qmk_firmware"
QMK_BRANCH="firmware25"
QMK_DEFAULT="$HOME/voyager-keyboard/qmk"

DIR="$(cd "$(dirname "$0")" && pwd)"

step() { printf '\n\033[1;34m==> %s\033[0m\n' "$*"; }

# --- Where should QMK live? --------------------------------------------------
# An existing config.js wins: if its qmkPath already holds a QMK checkout,
# reuse it and skip the prompt + clone.
QMK_EXISTING=""
if [[ -f "$DIR/config.js" ]] && command -v node >/dev/null 2>&1; then
  QMK_EXISTING="$(node -p "require('$DIR/config.js').qmkPath" 2>/dev/null || true)"
fi
if [[ -n "$QMK_EXISTING" && -d "$QMK_EXISTING/quantum" && -d "$QMK_EXISTING/keyboards/zsa/voyager" ]]; then
  QMK_HOME="$QMK_EXISTING"
  QMK_REUSE=1
elif [[ -z "${QMK_HOME:-}" ]]; then
  if [[ -t 0 ]]; then
    read -r -p "Where should QMK firmware be cloned? [$QMK_DEFAULT] " QMK_HOME
  fi
  QMK_HOME="${QMK_HOME:-$QMK_DEFAULT}"
fi
QMK_HOME="${QMK_HOME/#\~/$HOME}"   # expand a typed leading ~

# --- 1. qmk CLI -------------------------------------------------------------
if ! command -v qmk >/dev/null 2>&1; then
  step "Installing the qmk CLI + toolchains (official installer)"
  # Official method from https://docs.qmk.fm/newbs_getting_started —
  # installs the CLI, compiler toolchains, and (on Linux) udev rules.
  curl -fsSL https://install.qmk.fm | sh
  # The installer puts qmk in ~/.local/bin, which may not be on PATH yet.
  export PATH="$HOME/.local/bin:$PATH"
  command -v qmk >/dev/null 2>&1 || {
    echo "qmk was installed but is not on your PATH." >&2
    echo "Open a new terminal (or add ~/.local/bin to PATH) and re-run this script." >&2
    exit 1
  }
else
  step "qmk CLI already installed ($(command -v qmk))"
fi

# --- 2. QMK firmware checkout (ZSA fork) ------------------------------------
if [[ -n "${QMK_REUSE:-}" ]]; then
  step "Reusing QMK checkout from config.js: $QMK_HOME (skipping clone)"
  qmk config user.qmk_home="$QMK_HOME" >/dev/null
else
  step "Setting up $QMK_FORK ($QMK_BRANCH) in $QMK_HOME"
  # `qmk setup` clones if missing, checks out the branch, updates submodules,
  # and sets user.qmk_home. Safe to re-run on an existing checkout.
  qmk setup -y -H "$QMK_HOME" -b "$QMK_BRANCH" "$QMK_FORK"
fi

# --- 3. Node dependencies ----------------------------------------------------
step "Installing node dependencies"
if ! command -v npm >/dev/null 2>&1; then
  echo "node/npm is required (https://nodejs.org) — install it and re-run." >&2
  exit 1
fi
(cd "$DIR" && npm install)

# --- 4. config.js -------------------------------------------------------------
if [[ -n "${QMK_REUSE:-}" ]]; then
  step "config.js already exists and points at the QMK checkout — leaving it untouched"
elif [[ -f "$DIR/config.js" ]]; then
  step "config.js already exists — leaving it untouched"
  echo "    Make sure its qmkPath points at: $QMK_HOME"
else
  step "Creating config.js from template"
  sed "s|^const qmkPath = .*|const qmkPath = '$QMK_HOME';|" \
    "$DIR/config.template.js" > "$DIR/config.js"
fi

# --- 5. Test the build environment -------------------------------------------
step "Test-compiling the Voyager default keymap (proves the toolchain works, ~1 min)"
mkdir -p "$DIR/tmp"
COMPILE_LOG="$DIR/tmp/setup-compile.log"
if qmk compile -kb zsa/voyager -km default > "$COMPILE_LOG" 2>&1; then
  echo "    Build OK"
else
  echo "    Build FAILED — last 30 lines of $COMPILE_LOG:" >&2
  tail -30 "$COMPILE_LOG" >&2
  exit 1
fi

step "Done!"
cat <<EOF

Next steps:
  1. Edit config.js — set keymapName and firmwarePattern to match YOUR
     Oryx layout's export name (the defaults are the author's).
  2. Design your layout at https://configure.zsa.io and download the
     "QMK source" zip to ~/Downloads.
  3. Run:  node updateKeyboard.js   (or ./flashKeyboard.sh)

Tip: run 'qmk doctor' if a build fails — it checks the toolchain setup.
EOF
