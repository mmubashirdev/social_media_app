let currentUser = null;
let selectedUserId = null;
let selectedUsername = "";
let refreshTimer = null;
let unreadCountsByUser = {};
let friendsCache = [];
let socket = null;
const chatContainer = document.getElementById("chatMessages");
const input = document.getElementById("messageInput");
const friendsList = document.getElementById("friendsList");
const chatHeaderTitle = document.getElementById("chatHeaderTitle");

function resolveImageUrl(value, fallback = "/upload/image.png") {
  if (!value) return fallback;
  if (/^https?:\/\//i.test(value)) return value;
  return `/upload/${value}`;
}

function getSelectedUserFromUrl() {
  const params = new URLSearchParams(window.location.search);
  return params.get("userId") || params.get("receiverId");
}

function setChatHeader(name) {
  chatHeaderTitle.textContent = name || "Select a friend";
}

function setInputEnabled(enabled) {
  input.disabled = !enabled;
  if (!enabled) {
    input.value = "";
  }
}

function normalizeChatUsers(followers, following) {
  const map = new Map();

  followers.forEach((entry) => {
    const user = entry.followerId;
    if (!user || !user._id || user._id === currentUser.id) return;
    map.set(user._id.toString(), user);
  });

  following.forEach((entry) => {
    const user = entry.followedId;
    if (!user || !user._id || user._id === currentUser.id) return;
    map.set(user._id.toString(), user);
  });

  return Array.from(map.values()).sort((a, b) =>
    (a.username || "").localeCompare(b.username || ""),
  );
}

function renderFriends(users, unreadCounts = {}) {
  if (!friendsList) return;

  if (!users.length) {
    friendsList.innerHTML =
      '<div class="friends-empty">No friends to chat with yet.</div>';
    return;
  }

  friendsList.innerHTML = users
    .map((user) => {
      const count = unreadCounts[user._id?.toString?.() || user._id] || 0;
      return `
      <button class="friend-item" data-userid="${user._id}" data-username="${user.username || "User"}">
        <img class="friend-avatar" src="${resolveImageUrl(user.profilePic || "image.png")}" alt="${user.username || "User"}" />
        <span class="friend-name">${user.username || "User"}</span>
        <span class="badge bg-danger ${count > 0 ? "" : "d-none"}">${count || ""}</span>
      </button>

        `;
    })
    .join("");

  friendsList.querySelectorAll(".friend-item").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const userId = btn.getAttribute("data-userid");
      const username = btn.getAttribute("data-username") || "User";
      await selectChatUser(userId, username, true);
    });
  });
}

function rerenderFriends() {
  renderFriends(friendsCache, unreadCountsByUser);
  if (selectedUserId) {
    setActiveFriend(selectedUserId);
  }
}

function initSocket() {
  if (socket || !currentUser) return;

  socket = io();
  socket.emit("register", currentUser.id);

  socket.on("chat:unread-update", async (payload = {}) => {
    const senderId = payload.senderId?.toString?.();
    if (!senderId) return;

    const unreadCount = Number(payload.unreadCount || 0);
    unreadCountsByUser[senderId] = unreadCount;

    if (unreadCount > 0 && selectedUserId && selectedUserId.toString() === senderId) {
      await markConversationRead(senderId);
      unreadCountsByUser[senderId] = 0;
      await loadMessages();
    }

    rerenderFriends();
  });
}

async function loadUnreadCounts() {
  if (!currentUser) return {};

  try {
    const res = await fetch("/messages/unread-counts", {
      credentials: "include",
    });

    if (!res.ok) return {};

    const data = await res.json();
    return data.counts || {};
  } catch (err) {
    return {};
  }
}

async function markConversationRead(senderId) {
  if (!senderId) return;

  try {
    await fetch(`/messages/read/${senderId}`, {
      method: "PATCH",
      credentials: "include",
    });
  } catch (err) {}
}

function setActiveFriend(userId) {
  if (!friendsList) return;
  friendsList.querySelectorAll(".friend-item").forEach((item) => {
    item.classList.toggle(
      "active",
      item.getAttribute("data-userid") === userId,
    );
  });
}

