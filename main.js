// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-app.js";
// import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.8.1/firebase-analytics.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile, // <-- IMPORTANTE: Nova importação
  setPersistence,
  browserLocalPersistence,
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-auth.js";
import {
  getFirestore,
  collection,
  doc,
  addDoc,
  getDocs,
  deleteDoc,
  updateDoc,
  getDoc, // <-- IMPORTANTE: Nova importação
  runTransaction, // <-- IMPORTANTE: Nova importação
  onSnapshot,
  serverTimestamp,
  query, // Importar query
  orderBy, // Importar orderBy
} from "https://www.gstatic.com/firebasejs/11.8.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAcTp4ppx3ygdzDHhdkfu4rA8uaUHf_GqI", // Certifique-se que esta é sua chave correta
  authDomain: "curso-violao-anima.firebaseapp.com",
  projectId: "curso-violao-anima",
  storageBucket: "curso-violao-anima.appspot.com",
  messagingSenderId: "1028398726837",
  appId: "1:1028398726837:web:5eefada63c9b8360cb08fc",
  measurementId: "G-1TFHLBMD0B",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

setPersistence(auth, browserLocalPersistence).catch((error) =>
  console.error("Error setting Firebase persistence: ", error)
);

const appId =
  typeof __app_id !== "undefined" ? __app_id : "anima-guitar-course";
const modulesCollectionPath = `/artifacts/${appId}/public/data/modules`;

const ADMIN_EMAIL = "alissondfla@gmail.com";

let currentUserId = null;
let isAdmin = false;
let currentOpenModuleId = null;
let currentOpenLessonId = null; // Variável para rastrear a aula atual para comentários

