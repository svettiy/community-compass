import { getFavorites } from "./storage.js";
export function filterData(data, search, category, subcategory, viewFilter) {
  const q = (search || "").trim().toLocaleLowerCase();
  const favorites = getFavorites();
  return data.filter(b =>
    (!category || category === "all" || b.category === category) &&
    (!subcategory || subcategory === "all" || b.subcategory === subcategory) &&
    (!q || [b.name, b.description, b.address].some(v => String(v || "").toLocaleLowerCase().includes(q))) &&
    (viewFilter !== "favorites" || favorites.includes(b.id)) &&
    (viewFilter !== "deals" || (Array.isArray(b.deals) && b.deals.length > 0))
  );
}
