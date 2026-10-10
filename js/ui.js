import { getFavorites, saveFavorites } from "./storage.js";

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

export function renderList(items, openReviews, refreshUI, openEdit, openDelete) {
  const container = document.getElementById("businessList");
  container.replaceChildren();
  if (!items.length) {
    container.innerHTML = '<div class="col-12"><div class="alert alert-light border text-center">No businesses match these filters. Try a different search.</div></div>';
    return;
  }
  const favorites = getFavorites();
  const isAdmin = !!window.isAdmin;
  for (const b of items) {
    const favorite = favorites.includes(b.id);
    const card = document.createElement("div");
    card.className = "col-md-6 col-lg-4";
    const deals = Array.isArray(b.deals) ? b.deals : [];
    card.innerHTML = `
      <div class="card p-3 shadow-sm h-100 d-flex flex-column justify-content-between">
        <div>
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="mb-1">${escapeHTML(b.name)}</h5>
              <span class="badge bg-info text-dark">${escapeHTML(b.subcategory)}</span>
            </div>
            ${isAdmin ? `<div class="d-flex gap-1">
              <button type="button" class="btn btn-sm btn-outline-secondary admin-edit-btn" title="Edit demo business"><i class="bi bi-pencil-square"></i></button>
              <button type="button" class="btn btn-sm btn-outline-danger admin-delete-btn" title="Delete demo business"><i class="bi bi-trash-fill"></i></button>
            </div>` : ""}
          </div>
          <p class="mt-2 mb-2">${escapeHTML(b.description)}</p>
          ${b.address ? `<p class="small text-muted mb-2"><i class="bi bi-geo-alt"></i> ${escapeHTML(b.address)}</p>` : ""}
          ${deals.length ? `<div class="alert alert-warning py-1 px-2 mb-2 fw-bold"><i class="bi bi-tag-fill"></i> Special Deals <span class="badge bg-light text-dark ms-1">${deals.length}</span></div><ul class="small mb-2">${deals.map(d=>`<li>${escapeHTML(d)}</li>`).join("")}</ul>` : ""}
          <p class="mb-1">⭐ ${escapeHTML(b.rating || "0.0")}
            <span class="text-muted">(${escapeHTML(b.reviewCount || 0)} ratings)</span></p>
        </div>
        <div class="mt-2 d-flex justify-content-between align-items-center">
          <button type="button" class="btn btn-outline-primary btn-sm review-btn"><i class="fa fa-comment"></i> Reviews</button>
          <button type="button" class="btn btn-sm btn-outline-warning favorite-btn" title="Toggle favorite" aria-label="Toggle favorite for ${escapeHTML(b.name)}"><i class="bi ${favorite ? "bi-bookmark-star-fill" : "bi-bookmark"}"></i></button>
        </div>
      </div>`;
    card.querySelector(".review-btn").addEventListener("click", () => openReviews(b));
    card.querySelector(".favorite-btn").addEventListener("click", () => {
      const next = getFavorites();
      if (next.includes(b.id)) next.splice(next.indexOf(b.id), 1);
      else next.push(b.id);
      saveFavorites(next);
      refreshUI();
    });
    if (isAdmin) {
      card.querySelector(".admin-edit-btn").addEventListener("click", () => openEdit(b));
      card.querySelector(".admin-delete-btn").addEventListener("click", () => openDelete(b));
    }
    container.append(card);
  }
}
