const assets = "/assets";

let ingredients = [
  {
    id: 1,
    category: "Básicos",
    name: "Pasta",
    amount: "500 g",
    image: `${assets}/profile-b3c1b.png`,
  },
  {
    id: 2,
    category: "Frescos",
    name: "Tomate",
    amount: "600 g",
    image: `${assets}/profile-822e9.png`,
  },
  {
    id: 3,
    category: "Frescos",
    name: "Ajo",
    amount: "1 cabeza",
    image: `${assets}/profile-aa8ce.png`,
  },
  {
    id: 4,
    category: "Básicos",
    name: "Aceite de oliva",
    amount: "250 ml",
    image: `${assets}/profile-ce856.png`,
  },
  {
    id: 5,
    category: "Básicos",
    name: "Sal",
    amount: "200 g",
    image: `${assets}/profile-d362b.png`,
  },
  {
    id: 6,
    category: "Lácteos",
    name: "Parmesano",
    amount: "80 g",
    image: `${assets}/profile-f37c1.png`,
  },
  {
    id: 7,
    category: "Frescos",
    name: "Huevos",
    amount: "6 unidades",
    image: `${assets}/profile-a654d.png`,
  },
  {
    id: 8,
    category: "Lácteos",
    name: "Leche",
    amount: "1 l",
    image: `${assets}/profile-a74f8.png`,
  },
];

const grid = document.querySelector("#ingredient-grid");
const toast = document.querySelector("#profile-toast");
const filters = [...document.querySelectorAll("#inventory-filters button")];
const sort = document.querySelector("#inventory-sort");
let activeCategory = "Todos";

function escapeHTML(value) {
  const element = document.createElement("span");
  element.textContent = value;
  return element.innerHTML;
}

function announce(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2200);
}

function updateCounts() {
  ["Todos", "Frescos", "Básicos", "Lácteos"].forEach((category) => {
    const button = filters.find((item) => item.dataset.category === category);
    const count =
      category === "Todos"
        ? ingredients.length
        : ingredients.filter((item) => item.category === category).length;
    button.querySelector("b").textContent = count;
  });
  document.querySelectorAll(".pantry-total").forEach((total) => {
    total.textContent = ingredients.length;
  });
}

function renderIngredients() {
  let visible =
    activeCategory === "Todos"
      ? [...ingredients]
      : ingredients.filter((item) => item.category === activeCategory);
  if (sort.value === "name") visible.sort((a, b) => a.name.localeCompare(b.name, "es"));

  grid.innerHTML = visible
    .map(
      (item) => `
        <article class="ingredient-card" data-id="${item.id}">
          <header>
            <small>${escapeHTML(item.category.toUpperCase())}</small>
            <button class="delete-ingredient" type="button" aria-label="Eliminar ${escapeHTML(item.name)}">
              <img src="${assets}/profile-ab365.svg" alt="" width="15" height="15" />
            </button>
          </header>
          <img class="ingredient-photo" src="${item.image}" alt="${escapeHTML(item.name)}" />
          <h3>${escapeHTML(item.name)}</h3>
          <button class="edit-amount" type="button" aria-label="Editar cantidad de ${escapeHTML(item.name)}">
            <span>${escapeHTML(item.amount)}</span>
            <img src="${assets}/profile-166ef.svg" alt="" width="14" height="14" />
          </button>
        </article>`,
    )
    .join("");

  if (!visible.length)
    grid.innerHTML = '<p class="inventory-empty">No hay ingredientes en esta categoría.</p>';
  updateCounts();
}

filters.forEach((button) => {
  button.addEventListener("click", () => {
    activeCategory = button.dataset.category;
    filters.forEach((item) => item.classList.toggle("active", item === button));
    renderIngredients();
  });
});

sort.addEventListener("change", renderIngredients);

grid.addEventListener("click", (event) => {
  const card = event.target.closest(".ingredient-card");
  if (!card) return;
  const ingredient = ingredients.find((item) => item.id === Number(card.dataset.id));

  if (event.target.closest(".delete-ingredient")) {
    ingredients = ingredients.filter((item) => item.id !== ingredient.id);
    renderIngredients();
    announce(`${ingredient.name} se quitó de tu alacena`);
  }

  if (event.target.closest(".edit-amount")) {
    const value = window.prompt(`Nueva cantidad para ${ingredient.name}:`, ingredient.amount);
    if (value?.trim()) {
      ingredient.amount = value.trim();
      renderIngredients();
      announce(`Cantidad de ${ingredient.name} actualizada`);
    }
  }
});

