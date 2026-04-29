const ID_KEY = "pixelfront:userId";
const NAME_KEY = "pixelfront:userName";
const COLOR_KEY = "pixelfront:userColor";

const PALETTE = [
  "#10E39A", // green
  "#22D3EE", // cyan
  "#A855F7", // purple
  "#F472B6", // pink
  "#FB923C", // orange
  "#FACC15", // yellow
  "#F87171", // red
  "#60A5FA", // blue
  "#34D399", // teal
  "#E879F9", // magenta
  "#FDE047", // bright yellow
  "#4ADE80", // lime
];

const ANIMALS = ["Fox", "Wolf", "Cat", "Otter", "Hawk", "Lynx", "Owl", "Bear", "Raven", "Tiger", "Panda", "Hare"];
const ADJECTIVES = ["Neon", "Quantum", "Pixel", "Vivid", "Cosmic", "Lucid", "Swift", "Bold", "Sly", "Wild", "Solar", "Atomic"];

function pick<T>(arr: T[]) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export type Identity = { id: string; name: string; color: string };

export function getIdentity(): Identity {
  let id = localStorage.getItem(ID_KEY);
  let name = localStorage.getItem(NAME_KEY);
  let color = localStorage.getItem(COLOR_KEY);

  if (!id) {
    id = randomId();
    localStorage.setItem(ID_KEY, id);
  }
  if (!name) {
    name = `${pick(ADJECTIVES)} ${pick(ANIMALS)}`;
    localStorage.setItem(NAME_KEY, name);
  }
  if (!color) {
    color = pick(PALETTE);
    localStorage.setItem(COLOR_KEY, color);
  }
  return { id, name, color };
}

export function updateIdentity(patch: Partial<Pick<Identity, "name" | "color">>): Identity {
  const current = getIdentity();
  if (patch.name !== undefined) {
    const trimmed = patch.name.trim().slice(0, 24) || current.name;
    localStorage.setItem(NAME_KEY, trimmed);
  }
  if (patch.color !== undefined) {
    localStorage.setItem(COLOR_KEY, patch.color);
  }
  return getIdentity();
}

export const COLOR_PALETTE = PALETTE;