document.addEventListener("DOMContentLoaded", () => {
  // --- Referências aos Elementos do DOM ---
  const loginPageWrapper = document.getElementById("loginPageWrapper");
  const courseContentWrapper = document.getElementById("courseContentWrapper");
  const userLoginForm = document.getElementById("userLoginForm");
  const userSignupForm = document.getElementById("userSignupForm");
  const userLoginError = document.getElementById("userLoginError");
  const userSignupError = document.getElementById("userSignupError");
  const toggleToSignupBtn = document.getElementById("toggleToSignupBtn");
  const toggleToLoginBtn = document.getElementById("toggleToLoginBtn");
  const pageAdminLoginBtn = document.getElementById("pageAdminLoginBtn");
  const adminLoginModal = document.getElementById("adminLoginModal");
  const adminLoginForm = document.getElementById("adminLoginForm");
  const closeLoginModalBtn = document.getElementById("closeLoginModalBtn");
  const adminLoginError = document.getElementById("adminLoginError");
  const loggedInUserEmailDisplay = document.getElementById("loggedInUserEmail");
  const userLogoutBtn = document.getElementById("userLogoutBtn");
  const adminLogoutBtn = document.getElementById("adminLogoutBtn");
  const modulesList = document.getElementById("modulesList");
  const lessonsContainer = document.getElementById("lessonsContainer");
  const currentModuleTitle = document.getElementById("currentModuleTitle");
  const currentLessonTitle = document.getElementById("currentLessonTitle");
  const videoPlayerContainer = document.getElementById("videoPlayerContainer");
  const attachmentLink = document.getElementById("attachmentLink");

  const adminPanel = document.getElementById("adminPanel");
  const adminPanelContent = adminPanel
    ? adminPanel.querySelector(".admin-panel-content")
    : null;
  const toggleAdminPanelBtn = document.getElementById("toggleAdminPanelBtn");
  const minimizeIcon = document.getElementById("minimizeIcon");
  const maximizeIcon = document.getElementById("maximizeIcon");

  const addModuleForm = document.getElementById("addModuleForm");
  const addLessonForm = document.getElementById("addLessonForm");
  const modulesSelectForLesson = document.getElementById(
    "modulesSelectForLesson"
  );
  const adminUserIdDisplay = document.getElementById("adminUserId");
  const sidebar = document.getElementById("sidebar");
  const openSidebarButton = document.getElementById("openSidebarButton");
  const closeSidebarButton = document.getElementById("closeSidebarButton");
  const mainContent = document.querySelector(".main-content");
  const sidebarBackdrop = document.getElementById("sidebar-backdrop");
  const editModuleModal = document.getElementById("editModuleModal");
  const closeEditModuleModalBtn = document.getElementById(
    "closeEditModuleModalBtn"
  );
  const editModuleForm = document.getElementById("editModuleForm");
  const editModuleError = document.getElementById("editModuleError");

  const editLessonModal = document.getElementById("editLessonModal");
  const closeEditLessonModalBtn = document.getElementById(
    "closeEditLessonModalBtn"
  );
  const editLessonForm = document.getElementById("editLessonForm");
  const editLessonError = document.getElementById("editLessonError");
  const addCommentForm = document.getElementById("addCommentForm"); // Formulário de comentário

  console.log("closeLoginModalBtn element:", closeLoginModalBtn); // DEBUG
  if (closeLoginModalBtn) {
    console.log("Attaching click listener to closeLoginModalBtn"); // DEBUG
    closeLoginModalBtn.addEventListener("click", () => {
      console.log("Close admin modal button CLICKED!"); // DEBUG
      console.log("Admin modal to hide:", adminLoginModal); // DEBUG
      if (adminLoginModal) {
        adminLoginModal.style.display = "none";
      }
    });
  } else {
    console.error("Elemento closeLoginModalBtn NÃO encontrado!"); // DEBUG
  }

  if (toggleAdminPanelBtn && adminPanel && minimizeIcon && maximizeIcon) {
    toggleAdminPanelBtn.addEventListener("click", () => {
      adminPanel.classList.toggle("minimized");
      const isMinimized = adminPanel.classList.contains("minimized");
      minimizeIcon.classList.toggle("hidden", isMinimized);
      maximizeIcon.classList.toggle("hidden", !isMinimized);
    });
  }

  if (toggleToSignupBtn) {
    toggleToSignupBtn.addEventListener("click", () => {
      if (userLoginForm) userLoginForm.classList.add("hidden");
      if (userSignupForm) userSignupForm.classList.remove("hidden");
      if (toggleToSignupBtn) toggleToSignupBtn.classList.add("hidden");
      if (toggleToLoginBtn) toggleToLoginBtn.classList.remove("hidden");
      if (userLoginError) userLoginError.textContent = "";
      if (userSignupError) userSignupError.textContent = "";
    });
  }
  if (toggleToLoginBtn) {
    toggleToLoginBtn.addEventListener("click", () => {
      if (userLoginForm) userLoginForm.classList.remove("hidden");
      if (userSignupForm) userSignupForm.classList.add("hidden");
      if (toggleToSignupBtn) toggleToSignupBtn.classList.remove("hidden");
      if (toggleToLoginBtn) toggleToLoginBtn.classList.add("hidden");
      if (userLoginError) userLoginError.textContent = "";
      if (userSignupError) userSignupError.textContent = "";
    });
  }

  onAuthStateChanged(auth, async (user) => {
    if (user) {
      currentUserId = user.uid;
      console.log("User signed in:", currentUserId, "Email:", user.email);
      if (loginPageWrapper) loginPageWrapper.style.display = "none";
      if (courseContentWrapper) courseContentWrapper.style.display = "flex";
      if (loggedInUserEmailDisplay)
        loggedInUserEmailDisplay.textContent = user.displayName || user.email;
      if (user.email === ADMIN_EMAIL) {
        //isAdmin = true; alterei aqui
        const isAdminUser = user.email === ADMIN_EMAIL;
        isAdmin = isAdminUser;
        if (adminLogoutBtn) adminLogoutBtn.classList.remove("hidden");
        if (userLogoutBtn) userLogoutBtn.classList.add("hidden");
        if (adminPanel) adminPanel.classList.remove("hidden");
        if (adminUserIdDisplay)
          adminUserIdDisplay.textContent = `Admin User ID: ${currentUserId}`;
        console.log("Admin user detected.");
      } else {
        isAdmin = false;
        if (adminLogoutBtn) adminLogoutBtn.classList.add("hidden");
        if (userLogoutBtn) userLogoutBtn.classList.remove("hidden");
        if (adminPanel) adminPanel.classList.add("hidden");
        console.log("Regular user detected.");
      }
      loadModules();
      if (!isAdminUser && !user.displayName) {
        openChangeNameModal(true);
      }
    } else {
      currentUserId = null;
      isAdmin = false;
      console.log("User signed out or no user.");
      if (loginPageWrapper) loginPageWrapper.style.display = "flex";
      if (courseContentWrapper) courseContentWrapper.style.display = "none";
      if (loggedInUserEmailDisplay) loggedInUserEmailDisplay.textContent = "";
      if (adminLogoutBtn) adminLogoutBtn.classList.add("hidden");
      if (userLogoutBtn) userLogoutBtn.classList.add("hidden");
      if (adminPanel) adminPanel.classList.add("hidden");
      if (adminUserIdDisplay) adminUserIdDisplay.textContent = "";
      if (modulesList)
        modulesList.innerHTML =
          '<p class="p-4 text-gray-500">Faça login para ver os módulos.</p>';
      if (lessonsContainer)
        lessonsContainer.innerHTML =
          '<p class="p-4 text-gray-500">Faça login para ver as aulas.</p>';
      if (currentModuleTitle)
        currentModuleTitle.textContent = "Nenhum módulo selecionado";
      if (currentLessonTitle)
        currentLessonTitle.textContent = "Nenhuma aula selecionada";
      if (videoPlayerContainer)
        videoPlayerContainer.innerHTML =
          '<p class="text-gray-500">Player de vídeo aparecerá aqui.</p>';
      if (attachmentLink) attachmentLink.classList.add("hidden");
      if (loginPageWrapper) loginPageWrapper.style.display = "flex";
      if (courseContentWrapper) courseContentWrapper.style.display = "none";
    }
  });
});

