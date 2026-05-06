import React, { useMemo, useState } from "react";

const { createElement: h } = React;
const storageKey = "gosa-savings-records-v1";
const today = new Date();
const todayInput = today.toISOString().slice(0, 10);

const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const asset = (name) => `./output/imagegen/${name}`;

const categories = [
  { key: "taxi", label: "タクシー", icon: asset("icon-taxi-trimmed.png"), amount: 780 },
  { key: "ramen", label: "ラーメン", icon: asset("icon-ramen-trimmed.png"), amount: 320 },
  { key: "shopping", label: "買い物", icon: asset("icon-shopping-trimmed.png"), amount: 1480 },
  { key: "subscription", label: "サブスク", icon: asset("icon-subscription-trimmed.png"), amount: 980 },
];

const seedRecords = [
  { id: "seed-1", amount: 1280, category: "taxi", date: todayInput, memo: "タクシーを使わなかった" },
  { id: "seed-2", amount: 320, category: "ramen", date: todayInput, memo: "味玉トッピングを見送った" },
  { id: "seed-3", amount: 980, category: "subscription", date: new Date(today.getFullYear(), today.getMonth(), 8).toISOString().slice(0, 10), memo: "惰性のサブスクを整理した" },
];

const loadRecords = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(storageKey) || "null");
    return Array.isArray(parsed) && parsed.length ? parsed : seedRecords;
  } catch {
    return seedRecords;
  }
};

const monthKey = (dateString) => dateString.slice(0, 7);
const categoryByKey = (key) => categories.find((item) => item.key === key) || categories[2];

function Icon({ path }) {
  return h("svg", { viewBox: "0 0 24 24", "aria-hidden": "true" }, h("path", { d: path }));
}

function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [records, setRecords] = useState(loadRecords);
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("taxi");
  const [date, setDate] = useState(todayInput);
  const [memo, setMemo] = useState("");
  const [toast, setToast] = useState("");

  const stats = useMemo(() => {
    const total = records.reduce((sum, record) => sum + Number(record.amount), 0);
    const currentMonth = todayInput.slice(0, 7);
    const monthly = records
      .filter((record) => monthKey(record.date) === currentMonth)
      .reduce((sum, record) => sum + Number(record.amount), 0);
    const monthTotals = {};
    records.forEach((record) => {
      monthTotals[monthKey(record.date)] = (monthTotals[monthKey(record.date)] || 0) + Number(record.amount);
    });
    const level = Math.max(1, Math.floor(total / 3000) + 1);
    const nextLevel = level * 3000;
    const progress = Math.min(100, Math.round((total / nextLevel) * 100));

    return { total, monthly, monthTotals, level, nextLevel, progress, count: records.length };
  }, [records]);

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => new Date(b.date) - new Date(a.date)),
    [records],
  );

  const saveRecords = (nextRecords) => {
    setRecords(nextRecords);
    localStorage.setItem(storageKey, JSON.stringify(nextRecords));
  };

  const startQuickRecord = (item) => {
    setCategory(item.key);
    setAmount(String(item.amount));
    setMemo(`${item.label}の誤差を守った`);
    setActiveTab("add");
  };

  const saveRecord = () => {
    const value = Number(amount);
    if (!value || value < 1) {
      setToast("金額を入力してください");
      setTimeout(() => setToast(""), 2200);
      return;
    }

    const nextRecord = {
      id: `record-${Date.now()}`,
      amount: value,
      category,
      date,
      memo: memo.trim() || "誤差を守った",
    };
    saveRecords([nextRecord, ...records]);
    setAmount("");
    setMemo("");
    setDate(todayInput);
    setToast("誤差を記録しました");
    setTimeout(() => setToast(""), 2200);
    setActiveTab("home");
  };

  return h(
    "main",
    { className: "app-shell gosa-app", "aria-label": "誤差貯金アプリ" },
    h(Header, { activeTab }),
    h(HomeScreen, { active: activeTab === "home", records: sortedRecords, setActiveTab, startQuickRecord, stats }),
    h(AddScreen, {
      active: activeTab === "add",
      amount,
      category,
      date,
      memo,
      saveRecord,
      setAmount,
      setCategory,
      setDate,
      setMemo,
    }),
    h(StatsScreen, { active: activeTab === "stats", records: sortedRecords, stats }),
    toast ? h("p", { className: "app-toast", role: "status" }, toast) : null,
    h(BottomNav, { activeTab, setActiveTab }),
  );
}

