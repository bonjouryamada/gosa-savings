# 誤差貯金

誤差貯金は、日々の「使わなかった小さなお金」を記録し、貯金額と成長を見られるPWAです。

## 公開方針

このアプリは、App Store / Google Playではなく、GitHub Pagesで公開してスマートフォンの「ホーム画面に追加」から使ってもらう方針です。

現在は無料運用を優先し、Firebase同期は使わず、記録は端末内に保存します。機種変更や別端末同期が必要になった段階で、Firebase/Firestoreを有効化します。

## 主なファイル

- `index.html`: アプリ本体
- `manifest.webmanifest`: PWA設定
- `sw.js`: Service Worker
- `install.html`: ホーム画面に追加する手順
- `privacy.html`: プライバシーポリシー
- `support.html`: サポートページ
- `public/icons/`: アプリアイコン
- `output/imagegen/`: UI素材
- `release-assets/`: リリース用素材

## GitHub Pages公開

GitHubの公開リポジトリにこのフォルダの内容をアップロードし、`Settings` > `Pages` で `Deploy from a branch`、`main`、`/root` を選ぶと公開できます。

公開URLの例:

```text
https://bonjouryamada.github.io/gosa-savings/
```

公開後はスマートフォンでURLを開き、`install.html` の手順に沿ってホーム画面に追加してください。
