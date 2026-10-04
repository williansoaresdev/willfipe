import { getLanguage, t, translateFuel } from "./i18n.js";

export function formatPrice(value) {
  return new Intl.NumberFormat(getLanguage(), {
    style: "currency",
    currency: "BRL",
  }).format(value);
}

export function formatYearLabel(year) {
  return year === 32000 ? t("zeroKm") : String(year);
}

export function formatYearOption(entry) {
  return `${formatYearLabel(entry.year)} - ${translateFuel(entry.fuelType)}`;
}

export function formatTypeLabel(type) {
  return t(type);
}

const DIACRITICS_PATTERN = /[̀-ͯ]/g;

export function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .trim();
}
