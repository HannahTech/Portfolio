const canvas = document.getElementById("holo-canvas");
const ctx = canvas.getContext("2d");

let width = 0;
let height = 0;
let deviceRatio = window.devicePixelRatio || 1;

const particles = [];
const maxParticles = 80;
const mouse = {
  x: 0,
  y: 0,
  active: false,
  lastMove: Date.now(),
};

const palette = ["#E9DBBD", "#CBB682", "#A08C5B", "#785F37", "#181510"];

function hexToRgba(hex, alpha) {
  const value = hex.replace("#", "");
  const r = parseInt(value.slice(0, 2), 16);
  const g = parseInt(value.slice(2, 4), 16);
  const b = parseInt(value.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function resizeCanvas() {
  width = window.innerWidth;
  height = window.innerHeight;
  deviceRatio = window.devicePixelRatio || 1;
  canvas.width = width * deviceRatio;
  canvas.height = height * deviceRatio;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(deviceRatio, 0, 0, deviceRatio, 0, 0);
}

class Particle {
  constructor(x, y) {
    const color = palette[Math.floor(Math.random() * palette.length)];
    this.x = x;
    this.y = y;
    this.baseX = x;
    this.baseY = y;
    this.radius = 1.75 + Math.random() * 1.6;
    this.alpha = 0.9;
    this.life = 0;
    this.maxLife = 220 + Math.random() * 80;
    this.vx = (Math.random() - 0.5) * 0.8;
    this.vy = (Math.random() - 0.5) * 0.8;
    this.floatOffset = Math.random() * Math.PI * 2;
    this.color = color;
  }

  update(idle) {
    this.life += 1;
    if (idle) {
      const float = Math.sin(this.life * 0.02 + this.floatOffset) * 0.6;
      this.x += this.vx * 0.2;
      this.y += this.vy * 0.2 + float * 0.08;
    } else {
      this.x += this.vx;
      this.y += this.vy;
    }
    this.alpha = Math.max(0, 1 - this.life / this.maxLife);
  }

  draw() {
    const color = hexToRgba(this.color, Math.min(1, this.alpha * 1.575));
    ctx.beginPath();
    ctx.fillStyle = color;
    ctx.shadowBlur = 24;
    ctx.shadowColor = color;
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function spawnParticles() {
  if (!mouse.active) return;
  const count = 2;
  for (let i = 0; i < count; i += 1) {
    const angle = Math.random() * Math.PI * 2;
    const spread = 54 + Math.random() * 66;
    const px = mouse.x + Math.cos(angle) * spread;
    const py = mouse.y + Math.sin(angle) * spread;
    particles.unshift(new Particle(px, py));
  }
  if (particles.length > maxParticles) {
    particles.splice(maxParticles);
  }
}

function animate() {
  ctx.clearRect(0, 0, width, height);
  const idle = Date.now() - mouse.lastMove > 220;

  particles.forEach((particle) => {
    particle.update(idle);
    particle.draw();
  });

  for (let i = particles.length - 1; i >= 0; i -= 1) {
    if (particles[i].alpha <= 0) {
      particles.splice(i, 1);
    }
  }

  spawnParticles();
  requestAnimationFrame(animate);
}

function handleMove(event) {
  const point = event.touches ? event.touches[0] : event;
  mouse.x = point.clientX;
  mouse.y = point.clientY;
  mouse.active = true;
  mouse.lastMove = Date.now();
}

function handleLeave() {
  mouse.active = false;
}

resizeCanvas();
animate();

window.addEventListener("resize", resizeCanvas);
window.addEventListener("mousemove", handleMove);
window.addEventListener("touchmove", handleMove, { passive: true });
window.addEventListener("mouseleave", handleLeave);
window.addEventListener("touchend", handleLeave);

const modal = document.querySelector(".project-modal");
const modalImage = document.querySelector(".project-modal__image");
const modalTitle = document.querySelector(".project-modal__title");
const modalDesc = document.querySelector(".project-modal__desc");
const modalLink = document.querySelector(".project-modal__link");
const modalCore = document.querySelector(".project-modal__core");

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
}

function openModal(target) {
  if (!modal) return;
  modalImage.src =
    target.dataset.full ||
    target.src.replace(/-p(\.(png|jpg|jpeg|webp|gif))$/i, "$1");
  modalImage.alt = target.alt || "Project image";
  modalTitle.textContent = target.dataset.title || "Project";
  modalDesc.textContent = target.dataset.desc || "";
  modalLink.href = target.dataset.link || "#";
  if (modalCore) {
    const coreText = target.dataset.core || "";
    modalCore.innerHTML = coreText
      ? `<span class="project-modal__core-label">Core:</span> ${coreText}`
      : "";
  }
  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
}

if (modal) {
  document.querySelectorAll(".projects-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => openModal(thumb));
  });

  modal.addEventListener("click", (event) => {
    if (
      event.target.classList.contains("project-modal__overlay") ||
      event.target.classList.contains("project-modal__close")
    ) {
      closeModal();
    }
  });

  window.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeModal();
  });
}
