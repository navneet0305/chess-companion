'use client';

import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import type { AnimationState } from '../../../types/companion';
import type { CompanionSkitId } from '../../../lib/companionBets';
import type { CharacterBase } from '../../../contexts/CompanionContext';
import { createCrownedMascot3DRig } from '../../../lib/bruno3DRig';
import { createBrunoClassic3DRig } from '../../../lib/brunoClassic3DRig';

interface Companion3DProps {
  character?: CharacterBase;
  state: AnimationState;
  skit?: CompanionSkitId;
  isSpeaking?: boolean;
  size?: number;
  freeRoam?: boolean;
  onClick?: () => void;
}

export default function Companion3D({
  character = 'bruno',
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
    renderer.toneMappingExposure = 1.16;
    renderer.domElement.style.display = 'block';
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 50);

    let animFrameId = 0;
    const isCrowned = character === 'crowned';

    if (isCrowned) {
      // ═════════════════════════════════════════════════════════════════════════
      // 1. CROWNED 3D MASCOT RIG (Purple Headphones, Crown, Clean Smirk)
      // ═════════════════════════════════════════════════════════════════════════
      camera.position.set(0, 0.38, 5.85);
      camera.lookAt(0, 0.36, 0);

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

      const rig = createCrownedMascot3DRig();
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

      tongueMesh.visible = false;
      tongueMesh.scale.set(0, 0, 0);

      let blinkTimer = 0;
      let nextBlinkAt = 2.6;

      const animateCrowned = (now: number) => {
        animFrameId = requestAnimationFrame(animateCrowned);
        const t = now * 0.001;
        const curState = stateRef.current;
        const curSkit = skitRef.current;
        const skitElapsed = (now - skitStartRef.current) * 0.001;
        const speaking = isSpeakingRef.current;

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

        let rootX = 0;
        let rootY = Math.sin(t * 2.4) * 0.04;
        let rootRotY = -0.1 + dragOrbitRef.current.yaw;
        let rootRotX = dragOrbitRef.current.pitch;
        let torsoRotZ = Math.sin(t * 1.4) * 0.025;
        let headRotX = -pointerRef.current.y * 0.1;
        let headRotY = pointerRef.current.x * 0.16;
        let headRotZ = 0;

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

        let lidOpenLeft = 0;
        let lidOpenRight = 0;
        let mouthScaleY = 0.65;
        let mouthScaleX = 1.25;

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
        } else if (curState === 'shocked' || curState === 'facepalm' || curState === 'disappointed') {
          headRotY = Math.sin(t * 9) * 0.14;
          lidOpenLeft = -0.78;
          lidOpenRight = -0.78;
          lShoulderX = -1.2;
          lShoulderZ = 0.35;
          lElbowX = -1.2;
          mouthScaleY = 1.1;
          mouthScaleX = 0.88;
        } else if (curState === 'nervous') {
          rootX = Math.sin(t * 26) * 0.025;
          sweatDrop.visible = true;
          sweatDrop.position.y = 0.42 - ((t * 0.4) % 0.28);
          lShoulderX = -0.4;
          rShoulderX = -0.4;
          mouthScaleY = 0.45;
        } else if (curState === 'confident') {
          headRotZ = 0.06;
          rShoulderZ = 1.15;
          rElbowZ = 0.1;
          crownPos.y += 0.08;
        }

        if (curSkit === 'crown_flex') {
          const bounce = Math.sin(skitElapsed * 6) * 0.25;
          crownPos.set(0, 1.42 + bounce, 0);
          crownRotZ = skitElapsed * 4;
          crownScale = 1.25;
          rootY = Math.abs(Math.sin(t * 7)) * 0.14;
          rShoulderZ = 1.6;
          lShoulderZ = -1.6;
        } else if (curSkit === 'headphone_jam') {
          headRotZ = Math.sin(t * 9) * 0.22;
          headRotX = Math.cos(t * 9) * 0.14;
          lShoulderZ = -0.8 + Math.sin(t * 9) * 0.35;
          rShoulderZ = 0.8 - Math.sin(t * 9) * 0.35;
          rootY = Math.abs(Math.sin(t * 9)) * 0.12;
        } else if (curSkit === 'turtle_hide') {
          rootY = -0.32;
          headRotX = 0.24;
          lShoulderZ = -0.15;
          rShoulderZ = 0.15;
          lElbowX = -0.8;
          rElbowX = -0.8;
          mouthScaleY = 0.2;
        } else if (curSkit === 'espresso_balance') {
          espressoGroup.visible = true;
          espressoGroup.rotation.z = Math.sin(t * 6) * 0.12;
          headRotX = -0.22;
          headRotZ = Math.sin(t * 6) * 0.08;
          lShoulderZ = -1.35 + Math.sin(t * 5) * 0.15;
          rShoulderZ = 1.35 - Math.sin(t * 5) * 0.15;
        } else if (curSkit === 'sunglasses_flex') {
          shadesGroup.visible = true;
          const dropProgress = Math.min(1, skitElapsed / 0.45);
          shadesGroup.position.y = THREE.MathUtils.lerp(0.75, 0.16, dropProgress);
          headRotZ = 0.1;
        } else if (curSkit === 'victory_spin') {
          rootRotY += skitElapsed * Math.PI * 2.5;
          rootY = Math.abs(Math.sin(t * 8)) * 0.18;
          lShoulderZ = -1.75;
          rShoulderZ = 1.75;
          crownScale = 1.2;
        } else if (curSkit === 'facepalm_dramatic') {
          lShoulderX = -1.35;
          lShoulderZ = 0.35;
          lElbowX = -1.45;
          headRotY = Math.sin(t * 10) * 0.18;
          mouthScaleY = 0.85;
        } else if (curSkit === 'sweat_nervous') {
          rootX = Math.sin(t * 26) * 0.03;
          sweatDrop.visible = true;
          sweatDrop.position.y = 0.42 - ((t * 0.4) % 0.28);
        }

        if (speaking) {
          mouthScaleY = 0.38 + Math.abs(Math.sin(t * 17)) * 0.72;
          mouthScaleX = 1.15 + Math.sin(t * 10) * 0.15;
          headRotX += Math.sin(t * 9) * 0.05;
          headRotZ += Math.sin(t * 6) * 0.04;
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

        const targetLidL = THREE.MathUtils.clamp(lidOpenLeft + blinkAmount * 0.6, -0.85, 0.55);
        const targetLidR = THREE.MathUtils.clamp(lidOpenRight + blinkAmount * 0.6, -0.85, 0.55);
        leftEye.eyelidGroup.position.y = lerp(
          leftEye.eyelidGroup.position.y,
          0.16 - targetLidL * 0.14,
          0.26
        );
        rightEye.eyelidGroup.position.y = lerp(
          rightEye.eyelidGroup.position.y,
          0.16 - targetLidR * 0.14,
          0.26
        );

        leftEye.pupilGroup.position.x = lerp(
          leftEye.pupilGroup.position.x,
          pointerRef.current.x * 0.045,
          0.2
        );
        rightEye.pupilGroup.position.x = lerp(
          rightEye.pupilGroup.position.x,
          pointerRef.current.x * 0.045,
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

      animFrameId = requestAnimationFrame(animateCrowned);
    } else {
      // ═════════════════════════════════════════════════════════════════════════
      // 2. CLASSIC 3D BRUNO RIG (Mustache, Burgundy Turtleneck, Navy Blazer)
      // ═════════════════════════════════════════════════════════════════════════
      camera.position.set(0, -0.18, 6.75);
      camera.lookAt(0, -0.22, 0);

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

      const rig = createBrunoClassic3DRig();
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

      let blinkTimer = 0;
      let nextBlinkAt = 2.4;

      const animateClassic = (now: number) => {
        animFrameId = requestAnimationFrame(animateClassic);
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

      animFrameId = requestAnimationFrame(animateClassic);
    }

    return () => {
      cancelAnimationFrame(animFrameId);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size, character]);

  if (webglFailed) {
    return (
      <img
        src={`${import.meta.env.BASE_URL}companions/bruno-idle.jpg`}
        alt="Companion"
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
      className="cursor-pointer select-none touch-none overflow-visible"
      title="Click to interact with your 3D Companion • Drag horizontally to spin"
    />
  );
}
