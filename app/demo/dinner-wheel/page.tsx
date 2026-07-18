"use client";

import { useEffect, useMemo, useState } from "react";

type Locale = "en" | "ja";

const options = [
  { en: "Sushi", ja: "寿司", emoji: "🍣" },
  { en: "Ramen", ja: "ラーメン", emoji: "🍜" },
  { en: "Thai", ja: "タイ料理", emoji: "🌶️" },
  { en: "Korean", ja: "韓国料理", emoji: "🥘" },
  { en: "Pizza", ja: "ピザ", emoji: "🍕" },
  { en: "Tacos", ja: "タコス", emoji: "🌮" },
] as const;

const messages = {
  en: {
    back: "Back to Blanket Fort",
    eyebrow: "Judge-ready mini app",
    title: "DinnerWheel",
    intro: "Vote for tonight’s cuisine, then let the fort decide.",
    name: "Your name",
    placeholder: "e.g. Justin",
    vote: "Cast vote",
    votes: "Group votes",
    spin: "Spin the wheel",
    spinning: "The fort is deciding…",
    result: "Tonight’s pick",
    empty: "Add at least one vote before spinning.",
    local: "Standalone demo · votes are saved on this device",
  },
  ja: {
    back: "毛布の秘密基地に戻る",
    eyebrow: "審査用ミニアプリ",
    title: "夕食ルーレット",
    intro: "今夜の料理に投票して、最後はFortに決めてもらおう。",
    name: "あなたの名前",
    placeholder: "例：Justin",
    vote: "投票する",
    votes: "みんなの投票",
    spin: "ルーレットを回す",
    spinning: "Fortが決めています…",
    result: "今夜の料理",
    empty: "まず1票以上投票してください。",
    local: "スタンドアロンデモ · 投票はこの端末に保存されます",
  },
} as const;

type Vote = { name: string; option: number };

export default function DinnerWheelDemo() {
  const [locale, setLocale] = useState<Locale>("en");
  const [name, setName] = useState("");
  const [choice, setChoice] = useState(0);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);
  const t = messages[locale];

  useEffect(() => {
    const savedLocale = localStorage.getItem("blanket-fort-locale");
    setLocale(
      savedLocale === "ja" || savedLocale === "en"
        ? savedLocale
        : navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en",
    );
    try {
      const savedVotes = JSON.parse(localStorage.getItem("blanket-fort-dinner-votes") || "[]");
      if (Array.isArray(savedVotes)) setVotes(savedVotes);
    } catch {
      setVotes([]);
    }
  }, []);

  const totals = useMemo(
    () => options.map((_, index) => votes.filter((vote) => vote.option === index).length),
    [votes],
  );

  function switchLocale(next: Locale) {
    setLocale(next);
    localStorage.setItem("blanket-fort-locale", next);
  }

  function addVote() {
    const voter = name.trim() || (locale === "ja" ? "ゲスト" : "Guest");
    const next = [...votes.filter((vote) => vote.name !== voter), { name: voter, option: choice }];
    setVotes(next);
    localStorage.setItem("blanket-fort-dinner-votes", JSON.stringify(next));
  }

  function spin() {
    if (!votes.length || spinning) return;
    setWinner(null);
    setSpinning(true);
    const pickedVote = votes[Math.floor(Math.random() * votes.length)];
    const target = pickedVote.option;
    setRotation((current) => current + 1440 + (360 - target * 60));
    window.setTimeout(() => {
      setWinner(target);
      setSpinning(false);
    }, 1600);
  }

  return (
    <main className="judge-app">
      <nav className="judge-nav">
        <a href="/">← {t.back}</a>
        <div className="language-switcher" role="group" aria-label="Language / 言語">
          <button className={locale === "ja" ? "active" : ""} onClick={() => switchLocale("ja")}>日本語</button>
          <span>/</span>
          <button className={locale === "en" ? "active" : ""} onClick={() => switchLocale("en")}>EN</button>
        </div>
      </nav>

      <section className="judge-shell">
        <header className="judge-heading">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>{t.title}</h1>
          <p>{t.intro}</p>
        </header>

        <div className="judge-grid">
          <section className="vote-card">
            <label htmlFor="voter-name">{t.name}</label>
            <input
              id="voter-name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder={t.placeholder}
            />
            <div className="cuisine-grid">
              {options.map((option, index) => (
                <button
                  key={option.en}
                  className={choice === index ? "selected" : ""}
                  onClick={() => setChoice(index)}
                >
                  <span>{option.emoji}</span>
                  {option[locale]}
                </button>
              ))}
            </div>
            <button className="cta judge-vote" onClick={addVote}>{t.vote}</button>
          </section>

          <section className="wheel-card">
            <div className="demo-wheel-wrap">
              <span className="demo-wheel-pointer" />
              <div className="demo-wheel" style={{ transform: `rotate(${rotation}deg)` }}>
                {options.map((option, index) => (
                  <span key={option.en} style={{ transform: `rotate(${index * 60}deg)` }}>
                    {option.emoji}
                  </span>
                ))}
              </div>
            </div>
            <button className="cta" onClick={spin} disabled={!votes.length || spinning}>
              {spinning ? t.spinning : t.spin}
            </button>
            <p className="judge-result" aria-live="polite">
              {winner === null
                ? (!votes.length ? t.empty : `${votes.length} ${t.votes.toLowerCase()}`)
                : <><small>{t.result}</small><strong>{options[winner].emoji} {options[winner][locale]}</strong></>}
            </p>
          </section>
        </div>

        <section className="totals-card">
          <h2>{t.votes}</h2>
          <div>
            {options.map((option, index) => (
              <span key={option.en}>
                {option.emoji} {option[locale]} <b>{totals[index]}</b>
              </span>
            ))}
          </div>
        </section>
        <p className="judge-note">{t.local}</p>
      </section>
    </main>
  );
}
