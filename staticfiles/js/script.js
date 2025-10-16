//@important ########################  IIFE function for login page and accquiring user details ###################################

(function () {
  const form = document.getElementById("recordform");
  if (!form) return; // Only attach on login page

  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const username = (nameInput?.value || "").trim();
    const email = (emailInput?.value || "").trim();
    const password = passwordInput?.value || "";

    if (!username || !password) {
      alert("Username and password are required");
      return;
    }

    try {
      const res = await fetch("/api/google-login/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Login failed");
        return;
      }

      // Use SPA navigation after successful login
      if (typeof loadpage === "function") {
        loadpage("");
      } else {
        window.location.href = "/";
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("Network error. Please try again.");
    }
  });
})();

//remove bottom_menu when needed
function removeBottomMenu() {
  const bottm_menu = document.getElementById("bottom_menu");
  if (bottm_menu) {
    bottm_menu.style.visibility = "hidden";
  }
}

function RestoreBottomMenu() {
  const bottm_menu = document.getElementById("bottom_menu");
  if (bottm_menu) {
    bottm_menu.style.visibility = "visible";
  }
}

// Render dashboard skeleton into the container
function renderDashboardSkeleton(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="stat_grid">
      <div class="stat_card skeleton" role="button" tabindex="0" aria-label="My Reports">
        <div class="stat_header"></div>
        <div class="stat_value" id="statMyReports"></div>
        <div class="stat_meta"></div>
      </div>
      <div class="stat_card skeleton" role="button" tabindex="0" aria-label="Lost & Found">
        <div class="stat_header"></div>
        <div class="stat_value" id="statLostFound"></div>
        <div class="stat_meta"></div>
      </div>
      <div class="stat_card skeleton" role="button" tabindex="0" aria-label="Notifications">
        <div class="stat_header"></div>
        <div class="stat_value" id="statNoti"></div>
        <div class="stat_meta"></div>
      </div>
    </div>
  `;
}

// Render final dashboard with data and a short reveal animation
function renderDashboard(container, data) {
  if (!container) return;
  const { myReports = "–", lostFound = "–", notifications = "–" } = data || {};
  container.innerHTML = `
    <div class="stat_grid">
      <div class="stat_card" role="button" tabindex="0" aria-label="My Reports">
        <div class="stat_header">My Reports</div>
        <div class="stat_value" id="statMyReports">${myReports}</div>
        <div class="stat_meta">View and manage</div>
      </div>
      <div class="stat_card" role="button" tabindex="0" aria-label="Lost & Found">
        <div class="stat_header">Lost & Found</div>
        <div class="stat_value" id="statLostFound">${lostFound}</div>
        <div class="stat_meta">Items this week</div>
      </div>
      <div class="stat_card" role="button" tabindex="0" aria-label="Notifications">
        <div class="stat_header">Notifications</div>
        <div class="stat_value" id="statNoti">${notifications}</div>
        <div class="stat_meta">Unread</div>
      </div>
    </div>
  `;
  const cards = container.querySelectorAll(".stat_card");
  cards.forEach((card) => {
    card.classList.add("reveal");
    card.addEventListener("animationend", function handler() {
      card.classList.remove("reveal");
      card.removeEventListener("animationend", handler);
    });
  });
}

function initUserDashboard() {
  const home_dashboard = document.querySelector(".home_dashboard");
  if (!home_dashboard) return;
  // Render skeleton immediately
  renderDashboardSkeleton(home_dashboard);
  // Fetch and then render actual content
  setTimeout(() => {
    fetch("/api/users/reports")
      .then((res) => res.json())
      .then((user_reports) => {
        renderDashboard(home_dashboard, {
          myReports: user_reports?.reports_count ?? "–",
          lostFound: "–",
          notifications: "–",
        });
      })
      .catch((err) => {
        console.error("Failed to fetch user reports:", err);
        renderDashboard(home_dashboard, {
          myReports: "0",
          lostFound: "–",
          notifications: "–",
        });
      });
  }, 1000);
}

function RenderSkeleton(count = 0) {
  const home_card = document.querySelector(".home_card");
  home_card.innerHTML = "";
  for (let i = 0; i < count; i++) {
    const stat_grid = document.createElement("div");
    stat_grid.className = "stat_grid";
    stat_grid.innerHTML = `
    <div class="stat_card skeleton " role="button" tabindex="0" aria-label="My Reports">
        <div class="stat_header"></div>
        <div class="stat_value" id="statMyReports"></div>
        <div class="stat_meta"></div>
      </div>
      <div
        class="stat_card skeleton"
        role="button"
        tabindex="0"
        aria-label="Lost & Found"
      >
        <div class="stat_header"></div>
        <div class="stat_value" id="statLostFound"></div>
        <div class="stat_meta"></div>
      </div>
      <div
        class="stat_card skeleton"
        role="button"
        tabindex="0"
        aria-label="Notifications"
      >
        <div class="stat_header"></div>
        <div class="stat_value" id="statNoti"></div>
        <div class="stat_meta"></div>
      </div>
    `;
    home_card.appendChild(stat_grid);
  }
}
//note:-####################### Transition and Load Page ####################################
const cards_home = document.querySelectorAll(".icon");
cards_home.forEach((card) => {
  card.addEventListener("touchstart", () => {
    card.style.transform = "scale(1.04)";
    card.style.transition = "transform 2s ease-in-out";
  });
  card.addEventListener("touchend", () => {
    card.style.transform = "scale(1)";
  });
});

// Functions for the buttons

//* ################################# Drop down, Create Report and submit report Page #######################################
const photoInput = document.getElementById("photoInput");
const previewWrap = document.getElementById("previewWrap");
if (photoInput && previewWrap) {
  photoInput.addEventListener("change", (e) => {
    previewWrap.innerHTML = "";
    const file = e.target.files[0];
    if (!file) return;
    const img = document.createElement("img");
    img.className = "img-preview";
    previewWrap.appendChild(img);
    const reader = new FileReader();
    reader.onload = () => {
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

// Mobile-friendly custom dropdown for Issue Category
function initCategoryDropdown() {
  const dropdown = document.getElementById("categoryDropdown");
  if (!dropdown) return;
  const toggle = dropdown.querySelector(".dropdown-toggle");
  const menu = dropdown.querySelector(".dropdown-menu");
  const label = dropdown.querySelector(".dropdown-label");
  const hiddenInput = document.getElementById("category");
  const backdrop = dropdown.nextElementSibling; // .dropdown-backdrop
  if (!toggle || !menu || !label || !hiddenInput) return;

  const openDropdown = () => {
    dropdown.classList.add("open");
    toggle.setAttribute("aria-expanded", "true");
    dropdown.setAttribute("aria-expanded", "true");
    if (backdrop) {
      backdrop.hidden = false;
    }
  };
  const closeDropdown = () => {
    dropdown.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    dropdown.setAttribute("aria-expanded", "false");
    if (backdrop) {
      // Delay hiding to allow fade-out
      setTimeout(() => {
        backdrop.hidden = true;
      }, 160);
    }
  };
  const toggleDropdown = () => {
    if (dropdown.classList.contains("open")) closeDropdown();
    else openDropdown();
  };

  toggle.addEventListener("click", toggleDropdown);
  if (backdrop) {
    backdrop.addEventListener("click", closeDropdown);
  }

  // Select option
  menu.addEventListener("click", (e) => {
    const item = e.target.closest(".dropdown-item");
    if (!item) return;
    const value = item.getAttribute("data-value");
    label.textContent = item.textContent;
    hiddenInput.value = value;
    // Update selected state
    menu.querySelectorAll(".dropdown-item").forEach((el) => {
      el.setAttribute("aria-selected", el === item ? "true" : "false");
    });
    closeDropdown();
  });

  // Keyboard support (basic)
  toggle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleDropdown();
    }
    if (e.key === "Escape") {
      closeDropdown();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeDropdown();
  });
  window.AddReport = function () {
    const category = hiddenInput.value.trim();
    const r_location = document.getElementById("location").value.trim();
    const r_title = document.getElementById("title").value.trim();
    const description = document.getElementById("desc").value.trim();
    const fileInput = document.getElementById("photoInput");
    const file =
      fileInput && fileInput.files && fileInput.files[0]
        ? fileInput.files[0]
        : null;

    const formData = new FormData();
    // formData.append("author",);
    formData.append("category", category);
    formData.append("location", r_location);
    formData.append("title", r_title);
    formData.append("desc", description);
    if (file) formData.append("image", file);

    return fetch("/api/reports/", {
      method: "POST",
      body: formData,
    }).then((res) => res.json());
  };
  const reportForm = document.getElementById("reportForm");
  if (reportForm) {
    reportForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      try {
        const data = await window.AddReport();
        console.log("Report Added", data);
        loadpage("my_reports");
      } catch (err) {
        console.error("Error Posting Reports:", err);
        alert("Failed to submit report.");
      }
    });
  }
}
//@important ######################################## Main AJAX Load page function #############################################

function loadpage(page) {
  let url = page === "" ? "/" : "/" + page + "/";
  let content = document.getElementById("main-content");
  let loader = document.getElementById("loader");
  const home = document.getElementById("home-icon");

  // Handle bottom menu visibility based on page
  if (page === "log_in" || page === "login") {
    removeBottomMenu();
  } else {
    RestoreBottomMenu();
  }

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

          // It is safe and more robust to check for either the empty string ("") or "/" here,
          // since your homepage is accessed with both '' and '/'.
          if (page === "" || page === "/") {
            initUserDashboard();
          }
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
          if (page === "report") {
            initCategoryDropdown();
          }
          if (page === "lost_found") {
            initLostFound();
          }
          if (page === "create_lost_found") {
            initCreateLostFound();
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
  const feed = document.getElementById("feed");
  let reports = [];
  const cached = localStorage.getItem("reports_with_comments");

  if (cached) {
    reports = JSON.parse(cached);
    renderFeed(reports);
  }

  Promise.all([
    fetch("/api/reports/").then((res) => res.json()), //Once you get the response from the server, parse it as JSON so we can use it  in our JavaScript code
    fetch("/api/comments/").then((res) => res.json()),
  ])
    .then(([reportsData, commentsData]) => {
      // Step 1: Organize comments into a Object grouped by report_id
      console.log("Reports Data:", reportsData);
      console.log("Comments Data:", commentsData);
      const commentsByReport = {};
      commentsData.forEach((c) => {
        if (!commentsByReport[c.report]) {
          commentsByReport[c.report] = [];
        }
        commentsByReport[c.report].push({
          comment: c.comment,
          added_by: c.added_by,
          time: c.time,
        });
      });
      // Step 2: Attach correct comments to each report
      reports = reportsData.map((r) => ({
        ...r,
        liked: false,
        comments: commentsByReport[r.id] || [],
        author: r.author && r.author.username ? r.author.username : "Anonymous", // fallback if missing
      }));

      //caching the fresh version

      console.log("Reports with comments:", reports);
      renderFeed(reports); // pass reports into your feed renderer
      localStorage.setItem("reports_with_comments", JSON.stringify(reports));

      // Updating time display every minute
      // 60000ms = 1 minute
      if (!window._reportsTimer) {
        window._reportsTimer = setInterval(() => {
          renderFeed();
        }, 60000);
      }

      // If navigation specified a target post, scroll/highlight once items are in DOM
      if (window.__targetPostId) {
        setTimeout(() => {
          const targetEl = document.getElementById(window.__targetPostId);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: "smooth", block: "center" });
            targetEl.focus();

            // Apply prominent highlight effect
            targetEl.classList.add("highlight-target");

            // Remove highlight after animation completes
            setTimeout(() => {
              targetEl.blur();
              targetEl.classList.remove("highlight-target");
            }, 2300);
          }
          window.__targetPostId = null;
        }, 0);
      }
    })
    .catch((err) => console.error("Error loading reports or comments:", err));

  function renderFeed() {
    feed.innerHTML = "";
    reports.forEach((r, index) => {
      const post = document.createElement("div");
      post.className = "post";
      post.id = `post-${r.id}`; //ID to match the hash fragment
      post.innerHTML = `
            <div class="container">
            <div class="post-header">
              <img src="${
                r.avatar || "/static/images/profile.png"
              }" class="avatar" alt="Profile">
              <div class="post-meta">
                <div class="author">${r.author}</div>
                <div class="time">${formatTimeAgo(r.time)}</div>
              </div>
              <div class="post-category">
                <span class="category-badge ${
                  r.category?.toLowerCase() || "other"
                }">${r.category || "Other"}</span>
              </div>
            </div>
            <div class="post-body">
              <div class="post-title">${r.title}</div>
              <div class="post-location">
                <span class="location-icon">📍</span>
                <span class="location-text">${
                  r.location || "Location not specified"
                }</span>
              </div>
              <div class="post-desc">${r.desc}</div>
              ${
                r.image
                  ? `
                <div class="post-image-container">
                  <img src="${r.image}" class="post-image" alt="Report image">
                </div>
              `
                  : ""
              }
            </div>
            <div class="actions">
              <button class="action-btn like-btn ${
                r.liked ? "liked" : ""
              }" onclick="toggleLike(${index})">
                <span class="action-icon">❤️</span>
                <span class="action-count">${r.likes}</span>
              </button>
              <button class="action-btn comment-btn" onclick="toggleComments(${index})">
                <span class="action-icon">💬</span>
                <span class="action-count">${r.comments.length}</span>
              </button>
            </div>
            <div class="comments-section" id="comments-${index}" style="display:none;">
              <div class="comments-header">
                <span class="comments-title">Comments (${
                  r.comments.length
                })</span>
              </div>
              <div class="comments-list">
                ${r.comments
                  .map(
                    (c) => `
                    <div class="comment-item">
                      <div class="comment-avatar">
                        <img src="/static/images/profile.png" alt="User" class="comment-user-avatar">
                      </div>
                      <div class="comment-content">
                        <div class="comment-author">${
                          c.added_by?.username || "Anonymous"
                        }</div>
                        <div class="comment-text">${c.comment || c}</div>
                        <div class="comment-time">${
                          c.time ? formatTimeAgo(c.time) : "Just now"
                        }</div>
                      </div>
                    </div>
                  `
                  )
                  .join("")}
                ${
                  r.comments.length === 0
                    ? `
                  <div class="no-comments">
                    <span class="no-comments-text">No comments yet. Be the first to comment!</span>
                  </div>
                `
                    : ""
                }
              </div>
            </div>
            <div class="comment-input-section">
              <div class="comment-input-container">
                <img src="/static/images/profile.png" alt="You" class="comment-input-avatar">
                <input type="text" id="comment-${index}" placeholder="Add a comment..." class="comment-input-field">
                <button onclick="addComment(${index})" class="comment-submit-btn">
                  <span class="submit-icon">📤</span>
                </button>
              </div>
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

        // Update UI immediately with the new comment structure
        reports[i].comments.push({
          comment: data.comment,
          added_by: data.added_by,
          time: data.time,
        });

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

