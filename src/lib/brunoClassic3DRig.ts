import * as THREE from 'three';

export interface BrunoClassic3DRig {
  root: THREE.Group;
  torsoGroup: THREE.Group;
  neckPivot: THREE.Group;
  headGroup: THREE.Group;
  mustacheGroup: THREE.Group;
  mouthHole: THREE.Mesh;
  leftEye: { eyeGroup: THREE.Group; pupilGroup: THREE.Group };
  rightEye: { eyeGroup: THREE.Group; pupilGroup: THREE.Group };
  leftBrow: THREE.Mesh;
  rightBrow: THREE.Mesh;
  leftArm: { shoulder: THREE.Group; elbow: THREE.Group; hand: THREE.Mesh };
  rightArm: { shoulder: THREE.Group; elbow: THREE.Group; hand: THREE.Mesh };
  leftLeg: { hip: THREE.Group; knee: THREE.Group; shoe: THREE.Group };
  rightLeg: { hip: THREE.Group; knee: THREE.Group; shoe: THREE.Group };
  shadesGroup: THREE.Group;
  espressoGroup: THREE.Group;
  sweatDrop: THREE.Mesh;
  carryMount: THREE.Group;
}

/**
 * Builds an articulated full-body 3D classic Bruno character wearing a tailored navy blazer,
 * burgundy turtleneck, silk pocket square, gold buttons, leather belt, dress pants, and shoes.
 */
