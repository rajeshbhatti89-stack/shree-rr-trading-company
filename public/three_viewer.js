/**
 * SHREE RR TRADING COMPANY - REAL-TIME THREE.JS 3D ENGINE
 * Theme: Strict Logo Palette (#0B1936 Deep Logo Navy & #FF6B00 Excavator Orange)
 * Style: PeachWeb.io Interactive 3D Canvas, Particles & Scrollytelling
 */

// Global 3D State
const ThreeEngine = {
  heroScene: null,
  heroCamera: null,
  heroRenderer: null,
  heroParticles: null,

  viewerScene: null,
  viewerCamera: null,
  viewerRenderer: null,
  viewerControls: null,
  currentMeshGroup: null,
  autoRotate: true,
  isWireframe: false,
  currentModelType: 'tipper'
};

// Machine Specifications Data Dictionary
const MACHINERY_SPECS = {
  tipper: {
    tag: "MINING DUMPER / FLEET",
    title: "Tata Signa 3525.K Heavy Tipper Truck (35T)",
    specs: [
      { name: "Payload Capacity", val: "35 Metric Tonnes" },
      { name: "Engine Output", val: "250 HP Cummins ISBe 6.7L" },
      { name: "Drive Configuration", val: "8x4 Heavy Axle Suspension" },
      { name: "Mining Operations", val: "Ambuja Cement Darlaghat Overburden & Quarry" },
      { name: "Telematics GPS", val: "Real-time Fuel & Load Sensors" },
      { name: "Garage O&M Interval", val: "Every 250 Engine Hours" }
    ]
  },
  excavator: {
    tag: "HEMM / EXCAVATOR",
    title: "CAT 380 / Komatsu PC500 Mining Excavator",
    specs: [
      { name: "Operating Weight", val: "48 Metric Tonnes" },
      { name: "Bucket Capacity", val: "3.2 m³ Rock Excavation Bucket" },
      { name: "Breakout Force", val: "265 kN High Hydraulic" },
      { name: "Contract Usage", val: "Ambuja Darlaghat Quarry Bench Digging" },
      { name: "Fuel Efficiency", val: "Eco-Mode Hydro Controls" },
      { name: "Garage Support", val: "Dedicated On-Site Overhaul Pit" }
    ]
  },
  bobcat: {
    tag: "COMPACT UTILITY LEASE",
    title: "Bobcat S450 Skid-Steer Compact Loader",
    specs: [
      { name: "Rated Capacity", val: "608 kg" },
      { name: "Engine Power", val: "49 HP Kubota Diesel" },
      { name: "Operating Weight", val: "2,400 kg" },
      { name: "Versatility Attachments", val: "Auger, Sweeper, Breaker, Bucket" },
      { name: "Rental Availability", val: "Daily / Monthly Lease with Operator" },
      { name: "Application", val: "Mining Site Cleanup & Road Works" }
    ]
  },
  jcb: {
    tag: "INDUSTRIAL MULTI-PURPOSE",
    title: "JCB 3CX EcoXcellence Backhoe Loader",
    specs: [
      { name: "Max Dig Depth", val: "4.77 Meters" },
      { name: "Engine Rating", val: "76 HP Turbocharged" },
      { name: "Loader Bucket", val: "1.1 m³ 6-in-1 Shovel" },
      { name: "Road Speed", val: "40 km/h Hydro-shift" },
      { name: "Deployment", val: "Road Trenching & Mining Support" },
      { name: "Maintenance", val: "Zero-Downtime Spares Stock" }
    ]
  },
  roller: {
    tag: "GOVT ROAD CONTRACT",
    title: "Hamm / Volvo Tandem Asphalt Road Roller",
    specs: [
      { name: "Operating Weight", val: "11 Metric Tonnes" },
      { name: "Drum Width", val: "1,680 mm Dual Vibratory" },
      { name: "Vibration Frequency", val: "45 / 55 Hz Precision" },
      { name: "Contract Execution", val: "Govt Highway & Asphalt Paving" },
      { name: "Compaction Control", val: "Automated Density Sensor" },
      { name: "Fleet Size", val: "45 Units Active" }
    ]
  }
};

function start3DEngines() {
  initHero3DMatrix();
  initViewer3DEngine();
  setupHUDControls();
}

