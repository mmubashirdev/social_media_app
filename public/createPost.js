// Prefill form if editing a post
window.addEventListener("DOMContentLoaded", () => {
  const editDataRaw = localStorage.getItem("editPostData");
  const urlParams = new URLSearchParams(window.location.search);
  const isEdit = urlParams.get("edit") === "1" && editDataRaw;
  const form = document.querySelector("form");
  const titleInput = document.querySelector('input[name="title"]');
  const captionInput = document.querySelector('textarea[name="caption"]');
  const tagsInput = document.querySelector('input[name="tags"]');
  const imageInput = document.querySelector('input[name="image"]');
  const submitBtn = form?.querySelector('button[type="submit"]');
  if (isEdit && form && titleInput && captionInput && tagsInput && submitBtn) {
    const editData = JSON.parse(editDataRaw);
    titleInput.value = editData.title || "";
    captionInput.value = editData.caption || "";
    tagsInput.value = Array.isArray(editData.tags)
      ? editData.tags.join(", ")
      : "";
    // Change button text
    submitBtn.textContent = "Save Changes";
    // On submit, send PUT request to update post (with FormData for image support)
    form.onsubmit = async function (e) {
      e.preventDefault();
      const formData = new FormData();
      formData.append("title", titleInput.value);
      formData.append("caption", captionInput.value);
      formData.append("tags", tagsInput.value);
      if (imageInput && imageInput.files && imageInput.files[0]) {
        formData.append("image", imageInput.files[0]);
      }
      try {
        const res = await fetch(`/posts/${editData._id}`, {
          method: "PUT",
          body: formData,
          credentials: "include",
        });
        if (res.ok) {
          localStorage.removeItem("editPostData");
          window.location.href = "dashboard-feed.html";
        } 
      } catch (err) {
        console.log("Error updating post");
      }
    };
    return; // Prevent default create handler from attaching
  }
});
// Handles create post form and logic

let postForm = document.getElementById("postForm");
let title = document.getElementById("title");
let caption = document.getElementById("caption");
let postImage = document.getElementById("image");
let tags = document.getElementById("tags");
const postImagePreview = document.getElementById("postImagePreview");

if (postImage && postImagePreview) {
  postImage.addEventListener("change", function () {
    const file = this.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function (e) {
        postImagePreview.src = e.target.result;
        postImagePreview.style.display = "block";
      };
      reader.readAsDataURL(file);
    } else {
      postImagePreview.src = "upload/image.png";
      postImagePreview.style.display = "none";
    }
  });
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

checkAuthAndInit();

if (!window.location.search.includes("edit=1")) {
  postForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    let formData = new FormData();
    formData.append("title", title.value);
    formData.append("caption", caption.value);
    if (postImage.files[0]) {
      formData.append("image", postImage.files[0]);
    }
    formData.append("tags", tags.value);
    try {
      let url = "/posts";
      let method = "POST";
      let response = await fetch(url, {
        method: method,
        body: formData,
        credentials: "include",
      });
      if (response.status === 401) {
        window.location.href = "./login.html";
        return;
      }
      if (response.ok) {
        postForm.reset();
        if (postImagePreview) {
          postImagePreview.src = "upload/image.png";
          postImagePreview.style.display = "none";
        }
        window.location.href = "dashboard-feed.html";
      } else {
        throw new Error("Failed to save post");
      }
    } catch (error) {
      console.error(error);
    }
  });
}
