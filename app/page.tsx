"use client";

import { useState } from "react";
import ShelfViewer from "./ShelfViewer";

export default function Home() {
  const [showDimensions, setShowDimensions] = useState(true);
  const [resetSignal, setResetSignal] = useState(0);

  return (
    <main className="site-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">VISUALIZADOR 3D</p>
          <h1>Estantería industrial</h1>
        </div>
        <div className="dimensions" aria-label="Medidas generales">
          <span>120 cm</span><i>×</i><span>40 cm</span><i>×</i><span>190 cm</span>
        </div>
      </header>

      <section className="viewer-shell" aria-label="Vista del mueble">
        <div className="viewer-stage">
          <ShelfViewer showDimensions={showDimensions} resetSignal={resetSignal} />
          <div className="viewer-controls" aria-label="Controles del visor">
            <button
              className={showDimensions ? "active" : ""}
              type="button"
              aria-pressed={showDimensions}
              onClick={() => setShowDimensions((current) => !current)}
            >
              <span aria-hidden="true">⌖</span> Cotas
            </button>
            <button type="button" onClick={() => setResetSignal((current) => current + 1)}>
              <span aria-hidden="true">↺</span> Reset
            </button>
          </div>
          <p className="gesture-hint">Arrastrá para rotar · Rueda para zoom · Botón derecho para paneo</p>
          <div className="scale-badge">ESCALA 1:1</div>
        </div>

        <aside className="info-card">
          <p className="eyebrow">CONFIGURACIÓN</p>
          <h2>Hierro negro + madera natural</h2>
          <dl>
            <div><dt>Estantes</dt><dd>6</dd></div>
            <div><dt>Espacio libre</dt><dd>28 cm</dd></div>
            <div><dt>Madera</dt><dd>2 cm</dd></div>
            <div><dt>Caño cuadrado</dt><dd>25 mm</dd></div>
            <div><dt>Remate superior</dt><dd>10 cm</dd></div>
          </dl>
          <p className="hint">Modelo construido con medidas reales. Las pletinas de amure de 3 × 5 cm están ubicadas discretamente detrás de los montantes superiores.</p>
        </aside>
      </section>
    </main>
  );
}
