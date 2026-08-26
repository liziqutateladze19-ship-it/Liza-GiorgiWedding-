const CONFIG = {
  weddingDate: "2026-10-17T15:30:00+04:00",
  youtubeVideoId: "HQNJTmyPdnw",
  musicVolume: 58
};

const heroVideo = document.getElementById("heroVideo");
const musicToggle = document.getElementById("musicToggle");
let musicEnabled = true;
let youtubeApiRequested = false;
let youtubePlayer = null;
let youtubeReady = false;

function ensureHeroVideoIsPlaying() {
  if (!heroVideo) return;
  heroVideo.muted = true;
  heroVideo.loop = true;
  heroVideo.playsInline = true;
  const p = heroVideo.play();
  if (p && typeof p.catch === "function") p.catch(() => {});
}

function loadInitialMediaFast() {
  ensureHeroVideoIsPlaying();
  loadYouTubeApi();
  startYouTubeMusic();
}

window.addEventListener("DOMContentLoaded", loadInitialMediaFast, { once: true });
window.addEventListener("load", loadInitialMediaFast, { once: true });
window.addEventListener("pageshow", loadInitialMediaFast);
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) loadInitialMediaFast();
});

const countdownEls = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds")
};

function pad(value) { return String(value).padStart(2, "0"); }

function updateCountdown() {
  const target = new Date(CONFIG.weddingDate).getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  countdownEls.days.textContent = pad(days);
  countdownEls.hours.textContent = pad(hours);
  countdownEls.minutes.textContent = pad(minutes);
  countdownEls.seconds.textContent = pad(seconds);
}
updateCountdown();
setInterval(updateCountdown, 1000);

function updateMusicToggleUI() {
  if (!musicToggle) return;
  musicToggle.classList.toggle("is-on", musicEnabled);
  musicToggle.setAttribute("aria-pressed", String(musicEnabled));
  musicToggle.setAttribute("aria-label", musicEnabled ? "მუსიკის გამორთვა" : "მუსიკის ჩართვა");
  musicToggle.title = musicEnabled ? "მუსიკის გამორთვა" : "მუსიკის ჩართვა";
}

function startYouTubeMusic() {
  if (!musicEnabled || !youtubeReady || !youtubePlayer) return;
  try {
    youtubePlayer.setVolume(CONFIG.musicVolume);
    youtubePlayer.unMute();
    youtubePlayer.playVideo();
  } catch (_) {}
}

function pauseYouTubeMusic() {
  if (!youtubePlayer) return;
  try { youtubePlayer.pauseVideo(); } catch (_) {}
}

function createYouTubePlayer() {
  if (!window.YT || !window.YT.Player || youtubePlayer) return;
  youtubePlayer = new YT.Player("youtubeMusicPlayer", {
    width: "200",
    height: "200",
    videoId: CONFIG.youtubeVideoId,
    playerVars: {
      autoplay: 1,
      controls: 0,
      disablekb: 1,
      fs: 0,
      loop: 1,
      playlist: CONFIG.youtubeVideoId,
      playsinline: 1,
      rel: 0,
      modestbranding: 1
    },
    events: {
      onReady: (event) => {
        youtubeReady = true;
        try {
          event.target.setVolume(CONFIG.musicVolume);
          event.target.unMute();
          event.target.playVideo();
        } catch (_) {}
        setTimeout(startYouTubeMusic, 50);
        setTimeout(startYouTubeMusic, 300);
        setTimeout(startYouTubeMusic, 800);
        setTimeout(startYouTubeMusic, 1500);
      },
      onStateChange: (event) => {
        if (event.data === 0 && musicEnabled) {
          try {
            youtubePlayer.seekTo(0, true);
            youtubePlayer.playVideo();
          } catch (_) {}
        }
      }
    }
  });
}
window.onYouTubeIframeAPIReady = createYouTubePlayer;

