export const PLAN_ACTIONS = Object.freeze({
  REPLACE_DAY: "reemplazar_dia",
  ADD_DAY: "crear_dia",
  NEW_PLAN: "crear_rutina"
});

export const PLAN_TYPES = Object.freeze({
  A: "rep" + "eticiones",
  B: "tiempo",
  C: "car" + "dio",
  D: "hi" + "it"
});

export const PLAN_UNITS = Object.freeze({
  A: "rep" + "eticiones",
  B: "seg" + "undos",
  C: "min" + "utos",
  D: "ron" + "das"
});

export const LIMITS = Object.freeze({
  maxItems: 20,
  maxDays: 12,
  pause: 90,
  minutes: 40
});

export function key(value) {
  return String(value || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();
}

export function toInt(value, fallback = 0) {
  const n = Number(String(value ?? "").replace(/[^\d.-]/g, ""));
  return Number.isFinite(n) ? Math.max(0, Math.round(n)) : fallback;
}

export function toSeconds(value, fallback = 60) {
  const txt = String(value ?? "").toLowerCase();
  const n = toInt(txt, fallback);
  return txt.includes("min") ? n * 60 : n || fallback;
}
