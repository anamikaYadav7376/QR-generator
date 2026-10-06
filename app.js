document.addEventListener("DOMContentLoaded", () => {
  let qrInstance = null;
  let historyList = JSON.parse(localStorage.getItem("qr_history") || "[]");

  // DOM elements
  const urlInput = document.getElementById("urlInput");
  const quickHttpsBtn = document.getElementById("quickHttpsBtn");
  const fgColor = document.getElementById("fgColor");
  const fgColorVal = document.getElementById("fgColorVal");
  const bgColor = document.getElementById("bgColor");
  const bgColorVal = document.getElementById("bgColorVal");
  const correctLevel = document.getElementById("correctLevel");
  const sizeSlider = document.getElementById("sizeSlider");
  const sizeValue = document.getElementById("sizeValue");
  const qrContainer = document.getElementById("qrContainer");
  const downloadBtn = document.getElementById("downloadBtn");
  const copyUrlBtn = document.getElementById("copyUrlBtn");
  const toastMessage = document.getElementById("toastMessage");
  const historyContainer = document.getElementById("historyContainer");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const sunIcon = document.getElementById("sunIcon");
  const moonIcon = document.getElementById("moonIcon");

  // Map correction levels to QRCodeJS constants
  const levelMap = {
    L: QRCode.CorrectLevel.L,
    M: QRCode.CorrectLevel.M,
    Q: QRCode.CorrectLevel.Q,
    H: QRCode.CorrectLevel.H,
  };

  // Generate QR Code function
  function generateQRCode() {
    const text = urlInput.value.trim() || "https://google.com";
    const size = parseInt(sizeSlider.value, 10);
    const colorDark = fgColor.value;
    const colorLight = bgColor.value;
    const level = levelMap[correctLevel.value] || QRCode.CorrectLevel.M;

    // Clear previous QR element
    qrContainer.innerHTML = "";

    // Render new QR Code
    qrInstance = new QRCode(qrContainer, {
      text: text,
      width: size,
      height: size,
      colorDark: colorDark,
      colorLight: colorLight,
      correctLevel: level,
    });

    saveToHistory(text);
  }

  // Save item to recent history
  function saveToHistory(url) {
    if (!url) return;
    historyList = historyList.filter((item) => item !== url);
    historyList.unshift(url);
    if (historyList.length > 5) historyList.pop();

    localStorage.setItem("qr_history", JSON.stringify(historyList));
    renderHistory();
  }

  // Render history chips
  function renderHistory() {
    if (historyList.length === 0) {
      historyContainer.innerHTML = '<p class="empty-history">No recent QR codes generated yet.</p>';
      return;
    }

    historyContainer.innerHTML = "";
    historyList.forEach((url) => {
      const chip = document.createElement("span");
      chip.className = "history-item";
      chip.textContent = url;
      chip.addEventListener("click", () => {
        urlInput.value = url;
        generateQRCode();
      });
      historyContainer.appendChild(chip);
    });
  }

  // Download QR Code image
  downloadBtn.addEventListener("click", () => {
    const img = qrContainer.querySelector("img");
    const canvas = qrContainer.querySelector("canvas");

    let imageSrc = "";
    if (img && img.src) {
      imageSrc = img.src;
    } else if (canvas) {
      imageSrc = canvas.toDataURL("image/png");
    }

    if (!imageSrc) return;

    const link = document.createElement("a");
    link.href = imageSrc;
    link.download = "qrcode.png";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });

  // Copy text URL to clipboard
  copyUrlBtn.addEventListener("click", () => {
    navigator.clipboard.writeText(urlInput.value).then(() => {
      toastMessage.classList.remove("hidden");
      setTimeout(() => {
        toastMessage.classList.add("hidden");
      }, 2000);
    });
  });

  // Quick prepending "https://"
  quickHttpsBtn.addEventListener("click", () => {
    if (!urlInput.value.startsWith("http://") && !urlInput.value.startsWith("https://")) {
      urlInput.value = "https://" + urlInput.value;
      generateQRCode();
    }
  });

  // Event Listeners for live updates
  urlInput.addEventListener("input", generateQRCode);
  
  fgColor.addEventListener("input", (e) => {
    fgColorVal.textContent = e.target.value;
    generateQRCode();
  });

  bgColor.addEventListener("input", (e) => {
    bgColorVal.textContent = e.target.value;
    generateQRCode();
  });

  sizeSlider.addEventListener("input", (e) => {
    sizeValue.textContent = `${e.target.value}px`;
    generateQRCode();
  });

  correctLevel.addEventListener("change", generateQRCode);

  // Theme toggle
  themeToggleBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark-mode");
    const isDark = document.body.classList.contains("dark-mode");
    sunIcon.classList.toggle("hidden", isDark);
    moonIcon.classList.toggle("hidden", !isDark);
  });

  // Initial setup
  renderHistory();
  generateQRCode();
});