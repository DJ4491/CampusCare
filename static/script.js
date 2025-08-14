const cards = document.querySelectorAll(".icon");
cards.forEach((card) => {
  card.addEventListener("mousedown", () => {
    card.style.transform = "scale(1.04)";
    card.style.transition = "transform 0.2s ease";
  });
  card.addEventListener("mouseup", () => {
    card.style.transform = "scale(1)";
  });
});
