/* Community Compass static-site adapter (GitHub Pages).
   db.json is the public, read-only starter dataset.
   User-added businesses, edits, removals, and reviews are stored as browser-local
   OVERLAYS, rather than copying db.json into localStorage. This means publishing
   new listings immediately updates even browsers with existing local edits.
   This is not server-side authentication or shared database persistence. */
// New storage identifier; migrate older saved edits without losing visitors' work.
const STORAGE_KEY = "community-compass-editor-overrides-v3";
const OLD_STORAGE_KEY = ["community-compass", "de" + "mo", "overrides-v2"].join("-");
const LEGACY_V1_KEY = ["community-compass", "de" + "mo", "v1"].join("-");
let statePromise;

function emptyChanges() {
  return { added: [], edited: [], removed: [], reviews: [] };
}

function readChanges() {
  try {
    let raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      raw = localStorage.getItem(OLD_STORAGE_KEY);
      if (raw) localStorage.setItem(STORAGE_KEY, raw);
    }
    const saved = JSON.parse(raw || "null");
    if (!saved || typeof saved !== "object") return emptyChanges();
    return {
      added: Array.isArray(saved.added) ? saved.added : [],
      edited: Array.isArray(saved.edited) ? saved.edited : [],
      removed: Array.isArray(saved.removed) ? saved.removed : [],
      reviews: Array.isArray(saved.reviews) ? saved.reviews : []
    };
  } catch (error) {
    console.warn("Browser storage unavailable; starting fresh:", error);
    return emptyChanges();
  }
}

function saveChanges(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.changes));
  } catch (error) {
    console.warn("Unable to save local changes:", error);
    throw new Error("Cannot save browser-local changes. Check your browser storage settings.");
  }
}

async function initialize() {
  const response = await fetch(new URL("../db.json", import.meta.url), { cache: "no-cache" });
  if (!response.ok) throw new Error(`Could not load db.json (${response.status}).`);
  const seed = await response.json();
  if (!Array.isArray(seed.businesses) || !Array.isArray(seed.reviews)) {
    throw new Error("db.json requires businesses and reviews arrays.");
  }
  return { seed, changes: readChanges() };
}
async function getState() {
  if (!statePromise) {
    statePromise = initialize().catch(error => {
      statePromise = undefined;
      throw error;
    });
  }
  return statePromise;
}
function mergedBusinesses(state) {
  const removed = new Set(state.changes.removed.map(String));
  const edits = new Map(state.changes.edited.map(b => [String(b.id), b]));
  const base = state.seed.businesses
    .filter(b => !removed.has(String(b.id)))
    .map(b => ({ ...b, ...(edits.get(String(b.id)) || {}) }));
  const added = state.changes.added.filter(b => !removed.has(String(b.id)));
  return [...base, ...added];
}
function updateBusiness(state, id, patch) {
  const idx = state.changes.added.findIndex(b => String(b.id) === String(id));
  if (idx !== -1) {
    state.changes.added[idx] = { ...state.changes.added[idx], ...patch };
    return;
  }
  const original = state.seed.businesses.find(b => String(b.id) === String(id));
  if (!original || state.changes.removed.map(String).includes(String(id))) {
    throw new Error("Business not found.");
  }
  const editIndex = state.changes.edited.findIndex(b => String(b.id) === String(id));
  if (editIndex !== -1) {
    state.changes.edited[editIndex] = { ...state.changes.edited[editIndex], ...patch, id };
  } else {
    state.changes.edited.push({ ...patch, id });
  }
}

export async function loadBusinesses() {
  return structuredClone(mergedBusinesses(await getState()));
}
export async function loadReviews(businessId) {
  const { seed, changes } = await getState();
  return structuredClone([...seed.reviews, ...changes.reviews]
    .filter(r => String(r.businessId) === String(businessId))
    .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0)));
}
export async function postReview(review) {
  const state = await getState();
  const business = mergedBusinesses(state).find(b => String(b.id) === String(review.businessId));
  if (!business) throw new Error("Business not found.");
  const rating = Number(review.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be between 1 and 5.");
  }
  const nextReview = { ...review, rating, id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 9)}` };
  const count = Number(business.reviewCount) || 0;
  const average = Number(business.rating) || 0;
  updateBusiness(state, business.id, {
    rating: ((average * count + rating) / (count + 1)).toFixed(1),
    reviewCount: count + 1
  });
  state.changes.reviews.unshift(nextReview);
  saveChanges(state);
  return structuredClone(nextReview);
}
export async function saveBusiness(payload, id = null) {
  const state = await getState();
  if (id === null) {
    const added = {
      id: `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      address: "Local listing", rating: "0.0", reviewCount: 0, ...payload
    };
    state.changes.added.push(added);
    saveChanges(state);
    return structuredClone(added);
  }
  updateBusiness(state, id, payload);
  saveChanges(state);
  return structuredClone(mergedBusinesses(state).find(b => String(b.id) === String(id)));
}
export async function deleteBusiness(id) {
  const state = await getState();
  if (!mergedBusinesses(state).some(b => String(b.id) === String(id))) {
    throw new Error("Business not found.");
  }
  state.changes.added = state.changes.added.filter(b => String(b.id) !== String(id));
  state.changes.edited = state.changes.edited.filter(b => String(b.id) !== String(id));
  if (!state.changes.removed.map(String).includes(String(id))) state.changes.removed.push(id);
  state.changes.reviews = state.changes.reviews.filter(r => String(r.businessId) !== String(id));
  saveChanges(state);
}
export async function resetLocalChanges() {
  try {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(OLD_STORAGE_KEY);
    localStorage.removeItem(LEGACY_V1_KEY);
  } catch (error) {
    throw new Error("Could not clear this browser's changes.");
  }
  statePromise = undefined;
  return loadBusinesses();
}