//note:- ########################### Js function for lost and found page ####################################3--->
function initLostFound() {
  // Sample dynamic posts with images
  const posts = [
    {
      id: 1,
      user: "Aman",
      branch: "CS",
      avatar: "👨",
      time: "2025-09-30 10:30 AM",
      item: "Wallet",
      status: "Lost",
      description: "Blue leather wallet with multiple cards",
      image:
        "https://thumbs.dreamstime.com/z/brown-wallet-sitting-table-ai-296869590.jpg",
      comments: [
        "I think I saw it near canteen",
        "Check library counter",
        "Hope you find it soon!",
      ],
    },
    {
      id: 2,
      user: "Aisha",
      branch: "IT",
      avatar: "👩",
      time: "2025-09-30 11:00 AM",
      item: "Headphones",
      status: "Found",
      description: "Black over-ear headphones with a green stripe",
      image:
        "https://img.freepik.com/premium-photo/headphones-resting-wooden-table_118124-198357.jpg",
      comments: ["Might be mine!", "Good work returning it"],
    },
  ];

  const postsContainer = document.getElementById("posts");

  posts.forEach((post) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.innerHTML = `
        <div class="card-header">
          <div class="avatar">${post.avatar}</div>
          <div class="user-info">
            <span class="name">${post.user} (${post.branch})</span>
            <span class="time">${post.time}</span>
          </div>
        </div>
        <div class="item-title">
          ${post.item} 
          <span class="status ${post.status.toLowerCase()}">${
      post.status
    }</span>
        </div>
        ${
          post.image
            ? `<img src="${post.image}" alt="${post.item}" class="item-image">`
            : ""
        }
        <div class="item-desc">${post.description}</div>
        <div class="comment-section" id="comments-${post.id}"></div>
        <div class="comment-box">
          <input type="text" placeholder="Add a comment...">
          <button>Post</button>
        </div>
        <div class="modal" id="modal-${post.id}">
          <div class="modal-content">
            <span class="close-btn">&times;</span>
            <h3>All Comments</h3>
            <div id="allComments-${post.id}"></div>
          </div>
        </div>
      `;
    postsContainer.appendChild(card);

    // Use getElementById for elements with unique IDs (faster)
    const commentSection = document.getElementById(`comments-${post.id}`);
    const modal = document.getElementById(`modal-${post.id}`);
    const allCommentsContainer = document.getElementById(
      `allComments-${post.id}`
    );

    // Keep querySelector for elements without unique IDs
    const commentInput = card.querySelector(".comment-box input");
    const postBtn = card.querySelector(".comment-box button");
    const modalClose = modal.querySelector(".close-btn");

    function renderComments() {
      commentSection.innerHTML = "";
      const visibleComments = post.comments.slice(0, 3);
      visibleComments.forEach((c) => {
        const div = document.createElement("div");
        div.classList.add("comment");
        div.textContent = c;
        commentSection.appendChild(div);
      });

      if (post.comments.length > 3) {
        const seeMore = document.createElement("div");
        seeMore.classList.add("see-more");
        seeMore.textContent = "See more comments";
        seeMore.onclick = () => openModal();
        commentSection.appendChild(seeMore);
      }
    }

    function openModal() {
      allCommentsContainer.innerHTML = "";
      post.comments.forEach((c) => {
        const div = document.createElement("div");
        div.classList.add("comment");
        div.textContent = c;
        allCommentsContainer.appendChild(div);
      });
      modal.style.display = "flex";
    }

    modalClose.onclick = () => (modal.style.display = "none");
    window.addEventListener("click", (e) => {
      if (e.target === modal) modal.style.display = "none";
    });

    postBtn.addEventListener("click", () => {
      const value = commentInput.value.trim();
      if (value) {
        post.comments.unshift(value);
        commentInput.value = "";
        renderComments();
      }
    });

    renderComments();
  });
}

