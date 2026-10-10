export function populateFilters(data) {
  const categorySelect = document.getElementById("categoryFilter");
  const categories = [...new Set(data.map(b => b.category).filter(Boolean))].sort();
  categorySelect.replaceChildren(
    new Option("All Categories", "all"),
    ...categories.map(cat => new Option(cat, cat))
  );
}

export function populateSubcategories(data, selectedCategory = "all") {
  const subcategorySelect = document.getElementById("subcategoryFilter");
  const matching = selectedCategory === "all" ? data : data.filter(b => b.category === selectedCategory);
  const subcategories = [...new Set(matching.map(b => b.subcategory).filter(Boolean))].sort();
  subcategorySelect.replaceChildren(
    new Option("All Subcategories", "all"),
    ...subcategories.map(sub => new Option(sub, sub))
  );
}
