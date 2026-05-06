# GitHub Pagesに公開する手順

この手順は、コマンドを使わずにGitHubの画面だけで公開する方法です。

## 使うフォルダ

`github-pages-final-upload-YYYYMMDD-HHMMSS` の中身をGitHubへアップロードします。

重要: フォルダそのものではなく、フォルダを開いた中にあるファイルとフォルダを全部アップロードしてください。

## 全部張り替える手順

1. GitHubで `bonjouryamada/gosa-savings` を開く。
2. `Add file` を押す。
3. `Upload files` を押す。
4. `github-pages-final-upload-...` フォルダを開く。
5. 中にあるファイルとフォルダを全部選ぶ。
6. GitHubのアップロード画面へドラッグ&ドロップする。
7. 画面下の `Commit changes` を押す。
8. 2〜5分待つ。
9. 次のURLを開く。

```text
https://bonjouryamada.github.io/gosa-savings/?v=3
```

## まだ白い場合

ブラウザに古いキャッシュが残っている可能性があります。

- PCならシークレットウィンドウで開く。
- スマホなら別のブラウザで一度開く。
- `?v=3` を付けて開く。

```text
https://bonjouryamada.github.io/gosa-savings/?v=3
```

## Pages設定の確認

GitHubのリポジトリで次を確認します。

1. `Settings`
2. `Pages`
3. `Source`: `Deploy from a branch`
4. `Branch`: `main`
5. フォルダ: `/ (root)`
6. `Save`
