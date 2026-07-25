"use client";

import { useMemo, useState } from "react";

type BuildingKind = "cottage" | "lantern" | "tree";
type Placed = { id: number; kind: BuildingKind; cell: number };

const BUILDINGS: Record<BuildingKind, { name: string; cost: number; light: number; icon: string }> = {
  cottage: { name: "Wayfarer Cottage", cost: 28, light: 9, icon: "⌂" },
  lantern: { name: "Dawn Lantern", cost: 12, light: 14, icon: "✦" },
  tree: { name: "Glowbloom Tree", cost: 18, light: 7, icon: "♠" },
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
  }

  function gather() {
    setEmber((value) => value + 16);
    setToast("Your keepers gathered 16 ember.");
  }

  return (
    <main className="game-shell">
      <div className="sky-grain" />
      <header className="topbar">
        <div className="brand">
          <span className="brand-mark">✦</span>
          <div><h1>Last Light</h1><p>A kingdom at the edge of night</p></div>
        </div>
        <div className="resources">
          <div><span className="resource-icon ember-icon">◆</span><b>{ember}</b><small>EMBER</small></div>
          <div><span className="resource-icon light-icon">✦</span><b>{light}</b><small>LIGHT</small></div>
          <button className="sound" onClick={() => setSound(!sound)} aria-label="Toggle ambience">{sound ? "◕" : "○"}</button>
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
          <button className="gather" onClick={gather}><span>Gather ember</span><b>+16 ◆</b></button>
        </aside>

        <div className="world-wrap" aria-label="Isometric building grid">
          <div className="moon" />
          <div className="world">
            <div className="light-aura" style={{ opacity: Math.min(.82, .35 + light / 220) }} />
            <div className="campfire"><span>♨</span><i /><i /><i /></div>
            <div className="grid">
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
                    {building && <span className={`building ${building.kind}`}><i className="building-glow" /><b>{BUILDINGS[building.kind].icon}</b></span>}
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
                <button key={kind} className={selected === kind ? "active" : ""} onClick={() => { setSelected(kind); setToast(`Select a glowing tile for the ${item.name}.`); }}>
                  <span className={`miniature ${kind}`}>{item.icon}</span>
                  <span><b>{item.name}</b><small>{kind === "cottage" ? "Shelter for two keepers" : kind === "lantern" ? "Reveals distant ground" : "Grows ember over time"}</small></span>
                  <em>{item.cost} ◆</em>
                </button>
              );
            })}
          </div>
          <p className="tip"><span>✦</span> Lanterns cast the widest glow. Chain them toward the sleeping ruins.</p>
        </aside>
      </section>

      <footer><span>Click a glowing tile to build</span><i>◆</i><span>Gather ember to keep expanding</span></footer>
    </main>
  );
}
