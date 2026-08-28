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
    if (window.scrollY > 24) {
      header.classList.add("scrolled");
    } else {
      header.classList.remove("scrolled");
    }
  }
  updateHeaderState();
  window.addEventListener("scroll", updateHeaderState, { passive: true });

  /* ---------- Active nav link on scroll ---------- */
  var sections = Array.prototype.slice.call(document.querySelectorAll("main section[id]"));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".nav-link"));
  function updateActiveNav() {
    var scrollPos = window.scrollY + 140;
    var current = sections[0] ? sections[0].id : null;
    sections.forEach(function (section) {
      if (section.offsetTop <= scrollPos) current = section.id;
    });
    navLinks.forEach(function (link) {
      var match = link.getAttribute("href") === "#" + current;
      link.classList.toggle("active", match);
    });
  }
  window.addEventListener("scroll", updateActiveNav, { passive: true });

  /* ---------- Theme toggle (persisted) ---------- */
  var themeToggle = document.getElementById("themeToggle");
  var root = document.body;
  var STORAGE_KEY = "solarbright-theme";

  function applyTheme(theme) {
    root.setAttribute("data-theme", theme);
    themeToggle.setAttribute("aria-pressed", theme === "dark");
  }

  var savedTheme = null;
  try { savedTheme = localStorage.getItem(STORAGE_KEY); } catch (e) { /* storage unavailable */ }

  if (savedTheme) {
    applyTheme(savedTheme);
  } else if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
    applyTheme("dark");
  }

  themeToggle.addEventListener("click", function () {
    var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
    applyTheme(next);
    try { localStorage.setItem(STORAGE_KEY, next); } catch (e) { /* storage unavailable */ }
  });

  /* ---------- Mobile menu ---------- */
  var hamburger = document.getElementById("hamburgerBtn");
  var mobileMenu = document.getElementById("mobileMenu");
  var backdrop = document.getElementById("mobileMenuBackdrop");

  function openMenu() {
    hamburger.classList.add("open");
    hamburger.setAttribute("aria-expanded", "true");
    mobileMenu.classList.add("open");
    mobileMenu.setAttribute("aria-hidden", "false");
    backdrop.classList.add("open");
    document.documentElement.style.overflow = "hidden";
  }
  function closeMenu() {
    hamburger.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("open");
    mobileMenu.setAttribute("aria-hidden", "true");
    backdrop.classList.remove("open");
    document.documentElement.style.overflow = "";
  }
  hamburger.addEventListener("click", function () {
    mobileMenu.classList.contains("open") ? closeMenu() : openMenu();
  });
  backdrop.addEventListener("click", closeMenu);
  Array.prototype.slice.call(mobileMenu.querySelectorAll("a")).forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });
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

  /* ---------- Home 2 Interactive Day Cycle Timeline ---------- */
  var timeSlots = Array.prototype.slice.call(document.querySelectorAll(".h2-time-slot"));
  var chartNodes = Array.prototype.slice.call(document.querySelectorAll(".chart-node"));
  var graphBadge = document.getElementById("graphTimeBadge");

  var timeInfoMap = {
    "6 AM": "6:00 AM (Sunrise — Generation Begins)",
    "9 AM": "9:00 AM (Morning — Production Building)",
    "12 PM": "12:00 PM (Midday — Peak Solar Output)",
    "3 PM": "3:00 PM (Afternoon — Direct Appliance Power)",
    "6 PM": "6:00 PM (Sunset — Transitioning to Grid/Saved)",
    "9 PM": "9:00 PM (Night — Battery / Grid Power)"
  };

  function selectTimeSlot(timeStr) {
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
})();







