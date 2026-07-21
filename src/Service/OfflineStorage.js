const SHELTER_CACHE_KEY = "shelterFinder.cachedShelters";

export function saveShelterCache(shelters) {
  const cache = {
    shelters,
    cachedAt: new Date().toISOString(),
  };

  localStorage.setItem(
    SHELTER_CACHE_KEY,
    JSON.stringify(cache)
  );

  return cache;
}

export function getShelterCache() {
  const storedCache = localStorage.getItem(SHELTER_CACHE_KEY);

  if (!storedCache) {
    return null;
  }

  try {
    const parsedCache = JSON.parse(storedCache);

    if (!Array.isArray(parsedCache.shelters)) {
      return null;
    }

    return parsedCache;
  } catch (error) {
    console.error("Unable to read cached shelter data.", error);
    return null;
  }
}