async function selectChatUser(userId, username, updateUrl) {
  selectedUserId = userId;
  selectedUsername = username || "User";
  setActiveFriend(userId);
  setChatHeader(selectedUsername);
  setInputEnabled(true);

  await markConversationRead(userId);
  unreadCountsByUser[userId] = 0;

  if (updateUrl) {
    const url = new URL(window.location.href);
    url.searchParams.set("userId", userId);
    window.history.replaceState({}, "", url.toString());
  }

  const users = await loadFriends();
  renderFriends(users, unreadCountsByUser);
  setActiveFriend(userId);

  await loadMessages();
}

async function loadFriends() {
  if (!currentUser) return [];

  try {
    const [followersRes, followingRes] = await Promise.all([
      fetch(`/follower/${currentUser.id}`, { credentials: "include" }),
      fetch(`/following/${currentUser.id}`, { credentials: "include" }),
    ]);

    if (!followersRes.ok || !followingRes.ok) {
      renderFriends([], unreadCountsByUser);
      return [];
    }

    const followersData = await followersRes.json();
    const followingData = await followingRes.json();

    const users = normalizeChatUsers(
      followersData.followers || [],
      followingData.following || [],
    );

    friendsCache = users;
    return users;
  } catch (err) {
    friendsCache = [];
    renderFriends([], unreadCountsByUser);
    return [];
  }
}

function renderMessage(msg) {
  const msgDiv = document.createElement("div");
  const senderId = msg.sender?._id || msg.sender;
  if (senderId && senderId.toString() === currentUser.id.toString()) {
    msgDiv.classList.add("message", "sent");
  } else {
    msgDiv.classList.add("message", "received");
  }
  msgDiv.textContent = msg.text;
  chatContainer.appendChild(msgDiv);
}

function renderSystemMessage(text) {
  chatContainer.innerHTML = `<div class="message received">${text}</div>`;
}

async function verifyAuth() {
  const res = await fetch("/verify-auth", { credentials: "include" });
  if (!res.ok) {
    window.location.href = "./login.html";
    return null;
  }
  const data = await res.json();
  return data.user;
}

async function loadMessages() {
  if (!currentUser || !selectedUserId) return;

  try {
    const res = await fetch(`/messages/${currentUser.id}/${selectedUserId}`, {
      credentials: "include",
    });

    if (!res.ok) {
      renderSystemMessage("Unable to load messages.");
      return;
    }

    const messages = await res.json();
    chatContainer.innerHTML = "";
    messages.forEach(renderMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } catch (err) {
    renderSystemMessage("Error loading messages.");
  }
}

async function sendMessage() {
  const message = input.value.trim();
  if (!message || !selectedUserId) return;

  try {
    const res = await fetch("/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({
        text: message,
        receiverId: selectedUserId,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      return;
    }

    renderMessage(data.data);
    input.value = "";
    chatContainer.scrollTop = chatContainer.scrollHeight;
  } catch (err) {
    console.log("Error sending message");
  }
}

window.sendMessage = sendMessage;

document.addEventListener("DOMContentLoaded", async () => {
  currentUser = await verifyAuth();
  if (!currentUser) return;
  initSocket();

  setInputEnabled(false);

  const users = await loadFriends();
  unreadCountsByUser = await loadUnreadCounts();
  renderFriends(users, unreadCountsByUser);
  const selectedFromUrl = getSelectedUserFromUrl();

  if (!selectedFromUrl && users.length === 0) {
    setChatHeader("Messages");
    renderSystemMessage("No friends found. Follow users to start chatting.");
    return;
  }

  if (selectedFromUrl) {
    const selectedUser = users.find(
      (u) => u._id.toString() === selectedFromUrl.toString(),
    );
    await selectChatUser(
      selectedFromUrl,
      selectedUser?.username || "Messages",
      false,
    );
  } else if (users.length > 0) {
    const firstUser = users[0];
    await selectChatUser(firstUser._id.toString(), firstUser.username, true);
  }

  if (refreshTimer) clearInterval(refreshTimer);
  refreshTimer = setInterval(loadMessages, 5000);
});
