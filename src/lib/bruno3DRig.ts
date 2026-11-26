import * as THREE from 'three';

export interface Bruno3DRig {
  root: THREE.Group;
  torsoGroup: THREE.Group;
  headGroup: THREE.Group;
  mouthGroup: THREE.Group;
  mouthHole: THREE.Mesh;
  tongueMesh: THREE.Mesh;
  leftEye: { eyeGroup: THREE.Group; pupilGroup: THREE.Group; eyelidGroup: THREE.Group };
  rightEye: { eyeGroup: THREE.Group; pupilGroup: THREE.Group; eyelidGroup: THREE.Group };
  leftEar: THREE.Mesh;
  rightEar: THREE.Mesh;
  headphonesGroup: THREE.Group;
  floatingCrown: THREE.Group;
  sparkGroup: THREE.Group;
  starGroup: THREE.Group;
  leftArm: { shoulder: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  rightArm: { shoulder: THREE.Group; elbow: THREE.Group; hand: THREE.Group };
  leftLeg: { hip: THREE.Group; knee: THREE.Group; shoe: THREE.Group };
  rightLeg: { hip: THREE.Group; knee: THREE.Group; shoe: THREE.Group };
  shadesGroup: THREE.Group;
  espressoGroup: THREE.Group;
  sweatDrop: THREE.Mesh;
  carryMount: THREE.Group;
}

/**
 * Helper to extrude a crisp 3-pointed crown emblem (used on headphone earcups & sneakers).
 */
function createCrownDecalMesh(colorHex: number, scale: number): THREE.Mesh {
  const s = new THREE.Shape();
  s.moveTo(-0.38, -0.22);
  s.lineTo(-0.46, 0.2);
  s.lineTo(-0.18, 0.0);
  s.lineTo(0, 0.34);
  s.lineTo(0.18, 0.0);
  s.lineTo(0.46, 0.2);
  s.lineTo(0.38, -0.22);
  s.closePath();

  const geo = new THREE.ExtrudeGeometry(s, {
    depth: 0.06,
    bevelEnabled: false,
  });
  geo.center();
  const mat = new THREE.MeshStandardMaterial({
    color: colorHex,
    roughness: 0.3,
    metalness: 0.05,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.scale.setScalar(scale);
  return mesh;
}

/**
 * Builds the 3D crowned purple-headphones vinyl bean companion with twin top tufts,
 * half-lidded cartoon eyes, cheeky red tongue, finger-gun hand, chunky purple/cream
 * crown sneakers, and floating golden crown & spark accents.
 */
export function createBruno3DRig(): Bruno3DRig {
  const creamMat = new THREE.MeshStandardMaterial({
    color: 0xf4e8d8,
    roughness: 0.65,
    metalness: 0.02,
  });
  const creamLidMat = new THREE.MeshStandardMaterial({
    color: 0xebd7c2,
    roughness: 0.68,
    metalness: 0.02,
  });
  const purpleMat = new THREE.MeshStandardMaterial({
    color: 0x673ab7,
    roughness: 0.52,
    metalness: 0.06,
  });
  const purpleDarkMat = new THREE.MeshStandardMaterial({
    color: 0x45228a,
    roughness: 0.65,
    metalness: 0.05,
  });
  const cushionMat = new THREE.MeshStandardMaterial({
    color: 0x582ca8,
    roughness: 0.8,
  });
  const whiteTrimMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.22,
  });
  const eyeWhiteMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.14,
  });
  const pupilMat = new THREE.MeshStandardMaterial({
    color: 0x0b0b0f,
    roughness: 0.08,
  });
  const linerMat = new THREE.MeshStandardMaterial({
    color: 0x1c1412,
    roughness: 0.35,
  });
  const catchlightMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
  const mouthCavityMat = new THREE.MeshStandardMaterial({
    color: 0x140e18,
    roughness: 0.92,
  });
  const tongueMat = new THREE.MeshStandardMaterial({
    color: 0xe34848,
    roughness: 0.42,
  });
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xb45309,
    emissiveIntensity: 0.35,
    roughness: 0.35,
    metalness: 0.25,
  });
  const starMat = new THREE.MeshStandardMaterial({
    color: 0xd1d5db,
    emissive: 0x4b5563,
    emissiveIntensity: 0.25,
    roughness: 0.4,
  });

  const root = new THREE.Group();

  // ─── Seamless Plush Bean Torso & Crown Dome ─────────────────────────────────
  const torsoGroup = new THREE.Group();
  torsoGroup.position.set(0, -0.05, 0);
  root.add(torsoGroup);

  // Plump lower belly
  const lowerBelly = new THREE.Mesh(new THREE.SphereGeometry(0.92, 32, 26), creamMat);
  lowerBelly.scale.set(1.04, 0.96, 0.88);
  lowerBelly.position.set(0, -0.26, 0);
  torsoGroup.add(lowerBelly);

  // Smooth rounded waist-to-head core
  const bodyCore = new THREE.Mesh(
    new THREE.CylinderGeometry(0.84, 0.92, 0.88, 32),
    creamMat
  );
  bodyCore.scale.set(1.04, 1, 0.88);
  bodyCore.position.set(0, 0.14, 0);
  torsoGroup.add(bodyCore);

  // Top head dome
  const headDome = new THREE.Mesh(new THREE.SphereGeometry(0.87, 32, 26), creamMat);
  headDome.scale.set(1.02, 0.98, 0.88);
  headDome.position.set(0, 0.56, 0);
  torsoGroup.add(headDome);

  // ─── Head Features Group (eyes, eyelids, mouth/tongue, top tufts, headphones)
  const headGroup = new THREE.Group();
  headGroup.position.set(0, 0.42, 0);
  torsoGroup.add(headGroup);

  // Twin Plush Sprout Tufts on Crown
  const buildTuft = (x: number, y: number, rotZ: number) => {
    const tuft = new THREE.Mesh(new THREE.CapsuleGeometry(0.13, 0.26, 12, 18), creamMat);
    tuft.position.set(x, y, 0.04);
    tuft.rotation.z = rotZ;
    tuft.rotation.x = 0.08;
    headGroup.add(tuft);
    return tuft;
  };
  const leftEar = buildTuft(-0.18, 0.98, 0.44);
  const rightEar = buildTuft(0.12, 1.0, -0.3);

  // ─── Purple Over-Ear Headphones with White Crown Decals ─────────────────────
  const headphonesGroup = new THREE.Group();
  headGroup.add(headphonesGroup);

  const headband = new THREE.Mesh(
    new THREE.TorusGeometry(0.92, 0.115, 16, 36, Math.PI * 1.06),
    purpleMat
  );
  headband.position.set(0, 0.08, -0.05);
  headband.rotation.z = -Math.PI * 0.03;
  headband.rotation.x = -0.1;
  headphonesGroup.add(headband);

  [-1, 1].forEach((side) => {
    const cupGroup = new THREE.Group();
    cupGroup.position.set(side * 0.91, 0.04, -0.02);
    cupGroup.rotation.z = side * -0.08;
    headphonesGroup.add(cupGroup);

    // Puffy inner ear pad
    const cushion = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.35, 0.16, 24),
      cushionMat
    );
    cushion.rotation.z = Math.PI / 2;
    cushion.position.x = -side * 0.06;
    cupGroup.add(cushion);

    // Thick purple outer shell + cap
    const cupBody = new THREE.Mesh(
      new THREE.CylinderGeometry(0.32, 0.36, 0.24, 24),
      purpleMat
    );
    cupBody.rotation.z = Math.PI / 2;
    cupBody.position.x = side * 0.08;
    cupGroup.add(cupBody);

    const cupCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.32, 22, 18),
      purpleDarkMat
    );
    cupCap.scale.set(0.38, 1, 1);
    cupCap.position.x = side * 0.19;
    cupGroup.add(cupCap);

    // Crisp White 3-Point Crown Decal on Outer Earcup
    const crownLogo = createCrownDecalMesh(0xffffff, 0.27);
    crownLogo.position.set(side * 0.31, 0, 0);
    crownLogo.rotation.y = side * (Math.PI / 2);
    cupGroup.add(crownLogo);
  });

  // ─── Large Expressive Cartoon Eyes with Cool Diagonal Half-Lids ─────────────
  function buildEye(side: -1 | 1) {
    const eyeGroup = new THREE.Group();
    eyeGroup.position.set(side * 0.21, 0.09, 0.72);
    headGroup.add(eyeGroup);

    // Big glossy sclera oval
    const sclera = new THREE.Mesh(new THREE.SphereGeometry(0.245, 24, 20), eyeWhiteMat);
    sclera.scale.set(1.0, 1.15, 0.48);
    eyeGroup.add(sclera);

    // Thin dark eye outline ring
    const outline = new THREE.Mesh(new THREE.TorusGeometry(0.245, 0.013, 8, 30), linerMat);
    outline.scale.set(1.0, 1.15, 0.48);
    outline.position.z = 0.04;
    eyeGroup.add(outline);

    // Pupil + catchlight
    const pupilGroup = new THREE.Group();
    pupilGroup.position.set(side === -1 ? 0.03 : -0.02, -0.02, 0.095);
    eyeGroup.add(pupilGroup);

    const pupil = new THREE.Mesh(new THREE.SphereGeometry(0.105, 16, 16), pupilMat);
    pupil.scale.set(1, 1.05, 0.45);
    pupilGroup.add(pupil);

    const glint = new THREE.Mesh(new THREE.SphereGeometry(0.028, 10, 10), catchlightMat);
    glint.position.set(0.036, 0.04, 0.045);
    pupilGroup.add(glint);

    // Signature Heavy Cream Half-Eyelid Cap + Dark Eyeliner Rim
    const eyelidGroup = new THREE.Group();
    // Tilt diagonally inward for that iconic cheeky side-eye smirk!
    eyelidGroup.rotation.z = side === -1 ? -0.2 : 0.18;
    eyeGroup.add(eyelidGroup);

    const lidCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.256, 24, 16, 0, Math.PI * 2, 0, Math.PI * 0.52),
      creamLidMat
    );
    lidCap.scale.set(1.02, 1.16, 0.52);
    lidCap.position.z = 0.005;
    eyelidGroup.add(lidCap);

    // Crisp diagonal crease bar across front of eyelid
    const lidLine = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.017, 0.48, 6, 10),
      linerMat
    );
    lidLine.rotation.z = Math.PI / 2;
    lidLine.position.set(0, -0.01, 0.13);
    eyelidGroup.add(lidLine);

    return { eyeGroup, pupilGroup, eyelidGroup };
  }

  const leftEye = buildEye(-1);
  const rightEye = buildEye(1);

  // ─── Cheeky Clean Cartoon Smirk Mouth (No Red Tongue) ────────────────────────
  const mouthGroup = new THREE.Group();
  mouthGroup.position.set(0.02, -0.26, 0.74);
  mouthGroup.rotation.z = 0.08;
  headGroup.add(mouthGroup);

  const mouthHole = new THREE.Mesh(
    new THREE.SphereGeometry(0.18, 24, 16),
    mouthCavityMat
  );
  mouthHole.scale.set(1.22, 0.62, 0.32);
  mouthGroup.add(mouthHole);

  // Crisp dark cartoon smirk contour outline (creates clean, defined cartoon smile)
  const mouthRim = new THREE.Mesh(
    new THREE.TorusGeometry(0.165, 0.02, 10, 28, Math.PI * 0.88),
    linerMat
  );
  mouthRim.rotation.x = Math.PI;
  mouthRim.rotation.z = -0.12;
  mouthRim.position.set(-0.01, 0.02, 0.11);
  mouthGroup.add(mouthRim);

  // Subtle upturned smirk dimple / corner crease on right side
  const smirkDimple = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.016, 0.045, 8, 12),
    linerMat
  );
  smirkDimple.position.set(0.155, 0.035, 0.11);
  smirkDimple.rotation.z = 0.55;
  mouthGroup.add(smirkDimple);

  // Invisible placeholder for tongue to maintain Bruno3DRig interface without rendering red object
  const tongueMesh = new THREE.Mesh(
    new THREE.BufferGeometry(),
    tongueMat
  );
  tongueMesh.visible = false;
  tongueMesh.scale.set(0, 0, 0);
  mouthGroup.add(tongueMesh);

  // ─── Articulated Chubby Plush Arms (Left Hip Pose, Right Finger-Gun!) ─────
  function buildArm(side: -1 | 1, fingerGun: boolean) {
    const shoulder = new THREE.Group();
    shoulder.position.set(side * 0.86, -0.14, 0.04);
    torsoGroup.add(shoulder);

    const upper = new THREE.Mesh(new THREE.CapsuleGeometry(0.19, 0.26, 10, 16), creamMat);
    upper.position.set(0, -0.14, 0);
    shoulder.add(upper);

    const elbow = new THREE.Group();
    elbow.position.set(0, -0.32, 0);
    shoulder.add(elbow);

    const forearm = new THREE.Mesh(new THREE.CapsuleGeometry(0.18, 0.22, 10, 16), creamMat);
    forearm.position.set(0, -0.12, 0);
    elbow.add(forearm);

    const hand = new THREE.Group();
    hand.position.set(0, -0.28, 0.03);
    elbow.add(hand);

    const palm = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), creamMat);
    hand.add(palm);

    if (fingerGun) {
      // Extended pointing index finger + upright thumb (signature pose!)
      const pointer = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.072, 0.24, 8, 12),
        creamMat
      );
      pointer.rotation.z = -Math.PI / 2;
      pointer.position.set(0.22, 0.02, 0.02);
      hand.add(pointer);

      const thumb = new THREE.Mesh(
        new THREE.CapsuleGeometry(0.065, 0.16, 8, 12),
        creamMat
      );
      thumb.rotation.z = -0.32;
      thumb.position.set(0.06, 0.19, 0.03);
      hand.add(thumb);
    }

    return { shoulder, elbow, hand };
  }

  // Note: side -1 is viewer's left (on hip), side +1 is viewer's right (finger-gun!)
  const leftArm = buildArm(-1, false);
  const rightArm = buildArm(1, true);

  // ─── Articulated Short Legs & Chunky Purple/Cream Crown Sneakers ────────────
  function buildLeg(side: -1 | 1) {
    const hip = new THREE.Group();
    hip.position.set(side * 0.42, -0.92, 0);
    torsoGroup.add(hip);

    const legStump = new THREE.Mesh(
      new THREE.CapsuleGeometry(0.22, 0.22, 10, 16),
      creamMat
    );
    legStump.position.set(0, -0.14, 0);
    hip.add(legStump);

    const knee = new THREE.Group();
    knee.position.set(0, -0.28, 0);
    hip.add(knee);

    const shoe = new THREE.Group();
    shoe.position.set(side * 0.04, -0.24, 0.09);
    shoe.rotation.y = side * 0.2;
    knee.add(shoe);

    // Chunky cream sneaker rubber sole
    const sole = new THREE.Mesh(
      new THREE.BoxGeometry(0.46, 0.14, 0.72),
      creamMat
    );
    sole.position.set(0, -0.08, 0.08);
    shoe.add(sole);

    const soleToe = new THREE.Mesh(
      new THREE.CylinderGeometry(0.23, 0.24, 0.14, 18),
      creamMat
    );
    soleToe.position.set(0, -0.08, 0.36);
    shoe.add(soleToe);

    // Vibrant purple sneaker upper
    const upper = new THREE.Mesh(
      new THREE.BoxGeometry(0.42, 0.26, 0.56),
      purpleMat
    );
    upper.position.set(0, 0.08, 0.02);
    shoe.add(upper);

    // Rounded cream/white front toe box
    const toeCap = new THREE.Mesh(
      new THREE.SphereGeometry(0.23, 18, 14),
      creamMat
    );
    toeCap.scale.set(0.95, 0.68, 1.05);
    toeCap.position.set(0, 0.05, 0.34);
    shoe.add(toeCap);

    // Puffy purple sneaker tongue + collar
    const tongue = new THREE.Mesh(
      new THREE.BoxGeometry(0.28, 0.24, 0.16),
      purpleDarkMat
    );
    tongue.position.set(0, 0.22, 0.14);
    tongue.rotation.x = 0.28;
    shoe.add(tongue);

    // White crown crest on outside of each sneaker
    const shoeCrown = createCrownDecalMesh(0xffffff, 0.16);
    shoeCrown.position.set(side * 0.23, 0.08, 0.05);
    shoeCrown.rotation.y = side * (Math.PI / 2);
    shoe.add(shoeCrown);

    return { hip, knee, shoe };
  }

  const leftLeg = buildLeg(-1);
  const rightLeg = buildLeg(1);

  // Mount point when carrying chess pieces during Unlimited 3D board walking
  const carryMount = new THREE.Group();
  carryMount.position.set(0, -0.1, 1.05);
  torsoGroup.add(carryMount);

  // ─── Floating Golden 3D Crown Outline + Spark Dashes + Star Accent ─────────
  const floatingCrown = new THREE.Group();
  floatingCrown.position.set(-0.82, 1.24, 0.05);
  floatingCrown.rotation.z = 0.38;
  headGroup.add(floatingCrown);

  const crownPts = [
    new THREE.Vector3(-0.28, -0.16, 0),
    new THREE.Vector3(-0.34, 0.18, 0),
    new THREE.Vector3(-0.14, 0.02, 0),
    new THREE.Vector3(0, 0.28, 0),
    new THREE.Vector3(0.14, 0.02, 0),
    new THREE.Vector3(0.34, 0.18, 0),
    new THREE.Vector3(0.28, -0.16, 0),
    new THREE.Vector3(-0.28, -0.16, 0),
  ];
  for (let i = 0; i < crownPts.length - 1; i++) {
    const p1 = crownPts[i];
    const p2 = crownPts[i + 1];
    const curve = new THREE.LineCurve3(p1, p2);
    const bar = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 6, 0.036, 8, false),
      goldMat
    );
    floatingCrown.add(bar);
  }

  // Two golden-amber vibe/beat dashes on top-right
  const sparkGroup = new THREE.Group();
  sparkGroup.position.set(0.95, 0.94, 0.06);
  headGroup.add(sparkGroup);

  const dash1 = new THREE.Mesh(new THREE.CapsuleGeometry(0.04, 0.22, 6, 10), goldMat);
  dash1.rotation.z = -0.38;
  dash1.position.set(-0.08, 0.08, 0);
  sparkGroup.add(dash1);

  const dash2 = new THREE.Mesh(new THREE.CapsuleGeometry(0.038, 0.19, 6, 10), goldMat);
  dash2.rotation.z = -0.82;
  dash2.position.set(0.12, -0.06, 0);
  sparkGroup.add(dash2);

  // Small outlined star doodle on the left
  const starGroup = new THREE.Group();
  starGroup.position.set(-1.32, -0.18, 0);
  torsoGroup.add(starGroup);

  const starPts: THREE.Vector3[] = [];
  for (let i = 0; i <= 10; i++) {
    const angle = (i * Math.PI) / 5 + Math.PI / 2;
    const r = i % 2 === 0 ? 0.16 : 0.068;
    starPts.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, 0));
  }
  for (let i = 0; i < starPts.length - 1; i++) {
    const seg = new THREE.LineCurve3(starPts[i], starPts[i + 1]);
    starGroup.add(
      new THREE.Mesh(new THREE.TubeGeometry(seg, 4, 0.015, 6, false), starMat)
    );
  }

  // ─── Action Skit Props (Golden Sunglasses, Espresso Cup, Sweat Drop) ─────────
  const shadesGroup = new THREE.Group();
  shadesGroup.position.set(0, 0.09, 0.9);
  shadesGroup.visible = false;
  headGroup.add(shadesGroup);

  const lensMat = new THREE.MeshStandardMaterial({
    color: 0x09090b,
    metalness: 0.4,
    roughness: 0.1,
  });
  [-0.22, 0.22].forEach((lx) => {
    const frame = new THREE.Mesh(new THREE.BoxGeometry(0.36, 0.21, 0.05), goldMat);
    frame.position.set(lx, 0, 0);
    shadesGroup.add(frame);
    const lens = new THREE.Mesh(new THREE.BoxGeometry(0.31, 0.16, 0.06), lensMat);
    lens.position.set(lx, 0, 0.005);
    shadesGroup.add(lens);
  });
  const bridge = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.04, 0.04), goldMat);
  bridge.position.set(0, 0.03, 0);
  shadesGroup.add(bridge);

  const espressoGroup = new THREE.Group();
  espressoGroup.position.set(0, 1.25, 0.15);
  espressoGroup.visible = false;
  headGroup.add(espressoGroup);

  const porcelainMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.2 });
  const coffeeMat = new THREE.MeshStandardMaterial({ color: 0x3b1f0e, roughness: 0.15 });
  espressoGroup.add(
    new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.17, 0.04, 20), porcelainMat)
  );
  const cup = new THREE.Mesh(
    new THREE.CylinderGeometry(0.15, 0.11, 0.2, 20),
    porcelainMat
  );
  cup.position.y = 0.11;
  espressoGroup.add(cup);
  const coffeeTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.13, 0.13, 0.02, 18),
    coffeeMat
  );
  coffeeTop.position.y = 0.2;
  espressoGroup.add(coffeeTop);

  const sweatDrop = new THREE.Mesh(
    new THREE.SphereGeometry(0.08, 12, 12),
    new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      transparent: true,
      opacity: 0.85,
    })
  );
  sweatDrop.scale.set(0.75, 1.35, 0.75);
  sweatDrop.position.set(0.62, 0.3, 0.5);
  sweatDrop.visible = false;
  headGroup.add(sweatDrop);

  return {
    root,
    torsoGroup,
    headGroup,
    mouthGroup,
    mouthHole,
    tongueMesh,
    leftEye,
    rightEye,
    leftEar,
    rightEar,
    headphonesGroup,
    floatingCrown,
    sparkGroup,
    starGroup,
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
 * Builds a recognizable miniature 3D chess piece for the companion to pick up and carry off the board.
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
    const snout = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.22, 0.28), mat);
    snout.position.set(0, topY + 0.08, 0.06);
    snout.rotation.x = 0.35;
    g.add(snout);
  }

  return g;
}
