const profilePicPreview = document.getElementById("profilePicPreview");
const profilePicInput = document.getElementById("profilePicInput");
const editUsername = document.getElementById("editUsername");
const email = document.getElementById("email");
const editProfileForm = document.getElementById("editProfileForm");
const editPassword = document.getElementById("editPassword");
const visibility = document.getElementById("visibility");
const postNumber = document.getElementById("postNumber");
const followersNumber = document.getElementById("followersNumber");
const followingNumber = document.getElementById("followingNumber");

function resolveImageUrl(value, fallback = "/upload/image.png") {
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;
  return `/upload/${value}`;
}

let currentUser = null;
let socket = null;

async function checkAuthAndInit(callback) {
  try {
    let res = await fetch("/verify-auth", { credentials: "include" });
    if (!res.ok) {
      window.location.href = "./login.html";
      return;
    }
    let data = await res.json();
    currentUser = data.user;
    if (typeof callback === "function") callback();
  } catch (err) {
    window.location.href = "./login.html";
  }
}

function initSocket() {
  if (!socket) {
    socket = io();
  }
}

checkAuthAndInit(() => {
  if (currentUser) {
    editUsername.value = currentUser.username || "";
    email.value = currentUser.email || "";
    visibility.value = currentUser.visibility || "public";
    if (currentUser.profilePic) {
      profilePicPreview.src = resolveImageUrl(currentUser.profilePic);
    } else {
      profilePicPreview.src = "/upload/image.png";
    }
    updateFollowersFollowingCounts();
  }
});

profilePicInput.addEventListener("change", function () {
  const file = this.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function (e) {
      profilePicPreview.src = e.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    if (currentUser && currentUser.profilePic) {
      profilePicPreview.src = resolveImageUrl(currentUser.profilePic);
    } else {
      profilePicPreview.src = "/upload/image.png";
    }
  }
});

editProfileForm.addEventListener("submit", async function (e) {
  e.preventDefault();
  const formData = new FormData();
  formData.append("username", editUsername.value);
  formData.append("visibility", visibility.value);
  if (profilePicInput.files[0]) {
    formData.append("profilePic", profilePicInput.files[0]);
  }
  if (editPassword.value) {
    formData.append("password", editPassword.value);
  }
  try {
    const res = await fetch(`/users/${currentUser.id}`, {
      method: "PUT",
      body: formData,
      credentials: "include",
    });
    if (res.ok) {
      const data = await res.json();
      currentUser = data.user;
      editUsername.value = currentUser.username;
      visibility.value = currentUser.visibility;
      if (currentUser.profilePic) {
        profilePicPreview.src = resolveImageUrl(currentUser.profilePic);
      } else {
        profilePicPreview.src = "/upload/image.png";
      }
    }
  } catch (err) {
    console.log("Error updating profile");
  }
});

async function updateFollowersFollowingCounts() {
  if (!currentUser) return;
  try {
    let res1 = await fetch(`/follower/${currentUser.id}`, {
      credentials: "include",
    });
    if (res1.ok) {
      let data = await res1.json();
      followersNumber.textContent = data.totalFollowers || 0;
    }
    let res2 = await fetch(`/following/${currentUser.id}`, {
      credentials: "include",
    });
    if (res2.ok) {
      let data = await res2.json();
      followingNumber.textContent = data.totalFollowing || 0;
    }
    let res3 = await fetch(`/users/${currentUser.id}/posts/count`, {
      credentials: "include",
    });
    if (res3.ok) {
      let data = await res3.json();
      postNumber.textContent = data.totalPosts || 0;
    }
  } catch (err) {
    followersNumber.textContent = 0;
    followingNumber.textContent = 0;
    postNumber.textContent = 0;
  }
}
