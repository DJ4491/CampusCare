// Restricting Options in App
// Disable right-click
document.addEventListener("contextmenu", function (e) {
  e.preventDefault();
});

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

//@important ############################################# logout ################################################################

function setupLogoutConfirm() {
  const fab = document.getElementById("logoutFab");
  const modal = document.getElementById("logoutConfirm");
  if (!fab || !modal) return; // Not on this page yet

  if (fab.dataset.bound === "1") return; // idempotent
  fab.dataset.bound = "1";

  const btnConfirm = modal.querySelector("[data-confirm]");
  const btnCancel = modal.querySelector("[data-cancel]");
  const backdrop = modal.querySelector("[data-close]");
  const REDIRECT_URL = "/logout/"; // keep your logout path

  // ripple on click
  fab.addEventListener(
    "pointerdown",
    (e) => {
      const rect = fab.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      ripple.style.left = e.clientX - rect.left + "px";
      ripple.style.top = e.clientY - rect.top + "px";
      fab.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    },
    { passive: true }
  );

  // subtle attention pulse
  requestAnimationFrame(() => fab.classList.add("pulse"));
  setTimeout(() => fab.classList.remove("pulse"), 1500);

  function openConfirm() {
    // ensure modal is a direct child of body to escape transformed ancestors
    try {
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }
    } catch (_) {}
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    // focus cancel for quick escape
    btnCancel && btnCancel.focus();
    document.addEventListener("keydown", handleKey);
  }
  function closeConfirm() {
    modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");
    document.removeEventListener("keydown", handleKey);
    fab.focus();
  }
  function handleKey(e) {
    if (e.key === "Escape") closeConfirm();
    if (e.key === "Tab") {
      const focusables = modal.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  fab.addEventListener("click", openConfirm);
  btnCancel && btnCancel.addEventListener("click", closeConfirm);
  backdrop && backdrop.addEventListener("click", closeConfirm);

  btnConfirm &&
    btnConfirm.addEventListener("click", () => {
      // allow loader to fade in smoothly before navigation
      btnConfirm.classList.add("loading");
      const original = btnConfirm.querySelector(".btn_text");
      if (original) original.textContent = "Signing out...";
      setTimeout(() => {
        window.location.href = REDIRECT_URL;
      }, 850);
    });
}

// Try binding once DOM is ready (in case profile is the first page)
document.addEventListener("DOMContentLoaded", setupLogoutConfirm);

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
function initIconInteractions() {
  const cards = document.querySelectorAll(".icon");
  cards.forEach((card) => {
    if (card.dataset.interactive === "1") return; // avoid duplicate bindings
    card.dataset.interactive = "1";

    const down = () => {
      card.style.transform = "scale(1.02)";
      card.style.transition = "transform 160ms ease";
      card.classList.add("icon-ripple");
      setTimeout(() => card.classList.remove("icon-ripple"), 560);
    };
    const up = () => {
      card.style.transform = "scale(1)";
    };

    // Use pointer events to support mouse/touch
    card.addEventListener("pointerdown", down, { passive: true });
    card.addEventListener("pointerup", up, { passive: true });
    card.addEventListener("pointerleave", up, { passive: true });
    // Fallback for older browsers
    card.addEventListener("touchstart", down, { passive: true });
    card.addEventListener("touchend", up, { passive: true });
  });
}

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
      fileInput && fileInput.files && fileInput.files[0] // Checks if all are truthy (i.e., not null or undefined).
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

  // Reset initialization flags when navigating to a new page
  window.reportsInitialized = false;
  window.notificationsInitialized = false;
  window.userProfileInitialized = false;
  window.lostFoundInitialized = false;
  window.createLostFoundInitialized = false;
  window.searchInitialized = false;
  window.reportInitialized = false;
  window.homeInitialized = false;
  window.eventActivityInitialized = false;
  window.supportInitialized = false;
  window.helpInitialized = false;

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
            if (!initializationState.lost_found) {
              initializationState.lost_found = true;
              initLostFound();
            }
          }
          if (page === "create_lost_found") {
            initCreateLostFound();
          }
          if (page === "event_activity") {
            initEventActivity();
          }
          if (page === "support") {
            initSupport();
          }
          if (page === "help") {
            initHelp();
          }
          // Re-bind micro-interactions for icons on each page load
          initIconInteractions();
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

function showSkeletonLoading() {
  const skeletonLoading = document.getElementById("skeleton-loading");
  if (skeletonLoading) {
    skeletonLoading.style.display = "block";
    console.log("Skeleton loading shown");
  } else {
    console.error("Skeleton loading element not found!");
  }
}

