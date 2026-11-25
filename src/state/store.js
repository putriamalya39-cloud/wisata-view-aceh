import { SAMPLE_DATA } from '../data/sampleData.js';

const STORAGE_KEYS = {
  db: 'hea_data',
  favorites: 'hea_favorites',
  trips: 'hea_trips',
  language: 'hea_language',
};

function clone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function safeReadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return clone(fallback);
    const parsed = JSON.parse(raw);
    return parsed ?? clone(fallback);
  } catch {
    return clone(fallback);
  }
}

function normalizeDb(raw) {
  const base = clone(SAMPLE_DATA);
  if (!raw || typeof raw !== 'object') return base;

  const coordMap = new Map(base.destinations.map((d) => [d.id, { lat: d.lat, lng: d.lng }]));
  const destinations = Array.isArray(raw.destinations)
    ? raw.destinations.map((d) => {
        const fallbackCoords = coordMap.get(d.id);
        return {
          ...d,
          cost: Number(d.cost) || 0,
          lat: d.lat != null && Number.isFinite(Number(d.lat)) ? Number(d.lat) : fallbackCoords?.lat ?? null,
          lng: d.lng != null && Number.isFinite(Number(d.lng)) ? Number(d.lng) : fallbackCoords?.lng ?? null,
        };
      })
    : base.destinations;

  return {
    destinations,
    foods: Array.isArray(raw.foods) ? raw.foods : base.foods,
    stays: Array.isArray(raw.stays) ? raw.stays : base.stays,
    packages: Array.isArray(raw.packages) ? raw.packages : base.packages,
  };
}

class AppStore {
  constructor() {
    this.db = normalizeDb(safeReadJson(STORAGE_KEYS.db, SAMPLE_DATA));
    this.favorites = safeReadJson(STORAGE_KEYS.favorites, []);
    if (!Array.isArray(this.favorites)) this.favorites = [];
    this.trips = safeReadJson(STORAGE_KEYS.trips, []);
    if (!Array.isArray(this.trips)) this.trips = [];
    const savedLang = localStorage.getItem(STORAGE_KEYS.language);
    this.language = savedLang === 'en' ? 'en' : 'id';
    this.listeners = new Set();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify(topic = 'all') {
    this.listeners.forEach((fn) => fn(topic));
  }

  setLanguage(lang) {
    this.language = lang === 'en' ? 'en' : 'id';
    localStorage.setItem(STORAGE_KEYS.language, this.language);
    this.notify('language');
  }

  saveDb() {
    localStorage.setItem(STORAGE_KEYS.db, JSON.stringify(this.db));
    this.notify('db');
  }

  restoreSampleDb() {
    this.db = clone(SAMPLE_DATA);
    this.saveDb();
  }

  isFavorite(itemId, type = 'destination') {
    return this.favorites.some((item) => item.itemId === itemId && item.type === type);
  }

  toggleFavorite(itemId, type = 'destination') {
    const idx = this.favorites.findIndex((item) => item.itemId === itemId && item.type === type);
    let added = false;
    if (idx >= 0) {
      this.favorites.splice(idx, 1);
    } else {
      this.favorites.push({
        id: `fav-${Date.now()}`,
        itemId,
        type,
        date: new Date().toISOString(),
      });
      added = true;
    }
    localStorage.setItem(STORAGE_KEYS.favorites, JSON.stringify(this.favorites));
    this.notify('favorites');
    return added;
  }

  addTrip(trip) {
    this.trips.unshift(trip);
    localStorage.setItem(STORAGE_KEYS.trips, JSON.stringify(this.trips));
    this.notify('trips');
  }

  deleteTrip(tripId) {
    this.trips = this.trips.filter((t) => t.id !== tripId);
    localStorage.setItem(STORAGE_KEYS.trips, JSON.stringify(this.trips));
    this.notify('trips');
  }
}

export const store = new AppStore();
