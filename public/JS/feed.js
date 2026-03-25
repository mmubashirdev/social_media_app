function profile(){
  window.location.href = "edit-profile.html";
}



async function loadNotifications() {
  try {
    const res = await fetch("/notify/", { credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    const notifications = data.notifications || [];
    const dropdown = document.querySelector(
      ".notification-bell .dropdown-menu",
    );
    if (!dropdown) return;
    if (notifications.length === 0) {
      dropdown.innerHTML = '<li class="dropdown-item">No notifications</li>';
      return;
    }
    dropdown.innerHTML = notifications
      .map((n) => renderNotificationItem(n))
      .join("");
  } catch (err) {
    const dropdown = document.querySelector(
      ".notification-bell .dropdown-menu",
    );
    if (dropdown)
      dropdown.innerHTML =
        '<li class="dropdown-item text-danger">Error loading notifications</li>';
  }
}

function renderNotificationItem(n) {
  let text = "";
  if (n.type === "like") {
    text = `<b>${n.fromUser?.username || "Someone"}</b> liked your post`;
  } else if (n.type === "comment") {
    text = `<b>${n.fromUser?.username || "Someone"}</b> commented on your post`;
  } else if (n.type === "follow_request") {
    text = `<b>${n.fromUser?.username || "Someone"}</b> started following you`;
  } else {
    text = "You have a new notification";
  }
  return `<li class="dropdown-item">${text}</li>`;
}

document.addEventListener("DOMContentLoaded", () => {
  const bellBtn = document.querySelector(".notification-bell > button");
  if (bellBtn) {
    bellBtn.addEventListener("click", loadNotifications);
  }
});

function resolveImageUrl(value, fallback = "/upload/image.png") {
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;
  return `/upload/${value}`;
}

function deletePost(postId) {
  fetch(`/posts/${postId}`, {
    method: "DELETE",
    credentials: "include",
  })
    .then((res) => {
      if (res.ok) {
        loadPosts();
      } else {
        alert("Failed to delete post");
      }
    })
    .catch(() => alert("Error deleting post"));
}

function editPost(postId) {
  const postCard = document.querySelector(`[data-post-id="${postId}"]`);
  if (!postCard) return;
  const postTitle = postCard.querySelector(".post-title")?.textContent || "";
  const postCaption =
    postCard.querySelector(".post-caption")?.textContent || "";
  const postImageSrc =
    postCard.querySelector(".post-image")?.getAttribute("src") || "";
  const postImage = postImageSrc.startsWith("/upload/")
    ? postImageSrc.replace(/^\/upload\//, "")
    : postImageSrc;

  const postTags =
    postCard
      .querySelector(".post-tags .tag")
      ?.textContent?.split(",")
      .map((t) => t.trim()) || [];

  localStorage.setItem(
    "editPostData",
    JSON.stringify({
      _id: postId,
      title: postTitle,
      caption: postCaption,
      img: postImage,
      tags: postTags,
    }),
  );

  window.location.href = "create-post.html?edit=1";
}
let postSection = document.getElementById("posts");

function createPostCard(post, currentUser) {
  let tags = "";
  if (post.tags && Array.isArray(post.tags) && post.tags.length > 0) {
    tags = `<div class="post-tags"><span class="tag">${post.tags.join(", ")}</span></div>`;
  }
  let image = "";
  if (post.img) {
    image = `<img src="${resolveImageUrl(post.img)}" alt="${post.title}" class="post-image">`;
  }

  let postUserId = post.user?._id?.toString() || post.user?.toString() || "";
  let currentUserId =
    currentUser?._id?.toString() || currentUser?.id?.toString() || "";

  let dropdown = "";
  if (currentUserId && postUserId === currentUserId) {
    dropdown = `
      <div class="d-flex align-items-center gap-2">
        <div class="dropdown">
          <button class="border-0 bg-white" type="button" data-bs-toggle="dropdown">
            <i class="bi bi-three-dots"></i>
          </button>
          <ul class="dropdown-menu">
            <li class="dropdown-item" onclick="editPost('${post._id}')">Edit Post</li>
            <li class="dropdown-item" onclick="deletePost('${post._id}')">Delete Post</li>
          </ul>
        </div>
      </div>
    `;
  }
  let followBtn = "";
  let chatBtn = "";
  let authorMarkup = `<div class="post-author">${post.author}</div>`;

  if (currentUser && postUserId && postUserId !== currentUserId) {
    authorMarkup = `<a class="post-author post-author-link" href="chat.html?userId=${postUserId}" title="Chat with ${post.author}">${post.author}</a>`;

    chatBtn = `<a class="ms-2 btn btn-sm btn-outline-secondary" href="chat.html?userId=${postUserId}">Chat</a>`;

    if (post.isFollowing) {
      followBtn = `<button class="ms-2 btn btn-sm btn-primary follow-btn" data-authorid="${postUserId}">Following</button>`;
    } else {
      followBtn = `<button class="ms-2 btn btn-sm btn-outline-primary follow-btn" data-authorid="${postUserId}">Follow</button>`;
    }
  }
  return `
    <article class="post-card bg-white" data-post-id="${post._id}">
      <div class="post-header d-flex justify-content-between">
        <div class="d-flex align-items-center">
          <div class="post-avatar"> <img src="${resolveImageUrl(post.user && post.user.profilePic ? post.user.profilePic : "image.png")}" alt="Profile Image" class="rounded-circle" width="50" height="50" /></div>
          <div class="post-meta">
            ${authorMarkup}
          </div>
          ${chatBtn}
          ${followBtn}
        </div>
        ${dropdown}
      </div>

      <h3 class="post-title">${post.title}</h3>
      <p class="post-caption">${post.caption}</p>
      ${image}
      ${tags}
      <div class="post-actions">
        <button class="action-btn like-btn${post.isLiked ? " liked" : ""}" data-postid="${post._id}">
          <i class="bi bi-heart-fill"></i> <span class="like-count">${post.likesCount || 0}</span>
        </button>
        <button class="action-btn comment-btn" data-postid="${post._id}">
          <i class="bi bi-chat"></i> Comment
        </button>
      </div>
      <div class="comments-section" id="comments-${post._id}" style="display: none;">
        <div class="comments-list"></div>
        <form class="comment-form" onsubmit="return false;">
          <input type="text" class="comment-input" placeholder="Write a comment" required>
          <button type="submit" class="comment-submit-btn">Post</button>
        </form>
      </div>
    </article>
  `;
}

function loadPosts() {
  fetch("/posts", { credentials: "include" })
    .then(async (res) => {
      if (res.status === 401) {
        postSection.innerHTML =
          '<p class="no-posts">Session expired. Please log in again.</p>';
        return;
      }
      if (!res.ok) {
        const text = await res.text();

        postSection.innerHTML = '<p class="no-posts">Error loading posts</p>';
        return;
      }
      return res.json();
    })
    .then((data) => {
      console.log("Feed data:", data);
      console.log("Current user:", currentUser);
      if (!data) {
        postSection.innerHTML =
          '<p class="no-posts">No posts yet or error loading feed.</p>';
        return;
      }
      if (!Array.isArray(data) || data.length === 0) {
        postSection.innerHTML = '<p class="no-posts">No posts yet</p>';
        return;
      }
      let html = "";
      data.forEach((post) => {
        html += createPostCard(post, currentUser);
      });
      postSection.innerHTML = html;
      attachFeedEventListeners();
    })
    .catch((err) => {
      postSection.innerHTML = '<p class="no-posts">Error loading posts</p>';
      console.error("loadPosts error", err);
    });
}

function attachFeedEventListeners() {
  document.querySelectorAll(".like-btn").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const postId = this.getAttribute("data-postid");
      await toggleLike(postId, this);
    });
  });
  document.querySelectorAll(".comment-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const postId = this.getAttribute("data-postid");
      toggleComments(postId);
    });
  });
  document.querySelectorAll(".follow-btn").forEach((btn) => {
    btn.addEventListener("click", async function () {
      const authorId = this.getAttribute("data-authorid");
      this.disabled = true;
      try {
        let res = await fetch("/toggle", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            followerId: currentUser.id,
            followedId: authorId,
          }),
        });
        if (res.ok) {
          let data = await res.json();
          if (data.action === "followed") {
            this.textContent = "Following";
            this.classList.remove("btn-outline-primary");
            this.classList.add("btn-primary");
          } else {
            this.textContent = "Follow";
            this.classList.remove("btn-primary");
            this.classList.add("btn-outline-primary");
          }
        }
      } catch (err) {}
      this.disabled = false;
    });
  });
  document.querySelectorAll(".comment-form").forEach((form) => {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const postId = form.closest(".post-card").getAttribute("data-post-id");
      const input = form.querySelector(".comment-input");
      const text = input.value.trim();
      if (!text) return;
      try {
        let response = await fetch(`/posts/${postId}/comments`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          credentials: "include",
        });
        if (response.ok) {
          input.value = "";
          await loadComments(postId);
        }
      } catch (error) {
        console.error("Error adding comment:", error);
      }
    });
  });
}

