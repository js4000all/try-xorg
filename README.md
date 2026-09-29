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

## コンソールはそのままで外部モニタにchromiumを出力

### ３つのグループ

#### 仮想ターミナル

`tty1`, `tty6`などは Linux の仮想ターミナルの番号。物理キーボードと画面を使うCUIセッションの「席番号」のようなもの。

`vt6`の`vt`は Virtual Terminal の略で、実質的に同じ。Xorgを

#### Xサーバのdisplay識別番号

`:0`はX11のdisplay番号。Xサーバの識別番号。
```bash
Xorg :0 vt6
```
なら、`:0`というX displayは6番の仮想ターミナルを使うという意味。

```bash
DISPLAY=:0 chromium
```
とすると、「X display 0番に接続して、chromiumを表示」という意味。

#### モニター

実際のモニターは別の番号体系で、xrandr の出力。
```text
LVDS-1
VGA-1
HDMI-1
```

まとめると、全体像はこう。
```text
VT / tty（仮想ターミナル）
  ↓
Xorg display（Xサーバのdisplay識別番号）
  ↓
xrandr output（実際のモニター）
```
```text
① Linux VT
   tty1 / vt1
   tty6 / vt6
        │
        │ どの表示環境がGPUを使うか
        ▼
② Xサーバー
   :0
   :1
        │
        │ Xorgが管理する物理出力
        ▼
③ Connector / Output
   LVDS-1
   VGA-1
   HDMI-1
        │
        ▼
   物理モニター
```

### ２つの仮想ターミナルを同時利用できるかの実験

今回は関係性を確認したいので、前回と同じ vt1 上でそのまま startx するのではなく、Xorgを別VTに載せる形で試す。

現状はこう。
```bash
$ systemctl list-units 'getty@tty*.service'
  UNIT               LOAD   ACTIVE SUB     DESCRIPTION
  getty@tty1.service loaded active running Getty on tty1
  getty@tty6.service loaded active running Getty on tty6
```
SSH側から tty6 の getty を止めて、空ける。
```bash
sudo systemctl stop getty@tty6.service
```
この時点で以下のようになる。内蔵パネルには変化無し。
```bash
$ systemctl list-units 'getty@tty*.service'
  UNIT               LOAD   ACTIVE SUB     DESCRIPTION
  getty@tty1.service loaded active running Getty on tty1
```

実験としては、まずroot権限でXorgをVT6に直接起動して、VT6でXが動くかだけ確認。
実機上で、
```bash
sudo Xorg :0 vt6 -nolisten tcp
```
起動した。vt1=CUI, vt6=xorgという状態になった。

```bash
$ DISPLAY=:0 xrandr --output LVDS-1 --off --output VGA-1 --mode 1024x600 --primary
$ DISPLAY=:0 xrandr
Screen 0: minimum 320 x 200, current 1024 x 600, maximum 8192 x 8192
LVDS-1 connected primary (normal left inverted right x axis y axis)
    1280x800      59.91 +  59.81
    ...
VGA-1 connected 1024x600+0+0 (normal left inverted right x axis y axis) 510mm x 290mm
    1024x600      59.98*+
    ...
```
出力先の変更もできた。物理世界では、xorgがVGAにだけ表示され、内蔵パネルがオフな状態になっている。

ここでPCを再起動したところ、上記の手順が再現しなくなった。

## Playwrightを自動起動する

- getty(tty1)に仕込みを入れ、起動時に自動ログインするようにする
- 対象ユーザの`.bash_profile`で`startx`する
- `.xinitrc`を編集し、Xサーバ起動時にPlaywrightラッパーを実行するようにする

```text
電源ON
  ↓
Debian起動
  ↓
tty1へ自動ログイン (getty@tty1.service)
  ↓
.bash_profile
  ↓
startx
  ↓
.xinitrc
  ├─ xset
  ├─ xrandr
  └─ Node / Playwright
        ↓
      Chromium --app=...
```

### Xサーバ起動時にPlaywrightが起動するようにする

まず、`.xinitrc`をサイネージ起動スクリプトに変える。

