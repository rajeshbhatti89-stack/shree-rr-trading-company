/**
 * SHREE RR TRADING COMPANY - MAIN WEB APPLICATION LOGIC
 * Theme: Official Logo Palette (#FF7A00 Excavator Orange & Deep Navy)
 * Interactivity: Ambuja Cement Darlaghat Fleet Showcase, Lease Calculator & PeachWeb Tilt Effects
 */

// Real Machinery Site Metadata Dictionary (Ambuja Cement Darlaghat Contract)
const REAL_MACHINE_SITE_DATA = {
  tipper: {
    img: "images/tipper.png",
    locationTag: "<i class='fa-solid fa-location-dot'></i> AMBUJA CEMENT DARLAGHAT LIMESTONE MINE PIT (HIMACHAL PRADESH)",
    title: "Tata Signa 3525.K Heavy Tipper Truck (35T)",
    tag: "MINING DUMPER / FLEET"
  },
  excavator: {
    img: "images/excavator.png",
    locationTag: "<i class='fa-solid fa-location-dot'></i> AMBUJA CEMENT DARLAGHAT HEAVY QUARRY (HIMACHAL PRADESH)",
    title: "CAT 380 / Komatsu PC500 Mining Excavator",
    tag: "HEMM / EXCAVATOR"
  },
  bobcat: {
    img: "images/bobcat.png",
    locationTag: "<i class='fa-solid fa-location-dot'></i> INDUSTRIAL MINING SITE CLEANUP & LEASE (DARLAGHAT SECTOR)",
    title: "Bobcat S450 Skid-Steer Compact Loader",
    tag: "COMPACT UTILITY LEASE"
  },
  jcb: {
    img: "images/jcb.png",
    locationTag: "<i class='fa-solid fa-location-dot'></i> STATE & NATIONAL HIGHWAY ROAD CONTRACT",
    title: "JCB 3CX EcoXcellence Backhoe Loader",
    tag: "INDUSTRIAL MULTI-PURPOSE"
  },
  roller: {
    tag: "GOVT ROAD CONTRACT",
    img: "images/roller.png",
    locationTag: "<i class='fa-solid fa-location-dot'></i> GOVT HIGHWAY ASPHALT PAVING CONTRACT",
    title: "Hamm / Volvo Tandem Asphalt Road Roller"
  }
};

// Fleet Catalog Data with Real Site Imagery (Ambuja Darlaghat Contract Focus)
const RENTAL_FLEET_DATA = [
  {
    id: 1,
    name: "Tata Signa 3525.K Mining Tipper Truck",
    category: "mining",
    rate: "₹4,500 / Shift",
    badge: "AMBUJA DARLAGHAT FLEET",
    img: "images/tipper.png",
    specs: ["35 Tonne Payload", "250 HP Cummins Engine", "8x4 Heavy Axle"]
  },
  {
    id: 2,
    name: "CAT 380 / Komatsu PC500 HEMM Excavator",
    category: "mining",
    rate: "₹8,500 / Shift",
    badge: "AMBUJA DARLAGHAT QUARRY",
    img: "images/excavator.png",
    specs: ["48 Tonne Class", "3.2 m³ Rock Bucket", "High Hydro Output"]
  },
  {
    id: 3,
    name: "Bobcat S450 Skid-Steer Loader",
    category: "compact",
    rate: "₹2,800 / Shift",
    badge: "COMPACT LEASE FAVORITE",
    img: "images/bobcat.png",
    specs: ["608 kg Rated Capacity", "Auger & Breaker Option", "Compact Mobility"]
  },
  {
    id: 4,
    name: "JCB 3CX EcoXcellence Backhoe Loader",
    category: "compact",
    rate: "₹3,200 / Shift",
    badge: "VERSATILE UTILITY",
    img: "images/jcb.png",
    specs: ["4.77m Dig Depth", "1.1 m³ Loader Bucket", "76 HP Turbo Engine"]
  },
  {
    id: 5,
    name: "Hamm / Volvo Tandem Asphalt Road Roller",
    category: "road",
    rate: "₹3,800 / Shift",
    badge: "GOVT ROAD HIGHWAY",
    img: "images/roller.png",
    specs: ["11 Tonne Vibratory", "1,680mm Drum Width", "Automated Compactor"]
  },
  {
    id: 6,
    name: "Vögele Super 1800 Asphalt Paver",
    category: "road",
    rate: "₹12,000 / Shift",
    badge: "HIGHWAY PAVING CONTRACT",
    img: "images/roller.png",
    specs: ["10 Meter Max Pave Width", "700 Tonnes/Hr Capacity", "Sensronic Grade"]
  }
];

