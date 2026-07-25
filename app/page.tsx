"use client";

import { useMemo, useState } from "react";

type BuildingKind = "cottage" | "lantern" | "tree";
type Placed = { id: number; kind: BuildingKind; cell: number };

const BUILDINGS: Record<BuildingKind, { name: string; cost: number; light: number; icon: string }> = {
  cottage: { name: "Wayfarer Cottage", cost: 28, light: 9, icon: "⌂" },
  lantern: { name: "Dawn Lantern", cost: 12, light: 14, icon: "✦" },
  tree: { name: "Glowbloom Tree", cost: 18, light: 7, icon: "♠" },
};
const SPRITES: Record<BuildingKind, string> = {
  cottage: "/assets/cottage-sprite.png",
  lantern: "/assets/lantern-sprite.png",
  tree: "/assets/glowtree-sprite.png",
};

const GRID = Array.from({ length: 81 }, (_, i) => i);
const START_CELLS = new Set([31, 32, 39, 40, 41, 47, 48, 49]);

export default function Home() {
  const [selected, setSelected] = useState<BuildingKind>("cottage");
  const [placed, setPlaced] = useState<Placed[]>([
    { id: 1, kind: "cottage", cell: 40 },
    { id: 2, kind: "lantern", cell: 39 },
    { id: 3, kind: "tree", cell: 31 },
  ]);
  const [ember, setEmber] = useState(78);
  const [toast, setToast] = useState("The first flame is awake.");
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [particles, setParticles] = useState(true);
  const [motion, setMotion] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [tutorial, setTutorial] = useState(0);
  const [tutorialOpen, setTutorialOpen] = useState(true);

  const light = 18 + placed.reduce((sum, item) => sum + BUILDINGS[item.kind].light, 0);
  const occupied = useMemo(() => new Map(placed.map((item) => [item.cell, item])), [placed]);
  const litCells = useMemo(() => {
    const set = new Set(START_CELLS);
    placed.forEach(({ cell, kind }) => {
      const radius = kind === "lantern" ? 2 : 1;
      const row = Math.floor(cell / 9);
      const col = cell % 9;
      GRID.forEach((candidate) => {
        const r = Math.floor(candidate / 9);
        const c = candidate % 9;
        if (Math.abs(r - row) + Math.abs(c - col) <= radius) set.add(candidate);
      });
    });
    return set;
  }, [placed]);

  function place(cell: number) {
    const item = BUILDINGS[selected];
    if (!litCells.has(cell)) {
      setToast("The veil is too thick here. Place a lantern closer.");
      return;
    }
    if (occupied.has(cell)) {
      setToast("Something already grows in this patch.");
      return;
    }
    if (ember < item.cost) {
      setToast(`You need ${item.cost - ember} more ember.`);
      return;
    }
    setPlaced((current) => [...current, { id: Date.now(), kind: selected, cell }]);
    setEmber((value) => value - item.cost);
    setToast(`${item.name} placed. The dark recedes.`);
    if (tutorial === 2 && selected === "lantern") setTutorial(3);
  }

  function gather() {
    setEmber((value) => value + 16);
    setToast("Your keepers gathered 16 ember.");
    if (tutorial === 0) setTutorial(1);
  }

  function restartTutorial() {
    setTutorial(0);
    setTutorialOpen(true);
    setSettingsOpen(false);
    setToast("Follow the golden guide to awaken the vale.");
  }

  function resetVillage() {
    setPlaced([
      { id: 1, kind: "cottage", cell: 40 },
      { id: 2, kind: "lantern", cell: 39 },
      { id: 3, kind: "tree", cell: 31 },
    ]);
    setEmber(78);
    setSelected("cottage");
    setTutorial(0);
    setTutorialOpen(true);
    setSettingsOpen(false);
    setToast("The vale has returned to its first morning.");
  }

  const tutorialCopy = [
    { label: "First spark", title: "Gather ember", body: "Your keepers need warm ember to build. Use the button in the left panel.", action: "Gather ember to continue" },
    { label: "Carry the flame", title: "Choose a Dawn Lantern", body: "Lanterns reveal more ground than any other structure. Select one from the build panel.", action: "Select the lantern" },
    { label: "Push back the veil", title: "Place your lantern", body: "Choose any glowing, empty patch. The lantern will reveal new land around it.", action: "Place on a glowing tile" },
    { label: "The vale remembers", title: "You know the old craft", body: "Gather, build, and chain lanterns toward the sleeping edges. The rest is yours to discover.", action: "Begin building" },
  ];

  return (
    <main className={`game-shell ${particles ? "" : "particles-off"} ${motion ? "" : "motion-off"}`}>
      <div className="sky-grain" />
      <div className="cloud cloud-one" />
      <div className="cloud cloud-two" />
      <div className="bird-flock" aria-hidden="true"><i>⌁</i><i>⌁</i><i>⌁</i></div>
      <div className="foreground-reeds reeds-left" aria-hidden="true">{Array.from({ length: 9 }).map((_, i) => <i key={i} />)}</div>
      <div className="foreground-reeds reeds-right" aria-hidden="true">{Array.from({ length: 7 }).map((_, i) => <i key={i} />)}</div>
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <div><h1>Last Light</h1><p>A kingdom at the edge of night</p></div>
        </div>
        <div className="resources">
          <div><span className="resource-icon ember-icon">◆</span><b>{ember}</b><small>EMBER</small></div>
          <div><span className="resource-icon light-icon">✦</span><b>{light}</b><small>LIGHT</small></div>
          <button className="sound" onClick={() => setSound(!sound)} aria-label="Toggle ambience">{sound ? "◕" : "○"}</button>
          <button className="settings-button" onClick={() => setSettingsOpen(true)} aria-label="Open settings"><span>⚙</span><small>SETTINGS</small></button>
        </div>
      </header>

      <section className="play-area">
        <aside className="story-card">
          <span className="eyebrow">CHAPTER I</span>
          <h2>Kindle the<br /><i>forgotten vale</i></h2>
          <p>Build within the glow. Each new light peels back the veil and returns color to the world.</p>
          <div className="quest">
            <span>Current calling</span>
            <b>Raise three lights</b>
            <div className="progress"><i style={{ width: `${Math.min(100, (placed.length / 6) * 100)}%` }} /></div>
            <small>{Math.min(placed.length, 6)} / 6 structures awakened</small>
          </div>
          <button className={`gather ${tutorialOpen && tutorial === 0 ? "tutorial-target" : ""}`} onClick={gather}><span>Gather ember</span><b>+16 ◆</b></button>
        </aside>

        <div className="world-wrap" aria-label="Isometric building grid">
          <div className="moon" />
          <div className="world">
            <div className="mist-ring mist-one" />
            <div className="mist-ring mist-two" />
            <div className="light-aura" style={{ opacity: Math.min(.82, .35 + light / 220) }} />
            <div className="campfire"><span>♨</span><i /><i /><i /></div>
            <img className="keeper keeper-one" src="/assets/keeper-sprite.png" alt="" />
            <img className="keeper keeper-two" src="/assets/keeper-sprite.png" alt="" />
            <img className="keeper keeper-three" src="/assets/keeper-sprite.png" alt="" />
            <div className="spirit-fox"><span>◆</span><i /></div>
            <div className={`grid ${tutorialOpen && tutorial === 2 ? "tutorial-target-grid" : ""}`}>
              {GRID.map((cell) => {
                const building = occupied.get(cell);
                const lit = litCells.has(cell);
                return (
                  <button
                    key={cell}
                    className={`tile ${lit ? "lit" : "veiled"} ${building ? "occupied" : ""}`}
                    onClick={() => place(cell)}
                    aria-label={building ? BUILDINGS[building.kind].name : `Place ${BUILDINGS[selected].name}`}
                  >
                    <span className="ground-detail" />
                    {building && <span className={`building ${building.kind}`}><i className="building-glow" /><img src={SPRITES[building.kind]} alt={BUILDINGS[building.kind].name} /></span>}
                  </button>
                );
              })}
            </div>
            {Array.from({ length: 18 }).map((_, i) => <i key={i} className="firefly" style={{ "--x": `${(i * 37) % 96}%`, "--y": `${(i * 61) % 88}%`, "--d": `${2 + (i % 5)}s` } as React.CSSProperties} />)}
          </div>
          <div className="hint">{toast}</div>
        </div>

        <aside className="build-card">
          <span className="eyebrow">BUILD</span>
          <h3>What shall glow?</h3>
          <div className="build-list">
            {(Object.keys(BUILDINGS) as BuildingKind[]).map((kind) => {
              const item = BUILDINGS[kind];
              return (
                <button key={kind} className={`${selected === kind ? "active" : ""} ${tutorialOpen && tutorial === 1 && kind === "lantern" ? "tutorial-target" : ""}`} onClick={() => { setSelected(kind); setToast(`Select a glowing tile for the ${item.name}.`); if (tutorial === 1 && kind === "lantern") setTutorial(2); }}>
                  <span className={`miniature ${kind}`}><img src={SPRITES[kind]} alt="" /></span>
                  <span><b>{item.name}</b><small>{kind === "cottage" ? "Shelter for two keepers" : kind === "lantern" ? "Reveals distant ground" : "Grows ember over time"}</small></span>
                  <em>{item.cost} ◆</em>
                </button>
              );
            })}
          </div>
          <p className="tip"><span>✦</span> Lanterns cast the widest glow. Chain them toward the sleeping ruins.</p>
        </aside>
      </section>

      {tutorialOpen && (
        <section className={`tutorial ${tutorial === 3 ? "complete" : ""}`} aria-live="polite">
          <div className="tutorial-flame">✦</div>
          <div className="tutorial-copy">
            <span>{tutorialCopy[tutorial].label} · {tutorial + 1} of 4</span>
            <h4>{tutorialCopy[tutorial].title}</h4>
            <p>{tutorialCopy[tutorial].body}</p>
          </div>
          <div className="tutorial-progress">
            {[0, 1, 2, 3].map((step) => <i key={step} className={step <= tutorial ? "done" : ""} />)}
            {tutorial === 3 ? (
              <button onClick={() => setTutorialOpen(false)}>Enter the vale</button>
            ) : (
              <b>{tutorialCopy[tutorial].action}</b>
            )}
          </div>
          <button className="tutorial-close" onClick={() => setTutorialOpen(false)} aria-label="Skip tutorial">Skip</button>
        </section>
      )}

      {settingsOpen && (
        <div className="settings-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
          <section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title">
            <button className="settings-close" onClick={() => setSettingsOpen(false)} aria-label="Close settings">×</button>
            <span className="eyebrow">THE KEEPER&apos;S BOOK</span>
            <h3 id="settings-title">Settings</h3>
            <p className="settings-intro">Shape the vale to suit the way you play.</p>
            <div className="settings-group">
              <h4>Sound & atmosphere</h4>
              <button className="setting-row" onClick={() => setSound(!sound)}><span><b>World ambience</b><small>Wind, fire, birds, and village sounds</small></span><i className={sound ? "on" : ""}>{sound ? "On" : "Off"}</i></button>
              <button className="setting-row" onClick={() => setMusic(!music)}><span><b>Music</b><small>Soft orchestral score</small></span><i className={music ? "on" : ""}>{music ? "On" : "Off"}</i></button>
              <button className="setting-row" onClick={() => setParticles(!particles)}><span><b>Ambient particles</b><small>Fireflies, embers, mist, and drifting clouds</small></span><i className={particles ? "on" : ""}>{particles ? "On" : "Off"}</i></button>
              <button className="setting-row" onClick={() => setMotion(!motion)}><span><b>World motion</b><small>Villagers, trees, wildlife, and vegetation</small></span><i className={motion ? "on" : ""}>{motion ? "On" : "Off"}</i></button>
            </div>
            <div className="settings-group">
              <h4>Guidance</h4>
              <button className="settings-action" onClick={restartTutorial}><span>✦</span><div><b>Replay guided tutorial</b><small>Walk through gathering, choosing, and placing again</small></div><em>Replay</em></button>
            </div>
            <div className="settings-footer">
              <button className="reset-action" onClick={resetVillage}>Reset village</button>
              <button className="done-action" onClick={() => setSettingsOpen(false)}>Return to the vale</button>
            </div>
          </section>
        </div>
      )}

      <footer><span>Click a glowing tile to build</span><i>◆</i><span>Gather ember to keep expanding</span></footer>
    </main>
  );
}
