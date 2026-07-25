"use client";

import { useMemo, useState, type CSSProperties } from "react";

type BuildingKind = "cottage" | "lantern" | "tree";
type Placed = { id: number; kind: BuildingKind; cell: number };

const BUILDINGS: Record<BuildingKind, { name: string; cost: number; light: number; sprite: string; detail: string }> = {
  cottage: { name: "Wayfarer Cottage", cost: 28, light: 9, sprite: "/assets/cottage-sprite.png", detail: "Shelter for two keepers" },
  lantern: { name: "Dawn Lantern", cost: 12, light: 14, sprite: "/assets/lantern-sprite.png", detail: "Reveals distant ground" },
  tree: { name: "Glowbloom Tree", cost: 18, light: 7, sprite: "/assets/glowtree-sprite.png", detail: "A living beacon" },
};

const GRID = Array.from({ length: 81 }, (_, i) => i);
const START_CELLS = new Set([30, 31, 32, 38, 39, 40, 41, 42, 48, 49, 50]);
const INITIAL: Placed[] = [
  { id: 1, kind: "cottage", cell: 40 },
  { id: 2, kind: "lantern", cell: 43 },
  { id: 3, kind: "tree", cell: 21 },
];

function iso(cell: number) {
  const row = Math.floor(cell / 9);
  const col = cell % 9;
  return { x: 380 + (col - row) * 32, y: 78 + (col + row) * 16, depth: row + col };
}