if (document.readyState === "complete" || document.readyState === "interactive") {
  setTimeout(start3DEngines, 10);
} else {
  document.addEventListener("DOMContentLoaded", start3DEngines);
}

/* ==========================================
   1. HERO BACKGROUND 3D CAT EXCAVATOR ENGINE (PEACHWEB SCROLLING)
   ========================================== */
function initHero3DMatrix() {
  const container = document.getElementById("hero-3d-canvas");
  if (!container) return;

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;

  // Scene, Camera, Renderer
  ThreeEngine.heroScene = new THREE.Scene();
  ThreeEngine.heroCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  ThreeEngine.heroCamera.position.set(16, 10, 22);

  ThreeEngine.heroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: "high-performance" });
  ThreeEngine.heroRenderer.setSize(width, height);
  ThreeEngine.heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  ThreeEngine.heroRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  ThreeEngine.heroRenderer.toneMappingExposure = 1.35;
  
  ThreeEngine.heroRenderer.domElement.style.width = "100%";
  ThreeEngine.heroRenderer.domElement.style.height = "100%";
  container.appendChild(ThreeEngine.heroRenderer.domElement);

  // High-Fidelity Studio Lighting Setup
  const ambient = new THREE.AmbientLight(0xffffff, 1.3);
  ThreeEngine.heroScene.add(ambient);

  const sunLight = new THREE.DirectionalLight(0xFFF7ED, 2.8);
  sunLight.position.set(30, 45, 30);
  ThreeEngine.heroScene.add(sunLight);

  const logoOrangeRim = new THREE.DirectionalLight(0xFF6B00, 2.5);
  logoOrangeRim.position.set(-25, 25, -30);
  ThreeEngine.heroScene.add(logoOrangeRim);

  const cyanFill = new THREE.DirectionalLight(0x00D2FF, 1.2);
  cyanFill.position.set(20, -10, 20);
  ThreeEngine.heroScene.add(cyanFill);

  // Build Prominent 3D CAT Excavator Model Group
  const catExcavatorGroup = new THREE.Group();

  const logoOrangeMat = new THREE.MeshStandardMaterial({ color: 0xFF6B00, metalness: 0.45, roughness: 0.28 });
  const logoNavyMat = new THREE.MeshStandardMaterial({ color: 0x0B1936, metalness: 0.85, roughness: 0.2 });
  const chromeSteelMat = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, metalness: 0.98, roughness: 0.05 });
  const rubberTreadMat = new THREE.MeshStandardMaterial({ color: 0x1E293B, roughness: 0.92 });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x00D2FF, opacity: 0.5, transparent: true, metalness: 0.9, roughness: 0.1 });

  // 1. Heavy Crawler Tracks & Undercarriage
  const trackSideL = new THREE.Mesh(new THREE.BoxGeometry(9.0, 1.6, 1.2), logoNavyMat);
  trackSideL.position.set(0, 0.8, 2.6);
  const trackSideR = trackSideL.clone();
  trackSideR.position.z = -2.6;
  catExcavatorGroup.add(trackSideL, trackSideR);

  const sprocketGeo = new THREE.CylinderGeometry(0.8, 0.8, 1.25, 18);
  [[-3.8, 0.8, 2.6], [3.8, 0.8, 2.6], [-3.8, 0.8, -2.6], [3.8, 0.8, -2.6]].forEach(p => {
    const sp = new THREE.Mesh(sprocketGeo, chromeSteelMat);
    sp.rotation.x = Math.PI / 2;
    sp.position.set(...p);
    catExcavatorGroup.add(sp);
  });

  const xChassis = new THREE.Mesh(new THREE.CylinderGeometry(2.0, 2.4, 0.9, 24), logoNavyMat);
  xChassis.position.set(0, 1.6, 0);
  catExcavatorGroup.add(xChassis);

  // 2. Revolving House & Cab
  const houseMain = new THREE.Mesh(new THREE.BoxGeometry(6.2, 2.8, 4.4), logoNavyMat);
  houseMain.position.set(-0.4, 3.2, 0);

  const counterWeight = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.8, 4.4), logoOrangeMat);
  counterWeight.position.set(-3.8, 3.2, 0);

  const cabBox = new THREE.Mesh(new THREE.BoxGeometry(2.8, 2.6, 2.0), glassMat);
  cabBox.position.set(1.0, 3.6, 1.4);

  const fopsRoof = new THREE.Mesh(new THREE.BoxGeometry(3.0, 0.15, 2.2), logoNavyMat);
  fopsRoof.position.set(1.0, 4.95, 1.4);

  catExcavatorGroup.add(houseMain, counterWeight, cabBox, fopsRoof);

  // 3. Hydraulic Boom, Arm & Excavator Bucket (CAT Signature)
  const boomGroup = new THREE.Group();

  const boomMesh = new THREE.Mesh(new THREE.BoxGeometry(7.8, 1.1, 1.0), logoNavyMat);
  boomMesh.position.set(3.6, 2.2, 0);
  boomMesh.rotation.z = 0.52;

  const stickMesh = new THREE.Mesh(new THREE.BoxGeometry(5.6, 0.85, 0.85), logoNavyMat);
  stickMesh.position.set(7.4, 3.6, 0);
  stickMesh.rotation.z = -0.72;

  // Hydraulics Cylinders
  const hydroCyl = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.25, 4.5), chromeSteelMat);
  hydroCyl.position.set(4.0, 4.2, 0);
  hydroCyl.rotation.z = -0.1;
  boomGroup.add(hydroCyl);

  // Orange Excavator Bucket (Matching CAT Logo Colors)
  const bucketMesh = new THREE.Mesh(new THREE.BoxGeometry(2.0, 2.2, 2.2), logoOrangeMat);
  bucketMesh.position.set(9.0, 0.6, 0);
  bucketMesh.rotation.z = Math.PI / 4;

  for (let z = -0.9; z <= 0.9; z += 0.45) {
    const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.15, 0.7, 4), chromeSteelMat);
    tooth.rotation.z = -Math.PI / 2;
    tooth.position.set(10.1, -0.3, z);
    boomGroup.add(tooth);
  }

  boomGroup.add(boomMesh, stickMesh, bucketMesh);
  boomGroup.position.set(1.4, 3.6, 0);
  catExcavatorGroup.add(boomGroup);

  catExcavatorGroup.position.set(0, -1.2, 0);
  catExcavatorGroup.scale.set(1.15, 1.15, 1.15);
  ThreeEngine.heroScene.add(catExcavatorGroup);

  // 4. Floating 3D Glowing Dust & Particle Field (PeachWeb 3D Style)
  const particleGeo = new THREE.BufferGeometry();
  const particleCount = 250;
  const posArray = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount * 3; i += 3) {
    posArray[i] = (Math.random() - 0.5) * 50;
    posArray[i + 1] = (Math.random() - 0.5) * 35 + 5;
    posArray[i + 2] = (Math.random() - 0.5) * 50;
  }

  particleGeo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
  const particleMat = new THREE.PointsMaterial({
    size: 0.4,
    color: 0xFF6B00,
    transparent: true,
    opacity: 0.8,
    blending: THREE.AdditiveBlending
  });

  const particleMesh = new THREE.Points(particleGeo, particleMat);
  ThreeEngine.heroScene.add(particleMesh);

  // PeachWeb.io Dynamic Scrollytelling Path Engine
  let currentScrollProgress = 0;

  function onScrollUpdate() {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    currentScrollProgress = totalHeight > 0 ? window.scrollY / totalHeight : 0;
  }
  window.addEventListener('scroll', onScrollUpdate);

  function animateHero() {
    requestAnimationFrame(animateHero);
    
    // Smooth Interpolated 3D Excavator Motion & Rotation on Scroll
    const targetYRotation = currentScrollProgress * Math.PI * 2.5;
    const targetXRotation = Math.sin(currentScrollProgress * Math.PI * 2) * 0.12;
    const targetZPosition = Math.cos(currentScrollProgress * Math.PI * 1.5) * 3.0;

    catExcavatorGroup.rotation.y += (targetYRotation - catExcavatorGroup.rotation.y) * 0.06 + 0.003;
    catExcavatorGroup.rotation.x += (targetXRotation - catExcavatorGroup.rotation.x) * 0.06;
    catExcavatorGroup.position.z += (targetZPosition - catExcavatorGroup.position.z) * 0.06;

    // Hydraulic Boom Arm Digging Motion
    boomGroup.rotation.z = Math.sin(currentScrollProgress * Math.PI * 4) * 0.15;

    // Animate 3D Particles
    particleMesh.rotation.y += 0.0015;
    particleMesh.rotation.x += 0.0008;

    ThreeEngine.heroCamera.lookAt(0, 2.5, 0);
    ThreeEngine.heroRenderer.render(ThreeEngine.heroScene, ThreeEngine.heroCamera);
  }
  animateHero();

  // Resize handler
  window.addEventListener('resize', () => {
    if (!ThreeEngine.heroRenderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    ThreeEngine.heroCamera.aspect = w / h;
    ThreeEngine.heroCamera.updateProjectionMatrix();
    ThreeEngine.heroRenderer.setSize(w, h);
  });
}

