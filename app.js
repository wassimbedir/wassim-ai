/* =========================================================
   WASSIM AI — APP
   ========================================================= */

const API_URL = "https://wassim-ai-api.onrender.com";


/* =========================================================
   DOM
   ========================================================= */

const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebarOverlay");

const menuButton = document.getElementById("menuButton");

const newChatButton = document.getElementById("newChat");

const chatList = document.getElementById("chatList");
const searchInput = document.getElementById("searchInput");

const messages = document.getElementById("messages");
const welcomeScreen = document.getElementById("welcomeScreen");

const messageInput = document.getElementById("messageInput");
const sendButton = document.getElementById("sendButton");

const currentChatTitle = document.getElementById("currentChatTitle");

const accountName = document.getElementById("accountName");
const accountMenu = document.getElementById("accountMenu");
const accountDropdown = document.getElementById("accountDropdown");
const logoutButton = document.getElementById("logoutButton");


/* =========================================================
   AUTH DOM
   ========================================================= */

const authOverlay = document.getElementById("authOverlay");

const authForm = document.getElementById("authForm");

const authUsername = document.getElementById("authUsername");
const authPassword = document.getElementById("authPassword");

const authTitle = document.getElementById("authTitle");
const authSubtitle = document.getElementById("authSubtitle");

const authSubmit = document.getElementById("authSubmit");

const authError = document.getElementById("authError");

const authSwitch = document.getElementById("authSwitch");


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
   AUTH UI
   ========================================================= */

function showAuth() {

  authOverlay.style.display = "flex";

}


function hideAuth() {

  authOverlay.style.display = "none";

}


function setAuthMode(registerMode) {

  isRegisterMode = registerMode;

  authError.textContent = "";

  authForm.reset();

  if (isRegisterMode) {

    authTitle.textContent = "إنشاء حساب";

    authSubtitle.textContent =
      "أنشئ مساحتك الأدبية واحتفظ بمحادثاتك.";

    authSubmit.textContent =
      "إنشاء الحساب";

    authSwitch.textContent =
      "لديك حساب بالفعل؟ تسجيل الدخول";

  } else {

    authTitle.textContent =
      "تسجيل الدخول";

    authSubtitle.textContent =
      "ادخل إلى مساحتك الأدبية.";

    authSubmit.textContent =
      "دخول";

    authSwitch.textContent =
      "ليس لديك حساب؟ إنشاء حساب";
  }
}


authSwitch.addEventListener(
  "click",
  () => {

    setAuthMode(!isRegisterMode);

  }
);


/* =========================================================
   API FETCH
   ========================================================= */

