# GitHub Pages PWA事前点検

確認日: 2026年5月6日

## 検査結果

- `index.html`: あり
- `manifest.webmanifest`: あり
- `sw.js`: あり
- `install.html`: あり
- `privacy.html`: あり
- `support.html`: あり

## パスの確認

GitHub PagesのプロジェクトURLは、通常 `https://ユーザー名.github.io/リポジトリ名/` の形になります。

このプロジェクトでは、主要な参照が `./manifest.webmanifest`、`./src/main.jsx`、`./sw.js`、`./index.html`、`public/icons/...` のような相対パスになっていました。先頭が `/` の絶対パスに寄っていないため、リポジトリ名つきURL配下でも壊れにくい構成です。

`manifest.webmanifest` の `start_url` は `./index.html`、`scope` は `./` なので、GitHub PagesのプロジェクトURL配下で動かす前提に合っています。

`sw.js` のキャッシュ対象も `./` から始まる相対パス中心です。キャッシュ対象として書かれている画像やアイコンも存在していました。

## `.nojekyll` について

現時点では、公開に必要なファイルの中に `_` で始まる重要なフォルダやファイルは見つかりませんでした。そのため `.nojekyll` は必須ではなさそうです。

ただし、GitHub Pagesで静的アプリをそのまま配信する場合は、空の `.nojekyll` を置いても問題ありません。今後 `_assets` や `_next` のような名前のフォルダを使う可能性があるなら、先に置いておくと安全です。

## 初心者向けの注意点

- GitHub Pagesの公開URLは `https://` になります。PWAやService Workerは基本的にHTTPS上で動くため、GitHub Pagesとは相性が良いです。
- Service Workerは公開URLの場所に影響されます。この構成では `index.html` から `./sw.js` を登録しているため、リポジトリ名つきURLでも同じフォルダ内を対象にできます。
- 公開後にファイルを更新しても、PWAは古いキャッシュを表示することがあります。表示が変わらないときは、ブラウザの再読み込み、サイトデータ削除、または `sw.js` の `CACHE_NAME` 更新を確認してください。
- `manifest.webmanifest`、アイコン画像、`sw.js` が404になっていないか、公開後にブラウザの開発者ツールで確認すると安心です。
- 日本語を含むファイルはUTF-8で保存してください。今回、`manifest.webmanifest` はUTF-8として読むと日本語が正常に表示されました。

## まとめ

GitHub PagesのプロジェクトURL配下で公開する前提として、大きなパス問題は見つかりませんでした。`.nojekyll` は現状必須ではありませんが、将来の静的配信トラブルを避ける目的で追加してもよいファイルです。
