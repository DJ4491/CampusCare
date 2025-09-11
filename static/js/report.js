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
            ${r.comments.map((c) => `<div class="comment">${c}</div>`).join("")}
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

function toggleLike(i) {
  reports[i].liked = !reports[i].liked;
  reports[i].likes += reports[i].liked ? 1 : -1;
  renderFeed();
}

function addComment(i) {
  const input = document.getElementById(`comment-${i}`);
  if (input.value.trim()) {
    reports[i].comments.push(input.value.trim());
    input.value = "";
    renderFeed();
  }
}

renderFeed();
