/* =========================================================
   WASSIM AI — REAL LITERARY CHAT
   GitHub Pages → Render API → Groq
   ========================================================= */

const API_URL = "https://wassim-ai-api.onrender.com";


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
   CHAT MEMORY
   ========================================================= */

let conversationHistory = [];
let conversationId = null;
let isSending = false;


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
   WELCOME
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
          اكتب فكرتك كما هي، حتى لو كانت مجرد سطر.
          نكمّلها معًا.
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

  messageInput.value = "";

  autoResizeInput();
}


/* =========================================================
   QUICK ACTIONS
   ========================================================= */

document.addEventListener("click", event => {

  const button =
    event.target.closest(".quick-action");

  if (!button) return;

  const prompt =
    button.getAttribute("data-prompt");

  if (!prompt) return;

  messageInput.value = prompt;

  messageInput.focus();

  autoResizeInput();

});


/* =========================================================
   NEW CHAT
   ========================================================= */

newChatButton?.addEventListener("click", () => {

  conversationHistory = [];

  conversationId = null;

  welcomeScreen();

  currentChat.textContent = "Wassim AI";

  document
    .querySelectorAll(".chat")
    .forEach(chat => {

      chat.classList.remove("active");

    });

  closeSidebar();

  messageInput.focus();

});


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

  const text =
    messageInput.value.trim();

  if (!text || isSending) return;


  isSending = true;

  sendButton.disabled = true;


  const welcome =
    document.getElementById("welcome");

  if (welcome) {
    welcome.remove();
  }


  addMessage("user", text);

  messageInput.value = "";

  autoResizeInput();

  scrollToBottom();

  showThinking();


  try {

    const response =
      await fetch(`${API_URL}/chat`, {

        method: "POST",

        headers: {
          "Content-Type": "application/json"
        },

        body: JSON.stringify({

          message: text,

          messages: conversationHistory,

          conversation_id: conversationId

        })

      });


    const data =
      await response.json();


    removeThinking();


    if (!response.ok) {

      throw new Error(
        data.error ||
        "حدث خطأ أثناء الاتصال بوسيم."
      );

    }


    const reply =
      data.reply || "ما وصلنيش رد.";


    conversationId =
      data.conversation_id || conversationId;


    conversationHistory.push({

      role: "user",

      content: text

    });


    conversationHistory.push({

      role: "assistant",

      content: reply

    });


    addMessage("ai", formatAIResponse(reply));

    scrollToBottom();


  } catch (error) {

    removeThinking();

    console.error(error);


    addMessage(
      "ai",
      `
        صار مشكل صغير في الاتصال.
        <br><br>
        جرّب تبعثها مرة أخرى.
      `
    );

  }


  isSending = false;

  sendButton.disabled = false;

  messageInput.focus();

}


/* =========================================================
   FORMAT AI RESPONSE
   ========================================================= */

function formatAIResponse(text) {

  if (!text) return "";

  return escapeHTML(text)
    .replace(/\n/g, "<br>");

}


/* =========================================================
   HTML ESCAPE
   ========================================================= */

function escapeHTML(text) {

  const div =
    document.createElement("div");

  div.textContent = text;

  return div.innerHTML;

}


/* =========================================================
   THINKING
   ========================================================= */

function showThinking() {

  if (
    document.getElementById("thinking")
  ) {
    return;
  }


  const wrapper =
    document.createElement("div");

  wrapper.className =
    "message ai";

  wrapper.id =
    "thinking";


  wrapper.innerHTML = `

    <div class="message-avatar">
      W
    </div>

    <div class="message-content">
      <span style="color:#777;">
        وسيم يفكر…
      </span>
    </div>

  `;


  messages.appendChild(wrapper);

  scrollToBottom();

}


function removeThinking() {

  const thinking =
    document.getElementById("thinking");

  if (thinking) {
    thinking.remove();
  }

}


/* =========================================================
   ADD MESSAGE
   ========================================================= */

function addMessage(type, text) {

  const wrapper =
    document.createElement("div");

  wrapper.className =
    `message ${type}`;


  const avatar =
    document.createElement("div");

  avatar.className =
    "message-avatar";

  avatar.textContent =
    "W";


  const content =
    document.createElement("div");

  content.className =
    "message-content";


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
   SEND BUTTON
   ========================================================= */

sendButton?.addEventListener(
  "click",
  sendMessage
);


/* =========================================================
   ENTER
   ========================================================= */

messageInput?.addEventListener(
  "keydown",
  event => {

    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {

      event.preventDefault();

      sendMessage();

    }

  }
);


/* =========================================================
   AUTO RESIZE
   ========================================================= */

messageInput?.addEventListener(
  "input",
  autoResizeInput
);


function autoResizeInput() {

  if (!messageInput) return;

  messageInput.style.height = "auto";

  messageInput.style.height =
    Math.min(
      messageInput.scrollHeight,
      120
    ) + "px";

}


/* =========================================================
   SEARCH
   ========================================================= */

searchInput?.addEventListener(
  "input",
  () => {

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


        chat.style.display =
          !query ||
          title.includes(query) ||
          preview.includes(query)
            ? ""
            : "none";

      });

  }
);


/* =========================================================
   CHAT LIST
   ========================================================= */

chatList?.addEventListener(
  "click",
  event => {

    const chat =
      event.target.closest(".chat");

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
      chat
        .querySelector(".chat-title")
        ?.textContent
        .trim();


    if (title) {

      currentChat.textContent =
        title;

    }


    closeSidebar();

  }
);


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
   INITIALIZE
   ========================================================= */

autoResizeInput();
