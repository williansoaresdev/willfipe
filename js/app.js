import { getMeta, getBrands, getModels, getSearchIndex } from "./dataLoader.js";
import { searchIndex } from "./search.js";
import {
  LANGUAGES,
  initI18n,
  setLanguage,
  getLanguage,
  onLanguageChange,
  t,
  translateFuel,
  formatReferenceMonth,
} from "./i18n.js";
import {
  formatPrice,
  formatYearLabel,
  formatYearOption,
  formatTypeLabel,
} from "./format.js";

const typeSelect = document.getElementById("typeSelect");
const brandSelect = document.getElementById("brandSelect");
const modelInput = document.getElementById("modelInput");
const modelList = document.getElementById("modelList");
const yearSelect = document.getElementById("yearSelect");
const resultCard = document.getElementById("resultCard");
const emptyState = document.getElementById("emptyState");
const referenceMonthEl = document.getElementById("referenceMonth");
const quickSearchInput = document.getElementById("quickSearch");
const quickSearchResults = document.getElementById("quickSearchResults");

const state = {
  meta: null,
  quickResults: [],
  type: null,
  models: [],
  modelByName: new Map(),
  selectedModel: null,
};

function debounce(fn, delay) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

function resetModelAndYear() {
  modelInput.value = "";
  modelInput.disabled = true;
  modelInput.placeholder = t("selectBrandFirst");
  modelList.innerHTML = "";
  state.models = [];
  state.modelByName.clear();
  state.selectedModel = null;
  resetYear();
}

function resetYear() {
  yearSelect.innerHTML = `<option value="">${t("selectModelFirst")}</option>`;
  yearSelect.disabled = true;
  hideResult();
}

function hideResult() {
  resultCard.hidden = true;
  emptyState.hidden = false;
}

async function initTypes() {
  const meta = await getMeta();
  state.meta = meta;
  renderReferenceMonth(meta);

  typeSelect.innerHTML = "";
  for (const { type } of meta.types) {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = formatTypeLabel(type);
    typeSelect.appendChild(option);
  }

  typeSelect.addEventListener("change", () => loadBrandsForType(typeSelect.value));
  await loadBrandsForType(typeSelect.value);
}

async function loadBrandsForType(type) {
  state.type = type;
  resetModelAndYear();
  brandSelect.disabled = true;
  brandSelect.innerHTML = `<option value="">${t("loading")}</option>`;

  const brands = await getBrands(type);

  brandSelect.innerHTML = `<option value="">${t("select")}</option>`;
  for (const brand of brands) {
    const option = document.createElement("option");
    option.value = brand.code;
    option.textContent = brand.name;
    brandSelect.appendChild(option);
  }
  brandSelect.disabled = false;
}

async function loadModelsForBrand(type, brandCode) {
  resetModelAndYear();
  if (!brandCode) return;

  modelInput.placeholder = t("loading");
  const models = await getModels(type, brandCode);

  state.models = models;
  state.modelByName = new Map(models.map((m) => [m.name, m]));

  modelList.innerHTML = "";
  for (const model of models) {
    const option = document.createElement("option");
    option.value = model.name;
    modelList.appendChild(option);
  }

  modelInput.disabled = false;
  modelInput.placeholder = t("modelPlaceholder");
}

function selectModelByName(name) {
  const model = state.modelByName.get(name);
  resetYear();
  state.selectedModel = model || null;
  if (!model) return;

  yearSelect.innerHTML = `<option value="">${t("select")}</option>`;
  model.years.forEach((entry, index) => {
    const option = document.createElement("option");
    option.value = String(index);
    option.textContent = formatYearOption(entry);
    yearSelect.appendChild(option);
  });
  yearSelect.disabled = false;
}

function showResult(yearIndex) {
  const model = state.selectedModel;
  if (!model || yearIndex === "") {
    hideResult();
    return;
  }
  const entry = model.years[Number(yearIndex)];
  const brandName = brandSelect.options[brandSelect.selectedIndex]?.textContent ?? "";

  document.getElementById("resultPrice").textContent = formatPrice(entry.price);
  document.getElementById("resultTitle").textContent = model.name;
  document.getElementById("resultBrand").textContent = brandName;
  document.getElementById("resultYear").textContent = formatYearLabel(entry.year);
  document.getElementById("resultFuel").textContent = translateFuel(entry.fuelType);
  document.getElementById("resultFipe").textContent = entry.fipeCode;

  resultCard.hidden = false;
  emptyState.hidden = true;
}

