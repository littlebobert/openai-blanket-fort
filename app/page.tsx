"use client";

import { useMemo, useState } from "react";

type Demo = "wheel" | "slots" | "bracket";

const demoCopy: Record<
  Demo,
  {
    tab: string;
    author: string;
    prompt: string;
    reply?: string;
    title: string;
    subtitle: string;
    icon: string;
    after: string;
  }
> = {
  wheel: {
    tab: "dinner wheel",
    author: "Alec",
    prompt: "@fort make us a wheel to pick dinner for next month’s visit",
    reply: "everyone adds 2 spots. derek gets 1",
    title: "DinnerWheel",
    subtitle: "built for this chat · tap to open",
    icon: "🎡",
    after: "wings is a cuisine",
  },
  slots: {
    tab: "game night",
    author: "Justin",
    prompt: "@fort find us a game night. 4 cities, 4 time zones, good luck",
    title: "SlotGrid",
    subtitle: "3 of 4 have voted · tap to open",
    icon: "🗓️",
    after: "if it picks 5am my time again I’m suing the fort",
  },
  bracket: {
    tab: "bracket",
    author: "Derek",
    prompt: "@fort march madness pool. loser buys the group jerseys",
    title: "BracketBowl",
    subtitle: "make your picks · tap to open",
    icon: "🏀",
    after: "jersey budget says pick with your heart derek",
  },
};

const wheelItems = ["thai", "sushi", "bibimbap", "ramen", "tacos", "pizza", "wings"];
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

function DinnerWheel() {
  const [rotation, setRotation] = useState(0);
  const [winner, setWinner] = useState<string | null>(null);
  const [spinning, setSpinning] = useState(false);

  function spin() {
    if (spinning) return;
    setSpinning(true);
    setWinner(null);
    const next = wheelItems[Math.floor(Math.random() * wheelItems.length)];
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
          {wheelItems.map((item, index) => (
            <span
              className="wheel-label"
              key={item}
              style={{ transform: `rotate(${index * (360 / wheelItems.length)}deg)` }}
            >
              {item}
            </span>
          ))}
        </div>
        <span className="wheel-hub">🍜</span>
      </div>
      <button className="primary-action" onClick={spin} disabled={spinning}>
        {spinning ? "spinning…" : winner ? "spin again" : "spin"}
      </button>
      <p className="app-result" aria-live="polite">
        {winner ? (
          <>
            <strong>{winner}</strong>
            {winner === "wings" ? "Derek. Of course." : "The fort has spoken."}
          </>
        ) : (
          "Winner buys nothing. Loser is Derek, probably."
        )}
      </p>
    </div>
  );
}

function SlotGrid() {
  const [mine, setMine] = useState(() =>
    Array.from({ length: 3 }, () => Array.from({ length: 4 }, () => false)),
  );
  const days = ["Thu", "Fri", "Sat", "Sun"];
  const times = ["7 pm", "9 pm", "11 pm"];
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
        {days.map((day) => (
          <b key={day}>{day}</b>
        ))}
        {times.map((time, row) => (
          <div className="slot-row" key={time}>
            <span>{time}</span>
            {days.map((day, column) => {
              const count = slotSeed[row][column] + (mine[row][column] ? 1 : 0);
              return (
                <button
                  className={best.row === row && best.column === column ? "best-slot" : ""}
                  data-count={count}
                  key={day}
                  onClick={() => toggle(row, column)}
                  aria-label={`${day} ${time}, ${count} of 4 free`}
                >
                  {count}/4
                </button>
              );
            })}
          </div>
        ))}
      </div>
      <p className="app-result">
        <strong>
          {days[best.column]} {times[best.row]}
        </strong>
        {best.count === 4 ? "all 4 free — invite ready." : `${best.count}/4 free — tap your slots.`}
      </p>
    </div>
  );
}

function Bracket() {
  const [semis, setSemis] = useState<(string | null)[]>([null, null]);
  const [champion, setChampion] = useState<string | null>(null);
  const pairs = [
    ["UConn", "Gonzaga"],
    ["Houston", "Duke"],
  ];

  return (
    <div className="mini-app-body bracket-body">
      <p className="round-label">semifinals · tap your picks</p>
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
      <p className="round-label">championship</p>
      <div className="team-pair">
        {semis.map((team, index) => (
          <button
            key={index}
            disabled={!team}
            className={champion === team ? "picked" : ""}
            onClick={() => setChampion(team)}
          >
            {team ?? `winner ${index + 1}`}
          </button>
        ))}
      </div>
      <p className="app-result">
        {champion ? (
          <>
            <strong>🏆 {champion}</strong>your picks are live in the chat.
          </>
        ) : (
          "Picks lock at tipoff."
        )}
      </p>
    </div>
  );
}

