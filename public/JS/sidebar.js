async function handleSidebarLogout() {
  try {
    const res = await fetch("/logout", {
      method: "POST",
      credentials: "include",
    });

    if (res.ok) {
      window.location.href = "login.html";
      return;
    }
  } catch (err) {}

  window.location.href = "login.html";
}

function setActiveSidebarLink() {
  const links = Array.from(document.querySelectorAll(".app-sidebar-link"));
  if (links.length === 0) return;

  const currentPath = (
    window.location.pathname.split("/").pop() || ""
  ).toLowerCase();
  const routeMap = {
    "": "dashboard-feed.html",
    "index.html": "dashboard-feed.html",
    "dashboard-feed.html": "dashboard-feed.html",
    "edit-profile.html": "edit-profile.html",
    "chat.html": "chat.html",
    "create-post.html": "dashboard-feed.html",
  };

  const activeHref = routeMap[currentPath] || "dashboard-feed.html";

  links.forEach((link) => link.classList.remove("active"));
  const activeLink = links.find(
    (link) => (link.getAttribute("href") || "").toLowerCase() === activeHref,
  );

  if (activeLink) {
    activeLink.classList.add("active");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  setActiveSidebarLink();
  document.querySelectorAll(".app-sidebar-logout").forEach((btn) => {
    btn.addEventListener("click", handleSidebarLogout);
  });
});
