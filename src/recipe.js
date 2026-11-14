const toast = document.querySelector("#recipe-toast");
let portions = 2;

function announce(message) {
  toast.textContent = message;
  toast.classList.add("show");
  window.setTimeout(() => toast.classList.remove("show"), 2300);
}

function updatePortions() {
  document.querySelector("#portion-count").textContent = portions;
  const multiplier = portions / 2;
  document.querySelectorAll(".recipe-ingredient").forEach((card) => {
    const amount = Number(card.dataset.base) * multiplier;
    card.querySelectorAll(".scaled-amount").forEach((value) => {
      value.textContent = Number.isInteger(amount) ? amount : amount.toFixed(1);
    });
  });
  document.querySelectorAll("[data-shopping-base]").forEach((value) => {
    const amount = Number(value.dataset.shoppingBase) * multiplier;
    value.textContent = Number.isInteger(amount) ? amount : amount.toFixed(1);
  });
}

document.querySelector("#less-portions").addEventListener("click", () => {
  portions = Math.max(1, portions - 1);
  updatePortions();
});
document.querySelector("#more-portions").addEventListener("click", () => {
  portions = Math.min(8, portions + 1);
  updatePortions();
});

document.querySelector("#save-recipe").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const saved = button.classList.toggle("saved");
  button.querySelector("span").textContent = saved ? "Receta guardada" : "Guardar receta";
  announce(saved ? "Guardada en Mis favoritas" : "Eliminada de Mis favoritas");
});

document.querySelector("#share-recipe").addEventListener("click", async () => {
  const data = {
    title: document.title,
    text: "Pasta con tomate y albahaca",
    url: window.location.href,
  };
  try {
    if (navigator.share) await navigator.share(data);
    else {
      await navigator.clipboard.writeText(window.location.href);
      announce("Enlace copiado");
    }
  } catch (error) {
    if (error.name !== "AbortError") announce("No se pudo compartir");
  }
});

document.querySelector("#add-shopping").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const added = button.classList.toggle("added");
  button.querySelector("span").textContent = added
    ? "Añadidos a mi lista ✓"
    : "Añadir 2 a mi lista";
  announce(
    added ? "Albahaca y pimienta añadidas a tu lista" : "Ingredientes eliminados de tu lista",
  );
});

document.querySelector("#cooking-mode").addEventListener("click", (event) => {
  const enabled = document.body.classList.toggle("cooking-mode");
  event.currentTarget.querySelector("span").textContent = enabled
    ? "Salir del modo cocina"
    : "Modo cocina";
  if (enabled) document.querySelector("#preparation-title").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#mark-cooked").addEventListener("click", (event) => {
  const button = event.currentTarget;
  const cooked = button.classList.toggle("cooked");
  button.querySelector("span").textContent = cooked ? "Receta cocinada ✓" : "Marcar como cocinada";
  announce(
    cooked ? "¡Buen provecho! Tu alacena quedó actualizada" : "La receta volvió a quedar pendiente",
  );
});