async function toggleLike(postId, btn) {
  try {
    let response = await fetch(`/posts/${postId}/like`, {
      method: "PUT",
      credentials: "include",
    });
    if (response.ok) {
    }
  } catch (error) {
    console.error("Error toggling like:", error);
  }
}

function toggleComments(postId) {
  let commentsSection = document.getElementById(`comments-${postId}`);
  if (commentsSection.style.display === "none") {
    commentsSection.style.display = "block";
    loadComments(postId);
  } else {
    commentsSection.style.display = "none";
  }
}

async function loadComments(postId) {
  let commentsSection = document.getElementById(`comments-${postId}`);
  let commentsList = commentsSection.querySelector(".comments-list");
  try {
    let response = await fetch(`/posts/${postId}/comments`, {
      credentials: "include",
    });
    if (response.ok) {
      let comments = await response.json();
      if (comments.length === 0) {
        commentsList.innerHTML = '<p class="no-comments">No comments</p>';
        return;
      }
      let html = "";
      comments.forEach((comment) => {
        let deleteBtn = "";
        if (
          currentUser &&
          comment.user &&
          comment.user._id === currentUser.id
        ) {
          deleteBtn = `<button class="delete-comment-btn" onclick="deleteComment('${comment._id}', '${postId}')"><div class="center"><i class="bi bi-trash"></i></div></button>`;
        }

        let replyBtn = `<button class="reply-comment-btn btn btn-link p-0 ms-2" data-comment-id="${comment._id}" data-post-id="${postId}">Reply</button>`;
        let replyForm = `
          <form class="reply-form mt-2 d-none" data-parent-comment="${comment._id}">
            <input type="text" class="reply-input form-control form-control-sm" placeholder="Write a reply" required>
            <button type="submit" class="btn btn-sm btn-primary mt-1">Reply</button>
          </form>
        `;

        const isReply = !!comment.parentComment;
        html += `
          <div class="comment${isReply ? " reply" : ""}" data-comment-id="${comment._id}">
            <span class="comment-author">${comment.user?.username || "Unknown"}</span>
            <span class="comment-text">${comment.text}</span>
            ${deleteBtn}
            ${replyBtn}
            ${replyForm}
          </div>
        `;
      });
      commentsList.innerHTML = html;

      attachReplyEventListeners(postId);
    }
  } catch (error) {
    commentsList.innerHTML =
      '<p class="no-comments">Error loading comments</p>';
  }
}