document.querySelector("#ingredient-form").addEventListener("submit", (event) => {
  event.preventDefault();
  const name = document.querySelector("#ingredient-name").value.trim();
  const amount = document.querySelector("#ingredient-amount").value.trim();
  const unit = document.querySelector("#ingredient-unit").value;
  const category = document.querySelector("#ingredient-category").value;
  if (!name || !amount || !category) return;

  const existing = ingredients.find((item) => item.name.toLowerCase() === name.toLowerCase());
  if (existing) {
    existing.amount = `${amount} ${unit}`;
    announce(`${existing.name} se actualizó en tu alacena`);
  } else {
    ingredients.push({
      id: Date.now(),
      category,
      name,
      amount: `${amount} ${unit}`,
      image: `${assets}/profile-b3c1b.png`,
    });
    announce(`${name} se añadió a tu alacena`);
  }
  event.target.reset();
  activeCategory = "Todos";
  filters.forEach((item) => item.classList.toggle("active", item.dataset.category === "Todos"));
  renderIngredients();
});

const dialog = document.querySelector("#profile-dialog");
const profileForm = document.querySelector("#profile-form");
document.querySelector("#edit-profile").addEventListener("click", () => dialog.showModal());
profileForm.addEventListener("submit", (event) => {
  if (event.submitter?.value === "cancel") return;
  event.preventDefault();
  const name = document.querySelector("#profile-name-input").value.trim();
  const bio = document.querySelector("#profile-bio-input").value.trim();
  if (!name) return;
  document.querySelector("#profile-name").textContent = name;
  document.querySelector("#profile-initial").textContent = name.charAt(0).toUpperCase();
  document.querySelector("#profile-bio").textContent = bio;
  dialog.close();
  announce("Tu perfil se actualizó");
});

renderIngredients();


// =====================================================
// RECETARIO PERSONAL: crear, consultar, editar y borrar
// =====================================================
const recipeStorageKey = "bocadito-profile-recipes-v1";
const recipeGrid = document.querySelector("#my-recipes-grid");
const recipeDialog = document.querySelector("#recipe-dialog");
const recipeForm = document.querySelector("#recipe-form");
const recipeDetail = document.querySelector("#recipe-detail-panel");
const recipeSearch = document.querySelector("#recipe-search-profile");
let editingRecipeId = null;

