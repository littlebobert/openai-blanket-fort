"use client";

import { useEffect, useMemo, useState } from "react";

type Demo = "wheel" | "slots" | "bracket";
type Locale = "en" | "ja";

const copy = {
  en: {
    brandLead: "Blanket",
    brandAccent: "Fort",
    brandFull: "Blanket Fort",
    navHow: "how it works",
    navApps: "live apps",
    language: "Language",
    eyebrow: "Robotz Rules Game Studio presents",
    heroLine1: "Your group chat",
    heroLine2: "builds apps.",
    heroBody: (
      <>
        Add <strong>@fort</strong> to the chat. The group riffs on an idea; Hermes turns it
        into a tiny shared app and drops the link back into the thread.
      </>
    ),
    tryDemo: "try an example app built this way",
    exploreDemo: "explore the product",
    hackathon: "3-hour hackathon build",
    runtime: "Agent runtime",
    noAdults: "no adults allowed",
    pitchEyebrow: "The pitch, in one tap",
    pitchTitle: <>It starts as a joke.<br />It ends as a link.</>,
    pitchBody: "The phone works. Choose a group idea, open the app card, and use what the fort built.",
    howEyebrow: "How the hackathon MVP works",
    howTitle: <>One small loop.<br />That’s the whole magic trick.</>,
    howBody:
      "Hermes supplies the multi-platform gateway, memory, terminal, and skills. Blanket Fort supplies the opinionated builder skill and the cozy group experience.",
    steps: [
      ["Group asks", "A message tags @fort in Telegram or Discord."],
      ["Hermes routes", "The gateway hands context to the tiny-app builder skill."],
      ["Fort builds", "A safe template is filled, published, and given a short URL."],
      ["Link returns", "Everyone uses the same app, right from the thread."],
    ],
    buildToday: "Build this today",
    shipSlice: "Ship one believable vertical slice.",
    scope: [
      ["0:00–0:35", "Hermes gateway + one chat channel"],
      ["0:35–1:35", "one dinner-wheel builder skill"],
      ["1:35–2:20", "publish link + message reply"],
      ["2:20–3:00", "rehearse, record fallback, polish"],
    ],
    whyLead: "Most AI app builders start with a blank prompt box.",
    whyTitle: <>Blanket Fort starts with<br /><em>your friends.</em></>,
    climb: "climb into the fort",
    footer: "a Robotz Rules Game Studio hackathon project · powered by Hermes Agent",
    demoTabsLabel: "Example group apps",
    builderReply: <>On it. Hermes is handing this to the <strong>tiny-app builder</strong>.</>,
    tapCard: "tap the app card ↑",
    appReady: "is up in the fort",
    builtBy: "built by @fort · powered by Hermes Agent",
    close: "Close",
    demos: {
      wheel: {
        tab: "dinner wheel",
        author: "Alec",
        prompt: "@fort make us a wheel to pick dinner for next month’s visit",
        reply: "everyone adds 2 spots. derek gets 1",
        title: "DinnerWheel",
        subtitle: "built for this chat · tap to open",
        icon: "🎡",
        after: "wings is a cuisine",
        detail: "7 spots · Derek capped at 1",
      },
      slots: {
        tab: "game night",
        author: "Justin",
        prompt: "@fort find us a game night. 4 cities, 4 time zones, good luck",
        title: "SlotGrid",
        subtitle: "3 of 4 have voted · tap to open",
        icon: "🗓️",
        after: "if it picks 5am my time again I’m suing the fort",
        detail: "times shown in your zone",
      },
      bracket: {
        tab: "bracket",
        author: "Derek",
        prompt: "@fort march madness pool. loser buys the group jerseys",
        title: "BracketBowl",
        subtitle: "make your picks · tap to open",
        icon: "🏀",
        after: "jersey budget says pick with your heart derek",
        detail: "loser buys jerseys",
      },
    },
    wheel: {
      items: ["thai", "sushi", "bibimbap", "ramen", "tacos", "pizza", "wings"],
      spinning: "spinning…",
      again: "spin again",
      spin: "spin",
      wings: "Derek. Of course.",
      spoken: "The fort has spoken.",
      empty: "Winner buys nothing. Loser is Derek, probably.",
    },
    slots: {
      days: ["Thu", "Fri", "Sat", "Sun"],
      times: ["7 pm", "9 pm", "11 pm"],
      freeLabel: "free",
      allFree: "all 4 free — invite ready.",
      tap: "free — tap your slots.",
    },
    bracket: {
      semifinals: "semifinals · tap your picks",
      championship: "championship",
      winner: "winner",
      live: "your picks are live in the chat.",
      lock: "Picks lock at tipoff.",
    },
  },
  ja: {
    brandLead: "毛布の",
    brandAccent: "秘密基地",
    brandFull: "毛布の秘密基地",
    navHow: "仕組み",
    navApps: "公開アプリ",
    language: "言語",
    eyebrow: "Robotz Rules Game Studio presents",
    heroLine1: "グループチャットが",
    heroLine2: "アプリをつくる。",
    heroBody: (
      <>
        チャットに<strong>@fort</strong>を追加。みんなのアイデアやノリをHermesが小さな共有アプリにして、リンクをスレッドへ届けます。
      </>
    ),
    tryDemo: "この方法で作ったアプリを試す",
    exploreDemo: "プロダクトを見る",
    hackathon: "3時間ハッカソン作品",
    runtime: "エージェント基盤",
    noAdults: "大人は立入禁止",
    pitchEyebrow: "ワンタップでわかる体験",
    pitchTitle: <>冗談から始まり、<br />リンクになって届く。</>,
    pitchBody: "実際に動きます。グループのアイデアを選び、アプリカードを開いて、Fortがつくったものを試してください。",
    howEyebrow: "ハッカソンMVPの仕組み",
    howTitle: <>小さなループがひとつ。<br />魔法はそれだけ。</>,
    howBody:
      "Hermesがマルチプラットフォームのゲートウェイ、記憶、ターミナル、スキルを提供。毛布の秘密基地がグループ向けのビルダー体験を加えます。",
    steps: [
      ["グループが頼む", "TelegramやDiscordで@fortをメンションします。"],
      ["Hermesがつなぐ", "会話の文脈をミニアプリ・ビルダーへ渡します。"],
      ["Fortがつくる", "安全なテンプレートを仕上げ、公開URLを発行します。"],
      ["リンクが届く", "チャットのみんなが同じアプリをすぐ使えます。"],
    ],
    buildToday: "今日つくるもの",
    shipSlice: "信じられる一つの体験を完成させる。",
    scope: [
      ["0:00–0:35", "Hermesゲートウェイ＋チャット接続"],
      ["0:35–1:35", "夕食ルーレットのビルダースキル"],
      ["1:35–2:20", "リンク公開＋チャットへ返信"],
      ["2:20–3:00", "デモ練習、予備録画、仕上げ"],
    ],
    whyLead: "多くのAIアプリビルダーは、空のプロンプト欄から始まります。",
    whyTitle: <>毛布の秘密基地は<br /><em>友だちから始まる。</em></>,
    climb: "Fortに入ってみる",
    footer: "Robotz Rules Game Studioのハッカソンプロジェクト · powered by Hermes Agent",
    demoTabsLabel: "グループアプリの例",
    builderReply: <>了解。Hermesが<strong>ミニアプリ・ビルダー</strong>に渡しています。</>,
    tapCard: "アプリカードをタップ ↑",
    appReady: "ができました",
    builtBy: "@fortが作成 · powered by Hermes Agent",
    close: "閉じる",
    demos: {
      wheel: {
        tab: "夕食ルーレット",
        author: "Alec",
        prompt: "@fort 来月みんなで会う日の夕食を決めるルーレットを作って",
        reply: "一人2候補。Derekだけ1候補ね",
        title: "DinnerWheel",
        subtitle: "このチャット用に完成 · タップして開く",
        icon: "🎡",
        after: "手羽先も料理ジャンルです",
        detail: "7候補 · Derekは1つまで",
      },
      slots: {
        tab: "ゲームナイト",
        author: "Justin",
        prompt: "@fort 4都市・4タイムゾーンでゲームナイトの時間を見つけて",
        title: "SlotGrid",
        subtitle: "4人中3人が回答済み · タップして開く",
        icon: "🗓️",
        after: "また朝5時になったらFortを訴える",
        detail: "あなたの時間帯で表示",
      },
      bracket: {
        tab: "トーナメント",
        author: "Derek",
        prompt: "@fort バスケの勝ち上がり予想。最下位が全員のユニフォーム代",
        title: "BracketBowl",
        subtitle: "予想を選ぶ · タップして開く",
        icon: "🏀",
        after: "予算よりハートで選べ、Derek",
        detail: "最下位がユニフォーム代",
      },
    },
    wheel: {
      items: ["タイ料理", "寿司", "ビビンバ", "ラーメン", "タコス", "ピザ", "手羽先"],
      spinning: "回転中…",
      again: "もう一度",
      spin: "回す",
      wings: "やっぱりDerek。",
      spoken: "Fortのお告げです。",
      empty: "勝者のおごりはなし。たぶん敗者はDerek。",
    },
    slots: {
      days: ["木", "金", "土", "日"],
      times: ["19時", "21時", "23時"],
      freeLabel: "参加可能",
      allFree: "4人全員OK — 招待できます。",
      tap: "人OK — 空いている枠をタップ。",
    },
    bracket: {
      semifinals: "準決勝 · 勝つチームをタップ",
      championship: "決勝",
      winner: "勝者",
      live: "予想をチャットに反映しました。",
      lock: "試合開始で締め切ります。",
    },
  },
} as const;

