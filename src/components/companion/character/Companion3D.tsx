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
  size = 188,
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
    renderer.toneMappingExposure = 1.15;
    renderer.domElement.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);
    // Tightly framed camera centering character from floating crown to chunky sneakers with generous scale
    camera.position.set(0, 0.38, 5.85);
    camera.lookAt(0, 0.36, 0);

    // ─── Studio 3-Point Lighting ──────────────────────────────────────────────
    const hemiLight = new THREE.HemisphereLight(0xfffaf2, 0x3b2a5e, 1.15);
    scene.add(hemiLight);

    const keyLight = new THREE.DirectionalLight(0xfff5e8, 1.65);
    keyLight.position.set(2.8, 4.4, 4.5);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xa78bfa, 0.72);
    fillLight.position.set(-3.6, 1.8, 2.8);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0xfbbf24, 1.1);
    rimLight.position.set(0.6, 3.2, -3.6);
    scene.add(rimLight);

    const rig = createBruno3DRig();
    scene.add(rig.root);

    const {
      root,
      torsoGroup,
      headGroup,
      mouthGroup,
      mouthHole,
      tongueMesh,
      leftEye,
      rightEye,
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
    } = rig;

    let animFrameId = 0;
    let blinkTimer = 0;
    let nextBlinkAt = 2.6;

    const animate = (now: number) => {
      animFrameId = requestAnimationFrame(animate);
      const t = now * 0.001;
      const curState = stateRef.current;
      const curSkit = skitRef.current;
      const skitElapsed = (now - skitStartRef.current) * 0.001;
      const speaking = isSpeakingRef.current;

      // Smooth blinking across heavy half-lidded eyes
      blinkTimer += 0.016;
      let blinkAmount = 0;
      if (blinkTimer > nextBlinkAt) {
        const blinkProgress = (blinkTimer - nextBlinkAt) / 0.16;
        if (blinkProgress < 1) {
          blinkAmount = Math.sin(blinkProgress * Math.PI);
        } else {
          blinkTimer = 0;
          nextBlinkAt = 2.4 + Math.random() * 2.8;
        }
      }

      // Base idle swagger pose matching the uploaded artwork
      let rootX = 0;
      let rootY = Math.sin(t * 2.4) * 0.04;
      let rootRotY = -0.1 + dragOrbitRef.current.yaw;
      let rootRotX = dragOrbitRef.current.pitch;
      let torsoRotZ = Math.sin(t * 1.4) * 0.025;
      let headRotX = -pointerRef.current.y * 0.1;
      let headRotY = pointerRef.current.x * 0.16;
      let headRotZ = 0;

      // Arms: viewer-left on hip, viewer-right cheeky finger-gun point!
      let lShoulderZ = 0.28;
      let lShoulderX = 0.05;
      let lElbowZ = -0.78;
      let lElbowX = -0.25;

      let rShoulderZ = 0.88;
      let rShoulderX = -0.05;
      let rElbowZ = 0.18 + Math.sin(t * 2.8) * 0.05;
      let rElbowX = -0.22;

      let lHipX = 0;
      let rHipX = 0;

      // Half-lids & playful tongue defaults
      let lidOpenLeft = 0; // 0 = cool half-lidded, negative = wide open, positive = closed
      let lidOpenRight = 0;
      let mouthScaleY = 0.65;
      let mouthScaleX = 1.25;
      let tongueVisibleScale = 1.0;

      let crownPos = new THREE.Vector3(-0.82, 1.24 + Math.sin(t * 2.6) * 0.06, 0.05);
      let crownRotZ = 0.38 + Math.sin(t * 2.0) * 0.06;
      let crownScale = 1.0;

      shadesGroup.visible = false;
      espressoGroup.visible = false;
      sweatDrop.visible = false;

      if (freeRoamRef.current && curSkit === 'none') {
        rootX = Math.sin(t * 1.0) * 0.32;
        rootRotY += Math.sin(t * 0.7) * 0.28;
        lHipX = Math.sin(t * 4.2) * 0.16;
        rHipX = -Math.sin(t * 4.2) * 0.16;
      }

      if (curState === 'thinking') {
        headRotZ = -0.08;
        headRotX = 0.06;
        lidOpenLeft = 0.15;
        lidOpenRight = -0.22;
        rShoulderX = -1.05;
        rShoulderZ = -0.25;
        rElbowX = -1.2;
        rElbowZ = 0.1;
        tongueVisibleScale = 0.2;
        mouthScaleY = 0.35;
      } else if (
        curState === 'happy' ||
        curState === 'excited' ||
        curState === 'celebrating' ||
        curState === 'victory'
      ) {
        rootY = Math.abs(Math.sin(t * 6.5)) * 0.16;
        lidOpenLeft = -0.45;
        lidOpenRight = -0.45;
        lShoulderZ = -1.35 + Math.sin(t * 8) * 0.25;
        lElbowZ = -0.2;
        rShoulderZ = 1.45 - Math.sin(t * 8) * 0.25;
        rElbowZ = 0.2;
        mouthScaleY = 0.95;
        mouthScaleX = 1.4;
        tongueVisibleScale = 1.15;
      } else if (curState === 'shocked' || curState === 'facepalm' || curState === 'disappointed') {
        headRotY = Math.sin(t * 9) * 0.14;
        lidOpenLeft = -0.78;
        lidOpenRight = -0.78;
        lShoulderX = -1.2;
        lShoulderZ = 0.35;
        lElbowX = -1.2;
        mouthScaleY = 1.1;
        mouthScaleX = 0.88;
        tongueVisibleScale = 0.05;
      } else if (curState === 'nervous') {
        rootX = Math.sin(t * 28) * 0.03;
        sweatDrop.visible = true;
        sweatDrop.position.y = 0.3 - ((t * 0.4) % 0.24);
        lidOpenLeft = -0.35;
        lidOpenRight = 0.1;
        lShoulderX = -0.6;
        rShoulderX = -0.6;
        rShoulderZ = 0.3;
        tongueVisibleScale = 0.1;
        mouthScaleY = 0.45;
      } else if (curState === 'confident') {
        torsoRotZ = -0.04;
        lidOpenLeft = 0.08;
        lidOpenRight = -0.12;
        rShoulderZ = 1.05;
        tongueVisibleScale = 1.1;
      }

      // Action Skits
      if (curSkit === 'crown_flex' || curSkit === 'eat_mustache') {
        if (skitElapsed < 1.2) {
          const p = skitElapsed / 1.2;
          crownPos.set(
            THREE.MathUtils.lerp(-0.82, 0, p),
            THREE.MathUtils.lerp(1.24, 1.18, p) + Math.sin(p * Math.PI) * 0.45,
            0.06
          );
          crownRotZ = THREE.MathUtils.lerp(0.38, 0, p);
          crownScale = 1.18;
          lidOpenLeft = -0.45;
          lidOpenRight = -0.45;
        } else {
          crownPos.set(0, 1.16 + Math.abs(Math.sin(t * 7)) * 0.08, 0.06);
          crownRotZ = Math.sin(t * 6) * 0.1;
          crownScale = 1.22;
          rootRotY += skitElapsed * Math.PI * 1.5;
          rootY = Math.abs(Math.sin(t * 7)) * 0.16;
          lShoulderZ = -1.2;
          rShoulderZ = 1.2;
          mouthScaleY = 1.0;
          tongueVisibleScale = 1.2;
        }
      } else if (curSkit === 'headphone_jam') {
        torsoRotZ = Math.sin(t * 9) * 0.14;
        headRotZ = Math.sin(t * 9) * 0.12;
        rootY = Math.abs(Math.sin(t * 9)) * 0.14;
        lShoulderX = -0.9;
        lShoulderZ = -0.4;
        rShoulderZ = 1.15 + Math.sin(t * 9) * 0.35;
        lidOpenLeft = 0.3;
        lidOpenRight = 0.3;
        tongueVisibleScale = 1.15;
      } else if (curSkit === 'turtle_hide') {
        rootY = -0.34;
        lidOpenLeft = 0.85;
        lidOpenRight = 0.85;
        lShoulderZ = -0.25;
        rShoulderZ = 0.25;
        tongueVisibleScale = 0.02;
        mouthScaleY = 0.2;
      } else if (curSkit === 'espresso_balance') {
        espressoGroup.visible = true;
        espressoGroup.rotation.z = Math.sin(t * 6) * 0.12;
        headRotZ = Math.sin(t * 6) * 0.06;
        lShoulderZ = -0.8;
        rShoulderZ = 0.8;
        lidOpenLeft = -0.5;
        lidOpenRight = -0.5;
      } else if (curSkit === 'sunglasses_flex') {
        shadesGroup.visible = true;
        const dropProgress = Math.min(1, skitElapsed / 0.45);
        shadesGroup.position.y = THREE.MathUtils.lerp(0.65, 0.09, dropProgress);
        torsoRotZ = -0.05;
        rShoulderZ = 1.05;
        tongueVisibleScale = 1.15;
      } else if (curSkit === 'victory_spin') {
        rootRotY += skitElapsed * Math.PI * 2;
        rootY = Math.abs(Math.sin(t * 8)) * 0.2;
        lShoulderZ = -1.4;
        rShoulderZ = 1.4;
        lidOpenLeft = -0.6;
        lidOpenRight = -0.6;
      } else if (curSkit === 'facepalm_dramatic') {
        lShoulderX = -1.25;
        lShoulderZ = 0.3;
        lElbowX = -1.25;
        headRotY = Math.sin(t * 9) * 0.16;
        lidOpenLeft = -0.7;
        lidOpenRight = -0.7;
        tongueVisibleScale = 0.05;
      } else if (curSkit === 'sweat_nervous') {
        rootX = Math.sin(t * 28) * 0.035;
        sweatDrop.visible = true;
        sweatDrop.position.y = 0.3 - ((t * 0.45) % 0.25);
        lidOpenLeft = -0.3;
        lidOpenRight = -0.3;
      }

      if (speaking) {
        mouthScaleY = 0.38 + Math.abs(Math.sin(t * 17)) * 0.72;
        mouthScaleX = 1.15 + Math.sin(t * 10) * 0.15;
        tongueVisibleScale = 0.6 + Math.abs(Math.sin(t * 12)) * 0.45;
        if (curState === 'idle') {
          rElbowZ = 0.2 + Math.sin(t * 7) * 0.18;
        }
      }

      const lerp = THREE.MathUtils.lerp;
      const spd = 0.16;

      root.position.x = lerp(root.position.x, rootX, spd);
      root.position.y = lerp(root.position.y, rootY, spd);
      root.rotation.y = lerp(root.rotation.y, rootRotY, spd);
      root.rotation.x = lerp(root.rotation.x, rootRotX, spd);
      torsoGroup.rotation.z = lerp(torsoGroup.rotation.z, torsoRotZ, spd);

      headGroup.rotation.x = lerp(headGroup.rotation.x, headRotX, spd);
      headGroup.rotation.y = lerp(headGroup.rotation.y, headRotY, spd);
      headGroup.rotation.z = lerp(headGroup.rotation.z, headRotZ, spd);

      // Eyelids (cool half-lids + smooth blink + pointer eye tracking)
      leftEye.eyelidGroup.rotation.x = lerp(
        leftEye.eyelidGroup.rotation.x,
        lidOpenLeft + blinkAmount * 1.15,
        0.24
      );
      rightEye.eyelidGroup.rotation.x = lerp(
        rightEye.eyelidGroup.rotation.x,
        lidOpenRight + blinkAmount * 1.15,
        0.24
      );

      leftEye.pupilGroup.position.x = lerp(
        leftEye.pupilGroup.position.x,
        0.03 + pointerRef.current.x * 0.045,
        0.2
      );
      rightEye.pupilGroup.position.x = lerp(
        rightEye.pupilGroup.position.x,
        -0.02 + pointerRef.current.x * 0.045,
        0.2
      );
      leftEye.pupilGroup.position.y = lerp(
        leftEye.pupilGroup.position.y,
        -0.02 + pointerRef.current.y * 0.035,
        0.2
      );
      rightEye.pupilGroup.position.y = lerp(
        rightEye.pupilGroup.position.y,
        -0.02 + pointerRef.current.y * 0.035,
        0.2
      );

      mouthHole.scale.y = lerp(mouthHole.scale.y, mouthScaleY, 0.26);
      mouthHole.scale.x = lerp(mouthHole.scale.x, mouthScaleX, 0.26);
      tongueMesh.visible = false;
      tongueMesh.scale.set(0, 0, 0);
      mouthGroup.rotation.z = lerp(mouthGroup.rotation.z, 0.08 + Math.sin(t * 2) * 0.02, 0.15);

      // Floating crown & vibe doodle animation
      floatingCrown.position.lerp(crownPos, 0.18);
      floatingCrown.rotation.z = lerp(floatingCrown.rotation.z, crownRotZ, 0.18);
      floatingCrown.scale.setScalar(lerp(floatingCrown.scale.x, crownScale, 0.18));

      sparkGroup.position.y = 0.94 + Math.sin(t * 3.6 + 0.8) * 0.06;
      sparkGroup.rotation.z = Math.sin(t * 3.0) * 0.08;
      starGroup.rotation.z = t * 0.35;

      leftArm.shoulder.rotation.z = lerp(leftArm.shoulder.rotation.z, lShoulderZ, spd);
      leftArm.shoulder.rotation.x = lerp(leftArm.shoulder.rotation.x, lShoulderX, spd);
      leftArm.elbow.rotation.z = lerp(leftArm.elbow.rotation.z, lElbowZ, spd);
      leftArm.elbow.rotation.x = lerp(leftArm.elbow.rotation.x, lElbowX, spd);

      rightArm.shoulder.rotation.z = lerp(rightArm.shoulder.rotation.z, rShoulderZ, spd);
      rightArm.shoulder.rotation.x = lerp(rightArm.shoulder.rotation.x, rShoulderX, spd);
      rightArm.elbow.rotation.z = lerp(rightArm.elbow.rotation.z, rElbowZ, spd);
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
        src={`${import.meta.env.BASE_URL}companions/bruno-idle.jpg`}
        alt="3D Companion"
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
      title="Drag to spin in 3D • Click to interact • Double-click to reset angle"
    />
  );
}
