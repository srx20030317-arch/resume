/* ============================================================
 * SRX · 个人观察站 交互脚本 V2
 * 功能：启动门入场、星空动画、滚动入场、主题切换、信号收集、
 *      鼠标光晕、滚动进度、粒子浮动、卡片 tilt 等
 * ============================================================ */

const root = document.documentElement;
const themeButton = document.querySelector('.theme-button');
const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
const introGate = document.querySelector('.intro-gate');
const characterButton = document.querySelector('.character-button');
const introSkip = document.querySelector('.intro-skip');
const miniGuide = document.querySelector('.mini-guide');
const miniCharacter = document.querySelector('.mini-character');
const cursorGlow = document.querySelector('#cursor-glow');
const scrollProgress = document.querySelector('#scroll-progress');
const particlesRoot = document.querySelector('#particles');
const auroraLayer = document.querySelector('.aurora-layer');

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ============================================================
 * 1. 启动门入场
 * ============================================================ */
function enterSite() {
  if (introGate.classList.contains('opening')) return;
  introGate.classList.add('opening');
  window.setTimeout(() => {
    introGate.classList.add('entered');
    document.body.classList.add('exploring');
    document.body.style.overflow = '';
  }, 600);
}

characterButton?.addEventListener('click', enterSite);
introSkip?.addEventListener('click', enterSite);

// 预览模式：?preview 直接跳过启动门（仅用于本地调试）
if (new URLSearchParams(window.location.search).has('preview')) {
  introGate.classList.add('entered');
  document.body.classList.add('exploring');
  document.body.style.overflow = '';
}

/* ============================================================
 * 2. 主题切换（localStorage 持久化）
 *    默认主题：深色（v2 主基调）
 * ============================================================ */
const DEFAULT_THEME = 'dark';
const savedTheme = localStorage.getItem('srx-theme');
root.dataset.theme = savedTheme || DEFAULT_THEME;

themeButton?.addEventListener('click', () => {
  const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
  root.dataset.theme = nextTheme;
  localStorage.setItem('srx-theme', nextTheme);
});

/* ============================================================
 * 3. 主导航（移动端汉堡菜单）
 * ============================================================ */
menuButton?.addEventListener('click', () => {
  const isOpen = nav.classList.toggle('open');
  menuButton.setAttribute('aria-expanded', String(isOpen));
});

nav?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    nav.classList.remove('open');
    menuButton?.setAttribute('aria-expanded', 'false');
  });
});

/* ============================================================
 * 4. 迷你导航
 * ============================================================ */
miniCharacter?.addEventListener('click', () => {
  const isOpen = miniGuide.classList.toggle('active');
  miniCharacter.setAttribute('aria-expanded', String(isOpen));
});

document.querySelectorAll('.mini-menu a').forEach((link) => {
  link.addEventListener('click', () => {
    miniGuide.classList.remove('active');
    miniCharacter.setAttribute('aria-expanded', 'false');
  });
});

/* ============================================================
 * 5. 滚动入场动画（IntersectionObserver）
 * ============================================================ */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element));

/* ============================================================
 * 6. 数据快览数字滚动动画
 * ============================================================ */
