/* ==========================================================
   მთავარი კონფიგურაცია — აქ ცვლი მხოლოდ მონაცემებს
   ========================================================== */
const CONFIG = {
  // TODO: აუცილებლად ჩაწერე ქორწილის რეალური თარიღი და დრო.
  // ფორმატი: YYYY-MM-DDTHH:MM:SS+04:00 (თბილისის დრო)
  weddingDate: "2026-10-17T15:30:00+04:00",

  // ადგილობრივი აუდიოს ხმა 0.0-1.0
  musicVolume: 0.58,

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
   4) რეკლამის გარეშე ადგილობრივი background music
   ატვირთე repository-ის root-ში მუსიკა.mp3 ან მუსიკა.m4a.
   შენიშვნა: iOS Safari/Chrome შეიძლება პირველივე გახსნაზე ხმიან autoplay-ს ბლოკავდეს.
   ასეთ შემთხვევაში პირველი შეხებისთანავე კოდი ხელახლა ცდის.
   ========================================================== */
const backgroundMusic = document.getElementById("backgroundMusic");
const musicToggle = document.getElementById("musicToggle");
let musicEnabled = true;

function updateMusicToggleUI() {
  musicToggle.classList.toggle("is-on", musicEnabled);
  musicToggle.setAttribute("aria-pressed", String(musicEnabled));
  musicToggle.setAttribute("aria-label", musicEnabled ? "მუსიკის გამორთვა" : "მუსიკის ჩართვა");
}

async function startMusicIfPossible() {
  if (!backgroundMusic || !musicEnabled) return;
  backgroundMusic.volume = CONFIG.musicVolume;
  try {
    await backgroundMusic.play();
  } catch (_) {
    // ბრაუზერმა ხმიანი autoplay დაბლოკა; პირველ interaction-ზე კვლავ ვცდით.
  }
}

window.addEventListener("load", startMusicIfPossible, { once: true });

musicToggle.addEventListener("click", async () => {
  musicEnabled = !musicEnabled;
  updateMusicToggleUI();

  if (!backgroundMusic) return;
  if (musicEnabled) {
    await startMusicIfPossible();
  } else {
    backgroundMusic.pause();
  }
});

["pointerdown", "touchstart", "keydown"].forEach((eventName) => {
  window.addEventListener(eventName, startMusicIfPossible, { once: true, passive: true });
});

updateMusicToggleUI();

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
