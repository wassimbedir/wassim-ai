const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuButton = document.getElementById("menuButton");

const newChatButton = document.getElementById("newChat");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const messages = document.getElementById("messages");
const welcome = document.getElementById("welcome");

const chatList = document.getElementById("chatList");
const searchInput = document.getElementById("searchInput");
const currentChat = document.getElementById("currentChat");


/* =========================
   MOBILE SIDEBAR
========================= */

function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("show");
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
}

menuButton.addEventListener("click", openSidebar);

overlay.addEventListener("click", closeSidebar);


/* =========================
   NEW CHAT
========================= */

newChatButton.addEventListener("click", () => {

  messages.innerHTML = `
    <div class="welcome">
      <div class="welcome-content">

        <div class="welcome-logo">
          W
        </div>

        <h1>
          أنا <span>وسيم</span>
        </h1>

        <p>
          محادثة جديدة.
          <br>
          كيف يمكنني مساعدتك؟
        </p>

      </div>
    </div>
  `;

  currentChat.textContent = "محادثة جديدة";

  messageInput.value = "";

  closeSidebar();

  messageInput.focus();
});


/* =========================
   SEND MESSAGE
========================= */

function sendMessage() {

  const text = messageInput.value.trim();

  if (!text) return;


  /* إزالة شاشة الترحيب */

  const welcomeElement = document.querySelector(".welcome");

  if (welcomeElement) {
    welcomeElement.remove();
  }


  /* رسالة المستخدم */

  const userMessage = document.createElement("div");

  userMessage.className = "message";

  userMessage.innerHTML = `
    <div class="message-avatar user-avatar">
      W
    </div>

    <div class="message-content">

      <div class="message-name">
        أنت
      </div>

      <div>
        ${escapeHTML(text)}
      </div>

    </div>
  `;

  messages.appendChild(userMessage);


  /* رد تجريبي */

  setTimeout(() => {

    const aiMessage = document.createElement("div");

    aiMessage.className = "message";

    aiMessage.innerHTML = `
      <div class="message-avatar ai-avatar">
        W
      </div>

      <div class="message-content">

        <div class="message-name">
          Wassim AI
        </div>

        <div>
          وصلت رسالتك. 🧠
          <br><br>
          أنا حاليًا في مرحلة البناء، وسيتم ربط الذكاء الاصطناعي الحقيقي في المرحلة القادمة.
        </div>

      </div>
    `;

    messages.appendChild(aiMessage);

    scrollToBottom();

  }, 500);


  messageInput.value = "";

  scrollToBottom();
}


/* =========================
   SEND BUTTON
========================= */

sendButton.addEventListener("click", sendMessage);


/* =========================
   ENTER TO SEND
========================= */

messageInput.addEventListener("keydown", (event) => {

  if (event.key === "Enter" && !event.shiftKey) {

    event.preventDefault();

    sendMessage();

  }

});


/* =========================
   SEARCH CHATS
========================= */

searchInput.addEventListener("input", () => {

  const query = searchInput.value
    .toLowerCase()
    .trim();

  const chats = document.querySelectorAll(".chat");

  chats.forEach(chat => {

    const title =
      chat.querySelector(".chat-title")?.textContent
      .toLowerCase() || "";

    const preview =
      chat.querySelector(".chat-preview")?.textContent
      .toLowerCase() || "";

    const matches =
      title.includes(query) ||
      preview.includes(query);

    chat.style.display =
      matches ? "flex" : "none";

  });

});


/* =========================
   CHAT SELECTION
========================= */

document.addEventListener("click", (event) => {

  const chat = event.target.closest(".chat");

  if (!chat) return;

  if (event.target.closest(".chat-menu")) {
    return;
  }


  document
    .querySelectorAll(".chat")
    .forEach(item => {
      item.classList.remove("active");
    });

  chat.classList.add("active");


  const title =
    chat.querySelector(".chat-title")?.textContent.trim();

  if (title) {
    currentChat.textContent = title;
  }

  closeSidebar();

});


/* =========================
   HELPERS
========================= */

function scrollToBottom() {

  const messageArea =
    document.querySelector(".messages");

  messageArea.scrollTop =
    messageArea.scrollHeight;

}


function escapeHTML(text) {

  const div = document.createElement("div");

  div.textContent = text;

  return div.innerHTML;

}
