const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function formatPrice(value) {
  return currencyFormatter.format(value);
}

export function formatYearLabel(year) {
  return year === 32000 ? "0 km" : String(year);
}

export function formatYearOption(entry) {
  return `${formatYearLabel(entry.year)} - ${entry.fuelType}`;
}

const TYPE_LABELS = {
  CAR: "Carro",
  MOTORCYCLE: "Moto",
  TRUCK: "Caminhão",
};

export function formatTypeLabel(type) {
  return TYPE_LABELS[type] || type;
}

const DIACRITICS_PATTERN = /[̀-ͯ]/g;

export function normalizeText(value) {
  return value
    .normalize("NFD")
    .replace(DIACRITICS_PATTERN, "")
    .toLowerCase()
    .trim();
}