function loadYouTubeApi() {
  if (youtubeApiRequested) return;
  youtubeApiRequested = true;
  if (window.YT && window.YT.Player) {
    createYouTubePlayer();
    return;
  }
  const tag = document.createElement("script");
  tag.src = "https://www.youtube.com/iframe_api";
  tag.async = true;
  document.head.appendChild(tag);
}

musicToggle?.addEventListener("click", (event) => {
  event.stopPropagation();
  musicEnabled = !musicEnabled;
  updateMusicToggleUI();
  if (musicEnabled) {
    loadYouTubeApi();
    startYouTubeMusic();
  } else {
    pauseYouTubeMusic();
  }
});

["pointerdown", "touchstart", "mousedown", "keydown", "wheel", "scroll"].forEach((eventName) => {
  window.addEventListener(eventName, () => {
    ensureHeroVideoIsPlaying();
    loadYouTubeApi();
    startYouTubeMusic();
  }, { capture: true, passive: true });
});
updateMusicToggleUI();

const SMART_ASSETS = {
  element2: [
    "./ელემენტი 2.GIF",
    "./ელემენტი 2.gif",
    "./ელემენტი 2 .GIF",
    "./ელემენტი 2 .gif",
    "./ელემენტი 2 GIF.GIF",
    "./ელემენტი 2 GIF.gif",
    "./ელემენტი 2.png",
    "./ელემენტი 2.PNG",
    "./ელემენტი 2.webp",
    "./ელემენტი 2.WEBP"
  ]
};

function resolveSmartAsset(img) {
  const key = img.dataset.asset;
  const candidates = SMART_ASSETS[key] || [];
  if (!candidates.length) return;
  img.classList.add("is-loading");
  let index = 0;
  const tryNext = () => {
    if (index >= candidates.length) {
      img.dataset.missing = "true";
      img.classList.remove("is-loading");
      return;
    }
    const candidate = candidates[index++];
    const probe = new Image();
    probe.onload = () => {
      img.src = candidate;
      img.classList.remove("is-loading");
      img.classList.add("is-ready");
      delete img.dataset.missing;
    };
    probe.onerror = tryNext;
    probe.src = `${candidate}?asset-v=6`;
  };
  tryNext();
}
document.querySelectorAll("img.smart-asset[data-asset]").forEach(resolveSmartAsset);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("is-visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

const rsvpForm = document.getElementById("rsvpForm");
const formError = document.getElementById("formError");
const successMessage = document.getElementById("successMessage");
const submitButton = document.getElementById("submitButton");
const submittedAtInput = document.getElementById("submittedAt");
const rsvpSourceInput = document.getElementById("rsvpSource");

function validateRsvp() {
  const formData = new FormData(rsvpForm);
  const fullName = String(formData.get("fullName") || "").trim();
  const attendance = String(formData.get("attendance") || "").trim();
  if (!fullName) return "გთხოვთ, ჩაწერეთ სახელი და გვარი.";
  if (!attendance) return "გთხოვთ, აირჩიოთ დასწრების პასუხი.";
  return "";
}
function encodeFormData(formData) { return new URLSearchParams(formData).toString(); }

rsvpForm?.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";
  successMessage.hidden = true;

  const validationError = validateRsvp();
  if (validationError) {
    formError.textContent = validationError;
    return;
  }

  submittedAtInput.value = new Date().toISOString();
  rsvpSourceInput.value = window.location.href;
  submitButton.disabled = true;
  submitButton.textContent = "იგზავნება...";

  try {
    const formData = new FormData(rsvpForm);
    const response = await fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: encodeFormData(formData)
    });
    if (!response.ok) throw new Error(`Netlify form request failed: ${response.status}`);
    rsvpForm.reset();
    successMessage.hidden = false;
  } catch (error) {
    console.error(error);
    formError.textContent = "პასუხის გაგზავნა ვერ მოხერხდა. გთხოვთ, სცადოთ თავიდან.";
  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "გაგზავნა";
  }
});
