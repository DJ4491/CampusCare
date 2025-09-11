// after fetch replace, you can still call any extra init
function afterReplace(container) {
  // only necessary for third-party inits or element-specific setup
}
document.getElementById("main-content").addEventListener("click", (e) => {
  loadpage(location.pathname.replace("/", "").replace("/", ""));
});

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
  let url = page === "" ? "/" : "/" + page + "/";
  let container = document.getElementById("main-content");

  // fade-out
  container.classList.add("fade-out");

  fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
    .then((res) => res.text())
    .then((html) => {
      setTimeout(() => {
        container.innerHTML = html; // replace content
        container.classList.remove("fade-out");
        container.classList.add("fade-in");

        // remove fade-in after transition
        container.addEventListener(
          "transitionend",
          () => container.classList.remove("fade-in"),
          { once: true }
        );

        // update URL + history
        history.pushState(null, "", url);
      }, 300); // match your CSS transition duration
    })
    .catch((err) => console.error("Error loading page:", err));
}

// handle back/forward
window.addEventListener("popstate", () => {
  loadpage(location.pathname.replace("/", "").replace("/", ""));
});
