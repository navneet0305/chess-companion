'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { Square, PieceSymbol, Color } from 'chess.js';
import { FILES, RANKS } from '../../lib/constants';
import { createBruno3DRig, createMini3DChessPiece } from '../../lib/bruno3DRig';

export interface BoardWalkEvent {
  id: string;
  fromSquare: Square;
  toSquare: Square;
  pieceType: PieceSymbol;
  pieceColor: Color;
  capturedType?: PieceSymbol;
  capturedColor?: Color;
  onPickup?: () => void;
  onCommitMove?: () => void;
  onComplete?: () => void;
}

interface BoardCompanionWalker3DProps {
  walkEvent: BoardWalkEvent | null;
  boardFlipped: boolean;
}

function squareToBoardXZ(square: Square, boardFlipped: boolean): { x: number; z: number } {
  const file = square[0];
  const rank = square[1];

  let colIdx = FILES.indexOf(file as (typeof FILES)[number]);
  let rowIdx = 7 - RANKS.indexOf(rank as (typeof RANKS)[number]); // 0 = top, 7 = bottom

  if (boardFlipped) {
    colIdx = 7 - colIdx;
    rowIdx = 7 - rowIdx;
  }

  const x = colIdx - 3.5;
  const screenY = 3.5 - rowIdx;
  const z = -screenY * Math.SQRT2;
  return { x, z };
}

