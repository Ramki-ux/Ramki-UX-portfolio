/* ══════════════════════════════════════════════════════════════
   RAMAKRISHNAN R — PORTFOLIO  |  script.js
   Scroll storytelling, theme toggle, animations, interactions
   ══════════════════════════════════════════════════════════════ */

"use strict";

/* ─── UTILS ─── */
const qs = (sel, ctx = document) => ctx.querySelector(sel);
const qsa = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
const clamp = (v, lo, hi) => Math.min(Math.max(v, lo), hi);

/* ══════════════════════════════════════
   THEME TOGGLE
══════════════════════════════════════ */
(function initTheme() {
  const html = document.documentElement;
  const btn = qs("#themeToggle");
  const stored = localStorage.getItem("theme");

  // Default light, honour stored preference
  const apply = (t) => {
    html.setAttribute("data-theme", t);
    localStorage.setItem("theme", t);
  };

  apply(stored || "light");

  btn.addEventListener("click", () => {
    const curr = html.getAttribute("data-theme");
    apply(curr === "light" ? "dark" : "light");
  });
})();

/* ══════════════════════════════════════
   NAVBAR SCROLL
══════════════════════════════════════ */
(function initNavbar() {
  const nav = qs("#navbar");
  const onScroll = () => {
    nav.classList.toggle("scrolled", window.scrollY > 40);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ══════════════════════════════════════
   HAMBURGER MENU
══════════════════════════════════════ */
(function initHamburger() {
  const btn     = qs("#menuToggle");
  const drawer  = qs("#mobileNav");
  const links   = qsa(".mnav-link", drawer);
  if (!btn || !drawer) return;

  const open  = () => {
    btn.classList.add("open");
    drawer.classList.add("open");
    btn.setAttribute("aria-expanded", "true");
    drawer.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  };

  const close = () => {
    btn.classList.remove("open");
    drawer.classList.remove("open");
    btn.setAttribute("aria-expanded", "false");
    drawer.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  };

  btn.addEventListener("click", () => {
    drawer.classList.contains("open") ? close() : open();
  });

  // Close when any link is tapped
  links.forEach((l) => l.addEventListener("click", close));

  // Close on ESC
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
})();




/* ══════════════════════════════════════
   CUSTOM CURSOR (Figma-style dot + ring)
══════════════════════════════════════ */

(function initCursor() {
  if (window.matchMedia("(pointer: coarse)").matches) return;

  // Create dot + ring elements
  const dot  = document.createElement("div");
  const ring = document.createElement("div");
  dot.className  = "cur-dot";
  ring.className = "cur-ring";
  document.body.appendChild(ring);
  document.body.appendChild(dot);

  // Hide native cursor globally
  document.documentElement.style.cursor = "none";

  let mx = 0, my = 0;   // real mouse
  let rx = 0, ry = 0;   // ring position (lagging)

  document.addEventListener("mousemove", (e) => {
    mx = e.clientX;
    my = e.clientY;
    // Dot snaps instantly
    dot.style.transform  = `translate(${mx}px, ${my}px)`;
  }, { passive: true });

  // Ring follows with lag
  const tick = () => {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.transform = `translate(${rx}px, ${ry}px)`;
    requestAnimationFrame(tick);
  };
  tick();

  // Scale ring on hover over interactive elements
  const hoverEls = "a, button, [data-country], .project-card, .add-card, .skill-chip, .pnav-item";
  document.querySelectorAll(hoverEls).forEach((el) => {
    el.addEventListener("mouseenter", () => ring.classList.add("cur-ring--hover"));
    el.addEventListener("mouseleave", () => ring.classList.remove("cur-ring--hover"));
  });

  // Hide when cursor leaves window
  document.addEventListener("mouseleave", () => {
    dot.style.opacity  = "0";
    ring.style.opacity = "0";
  });
  document.addEventListener("mouseenter", () => {
    dot.style.opacity  = "1";
    ring.style.opacity = "1";
  });
})();

/* ══════════════════════════════════════
   INTERSECTION OBSERVER — REVEAL
══════════════════════════════════════ */
(function initReveal() {
  const revealEls = qsa(".reveal-text, .reveal-stagger");

  if (!revealEls.length) return;

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;

        if (el.classList.contains("reveal-stagger")) {
          // Stagger siblings
          const siblings = qsa(".reveal-stagger", el.parentElement);
          const idx = siblings.indexOf(el);
          el.style.transitionDelay = idx * 80 + "ms";
        }

        el.classList.add("visible");
        io.unobserve(el);
      });
    },
    { threshold: 0.15, rootMargin: "0px 0px -40px 0px" },
  );

  revealEls.forEach((el) => io.observe(el));
})();