/* ==========================================
   2. INTERACTIVE 3D MACHINERY VIEWER
   ========================================== */
function initViewer3DEngine() {
  const container = document.getElementById("equipment-3d-canvas");
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene
  ThreeEngine.viewerScene = new THREE.Scene();
  ThreeEngine.viewerScene.background = new THREE.Color(0x050B1A);

  // Camera
  ThreeEngine.viewerCamera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  ThreeEngine.viewerCamera.position.set(16, 10, 20);

  // Renderer
  ThreeEngine.viewerRenderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  ThreeEngine.viewerRenderer.setSize(width, height);
  ThreeEngine.viewerRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  ThreeEngine.viewerRenderer.shadowMap.enabled = true;
  ThreeEngine.viewerRenderer.shadowMap.type = THREE.PCFSoftShadowMap;
  ThreeEngine.viewerRenderer.toneMapping = THREE.ACESFilmicToneMapping;
  ThreeEngine.viewerRenderer.toneMappingExposure = 1.2;
  container.appendChild(ThreeEngine.viewerRenderer.domElement);

  // OrbitControls
  if (typeof THREE.OrbitControls !== 'undefined') {
    ThreeEngine.viewerControls = new THREE.OrbitControls(ThreeEngine.viewerCamera, ThreeEngine.viewerRenderer.domElement);
    ThreeEngine.viewerControls.enableDamping = true;
    ThreeEngine.viewerControls.dampingFactor = 0.05;
    ThreeEngine.viewerControls.maxPolarAngle = Math.PI / 2 - 0.01;
    ThreeEngine.viewerControls.minDistance = 6;
    ThreeEngine.viewerControls.maxDistance = 40;
    ThreeEngine.viewerControls.target.set(0, 2.2, 0);
  }

  // PBR Lighting Studio Setup
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.95);
  ThreeEngine.viewerScene.add(ambientLight);

  const keySunLight = new THREE.DirectionalLight(0xFFF7ED, 2.5);
  keySunLight.position.set(30, 45, 30);
  keySunLight.castShadow = true;
  keySunLight.shadow.mapSize.width = 2048;
  keySunLight.shadow.mapSize.height = 2048;
  keySunLight.shadow.bias = -0.0001;
  ThreeEngine.viewerScene.add(keySunLight);

  const fillCyanLight = new THREE.DirectionalLight(0x00D2FF, 1.3);
  fillCyanLight.position.set(-25, 20, -20);
  ThreeEngine.viewerScene.add(fillCyanLight);

  const warmOrangeRimLight = new THREE.DirectionalLight(0xFF6B00, 2.0);
  warmOrangeRimLight.position.set(0, 25, -35);
  ThreeEngine.viewerScene.add(warmOrangeRimLight);

  // Ground Grid & Studio Floor
  const gridHelper = new THREE.GridHelper(60, 60, 0xFF6B00, 0x1D2E54);
  gridHelper.position.y = -0.01;
  ThreeEngine.viewerScene.add(gridHelper);

  const floorGeo = new THREE.PlaneGeometry(100, 100);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x040916, roughness: 0.85, metalness: 0.2 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.receiveShadow = true;
  ThreeEngine.viewerScene.add(floor);

  // Initial Model Load
  loadProcedural3DModel('tipper');

  // Animation Loop
  function animateViewer() {
    requestAnimationFrame(animateViewer);

    if (ThreeEngine.viewerControls) {
      ThreeEngine.viewerControls.update();
    }

    if (ThreeEngine.autoRotate && ThreeEngine.currentMeshGroup) {
      ThreeEngine.currentMeshGroup.rotation.y += 0.004;
    }

    ThreeEngine.viewerRenderer.render(ThreeEngine.viewerScene, ThreeEngine.viewerCamera);
  }
  animateViewer();

  // Resize handler
  window.addEventListener('resize', () => {
    if (!ThreeEngine.viewerRenderer) return;
    const w = container.clientWidth;
    const h = container.clientHeight;
    ThreeEngine.viewerCamera.aspect = w / h;
    ThreeEngine.viewerCamera.updateProjectionMatrix();
    ThreeEngine.viewerRenderer.setSize(w, h);
  });
}

