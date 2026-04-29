import { useEffect, useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getIdentity, updateIdentity, type Identity } from "@/lib/identity";
import { PixelGrid, type Tile } from "@/components/PixelGrid";
import { IdentityBar } from "@/components/IdentityBar";
import { Leaderboard, type LeaderEntry } from "@/components/Leaderboard";
import { toast } from "sonner";
import { Zap } from "lucide-react";

const COLS = 50;
const ROWS = 33;
const COOLDOWN_MS = 500;

const key = (x: number, y: number) => `${x}:${y}`;

const Index = () => {
  const [identity, setIdentity] = useState<Identity>(() => getIdentity());
  const identityRef = useRef(identity);
  identityRef.current = identity;

  const [tiles, setTiles] = useState<Map<string, Tile>>(new Map());
  const [recent, setRecent] = useState<Set<string>>(new Set());
  const [online, setOnline] = useState(1);
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const [cooldownEnd, setCooldownEnd] = useState(0);
  const [now, setNow] = useState(Date.now());

  // Tick for cooldown countdown
  useEffect(() => {
    const i = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(i);
  }, []);

  // Initial fetch + realtime subscription
  useEffect(() => {
    let mounted = true;

    (async () => {
      const { data, error } = await supabase.from("tiles").select("x,y,color,owner_id,owner_name");
      if (error) {
        toast.error("Failed to load grid");
        return;
      }
      if (!mounted || !data) return;
      const m = new Map<string, Tile>();
      data.forEach((t: any) => m.set(key(t.x, t.y), t));
      setTiles(m);
    })();

    const channel = supabase
      .channel("tiles-realtime")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tiles" },
        (payload) => {
          const row: any = payload.new ?? payload.old;
          if (!row) return;
          const k = key(row.x, row.y);
          setTiles((prev) => {
            const next = new Map(prev);
            if (payload.eventType === "DELETE") {
              next.delete(k);
            } else {
              next.set(k, {
                x: row.x,
                y: row.y,
                color: row.color,
                owner_id: row.owner_id,
                owner_name: row.owner_name,
              });
            }
            return next;
          });
          // flash recently changed
          setRecent((prev) => {
            const next = new Set(prev);
            next.add(k);
            return next;
          });
          setTimeout(() => {
            setRecent((prev) => {
              const next = new Set(prev);
              next.delete(k);
              return next;
            });
          }, 600);
        }
      )
      .subscribe();

    // Presence channel for online count
    const presence = supabase.channel("presence-pixelfront", {
      config: { presence: { key: identityRef.current.id } },
    });
    presence
      .on("presence", { event: "sync" }, () => {
        const state = presence.presenceState();
        setOnline(Object.keys(state).length);
        setOnlineUsers(new Set(Object.keys(state)));
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presence.track({
            name: identityRef.current.name,
            color: identityRef.current.color,
            online_at: new Date().toISOString(),
          });
        }
      });

    return () => {
      mounted = false;
      supabase.removeChannel(channel);
      supabase.removeChannel(presence);
    };
  }, []);

  const handleCapture = async (x: number, y: number) => {
    if (cooldownEnd > Date.now()) return;
    const id = identityRef.current;
    const k = key(x, y);
    const existing = tiles.get(k);
    if (existing && existing.owner_id === id.id && existing.color === id.color) {
      toast("Already yours", { description: `[${x},${y}] is already in your control.` });
      return;
    }

    setCooldownEnd(Date.now() + COOLDOWN_MS);

    // optimistic update
    const optimistic: Tile = { x, y, color: id.color, owner_id: id.id, owner_name: id.name };
    setTiles((prev) => {
      const next = new Map(prev);
      next.set(k, optimistic);
      return next;
    });

    const { error } = await supabase
      .from("tiles")
      .upsert(
        { x, y, color: id.color, owner_id: id.id, owner_name: id.name, captured_at: new Date().toISOString() },
        { onConflict: "x,y" }
      );

    if (error) {
      toast.error("Capture failed", { description: error.message });
      // rollback
      setTiles((prev) => {
        const next = new Map(prev);
        if (existing) next.set(k, existing);
        else next.delete(k);
        return next;
      });
      setCooldownEnd(0);
    }
  };

  const handleIdentityChange = async (patch: { name?: string; color?: string }) => {
    const updated = updateIdentity(patch);
    setIdentity(updated);

    // Update all tiles owned by this player in the database
    if (patch.name || patch.color) {
      const updates: any = {};
      if (patch.name) updates.owner_name = patch.name;
      if (patch.color) updates.color = patch.color;

      const { error } = await supabase
        .from("tiles")
        .update(updates)
        .eq("owner_id", updated.id);

      if (error) {
        toast.error("Failed to update tiles", { description: error.message });
      }
    }
  };

  const leaders = useMemo<LeaderEntry[]>(() => {
    const map = new Map<string, LeaderEntry>();
    tiles.forEach((t) => {
      if (!onlineUsers.has(t.owner_id)) return;
      const cur = map.get(t.owner_id);
      if (cur) cur.count++;
      else map.set(t.owner_id, { ownerId: t.owner_id, name: t.owner_name, color: t.color, count: 1 });
    });
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [tiles, onlineUsers]);

  const myCount = leaders.find((l) => l.ownerId === identity.id)?.count ?? 0;
  const totalCells = COLS * ROWS;
  const filled = tiles.size;
  const cooldownRemaining = Math.max(0, cooldownEnd - now);
  const cooldownPct = (cooldownRemaining / COOLDOWN_MS) * 100;

  return (
    <main className="min-h-screen w-full">
      <div className="mx-auto max-w-[1500px] px-4 lg:px-8 py-6">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl grid place-items-center bg-gradient-to-br from-primary to-accent shadow-glow">
              <Zap className="h-5 w-5 text-background" strokeWidth={2.5} />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Pixel<span className="text-gradient-primary">front</span>
              </h1>
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                Real-time shared grid · {COLS}×{ROWS}
              </p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-6 text-xs font-mono">
            <Stat label="Captured" value={`${filled}/${totalCells}`} />
            <Stat label="Players" value={leaders.length.toString()} />
            <Stat label="Your tiles" value={myCount.toString()} accent />
          </div>
        </header>

        {/* Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-4 lg:gap-6">
          {/* Grid */}
          <section className="relative">
            <div className="h-[68vh] min-h-[480px]">
              <PixelGrid
                cols={COLS}
                rows={ROWS}
                tiles={tiles}
                recentlyChanged={recent}
                myColor={identity.color}
                cooldownRemaining={cooldownRemaining}
                onCapture={handleCapture}
              />
            </div>

            {/* Cooldown bar */}
            <div className="mt-3 flex items-center gap-3">
              <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-150 ease-linear"
                  style={{ width: `${100 - cooldownPct}%` }}
                />
              </div>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground w-24 text-right">
                {cooldownRemaining > 0 ? `${(cooldownRemaining / 1000).toFixed(1)}s cooldown` : "Ready to capture"}
              </span>
            </div>
          </section>

          {/* Sidebar */}
          <aside className="flex flex-col gap-4">
            <IdentityBar identity={identity} online={online} onChange={handleIdentityChange} />
            <Leaderboard entries={leaders} currentId={identity.id} />
            <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-4 text-xs text-muted-foreground leading-relaxed">
              <p className="text-foreground font-semibold mb-1.5 text-sm">How to play</p>
              <ul className="space-y-1 list-disc list-inside marker:text-primary">
                <li>Click any tile to claim it in your color.</li>
                <li>Recapture rivals' tiles to take them over.</li>
                <li>{(COOLDOWN_MS / 1000).toFixed(0)}s cooldown between captures.</li>
                <li>All changes sync instantly to everyone online.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
};

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex flex-col items-end">
      <span className={`text-base font-semibold tabular-nums ${accent ? "text-gradient-primary" : "text-foreground"}`}>
        {value}
      </span>
      <span className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</span>
    </div>
  );
}

export default Index;
