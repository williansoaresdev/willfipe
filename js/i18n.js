const STORAGE_KEY = "willfipe-lang";
const DEFAULT_LANG = "pt-BR";

export const LANGUAGES = {
  "pt-BR": { label: "Português (Brasil)", short: "PT", ogLocale: "pt_BR" },
  en: { label: "English", short: "EN", ogLocale: "en_US" },
  es: { label: "Español", short: "ES", ogLocale: "es_ES" },
};

const MESSAGES = {
  "pt-BR": {
    pageTitle: "willfipe — Consulta FIPE",
    description: "Consulta a tabela FIPE de carros, motos e caminhões.",
    ogImageAlt: "willfipe — consulta a tabela FIPE de veículos",
    heroAlt: "Ilustração de um carro",
    subtitle: "Consulta a tabela FIPE de veículos",
    quickSearch: "Busca rápida",
    quickSearchPlaceholder: "Digite a marca ou o modelo, ex: Civic, Fiesta, Fazer...",
    guidedSearch: "Busca guiada",
    type: "Tipo",
    brand: "Marca",
    model: "Modelo",
    yearFuel: "Ano / combustível",
    loading: "Carregando...",
    select: "Selecione...",
    selectBrandFirst: "Selecione uma marca primeiro",
    selectModelFirst: "Selecione um modelo primeiro",
    modelPlaceholder: "Digite ou selecione o modelo",
    referenceValue: "Valor de referência",
    modelYear: "Ano modelo",
    fuel: "Combustível",
    fipeCode: "Código FIPE",
    emptyState: "Escolha o tipo, a marca, o modelo e o ano para ver o preço.",
    referenceMonth: "Valores de referência: {month}",
    disclaimer: "Dados de referência da tabela FIPE. Valores meramente informativos.",
    languageLabel: "Idioma",
    zeroKm: "0 km",
    CAR: "Carro",
    MOTORCYCLE: "Moto",
    TRUCK: "Caminhão",
    fuels: {},
  },
  en: {
    pageTitle: "willfipe — FIPE Lookup",
    description: "Look up FIPE table prices for cars, motorcycles and trucks.",
    ogImageAlt: "willfipe — FIPE vehicle price lookup",
    heroAlt: "Illustration of a car",
    subtitle: "FIPE vehicle price lookup",
    quickSearch: "Quick search",
    quickSearchPlaceholder: "Type the brand or model, e.g. Civic, Fiesta, Fazer...",
    guidedSearch: "Guided search",
    type: "Type",
    brand: "Brand",
    model: "Model",
    yearFuel: "Year / fuel",
    loading: "Loading...",
    select: "Select...",
    selectBrandFirst: "Select a brand first",
    selectModelFirst: "Select a model first",
    modelPlaceholder: "Type or select the model",
    referenceValue: "Reference price",
    modelYear: "Model year",
    fuel: "Fuel",
    fipeCode: "FIPE code",
    emptyState: "Choose the type, brand, model and year to see the price.",
    referenceMonth: "Reference prices: {month}",
    disclaimer: "Reference data from the FIPE table. Values are for information only.",
    languageLabel: "Language",
    zeroKm: "Brand new",
    CAR: "Car",
    MOTORCYCLE: "Motorcycle",
    TRUCK: "Truck",
    fuels: {
      Gasolina: "Gasoline",
      Diesel: "Diesel",
      Flex: "Flex",
      Elétrico: "Electric",
      Híbrido: "Hybrid",
    },
  },
  es: {
    pageTitle: "willfipe — Consulta FIPE",
    description: "Consulta la tabla FIPE de autos, motos y camiones.",
    ogImageAlt: "willfipe — consulta de la tabla FIPE de vehículos",
    heroAlt: "Ilustración de un auto",
    subtitle: "Consulta de la tabla FIPE de vehículos",
    quickSearch: "Búsqueda rápida",
    quickSearchPlaceholder: "Escribe la marca o el modelo, ej: Civic, Fiesta, Fazer...",
    guidedSearch: "Búsqueda guiada",
    type: "Tipo",
    brand: "Marca",
    model: "Modelo",
    yearFuel: "Año / combustible",
    loading: "Cargando...",
    select: "Selecciona...",
    selectBrandFirst: "Selecciona una marca primero",
    selectModelFirst: "Selecciona un modelo primero",
    modelPlaceholder: "Escribe o selecciona el modelo",
    referenceValue: "Valor de referencia",
    modelYear: "Año del modelo",
    fuel: "Combustible",
    fipeCode: "Código FIPE",
    emptyState: "Elige el tipo, la marca, el modelo y el año para ver el precio.",
    referenceMonth: "Valores de referencia: {month}",
    disclaimer: "Datos de referencia de la tabla FIPE. Valores meramente informativos.",
    languageLabel: "Idioma",
    zeroKm: "0 km",
    CAR: "Auto",
    MOTORCYCLE: "Moto",
    TRUCK: "Camión",
    fuels: {
      Gasolina: "Gasolina",
      Diesel: "Diésel",
      Flex: "Flex",
      Elétrico: "Eléctrico",
      Híbrido: "Híbrido",
    },
  },
};