function attachReplyEventListeners(postId) {
  document.querySelectorAll(".reply-comment-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const commentId = btn.getAttribute("data-comment-id");
      const commentDiv = document.querySelector(
        `.comment[data-comment-id='${commentId}']`,
      );
      const replyForm = commentDiv.querySelector(".reply-form");
      if (replyForm.classList.contains("d-none")) {
        replyForm.classList.remove("d-none");
        replyForm.querySelector(".reply-input").focus();
      } else {
        replyForm.classList.add("d-none");
      }
    });
  });

  document.querySelectorAll(".reply-form").forEach((form) => {
    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const parentCommentId = form.getAttribute("data-parent-comment");
      const input = form.querySelector(".reply-input");
      const text = input.value.trim();
      if (!text) return;
      try {
        let response = await fetch(`/comments/${parentCommentId}/reply`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ postId, text }),
        });
        if (response.ok) {
          input.value = "";
          form.classList.add("d-none");
          await loadComments(postId);
        } else {
          console.error(
            "Reply failed:",
            response.status,
            await response.text(),
          );
        }
      } catch (error) {
        console.error("Error replying to comment:", error);
      }
    });
  });
}

async function deleteComment(commentId, postId) {
  try {
    let response = await fetch(`/comments/${commentId}`, {
      method: "DELETE",
      credentials: "include",
    });
    if (response.ok) {
      await loadComments(postId);
    }
  } catch (error) {
    console.error("Error deleting comment:", error);
  }
}