```bash
cat > ~/.xinitrc <<'EOF'
#!/bin/sh

# 画面ブランキングを無効化
xset s off
xset -dpms
xset s noblank

# 外部モニターを使用する場合
# 現在の試験機では VGA-1。最終的には現場PCに合わせる。
xrandr \
  --output LVDS-1 --off \
  --output VGA-1 --auto --primary

# Playwrightラッパーを起動
cd ~/try-xorg/exam
exec node 05_flexible_window.js
EOF

chmod +x ~/.xinitrc
```
ここでは`DISPLAY=:0`は不要。
`.xinitrc`は`startx`が起動したXセッション内で実行するので、`DISPLAY`はすでに設定されているため。

`exec node`により、シェルがnodeプロセスに置き換わることで、chromiumを閉じるとXサーバも終了する挙動になる。

### 起動時に自動ログインする

次にtty1を自動ログインにする。systemdのgettyにoverrideを作る。
```bash
sudo systemctl edit getty@tty1.service
``

開いたエディタで、以下を入れる。
```ini
[Service]
ExecStart=
ExecStart=-/sbin/agetty --autologin user --noclear %I $TERM
```
`--autologin user`の部分は対象ユーザ名にする。

```bash
sudo systemctl daemon-reload
```

### ログインした時に`startx`を実行する

さらに、ログインしたtty1で自動的に`startx`する。
Bashなら`~/.bash_profile`に以下を追加。
```bash
if [ -f ~/.bashrc ]; then
    . ~/.bashrc
fi

if [ "$(tty)" = "/dev/tty1" ] && [ -z "$DISPLAY" ]; then
    exec startx
fi
```
tty1以外では通常起動にするのがミソ。

## 今後の課題

### SHOULD

- [ ] 外部モニター未接続時の挙動を決める
  - 内蔵パネルへフォールバックする
  - 外部モニターが接続されるまで待機する
  - 一定間隔で再検出する

- [ ] `xrandr` の失敗時処理を追加する
  - 対象出力が存在しない
  - 指定解像度が利用できない
  - 外部モニターが途中で切断された

- [ ] Playwright側のログを整備する
  - 起動
  - Chromium起動
  - ページ遷移
  - 表示切り替え
  - 例外
  - Chromium終了

- [ ] ネットワーク・Webサイト障害時の復旧方法を決める
  - DNS失敗
  - 接続タイムアウト
  - HTTPエラー
  - `page.goto()` 失敗
  - 回復不能時はプロセスを終了し、既存の自動再起動経路に任せる

- [ ] 認証情報をソースコードから分離する
  - GitへID・パスワードを含めない
  - 専用設定ファイルや環境変数などから読み込む
  - ファイルを使用する場合はアクセス権を制限する

- [ ] 実機でVT切り替えによる保守操作を確認する
  - `Ctrl + Alt + F2` などでCUIへ移動できること
  - 作業後にXorg側のVTへ戻れること
  - サイネージ表示が正常に復帰すること

### MAY

- [ ] 外部モニターの自動検出を実装する
  - `VGA-1` / `HDMI-1` などの出力名に依存しない
  - 内蔵パネル以外の `connected` output を自動選択する
  - 現在有効なoutputの解像度をChromiumのwindow sizeへ反映する

- [ ] 外部モニターのホットプラグに対応する
  - 起動後の接続を検出する
  - 切断後の再接続を検出する

- [ ] 縦置きサイネージに対応する
  - `xrandr` による画面回転
  - 回転後のwindow size調整

- [ ] マウスカーソルを非表示にする

- [ ] NTPによる時刻同期を確認する

- [ ] Playwright / Chromiumのバージョンを固定する
  - 動作確認済みの組み合わせを維持する
  - 更新時にはサイネージ動作を再確認する

- [ ] Chromium起動オプションを設定ファイルへ切り出す

- [ ] 表示対象URLやselect切り替え間隔を設定ファイルへ切り出す

- [ ] systemdサービス化を検討する
  - Restart制御
  - journalへのログ集約
  - 起動依存関係の明示
  - 現状の `getty -> autologin -> startx -> .xinitrc` 構成と比較してメリットがある場合のみ採用する