if (userLoginForm) {
  userLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = userLoginForm.email.value;
    const password = userLoginForm.password.value;
    if (userLoginError) userLoginError.textContent = "";
    try {
      await signInWithEmailAndPassword(auth, email, password);
      userLoginForm.reset();
    } catch (error) {
      console.error("User login failed:", error);
      if (userLoginError)
        userLoginError.textContent = "Falha no login: " + error.message;
    }
  });
}

if (pageAdminLoginBtn)
  pageAdminLoginBtn.addEventListener("click", () => {
    if (adminLoginModal) adminLoginModal.style.display = "block";
  });
// A linha abaixo já está com os console.log para o botão de fechar o modal de login do admin
// if(closeLoginModalBtn) closeLoginModalBtn.addEventListener('click', () => { if(adminLoginModal) adminLoginModal.style.display = 'none'; });

if (closeEditModuleModalBtn)
  closeEditModuleModalBtn.addEventListener("click", () => {
    if (editModuleModal) editModuleModal.style.display = "none";
  });
if (closeEditLessonModalBtn)
  closeEditLessonModalBtn.addEventListener("click", () => {
    if (editLessonModal) editLessonModal.style.display = "none";
  });

window.onclick = function (event) {
  if (adminLoginModal && event.target == adminLoginModal)
    adminLoginModal.style.display = "none";
  if (editModuleModal && event.target == editModuleModal)
    editModuleModal.style.display = "none";
  if (editLessonModal && event.target == editLessonModal)
    editLessonModal.style.display = "none";
};

if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = adminLoginForm.adminEmail.value;
    const password = adminLoginForm.adminPassword.value;
    if (adminLoginError) adminLoginError.textContent = "";
    if (email !== ADMIN_EMAIL) {
      if (adminLoginError)
        adminLoginError.textContent = "Este não é o email do administrador.";
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      if (adminLoginModal) adminLoginModal.style.display = "none";
      adminLoginForm.reset();
    } catch (error) {
      console.error("Admin login failed:", error);
      if (adminLoginError)
        adminLoginError.textContent =
          "Falha no login do admin: " + error.message;
    }
  });
}

if (userLogoutBtn) {
  userLogoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("User logout error:", error);
      alert("Erro ao sair: " + error.message);
    }
  });
}
if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener("click", async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Admin logout error:", error);
      alert("Erro ao sair (admin): " + error.message);
    }
  });
}

if (openSidebarButton) {
  openSidebarButton.addEventListener("click", () => {
    if (sidebar) sidebar.classList.remove("-translate-x-full");
    if (window.innerWidth >= 768 && mainContent && sidebar) {
      mainContent.style.marginLeft = sidebar.offsetWidth + "px";
    }
  });
}
if (closeSidebarButton) {
  closeSidebarButton.addEventListener("click", () => {
    if (sidebar) sidebar.classList.add("-translate-x-full");
    if (window.innerWidth >= 768 && mainContent) {
      mainContent.style.marginLeft = "0";
    }
  });
}
window.addEventListener("resize", () => {
  if (
    window.innerWidth >= 768 &&
    sidebar &&
    !sidebar.classList.contains("-translate-x-full") &&
    mainContent
  ) {
    mainContent.style.marginLeft = sidebar.offsetWidth + "px";
  } else if (mainContent) {
    mainContent.style.marginLeft = "0";
  }
});
if (
  window.innerWidth >= 768 &&
  openSidebarButton &&
  sidebar &&
  !sidebar.classList.contains("-translate-x-full")
) {
}

