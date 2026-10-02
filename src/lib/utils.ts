export function inr(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export const ORDER_STATUSES = [
  "pending",
  "cutting",
  "stitching",
  "trial",
  "ready",
  "delivered",
] as const;

export const GARMENTS = ["Pants", "Shirt", "Jacket", "Koti", "Jodhpuri", "Dress"] as const;

export const MEASUREMENT_TEMPLATES: Record<string, { key: string; label: string }[]> = {
  Pants: [
    { key: "waist", label: "Waist" },
    { key: "hip", label: "Hip" },
    { key: "thigh", label: "Thigh" },
    { key: "length", label: "Length" },
    { key: "inseam", label: "Inseam" },
    { key: "bottom", label: "Bottom" },
    { key: "rise", label: "Rise" },
  ],
  Shirt: [
    { key: "chest", label: "Chest" },
    { key: "shoulder", label: "Shoulder" },
    { key: "sleeve", label: "Sleeve" },
    { key: "neck", label: "Neck" },
    { key: "length", label: "Length" },
    { key: "waist", label: "Waist" },
    { key: "cuff", label: "Cuff" },
  ],
  Jacket: [
    { key: "chest", label: "Chest" },
    { key: "shoulder", label: "Shoulder" },
    { key: "sleeve", label: "Sleeve" },
    { key: "length", label: "Length" },
    { key: "waist", label: "Waist" },
    { key: "lapel", label: "Lapel" },
  ],
  Koti: [
    { key: "chest", label: "Chest" },
    { key: "shoulder", label: "Shoulder" },
    { key: "length", label: "Length" },
    { key: "waist", label: "Waist" },
  ],
  Jodhpuri: [
    { key: "chest", label: "Chest" },
    { key: "shoulder", label: "Shoulder" },
    { key: "sleeve", label: "Sleeve" },
    { key: "neck", label: "Neck" },
    { key: "length", label: "Length" },
    { key: "waist", label: "Waist" },
  ],
  Dress: [
    { key: "chest", label: "Chest" },
    { key: "waist", label: "Waist" },
    { key: "hip", label: "Hip" },
    { key: "shoulder", label: "Shoulder" },
    { key: "length", label: "Length" },
    { key: "sleeve", label: "Sleeve" },
  ],
};
