/* =========================================================
   WASSIM AI — AUTH + REAL LITERARY CHAT
   GitHub Pages → Render API → Groq
   ========================================================= */

const API_URL = "https://wassim-ai-api.onrender.com";

/* =========================================================
   ELEMENTS
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

/* AUTH */

const authOverlay = document.getElementById("authOverlay");
const authForm = document.getElementById("authForm");
const authUsername = document.getElementById("authUsername");
const authPassword = document.getElementById("authPassword");
const authSubmit = document.getElementById("authSubmit");
const authSwitch = document.getElementById("authSwitch");
const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");
const authError = document.getElementById("authError");


/* =========================================================
   STATE
   ========================================================= */

let conversationHistory = [];
let conversationId = null;

let isSending = false;
let isRegisterMode = false;

let token = localStorage.getItem("wassim_token");
let currentUser = JSON.parse(
  localStorage.getItem("wassim_user") || "null"
);


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
   AUTH
   ========================================================= */

function showAuth() {
  if (!authOverlay) return;

  authOverlay.style.display = "flex";

  if (authUsername) {
    authUsername.focus();
  }
}

function hideAuth() {
  if (!authOverlay) return;

  authOverlay.style.display = "none";
}

function setAuthMode(registerMode) {
  isRegisterMode = registerMode;

  if (authTitle) {
    authTitle.textContent = registerMode
      ? "إنشاء حساب"
      : "تسجيل الدخول";
  }

  if (authSubtitle) {
    authSubtitle.textContent = registerMode
      ? "أنشئ مساحتك الأدبية الخاصة."
      : "ادخل إلى مساحتك الأدبية.";
  }

  if (authSubmit) {
    authSubmit.textContent = registerMode
      ? "إنشاء الحساب"
      : "دخول";
  }

  if (authSwitch) {
    authSwitch.textContent = registerMode
      ? "لديك حساب؟ تسجيل الدخول"
      : "ليس لديك حساب؟ إنشاء حساب";
  }

  if (authError) {
    authError.textContent = "";
  }

  if (authPassword) {
    authPassword.value = "";
  }
}

authSwitch?.addEventListener("click", () => {
  setAuthMode(!isRegisterMode);
});


/* =========================================================
   LOGIN / REGISTER
   ========================================================= */

authForm?.addEventListener("submit", async event => {
  event.preventDefault();

  const username = authUsername?.value.trim();
  const password = authPassword?.value;

  if (!username || !password) {
    authError.textContent = "أدخل اسم المستخدم وكلمة المرور.";
    return;
  }

  authSubmit.disabled = true;
  authError.textContent = "";

  try {

    const endpoint = isRegisterMode
      ? "/register"
      : "/login";

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: "POST",

      headers: {
        "Content-Type": "application/json"
      },

      body: JSON.stringify({
        username,
        password
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "حدث خطأ أثناء العملية."
      );
    }

    /*
      بعض الـ APIs قد تعيد token مباشرة
      وبعضها قد تستخدم access_token
    */

    const receivedToken =
      data.token ||
      data.access_token;

    if (!receivedToken) {
      throw new Error(
        "تمت العملية لكن لم يصل رمز الدخول من الخادم."
      );
    }

    token = receivedToken;

    currentUser = {
      id: data.user?.id || null,
      username:
        data.user?.username ||
        username
    };

    localStorage.setItem(
      "wassim_token",
      token
    );

    localStorage.setItem(
      "wassim_user",
      JSON.stringify(currentUser)
    );

    hideAuth();

    authForm.reset();

    setAuthMode(false);

    await loadConversations();

    welcomeScreen();

  } catch (error) {

    console.error(error);

    authError.textContent =
      error.message ||
      "تعذر الاتصال بالخادم.";

  } finally {

    authSubmit.disabled = false;

  }
});


/* =========================================================
   API HELPER
   ========================================================= */

async function apiFetch(endpoint, options = {}) {

  const headers = {
    ...(options.headers || {})
  };

  if (token) {
    headers.Authorization =
      `Bearer ${token}`;
  }

  const response = await fetch(
    `${API_URL}${endpoint}`,
    {
      ...options,
      headers
    }
  );

  if (response.status === 401) {

    logout(false);

    throw new Error(
      "انتهت جلسة الدخول. سجّل الدخول من جديد."
    );
  }

  return response;
}


/* =========================================================
   LOAD CONVERSATIONS
   ========================================================= */