async function loadModules() {
  if (!auth.currentUser) {
    console.log("Auth not ready for loading modules.");
    if (modulesList)
      modulesList.innerHTML =
        '<p class="p-4 text-gray-500">Faça login para ver os módulos.</p>';
    return;
  }
  if (!modulesList) {
    console.error("modulesList element not found.");
    return;
  }

  modulesList.innerHTML =
    '<p class="p-4 text-gray-500">Carregando módulos...</p>';
  const modulesCol = collection(db, modulesCollectionPath);

  try {
    if (window.unsubscribeModules) window.unsubscribeModules();

    window.unsubscribeModules = onSnapshot(
      modulesCol,
      (querySnapshot) => {
        const modules = [];
        querySnapshot.forEach((doc) => {
          modules.push({ id: doc.id, ...doc.data() });
        });

        modules.sort((a, b) => {
          if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
          return (a.name || "").localeCompare(b.name || "");
        });

        modulesList.innerHTML = "";
        if (modulesSelectForLesson)
          modulesSelectForLesson.innerHTML =
            '<option value="">Selecione um Módulo</option>';

        if (modules.length === 0) {
          modulesList.innerHTML =
            '<p class="p-4 text-gray-500">Nenhum módulo encontrado.</p>';
        }

        modules.forEach((module) => {
          const li = document.createElement("li");
          li.className = "mb-1";
          const button = document.createElement("button");
          button.className =
            "w-full text-left px-4 py-3 anima-blue hover:bg-blue-100 rounded-md transition-colors duration-150 flex justify-between items-center";

          const moduleNameSpan = document.createElement("span");
          moduleNameSpan.textContent = module.name;
          button.appendChild(moduleNameSpan);

          button.onclick = () => {
            currentOpenModuleId = module.id;
            loadLessons(module.id, module.name);
          };

          if (isAdmin) {
            const controlsDiv = document.createElement("div");
            controlsDiv.className = "flex items-center";

            const editBtn = document.createElement("button");
            editBtn.textContent = "Editar";
            editBtn.className = "edit-button-style";
            editBtn.title = `Editar módulo ${module.name}`;
            editBtn.onclick = (e) => {
              e.stopPropagation();
              openEditModuleModal(module.id, module.name, module.order || 0);
            };
            controlsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "×";
            deleteBtn.className =
              "ml-2 text-red-500 hover:text-red-700 font-bold px-2";
            deleteBtn.title = `Remover módulo ${module.name}`;
            deleteBtn.onclick = (e) => {
              e.stopPropagation();
              if (
                confirm(
                  `Tem certeza que deseja remover o módulo "${module.name}" e todas as suas aulas?`
                )
              ) {
                deleteModule(module.id);
              }
            };
            controlsDiv.appendChild(deleteBtn);
            button.appendChild(controlsDiv);
          }
          li.appendChild(button);
          modulesList.appendChild(li);
          if (modulesSelectForLesson) {
            const option = document.createElement("option");
            option.value = module.id;
            option.textContent = module.name;
            modulesSelectForLesson.appendChild(option);
          }
        });

        if (
          modules.length > 0 &&
          lessonsContainer &&
          (!lessonsContainer.innerHTML.trim() ||
            lessonsContainer.querySelector("p.text-gray-500"))
        ) {
          currentOpenModuleId = modules[0].id;
          loadLessons(modules[0].id, modules[0].name);
        }
      },
      (error) => {
        console.error("Error loading modules: ", error);
        if (modulesList)
          modulesList.innerHTML = `<p class="p-4 text-red-500">Erro ao carregar módulos: ${error.message}</p>`;
      }
    );
  } catch (error) {
    console.error("Error setting up modules listener: ", error);
    if (modulesList)
      modulesList.innerHTML = `<p class="p-4 text-red-500">Erro crítico ao configurar módulos: ${error.message}</p>`;
  }
}

