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
//################## Fab ##################################

const fab = document.getElementById("create-icon");
const fabOptions = document.getElementById("fab-options");

fab.addEventListener("click", () => {
  if (fabOptions.style.display === "flex") {
    fabOptions.style.display = "none";  
  } else {
    fabOptions.style.display = "flex";
  }
});

// Functions for the buttons
function createReport() {
  // Load your report page here
  loadpage("report");
  fabOptions.style.display = "none";
}

function recordVideo() {
  alert("Record Video clicked! 🎥");
  // You can integrate your video recording logic here
}
// ########################################################################

function loadpage(page) {
  let url = page === "" ? "/" : "/" + page + "/";
  let content = document.getElementById("main-content");
  let loader = document.getElementById("loader");
  const home = document.getElementById("home-icon");
  if (page === "") {
    home.removeAttribute("onclick");
  }
  if (page !== "") {
    home.setAttribute("onclick", "loadpage('')");
  }
  // Step 1: fade out current content
  content.classList.remove("fade-in");
  content.classList.add("fade-out");
  // Step 2: wait for fade out, then show loader
  setTimeout(() => {
    content.style.visibility = "hidden";
    loader.classList.remove("hidden");
    // Step 3: fetch new page content while loader is visible
    fetch(url, { headers: { "X-Requested-With": "XMLHttpRequest" } })
      .then((res) => res.text())
      .then((html) => {
        // Step 4: wait for a set duration before switching content
        setTimeout(() => {
          loader.classList.add("hidden");
          content.innerHTML = html;
          content.style.visibility = "visible";
          content.classList.remove("fade-out");
          void content.offsetWidth;
          content.classList.add("fade-in");
          // Push history
          history.pushState(null, "", url);

          if (page === "my_reports") {
            initReports();
          }
          if (page === "notifications") {
            initNotifications();
          }
          if (page === "user_profile") {
            initUserProfile();
          }
          if (page === "search") {
            initSearch();
          }
        }, 2400); // Adjust this delay as needed (e.g., 1000ms = 1 second)
      })
      .catch((err) => console.error("Error loading page:", err));
  }, 300); // Match initial fade-out duration
}
// handle back/forward
window.addEventListener("popstate", () => {
  loadpage(location.pathname.replace("/", "").replace("/", ""));
});

//note:-####################### Transition and Load Page ####################################

//@important:-  ############################## Report Feed ####################################

function initReports() {
  let reports = [];
  Promise.all([
    fetch("/api/reports/").then((res) => res.json()),
    fetch("/api/comments/").then((res) => res.json()),
  ])
    .then(([reportsData, commentsData]) => {
      // Step 1: Organize comments into a Object grouped by report_id
      const commentsByReport = {};
      commentsData.forEach((c) => {
        if (!commentsByReport[c.report_id]) {
          commentsByReport[c.report_id] = [];
        }
        commentsByReport[c.report_id].push(c.comment);
      });

      // Step 2: Attach correct comments to each report
      reports = reportsData.map((r) => ({
        ...r,
        liked: false,
        comments: commentsByReport[r.id] || [], // empty if none
      }));

      console.log("Reports with comments:", reports);
      renderFeed(reports); // pass reports into your feed renderer

      // Update time display every minute
      setInterval(() => {
        renderFeed();
      }, 60000); // 60000ms = 1 minute
    })
    .catch((err) => console.error("Error loading reports or comments:", err));
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
                <div class="time">${formatTimeAgo(r.time)}</div>
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
             <button class="Comment-div" onclick="toggleComments(${index})">💬 ${
        r.comments.length
      }</button>
            </div>
            <div class="comments" id = "comments-${index}" style="display:none;">
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

  window.toggleComments = function (i) {
    const commentsDiv = document.getElementById(`comments-${i}`);
    if (commentsDiv) {
      commentsDiv.style.display =
        commentsDiv.style.display === "none" ? "block" : "none";
    }
  };

  window.toggleLike = function (i) {
    reports[i].liked = !reports[i].liked;
    reports[i].likes += reports[i].liked ? 1 : -1;
    renderFeed();
  };

  window.addComment = function (i, comment) {
    const input = document.getElementById(`comment-${i}`);
    const text = input.value.trim();
    if (!text) {
      return;
    }
    const reportID = reports[i].id;
    fetch("/api/comments/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        report: reportID,
        comment: text,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Saved comment:", data);

        // Update UI immediately
        reports[i].comments.push(data.comment);

        renderFeed(); // full re-render
        input.value = "";
      })
      .catch((err) => console.error("Error posting comment:", err));
  };

  renderFeed();
}