/* ══════════════════════════════════════
   ANIMATED COUNTERS
══════════════════════════════════════ */
(function initCounters() {
  const counters = qsa("[data-count]");
  if (!counters.length) return;

  const easeOut = (t) => 1 - Math.pow(1 - t, 3);

  const animate = (el, target, duration = 1200) => {
    const start = performance.now();
    const raf = (now) => {
      const elapsed = now - start;
      const progress = clamp(elapsed / duration, 0, 1);
      el.textContent = Math.round(easeOut(progress) * target);
      if (progress < 1) requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);
  };

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        animate(el, parseInt(el.dataset.count, 10));
        io.unobserve(el);
      });
    },
    { threshold: 0.5 },
  );

  counters.forEach((el) => io.observe(el));
})();

/* ══════════════════════════════════════
   PROJECTS — SCROLL-DRIVEN STICKY
══════════════════════════════════════ */
(function initProjects() {
  const navItems = qsa(".pnav-item");
  const cards    = qsa(".project-card");
  const wrapper  = qs(".projects-sticky-wrapper");
  if (!navItems.length || !wrapper) return;

  const total = cards.length; // 5

  const setProject = (idx) => {
    navItems.forEach((n) => n.classList.toggle("active", +n.dataset.project === idx));
    cards.forEach((c)    => c.classList.toggle("active", +c.dataset.project === idx));
  };

  // Start with project 0 active
  setProject(0);

  // Scroll-driven: map wrapper scroll progress → project index
  const onScroll = () => {
    const rect     = wrapper.getBoundingClientRect();
    const wrapperH = wrapper.offsetHeight;          // 500vh
    const viewH    = window.innerHeight;
    // progress 0→1 as sticky block scrolls through wrapper
    const scrolled = -rect.top;                     // px scrolled past top
    const maxScroll = wrapperH - viewH;
    const progress  = clamp(scrolled / maxScroll, 0, 1);

    const idx = Math.min(Math.floor(progress * total), total - 1);
    setProject(idx);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll(); // run once on load

  // Manual nav click → scroll to corresponding position in wrapper
  navItems.forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx      = +btn.dataset.project;
      const wrapperH = wrapper.offsetHeight;
      const viewH    = window.innerHeight;
      const maxScroll = wrapperH - viewH;
      // target the midpoint of each project's scroll segment
      const targetScroll = wrapper.offsetTop + (idx / total) * maxScroll + maxScroll / total / 2;
      window.scrollTo({ top: targetScroll, behavior: "smooth" });
    });
  });
})();

