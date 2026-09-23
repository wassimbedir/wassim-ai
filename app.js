/* =========================================================
   WASSIM AI — LITERARY ASSISTANT
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
  sidebar.classList.add("open");
  overlay.classList.add("show");

  document.body.style.overflow = "hidden";
}

function closeSidebar() {
  sidebar.classList.remove("open");
  overlay.classList.remove("show");

  document.body.style.overflow = "";
}

menuButton?.addEventListener("click", openSidebar);
overlay?.addEventListener("click", closeSidebar);


/* =========================================================
   NEW CHAT
   ========================================================= */

newChatButton?.addEventListener("click", () => {

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

          <button class="quick-action" data-prompt="اكتب لي قصيدة عن">
            <span>🪶</span>
            <strong>اكتب قصيدة</strong>
            <small>شعر وصور وإيقاع</small>
          </button>

          <button class="quick-action" data-prompt="ساعدني في بناء رواية عن">
            <span>📖</span>
            <strong>ابنِ رواية</strong>
            <small>فكرة وحبكة وشخصيات</small>
          </button>

          <button class="quick-action" data-prompt="ساعدني في كتابة نص أدبي عن">
            <span>✒️</span>
            <strong>اكتب نصًا</strong>
            <small>أدب وخاطرة وقصة</small>
          </button>

          <button class="quick-action" data-prompt="حلّل هذا النص أدبيًا:">
            <span>🔍</span>
            <strong>حلّل نصي</strong>
            <small>نقد وتحسين وتحرير</small>
          </button>

        </div>

      </div>

    </div>
  `;

  currentChat.textContent = "Wassim AI";

  document.querySelectorAll(".chat").forEach(chat => {
    chat.classList.remove("active");
  });

  messageInput.value = "";

  closeSidebar();

  attachQuickActions();

  messageInput.focus();
});


/* =========================================================
   QUICK ACTIONS
   ========================================================= */

function attachQuickActions() {

  document.querySelectorAll(".quick-action").forEach(button => {

    button.addEventListener("click", () => {

      const prompt = button.dataset.prompt;

      messageInput.value = prompt;

      messageInput.focus();

      autoResizeInput();
    });

  });

}

attachQuickActions();


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
   * مؤقتًا:
   * هذه مجرد شخصية تجريبية للواجهة.
   * لاحقًا سنربطها بالمحرك الأدبي الحقيقي.
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
   LITERARY DEMO BRAIN
   ========================================================= */

function generateLiteraryDemoResponse(text) {

  const lower = text.toLowerCase();

  if (
    text.includes("قصيدة") ||
    text.includes("شعر") ||
    text.includes("شاعر")
  ) {

    return `
      <strong>🪶 لنكتبها معًا.</strong>
      <br><br>
      أخبرني فقط عن الفكرة أو الشعور الذي تريد أن تدور حوله القصيدة،
      وسأساعدك في بناء النص والصور والقافية والأسلوب.
    `;
  }


  if (
    text.includes("رواية") ||
    text.includes("روايت") ||
    text.includes("قصة")
  ) {

    return `
      <strong>📖 فكرة الرواية هي البداية فقط.</strong>
      <br><br>
      أعطني الفكرة التي لديك، حتى لو كانت سطرًا واحدًا،
      وسنحوّلها إلى عالم وشخصيات وصراع وحبكة مترابطة.
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
      أرسل النص، وسأفصل بين نقاط القوة والمشكلات الفعلية،
      ثم أقترح تعديلات تحافظ على صوتك أنت.
    `;
  }


  if (
    text.includes("اكتب") ||
    text.includes("نص")
  ) {

    return `
      <strong>✒️ لنبدأ من الفكرة.</strong>
      <br><br>
      أعطني الموضوع، الشعور، المشهد أو حتى جملة واحدة،
      وسأساعدك على تحويلها إلى نص أدبي متماسك.
    `;
  }


  return `
    <strong>أفهمك.</strong>
    <br><br>
    أنا Wassim AI، مساعدك المتخصص في الأدب والكتابة.
    يمكننا العمل على الشعر، الروايات، القصص، الشخصيات،
    الأسلوب، النقد والتحرير.
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

  wrapper.innerHTML = `
    <div class="message-avatar">
      ${type === "user" ? "W" : "W"}
    </div>

    <div class="message-content">
      ${type === "user" ? escapeHTML(text) : text}
    </div>
  `;

  messages.appendChild(wrapper);
}


/* =========================================================
   SEND EVENTS
   ========================================================= */

sendButton?.addEventListener("click", sendMessage);

messageInput?.addEventListener("keydown", (event) => {

  if (
    event.key === "Enter" &&
    !event.shiftKey
  ) {

    event.preventDefault();

    sendMessage();
  }

});


/* =========================================================
   AUTO RESIZE
   ========================================================= */

function autoResizeInput() {

  messageInput.style.height = "auto";

  messageInput.style.height =
    Math.min(messageInput.scrollHeight, 120) + "px";
}

messageInput?.addEventListener(
  "input",
  autoResizeInput
);


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

chatList?.addEventListener("click", (event) => {

  const chat = event.target.closest(".chat");

  if (!chat) return;

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
   SECURITY
   ========================================================= */

function escapeHTML(value) {

  const div = document.createElement("div");

  div.textContent = value;

  return div.innerHTML;
}