//note:- ########################### Js function for create lost and found page ####################################
function initCreateLostFound() {
  console.log("Initializing Create Lost Found page...");

  const form = document.getElementById("reportForm");
  const postsContainer = document.getElementById("postsContainer");
  const posts = [];

  // Custom dropdown functionality with better error handling
  const dropdown = document.getElementById("statusDropdown");
  if (!dropdown) {
    console.warn("Status dropdown not found, retrying in 100ms...");
    setTimeout(initCreateLostFound, 100);
    return;
  }

  const dropdownToggle = dropdown.querySelector(".dropdown-toggle");
  const dropdownMenu = dropdown.querySelector(".dropdown-menu");
  const dropdownLabel = dropdown.querySelector(".dropdown-label");
  const dropdownBackdrop = dropdown.nextElementSibling;
  const statusInput = document.getElementById("status");

  // Verify all required elements exist
  if (!dropdownToggle || !dropdownMenu || !dropdownLabel || !statusInput) {
    console.warn("Missing dropdown elements, retrying...");
    setTimeout(initCreateLostFound, 100);
    return;
  }

  console.log("All dropdown elements found, setting up event listeners...");

  // Remove any existing event listeners to prevent duplicates
  const newDropdownToggle = dropdownToggle.cloneNode(true);
  dropdownToggle.parentNode.replaceChild(newDropdownToggle, dropdownToggle);

  const newDropdownMenu = dropdownMenu.cloneNode(true);
  dropdownMenu.parentNode.replaceChild(newDropdownMenu, dropdownMenu);

  // Get references to the new elements
  const toggle = dropdown.querySelector(".dropdown-toggle");
  const menu = dropdown.querySelector(".dropdown-menu");
  const label = dropdown.querySelector(".dropdown-label");
  const backdrop = dropdown.nextElementSibling;

  function openDropdown() {
    dropdown.classList.add("open");
    dropdown.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-expanded", "true");
    if (backdrop) backdrop.removeAttribute("hidden");
  }

  function closeDropdown() {
    dropdown.classList.remove("open");
    dropdown.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-expanded", "false");
    if (backdrop) backdrop.setAttribute("hidden", "");
  }

  function resetDropdown() {
    label.textContent = "Select Status";
    statusInput.value = "";
    menu.querySelectorAll(".dropdown-item").forEach((item) => {
      item.removeAttribute("aria-selected");
    });
    closeDropdown();
  }

  // Add event listeners to the new elements
  toggle.addEventListener("click", (e) => {
    e.preventDefault();
    console.log("Dropdown toggle clicked");
    if (dropdown.classList.contains("open")) {
      closeDropdown();
    } else {
      openDropdown();
    }
  });

  menu.addEventListener("click", (e) => {
    if (e.target.classList.contains("dropdown-item")) {
      const value = e.target.getAttribute("data-value");
      console.log("Dropdown item selected:", value);
      label.textContent = value;
      statusInput.value = value;

      // Remove previous selection
      menu.querySelectorAll(".dropdown-item").forEach((item) => {
        item.removeAttribute("aria-selected");
      });

      // Mark current selection
      e.target.setAttribute("aria-selected", "true");

      closeDropdown();
    }
  });

  if (backdrop) {
    backdrop.addEventListener("click", closeDropdown);
  }

  // Create a unique escape key handler for this instance
  const escapeHandler = (e) => {
    if (e.key === "Escape" && dropdown.classList.contains("open")) {
      closeDropdown();
    }
  };

  document.addEventListener("keydown", escapeHandler);

  // Store the handler so we can remove it later if needed
  dropdown._escapeHandler = escapeHandler;

  function renderPosts() {
    const emptyState = document.getElementById("emptyState");

    if (posts.length === 0) {
      emptyState.style.display = "block";
      return;
    }

    emptyState.style.display = "none";
    postsContainer.innerHTML = '<div class="posts-header">Recent Reports</div>';

    posts.forEach((post) => {
      const div = document.createElement("div");
      div.classList.add("post");
      div.innerHTML = `
        <div class="post-header">${post.user} (${post.branch})</div>
        <div class="post-item">
          <span>${post.item}</span>
          <span class="status ${post.status.toLowerCase()}">${
        post.status
      }</span>
        </div>
        ${post.image ? `<img src="${post.image}" alt="${post.item}">` : ""}
        <div class="post-description">${post.description}</div>
      `;
      postsContainer.appendChild(div);
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const userName = document.getElementById("userName").value.trim();
      const branch = document.getElementById("branch").value.trim();
      const itemName = document.getElementById("itemName").value.trim();
      const status = document.getElementById("status").value;
      const description = document.getElementById("description").value.trim();
      const imageFile = document.getElementById("imageFile").files[0];

      if (imageFile) {
        const reader = new FileReader();
        reader.onload = function (event) {
          const newPost = {
            user: userName,
            branch: branch,
            item: itemName,
            status: status,
            description: description,
            image: event.target.result,
          };
          posts.push(newPost);
          renderPosts();
          form.reset();
          resetDropdown();
        };
        reader.readAsDataURL(imageFile);
      } else {
        const newPost = {
          user: userName,
          branch: branch,
          item: itemName,
          status: status,
          description: description,
          image: null,
        };
        posts.push(newPost);
        renderPosts();
        form.reset();
        resetDropdown();
      }
    });
  }

  // Initial render
  renderPosts();
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
        <a class="noti_item unread">
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
  let userData = [];
  fetch("/api/current_user/", {
    method: "GET",
    headers: {
      "X-Requested-With": "XMLHttpRequest",
      "Content-Type": "application/json",
    },
    credentials: "include", // ensures that cookies are sent
  })
    .then((res) => {
      if (!res.ok) throw new Error("Network response was not ok");
      return res.json();
    })
    .then((user) => {
      const user_feed = document.getElementById("user_feed");
      function renderFeed() {
        user_feed.innerHTML = "";
        user_feed.innerHTML = `
        <div class="profile_header">
          <div class="profile_image">
            <img class="pfp_image" src="${user.pfp}" alt="" width="120px" height="auto" />
            <p id="username">${user.username}</p>
          </div>
          <button type="button" class="edit_profile_btn" id="editProfileBtn">Edit Profile</button>
        </div>
        <div class="aboutme">
          <p class="head">About</p>
          <div class="text_about">
          <p>${user.aboutme}</p>
          </div>
          <div class="user_form">
            <div class="user_details">
              <div class="detail_row">
                <span class="detail_label">Username</span>
                <span class="detail_value">${user.username}</span>
              </div>
              <div class="detail_row">
                <span class="detail_label">Email</span>
                <span class="detail_value">${user.email}</span>
              </div>
            </div>
          </div>  
        </div>   
          `;
        const editBtn = document.getElementById("editProfileBtn");
        if (editBtn) {
          editBtn.addEventListener("click", () => {
            if (typeof loadpage === "function") {
              // If you add an edit route later, replace with loadpage('edit_profile')
              // alert("Edit Profile coming soon.");
              window.location.href = "/edit_profile";
            }
          });
        }
      }
      renderFeed();
    });
}

