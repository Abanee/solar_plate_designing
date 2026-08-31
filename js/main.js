/* ==========================================================================
   SOLARBRIGHT — GLOBAL THEME & RTL CONTROLLER (RUNS FIRST ON EVERY PAGE)
   ========================================================================== */
(function () {
  "use strict";

  function getSavedTheme() {
    try {
      return localStorage.getItem("solarbright-theme") || localStorage.getItem("theme") || "light";
    } catch (e) {
      return "light";
    }
  }

  function getSavedDir() {
    try {
      return localStorage.getItem("solarbright-dir") || localStorage.getItem("dir") || "ltr";
    } catch (e) {
      return "ltr";
    }
  }

  function applyTheme(theme) {
    if (theme !== "dark" && theme !== "light") theme = "light";
    document.documentElement.setAttribute("data-theme", theme);
    if (document.body) document.body.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("solarbright-theme", theme);
      localStorage.setItem("theme", theme);
    } catch (e) {}

    var themeButtons = document.querySelectorAll(".theme-toggle, #themeToggle, #mobileThemeToggle");
    themeButtons.forEach(function (btn) {
      btn.setAttribute("aria-pressed", theme === "dark" ? "true" : "false");
    });
  }

  function applyDir(dir) {
    if (dir !== "rtl" && dir !== "ltr") dir = "ltr";
    document.documentElement.dir = dir;
    document.documentElement.setAttribute("dir", dir);
    if (document.body) {
      document.body.dir = dir;
      document.body.setAttribute("dir", dir);
    }
    try {
      localStorage.setItem("solarbright-dir", dir);
      localStorage.setItem("dir", dir);
    } catch (e) {}

    var rtlLabels = document.querySelectorAll(".rtl-label");
    rtlLabels.forEach(function (lbl) {
      lbl.textContent = dir === "rtl" ? "RTL" : "LTR";
    });
  }

  // Apply immediately on script load
  applyTheme(getSavedTheme());
  applyDir(getSavedDir());

  // Re-apply when DOM is ready to catch document.body and dynamic elements
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      applyTheme(getSavedTheme());
      applyDir(getSavedDir());
    });
  }

  // Global click event delegation - catches clicks anywhere on button, text, or icon
  window.addEventListener("click", function (e) {
    var themeBtn = e.target.closest(".theme-toggle, #themeToggle, #mobileThemeToggle");
    if (themeBtn) {
      e.preventDefault();
      var currentTheme = document.documentElement.getAttribute("data-theme") || "light";
      var newTheme = currentTheme === "dark" ? "light" : "dark";
      applyTheme(newTheme);
      return;
    }

    var rtlBtn = e.target.closest(".rtl-toggle, #rtlToggle, #mobileRtlToggle");
    if (rtlBtn) {
      e.preventDefault();
      var currentDir = document.documentElement.getAttribute("dir") || "ltr";
      var newDir = currentDir === "rtl" ? "ltr" : "rtl";
      applyDir(newDir);
      return;
    }
  }, true);
})();

/* ==========================================================================
   SolarBright — Home Page Interactions
   ========================================================================== */