const slotSeed = [
  [1, 2, 1, 2],
  [2, 3, 1, 2],
  [1, 2, 2, 0],
];

function StringLights() {
  return (
    <div className="lights" aria-hidden="true">
      {Array.from({ length: 9 }).map((_, index) => (
        <span className={`light light-${index % 3}`} key={index} />
      ))}
    </div>
  );
}

function DinnerWheel({ locale }: { locale: Locale }) {
  const t = copy[locale].wheel;
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<number | null>(null);
  const [spinning, setSpinning] = useState(false);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);
    const next = Math.floor(Math.random() * t.items.length);
    setRotation((value) => value + 1440 + Math.floor(Math.random() * 280));
    window.setTimeout(() => {
      setWinner(next);
      setSpinning(false);
    }, 1300);
  }

  return (
    <div className="mini-app-body">
      <div className="wheel-wrap">
        <span className="wheel-pointer" />
        <div className="wheel" style={{ transform: `rotate(${rotation}deg)` }}>
          {t.items.map((item, index) => (
            <span
              className="wheel-label"
              key={item}
              style={{ transform: `rotate(${index * (360 / t.items.length)}deg)` }}
            >
              {item}
            </span>
          ))}
        </div>
        <span className="wheel-hub">🍜</span>
      </div>
      <button className="primary-action" onClick={spin} disabled={spinning}>
        {spinning ? t.spinning : winner !== null ? t.again : t.spin}
      </button>
      <p className="app-result" aria-live="polite">
        {winner !== null ? (
          <>
            <strong>{t.items[winner]}</strong>
            {winner === t.items.length - 1 ? t.wings : t.spoken}
          </>
        ) : (
          t.empty
        )}
      </p>
    </div>
  );
}