document.addEventListener("DOMContentLoaded", () => {
  renderFleetCatalog('all');
  setupFilterTabs();
  setupLeaseCalculator();
  setupScrollEffects();
  animateNumericCounters();
  setupMobileNav();
  setupViewModeToggle();
  setupPeachWebTiltEffects();
});

/* ==========================================
   1. REAL SITE PHOTO & 3D MODE TOGGLE
   ========================================== */
function setupViewModeToggle() {
  const photoBtn = document.getElementById("mode-photo-btn");
  const canvas3dBtn = document.getElementById("mode-3d-btn");
  const photoContainer = document.getElementById("real-photo-view");
  const canvas3d = document.getElementById("equipment-3d-canvas");
  const hudControls = document.getElementById("hud-overlay-controls");

  if (photoBtn && canvas3dBtn) {
    photoBtn.addEventListener("click", () => {
      photoBtn.classList.add("active");
      canvas3dBtn.classList.remove("active");
      if (photoContainer) photoContainer.style.display = "flex";
      if (canvas3d) canvas3d.style.display = "none";
      if (hudControls) hudControls.style.display = "none";
    });

    canvas3dBtn.addEventListener("click", () => {
      canvas3dBtn.classList.add("active");
      photoBtn.classList.remove("active");
      if (photoContainer) photoContainer.style.display = "none";
      if (canvas3d) canvas3d.style.display = "block";
      if (hudControls) hudControls.style.display = "flex";
    });
  }
}

function updateRealMachinePhoto(type) {
  const data = REAL_MACHINE_SITE_DATA[type];
  if (!data) return;

  const imgElem = document.getElementById("real-machine-img");
  const tagElem = document.getElementById("photo-contract-tag");

  if (imgElem) imgElem.src = data.img;
  if (tagElem) tagElem.innerHTML = data.locationTag;
}

/* ==========================================
   2. RENTAL FLEET CATALOG & FILTERING
   ========================================== */
function renderFleetCatalog(filterCategory) {
  const grid = document.getElementById("rental-cards-grid");
  if (!grid) return;

  const filteredItems = filterCategory === 'all'
    ? RENTAL_FLEET_DATA
    : RENTAL_FLEET_DATA.filter(item => item.category === filterCategory);

  grid.innerHTML = filteredItems.map(item => `
    <div class="rental-card glow-card peach-glass">
      <div class="rental-card-img">
        <span class="rental-card-badge">${item.badge}</span>
        <img src="${item.img}" alt="${item.name}">
      </div>
      <h3>${item.name}</h3>
      <div class="rental-rate">${item.rate}</div>
      <div class="rental-specs-mini">
        ${item.specs.map(s => `<span><i class="fa-solid fa-check text-success"></i> ${s}</span>`).join("")}
      </div>
      <button class="btn btn-primary btn-sm w-100" onclick="openQuoteForFleetItem('${item.name}')">
        <i class="fa-solid fa-key"></i> Request Lease / Quote
      </button>
    </div>
  `).join("");
}

function setupFilterTabs() {
  const tabs = document.querySelectorAll("#filter-tabs .tab-btn");
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      const category = tab.getAttribute("data-filter");
      renderFleetCatalog(category);
    });
  });
}

