const cards = document.querySelectorAll(".icon");
cards.forEach((card) => {
  card.addEventListener("touchstart", () => {
    card.style.transform = "scale(1.04)";
    card.style.transition = "transform 0.2s ease";
  });
  card.addEventListener("touchend", () => {
    card.style.transform = "scale(1)";
  });
});
