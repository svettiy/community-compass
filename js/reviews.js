import { loadReviews, postReview } from "./api.js";

let selectedBusiness = null;
let captchaResult = null;
let onReviewSaved = () => {};

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"})[c]);
}
function generateCaptcha() {
  const a = 1 + Math.floor(Math.random() * 10);
  const b = 1 + Math.floor(Math.random() * 10);
  document.getElementById("captchaQuestion").textContent = `${a} + ${b} = ?`;
  return a + b;
}
export async function openReviewModal(business) {
  selectedBusiness = business;
  document.getElementById("modalBusinessName").textContent = business.name;
  document.getElementById("reviewName").value = "";
  document.getElementById("reviewText").value = "";
  document.getElementById("reviewRating").value = "";
  document.getElementById("captchaAnswer").value = "";
  captchaResult = generateCaptcha();
  await loadReviewDisplay(business.id);
  window.bootstrap.Modal.getOrCreateInstance(document.getElementById("reviewModal")).show();
}
export async function loadReviewDisplay(businessId, page = 1, pageSize = 5) {
  const reviews = await loadReviews(businessId);
  const container = document.getElementById("reviewsList");
  container.replaceChildren();
  document.getElementById("reviewCount").textContent = reviews.length;
  if (!reviews.length) {
    const placeholder = document.createElement("p");
    placeholder.className = "small text-muted";
    placeholder.textContent = "No written reviews are available yet. Some sample listings show historical summary ratings without review text.";
    container.append(placeholder);
  }
  const segment = reviews.slice((page - 1) * pageSize, page * pageSize);
  for (const r of segment) {
    const node = document.createElement("div");
    node.className = "border rounded p-2 mb-2";
    const date = r.created && !Number.isNaN(Date.parse(r.created)) ? new Date(r.created).toLocaleDateString() : "";
    node.innerHTML = `<strong>⭐ ${escapeHTML(r.rating)}</strong> <small class="text-muted">${escapeHTML(date)}</small><p class="mb-0 mt-1">${escapeHTML(r.text)}</p><small class="text-primary">— ${escapeHTML(r.name || "Anonymous")}</small>`;
    container.append(node);
  }
  const totalPages = Math.ceil(reviews.length / pageSize);
  if (totalPages > 1) {
    const nav = document.createElement("div");
    nav.className = "d-flex gap-2 justify-content-center mt-2";
    for (let p = 1; p <= totalPages; p++) {
      const button = document.createElement("button");
      button.className = p === page ? "btn btn-primary btn-sm" : "btn btn-outline-secondary btn-sm";
      button.textContent = String(p);
      button.addEventListener("click", () => loadReviewDisplay(businessId, p, pageSize));
      nav.append(button);
    }
    container.append(nav);
  }
}
export function setupReviewModal({onSaved = () => {}} = {}) {
  onReviewSaved = onSaved;
  document.getElementById("submitReviewBtn").addEventListener("click", async () => {
    const text = document.getElementById("reviewText").value.trim();
    const name = document.getElementById("reviewName").value.trim() || "Anonymous";
    const rating = Number(document.getElementById("reviewRating").value);
    const captcha = document.getElementById("captchaAnswer");
    if (!text || !Number.isInteger(rating) || rating < 1 || rating > 5) {
      alert("Please add a review and select a rating from 1 to 5."); return;
    }
    if (captcha.value.trim() === "" || Number(captcha.value) !== captchaResult) {
      alert("Incorrect CAPTCHA. Try the new question.");
      captcha.value = ""; captchaResult = generateCaptcha(); return;
    }
    try {
      await postReview({ businessId: selectedBusiness.id, name, text, rating, created: new Date().toISOString() });
      await onReviewSaved();
      await loadReviewDisplay(selectedBusiness.id);
      document.getElementById("reviewText").value = "";
      document.getElementById("reviewRating").value = "";
      captcha.value = ""; captchaResult = generateCaptcha();
      alert("Demo review saved in this browser only.");
    } catch (error) { alert(error.message || "Unable to save review."); }
  });
}
