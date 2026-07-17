# Android AI Coding Harness: 0 to Hero Guide

How to set up a professional-grade AI coding environment on Android using Termux, OpenCode, and React.

## Phase 1: The Foundation (Environment)

### 1. Install the Right Version of Termux

**The Trap:** Never use the Google Play Store version; it is deprecated and its repositories are broken.

**The Fix:** Install Termux from [F-Droid](https://f-droid.org/en/packages/com.termux/). If you have the Play Store version, uninstall it (and any plugins) first.

### 2. Configure Mirrors and Storage

Open Termux and run:

```bash
# Set up storage access to your phone's memory
termux-setup-storage

# Switch to a stable mirror (e.g., Grimler or Albatross)
termux-change-repo
# Select 'Main Repository' -> OK -> Choose 'Mirrors by Grimler' -> OK

# Update the system
pkg update -y && pkg upgrade -y
```

### 3. Install Essential Dev Tools

```bash
pkg install -y git nodejs python binutils which curl
```

---

## Phase 2: The Compatibility Layer (GLIBC)

Because Android uses Bionic and OpenCode/Bun expect Glibc, you must install a translation layer.

### 1. Install GLIBC and Patching Tools

```bash
pkg install -y glibc-repo patchelf
pkg update -y
pkg install -y glibc-runner
```

### 2. Install OpenCode

```bash
curl -fsSL https://opencode.ai | bash
```

### 3. Fix the Binary Linker

Tell the OpenCode binary to look for the Termux glibc path instead of a standard Linux path:

```bash
patchelf --set-interpreter $PREFIX/glibc/lib/ld-linux-aarch64.so.1 ~/.opencode/bin/opencode
```

### 4. Create the "Launch Command"

Android's LD_PRELOAD hooks clash with glibc. You must clear them when launching. Add this to your `.bashrc`:

```bash
echo "alias opencode='unset LD_PRELOAD && grun ~/.opencode/bin/opencode'" >> ~/.bashrc
source ~/.bashrc
```

---

## Phase 3: The Developer Workflow (JS/React)

### 1. Native Storage is Key

- **The Problem:** Running `npm install` in `/sdcard/Download` will fail because Android's shared storage doesn't support Linux symlinks.
- **The Rule:** Keep your projects in the Home directory (`~/`).
- **Accessing Files:** Use a file manager like [Material Files](https://f-droid.org/en/packages/com.github.materialfiles/) to browse the Termux private directory.

### 2. Fixing the Esbuild/Vite Permission Bug

Android blocks executing binaries within `node_modules`.

```bash
# 1. Install esbuild at the system level
pkg install -y esbuild

# 2. Whitelist esbuild scripts in your project folder
echo "allow-scripts[] = esbuild" > .npmrc

# 3. Install, pointing to the system binary
npm install --esbuild-binary=$(which esbuild)
```

### 3. Launching the App

If `npm run dev` fails with "vite not found," call the binary directly:

```bash
./node_modules/.bin/vite
```

Your app is now live at `http://localhost:5173`. Open it in your mobile Chrome browser.

---

## Phase 4: UI & Ergonomics

### 1. Fix the "OnePlus Font Glitch"

OnePlus devices often stretch standard monospace fonts. Force a high-quality coding font:

```bash
mkdir -p ~/.termux && curl -L https://github.com -o ~/.termux/font.ttf && termux-reload-settings
```

### 2. Recommended Editor

Since you are in a terminal, Micro is the most intuitive editor (supports Ctrl+C/V and mouse):

```bash
pkg install -y micro
```

---

## Summary Checklist for a New Project

1. **Initialize:** `cd ~ && mkdir my-project && cd my-project`
2. **Code with AI:** `opencode` (Use `/init` and `/connect`)
3. **Setup NPM:** Create `.npmrc` and `pkg install esbuild`
4. **Install:** `npm install --esbuild-binary=$(which esbuild)`
5. **Run:** `./node_modules/.bin/vite`
6. **View:** Open `localhost` in Chrome

You are now a mobile-native AI Developer.