function initEditUserProfile() {
  const form = document.getElementById("editProfileForm");
  const inputImage = document.getElementById("UploadImage");
  const profilePic = document.getElementById("avatar");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const aboutMeInput = document.getElementById("aboutme");

  if (!form || !inputImage || !profilePic || !usernameInput ||!emailInput ||!aboutMeInput) {
    console.warn(
      "Edit profile elements not found; skipping initEditUserProfile"
    );
    return;
  }

  inputImage.addEventListener("change", (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    // Prefer FileReader for broader Android WebView support; fallback to object URL.
    try {
      const reader = new FileReader();
      reader.onload = () => {
        profilePic.src = reader.result;
      };
      reader.readAsDataURL(file);
    } catch (err) {
      const imageUrl = URL.createObjectURL(file);
      profilePic.src = imageUrl;
      profilePic.onload = () => {
        URL.revokeObjectURL(imageUrl);
      };
    }
  });
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    // ensure latest values are captured
    formData.set("username", (usernameInput.value || "").trim());
    formData.set("email", (emailInput.value || "").trim());
    formData.set("aboutme", (aboutMeInput.value || "").trim());
    const file = inputImage.files && inputImage.files[0];
    if (file) {
      formData.set("pfp", file);
    }
    fetch("/api/current_user/", {
      method: "POST",
      body: formData,
      credentials: "include",
    })
      .then((res) => res.json())
      .then(() => {
        // Optionally navigate back or show success
        loadpage("user_profile");
      })
      .catch((err) => console.error("Failed to update profile", err));
  });
}