function loadPersonalRecipes() {
  try {
    const saved = JSON.parse(localStorage.getItem(recipeStorageKey) || "[]");
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}
let personalRecipes = loadPersonalRecipes();

function savePersonalRecipes() {
  localStorage.setItem(recipeStorageKey, JSON.stringify(personalRecipes));
}

function recipeEscape(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

function renderPersonalRecipes() {
  const query = recipeSearch.value.trim().toLocaleLowerCase("es");
  const visible = personalRecipes.filter((recipe) =>
    `${recipe.title} ${recipe.description} ${recipe.ingredients.join(" ")}`.toLocaleLowerCase("es").includes(query)
  );
  document.querySelector("#my-recipes-count").textContent =
    `${visible.length} ${visible.length === 1 ? "receta" : "recetas"}`;

  if (!visible.length) {
    recipeGrid.innerHTML = personalRecipes.length
      ? '<p class="recipes-empty">No encontramos recetas con esa búsqueda. Prueba con otra palabra. 🌷</p>'
      : '<div class="recipes-empty"><span>🍓</span><h3>Tu recetario empieza aquí</h3><p>Aún no has guardado recetas. Crea la primera y aparecerá en este espacio.</p><button class="add-ingredient" type="button" data-action="create">＋ Crear mi primera receta</button></div>';
    return;
  }

  recipeGrid.innerHTML = visible.map((recipe) => `
    <article class="personal-recipe-card">
      <div class="personal-recipe-art" aria-hidden="true">🍓</div>
      <div class="personal-recipe-copy">
        <span class="personal-recipe-tag">RECETA PERSONAL</span>
        <h3>${recipeEscape(recipe.title)}</h3>
        <p>${recipeEscape(recipe.description)}</p>
        <div class="personal-recipe-meta"><span>◷ ${recipe.time} min</span><span>♧ ${recipe.servings} porciones</span><span>🥕 ${recipe.ingredients.length} ingredientes</span></div>
        <div class="personal-recipe-actions">
          <button type="button" class="recipe-view-button" data-action="view" data-id="${recipe.id}">Ver receta</button>
          <button type="button" class="recipe-edit-button" data-action="edit" data-id="${recipe.id}" aria-label="Editar ${recipeEscape(recipe.title)}">Editar</button>
          <button type="button" class="recipe-delete-button" data-action="delete" data-id="${recipe.id}" aria-label="Eliminar ${recipeEscape(recipe.title)}">×</button>
        </div>
      </div>
    </article>`).join("");
}

function resetRecipeForm() {
  recipeForm.reset();
  editingRecipeId = null;
  document.querySelector("#recipe-dialog-title").textContent = "Crear receta";
}

function openRecipeForm(recipe = null) {
  resetRecipeForm();
  if (recipe) {
    editingRecipeId = recipe.id;
    document.querySelector("#recipe-dialog-title").textContent = "Editar receta";
    document.querySelector("#recipe-title-input").value = recipe.title;
    document.querySelector("#recipe-time-input").value = recipe.time;
    document.querySelector("#recipe-servings-input").value = recipe.servings;
    document.querySelector("#recipe-description-input").value = recipe.description;
    document.querySelector("#recipe-ingredients-input").value = recipe.ingredients.join("\\n");
    document.querySelector("#recipe-steps-input").value = recipe.steps;
  }
  recipeDialog.showModal();
}

function showRecipeDetail(id) {
  const recipe = personalRecipes.find((item) => item.id === id);
  if (!recipe) return;
  recipeDetail.hidden = false;
  recipeDetail.innerHTML = `
    <button class="recipe-back-button" type="button" data-action="back">← Volver a mis recetas</button>
    <div class="recipe-detail-inner">
      <span class="personal-recipe-tag">TU RECETA</span>
      <h3>${recipeEscape(recipe.title)}</h3>
      <p class="recipe-detail-description">${recipeEscape(recipe.description)}</p>
      <div class="personal-recipe-meta"><span>◷ ${recipe.time} min</span><span>♧ ${recipe.servings} porciones</span></div>
      <div class="recipe-detail-columns">
        <section><h4>🥕 Ingredientes</h4><ul>${recipe.ingredients.map((item) => `<li>${recipeEscape(item)}</li>`).join("")}</ul></section>
        <section><h4>👩‍🍳 Preparación</h4><div class="recipe-detail-steps">${recipeEscape(recipe.steps).replace(/\n/g, "<br>")}</div></section>
      </div>
      <button class="recipe-edit-button" type="button" data-action="edit" data-id="${recipe.id}">Editar receta</button>
    </div>`;
  recipeDetail.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.querySelector("#create-recipe-button").addEventListener("click", () => openRecipeForm());
recipeSearch.addEventListener("input", renderPersonalRecipes);
recipeGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  const action = button.dataset.action;
  const id = Number(button.dataset.id);
  if (action === "create") openRecipeForm();
  if (action === "view") showRecipeDetail(id);
  if (action === "edit") {
    const recipe = personalRecipes.find((item) => item.id === id);
    if (recipe) openRecipeForm(recipe);
  }
  if (action === "delete") {
    const recipe = personalRecipes.find((item) => item.id === id);
    if (recipe && window.confirm(`¿Quieres eliminar "${recipe.title}" de tu recetario?`)) {
      personalRecipes = personalRecipes.filter((item) => item.id !== id);
      savePersonalRecipes();
      recipeDetail.hidden = true;
      renderPersonalRecipes();
      announce("La receta se eliminó de tu recetario");
    }
  }
});
recipeDetail.addEventListener("click", (event) => {
  const button = event.target.closest("[data-action]");
  if (!button) return;
  if (button.dataset.action === "back") {
    recipeDetail.hidden = true;
    document.querySelector("#mis-recetas").scrollIntoView({ behavior: "smooth" });
  }
  if (button.dataset.action === "edit") {
    const recipe = personalRecipes.find((item) => item.id === Number(button.dataset.id));
    if (recipe) openRecipeForm(recipe);
  }
});

recipeForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const ingredientsList = document.querySelector("#recipe-ingredients-input").value
    .split("\n").map((item) => item.trim()).filter(Boolean);
  if (!ingredientsList.length) {
    announce("Añade al menos un ingrediente a tu receta");
    return;
  }
  const wasEditing = editingRecipeId !== null;
  const recipeData = {
    id: editingRecipeId ?? Date.now(),
    title: document.querySelector("#recipe-title-input").value.trim(),
    time: Number(document.querySelector("#recipe-time-input").value),
    servings: Number(document.querySelector("#recipe-servings-input").value),
    description: document.querySelector("#recipe-description-input").value.trim(),
    ingredients: ingredientsList,
    steps: document.querySelector("#recipe-steps-input").value.trim()
  };
  if (editingRecipeId !== null) {
    personalRecipes = personalRecipes.map((recipe) => recipe.id === editingRecipeId ? recipeData : recipe);
  } else {
    personalRecipes.unshift(recipeData);
  }
  savePersonalRecipes();
  recipeDialog.close();
  resetRecipeForm();
  recipeDetail.hidden = true;
  renderPersonalRecipes();
  announce(wasEditing ? "Tu receta se actualizó" : "¡Tu receta se guardó en Mis recetas! ♡");
});

function closeRecipeDialog() {
  recipeDialog.close();
  resetRecipeForm();
}
document.querySelector("#close-recipe-dialog").addEventListener("click", closeRecipeDialog);
document.querySelector("#cancel-recipe-dialog").addEventListener("click", closeRecipeDialog);

renderPersonalRecipes();
