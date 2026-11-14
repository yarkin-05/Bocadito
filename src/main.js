const filters = [...document.querySelectorAll(".filter")];
const recipes = [...document.querySelectorAll(".recipe-item")];
const search = document.querySelector("#recipe-search");
const pantryOnly = document.querySelector("#pantry-only");
const resultCount = document.querySelector("#result-count");
const featured = document.querySelector(".featured");
const emptyState = document.querySelector("#empty-state");
const toast = document.querySelector("#toast");
let activeFilter = "all";

function normalize(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

function updateRecipes() {
  const query = normalize(search.value.trim());
  let visibleCount = 0;

  recipes.forEach((recipe) => {
    const matchesText = normalize(recipe.dataset.name).includes(query);
    const matchesFilter =
      activeFilter === "all" || recipe.dataset.tags.split(" ").includes(activeFilter);
    const matchesPantry = !pantryOnly.checked || recipe.dataset.pantry === "true";
    const visible = matchesText && matchesFilter && matchesPantry;
    recipe.hidden = !visible;
    if (visible) visibleCount += 1;
  });

  resultCount.textContent = visibleCount;
  emptyState.hidden = visibleCount !== 0;
  document.body.classList.toggle("featured-hidden", featured.hidden);
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    filters.forEach((filter) => filter.classList.toggle("active", filter === button));
    updateRecipes();
  });
});

search.addEventListener("input", updateRecipes);
pantryOnly.addEventListener("change", updateRecipes);

document.querySelectorAll(".favorite").forEach((button) => {
  button.addEventListener("click", () => {
    const saved = button.classList.toggle("saved");
    button.textContent = saved ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(saved));
    toast.textContent = saved
      ? "Receta guardada en Mis recetas"
      : "Receta eliminada de Mis recetas";
    toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 2200);
  });
});

document.querySelector(".more-filters").addEventListener("click", () => {
  document.querySelector(".filter-row").classList.toggle("expanded");
});
