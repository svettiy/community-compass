import { loadBusinesses, saveBusiness, deleteBusiness, resetLocalChanges } from "./api.js?v=4";
import { filterData } from "./filters.js";
import { renderList } from "./ui.js?v=4";
import { openReviewModal, setupReviewModal } from "./reviews.js?v=4";
import { populateFilters, populateSubcategories } from "./categories.js";

let data = [];
window.isAdmin = false;
let editingBusiness = null;
const el = id => document.getElementById(id);

export function refreshUI() {
  const filtered = filterData(data, el("searchInput").value, el("categoryFilter").value,
    el("subcategoryFilter").value, el("viewFilter").value);
  const sortMode = el("sortFilter")?.value || "default";
  if (sortMode === "rating") filtered.sort((a, b) => Number(b.rating || 0) - Number(a.rating || 0));
  if (sortMode === "reviews") filtered.sort((a, b) => Number(b.reviewCount || 0) - Number(a.reviewCount || 0));
  if (sortMode === "az") filtered.sort((a, b) => a.name.localeCompare(b.name));
  renderList(filtered, openReviewModal, refreshUI, openEditBusiness, openDeleteBusiness);
  el("resultsCount").textContent = `${filtered.length} of ${data.length} businesses`;
  el("heroListingCount").textContent = data.length;
  el("heroCategoryCount").textContent = new Set(data.map(b => b.category).filter(Boolean)).size;
}
async function reload({preserveFilters = true} = {}) {
  const category = preserveFilters ? el("categoryFilter").value : "all";
  const subcategory = preserveFilters ? el("subcategoryFilter").value : "all";
  data = await loadBusinesses();
  populateFilters(data);
  if ([...el("categoryFilter").options].some(o => o.value === category)) el("categoryFilter").value = category;
  populateSubcategories(data, el("categoryFilter").value);
  if ([...el("subcategoryFilter").options].some(o => o.value === subcategory)) el("subcategoryFilter").value = subcategory;
  refreshUI();
}
function addDealRow(value = "") {
  const row = document.createElement("div");
  row.className = "d-flex align-items-center gap-2 mb-2";
  const input = document.createElement("input");
  input.type = "text"; input.className = "form-control form-control-sm admin-deal-input";
  input.value = value; input.placeholder = "Deal description";
  const remove = document.createElement("button");
  remove.type = "button"; remove.className = "btn btn-outline-danger btn-sm";
  remove.textContent = "Remove";
  remove.addEventListener("click", () => row.remove());
  row.append(input, remove);
  el("adminDealsList").append(row);
}
function openEditor(business = null) {
  if (!window.isAdmin) return;
  if (!window.bootstrap?.Modal) { alert("Editor requires Bootstrap to load. Please check your internet connection and refresh."); return; }
  editingBusiness = business;
  el("adminBusinessModalTitle").textContent = business ? `Edit: ${business.name}` : "Add Business";
  el("adminBizName").value = business?.name || "";
  el("adminBizDescription").value = business?.description || "";
  el("adminBizCategory").value = business?.category || "";
  el("adminBizSubcategory").value = business?.subcategory || "";
  el("adminBizAddress").value = business?.address || "";
  el("adminBizWebsite").value = business?.website || "";
  el("adminBizPhone").value = business?.phone || "";
  el("adminBizHours").value = business?.hours || "";
  el("adminDealsList").replaceChildren();
  (business?.deals?.length ? business.deals : [""]).forEach(addDealRow);
  window.bootstrap.Modal.getOrCreateInstance(el("adminBusinessModal")).show();
}
function openEditBusiness(business) { openEditor(business); }
async function openDeleteBusiness(business) {
  if (!window.isAdmin || !confirm(`Delete "${business.name}" from this browser?`)) return;
  try { await deleteBusiness(business.id); await reload();
    el("editorStatus").textContent = `Deleted ${business.name} from this browser. Changes are not shared.`; }
  catch (error) { alert(error.message); }
}
async function saveEditedBusiness() {
  const payload = {
    name: el("adminBizName").value.trim(), description: el("adminBizDescription").value.trim(),
    category: el("adminBizCategory").value.trim(), subcategory: el("adminBizSubcategory").value.trim(),
    address: el("adminBizAddress").value.trim(), website: el("adminBizWebsite").value.trim(),
    phone: el("adminBizPhone").value.trim(), hours: el("adminBizHours").value.trim(),
    deals: [...document.querySelectorAll(".admin-deal-input")].map(i => i.value.trim()).filter(Boolean)
  };
  if (!payload.name || !payload.description || !payload.category || !payload.subcategory) {
    alert("Complete name, description, category, and subcategory."); return;
  }
  if (payload.website) {
    try {
      const u = new URL(payload.website);
      if (!["http:", "https:"].includes(u.protocol)) throw new Error("Invalid protocol");
    } catch { alert("Enter a full website address beginning with https://, or leave it blank."); return; }
  }
  try {
    await saveBusiness(payload, editingBusiness?.id ?? null);
    await reload();
    window.bootstrap.Modal.getOrCreateInstance(el("adminBusinessModal")).hide();
    el("editorStatus").textContent = `Saved ${payload.name} in this browser only. To publish permanent changes for all visitors, edit db.json in GitHub.`;
  } catch (error) { alert(error.message); }
}
function updateEditorButtons() {
  el("adminBadge").classList.toggle("d-none", !window.isAdmin);
  el("adminPanelBtn").classList.toggle("d-none", !window.isAdmin);
  el("adminLogoutBtn").classList.toggle("d-none", !window.isAdmin);
  el("adminLoginBtn").classList.toggle("d-none", window.isAdmin);
  el("editorStatus").classList.toggle("d-none", !window.isAdmin);
  if (window.isAdmin) el("editorStatus").innerHTML = "<strong>Editor active.</strong> Select Edit or Delete on any card, or Add Business above. Your changes save only in this browser, not to the published db.json.";
  refreshUI();
}
function showError(error) {
  const box = el("loadError");
  box.classList.remove("d-none");
  box.textContent = `Cannot load Community Compass: ${error.message}. Serve this folder over HTTP rather than opening index.html as a file.`;
  console.error(error);
}
document.addEventListener("DOMContentLoaded", async () => {
  try { await reload({preserveFilters:false}); }
  catch (error) { showError(error); return; }
  setupReviewModal({onSaved: reload});
  el("searchInput").addEventListener("input", refreshUI);
  el("categoryFilter").addEventListener("change", () => {
    populateSubcategories(data, el("categoryFilter").value); refreshUI();
  });
  el("subcategoryFilter").addEventListener("change", refreshUI);
  el("viewFilter").addEventListener("change", refreshUI);
  el("sortFilter").addEventListener("change", refreshUI);
  el("ownerEditorBtn").addEventListener("click", () => {
    window.isAdmin = true; updateEditorButtons(); openEditor();
  });
  el("adminLoginBtn").addEventListener("click", () => { window.isAdmin = true; updateEditorButtons(); });
  el("adminLogoutBtn").addEventListener("click", () => { window.isAdmin = false; updateEditorButtons(); });
  el("adminPanelBtn").addEventListener("click", () => openEditor());
  el("addDealBtn").addEventListener("click", () => addDealRow());
  el("saveBusinessBtn").addEventListener("click", saveEditedBusiness);
  el("resetLocalBtn").addEventListener("click", async () => {
    if (!confirm("Reset local reviews and business edits to the published db.json?")) return;
    try { await resetLocalChanges(); await reload({preserveFilters:false}); el("searchInput").value = ""; el("viewFilter").value = "all"; refreshUI();
      if (window.isAdmin) el("editorStatus").textContent = "Local changes reset to the current published db.json data."; }
    catch (error) { alert(error.message); }
  });
});