function updateLikeUI(data) {
  const { postId, userId, totalLikes, isLiked } = data;
  const postCard = document.querySelector(`[data-post-id="${postId}"]`);
  if (!postCard) return;
  const likeBtn = postCard.querySelector(".like-btn");
  const likeCount = postCard.querySelector(".like-count");
  if (likeCount && typeof totalLikes === "number") {
    likeCount.textContent = totalLikes;
  }
  if (likeBtn && currentUser && userId === currentUser._id) {
    if (isLiked) {
      likeBtn.classList.add("liked");
    } else {
      likeBtn.classList.remove("liked");
    }
  }
}

function setupFeedSocketEvents() {
  if (!socket) return;
  socket.on("postLiked", (data) => {
    updateLikeUI(data);
  });
  socket.on("newComment", (data) => {
    if (data && data.post) {
      const commentsSection = document.getElementById(`comments-${data.post}`);
      if (commentsSection && commentsSection.style.display !== "none") {
        loadComments(data.post);
      }
    }
  });
  socket.on("followChanged", (data) => {
    document.querySelectorAll(".follow-btn").forEach((btn) => {
      if (btn.getAttribute("data-authorid") === data.followedId) {
        if (
          data.action === "followed" &&
          data.followerId === currentUser._idid
        ) {
          btn.textContent = "Following";
          btn.classList.remove("btn-outline-primary");
          btn.classList.add("btn-primary");
        } else if (
          data.action === "unfollow" &&
          data.followerId === currentUser._id
        ) {
          btn.textContent = "Follow";
          btn.classList.remove("btn-primary");
          btn.classList.add("btn-outline-primary");
        }
      }
    });
  });
  socket.on("newPost", () => {
    loadPosts();
  });
}

let currentUser = null;
let socket = null;

async function checkAuthAndInit() {
  try {
    let res = await fetch("/verify-auth", { credentials: "include" });
    if (!res.ok) {
      window.location.href = "./login.html";
      return;
    }
    let data = await res.json();
    if (!data || !data.user) {
      window.location.href = "./login.html";
      return;
    }
    currentUser = data.user;
    console.log("Auth success. Current user:", currentUser);
    window.currentUser = currentUser;
    initSocket();
    setupFeedSocketEvents();
    loadPosts();
  } catch (err) {
    console.error("Auth check failed:", err);
    window.location.href = "./login.html";
  }
}

function initSocket() {
  if (!socket) {
    socket = io();
  }
}

checkAuthAndInit();
