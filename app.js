(function () {
  "use strict";

  // ===== Mermaid config =====
  var mermaidThemes = {
    "default": "default",
    "scifi": "dark",
    "pixel": "dark",
    "office": "base"
  };
  var currentMermaidTheme = "default";
  mermaid.initialize({ startOnLoad: false, theme: currentMermaidTheme, securityLevel: "loose" });

  function renderMermaidDiagrams() {
    var blocks = markdownOutput.querySelectorAll("code.language-mermaid");
    if (blocks.length === 0) return;
    blocks.forEach(function (block, i) {
      var pre = block.parentNode;
      var div = document.createElement("div");
      div.className = "mermaid";
      div.textContent = block.textContent;
      pre.replaceWith(div);
    });
    mermaid.run({ nodes: markdownOutput.querySelectorAll(".mermaid") }).catch(function () {});
  }

  marked.setOptions({
    highlight: function (code, lang) {
      if (lang && hljs.getLanguage(lang)) {
        return hljs.highlight(code, { language: lang }).value;
      }
      return hljs.highlightAuto(code).value;
    },
    breaks: false,
    gfm: true,
  });

  var tabBar = document.getElementById("tab-bar");
  var uploadScreen = document.getElementById("upload-screen");
  var viewerScreen = document.getElementById("viewer-screen");
  var dropZone = document.getElementById("drop-zone");
  var fileInput = document.getElementById("file-input");
  var markdownOutput = document.getElementById("markdown-output");
  var themeToggle = document.getElementById("theme-toggle");
  var themeMenu = document.getElementById("theme-menu");
  var themeOptions = document.querySelectorAll(".theme-option");
  var settingsBtn = document.getElementById("settings-btn");
  var settingsModal = document.getElementById("settings-modal");
  var settingsModalClose = document.getElementById("settings-modal-close");
  var apiKeyInput = document.getElementById("api-key-input");
  var saveApiKeyBtn = document.getElementById("save-api-key-btn");
  var settingsSavedMsg = document.getElementById("settings-saved-msg");
  var aiFloatBtn = document.getElementById("ai-float-btn");
  var aiModal = document.getElementById("ai-modal");
  var aiModalClose = document.getElementById("ai-modal-close");
  var aiSelectionPreview = document.getElementById("ai-selection-preview");
  var aiQuestionInput = document.getElementById("ai-question-input");
  var aiSendBtn = document.getElementById("ai-send-btn");
  var aiResponse = document.getElementById("ai-response");
  var hljsLink = document.getElementById("hljs-theme");
  var addTabBtn = document.getElementById("add-tab-btn");
  var fileInput2 = document.getElementById("file-input-2");

  var files = [];
  var activeFileId = null;
  var selectedText = "";
  var nextId = 1;

  function saveState() {
    try {
      localStorage.setItem("md-files", JSON.stringify(files.map(function (f) {
        return { id: f.id, name: f.name, raw: f.raw };
      })));
      localStorage.setItem("md-active-id", String(activeFileId || ""));
    } catch (e) {}
  }

  function loadState() {
    try {
      var raw = localStorage.getItem("md-files");
      if (raw) {
        var parsed = JSON.parse(raw);
        parsed.forEach(function (f) {
          f.html = marked.parse(f.raw);
          files.push(f);
          if (f.id >= nextId) nextId = f.id + 1;
        });
      }
      var aid = localStorage.getItem("md-active-id");
      if (aid) activeFileId = parseInt(aid, 10);
    } catch (e) {}
  }

  function addFile(name, raw) {
    var id = nextId++;
    var html = marked.parse(raw);
    files.push({ id: id, name: name, raw: raw, html: html });
    activeFileId = id;
    saveState();
    renderTabs();
    showViewer();
  }

  function removeFile(id) {
    files = files.filter(function (f) { return f.id !== id; });
    if (activeFileId === id) {
      activeFileId = files.length > 0 ? files[files.length - 1].id : null;
    }
    saveState();
    renderTabs();
    if (activeFileId) { showViewer(); } else { showUpload(); }
  }

  function switchFile(id) {
    activeFileId = id;
    saveState();
    renderTabs();
    showViewer();
  }

  function getActiveFile() {
    for (var i = 0; i < files.length; i++) {
      if (files[i].id === activeFileId) return files[i];
    }
    return null;
  }

  function renderTabs() {
    tabBar.innerHTML = "";
    files.forEach(function (f) {
      var tab = document.createElement("button");
      tab.className = "tab" + (f.id === activeFileId ? " active" : "");
      tab.innerHTML = '<span class="tab-name">' + escapeHtml(f.name) + '</span><span class="tab-close">&times;</span>';
      tab.addEventListener("click", function (e) {
        if (e.target.classList.contains("tab-close")) {
          removeFile(f.id);
        } else {
          switchFile(f.id);
        }
      });
      tabBar.appendChild(tab);
    });
  }

  function showViewer() {
    var f = getActiveFile();
    if (!f) return;
    markdownOutput.innerHTML = f.html;
    uploadScreen.classList.add("hidden");
    viewerScreen.classList.remove("hidden");
    setTimeout(renderMermaidDiagrams, 50);
    addTabBtn.classList.remove("hidden");
  }

  function showUpload() {
    uploadScreen.classList.remove("hidden");
    viewerScreen.classList.add("hidden");
    addTabBtn.classList.add("hidden");
    markdownOutput.innerHTML = "";
  }

  function escapeHtml(str) {
    var div = document.createElement("div");
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
  }

  // ===== Theme =====
  var hljsThemes = {
    "default": "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/github.min.css",
    "scifi": "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/tokyo-night-dark.min.css",
    "pixel": "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/arta.min.css",
    "office": "https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.10.0/styles/atom-one-light.min.css"
  };

  function setTheme(theme) {
    document.body.setAttribute("data-theme", theme);
    hljsLink.href = hljsThemes[theme] || hljsThemes["default"];
    themeOptions.forEach(function (btn) {
      btn.classList.toggle("active", btn.getAttribute("data-theme") === theme);
    });
    var mTheme = mermaidThemes[theme] || "default";
    if (mTheme !== currentMermaidTheme) {
      currentMermaidTheme = mTheme;
      mermaid.initialize({ startOnLoad: false, theme: currentMermaidTheme, securityLevel: "loose" });
      if (getActiveFile()) { markdownOutput.innerHTML = getActiveFile().html; renderMermaidDiagrams(); }
    }
    try { localStorage.setItem("md-reader-theme", theme); } catch (e) {}
  }

  themeToggle.addEventListener("click", function (e) {
    e.stopPropagation();
    themeMenu.classList.toggle("hidden");
  });

  themeOptions.forEach(function (btn) {
    btn.addEventListener("click", function () {
      setTheme(this.getAttribute("data-theme"));
      themeMenu.classList.add("hidden");
    });
  });

  document.addEventListener("click", function (e) {
    if (!themeMenu.contains(e.target) && e.target !== themeToggle) {
      themeMenu.classList.add("hidden");
    }
  });

  // ===== File upload =====
  function handleFile(file) {
    if (!file) return;
    var reader = new FileReader();
    reader.onload = function (e) { addFile(file.name, e.target.result); };
    reader.readAsText(file);
  }

  fileInput.addEventListener("change", function () {
    handleFile(this.files[0]);
    this.value = "";
  });

  dropZone.addEventListener("dragover", function (e) {
    e.preventDefault();
    dropZone.classList.add("drag-over");
  });
  dropZone.addEventListener("dragleave", function () {
    dropZone.classList.remove("drag-over");
  });
  dropZone.addEventListener("drop", function (e) {
    e.preventDefault();
    dropZone.classList.remove("drag-over");
    var file = e.dataTransfer.files[0];
    if (file && file.name.match(/\.(md|markdown|mdown|mkd)$/i)) handleFile(file);
  });

  // ===== AI: text selection =====
  document.addEventListener("mouseup", function (e) {
    setTimeout(function () {
      var sel = window.getSelection();
      var text = sel ? sel.toString().trim() : "";
      if (text.length > 2 && isInsideMarkdown(sel)) {
        selectedText = text;
        positionAiButton(e);
        aiFloatBtn.classList.remove("hidden");
      } else {
        aiFloatBtn.classList.add("hidden");
      }
    }, 10);
  });

  function isInsideMarkdown(sel) {
    if (!sel || !sel.anchorNode) return false;
    var node = sel.anchorNode;
    while (node) {
      if (node.classList && node.classList.contains("markdown-body")) return true;
      node = node.parentNode;
    }
    return false;
  }

  function positionAiButton(e) {
    var x = e.clientX + 10;
    var y = e.clientY - 40;
    if (x + 100 > window.innerWidth) x = window.innerWidth - 110;
    if (y < 0) y = e.clientY + 15;
    aiFloatBtn.style.left = x + "px";
    aiFloatBtn.style.top = y + "px";
  }

  // ===== AI: modal =====
  aiFloatBtn.addEventListener("click", function () {
    aiFloatBtn.classList.add("hidden");
    aiSelectionPreview.textContent = selectedText.length > 300
      ? selectedText.substring(0, 300) + "..." : selectedText;
    aiQuestionInput.value = "";
    aiResponse.className = "ai-response hidden";
    aiModal.classList.remove("hidden");
    setTimeout(function () { aiQuestionInput.focus(); }, 100);
  });

  aiModalClose.addEventListener("click", function () {
    aiModal.classList.add("hidden");
  });
  aiModal.addEventListener("click", function (e) {
    if (e.target === aiModal) aiModal.classList.add("hidden");
  });

  aiSendBtn.addEventListener("click", sendAiQuery);
  aiQuestionInput.addEventListener("keydown", function (e) {
    if (e.key === "Enter") sendAiQuery();
  });

  function sendAiQuery() {
    var question = aiQuestionInput.value.trim();
    if (!question) return;
    var apiKey = "";
    try { apiKey = localStorage.getItem("md-gemini-key") || ""; } catch (e) {}
    if (!apiKey) {
      aiResponse.textContent = "No API key set. Click the gear icon to add your free Gemini API key.";
      aiResponse.className = "ai-response error";
      aiResponse.classList.remove("hidden");
      return;
    }
    aiResponse.textContent = "Thinking...";
    aiResponse.className = "ai-response loading";
    aiResponse.classList.remove("hidden");
    aiSendBtn.disabled = true;

    var prompt = "You are a helpful assistant. The user has selected the following text from a Markdown document:\n\n---\n" +
      selectedText + "\n---\n\nThe user's question: " + question +
      "\n\nAnswer concisely and helpfully.";

    var url = "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=" + apiKey;
    fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
      })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      aiSendBtn.disabled = false;
      if (data.error) {
        aiResponse.textContent = "Error: " + data.error.message;
        aiResponse.className = "ai-response error";
      } else if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        aiResponse.textContent = data.candidates[0].content.parts[0].text;
        aiResponse.className = "ai-response";
      } else {
        aiResponse.textContent = "No response from API.";
        aiResponse.className = "ai-response error";
      }
      aiResponse.classList.remove("hidden");
    })
    .catch(function (err) {
      aiSendBtn.disabled = false;
      aiResponse.textContent = "Request failed: " + err.message;
      aiResponse.className = "ai-response error";
      aiResponse.classList.remove("hidden");
    });
  }

  // ===== Settings =====
  settingsBtn.addEventListener("click", function () {
    try { apiKeyInput.value = localStorage.getItem("md-gemini-key") || ""; } catch (e) {}
    settingsSavedMsg.classList.add("hidden");
    settingsModal.classList.remove("hidden");
  });
  settingsModalClose.addEventListener("click", function () {
    settingsModal.classList.add("hidden");
  });
  settingsModal.addEventListener("click", function (e) {
    if (e.target === settingsModal) settingsModal.classList.add("hidden");
  });
  saveApiKeyBtn.addEventListener("click", function () {
    var key = apiKeyInput.value.trim();
    try { localStorage.setItem("md-gemini-key", key); } catch (e) {}
    settingsSavedMsg.classList.remove("hidden");
    setTimeout(function () { settingsSavedMsg.classList.add("hidden"); }, 2000);
  });

  addTabBtn.addEventListener("click", function () { fileInput2.click(); });
  fileInput2.addEventListener("change", function () { handleFile(this.files[0]); this.value = ""; });

  // ===== Init =====
  var savedTheme = "default";
  try { savedTheme = localStorage.getItem("md-reader-theme") || "default"; } catch (e) {}
  setTheme(savedTheme);
  loadState();
  renderTabs();
  if (activeFileId && getActiveFile()) { showViewer(); } else { showUpload(); }
})();