export function createBrunoClassic3DRig(): BrunoClassic3DRig {
  const skinMat = new THREE.MeshStandardMaterial({
    color: 0xd99968,
    roughness: 0.48,
    metalness: 0.04,
  });
  const cheekMat = new THREE.MeshStandardMaterial({
    color: 0xd47664,
    roughness: 0.65,
    transparent: true,
    opacity: 0.45,
  });
  const sweaterMat = new THREE.MeshStandardMaterial({
    color: 0x7f1d1d, // Burgundy turtleneck
    roughness: 0.78,
    metalness: 0.05,
  });
  const collarMat = new THREE.MeshStandardMaterial({
    color: 0x6b1414,
    roughness: 0.82,
  });
  const jacketMat = new THREE.MeshStandardMaterial({
    color: 0x1e293b, // Tailored charcoal-navy blazer
    roughness: 0.65,
    metalness: 0.08,
  });
  const lapelMat = new THREE.MeshStandardMaterial({
    color: 0x0f172a,
    roughness: 0.55,
    metalness: 0.12,
  });
  const pantsMat = new THREE.MeshStandardMaterial({
    color: 0x18181b, // Tailored dress trousers
    roughness: 0.72,
    metalness: 0.05,
  });
  const beltMat = new THREE.MeshStandardMaterial({
    color: 0x451a03, // Dark leather belt
    roughness: 0.4,
    metalness: 0.15,
  });
  const shoeMat = new THREE.MeshStandardMaterial({
    color: 0x271307, // Polished leather dress shoes
    roughness: 0.28,
    metalness: 0.2,
  });
  const cuffMat = new THREE.MeshStandardMaterial({
    color: 0xf8fafc,
    roughness: 0.4,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    metalness: 0.85,
    roughness: 0.2,
  });
  const hairMat = new THREE.MeshStandardMaterial({
    color: 0x18151c,
    roughness: 0.62,
    metalness: 0.08,
  });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.18 });
  const irisMat = new THREE.MeshStandardMaterial({ color: 0x3b2314, roughness: 0.2 });
  const pupilMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.1 });
  const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mouthCavityMat = new THREE.MeshStandardMaterial({ color: 0x3b0a14, roughness: 0.7 });
  const teethMat = new THREE.MeshStandardMaterial({ color: 0xfefce8, roughness: 0.25 });

  const root = new THREE.Group();

  // ─── Torso & Tailored Suit Jacket ───────────────────────────────────────────
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, -0.35, 0);
  root.add(torsoGroup);

  // Inner burgundy turtleneck torso
  const innerTorso = new THREE.Mesh(
    new THREE.CylinderGeometry(0.56, 0.62, 1.32, 24),
    sweaterMat
  );
  torsoGroup.add(innerTorso);

  // Outer open blazer shell (wraps back & sides, leaving turtleneck V visible in front)
  const jacketBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.64, 0.7, 1.24, 24, 1, false, Math.PI * 0.22, Math.PI * 1.56),
    jacketMat
  );
  jacketBody.rotation.y = Math.PI; // Opening faces front (+Z)
  jacketBody.position.set(0, -0.02, -0.01);
  torsoGroup.add(jacketBody);

  // Left & Right Blazer Front Panels + Lapels
  [-1, 1].forEach((side) => {
    const chestPanel = new THREE.Mesh(new THREE.BoxGeometry(0.42, 1.18, 0.22), jacketMat);
    chestPanel.position.set(side * 0.36, -0.04, 0.38);
    chestPanel.rotation.y = side * -0.25;
    torsoGroup.add(chestPanel);

    // Tailored Lapel
    const lapel = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.72, 0.08), lapelMat);
    lapel.position.set(side * 0.24, 0.22, 0.51);
    lapel.rotation.z = side * -0.22;
    lapel.rotation.y = side * -0.2;
    torsoGroup.add(lapel);
  });

  // Two Golden Jacket Buttons
  [-0.18, -0.42].forEach((by) => {
    const btn = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.03, 12), goldMat);
    btn.rotation.x = Math.PI / 2;
    btn.position.set(0.14, by, 0.56);
    torsoGroup.add(btn);
  });

  // Silk Gold Pocket Square on left breast pocket
  const pocket = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.05, 0.04), lapelMat);
  pocket.position.set(0.36, 0.24, 0.5);
  pocket.rotation.y = -0.25;
  torsoGroup.add(pocket);

  const pocketSquare = new THREE.Mesh(new THREE.ConeGeometry(0.085, 0.14, 4), goldMat);
  pocketSquare.position.set(0.36, 0.31, 0.5);
  pocketSquare.rotation.z = -0.15;
  torsoGroup.add(pocketSquare);

  // Shoulder broadening
  const chestRound = new THREE.Mesh(new THREE.SphereGeometry(0.68, 24, 18), jacketMat);
  chestRound.scale.set(1.12, 0.62, 0.72);
  chestRound.position.set(0, 0.38, -0.02);
  torsoGroup.add(chestRound);

  // Ribbed Turtleneck Collar
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.42, 0.44, 24), collarMat);
  collar.position.set(0, 0.78, 0.02);
  torsoGroup.add(collar);

  const collarRim = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.07, 14, 28), sweaterMat);
  collarRim.rotation.x = Math.PI / 2;
  collarRim.position.set(0, 0.96, 0.02);
  torsoGroup.add(collarRim);

  // Waist, Belt & Golden Buckle
  const waistBand = new THREE.Mesh(new THREE.CylinderGeometry(0.66, 0.68, 0.16, 24), beltMat);
  waistBand.position.set(0, -0.66, 0);
  torsoGroup.add(waistBand);

  const beltBuckle = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.15, 0.08), goldMat);
  beltBuckle.position.set(0, -0.66, 0.66);
  torsoGroup.add(beltBuckle);

  // ─── Articulated Arms (Blazer Sleeves + Shirt Cuffs + Hands) ────────────────
  function buildArm(side: 1 | -1) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.76, 0.42, 0);
    torsoGroup.add(shoulder);

    const shoulderCap = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 16), jacketMat);
    shoulder.add(shoulderCap);

    const upperArm = new THREE.Mesh(new THREE.CapsuleGeometry(0.155, 0.44, 8, 14), jacketMat);
    upperArm.position.set(0, -0.28, 0);
    shoulder.add(upperArm);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.56, 0);
    shoulder.add(elbow);

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.135, 0.4, 8, 14), jacketMat);
    forearm.position.set(0, -0.22, 0);
    elbow.add(forearm);

    const shirtCuff = new THREE.Mesh(new THREE.CylinderGeometry(0.125, 0.125, 0.09, 14), cuffMat);
    shirtCuff.position.set(0, -0.45, 0);
    elbow.add(shirtCuff);

    const hand = new THREE.Mesh(new THREE.SphereGeometry(0.155, 16, 16), skinMat);
    hand.scale.set(0.95, 1.1, 0.85);
    hand.position.set(0, -0.56, 0.04);
    elbow.add(hand);

    const thumb = new THREE.Mesh(new THREE.CapsuleGeometry(0.048, 0.1, 6, 8), skinMat);
    thumb.position.set(-side * 0.12, -0.52, 0.09);
    thumb.rotation.z = side * 0.6;
    elbow.add(thumb);

    return { shoulder, elbow, hand };
  }

  const leftArm = buildArm(-1);
  const rightArm = buildArm(1);

  // ─── Articulated Legs, Trousers & Dress Shoes ───────────────────────────────
  function buildLeg(side: -1 | 1) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.28, -0.74, 0);
    torsoGroup.add(hip);

    const thigh = new THREE.Mesh(new THREE.CapsuleGeometry(0.2, 0.46, 8, 14), pantsMat);
    thigh.position.set(0, -0.28, 0);
    hip.add(thigh);

    const knee = new THREE.Group();
    knee.position.set(0, -0.58, 0);
    hip.add(knee);

    const shin = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 0.46, 8, 14), pantsMat);
    shin.position.set(0, -0.26, 0);
    knee.add(shin);

    const shoe = new THREE.Group();
    shoe.position.set(0, -0.56, 0.08);
    knee.add(shoe);

    const shoeBase = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.16, 0.48), shoeMat);
    shoe.add(shoeBase);

    const shoeToe = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 12), shoeMat);
    shoeToe.scale.set(1.0, 0.6, 1.15);
    shoeToe.position.set(0, -0.01, 0.22);
    shoe.add(shoeToe);

    return { hip, knee, shoe };
  }

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  // Mount point in front of chest/hands when carrying a captured chess piece
  const carryMount = new THREE.Group();
  carryMount.position.set(0, 0.05, 0.92);
  torsoGroup.add(carryMount);

  // ─── Head & Expressive Face ─────────────────────────────────────────────────
  const neckPivot = new THREE.Group();
  neckPivot.position.set(0, 0.98, 0);
  torsoGroup.add(neckPivot);

  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.56, 0);
  neckPivot.add(headGroup);

  const headMesh = new THREE.Mesh(new THREE.SphereGeometry(0.7, 32, 28), skinMat);
  headMesh.scale.set(0.94, 1.08, 0.96);
  headGroup.add(headMesh);

  [-1, 1].forEach((side) => {
    const ear = new THREE.Mesh(new THREE.SphereGeometry(0.15, 14, 14), skinMat);
    ear.scale.set(0.55, 0.95, 0.7);
    ear.position.set(side * 0.64, -0.02, -0.04);
    headGroup.add(ear);

    const cheek = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 14), cheekMat);
    cheek.scale.set(1.1, 0.7, 0.4);
    cheek.position.set(side * 0.35, -0.14, 0.53);
    headGroup.add(cheek);
  });

  const nose = new THREE.Mesh(new THREE.SphereGeometry(0.125, 16, 16), skinMat);
  nose.scale.set(0.9, 1.15, 1.25);
  nose.position.set(0, -0.04, 0.69);
  headGroup.add(nose);

  function buildEye(side: -1 | 1) {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(side * 0.24, 0.12, 0.58);
    headGroup.add(eyeGroup);

    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.14, 20, 18), eyeWhiteMat);
    sclera.scale.set(1, 1.12, 0.65);
    eyeGroup.add(sclera);

    const pupilGroup = new THREE.Group();
    pupilGroup.position.set(0, 0, 0.065);
    eyeGroup.add(pupilGroup);

    const iris = new THREE.Mesh(new THREE.SphereGeometry(0.072, 16, 16), irisMat);
    iris.scale.set(1, 1, 0.5);
    pupilGroup.add(iris);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.043, 12, 12), pupilMat);
    pupil.position.set(0, 0, 0.02);
    pupil.scale.set(1, 1, 0.5);
    pupilGroup.add(pupil);

    const shine = new THREE.Mesh(new THREE.SphereGeometry(0.021, 8, 8), catchlightMat);
    shine.position.set(0.024, 0.028, 0.036);
    pupilGroup.add(shine);

    return { eyeGroup, pupilGroup };
  }

  const leftEye = buildEye(-1);
  const rightEye = buildEye(1);

  const leftBrow = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.21, 6, 10), hairMat);
  leftBrow.rotation.z = Math.PI / 2 - 0.1;
  leftBrow.position.set(-0.25, 0.31, 0.6);
  headGroup.add(leftBrow);

  const rightBrow = new THREE.Mesh(new THREE.CapsuleGeometry(0.045, 0.21, 6, 10), hairMat);
  rightBrow.rotation.z = Math.PI / 2 + 0.1;
  rightBrow.position.set(0.25, 0.31, 0.6);
  headGroup.add(rightBrow);

  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0, -0.34, 0.6);
  headGroup.add(mouthGroup);

  const mouthHole = new THREE.Mesh(new THREE.SphereGeometry(0.14, 16, 14), mouthCavityMat);
  mouthHole.scale.set(1.25, 0.22, 0.5);
  mouthGroup.add(mouthHole);

  const teeth = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.06), teethMat);
  teeth.position.set(0, 0.035, 0.04);
  mouthGroup.add(teeth);

  // Detachable Handlebar Mustache
  const mustacheGroup = new THREE.Group();
  mustacheGroup.position.set(0, -0.18, 0.66);
  headGroup.add(mustacheGroup);

  const buildMustacheHalf = (side: -1 | 1) => {
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(0, 0.01, 0.03),
      new THREE.Vector3(side * 0.14, -0.02, 0.04),
      new THREE.Vector3(side * 0.3, 0.01, -0.02),
      new THREE.Vector3(side * 0.4, 0.12, -0.07),
      new THREE.Vector3(side * 0.34, 0.17, -0.08),
    ]);
    return new THREE.Mesh(new THREE.TubeGeometry(curve, 22, 0.055, 10, false), hairMat);
  };
  mustacheGroup.add(buildMustacheHalf(-1));
  mustacheGroup.add(buildMustacheHalf(1));

  // Wavy 3D Hair
  const hairGroup = new THREE.Group();
  headGroup.add(hairGroup);

  const hairBlobs: [number, number, number, number, number, number][] = [
    [0, 0.55, -0.06, 0.67, 0.41, 0.65],
    [-0.41, 0.45, -0.05, 0.35, 0.31, 0.41],
    [0.41, 0.45, -0.05, 0.35, 0.31, 0.41],
    [0, 0.38, -0.41, 0.6, 0.48, 0.38],
    [-0.22, 0.64, 0.24, 0.33, 0.22, 0.31],
    [0.18, 0.66, 0.27, 0.35, 0.23, 0.31],
    [0.43, 0.22, -0.22, 0.27, 0.33, 0.27],
    [-0.43, 0.22, -0.22, 0.27, 0.33, 0.27],
  ];
  hairBlobs.forEach(([x, y, z, sx, sy, sz]) => {
    const puff = new THREE.Mesh(new THREE.SphereGeometry(1, 18, 16), hairMat);
    puff.position.set(x, y, z);
    puff.scale.set(sx, sy, sz);
    hairGroup.add(puff);
  });

  // ─── Props ──────────────────────────────────────────────────────────────────
  const shadesGroup = new THREE.Group();
  shadesGroup.position.set(0, 0.14, 0.71);
  shadesGroup.visible = false;
  headGroup.add(shadesGroup);

  const lensMat = new THREE.MeshStandardMaterial({ color: 0x09090b, metalness: 0.4, roughness: 0.1 });
  [-0.24, 0.24].forEach((lx) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.18, 0.05), goldMat);
    frame.position.set(lx, 0, 0);
    shadesGroup.add(frame);
    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.14, 0.06), lensMat);
    lens.position.set(lx, 0, 0.005);
    shadesGroup.add(lens);
  });
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.04, 0.04), goldMat);
  bridge.position.set(0, 0.03, 0);
  shadesGroup.add(bridge);

  const espressoGroup = new THREE.Group();
  espressoGroup.position.set(0, 0.14, 0.8);
  espressoGroup.visible = false;
  headGroup.add(espressoGroup);

  const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
  const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3b1f0e, roughness: 0.15 });
  const saucer = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.18, 0.04, 20), porcelainMat);
  espressoGroup.add(saucer);
  const cup = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.12, 0.22, 20), porcelainMat);
  cup.position.set(0, 0.12, 0);
  espressoGroup.add(cup);
  const coffeeTop = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.02, 18), coffeeMat);
  coffeeTop.position.set(0, 0.22, 0);
  espressoGroup.add(coffeeTop);

  const sweatDrop = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 12),
    new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, transparent: true, opacity: 0.85 })
  );
  sweatDrop.scale.set(0.75, 1.35, 0.75);
  sweatDrop.position.set(0.55, 0.28, 0.42);
  sweatDrop.visible = false;
  headGroup.add(sweatDrop);

  return {
    root,
    torsoGroup,
    neckPivot,
    headGroup,
    mustacheGroup,
    mouthHole,
    leftEye,
    rightEye,
    leftBrow,
    rightBrow,
    leftArm,
    rightArm,
    leftLeg,
    rightLeg,
    shadesGroup,
    espressoGroup,
    sweatDrop,
    carryMount,
  };
}