async function loadConversations() {

  if (!token) return;

  try {

    const response =
      await apiFetch("/conversations");

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "تعذر تحميل المحادثات."
      );
    }

    renderConversations(
      data.conversations || data || []
    );

  } catch (error) {

    console.error(
      "Conversation loading error:",
      error
    );

  }
}


/* =========================================================
   RENDER CONVERSATIONS
   ========================================================= */

function renderConversations(conversations) {

  if (!chatList) return;

  chatList.innerHTML = "";

  if (!conversations.length) {

    chatList.innerHTML = `
      <div class="empty-chats">
        لا توجد محادثات بعد.
      </div>
    `;

    return;
  }

  conversations.forEach(conversation => {

    const chat = document.createElement("div");

    chat.className = "chat";

    chat.dataset.id =
      conversation.id;

    const title =
      conversation.title ||
      "محادثة جديدة";

    chat.innerHTML = `
      <div class="chat-main">
        <div class="chat-title">
          ${escapeHTML(title)}
        </div>

        <div class="chat-preview">
          محادثة أدبية
        </div>
      </div>

      <button
        class="chat-menu"
        type="button"
        title="حذف"
      >
        ⋮
      </button>
    `;

    chatList.appendChild(chat);

  });
}


/* =========================================================
   OPEN CONVERSATION
   ========================================================= */

async function openConversation(id) {

  if (!id) return;

  try {

    const response =
      await apiFetch(
        `/conversations/${id}`
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "تعذر فتح المحادثة."
      );
    }

    conversationId =
      data.id ||
      data.conversation_id ||
      id;

    const loadedMessages =
      data.messages || [];

    conversationHistory = [];

    messages.innerHTML = "";

    loadedMessages.forEach(message => {

      if (
        message.role !== "user" &&
        message.role !== "assistant"
      ) {
        return;
      }

      conversationHistory.push({
        role: message.role,
        content: message.content
      });

      addMessage(
        message.role === "user"
          ? "user"
          : "ai",
        message.role === "assistant"
          ? formatAIResponse(message.content)
          : message.content
      );

    });

    const activeChat =
      document.querySelector(
        `.chat[data-id="${id}"]`
      );

    document
      .querySelectorAll(".chat")
      .forEach(chat =>
        chat.classList.remove("active")
      );

    activeChat?.classList.add("active");

    const title =
      activeChat
        ?.querySelector(".chat-title")
        ?.textContent
        ?.trim();

    currentChat.textContent =
      title || "Wassim AI";

    closeSidebar();

    scrollToBottom();

  } catch (error) {

    console.error(error);

    addMessage(
      "ai",
      "تعذر فتح هذه المحادثة."
    );

  }
}


/* =========================================================
   CHAT LIST CLICK
   ========================================================= */

chatList?.addEventListener(
  "click",
  async event => {

    const chat =
      event.target.closest(".chat");

    if (!chat) return;

    /*
      حذف المحادثة
    */

    if (
      event.target.closest(".chat-menu")
    ) {

      const id =
        chat.dataset.id;

      await deleteConversation(id);

      return;
    }

    await openConversation(
      chat.dataset.id
    );

  }
);


/* =========================================================
   DELETE CONVERSATION
   ========================================================= */

async function deleteConversation(id) {

  if (!id) return;

  const confirmed =
    confirm(
      "هل تريد حذف هذه المحادثة؟"
    );

  if (!confirmed) return;

  try {

    const response =
      await apiFetch(
        `/conversations/${id}`,
        {
          method: "DELETE"
        }
      );

    const data =
      await response.json();

    if (!response.ok) {
      throw new Error(
        data.error ||
        "تعذر حذف المحادثة."
      );
    }

    if (
      String(conversationId) ===
      String(id)
    ) {

      conversationId = null;
      conversationHistory = [];

      welcomeScreen();

      currentChat.textContent =
        "Wassim AI";
    }

    await loadConversations();

  } catch (error) {

    console.error(error);

    alert(
      error.message ||
      "تعذر حذف المحادثة."
    );

  }
}


/* =========================================================
   NEW CHAT
   ========================================================= */

newChatButton?.addEventListener(
  "click",
  () => {

    conversationHistory = [];
    conversationId = null;

    welcomeScreen();

    currentChat.textContent =
      "Wassim AI";

    document
      .querySelectorAll(".chat")
      .forEach(chat =>
        chat.classList.remove("active")
      );

    closeSidebar();

    messageInput?.focus();

  }
);


/* =========================================================
   WELCOME SCREEN
   ========================================================= */

