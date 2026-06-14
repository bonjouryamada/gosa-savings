(function () {
  "use strict";

  var cloud = {
    available: false,
    currentUser: currentUser,
    subscribeAuth: subscribeAuth,
    signUp: signUp,
    signIn: signIn,
    signOut: signOutUser,
    loadData: loadData,
    saveData: saveData,
    sendPasswordReset: resetPassword,
    readableError: readableError
  };
  var auth = null;
  var db = null;
  var authApi = null;
  var firestoreApi = null;

  cloud.ready = initialize();
  window.GosaCloud = cloud;

  async function initialize() {
    var config = window.GOSA_FIREBASE_CONFIG;
    if (!config || !config.apiKey || !config.projectId || !config.appId) {
      return cloud;
    }

    try {
      var appApi = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js");
      authApi = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js");
      firestoreApi = await import("https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js");
      var app = appApi.initializeApp(config);
      auth = authApi.getAuth(app);
      db = firestoreApi.getFirestore(app);
      cloud.available = true;
    } catch (error) {
      console.warn("Firebaseを初期化できませんでした。", error);
    }
    return cloud;
  }

  function currentUser() {
    return auth ? auth.currentUser : null;
  }

  function subscribeAuth(callback) {
    if (typeof callback !== "function") {
      throw new TypeError("callbackには関数を指定してください。");
    }
    if (!cloud.available) {
      callback(null);
      return function () {};
    }
    return authApi.onAuthStateChanged(auth, callback);
  }

  function requireAvailable() {
    if (!cloud.available) {
      throw makeError("gosa/firebase-unavailable", "Firebaseが設定されていません。");
    }
  }

  function requireUser() {
    requireAvailable();
    var user = currentUser();
    if (!user) {
      throw makeError("gosa/not-signed-in", "ログインが必要です。");
    }
    return user;
  }

  async function signUp(email, password) {
    requireAvailable();
    return authApi.createUserWithEmailAndPassword(auth, email, password);
  }

  async function signIn(email, password) {
    requireAvailable();
    return authApi.signInWithEmailAndPassword(auth, email, password);
  }

  async function signOutUser() {
    requireAvailable();
    return authApi.signOut(auth);
  }

  async function loadData() {
    var user = requireUser();
    var snapshot = await firestoreApi.getDoc(appDocument(user.uid));
    return snapshot.exists() ? snapshot.data() : null;
  }

  async function saveData(payload) {
    var user = requireUser();
    var data = Object.assign({}, payload, {
      updatedAt: firestoreApi.serverTimestamp()
    });
    await firestoreApi.setDoc(appDocument(user.uid), data, { merge: false });
  }

  async function resetPassword(email) {
    requireAvailable();
    return authApi.sendPasswordResetEmail(auth, email);
  }

  function appDocument(uid) {
    return firestoreApi.doc(db, "users", uid, "data", "app");
  }

  function makeError(code, message) {
    var error = new Error(message);
    error.code = code;
    return error;
  }

  function readableError(error) {
    var messages = {
      "auth/email-already-in-use": "このメールアドレスはすでに登録されています。",
      "auth/invalid-email": "メールアドレスの形式が正しくありません。",
      "auth/invalid-credential": "メールアドレスまたはパスワードが正しくありません。",
      "auth/missing-password": "パスワードを入力してください。",
      "auth/weak-password": "パスワードは6文字以上にしてください。",
      "auth/too-many-requests": "試行回数が多すぎます。しばらく待ってからお試しください。",
      "auth/network-request-failed": "通信に失敗しました。インターネット接続を確認してください。",
      "auth/user-disabled": "このアカウントは利用できません。",
      "gosa/firebase-unavailable": "クラウド同期はまだ設定されていません。",
      "gosa/not-signed-in": "先にログインしてください。",
      "permission-denied": "このデータを読み書きする権限がありません。",
      "unavailable": "サービスに接続できません。しばらく待ってからお試しください。"
    };
    return messages[error && error.code] || "処理に失敗しました。入力内容や通信状態を確認して、もう一度お試しください。";
  }
})();
