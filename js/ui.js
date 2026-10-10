import { getFavorites, saveFavorites } from "./storage.js";

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function safeWebsite(value) {
  try { const u = new URL(value); return ["http:", "https:"].includes(u.protocol) ? u.href : ""; }
  catch { return ""; }
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
    const website = safeWebsite(b.website);
    const hasReviews = Number(b.reviewCount) > 0;
    card.innerHTML = `
      <div class="card cc-business-card p-3 shadow-sm h-100 d-flex flex-column justify-content-between">
        <div>
          <div class="d-flex justify-content-between align-items-start">
            <div>
              <h5 class="card-title mb-2">${escapeHTML(b.name)}</h5>
              <span class="badge cc-category me-1">${escapeHTML(b.category)}</span>
              <span class="badge cc-tag">${escapeHTML(b.subcategory)}</span>
            </div>
            ${isAdmin ? `<div class="d-flex gap-1">
              <button type="button" class="btn btn-sm btn-outline-secondary admin-edit-btn" title="Edit demo business"><i class="bi bi-pencil-square"></i> Edit</button>
              <button type="button" class="btn btn-sm btn-outline-danger admin-delete-btn" title="Delete demo business"><i class="bi bi-trash-fill"></i> Delete</button>
            </div>` : ""}
          </div>
          <p class="mt-3 mb-2 text-secondary">${escapeHTML(b.description)}</p>
          ${b.address ? `<p class="small text-muted mb-1"><i class="bi bi-geo-alt"></i> ${escapeHTML(b.address)}</p>` : ""}
          ${b.hours ? `<p class="small text-muted mb-1"><i class="bi bi-clock"></i> ${escapeHTML(b.hours)}</p>` : ""}
          ${b.phone ? `<p class="small text-muted mb-1"><i class="bi bi-telephone"></i> ${escapeHTML(b.phone)}</p>` : ""}
          ${website ? `<p class="small mb-2"><a href="${escapeHTML(website)}" target="_blank" rel="noopener noreferrer">Visit website <i class="bi bi-box-arrow-up-right"></i></a></p>` : ""}
          ${deals.length ? `<div class="cc-deal my-2 small"><strong><i class="bi bi-tag-fill"></i> ${deals.length} sample offer${deals.length !== 1 ? "s" : ""}</strong><div class="mt-1">${deals.slice(0, 2).map(d=>`<div>• ${escapeHTML(d)}</div>`).join("")}</div></div>` : ""}
          <p class="mb-1 cc-rating">${hasReviews ? `★ ${escapeHTML(b.rating || "0.0")} <span class="text-muted fw-normal small">(${escapeHTML(b.reviewCount)} sample ratings)</span>` : `<span class="text-muted small fw-normal">Not yet rated · demo listing</span>`}</p>
        </div>
        <div class="mt-2 d-flex justify-content-between align-items-center">
          <button type="button" class="btn cc-action btn-outline-primary btn-sm review-btn"><i class="fa fa-comment"></i> Reviews</button>
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
