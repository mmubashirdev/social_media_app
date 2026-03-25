let followersPopup = null;
let followersPopupBody = null;
let followersPopupLabel = null;
let closeFollowersPopup = null;

function resolveImageUrl(value, fallback = "/upload/image.png") {
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;
  return `/upload/${value}`;
}

function createFollowersPopup() {
  if (document.getElementById("followersSimplePopup")) return;
  const popup = document.createElement("div");
  popup.id = "followersSimplePopup";
  popup.className = "followers-popup";
  popup.innerHTML = `
		<div class="followers-popup-dialog">
			<div class="followers-popup-header">
				<h5 id="followersSimplePopupLabel" class="followers-popup-title">Users</h5>
				<button id="closeFollowersSimplePopup" class="followers-popup-close">&times;</button>
			</div>
			<div id="followersSimplePopupBody" class="followers-popup-body"></div>
		</div>
	`;
  document.body.appendChild(popup);
  followersPopup = popup;
  followersPopupBody = document.getElementById("followersSimplePopupBody");
  followersPopupLabel = document.getElementById("followersSimplePopupLabel");
  closeFollowersPopup = document.getElementById("closeFollowersSimplePopup");
  closeFollowersPopup.onclick = () => {
    followersPopup.classList.remove("show");
    followersPopupBody.innerHTML = "";
  };
}

async function showFollowersFollowing(type) {
  const currentUser = window.currentUser;
  if (!currentUser) {
    followersPopupBody.innerHTML =
      '<div class="followers-popup-message">Please refresh page</div>';
    return;
  }
  createFollowersPopup();
  let url;
  if (type === "followers") {
    url = "/follower/" + currentUser._id;
  } else {
    url = "/following/" + currentUser._id;
  }
  let label = type === "followers" ? "Followers" : "Following";
  followersPopupLabel.textContent = label;
  followersPopupBody.innerHTML =
    '<div class="followers-popup-message">Loading...</div>';
  followersPopup.classList.add("show");
  try {
    let res = await fetch(url, { credentials: "include" });
    if (res.ok) {
      let data = await res.json();
      let users = type === "followers" ? data.followers : data.following;
      if (!users || users.length === 0) {
        followersPopupBody.innerHTML = `<div class="followers-popup-message">No ${label.toLowerCase()} found.</div>`;
        return;
      }
      let html = '<ul class="followers-list">';
      users.forEach((u) => {
        let user = type === "followers" ? u.followerId : u.followedId;
        if (!user) return;
        let isSelf = user._id === currentUser._id;
        html += `<li class="followers-list-item">
					<div class="followers-user-info">
            <img src="${resolveImageUrl(user.profilePic || "image.png")}" class="rounded-circle" width="40" height="40" alt="Profile" />
						<span>${user.username}</span>
					</div>
					${!isSelf ? `<button class="btn btn-sm btn-outline-primary follow-toggle-btn" data-userid="${user._id}">Follow</button>` : ""}
				</li>`;
      });
      html += "</ul>";
      followersPopupBody.innerHTML = html;
      document.querySelectorAll(".follow-toggle-btn").forEach((btn) => {
        btn.addEventListener("click", async function () {
          const targetId = this.getAttribute("data-userid");
          await toggleFollowUser(targetId, this);
        });
      });
    } else {
      followersPopupBody.innerHTML = `<div class="followers-popup-message">Failed to load ${label.toLowerCase()}.</div>`;
    }
  } catch (err) {
    followersPopupBody.innerHTML =
      '<div class="followers-popup-message">Error loading data.</div>';
  }
}

async function toggleFollowUser(targetUserId, btn) {
  if (!currentUser) return;
  btn.disabled = true;
  try {
    let res = await fetch("/toggle", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        followerId: currentUser._pid,
        followedId: targetUserId,
      }),
    });
    if (res.ok) {
      let data = await res.json();
      btn.textContent = data.action === "followed" ? "Unfollow" : "Follow";
    }
  } catch (err) {}
  btn.disabled = false;
}

createFollowersPopup();
const followersCountDiv = document.getElementById("followersCount");
const followingCountDiv = document.getElementById("followingCount");
if (followersCountDiv) {
  followersCountDiv.addEventListener("click", () =>
    showFollowersFollowing("followers"),
  );
}
if (followingCountDiv) {
  followingCountDiv.addEventListener("click", () =>
    showFollowersFollowing("following"),
  );
}