const statsPanel = document.querySelector('.quick-stats');
let statsAnimated = false;
const statsObserver = new IntersectionObserver((entries) => {
  if (!entries[0].isIntersecting || statsAnimated) return;
  statsAnimated = true;
  document.querySelectorAll('[data-count]').forEach((number) => {
    const target = Number(number.dataset.count);
    const decimals = Number(number.dataset.decimals || 0);
    const originalSmall = number.querySelector('small')?.outerHTML || '';
    const fallbackSuffix = originalSmall ? '' : (number.dataset.suffix || '');
    const start = performance.now();
    const duration = prefersReducedMotion ? 1 : 1300;
    function tick(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      number.innerHTML = `${(target * eased).toFixed(decimals)}${fallbackSuffix}${originalSmall}`;
      if (progress < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  });
  statsObserver.disconnect();
}, { threshold: 0.45 });

if (statsPanel) statsObserver.observe(statsPanel);

/* ============================================================
 * 7. 信号收集系统（3 束）
 * ============================================================ */
const signalKeys = ['hello', 'contact', 'explore'];
const signalLabels = {
  hello:   ['问候信号已接收', '谢谢你的到访。'],
  contact: ['联系信号已接收', '欢迎随时通过联系方式与我建立连接。'],
  explore: ['探索信号已接收', '未来分区正在排队上线，感谢你的耐心。']
};

let savedSignals = [];
try { savedSignals = JSON.parse(sessionStorage.getItem('srx-signals') || '[]'); } catch { savedSignals = []; }
const collectedSignals = new Set(savedSignals.filter((key) => signalKeys.includes(key)));

const signalCount = document.querySelector('#signal-count');
const finalSignalCount = document.querySelector('#final-signal-count');
const finalSignalMessage = document.querySelector('#final-signal-message');
const unlockToast = document.querySelector('.unlock-toast');
let unlockTimer;

function showUnlock(key) {
  const title = unlockToast?.querySelector('b');
  const message = unlockToast?.querySelector('p');
  const copy = signalLabels[key] || ['接收到一束新信号', '继续探索 SRX 的个人主页。'];
  if (title) title.textContent = copy[0];
  if (message) message.textContent = copy[1];
  unlockToast?.classList.add('show');
  window.clearTimeout(unlockTimer);
  unlockTimer = window.setTimeout(() => unlockToast?.classList.remove('show'), 3000);
}

function renderSignals() {
  const count = collectedSignals.size;
  if (signalCount) signalCount.textContent = `${count}/${signalKeys.length}`;
  if (finalSignalCount) finalSignalCount.textContent = `${count} / ${signalKeys.length}`;

  document.querySelectorAll('[data-signal-node]').forEach((node) => {
    node.classList.toggle('active', collectedSignals.has(node.dataset.signalNode));
  });
  document.querySelectorAll('[data-final-signal]').forEach((node) => {
    node.classList.toggle('active', collectedSignals.has(node.dataset.finalSignal));
  });
  document.querySelectorAll('[data-signal]').forEach((source) => {
    source.classList.toggle('signal-collected', collectedSignals.has(source.dataset.signal));
  });

  if (finalSignalMessage) {
    finalSignalMessage.textContent = count === signalKeys.length
      ? '全部信号已点亮：问候、联系与探索，共同组成今天的 SRX。'
      : `还差 ${signalKeys.length - count} 束信号，继续探索。`;
  }
}

function collectSignal(key) {
  if (!signalKeys.includes(key) || collectedSignals.has(key)) return;
  collectedSignals.add(key);
  try { sessionStorage.setItem('srx-signals', JSON.stringify([...collectedSignals])); } catch {}
  renderSignals();
  showUnlock(key);
}

document.querySelectorAll('[data-signal]').forEach((source) => {
  source.addEventListener('click', () => collectSignal(source.dataset.signal));
});

renderSignals();

/* ============================================================
 * 8. Warp 跳转动画（章节间跳转）
 * ============================================================ */
const warpFlash = document.querySelector('.warp-flash');
document.querySelectorAll('.first-signal, .signal-dock > a').forEach((link) => {
  link.addEventListener('click', (event) => {
    const href = link.getAttribute('href');
    if (!href || !href.startsWith('#')) return;
    const target = document.querySelector(href);
    if (!target) return;
    event.preventDefault();
    warpFlash?.classList.remove('active');
    void warpFlash?.offsetWidth;
    warpFlash?.classList.add('active');
    window.setTimeout(() => target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth' }), 200);
  });
});

/* ============================================================
 * 9. 启动门 canvas 星空
 * ============================================================ */
const cosmosCanvas = document.querySelector('#cosmos-canvas');
if (cosmosCanvas) {
  const cosmosContext = cosmosCanvas.getContext('2d');
  let stars = [];
  let pointerX = 0;
  let pointerY = 0;

  function sizeCosmos() {
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    cosmosCanvas.width = window.innerWidth * ratio;
    cosmosCanvas.height = window.innerHeight * ratio;
    cosmosContext.setTransform(ratio, 0, 0, ratio, 0, 0);
    const starCount = window.innerWidth < 600 ? 70 : 140;
    stars = Array.from({ length: starCount }, (_, index) => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      radius: index % 13 === 0 ? 1.8 : Math.random() * 1.15 + 0.25,
      alpha: Math.random() * 0.65 + 0.22,
      speed: Math.random() * 0.006 + 0.002,
      phase: Math.random() * Math.PI * 2
    }));
  }

  function drawCosmos(time = 0) {
    cosmosContext.clearRect(0, 0, window.innerWidth, window.innerHeight);
    stars.forEach((star, index) => {
      const twinkle = prefersReducedMotion
        ? star.alpha
        : star.alpha * (0.72 + Math.sin(time * star.speed + star.phase) * 0.28);
      const depth = (index % 4 + 1) * 0.8;
      const x = star.x + pointerX * depth;
      const y = star.y + pointerY * depth;
      cosmosContext.beginPath();
      cosmosContext.arc(x, y, star.radius, 0, Math.PI * 2);
      cosmosContext.fillStyle = `rgba(255, 245, 255, ${Math.max(0.08, twinkle)})`;
      cosmosContext.fill();
    });
    if (!introGate.classList.contains('entered') && !prefersReducedMotion) {
      requestAnimationFrame(drawCosmos);
    }
  }

  introGate?.addEventListener('pointermove', (event) => {
    pointerX = (event.clientX / window.innerWidth - 0.5) * 5;
    pointerY = (event.clientY / window.innerHeight - 0.5) * 5;
  });

  window.addEventListener('resize', sizeCosmos);
  sizeCosmos();
  drawCosmos();
}

/* ============================================================
 * 10. 鼠标光晕（全局，跟随指针移动）
 * ============================================================ */
let cursorX = window.innerWidth / 2;
let cursorY = window.innerHeight / 2;
let cursorTargetX = cursorX;
let cursorTargetY = cursorY;

document.addEventListener('pointermove', (event) => {
  cursorTargetX = event.clientX;
  cursorTargetY = event.clientY;
});

function animateCursor() {
  cursorX += (cursorTargetX - cursorX) * 0.15;
  cursorY += (cursorTargetY - cursorY) * 0.15;
  if (cursorGlow) {
    cursorGlow.style.transform = `translate(calc(${cursorX}px - 50%), calc(${cursorY}px - 50%))`;
  }
  if (auroraLayer && !prefersReducedMotion) {
    const dx = (cursorX / window.innerWidth - 0.5) * 20;
    const dy = (cursorY / window.innerHeight - 0.5) * 20;
    auroraLayer.style.setProperty('--mx', `${dx}px`);
    auroraLayer.style.setProperty('--my', `${dy}px`);
  }
  requestAnimationFrame(animateCursor);
}
if (!prefersReducedMotion) animateCursor();

/* ============================================================
 * 11. 滚动进度条
 * ============================================================ */
function updateScrollProgress() {
  const scrollTop = window.scrollY;
  const height = document.documentElement.scrollHeight - window.innerHeight;
  const progress = height > 0 ? (scrollTop / height) * 100 : 0;
  if (scrollProgress) scrollProgress.style.width = `${progress}%`;
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

/* ============================================================
 * 12. 浮动粒子（在主页/启动门后随机浮动）
 * ============================================================ */
function spawnParticles(count) {
  if (!particlesRoot || prefersReducedMotion) return;
  const colors = ['#06d4ff', '#4f7cff', '#e879f9', '#fbbf24'];
  for (let i = 0; i < count; i++) {
    const span = document.createElement('span');
    const color = colors[i % colors.length];
    const size = Math.random() * 3 + 2;
    const left = Math.random() * 100;
    const duration = Math.random() * 18 + 14;
    const delay = Math.random() * 20;
    span.style.left = `${left}%`;
    span.style.width = `${size}px`;
    span.style.height = `${size}px`;
    span.style.background = color;
    span.style.boxShadow = `0 0 ${size * 4}px ${color}`;
    span.style.animationDuration = `${duration}s`;
    span.style.animationDelay = `-${delay}s`;
    particlesRoot.appendChild(span);
  }
}
spawnParticles(28);

/* ============================================================
 * 13. 卡片 3D tilt（成就卡、upcoming 卡）
 * ============================================================ */
function bindTilt(selector, intensity = 8) {
  document.querySelectorAll(selector).forEach((card) => {
    let rafId = null;
    card.addEventListener('pointermove', (event) => {
      if (prefersReducedMotion) return;
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        card.style.transform = `translateY(-6px) rotateX(${-y * intensity}deg) rotateY(${x * intensity}deg)`;
      });
    });
    card.addEventListener('pointerleave', () => {
      cancelAnimationFrame(rafId);
      card.style.transform = '';
    });
  });
}
bindTilt('.achievement-card', 6);
bindTilt('.upcoming-card', 4);

