export function getFavorites() {
  try {
    const data = JSON.parse(localStorage.getItem("community-compass-favorites") || "[]");
    return Array.isArray(data) ? data : [];
  } catch { return []; }
}
export function saveFavorites(favs) {
  localStorage.setItem("community-compass-favorites", JSON.stringify(favs));
}
