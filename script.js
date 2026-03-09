// ===== DATOS DE ANIMALES =====
const animals = [
  { name: "סוּס",          file: "Caballo.png",     emoji: "🐴", audio: "Caballo.mp3"     },
  { name: "שָׁפָן",        file: "Conejo.png",      emoji: "🐰", audio: "Conejo.mp3"      },
  { name: "פִּיל",         file: "Elefante.png",    emoji: "🐘", audio: "Elefante.mp3"    },
  { name: "חָתוּל",        file: "Gato.png",        emoji: "🐱", audio: "Gato.mp3"        },
  { name: "הִיפּוֹפּוֹטָם", file: "Hipopotamo.png",  emoji: "🦛", audio: "Hipopotamo.mp3"  },
  { name: "גִ'ירַף",      file: "Jirafa.png",      emoji: "🦒", audio: "Jirafa.mp3"      },
  { name: "אַרְיֵה",       file: "Leon.png",        emoji: "🦁", audio: "Leon.mp3"        },
  { name: "קוֹף",          file: "Mono.png",        emoji: "🐒", audio: "Mono.mp3"        },
  { name: "צִפּוֹר",       file: "Pajaro.png",      emoji: "🐦", audio: "Pajaro.mp3"      },
  { name: "דֹּב",          file: "Panda.png",       emoji: "🐼", audio: "Panda.mp3"       },
  { name: "כֶּלֶב",        file: "Perro.png",       emoji: "🐶", audio: "Perro.mp3"       },
  { name: "דָּג",          file: "Pez.png",         emoji: "🐟", audio: "Pez.mp3"         },
  { name: "פָּרָה",         file: "Vaca.png",        emoji: "🐄", audio: "Vaca.mp3"        },
  { name: "זֶבְרָה",       file: "Zebra.png",       emoji: "🦓", audio: "Zebra.mp3"       },
];

// ===== ESTADO =====
let currentIndex  = 0;
let revealedCount = 0;
const revealedSet = new Set();

// ===== REFERENCIAS DOM =====
const track          = document.getElementById("carouselTrack");
const prevBtn        = document.getElementById("prevBtn");
const nextBtn        = document.getElementById("nextBtn");
const dotsContainer  = document.getElementById("dotsContainer");
const scoreText      = document.getElementById("score-text");
const confettiCont   = document.getElementById("confettiContainer");
const resetBtn       = document.getElementById("resetBtn");

// ===== AUDIO =====
let currentAudio  = null;
let audioCtx      = null;
let gainNode      = null;
let audioUnlocked = false;

function getAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    gainNode = audioCtx.createGain();
    gainNode.gain.value = 1.5;
    gainNode.connect(audioCtx.destination);
  }
  return audioCtx;
}

function playAudio(src) {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  const ctx = getAudioContext();
  const doPlay = () => {
    currentAudio = new Audio(src);
    currentAudio.crossOrigin = "anonymous";
    const source = ctx.createMediaElementSource(currentAudio);
    source.connect(gainNode);
    currentAudio.play().catch(() => {});
  };
  ctx.state === 'suspended' ? ctx.resume().then(doPlay) : doPlay();
}

// ===== CONSTRUCCIÓN DEL CARRUSEL =====
function buildCarousel() {
  track.innerHTML       = "";
  dotsContainer.innerHTML = "";

  animals.forEach((animal, i) => {
    // --- Tarjeta ---
    const card = document.createElement("div");
    card.classList.add("animal-card");
    card.dataset.index = i;
    if (revealedSet.has(i)) card.classList.add("revealed");

    // Wrapper de imagen
    const imgWrap = document.createElement("div");
    imgWrap.classList.add("img-wrapper");

    const img = document.createElement("img");
    img.classList.add("animal-img");
    img.src = `images/${animal.file}`;
    img.alt = animal.name;
    img.draggable = false;

    // Overlay de pista
    const overlay = document.createElement("div");
    overlay.classList.add("hint-overlay");

    const icon = document.createElement("span");
    icon.classList.add("hint-icon");
    icon.textContent = "👆";

    overlay.appendChild(icon);

    // Estrella burst
    const star = document.createElement("span");
    star.classList.add("star-burst");
    star.textContent = "✨";

    imgWrap.appendChild(img);
    imgWrap.appendChild(overlay);
    imgWrap.appendChild(star);

    // Nombre del animal
    const nameEl = document.createElement("p");
    nameEl.classList.add("animal-name");
    nameEl.textContent = animal.name;

    card.appendChild(imgWrap);
    card.appendChild(nameEl);

    // --- Evento clic ---
    card.addEventListener("click", () => revealAnimal(i, card));

    track.appendChild(card);

    // --- Punto de navegación ---
    const dot = document.createElement("div");
    dot.classList.add("dot");
    if (revealedSet.has(i)) dot.classList.add("done");
    if (i === currentIndex)  dot.classList.add("active");
    dot.dataset.index = i;
    dot.addEventListener("click", () => goTo(i));
    dotsContainer.appendChild(dot);
  });

  updateCarousel();
  updateScore();
}