export default function Home() {
  const [intro, setIntro] = useState(true);
  const [selected, setSelected] = useState<BuildingKind>("cottage");
  const [placed, setPlaced] = useState<Placed[]>(INITIAL);
  const [ember, setEmber] = useState(78);
  const [toast, setToast] = useState("The first flame is awake.");
  const [tutorial, setTutorial] = useState(0);
  const [tutorialOpen, setTutorialOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sound, setSound] = useState(true);
  const [music, setMusic] = useState(true);
  const [particles, setParticles] = useState(true);
  const [motion, setMotion] = useState(true);

  const light = 18 + placed.reduce((sum, item) => sum + BUILDINGS[item.kind].light, 0);
  const occupied = useMemo(() => new Map(placed.map((item) => [item.cell, item])), [placed]);
  const litCells = useMemo(() => {
    const set = new Set(START_CELLS);
    placed.forEach(({ cell, kind }) => {
      const radius = kind === "lantern" ? 3 : 2;
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

  const guide = [
    { label: "Welcome, Lightkeeper", title: "Restore the forgotten vale", body: "Warm light reveals the land. Build outward, give your keepers shelter, and bring this sleeping world back to life.", action: "Begin the first lesson" },
    { label: "Lesson one", title: "Gather ember", body: "Ember is the warmth every structure needs. Gather a fresh bundle from the left panel.", action: "Use Gather ember" },
    { label: "Lesson two", title: "Choose a Dawn Lantern", body: "Lanterns push the veil back farther than anything else. Choose one in the build book.", action: "Select the lantern" },
    { label: "Lesson three", title: "Extend the light", body: "Glowing diamonds are safe to build on. Place the lantern on an empty one near the edge.", action: "Place on a glowing tile" },
    { label: "The path is yours", title: "The vale is listening", body: "Chain lanterns into the mist, add homes, and plant living beacons. Every light makes the kingdom feel more alive.", action: "Enter the vale" },
  ];

  function startGame() {
    setIntro(false);
    setTutorial(0);
    setTutorialOpen(true);
  }

  function place(cell: number) {
    const item = BUILDINGS[selected];
    if (!litCells.has(cell)) return setToast("That ground is still hidden by the veil.");
    if (occupied.has(cell)) return setToast("That patch already holds something.");
    if (ember < item.cost) return setToast(`You need ${item.cost - ember} more ember.`);
    setPlaced((current) => [...current, { id: Date.now(), kind: selected, cell }]);
    setEmber((value) => value - item.cost);
    setToast(`${item.name} placed. New ground is waking.`);
    if (tutorial === 3 && selected === "lantern") setTutorial(4);
  }

  function gather() {
    setEmber((value) => value + 16);
    setToast("Your keepers gathered 16 ember.");
    if (tutorial === 1) setTutorial(2);
  }

  function resetVillage() {
    setPlaced(INITIAL);
    setEmber(78);
    setSelected("cottage");
    setSettingsOpen(false);
    setTutorial(0);
    setTutorialOpen(true);
    setToast("The vale has returned to its first light.");
  }

  function replayTutorial() {
    setSettingsOpen(false);
    setTutorial(0);
    setTutorialOpen(true);
  }

  return (
    <main className={`game-shell ${particles ? "" : "particles-off"} ${motion ? "" : "motion-off"}`}>
      <div className="sky-grain" />
      <div className="cloud cloud-one" /><div className="cloud cloud-two" />

      <header className="topbar">
        <div className="brand"><span className="brand-mark">✦</span><div><h1>Last Light</h1><p>A kingdom at the edge of night</p></div></div>
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
          <p>Build within the glow. Each new light returns color, movement, and memory to the world.</p>
          <div className="quest"><span>Current calling</span><b>Raise six structures</b><div className="progress"><i style={{ width: `${Math.min(100, placed.length / 6 * 100)}%` }} /></div><small>{Math.min(placed.length, 6)} / 6 awakened</small></div>
          <button className={`gather ${tutorialOpen && tutorial === 1 ? "tutorial-target" : ""}`} onClick={gather}><span>Gather ember</span><b>+16 ◆</b></button>
        </aside>

        <div className="world-wrap">
          <div className="moon" />
          <div className="world" aria-label="Isometric building area">
            <div className="terrain-shadow" />
            <div className="light-aura" />
            <div className="tile-layer">
              {GRID.map((cell) => {
                const p = iso(cell);
                const lit = litCells.has(cell);
                return <button key={cell} className={`iso-tile ${lit ? "lit" : "veiled"} ${occupied.has(cell) ? "occupied" : ""} ${tutorialOpen && tutorial === 3 && lit && !occupied.has(cell) ? "tutorial-tile" : ""}`} style={{ left: p.x, top: p.y, zIndex: p.depth } as CSSProperties} onClick={() => place(cell)} aria-label={occupied.has(cell) ? BUILDINGS[occupied.get(cell)!.kind].name : `Place ${BUILDINGS[selected].name}`} />;
              })}
            </div>
            <div className="object-layer">
              {placed.map((building) => {
                const p = iso(building.cell);
                return <div key={building.id} className={`world-object ${building.kind}`} style={{ left: p.x + 32, top: p.y + 18, zIndex: 100 + p.depth } as CSSProperties}><i /><img src={BUILDINGS[building.kind].sprite} alt={BUILDINGS[building.kind].name} /></div>;
              })}
              {[48, 41, 33].map((cell, index) => {
                const p = iso(cell);
                return <img key={cell} className={`world-keeper keeper-${index + 1}`} src="/assets/keeper-sprite.png" alt="" style={{ left: p.x + 32, top: p.y + 18, zIndex: 110 + p.depth } as CSSProperties} />;
              })}
              <div className="campfire" style={{ left: iso(49).x + 32, top: iso(49).y + 15, zIndex: 120 }}>♨<i /><i /><i /></div>
            </div>
            {Array.from({ length: 20 }).map((_, i) => <i key={i} className="firefly" style={{ "--x": `${10 + (i * 41) % 80}%`, "--y": `${18 + (i * 29) % 66}%`, "--d": `${2 + i % 5}s` } as CSSProperties} />)}
          </div>
          <div className="hint">{toast}</div>
        </div>

        <aside className="build-card">
          <span className="eyebrow">BUILD BOOK</span><h3>What shall glow?</h3>
          <div className="build-list">
            {(Object.keys(BUILDINGS) as BuildingKind[]).map((kind) => {
              const item = BUILDINGS[kind];
              return <button key={kind} className={`${selected === kind ? "active" : ""} ${tutorialOpen && tutorial === 2 && kind === "lantern" ? "tutorial-target" : ""}`} onClick={() => { setSelected(kind); setToast(`Choose a glowing diamond for the ${item.name}.`); if (tutorial === 2 && kind === "lantern") setTutorial(3); }}><span className={`miniature ${kind}`}><img src={item.sprite} alt="" /></span><span><b>{item.name}</b><small>{item.detail}</small></span><em>{item.cost} ◆</em></button>;
            })}
          </div>
          <p className="tip"><span>✦</span> Objects stand upright, occupy one plot, and sort naturally with the land.</p>
        </aside>
      </section>

      {tutorialOpen && !intro && <section className="tutorial" aria-live="polite"><div className="tutorial-flame">✦</div><div className="tutorial-copy"><span>{guide[tutorial].label} · {tutorial + 1} of 5</span><h4>{guide[tutorial].title}</h4><p>{guide[tutorial].body}</p></div><div className="tutorial-progress">{[0,1,2,3,4].map((step) => <i key={step} className={step <= tutorial ? "done" : ""} />)}{tutorial === 0 ? <button onClick={() => setTutorial(1)}>Begin lesson</button> : tutorial === 4 ? <button onClick={() => setTutorialOpen(false)}>Enter the vale</button> : <b>{guide[tutorial].action}</b>}</div><button className="tutorial-close" onClick={() => setTutorialOpen(false)}>Skip</button></section>}

      {settingsOpen && <div className="settings-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) setSettingsOpen(false); }}><section className="settings-panel" role="dialog" aria-modal="true" aria-labelledby="settings-title"><button className="settings-close" onClick={() => setSettingsOpen(false)}>×</button><span className="eyebrow">THE KEEPER&apos;S BOOK</span><h3 id="settings-title">Settings</h3><p className="settings-intro">Shape the vale to suit the way you play.</p><div className="settings-group"><h4>Sound & atmosphere</h4><Setting label="World ambience" detail="Wind, fire, birds, and village sounds" value={sound} toggle={() => setSound(!sound)} /><Setting label="Music" detail="Soft orchestral score" value={music} toggle={() => setMusic(!music)} /><Setting label="Ambient particles" detail="Fireflies, embers, mist, and clouds" value={particles} toggle={() => setParticles(!particles)} /><Setting label="World motion" detail="Villagers, wildlife, and vegetation" value={motion} toggle={() => setMotion(!motion)} /></div><div className="settings-group"><h4>Guidance</h4><button className="settings-action" onClick={replayTutorial}><span>✦</span><div><b>Replay guided tutorial</b><small>Return to the first lesson</small></div><em>Replay</em></button></div><div className="settings-footer"><button className="reset-action" onClick={resetVillage}>Reset village</button><button className="done-action" onClick={() => setSettingsOpen(false)}>Return to the vale</button></div></section></div>}

      {intro && <section className="intro-screen"><div className="intro-vignette" /><div className="intro-building"><img src="/assets/cottage-sprite.png" alt="" /><i /></div><div className="intro-copy"><span className="intro-rune">✦</span><p>THE LAST HAVEN AWAITS</p><h2>Last<br /><i>Light</i></h2><blockquote>“Where one flame endures,<br />a kingdom may remember.”</blockquote><button onClick={startGame}>New village <b>→</b></button><button className="intro-settings" onClick={() => setSettingsOpen(true)}>Settings</button></div><div className="intro-footer"><span>A painterly kingdom builder</span><i>◆</i><span>Bring the world back to light</span></div></section>}

      <footer><span>Choose a structure</span><i>◆</i><span>Build on glowing diamonds</span></footer>
    </main>
  );
}

function Setting({ label, detail, value, toggle }: { label: string; detail: string; value: boolean; toggle: () => void }) {
  return <button className="setting-row" onClick={toggle}><span><b>{label}</b><small>{detail}</small></span><i className={value ? "on" : ""}>{value ? "On" : "Off"}</i></button>;
}
