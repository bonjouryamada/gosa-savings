# Firebase設定手順（誤差貯金PWA v10）

v10のメールログインと携帯間同期を使うための初心者向け手順です。

重要: FirebaseはGitHubとは別の外部サービスです。Firebaseプロジェクト作成、認証の有効化、Firestore作成、設定値の貼り付け、セキュリティルールの公開は、プロジェクト所有者であるユーザー本人の対応が必要です。Firebaseを設定しない場合でも、アプリは端末内保存で利用できます。

## 1. Firebaseプロジェクトを作成する

1. ブラウザで [Firebase Console](https://console.firebase.google.com/) を開き、Googleアカウントでログインする。
2. 「プロジェクトを追加」を押す。
3. 分かりやすいプロジェクト名を入力する。
4. Google Analyticsは必要に応じて選び、画面の案内に沿ってプロジェクトを作成する。

## 2. Webアプリを登録する

1. 作成したFirebaseプロジェクトの「プロジェクトの概要」を開く。
2. Webアイコン `</>` を押す。
3. アプリのニックネームを入力する。
4. Firebase Hostingの設定は不要なので、チェックを入れずに登録する。
5. 表示された `firebaseConfig` の値を確認する。

## 3. Authorized domainsを追加する

1. Firebase Console左側の「構築」から「Authentication」を開く。
2. 「Settings」または「設定」を開く。
3. 「Authorized domains」または「承認済みドメイン」を開く。
4. 「Add domain」を押す。
5. `bonjouryamada.github.io` を入力して追加する。`https://` やパスは付けない。

## 4. 設定値をfirebase-config.jsへ貼る

1. 公開する最新版フォルダ内の `firebase-config.js` をテキストエディターで開く。
2. Firebase Consoleに表示された `apiKey`, `authDomain`, `projectId`, `storageBucket`, `messagingSenderId`, `appId` を、対応する場所へ貼り付ける。
3. UTF-8で保存する。

`firebase-config.js` が未設定のままでもアプリは端末内保存で動作しますが、ログインとクラウド同期は利用できません。

FirebaseのWeb設定値はブラウザで使う通常のクライアント設定であり、公開リポジトリに置くこと自体は一般的です。ただし、これだけではデータを保護できません。`firestore.rules` で本人UIDだけに読み書きを制限し、Firebase Consoleへ公開することが必須です。パスワード、サービスアカウント鍵、秘密鍵などは絶対に `firebase-config.js`、Firestore、`localStorage`、公開リポジトリへ保存しないでください。

## 5. Email/Password認証を有効化する

1. Firebase Console左側の「構築」から「Authentication」を開く。
2. 「始める」を押す。
3. 「ログイン方法」または「Sign-in method」を開く。
4. 「メール/パスワード」を選ぶ。
5. メール/パスワードを有効にして保存する。

## 6. Firestoreデータベースを作成する

1. Firebase Console左側の「構築」から「Firestore Database」を開く。
2. 「データベースの作成」を押す。
3. 本番環境モードを選ぶ。
4. 利用者に近いロケーションを選ぶ。作成後に変更しにくいため、内容を確認してから決定する。

## 7. firestore.rulesを設定する

1. 最新版フォルダ内の `firestore.rules` を開き、内容をすべてコピーする。
2. Firebase Consoleの「Firestore Database」から「ルール」を開く。
3. 表示中のルールを `firestore.rules` の内容へ置き換える。
4. 「公開」を押す。

ルールは、ログイン中の本人UID配下だけを読み書きできる内容であることを確認してください。テスト用の全許可ルールを公開したままにしないでください。

## 8. GitHub Pagesへ公開して確認する

1. `firebase-config.js` と `firestore.rules` を含むv10公開物をGitHubへアップロードする。
2. 次のURLを開く。

```text
https://bonjouryamada.github.io/gosa-savings/?v=10
```

3. メール/パスワードで新規登録、ログイン、ログアウトできることを確認する。
4. 未紐付け端末・同一UIDでは、端末とクラウドの記録・カテゴリがID統合され、双方のデータが残ることを確認する。
5. 異なるUIDへ切り替えると、旧UID端末データが混在せず、新UIDのクラウド状態へ切り替わることを確認する。
6. 別の携帯またはブラウザで同じアカウントへログインし、記録、カテゴリ、目標、モード設定が同期されることを確認する。
7. ログアウト後やFirebase未設定状態でも、端末内保存が使えることを確認する。

## 困ったとき

- ログインできない: AuthenticationのEmail/Passwordが有効か確認する。
- 同期できない: `firebase-config.js` の `projectId` などが正しいか、Firestoreが作成済みか確認する。
- 権限エラーになる: `firestore.rules` を正しく貼り付けて公開したか確認する。
- 古い画面が出る: `?v=10` 付きURLを開き、必要ならブラウザキャッシュを削除する。
- 移行に失敗した: 端末データは削除せず、通信状態を確認してから再同期する。
## v11 に関する補足

- v11公開確認URLは `https://bonjouryamada.github.io/gosa-savings/?v=11` を使用する。
- Firebaseプロジェクト作成、Email/Password認証の有効化、Firestore作成、設定値の反映、ルール公開、実機確認は引き続き未完了の外部作業として残す。
- v11では収益化を実装しない。将来、広告・応援プラン・プレミアム機能や分析を導入する場合も、貯金金額、記録メモ、メールアドレス等を広告事業者または分析サービスへ送信しない。