/* ══════════════════════════════════════
   GLOBAL MAP — LEAFLET JS
══════════════════════════════════════ */
(function initGlobalMap() {
  const mapEl = qs("#world-map-leaflet");
  if (!mapEl || typeof L === "undefined") return;

  // Exact GPS coordinates
  const locations = [
    { name: "United Kingdom", flag: "🇬🇧", lat: 51.5074,  lng:  -0.1278  },
    { name: "Ireland",        flag: "🇮🇪", lat: 53.3498,  lng:  -6.2603  },
    { name: "Qatar",          flag: "🇶🇦", lat: 25.2854,  lng:  51.5310  },
    { name: "India",          flag: "🇮🇳", lat: 28.6139,  lng:  77.2090  },
    { name: "Australia",      flag: "🇦🇺", lat: -33.8688, lng: 151.2093  },
  ];

  // Initialise the map centred on a world-wide view
  const map = L.map(mapEl, {
    center: [20, 20],
    zoom: 2,
    zoomControl: false,
    scrollWheelZoom: false,
    dragging: !L.Browser.mobile,
    attributionControl: true,
    minZoom: 2,
    maxZoom: 6,
  });

  // CartoDB No-Labels tiles — clean map with no continent/country text
  const lightTiles = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
    {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 6,
    }
  );

  const darkTiles = L.tileLayer(
    "https://{s}.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}{r}.png",
    {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> © <a href="https://carto.com/">CARTO</a>',
      subdomains: "abcd",
      maxZoom: 6,
    }
  );

  const isDark = () =>
    document.documentElement.getAttribute("data-theme") === "dark";

  (isDark() ? darkTiles : lightTiles).addTo(map);

  // Swap tiles when theme changes
  const themeBtn = qs("#themeToggle");
  if (themeBtn) {
    themeBtn.addEventListener("click", () => {
      setTimeout(() => {
        if (isDark()) {
          map.removeLayer(lightTiles);
          darkTiles.addTo(map);
        } else {
          map.removeLayer(darkTiles);
          lightTiles.addTo(map);
        }
      }, 50);
    });
  }

  // Text-label marker icon — shows country name with a teal dot, no flag
  const makeIcon = (name) =>
    L.divIcon({
      className: "",
      html: `<div class="map-label-marker">
               <span class="map-label-dot"></span>
               <span class="map-label-text">${name}</span>
             </div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
      popupAnchor: [60, -10],
    });

  // Place markers — no popup needed, label is the marker itself
  const leafletMarkers = {};
  locations.forEach(({ name, flag, lat, lng }) => {
    const marker = L.marker([lat, lng], { icon: makeIcon(name) }).addTo(map);
    leafletMarkers[name] = marker;
  });

  // State: track active pill
  const countryItems = qsa(".country-item");
  let activeName = null;

  const resetMap = () => {
    activeName = null;
    map.closePopup();
    map.flyTo([20, 20], 2, { animate: true, duration: 1 });
    countryItems.forEach((c) => c.classList.add("active"));
  };

  // Country pill click → zoom in; same pill again → reset
  countryItems.forEach((ci) => {
    ci.addEventListener("click", () => {
      const name = ci.dataset.country;
      if (activeName === name) { resetMap(); return; }

      activeName = name;
      const m = leafletMarkers[name];
      if (!m) return;

      countryItems.forEach((c) => c.classList.remove("active"));
      ci.classList.add("active");

      map.flyTo(m.getLatLng(), 5, { animate: true, duration: 1.2 });
      setTimeout(() => m.openPopup(), 1100);
    });
  });

  // Default state: ALL pills active on load
  countryItems.forEach((ci) => ci.classList.add("active"));

  // Reveal: stagger-animate pills when section first scrolls in
  const globalSec = qs("#global");
  if (globalSec) {
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        countryItems.forEach((ci, i) => {
          ci.style.opacity = "0";
          ci.style.transform = "translateY(8px)";
          setTimeout(() => {
            ci.style.transition = "opacity 0.4s ease, transform 0.4s ease";
            ci.style.opacity = "1";
            ci.style.transform = "";
          }, i * 120);
        });
        io.disconnect();
      },
      { threshold: 0.3 }
    );
    io.observe(globalSec);
  }
})();

/* ══════════════════════════════════════
   SCROLL HINT HIDE
══════════════════════════════════════ */
(function initScrollHint() {
  const hint = qs("#scrollHint");
  if (!hint) return;
  const handler = () => {
    if (window.scrollY > 80) {
      hint.style.opacity = "0";
      hint.style.pointerEvents = "none";
      window.removeEventListener("scroll", handler);
    }
  };
  window.addEventListener("scroll", handler, { passive: true });
})();

/* ══════════════════════════════════════
   SKILL CHIP HOVER RIPPLE
══════════════════════════════════════ */
(function initChipRipple() {
  const chips = qsa(".skill-chip");
  chips.forEach((chip) => {
    chip.addEventListener("mouseenter", () => {
      chip.style.transition = "all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)";
    });
    chip.addEventListener("mouseleave", () => {
      chip.style.transition = "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)";
    });
  });
})();

/* ══════════════════════════════════════
   PARALLAX ON HERO BLOBS
══════════════════════════════════════ */
(function initParallax() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  const blobs = qsa(".hero-blob");
  document.addEventListener(
    "mousemove",
    (e) => {
      const cx = (e.clientX / window.innerWidth - 0.5) * 2;
      const cy = (e.clientY / window.innerHeight - 0.5) * 2;
      blobs.forEach((b, i) => {
        const depth = (i + 1) * 8;
        b.style.transform = `translate(${cx * depth}px, ${cy * depth}px)`;
      });
    },
    { passive: true },
  );
})();

/* ══════════════════════════════════════
   SMOOTH ANCHOR SCROLL
══════════════════════════════════════ */
(function initAnchorScroll() {
  qsa('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const target = qs(a.getAttribute("href"));
      if (!target) return;
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });
})();

/* ══════════════════════════════════════
   CONTACT ITEM — CHARACTER TYPED EFFECT
══════════════════════════════════════ */
(function initContactReveal() {
  const section = qs("#contact");
  if (!section) return;

  const io = new IntersectionObserver(
    (entries) => {
      if (!entries[0].isIntersecting) return;
      const items = qsa(".contact-item", section);
      items.forEach((item, i) => {
        item.style.opacity = "0";
        item.style.transform = "translateX(-20px)";
        item.style.transition = "all 0.5s cubic-bezier(0.4,0,0.2,1)";
        setTimeout(
          () => {
            item.style.opacity = "1";
            item.style.transform = "translateX(0)";
          },
          100 + i * 120,
        );
      });
      io.disconnect();
    },
    { threshold: 0.3 },
  );

  io.observe(section);
})();

/* ══════════════════════════════════════
   PROCESS — SCROLL-DRIVEN ONE-BY-ONE REVEAL
══════════════════════════════════════ */
(function initProcess() {
  const section = qs("#process");
  if (!section) return;

  const steps = qsa(".process-step", section);
  const total = steps.length; // 4

  let lastRevealed = -1;

  const onScroll = () => {
    const rect      = section.getBoundingClientRect();
    const sectionH  = section.offsetHeight;       // 400vh
    const viewH     = window.innerHeight;
    const scrolled  = -rect.top;                  // px past top of section
    const maxScroll = sectionH - viewH;
    const progress  = Math.max(0, Math.min(scrolled / maxScroll, 1));

    // Which card index should be the latest revealed (0-based)
    const idx = Math.min(Math.floor(progress * total), total - 1);

    if (idx !== lastRevealed) {
      if (idx > lastRevealed) {
        // Reveal cards up to idx
        for (let i = lastRevealed + 1; i <= idx; i++) {
          steps[i].classList.add("revealed");
        }
      } else {
        // Scrolling back — hide cards after idx
        for (let i = idx + 1; i <= lastRevealed; i++) {
          steps[i].classList.remove("revealed");
        }
      }
      lastRevealed = idx;
    }
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();

/* ══════════════════════════════════════
   ORBIT ICONS — RESET COUNTER ROTATION
   (keeps icons upright while rings spin)
══════════════════════════════════════ */
(function initOrbitCounterRotate() {
  const orbits = qsa(".av-orbit");
  const rings = qsa(".av-ring");
  if (!orbits.length) return;

  let angle = 0;
  const tick = () => {
    angle += 0.02; // degrees per frame ~= 1.2 deg/s at 60fps
    rings.forEach((r, i) => {
      const dir = i % 2 === 0 ? 1 : -1;
      r.style.transform = `rotate(${dir * angle}deg)`;
    });
    requestAnimationFrame(tick);
  };

  // orbit icon positions (0°, 90°, 180°, 270°)
  // Their parent ring rotates; we counter-rotate the icon
  requestAnimationFrame(tick);
})();

/* ══════════════════════════════════════
   ABOUT CARDS TILT ON HOVER (desktop)
══════════════════════════════════════ */
(function initTilt() {
  if (window.matchMedia("(pointer: coarse)").matches) return;
  const tiltEls = qsa(".tl-right, .add-card, .stat-card");

  tiltEls.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${x * 5}deg) rotateX(${-y * 5}deg) translateY(-2px)`;
    });
    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });
})();

/* ══════════════════════════════════════
   FLOATING CARDS — ENTRY ANIMATION
══════════════════════════════════════ */
(function initFloatingCards() {
  const cards = qsa(".float-card");
  cards.forEach((card, i) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(20px) scale(0.95)";
    setTimeout(
      () => {
        card.style.transition =
          "opacity 0.6s cubic-bezier(0.4,0,0.2,1), transform 0.6s cubic-bezier(0.34,1.56,0.64,1)";
        card.style.opacity = "1";
        card.style.transform = "";
      },
      600 + i * 200,
    );
  });
})();

console.log(
  "%c✦ Ramakrishnan R Portfolio",
  "color:#1bbfa8;font-size:1rem;font-weight:700;",
);
console.log(
  "%cUX/UI Designer | Made with care.",
  "color:#5ec4d6;font-size:0.875rem;",
);