/* ==========================================
   3. HIGH-FIDELITY CAD PROCEDURAL BUILDER
   ========================================== */
function loadProcedural3DModel(type) {
  if (ThreeEngine.currentMeshGroup) {
    ThreeEngine.viewerScene.remove(ThreeEngine.currentMeshGroup);
  }

  ThreeEngine.currentModelType = type;
  const group = new THREE.Group();

  // Strict Logo Materials (#FF6B00 Excavator Orange & #0B1936 Logo Navy)
  const logoOrangeEnamel = new THREE.MeshStandardMaterial({ color: 0xFF6B00, metalness: 0.45, roughness: 0.3, wireframe: ThreeEngine.isWireframe });
  const logoNavySteel = new THREE.MeshStandardMaterial({ color: 0x0B1936, metalness: 0.85, roughness: 0.2, wireframe: ThreeEngine.isWireframe });
  const chromeSteel = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, metalness: 0.98, roughness: 0.05, wireframe: ThreeEngine.isWireframe });
  const rubberTire = new THREE.MeshStandardMaterial({ color: 0x070C16, roughness: 0.92, metalness: 0.1, wireframe: ThreeEngine.isWireframe });
  const rimSteel = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.9, roughness: 0.2, wireframe: ThreeEngine.isWireframe });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x00D2FF, opacity: 0.45, transparent: true, metalness: 0.9, roughness: 0.1, wireframe: ThreeEngine.isWireframe });
  const emissiveRed = new THREE.MeshStandardMaterial({ color: 0xEF4444, emissive: 0xEF4444, emissiveIntensity: 0.8 });
  const emissiveOrange = new THREE.MeshStandardMaterial({ color: 0xFF6B00, emissive: 0xFF6B00, emissiveIntensity: 0.9 });
  const ledHeadlight = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 1.2 });

  if (type === 'tipper') {
    // --- TATA SIGNA 3525.K HEAVY TIPPER TRUCK ---
    const beam1 = new THREE.Mesh(new THREE.BoxGeometry(11, 0.4, 0.2), logoNavySteel);
    beam1.position.set(0, 1.8, 1.1);
    const beam2 = beam1.clone();
    beam2.position.z = -1.1;
    group.add(beam1, beam2);

    for (let x = -4.5; x <= 4.5; x += 1.8) {
      const cross = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 2.2), logoNavySteel);
      cross.position.set(x, 1.8, 0);
      group.add(cross);
    }

    const fuelTank = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.4, 16), chromeSteel);
    fuelTank.rotation.z = Math.PI / 2;
    fuelTank.position.set(0.5, 1.6, 1.6);
    group.add(fuelTank);

    // Driver Cabin (Logo Orange & Logo Navy)
    const cabMain = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 3.4), logoNavySteel);
    cabMain.position.set(3.8, 3.8, 0);
    cabMain.castShadow = true;
    group.add(cabMain);

    const grilleBox = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.6, 3.0), logoOrangeEnamel);
    grilleBox.position.set(5.45, 3.0, 0);
    group.add(grilleBox);

    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 3.0), glassMat);
    windshield.position.set(5.42, 4.5, 0);
    group.add(windshield);

    const sideWinL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.1), glassMat);
    sideWinL.position.set(3.8, 4.4, 1.71);
    const sideWinR = sideWinL.clone();
    sideWinR.position.z = -1.71;
    group.add(sideWinL, sideWinR);

    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 3.5), logoOrangeEnamel);
    visor.position.set(5.3, 5.3, 0);
    visor.rotation.z = -0.15;
    group.add(visor);

    const beaconL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.3), emissiveOrange);
    beaconL.position.set(4.8, 5.6, 1.4);
    const beaconR = beaconL.clone();
    beaconR.position.z = -1.4;
    group.add(beaconL, beaconR);

    const headlightL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.6), ledHeadlight);
    headlightL.position.set(5.5, 2.5, 1.2);
    const headlightR = headlightL.clone();
    headlightR.position.z = -1.2;
    group.add(headlightL, headlightR);

    // Tipper Dump Bed (Logo Orange Stiffener Ribs)
    const bedGroup = new THREE.Group();
    const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.3, 3.4), logoNavySteel);
    bedFloor.position.set(-0.2, 0.15, 0);

    const bedSideL = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.8, 0.2), logoNavySteel);
    bedSideL.position.set(-0.2, 1.55, 1.6);
    const bedSideR = bedSideL.clone();
    bedSideR.position.z = -1.6;

    const bedFront = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.8, 3.4), logoNavySteel);
    bedFront.position.set(3.3, 2.0, 0);

    const bedTailgate = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 3.4), logoNavySteel);
    bedTailgate.position.set(-3.7, 1.55, 0);

    bedGroup.add(bedFloor, bedSideL, bedSideR, bedFront, bedTailgate);

    for (let x = -3.0; x <= 3.0; x += 1.2) {
      const ribL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 0.15), logoOrangeEnamel);
      ribL.position.set(x, 1.55, 1.72);
      const ribR = ribL.clone();
      ribR.position.z = -1.72;
      bedGroup.add(ribL, ribR);
    }

    bedGroup.position.set(-0.8, 3.0, 0);
    bedGroup.rotation.z = 0.12;
    bedGroup.castShadow = true;
    group.add(bedGroup);

    const hydroOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.5), logoNavySteel);
    hydroOuter.position.set(1.6, 2.6, 0);
    hydroOuter.rotation.z = -0.3;
    const hydroInner = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.5), chromeSteel);
    hydroInner.position.set(1.9, 3.6, 0);
    hydroInner.rotation.z = -0.3;
    group.add(hydroOuter, hydroInner);

    // 8x4 Axle Wheels
    const wheelPositions = [
      [4.2, 1.2, 1.9], [4.2, 1.2, -1.9],
      [2.2, 1.2, 1.9], [2.2, 1.2, -1.9],
      [-1.8, 1.2, 1.9], [-1.8, 1.2, -1.9],
      [-4.2, 1.2, 1.9], [-4.2, 1.2, -1.9]
    ];

    const tireGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.85, 24);
    const rimGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.88, 16);

    wheelPositions.forEach(pos => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(tireGeo, rubberTire);
      tire.rotation.x = Math.PI / 2;
      tire.castShadow = true;
      const rim = new THREE.Mesh(rimGeo, rimSteel);
      rim.rotation.x = Math.PI / 2;

      wGroup.add(tire, rim);
      wGroup.position.set(...pos);
      group.add(wGroup);
    });

  } else if (type === 'excavator') {
    // --- CAT 380 / KOMATSU PC500 MINING EXCAVATOR (Exact Match to Logo Excavator) ---

    const trackSideL = new THREE.BoxGeometry(7.5, 1.4, 0.9);
    const trackMeshL = new THREE.Mesh(trackSideL, logoNavySteel);
    trackMeshL.position.set(0, 0.9, 2.2);
    const trackMeshR = trackMeshL.clone();
    trackMeshR.position.z = -2.2;
    group.add(trackMeshL, trackMeshR);

    const sprockGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.95, 18);
    [[-3.2, 0.9, 2.2], [3.2, 0.9, 2.2], [-3.2, 0.9, -2.2], [3.2, 0.9, -2.2]].forEach(p => {
      const sp = new THREE.Mesh(sprockGeo, rimSteel);
      sp.rotation.x = Math.PI / 2;
      sp.position.set(...p);
      group.add(sp);
    });

    const xFrame = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 0.8, 24), logoNavySteel);
    xFrame.position.set(0, 1.6, 0);
    group.add(xFrame);

    const houseMain = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.4, 3.8), logoNavySteel);
    houseMain.position.set(-0.4, 3.0, 0);
    houseMain.castShadow = true;
    group.add(houseMain);

    const counterweight = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 3.8), logoOrangeEnamel);
    counterweight.position.set(-3.2, 3.0, 0);
    group.add(counterweight);

    const cabBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 1.6), glassMat);
    cabBox.position.set(0.8, 3.2, 1.2);
    group.add(cabBox);

    const fopsGuard = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 1.7), logoNavySteel);
    fopsGuard.position.set(0.8, 4.35, 1.2);
    group.add(fopsGuard);

    // Boom & Excavation Bucket (Matching Logo Image)
    const boomGroup = new THREE.Group();

    const boomMesh = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.9, 0.8), logoNavySteel);
    boomMesh.position.set(3.0, 2.0, 0);
    boomMesh.rotation.z = 0.55;
    boomMesh.castShadow = true;
    boomGroup.add(boomMesh);

    const stickMesh = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.7, 0.7), logoNavySteel);
    stickMesh.position.set(6.2, 3.2, 0);
    stickMesh.rotation.z = -0.75;
    stickMesh.castShadow = true;
    boomGroup.add(stickMesh);

    // Excavator Bucket (Orange as in Logo)
    const bucketMain = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 1.8), logoOrangeEnamel);
    bucketMain.position.set(7.5, 0.6, 0);
    bucketMain.rotation.z = Math.PI / 4;
    boomGroup.add(bucketMain);

    for (let z = -0.7; z <= 0.7; z += 0.35) {
      const tooth = new THREE.Mesh(new THREE.ConeGeometry(0.12, 0.6, 4), chromeSteel);
      tooth.rotation.z = -Math.PI / 2;
      tooth.position.set(8.4, -0.2, z);
      boomGroup.add(tooth);
    }

    boomGroup.position.set(1.2, 3.2, 0);
    group.add(boomGroup);

  } else if (type === 'bobcat') {
    // --- BOBCAT S450 COMPACT LOADER ---
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 2.4), logoNavySteel);
    body.position.set(0, 2.2, 0);
    body.castShadow = true;
    group.add(body);

    const cageGeo = new THREE.BoxGeometry(2.2, 2.0, 2.2);
    const cage = new THREE.Mesh(cageGeo, logoNavySteel);
    cage.position.set(-0.1, 4.0, 0);
    group.add(cage);

    const armL = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.4, 0.3), logoOrangeEnamel);
    armL.position.set(1.2, 3.0, 1.35);
    armL.rotation.z = -0.2;
    const armR = armL.clone();
    armR.position.z = -1.35;
    group.add(armL, armR);

    const bucket = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 2.7), logoOrangeEnamel);
    bucket.position.set(2.8, 1.8, 0);
    bucket.castShadow = true;
    group.add(bucket);

    const tireGeo = new THREE.CylinderGeometry(0.9, 0.9, 0.7, 20);
    [
      [1.1, 0.9, 1.45], [1.1, 0.9, -1.45],
      [-1.1, 0.9, 1.45], [-1.1, 0.9, -1.45]
    ].forEach(p => {
      const t = new THREE.Mesh(tireGeo, rubberTire);
      t.rotation.x = Math.PI / 2;
      t.position.set(...p);
      t.castShadow = true;
      group.add(t);
    });

  } else if (type === 'jcb') {
    // --- JCB 3CX BACKHOE LOADER ---
    const tractorBody = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.2, 2.4), logoOrangeEnamel);
    tractorBody.position.set(0, 2.5, 0);
    tractorBody.castShadow = true;
    group.add(tractorBody);

    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 2.3), glassMat);
    cab.position.set(-0.2, 4.3, 0);
    group.add(cab);

    const frontArmL = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 0.3), logoNavySteel);
    frontArmL.position.set(3.0, 2.5, 1.3);
    frontArmL.rotation.z = -0.15;
    const frontArmR = frontArmL.clone();
    frontArmR.position.z = -1.3;
    group.add(frontArmL, frontArmR);

    const frontShovel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 2.8), logoOrangeEnamel);
    frontShovel.position.set(4.6, 1.8, 0);
    frontShovel.castShadow = true;
    group.add(frontShovel);

    const backBoom = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.6, 0.5), logoOrangeEnamel);
    backBoom.position.set(-4.2, 3.8, 0);
    backBoom.rotation.z = -0.6;
    const dipper = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.5, 0.5), logoNavySteel);
    dipper.position.set(-5.8, 2.4, 0);
    dipper.rotation.z = 0.7;

    const backBucket = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.0), logoOrangeEnamel);
    backBucket.position.set(-6.6, 0.9, 0);
    group.add(backBoom, dipper, backBucket);

    const bigTireGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.95, 24);
    [[-1.2, 1.6, 1.5], [-1.2, 1.6, -1.5]].forEach(p => {
      const t = new THREE.Mesh(bigTireGeo, rubberTire);
      t.rotation.x = Math.PI / 2;
      t.position.set(...p);
      t.castShadow = true;
      group.add(t);
    });

  } else if (type === 'roller') {
    // --- ROAD ROLLER ---
    const mainFrame = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.8, 2.2), logoOrangeEnamel);
    mainFrame.position.set(0, 2.6, 0);
    mainFrame.castShadow = true;
    group.add(mainFrame);

    const drumGeo = new THREE.CylinderGeometry(1.7, 1.7, 2.7, 36);
    const frontDrum = new THREE.Mesh(drumGeo, chromeSteel);
    frontDrum.rotation.x = Math.PI / 2;
    frontDrum.position.set(2.6, 1.7, 0);
    group.add(frontDrum);

    const rearDrum = new THREE.Mesh(drumGeo, chromeSteel);
    rearDrum.rotation.x = Math.PI / 2;
    rearDrum.position.set(-2.6, 1.7, 0);
    group.add(rearDrum);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 2.5), logoNavySteel);
    roof.position.set(0, 6.0, 0);
    group.add(roof);
  }

  ThreeEngine.currentMeshGroup = group;
  ThreeEngine.viewerScene.add(group);

  // Update Specs Panel UI & Real Site Operational Photo
  updateSpecsPanel(type);
  if (typeof updateRealMachinePhoto === 'function') {
    updateRealMachinePhoto(type);
  }
}