/* ==========================================
   3. INSTANT LEASE COST ESTIMATOR
   ========================================== */
function setupLeaseCalculator() {
  const machineSelect = document.getElementById("calc-machine");
  const qtyInput = document.getElementById("calc-qty");
  const daysInput = document.getElementById("calc-days");
  const operatorRadios = document.querySelectorAll("input[name='calc-operator']");

  if (!machineSelect || !qtyInput || !daysInput) return;

  function calculate() {
    const selectedOption = machineSelect.options[machineSelect.selectedIndex];
    const baseRate = parseFloat(selectedOption.getAttribute("data-rate")) || 4500;
    const qty = parseInt(qtyInput.value) || 1;
    const days = parseInt(daysInput.value) || 1;

    let operatorMultiplier = 1.0;
    const selectedOperator = document.querySelector("input[name='calc-operator']:checked")?.value;
    if (selectedOperator === 'dry_lease') {
      operatorMultiplier = 0.82;
    }

    const totalShifts = qty * days;
    let discount = 0;

    if (days >= 90 || qty >= 5) {
      discount = 0.20;
    } else if (days >= 30 || qty >= 2) {
      discount = 0.15;
    } else if (days >= 7) {
      discount = 0.08;
    }

    const grossTotal = totalShifts * baseRate * operatorMultiplier;
    const finalTotal = Math.round(grossTotal * (1 - discount));

    // Update Summary UI
    document.getElementById("summary-base").textContent = `₹${baseRate.toLocaleString('en-IN')}`;
    document.getElementById("summary-qty").textContent = `${qty} ${qty > 1 ? 'Units' : 'Unit'}`;
    document.getElementById("summary-shifts").textContent = `${totalShifts} Shifts`;
    document.getElementById("summary-discount").textContent = discount > 0 ? `${Math.round(discount * 100)}% Off` : `Standard Rate`;
    document.getElementById("summary-total-price").textContent = `₹${finalTotal.toLocaleString('en-IN')}`;
  }

  machineSelect.addEventListener("change", calculate);
  qtyInput.addEventListener("input", calculate);
  daysInput.addEventListener("input", calculate);
  operatorRadios.forEach(r => r.addEventListener("change", calculate));

  calculate();
}

function submitCalculatedQuote() {
  const machineSelect = document.getElementById("calc-machine");
  const machineName = machineSelect.options[machineSelect.selectedIndex].text;
  const price = document.getElementById("summary-total-price").textContent;

  openQuoteModal();
  const selectElem = document.getElementById("modal-service-type");
  if (selectElem) {
    selectElem.value = "Machine Rental";
  }

  const detailsTextarea = document.querySelector("#quote-form textarea");
  if (detailsTextarea) {
    detailsTextarea.value = `Estimated Inquiry: ${machineName} | Total Lease Estimate: ${price}`;
  }
}

/* ==========================================
   4. PEACHWEB TILT & SCROLL EFFECTS
   ========================================== */
