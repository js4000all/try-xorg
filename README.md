# Xorgを試す


## Node.js, Playwright, Chromiumをインストール

```bash
sudo apt update
sudo apt install -y nodejs npm
node --version
npm --version

mkdir -p ~/signage-test
cd ~/signage-test
npm init -y
npm install playwright

npx playwright install --with-deps chromium
```

単純にChromiumを実行してみる。

```bash
node exam/00_launch.js
```

スクショを取ってみる。
```bash
node exam/01_screenshot.js
ls -lh example.png
```