function welcomeScreen() {

  if (!messages) return;

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

document.addEventListener(
  "click",
  event => {

    const button =
      event.target.closest(
        ".quick-action"
      );

    if (!button) return;

    const prompt =
      button.getAttribute(
        "data-prompt"
      );

    if (!prompt) return;

    messageInput.value =
      prompt;

    messageInput.focus();

    autoResizeInput();

  }
);


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

  const text =
    messageInput.value.trim();

  if (!text || isSending) return;

  if (!token) {

    showAuth();

    return;
  }

  isSending = true;

  sendButton.disabled = true;

  const welcome =
    document.getElementById("welcome");

  if (welcome) {
    welcome.remove();
  }

  addMessage(
    "user",
    text
  );

  messageInput.value = "";

  autoResizeInput();

  scrollToBottom();

  showThinking();

  try {

    const response =
      await apiFetch(
        "/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            message: text,

            messages:
              conversationHistory,

            conversation_id:
              conversationId
          })
        }
      );

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
      data.reply ||
      "ما وصلنيش رد.";

    conversationId =
      data.conversation_id ||
      conversationId;

    conversationHistory.push({
      role: "user",
      content: text
    });

    conversationHistory.push({
      role: "assistant",
      content: reply
    });

    addMessage(
      "ai",
      formatAIResponse(reply)
    );

    /*
      بعد إنشاء أول محادثة،
      نعيد تحميل القائمة حتى يظهر عنوانها.
    */

    await loadConversations();

    /*
      جعل المحادثة الحالية نشطة
    */

    if (conversationId) {

      const activeChat =
        document.querySelector(
          `.chat[data-id="${conversationId}"]`
        );

      document
        .querySelectorAll(".chat")
        .forEach(chat =>
          chat.classList.remove("active")
        );

      activeChat?.classList.add(
        "active"
      );

      const title =
        activeChat
          ?.querySelector(".chat-title")
          ?.textContent
          ?.trim();

      if (title) {
        currentChat.textContent =
          title;
      }

    }

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

  } finally {

    isSending = false;

    sendButton.disabled = false;

    messageInput.focus();

  }
}


/* =========================================================
   MESSAGE UI
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

  avatar.textContent = "W";

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


function formatAIResponse(text) {

  if (!text) return "";

  return escapeHTML(text)
    .replace(/\n/g, "<br>");
}


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
    document.getElementById(
      "thinking"
    )
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

  messages.appendChild(
    wrapper
  );

  scrollToBottom();
}


function removeThinking() {

  const thinking =
    document.getElementById(
      "thinking"
    );

  if (thinking) {
    thinking.remove();
  }
}


/* =========================================================
   INPUT
   ========================================================= */

sendButton?.addEventListener(
  "click",
  sendMessage
);

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

messageInput?.addEventListener(
  "input",
  autoResizeInput
);


function autoResizeInput() {

  if (!messageInput) return;

  messageInput.style.height =
    "auto";

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
            .querySelector(
              ".chat-title"
            )
            ?.textContent
            .toLowerCase() || "";

        const preview =
          chat
            .querySelector(
              ".chat-preview"
            )
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
   LOGOUT
   ========================================================= */

function logout(showLogin = true) {

  token = null;
  currentUser = null;

  localStorage.removeItem(
    "wassim_token"
  );

  localStorage.removeItem(
    "wassim_user"
  );

  conversationId = null;
  conversationHistory = [];

  if (chatList) {
    chatList.innerHTML = "";
  }

  welcomeScreen();

  currentChat.textContent =
    "Wassim AI";

  if (showLogin) {
    showAuth();
  }
}


/* =========================================================
   INITIALIZATION
   ========================================================= */

async function initializeApp() {

  autoResizeInput();

  /*
    إذا كان المستخدم مسجل الدخول
    نحاول تحميل محادثاته.
  */

  if (token) {

    try {

      const response =
        await apiFetch("/me");

      if (!response.ok) {
        throw new Error(
          "Invalid session"
        );
      }

      const data =
        await response.json();

      currentUser =
        data.user ||
        currentUser;

      localStorage.setItem(
        "wassim_user",
        JSON.stringify(
          currentUser
        )
      );

      hideAuth();

      await loadConversations();

    } catch (error) {

      console.log(
        "Session expired."
      );

      logout(false);

      showAuth();

    }

  } else {

    /*
      أول زيارة:
      افتح شاشة تسجيل الدخول.
    */

    showAuth();

  }
}


/* =========================================================
   START
   ========================================================= */

setAuthMode(false);

initializeApp();
