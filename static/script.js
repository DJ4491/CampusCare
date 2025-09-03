const cards = document.querySelectorAll(".icon");
cards.forEach((card) => {
  card.addEventListener("touchstart", () => {
    card.style.transform = "scale(1.04)";
    card.style.transition = "transform 2s ease-in-out";
  });
  card.addEventListener("touchend", () => {
    card.style.transform = "scale(1)";
  });
});
function loadpage(page) {
  let url = page === "" ? "/" : "/" + page;
  let container = document.getElementById("main-content");

  // Add fade-out animation
  container.classList.add("fade-out");

  fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
    .then((res) => res.text())
    .then((html) => {
      setTimeout(() => {
        // Replace content when fade-out ends
        container.innerHTML = html;

        // Trigger fade-in
        container.classList.remove("fade-out");
        container.classList.add("fade-in");

        // Don't force-remove fade-in too soon
        container.addEventListener(
          "transitionend",
          () => container.classList.remove("fade-in"),
          { once: true }
        );

        history.pushState(null, "", url);
      }, 300); // match CSS transition duration
    })
    .catch((err) => console.error("Error loading page:", err));

  // Handle back/forward buttons
  window.addEventListener("popstate", () => {
    loadpage(location.pathname.replace("/", ""));
  });
}