function setupPeachWebTiltEffects() {
  const cards = document.querySelectorAll(".peach-glass");
  cards.forEach(card => {
    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left - rect.width / 2;
      const y = e.clientY - rect.top - rect.height / 2;
      card.style.transform = `perspective(1000px) rotateX(${-y * 0.03}deg) rotateY(${x * 0.03}deg) translateY(-6px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)";
    });
  });
}

/* ==========================================
   5. MODAL & FORM CONTROLLER
   ========================================== */
function openQuoteModal() {
  const modal = document.getElementById("quote-modal");
  if (modal) modal.classList.add("active");
}

function closeQuoteModal() {
  const modal = document.getElementById("quote-modal");
  if (modal) modal.classList.remove("active");
}

function openQuoteForCurrentModel() {
  const specTitle = document.getElementById("spec-title")?.textContent || "Heavy Machinery";
  openQuoteModal();
  const detailsTextarea = document.querySelector("#quote-form textarea");
  if (detailsTextarea) {
    detailsTextarea.value = `Inquiry regarding Machinery Model (Ambuja Darlaghat): ${specTitle}`;
  }
}

function openQuoteForFleetItem(itemName) {
  openQuoteModal();
  const detailsTextarea = document.querySelector("#quote-form textarea");
  if (detailsTextarea) {
    detailsTextarea.value = `Inquiry for Fleet Lease: ${itemName}`;
  }
}

function handleFormSubmit(event) {
  event.preventDefault();
  
  const form = event.target;
  const name = form.querySelector("input[placeholder*='Rajesh']")?.value || "Client";
  const company = form.querySelector("input[placeholder*='Mining']")?.value || "Company";
  const phone = form.querySelector("input[type='tel']")?.value || "";
  const service = document.getElementById("modal-service-type")?.value || "General Inquiry";
  const details = form.querySelector("textarea")?.value || "";

  alert(`Thank you, ${name}! Your proposal request for Shree RR Trading Company (Ambuja Cement Darlaghat operations) has been received.\n\nOur Director of Operations will contact you shortly.`);
  
  closeQuoteModal();
  form.reset();

  const waMsg = encodeURIComponent(`Hello Shree RR Trading Company,\n\nName: ${name}\nCompany: ${company}\nPhone: ${phone}\nService Required: ${service}\nDetails: ${details}`);
  window.open(`https://wa.me/919999999999?text=${waMsg}`, '_blank');
}

/* ==========================================
   6. SCROLL & ANIMATION EFFECTS
   ========================================== */
function setupScrollEffects() {
  const navbar = document.getElementById("navbar");
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  window.addEventListener("scroll", () => {
    // Navbar Shrink & Glow
    if (window.scrollY > 50) {
      navbar.style.padding = "8px 0";
      navbar.style.background = "rgba(10, 20, 36, 0.96)";
      navbar.style.boxShadow = "0 10px 30px rgba(0, 0, 0, 0.8)";
    } else {
      navbar.style.padding = "12px 0";
      navbar.style.background = "rgba(10, 20, 36, 0.9)";
      navbar.style.boxShadow = "none";
    }

    // ScrollSpy Active Links
    let current = "";
    sections.forEach(section => {
      const sectionTop = section.offsetTop - 120;
      if (window.scrollY >= sectionTop) {
        current = section.getAttribute("id");
      }
    });

    navLinks.forEach(link => {
      link.classList.remove("active");
      if (link.getAttribute("href") === `#${current}`) {
        link.classList.add("active");
      }
    });
  });
}

function animateNumericCounters() {
  const numbers = document.querySelectorAll(".metric-number");
  let animated = false;

  window.addEventListener("scroll", () => {
    if (animated) return;
    const heroSection = document.getElementById("hero");
    if (!heroSection) return;

    if (window.scrollY > 100) {
      animated = true;
      numbers.forEach(numElem => {
        const target = parseInt(numElem.getAttribute("data-target")) || 40;
        let current = 0;
        const increment = Math.ceil(target / 40);

        const timer = setInterval(() => {
          current += increment;
          if (current >= target) {
            current = target;
            clearInterval(timer);
          }
          if (target === 100) {
            numElem.textContent = `${current}%`;
          } else {
            numElem.textContent = `${current.toLocaleString('en-IN')}+`;
          }
        }, 30);
      });
    }
  });
}

function setupMobileNav() {
  const toggleBtn = document.getElementById("mobile-toggle");
  const navMenu = document.getElementById("nav-menu");

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener("click", () => {
      if (navMenu.style.display === "flex") {
        navMenu.style.display = "none";
      } else {
        navMenu.style.display = "flex";
        navMenu.style.flexDirection = "column";
        navMenu.style.position = "absolute";
        navMenu.style.top = "100%";
        navMenu.style.left = "0";
        navMenu.style.width = "100%";
        navMenu.style.background = "#0A1424";
        navMenu.style.padding = "20px";
        navMenu.style.borderBottom = "1px solid #1E3056";
      }
    });
  }
}
