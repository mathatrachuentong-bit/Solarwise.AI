import React, { useEffect, useRef, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import {
  Sun,
  Clock,
  Play,
  Pause,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  Layers,
  TreePine,
  Home,
  Compass,
  AlertTriangle,
} from 'lucide-react';
import {
  LocationPreset,
  BuildingConfig,
  SolarConfig,
  ObstructionConfig,
  SimulationTime,
} from '../../types/solar';
import { calculateSunPosition } from '../../utils/solarCalculations';
import { DemoBadge } from '../Common/DemoBadge';
import { useLanguage } from '../../i18n/LanguageContext';

interface Solar3DStudioProps {
  location: LocationPreset;
  building: BuildingConfig;
  solar: SolarConfig;
  obstruction: ObstructionConfig;
  onUpdateBuilding: (b: Partial<BuildingConfig>) => void;
  onUpdateSolar: (s: Partial<SolarConfig>) => void;
  onUpdateObstruction: (o: Partial<ObstructionConfig>) => void;
}

export const Solar3DStudio: React.FC<Solar3DStudioProps> = ({
  location,
  building,
  solar,
  obstruction,
  onUpdateBuilding,
  onUpdateSolar,
  onUpdateObstruction,
}) => {
  const { t } = useLanguage();
  const mountRef = useRef<HTMLDivElement>(null);

  // Simulation Time State: default 11:30 AM in month 2 (March, high solar in TH)
  const [simTime, setSimTime] = useState<SimulationTime>({
    hour: 11.5,
    month: 2,
    day: 15,
    isPlaying: false,
  });

  // Collapsible Bottom Dock state & active dock tab
  const [dockCollapsed, setDockCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'time' | 'building' | 'solar' | 'obstruction'>('time');

  // Three.js instances stored in refs to avoid re-renders resetting scene
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const sunLightRef = useRef<THREE.DirectionalLight | null>(null);
  const sunSphereRef = useRef<THREE.Mesh | null>(null);
  const hemiLightRef = useRef<THREE.HemisphereLight | null>(null);

  // Group refs for dynamic rebuilding
  const buildingGroupRef = useRef<THREE.Group | null>(null);
  const panelsGroupRef = useRef<THREE.Group | null>(null);
  const obstructionGroupRef = useRef<THREE.Group | null>(null);

  // Usable Roof Area & Max Panel Capacity Calculations
  const roofMetrics = useMemo(() => {
    const w = building.width;
    const l = building.length;
    const pitchRad = (building.roofPitch * Math.PI) / 180;
    const overhang = 0.5;

    // Standard commercial 550W panel dimensions
    const pLength = 2.0; // 2.0 meters along slope
    const pWidth = 1.13; // 1.13 meters along Z
    const gapSlope = 0.10;
    const gapZ = 0.08;

    if (building.roofType === 'gable') {
      const sx = w / 2 + overhang;
      const slopeLength = sx / Math.cos(pitchRad);
      const lz = l + 2 * overhang;

      const marginRidge = 0.40; // setback from ridge cap
      const marginEave = 0.35; // setback from gutter
      const marginZ = 0.40; // setback from gable edges

      const usableSlope = Math.max(0, slopeLength - marginRidge - marginEave);
      const usableZ = Math.max(0, lz - 2 * marginZ);

      const maxCols = Math.max(0, Math.floor((usableZ + gapZ) / (pWidth + gapZ)));
      const maxRows = Math.max(0, Math.floor((usableSlope + gapSlope) / (pLength + gapSlope)));
      const maxPanels = maxCols * maxRows;

      return {
        maxPanels,
        maxCols,
        maxRows,
        slopeLength,
        usableSlope,
        usableZ,
        exceeded: solar.panelCount > maxPanels,
      };
    } else {
      // Flat roof
      const usableX = Math.max(0, w - 1.6);
      const usableZ = Math.max(0, l - 1.6);
      const rowSpacing = pLength * Math.cos((15 * Math.PI) / 180) + 0.45;

      const maxCols = Math.max(0, Math.floor((usableZ + gapZ) / (pWidth + gapZ)));
      const maxRows = Math.max(0, Math.floor(usableX / rowSpacing));
      const maxPanels = maxCols * maxRows;

      return {
        maxPanels,
        maxCols,
        maxRows,
        slopeLength: w,
        usableSlope: usableX,
        usableZ,
        exceeded: solar.panelCount > maxPanels,
      };
    }
  }, [building, solar.panelCount]);

  // Day of year calculation
  const dayOfYear = useMemo(() => {
    const daysInMonths = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
    let d = simTime.day;
    for (let m = 0; m < simTime.month; m++) {
      d += daysInMonths[m];
    }
    return d;
  }, [simTime.month, simTime.day]);

  // Astronomical Sun coordinates
  const sunPosition = useMemo(() => {
    return calculateSunPosition(location.lat, location.lng, dayOfYear, simTime.hour);
  }, [location.lat, location.lng, dayOfYear, simTime.hour]);

  // Setup Three.js scene once on mount
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth || 800;
    const height = container.clientHeight || 550;

    // 1. Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0A1525');
    scene.fog = new THREE.FogExp2('#0A1525', 0.015);
    sceneRef.current = scene;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    camera.position.set(18, 14, 20);
    cameraRef.current = camera;

    // 3. Renderer
    const isHeadless = navigator.webdriver || /HeadlessChrome/i.test(navigator.userAgent);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(isHeadless ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // 4. Orbit Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI / 2 - 0.02; // Prevent going beneath ground plane
    controls.minDistance = 6;
    controls.maxDistance = 60;
    controls.target.set(0, 3, 0);
    controlsRef.current = controls;

    // 5. Lighting Rig
    const hemiLight = new THREE.HemisphereLight('#B1E1FF', '#1B2C3F', 0.45);
    scene.add(hemiLight);
    hemiLightRef.current = hemiLight;

    const sunLight = new THREE.DirectionalLight('#FFF7D6', 1.8);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 120;
    const d = 22;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    sunLight.shadow.bias = -0.0004;
    sunLight.shadow.normalBias = 0.02;
    scene.add(sunLight);
    sunLightRef.current = sunLight;

    // Visual Sun Marker in Sky
    const sunGeom = new THREE.SphereGeometry(1.2, 16, 16);
    const sunMat = new THREE.MeshBasicMaterial({ color: '#FDE047' });
    const sunSphere = new THREE.Mesh(sunGeom, sunMat);
    scene.add(sunSphere);
    sunSphereRef.current = sunSphere;

    // 6. Ground Plane & Surroundings
    const groundGroup = new THREE.Group();

    // Grass / Lawn
    const groundGeom = new THREE.PlaneGeometry(80, 80);
    const groundMat = new THREE.MeshStandardMaterial({
      color: '#16281E',
      roughness: 0.9,
      metalness: 0.05,
    });
    const groundMesh = new THREE.Mesh(groundGeom, groundMat);
    groundMesh.rotation.x = -Math.PI / 2;
    groundMesh.receiveShadow = true;
    groundMesh.position.y = 0;
    groundGroup.add(groundMesh);

    // Paved site driveway / patio
    const patioGeom = new THREE.PlaneGeometry(16, 22);
    const patioMat = new THREE.MeshStandardMaterial({
      color: '#1F2C3F',
      roughness: 0.75,
      metalness: 0.1,
    });
    const patioMesh = new THREE.Mesh(patioGeom, patioMat);
    patioMesh.rotation.x = -Math.PI / 2;
    patioMesh.receiveShadow = true;
    patioMesh.position.set(0, 0.02, 0); // Offset to avoid z-fighting
    groundGroup.add(patioMesh);

    // Site boundary curb lines
    const curbGeom = new THREE.BoxGeometry(17, 0.1, 0.2);
    const curbMat = new THREE.MeshStandardMaterial({ color: '#334760', roughness: 0.8 });
    const curb1 = new THREE.Mesh(curbGeom, curbMat);
    curb1.position.set(0, 0.05, 11);
    groundGroup.add(curb1);

    // Architectural Ground Grid
    const gridHelper = new THREE.GridHelper(50, 50, '#1B3252', '#0E2038');
    gridHelper.position.y = 0.03;
    groundGroup.add(gridHelper);

    // Peripheral landscaping trees (procedural groups)
    const createTree = (x: number, z: number, scale: number = 1) => {
      const tree = new THREE.Group();
      const trunkGeom = new THREE.CylinderGeometry(0.2 * scale, 0.3 * scale, 1.8 * scale, 8);
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#4A3525', roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.position.y = (1.8 * scale) / 2;
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      tree.add(trunk);

      const foliageMat = new THREE.MeshStandardMaterial({ color: '#1B4D3E', roughness: 0.8 });
      for (let i = 0; i < 3; i++) {
        const coneGeom = new THREE.ConeGeometry(
          (1.6 - i * 0.3) * scale,
          (1.8 - i * 0.2) * scale,
          7,
        );
        const cone = new THREE.Mesh(coneGeom, foliageMat);
        cone.position.y = (1.5 + i * 0.9) * scale;
        cone.castShadow = true;
        cone.receiveShadow = true;
        tree.add(cone);
      }
      tree.position.set(x, 0, z);
      return tree;
    };

    groundGroup.add(createTree(-14, -12, 1.2));
    groundGroup.add(createTree(-15, 6, 0.9));
    groundGroup.add(createTree(16, -10, 1.1));
    groundGroup.add(createTree(14, 12, 0.85));

    scene.add(groundGroup);

    // 7. Dynamic Object Groups
    // buildingGroup will hold the house structure AND panelsGroup to ensure identical transformations
    const buildingGroup = new THREE.Group();
    scene.add(buildingGroup);
    buildingGroupRef.current = buildingGroup;

    const panelsGroup = new THREE.Group();
    buildingGroup.add(panelsGroup);
    panelsGroupRef.current = panelsGroup;

    const obstructionGroup = new THREE.Group();
    scene.add(obstructionGroup);
    obstructionGroupRef.current = obstructionGroup;

    // 8. Animation & Render Loop
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      if (controlsRef.current) controlsRef.current.update();
      if (rendererRef.current && sceneRef.current && cameraRef.current) {
        rendererRef.current.render(sceneRef.current, cameraRef.current);
      }
    };
    animate();

    // 9. Resize Observer
    const handleResize = () => {
      if (!mountRef.current || !rendererRef.current || !cameraRef.current) return;
      const w = mountRef.current.clientWidth;
      const h = mountRef.current.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  // Update Sun Direction and Sky Atmosphere
  useEffect(() => {
    if (!sunLightRef.current || !sunSphereRef.current || !hemiLightRef.current || !sceneRef.current) return;

    const { altitude, azimuth, isDaylight } = sunPosition;

    if (!isDaylight || altitude <= 0) {
      sunLightRef.current.intensity = 0.05;
      hemiLightRef.current.intensity = 0.15;
      sceneRef.current.background = new THREE.Color('#040914');
      if (sceneRef.current.fog) sceneRef.current.fog.color = new THREE.Color('#040914');
      sunSphereRef.current.visible = false;
      return;
    }

    sunSphereRef.current.visible = true;

    const distance = 45;
    const altRad = (altitude * Math.PI) / 180;
    const azRad = (azimuth * Math.PI) / 180;

    const x = distance * Math.cos(altRad) * Math.sin(azRad);
    const y = distance * Math.sin(altRad);
    const z = -distance * Math.cos(altRad) * Math.cos(azRad);

    sunLightRef.current.position.set(x, y, z);
    sunLightRef.current.target.position.set(0, 3, 0);
    sunLightRef.current.target.updateMatrixWorld();

    sunSphereRef.current.position.set(x * 0.95, y * 0.95, z * 0.95);

    if (altitude < 15) {
      sunLightRef.current.color = new THREE.Color('#FF8A3D');
      sunLightRef.current.intensity = 1.2;
      hemiLightRef.current.intensity = 0.3;
      sceneRef.current.background = new THREE.Color('#0D1524');
    } else if (altitude < 35) {
      sunLightRef.current.color = new THREE.Color('#FFE29A');
      sunLightRef.current.intensity = 1.6;
      hemiLightRef.current.intensity = 0.45;
      sceneRef.current.background = new THREE.Color('#0C192E');
    } else {
      sunLightRef.current.color = new THREE.Color('#FFFFFF');
      sunLightRef.current.intensity = 2.1;
      hemiLightRef.current.intensity = 0.55;
      sceneRef.current.background = new THREE.Color('#0B1B33');
    }

    if (sceneRef.current.fog) {
      sceneRef.current.fog.color = sceneRef.current.background;
    }
  }, [sunPosition]);

  // Build / Rebuild Procedural Residential House & Roof
  useEffect(() => {
    if (!buildingGroupRef.current) return;
    const group = buildingGroupRef.current;

    // Remove old building elements except panelsGroupRef
    const childrenToKeep = panelsGroupRef.current ? [panelsGroupRef.current] : [];
    while (group.children.length > 0) {
      const child = group.children[0];
      if (child === panelsGroupRef.current) {
        group.remove(child);
      } else {
        if ((child as THREE.Mesh).geometry) (child as THREE.Mesh).geometry.dispose();
        group.remove(child);
      }
    }
    // Re-add panelsGroup
    if (childrenToKeep.length > 0) {
      group.add(childrenToKeep[0]);
    }

    const w = building.width;
    const l = building.length;
    const h = building.wallHeight;
    const overhang = 0.5;

    // Materials
    const foundationMat = new THREE.MeshStandardMaterial({ color: '#273549', roughness: 0.9 });
    const wallMat = new THREE.MeshStandardMaterial({
      color: building.wallColor || '#E2E8F0',
      roughness: 0.8,
      metalness: 0.05,
    });
    const roofMat = new THREE.MeshStandardMaterial({
      color: building.roofColor || '#233448',
      roughness: 0.6,
      metalness: 0.2,
    });
    const trimMat = new THREE.MeshStandardMaterial({ color: '#1B2C3F', roughness: 0.5 });
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: '#38BDF8',
      transmission: 0.7,
      roughness: 0.1,
      metalness: 0.1,
      transparent: true,
      opacity: 0.8,
    });
    const doorMat = new THREE.MeshStandardMaterial({ color: '#644122', roughness: 0.7 });

    // 1. Concrete Foundation Slab
    const foundGeom = new THREE.BoxGeometry(w + 0.4, 0.4, l + 0.4);
    const foundation = new THREE.Mesh(foundGeom, foundationMat);
    foundation.position.y = 0.2;
    foundation.castShadow = true;
    foundation.receiveShadow = true;
    group.add(foundation);

    // 2. Main Wall Body
    const yWallBase = 0.4;
    const yWallTop = yWallBase + h;
    const wallGeom = new THREE.BoxGeometry(w, h, l);
    const wallMesh = new THREE.Mesh(wallGeom, wallMat);
    wallMesh.position.y = yWallBase + h / 2;
    wallMesh.castShadow = true;
    wallMesh.receiveShadow = true;
    group.add(wallMesh);

    // 3. Architectural Windows & Door
    const doorGeom = new THREE.BoxGeometry(1.2, 2.2, 0.1);
    const door = new THREE.Mesh(doorGeom, doorMat);
    door.position.set(0, yWallBase + 1.1, l / 2 + 0.06);
    door.castShadow = true;
    group.add(door);

    const canopyGeom = new THREE.BoxGeometry(2.0, 0.15, 1.2);
    const canopy = new THREE.Mesh(canopyGeom, trimMat);
    canopy.position.set(0, yWallBase + 2.4, l / 2 + 0.6);
    canopy.castShadow = true;
    canopy.receiveShadow = true;
    group.add(canopy);

    const addWindow = (wx: number, wy: number, wz: number, ww: number, wh: number) => {
      const winGroup = new THREE.Group();
      const frameGeom = new THREE.BoxGeometry(ww + 0.1, wh + 0.1, 0.08);
      const frame = new THREE.Mesh(frameGeom, trimMat);
      winGroup.add(frame);
      const paneGeom = new THREE.BoxGeometry(ww, wh, 0.04);
      const pane = new THREE.Mesh(paneGeom, glassMat);
      pane.position.z = 0.02;
      winGroup.add(pane);

      winGroup.position.set(wx, wy, wz);
      group.add(winGroup);
    };

    addWindow(-w * 0.25, yWallBase + 1.4, l / 2 + 0.06, 1.5, 1.2);
    addWindow(w * 0.25, yWallBase + 1.4, l / 2 + 0.06, 1.5, 1.2);
    addWindow(-w * 0.25, yWallBase + h * 0.75, l / 2 + 0.06, 1.6, 1.3);
    addWindow(w * 0.25, yWallBase + h * 0.75, l / 2 + 0.06, 1.6, 1.3);

    // 4. Exact Mathematical Roof Construction
    const pitchRad = (building.roofPitch * Math.PI) / 180;
    const roofHeight = (w / 2) * Math.tan(pitchRad);
    const yRidge = yWallTop + roofHeight;
    const sx = w / 2 + overhang;
    const slopeLength = sx / Math.cos(pitchRad);
    const lz = l + 2 * overhang;
    const slopeThickness = 0.16;

    if (building.roofType === 'gable') {
      const slopeGeom = new THREE.BoxGeometry(slopeLength, slopeThickness, lz);

      // Right slope (South / Solar facing slope)
      // Top face passes through (0, yRidge, z) and (sx, yRidge - sx*tan(pitch), z)
      const rightSlope = new THREE.Mesh(slopeGeom, roofMat);
      const rxCenter = (slopeLength / 2) * Math.cos(pitchRad) - (slopeThickness / 2) * Math.sin(pitchRad);
      const ryCenter = yRidge - (slopeLength / 2) * Math.sin(pitchRad) - (slopeThickness / 2) * Math.cos(pitchRad);
      rightSlope.position.set(rxCenter, ryCenter, 0);
      rightSlope.rotation.z = -pitchRad;
      rightSlope.castShadow = true;
      rightSlope.receiveShadow = true;
      group.add(rightSlope);

      // Left slope (North facing slope)
      const leftSlope = new THREE.Mesh(slopeGeom, roofMat);
      const lxCenter = -(slopeLength / 2) * Math.cos(pitchRad) + (slopeThickness / 2) * Math.sin(pitchRad);
      const lyCenter = yRidge - (slopeLength / 2) * Math.sin(pitchRad) - (slopeThickness / 2) * Math.cos(pitchRad);
      leftSlope.position.set(lxCenter, lyCenter, 0);
      leftSlope.rotation.z = pitchRad;
      leftSlope.castShadow = true;
      leftSlope.receiveShadow = true;
      group.add(leftSlope);

      // Triangular Gables on front (+Z) and back (-Z)
      const gableShape = new THREE.Shape();
      gableShape.moveTo(-w / 2, 0);
      gableShape.lineTo(w / 2, 0);
      gableShape.lineTo(0, roofHeight);
      gableShape.closePath();
      const gableGeom = new THREE.ShapeGeometry(gableShape);

      const frontGable = new THREE.Mesh(gableGeom, wallMat);
      frontGable.position.set(0, yWallTop, l / 2 + 0.01);
      frontGable.castShadow = true;
      group.add(frontGable);

      const backGable = new THREE.Mesh(gableGeom, wallMat);
      backGable.position.set(0, yWallTop, -l / 2 - 0.01);
      backGable.rotation.y = Math.PI;
      backGable.castShadow = true;
      group.add(backGable);

      // Ridge Cap Trim
      const ridgeGeom = new THREE.BoxGeometry(0.28, 0.12, lz + 0.04);
      const ridge = new THREE.Mesh(ridgeGeom, trimMat);
      ridge.position.set(0, yRidge + 0.04, 0);
      group.add(ridge);
    } else {
      // Flat commercial rooftop with parapet
      const flatGeom = new THREE.BoxGeometry(w + overhang * 2, 0.3, l + overhang * 2);
      const flatRoof = new THREE.Mesh(flatGeom, roofMat);
      flatRoof.position.set(0, yWallTop + 0.15, 0);
      flatRoof.castShadow = true;
      flatRoof.receiveShadow = true;
      group.add(flatRoof);

      // Parapet perimeter
      const parapetGeom = new THREE.BoxGeometry(w + overhang * 2 + 0.2, 0.45, l + overhang * 2 + 0.2);
      const parapet = new THREE.Mesh(parapetGeom, trimMat);
      parapet.position.set(0, yWallTop + 0.45, 0);
      parapet.castShadow = true;
      group.add(parapet);
    }

    // Apply House Orientation Azimuth to the entire building group
    group.rotation.y = ((building.roofAzimuth - 180) * Math.PI) / 180;
  }, [building]);

  // Build / Rebuild Procedural Solar Panels Aligned Perfectly to Roof Surface
  useEffect(() => {
    if (!panelsGroupRef.current) return;
    const group = panelsGroupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      group.remove(child);
    }

    const panelCount = Math.min(solar.panelCount, roofMetrics.maxPanels);
    if (panelCount <= 0) return;

    const w = building.width;
    const l = building.length;
    const h = building.wallHeight;
    const overhang = 0.5;
    const pitchRad = (building.roofPitch * Math.PI) / 180;
    const roofHeight = (w / 2) * Math.tan(pitchRad);
    const yWallTop = 0.4 + h;
    const yRidge = yWallTop + roofHeight;

    // Standard commercial 550W panel specs
    const pLength = 2.0; // Dimension along slope
    const pWidth = 1.13; // Dimension along Z
    const pThick = 0.035; // 35mm frame
    const hClearance = 0.05; // 50mm standoff mounting rails
    const gapSlope = 0.10;
    const gapZ = 0.08;
    const marginRidge = 0.40;

    // Materials
    const pvCellMat = new THREE.MeshStandardMaterial({
      color: '#081728', // Deep monocrystalline dark navy blue
      roughness: 0.15,
      metalness: 0.88,
    });
    const frameMat = new THREE.MeshStandardMaterial({
      color: '#A0AEC0', // Anodized aluminum frame
      roughness: 0.28,
      metalness: 0.92,
    });
    const railMat = new THREE.MeshStandardMaterial({
      color: '#4A5568', // Heavy-duty extruded mounting rail
      roughness: 0.4,
      metalness: 0.85,
    });

    const createSinglePanel = () => {
      const panel = new THREE.Group();

      // Outer aluminum frame (pLength along local X, pThick along local Y, pWidth along local Z)
      const frameGeom = new THREE.BoxGeometry(pLength, pThick, pWidth);
      const frame = new THREE.Mesh(frameGeom, frameMat);
      frame.castShadow = true;
      frame.receiveShadow = true;
      panel.add(frame);

      // Photovoltaic cell core
      const cellGeom = new THREE.BoxGeometry(pLength - 0.05, pThick + 0.005, pWidth - 0.05);
      const cell = new THREE.Mesh(cellGeom, pvCellMat);
      cell.castShadow = true;
      cell.receiveShadow = true;
      panel.add(cell);

      // Mounting rails underneath
      const railGeom = new THREE.BoxGeometry(pLength + 0.06, hClearance, 0.04);
      const rail1 = new THREE.Mesh(railGeom, railMat);
      rail1.position.set(0, -pThick / 2 - hClearance / 2, -pWidth * 0.3);
      rail1.castShadow = true;
      panel.add(rail1);

      const rail2 = new THREE.Mesh(railGeom, railMat);
      rail2.position.set(0, -pThick / 2 - hClearance / 2, pWidth * 0.3);
      rail2.castShadow = true;
      panel.add(rail2);

      return panel;
    };

    if (building.roofType === 'gable') {
      const maxCols = roofMetrics.maxCols;
      const maxRows = roofMetrics.maxRows;
      const cols = Math.min(maxCols, Math.max(1, panelCount));
      const rows = Math.min(maxRows, Math.ceil(panelCount / cols));

      const arrayZ = cols * pWidth + (cols - 1) * gapZ;
      const zStart = -arrayZ / 2 + pWidth / 2;

      const usableSlope = roofMetrics.usableSlope;
      const arraySlope = rows * pLength + (rows - 1) * gapSlope;
      const sStart = marginRidge + (usableSlope - arraySlope) / 2 + pLength / 2;

      for (let i = 0; i < panelCount; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        const s = sStart + row * (pLength + gapSlope);
        const z = zStart + col * (pWidth + gapZ);

        // Surface point on roof top
        const xSurface = s * Math.cos(pitchRad);
        const ySurface = yRidge - s * Math.sin(pitchRad);

        // Normal offset
        const hOffset = hClearance + pThick / 2;
        const px = xSurface + hOffset * Math.sin(pitchRad);
        const py = ySurface + hOffset * Math.cos(pitchRad);
        const pz = z;

        const panel = createSinglePanel();
        panel.position.set(px, py, pz);
        panel.rotation.set(0, 0, -pitchRad);
        group.add(panel);
      }
    } else {
      // Flat roof with 15-degree tilt racks
      const maxCols = roofMetrics.maxCols;
      const maxRows = roofMetrics.maxRows;
      const cols = Math.min(maxCols, Math.max(1, panelCount));
      const rows = Math.min(maxRows, Math.ceil(panelCount / cols));

      const tiltRad = (15 * Math.PI) / 180;
      const rowSpacing = pLength * Math.cos(tiltRad) + 0.45;

      const arrayZ = cols * pWidth + (cols - 1) * gapZ;
      const zStart = -arrayZ / 2 + pWidth / 2;
      const arrayX = rows * rowSpacing;
      const xStart = -arrayX / 2 + rowSpacing / 2;

      const yDeck = yWallTop + 0.30;

      for (let i = 0; i < panelCount; i++) {
        const row = Math.floor(i / cols);
        const col = i % cols;

        const px = xStart + row * rowSpacing;
        const pz = zStart + col * (pWidth + gapZ);
        const py = yDeck + hClearance + (pLength / 2) * Math.sin(tiltRad) + 0.08;

        const panel = createSinglePanel();
        panel.position.set(px, py, pz);
        panel.rotation.set(0, 0, -tiltRad);
        group.add(panel);
      }
    }
  }, [solar.panelCount, building, roofMetrics]);

  // Build / Rebuild Procedural Obstruction
  useEffect(() => {
    if (!obstructionGroupRef.current) return;
    const group = obstructionGroupRef.current;

    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh;
      if (child.geometry) child.geometry.dispose();
      group.remove(child);
    }

    if (!obstruction.enabled) return;

    const ox = obstruction.distanceX;
    const oz = obstruction.distanceZ;
    const oh = obstruction.height;

    if (obstruction.type === 'tree') {
      const trunkH = oh * 0.4;
      const trunkGeom = new THREE.CylinderGeometry(0.35, 0.55, trunkH, 10);
      const trunkMat = new THREE.MeshStandardMaterial({ color: '#3E2718', roughness: 0.9 });
      const trunk = new THREE.Mesh(trunkGeom, trunkMat);
      trunk.position.set(ox, trunkH / 2, oz);
      trunk.castShadow = true;
      trunk.receiveShadow = true;
      group.add(trunk);

      const foliageMat = new THREE.MeshStandardMaterial({ color: '#133E2B', roughness: 0.85 });
      for (let i = 0; i < 4; i++) {
        const rad = (oh * 0.35) * (1 - i * 0.15);
        const coneH = (oh * 0.3) * (1 - i * 0.1);
        const coneGeom = new THREE.ConeGeometry(rad, coneH, 8);
        const cone = new THREE.Mesh(coneGeom, foliageMat);
        cone.position.set(ox, trunkH + i * (coneH * 0.65), oz);
        cone.castShadow = true;
        cone.receiveShadow = true;
        group.add(cone);
      }
    } else {
      const bGeom = new THREE.BoxGeometry(obstruction.width, oh, obstruction.width * 1.5);
      const bMat = new THREE.MeshStandardMaterial({ color: '#27384F', roughness: 0.7 });
      const bMesh = new THREE.Mesh(bGeom, bMat);
      bMesh.position.set(ox, oh / 2, oz);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      group.add(bMesh);
    }
  }, [obstruction]);

  // Sun scrubbing animation timer
  useEffect(() => {
    if (!simTime.isPlaying) return;

    const interval = setInterval(() => {
      setSimTime((prev) => {
        let nextHour = prev.hour + 0.1;
        if (nextHour > 18.0) nextHour = 6.0;
        return { ...prev, hour: Number(nextHour.toFixed(1)) };
      });
    }, 120);

    return () => clearInterval(interval);
  }, [simTime.isPlaying]);

  // Camera presets
  const handleCameraPreset = (view: 'iso' | 'top' | 'south' | 'front') => {
    if (!cameraRef.current || !controlsRef.current) return;
    const cam = cameraRef.current;
    const ctrl = controlsRef.current;

    switch (view) {
      case 'iso':
        cam.position.set(18, 14, 20);
        ctrl.target.set(0, 3, 0);
        break;
      case 'top':
        cam.position.set(0, 28, 0.01);
        ctrl.target.set(0, 0, 0);
        break;
      case 'south':
        cam.position.set(0, 8, 22);
        ctrl.target.set(0, 3, 0);
        break;
      case 'front':
        cam.position.set(0, 4, 18);
        ctrl.target.set(0, 3, 0);
        break;
    }
    ctrl.update();
  };

  const formatTimeStr = (h: number) => {
    const hours = Math.floor(h);
    const minutes = Math.round((h - hours) * 60);
    const mStr = minutes < 10 ? `0${minutes}` : `${minutes}`;
    const hStr = hours < 10 ? `0${hours}` : `${hours}`;
    return `${hStr}:${mStr}`;
  };

  return (
    <div className="relative w-full h-[620px] sm:h-[680px] bg-[#091526] rounded-2xl overflow-hidden border border-[#1B3252] shadow-2xl flex flex-col">
      {/* 3D WebGL Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
        {/* Top-Left: Digital Twin Status */}
        <div className="bg-[#091526]/90 border border-[#1B3252] rounded-xl p-3 backdrop-blur-md pointer-events-auto shadow-lg space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#27D3BC]" />
            <span className="text-xs font-bold text-white tracking-wide">
              {t('studioStatusBadge')}
            </span>
            <DemoBadge label={t('assumedBadge')} variant="assumed" />
          </div>

          <div className="flex items-center gap-3 text-[11px] text-[#8FA3BF] font-mono">
            <span>
              {t('studioSunAlt')}: <strong className="text-amber-400">{sunPosition.altitude.toFixed(1)}°</strong>
            </span>
            <span>•</span>
            <span>
              {t('studioAz')}: <strong className="text-[#27D3BC]">{sunPosition.azimuth.toFixed(0)}°</strong>
            </span>
            <span>•</span>
            <span>
              {t('studioTime')}: <strong className="text-white">{formatTimeStr(simTime.hour)}</strong>
            </span>
          </div>
        </div>

        {/* Top-Right: Camera Presets */}
        <div className="flex items-center gap-1.5 bg-[#091526]/90 border border-[#1B3252] p-1.5 rounded-xl backdrop-blur-md pointer-events-auto shadow-lg">
          <button
            onClick={() => handleCameraPreset('iso')}
            className="px-2.5 py-1 rounded text-[11px] font-medium text-[#8FA3BF] hover:text-white hover:bg-[#112239] transition-colors"
            title="Isometric 3D Perspective"
          >
            {t('cam3dIso')}
          </button>
          <button
            onClick={() => handleCameraPreset('top')}
            className="px-2.5 py-1 rounded text-[11px] font-medium text-[#8FA3BF] hover:text-white hover:bg-[#112239] transition-colors"
            title="Rooftop Top-Down"
          >
            {t('camRooftop')}
          </button>
          <button
            onClick={() => handleCameraPreset('south')}
            className="px-2.5 py-1 rounded text-[11px] font-medium text-[#8FA3BF] hover:text-white hover:bg-[#112239] transition-colors"
            title="South Sun Facing View"
          >
            {t('camSouth')}
          </button>
          <div className="w-px h-3 bg-[#1B3252]" />
          <button
            onClick={() => handleCameraPreset('iso')}
            className="p-1 rounded text-[#8FA3BF] hover:text-[#27D3BC] transition-colors"
            title="Reset Camera Target"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Compass / Orientation Guide in Top-Left (Below HUD) */}
      <div className="absolute top-24 left-4 bg-[#091526]/80 border border-[#1B3252] rounded-lg p-2 backdrop-blur-sm pointer-events-none hidden sm:flex items-center gap-2 text-[10px] text-[#8FA3BF]">
        <Compass className="w-4 h-4 text-[#27D3BC]" />
        <span>{t('studioRoofAzimuth')}: <strong className="text-white">{building.roofAzimuth}°</strong> ({t('studioSouthFacing')})</span>
      </div>

      {/* Roof Capacity Warning Banner (Requirement 9) */}
      {roofMetrics.exceeded && (
        <div className="absolute top-36 left-4 right-4 max-w-2xl mx-auto bg-amber-500/15 border border-amber-500/50 rounded-xl p-3 backdrop-blur-md pointer-events-auto shadow-2xl flex items-start gap-3 text-amber-200 text-xs animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="block font-semibold text-white">
              {t('roofCapacityWarningTitle')}
            </strong>
            <p className="text-[11px] text-amber-200/90 mt-0.5 leading-relaxed">
              {t('roofCapacityWarningMsg', {
                requested: solar.panelCount,
                max: roofMetrics.maxPanels,
              })}
            </p>
          </div>
        </div>
      )}

      {/* Unified Collapsible Bottom Dock */}
      <div
        className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl transition-all duration-300 pointer-events-auto z-20 ${
          dockCollapsed ? 'translate-y-[calc(100%-42px)]' : 'translate-y-0'
        }`}
      >
        <div className="bg-[#0D1C30]/95 border border-[#1B3252] rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden">
          {/* Dock Header & Collapse Toggle */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#1B3252] bg-[#091526]/80">
            {/* Dock Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto text-xs py-0.5">
              <button
                onClick={() => { setActiveTab('time'); setDockCollapsed(false); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  activeTab === 'time' && !dockCollapsed
                    ? 'bg-[#27D3BC] text-[#091526] font-semibold'
                    : 'text-[#8FA3BF] hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span>{t('dockSunShadows')}</span>
              </button>

              <button
                onClick={() => { setActiveTab('building'); setDockCollapsed(false); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  activeTab === 'building' && !dockCollapsed
                    ? 'bg-[#27D3BC] text-[#091526] font-semibold'
                    : 'text-[#8FA3BF] hover:text-white'
                }`}
              >
                <Home className="w-3.5 h-3.5" />
                <span>{t('dockBuilding')}</span>
              </button>

              <button
                onClick={() => { setActiveTab('solar'); setDockCollapsed(false); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  activeTab === 'solar' && !dockCollapsed
                    ? 'bg-[#27D3BC] text-[#091526] font-semibold'
                    : 'text-[#8FA3BF] hover:text-white'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>{t('dockSolarArray')} ({Math.min(solar.panelCount, roofMetrics.maxPanels)} / {solar.panelCount})</span>
              </button>

              <button
                onClick={() => { setActiveTab('obstruction'); setDockCollapsed(false); }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  activeTab === 'obstruction' && !dockCollapsed
                    ? 'bg-[#27D3BC] text-[#091526] font-semibold'
                    : 'text-[#8FA3BF] hover:text-white'
                }`}
              >
                <TreePine className="w-3.5 h-3.5" />
                <span>{t('dockObstruction')}</span>
              </button>
            </div>

            {/* Collapse / Expand Toggle Button */}
            <button
              onClick={() => setDockCollapsed(!dockCollapsed)}
              className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-[#8FA3BF] hover:text-white hover:bg-[#1A3150] transition-colors shrink-0 ml-2"
              title={dockCollapsed ? t('showControls') : t('zenView')}
            >
              {dockCollapsed ? (
                <>
                  <ChevronUp className="w-3.5 h-3.5 text-[#27D3BC]" />
                  <span className="hidden sm:inline">{t('showControls')}</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{t('zenView')}</span>
                </>
              )}
            </button>
          </div>

          {/* Dock Content Panels */}
          <div className="p-4 text-xs">
            {/* Tab 1: Sun & Shadows Simulation */}
            {activeTab === 'time' && (
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() =>
                        setSimTime((prev) => ({ ...prev, isPlaying: !prev.isPlaying }))
                      }
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                        simTime.isPlaying
                          ? 'bg-amber-400 text-[#091526]'
                          : 'bg-[#27D3BC] text-[#091526] hover:bg-[#20bfa9]'
                      }`}
                    >
                      {simTime.isPlaying ? (
                        <>
                          <Pause className="w-3.5 h-3.5" /> {t('dockPauseSun')}
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5" /> {t('dockPlaySun')}
                        </>
                      )}
                    </button>

                    <div className="text-xs text-[#8FA3BF] flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#27D3BC]" />
                      <span className="font-mono text-sm text-white font-bold">
                        {formatTimeStr(simTime.hour)}
                      </span>
                      <span className="text-[10px] text-[#64748B]">
                        ({sunPosition.isDaylight ? t('dockSunlightActive') : t('dockTwilight')})
                      </span>
                    </div>
                  </div>

                  {/* Quick Sun times */}
                  <div className="flex items-center gap-1.5">
                    {[
                      { label: '08:00', h: 8 },
                      { label: '10:00', h: 10 },
                      { label: '12:00', h: 12 },
                      { label: '14:30', h: 14.5 },
                      { label: '16:30', h: 16.5 },
                    ].map((slot) => (
                      <button
                        key={slot.h}
                        onClick={() =>
                          setSimTime((prev) => ({ ...prev, hour: slot.h, isPlaying: false }))
                        }
                        className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                          Math.abs(simTime.hour - slot.h) < 0.2
                            ? 'bg-[#27D3BC] text-[#091526] font-bold'
                            : 'bg-[#091526] text-[#8FA3BF] hover:text-white border border-[#1B3252]'
                        }`}
                      >
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sun Scrubbing Slider */}
                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] text-[#8FA3BF]">
                    <span>{t('dockSunrise')}</span>
                    <span className="text-[#27D3BC] font-mono">
                      {t('dockScrubInstruction')}
                    </span>
                    <span>{t('dockSunset')}</span>
                  </div>
                  <input
                    type="range"
                    min="6.0"
                    max="18.0"
                    step="0.1"
                    value={simTime.hour}
                    onChange={(e) =>
                      setSimTime((prev) => ({
                        ...prev,
                        hour: parseFloat(e.target.value),
                        isPlaying: false,
                      }))
                    }
                    className="w-full accent-[#27D3BC] cursor-pointer"
                  />
                </div>
              </div>
            )}

            {/* Tab 2: Building Geometry */}
            {activeTab === 'building' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1">
                  <span className="text-[#8FA3BF]">{t('dockParametricModel')}</span>
                  <DemoBadge label={t('dockManualAssumed')} variant="assumed" />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-[#091526] p-2.5 rounded-lg border border-[#1B3252]">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#8FA3BF]">{t('dockWidth')}</span>
                      <span className="text-white font-mono font-bold">{building.width} m</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="18"
                      step="1"
                      value={building.width}
                      onChange={(e) =>
                        onUpdateBuilding({ width: parseInt(e.target.value) })
                      }
                      className="w-full accent-[#27D3BC] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#091526] p-2.5 rounded-lg border border-[#1B3252]">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#8FA3BF]">{t('dockLength')}</span>
                      <span className="text-white font-mono font-bold">{building.length} m</span>
                    </div>
                    <input
                      type="range"
                      min="6"
                      max="22"
                      step="1"
                      value={building.length}
                      onChange={(e) =>
                        onUpdateBuilding({ length: parseInt(e.target.value) })
                      }
                      className="w-full accent-[#27D3BC] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#091526] p-2.5 rounded-lg border border-[#1B3252]">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#8FA3BF]">{t('dockWallHeight')}</span>
                      <span className="text-white font-mono font-bold">{building.wallHeight} m</span>
                    </div>
                    <input
                      type="range"
                      min="3.5"
                      max="9.0"
                      step="0.5"
                      value={building.wallHeight}
                      onChange={(e) =>
                        onUpdateBuilding({ wallHeight: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#27D3BC] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#091526] p-2.5 rounded-lg border border-[#1B3252]">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#8FA3BF]">{t('dockRoofPitch')}</span>
                      <span className="text-[#27D3BC] font-mono font-bold">{building.roofPitch}°</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="40"
                      step="1"
                      value={building.roofPitch}
                      onChange={(e) =>
                        onUpdateBuilding({ roofPitch: parseInt(e.target.value) })
                      }
                      className="w-full accent-[#27D3BC] cursor-pointer"
                    />
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8FA3BF] text-[11px]">{t('dockRoofProfile')}</span>
                    <button
                      onClick={() => onUpdateBuilding({ roofType: 'gable' })}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        building.roofType === 'gable'
                          ? 'bg-[#27D3BC] text-[#091526] font-semibold'
                          : 'bg-[#091526] text-[#8FA3BF] border border-[#1B3252]'
                      }`}
                    >
                      {t('dockRoofGable')}
                    </button>
                    <button
                      onClick={() => onUpdateBuilding({ roofType: 'flat' })}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        building.roofType === 'flat'
                          ? 'bg-[#27D3BC] text-[#091526] font-semibold'
                          : 'bg-[#091526] text-[#8FA3BF] border border-[#1B3252]'
                      }`}
                    >
                      {t('dockRoofFlat')}
                    </button>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[#8FA3BF] text-[11px]">{t('studioRoofAzimuth')}:</span>
                    <input
                      type="range"
                      min="0"
                      max="360"
                      step="5"
                      value={building.roofAzimuth}
                      onChange={(e) =>
                        onUpdateBuilding({ roofAzimuth: parseInt(e.target.value) })
                      }
                      className="w-28 accent-[#27D3BC] cursor-pointer"
                    />
                    <span className="text-white font-mono text-xs w-10">
                      {building.roofAzimuth}°
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Solar Array Layout */}
            {activeTab === 'solar' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[#8FA3BF]">{t('dockPanelLayoutTitle')}</span>
                  <div className="flex items-center gap-2">
                    {roofMetrics.exceeded && (
                      <span className="text-[10px] text-amber-400 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
                        Max: {roofMetrics.maxPanels} panels
                      </span>
                    )}
                    <span className="font-mono text-[#27D3BC] font-bold">
                      {solar.panelCount} Panels × 550W = {solar.systemCapacityKwp} kWp
                    </span>
                  </div>
                </div>

                <div className="bg-[#091526] p-3 rounded-lg border border-[#1B3252] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs text-[#8FA3BF]">
                      <span>{t('dockInstalledPanels')}</span>
                      <strong className="text-white">{solar.panelCount} units</strong>
                    </div>
                    <input
                      type="range"
                      min="2"
                      max="32"
                      step="2"
                      value={solar.panelCount}
                      onChange={(e) => {
                        const count = parseInt(e.target.value);
                        const kwp = Number(((count * solar.panelWattage) / 1000).toFixed(2));
                        onUpdateSolar({ panelCount: count, systemCapacityKwp: kwp });
                      }}
                      className="w-full accent-[#27D3BC] cursor-pointer"
                    />
                  </div>

                  <div className="flex gap-2">
                    {[6, 12, 18, 24].map((cnt) => (
                      <button
                        key={cnt}
                        onClick={() => {
                          const kwp = Number(((cnt * solar.panelWattage) / 1000).toFixed(2));
                          onUpdateSolar({ panelCount: cnt, systemCapacityKwp: kwp });
                        }}
                        className={`px-3 py-1.5 rounded text-xs font-mono font-medium ${
                          solar.panelCount === cnt
                            ? 'bg-[#27D3BC] text-[#091526] font-bold'
                            : 'bg-[#112239] text-[#8FA3BF] hover:text-white border border-[#1B3252]'
                        }`}
                      >
                        {cnt} panels
                      </button>
                    ))}
                  </div>
                </div>

                <p className="text-[11px] text-[#64748B]">
                  {t('dockPanelsMounted')}
                </p>
              </div>
            )}

            {/* Tab 4: Obstruction & Shading */}
            {activeTab === 'obstruction' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[#8FA3BF]">{t('dockObstacleTitle')}</span>
                    <button
                      onClick={() =>
                        onUpdateObstruction({ enabled: !obstruction.enabled })
                      }
                      className={`px-2 py-0.5 rounded text-[11px] font-medium ${
                        obstruction.enabled
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                          : 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      }`}
                    >
                      {obstruction.enabled ? t('dockEnabled') : t('dockDisabled')}
                    </button>
                  </div>

                  <div className="flex gap-1.5">
                    <button
                      onClick={() => onUpdateObstruction({ type: 'tree' })}
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        obstruction.type === 'tree'
                          ? 'bg-[#27D3BC] text-[#091526]'
                          : 'bg-[#091526] text-[#8FA3BF]'
                      }`}
                    >
                      {t('dockTree')}
                    </button>
                    <button
                      onClick={() => onUpdateObstruction({ type: 'building' })}
                      className={`px-2.5 py-1 rounded text-xs font-medium ${
                        obstruction.type === 'building'
                          ? 'bg-[#27D3BC] text-[#091526]'
                          : 'bg-[#091526] text-[#8FA3BF]'
                      }`}
                    >
                      {t('dockBuildingObstacle')}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-[#091526] p-2.5 rounded-lg border border-[#1B3252]">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#8FA3BF]">{t('dockObstacleHeight')}</span>
                      <span className="text-[#27D3BC] font-mono font-bold">
                        {obstruction.height} m
                      </span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="18"
                      step="0.5"
                      value={obstruction.height}
                      onChange={(e) =>
                        onUpdateObstruction({ height: parseFloat(e.target.value) })
                      }
                      className="w-full accent-[#27D3BC] cursor-pointer"
                    />
                    <div className="text-[10px] text-[#64748B] mt-1">
                      {t('dockObstacleAffects')}
                    </div>
                  </div>

                  <div className="bg-[#091526] p-2.5 rounded-lg border border-[#1B3252]">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#8FA3BF]">{t('dockDistanceX')}</span>
                      <span className="text-white font-mono font-bold">
                        {obstruction.distanceX} m
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="1"
                      value={obstruction.distanceX}
                      onChange={(e) =>
                        onUpdateObstruction({ distanceX: parseInt(e.target.value) })
                      }
                      className="w-full accent-[#27D3BC] cursor-pointer"
                    />
                  </div>

                  <div className="bg-[#091526] p-2.5 rounded-lg border border-[#1B3252]">
                    <div className="flex justify-between text-[11px] mb-1">
                      <span className="text-[#8FA3BF]">{t('dockDistanceZ')}</span>
                      <span className="text-white font-mono font-bold">
                        {obstruction.distanceZ} m
                      </span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      step="1"
                      value={obstruction.distanceZ}
                      onChange={(e) =>
                        onUpdateObstruction({ distanceZ: parseInt(e.target.value) })
                      }
                      className="w-full accent-[#27D3BC] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
