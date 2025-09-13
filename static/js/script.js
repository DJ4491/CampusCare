// after fetch replace, you can still call any extra init
//note:-####################### Transition and Load Page ####################################
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

  // Step 1: fade out
  container.classList.add("fade-out");

  // Step 2: wait same duration as CSS (400ms here)
  setTimeout(() => {
    fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then((res) => res.text())
      .then((html) => {
        // swap content after fade-out
        container.innerHTML = html;

        // Step 3: fade back in
        container.classList.remove("fade-out");
        container.classList.add("fade-in");

        // clean up fade-in
        setTimeout(() => {
          container.classList.remove("fade-in");
        }, 400);

        // push history
        history.pushState(null, "", url);

        if (page === "my_reports") {
          initReports();
        }
      })
      .catch((err) => console.error("Error loading page:", err));
  }, 400); // match CSS transition time
}

// handle back/forward
window.addEventListener("popstate", () => {
  loadpage(location.pathname.replace("/", "").replace("/", ""));
});

//note:-####################### Transition and Load Page ####################################

//@important:-  ############################## Report Page ####################################

function initReports() {
  const reports = [
    {
      id: 1,
      author: "Dhruv",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Dhruv",
      time: "2h",
      title: "Annual Report 2023",
      desc: "An overview of performance & growth metrics.",
      likes: 12,
      liked: false,
      comments: ["Great work!", "Very detailed 👌"],
    },
    {
      id: 2,
      author: "Sneha",
      avatar: "https://api.dicebear.com/7.x/thumbs/svg?seed=Sneha",
      time: "Yesterday",
      title: "Q1 Market Analysis",
      desc: "Trends and insights for Q1 across all sectors.",
      likes: 8,
      liked: false,
      comments: ["This helps a lot!", "Looking forward to Q2."],
    },
  ];

  const feed = document.getElementById("feed");

  function renderFeed() {
    feed.innerHTML = "";
    reports.forEach((r, index) => {
      const post = document.createElement("div");
      post.className = "post";

      post.innerHTML = `
          <div class = "container">
            <div class="post-header">
              <img src="${r.avatar}" class="avatar">
              <div>
                <div class="author">${r.author}</div>
                <div class="time">${r.time}</div>
              </div>
            </div>
            <div class="post-body">
              <div class="post-title">${r.title}</div>
              <div class="post-desc">${r.desc}</div>
            </div>
            <div class="actions">
              <button class="like-btn ${
                r.liked ? "liked" : ""
              }" onclick="toggleLike(${index})">❤️ ${r.likes}</button>
              <button>💬 ${r.comments.length}</button>
            </div>
            <div class="comments">
              ${r.comments
                .map((c) => `<div class="comment">${c}</div>`)
                .join("")}
            </div>
            <div class="comment-input">
              <input type="text" id="comment-${index}" placeholder="Add a comment...">
              <button onclick="addComment(${index})">Post</button>
            </div>
          </div>
          `;
      feed.appendChild(post);
    });
  }
  window.toggleLike = function (i) {
    reports[i].liked = !reports[i].liked;
    reports[i].likes += reports[i].liked ? 1 : -1;
    renderFeed();
  };

  window.addComment = function (i) {
    const input = document.getElementById(`comment-${i}`);
    if (input.value.trim()) {
      reports[i].comments.push(input.value.trim());
      input.value = "";
      renderFeed();
    }
  };

  renderFeed();
}
// If user directly loads /reports/, initialize immediately
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("my_reports")) {
    initReports();
  }
});
