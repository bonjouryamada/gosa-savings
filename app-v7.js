(() => {
  const recordKey = "gosa-savings-records-v7";
  const categoryKey = "gosa-savings-categories-v7";
  const goalKey = "gosa-savings-goal-v7";
  const yen = new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    maximumFractionDigits: 0,
  });

  const defaultCategories = [
    { id: "traffic", name: "交通", example: "タクシーを使わず歩けた" },
    { id: "food", name: "食事", example: "味玉トッピングを見送った" },
    { id: "shopping", name: "ショッピング", example: "必要以上の買い物をやめた" },
    { id: "fixed", name: "固定費見直し", example: "惰性のサブスクを整理した" },
    { id: "social", name: "交際費", example: "行かなくて良い飲み会を断れた" },
    { id: "other", name: "その他", example: "なんとなくの出費を見送った" },
  ];
  const maxCategoryNameLength = 16;

  const milestones = [
    { name: "東京ディズニーランド 1デーパスポート", amount: 10900, note: "大人1日券の上限目安" },
    { name: "Nintendo Switch 有機ELモデル", amount: 37980, note: "任天堂公式価格（5/25から47,980円予定）" },
    { name: "沖縄旅行 2泊3日", amount: 80000, note: "1人分の旅行費用目安" },
    { name: "ハワイ旅行 5泊7日", amount: 300000, note: "1人分の旅行費用目安" },
    { name: "バーキン25", amount: 2013000, note: "2026年2月改定後の定価目安" },
  ];

  const state = {
    records: readJson(recordKey, []),
    categories: readCategories(),
    goal: readJson(goalKey, null),
    selectedCategoryId: "traffic",
    recordMode: "saved",
    editingRecordId: null,
  };

  document.body.innerHTML = `
    <div class="v7-app">
      <div class="v7-shell">
        <header class="v7-topbar">
          <div class="v7-brand">
            <img class="v7-brand-icon" src="./output/imagegen/mascot-stage-0.png" alt="" />
            <div>
              <h1>誤差貯金</h1>
              <p>守れたお金を育てる</p>
            </div>
          </div>
          <button class="v7-small-button" type="button" data-nav="add" data-start-mode="saved">記録</button>
        </header>

        <main>
          <section class="v7-screen is-active" id="v7-home">
            <section class="v7-hero">
              <div>
                <span class="v7-label">合計貯金額</span>
                <div class="v7-total" id="v7-home-total">¥0</div>
                <div class="v7-pill" id="v7-home-month">今月 ¥0</div>
                <div class="v7-next-stage" id="v7-next-stage">次の進化まで ¥10</div>
              </div>
              <img class="v7-mascot" id="v7-home-mascot" src="./output/imagegen/mascot-stage-0.png" alt="成長するキャラクター" />
              <div class="v7-action-grid">
                <button class="v7-primary" type="button" data-start-mode="saved">使わなかったを記録</button>
                <button class="v7-bad" type="button" data-start-mode="spent">使ってしまったを記録</button>
              </div>
            </section>

            <section class="v7-goal" id="v7-goal-card"></section>
            <section class="v7-milestones" id="v7-milestones"></section>

            <div class="v7-section-title">
              <h2>最近の記録</h2>
              <span id="v7-count-label">0件</span>
            </div>
            <div class="v7-list" id="v7-history"></div>
          </section>

          <section class="v7-screen" id="v7-add">
            <div class="v7-section-title">
              <h2 id="v7-form-title">誤差を記録</h2>
              <span>入力中は固定</span>
            </div>
            <form class="v7-form" id="v7-form">
              <div class="v7-mode-row">
                <button class="v7-mode is-active" type="button" data-mode="saved">使わなかった</button>
                <button class="v7-mode is-danger" type="button" data-mode="spent">使ってしまった</button>
              </div>
              <label class="v7-field">
                <span id="v7-amount-label">使わなかった金額</span>
                <input id="v7-amount" class="v7-amount-input" type="number" inputmode="numeric" min="1" placeholder="0" autocomplete="off" />
              </label>
              <div class="v7-field">
                <span>カテゴリ</span>
                <div class="v7-chips" id="v7-category-chips"></div>
                <p class="v7-example" id="v7-category-example"></p>
              </div>
              <div class="v7-inline">
                <input id="v7-new-category" type="text" placeholder="カテゴリを追加" autocomplete="off" />
                <button class="v7-small-button" type="button" id="v7-add-category">追加</button>
              </div>
              <label class="v7-field">
                <span id="v7-memo-label">何を使わなかった？</span>
                <textarea id="v7-memo" placeholder="例：タクシーを使わず歩けた" autocomplete="off"></textarea>
              </label>
              <label class="v7-field">
                <span>日付</span>
                <input id="v7-date" type="date" />
              </label>
              <button class="v7-primary" type="submit" id="v7-submit">記録する</button>
              <button class="v7-small-button v7-hidden" type="button" id="v7-cancel-edit">編集をやめる</button>
            </form>
          </section>

          <section class="v7-screen" id="v7-stats">
            <div class="v7-section-title">
              <h2>統計</h2>
              <span>月別・カテゴリ別</span>
            </div>
            <div class="v7-stats-grid">
              <div class="v7-stat"><span>合計</span><strong id="v7-stats-total">¥0</strong></div>
              <div class="v7-stat"><span>使わなかった</span><strong id="v7-stats-saved">¥0</strong></div>
              <div class="v7-stat v7-red-stat"><span>使ってしまった</span><strong id="v7-stats-spent">¥0</strong></div>
            </div>
            <div class="v7-section-title"><h2>月ごとの推移</h2></div>
            <div class="v7-panel"><div class="v7-bars" id="v7-month-bars"></div></div>
            <div class="v7-section-title"><h2>カテゴリ別の統計</h2></div>
            <div class="v7-panel"><div class="v7-bars" id="v7-category-bars"></div></div>
          </section>

          <section class="v7-screen" id="v7-profile">
            <div class="v7-section-title">
              <h2>マイページ</h2>
              <span>カテゴリ編集と目標</span>
            </div>
            <section class="v7-profile-hero">
              <img id="v7-profile-mascot" src="./output/imagegen/mascot-stage-0.png" alt="現在のキャラクター" />
              <div>
                <span class="v7-label">現在のキャラクター</span>
                <p>金額の桁が変わるたび、見た目が豪華になります。</p>
              </div>
            </section>
            <div class="v7-stats-grid v7-profile-stats">
              <div class="v7-stat"><span>累計貯金額</span><strong id="v7-profile-total">¥0</strong></div>
              <div class="v7-stat"><span>記録件数</span><strong id="v7-profile-records">0件</strong></div>
              <div class="v7-stat"><span>カテゴリ</span><strong id="v7-profile-categories">0個</strong></div>
              <div class="v7-stat"><span>目標</span><strong id="v7-profile-goal">未設定</strong></div>
            </div>
            <section class="v7-form v7-goal-form">
              <div class="v7-section-title compact"><h2>目標を設定</h2></div>
              <input id="v7-goal-name" type="text" placeholder="例：沖縄旅行" autocomplete="off" />
              <input id="v7-goal-amount" type="number" inputmode="numeric" min="1" placeholder="目標金額" autocomplete="off" />
              <button class="v7-primary" type="button" id="v7-save-goal">目標を保存</button>
            </section>
            <div class="v7-section-title"><h2>カテゴリ一覧</h2></div>
            <div class="v7-list" id="v7-category-list"></div>
            <button class="v7-reset" type="button" id="v7-reset">記録を0からやり直す</button>
          </section>
        </main>
      </div>
    </div>
    <nav class="v7-nav">
      <button class="is-active" type="button" data-nav="home">ホーム</button>
      <button type="button" data-nav="add">記録</button>
      <button type="button" data-nav="stats">統計</button>
      <button type="button" data-nav="profile">マイ</button>
    </nav>
    <div class="v7-toast" id="v7-toast"></div>
  `;

  const style = document.createElement("style");
  style.textContent = `
    :root { color-scheme: light; --bg:#f5f6f3; --paper:#fff; --mint:#edf5f1; --ink:#17201c; --muted:#78817b; --line:rgba(23,32,28,.1); --green:#1e7f63; --deep:#10634c; --gold:#d8a437; --bad:#8e2f2f; --bad-bg:#fff0ed; --font-family:"Hiragino Sans","Yu Gothic UI","Yu Gothic","Noto Sans JP",system-ui,sans-serif; font-family:var(--font-family); }
    *{box-sizing:border-box} body{margin:0;min-width:320px;background:linear-gradient(145deg,#fbfbf3,#eef6f1);color:var(--ink);font-family:var(--font-family)}
    button,input,textarea{font:inherit} button{border:0;cursor:pointer} .v7-app{width:min(100%,520px);min-height:100vh;margin:0 auto;padding:14px 14px 96px}.v7-shell{min-height:calc(100vh - 110px);border:1px solid var(--line);border-radius:32px;background:rgba(255,255,255,.95);box-shadow:0 18px 50px rgba(27,54,43,.12);overflow:hidden}
    .v7-topbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:20px;border-bottom:1px solid var(--line);background:linear-gradient(135deg,var(--mint),#fff)}.v7-brand{display:flex;align-items:center;gap:12px}.v7-brand-icon{width:44px;height:44px;border-radius:14px;object-fit:cover}.v7-brand h1{margin:0;color:var(--deep);font-size:22px}.v7-brand p{margin:2px 0 0;color:var(--muted);font-size:12px;font-weight:800}
    .v7-screen{display:none;padding:18px 18px 108px}.v7-screen.is-active{display:block}.v7-hero,.v7-form,.v7-panel,.v7-goal,.v7-profile-hero{border:1px solid var(--line);border-radius:26px;background:var(--paper);box-shadow:0 12px 28px rgba(27,54,43,.08);padding:18px}.v7-hero{display:grid;grid-template-columns:1fr 132px;gap:16px;background:linear-gradient(145deg,var(--mint),#fff 72%)}.v7-label{color:var(--deep);font-size:13px;font-weight:900}.v7-total{margin-top:4px;font-size:52px;font-weight:950;letter-spacing:0}.v7-pill{display:inline-flex;margin-top:10px;border-radius:999px;background:var(--green);color:#fff;padding:8px 13px;font-weight:900}.v7-mascot{width:132px;height:132px;border-radius:30px;object-fit:cover;background:var(--mint)}
    .v7-action-grid{grid-column:1/-1;display:grid;gap:10px}.v7-primary,.v7-bad,.v7-small-button,.v7-reset,.v7-shine{width:100%;border-radius:20px;padding:14px 16px;font-weight:950}.v7-primary{background:var(--green);color:#fff;box-shadow:0 14px 28px rgba(30,127,99,.2)}.v7-bad{background:linear-gradient(135deg,#522,#9d3d35);color:#fff;box-shadow:0 14px 28px rgba(142,47,47,.18)}.v7-small-button{background:var(--mint);color:var(--deep)}.v7-shine{background:linear-gradient(135deg,#f7d875,#d8a437,#fff0a8);color:#4c3500;box-shadow:0 16px 32px rgba(216,164,55,.28)}.v7-reset{background:#fff0ed;color:#9b352b}
    .v7-section-title{display:flex;align-items:center;justify-content:space-between;gap:12px;margin:22px 0 12px}.v7-section-title h2{margin:0;font-size:18px}.v7-section-title span{color:var(--muted);font-size:13px;font-weight:800}.compact{margin:0}.v7-list,.v7-bars{display:grid;gap:10px}.v7-record,.v7-category-row,.v7-item{display:grid;gap:10px;border:1px solid var(--line);border-radius:20px;background:#fff;padding:14px}.v7-record-top{display:flex;justify-content:space-between;gap:12px}.v7-record p{margin:0;font-weight:900}.v7-record small,.v7-item small{color:var(--muted);font-weight:800}.v7-positive{color:var(--green)}.v7-negative{color:var(--bad)}.v7-card-actions{display:flex;gap:8px}.v7-mini{border-radius:999px;background:var(--mint);color:var(--deep);padding:8px 12px;font-size:12px;font-weight:900}.v7-mini.danger{background:var(--bad-bg);color:var(--bad)}
    .v7-field{display:grid;gap:8px}.v7-field span{color:var(--deep);font-size:13px;font-weight:900} input,textarea{width:100%;border:1px solid rgba(23,32,28,.12);border-radius:18px;background:#fbfcf9;color:var(--ink);outline:0;padding:14px 15px} input:focus,textarea:focus{border-color:rgba(30,127,99,.45);box-shadow:0 0 0 4px rgba(30,127,99,.1)} textarea{min-height:92px;resize:vertical}.v7-amount-input{font-size:34px;font-weight:950}.v7-form{display:grid;gap:14px}.v7-mode-row,.v7-inline{display:grid;grid-template-columns:1fr 1fr;gap:8px}.v7-mode{border-radius:18px;background:var(--mint);color:var(--deep);padding:12px;font-weight:900}.v7-mode.is-active{background:var(--green);color:#fff}.v7-mode.is-danger.is-active{background:var(--bad)}.v7-chips{display:flex;flex-wrap:wrap;gap:8px}.v7-chip{border:1px solid var(--line);border-radius:999px;background:#fff;color:var(--muted);padding:10px 12px;font-size:14px;font-weight:900}.v7-chip.is-active{background:var(--green);color:#fff}.v7-example{margin:0;border-radius:16px;background:var(--mint);color:var(--deep);padding:11px 12px;font-size:13px;font-weight:800}
    .v7-stats-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.v7-stat{border-radius:20px;background:var(--mint);padding:14px}.v7-stat span{display:block;color:var(--muted);font-size:12px;font-weight:800}.v7-stat strong{font-size:22px;color:var(--deep)}.v7-red-stat strong{color:var(--bad)}.v7-bar{display:grid;grid-template-columns:86px 1fr 86px;gap:8px;align-items:center;font-size:13px;font-weight:800;color:var(--muted)}.v7-track{height:14px;border-radius:999px;background:var(--mint);overflow:hidden}.v7-fill{height:100%;width:var(--w);border-radius:999px;background:linear-gradient(90deg,var(--green),var(--gold))}.v7-fill.neg{background:linear-gradient(90deg,#c75b4a,var(--bad))}
    .v7-goal{display:grid;gap:10px;margin-top:14px}.v7-goal h2,.v7-milestones h2{margin:0;font-size:17px}.v7-next-stage{margin-top:8px;color:var(--muted);font-size:12px;font-weight:900}.v7-progress{height:14px;border-radius:999px;background:var(--mint);overflow:hidden}.v7-progress div{height:100%;width:var(--w);background:linear-gradient(90deg,var(--green),var(--gold))}.v7-milestones{display:grid;gap:10px;margin-top:16px}.v7-item{grid-template-columns:1fr auto}.v7-item.reached{background:linear-gradient(135deg,#fff,var(--mint))}.v7-profile-hero{display:grid;grid-template-columns:110px 1fr;align-items:center;gap:14px}.v7-profile-hero img{width:110px;height:110px;border-radius:28px;object-fit:cover;background:var(--mint)}.v7-profile-stats{margin-top:12px}.v7-hidden{display:none!important}
    .v7-nav{position:fixed;left:50%;bottom:14px;z-index:20;display:grid;grid-template-columns:repeat(4,1fr);gap:4px;width:min(calc(100% - 32px),488px);padding:6px;border:1px solid var(--line);border-radius:24px;background:rgba(255,255,255,.95);box-shadow:0 14px 34px rgba(27,54,43,.14);transform:translateX(-50%)}.v7-nav button{border-radius:18px;background:transparent;color:var(--muted);padding:10px 4px;font-size:12px;font-weight:900}.v7-nav button.is-active{background:var(--mint);color:var(--deep)}.v7-toast{position:fixed;left:50%;bottom:86px;z-index:30;width:min(calc(100% - 36px),460px);border-radius:18px;background:var(--ink);color:#fff;padding:12px 14px;text-align:center;font-weight:900;opacity:0;pointer-events:none;transform:translateX(-50%);transition:.2s}.v7-toast.show{opacity:1;transform:translateX(-50%) translateY(-6px)}
    @media(max-width:420px){.v7-app{padding:0 0 86px}.v7-shell{border:0;border-radius:0;min-height:100vh}.v7-hero{grid-template-columns:1fr 112px}.v7-mascot{width:112px;height:112px}.v7-total{font-size:46px}}
  `;
  document.head.appendChild(style);

  const els = {
    screens: document.querySelectorAll(".v7-screen"),
    navs: document.querySelectorAll("[data-nav]"),
    startButtons: document.querySelectorAll("[data-start-mode]"),
    total: document.getElementById("v7-home-total"),
    month: document.getElementById("v7-home-month"),
    nextStage: document.getElementById("v7-next-stage"),
    homeMascot: document.getElementById("v7-home-mascot"),
    countLabel: document.getElementById("v7-count-label"),
    history: document.getElementById("v7-history"),
    goalCard: document.getElementById("v7-goal-card"),
    milestones: document.getElementById("v7-milestones"),
    form: document.getElementById("v7-form"),
    formTitle: document.getElementById("v7-form-title"),
    modeButtons: document.querySelectorAll("[data-mode]"),
    amountLabel: document.getElementById("v7-amount-label"),
    amount: document.getElementById("v7-amount"),
    memoLabel: document.getElementById("v7-memo-label"),
    memo: document.getElementById("v7-memo"),
    date: document.getElementById("v7-date"),
    chips: document.getElementById("v7-category-chips"),
    example: document.getElementById("v7-category-example"),
    newCategory: document.getElementById("v7-new-category"),
    addCategory: document.getElementById("v7-add-category"),
    submit: document.getElementById("v7-submit"),
    cancelEdit: document.getElementById("v7-cancel-edit"),
    statsTotal: document.getElementById("v7-stats-total"),
    statsSaved: document.getElementById("v7-stats-saved"),
    statsSpent: document.getElementById("v7-stats-spent"),
    monthBars: document.getElementById("v7-month-bars"),
    categoryBars: document.getElementById("v7-category-bars"),
    profileMascot: document.getElementById("v7-profile-mascot"),
    profileTotal: document.getElementById("v7-profile-total"),
    profileRecords: document.getElementById("v7-profile-records"),
    profileCategories: document.getElementById("v7-profile-categories"),
    profileGoal: document.getElementById("v7-profile-goal"),
    goalName: document.getElementById("v7-goal-name"),
    goalAmount: document.getElementById("v7-goal-amount"),
    saveGoal: document.getElementById("v7-save-goal"),
    categoryList: document.getElementById("v7-category-list"),
    reset: document.getElementById("v7-reset"),
    toast: document.getElementById("v7-toast"),
  };

  els.date.value = today();
  renderChips();
  render();
  bind();

  if ("serviceWorker" in navigator && location.protocol !== "file:") {
    window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
  }

  function bind() {
    els.navs.forEach((button) => button.addEventListener("click", () => navigate(button.dataset.nav)));
    els.startButtons.forEach((button) => {
      button.addEventListener("click", () => {
        setMode(button.dataset.startMode);
        clearEdit();
        navigate("add");
        setTimeout(() => els.amount.focus({ preventScroll: true }), 100);
      });
    });
    els.modeButtons.forEach((button) => button.addEventListener("click", () => setMode(button.dataset.mode)));
    keepKeyboardWhileTapping(els.modeButtons);
    els.form.addEventListener("submit", saveRecord);
    els.cancelEdit.addEventListener("click", clearEdit);
    els.addCategory.addEventListener("click", addCategory);
    els.newCategory.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        addCategory();
      }
    });
    els.history.addEventListener("click", onHistoryAction);
    els.categoryList.addEventListener("click", onCategoryAction);
    els.saveGoal.addEventListener("click", saveGoal);
    els.goalCard.addEventListener("click", (event) => {
      if (event.target.id === "v7-achieve-goal") achieveGoal();
      if (event.target.id === "v7-clear-goal") clearGoal();
    });
    els.reset.addEventListener("click", () => {
      if (!confirm("記録をすべて削除して0から始めますか？")) return;
      state.records = [];
      localStorage.setItem(recordKey, JSON.stringify(state.records));
      render();
      toast("0から始めます");
    });
  }

  function navigate(name) {
    els.screens.forEach((screen) => screen.classList.toggle("is-active", screen.id === `v7-${name}`));
    document.querySelectorAll(".v7-nav button").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.nav === name);
    });
  }

  function setMode(mode) {
    state.recordMode = mode;
    els.modeButtons.forEach((button) => button.classList.toggle("is-active", button.dataset.mode === mode));
    const spent = mode === "spent";
    els.amountLabel.textContent = spent ? "使ってしまった金額" : "使わなかった金額";
    els.memoLabel.textContent = spent ? "何に使ってしまった？" : "何を使わなかった？";
    els.submit.textContent = state.editingRecordId ? "更新する" : spent ? "使ってしまったを記録" : "記録する";
  }

  function saveRecord(event) {
    event.preventDefault();
    const amount = Number(els.amount.value);
    if (!amount || amount < 1) {
      toast("金額を入力してください");
      els.amount.focus({ preventScroll: true });
      return;
    }
    const category = selectedCategory();
    const oldEffect = state.editingRecordId
      ? recordEffect(state.records.find((record) => record.id === state.editingRecordId) || { type: "saved", amount: 0 })
      : 0;
    const available = Math.max(0, getRawTotal() - oldEffect);
    if ((state.recordMode === "spent" || state.recordMode === "goal") && amount > available) {
      toast(`今の貯金額は${yen.format(available)}です`);
      els.amount.focus({ preventScroll: true });
      return;
    }
    const data = {
      id: state.editingRecordId || `record-${Date.now()}`,
      type: state.recordMode,
      amount,
      categoryId: category.id,
      categoryName: category.name,
      memo: els.memo.value.trim() || category.example,
      date: els.date.value || today(),
    };
    if (state.editingRecordId) {
      state.records = state.records.map((record) => (record.id === state.editingRecordId ? data : record));
      toast("記録を更新しました");
    } else {
      state.records.unshift(data);
      toast(data.type === "spent" ? "使ってしまった分を記録しました" : "誤差を記録しました");
    }
    localStorage.setItem(recordKey, JSON.stringify(state.records));
    clearEdit();
    render();
    navigate("home");
  }

  function onHistoryAction(event) {
    const button = event.target.closest("[data-record-action]");
    if (!button) return;
    const id = button.dataset.recordId;
    if (button.dataset.recordAction === "delete") {
      if (!confirm("この記録を削除しますか？")) return;
      state.records = state.records.filter((record) => record.id !== id);
      localStorage.setItem(recordKey, JSON.stringify(state.records));
      render();
      toast("記録を削除しました");
      return;
    }
    const record = state.records.find((item) => item.id === id);
    if (!record) return;
    state.editingRecordId = record.id;
    state.selectedCategoryId = record.categoryId;
    els.amount.value = record.amount;
    els.memo.value = record.memo;
    els.date.value = record.date;
    setMode(record.type || "saved");
    renderChips();
    els.formTitle.textContent = "記録を編集";
    els.submit.textContent = "更新する";
    els.cancelEdit.classList.remove("v7-hidden");
    navigate("add");
  }

  function clearEdit() {
    state.editingRecordId = null;
    els.form.reset();
    els.date.value = today();
    els.formTitle.textContent = "誤差を記録";
    els.cancelEdit.classList.add("v7-hidden");
    setMode(state.recordMode);
    renderChips();
  }

  function addCategory() {
    const name = els.newCategory.value.trim();
    if (!name) {
      toast("カテゴリ名を入力してください");
      return;
    }
    if (name.length > maxCategoryNameLength) {
      toast(`カテゴリ名は${maxCategoryNameLength}文字までです`);
      return;
    }
    if (state.categories.some((category) => category.name === name)) {
      toast("同じカテゴリがあります");
      return;
    }
    state.categories.push({ id: `custom-${Date.now()}`, name, example: `${name}の出費を見送った`, custom: true });
    state.selectedCategoryId = state.categories.at(-1).id;
    els.newCategory.value = "";
    saveCategories();
    renderChips();
    render();
  }

  function onCategoryAction(event) {
    const button = event.target.closest("[data-category-action]");
    if (!button) return;
    const id = button.dataset.categoryId;
    const category = state.categories.find((item) => item.id === id);
    if (!category) return;
    if (button.dataset.categoryAction === "edit") {
      const name = prompt("カテゴリ名", category.name);
      if (!name) return;
      if (name.trim().length > maxCategoryNameLength) {
        toast(`カテゴリ名は${maxCategoryNameLength}文字までです`);
        return;
      }
      const example = prompt("例文", category.example) || category.example;
      category.name = name.trim();
      category.example = example.trim();
      state.records.forEach((record) => {
        if (record.categoryId === id) record.categoryName = category.name;
      });
      saveCategories();
      localStorage.setItem(recordKey, JSON.stringify(state.records));
      renderChips();
      render();
      toast("カテゴリを更新しました");
      return;
    }
    if (state.categories.length <= 1) {
      toast("カテゴリは1つ以上必要です");
      return;
    }
    if (!confirm("このカテゴリを削除しますか？ 過去の記録はその他に移します。")) return;
    const fallback = state.categories.find((item) => item.id !== id) || defaultCategories[5];
    state.records.forEach((record) => {
      if (record.categoryId === id) {
        record.categoryId = fallback.id;
        record.categoryName = fallback.name;
      }
    });
    state.categories = state.categories.filter((item) => item.id !== id);
    state.selectedCategoryId = fallback.id;
    saveCategories();
    localStorage.setItem(recordKey, JSON.stringify(state.records));
    renderChips();
    render();
    toast("カテゴリを削除しました");
  }

  function saveGoal() {
    const name = els.goalName.value.trim();
    const amount = Number(els.goalAmount.value);
    if (!name || !amount || amount < 1) {
      toast("目標名と金額を入力してください");
      return;
    }
    state.goal = { name, amount };
    localStorage.setItem(goalKey, JSON.stringify(state.goal));
    els.goalName.value = "";
    els.goalAmount.value = "";
    render();
    toast("目標を設定しました");
  }

  function clearGoal() {
    state.goal = null;
    localStorage.removeItem(goalKey);
    render();
    toast("目標を削除しました");
  }

  function achieveGoal() {
    if (!state.goal) return;
    const stats = getStats();
    if (stats.total < state.goal.amount) return;
    state.records.unshift({
      id: `goal-${Date.now()}`,
      type: "goal",
      amount: state.goal.amount,
      categoryId: "goal",
      categoryName: "目標達成",
      memo: `${state.goal.name}のために使った`,
      date: today(),
      completedAt: new Date().toISOString(),
    });
    localStorage.setItem(recordKey, JSON.stringify(state.records));
    clearGoal();
    toast("目標達成！気持ちよく使いました");
  }

  function render() {
    const stats = getStats();
    const stage = getStage(stats.total);
    const stageSrc = `./output/imagegen/mascot-stage-${stage}.png`;
    els.total.textContent = yen.format(stats.total);
    els.month.textContent = `今月 ${yen.format(stats.month)}`;
    els.nextStage.textContent = getNextStageText(stats.total);
    els.homeMascot.src = stageSrc;
    els.profileMascot.src = stageSrc;
    els.profileTotal.textContent = yen.format(stats.total);
    els.profileRecords.textContent = `${state.records.length}件`;
    els.profileCategories.textContent = `${state.categories.length}個`;
    els.profileGoal.textContent = state.goal ? state.goal.name : "未設定";
    els.countLabel.textContent = `${state.records.length}件`;
    els.statsTotal.textContent = yen.format(stats.total);
    els.statsSaved.textContent = yen.format(stats.saved);
    els.statsSpent.textContent = yen.format(stats.spent);
    renderHistory();
    renderBars(els.monthBars, stats.byMonth, "月別データはまだありません");
    renderBars(els.categoryBars, stats.byCategory, "カテゴリ別データはまだありません");
    renderGoal(stats.total);
    renderMilestones(stats.total);
    renderCategories();
  }

  function renderHistory() {
    if (!state.records.length) {
      els.history.innerHTML = `<div class="v7-record">まだ記録はありません。まずは大きなボタンから、今日の誤差を記録しましょう。</div>`;
      return;
    }
    els.history.innerHTML = state.records.slice(0, 8).map((record) => {
      const effect = recordEffect(record);
      const sign = effect >= 0 ? "+" : "-";
      const cls = effect >= 0 ? "v7-positive" : "v7-negative";
      return `
        <article class="v7-record">
          <div class="v7-record-top">
            <div>
              <p>${escapeHtml(record.memo)}</p>
              <small>${escapeHtml(record.categoryName)}・${escapeHtml(record.date)}</small>
            </div>
            <strong class="${cls}">${sign}${yen.format(Math.abs(effect))}</strong>
          </div>
          <div class="v7-card-actions">
            <button class="v7-mini" type="button" data-record-action="edit" data-record-id="${record.id}">編集</button>
            <button class="v7-mini danger" type="button" data-record-action="delete" data-record-id="${record.id}">削除</button>
          </div>
        </article>
      `;
    }).join("");
  }

  function renderGoal(total) {
    if (!state.goal) {
      els.goalCard.innerHTML = `
        <h2>目標を設定しよう</h2>
        <p class="v7-muted">マイページから「何のためにいくら貯めるか」を設定できます。</p>
      `;
      return;
    }
    const progress = Math.min(100, Math.round((Math.max(total, 0) / state.goal.amount) * 100));
    const achieved = total >= state.goal.amount;
    els.goalCard.innerHTML = `
      <h2>${escapeHtml(state.goal.name)}</h2>
      <p>${yen.format(Math.max(total, 0))} / ${yen.format(state.goal.amount)}</p>
      <div class="v7-progress"><div style="--w:${progress}%"></div></div>
      ${achieved ? `<button class="v7-shine" type="button" id="v7-achieve-goal">目標達成して使う</button>` : `<p class="v7-muted">あと ${yen.format(state.goal.amount - Math.max(total, 0))}</p>`}
      <button class="v7-small-button" type="button" id="v7-clear-goal">目標を削除</button>
    `;
  }

  function renderMilestones(total) {
    els.milestones.innerHTML = `
      <h2>貯まった金額で買えるもの</h2>
      ${milestones.map((item) => {
        const reached = total >= item.amount;
        return `
          <div class="v7-item ${reached ? "reached" : ""}">
            <div>
              <strong>${escapeHtml(item.name)}</strong><br />
              <small>${escapeHtml(item.note)}</small>
            </div>
            <strong>${reached ? "到達" : yen.format(item.amount)}</strong>
          </div>
        `;
      }).join("")}
    `;
  }

  function renderCategories() {
    els.categoryList.innerHTML = state.categories.map((category) => `
      <article class="v7-category-row">
        <div>
          <strong>${escapeHtml(category.name)}</strong><br />
          <small>${escapeHtml(category.example)}</small>
        </div>
        <div class="v7-card-actions">
          <button class="v7-mini" type="button" data-category-action="edit" data-category-id="${category.id}">編集</button>
          <button class="v7-mini danger" type="button" data-category-action="delete" data-category-id="${category.id}">削除</button>
        </div>
      </article>
    `).join("");
  }

  function renderChips() {
    els.chips.innerHTML = state.categories.map((category) => {
      const active = category.id === state.selectedCategoryId ? " is-active" : "";
      return `<button class="v7-chip${active}" type="button" data-category-id="${category.id}">${escapeHtml(category.name)}</button>`;
    }).join("");
    els.chips.querySelectorAll("[data-category-id]").forEach((button) => {
      keepKeyboardWhileTapping([button]);
      button.addEventListener("click", () => {
        state.selectedCategoryId = button.dataset.categoryId;
        renderChips();
      });
    });
    const category = selectedCategory();
    els.example.textContent = `例: ${category.example}`;
    if (!els.memo.value) els.memo.placeholder = `例: ${category.example}`;
  }

  function renderBars(container, rows, emptyText) {
    if (!rows.length) {
      container.innerHTML = `<div class="v7-record">${emptyText}</div>`;
      return;
    }
    const max = Math.max(...rows.map((row) => Math.abs(row.amount)), 1);
    container.innerHTML = rows.map((row) => {
      const neg = row.amount < 0;
      const width = Math.max(8, Math.round((Math.abs(row.amount) / max) * 100));
      return `
        <div class="v7-bar">
          <span>${escapeHtml(row.label)}</span>
          <div class="v7-track"><div class="v7-fill ${neg ? "neg" : ""}" style="--w:${width}%"></div></div>
          <strong class="${neg ? "v7-negative" : "v7-positive"}">${neg ? "-" : ""}${yen.format(Math.abs(row.amount))}</strong>
        </div>
      `;
    }).join("");
  }

  function getStats() {
    const nowMonth = today().slice(0, 7);
    let total = 0;
    let saved = 0;
    let spent = 0;
    const monthMap = new Map();
    const categoryMap = new Map();
    state.records.forEach((record) => {
      const effect = recordEffect(record);
      total += effect;
      if (effect >= 0) saved += effect;
      else spent += Math.abs(effect);
      const month = record.date.slice(0, 7);
      monthMap.set(month, (monthMap.get(month) || 0) + effect);
      categoryMap.set(record.categoryName, (categoryMap.get(record.categoryName) || 0) + effect);
    });
    const month = state.records
      .filter((record) => record.date.slice(0, 7) === nowMonth)
      .reduce((sum, record) => sum + recordEffect(record), 0);
    return {
      total: Math.max(0, total),
      saved,
      spent,
      month,
      byMonth: [...monthMap.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([label, amount]) => ({ label: `${Number(label.slice(5))}月`, amount })),
      byCategory: [...categoryMap.entries()].sort((a, b) => Math.abs(b[1]) - Math.abs(a[1])).map(([label, amount]) => ({ label, amount })),
    };
  }

  function recordEffect(record) {
    return record.type === "spent" || record.type === "goal" ? -Number(record.amount) : Number(record.amount);
  }

  function getRawTotal() {
    return state.records.reduce((sum, record) => sum + recordEffect(record), 0);
  }

  function getStage(total) {
    const value = Math.max(total, 0);
    if (value < 10) return 0;
    if (value < 100) return 1;
    if (value < 1000) return 2;
    if (value < 10000) return 3;
    if (value < 100000) return 4;
    return 5;
  }

  function getNextStageText(total) {
    const value = Math.max(total, 0);
    const next = [10, 100, 1000, 10000, 100000].find((amount) => value < amount);
    return next ? `次の進化まで ${yen.format(next - value)}` : "最高ステージに到達中";
  }

  function selectedCategory() {
    return state.categories.find((category) => category.id === state.selectedCategoryId) || state.categories[0];
  }

  function readCategories() {
    const saved = readJson(categoryKey, null);
    if (Array.isArray(saved) && saved.length) return saved;
    return defaultCategories;
  }

  function saveCategories() {
    localStorage.setItem(categoryKey, JSON.stringify(state.categories));
  }

  function readJson(key, fallback) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "null");
      return value ?? fallback;
    } catch {
      return fallback;
    }
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function toast(message) {
    els.toast.textContent = message;
    els.toast.classList.add("show");
    window.clearTimeout(toast.timer);
    toast.timer = window.setTimeout(() => els.toast.classList.remove("show"), 2200);
  }

  function keepKeyboardWhileTapping(buttons) {
    buttons.forEach((button) => {
      button.addEventListener("pointerdown", (event) => {
        if (isTypingControl(document.activeElement)) event.preventDefault();
      });
    });
  }

  function isTypingControl(element) {
    return element instanceof HTMLInputElement || element instanceof HTMLTextAreaElement;
  }

  function escapeHtml(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }
})();