/**
 * Builds a recognizable miniature 3D chess piece for Bruno to pick up and carry off the board.
 */
export function createMini3DChessPiece(type: string, color: 'w' | 'b'): THREE.Group {
  const g = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: color === 'w' ? 0xf8fafc : 0x1e293b,
    roughness: 0.3,
    metalness: 0.15,
  });
  const trimMat = new THREE.MeshStandardMaterial({
    color: color === 'w' ? 0xcbd5e1 : 0x475569,
    roughness: 0.35,
  });

  const base = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.28, 0.12, 18), mat);
  base.position.y = 0.06;
  g.add(base);

  const bodyHeight = type === 'q' || type === 'k' ? 0.56 : type === 'p' ? 0.34 : 0.44;
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.2, bodyHeight, 18), mat);
  body.position.y = 0.12 + bodyHeight / 2;
  g.add(body);

  const topY = 0.12 + bodyHeight;
  if (type === 'p' || type === 'b') {
    const head = new THREE.Mesh(
      new THREE.SphereGeometry(type === 'b' ? 0.15 : 0.13, 14, 14),
      mat
    );
    head.scale.y = type === 'b' ? 1.3 : 1.0;
    head.position.y = topY + 0.1;
    g.add(head);
  } else if (type === 'r') {
    const turret = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.15, 0.16, 12), trimMat);
    turret.position.y = topY + 0.08;
    g.add(turret);
  } else if (type === 'q' || type === 'k') {
    const crown = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.22, 8), trimMat);
    crown.position.y = topY + 0.1;
    g.add(crown);
  } else {
    // Knight snout
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.28), mat);
    snout.position.set(0, topY + 0.08, 0.06);
    snout.rotation.x = 0.35;
    g.add(snout);
  }

  return g;
}
