import { useEffect, useRef, useState, useCallback } from "react";

export type Tile = {
  x: number;
  y: number;
  color: string;
  owner_id: string;
  owner_name: string;
};

type Props = {
  cols: number;
  rows: number;
  tiles: Map<string, Tile>;
  recentlyChanged: Set<string>;
  myColor: string;
  cooldownRemaining: number;
  onCapture: (x: number, y: number) => void;
};

const MIN_CELL = 14;
const MAX_CELL = 48;
const DEFAULT_CELL = 22;

export function PixelGrid({ cols, rows, tiles, recentlyChanged, myColor, cooldownRemaining, onCapture }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [cell, setCell] = useState(DEFAULT_CELL);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  const width = cols * cell;
  const height = rows * cell;

  // draw
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // background
    ctx.fillStyle = "hsl(240 14% 11%)";
    ctx.fillRect(0, 0, width, height);

    // tiles
    tiles.forEach((t) => {
      ctx.fillStyle = t.color;
      ctx.fillRect(t.x * cell, t.y * cell, cell, cell);
    });

    // grid lines (subtle)
    if (cell >= 16) {
      ctx.strokeStyle = "hsl(240 14% 14% / 0.6)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x <= cols; x++) {
        ctx.moveTo(x * cell + 0.5, 0);
        ctx.lineTo(x * cell + 0.5, height);
      }
      for (let y = 0; y <= rows; y++) {
        ctx.moveTo(0, y * cell + 0.5);
        ctx.lineTo(width, y * cell + 0.5);
      }
      ctx.stroke();
    }

    // animated pop overlay for recently-changed tiles
    recentlyChanged.forEach((key) => {
      const t = tiles.get(key);
      if (!t) return;
      ctx.save();
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.globalAlpha = 0.9;
      ctx.strokeRect(t.x * cell + 1, t.y * cell + 1, cell - 2, cell - 2);
      ctx.restore();
    });
  }, [tiles, recentlyChanged, cell, cols, rows, width, height]);

  // hover/click handling
  const cellFromEvent = useCallback(
    (e: React.MouseEvent) => {
      const rect = canvasRef.current!.getBoundingClientRect();
      const x = Math.floor((e.clientX - rect.left) / cell);
      const y = Math.floor((e.clientY - rect.top) / cell);
      if (x < 0 || y < 0 || x >= cols || y >= rows) return null;
      return { x, y };
    },
    [cell, cols, rows]
  );

  const handleMove = (e: React.MouseEvent) => {
    const c = cellFromEvent(e);
    setHover(c);
  };
  const handleClick = (e: React.MouseEvent) => {
    if (cooldownRemaining > 0) return;
    const c = cellFromEvent(e);
    if (c) onCapture(c.x, c.y);
  };

  const zoom = (delta: number) => {
    setCell((c) => Math.min(MAX_CELL, Math.max(MIN_CELL, c + delta)));
  };

  return (
    <div className="relative h-full w-full">
      {/* zoom controls */}
      <div className="absolute top-3 right-3 z-10 flex flex-col gap-1 rounded-xl border border-border bg-card/90 backdrop-blur-xl shadow-elevated p-1">
        <button
          onClick={() => zoom(4)}
          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary text-foreground text-lg font-mono"
          aria-label="Zoom in"
        >
          +
        </button>
        <button
          onClick={() => zoom(-4)}
          className="h-8 w-8 grid place-items-center rounded-lg hover:bg-secondary text-foreground text-lg font-mono"
          aria-label="Zoom out"
        >
          −
        </button>
      </div>

      {/* hover info */}
      {hover && (
        <div className="absolute top-3 left-3 z-10 rounded-xl border border-border bg-card/90 backdrop-blur-xl shadow-elevated px-3 py-2 font-mono text-[11px] text-muted-foreground pointer-events-none">
          <span className="text-foreground">[{hover.x},{hover.y}]</span>
          {(() => {
            const t = tiles.get(`${hover.x}:${hover.y}`);
            if (!t) return <span className="ml-2 text-primary">empty</span>;
            return (
              <span className="ml-2 inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-sm" style={{ backgroundColor: t.color }} />
                <span className="text-foreground">{t.owner_name}</span>
              </span>
            );
          })()}
        </div>
      )}

      <div ref={containerRef} className="h-full w-full overflow-auto rounded-2xl border border-border bg-background/40 shadow-elevated">
        <div
          className="relative mx-auto my-auto"
          style={{ width, height, padding: 0 }}
        >
          <canvas
            ref={canvasRef}
            className={cooldownRemaining > 0 ? "cursor-wait" : "cursor-crosshair"}
            onMouseMove={handleMove}
            onMouseLeave={() => setHover(null)}
            onClick={handleClick}
          />
          {/* hover preview */}
          {hover && cooldownRemaining === 0 && (
            <div
              className="absolute pointer-events-none border-2 rounded-[2px] transition-all duration-75"
              style={{
                left: hover.x * cell,
                top: hover.y * cell,
                width: cell,
                height: cell,
                borderColor: myColor,
                boxShadow: `0 0 12px ${myColor}, inset 0 0 0 1px ${myColor}40`,
                backgroundColor: `${myColor}30`,
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}