function renderQuickSearchResults(entries) {
  state.quickResults = entries;
  quickSearchResults.innerHTML = "";
  if (entries.length === 0) {
    quickSearchResults.hidden = true;
    return;
  }

  for (const entry of entries) {
    const li = document.createElement("li");

    const modelLine = document.createElement("div");
    modelLine.className = "qs-model";
    modelLine.textContent = entry.modelName;

    const metaLine = document.createElement("div");
    metaLine.className = "qs-meta";
    metaLine.textContent = `${entry.brandName} · ${formatTypeLabel(entry.type)}`;

    li.append(modelLine, metaLine);
    li.addEventListener("click", () => selectFromQuickSearch(entry));
    quickSearchResults.appendChild(li);
  }
  quickSearchResults.hidden = false;
}

async function selectFromQuickSearch(entry) {
  quickSearchInput.value = `${entry.brandName} ${entry.modelName}`;
  quickSearchResults.hidden = true;

  typeSelect.value = entry.type;
  await loadBrandsForType(entry.type);

  brandSelect.value = entry.brandCode;
  await loadModelsForBrand(entry.type, entry.brandCode);

  modelInput.value = entry.modelName;
  selectModelByName(entry.modelName);
  yearSelect.focus();
}

const handleQuickSearch = debounce(async (value) => {
  if (!value.trim()) {
    quickSearchResults.hidden = true;
    return;
  }
  const index = await getSearchIndex();
  const results = searchIndex(index, value);
  renderQuickSearchResults(results);
}, 150);

function renderReferenceMonth(meta) {
  referenceMonthEl.textContent = t("referenceMonth", {
    month: formatReferenceMonth(meta.referenceMonth),
  });
}

function refreshLanguage() {
  if (state.meta) {
    renderReferenceMonth(state.meta);
    for (const option of typeSelect.options) {
      option.textContent = formatTypeLabel(option.value);
    }
  }

  if (brandSelect.options[0]?.value === "") {
    brandSelect.options[0].textContent = brandSelect.disabled ? t("loading") : t("select");
  }

  if (!modelInput.disabled) {
    modelInput.placeholder = t("modelPlaceholder");
  } else {
    modelInput.placeholder = brandSelect.value ? t("loading") : t("selectBrandFirst");
  }

  if (state.selectedModel) {
    const selected = yearSelect.value;
    selectModelByName(state.selectedModel.name);
    yearSelect.value = selected;
    showResult(yearSelect.value);
  } else if (yearSelect.options[0]) {
    yearSelect.options[0].textContent = t("selectModelFirst");
  }

  if (!quickSearchResults.hidden) renderQuickSearchResults(state.quickResults);
}

function initLanguageSwitcher() {
  const button = document.getElementById("langButton");
  const menu = document.getElementById("langMenu");
  const currentLabel = document.getElementById("langCurrent");

  const closeMenu = () => {
    menu.hidden = true;
    button.setAttribute("aria-expanded", "false");
  };

  const renderMenu = () => {
    currentLabel.textContent = LANGUAGES[getLanguage()].short;
    menu.innerHTML = "";
    for (const [code, info] of Object.entries(LANGUAGES)) {
      const li = document.createElement("li");
      const item = document.createElement("button");
      item.type = "button";
      item.lang = code;
      item.textContent = info.label;
      if (code === getLanguage()) item.setAttribute("aria-current", "true");
      item.addEventListener("click", () => {
        setLanguage(code);
        closeMenu();
        button.focus();
      });
      li.appendChild(item);
      menu.appendChild(li);
    }
  };

  button.addEventListener("click", () => {
    menu.hidden = !menu.hidden;
    button.setAttribute("aria-expanded", String(!menu.hidden));
  });
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".lang-switcher")) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  onLanguageChange(() => {
    renderMenu();
    refreshLanguage();
  });
  renderMenu();
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
      /* offline support is a bonus, not required for the app to work */
    });
  }
}

brandSelect.addEventListener("change", () => {
  loadModelsForBrand(state.type, brandSelect.value);
});

modelInput.addEventListener("input", () => selectModelByName(modelInput.value));

yearSelect.addEventListener("change", () => showResult(yearSelect.value));

quickSearchInput.addEventListener("input", (e) => handleQuickSearch(e.target.value));

document.addEventListener("click", (e) => {
  if (!e.target.closest(".quick-search-section")) {
    quickSearchResults.hidden = true;
  }
});

initI18n();
initLanguageSwitcher();
initTypes();
registerServiceWorker();