function hideSkeletonLoading() {
  const skeletonLoading = document.getElementById("skeleton-loading");
  if (skeletonLoading) {
    skeletonLoading.style.display = "none";
    console.log("Skeleton loading hidden");
  }
}

function initReports() {
  console.log("initReports() called");

  // Prevent multiple initializations
  if (window.reportsInitialized) {
    console.log("Reports already initialized, skipping...");
    return;
  }
  window.reportsInitialized = true;

  const feed = document.getElementById("feed");

  // Check if feed element exists before initializing smooth scroll
  if (!feed) {
    console.warn(
      "Feed element not found, skipping smooth scroll initialization"
    );
    return;
  }

  // --- Lenis Smooth Scroll Setup for Feed ---
  let lenis;

  function initSmoothScroll() {
    if (lenis) return; // prevent reinit on refresh

    // Check if Lenis is available
    if (typeof Lenis === "undefined") {
      console.warn(
        "Lenis library not loaded, skipping smooth scroll initialization"
      );
      return;
    }

    // Wrap inner feed content in a scrollable container
    const feedContent = document.createElement("div");
    feedContent.className = "feed-content";
    while (feed.firstChild) feedContent.appendChild(feed.firstChild);
    feed.appendChild(feedContent);

    lenis = new Lenis({
      wrapper: feed, // your scroll container
      content: feedContent, // actual content inside feed
      lerp: 0.15,
      smoothWheel: true,
      smoothTouch: true,
      autoRaf: true,
    });
  }

  initSmoothScroll();

  let reports = [];
  const cached = localStorage.getItem("reports_with_comments");

  console.log("Feed element:", feed);
  console.log("Cached data:", cached ? "exists" : "none");

  // Ensure skeleton is visible
  showSkeletonLoading();

  // Always show skeleton loading first, even if we have cached data
  // This ensures skeleton is visible during navigation
  if (cached) {
    reports = JSON.parse(cached);
    console.log("Will render cached data in 1200ms");
    // Show skeleton for a minimum duration to ensure it's visible during navigation
    setTimeout(() => {
      console.log("Rendering cached data now");
      hideSkeletonLoading();
      renderFeed(reports);
    }, 1200); // Increased to 1200ms to ensure skeleton is visible during navigation
  } else {
    console.log("No cached data, will wait for API response");
  }

  Promise.all([
    fetch("/api/reports/").then((res) => res.json()), //Once you get the response from the server, parse it as JSON so we can use it  in our JavaScript code
    fetch("/api/comments/").then((res) => res.json()),
  ])
    .then(([reportsData, commentsData]) => {
      // Step 1: Organize comments into a Object grouped by report_id
      console.log("Reports Data:", reportsData);
      console.log("Comments Data:", commentsData);
      const commentsByReportID = {};
      commentsData.forEach((c) => {
        if (!commentsByReportID[c.report]) {
          commentsByReportID[c.report] = [];
        }
        commentsByReportID[c.report].push({
          avatar: c.avatar,
          comment: c.comment,
          added_by: c.added_by,
          time: c.time,
        });
      });
      // Step 2: Attach correct comments to each report
      reports = reportsData.map((r) => ({
        ...r,
        liked: false,
        comments: commentsByReportID[r.id] || [],
        author: r.author && r.author.username ? r.author.username : "Anonymous", // fallback if missing
      }));

      //caching the fresh version

      console.log("Reports with comments:", reports);
      // Always render fresh data, this will replace any skeleton loading
      hideSkeletonLoading();
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
            // first scroll into view
            targetEl.scrollIntoView({ behavior: "smooth", block: "center" });

            // restart highlight animation reliably
            targetEl.classList.remove("highlight-target");
            void targetEl.offsetWidth; // force reflow to reset animation state

            // focus for a11y without showing outline changes
            try {
              targetEl.focus({ preventScroll: true });
            } catch (_) {}

            targetEl.classList.add("highlight-target");

            // Prefer animationend over fixed timeout to avoid premature removal
            const removeHighlight = () => {
              targetEl.removeEventListener("animationend", removeHighlight);
              try {
                targetEl.blur();
              } catch (_) {}
              targetEl.classList.remove("highlight-target");
            };
            targetEl.addEventListener("animationend", removeHighlight);

            // Safety fallback removal in case animationend doesn't fire
            setTimeout(removeHighlight, 2600);
          }
          window.__targetPostId = null;
        }, 120); // slight delay to ensure layout settles
      }
    })
    .catch((err) => console.error("Error loading reports or comments:", err));

  function renderFeed() {
    if (!feed) {
      console.warn("Feed element not found, cannot render feed");
      return;
    }
    const feedContent = feed.querySelector(".feed-content") || feed;
    feedContent.innerHTML = "";
    reports.forEach((r, index) => {
      const post = document.createElement("div");
      post.className = "post";
      post.id = `post-${r.id}`; //ID to match the hash fragment
      post.innerHTML = `
            <div class="post-header">
              <img src="${
                r.avatar || "{% static 'images/profile.svg' %}"
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
                r.user_liked ? "liked" : ""
              }" onclick="toggleLike(${index})">
                <span class="action-icon"><img src="/static/images/upvote.svg" alt="Upvote" style="width:35px; height:35px; vertical-align:middle;"/></span>
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
                        <img src="${
                          c.avatar
                        }" alt="User" class="comment-user-avatar">
                      </div>
                      <div class="comment-content">
                        <div class="comment-author">${
                          // Show username if "added_by" exists and has "username", otherwise fallback to "Anonymous"
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
          `;
      feedContent.appendChild(post);
    });
    if (lenis) lenis.resize();
  }

  window.toggleComments = function (i) {
    const commentsDiv = document.getElementById(`comments-${i}`);
    if (commentsDiv) {
      commentsDiv.style.display =
        commentsDiv.style.display === "none" ? "block" : "none";
    }
  };

  window.toggleLike = function (i) {
    const reportId = reports[i].id;
    const currentLiked = reports[i].user_liked;
    const action = currentLiked ? "unlike" : "like";

    // Optimistic update
    reports[i].user_liked = !currentLiked;
    reports[i].likes += currentLiked ? -1 : 1;

    fetch("/api/reports/", {
      method: "POST",
      headers: { "Content-type": "application/json" },
      body: JSON.stringify({
        report_id: reportId,
        action: action,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          console.log("Like updated successfully:", data);
          // Update the local data with server response
          reports[i].likes = data.likes;
          reports[i].user_liked = data.action === "like";
        } else {
          console.error("Error updating likes:", data.error);
          // Revert the local changes if server update failed
          reports[i].user_liked = currentLiked;
          reports[i].likes += currentLiked ? 1 : -1;
        }
        renderFeed();
      })
      .catch((err) => {
        console.error("Error adding likes", err);
        // Revert the local changes if request failed
        reports[i].user_liked = currentLiked;
        reports[i].likes += currentLiked ? 1 : -1;
        renderFeed();
      });
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
          avatar: data.avatar,
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
    // {
    //   id: 1,
    //   user: "Aman",
    //   branch: "CS",
    //   avatar: "👨",
    //   time: "2025-09-30 10:30 AM",
    //   item: "Wallet",
    //   status: "Lost",
    //   description: "Blue leather wallet with multiple cards",
    //   image:
    //     "https://thumbs.dreamstime.com/z/brown-wallet-sitting-table-ai-296869590.jpg",
    //   comments: [
    //     "I think I saw it near canteen",
    //     "Check library counter",
    //     "Hope you find it soon!",
    //   ],
    // },
    // {
    //   id: 2,
    //   user: "Aisha",
    //   branch: "IT",
    //   avatar: "👩",
    //   time: "2025-09-30 11:00 AM",
    //   item: "Headphones",
    //   status: "Found",
    //   description: "Black over-ear headphones with a green stripe",
    //   image:
    //     "https://img.freepik.com/premium-photo/headphones-resting-wooden-table_118124-198357.jpg",
    //   comments: ["Might be mine!", "Good work returning it"],
    // },
  ];
  hideSkeletonLoading();
  const postsContainer = document.getElementById("posts");
  // Ensure idempotent rendering (avoid duplicates if init gets called again)
  if (postsContainer) postsContainer.innerHTML = "";

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
            ${
              n.type_icon.endsWith(".webm")
                ? `<video autoplay muted loop width="30" height="30"><source src="${n.type_icon}" type="video/webm"></video>`
                : `<img src="${n.type_icon}" alt="" width="30" height="30" />`
            }
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

  // This code will fetch the notifications API every 10 seconds and update the frontend dynamically,
  // ensuring that any new notifications are displayed without the user needing to refresh the page.

  function fetchNotificationsAndRender() {
    fetch("/api/notifications")
      .then((res) => res.json())
      .then((notes) => {
        notifications = notes.map((n) => ({
          ...n,
          isLatest: false,
        }));
        renderFeed(); // Update UI after each fetch
      })
      .catch((error) => {
        console.error("Error fetching notifications:", error);
      });
  }

  // Fetch once immediately at startup
  fetchNotificationsAndRender();

  // Fetch every 10 seconds to keep frontend dynamic
  const notificationsInterval = setInterval(fetchNotificationsAndRender, 10000);

  // Update time display every minute without re-fetching notifications
  setInterval(() => {
    renderFeed();
  }, 60000); // 60000ms = 1 minute
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
      // bind logout confirm interactions after content is rendered
      setupLogoutConfirm();
    });
}