async function loadLessons(moduleId, moduleName) {
  currentOpenModuleId = moduleId;
  if (!auth.currentUser) {
    console.log("Auth not ready for loading lessons.");
    return;
  }
  if (
    !lessonsContainer ||
    !currentModuleTitle ||
    !videoPlayerContainer ||
    !currentLessonTitle ||
    !attachmentLink
  ) {
    console.error("One or more lesson display elements not found.");
    return;
  }

  currentModuleTitle.textContent = moduleName;
  lessonsContainer.innerHTML =
    '<p class="p-4 text-gray-500">Carregando aulas...</p>';
  videoPlayerContainer.innerHTML = "";
  currentLessonTitle.textContent = "Selecione uma aula";
  attachmentLink.classList.add("hidden");

  const lessonsColPath = `${modulesCollectionPath}/${moduleId}/lessons`;
  const lessonsCol = collection(db, lessonsColPath);

  try {
    if (window.unsubscribeLessons) window.unsubscribeLessons();
    window.unsubscribeLessons = onSnapshot(
      lessonsCol,
      (querySnapshot) => {
        const lessons = [];
        querySnapshot.forEach((doc) => {
          lessons.push({ id: doc.id, ...doc.data(), moduleId: moduleId });
        });
        lessons.sort((a, b) => {
          if (a.order !== b.order) return (a.order || 0) - (b.order || 0);
          return (a.title || "").localeCompare(b.title || "");
        });

        lessonsContainer.innerHTML = "";
        if (lessons.length === 0) {
          lessonsContainer.innerHTML =
            '<p class="p-4 text-gray-500">Nenhuma aula neste módulo.</p>';
          return;
        }

        lessons.forEach((lesson) => {
          const div = document.createElement("div");
          div.className =
            "p-4 mb-3 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-150 flex justify-between items-center";

          const lessonInfoDiv = document.createElement("div");
          const titleEl = document.createElement("h4");
          titleEl.className = "text-lg font-semibold anima-blue mb-2";
          titleEl.textContent = lesson.title;
          lessonInfoDiv.appendChild(titleEl);

          const playBtn = document.createElement("button");
          playBtn.className =
            "px-4 py-2 anima-bg-blue text-white rounded-md hover:bg-blue-700 transition-colors duration-150 text-sm";
          playBtn.textContent = "Assistir Aula";
          playBtn.onclick = () => displayLesson(lesson);
          lessonInfoDiv.appendChild(playBtn);
          div.appendChild(lessonInfoDiv);

          if (isAdmin) {
            const controlsDiv = document.createElement("div");
            controlsDiv.className = "flex items-center";

            const editBtn = document.createElement("button");
            editBtn.textContent = "Editar";
            editBtn.className = "edit-button-style";
            editBtn.title = `Editar aula ${lesson.title}`;
            editBtn.onclick = (e) => {
              e.stopPropagation();
              openEditLessonModal(
                lesson.moduleId,
                lesson.id,
                lesson.title,
                lesson.youtubeVideoId,
                lesson.attachmentUrl || "",
                lesson.order || 0
              );
            };
            controlsDiv.appendChild(editBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "×";
            deleteBtn.className =
              "ml-3 text-red-500 hover:text-red-700 font-bold px-2 py-1 text-sm";
            deleteBtn.title = `Remover aula ${lesson.title}`;
            deleteBtn.onclick = (e) => {
              e.stopPropagation();
              if (
                confirm(
                  `Tem certeza que deseja remover a aula "${lesson.title}"?`
                )
              ) {
                deleteLesson(lesson.moduleId, lesson.id);
              }
            };
            controlsDiv.appendChild(deleteBtn);
            div.appendChild(controlsDiv);
          }
          lessonsContainer.appendChild(div);
        });
        if (lessons.length > 0) displayLesson(lessons[0]);
      },
      (error) => {
        console.error(`Error loading lessons for module ${moduleId}: `, error);
        if (lessonsContainer)
          lessonsContainer.innerHTML = `<p class="p-4 text-red-500">Erro ao carregar aulas: ${error.message}</p>`;
      }
    );
  } catch (error) {
    console.error(
      `Error setting up lessons listener for module ${moduleId}: `,
      error
    );
    if (lessonsContainer)
      lessonsContainer.innerHTML = `<p class="p-4 text-red-500">Erro crítico ao configurar aulas: ${error.message}</p>`;
  }
}

function displayLesson(lesson) {
  if (!currentLessonTitle || !videoPlayerContainer || !attachmentLink) {
    console.error(
      "displayLesson: Elementos de UI para exibir a aula estão ausentes."
    );
    return;
  }
  currentLessonTitle.textContent = lesson.title;

  let rawVideoIdInput = lesson.youtubeVideoId;
  let processedVideoId = null;

  if (rawVideoIdInput && typeof rawVideoIdInput === "string") {
    rawVideoIdInput = rawVideoIdInput.trim();
    const pureIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    if (pureIdRegex.test(rawVideoIdInput)) {
      processedVideoId = rawVideoIdInput;
    } else {
      const urlPatterns = [
        /(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/|live\/|playlist\?list=.*(?:&|&)v=)([a-zA-Z0-9_-]{11})/,
        /(?:https?:\/\/)?(?:www\.)?youtu\.be\/([a-zA-Z0-9_-]{11})/,
      ];
      for (const pattern of urlPatterns) {
        const match = rawVideoIdInput.match(pattern);
        if (match && match[1]) {
          processedVideoId = match[1];
          break;
        }
      }
    }
  }

  let finalEmbedUrl = "URL de incorporação não pôde ser gerada";
  if (processedVideoId) {
    finalEmbedUrl = `https://www.youtube.com/embed/${processedVideoId}`;
  }

  console.log(
    "****************************************",
    "\nDEBUG YOUTUBE VIDEO (displayLesson):",
    "\n1. ID Original (Firestore):",
    lesson.youtubeVideoId,
    "\n2. ID Processado (tentativa de extração):",
    processedVideoId,
    "\n3. URL de Incorporação (usada no iframe):",
    finalEmbedUrl,
    "\n****************************************"
  );

  if (processedVideoId) {
    console.log(
      "displayLesson: processedVideoId é VÁLIDO. Tentando criar iframe com URL:",
      finalEmbedUrl
    );
    videoPlayerContainer.innerHTML = `
               
                    <iframe src="${finalEmbedUrl}"
                            title="Player de vídeo do YouTube para ${
                              lesson.title || "aula"
                            }"
                            frameborder="0" 
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen>
                    </iframe>
               `;
  } else {
    console.log(
      "displayLesson: processedVideoId é NULO ou INVÁLIDO. Mostrando mensagem de ID não fornecido."
    );
    if (videoPlayerContainer)
      videoPlayerContainer.innerHTML =
        '<p class="text-gray-500 p-4">ID do vídeo não fornecido, inválido ou não foi possível processar.</p>';
  }

  if (lesson.attachmentUrl) {
    if (attachmentLink) {
      attachmentLink.href = lesson.attachmentUrl;
      attachmentLink.classList.remove("hidden");
    }
  } else {
    if (attachmentLink) attachmentLink.classList.add("hidden");
  }

  // --- LINHAS ADICIONADAS ---
  // Armazena o ID da aula e do módulo abertos
  currentOpenLessonId = lesson.id;
  currentOpenModuleId = lesson.moduleId;

  // Mostra a seção de comentários e carrega os comentários
  const commentsSection = document.getElementById("commentsSection");
  if (commentsSection) {
    commentsSection.classList.remove("hidden");
    loadComments(lesson.moduleId, lesson.id);
  }
  // --- FIM DAS LINHAS ADICIONADAS ---
}

// --- Edit Module Functions ---
function openEditModuleModal(moduleId, name, order) {
  if (!editModuleModal || !editModuleForm) return;
  editModuleForm.editModuleId.value = moduleId;
  editModuleForm.editModuleName.value = name;
  editModuleForm.editModuleOrder.value = order;
  if (editModuleError) editModuleError.textContent = "";
  editModuleModal.style.display = "block";
}

if (editModuleForm) {
  editModuleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Acesso negado.");
      return;
    }

    const moduleId = editModuleForm.editModuleId.value;
    const newName = editModuleForm.editModuleName.value.trim();
    const newOrder = parseInt(editModuleForm.editModuleOrder.value);

    if (!newName) {
      if (editModuleError)
        editModuleError.textContent = "Nome do módulo é obrigatório.";
      return;
    }
    if (isNaN(newOrder)) {
      if (editModuleError)
        editModuleError.textContent = "Ordem do módulo deve ser um número.";
      return;
    }

    try {
      const moduleRef = doc(db, modulesCollectionPath, moduleId);
      await updateDoc(moduleRef, {
        name: newName,
        order: newOrder,
        updatedAt: serverTimestamp(),
      });
      if (editModuleModal) editModuleModal.style.display = "none";
    } catch (error) {
      console.error("Error updating module: ", error);
      if (editModuleError)
        editModuleError.textContent =
          "Erro ao atualizar módulo: " + error.message;
    }
  });
}