/* ============================================================
 * 14. 身份卡 3D tilt
 * ============================================================ */
const identityCard = document.querySelector('.identity-card');
if (identityCard && !prefersReducedMotion) {
  let rafId = null;
  identityCard.addEventListener('pointermove', (event) => {
    const rect = identityCard.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(() => {
      identityCard.style.transform = `rotate(0deg) rotateX(${-y * 6}deg) rotateY(${x * 8}deg)`;
    });
  });
  identityCard.addEventListener('pointerleave', () => {
    cancelAnimationFrame(rafId);
    identityCard.style.transform = '';
  });
}

/* ============================================================
 * 15. 视差：极光背景随滚动轻微平移
 * ============================================================ */
if (auroraLayer && !prefersReducedMotion) {
  let lastScrollY = window.scrollY;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const delta = (window.scrollY - lastScrollY) * 0.05;
      auroraLayer.style.setProperty('--sy', `${delta}px`);
      lastScrollY = window.scrollY;
      ticking = false;
    });
  }, { passive: true });
}

/* ============================================================
 * 16. 页脚年份
 * ============================================================ */
const yearEl = document.querySelector('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ============================================================
 * 17. 阻止 placeholder 链接的默认行为
 * ============================================================ */
document.querySelectorAll('a[href="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    if (link.getAttribute('href') === '#') {
      event.preventDefault();
    }
  });
});

/* ============================================================
 * 18. 控制台欢迎语
 * ============================================================ */
console.log(
  '%c👋 Hello! ',
  'font-size:24px; font-weight:bold; background:linear-gradient(90deg, #4f7cff, #06d4ff, #e879f9); color:#fff; padding:8px 16px; border-radius:8px;',
  '\n欢迎查看 SRX 的个人观察站 V2 源代码。\n深色基调 + 极光动效，欢迎体验 :)'
);