function initEditUserProfile() {
  const form = document.getElementById("editProfileForm");
  const inputImage = document.getElementById("UploadImage");
  const profilePic = document.getElementById("avatar");
  const usernameInput = document.getElementById("username");
  const emailInput = document.getElementById("email");
  const aboutMeInput = document.getElementById("aboutme");

  if (
    !form ||
    !inputImage ||
    !profilePic ||
    !usernameInput ||
    !emailInput ||
    !aboutMeInput
  ) {
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

//@important:- ############################### Events & Activities Page ############################

function initEventActivity() {
  console.log("Initializing Events & Activities page...");

  // Preventing multiple initializations
  if (window.eventActivityInitialized) {
    console.log("Event Activity already initialized, skipping...");
    return;
  }
  window.eventActivityInitialized = true;

  // Events data
  let eventsData = [];
  let calendar;
  let currentEvent = null;

  // Function to fetch events data
  function fetchEventsData() {
    return fetch("/api/events/", {
      method: "GET",
    })
      .then((res) => res.json())
      .then((data) => {
        eventsData = data.map((e) => ({
          ...e,
        }));
        console.log("Events data fetched:", eventsData);
        return eventsData;
      })
      .catch((err) => {
        console.error("Couldn't fetch events api", err);
        return [];
      });
  }

  // Load FullCalendar from CDN (more reliable than local files)
  function loadFullCalendar() {
    return new Promise((resolve, reject) => {
      // Check if already loaded
      if (typeof FullCalendar !== "undefined") {
        resolve();
        return;
      }

      // Load CSS from CDN
      const cssLink = document.createElement("link");
      cssLink.rel = "stylesheet";
      cssLink.href =
        "https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.19/main.min.css";
      document.head.appendChild(cssLink);

      // Load daygrid CSS
      const daygridCssLink = document.createElement("link");
      daygridCssLink.rel = "stylesheet";
      daygridCssLink.href =
        "https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.19/main.min.css";
      document.head.appendChild(daygridCssLink);

      // Load core JS from CDN
      const coreScript = document.createElement("script");
      coreScript.src =
        "https://cdn.jsdelivr.net/npm/@fullcalendar/core@6.1.19/index.global.min.js";

      coreScript.onload = () => {
        // Load daygrid plugin
        const daygridScript = document.createElement("script");
        daygridScript.src =
          "https://cdn.jsdelivr.net/npm/@fullcalendar/daygrid@6.1.19/index.global.min.js";

        daygridScript.onload = () => {
          console.log("FullCalendar loaded successfully from CDN");
          resolve();
        };

        daygridScript.onerror = () => {
          console.error("Failed to load FullCalendar daygrid plugin");
          reject(new Error("Failed to load FullCalendar daygrid plugin"));
        };

        document.head.appendChild(daygridScript);
      };

      coreScript.onerror = () => {
        console.error("Failed to load FullCalendar core from CDN");
        reject(new Error("Failed to load FullCalendar core"));
      };

      document.head.appendChild(coreScript);
    });
  }

  // Initialize FullCalendar
  function initializeCalendar() {
    const calendarEl = document.getElementById("calendar");

    if (!calendarEl) {
      console.error("Calendar element not found");
      return;
    }

    // First fetch events data, then load FullCalendar, then create calendar
    fetchEventsData()
      .then(() => {
        return loadFullCalendar();
      })
      .then(() => {
        createCalendar();
      })
      .catch((error) => {
        console.error("Error initializing calendar:", error);
        showEventError("Calendar failed to load. Please refresh the page.");
      });
  }

  function createCalendar() {
    const calendarEl = document.getElementById("calendar");

    try {
      // Ensure events data is properly formatted
      const formattedEvents = eventsData.map((event) => ({
        id: event.id,
        title: event.title,
        start: event.start,
        extendedProps: {
          description: event.description,
          image: event.image,
          location: event.location,
          time: event.time,
        },
      }));

      calendar = new FullCalendar.Calendar(calendarEl, {
        initialView: "dayGridMonth",
        events: formattedEvents,
        eventClick: function (info) {
          openEventModal(info.event);
        },
        headerToolbar: {
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth",
        },
        height: "auto",
        aspectRatio: 1.35,
        dayMaxEvents: 3,
        moreLinkClick: "popover",
        eventDisplay: "block",
        eventTimeFormat: {
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        },
        eventDidMount: function (info) {
          // Add custom styling to events
          info.el.style.borderRadius = "6px";
          info.el.style.border = "none";
          info.el.style.fontSize = "12px";
          info.el.style.fontWeight = "600";
        },
      });

      calendar.render();
      // Make calendar globally accessible for theme switching
      window.calendar = calendar;
      console.log("Calendar rendered successfully");
    } catch (error) {
      console.error("Error initializing calendar:", error);
      showEventError("Failed to load calendar. Please refresh the page.");
    }
  }

  // Modal functions
  function openEventModal(event) {
    try {
      currentEvent = event;

      // Get event data from extendedProps (FullCalendar v6 format)
      const eventData = event.extendedProps;

      if (!eventData) {
        console.error("Event data not found");
        return;
      }

      // Update modal content
      document.getElementById("modalTitle").textContent = event.title;
      document.getElementById("modalDesc").textContent = eventData.description;

      const imageEl = document.getElementById("modalImage");
      imageEl.src = eventData.image;
      imageEl.alt = `${event.title} image`;

      // Show modal
      const modal = document.getElementById("eventModal");
      modal.style.display = "flex";

      // Prevent body scroll
      document.body.style.overflow = "hidden";

      // Focus management
      modal.focus();
    } catch (error) {
      console.error("Error opening modal:", error);
    }
  }

  function closeEventModal() {
    try {
      const modal = document.getElementById("eventModal");
      modal.style.display = "none";

      // Restore body scroll
      document.body.style.overflow = "";

      // Clear current event
      currentEvent = null;
    } catch (error) {
      console.error("Error closing modal:", error);
    }
  }

  function shareEvent() {
    if (!currentEvent) return;

    try {
      // Get event data from extendedProps (FullCalendar v6 format)
      const eventData = currentEvent.extendedProps;

      if (navigator.share) {
        navigator.share({
          title: currentEvent.title,
          text: eventData.description,
          url: window.location.href,
        });
      } else {
        // Fallback: copy to clipboard
        const shareText = `${currentEvent.title}\n\n${eventData.description}\n\nView more events at: ${window.location.href}`;
        navigator.clipboard.writeText(shareText).then(() => {
          showEventNotification("Event details copied to clipboard!");
        });
      }
    } catch (error) {
      console.error("Error sharing event:", error);
      showEventNotification("Unable to share event");
    }
  }

  // Utility functions
  function showEventError(message) {
    const calendarEl = document.getElementById("calendar");
    if (calendarEl) {
      calendarEl.innerHTML = `
        <div class="events-empty">
          <div class="events-empty-icon">⚠️</div>
          <div class="events-empty-title">Error</div>
          <div class="events-empty-description">${message}</div>
        </div>
      `;
    }
  }

  function showEventNotification(message) {
    // Create a simple notification
    const notification = document.createElement("div");
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #2563eb;
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      font-family: "Fira Sans", sans-serif;
      font-size: 14px;
      font-weight: 600;
      z-index: 10000;
      animation: slideInRight 0.3s ease;
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
      notification.style.animation = "slideOutRight 0.3s ease";
      setTimeout(() => {
        document.body.removeChild(notification);
      }, 300);
    }, 3000);
  }

  // Event listeners for modal
  function setupEventListeners() {
    // Close modal when clicking outside
    document.addEventListener("click", function (event) {
      const modal = document.getElementById("eventModal");
      if (event.target === modal) {
        closeEventModal();
      }
    });

    // Close modal with Escape key
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeEventModal();
      }
    });

    // Add CSS animations for notifications if not already added
    if (!document.getElementById("event-animations")) {
      const style = document.createElement("style");
      style.id = "event-animations";
      style.textContent = `
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }
  }

  // Make functions globally available
  window.openEventModal = openEventModal;
  window.closeEventModal = closeEventModal;
  window.shareEvent = shareEvent;

  // Initialize everything
  setupEventListeners();
  initializeCalendar();

  // Future: Replace with Django API call
  /*
  async function loadEvents() {
    try {
      const response = await fetch('/api/events/');
      if (!response.ok) throw new Error('Failed to fetch events');
      const events = await response.json();
      
      if (calendar) {
        calendar.removeAllEvents();
        calendar.addEventSource(events);
      }
    } catch (error) {
      console.error('Error loading events:', error);
      showEventError('Failed to load events. Please try again later.');
    }
  }
  */
}

//note:-############################## Support Page ###########################################

function initSupport() {
  // endpoints (make these in Django)
  const API_TICKETS = "/api/support/tickets/"; // GET returns list, POST creates

  // DOM refs
  const ticketsList = document.getElementById("tickets-list");
  const ticketsEmpty = document.getElementById("tickets-empty");
  const statOpen = document.getElementById("stat-open");
  const statResolved = document.getElementById("stat-resolved");
  const statAvg = document.getElementById("stat-avg");
  const form = document.getElementById("ticket-form");
  const feedback = document.getElementById("ticket-feedback");
  // custom dropdown refs
  const dd = document.getElementById("supportCategoryDropdown");
  const ddToggle = dd ? dd.querySelector(".dropdown-toggle") : null;
  const ddMenu = dd ? dd.querySelector(".dropdown-menu") : null;
  const ddLabel = dd ? dd.querySelector(".dropdown-label") : null;
  const ddBackdrop = dd ? dd.nextElementSibling : null; // .dropdown-backdrop
  const categoryHidden = document.getElementById("ticket-category");

  let tickets = []; // local cache

  // load tickets on fragment init
  function loadTickets() {
    fetch(API_TICKETS)
      .then((r) => r.json())
      .then((data) => {
        tickets = Array.isArray(data) ? data : [];
        renderTickets();
        computeStats();
      })
      .catch((err) => {
        console.error("Failed to load tickets", err);
        feedback.textContent = "Couldn't load support tickets right now.";
      });
  }

  function renderTickets() {
    ticketsList.innerHTML = "";
    if (!tickets.length) {
      ticketsEmpty.style.display = "block";
      return;
    }
    ticketsEmpty.style.display = "none";

    tickets.forEach((t) => {
      const div = document.createElement("div");
      const statusLabel = (t.status || "open").toLowerCase();
      const statusClass =
        statusLabel === "resolved"
          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
          : statusLabel === "pending"
          ? "bg-amber-50 text-amber-700 border border-amber-200"
          : "bg-rose-50 text-rose-700 border border-rose-200";
      const created = new Date(
        t.created_at || t.time || t.created || Date.now()
      ).toLocaleString();

      div.className =
        "ticket rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition p-3";
      div.innerHTML = `
          <div class="flex items-start justify-between gap-2">
            <div class="subject font-bold text-slate-900 text-[15px]">${escapeHtml(
              t.subject || t.title || "No subject"
            )}</div>
            <div class="status-pill ${statusClass} text-xs px-2 py-1 rounded-full capitalize">${statusLabel}</div>
          </div>
          <div class="desc text-slate-600 text-sm mt-1">${escapeHtml(
            t.description || ""
          )}</div>
          <div class="flex items-center justify-between text-[12px] text-slate-500 mt-2">
            <small class="muted">#${t.id || ""} • ${created}</small>
            <div>
              <button class="inline-flex items-center rounded-lg px-3 py-1 border text-slate-600 hover:bg-slate-50 transition text-sm" onclick="markResolved(${
                t.id
              })">Mark resolved</button>
            </div>
          </div>
        `;
      ticketsList.appendChild(div);
    });
  }

  function computeStats() {
    const open = tickets.filter((t) => t.status !== "resolved").length;
    const resolved = tickets.filter((t) => t.status === "resolved").length;
    statOpen.textContent = open;
    statResolved.textContent = resolved;
    statAvg.textContent = "—"; // placeholder; implement server-side average response time if wanted
  }

  // create ticket handler (optimistic UI, shows server response)
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    feedback.textContent = "";
    const subject = document.getElementById("ticket-subject").value.trim();
    const category = document.getElementById("ticket-category").value;
    const description = document.getElementById("ticket-desc").value.trim();

    if (!subject) {
      feedback.textContent = "Subject is required.";
      return;
    }

    const payload = { subject, category, description };

    // optimistic update (show brief entry)
    const optimistic = {
      id: `temp-${Date.now()}`,
      subject,
      description,
      category,
      status: "pending",
      created_at: new Date().toISOString(),
    };
    tickets.unshift(optimistic);
    renderTickets();
    computeStats();
    feedback.textContent = "Sending...";

    fetch(API_TICKETS, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("Network response not ok");
        const saved = await res.json();
        // replace optimistic item with saved data (match by temp id if server returns some marker)
        tickets = tickets.filter((t) => !String(t.id).startsWith("temp-")); // drop temp
        tickets.unshift(saved);
        renderTickets();
        computeStats();
        feedback.textContent = "Request submitted. We'll get back soon.";
        form.reset();
      })
      .catch((err) => {
        console.error("Post ticket error", err);
        // revert optimistic
        tickets = tickets.filter((t) => !String(t.id).startsWith("temp-"));
        renderTickets();
        computeStats();
        feedback.textContent = "Failed to send. Try again later.";
      });
  });

  // simple mark resolved action (sends PATCH if your API supports it)
  function markResolved(id) {
    if (!id) return;
    // optimistic change locally
    tickets = tickets.map((t) =>
      t.id === id ? { ...t, status: "resolved" } : t
    );
    renderTickets();
    computeStats();

    fetch(API_TICKETS + id + "/", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "resolved" }),
    }).then((r) => {
      if (!r.ok) {
        // revert if failed
        tickets = tickets.map((t) =>
          t.id === id ? { ...t, status: "open" } : t
        );
        renderTickets();
        computeStats();
      }
    });
  }

  // helper: escape text for safe insertion
  function escapeHtml(s) {
    if (!s) return "";
    return String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  // clear button
  document
    .getElementById("clear-btn")
    .addEventListener("click", () => form.reset());

  // accordion toggles
  document.querySelectorAll(".accordion .acc").forEach((btn) => {
    btn.addEventListener("click", () => {
      const panel = btn.nextElementSibling;
      const isOpen = panel.style.display === "block";
      document
        .querySelectorAll(".accordion .panel")
        .forEach((p) => (p.style.display = "none"));
      panel.style.display = isOpen ? "none" : "block";
    });
  });

  // init
  loadTickets();

  // ===== Custom Animated Dropdown (category) =====
  if (dd && ddToggle && ddMenu && ddLabel && categoryHidden) {
    const openDropdown = () => {
      dd.classList.add("open");
      dd.setAttribute("aria-expanded", "true");
      ddToggle.setAttribute("aria-expanded", "true");
      // Tailwind: ensure menu/backdrop are visible
      if (ddMenu.classList.contains("hidden"))
        ddMenu.classList.remove("hidden");
      if (ddBackdrop) {
        ddBackdrop.hidden = false;
        ddBackdrop.classList.remove("hidden");
      }
    };
    const closeDropdown = () => {
      dd.classList.remove("open");
      dd.setAttribute("aria-expanded", "false");
      ddToggle.setAttribute("aria-expanded", "false");
      // Tailwind: hide menu/backdrop after transition
      if (!ddMenu.classList.contains("hidden")) ddMenu.classList.add("hidden");
      if (ddBackdrop) {
        setTimeout(() => {
          ddBackdrop.hidden = true;
          if (!ddBackdrop.classList.contains("hidden"))
            ddBackdrop.classList.add("hidden");
        }, 160);
      }
    };
    const toggleDropdown = () => {
      if (dd.classList.contains("open")) closeDropdown();
      else openDropdown();
    };

    // click handlers
    ddToggle.addEventListener("click", (e) => {
      e.preventDefault();
      toggleDropdown();
    });
    if (ddBackdrop) ddBackdrop.addEventListener("click", closeDropdown);

    // select item
    ddMenu.addEventListener("click", (e) => {
      const item = e.target.closest(".dropdown-item");
      if (!item) return;
      const value = item.getAttribute("data-value") || item.textContent.trim();
      ddLabel.textContent = value;
      categoryHidden.value = value;
      ddMenu.querySelectorAll(".dropdown-item").forEach((el) => {
        el.removeAttribute("aria-selected");
      });
      item.setAttribute("aria-selected", "true");
      closeDropdown();
    });

    // keyboard support
    ddToggle.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        toggleDropdown();
      }
      if (e.key === "Escape") closeDropdown();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDropdown();
    });
  }
}

//note:- ####################### help page ###############################3
function initHelp() {
  // Utility: debounce
  function debounce(fn, wait) {
    let t;
    return (...args) => {
      clearTimeout(t);
      t = setTimeout(() => fn(...args), wait);
    };
  }

  // Accordion behavior (accessible, animated)
  const accButtons = document.querySelectorAll(".accordion .acc");
  accButtons.forEach((btn) => {
    const panel = btn.parentElement.querySelector(".panel");
    // ensure initial ARIA states
    btn.setAttribute("aria-expanded", "false");
    panel.setAttribute("aria-hidden", "true");

    btn.addEventListener("click", () => {
      const expanded = btn.getAttribute("aria-expanded") === "true";
      // close all
      accButtons.forEach((b) => {
        b.setAttribute("aria-expanded", "false");
        const p = b.parentElement.querySelector(".panel");
        p.classList.remove("open");
        p.setAttribute("aria-hidden", "true");
        p.style.maxHeight = null;
      });
      // open toggled one if previously closed
      if (!expanded) {
        btn.setAttribute("aria-expanded", "true");
        panel.classList.add("open");
        panel.setAttribute("aria-hidden", "false");
        // animate to scrollHeight for smooth open
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });

    // ensure smooth height recalculation on content/resize
    window.addEventListener("resize", () => {
      if (panel.classList.contains("open")) {
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

  // Search: live filter for accordion questions + cards with debounce
  const input = document.getElementById("helpSearch");
  const clearBtn = document.getElementById("clearSearch");
  const cards = document.querySelectorAll(".help-card");
  const accItems = document.querySelectorAll(".accordion .acc_item");

  function updateClearBtn() {
    const v = (input.value || "").trim();
    clearBtn.hidden = !v;
  }

  function filterAll(q) {
    q = (q || "").toLowerCase().trim();

    // filter accordion items (match both question and panel text)
    accItems.forEach((item) => {
      const btn = item.querySelector(".acc");
      const panel = item.querySelector(".panel");
      const text = (btn.textContent + " " + panel.textContent).toLowerCase();
      const match = !q || text.includes(q);
      item.style.display = match ? "" : "none";
      // close panels that are hidden
      if (!match && panel.classList.contains("open")) {
        btn.click(); // close it via existing handler
      }
    });

    // filter cards (match heading + paragraph)
    cards.forEach((c) => {
      const txt = c.textContent.toLowerCase();
      c.style.display = !q || txt.includes(q) ? "" : "none";
    });

    updateClearBtn();
  }

  const debouncedFilter = debounce((e) => filterAll(e.target.value), 180);

  if (input) {
    input.addEventListener("input", debouncedFilter);
    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        input.value = "";
        filterAll("");
        input.blur();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      input.value = "";
      input.focus();
      filterAll("");
    });
  }

  // progressive enhancement: ensure card clicks still work if no inline onclick available.
  // For now we leave existing onclick handlers intact but add data-action support.
  document.querySelectorAll(".help-card[data-action]").forEach((el) => {
    el.addEventListener("click", () => {
      const act = el.dataset.action;
      if (typeof window[act] === "function") window[act]();
    });
  });

  // initial state
  updateClearBtn();

  // keyboard accessibility: allow Enter/Space on cards that are anchors/links
  document.querySelectorAll(".help-card").forEach((card) => {
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
    card.tabIndex = card.getAttribute("href") ? 0 : 0; // make focusable
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
  event_activity: false,
  support: false,
  help: false,
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
  if (path.includes("event_activity") && !initializationState.event_activity) {
    initializationState.event_activity = true;
    initEventActivity();
  }
  if (path.includes("support") && !initializationState.support) {
    initializationState.support = true;
    initSupport();
  }
  if (path.includes("help") && !initializationState.help) {
    initializationState.help = true;
    initHelp();
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

// Theme Management System
class ThemeManager {
  constructor() {
    this.storageKey = "campuscare-theme";
    this.themes = ["light", "dark"];
    this.currentTheme = this.getStoredTheme() || this.getSystemTheme();
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
    this.updateThemeToggle();
  }

  getStoredTheme() {
    try {
      return localStorage.getItem(this.storageKey);
    } catch (e) {
      console.warn("LocalStorage not available for theme storage");
      return null;
    }
  }

  getSystemTheme() {
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      return "dark";
    }
    return "light";
  }

  storeTheme(theme) {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (e) {
      console.warn("Could not store theme preference");
    }
  }

  applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    this.currentTheme = theme;
    this.storeTheme(theme);

    // Update FullCalendar theme if it exists
    if (window.calendar && window.calendar.render) {
      // Force calendar re-render to apply new theme
      setTimeout(() => {
        window.calendar.render();
      }, 100);
    }
  }

  toggleTheme() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";

    // Add transition class for smooth theme switching
    document.documentElement.classList.add("theme-transitioning");

    this.applyTheme(newTheme);
    this.updateThemeToggle();

    // Remove transition class after animation completes
    setTimeout(() => {
      document.documentElement.classList.remove("theme-transitioning");
    }, 300);
  }

  updateThemeToggle() {
    const toggleBtn = document.querySelector(".theme-toggle-btn");
    if (toggleBtn) {
      const sunIcon = toggleBtn.querySelector(".sun-icon");
      const moonIcon = toggleBtn.querySelector(".moon-icon");

      if (this.currentTheme === "dark") {
        sunIcon.style.opacity = "0";
        sunIcon.style.transform = "rotate(180deg) scale(0.8)";
        moonIcon.style.opacity = "1";
        moonIcon.style.transform = "rotate(0deg) scale(1)";
      } else {
        sunIcon.style.opacity = "1";
        sunIcon.style.transform = "rotate(0deg) scale(1)";
        moonIcon.style.opacity = "0";
        moonIcon.style.transform = "rotate(180deg) scale(0.8)";
      }
    }
  }

  // Listen for system theme changes
  listenForSystemThemeChanges() {
    if (window.matchMedia) {
      const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
      mediaQuery.addEventListener("change", (e) => {
        // Only update if user hasn't manually set a preference
        if (!this.getStoredTheme()) {
          const newTheme = e.matches ? "dark" : "light";
          this.applyTheme(newTheme);
          this.updateThemeToggle();
        }
      });
    }
  }
}

// Initialize theme manager
const themeManager = new ThemeManager();

// Global function for theme toggle button
function toggleTheme() {
  themeManager.toggleTheme();
}

// Listen for system theme changes
themeManager.listenForSystemThemeChanges();
