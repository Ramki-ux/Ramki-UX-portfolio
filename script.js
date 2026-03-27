/* ============================================================
   RAMAKRISHNAN R — PORTFOLIO · JAVASCRIPT
   Scroll mechanics, cursor, sticky cards, reveals
   ============================================================ */

(function () {
  "use strict";

  /* ---- CUSTOM CURSOR ---- */
  const cursorDot = document.querySelector(".cursor-dot");
  const cursorRing = document.querySelector(".cursor-ring");

  if (cursorDot && cursorRing) {
    let dotX = 0,
      dotY = 0,
      ringX = 0,
      ringY = 0;
    let mouseX = window.innerWidth / 2,
      mouseY = window.innerHeight / 2;

    document.addEventListener("mousemove", (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
    });

    function animateCursor() {
      // Dot follows immediately
      dotX = mouseX;
      dotY = mouseY;
      cursorDot.style.left = dotX + "px";
      cursorDot.style.top = dotY + "px";

      // Ring follows with lag
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      cursorRing.style.left = ringX + "px";
      cursorRing.style.top = ringY + "px";

      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  /* ---- NAV SCROLL STATE ---- */
  const nav = document.getElementById("nav");
  window.addEventListener(
    "scroll",
    () => {
      if (window.scrollY > 60) {
        nav.classList.add("scrolled");
      } else {
        nav.classList.remove("scrolled");
      }
    },
    { passive: true },
  );

  /* ---- HERO PARALLAX FADE ---- */
  const hero = document.querySelector(".hero");
  if (hero) {
    window.addEventListener(
      "scroll",
      () => {
        const scrolled = window.scrollY;
        const heroHeight = hero.offsetHeight;
        if (scrolled < heroHeight) {
          const progress = scrolled / heroHeight;
          const opacity = 1 - progress * 1.4;
          const translateY = scrolled * 0.25;
          hero.style.opacity = Math.max(0, opacity);
          hero.style.transform = `translateY(${translateY}px)`;
        }
      },
      { passive: true },
    );
  }

  /* ---- INTERSECTION OBSERVER — REVEAL ELEMENTS ---- */
  const revealEls = document.querySelectorAll(".reveal-element");

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("revealed");
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -40px 0px",
    },
  );

  revealEls.forEach((el) => revealObserver.observe(el));

  /* ---- STICKY CARDS — ACTIVE STATE + MOCKUP ANIMATION ---- */
  const stickyCards = document.querySelectorAll(".sticky-card");

  const cardObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("card-active");
        }
        // Don't remove class to keep animation state on exit — only re-add for re-entry
      });
    },
    {
      threshold: 0.3,
    },
  );

  stickyCards.forEach((card) => cardObserver.observe(card));

  /* ---- PARALLAX MOCKUP IMAGES ---- */
  // Apply a subtle parallax to .mockup-img while its card is in the viewport
  const mockupImgs = document.querySelectorAll(".browser-screen .mockup-img");

  function applyMockupParallax() {
    stickyCards.forEach((card) => {
      const rect = card.getBoundingClientRect();
      // How far through the card the viewport is (0 = top, 1 = bottom)
      const viewportH = window.innerHeight;

      if (rect.top < viewportH && rect.bottom > 0) {
        // Normalized: -1 to 1
        const progress = (rect.top / viewportH) * -1;
        const parallaxY = progress * 30; // max 30px drift

        const imgs = card.querySelectorAll(
          ".browser-screen .mockup-img, .phone-screen .mockup-img",
        );
        imgs.forEach((img) => {
          img.style.transform = `translateY(${parallaxY}px)`;
        });
      }
    });
  }

  window.addEventListener("scroll", applyMockupParallax, { passive: true });

  /* ---- BENTO CARDS REVEAL ---- */
  const bentoCards = document.querySelectorAll(".bento-card");
  bentoCards.forEach((card, i) => {
    card.style.opacity = "0";
    card.style.transform = "translateY(40px)";
    card.style.transition = `opacity 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.1}s, transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${i * 0.1}s`;
  });

  const bentoObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          bentoObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 },
  );

  bentoCards.forEach((card) => bentoObserver.observe(card));

  /* ---- PROCESS STEPS REVEAL ---- */
  const processSteps = document.querySelectorAll(".process-step");
  processSteps.forEach((step, i) => {
    step.style.opacity = "0";
    step.style.transform = "translateX(-20px)";
    step.style.transition = `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`;
  });

  const processObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateX(0)";
          processObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );

  processSteps.forEach((step) => processObserver.observe(step));

  /* ---- TIMELINE REVEAL ---- */
  const timelineItems = document.querySelectorAll(".timeline-item");
  timelineItems.forEach((item, i) => {
    item.style.opacity = "0";
    item.style.transform = "translateY(16px)";
    item.style.transition = `opacity 0.5s ease ${i * 0.1}s, transform 0.5s ease ${i * 0.1}s`;
  });

  const timelineObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
          timelineObserver.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.2 },
  );

  timelineItems.forEach((item) => timelineObserver.observe(item));

  /* ---- FOOTER PARALLAX REVEAL ---- */
  const footer = document.querySelector(".footer");
  if (footer) {
    footer.style.transform = "translateY(60px)";
    footer.style.opacity = "0";
    footer.style.transition =
      "transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 1s ease";

    const footerObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            footer.style.transform = "translateY(0)";
            footer.style.opacity = "1";
            footerObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05 },
    );

    footerObserver.observe(footer);
  }

  /* ---- SMOOTH ANCHOR SCROLLING ---- */
  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener("click", (e) => {
      const target = anchor.getAttribute("href");
      if (target === "#") return;
      const targetEl = document.querySelector(target);
      if (targetEl) {
        e.preventDefault();
        targetEl.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ---- MAGNETIC EFFECT ON BUTTONS ---- */
  const magneticEls = document.querySelectorAll(
    ".btn-primary, .btn-secondary, .nav-cta",
  );

  magneticEls.forEach((el) => {
    el.addEventListener("mousemove", (e) => {
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = (e.clientX - centerX) * 0.3;
      const deltaY = (e.clientY - centerY) * 0.3;
      el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
    });

    el.addEventListener("mouseleave", () => {
      el.style.transform = "";
    });
  });

  /* ---- HERO TEXT LINE ANIMATION ---- */
  const heroLines = document.querySelectorAll(".hero-headline .line");
  heroLines.forEach((line, i) => {
    line.style.opacity = "0";
    line.style.transform = "translateY(40px)";
    line.style.transition = `opacity 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.1 + i * 0.12}s, transform 0.9s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${0.1 + i * 0.12}s`;

    // Trigger with small delay on page load
    setTimeout(
      () => {
        line.style.opacity = "1";
        line.style.transform = "translateY(0)";
      },
      100 + i * 100,
    );
  });

  /* ---- RESUME DOWNLOAD ---- */
  // The link in HTML now directly downloads the PDF file.

  /* ---- CARD PROGRESS DOTS ---- */
  // Add subtle progress indicator showing which card is active
  const workSection = document.getElementById("work");
  if (workSection && stickyCards.length > 0) {
    const progressWrap = document.createElement("div");
    progressWrap.className = "card-progress-nav";
    progressWrap.style.cssText = `
      position: fixed;
      right: 32px;
      top: 50%;
      transform: translateY(-50%);
      display: flex;
      flex-direction: column;
      gap: 8px;
      z-index: 500;
      opacity: 0;
      transition: opacity 0.4s ease;
    `;

    stickyCards.forEach((_, i) => {
      const dot = document.createElement("div");
      dot.style.cssText = `
        width: 6px;
        height: 6px;
        border-radius: 3px;
        background: rgba(255,255,255,0.2);
        transition: height 0.3s ease, background 0.3s ease;
        cursor: pointer;
      `;
      dot.dataset.cardIndex = i;
      progressWrap.appendChild(dot);
    });

    document.body.appendChild(progressWrap);

    // Show/hide nav based on whether sticky section is in view
    const dotEls = progressWrap.querySelectorAll("div");

    function updateProgressDots() {
      const workRect = workSection.getBoundingClientRect();
      const viewH = window.innerHeight;

      // Show dots when work section is in view
      if (workRect.top < viewH && workRect.bottom > 0) {
        progressWrap.style.opacity = "1";
      } else {
        progressWrap.style.opacity = "0";
      }

      // Find which card is currently "on top"
      stickyCards.forEach((card, i) => {
        const rect = card.getBoundingClientRect();
        const isActive = rect.top <= 0 && rect.bottom > 0;

        if (isActive) {
          dotEls.forEach((d, j) => {
            d.style.background =
              j === i ? "rgba(212,255,74,0.8)" : "rgba(255,255,255,0.2)";
            d.style.height = j === i ? "18px" : "6px";
          });
        }
      });

      // First card if not scrolled past any
      const firstCard = stickyCards[0];
      if (firstCard) {
        const r = firstCard.getBoundingClientRect();
        if (r.top > 0) {
          dotEls.forEach((d, j) => {
            d.style.background =
              j === 0 ? "rgba(212,255,74,0.8)" : "rgba(255,255,255,0.2)";
            d.style.height = j === 0 ? "18px" : "6px";
          });
        }
      }
    }

    window.addEventListener("scroll", updateProgressDots, { passive: true });
  }

  /* ---- GLOBAL FOOTPRINT MAP INTERACTION ---- */
  const mapPins = document.querySelectorAll(".map-pin");
  const mapInfoCard = document.getElementById("map-info-card");
  const mcName = document.getElementById("mc-name");
  const mcDesc = document.getElementById("mc-desc");
  const mcProjectsContainer = document.getElementById("mc-projects-container");
  const mcProjects = document.getElementById("mc-projects");

  const countryData = {
    uk: {
      name: "United Kingdom",
      desc: "Designed hospitality and service-based websites focused on premium experiences, clear booking flows, and visually engaging storytelling.",
      projects: ["Ravens Ait", "RAASA Restaurant", "Whitfield Service Station", "Warren House Hotel"]
    },
    australia: {
      name: "Australia",
      desc: "Worked on service marketplace platforms that emphasize simplified navigation and conversion-focused layouts.",
      projects: ["Fastnangs Australia"]
    },
    qatar: {
      name: "Qatar",
      desc: "Designed enterprise-level digital experiences that simplify complex service offerings and strengthen brand positioning.",
      projects: ["Salam Technologies"]
    },
    india: {
      name: "India",
      desc: "Worked on cybersecurity and community-based digital solutions with a focus on usability, accessibility, and clear communication of technical services.",
      projects: ["National Cyber Security Service", "Gated Community Mobile App"]
    },
    ireland: {
      name: "Ireland",
      desc: "Designed high-end event venue websites focused on visual storytelling and strong inquiry-driven conversion paths.",
      projects: ["Warren House", "Ravens Ait"]
    }
  };

  let activePin = null;

  mapPins.forEach(pin => {
    const activatePin = (e) => {
      if (e.type === 'click') e.stopPropagation();
      
      const countryId = pin.getAttribute("data-country");
      const data = countryData[countryId];
      if (!data) return;

      if (activePin) activePin.classList.remove("active");
      pin.classList.add("active");
      activePin = pin;

      mcName.textContent = data.name;
      mcDesc.textContent = data.desc;
      
      mcProjects.innerHTML = "";
      if (data.projects && data.projects.length > 0) {
        mcProjectsContainer.style.display = "block";
        data.projects.forEach(proj => {
          const li = document.createElement("li");
          li.textContent = proj;
          mcProjects.appendChild(li);
        });
      } else {
        mcProjectsContainer.style.display = "none";
      }

      mapInfoCard.classList.add("active");
    };

    pin.addEventListener("mouseenter", activatePin);
    pin.addEventListener("click", activatePin);
  });

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".map-container")) {
      if (activePin) activePin.classList.remove("active");
      activePin = null;
      if (mapInfoCard) mapInfoCard.classList.remove("active");
    }
  });

  /* ---- INITIAL PAGE LOAD REVEAL ---- */
  window.addEventListener("load", () => {
    document.body.style.visibility = "visible";
    // Hero eyebrow and CTAs reveal
    setTimeout(() => {
      document.querySelector(".hero-eyebrow")?.classList.add("revealed");
    }, 300);
    setTimeout(() => {
      document.querySelector(".hero-sub")?.classList.add("revealed");
    }, 600);
    setTimeout(() => {
      document.querySelector(".hero-ctas")?.classList.add("revealed");
    }, 800);
    setTimeout(() => {
      document.querySelector(".hero-meta")?.classList.add("revealed");
    }, 1000);
  });
})();
