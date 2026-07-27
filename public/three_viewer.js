/**
 * SHREE RR TRADING COMPANY - REAL-TIME THREE.JS 3D ENGINE
 * Photorealistic 3D Machinery Renderer & Interactive Particle Matrix
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
      { name: "Mining Operations", val: "Adani ACC & Ambuja Limestone Haulage" },
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
      { name: "Contract Usage", val: "Overburden Stripping & Quarry Feed" },
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

document.addEventListener("DOMContentLoaded", () => {
  initHero3DMatrix();
  initViewer3DEngine();
  setupHUDControls();
});

/* ==========================================
   1. HERO BACKGROUND 3D PARTICLE MATRIX
   ========================================== */
function initHero3DMatrix() {
  const container = document.getElementById("hero-3d-canvas");
  if (!container) return;

  const width = container.clientWidth;
  const height = container.clientHeight;

  // Scene, Camera, Renderer
  ThreeEngine.heroScene = new THREE.Scene();
  ThreeEngine.heroCamera = new THREE.PerspectiveCamera(60, width / height, 1, 1000);
  ThreeEngine.heroCamera.position.set(0, 50, 120);

  ThreeEngine.heroRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  ThreeEngine.heroRenderer.setSize(width, height);
  ThreeEngine.heroRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(ThreeEngine.heroRenderer.domElement);

  // 3D Particle Topography Geometry
  const particleCount = 2800;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  const colorAmber = new THREE.Color(0xF59E0B);
  const colorCyan = new THREE.Color(0x06B6D4);
  const colorSlate = new THREE.Color(0x334155);

  for (let i = 0; i < particleCount; i++) {
    const x = (Math.random() - 0.5) * 380;
    const y = (Math.random() - 0.5) * 140;
    const z = (Math.random() - 0.5) * 380;

    positions[i * 3] = x;
    positions[i * 3 + 1] = y;
    positions[i * 3 + 2] = z;

    const rand = Math.random();
    const mixColor = rand > 0.8 ? colorAmber : (rand > 0.65 ? colorCyan : colorSlate);
    colors[i * 3] = mixColor.r;
    colors[i * 3 + 1] = mixColor.g;
    colors[i * 3 + 2] = mixColor.b;
  }

  const particleGeometry = new THREE.BufferGeometry();
  particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 2.2,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending
  });

  ThreeEngine.heroParticles = new THREE.Points(particleGeometry, particleMaterial);
  ThreeEngine.heroScene.add(ThreeEngine.heroParticles);

  // Interactive Mouse Motion
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX - window.innerWidth / 2) * 0.04;
    mouseY = (e.clientY - window.innerHeight / 2) * 0.04;
  });

  // Animation Loop
  function animateHero() {
    requestAnimationFrame(animateHero);
    
    if (ThreeEngine.heroParticles) {
      ThreeEngine.heroParticles.rotation.y += 0.0012;
      ThreeEngine.heroParticles.rotation.x += 0.0005;
    }

    ThreeEngine.heroCamera.position.x += (mouseX - ThreeEngine.heroCamera.position.x) * 0.03;
    ThreeEngine.heroCamera.position.y += (-mouseY - ThreeEngine.heroCamera.position.y) * 0.03;
    ThreeEngine.heroCamera.lookAt(ThreeEngine.heroScene.position);

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
  ThreeEngine.viewerScene.background = new THREE.Color(0x0A0E17);

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
  ThreeEngine.viewerRenderer.toneMappingExposure = 1.1;
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
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  ThreeEngine.viewerScene.add(ambientLight);

  const keySunLight = new THREE.DirectionalLight(0xFFF7ED, 2.2);
  keySunLight.position.set(30, 45, 30);
  keySunLight.castShadow = true;
  keySunLight.shadow.mapSize.width = 2048;
  keySunLight.shadow.mapSize.height = 2048;
  keySunLight.shadow.bias = -0.0001;
  ThreeEngine.viewerScene.add(keySunLight);

  const fillCyanLight = new THREE.DirectionalLight(0x06B6D4, 1.2);
  fillCyanLight.position.set(-25, 20, -20);
  ThreeEngine.viewerScene.add(fillCyanLight);

  const warmRimLight = new THREE.DirectionalLight(0xF59E0B, 1.5);
  warmRimLight.position.set(0, 25, -35);
  ThreeEngine.viewerScene.add(warmRimLight);

  // Ground Grid & Studio Floor
  const gridHelper = new THREE.GridHelper(60, 60, 0xF59E0B, 0x1E293B);
  gridHelper.position.y = -0.01;
  ThreeEngine.viewerScene.add(gridHelper);

  const floorGeo = new THREE.PlaneGeometry(100, 100);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x080C14, roughness: 0.85, metalness: 0.2 });
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

  // Realistic PBR Industrial Materials
  const yellowEnamel = new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.45, roughness: 0.3, wireframe: ThreeEngine.isWireframe });
  const darkTitanium = new THREE.MeshStandardMaterial({ color: 0x1E293B, metalness: 0.85, roughness: 0.2, wireframe: ThreeEngine.isWireframe });
  const chromeSteel = new THREE.MeshStandardMaterial({ color: 0xF8FAFC, metalness: 0.98, roughness: 0.05, wireframe: ThreeEngine.isWireframe });
  const rubberTire = new THREE.MeshStandardMaterial({ color: 0x0A0F17, roughness: 0.92, metalness: 0.1, wireframe: ThreeEngine.isWireframe });
  const rimSteel = new THREE.MeshStandardMaterial({ color: 0xCBD5E1, metalness: 0.9, roughness: 0.2, wireframe: ThreeEngine.isWireframe });
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, opacity: 0.45, transparent: true, metalness: 0.9, roughness: 0.1, wireframe: ThreeEngine.isWireframe });
  const emissiveRed = new THREE.MeshStandardMaterial({ color: 0xEF4444, emissive: 0xEF4444, emissiveIntensity: 0.8 });
  const emissiveAmber = new THREE.MeshStandardMaterial({ color: 0xF59E0B, emissive: 0xF59E0B, emissiveIntensity: 0.8 });
  const ledHeadlight = new THREE.MeshStandardMaterial({ color: 0xFFFFFF, emissive: 0xFFFFFF, emissiveIntensity: 1.2 });

  if (type === 'tipper') {
    // --- TATA SIGNA 3525.K / VOLVO FMX HEAVY TIPPER TRUCK ---

    // 1. Chassis Main I-Beams (Double Rail)
    const beam1 = new THREE.Mesh(new THREE.BoxGeometry(11, 0.4, 0.2), darkTitanium);
    beam1.position.set(0, 1.8, 1.1);
    const beam2 = beam1.clone();
    beam2.position.z = -1.1;
    group.add(beam1, beam2);

    // Cross-member ribs
    for (let x = -4.5; x <= 4.5; x += 1.8) {
      const cross = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.35, 2.2), darkTitanium);
      cross.position.set(x, 1.8, 0);
      group.add(cross);
    }

    // Fuel Tank & Battery Box
    const fuelTank = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 2.4, 16), chromeSteel);
    fuelTank.rotation.z = Math.PI / 2;
    fuelTank.position.set(0.5, 1.6, 1.6);
    group.add(fuelTank);

    // Aerodynamic Driver Cabin
    const cabMain = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.4, 3.4), yellowEnamel);
    cabMain.position.set(3.8, 3.8, 0);
    cabMain.castShadow = true;
    group.add(cabMain);

    // Slanted Front Bonnet & Grille
    const grilleBox = new THREE.Mesh(new THREE.BoxGeometry(0.3, 1.6, 3.0), darkTitanium);
    grilleBox.position.set(5.45, 3.0, 0);
    group.add(grilleBox);

    // Windshield & Side Windows
    const windshield = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.2, 3.0), glassMat);
    windshield.position.set(5.42, 4.5, 0);
    group.add(windshield);

    const sideWinL = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.0, 0.1), glassMat);
    sideWinL.position.set(3.8, 4.4, 1.71);
    const sideWinR = sideWinL.clone();
    sideWinR.position.z = -1.71;
    group.add(sideWinL, sideWinR);

    // Overhead Sun Visor & Warning Beacons
    const visor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.2, 3.5), darkTitanium);
    visor.position.set(5.3, 5.3, 0);
    visor.rotation.z = -0.15;
    group.add(visor);

    const beaconL = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.3), emissiveAmber);
    beaconL.position.set(4.8, 5.6, 1.4);
    const beaconR = beaconL.clone();
    beaconR.position.z = -1.4;
    group.add(beaconL, beaconR);

    // LED Headlights Pods
    const headlightL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.4, 0.6), ledHeadlight);
    headlightL.position.set(5.5, 2.5, 1.2);
    const headlightR = headlightL.clone();
    headlightR.position.z = -1.2;
    group.add(headlightL, headlightR);

    // Side Mirrors with Bracket Rods
    const mirrorL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.7, 0.3), darkTitanium);
    mirrorL.position.set(4.8, 4.4, 2.0);
    const mirrorR = mirrorL.clone();
    mirrorR.position.z = -2.0;
    group.add(mirrorL, mirrorR);

    // Heavy Tipper U-Shaped Dump Bed
    const bedGroup = new THREE.Group();
    const bedFloor = new THREE.Mesh(new THREE.BoxGeometry(7.2, 0.3, 3.4), darkTitanium);
    bedFloor.position.set(-0.2, 0.15, 0);

    const bedSideL = new THREE.Mesh(new THREE.BoxGeometry(7.2, 2.8, 0.2), darkTitanium);
    bedSideL.position.set(-0.2, 1.55, 1.6);
    const bedSideR = bedSideL.clone();
    bedSideR.position.z = -1.6;

    const bedFront = new THREE.Mesh(new THREE.BoxGeometry(0.3, 3.8, 3.4), darkTitanium);
    bedFront.position.set(3.3, 2.0, 0); // Cab guard extension

    const bedTailgate = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 3.4), darkTitanium);
    bedTailgate.position.set(-3.7, 1.55, 0);

    bedGroup.add(bedFloor, bedSideL, bedSideR, bedFront, bedTailgate);

    // Side Stiffener Ribs on Tipper Box
    for (let x = -3.0; x <= 3.0; x += 1.2) {
      const ribL = new THREE.Mesh(new THREE.BoxGeometry(0.2, 2.8, 0.15), yellowEnamel);
      ribL.position.set(x, 1.55, 1.72);
      const ribR = ribL.clone();
      ribR.position.z = -1.72;
      bedGroup.add(ribL, ribR);
    }

    bedGroup.position.set(-0.8, 3.0, 0);
    bedGroup.rotation.z = 0.12; // Dynamic raised angle
    bedGroup.castShadow = true;
    group.add(bedGroup);

    // Multi-Stage Telescopic Hydraulic Piston Rod
    const hydroOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 2.5), darkTitanium);
    hydroOuter.position.set(1.6, 2.6, 0);
    hydroOuter.rotation.z = -0.3;
    const hydroInner = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 2.5), chromeSteel);
    hydroInner.position.set(1.9, 3.6, 0);
    hydroInner.rotation.z = -0.3;
    group.add(hydroOuter, hydroInner);

    // 8x4 Axles & Heavy Tread Rubber Tires
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
    // --- CAT 380 / KOMATSU PC500 MINING HEMM EXCAVATOR ---

    // 1. Heavy Crawler Undercarriage Tracks
    const trackSideL = new THREE.BoxGeometry(7.5, 1.4, 0.9);
    const trackMeshL = new THREE.Mesh(trackSideL, darkTitanium);
    trackMeshL.position.set(0, 0.9, 2.2);
    const trackMeshR = trackMeshL.clone();
    trackMeshR.position.z = -2.2;
    group.add(trackMeshL, trackMeshR);

    // Track Sprockets & Idler Wheels
    const sprockGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.95, 18);
    [[-3.2, 0.9, 2.2], [3.2, 0.9, 2.2], [-3.2, 0.9, -2.2], [3.2, 0.9, -2.2]].forEach(p => {
      const sp = new THREE.Mesh(sprockGeo, rimSteel);
      sp.rotation.x = Math.PI / 2;
      sp.position.set(...p);
      group.add(sp);
    });

    // Central Revolving X-Frame Pivot
    const xFrame = new THREE.Mesh(new THREE.CylinderGeometry(1.8, 2.2, 0.8, 24), darkTitanium);
    xFrame.position.set(0, 1.6, 0);
    group.add(xFrame);

    // 2. Upper Deck Revolving House Body
    const houseMain = new THREE.Mesh(new THREE.BoxGeometry(5.2, 2.4, 3.8), yellowEnamel);
    houseMain.position.set(-0.4, 3.0, 0);
    houseMain.castShadow = true;
    group.add(houseMain);

    // Sloped Engine Hood & Counterweight
    const counterweight = new THREE.Mesh(new THREE.BoxGeometry(1.6, 2.4, 3.8), darkTitanium);
    counterweight.position.set(-3.2, 3.0, 0);
    group.add(counterweight);

    // Engine Exhaust Pipe
    const exhaust = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 1.8), darkTitanium);
    exhaust.position.set(-2.5, 4.8, -1.2);
    group.add(exhaust);

    // Operator Glass Cabin with FOPS Guard
    const cabBox = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.2, 1.6), glassMat);
    cabBox.position.set(0.8, 3.2, 1.2);
    group.add(cabBox);

    const fopsGuard = new THREE.Mesh(new THREE.BoxGeometry(2.5, 0.15, 1.7), darkTitanium);
    fopsGuard.position.set(0.8, 4.35, 1.2);
    group.add(fopsGuard);

    // LED Work Spotlights on Cabin
    const spot1 = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 0.4), ledHeadlight);
    spot1.position.set(2.0, 4.2, 1.7);
    const spot2 = spot1.clone();
    spot2.position.z = 0.7;
    group.add(spot1, spot2);

    // 3. Articulated Boom & Hydro System
    const boomGroup = new THREE.Group();

    // Main Curved Boom Arm
    const boomMesh = new THREE.Mesh(new THREE.BoxGeometry(6.5, 0.9, 0.8), yellowEnamel);
    boomMesh.position.set(3.0, 2.0, 0);
    boomMesh.rotation.z = 0.55;
    boomMesh.castShadow = true;
    boomGroup.add(boomMesh);

    // Hydro Lift Cylinders on Boom
    const boomCylOuter = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.3, 3.2), darkTitanium);
    boomCylOuter.position.set(1.8, 1.2, 0.5);
    boomCylOuter.rotation.z = 0.8;
    const boomCylRod = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.18, 3.2), chromeSteel);
    boomCylRod.position.set(2.8, 2.0, 0.5);
    boomCylRod.rotation.z = 0.8;
    boomGroup.add(boomCylOuter, boomCylRod);

    // Dipper Stick Arm
    const stickMesh = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.7, 0.7), darkTitanium);
    stickMesh.position.set(6.2, 3.2, 0);
    stickMesh.rotation.z = -0.75;
    stickMesh.castShadow = true;
    boomGroup.add(stickMesh);

    // Heavy Rock Bucket with 5 Digging Teeth
    const bucketMain = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.8, 1.8), yellowEnamel);
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
    // --- BOBCAT S450 SKID-STEER COMPACT LOADER ---

    // Curved Body Chassis
    const body = new THREE.Mesh(new THREE.BoxGeometry(3.6, 2.4, 2.4), yellowEnamel);
    body.position.set(0, 2.2, 0);
    body.castShadow = true;
    group.add(body);

    // Rear Engine Grill Door
    const rearDoor = new THREE.Mesh(new THREE.BoxGeometry(0.2, 1.8, 2.2), darkTitanium);
    rearDoor.position.set(-1.85, 2.2, 0);
    group.add(rearDoor);

    // Protective ROPS Canopy Cage
    const cageGeo = new THREE.BoxGeometry(2.2, 2.0, 2.2);
    const cage = new THREE.Mesh(cageGeo, darkTitanium);
    cage.position.set(-0.1, 4.0, 0);
    group.add(cage);

    const cageGlass = new THREE.Mesh(new THREE.BoxGeometry(2.1, 1.8, 2.1), glassMat);
    cageGlass.position.set(-0.1, 4.0, 0);
    group.add(cageGlass);

    // Dual Lift Arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.4, 0.3), darkTitanium);
    armL.position.set(1.2, 3.0, 1.35);
    armL.rotation.z = -0.2;
    const armR = armL.clone();
    armR.position.z = -1.35;
    group.add(armL, armR);

    // Front Loader Bucket
    const bucket = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.4, 2.7), chromeSteel);
    bucket.position.set(2.8, 1.8, 0);
    bucket.castShadow = true;
    group.add(bucket);

    // Hydro Tilt Rams
    const tiltRamL = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.8), chromeSteel);
    tiltRamL.rotation.z = -0.4;
    tiltRamL.position.set(1.8, 2.4, 1.35);
    const tiltRamR = tiltRamL.clone();
    tiltRamR.position.z = -1.35;
    group.add(tiltRamL, tiltRamR);

    // 4 Heavy Deep Tread Off-Road Tires
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
    // --- JCB 3CX ECOXCELLENCE BACKHOE LOADER ---

    // Tractor Main Body
    const tractorBody = new THREE.Mesh(new THREE.BoxGeometry(4.8, 2.2, 2.4), yellowEnamel);
    tractorBody.position.set(0, 2.5, 0);
    tractorBody.castShadow = true;
    group.add(tractorBody);

    // Front Slanted Bonnet & Engine Grille
    const bonnet = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.4, 2.2), yellowEnamel);
    bonnet.position.set(2.6, 2.4, 0);
    group.add(bonnet);

    // Cabin Glass Frame
    const cab = new THREE.Mesh(new THREE.BoxGeometry(2.4, 2.5, 2.3), glassMat);
    cab.position.set(-0.2, 4.3, 0);
    group.add(cab);

    const cabRoof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.2, 2.5), yellowEnamel);
    cabRoof.position.set(-0.2, 5.6, 0);
    group.add(cabRoof);

    // Front Loader Assembly (Arms & 6-in-1 Shovel)
    const frontArmL = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.4, 0.3), darkTitanium);
    frontArmL.position.set(3.0, 2.5, 1.3);
    frontArmL.rotation.z = -0.15;
    const frontArmR = frontArmL.clone();
    frontArmR.position.z = -1.3;
    group.add(frontArmL, frontArmR);

    const frontShovel = new THREE.Mesh(new THREE.BoxGeometry(1.4, 1.6, 2.8), chromeSteel);
    frontShovel.position.set(4.6, 1.8, 0);
    frontShovel.castShadow = true;
    group.add(frontShovel);

    // Rear Backhoe Pivot Kingpost
    const kingpost = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.6, 2.2, 16), darkTitanium);
    kingpost.position.set(-2.6, 2.5, 0);
    group.add(kingpost);

    // Extended Stabilizer Outriggers
    const outriggerL = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.2, 2.8), darkTitanium);
    outriggerL.position.set(-2.4, 1.2, 1.8);
    outriggerL.rotation.z = 0.2;
    const outriggerR = outriggerL.clone();
    outriggerR.position.z = -1.8;
    group.add(outriggerL, outriggerR);

    // Rear Backhoe Curved Boom & Dipper
    const backBoom = new THREE.Mesh(new THREE.BoxGeometry(3.8, 0.6, 0.5), yellowEnamel);
    backBoom.position.set(-4.2, 3.8, 0);
    backBoom.rotation.z = -0.6;
    const dipper = new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.5, 0.5), darkTitanium);
    dipper.position.set(-5.8, 2.4, 0);
    dipper.rotation.z = 0.7;

    const backBucket = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.2, 1.0), chromeSteel);
    backBucket.position.set(-6.6, 0.9, 0);
    group.add(backBoom, dipper, backBucket);

    // Big Rear Tires + Small Front Steering Tires
    const bigTireGeo = new THREE.CylinderGeometry(1.6, 1.6, 0.95, 24);
    [[-1.2, 1.6, 1.5], [-1.2, 1.6, -1.5]].forEach(p => {
      const t = new THREE.Mesh(bigTireGeo, rubberTire);
      t.rotation.x = Math.PI / 2;
      t.position.set(...p);
      t.castShadow = true;
      group.add(t);
    });

    const smallTireGeo = new THREE.CylinderGeometry(1.0, 1.0, 0.7, 20);
    [[2.2, 1.0, 1.4], [2.2, 1.0, -1.4]].forEach(p => {
      const t = new THREE.Mesh(smallTireGeo, rubberTire);
      t.rotation.x = Math.PI / 2;
      t.position.set(...p);
      t.castShadow = true;
      group.add(t);
    });

  } else if (type === 'roller') {
    // --- HAMM / VOLVO TANDEM VIBRATORY ASPHALT ROAD ROLLER ---

    // Central Articulated Joint Frame
    const mainFrame = new THREE.Mesh(new THREE.BoxGeometry(4.4, 1.8, 2.2), yellowEnamel);
    mainFrame.position.set(0, 2.6, 0);
    mainFrame.castShadow = true;
    group.add(mainFrame);

    const swivelJoint = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2.0, 16), darkTitanium);
    swivelJoint.position.set(0, 2.6, 0);
    group.add(swivelJoint);

    // Big Steel Front Vibratory Drum Roller
    const drumGeo = new THREE.CylinderGeometry(1.7, 1.7, 2.7, 36);
    const frontDrum = new THREE.Mesh(drumGeo, chromeSteel);
    frontDrum.rotation.x = Math.PI / 2;
    frontDrum.position.set(2.6, 1.7, 0);
    frontDrum.castShadow = true;
    group.add(frontDrum);

    // Scraper Bar on Front Drum
    const scraperFront = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 2.8), darkTitanium);
    scraperFront.position.set(2.6, 3.4, 0);
    group.add(scraperFront);

    // Big Steel Rear Vibratory Drum Roller
    const rearDrum = new THREE.Mesh(drumGeo, chromeSteel);
    rearDrum.rotation.x = Math.PI / 2;
    rearDrum.position.set(-2.6, 1.7, 0);
    rearDrum.castShadow = true;
    group.add(rearDrum);

    const scraperRear = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.3, 2.8), darkTitanium);
    scraperRear.position.set(-2.6, 3.4, 0);
    group.add(scraperRear);

    // Operator Platform with ROPS Roof & Console
    const roofPostsL = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.1, 2.4), darkTitanium);
    roofPostsL.position.set(0.8, 4.8, 1.1);
    const roofPostsR = roofPostsL.clone();
    roofPostsR.position.z = -1.1;
    group.add(roofPostsL, roofPostsR);

    const roof = new THREE.Mesh(new THREE.BoxGeometry(2.6, 0.18, 2.5), yellowEnamel);
    roof.position.set(0, 6.0, 0);
    group.add(roof);

    // Steering Wheel & Console
    const consoleBox = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.8, 0.8), darkTitanium);
    consoleBox.position.set(0.6, 4.0, 0);
    group.add(consoleBox);
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
  // Selector Buttons
  const selectorBtns = document.querySelectorAll(".selector-btn");
  selectorBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      selectorBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const model = btn.getAttribute("data-model");
      loadProcedural3DModel(model);
    });
  });

  // Auto Orbit Toggle
  const rotateBtn = document.getElementById("hud-rotate");
  if (rotateBtn) {
    rotateBtn.addEventListener("click", () => {
      ThreeEngine.autoRotate = !ThreeEngine.autoRotate;
      rotateBtn.classList.toggle("active", ThreeEngine.autoRotate);
    });
  }

  // Wireframe Toggle
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

  // Reset Camera View
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
