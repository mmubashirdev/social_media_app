// Handles followers/following popup logic

// Popup elements (create them dynamically)
let followersPopup = null;
let followersPopupBody = null;
let followersPopupLabel = null;
let closeFollowersPopup = null;

function createFollowersPopup() {
  if (document.getElementById("followersSimplePopup")) return;
  const popup = document.createElement("div");
  popup.id = "followersSimplePopup";
  popup.style.display = "none";
  popup.style.position = "fixed";
  popup.style.top = 0;
  popup.style.left = 0;
  popup.style.width = "100vw";
  popup.style.height = "100vh";
  popup.style.background = "rgba(0,0,0,0.4)";
  popup.style.zIndex = 3000;
  popup.style.alignItems = "center";
  popup.style.justifyContent = "center";
  popup.innerHTML = `
		<div style="background:#fff; border-radius:12px; max-width:350px; width:90vw; margin:auto; margin-top:10vh; box-shadow:0 8px 32px rgba(0,0,0,0.2);">
			<div style="display:flex; justify-content:space-between; align-items:center; padding:16px 20px 8px 20px; border-bottom:1px solid #eee;">
				<h5 id="followersSimplePopupLabel" style="margin:0;">Users</h5>
				<button id="closeFollowersSimplePopup" style="background:none; border:none; font-size:1.5rem; cursor:pointer;">&times;</button>
			</div>
			<div id="followersSimplePopupBody" style="padding:16px; max-height:350px; overflow-y:auto;"></div>
		</div>
	`;
  document.body.appendChild(popup);
  followersPopup = popup;
  followersPopupBody = document.getElementById("followersSimplePopupBody");
  followersPopupLabel = document.getElementById("followersSimplePopupLabel");
  closeFollowersPopup = document.getElementById("closeFollowersSimplePopup");
  closeFollowersPopup.onclick = () => {
    followersPopup.style.display = "none";
    followersPopupBody.innerHTML = "";
  };
}

// REMOVED: Duplicate auth check (handled by feed.js)
// Auth only needed for API calls after popup opens
// currentUser set globally by feed.js via window.currentUser

async function showFollowersFollowing(type) {
  const currentUser = window.currentUser; // Use global from feed.js
  if (!currentUser) {
    followersPopupBody.innerHTML =
      '<div style="text-align:center;">Please refresh page</div>';
    return;
  }
  createFollowersPopup();
  let url =
    type === "followers"
      ? `/follower/${currentUser._id}`
      : `/following/${currentUser._id}`;
  let label = type === "followers" ? "Followers" : "Following";
  followersPopupLabel.textContent = label;
  followersPopupBody.innerHTML =
    '<div style="text-align:center;">Loading...</div>';
  followersPopup.style.display = "flex";
  try {
    let res = await fetch(url, { credentials: "include" });
    if (res.ok) {
      let data = await res.json();
      let users = type === "followers" ? data.followers : data.following;
      if (!users || users.length === 0) {
        followersPopupBody.innerHTML = `<div style="text-align:center;">No ${label.toLowerCase()} found.</div>`;
        return;
      }
      let html = '<ul style="list-style:none; padding:0; margin:0;">';
      users.forEach((u) => {
        let user = type === "followers" ? u.followerId : u.followedId;
        if (!user) return;
        let isSelf = user._id === currentUser._id;
        html += `<li style="display:flex; align-items:center; justify-content:space-between; padding:8px 0; border-bottom:1px solid #eee;">
					<div style="display:flex; align-items:center; gap:10px;">
						<img src="upload/${user.profilePic || "image.png"}" class="rounded-circle" width="40" height="40" alt="Profile" />
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
      followersPopupBody.innerHTML = `<div style="text-align:center;">Failed to load ${label.toLowerCase()}.</div>`;
    }
  } catch (err) {
    followersPopupBody.innerHTML = `<div style="text-align:center;">Error loading data.</div>`;
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

// Attach popup listeners (no auth check needed here)
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