export default function BoardCompanionWalker3D({
  walkEvent,
  boardFlipped,
}: BoardCompanionWalker3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglUnsupported, setWebglUnsupported] = useState(false);

  const activeWalkRef = useRef<{
    event: BoardWalkEvent;
    startTime: number;
    flipped: boolean;
    pickedUp: boolean;
    committed: boolean;
    completed: boolean;
  } | null>(null);

  useEffect(() => {
    if (walkEvent) {
      activeWalkRef.current = {
        event: walkEvent,
        startTime: performance.now(),
        flipped: boardFlipped,
        pickedUp: false,
        committed: false,
        completed: false,
      };
    } else {
      activeWalkRef.current = null;
    }
  }, [walkEvent, boardFlipped]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
      });
    } catch {
      setWebglUnsupported(true);
      return;
    }

    const syncSize = () => {
      const w = container.clientWidth || 520;
      const h = container.clientHeight || 520;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h);
    };
    syncSize();
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const resizeObserver = new ResizeObserver(syncSize);
    resizeObserver.observe(container);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-4, 4, 4, -4, 0.1, 40);
    camera.position.set(0, 8, 8);
    camera.lookAt(0, 0, 0);

    scene.add(new THREE.HemisphereLight(0xfff4e6, 0x1e293b, 1.05));
    const keyLight = new THREE.DirectionalLight(0xfff3e0, 1.85);
    keyLight.position.set(3, 8, 5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xfbbf24, 1.1);
    rimLight.position.set(-4, 5, -5);
    scene.add(rimLight);

    const rig = createBruno3DRig();
    rig.root.scale.setScalar(0.54);
    rig.root.visible = false;
    scene.add(rig.root);

    const shadowMesh = new THREE.Mesh(
      new THREE.CircleGeometry(0.42, 20),
      new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.35 })
    );
    shadowMesh.rotation.x = -Math.PI / 2;
    shadowMesh.position.y = 0.02;
    shadowMesh.visible = false;
    scene.add(shadowMesh);

    let lastMountedId: string | null = null;
    let movingPieceMesh: THREE.Group | null = null;
    let capturedPieceMesh: THREE.Group | null = null;
    let animId = 0;

    const animate = (now: number) => {
      animId = requestAnimationFrame(animate);
      const walk = activeWalkRef.current;

      if (!walk) {
        rig.root.visible = false;
        shadowMesh.visible = false;
        renderer.render(scene, camera);
        return;
      }

      const elapsed = (now - walk.startTime) * 0.001;
      const totalDuration = 2.15;

      if (elapsed >= totalDuration) {
        if (!walk.committed) {
          walk.committed = true;
          walk.event.onCommitMove?.();
        }
        if (!walk.completed) {
          walk.completed = true;
          walk.event.onComplete?.();
        }
        activeWalkRef.current = null;
        rig.root.visible = false;
        shadowMesh.visible = false;
        renderer.render(scene, camera);
        return;
      }

      const { event, flipped } = walk;

      if (lastMountedId !== event.id) {
        lastMountedId = event.id;
        rig.carryMount.clear();
        movingPieceMesh = createMini3DChessPiece(event.pieceType, event.pieceColor);
        movingPieceMesh.scale.setScalar(1.3);
        movingPieceMesh.visible = false;
        rig.carryMount.add(movingPieceMesh);

        capturedPieceMesh = null;
        if (event.capturedType && event.capturedColor) {
          capturedPieceMesh = createMini3DChessPiece(event.capturedType, event.capturedColor);
          capturedPieceMesh.scale.setScalar(1.35);
          capturedPieceMesh.visible = false;
          rig.carryMount.add(capturedPieceMesh);
        }
      }

      rig.root.visible = true;
      shadowMesh.visible = true;

      const fromPos = squareToBoardXZ(event.fromSquare, flipped);
      const toPos = squareToBoardXZ(event.toSquare, flipped);

      // Emerge directly out of the companion portrait box at the TOP of the board!
      const boxPortalX = -2.1;
      const boxPortalZ = -6.2; // Just above top edge of board (underneath companion box)
      const baseStandY = 1.08;

      let posX = boxPortalX;
      let posZ = boxPortalZ;
      let rotY = 0;
      let walkingSpeed = 0;
      let grabbing = false;
      let carrying = false;

      if (elapsed < 0.55) {
        // Phase 1: Step DOWN out of the top companion box onto the board to fromSquare
        const p = Math.min(1, elapsed / 0.55);
        const eased = 1 - Math.pow(1 - p, 2);
        posX = THREE.MathUtils.lerp(boxPortalX, fromPos.x, eased);
        posZ = THREE.MathUtils.lerp(boxPortalZ, fromPos.z, eased);
        rotY = Math.atan2(fromPos.x - boxPortalX, fromPos.z - boxPortalZ);
        walkingSpeed = 15;
      } else if (elapsed < 0.72) {
        // Phase 2: Reach out and pick up the moving piece at fromSquare
        posX = fromPos.x;
        posZ = fromPos.z;
        rotY = Math.atan2(toPos.x - fromPos.x, toPos.z - fromPos.z);
        grabbing = true;
        if (!walk.pickedUp) {
          walk.pickedUp = true;
          event.onPickup?.();
        }
        if (movingPieceMesh) {
          movingPieceMesh.visible = true;
          carrying = true;
        }
      } else if (elapsed < 1.38) {
        // Phase 3: Walk across the board from fromSquare to toSquare carrying the piece!
        const p = Math.min(1, (elapsed - 0.72) / 0.66);
        const eased = p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2;
        posX = THREE.MathUtils.lerp(fromPos.x, toPos.x, eased);
        posZ = THREE.MathUtils.lerp(fromPos.z, toPos.z, eased);
        rotY = Math.atan2(toPos.x - fromPos.x, toPos.z - fromPos.z);
        walkingSpeed = 14;
        if (movingPieceMesh) {
          movingPieceMesh.visible = true;
          carrying = true;
        }
      } else if (elapsed < 1.62) {
        // Phase 4: Set the moved piece down on toSquare (committing the move!) and take captured piece if any
        posX = toPos.x;
        posZ = toPos.z;
        grabbing = true;
        if (movingPieceMesh) movingPieceMesh.visible = false;
        if (!walk.committed) {
          walk.committed = true;
          event.onCommitMove?.();
        }
        if (capturedPieceMesh) {
          capturedPieceMesh.visible = true;
          carrying = true;
        }
      } else {
        // Phase 5: Walk back UP into the top companion box (carrying captured piece if any)
        const p = Math.min(1, (elapsed - 1.62) / 0.53);
        const eased = p * p;
        posX = THREE.MathUtils.lerp(toPos.x, boxPortalX, eased);
        posZ = THREE.MathUtils.lerp(toPos.z, boxPortalZ, eased);
        rotY = Math.atan2(boxPortalX - toPos.x, boxPortalZ - toPos.z);
        walkingSpeed = 16;
        if (movingPieceMesh) movingPieceMesh.visible = false;
        if (capturedPieceMesh) {
          capturedPieceMesh.visible = true;
          carrying = true;
        }
      }

      const stride = walkingSpeed > 0 ? Math.sin(elapsed * walkingSpeed) : 0;
      const bounce = walkingSpeed > 0 ? Math.abs(Math.sin(elapsed * walkingSpeed)) * 0.08 : 0;

      rig.root.position.set(posX, baseStandY + bounce, posZ);
      rig.root.rotation.y = THREE.MathUtils.lerp(rig.root.rotation.y, rotY, 0.28);

      shadowMesh.position.set(posX, 0.02, posZ);

      rig.leftLeg.hip.rotation.x = stride * 0.65;
      rig.rightLeg.hip.rotation.x = -stride * 0.65;
      rig.leftLeg.knee.rotation.x = Math.max(0, -stride * 0.5);
      rig.rightLeg.knee.rotation.x = Math.max(0, stride * 0.5);

      if (carrying) {
        rig.leftArm.shoulder.rotation.x = -1.05;
        rig.rightArm.shoulder.rotation.x = -1.05;
        rig.leftArm.shoulder.rotation.z = 0.28;
        rig.rightArm.shoulder.rotation.z = -0.28;
        rig.leftArm.elbow.rotation.x = -0.65;
        rig.rightArm.elbow.rotation.x = -0.65;
        rig.mouthHole.scale.set(1.45, 0.65, 0.5);
      } else if (grabbing) {
        rig.leftArm.shoulder.rotation.x = -1.25;
        rig.rightArm.shoulder.rotation.x = -1.25;
        rig.leftArm.shoulder.rotation.z = 0.15;
        rig.rightArm.shoulder.rotation.z = -0.15;
        rig.leftArm.elbow.rotation.x = -0.35;
        rig.rightArm.elbow.rotation.x = -0.35;
        rig.torsoGroup.rotation.x = 0.2;
      } else {
        rig.torsoGroup.rotation.x = 0.06;
        rig.leftArm.shoulder.rotation.x = -stride * 0.55;
        rig.rightArm.shoulder.rotation.x = stride * 0.55;
        rig.leftArm.shoulder.rotation.z = -0.18;
        rig.rightArm.shoulder.rotation.z = 0.18;
        rig.leftArm.elbow.rotation.x = -0.35;
        rig.rightArm.elbow.rotation.x = -0.35;
        rig.mouthHole.scale.set(1.2, 0.25, 0.5);
      }

      renderer.render(scene, camera);
    };

    animId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      renderer.dispose();
    };
  }, []);

  if (webglUnsupported) return null;

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-[35] overflow-hidden select-none"
      aria-hidden
    />
  );
}
