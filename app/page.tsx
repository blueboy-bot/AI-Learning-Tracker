"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { calculateStreak, getDatesInCurrentMonth, getElapsedSeconds, getLocalDateString, parseStoredJson } from "../lib/learning-utils.mjs";

type Entry = { id: string; date: string; topic: string; category: string; minutes: number; progress: number; note: string; projectUrl?: string; tomorrowPlan?: string };
const today = () => getLocalDateString();
const formatDuration = (minutes: number, zh: boolean, seconds = 0) => {
  const wholeMinutes = Math.floor(minutes);
  const hours = Math.floor(wholeMinutes / 60);
  const remaining = wholeMinutes % 60;
  const base = hours ? (zh ? `${hours} 小时${remaining ? ` ${remaining} 分钟` : ""}` : `${hours}h${remaining ? ` ${remaining}m` : ""}`) : (zh ? `${remaining} 分钟` : `${remaining} min`);
  return seconds ? `${base} ${String(seconds).padStart(2, "0")} ${zh ? "秒" : "sec"}` : base;
};
const coursePlan = [
  ["00", "课程设置与开发环境", "Course setup"], ["01", "AI 简介与发展史", "Introduction & history of AI"], ["02", "知识表示与专家系统", "Knowledge representation"],
  ["03", "感知机", "Perceptron"], ["04", "多层感知机", "Multi-layer perceptron"], ["05", "深度学习框架与过拟合", "Frameworks & overfitting"],
  ["06", "计算机视觉与 OpenCV", "Computer vision & OpenCV"], ["07", "卷积神经网络", "Convolutional neural networks"], ["08", "迁移学习", "Transfer learning"], ["09", "自编码器与 VAE", "Autoencoders & VAEs"], ["10", "GAN 与风格迁移", "GANs & style transfer"], ["11", "目标检测", "Object detection"], ["12", "语义分割", "Semantic segmentation"],
  ["13", "文本表示：BoW / TF-IDF", "Text representation"], ["14", "词嵌入：Word2Vec / GloVe", "Word embeddings"], ["15", "语言模型", "Language modeling"], ["16", "循环神经网络", "Recurrent neural networks"], ["17", "生成式循环网络", "Generative RNNs"], ["18", "Transformers 与 BERT", "Transformers & BERT"], ["19", "命名实体识别", "Named entity recognition"], ["20", "大语言模型与提示工程", "LLMs & prompt programming"],
  ["21", "遗传算法", "Genetic algorithms"], ["22", "深度强化学习", "Deep reinforcement learning"], ["23", "多智能体系统", "Multi-agent systems"], ["24", "AI 伦理与负责任 AI", "AI ethics"], ["25", "多模态网络、CLIP 与 VQGAN", "Multimodal networks"],
] as const;
const lessonLink = (id: string, zh: boolean) => {
  const folder = Number(id) <= 1 ? "1-Intro" : Number(id) === 2 ? "2-Symbolic" : Number(id) <= 5 ? "3-NeuralNetworks" : Number(id) <= 12 ? "4-ComputerVision" : Number(id) <= 20 ? "5-NLP" : Number(id) <= 23 ? "6-Other" : Number(id) === 24 ? "7-Ethics" : "8-Extras";
  const languagePath = zh ? "translations/zh-CN/lessons" : "lessons";
  return `https://github.com/blueboy-bot/AI-For-Beginners/tree/main/${languagePath}/${folder}`;
};

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<string[]>([]);
  const [planOpen, setPlanOpen] = useState(false);
  const [goal, setGoal] = useState(120);
  const [lang, setLang] = useState<"zh" | "en">("zh");
  const [isBooting, setIsBooting] = useState(true);
  const [timerState, setTimerState] = useState<"idle" | "studying" | "choosing" | "resting">("idle");
  const [sessionSeconds, setSessionSeconds] = useState(0);
  const [runStartedAt, setRunStartedAt] = useState<number | null>(null);
  const [clock, setClock] = useState(() => Date.now());
  const [selectedDate, setSelectedDate] = useState(today());
  const zh = lang === "zh";

  useEffect(() => {
    const restore = window.setTimeout(() => {
      const saved = parseStoredJson(localStorage.getItem("ai-learning-tracker-entries"), []);
      const savedGoal = localStorage.getItem("ai-learning-tracker-goal");
      const savedTimer = parseStoredJson(localStorage.getItem("ai-learning-tracker-timer"), null);
      const savedPlan = parseStoredJson(localStorage.getItem("ai-learning-tracker-course-plan"), []);
      if (Array.isArray(saved)) setEntries(saved.filter((entry): entry is Entry => Boolean(entry) && typeof entry === "object" && typeof entry.date === "string" && typeof entry.minutes === "number"));
      const parsedGoal = Number(savedGoal);
      if (Number.isFinite(parsedGoal) && parsedGoal >= 10) setGoal(parsedGoal);
      if (Array.isArray(savedPlan) && savedPlan.every((lesson) => typeof lesson === "string")) setCompletedLessons(savedPlan);
      if (savedTimer) {
        const timer = savedTimer as { state?: "idle" | "studying" | "choosing" | "resting"; seconds?: number; updatedAt?: number };
        const isValidTimer = ["idle", "studying", "choosing", "resting"].includes(timer.state ?? "") && Number.isFinite(timer.seconds) && Number.isFinite(timer.updatedAt);
        if (isValidTimer) {
          const elapsed = timer.state === "studying" ? Math.max(0, Math.floor((Date.now() - (timer.updatedAt as number)) / 1000)) : 0;
          setSessionSeconds((timer.seconds as number) + elapsed);
          setTimerState(timer.state as "idle" | "studying" | "choosing" | "resting");
          if (timer.state === "studying") setRunStartedAt(Date.now());
        }
      }
      setLoaded(true);
    }, 0);
    const timer = window.setTimeout(() => setIsBooting(false), 900);
    return () => { window.clearTimeout(restore); window.clearTimeout(timer); };
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem("ai-learning-tracker-entries", JSON.stringify(entries)); }, [entries, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem("ai-learning-tracker-goal", String(goal)); }, [goal, loaded]);
  useEffect(() => {
    if (loaded) localStorage.setItem("ai-learning-tracker-timer", JSON.stringify({ state: runStartedAt ? "studying" : timerState, seconds: sessionSeconds, updatedAt: runStartedAt ?? Date.now() }));
  }, [timerState, sessionSeconds, runStartedAt, loaded]);
  useEffect(() => { if (loaded) localStorage.setItem("ai-learning-tracker-course-plan", JSON.stringify(completedLessons)); }, [completedLessons, loaded]);
  useEffect(() => {
    if (!runStartedAt) return;
    const interval = window.setInterval(() => setClock(Date.now()), 500);
    return () => window.clearInterval(interval);
  }, [runStartedAt]);

  const displayedSessionSeconds = getElapsedSeconds(sessionSeconds, runStartedAt, clock);
  const startSession = () => {
    const startedAt = Date.now();
    setClock(startedAt);
    setRunStartedAt(startedAt);
    setTimerState("studying");
  };
  const pauseSession = () => {
    setSessionSeconds(displayedSessionSeconds);
    setRunStartedAt(null);
    setTimerState("resting");
  };

  const loggedTodayMinutes = entries.filter((x) => x.date === today()).reduce((sum, x) => sum + x.minutes, 0);
  const todayMinutes = loggedTodayMinutes + displayedSessionSeconds / 60;
  const todayFocusLabel = formatDuration(todayMinutes, zh, displayedSessionSeconds % 60);
  const weekStart = getLocalDateString(new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate() - 6));
  const weekEntries = entries.filter((x) => x.date >= weekStart);
  const weekMinutes = weekEntries.reduce((sum, x) => sum + x.minutes, 0);
  const selectedEntries = entries.filter((x) => x.date === selectedDate);
  const selectedMinutes = selectedEntries.reduce((sum, x) => sum + x.minutes, 0);
  const streak = useMemo(() => calculateStreak(entries), [entries]);
  const categories = ["AI 应用", "模型原理", "编程基础", "软件开发", "工程实践"];
  const monthDays = useMemo(() => getDatesInCurrentMonth(), []);
  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const topic = String(form.get("topic") ?? "").trim();
    const minutes = Number(form.get("minutes"));
    const progress = Number(form.get("progress"));
    if (!topic || !Number.isFinite(minutes) || minutes <= 0 || minutes > 1440 || !Number.isFinite(progress) || progress < 0 || progress > 100) return;
    const entry: Entry = { id: crypto.randomUUID(), date: String(form.get("date")), topic, category: String(form.get("category")), minutes, progress, note: String(form.get("note")), projectUrl: String(form.get("projectUrl")), tomorrowPlan: String(form.get("tomorrowPlan")) };
    setEntries((all) => [entry, ...all]); setShowForm(false); event.currentTarget.reset();
  };
  const finishSession = () => {
    if (displayedSessionSeconds > 0) setEntries((all) => [{ id: crypto.randomUUID(), date: today(), topic: zh ? "专注学习" : "Focused learning", category: zh ? "工程实践" : "Engineering", minutes: Math.max(1, Math.round(displayedSessionSeconds / 60)), progress: 100, note: zh ? "通过专注计时器记录。" : "Logged with the focus timer." }, ...all]);
    setSessionSeconds(0); setRunStartedAt(null); setTimerState("idle");
  };
  const timerLabel = timerState === "idle" ? (zh ? "开始学习" : "Start") : timerState === "resting" ? (zh ? "继续学习" : "Resume") : timerState === "choosing" ? (zh ? "选择操作" : "Choose") : (zh ? "学习中" : "Studying");

  return <main className="shell">
    {isBooting && <div className="splash" aria-label="Loading AI Learning Tracker"><div className="splash-orbit"><span>A</span></div><div><b>AI Learning Tracker</b><p>{zh ? "正在准备你的学习空间…" : "Preparing your learning space…"}</p></div><div className="splash-line"><i /></div></div>}
    <header className="topbar"><div className="brand"><span className="brand-mark">A</span><span>AI Learning Tracker</span></div><div className="top-actions"><button className="language" onClick={() => setLang(zh ? "en" : "zh")}>{zh ? "EN" : "中文"}</button><label>{zh ? "每日目标" : "Daily goal"} <input aria-label="daily learning goal" type="number" min="10" step="10" value={goal} onChange={(e) => setGoal(Number(e.target.value))} /> {zh ? "分钟" : "min"}</label><button className="primary" onClick={() => setShowForm(true)}>+ {zh ? "记录今天" : "Log today"}</button></div></header>
    <section className="hero"><div><p className="eyebrow">{zh ? "专注 AI 编程成长" : "BUILD YOUR AI CAREER"}</p><h1>{zh ? "让每一次学习，" : "Make every study session"}<em>{zh ? "成为看得见的积累。" : " visible progress."}</em></h1><p className="sub">{zh ? "记录你的 AI、编程与软件开发实践；用连续学习和周复盘保持节奏。" : "Capture your AI, programming, and software development practice. Build momentum with streaks and weekly reviews."}</p></div><div className="hero-date"><b>{new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US", { month: "long", day: "numeric", weekday: "long" }).format(new Date())}</b><span>{zh ? "今天也向目标前进一点" : "Move one step closer today"}</span></div></section>
    <section className="course-plan panel"><div className="panel-heading"><div><p className="eyebrow">AI FOR BEGINNERS</p><h2>{zh ? "AI 初学者学习计划" : "AI for Beginners learning path"}</h2><p className="plan-sub">{zh ? `已完成 ${completedLessons.length} / ${coursePlan.length} 课` : `${completedLessons.length} / ${coursePlan.length} lessons complete`}</p></div><div className="plan-actions"><a href="https://github.com/blueboy-bot/AI-For-Beginners" target="_blank" rel="noreferrer">GitHub ↗</a><button className="folder-toggle" onClick={() => setPlanOpen((open) => !open)}>{planOpen ? (zh ? "⌃ 收起" : "⌃ Collapse") : (zh ? `⌄ 展开全部 ${coursePlan.length - 3} 课` : `⌄ Show ${coursePlan.length - 3} more`)}</button></div></div><div className="plan-progress"><i style={{ width: `${completedLessons.length / coursePlan.length * 100}%` }} /></div><div className="lesson-grid">{coursePlan.slice(0, planOpen ? coursePlan.length : 3).map(([id, cn, en]) => <div className={`lesson ${completedLessons.includes(id) ? "done" : ""}`} key={id}><span>{id}</span><a href={lessonLink(id, zh)} target="_blank" rel="noreferrer">{zh ? cn : en} ↗</a><input aria-label={`${zh ? "完成" : "Complete"} ${zh ? cn : en}`} type="checkbox" checked={completedLessons.includes(id)} onChange={() => setCompletedLessons((all) => all.includes(id) ? all.filter((lesson) => lesson !== id) : [...all, id])} /></div>)}</div></section>
    <section className="metrics">
      <Metric label={zh ? "今日专注" : "Focus today"} value={todayFocusLabel} hint={zh ? `目标 ${goal} 分钟` : `Goal ${goal} min`} progress={Math.min(100, Math.round(todayMinutes / goal * 100))} />
      <Metric label={zh ? "连续学习" : "Current streak"} value={`${streak} ${zh ? "天" : "days"}`} hint={zh ? "保持现在的节奏" : "Keep the momentum"} />
      <Metric label={zh ? "本周投入" : "This week"} value={formatDuration(weekMinutes, zh)} hint={`${weekEntries.length} ${zh ? "条学习记录" : "study logs"}`} />
      <Metric label={zh ? "已记录主题" : "Topics logged"} value={`${new Set(entries.map(x => x.topic)).size} ${zh ? "个" : "topics"}`} hint={zh ? "积累可复盘的成果" : "Build a reviewable portfolio"} />
    </section>
    <section className="content-grid"><div className="panel heatmap"><div className="panel-heading"><div><p className="eyebrow">{zh ? "学习轨迹" : "LEARNING TRAIL"}</p><h2>{new Intl.DateTimeFormat(zh ? "zh-CN" : "en-US", { year: "numeric", month: "long" }).format(new Date())}</h2></div><span className="legend"><i /> {zh ? "少" : "Less"} <i className="mid" /> <i className="high" /> {zh ? "多" : "More"}</span></div><div className="weekday-row">{(zh ? ["日", "一", "二", "三", "四", "五", "六"] : ["S", "M", "T", "W", "T", "F", "S"]).map((day, i) => <span key={`${day}-${i}`}>{day}</span>)}</div><div className="heat-cells month-cells" style={{ "--month-offset": new Date(new Date().getFullYear(), new Date().getMonth(), 1).getDay() } as React.CSSProperties}>{monthDays.map((day) => { const m = entries.filter(x => x.date === day).reduce((a, x) => a + x.minutes, 0); return <button key={day} onClick={() => setSelectedDate(day)} title={`${day}: ${m} min`} className={`heat ${day === selectedDate ? "selected" : ""} ${m >= 90 ? "strong" : m >= 45 ? "medium" : m ? "light" : ""}`}><span>{Number(day.slice(-2))}</span></button>; })}</div><div className="heat-caption"><span>{zh ? "本月 1 日" : "1st of month"}</span><span>{zh ? "今天" : "Today"}</span></div><div className="day-detail"><b>{selectedDate} · {formatDuration(selectedMinutes, zh)}</b>{selectedEntries.length ? <ul>{selectedEntries.map((entry) => <li key={entry.id}><span>{entry.topic}</span><em>{formatDuration(entry.minutes, zh)}</em></li>)}</ul> : <p>{zh ? "当天还没有学习记录。" : "No learning record for this day."}</p>}</div></div>
    <div className="panel focus"><p className="eyebrow">{zh ? "今日进度" : "TODAY'S PROGRESS"}</p><h2>{todayMinutes >= goal ? (zh ? "今天的目标已完成" : "Today's goal is complete") : (zh ? "今天，学点什么？" : "What will you learn today?")}</h2><p>{todayMinutes >= goal ? (zh ? "很好，别忘了写下今天的关键收获。" : "Nice work. Remember to capture your key takeaway.") : (zh ? `还差 ${Math.ceil(Math.max(0, goal - todayMinutes))} 分钟达到你的每日目标。` : `${Math.ceil(Math.max(0, goal - todayMinutes))} min left to reach your daily goal.`)}</p><button className="text-button" onClick={() => setShowForm(true)}>{zh ? "写下学习记录" : "Write a study log"} →</button></div></section>
    <section className="panel records"><div className="panel-heading"><div><p className="eyebrow">{zh ? "学习日志" : "STUDY LOG"}</p><h2>{zh ? "最近记录" : "Recent entries"}</h2></div>{confirmClear ? <div className="clear-confirm"><button className="cancel" onClick={() => setConfirmClear(false)}>{zh ? "取消" : "Cancel"}</button><button className="confirm-delete" onClick={() => { setEntries([]); setConfirmClear(false); }}>{zh ? "确认清空" : "Confirm clear"}</button></div> : <button className="ghost" onClick={() => setConfirmClear(true)}>{zh ? "清空记录" : "Clear all"}</button>}</div>{entries.length === 0 ? <div className="empty">{zh ? "还没有记录。点击“记录今天”，开始你的第一条学习日志。" : "No entries yet. Select Log today to create your first study log."}</div> : <div className="record-list">{entries.map((entry) => <article className="record" key={entry.id}><div className="record-date"><b>{entry.date.slice(5).replace("-", "/")}</b><span>{entry.minutes} min</span></div><div className="record-body"><div><span className="tag">{entry.category}</span><h3>{entry.topic}</h3></div><p>{entry.note || (zh ? "未添加学习笔记" : "No notes added")}</p></div><div className="record-progress"><b>{entry.progress}%</b><div><i style={{ width: `${entry.progress}%` }} /></div></div><button aria-label={`${zh ? "删除" : "Delete"} ${entry.topic}`} className="delete" onClick={() => setEntries(all => all.filter(x => x.id !== entry.id))}>×</button></article>)}</div>}</section>
    {showForm && <div className="modal-backdrop" role="presentation"><form className="entry-form" onSubmit={submit}><div className="form-heading"><div><p className="eyebrow">{zh ? "每日记录" : "DAILY LOG"}</p><h2>{zh ? "添加学习日志" : "Add study log"}</h2></div><button type="button" className="delete" onClick={() => setShowForm(false)}>×</button></div><label>{zh ? "日期" : "Date"}<input name="date" type="date" defaultValue={today()} required /></label><label>{zh ? "学习主题" : "Study topic"}<input name="topic" placeholder={zh ? "例如：实现一个 RAG 问答 Demo" : "e.g. Build a RAG Q&A demo"} required /></label><div className="form-row"><label>{zh ? "学习方向" : "Learning area"}<select name="category">{categories.map(x => <option key={x}>{x}</option>)}</select></label><label>{zh ? "专注分钟" : "Focus minutes"}<input name="minutes" type="number" min="1" defaultValue="60" required /></label><label>{zh ? "完成度" : "Progress"}<input name="progress" type="number" min="0" max="100" defaultValue="70" required /></label></div><label>{zh ? "收获与问题" : "Takeaways & blockers"}<textarea name="note" placeholder={zh ? "今天学到了什么？遇到哪些问题？" : "What did you learn? What got in the way?"} /></label><button className="primary" type="submit">{zh ? "保存记录" : "Save log"}</button></form></div>}
    <div className={`focus-timer ${timerState}`}><div className="timer-popover">{timerState === "choosing" && <><button onClick={pauseSession}>☕ {zh ? "休息一下" : "Take a break"}</button><button onClick={finishSession}>✓ {zh ? "结束并记录" : "Finish & save"}</button></>}{timerState === "resting" && <span>{zh ? "计时已暂停" : "Timer paused"}</span>}</div><button className="timer-button" aria-label={timerLabel} onClick={() => { if (timerState === "idle" || timerState === "resting") startSession(); else if (timerState === "studying") setTimerState("choosing"); }}><span>{timerState === "studying" ? "Ⅱ" : timerState === "resting" ? "▶" : "◉"}</span><b>{timerState === "studying" || timerState === "choosing" || timerState === "resting" ? `${String(Math.floor(displayedSessionSeconds / 60)).padStart(2, "0")}:${String(displayedSessionSeconds % 60).padStart(2, "0")}` : timerLabel}</b></button></div>
  </main>;
}

function Metric({ label, value, hint, progress }: { label: string; value: string; hint: string; progress?: number }) { return <article className="metric"><p>{label}</p><h2>{value}</h2>{progress !== undefined ? <><div className="bar"><i style={{ width: `${progress}%` }} /></div><span>{hint} · {progress}%</span></> : <span>{hint}</span>}</article>; }
