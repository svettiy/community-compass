/* Community Compass static-site data adapter.
   Initial records are read from db.json. Edits and reviews are LOCAL to this browser.
   No password or secret is embedded in client-side JavaScript. */
const STORAGE_KEY = "community-compass-demo-v1";
let statePromise;

function save(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("Demo data could not be saved to this browser:", error);
    throw new Error("Unable to save demo changes in this browser. Check storage settings.");
  }
}

async function initialize() {
  const response = await fetch(new URL("../db.json", import.meta.url));
  if (!response.ok) throw new Error(`Could not read db.json (${response.status}).`);
  const seed = await response.json();
  if (!Array.isArray(seed.businesses) || !Array.isArray(seed.reviews)) {
    throw new Error("db.json must include businesses and reviews arrays.");
  }
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || "null");
    if (saved && Array.isArray(saved.businesses) && Array.isArray(saved.reviews)) {
      return saved;
    }
  } catch (error) {
    console.warn("Ignoring invalid browser demo data:", error);
  }
  return { businesses: seed.businesses, reviews: seed.reviews };
}

async function getState() {
  if (!statePromise) statePromise = initialize().catch(error => {
    statePromise = undefined;
    throw error;
  });
  return statePromise;
}

export async function loadBusinesses() {
  const state = await getState();
  return structuredClone(state.businesses);
}

export async function loadReviews(businessId) {
  const state = await getState();
  return structuredClone(state.reviews.filter(r => String(r.businessId) === String(businessId))
    .sort((a, b) => new Date(b.created || 0) - new Date(a.created || 0)));
}

export async function postReview(review) {
  const state = await getState();
  const business = state.businesses.find(b => String(b.id) === String(review.businessId));
  if (!business) throw new Error("Business not found.");
  const rating = Number(review.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Rating must be 1–5.");
  }
  const nextReview = { ...review, rating, id: `review-${Date.now()}-${Math.random().toString(36).slice(2, 7)}` };
  state.reviews.unshift(nextReview);
  // Preserve the sample aggregate score/count for older reviews not present as text in db.json.
  const count = Number(business.reviewCount) || 0;
  const previousAverage = Number(business.rating) || 0;
  business.rating = ((previousAverage * count + rating) / (count + 1)).toFixed(1);
  business.reviewCount = count + 1;
  save(state);
  return structuredClone(nextReview);
}

export async function saveBusiness(payload, id = null) {
  const state = await getState();
  if (id === null) {
    const highest = state.businesses.reduce((n,b) => Math.max(n, Number(b.id)||0), 0);
    const added = { id: highest + 1, address: "", rating: "0.0", reviewCount: 0, ...payload };
    state.businesses.push(added);
    save(state);
    return structuredClone(added);
  }
  const idx = state.businesses.findIndex(b => String(b.id) === String(id));
  if (idx < 0) throw new Error("Business not found.");
  state.businesses[idx] = { ...state.businesses[idx], ...payload };
  save(state);
  return structuredClone(state.businesses[idx]);
}

export async function deleteBusiness(id) {
  const state = await getState();
  state.businesses = state.businesses.filter(b => String(b.id) !== String(id));
  state.reviews = state.reviews.filter(r => String(r.businessId) !== String(id));
  save(state);
}

export async function resetDemo() {
  localStorage.removeItem(STORAGE_KEY);
  statePromise = undefined;
  return loadBusinesses();
}