function PhoneDemo() {
  const [demo, setDemo] = useState<Demo>("wheel");
  const [open, setOpen] = useState(false);
  const copy = demoCopy[demo];

  return (
    <div className="demo-column">
      <div className="demo-tabs" role="tablist" aria-label="Example group apps">
        {(Object.keys(demoCopy) as Demo[]).map((key) => (
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
            {demoCopy[key].tab}
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
            <span className="sender right">{copy.author}</span>
            <p className="bubble mine">{copy.prompt}</p>
            {copy.reply && <p className="bubble mine compact">{copy.reply}</p>}
            <span className="sender">Blanket Fort</span>
            <p className="bubble fort">
              On it. Hermes is handing this to the <strong>tiny-app builder</strong>.
            </p>
            <button className="app-link" onClick={() => setOpen(true)}>
              <span>{copy.icon}</span>
              <span>
                <strong>{copy.title} is up in the fort</strong>
                <small>{copy.subtitle}</small>
              </span>
              <b>›</b>
            </button>
            <span className="tap-note">tap the app card ↑</span>
            <span className="sender right">{demo === "wheel" ? "Derek" : "Seb"}</span>
            <p className="bubble mine compact">{copy.after}</p>
          </div>

          <div className={`mini-app ${open ? "open" : ""}`} aria-hidden={!open}>
            <div className="mini-app-header">
              <div>
                <strong>{copy.title}</strong>
                <span>
                  {demo === "wheel"
                    ? "7 spots · Derek capped at 1"
                    : demo === "slots"
                      ? "times shown in your zone"
                      : "loser buys jerseys"}
                </span>
              </div>
              <button onClick={() => setOpen(false)} aria-label={`Close ${copy.title}`}>
                ×
              </button>
            </div>
            {demo === "wheel" ? <DinnerWheel /> : demo === "slots" ? <SlotGrid /> : <Bracket />}
            <small className="built-by">built by @fort · powered by Hermes Agent</small>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <main>
      <StringLights />
      <nav className="nav">
        <a className="wordmark" href="#top" aria-label="Blanket Fort home">
          Blanket <span>Fort</span>
        </a>
        <a className="nav-link" href="#how">
          how it works
        </a>
      </nav>

      <section className="hero" id="top">
        <div className="hero-copy">
          <span className="eyebrow">Robotz Rules Game Studio presents</span>
          <h1>
            Your group chat
            <br />
            <em>builds apps.</em>
          </h1>
          <p>
            Add <strong>@fort</strong> to the chat. The group riffs on an idea; Hermes turns it
            into a tiny shared app and drops the link back into the thread.
          </p>
          <div className="hero-actions">
            <a className="cta" href="#demo">
              try the working demo <span>↓</span>
            </a>
            <span className="status-pill">
              <i /> 3-hour hackathon build
            </span>
          </div>
          <div className="powered">
            <span>Agent runtime</span>
            <a href="https://hermes-agent.org" target="_blank" rel="noreferrer">
              Hermes Agent ↗
            </a>
          </div>
        </div>
        <div className="fort-mark" aria-hidden="true">
          <span className="roof roof-left" />
          <span className="roof roof-right" />
          <span className="door">BF</span>
          <small>no adults allowed</small>
        </div>
      </section>

      <section className="demo-section" id="demo">
        <div className="section-intro">
          <span className="eyebrow">The pitch, in one tap</span>
          <h2>It starts as a joke.<br />It ends as a link.</h2>
          <p>The phone works. Choose a group idea, open the app card, and use what the fort built.</p>
        </div>
        <PhoneDemo />
      </section>

      <section className="how-section" id="how">
        <div className="section-intro">
          <span className="eyebrow">How the hackathon MVP works</span>
          <h2>One small loop.<br />That’s the whole magic trick.</h2>
          <p>
            Hermes supplies the multi-platform gateway, memory, terminal, and skills. Blanket
            Fort supplies the opinionated builder skill and the cozy group experience.
          </p>
        </div>
        <div className="flow">
          <article>
            <span>01</span>
            <div className="flow-icon">💬</div>
            <h3>Group asks</h3>
            <p>A message tags @fort in Telegram or Discord.</p>
          </article>
          <article>
            <span>02</span>
            <div className="flow-icon">⚙️</div>
            <h3>Hermes routes</h3>
            <p>The gateway hands context to the tiny-app builder skill.</p>
          </article>
          <article>
            <span>03</span>
            <div className="flow-icon">✦</div>
            <h3>Fort builds</h3>
            <p>A safe template is filled, published, and given a short URL.</p>
          </article>
          <article>
            <span>04</span>
            <div className="flow-icon">🔗</div>
            <h3>Link returns</h3>
            <p>Everyone uses the same app, right from the thread.</p>
          </article>
        </div>
        <div className="scope-card">
          <div>
            <span className="eyebrow">Build this today</span>
            <h3>Ship one believable vertical slice.</h3>
          </div>
          <ul>
            <li><b>0:00–0:35</b> Hermes gateway + one chat channel</li>
            <li><b>0:35–1:35</b> one dinner-wheel builder skill</li>
            <li><b>1:35–2:20</b> publish link + message reply</li>
            <li><b>2:20–3:00</b> rehearse, record fallback, polish</li>
          </ul>
        </div>
      </section>

      <section className="why-section">
        <p>Most AI app builders start with a blank prompt box.</p>
        <h2>Blanket Fort starts with<br /><em>your friends.</em></h2>
        <a className="cta" href="#demo">climb into the fort ↑</a>
      </section>

      <footer>
        <StringLights />
        <div>
          <span className="wordmark">Blanket <b>Fort</b></span>
          <p>a Robotz Rules Game Studio hackathon project · powered by Hermes Agent</p>
        </div>
      </footer>
    </main>
  );
}
