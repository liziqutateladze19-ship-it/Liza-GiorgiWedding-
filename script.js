/* ==========================================================
   მთავარი კონფიგურაცია — აქ ცვლი მხოლოდ მონაცემებს
   ========================================================== */
const CONFIG = {
  // TODO: აუცილებლად ჩაწერე ქორწილის რეალური თარიღი და დრო.
  // ფორმატი: YYYY-MM-DDTHH:MM:SS+04:00 (თბილისის დრო)
  weddingDate: "2026-10-17T15:30:00+04:00",

  // YouTube background music
  youtubeVideoId: "HQNJTmyPdnw",
  musicVolume: 58,

  // RSVP რეალურად რომ ჩაიწეროს ცენტრალურად, აქ ჩასვი შენი API / Google Apps Script URL.
  // ცარიელი მნიშვნელობის დროს ფორმა demo რეჟიმში localStorage-ში ინახება.
  rsvpEndpoint: ""
};

/* ==========================================================
   2) მთავარი ვიდეო — autoplay + loop + playsinline
   muted საჭიროა, რომ მობილურ ბრაუზერებში autoplay მაქსიმალურად საიმედო იყოს.
   ვიდეო მუსიკისგან დამოუკიდებლად მუდმივად აგრძელებს დაკვრას, scroll-ის დროსაც.
   ========================================================== */
const heroVideo = document.getElementById("heroVideo");

function ensureHeroVideoIsPlaying() {
  if (!heroVideo) return;
  heroVideo.muted = true;
  heroVideo.loop = true;
  heroVideo.playsInline = true;

  const playPromise = heroVideo.play();
  if (playPromise && typeof playPromise.catch === "function") {
    playPromise.catch(() => {
      // ბრაუზერი თუ დროებით დაბლოკავს, პირველ interaction-ზე კიდევ ერთხელ ვცდით.
    });
  }
}

window.addEventListener("load", ensureHeroVideoIsPlaying, { once: true });
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) ensureHeroVideoIsPlaying();
});

/* ==========================================================
   3) Countdown
   ========================================================== */
const countdownEls = {
  days: document.getElementById("days"),
  hours: document.getElementById("hours"),
  minutes: document.getElementById("minutes"),
  seconds: document.getElementById("seconds")
};

function pad(value) {
  return String(value).padStart(2, "0");
}

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

/* ==========================================================
   4) YouTube background music
   ვიდეო: https://www.youtube.com/watch?v=HQNJTmyPdnw

   გვერდის ჩატვირთვისთანავე ვცდილობთ ხმიან autoplay-ს.
   მნიშვნელოვანი: Safari/Chrome-ს შეუძლია ხმიანი autoplay დაბლოკოს მომხმარებლის
   პირველ შეხებამდე. ასეთ შემთხვევაში პირველივე touch/click/scroll gesture-ზე
   ავტომატურად ვუშვებთ მუსიკას დამატებითი Play ღილაკის გარეშე.
   ========================================================== */
const musicToggle = document.getElementById("musicToggle");
let musicEnabled = true;
let youtubePlayer = null;
let youtubeReady = false;
let youtubeApiRequested = false;

function updateMusicToggleUI() {
  if (!musicToggle) return;
  musicToggle.classList.toggle("is-on", musicEnabled);
  musicToggle.setAttribute("aria-pressed", String(musicEnabled));
  musicToggle.setAttribute("aria-label", musicEnabled ? "მუსიკის გამორთვა" : "მუსიკის ჩართვა");
}

function startYouTubeMusic() {
  if (!musicEnabled || !youtubeReady || !youtubePlayer) return;

  try {
    youtubePlayer.setVolume(CONFIG.musicVolume);
    youtubePlayer.unMute();
    youtubePlayer.playVideo();
  } catch (_) {
    // API შეიძლება ჯერ ბოლომდე მზად არ იყოს — შემდეგ event-ზე კიდევ ვცდით.
  }
}