// Function to format time to human readable format
function formatTimeAgo(dateString) {
  const now = new Date();
  const notificationTime = new Date(dateString);
  const diffInSeconds = Math.floor((now - notificationTime) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes}m ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours}h ago`;
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days}d ago`;
  } else {
    const weeks = Math.floor(diffInSeconds / 604800);
    return `${weeks}w ago`;
  }
}

//@important:- ############################### Notification Feed ############################

function initNotifications() {
  let notifications = [];
  const notification_feed = document.getElementById("msg_wrapper");

  function renderFeed() {
    notification_feed.innerHTML = "";
    notifications.forEach((n, index) => {
      const post_notification = document.createElement("div");
      post_notification.className = "post_notification";
      post_notification.innerHTML = `
        <div class="noti_list">
        <a class="noti_item unread" href="#">
          <div class="noti_icon">
            <img src="${n.type_icon}" alt="" width="30" height="30" />
          </div>
          <div class="noti_content">
            <p class="noti_title">${n.title}</p>
            <p class="noti_body">${n.desc}</p>
            <span class="noti_meta">${formatTimeAgo(n.time)}</span>
          </div>
          <span class="noti_dot" aria-hidden="${n.isLatest}"></span>
        </a>
        </div>
      `;
      notification_feed.appendChild(post_notification);
    });
  }

  fetch("/api/notifications")
    .then((res) => res.json())
    .then((notes) => {
      notifications = notes.map((n) => ({
        ...n,
        isLatest: false,
      }));
      renderFeed(); // Call renderFeed after data is loaded

      // Update time display every minute
      setInterval(() => {
        renderFeed();
      }, 60000); // 60000ms = 1 minute
    })
    .catch((error) => {
      console.error("Error fetching notifications:", error);
    });
}

function initUserProfile() {
  let userData = [
    {
      pfp: "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fwallpapers.com%2Fimages%2Fhd%2Fpfp-pictures-ph6qxvz14p4uvj2j.jpg&f=1&nofb=1&ipt=3a6b6418b7e35569da64e680a1fc79cc6da0b827a8b84ad6d8a3563557dd",
      username: "Minakshi Joshi",
      aboutme:
        "Hey there ! fellas, I don't think I'm gonna do smth today. Just eat and relaaaax",
      user_email: "Meenu@gmail.com",
    },
  ];
  const user_feed = document.getElementById("user_feed");

  function renderFeed() {
    user_feed.innerHTML = "";
    userData.forEach((u) => {
      user_feed.innerHTML = `
    <div class="profile_image">
        <img class="pfp_image" src="${u.pfp}" alt="" width="120px" height="auto" />
      <p id="username">${u.username}</p>
    </div>
    <div class="aboutme">
      <p class="head">About</p>
      <p>${u.aboutme}</p>
      <p>Your favorite music ?</p>
      <div class="user_form">
          <p><strong>Username: </strong> ${u.username}</p>
        <br />
        <p><strong>Email: </strong>${u.user_email}</p>
      </div>  
    </div>   
      `;
    });
  }
  renderFeed();
}

// ############################### Search Page ################################
function initSearch() {
  const data = [
    { title: "Wi-Fi Issue", desc: "Internet problems in Block A" },
    { title: "Library Event", desc: "Book exhibition on Friday at 3 PM" },
    { title: "Hostel Mess Problem", desc: "Food quality issues in Hostel C" },
    { title: "Hackathon", desc: "Annual coding competition in Lab 2" },
  ];

  const searchInput = document.getElementById("searchInput");
  const results = document.getElementById("results");
  const noResults = document.getElementById("noResults");
  if (!searchInput || !results || !noResults) {
    return;
  }

  function render(query) {
    const q = (query || "").toLowerCase().trim();
    results.innerHTML = "";
    if (!q) {
      noResults.textContent = "Start typing to search...";
      return;
    }
    const filtered = data.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.desc.toLowerCase().includes(q)
    );
    if (filtered.length === 0) {
      noResults.textContent = "No results found.";
      return;
    }
    noResults.textContent = "";
    filtered.forEach((item) => {
      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `<h3>${item.title}</h3><p>${item.desc}</p>`;
      results.appendChild(card);
    });
  }

  let debounceTimer;
  searchInput.addEventListener("input", () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => render(searchInput.value), 150);
  });

  render("");
}

// If user directly loads /reports/, initialize immediately
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("my_reports")) {
    initReports();
  }
  if (window.location.pathname.includes("notifications")) {
    initNotifications();
  }
  if (window.location.pathname.includes("user_profile")) {
    initUserProfile();
  }
  if (window.location.pathname.includes("search")) {
    initSearch();
  }
});