// --- NOVAS FUNÇÕES PARA COMENTÁRIOS ---
async function loadComments(moduleId, lessonId) {
  const commentsContainer = document.getElementById("commentsContainer");
  if (!commentsContainer) {
    console.error("Elemento commentsContainer não encontrado.");
    return;
  }
  commentsContainer.innerHTML =
    '<p class="text-gray-500">Carregando comentários...</p>';

  const commentsColPath = `${modulesCollectionPath}/${moduleId}/lessons/${lessonId}/comments`;
  const q = query(
    collection(db, commentsColPath),
    orderBy("createdAt", "desc")
  ); // Ordena por data (mais novo primeiro)

  try {
    if (window.unsubscribeComments) window.unsubscribeComments();

    window.unsubscribeComments = onSnapshot(q, (querySnapshot) => {
      const comments = [];
      querySnapshot.forEach((doc) => {
        comments.push({ id: doc.id, ...doc.data() });
      });

      commentsContainer.innerHTML = "";
      if (comments.length === 0) {
        commentsContainer.innerHTML =
          '<p class="text-gray-500 text-sm">Nenhum comentário ainda. Seja o primeiro a comentar!</p>';
      } else {
        comments.forEach((comment) => {
          const commentDiv = document.createElement("div");
          commentDiv.className = "comment";
          if (comment.isAdminComment) {
            commentDiv.classList.add("admin-comment");
          }

          const commentHeader = document.createElement("div");
          commentHeader.className = "comment-header";

          const authorSpan = document.createElement("span");
          authorSpan.className = "comment-author";
          authorSpan.textContent = comment.userEmail || "Anônimo";

          if (comment.isAdminComment) {
            const adminBadge = document.createElement("span");
            adminBadge.className = "admin-badge";
            adminBadge.textContent = "Admin";
            authorSpan.appendChild(adminBadge);
          }

          const dateSpan = document.createElement("span");
          dateSpan.className = "comment-date";
          if (comment.createdAt && comment.createdAt.toDate) {
            dateSpan.textContent = comment.createdAt
              .toDate()
              .toLocaleString("pt-BR");
          }

          // Cria um container para os elementos da direita (data e botão de excluir)
          const rightSideHeader = document.createElement("div");
          rightSideHeader.className = "flex items-center";
          rightSideHeader.appendChild(dateSpan); // Adiciona a data primeiro

          // Se for admin, cria e adiciona o botão de excluir
          if (isAdmin) {
            const deleteBtn = document.createElement("button");
            deleteBtn.innerHTML = "&times;"; // O "x" para exclusão
            deleteBtn.className = "delete-comment-btn";
            deleteBtn.title = "Excluir comentário";
            deleteBtn.onclick = () => {
              if (confirm("Tem certeza que deseja excluir este comentário?")) {
                deleteComment(
                  currentOpenModuleId,
                  currentOpenLessonId,
                  comment.id
                );
              }
            };
            rightSideHeader.appendChild(deleteBtn);
          }

          commentHeader.appendChild(authorSpan);
          commentHeader.appendChild(rightSideHeader); // Adiciona o container com a data e o botão
          //

          const commentText = document.createElement("p");
          commentText.className = "comment-text";
          commentText.textContent = comment.text;

          commentDiv.appendChild(commentHeader);
          commentDiv.appendChild(commentText);

          commentsContainer.appendChild(commentDiv);
        });
      }
    });
  } catch (error) {
    console.error("Erro ao carregar comentários:", error);
    commentsContainer.innerHTML =
      '<p class="text-red-500">Erro ao carregar comentários.</p>';
  }
}