/* ==========================================
   4. HUD & SPECS CONTROLLER
   ========================================== */
function setupHUDControls() {
  const selectorBtns = document.querySelectorAll(".selector-btn");
  selectorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      selectorBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const model = btn.getAttribute("data-model");
      loadProcedural3DModel(model);
    });
  });

  const rotateBtn = document.getElementById("hud-rotate");
  if (rotateBtn) {
    rotateBtn.addEventListener("click", () => {
      ThreeEngine.autoRotate = !ThreeEngine.autoRotate;
      rotateBtn.classList.toggle("active", ThreeEngine.autoRotate);
    });
  }

  const wireframeBtn = document.getElementById("hud-wireframe");
  const navWireframeBtn = document.getElementById("wireframe-toggle-btn");

  function toggleWireframe() {
    ThreeEngine.isWireframe = !ThreeEngine.isWireframe;
    if (ThreeEngine.currentModelType) {
      loadProcedural3DModel(ThreeEngine.currentModelType);
    }
  }

  if (wireframeBtn) wireframeBtn.addEventListener("click", toggleWireframe);
  if (navWireframeBtn) navWireframeBtn.addEventListener("click", toggleWireframe);

  const resetBtn = document.getElementById("hud-reset");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      ThreeEngine.viewerCamera.position.set(16, 10, 20);
      if (ThreeEngine.viewerControls) {
        ThreeEngine.viewerControls.target.set(0, 2.2, 0);
      }
    });
  }
}

function updateSpecsPanel(type) {
  const data = MACHINERY_SPECS[type];
  if (!data) return;

  const tagElem = document.getElementById("spec-tag");
  const titleElem = document.getElementById("spec-title");
  const listElem = document.getElementById("specs-list");

  if (tagElem) tagElem.textContent = data.tag;
  if (titleElem) titleElem.textContent = data.title;

  if (listElem) {
    listElem.innerHTML = data.specs.map(s => `
      <div class="spec-item">
        <span class="spec-name">${s.name}</span>
        <span class="spec-val">${s.val}</span>
      </div>
    `).join("");
  }
}
