const cards = document.querySelectorAll(".icon");
cards.forEach((card) => {
  card.addEventListener("mousedown", () => {
    card.style.transform = "scale(1.03)";
    card.style.transition = "transform 0.2s ease";
  });
  card.addEventListener("mouseup", () => {
    card.style.transform = "scale(1)";
  });
});