//note:- ############################### Search Page ################################
// SPA helper: navigate to my_reports and scroll to a specific post id
function goToMyReport(reportId) {
  if (!reportId) return;
  // set a global flag used by initReports to focus after render
  window.__targetPostId = `post-${reportId}`;
  // Use existing loader-enabled navigation
  loadpage("my_reports");
}

function initSearch() {
  let data = [];
  fetch("/api/reports/")
    .then((res) => res.json())
    .then((reports) => {
      data = reports.map((r) => ({
        ...r,
      }));
    });

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
      card.innerHTML = `
      <h3>${item.title}</h3>
      <p>${item.desc}</p>
      <a href="/my_reports/" class="view-link">View</a>`;
      const link = card.querySelector(".view-link");
      link.addEventListener("click", (e) => {
        e.preventDefault();
        goToMyReport(item.id);
      });
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

// Track initialization state to prevent duplicate calls
let initializationState = {
  home: false,
  my_reports: false,
  lost_found: false,
  create_lost_found: false,
  notifications: false,
  user_profile: false,
  edit_profile: false,
  search: false,
  report: false,
};

function initializePages() {
  const path = window.location.pathname;
  console.log("Initializing page for path:", path);

  // Reset all states
  Object.keys(initializationState).forEach((key) => {
    initializationState[key] = false;
  });

  // Check for login page first and hide bottom menu
  if (path.includes("log_in") || path.includes("login")) {
    removeBottomMenu();
    return; // Exit early for login page
  }

  // For all other pages, ensure bottom menu is visible
  RestoreBottomMenu();

  if (path.includes("") || (path.includes("/") && !initializationState.home)) {
    initializationState.home = true;
    initUserDashboard();
  }
  if (path.includes("my_reports") && !initializationState.my_reports) {
    initializationState.my_reports = true;
    initReports();
  }
  if (
    path.includes("lost_found") &&
    !path.includes("create_lost_found") &&
    !initializationState.lost_found
  ) {
    initializationState.lost_found = true;
    initLostFound();
  }
  if (
    path.includes("create_lost_found") &&
    !initializationState.create_lost_found
  ) {
    initializationState.create_lost_found = true;
    initCreateLostFound();
  }
  if (path.includes("notifications") && !initializationState.notifications) {
    initializationState.notifications = true;
    initNotifications();
  }
  if (path.includes("user_profile") && !initializationState.user_profile) {
    initializationState.user_profile = true;
    initUserProfile();
  }
  if (path.includes("edit_profile") && !initializationState.edit_profile) {
    initializationState.edit_profile = true;
    initEditUserProfile();
  }
  if (path.includes("search") && !initializationState.search) {
    initializationState.search = true;
    initSearch();
  }
  if (
    path.includes("report") &&
    !path.includes("my_reports") &&
    !initializationState.report
  ) {
    initializationState.report = true;
    initCategoryDropdown();
  }
}

// If user directly loads page, initialize immediately
document.addEventListener("DOMContentLoaded", initializePages);

// Also initialize on window load for additional compatibility
window.addEventListener("load", () => {
  // Only initialize if DOM content hasn't loaded yet
  if (document.readyState === "complete") {
    initializePages();
  }
});
