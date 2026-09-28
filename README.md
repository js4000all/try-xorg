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

kioskオプション付きでも表示してみる。
```bash
# exam内で
DISPLAY=:0 node 03_kiosk.js
```
これは上手く行かない。キオスクモードにならない。

`app=`で表示してみる。
```bash
# exam内で
DISPLAY=:0 node 04_app.js
```
これは期待通りになった。

* `--kiosk`はchromiumに渡っているが、キオスクモードにならなかった
* `--app=URL + --window-position + --window-size`なら、WMなしでも期待どおりの表示になった

## 外部モニタを使ってみる

```bash
$ DISPLAY=:0 xrandr
LVDS-1 connected primary 1280x800+0+0 (normal left inverted right x axis y axis) 0mm x 0mm
   1280x800      59.91*+
   ...
VGA-1 connected
   1024x600      59.98 +
   1920x1080     60.00
   ...
```

外部モニタだけを有効化する。
```bash
DISPLAY=:0 xrandr \
  --output LVDS-1 --off \
  --output VGA-1 --mode 1024x600 --primary
```
```bash
$ DISPLAY=:0 xrandr
Screen 0: minimum 320 x 200, current 1024 x 600, maximum 8192 x 8192
LVDS-1 connected (normal left inverted right x axis y axis)
  1280x800      59.91 +  59.81
  ...
VGA-1 connected primary 1024x600+0+0 (normal left inverted right x axis y axis) 510mm x 290mm
  1024x600      59.98*+
  ...
```

`xrandr`の"connected primary"の部分を拾って、動的にwindow sizeを設定するバージョン。
```bash
# exam内で
DISPLAY=:0 node 05_flexible_window.js
```
メインモニターを切り替えて、追従するか試す。
```bash
DISPLAY=:0 xrandr   --output LVDS-1 --mode 1280x800  --primary   --output VGA-1 --mode 1024x600
```