function Header({ activeTab }) {
  const title = activeTab === "add" ? "誤差を記録" : activeTab === "stats" ? "成長と統計" : "誤差貯金";
  return h(
    "header",
    { className: "topbar app-topbar" },
    h("button", { className: "ghost-icon", type: "button", "aria-label": "メニュー" }, Icon({ path: "M4 6h16M4 12h16M4 18h16" })),
    h("h1", null, title),
    h("button", { className: "ghost-icon notice-button", type: "button", "aria-label": "通知" }, Icon({ path: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0" })),
  );
}

function HomeScreen({ active, records, setActiveTab, startQuickRecord, stats }) {
  return h(
    "section",
    { className: `screen home-screen ${active ? "is-active" : ""}`, "data-testid": "screen-home" },
    h(
      "section",
      { className: "balance-panel" },
      h(
        "div",
        { className: "balance-copy" },
        h("span", null, "合計貯金額"),
        h("strong", { "data-testid": "total-savings" }, yen.format(stats.total)),
        h("div", { className: "last-month-pill" }, h("span", null, `今月 ${yen.format(stats.monthly)}`)),
      ),
      h(
        "div",
        { className: "avatar-wrap" },
        h("img", { className: "mascot-image", src: asset("mascot-trimmed.png"), alt: "成長するアバター" }),
        h("small", { "data-testid": "growth-level" }, `Lv. ${stats.level}`),
      ),
    ),
    h(
      "section",
      { className: "month-panel growth-panel" },
      h("div", null, h("span", null, "成長"), h("strong", null, `${stats.progress}%`), h("p", null, `次の成長まで ${yen.format(Math.max(0, stats.nextLevel - stats.total))}`)),
      h("div", { className: "ring-progress", style: { "--progress": `${stats.progress}%` } }, h("b", null, `${stats.count}回`)),
    ),
    h("button", { className: "primary-button home-add-button", type: "button", onClick: () => setActiveTab("add"), "data-testid": "nav-add-primary" }, "誤差を記録する"),
    h(
      "section",
      { className: "quick-actions", "aria-label": "クイック記録" },
      categories.slice(0, 3).map((item) =>
        h(
          "button",
          { className: "quick-action", key: item.key, type: "button", onClick: () => startQuickRecord(item) },
          h("img", { className: "asset-icon", src: item.icon, alt: "" }),
          h("span", null, item.label),
          h("b", null, yen.format(item.amount)),
        ),
      ),
    ),
    h("section", { className: "section-heading history-heading" }, h("h2", null, "最近の誤差"), h("button", { className: "text-button", type: "button", onClick: () => setActiveTab("stats") }, "成長を見る")),
    h(
      "div",
      { className: "history-list" },
      records.slice(0, 5).map((record) => h(HistoryItem, { key: record.id, record })),
    ),
  );
}

function HistoryItem({ record }) {
  const meta = categoryByKey(record.category);
  return h(
    "article",
    { className: `history-item history-item-${record.category}` },
    h("div", { className: "history-icon" }, h("img", { className: "asset-icon", src: meta.icon, alt: "" })),
    h("div", { className: "history-body" }, h("p", { className: "history-note" }, record.memo), h("span", { className: "history-date" }, `${record.date}・${meta.label}`)),
    h("strong", { className: "history-amount" }, `+${yen.format(record.amount)}`),
  );
}

function AddScreen({ active, amount, category, date, memo, saveRecord, setAmount, setCategory, setDate, setMemo }) {
  return h(
    "section",
    { className: `screen add-screen ${active ? "is-active" : ""}`, "data-testid": "screen-add" },
    h("p", { className: "add-lead" }, "使わなかったお金を、未来の自分のために残そう。"),
    h(
      "section",
      { className: "input-panel" },
      h("label", { className: "amount-field" }, h("span", null, "使わなかった金額"), h("div", null, h("small", null, "¥"), h("input", { "data-testid": "amount-input", type: "number", min: "1", inputMode: "numeric", placeholder: "0", value: amount, onInput: (event) => setAmount(event.target.value) }))),
      h("label", { className: "date-field" }, h("span", null, "日付"), h("input", { "data-testid": "date-input", type: "date", value: date, onInput: (event) => setDate(event.target.value) })),
      h("label", { className: "memo-field" }, h("span", null, "メモ"), h("textarea", { "data-testid": "memo-input", rows: "4", placeholder: "例：タクシーを使わず歩いた", value: memo, onInput: (event) => setMemo(event.target.value) })),
    ),
    h("p", { className: "category-title" }, "カテゴリ"),
    h(
      "div",
      { className: "chips category-chips" },
      categories.map((item) =>
        h(
          "button",
          { className: `category-chip ${category === item.key ? "is-selected" : ""}`, key: item.key, type: "button", onClick: () => setCategory(item.key), "data-testid": `category-${item.key}` },
          h("img", { className: "asset-icon", src: item.icon, alt: "" }),
          h("span", null, item.label),
        ),
      ),
    ),
    h("button", { className: "primary-button save-button", type: "button", onClick: saveRecord, "data-testid": "save-record" }, "記録する"),
  );
}

function StatsScreen({ active, records, stats }) {
  const monthRows = Object.entries(stats.monthTotals).sort(([a], [b]) => a.localeCompare(b));
  const max = Math.max(...monthRows.map(([, value]) => value), 1);
  return h(
    "section",
    { className: `screen stats-screen ${active ? "is-active" : ""}`, "data-testid": "screen-stats" },
    h("section", { className: "stats-summary" }, h("div", { className: "stats-card" }, h("span", null, "合計貯金額"), h("strong", null, yen.format(stats.total))), h("div", { className: "stats-card" }, h("span", null, "成長レベル"), h("strong", null, `Lv. ${stats.level}`), h("small", null, `${records.length}回記録`))),
    h(
      "section",
      { className: "chart-panel" },
      h("div", { className: "section-heading" }, h("h2", null, "月ごとの貯金額"), h("span", { className: "muted" }, "ローカル保存")),
      h(
        "div",
        { className: "bar-chart" },
        monthRows.map(([month, value]) => h("div", { className: "bar", key: month }, h("span", { className: "bar-value" }, value.toLocaleString("ja-JP")), h("div", { className: "bar-track" }, h("div", { className: "bar-fill", style: { height: `${Math.max(12, Math.round((value / max) * 100))}%` } })), h("span", { className: "bar-label" }, month.slice(5) + "月"))),
      ),
    ),
    h("section", { className: "encourage-card" }, h("div", null, h("h3", null, "成長しています"), h("p", null, "小さな誤差の積み重ねが、ちゃんと貯金額になっています。")), h("img", { src: asset("mascot-trimmed.png"), alt: "" })),
  );
}

function BottomNav({ activeTab, setActiveTab }) {
  const items = [
    { key: "home", label: "ホーム", testId: "nav-home", path: "M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3V10.5Z" },
    { key: "add", label: "記録", testId: "nav-add", path: "M12 5v14M5 12h14" },
    { key: "stats", label: "成長", testId: "nav-stats", path: "M4 19V5M4 19h16M8 16v-5M12 16V8M16 16v-9" },
  ];
  return h(
    "nav",
    { className: "bottom-nav", "aria-label": "メインナビゲーション" },
    items.map((item) =>
      h("button", { className: `nav-button ${activeTab === item.key ? "is-active" : ""}`, key: item.key, type: "button", onClick: () => setActiveTab(item.key), "data-testid": item.testId }, Icon({ path: item.path }), h("span", null, item.label)),
    ),
  );
}

export default App;