const PT_MONTHS = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

let current = DEFAULT_LANG;
const listeners = [];

function matchLanguage(tag) {
  if (!tag) return null;
  const lower = String(tag).toLowerCase();
  if (lower.startsWith("pt")) return "pt-BR";
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("es")) return "es";
  return null;
}

function readStored() {
  try {
    return matchLanguage(localStorage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

function detectLanguage() {
  const candidates = navigator.languages?.length ? navigator.languages : [navigator.language];
  for (const tag of candidates) {
    const match = matchLanguage(tag);
    if (match) return match;
  }
  return DEFAULT_LANG;
}

export function getLanguage() {
  return current;
}

export function t(key, params) {
  let text = MESSAGES[current][key] ?? MESSAGES[DEFAULT_LANG][key] ?? key;
  if (params) {
    for (const [name, value] of Object.entries(params)) {
      text = text.replace(`{${name}}`, value);
    }
  }
  return text;
}

export function translateFuel(fuel) {
  return MESSAGES[current].fuels[fuel] ?? fuel;
}

// meta.json stores the month in Portuguese ("outubro de 2026"); render it in the active language.
export function formatReferenceMonth(raw) {
  const match = /^(\S+) de (\d{4})$/i.exec(raw ?? "");
  const monthIndex = match ? PT_MONTHS.indexOf(match[1].toLowerCase()) : -1;
  if (monthIndex === -1) return raw;
  const date = new Date(Date.UTC(Number(match[2]), monthIndex, 1));
  return new Intl.DateTimeFormat(current, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function onLanguageChange(listener) {
  listeners.push(listener);
}

function applyStatic() {
  document.documentElement.lang = current;
  document.title = t("pageTitle");

  const setMeta = (selector, value) => {
    document.querySelector(selector)?.setAttribute("content", value);
  };
  setMeta('meta[name="description"]', t("description"));
  setMeta('meta[property="og:title"]', t("pageTitle"));
  setMeta('meta[property="og:description"]', t("description"));
  setMeta('meta[property="og:image:alt"]', t("ogImageAlt"));
  setMeta('meta[property="og:locale"]', LANGUAGES[current].ogLocale);
  setMeta('meta[name="twitter:title"]', t("pageTitle"));
  setMeta('meta[name="twitter:description"]', t("description"));

  for (const el of document.querySelectorAll("[data-i18n]")) {
    el.textContent = t(el.dataset.i18n);
  }
  for (const el of document.querySelectorAll("[data-i18n-placeholder]")) {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  }
  for (const el of document.querySelectorAll("[data-i18n-alt]")) {
    el.alt = t(el.dataset.i18nAlt);
  }
  for (const el of document.querySelectorAll("[data-i18n-aria]")) {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  }
}

export function setLanguage(lang, { persist = true } = {}) {
  if (!LANGUAGES[lang]) return;
  current = lang;
  if (persist) {
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* preference just won't be remembered */
    }
  }
  applyStatic();
  listeners.forEach((fn) => fn(lang));
}

export function initI18n() {
  setLanguage(readStored() ?? detectLanguage(), { persist: false });
}