(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Footer year ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Sticky header state ---------- */
  var header = document.getElementById("siteHeader");
  function updateHeaderState() {
    if (!header) return;
    if (window.scrollY > 24) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  if (header) {
    updateHeaderState();
    window.addEventListener("scroll", updateHeaderState, { passive: true });
  }

  /* ---------- Hero Image Carousel ---------- */
  var heroCarousel = document.getElementById("heroCarousel");
  if (heroCarousel) {
    var slides = Array.prototype.slice.call(heroCarousel.querySelectorAll(".hero-carousel-slide"));
    var dots = Array.prototype.slice.call(heroCarousel.querySelectorAll(".dot"));
    var prevBtn = document.getElementById("heroPrevBtn");
    var nextBtn = document.getElementById("heroNextBtn");
    var currentIndex = 0;
    var timer = null;

    function goToSlide(index) {
      if (index < 0) index = slides.length - 1;
      if (index >= slides.length) index = 0;
      currentIndex = index;

      slides.forEach(function (slide, idx) {
        slide.classList.toggle("active", idx === currentIndex);
      });
      dots.forEach(function (dot, idx) {
        dot.classList.toggle("active", idx === currentIndex);
      });
    }

    function startAutoPlay() {
      stopAutoPlay();
      if (!reducedMotion) {
        timer = setInterval(function () {
          goToSlide(currentIndex + 1);
        }, 4500);
      }
    }

    function stopAutoPlay() {
      if (timer) clearInterval(timer);
    }

    if (prevBtn) {
      prevBtn.addEventListener("click", function () {
        goToSlide(currentIndex - 1);
        startAutoPlay();
      });
    }
    if (nextBtn) {
      nextBtn.addEventListener("click", function () {
        goToSlide(currentIndex + 1);
        startAutoPlay();
      });
    }

    dots.forEach(function (dot, idx) {
      dot.addEventListener("click", function () {
        goToSlide(idx);
        startAutoPlay();
      });
    });

    heroCarousel.addEventListener("mouseenter", stopAutoPlay);
    heroCarousel.addEventListener("mouseleave", startAutoPlay);

    startAutoPlay();
  }

  /* ---------- Active nav link handling ---------- */
  var currentPath = window.location.pathname.split("/").pop() || "index.html";
  if (currentPath === "") currentPath = "index.html";

  var desktopNavLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  var mobileNavLinks = Array.prototype.slice.call(document.querySelectorAll(".mobile-link"));

  function highlightPageLinks() {
    desktopNavLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === currentPath || (currentPath === "index.html" && (href === "index.html" || href === "./"))) {
        link.classList.add("active");
      } else if (href && !href.startsWith("#")) {
        link.classList.remove("active");
      }
    });
    mobileNavLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href === currentPath || (currentPath === "index.html" && (href === "index.html" || href === "./"))) {
        link.classList.add("active");
      } else if (href && !href.startsWith("#")) {
        link.classList.remove("active");
      }
    });
  }
  highlightPageLinks();

  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  function updateActiveNav() {
    if (!sections.length) return;
    var scrollPos = window.scrollY + 140;
    var current = null;
    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) current = section.id;
    });
    if (!current) return;
    desktopNavLinks.forEach(function (link) {
      var href = link.getAttribute("href");
      if (href && href.startsWith("#")) {
        link.classList.toggle("active", href === "#" + current);
      }
    });
  }
  if (sections.length > 0) {
    window.addEventListener("scroll", updateActiveNav, { passive: true });
  }

  /* ---------- Mobile menu ---------- */
  var hamburger = document.getElementById("hamburgerBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  var backdrop = document.getElementById("mobileMenuBackdrop");
  var mobileCloseBtn = document.getElementById("mobileMenuCloseBtn");

  function openMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
    mobileMenu.classList.add("open");
    mobileMenu.setAttribute("aria-hidden", "false");
    if (backdrop) backdrop.classList.add("open");
    document.documentElement.style.overflow = "hidden";
  }
  function closeMenu() {
    if (!hamburger || !mobileMenu) return;
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    if (backdrop) backdrop.classList.remove("open");
    document.documentElement.style.overflow = "";
  }
  if (hamburger) {
    hamburger.addEventListener("click", function () {
      mobileMenu.classList.contains("open") ? closeMenu() : openMenu();
    });
  }
  if (mobileCloseBtn) {
    mobileCloseBtn.addEventListener("click", closeMenu);
  }
  if (backdrop) backdrop.addEventListener("click", closeMenu);
  if (mobileMenu) {
    Array.prototype.slice.call(mobileMenu.querySelectorAll("nav a")).forEach(function (link) {
      link.addEventListener("click", closeMenu);
    });
  }
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeMenu();
  });

  /* ---------- Scroll reveal ---------- */
  document.documentElement.classList.add("js-reveal");
  var revealEls = Array.prototype.slice.call(document.querySelectorAll("[data-reveal]"));
  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.05, rootMargin: "50px 0px 0px 0px" }
    );
    revealEls.forEach(function (el) { revealObserver.observe(el); });
  }

  /* ---------- Animated number counters ---------- */
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count-to]"));
  function animateCounter(el) {
    var target = parseFloat(el.getAttribute("data-count-to"), 10);
    if (isNaN(target)) return;
    if (reducedMotion) {
      el.textContent = target.toLocaleString("en-IN");
      return;
    }
    var duration = 1400;
    var start = null;
    function step(timestamp) {
      if (!start) start = timestamp;
      var progress = Math.min((timestamp - start) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3); /* ease-out cubic */
      var value = Math.round(target * eased);
      el.textContent = value.toLocaleString("en-IN");
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString("en-IN");
      }
    }
    window.requestAnimationFrame(step);
  }

  if (counters.length) {
    if (!("IntersectionObserver" in window)) {
      counters.forEach(animateCounter);
    } else {
      var counterObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              animateCounter(entry.target);
              counterObserver.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.5 }
      );
      counters.forEach(function (el) { counterObserver.observe(el); });
    }
  }

  /* ---------- Subtle hero parallax ---------- */
  var parallaxEl = document.querySelector("[data-parallax] img");
  if (parallaxEl && !reducedMotion) {
    window.addEventListener(
      "scroll",
      function () {
        var offset = Math.min(window.scrollY * 0.12, 60);
        parallaxEl.style.transform = "scale(1.05) translateY(" + offset + "px)";
      },
      { passive: true }
    );
  }

  /* ---------- Home 2 Architectural Roof Aesthetic Studio ---------- */
  var matButtons = Array.prototype.slice.call(document.querySelectorAll(".h2-mat-btn"));
  var matImage = document.getElementById("matImage");
  var matTitle = document.getElementById("matTitle");
  var matDesc = document.getElementById("matDesc");
  var matTag = document.getElementById("matTag");

  var matDataMap = {
    slate: {
      title: "Dark Slate Tile Flush Mount",
      desc: "Custom low-profile black anodized clamps align parallel to slate roof lines, maintaining original home curb appeal while maximizing solar yield.",
      tag: "Flush Monocrystalline Integration",
      img: "assets/images/home2-roof-plan.jpg"
    },
    concrete: {
      title: "Flat Concrete Roof Elevated Array",
      desc: "Ballasted non-penetrating elevated mounts with 15-degree optimized solar tilt angles designed for flat concrete villa terraced roofs.",
      tag: "15° Ballasted Tilt Geometry",
      img: "assets/images/products-hero-cutaway.jpg"
    },
    terracotta: {
      title: "Terracotta Clay Tile Weather-Seal",
      desc: "Custom stainless steel tile replacement hooks with EPDM rubber flashing ensure 100% zero water leakage on traditional terracotta clay tile roofs.",
      tag: "Zero-Leak Flashing Guarantee",
      img: "assets/images/about-engineering-detail.jpg"
    },
    metal: {
      title: "Standing Seam Metal Clamp System",
      desc: "Direct non-invasive seam clamps lock onto standing seam metal roofs without drilling holes, preserving factory roof warranties completely.",
      tag: "Zero-Drill Non-Invasive Clamping",
      img: "assets/images/products-panel-closeup.jpg"
    }
  };

  if (matButtons.length && matImage) {
    matButtons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var mat = btn.getAttribute("data-mat");
        var data = matDataMap[mat];
        if (!data) return;

        matButtons.forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");

        matImage.style.opacity = "0.3";
        setTimeout(function () {
          matImage.src = data.img;
          matImage.style.opacity = "1";
        }, 200);

        if (matTitle) matTitle.textContent = data.title;
        if (matDesc) matDesc.textContent = data.desc;
        if (matTag) matTag.textContent = data.tag;
      });
    });
  }

  var timeSlots = Array.prototype.slice.call(document.querySelectorAll(".h2-time-btn, .time-slot-btn"));
  var chartNodes = Array.prototype.slice.call(document.querySelectorAll(".h2-chart-node"));
  var graphBadge = document.querySelector(".h2-graph-badge");
  var timeInfoMap = {
    morning: "Morning Solar Generation Peak",
    midday: "Midday Optimal Direct Sunlight",
    afternoon: "Afternoon High Thermal Conversion",
    evening: "Evening Battery Storage Transition"
  };

  function selectTimeSlot(timeStr) {
    if (!timeSlots.length) return;
    timeSlots.forEach(function (slot) {
      slot.classList.toggle("active", slot.getAttribute("data-time") === timeStr);
    });
    chartNodes.forEach(function (node) {
      var isMatch = node.getAttribute("data-time") === timeStr;
      node.classList.toggle("active", isMatch);
      if (isMatch) {
        node.setAttribute("r", "9");
        node.setAttribute("fill", "#E9BD3F");
      } else {
        node.setAttribute("r", "6");
        node.setAttribute("fill", "#4D9948");
      }
    });
    if (graphBadge && timeInfoMap[timeStr]) {
      graphBadge.textContent = "Active View: " + timeInfoMap[timeStr];
    }
  }

  if (timeSlots.length) {
    timeSlots.forEach(function (slot) {
      slot.addEventListener("click", function () {
        selectTimeSlot(slot.getAttribute("data-time"));
      });
    });
    chartNodes.forEach(function (node) {
      node.addEventListener("click", function () {
        selectTimeSlot(node.getAttribute("data-time"));
      });
    });
  }

  /* ---------- Home 2 25-Year Asset Timeline Interaction ---------- */
  var assetCards = Array.prototype.slice.call(document.querySelectorAll(".h2-horizon-card"));
  assetCards.forEach(function (card) {
    card.addEventListener("mouseenter", function () {
      assetCards.forEach(function (c) { c.classList.remove("active"); });
      card.classList.add("active");
    });
    card.addEventListener("click", function () {
      assetCards.forEach(function (c) { c.classList.remove("active"); });
      card.classList.add("active");
    });
  });

  /* ---------- Mobile Sticky Bar Scroll Visibility ---------- */
  var mobileStickyBar = document.getElementById("mobileStickyBar");
  if (mobileStickyBar) {
    window.addEventListener("scroll", function () {
      if (window.scrollY > 400) {
        mobileStickyBar.style.display = "flex";
      } else {
        mobileStickyBar.style.display = "none";
      }
    }, { passive: true });
  }

  /* ---------- Products Page — Configurable Capacity Data ---------- */
  var capacityData = {
    "1": {
      title: "1 kW Compact Rooftop Solar System",
      desc: "Ideal compact solar entry system for small single-floor homes and essential lighting loads.",
      gen: "4 – 4.5 kWh / day",
      area: "90 – 110 sq ft",
      panels: "2 – 3 High-Efficiency Panels",
      inverter: "1.2 kW Single-Phase String Inverter",
      suitability: "1-2 BHK Single-Floor Homes, Essential Lighting & Fan Loads"
    },
    "2": {
      title: "2 kW Residential Rooftop Solar System",
      desc: "Designed for small family homes seeking utility bill reductions.",
      gen: "8 – 9 kWh / day",
      area: "170 – 210 sq ft",
      panels: "4 – 5 High-Efficiency Panels",
      inverter: "2.5 kW Single-Phase Smart Inverter",
      suitability: "2 BHK Independent Homes, Refrigerators, Televisions & Lighting"
    },
    "3": {
      title: "3 kW Standard Household Solar System",
      desc: "Our most popular choice for 2-3 BHK independent residential properties.",
      gen: "12 – 14 kWh / day",
      area: "250 – 300 sq ft",
      panels: "6 – 7 High-Efficiency Panels",
      inverter: "3.3 kW Single-Phase Smart Inverter",
      suitability: "3 BHK Independent Houses, Air Conditioners, Appliances & Lighting"
    },
    "5": {
      title: "5 kW Monocrystalline Villa Rooftop System",
      desc: "Balanced solar energy system for medium-to-large residential villas and small offices.",
      gen: "20 – 22 kWh / day",
      area: "400 – 480 sq ft",
      panels: "10 – 12 High-Efficiency Panels",
      inverter: "5.4 kW Dual-MPPT Smart Inverter",
      suitability: "3-4 BHK Villas, Large Independent Homes, Small Commercial Offices"
    },
    "7.5": {
      title: "7.5 kW High-Yield Commercial & Villa System",
      desc: "High-capacity array designed for large multi-story residences and daytime commercial shops.",
      gen: "30 – 34 kWh / day",
      area: "600 – 720 sq ft",
      panels: "15 – 18 High-Efficiency Panels",
      inverter: "8 kW Three-Phase Inverter",
      suitability: "Luxury Villas, Multi-Story Houses, Boutique Retail Shops"
    },
    "10": {
      title: "10 kW Full Infrastructure Solar System",
      desc: "Maximum residential & small office solar array for comprehensive grid independence.",
      gen: "40 – 45 kWh / day",
      area: "800 – 950 sq ft",
      panels: "20 – 24 High-Efficiency Panels",
      inverter: "10 kW Three-Phase Smart Inverter",
      suitability: "Commercial Workspaces, Large Villas, EV Charging & Heavy HVAC Loads"
    }
  };

  var capPills = Array.prototype.slice.call(document.querySelectorAll(".pr-cap-pill"));
  var capVal = document.getElementById("capVal");
  var capTitle = document.getElementById("capTitle");
  var capDesc = document.getElementById("capDesc");
  var capGen = document.getElementById("capGen");
  var capArea = document.getElementById("capArea");
  var capPanels = document.getElementById("capPanels");
  var capInverter = document.getElementById("capInverter");
  var capSuitability = document.getElementById("capSuitability");

  function updateCapacityDisplay(key) {
    var data = capacityData[key];
    if (!data) return;
    capPills.forEach(function (pill) {
      pill.classList.toggle("active", pill.getAttribute("data-cap") === key);
    });
    if (capVal) capVal.textContent = key;
    if (capTitle) capTitle.textContent = data.title;
    if (capDesc) capDesc.textContent = data.desc;
    if (capGen) capGen.textContent = data.gen;
    if (capArea) capArea.textContent = data.area;
    if (capPanels) capPanels.textContent = data.panels;
    if (capInverter) capInverter.textContent = data.inverter;
    if (capSuitability) capSuitability.textContent = data.suitability;
  }

  capPills.forEach(function (pill) {
    pill.addEventListener("click", function () {
      updateCapacityDisplay(pill.getAttribute("data-cap"));
    });
  });

  /* ---------- Property Selection Interaction ---------- */
  var propCards = Array.prototype.slice.call(document.querySelectorAll(".pr-prop-card"));
  propCards.forEach(function (card) {
    card.addEventListener("click", function () {
      propCards.forEach(function (c) { c.classList.remove("active"); });
      card.classList.add("active");
      var propType = card.getAttribute("data-property");
      if (propType === "home") updateCapacityDisplay("3");
      else if (propType === "villa") updateCapacityDisplay("5");
      else if (propType === "shop") updateCapacityDisplay("7.5");
      else if (propType === "office") updateCapacityDisplay("10");
    });
  });

  /* ---------- Products Decision Tree Tool ---------- */
  var qOptions = Array.prototype.slice.call(document.querySelectorAll(".q-opt"));
  var recommendTitle = document.getElementById("recommendTitle");
  var recommendSub = document.getElementById("recommendSub");

  function calculateRecommendation() {
    var activeProp = document.querySelector("#qProp .q-opt.active");
    var activeBill = document.querySelector("#qBill .q-opt.active");
    var activeRoof = document.querySelector("#qRoof .q-opt.active");

    var propVal = activeProp ? activeProp.getAttribute("data-val") : "home";
    var billVal = activeBill ? activeBill.getAttribute("data-val") : "med";

    if (billVal === "low") {
      if (recommendTitle) recommendTitle.textContent = "2–3 kW ESSENTIAL SYSTEM";
      if (recommendSub) recommendSub.textContent = "Tailored for low-to-moderate electricity consumption and compact roof areas.";
    } else if (billVal === "high" || propVal === "villa" || propVal === "office") {
      if (recommendTitle) recommendTitle.textContent = "7.5–10 kW ADVANCED SYSTEM";
      if (recommendSub) recommendSub.textContent = "Engineered for high daily electricity demand, heavy HVAC cooling, or workspace loads.";
    } else {
      if (recommendTitle) recommendTitle.textContent = "5 kW SMART SYSTEM";
      if (recommendSub) recommendSub.textContent = "Balanced capacity offering peak generation for typical family homes and independent villas.";
    }
  }

  qOptions.forEach(function (opt) {
    opt.addEventListener("click", function () {
      var parent = opt.parentElement;
      if (parent) {
        Array.prototype.slice.call(parent.querySelectorAll(".q-opt")).forEach(function (o) {
          o.classList.remove("active");
        });
      }
      opt.classList.add("active");
      calculateRecommendation();
    });
  });

  /* ---------- Services Studio — Interactive Service Index ---------- */
  var svRows = Array.prototype.slice.call(document.querySelectorAll(".sv-index-row"));
  svRows.forEach(function (row) {
    var header = row.querySelector(".sv-row-header");
    if (header) {
      header.addEventListener("click", function () {
        var isAlreadyActive = row.classList.contains("active");
        svRows.forEach(function (r) { r.classList.remove("active"); });
        if (!isAlreadyActive) {
          row.classList.add("active");
        }
      });
    }
  });

  /* ---------- Services Studio — Request Form Options ---------- */
  var svPillOpts = Array.prototype.slice.call(document.querySelectorAll(".sv-pill-opt"));
  svPillOpts.forEach(function (opt) {
    opt.addEventListener("click", function () {
      var parent = opt.parentElement;
      if (parent) {
        Array.prototype.slice.call(parent.querySelectorAll(".sv-pill-opt")).forEach(function (o) {
          o.classList.remove("active");
        });
      }
      opt.classList.add("active");
    });
  });

  /* ---------- Solar Plans — Decision Map Click Navigation ---------- */
  var scenarioRows = Array.prototype.slice.call(document.querySelectorAll(".pl-scenario-row"));
  scenarioRows.forEach(function (row) {
    row.addEventListener("click", function () {
      scenarioRows.forEach(function (r) { r.classList.remove("active"); });
      row.classList.add("active");
      var planId = row.getAttribute("data-plan");
      var targetElem = document.getElementById(planId);
      if (targetElem) {
        targetElem.scrollIntoView({ behavior: "smooth" });
      }
    });
  });

  /* ---------- Solar Plans — Questionnaire Logic ---------- */
  var toolOpts = Array.prototype.slice.call(document.querySelectorAll(".tool-opt"));
  var planResultTitle = document.getElementById("planResultTitle");
  var planResultSub = document.getElementById("planResultSub");

  function calculatePlanRecommendation() {
    var activeLoc = document.querySelector("#toolLoc .tool-opt.active");
    var activeGoal = document.querySelector("#toolGoal .tool-opt.active");
    var activeGrowth = document.querySelector("#toolGrowth .tool-opt.active");

    var locVal = activeLoc ? activeLoc.getAttribute("data-val") : "home";
    var goalVal = activeGoal ? activeGoal.getAttribute("data-val") : "simple";
    var growthVal = activeGrowth ? activeGrowth.getAttribute("data-val") : "no";

    if (growthVal === "yes" || goalVal === "grow") {
      if (planResultTitle) planResultTitle.textContent = "FUTURE READY PLAN";
      if (planResultSub) planResultSub.textContent = "Modular approach prepared for future battery storage, EV charging, and high consumption.";
    } else if (locVal === "shop" || locVal === "office" || goalVal === "biz") {
      if (planResultTitle) planResultTitle.textContent = "BUSINESS PLAN";
      if (planResultSub) planResultSub.textContent = "Daytime commercial offset tailored for business hours, 3-phase load balancing, and continuity.";
    } else if (goalVal === "monitor" || locVal === "villa") {
      if (planResultTitle) planResultTitle.textContent = "SMART PLAN";
      if (planResultSub) planResultSub.textContent = "High-efficiency approach offering live app tracking, yield control, and maximum residential output.";
    } else {
      if (planResultTitle) planResultTitle.textContent = "ESSENTIAL PLAN";
      if (planResultSub) planResultSub.textContent = "Straightforward solar solution for everyday homes seeking reliable grid power reduction.";
    }
  }

  toolOpts.forEach(function (opt) {
    opt.addEventListener("click", function () {
      var parent = opt.parentElement;
      if (parent) {
        Array.prototype.slice.call(parent.querySelectorAll(".tool-opt")).forEach(function (o) {
          o.classList.remove("active");
        });
      }
      opt.classList.add("active");
      calculatePlanRecommendation();
    });
  });

  /* ---------- Gallery Page — Category Filter Logic ---------- */
  var glFilterBtns = Array.prototype.slice.call(document.querySelectorAll(".gl-filter-btn"));
  var glCards = Array.prototype.slice.call(document.querySelectorAll(".gl-card"));

  glFilterBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      glFilterBtns.forEach(function (b) { b.classList.remove("active"); });
      btn.classList.add("active");
      var filterValue = btn.getAttribute("data-filter");

      glCards.forEach(function (card) {
        var cardCat = card.getAttribute("data-category");
        if (filterValue === "all" || cardCat === filterValue) {
          card.style.display = "flex";
        } else {
          card.style.display = "none";
        }
      });
    });
  });

  /* ---------- Gallery Page — Centered View More Button Logic ---------- */
  var viewMoreBtn = document.getElementById("viewMoreBtn");
  if (viewMoreBtn) {
    viewMoreBtn.addEventListener("click", function () {
      viewMoreBtn.innerHTML = 'Loading Additional Projects...';
      setTimeout(function () {
        viewMoreBtn.innerHTML = 'All 24 Projects Displayed';
        viewMoreBtn.classList.remove("btn-primary");
        viewMoreBtn.classList.add("btn-secondary");
        viewMoreBtn.style.opacity = "0.8";
      }, 600);
    });
  }

  /* ---------- Contact Page — Form Submission Handler ---------- */
  var solarContactForm = document.getElementById("solarContactForm");
  var formSuccessMessage = document.getElementById("formSuccessMessage");
  var submitFormBtn = document.getElementById("submitFormBtn");

  if (solarContactForm) {
    solarContactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (submitFormBtn) {
        submitFormBtn.innerHTML = 'Submitting Request...';
        submitFormBtn.disabled = true;
      }
      setTimeout(function () {
        if (formSuccessMessage) {
          formSuccessMessage.style.display = "block";
        }
        if (submitFormBtn) {
          submitFormBtn.innerHTML = 'Request Submitted';
          submitFormBtn.style.opacity = "0.7";
        }
        solarContactForm.reset();
      }, 800);
    });
  }

  /* ---------- Password Visibility Toggle ---------- */
  var passwordToggleBtns = Array.prototype.slice.call(document.querySelectorAll(".btn-toggle-password"));
  passwordToggleBtns.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var input = btn.previousElementSibling || btn.parentElement.querySelector("input");
      if (!input) return;
      var isPassword = input.getAttribute("type") === "password";
      input.setAttribute("type", isPassword ? "text" : "password");
      var eyeOpen = btn.querySelector(".eye-open");
      var eyeClosed = btn.querySelector(".eye-closed");
      if (eyeOpen && eyeClosed) {
        eyeOpen.style.display = isPassword ? "none" : "block";
        eyeClosed.style.display = isPassword ? "block" : "none";
      }
    });
  });

  /* ---------- Login Form Handler ---------- */
  var loginForm = document.getElementById("loginForm");
  var loginSuccessAlert = document.getElementById("loginSuccessAlert");
  var loginSubmitBtn = document.getElementById("loginSubmitBtn");
  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (loginSubmitBtn) {
        loginSubmitBtn.innerHTML = "Authenticating...";
        loginSubmitBtn.disabled = true;
      }
      setTimeout(function () {
        if (loginSuccessAlert) loginSuccessAlert.style.display = "block";
        if (loginSubmitBtn) loginSubmitBtn.innerHTML = "Redirecting...";
        setTimeout(function () { window.location.href = "index.html"; }, 1000);
      }, 700);
    });
  }

  /* ---------- Sign Up Form Handler ---------- */
  var signupForm = document.getElementById("signupForm");
  var signupSuccessAlert = document.getElementById("signupSuccessAlert");
  var signupSubmitBtn = document.getElementById("signupSubmitBtn");
  if (signupForm) {
    signupForm.addEventListener("submit", function (e) {
      e.preventDefault();
      if (signupSubmitBtn) {
        signupSubmitBtn.innerHTML = "Creating Account...";
        signupSubmitBtn.disabled = true;
      }
      setTimeout(function () {
        if (signupSuccessAlert) signupSuccessAlert.style.display = "block";
        if (signupSubmitBtn) signupSubmitBtn.innerHTML = "Account Created";
        setTimeout(function () { window.location.href = "login.html"; }, 1000);
      }, 700);
    });
  }

  /* ---------- Social Auth Handlers ---------- */
  var socialBtns = ["googleLoginBtn", "appleLoginBtn", "googleSignupBtn", "appleSignupBtn"];
  socialBtns.forEach(function (id) {
    var btn = document.getElementById(id);
    if (btn) {
      btn.addEventListener("click", function () {
        btn.style.opacity = "0.7";
        btn.querySelector("span").textContent = "Connecting...";
        setTimeout(function () {
          window.location.href = "index.html";
        }, 600);
      });
    }
  });
})();







