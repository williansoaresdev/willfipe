const DATA_BASE = "./data";

const cache = {
  meta: null,
  brandsByType: new Map(),
  modelsByTypeAndBrand: new Map(),
  searchIndex: null,
};

async function fetchJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Falha ao carregar ${path}: ${response.status}`);
  }
  return response.json();
}

export async function getMeta() {
  if (!cache.meta) {
    cache.meta = await fetchJson(`${DATA_BASE}/meta.json`);
  }
  return cache.meta;
}

export async function getBrands(type) {
  if (!cache.brandsByType.has(type)) {
    cache.brandsByType.set(type, fetchJson(`${DATA_BASE}/brands/${type}.json`));
  }
  return cache.brandsByType.get(type);
}

export async function getModels(type, brandCode) {
  const key = `${type}|${brandCode}`;
  if (!cache.modelsByTypeAndBrand.has(key)) {
    cache.modelsByTypeAndBrand.set(
      key,
      fetchJson(`${DATA_BASE}/models/${type}/${brandCode}.json`)
    );
  }
  return cache.modelsByTypeAndBrand.get(key);
}

export async function getSearchIndex() {
  if (!cache.searchIndex) {
    cache.searchIndex = fetchJson(`${DATA_BASE}/search-index.json`);
  }
  return cache.searchIndex;
}