async function apiFetch(
  endpoint,
  options = {}
) {

  const headers = {
    "Content-Type": "application/json",
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


  let data = null;

  try {

    data = await response.json();

  } catch {

    data = {};

  }


  if (!response.ok) {

    if (
      response.status === 401 ||
      response.status === 403
    ) {

      logout(false);

    }


    throw new Error(
      data.error ||
      data.message ||
      "حدث خطأ في الاتصال."
    );
  }


  return data;
}


/* =========================================================
   LOGIN / REGISTER
   ========================================================= */

authForm.addEventListener(
  "submit",
  async (event) => {

    event.preventDefault();

    const username =
      authUsername.value.trim();

    const password =
      authPassword.value;


    if (!username || !password) {

      authError.textContent =
        "أدخل اسم المستخدم وكلمة المرور.";

      return;
    }


    authSubmit.disabled = true;

    authError.textContent = "";


    try {

      const endpoint =
        isRegisterMode
          ? "/register"
          : "/login";


      const data =
        await apiFetch(
          endpoint,
          {
            method: "POST",

            body: JSON.stringify({
              username,
              password
            })
          }
        );


      token = data.token;

      currentUser =
        data.user || {
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


      updateAccount();


      hideAuth();

      await loadConversations();

      newChat();


    } catch (error) {

      authError.textContent =
        error.message ||
        "تعذر إتمام العملية.";

    } finally {

      authSubmit.disabled = false;

    }

  }
);


/* =========================================================
   ACCOUNT
   ========================================================= */

function updateAccount() {

  if (!currentUser) return;


  accountName.textContent =
    currentUser.username ||
    "Wassim";
}


accountMenu.addEventListener(
  "click",
  () => {

    accountDropdown.classList.toggle(
      "open"
    );

  }
);


document.addEventListener(
  "click",
  (event) => {

    if (
      !accountMenu.contains(event.target) &&
      !accountDropdown.contains(event.target)
    ) {

      accountDropdown.classList.remove(
        "open"
      );

    }

  }
);


/* =========================================================
   LOGOUT
   ========================================================= */

function logout(showLogin = true) {

  token = null;

  currentUser = null;

  conversationId = null;

  conversationHistory = [];


  localStorage.removeItem(
    "wassim_token"
  );

  localStorage.removeItem(
    "wassim_user"
  );


  accountName.textContent =
    "Wassim";


  chatList.innerHTML = "";

  showWelcome();

  if (showLogin) {

    setAuthMode(false);

    showAuth();

  }
}


logoutButton.addEventListener(
  "click",
  () => {

    logout(true);

  }
);


/* =========================================================
   SIDEBAR
   ========================================================= */

function openSidebar() {

  sidebar.classList.add("open");

  sidebarOverlay.classList.add("open");

}


function closeSidebar() {

  sidebar.classList.remove("open");

  sidebarOverlay.classList.remove("open");

}


menuButton.addEventListener(
  "click",
  openSidebar
);


sidebarOverlay.addEventListener(
  "click",
  closeSidebar
);


/* =========================================================
   CONVERSATIONS
   ========================================================= */

async function loadConversations() {

  if (!token) return;


  try {

    const data =
      await apiFetch(
        "/conversations"
      );


    renderConversations(
      data.conversations || data || []
    );


  } catch (error) {

    console.error(
      "Failed to load conversations:",
      error
    );

  }
}


function renderConversations(
  conversations
) {

  chatList.innerHTML = "";


  if (!conversations.length) {

    const empty =
      document.createElement("div");

    empty.style.padding = "20px 10px";

    empty.style.color = "#555";

    empty.style.fontSize = "12px";

    empty.style.textAlign = "center";

    empty.textContent =
      "لا توجد محادثات بعد.";

    chatList.appendChild(empty);

    return;
  }


  conversations.forEach(
    (conversation) => {

      const item =
        document.createElement("div");

      item.className =
        "chat-item";


      if (
        Number(conversation.id) ===
        Number(conversationId)
      ) {

        item.classList.add("active");

      }


      const title =
        document.createElement("div");

      title.className =
        "chat-item-title";

      title.textContent =
        conversation.title ||
        "محادثة جديدة";


      const deleteButton =
        document.createElement("button");

      deleteButton.className =
        "chat-delete";

      deleteButton.type =
        "button";

      deleteButton.textContent =
        "×";

      deleteButton.title =
        "حذف المحادثة";


      item.appendChild(title);

      item.appendChild(
        deleteButton
      );


      item.addEventListener(
        "click",
        () => {

          openConversation(
            conversation.id
          );

        }
      );


      deleteButton.addEventListener(
        "click",
        async (event) => {

          event.stopPropagation();

          await deleteConversation(
            conversation.id
          );

        }
      );


      chatList.appendChild(item);

    }
  );
}


/* =========================================================
   OPEN CONVERSATION
   ========================================================= */

async function openConversation(id) {

  try {

    const data =
      await apiFetch(
        `/conversations/${id}`
      );


    conversationId =
      data.conversation_id ||
      data.id ||
      id;


    const conversation =
      data.conversation ||
      data;


    const loadedMessages =
      conversation.messages ||
      data.messages ||
      [];


    conversationHistory =
      loadedMessages.map(
        (message) => ({
          role: message.role,
          content: message.content
        })
      );


    messages.innerHTML = "";


    loadedMessages.forEach(
      (message) => {

        addMessage(
          message.role === "user"
            ? "user"
            : "ai",
          message.content
        );

      }
    );


    const title =
      conversation.title ||
      "محادثة";


    currentChatTitle.textContent =
      title;


    await loadConversations();


    closeSidebar();


    scrollToBottom();


  } catch (error) {

    console.error(
      "Failed to open conversation:",
      error
    );

  }
}


/* =========================================================
   DELETE CONVERSATION
   ========================================================= */

async function deleteConversation(
  id
) {

  try {

    await apiFetch(
      `/conversations/${id}`,
      {
        method: "DELETE"
      }
    );


    if (
      Number(conversationId) ===
      Number(id)
    ) {

      newChat();

    }


    await loadConversations();


  } catch (error) {

    console.error(
      "Failed to delete conversation:",
      error
    );

  }
}


/* =========================================================
   NEW CHAT
   ========================================================= */

function newChat() {

  conversationId = null;

  conversationHistory = [];


  currentChatTitle.textContent =
    "مساحة الكتابة";


  showWelcome();


  document
    .querySelectorAll(".chat-item")
    .forEach(
      (item) => {
        item.classList.remove(
          "active"
        );
      }
    );


  closeSidebar();


  setTimeout(
    () => {
      messageInput.focus();
    },
    50
  );
}


newChatButton.addEventListener(
  "click",
  newChat
);


/* =========================================================
   WELCOME
   ========================================================= */

function showWelcome() {

  messages.innerHTML = "";

  messages.appendChild(
    createWelcome()
  );

}


function createWelcome() {

  const welcome =
    document.createElement("div");

  welcome.className =
    "welcome";


  welcome.innerHTML = `

    <div class="welcome-content">

      <div class="welcome-logo">

        <img
          src="IMG_20260923_195409_648.jpg"
          alt="Wassim AI"
        >

      </div>


      <h1>
        مرحبًا بك في
        <span>Wassim AI</span>
      </h1>


      <p class="welcome-subtitle">
        مساحة أدبية تفكر معك، لا بدلًا منك.
      </p>


      <p class="welcome-description">
        اكتب، حلّل، طوّر روايتك، ابنِ شخصياتك،
        أو دعنا نعمل على نصك خطوة بخطوة.
      </p>


      <div class="quick-actions">

        <button
          class="quick-action"
          data-prompt="أريد أن أكتب قصيدة. ساعدني في بناء الفكرة والصور الشعرية والقافية دون أن تكتب بدلًا مني."
          type="button"
        >
          <span class="quick-icon">🪶</span>
          <span>اكتب قصيدة</span>
        </button>


        <button
          class="quick-action"
          data-prompt="أريد بناء رواية. ساعدني في تطوير الفكرة والشخصيات والأحداث والزمن والترابط."
          type="button"
        >
          <span class="quick-icon">📖</span>
          <span>ابنِ رواية</span>
        </button>


        <button
          class="quick-action"
          data-prompt="أريد كتابة نص أدبي. ساعدني في تطويره مع الحفاظ على أسلوبي وصوتي ككاتب."
          type="button"
        >
          <span class="quick-icon">✒️</span>
          <span>اكتب نصًا أدبيًا</span>
        </button>


        <button
          class="quick-action"
          data-prompt="سأرسل لك نصًا أدبيًا. أريد نقدًا واضحًا ومباشرًا يحدد نقاط القوة والمشكلات والحلول المقترحة."
          type="button"
        >
          <span class="quick-icon">🔍</span>
          <span>حلّل نصي</span>
        </button>

      </div>

    </div>

  `;


  attachQuickActions(
    welcome
  );


  return welcome;
}


/* =========================================================
   QUICK ACTIONS
   ========================================================= */

function attachQuickActions(
  container
) {

  container
    .querySelectorAll(
      ".quick-action"
    )
    .forEach(
      (button) => {

        button.addEventListener(
          "click",
          () => {

            messageInput.value =
              button.dataset.prompt;

            autoResize();

            messageInput.focus();

          }
        );

      }
    );
}


/* =========================================================
   ADD MESSAGE
   ========================================================= */

function addMessage(
  type,
  text
) {

  const wrapper =
    document.createElement("div");

  wrapper.className =
    `message ${type}`;


  const avatar =
    document.createElement("div");

  avatar.className =
    "message-avatar";


  avatar.innerHTML = `

    <img
      src="IMG_20260923_195409_648.jpg"
      alt="Wassim AI"
    >

  `;


  const content =
    document.createElement("div");

  content.className =
    "message-content";


  if (type === "user") {

    content.textContent =
      text;

  } else {

    content.innerHTML =
      formatAIResponse(text);

  }


  wrapper.appendChild(
    avatar
  );

  wrapper.appendChild(
    content
  );


  messages.appendChild(
    wrapper
  );


  scrollToBottom();
}


/* =========================================================
   AI RESPONSE FORMAT
   ========================================================= */

function formatAIResponse(
  text
) {

  if (!text) return "";


  let html =
    escapeHTML(text);


  html =
    html.replace(
      /\*\*(.*?)\*\*/g,
      "<strong>$1</strong>"
    );


  html =
    html.replace(
      /`([^`]+)`/g,
      "<code>$1</code>"
    );


  html =
    html.replace(
      /\n\n+/g,
      "</p><p>"
    );


  html =
    html.replace(
      /\n/g,
      "<br>"
    );


  return `<p>${html}</p>`;
}


/* =========================================================
   ESCAPE HTML
   ========================================================= */

function escapeHTML(
  text
) {

  const div =
    document.createElement(
      "div"
    );

  div.textContent =
    text;

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

      <img
        src="IMG_20260923_195409_648.jpg"
        alt="Wassim AI"
      >

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


function hideThinking() {

  const thinking =
    document.getElementById(
      "thinking"
    );


  if (thinking) {

    thinking.remove();

  }
}


/* =========================================================
   SEND MESSAGE
   ========================================================= */

async function sendMessage() {

  if (isSending) return;


  const text =
    messageInput.value.trim();


  if (!text) return;


  isSending = true;

  sendButton.disabled = true;


  if (
    welcomeScreen &&
    welcomeScreen.parentNode
  ) {

    welcomeScreen.remove();

  }


  addMessage(
    "user",
    text
  );


  conversationHistory.push({
    role: "user",
    content: text
  });


  messageInput.value = "";

  autoResize();


  showThinking();


  try {

    const data =
      await apiFetch(
        "/chat",
        {
          method: "POST",

          body: JSON.stringify({
            message: text,

            messages:
              conversationHistory,

            conversation_id:
              conversationId
          })
        }
      );


    hideThinking();


    const reply =
      data.reply ||
      data.response ||
      data.message ||
      "لم يصل رد من وسيم.";


    conversationId =
      data.conversation_id ||
      conversationId;


    conversationHistory.push({
      role: "assistant",
      content: reply
    });


    addMessage(
      "ai",
      reply
    );


    currentChatTitle.textContent =
      getConversationTitle(
        text
      );


    await loadConversations();


  } catch (error) {

    hideThinking();


    console.error(
      "Chat error:",
      error
    );


    const errorMessage =
      "حدث خطأ أثناء الاتصال بوسيم. حاول مرة أخرى.";


    addMessage(
      "ai",
      errorMessage
    );


    /*
      لا نترك رسالة المستخدم في
      history إذا فشل الطلب.
    */

    conversationHistory.pop();

  } finally {

    isSending = false;

    sendButton.disabled = false;

    messageInput.focus();

  }
}


/* =========================================================
   SEND BUTTON
   ========================================================= */

sendButton.addEventListener(
  "click",
  sendMessage
);


/* =========================================================
   ENTER TO SEND
   ========================================================= */

messageInput.addEventListener(
  "keydown",
  (event) => {

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
   AUTO RESIZE TEXTAREA
   ========================================================= */

function autoResize() {

  messageInput.style.height =
    "auto";


  messageInput.style.height =
    Math.min(
      messageInput.scrollHeight,
      180
    ) + "px";
}


messageInput.addEventListener(
  "input",
  autoResize
);

/* =========================================================
   SCROLL
   ========================================================= */

function scrollToBottom() {

  requestAnimationFrame(
    () => {

      messages.scrollTop =
        messages.scrollHeight;

    }
  );
}


/* =========================================================
   CONVERSATION TITLE
   ========================================================= */

function getConversationTitle(
  text
) {

  let title =
    text
      .replace(/\s+/g, " ")
      .trim();


  if (title.length > 80) {

    title =
      title.substring(
        0,
        80
      ) + "...";

  }


  return title ||
    "محادثة جديدة";
}


/* =========================================================
   SEARCH
   ========================================================= */

searchInput.addEventListener(
  "input",
  async () => {

    const query =
      searchInput.value
        .trim()
        .toLowerCase();


    const items =
      chatList.querySelectorAll(
        ".chat-item"
      );


    items.forEach(
      (item) => {

        const title =
          item
            .querySelector(
              ".chat-item-title"
            )
            ?.textContent
            .toLowerCase() || "";


        item.style.display =
          !query ||
          title.includes(query)
            ? ""
            : "none";

      }
    );

  }
);


/* =========================================================
   CHECK AUTH
   ========================================================= */

async function checkAuth() {

  if (!token) {

    setAuthMode(false);

    showAuth();

    return;

  }


  try {

    const data =
      await apiFetch(
        "/me"
      );


    currentUser =
      data.user ||
      data;


    localStorage.setItem(
      "wassim_user",
      JSON.stringify(
        currentUser
      )
    );


    updateAccount();

    hideAuth();

    await loadConversations();


  } catch (error) {

    console.error(
      "Auth check failed:",
      error
    );


    logout(true);

  }
}


/* =========================================================
   INITIALIZE
   ========================================================= */

async function init() {

  updateAccount();

  autoResize();

  await checkAuth();

}


/* =========================================================
   START
   ========================================================= */

init();
