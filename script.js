/* =============================================
   CYBER CITY — main.js
   Handles: nav scroll, glitch title, scroll
   reveals, menu interaction, ambient effects
   ============================================= */

(function () {
  'use strict';

  /* ── NAV: add scrolled class ── */
  const nav = document.getElementById('nav');
  let lastScroll = 0;

  function onScroll() {
    const y = window.scrollY;
    if (y > 20) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
    lastScroll = y;
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ── SMOOTH NAV LINKS ── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 60; // nav height
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });

  /* ── SCROLL REVEAL ── */
  const revealTargets = [
    '.story-grid',
    '.combat-card',
    '.enemy-card',
    '.boss-card',
    '.zone-card',
    '.diff-card',
    '.ach-tier',
    '.weapons-section',
    '.hero-stats',
    '.objective-card',
  ];

  const revealEls = document.querySelectorAll(revealTargets.join(','));
  revealEls.forEach(el => el.classList.add('reveal'));

  const revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          // staggered delay within a group
          const siblings = Array.from(
            entry.target.parentElement.querySelectorAll('.reveal')
          );
          const idx = siblings.indexOf(entry.target);
          const delay = Math.min(idx * 80, 400);

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          revealObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  revealEls.forEach(el => revealObserver.observe(el));

  /* ── HERO TITLE: extra glitch on hover ── */
  const heroTitle = document.getElementById('heroTitle');
  if (heroTitle) {
    heroTitle.addEventListener('mouseenter', () => {
      heroTitle.style.animation = 'none';
      heroTitle.offsetHeight; // reflow
      heroTitle.style.animation = '';
    });
  }

  /* ── HERO BUTTON: pulse effect ── */
  const playBtn = document.getElementById('playBtn');
  if (playBtn) {
    setInterval(() => {
      playBtn.style.boxShadow = '0 0 50px rgba(0, 212, 255, 0.8)';
      setTimeout(() => {
        playBtn.style.boxShadow = '0 0 24px rgba(0, 212, 255, 0.4)';
      }, 300);
    }, 4000);
  }

  /* ── GAME MENU INTERACTION ── */
  document.querySelectorAll('.menu-item').forEach(item => {
    item.addEventListener('click', function () {
      document.querySelectorAll('.menu-item').forEach(m => m.classList.remove('active'));
      this.classList.add('active');

      // brief glitch flash on the hero title when "PLAY" is chosen
      if (this.id === 'menuPlay' && heroTitle) {
        triggerGlitch(heroTitle);
      }
    });
  });

  function triggerGlitch(el) {
    el.style.transform = 'skewX(-3deg)';
    setTimeout(() => {
      el.style.transform = 'skewX(2deg)';
      setTimeout(() => {
        el.style.transform = 'none';
      }, 80);
    }, 60);
  }

  /* ── ENEMY CARD HOVER SCANLINE ── */
  document.querySelectorAll('.enemy-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
      const badge = this.querySelector('.threat-badge');
      if (badge) {
        badge.style.transition = 'opacity 0.1s';
        badge.style.opacity = '0.5';
        setTimeout(() => badge.style.opacity = '1', 120);
      }
    });
  });

  /* ── BOSS CARD INTERACTION: highlight abilities on hover ── */
  document.querySelectorAll('.boss-card').forEach(card => {
    card.addEventListener('mouseenter', function () {
      this.querySelectorAll('.ability-tag').forEach((tag, i) => {
        setTimeout(() => {
          tag.style.transition = 'border-color 0.15s, color 0.15s';
          if (!tag.classList.contains('danger')) {
            tag.style.borderColor = 'rgba(0, 212, 255, 0.5)';
            tag.style.color = '#00d4ff';
          }
        }, i * 60);
      });
    });
    card.addEventListener('mouseleave', function () {
      this.querySelectorAll('.ability-tag:not(.danger)').forEach(tag => {
        tag.style.borderColor = '';
        tag.style.color = '';
      });
    });
  });

  /* ── AMBIENT GRID MOUSE PARALLAX ── */
  const heroGrid = document.querySelector('.hero-grid');
  if (heroGrid) {
    window.addEventListener('mousemove', e => {
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      const dx = (e.clientX - cx) / cx;
      const dy = (e.clientY - cy) / cy;
      heroGrid.style.transform = `perspective(600px) rotateX(${20 - dy * 3}deg) translateX(${dx * 8}px)`;
    }, { passive: true });
  }

  /* ── TERMINAL TYPING EFFECT on section labels ── */
  const labels = document.querySelectorAll('.section-label');
  const labelObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.dataset.typed) {
        entry.target.dataset.typed = '1';
        typeTerminal(entry.target);
        labelObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  labels.forEach(label => labelObserver.observe(label));

  function typeTerminal(el) {
    const full = el.textContent;
    el.textContent = '';
    let i = 0;
    const cursor = document.createElement('span');
    cursor.textContent = '|';
    cursor.style.cssText = 'opacity:1;animation:cursorBlink 0.6s step-end infinite;color:var(--cyan)';
    el.appendChild(cursor);

    // inject keyframe if not already present
    if (!document.getElementById('cursorStyle')) {
      const style = document.createElement('style');
      style.id = 'cursorStyle';
      style.textContent = '@keyframes cursorBlink{0%,100%{opacity:1}50%{opacity:0}}';
      document.head.appendChild(style);
    }

    function tick() {
      if (i < full.length) {
        el.insertBefore(document.createTextNode(full[i]), cursor);
        i++;
        setTimeout(tick, 30);
      } else {
        setTimeout(() => cursor.remove(), 800);
      }
    }
    setTimeout(tick, 200);
  }

  /* ── DIFFICULTY CARD: threat meter animation ── */
  const diffMap = { easy: 1, normal: 2, hard: 3, nightmare: 4 };
  document.querySelectorAll('.diff-card').forEach(card => {
    const level = diffMap[card.dataset.diff] || 1;
    card.title = `Difficulty: ${['', 'Easy', 'Normal', 'Hard', 'NIGHTMARE'][level]}`;
  });

  /* ── ZONE CARD PROGRESS COUNTER ── */
  function animateCounter(el, end, duration) {
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start = Math.min(start + step, end);
      el.textContent = Math.floor(start);
      if (start >= end) clearInterval(timer);
    }, 16);
  }

  const statNums = document.querySelectorAll('.stat-num');
  let statsAnimated = false;
  const statsObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting && !statsAnimated) {
      statsAnimated = true;
      statNums.forEach(el => {
        const val = parseInt(el.textContent, 10);
        el.textContent = '0';
        animateCounter(el, val, 800);
      });
      statsObserver.disconnect();
    }
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObserver.observe(heroStats);

  /* ── WEAPON TAG: glow pulse on legendary items ── */
  document.querySelectorAll('.weapon-tag.legendary').forEach((tag, i) => {
    setInterval(() => {
      tag.style.textShadow = '0 0 20px rgba(255,165,0,0.8)';
      setTimeout(() => {
        tag.style.textShadow = '0 0 8px rgba(255,165,0,0.3)';
      }, 300);
    }, 2500 + i * 700);
  });

  /* ── FINAL BOSS CARD AMBIENT PULSE ── */
  const finalBoss = document.querySelector('.boss-final');
  if (finalBoss) {
    let pulse = false;
    setInterval(() => {
      pulse = !pulse;
      finalBoss.style.boxShadow = pulse
        ? '0 0 40px rgba(255,43,78,0.12) inset'
        : 'none';
    }, 1500);
  }

  /* ── INIT ── */
  onScroll();
  console.log(
    '%cCYBER CITY\n%c"Fight through the machines. Save the last survivor. Reclaim humanity."',
    'font-size:2rem;font-weight:bold;color:#00d4ff;',
    'font-size:0.9rem;color:#7a90a8;'
  );

})();