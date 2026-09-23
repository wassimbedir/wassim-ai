const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuButton = document.getElementById("menuButton");

const newChatButton = document.getElementById("newChat");
const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const messages = document.getElementById("messages");
const currentChat = document.getElementById("currentChat");

const searchInput = document.getElementById("searchInput");
const chatList = document.getElementById("chatList");


/* =========================
   SIDEBAR
========================= */

function openSidebar() {
  sidebar.classList.add("open");
  overlay.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");
  document.body.style.overflow = "";
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
          مساعدك الذكي للكتابة، التفكير، المعرفة، والإبداع.
          <br>
          ابدأ محادثة جديدة، ودع وسيم يرافقك.
        </p>

      </div>
    </div>
  `;

  currentChat.textContent = "Wassim AI";

  document
    .querySelectorAll(".chat")
    .forEach(chat => chat.classList.remove("active"));

  messageInput.value = "";

  closeSidebar();

  setTimeout(() => {
    messageInput.focus();
  }, 200);
});


/* =========================
   SEND MESSAGE
========================= */

function sendMessage() {

  const text = messageInput.value.trim();

  if (!text) return;


  const welcome = document.querySelector(".welcome");

  if (welcome) {
    welcome.remove();
  }


  addMessage("user", text);

  messageInput.value = "";

  scrollToBottom();


  /* رد مؤقت إلى أن نربط الـAI */

  setTimeout(() => {

    addMessage(
      "ai",
      "أنا هنا. ✨<br><br>" +
      "هذه الواجهة أصبحت جاهزة، والخطوة القادمة هي ربطها بعقل Wassim AI الحقيقي."
    );

    scrollToBottom();

  }, 650);
}


/* =========================
   ADD MESSAGE
========================= */

function addMessage(type, text) {

  const message = document.createElement("div");

  message.className = "message";


  if (type === "user") {

    message.innerHTML = `
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

  } else {

    message.innerHTML = `
      <div class="message-avatar ai-avatar">
        W
      </div>

      <div class="message-content">

        <div class="message-name">
          Wassim AI
        </div>

        <div>
          ${text}
        </div>

      </div>
    `;
  }


  messages.appendChild(message);
}


/* =========================
   SEND BUTTON
========================= */

sendButton.addEventListener("click", sendMessage);


/* =========================
   ENTER
========================= */

messageInput.addEventListener("keydown", event => {

  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {

    event.preventDefault();

    sendMessage();
  }

});


/* =========================
   SEARCH
========================= */

searchInput.addEventListener("input", () => {

  const query =
    searchInput.value
      .trim()
      .toLowerCase();

  document
    .querySelectorAll(".chat")
    .forEach(chat => {

      const title =
        chat
          .querySelector(".chat-title")
          ?.textContent
          .toLowerCase() || "";

      const preview =
        chat
          .querySelector(".chat-preview")
          ?.textContent
          .toLowerCase() || "";

      const visible =
        title.includes(query) ||
        preview.includes(query);

      chat.style.display =
        visible ? "flex" : "none";

    });

});


/* =========================
   SELECT CHAT
========================= */

chatList.addEventListener("click", event => {

  const chat =
    event.target.closest(".chat");

  if (!chat) return;


  /* لا نفتح المحادثة عند الضغط على ⋮ */

  if (
    event.target.closest(".chat-menu")
  ) {
    return;
  }


  document
    .querySelectorAll(".chat")
    .forEach(item => {
      item.classList.remove("active");
    });


  chat.classList.add("active");


  const title =
    chat
      .querySelector(".chat-title")
      ?.textContent
      .trim();


  if (title) {
    currentChat.textContent = title;
  }


  closeSidebar();
});


/* =========================
   SCROLL
========================= */

function scrollToBottom() {

  const area =
    document.querySelector(".messages");

  requestAnimationFrame(() => {

    area.scrollTop =
      area.scrollHeight;

  });
}


/* =========================
   SECURITY
========================= */

function escapeHTML(text) {

  const element =
    document.createElement("div");

  element.textContent = text;

  return element.innerHTML;
       }