function SlotGrid({ locale }: { locale: Locale }) {
  const t = copy[locale].slots;
  const [mine, setMine] = useState(() =>
    Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => false)),
  );
  const best = useMemo(() => {
    let current = { count: -1, row: 0, column: 0 };
    slotSeed.forEach((row, rowIndex) =>
      row.forEach((count, columnIndex) => {
        const total = count + (mine[rowIndex][columnIndex] ? 1 : 0);
        if (total > current.count) current = { count: total, row: rowIndex, column: columnIndex };
      }),
    );
    return current;
  }, [mine]);

  function toggle(row: number, column: number) {
    setMine((value) =>
      value.map((line, rowIndex) =>
        line.map((cell, columnIndex) =>
          rowIndex === row && columnIndex === column ? !cell : cell,
        ),
      ),
    );
  }

  return (
    <div className="mini-app-body slot-body">
      <div className="slot-grid">
        <span />
        {t.days.map((day) => <b key={day}>{day}</b>)}
        {t.times.map((time, row) => (
          <div className="slot-row" key={time}>
            <span>{time}</span>
            {t.days.map((day, column) => {
              const count = slotSeed[row][column] + (mine[row][column] ? 1 : 0);
              return (
                <button
                  className={best.row === row && best.column === column ? "best-slot" : ""}
                  data-count={count}
                  key={day}
                  onClick={() => toggle(row, column)}
                  aria-label={`${day} ${time}, ${count}/4 ${t.freeLabel}`}
                >
                  {count}/4
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <p className="app-result">
        <strong>{t.days[best.column]} {t.times[best.row]}</strong>
        {best.count === 4 ? t.allFree : `${best.count}/4 ${t.tap}`}
      </p>
    </div>
  );
}

function Bracket({ locale }: { locale: Locale }) {
  const t = copy[locale].bracket;
  const [semis, setSemis] = useState<(string | null)[]>([null, null]);
  const [champion, setChampion] = useState<string | null>(null);
  const pairs = [["UConn", "Gonzaga"], ["Houston", "Duke"]];

  return (
    <div className="mini-app-body bracket-body">
      <p className="round-label">{t.semifinals}</p>
      {pairs.map((pair, index) => (
        <div className="team-pair" key={pair[0]}>
          {pair.map((team) => (
            <button
              className={semis[index] === team ? "picked" : ""}
              key={team}
              onClick={() => {
                setSemis((value) => value.map((item, i) => (i === index ? team : item)));
                setChampion(null);
              }}
            >
              {team}
            </button>
          ))}
        </div>
      ))}
      <p className="round-label">{t.championship}</p>
      <div className="team-pair">
        {semis.map((team, index) => (
          <button
            key={index}
            disabled={!team}
            className={champion === team ? "picked" : ""}
            onClick={() => setChampion(team)}
          >
            {team ?? `${t.winner} ${index + 1}`}
          </button>
        ))}
      </div>
      <p className="app-result">
        {champion ? <><strong>🏆 {champion}</strong>{t.live}</> : t.lock}
      </p>
    </div>
  );
}

function PhoneDemo({ locale }: { locale: Locale }) {
  const t = copy[locale];
  const [demo, setDemo] = useState<Demo>("wheel");
  const [open, setOpen] = useState(false);
  const demoCopy = t.demos[demo];

  return (
    <div className="demo-column">
      <div className="demo-tabs" role="tablist" aria-label={t.demoTabsLabel}>
        {(Object.keys(t.demos) as Demo[]).map((key) => (
          <button
            key={key}
            role="tab"
            aria-selected={demo === key}
            className={demo === key ? "active" : ""}
            onClick={() => {
              setDemo(key);
              setOpen(false);
            }}
          >
            {t.demos[key].tab}
          </button>
        ))}
      </div>
      <div className="phone">
        <span className="notch" />
        <div className="screen">
          <div className="chat-header">
            <span className="chat-avatar">RR</span>
            <div>
              <strong>Robotz Rules</strong>
              <span>Alec, Seb, Derek, Justin, Fort</span>
            </div>
          </div>
          <div className="thread">
            <span className="sender right">{demoCopy.author}</span>
            <p className="bubble mine">{demoCopy.prompt}</p>
            {"reply" in demoCopy && demoCopy.reply && (
              <p className="bubble mine compact">{demoCopy.reply}</p>
            )}
            <span className="sender">{t.brandFull}</span>
            <p className="bubble fort">{t.builderReply}</p>
            <button className="app-link" onClick={() => setOpen(true)}>
              <span>{demoCopy.icon}</span>
              <span>
                <strong>{demoCopy.title} {t.appReady}</strong>
                <small>{demoCopy.subtitle}</small>
              </span>
              <b>›</b>
            </button>
            <span className="tap-note">{t.tapCard}</span>
            <span className="sender right">{demo === "wheel" ? "Derek" : "Seb"}</span>
            <p className="bubble mine compact">{demoCopy.after}</p>
          </div>

          <div className={`mini-app ${open ? "open" : ""}`} aria-hidden={!open}>
            <div className="mini-app-header">
              <div>
                <strong>{demoCopy.title}</strong>
                <span>{demoCopy.detail}</span>
              </div>
              <button onClick={() => setOpen(false)} aria-label={`${t.close} ${demoCopy.title}`}>
                ×
              </button>
            </div>
            {demo === "wheel" ? (
              <DinnerWheel locale={locale} />
            ) : demo === "slots" ? (
              <SlotGrid locale={locale} />
            ) : (
              <Bracket locale={locale} />
            )}
            <small className="built-by">{t.builtBy}</small>
          </div>
        </div>
      </div>
    </div>
  );
}

function LanguageSwitcher({
  locale,
  setLocale,
}: {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}) {
  return (
    <div className="language-switcher" role="group" aria-label={copy[locale].language}>
      <button
        className={locale === "ja" ? "active" : ""}
        aria-pressed={locale === "ja"}
        onClick={() => setLocale("ja")}
        lang="ja"
      >
        日本語
      </button>
      <span aria-hidden="true">/</span>
      <button
        className={locale === "en" ? "active" : ""}
        aria-pressed={locale === "en"}
        onClick={() => setLocale("en")}
        lang="en"
      >
        EN
      </button>
    </div>
  );
}

export default function Home() {
  const [locale, setLocaleState] = useState<Locale>("en");
  const t = copy[locale];

  useEffect(() => {
    const saved = window.localStorage.getItem("blanket-fort-locale");
    const deviceLocale: Locale = navigator.language.toLowerCase().startsWith("ja") ? "ja" : "en";
    setLocaleState(saved === "ja" || saved === "en" ? saved : deviceLocale);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  function setLocale(next: Locale) {
    setLocaleState(next);
    window.localStorage.setItem("blanket-fort-locale", next);
  }

  return (
    <main>
      <StringLights />
      <nav className="nav">
        <a className="wordmark" href="#top" aria-label={`${t.brandFull} home`}>
          {t.brandLead} <span>{t.brandAccent}</span>
        </a>
        <div className="nav-actions">
          <a className="nav-link" href="#how">{t.navHow}</a>
          <a
            className="nav-link"
            href="https://kaycee-soundable-unappeasingly.ngrok-free.dev/"
            target="_blank"
            rel="noreferrer"
          >
            {t.navApps} ↗
          </a>
          <LanguageSwitcher locale={locale} setLocale={setLocale} />
        </div>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">{t.eyebrow}</span>
          <h1>
            {t.heroLine1}
            <br />
            <em>{t.heroLine2}</em>
          </h1>
          <p>{t.heroBody}</p>
          <div className="hero-actions">
            <a className="cta" href="/demo/dinner-wheel">{t.tryDemo} <span>→</span></a>
            <a className="text-cta" href="#demo">{t.exploreDemo} <span>↓</span></a>
            <span className="status-pill"><i /> {t.hackathon}</span>
          </div>
          <div className="powered">
            <span>{t.runtime}</span>
            <a href="https://hermes-agent.org" target="_blank" rel="noreferrer">
              Hermes Agent ↗
            </a>
          </div>
        </div>
        <div className="fort-mark" aria-hidden="true">
          <span className="roof roof-left" />
          <span className="roof roof-right" />
          <span className="door">BF</span>
          <small>{t.noAdults}</small>
        </div>
      </section>

      <section className="demo-section" id="demo">
        <div className="section-intro">
          <span className="eyebrow">{t.pitchEyebrow}</span>
          <h2>{t.pitchTitle}</h2>
          <p>{t.pitchBody}</p>
        </div>
        <PhoneDemo locale={locale} />
      </section>

      <section className="how-section" id="how">
        <div className="section-intro">
          <span className="eyebrow">{t.howEyebrow}</span>
          <h2>{t.howTitle}</h2>
          <p>{t.howBody}</p>
        </div>
        <div className="flow">
          {t.steps.map(([title, description], index) => (
            <article key={title}>
              <span>0{index + 1}</span>
              <div className="flow-icon">{["💬", "⚙️", "✦", "🔗"][index]}</div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
        <div className="scope-card">
          <div>
            <span className="eyebrow">{t.buildToday}</span>
            <h3>{t.shipSlice}</h3>
          </div>
          <ul>
            {t.scope.map(([time, description]) => (
              <li key={time}><b>{time}</b> {description}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="why-section">
        <p>{t.whyLead}</p>
        <h2>{t.whyTitle}</h2>
        <a className="cta" href="#demo">{t.climb} ↑</a>
      </section>

      <footer>
        <StringLights />
        <div>
          <span className="wordmark">{t.brandLead} <b>{t.brandAccent}</b></span>
          <p>{t.footer}</p>
        </div>
      </footer>
    </main>
  );
}
