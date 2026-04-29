import { Trophy } from "lucide-react";

export type LeaderEntry = { ownerId: string; name: string; color: string; count: number };

export function Leaderboard({ entries, currentId }: { entries: LeaderEntry[]; currentId: string }) {
  const top = entries.slice(0, 8);
  return (
    <div className="rounded-2xl border border-border bg-card/80 backdrop-blur-xl shadow-elevated overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        <Trophy className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm tracking-tight">Leaderboard</h3>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground uppercase tracking-wider">Live</span>
      </div>
      {top.length === 0 ? (
        <div className="px-4 py-8 text-center text-xs text-muted-foreground">
          No tiles captured yet. Be the first.
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {top.map((e, i) => {
            const isMe = e.ownerId === currentId;
            return (
              <li
                key={e.ownerId}
                className={`flex items-center gap-3 px-4 py-2.5 ${isMe ? "bg-primary/5" : ""}`}
              >
                <span className="font-mono text-[11px] text-muted-foreground w-4 tabular-nums">
                  {i + 1}
                </span>
                <div
                  className="h-3 w-3 rounded-sm shrink-0"
                  style={{ backgroundColor: e.color, boxShadow: `0 0 8px ${e.color}80` }}
                />
                <span className="flex-1 text-xs font-medium truncate">
                  {e.name}
                  {isMe && <span className="ml-1.5 text-[10px] text-primary font-mono">YOU</span>}
                </span>
                <span className="font-mono text-xs tabular-nums text-foreground">{e.count}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}