// --- BLOCO DE CÓDIGO INTEIRAMENTE NOVO ---

if (addCommentForm) {
  addCommentForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentOpenModuleId || !currentOpenLessonId) {
      alert("Selecione uma aula para comentar.");
      return;
    }

    const commentTextEl = document.getElementById("commentText");
    const text = commentTextEl.value.trim();
    if (!text) {
      alert("O comentário não pode estar vazio.");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Você precisa estar logado para comentar.");
      return;
    }

    const commentsColPath = `${modulesCollectionPath}/${currentOpenModuleId}/lessons/${currentOpenLessonId}/comments`;

    try {
      await addDoc(collection(db, commentsColPath), {
        text: text,
        userId: user.uid,
        userEmail: user.email,
        isAdminComment: user.email === ADMIN_EMAIL,
        createdAt: serverTimestamp(),
      });
      commentTextEl.value = ""; // Limpa a caixa de texto
    } catch (error) {
      console.error("Erro ao adicionar comentário:", error);
      alert("Não foi possível enviar o seu comentário. Tente novamente.");
    }
  });
}

// --- Edit Lesson Functions ---
function openEditLessonModal(
  moduleId,
  lessonId,
  title,
  youtubeId,
  attachmentUrl,
  order
) {
  if (!editLessonModal || !editLessonForm) return;
  editLessonForm.editLessonModuleId.value = moduleId;
  editLessonForm.editLessonId.value = lessonId;
  editLessonForm.editLessonTitle.value = title;
  editLessonForm.editYoutubeId.value = youtubeId;
  editLessonForm.editAttachmentUrl.value = attachmentUrl;
  editLessonForm.editLessonOrder.value = order;
  if (editLessonError) editLessonError.textContent = "";
  editLessonModal.style.display = "block";
}

if (editLessonForm) {
  editLessonForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Acesso negado.");
      return;
    }

    const moduleId = editLessonForm.editLessonModuleId.value;
    const lessonId = editLessonForm.editLessonId.value;
    const newTitle = editLessonForm.editLessonTitle.value.trim();
    const newYoutubeId = editLessonForm.editYoutubeId.value.trim();
    const newAttachmentUrl = editLessonForm.editAttachmentUrl.value.trim();
    const newOrder = parseInt(editLessonForm.editLessonOrder.value);

    if (!newTitle || !newYoutubeId) {
      if (editLessonError)
        editLessonError.textContent =
          "Título e ID/URL do YouTube são obrigatórios.";
      return;
    }
    if (isNaN(newOrder)) {
      if (editLessonError)
        editLessonError.textContent = "Ordem da aula deve ser um número.";
      return;
    }

    const lessonDocPath = `${modulesCollectionPath}/${moduleId}/lessons/${lessonId}`;
    try {
      const lessonRef = doc(db, lessonDocPath);
      await updateDoc(lessonRef, {
        title: newTitle,
        youtubeVideoId: newYoutubeId,
        attachmentUrl: newAttachmentUrl,
        order: newOrder,
        updatedAt: serverTimestamp(),
      });
      if (editLessonModal) editLessonModal.style.display = "none";
      if (currentLessonTitle && currentLessonTitle.textContent === title) {
        displayLesson({
          id: lessonId,
          moduleId: moduleId,
          title: newTitle,
          youtubeVideoId: newYoutubeId,
          attachmentUrl: newAttachmentUrl,
          order: newOrder,
        });
      }
    } catch (error) {
      console.error("Error updating lesson: ", error);
      if (editLessonError)
        editLessonError.textContent =
          "Erro ao atualizar aula: " + error.message;
    }
  });
}

if (addModuleForm) {
  addModuleForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Acesso negado.");
      return;
    }
    const moduleName = addModuleForm.moduleName.value.trim();
    const moduleOrder = parseInt(addModuleForm.moduleOrder.value) || 0;
    if (!moduleName) {
      alert("Nome do módulo é obrigatório.");
      return;
    }
    try {
      await addDoc(collection(db, modulesCollectionPath), {
        name: moduleName,
        order: moduleOrder,
        createdAt: serverTimestamp(),
      });
      addModuleForm.reset();
    } catch (error) {
      console.error("Error adding module: ", error);
      alert("Erro ao adicionar módulo: " + error.message);
    }
  });
}

