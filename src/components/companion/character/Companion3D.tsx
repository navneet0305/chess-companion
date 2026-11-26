'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { AnimationState } from '../../../types/companion';
import type { CompanionSkitId } from '../../../lib/companionBets';
import { createBruno3DRig } from '../../../lib/bruno3DRig';

interface Companion3DProps {
  state: AnimationState;
  skit?: CompanionSkitId;
  isSpeaking?: boolean;
  size?: number;
  freeRoam?: boolean;
  onClick?: () => void;
}

export default function Companion3D({
  state = 'idle',
  skit = 'none',
  isSpeaking = false,
  size = 152,
  freeRoam = false,
  onClick,
}: Companion3DProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [webglFailed, setWebglFailed] = useState(false);

  const stateRef = useRef<AnimationState>(state);
  stateRef.current = state;

  const skitRef = useRef<CompanionSkitId>(skit);
  const skitStartRef = useRef<number>(0);
  if (skitRef.current !== skit) {
    skitRef.current = skit;
    skitStartRef.current = performance.now();
  }

  const isSpeakingRef = useRef<boolean>(isSpeaking);
  isSpeakingRef.current = isSpeaking;

  const freeRoamRef = useRef<boolean>(freeRoam);
  freeRoamRef.current = freeRoam;

  const pointerRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const dragOrbitRef = useRef<{
    yaw: number;
    pitch: number;
    dragging: boolean;
    lastX: number;
    lastY: number;
    moved: boolean;
  }>({
    yaw: 0,
    pitch: 0,
    dragging: false,
    lastX: 0,
    lastY: 0,
    moved: false,
  });

  useEffect(() => {
    const handlePointerMove = (e: PointerEvent) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1;
      const ny = -((e.clientY / window.innerHeight) * 2 - 1);
      pointerRef.current.x = Math.max(-1, Math.min(1, nx));
      pointerRef.current.y = Math.max(-1, Math.min(1, ny));

      if (dragOrbitRef.current.dragging) {
        const dx = e.clientX - dragOrbitRef.current.lastX;
        const dy = e.clientY - dragOrbitRef.current.lastY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          dragOrbitRef.current.moved = true;
        }
        dragOrbitRef.current.yaw += dx * 0.014;
        dragOrbitRef.current.pitch = Math.max(
          -0.45,
          Math.min(0.45, dragOrbitRef.current.pitch + dy * 0.01)
        );
        dragOrbitRef.current.lastX = e.clientX;
        dragOrbitRef.current.lastY = e.clientY;
      }
    };

    const handlePointerUp = () => {
      dragOrbitRef.current.dragging = false;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);
    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, []);

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
      setWebglFailed(true);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(size, size);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.18;
    // Block display removes default inline canvas baseline gap without clipping overflow
    renderer.domElement.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    // Full-body camera framing with generous vertical & arm-sweep headroom so Bruno stands unclipped out of any frame
    camera.position.set(0, -0.22, 8.15);
    camera.lookAt(0, -0.26, 0);

    // ─── Studio 3-Point Lighting ──────────────────────────────────────────────
    const hemiLight = new THREE.HemisphereLight(0xfff4e6, 0x1e293b, 1.0);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff0dd, 1.85);
    keyLight.position.set(2.8, 4.2, 4.2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0x60a5fa, 0.65);
    fillLight.position.set(-3.5, 1.5, 2.5);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfbbf24, 1.35);
    rimLight.position.set(0.5, 3.2, -3.5);
    scene.add(rimLight);

    const rig = createBruno3DRig();
    scene.add(rig.root);

    const {
      root,
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
    } = rig;

    let animFrameId = 0;
    let blinkTimer = 0;
    let nextBlinkAt = 2.4;

    const animate = (now: number) => {
      animFrameId = requestAnimationFrame(animate);
      const t = now * 0.001;
      const curState = stateRef.current;
      const curSkit = skitRef.current;
      const skitElapsed = (now - skitStartRef.current) * 0.001;
      const speaking = isSpeakingRef.current;

      blinkTimer += 0.016;
      let eyeScaleY = 1;
      if (blinkTimer > nextBlinkAt) {
        const blinkProgress = (blinkTimer - nextBlinkAt) / 0.16;
        if (blinkProgress < 1) {
          eyeScaleY = Math.max(0.08, Math.abs(Math.cos(blinkProgress * Math.PI)));
        } else {
          blinkTimer = 0;
          nextBlinkAt = 2.2 + Math.random() * 3.0;
        }
      }

      let rootX = 0;
      let rootY = Math.sin(t * 2.1) * 0.035;
      let rootRotY = dragOrbitRef.current.yaw;
      let rootRotX = dragOrbitRef.current.pitch;
      let headRotX = -pointerRef.current.y * 0.18;
      let headRotY = pointerRef.current.x * 0.28;
      let headRotZ = 0;
      let neckY = 0.98;

      let lShoulderZ = -0.22;
      let lShoulderX = 0.1;
      let lElbowX = -0.35;
      let rShoulderZ = 0.22;
      let rShoulderX = 0.1;
      let rElbowX = -0.35;
      let lHipX = 0;
      let rHipX = 0;

      let mouthScaleY = 0.22;
      let mouthScaleX = 1.2;
      const lBrowZ = Math.PI / 2 - 0.1;
      const rBrowZ = Math.PI / 2 + 0.1;
      let lBrowY = 0.31;
      let rBrowY = 0.31;

      const stachePos = new THREE.Vector3(0, -0.18, 0.66);
      let stacheScale = 1.0;
      let stacheRotZ = 0;

      shadesGroup.visible = false;
      espressoGroup.visible = false;
      sweatDrop.visible = false;

      if (freeRoamRef.current && curSkit === 'none') {
        rootX = Math.sin(t * 0.95) * 0.35;
        rootRotY += Math.sin(t * 0.65) * 0.25;
        lHipX = Math.sin(t * 4.2) * 0.16;
        rHipX = -Math.sin(t * 4.2) * 0.16;
      }

      if (curState === 'thinking') {
        headRotZ = -0.12;
        headRotX = 0.1;
        lBrowY = 0.27;
        rBrowY = 0.36;
        rShoulderX = -1.15;
        rShoulderZ = -0.35;
        rElbowX = -1.25;
      } else if (
        curState === 'happy' ||
        curState === 'excited' ||
        curState === 'celebrating' ||
        curState === 'victory'
      ) {
        rootY = Math.abs(Math.sin(t * 6.5)) * 0.16;
        lShoulderZ = -2.2 + Math.sin(t * 8) * 0.25;
        rShoulderZ = 2.2 - Math.sin(t * 8) * 0.25;
        lElbowX = -0.3;
        rElbowX = -0.3;
        mouthScaleY = 0.65;
        mouthScaleX = 1.5;
        lBrowY = 0.36;
        rBrowY = 0.36;
      } else if (curState === 'shocked' || curState === 'facepalm' || curState === 'disappointed') {
        headRotY = Math.sin(t * 10) * 0.16;
        lShoulderX = -1.45;
        lShoulderZ = 0.45;
        lElbowX = -1.45;
        mouthScaleY = 0.95;
        mouthScaleX = 0.85;
        lBrowY = 0.38;
        rBrowY = 0.38;
      } else if (curState === 'nervous') {
        rootX = Math.sin(t * 28) * 0.03;
        sweatDrop.visible = true;
        sweatDrop.position.y = 0.3 - ((t * 0.4) % 0.25);
        lShoulderX = -0.7;
        rShoulderX = -0.7;
        lElbowX = -1.0;
        rElbowX = -1.0;
        mouthScaleY = 0.4;
        mouthScaleX = 0.9;
      } else if (curState === 'confident') {
        headRotZ = 0.08;
        rBrowY = 0.37;
        lBrowY = 0.29;
        rShoulderZ = 0.45;
        rElbowX = -0.9;
      }

      if (curSkit === 'eat_mustache') {
        if (skitElapsed < 1.0) {
          rShoulderX = -1.25;
          rShoulderZ = -0.3;
          rElbowX = -1.3;
          headRotX = -0.1;
          lBrowY = 0.38;
          rBrowY = 0.38;
        } else if (skitElapsed < 2.2) {
          const p = (skitElapsed - 1.0) / 1.2;
          rShoulderX = -1.1;
          rShoulderZ = -0.25;
          rElbowX = -1.25;
          stachePos.set(0.18 * (1 - p), -0.18 - 0.16 * p, 0.78);
          stacheRotZ = Math.sin(t * 8) * 0.35;
          mouthScaleY = 0.95;
          mouthScaleX = 1.1;
        } else if (skitElapsed < 3.8) {
          stacheScale = Math.max(0.01, 1 - (skitElapsed - 2.2) * 1.4);
          stachePos.set(0, -0.34, 0.66);
          mouthScaleY = 0.35 + Math.abs(Math.sin(t * 14)) * 0.7;
          mouthScaleX = 1.2;
          headRotX = Math.sin(t * 14) * 0.12;
          rShoulderZ = 0.25;
          rElbowX = -0.5;
        } else {
          const regrow = Math.min(1, (skitElapsed - 3.8) / 0.6);
          stacheScale = regrow;
          mouthScaleY = 0.75;
          lBrowY = 0.39;
          rBrowY = 0.39;
        }
      } else if (curSkit === 'turtle_hide') {
        neckY = 0.42;
        headRotX = 0.12;
        lShoulderZ = -0.45;
        rShoulderZ = 0.45;
        lElbowX = -0.9;
        rElbowX = -0.9;
      } else if (curSkit === 'espresso_balance') {
        espressoGroup.visible = true;
        espressoGroup.rotation.z = Math.sin(t * 6) * 0.12;
        headRotX = -0.22;
        headRotZ = Math.sin(t * 6) * 0.08;
        lShoulderZ = -1.35 + Math.sin(t * 5) * 0.15;
        rShoulderZ = 1.35 - Math.sin(t * 5) * 0.15;
        lElbowX = -0.1;
        rElbowX = -0.1;
      } else if (curSkit === 'sunglasses_flex') {
        shadesGroup.visible = true;
        const dropProgress = Math.min(1, skitElapsed / 0.45);
        shadesGroup.position.y = THREE.MathUtils.lerp(0.65, 0.14, dropProgress);
        headRotZ = 0.1;
        lShoulderZ = -0.5;
        rShoulderZ = 0.5;
      } else if (curSkit === 'victory_spin') {
        rootRotY += skitElapsed * Math.PI * 2;
        rootY = Math.abs(Math.sin(t * 8)) * 0.2;
        lShoulderZ = -2.3;
        rShoulderZ = 2.3;
      } else if (curSkit === 'facepalm_dramatic') {
        lShoulderX = -1.48;
        lShoulderZ = 0.42;
        lElbowX = -1.48;
        headRotY = Math.sin(t * 10) * 0.2;
        mouthScaleY = 0.85;
      } else if (curSkit === 'sweat_nervous') {
        rootX = Math.sin(t * 28) * 0.035;
        sweatDrop.visible = true;
        sweatDrop.position.y = 0.3 - ((t * 0.45) % 0.28);
      }

      if (speaking && curSkit !== 'eat_mustache') {
        mouthScaleY = 0.25 + Math.abs(Math.sin(t * 18)) * 0.65;
        mouthScaleX = 1.15 + Math.sin(t * 11) * 0.15;
        if (curState === 'idle') {
          rShoulderX = -0.45 + Math.sin(t * 7) * 0.12;
          rElbowX = -0.85 + Math.sin(t * 7) * 0.15;
        }
      }

      const lerp = THREE.MathUtils.lerp;
      const spd = 0.16;

      root.position.x = lerp(root.position.x, rootX, spd);
      root.position.y = lerp(root.position.y, rootY, spd);
      root.rotation.y = lerp(root.rotation.y, rootRotY, spd);
      root.rotation.x = lerp(root.rotation.x, rootRotX, spd);

      neckPivot.position.y = lerp(neckPivot.position.y, neckY, spd);
      headGroup.rotation.x = lerp(headGroup.rotation.x, headRotX, spd);
      headGroup.rotation.y = lerp(headGroup.rotation.y, headRotY, spd);
      headGroup.rotation.z = lerp(headGroup.rotation.z, headRotZ, spd);

      leftEye.eyeGroup.scale.y = eyeScaleY;
      rightEye.eyeGroup.scale.y = eyeScaleY;
      leftEye.pupilGroup.position.x = lerp(
        leftEye.pupilGroup.position.x,
        pointerRef.current.x * 0.035,
        0.2
      );
      rightEye.pupilGroup.position.x = lerp(
        rightEye.pupilGroup.position.x,
        pointerRef.current.x * 0.035,
        0.2
      );
      leftEye.pupilGroup.position.y = lerp(
        leftEye.pupilGroup.position.y,
        pointerRef.current.y * 0.03,
        0.2
      );
      rightEye.pupilGroup.position.y = lerp(
        rightEye.pupilGroup.position.y,
        pointerRef.current.y * 0.03,
        0.2
      );

      leftBrow.rotation.z = lerp(leftBrow.rotation.z, lBrowZ, spd);
      rightBrow.rotation.z = lerp(rightBrow.rotation.z, rBrowZ, spd);
      leftBrow.position.y = lerp(leftBrow.position.y, lBrowY, spd);
      rightBrow.position.y = lerp(rightBrow.position.y, rBrowY, spd);

      mouthHole.scale.y = lerp(mouthHole.scale.y, mouthScaleY, 0.28);
      mouthHole.scale.x = lerp(mouthHole.scale.x, mouthScaleX, 0.28);

      mustacheGroup.position.lerp(stachePos, 0.2);
      mustacheGroup.scale.setScalar(lerp(mustacheGroup.scale.x, stacheScale, 0.22));
      mustacheGroup.rotation.z = lerp(mustacheGroup.rotation.z, stacheRotZ, 0.2);

      leftArm.shoulder.rotation.z = lerp(leftArm.shoulder.rotation.z, lShoulderZ, spd);
      leftArm.shoulder.rotation.x = lerp(leftArm.shoulder.rotation.x, lShoulderX, spd);
      leftArm.elbow.rotation.x = lerp(leftArm.elbow.rotation.x, lElbowX, spd);

      rightArm.shoulder.rotation.z = lerp(rightArm.shoulder.rotation.z, rShoulderZ, spd);
      rightArm.shoulder.rotation.x = lerp(rightArm.shoulder.rotation.x, rShoulderX, spd);
      rightArm.elbow.rotation.x = lerp(rightArm.elbow.rotation.x, rElbowX, spd);

      leftLeg.hip.rotation.x = lerp(leftLeg.hip.rotation.x, lHipX, spd);
      rightLeg.hip.rotation.x = lerp(rightLeg.hip.rotation.x, rHipX, spd);

      renderer.render(scene, camera);
    };

    animFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameId);
      renderer.dispose();
    };
  }, [size]);

  if (webglFailed) {
    return (
      <img
        src="/companions/bruno-idle.jpg"
        alt="Bruno companion"
        style={{ width: size, height: size }}
        className="rounded-2xl object-cover object-top"
      />
    );
  }

  return (
    <div
      ref={containerRef}
      style={{ width: size, height: size }}
      onPointerDown={(e) => {
        dragOrbitRef.current.dragging = true;
        dragOrbitRef.current.moved = false;
        dragOrbitRef.current.lastX = e.clientX;
        dragOrbitRef.current.lastY = e.clientY;
      }}
      onClick={() => {
        if (!dragOrbitRef.current.moved) {
          onClick?.();
        }
      }}
      onDoubleClick={() => {
        dragOrbitRef.current.yaw = 0;
        dragOrbitRef.current.pitch = 0;
      }}
      className="cursor-grab active:cursor-grabbing relative select-none"
      title="Drag to spin Bruno in 3D • Click to interact • Double-click to reset angle"
    />
  );
}
