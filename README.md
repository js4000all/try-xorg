# Xorgを試す


## Node.js, Playwright, Chromiumを試す

```bash
sudo apt update
sudo apt install -y nodejs npm
node --version
npm --version

cd ~/exam
npm init -y
npm install playwright

npx playwright install --with-deps chromium
```

単純にChromiumを実行してみる。

```bash
# exam内で
node 00_launch.js
```

スクショを取ってみる。
```bash
# exam内で
node 01_screenshot.js
ls -lh example.png
```

## Xorgを試す

```bash
sudo apt update
sudo apt install -y xserver-xorg xinit x11-xserver-utils
```

`.inittrc`を作る。

```bash
cat > ~/.xinitrc <<'EOF'
#!/bin/sh

xset s off
xset -dpms
xset s noblank

exec sleep infinity
EOF

chmod +x ~/.xinitrc
```

コンソールで、
```bash
startx
```

真っ黒な画面が出る。

sshなどで、Xセッションが存在しているのを確認。
```bash
$ ps aux | grep Xorg
user        16294  1.1  2.3 545028 92488 tty1     Sl   22:26   0:00 /usr/lib/xorg/Xorg -nolisten tcp :0 vt1 -keeptty -auth /tmp/serverauth.Rb7zplTzgV
user        16395  0.0  0.0   6520  2348 pts/4    S+   22:27   0:00 grep Xorg
```

X displayをターゲットに、playwrightでchromiumを起動する。
```bash
# exam内で
DISPLAY=:0 node 02_headed.js
```