// ===== REVELAR ANIMAL =====
function revealAnimal(index, card) {
  if (revealedSet.has(index)) return; // ya revelado

  revealedSet.add(index);
  revealedCount++;
  card.classList.add("revealed");

  playAudio(`audios/${animals[index].audio}`);

  // Actualizar punto
  const dots = dotsContainer.querySelectorAll(".dot");
  dots[index].classList.add("done");

  updateScore();

  if (revealedCount === animals.length) {
    launchConfetti();
  }
}

// ===== ACTUALIZAR POSICIÓN =====
function updateCarousel() {
  track.style.transform = `translateX(-${currentIndex * 100}%)`;

  prevBtn.disabled = currentIndex === 0;
  nextBtn.disabled = currentIndex === animals.length - 1;

  // Puntos activos
  const dots = dotsContainer.querySelectorAll(".dot");
  dots.forEach((d, i) => d.classList.toggle("active", i === currentIndex));
}

// ===== NAVEGACIÓN =====
function goTo(index) {
  currentIndex = Math.max(0, Math.min(index, animals.length - 1));
  updateCarousel();
  if (audioUnlocked && !revealedSet.has(currentIndex)) {
    playAudio("audios/Inicio.mp3");
  }
}

prevBtn.addEventListener("click", () => goTo(currentIndex - 1));
nextBtn.addEventListener("click", () => goTo(currentIndex + 1));

// Teclado
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") goTo(currentIndex + 1);
  if (e.key === "ArrowLeft")  goTo(currentIndex - 1);
  if (e.key === "Enter" || e.key === " ") {
    const activeCard = track.querySelector(`.animal-card[data-index="${currentIndex}"]`);
    if (activeCard) activeCard.click();
  }
});

// Swipe táctil
let touchStartX = 0;
track.addEventListener("touchstart", (e) => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });

track.addEventListener("touchend", (e) => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) {
    diff > 0 ? goTo(currentIndex + 1) : goTo(currentIndex - 1);
  }
}, { passive: true });

// ===== SCORE / PROGRESO =====
function updateScore() {
  scoreText.textContent = `${revealedCount} / ${animals.length}`;
  const pct = (revealedCount / animals.length) * 100;
}

// ===== CONFETTI =====
const COLORS = ["#f7971e","#ffd200","#ff6b6b","#4ecdc4","#a8edea","#c471ed","#f64f59","#43e97b"];

function launchConfetti() {
  confettiCont.innerHTML = "";
  for (let i = 0; i < 100; i++) {
    const piece = document.createElement("div");
    piece.classList.add("confetti-piece");

    const size  = Math.random() * 10 + 6;
    const color = COLORS[Math.floor(Math.random() * COLORS.length)];
    const left  = Math.random() * 100;
    const delay = Math.random() * 1.5;
    const dur   = Math.random() * 2 + 2;

    piece.style.cssText = `
      left: ${left}%;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      animation-duration: ${dur}s;
      animation-delay: ${delay}s;
      border-radius: ${Math.random() > 0.5 ? "50%" : "2px"};
    `;

    confettiCont.appendChild(piece);
  }

  // Limpiar tras la animación
  setTimeout(() => { confettiCont.innerHTML = ""; }, 5000);
}

// ===== REINICIAR =====
resetBtn.addEventListener("click", () => {
  revealedSet.clear();
  revealedCount = 0;
  currentIndex  = 0;
  confettiCont.innerHTML = "";
  buildCarousel();
  playAudio("audios/Inicio.mp3");
});

// ===== INICIAR =====
buildCarousel();

// Primer gesto del usuario: desbloquear AudioContext y tocar Inicio
// Se usa setTimeout para que revealAnimal (si fue clic en tarjeta) corra primero
function onFirstInteraction() {
  if (audioUnlocked) return;
  audioUnlocked = true;
  document.removeEventListener("click",      onFirstInteraction);
  document.removeEventListener("keydown",    onFirstInteraction);
  document.removeEventListener("touchstart", onFirstInteraction);

  const ctx = getAudioContext();
  const afterResume = () => {
    setTimeout(() => {
      // Si el animal ya fue revelado en este mismo clic, no tocar intro
      if (!revealedSet.has(currentIndex)) {
        playAudio("audios/Inicio.mp3");
      }
    }, 50);
  };
  ctx.state === 'suspended' ? ctx.resume().then(afterResume) : afterResume();
}
document.addEventListener("click",      onFirstInteraction);
document.addEventListener("keydown",    onFirstInteraction);
document.addEventListener("touchstart", onFirstInteraction);
