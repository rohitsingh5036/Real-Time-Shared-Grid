import { useState } from "react";
import { COLOR_PALETTE, type Identity } from "@/lib/identity";
import { Pencil, Check } from "lucide-react";

type Props = {
  identity: Identity;
  online: number;
  onChange: (patch: { name?: string; color?: string }) => void;
};

export function IdentityBar({ identity, online, onChange }: Props) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(identity.name);

  const save = () => {
    onChange({ name });
    setEditing(false);
  };

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border bg-card/80 px-4 py-3 backdrop-blur-xl shadow-elevated">
      <div
        className="h-10 w-10 rounded-xl ring-2 ring-background shadow-glow shrink-0"
        style={{ backgroundColor: identity.color, boxShadow: `0 0 20px ${identity.color}66` }}
      />
      <div className="flex-1 min-w-0">
        {editing ? (
          <div className="flex items-center gap-2">
            <input
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && save()}
              maxLength={24}
              className="bg-transparent border-b border-primary text-foreground font-semibold text-sm outline-none w-full"
            />
            <button onClick={save} className="text-primary hover:text-primary-glow">
              <Check className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className="group flex items-center gap-1.5 text-left"
          >
            <span className="font-semibold text-sm truncate">{identity.name}</span>
            <Pencil className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground font-mono uppercase tracking-wider">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-75 animate-ping" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          {online} online
        </div>
      </div>
      <div className="flex flex-wrap gap-1 max-w-[140px] justify-end">
        {COLOR_PALETTE.map((c) => (
          <button
            key={c}
            onClick={() => onChange({ color: c })}
            aria-label={`Pick color ${c}`}
            className={`h-4 w-4 rounded-md transition-transform hover:scale-125 ${
              identity.color === c ? "ring-2 ring-foreground ring-offset-1 ring-offset-card scale-110" : ""
            }`}
            style={{ backgroundColor: c }}
          />
        ))}
      </div>
    </div>
  );
}