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
  loadpage("my_reports");
}

function recordVideo() {
  alert("Record Video clicked! 🎥");
  // You can integrate your video recording logic here
}


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

//@important:-  ############################## Report Page ####################################

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

  window.addComment = function (i,comment) {
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

function initNotifications() {
  const notifications = [
    {
      type_icon:
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F010%2F366%2F202%2Foriginal%2Fbell-icon-transparent-notification-free-png.png&f=1&nofb=1&ipt=19bdd368cbf776c232da7dfb7ff6b7140d2f053147e0f045d88e29fe9c6482b7",
      title: "Freshers Announcement",
      desc: "There will be a freshers party soon in the college premises",
      time: "1h ago",
      isLatest: true,
    },
    {
      type_icon:
        "https://external-content.duckduckgo.com/iu/?u=https%3A%2F%2Fcdn-icons-png.flaticon.com%2F512%2F2417%2F2417835.png&f=1&nofb=1&ipt=72233f0bf8ab254de30b16294a009c2d9093e7fed63260a98cab5e15551efb2d",
      title: "Freshers cancelled due to mismanagement in college",
      desc: "There will be no freshers party in college due to mismanagement of students",
      time: "1m ago",
      isLatest: true,
    },
  ];
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
            <img src="${n.type_icon}" alt="" width="20" height="20" />
          </div>
          <div class="noti_content">
            <p class="noti_title">${n.title}</p>
            <p class="noti_body">${n.desc}</p>
            <span class="noti_meta">${n.time}</span>
          </div>
          <span class="noti_dot" aria-hidden="${n.isLatest}"></span>
        </a>
        <div>
      `;
    });
  }
}
// If user directly loads /reports/, initialize immediately
document.addEventListener("DOMContentLoaded", () => {
  if (window.location.pathname.includes("my_reports")) {
    initReports();
  }
});