function pauseYouTubeMusic() {
  if (!youtubeReady || !youtubePlayer) return;
  try {
    youtubePlayer.pauseVideo();
  } catch (_) {}
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
      rel: 0
    },
    events: {
      onReady: (event) => {
        youtubeReady = true;
        try {
          event.target.setVolume(CONFIG.musicVolume);
          event.target.unMute();
          event.target.playVideo();
        } catch (_) {}

        // რამდენიმე დამატებითი მცდელობა initial load-ზე.
        setTimeout(startYouTubeMusic, 250);
        setTimeout(startYouTubeMusic, 900);
        setTimeout(startYouTubeMusic, 1800);
      },
      onStateChange: (event) => {
        // ვიდეოს დასრულების შემთხვევაში თავიდან იწყება.
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

// რაც შეიძლება ადრე ვითხოვთ YouTube player-ს.
document.addEventListener("DOMContentLoaded", loadYouTubeApi, { once: true });
window.addEventListener("load", () => {
  loadYouTubeApi();
  startYouTubeMusic();
}, { once: true });
window.addEventListener("pageshow", startYouTubeMusic);
window.addEventListener("focus", startYouTubeMusic);

document.addEventListener("visibilitychange", () => {
  if (!document.hidden) startYouTubeMusic();
});

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

// Initial autoplay თუ browser-მა დაბლოკა, პირველი gesture-ზე ავტომატურად ჩაირთვება.
["pointerdown", "touchstart", "mousedown", "keydown", "wheel"].forEach((eventName) => {
  window.addEventListener(eventName, () => {
    loadYouTubeApi();
    startYouTubeMusic();
  }, { capture: true, passive: true });
});

updateMusicToggleUI();

/* ==========================================================
   4.1) ელემენტი 2 — სახელის/extension-ის fallback-ები
   GitHub case-sensitive-ია და ერთი ზედმეტი space-იც კი სხვა ფაილია.
   ამიტომ ვცდით ყველა სავარაუდო ვარიანტს ავტომატურად.
   ========================================================== */
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
    probe.src = `${candidate}?asset-v=4`;
  };

  tryNext();
}

document.querySelectorAll("img.smart-asset[data-asset]").forEach(resolveSmartAsset);

/* ==========================================================
   5) Scroll reveal — მსუბუქი, ელეგანტური გამოჩენა
   ========================================================== */
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

document.querySelectorAll(".reveal").forEach((el) => revealObserver.observe(el));

/* ==========================================================
   6) RSVP
   - თუ CONFIG.rsvpEndpoint გაქვს შევსებული => POST იგზავნება endpoint-ზე.
   - თუ ცარიელია => demo რეჟიმი localStorage-ში ინახავს.
   ========================================================== */
const rsvpForm = document.getElementById("rsvpForm");
const formError = document.getElementById("formError");
const successMessage = document.getElementById("successMessage");
const submitButton = document.getElementById("submitButton");

function getRsvpPayload() {
  const formData = new FormData(rsvpForm);
  return {
    fullName: String(formData.get("fullName") || "").trim(),
    attendance: String(formData.get("attendance") || "").trim(),
    submittedAt: new Date().toISOString(),
    source: window.location.href
  };
}

function validateRsvp(payload) {
  if (!payload.fullName) return "გთხოვთ, ჩაწერეთ სახელი და გვარი.";
  if (!payload.attendance) return "გთხოვთ, აირჩიოთ დასწრების პასუხი.";
  return "";
}

rsvpForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  formError.textContent = "";
  successMessage.hidden = true;

  const payload = getRsvpPayload();
  const validationError = validateRsvp(payload);

  if (validationError) {
    formError.textContent = validationError;
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = "იგზავნება...";

  try {
    if (CONFIG.rsvpEndpoint) {
      const response = await fetch(CONFIG.rsvpEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`RSVP request failed: ${response.status}`);
      }
    } else {
      // Demo fallback — მხოლოდ ამ მოწყობილობაზე ინახება.
      const previous = JSON.parse(localStorage.getItem("wedding-rsvp") || "[]");
      previous.push(payload);
      localStorage.setItem("wedding-rsvp", JSON.stringify(previous));
    }

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
