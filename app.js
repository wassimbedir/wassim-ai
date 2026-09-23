/* =========================================================
   WASSIM AI — LITERARY CHAT
   ========================================================= */

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


/* =========================================================
   SIDEBAR
   ========================================================= */

function openSidebar() {
  sidebar?.classList.add("open");
  overlay?.classList.add("show");
  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  sidebar?.classList.remove("open");
  overlay?.classList.remove("show");
  document.body.style.overflow = "";
}

menuButton?.addEventListener("click", openSidebar);
overlay?.addEventListener("click", closeSidebar);


/* =========================================================
   WELCOME SCREEN
   ========================================================= */

function welcomeScreen() {

  messages.innerHTML = `
    <div class="welcome" id="welcome">

      <div class="welcome-content">

        <div class="welcome-logo">
          W
        </div>

        <h1>
          أنا <span>وسيم</span>
        </h1>

        <p class="welcome-subtitle">
          رفيقك الأدبي في عالم الكتابة.
        </p>

        <p class="welcome-description">
          اكتب قصيدتك، ابنِ روايتك، طوّر شخصياتك،
          أو أحضر نصك وسأقرأه معك.
        </p>

        <div class="quick-actions">

          <button
            class="quick-action"
            data-prompt="أريد كتابة قصيدة عن "
          >
            <span>🪶</span>
            <strong>اكتب قصيدة</strong>
            <small>شعر وصور وإيقاع</small>
          </button>

          <button
            class="quick-action"
            data-prompt="أريد بناء رواية عن "
          >
            <span>📖</span>
            <strong>ابنِ رواية</strong>
            <small>فكرة وحبكة وشخصيات</small>
          </button>

          <button
            class="quick-action"
            data-prompt="أريد كتابة نص أدبي عن "
          >
            <span>✒️</span>
            <strong>اكتب نصًا</strong>
            <small>أدب وخاطرة وقصة</small>
          </button>

          <button
            class="quick-action"
            data-prompt="أريد تحليل هذا النص أدبيًا: "
          >
            <span>🔍</span>
            <strong>حلّل نصي</strong>
            <small>نقد وتحسين وتحرير</small>
          </button>

        </div>

      </div>

    </div>
  `;

  attachQuickActions();
}


/* =========================================================
   NEW CHAT
   ========================================================= */

newChatButton?.addEventListener("click", () => {

  welcomeScreen();

  currentChat.textContent = "Wassim AI";

  document.querySelectorAll(".chat").forEach(chat => {
    chat.classList.remove("active");
  });

  messageInput.value = "";

  autoResizeInput();

  closeSidebar();

  messageInput.focus();
});


/* =========================================================
   QUICK ACTIONS
   ========================================================= */

function attachQuickActions() {

  document.querySelectorAll(".quick-action").forEach(button => {

    button.addEventListener("click", () => {

      const prompt = button.getAttribute("data-prompt");

      if (!prompt) return;

      messageInput.value = prompt;

      messageInput.focus();

      autoResizeInput();
    });

  });
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

function sendMessage() {

  const text = messageInput.value.trim();

  if (!text) return;

  const welcome = document.getElementById("welcome");

  if (welcome) {
    welcome.remove();
  }

  addMessage("user", text);

  messageInput.value = "";

  autoResizeInput();

  scrollToBottom();

  /*
   * رد تجريبي مؤقت.
   * لاحقًا سنستبدله بعقل Wassim AI الحقيقي.
   */

  setTimeout(() => {

    addMessage(
      "ai",
      generateLiteraryDemoResponse(text)
    );

    scrollToBottom();

  }, 650);
}


/* =========================================================
   DEMO LITERARY RESPONSE
   ========================================================= */

function generateLiteraryDemoResponse(text) {

  if (
    text.includes("قصيدة") ||
    text.includes("شعر")
  ) {

    return `
      <strong>🪶 لنكتبها معًا.</strong>
      <br><br>
      أخبرني عن الفكرة أو الشعور الذي تريد أن تدور حوله
      القصيدة، وسأساعدك في بنائها.
    `;
  }


  if (
    text.includes("رواية") ||
    text.includes("روايت") ||
    text.includes("قصة")
  ) {

    return `
      <strong>📖 لنبدأ من الفكرة.</strong>
      <br><br>
      أعطني فكرتك، حتى لو كانت مجرد سطر واحد،
      وسنحوّلها إلى عالم وشخصيات وصراع وحبكة.
    `;
  }


  if (
    text.includes("حلل") ||
    text.includes("حلّل") ||
    text.includes("نقد")
  ) {

    return `
      <strong>🔍 سأقرأ النص ككاتب وناقد.</strong>
      <br><br>
      أرسل النص، وسأحدد نقاط القوة والمشكلات
      ثم أقترح تعديلات تحافظ على صوتك.
    `;
  }


  return `
    <strong>أهلًا بك في Wassim AI.</strong>
    <br><br>
    أنا مساعدك الأدبي المتخصص في الشعر والروايات
    والقصص والكتابة والنقد والتحرير.
    <br><br>
    اكتب فكرتك كما هي، حتى لو لم تكن مكتملة.
  `;
}


/* =========================================================
   ADD MESSAGE
   ========================================================= */

function addMessage(type, text) {

  const wrapper = document.createElement("div");

  wrapper.className = `message ${type}`;

  const avatar = document.createElement("div");

  avatar.className = "message-avatar";
  avatar.textContent = "W";

  const content = document.createElement("div");

  content.className = "message-content";

  if (type === "user") {
    content.textContent = text;
  } else {
    content.innerHTML = text;
  }

  wrapper.appendChild(avatar);
  wrapper.appendChild(content);

  messages.appendChild(wrapper);
}


/* =========================================================
   INPUT
   ========================================================= */

sendButton?.addEventListener("click", sendMessage);

messageInput?.addEventListener("keydown", event => {

  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {

    event.preventDefault();

    sendMessage();
  }

});

messageInput?.addEventListener(
  "input",
  autoResizeInput
);


function autoResizeInput() {

  messageInput.style.height = "auto";

  messageInput.style.height =
    Math.min(messageInput.scrollHeight, 120) + "px";
}


/* =========================================================
   SEARCH
   ========================================================= */

searchInput?.addEventListener("input", () => {

  const query =
    searchInput.value
      .trim()
      .toLowerCase();

  document.querySelectorAll(".chat").forEach(chat => {

    const title =
      chat.querySelector(".chat-title")
        ?.textContent
        .toLowerCase() || "";

    const preview =
      chat.querySelector(".chat-preview")
        ?.textContent
        .toLowerCase() || "";

    chat.style.display =
      !query ||
      title.includes(query) ||
      preview.includes(query)
        ? ""
        : "none";

  });

});


/* =========================================================
   CHAT SELECTION
   ========================================================= */

chatList?.addEventListener("click", event => {

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
    chat.querySelector(".chat-title")
      ?.textContent
      .trim();

  if (title) {
    currentChat.textContent = title;
  }

  closeSidebar();
});


/* =========================================================
   SCROLL
   ========================================================= */

function scrollToBottom() {

  messages.scrollTo({
    top: messages.scrollHeight,
    behavior: "smooth"
  });

}


/* =========================================================
   START
   ========================================================= */

attachQuickActions();