if (addLessonForm) {
  addLessonForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Acesso negado.");
      return;
    }
    const moduleId = addLessonForm.moduleId.value;
    const lessonTitle = addLessonForm.lessonTitle.value.trim();
    const youtubeId = addLessonForm.youtubeId.value.trim();
    const attachment = addLessonForm.attachmentUrl.value.trim();
    const lessonOrder = parseInt(addLessonForm.lessonOrder.value) || 0;
    if (!moduleId || !lessonTitle || !youtubeId) {
      alert("Módulo, Título e ID/URL do YouTube são obrigatórios.");
      return;
    }
    const lessonsColPath = `${modulesCollectionPath}/${moduleId}/lessons`;
    try {
      await addDoc(collection(db, lessonsColPath), {
        title: lessonTitle,
        youtubeVideoId: youtubeId,
        attachmentUrl: attachment,
        order: lessonOrder,
        createdAt: serverTimestamp(),
      });
      addLessonForm.reset();
      if (moduleId === currentOpenModuleId) {
        const selectedModuleOption = Array.from(
          modulesSelectForLesson.options
        ).find((opt) => opt.value === moduleId);
        if (selectedModuleOption) {
          loadLessons(moduleId, selectedModuleOption.textContent);
        }
      }
    } catch (error) {
      console.error("Error adding lesson: ", error);
      alert("Erro ao adicionar aula: " + error.message);
    }
  });
}

async function deleteModule(moduleId) {
  if (!isAdmin) {
    alert("Acesso negado.");
    return;
  }
  try {
    const lessonsColPath = `${modulesCollectionPath}/${moduleId}/lessons`;
    const lessonsSnapshot = await getDocs(collection(db, lessonsColPath));
    const deletePromises = [];
    lessonsSnapshot.forEach((docRef) =>
      deletePromises.push(deleteDoc(docRef.ref))
    );
    await Promise.all(deletePromises);
    await deleteDoc(doc(db, modulesCollectionPath, moduleId));
    if (lessonsContainer) lessonsContainer.innerHTML = "";
    if (currentModuleTitle) currentModuleTitle.textContent = "Módulo Removido";
    if (videoPlayerContainer) videoPlayerContainer.innerHTML = "";
    if (currentLessonTitle)
      currentLessonTitle.textContent = "Selecione uma aula";
    if (attachmentLink) attachmentLink.classList.add("hidden");
    currentOpenModuleId = null;
  } catch (error) {
    console.error("Error deleting module: ", error);
    alert("Erro ao remover módulo: " + error.message);
  }
}

async function deleteLesson(moduleId, lessonId) {
  if (!isAdmin) {
    alert("Acesso negado.");
    return;
  }
  const lessonDocPath = `${modulesCollectionPath}/${moduleId}/lessons/${lessonId}`;
  try {
    await deleteDoc(doc(db, lessonDocPath));
    if (moduleId === currentOpenModuleId) {
      const moduleName = currentModuleTitle.textContent;
      if (
        moduleName &&
        moduleName !== "Módulo Removido" &&
        moduleName !== "Selecione um Módulo"
      ) {
        loadLessons(moduleId, moduleName);
      }
    }
    if (
      videoPlayerContainer &&
      videoPlayerContainer.querySelector(`iframe[src*="${lessonId}"]`)
    ) {
      videoPlayerContainer.innerHTML =
        '<p class="text-gray-500 p-4">Aula removida ou vídeo não disponível.</p>';
      if (currentLessonTitle) currentLessonTitle.textContent = "Aula Removida";
      if (attachmentLink) attachmentLink.classList.add("hidden");
    }
  } catch (error) {
    console.error("Error deleting lesson: ", error);
    alert("Erro ao remover aula: " + error.message);
  }
}

async function deleteComment(moduleId, lessonId, commentId) {
  if (!isAdmin) {
    alert("Acesso negado. Apenas administradores podem excluir comentários.");
    return;
  }
  if (!moduleId || !lessonId || !commentId) {
    console.error("IDs de módulo, aula ou comentário ausentes para exclusão.");
    return;
  }

  const commentDocPath = `${modulesCollectionPath}/${moduleId}/lessons/${lessonId}/comments/${commentId}`;
  try {
    await deleteDoc(doc(db, commentDocPath));
    console.log("Comentário excluído com sucesso:", commentId);
    // O onSnapshot do loadComments atualizará a UI automaticamente.
  } catch (error) {
    console.error("Erro ao excluir comentário: ", error);
    alert("Não foi possível excluir o comentário. Tente novamente.");
  }
}
