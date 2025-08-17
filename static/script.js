const cards = document.querySelectorAll(".icon");
// Update your card event listeners to handle both touch and click
cards.forEach((card) => {
  // Touch events for mobile
  card.addEventListener("touchstart", handleTouchStart);
  card.addEventListener("touchend", handleTouchEnd);

  // Click events for desktop
  card.addEventListener("click", function () {
    const page = this.getAttribute("data-page");
    if (page) loadpage(page);
  });
});

function handleTouchStart() {
  this.style.transform = "scale(1.04)";
  this.style.transition = "transform 0.2s ease";
}

function handleTouchEnd() {
  this.style.transform = "scale(1)";
}
function loadpage(page) {
  // Remove active class from all icons
  const icons = document.querySelectorAll(".b_icons");
  icons.forEach((icon) => icon.classList.remove("active"));

  // Add active to the clicked icon
  const activeIcon = document.getElementById(`${page}-icon`);
  if (activeIcon) {
    activeIcon.classList.add("active");
  }

  // Fetch and load content
  fetch(`/content/${page}`)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.text();
    })
    .then((html) => {
      document.getElementById("content").innerHTML = html;
    })
    .catch((error) => {
      console.error("Fetch error:", error);
      document.getElementById("content").innerHTML =
        "<p>Error loading content.</p>";
    });
}

// Load home by default on page load
document.addEventListener("DOMContentLoaded", () => {
  loadpage("home");
});
