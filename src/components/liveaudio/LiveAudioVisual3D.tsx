
import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { Theme } from '../../../types';

interface LiveAudioVisual3DProps {
  inputNode: GainNode | null;
  outputNode: GainNode | null; 
  theme: Theme;
  isRecording: boolean;
  isAiSpeaking?: boolean;
}

const createSmoothParticleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d');
  if (!context) return null;

  // Create a perfectly circular, soft particle
  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;
  const maxRadius = canvas.width / 2;

  // Clear with transparent background
  context.clearRect(0, 0, canvas.width, canvas.height);
  
  // Create soft outer glow
  const outerGradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius);
  outerGradient.addColorStop(0, 'rgba(255,255,255,0.9)');
  outerGradient.addColorStop(0.2, 'rgba(255,255,255,0.6)');
  outerGradient.addColorStop(0.5, 'rgba(255,255,255,0.2)');
  outerGradient.addColorStop(0.8, 'rgba(255,255,255,0.05)');
  outerGradient.addColorStop(1, 'rgba(255,255,255,0)');

  context.fillStyle = outerGradient;
  context.beginPath();
  context.arc(centerX, centerY, maxRadius, 0, Math.PI * 2);
  context.fill();

  // Create bright core
  const coreGradient = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 0.4);
  coreGradient.addColorStop(0, 'rgba(255,255,255,1)');
  coreGradient.addColorStop(0.4, 'rgba(255,255,255,0.8)');
  coreGradient.addColorStop(1, 'rgba(255,255,255,0)');

  context.globalCompositeOperation = 'screen';
  context.fillStyle = coreGradient;
  context.beginPath();
  context.arc(centerX, centerY, maxRadius * 0.4, 0, Math.PI * 2);
  context.fill();

  // Add a subtle highlight
  const highlightGradient = context.createRadialGradient(
    centerX - maxRadius * 0.15, 
    centerY - maxRadius * 0.15, 
    0, 
    centerX - maxRadius * 0.15, 
    centerY - maxRadius * 0.15, 
    maxRadius * 0.25
  );
  highlightGradient.addColorStop(0, 'rgba(255,255,255,0.8)');
  highlightGradient.addColorStop(1, 'rgba(255,255,255,0)');

  context.fillStyle = highlightGradient;
  context.beginPath();
  context.arc(centerX - maxRadius * 0.15, centerY - maxRadius * 0.15, maxRadius * 0.25, 0, Math.PI * 2);
  context.fill();

  return new THREE.CanvasTexture(canvas);
};

export const LiveAudioVisual3D: React.FC<LiveAudioVisual3DProps> = ({
  inputNode,
  outputNode, 
  theme,
  isRecording,
  isAiSpeaking = false,
}) => {
  console.log('[LiveAudioVisual3D] Component rendered with props:', {
    hasInputNode: !!inputNode,
    hasOutputNode: !!outputNode,
    theme,
    isRecording,
    isAiSpeaking
  });

  
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const threeObjectsRef = useRef<any>({});
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const frequencyDataRef = useRef<Uint8Array | null>(null);

  const initThreeScene = useCallback((mount: HTMLDivElement) => {
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.08); // Add fog for depth
    
    const camera = new THREE.PerspectiveCamera(75, mount.clientWidth / mount.clientHeight, 0.1, 1000);
    camera.position.z = 2.8;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // Post-processing for bloom effect
    const renderScene = new RenderPass(scene, camera);
    
    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(mount.clientWidth, mount.clientHeight),
      1.2,   // strength
      0.4,   // radius
      0.85   // threshold
    );
    
    const composer = new EffectComposer(renderer);
    composer.addPass(renderScene);
    composer.addPass(bloomPass);

    // Enhanced particle system
    const particleCount = 2000; // Increased count for more density
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colorsAttribute = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    const phases = new Float32Array(particleCount);
    const lifespans = new Float32Array(particleCount); // For particle lifecycle
    const particleTypes = new Float32Array(particleCount); // Different particle behaviors

    // Enhanced color palette with more vibrant colors
    const particleColorBase = theme === Theme.DARK 
      ? new THREE.Color(0xf97316).convertSRGBToLinear() 
      : new THREE.Color(0xfb923c).convertSRGBToLinear();
    
    const particleColorPulse = theme === Theme.DARK 
      ? new THREE.Color(0xff8c42).convertSRGBToLinear() 
      : new THREE.Color(0xfd9e40).convertSRGBToLinear();
    
    const particleColorAI = new THREE.Color(0x10b981).convertSRGBToLinear();
    const particleColorHigh = new THREE.Color(0x3b82f6).convertSRGBToLinear();
    const particleColorAccent = new THREE.Color(0xe879f9).convertSRGBToLinear(); // Purple accent

    // Create particles with more sophisticated distribution
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      
      // Use improved distribution techniques
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      
      // Create layered sphere with varied radii
      let radius;
      const particleType = Math.random();
      particleTypes[i] = particleType;
      
      if (particleType < 0.7) {
        // Main sphere particles
        radius = 0.4 + Math.random() * 0.3;
      } else if (particleType < 0.9) {
        // Outer atmosphere particles
        radius = 0.8 + Math.random() * 0.4;
      } else {
        // Inner core particles
        radius = 0.1 + Math.random() * 0.2;
      }
      
      // Add some spiral structure
      const spiralOffset = (i / particleCount) * Math.PI * 4;
      const spiralFactor = 0.15;
      
      positions[i3] = Math.cos(theta + spiralOffset * spiralFactor) * Math.sin(phi) * radius;
      positions[i3 + 1] = Math.sin(theta + spiralOffset * spiralFactor) * Math.sin(phi) * radius;
      positions[i3 + 2] = Math.cos(phi) * radius;

      basePositions[i3] = positions[i3];
      basePositions[i3 + 1] = positions[i3 + 1];
      basePositions[i3 + 2] = positions[i3 + 2];
      
      velocities[i3] = (Math.random() - 0.5) * 0.002;
      velocities[i3 + 1] = (Math.random() - 0.5) * 0.002;
      velocities[i3 + 2] = (Math.random() - 0.5) * 0.002;

      // Assign initial colors based on particle type
      if (particleType < 0.7) {
        colorsAttribute[i3] = particleColorBase.r;
        colorsAttribute[i3 + 1] = particleColorBase.g;
        colorsAttribute[i3 + 2] = particleColorBase.b;
      } else if (particleType < 0.9) {
        colorsAttribute[i3] = particleColorPulse.r;
        colorsAttribute[i3 + 1] = particleColorPulse.g;
        colorsAttribute[i3 + 2] = particleColorPulse.b;
      } else {
        colorsAttribute[i3] = particleColorAccent.r;
        colorsAttribute[i3 + 1] = particleColorAccent.g;
        colorsAttribute[i3 + 2] = particleColorAccent.b;
      }

      // Varied particle sizes based on type
      if (particleType < 0.7) {
        sizes[i] = 0.4 + Math.random() * 0.3; // Regular particles
      } else if (particleType < 0.9) {
        sizes[i] = 0.2 + Math.random() * 0.2; // Small atmospheric particles
      } else {
        sizes[i] = 0.6 + Math.random() * 0.5; // Large core particles
      }
      
      phases[i] = Math.random() * Math.PI * 2;
      lifespans[i] = Math.random();
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsAttribute, 3));
    particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Store additional attributes for animation
    const additionalAttributes = {
      basePosition: new THREE.BufferAttribute(basePositions, 3),
      velocity: new THREE.BufferAttribute(velocities, 3),
      phase: new THREE.BufferAttribute(phases, 1),
      lifespan: new THREE.BufferAttribute(lifespans, 1),
      particleType: new THREE.BufferAttribute(particleTypes, 1)
    };

    // Create high-quality particle texture
    const particleTexture = createSmoothParticleTexture();

    // Custom shader material for more control over particles
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        texture: { value: particleTexture }
      },
      vertexShader: `
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;
        uniform float time;
        
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform sampler2D texture;
        varying vec3 vColor;
        
        void main() {
          vec4 texColor = texture2D(texture, gl_PointCoord);
          gl_FragColor = vec4(vColor, 1.0) * texColor;
        }
      `,
      blending: THREE.AdditiveBlending,
      depthTest: true,
      depthWrite: false,
      transparent: true,
      vertexColors: true
    });

    const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particleSystem);

    // Add volumetric lighting
    const ambientLight = new THREE.AmbientLight(
      theme === Theme.DARK ? 0x1a1a2e : 0xffffff, 
      0.3
    );
    scene.add(ambientLight);

    // Add directional light for highlights
    const directionalLight = new THREE.DirectionalLight(
      theme === Theme.DARK ? 0xf97316 : 0xfb923c,
      0.8
    );
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);

    // Add point light that follows mouse with more intensity
    const pointLight = new THREE.PointLight(
      theme === Theme.DARK ? 0xf97316 : 0xfb923c,
      1.0,
      5,
      2 // Quadratic attenuation for more realistic falloff
    );
    pointLight.position.set(0, 0, 1);
    scene.add(pointLight);
    
    const mouse = new THREE.Vector2(-1000, -1000);
    const cameraBasePosition = new THREE.Vector3(0, 0, 2.8);

    threeObjectsRef.current = { 
      scene, 
      camera, 
      renderer,
      composer,
      particleSystem, 
      particleMaterial,
      particleColorBase, 
      particleColorPulse,
      particleColorAI,
      particleColorHigh,
      particleColorAccent,
      additionalAttributes,
      sizes,
      mouse,
      particleTexture,
      ambientLight,
      directionalLight,
      pointLight,
      cameraBasePosition
    };

    const onResize = () => {
      if (!mountRef.current) return;
      camera.aspect = mountRef.current.clientWidth / mountRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
      composer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    const onMouseMove = (event: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.x = ((event.clientX - rect.left) / mount.clientWidth) * 2 - 1;
      mouse.y = -((event.clientY - rect.top) / mount.clientHeight) * 2 + 1;
    };
    const onTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const rect = mount.getBoundingClientRect();
        mouse.x = ((event.touches[0].clientX - rect.left) / mount.clientWidth) * 2 - 1;
        mouse.y = -((event.touches[0].clientY - rect.top) / mount.clientHeight) * 2 + 1;
      }
    };
    mount.addEventListener('mousemove', onMouseMove);
    mount.addEventListener('touchmove', onTouchMove, { passive: true });
    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };
    mount.addEventListener('mouseleave', onMouseLeave);
    mount.addEventListener('touchend', onMouseLeave);

    threeObjectsRef.current.removeEventListeners = () => {
      resizeObserver.disconnect();
      mount.removeEventListener('mousemove', onMouseMove);
      mount.removeEventListener('touchmove', onTouchMove);
      mount.removeEventListener('mouseleave', onMouseLeave);
      mount.removeEventListener('touchend', onMouseLeave);
      threeObjectsRef.current.particleTexture?.dispose();
    };

  }, [theme]);

  const setupAudioAnalyser = useCallback(() => {
    console.log('[LiveAudioVisual3D] setupAudioAnalyser called:', {
      hasInputNode: !!inputNode,
      hasContext: !!inputNode?.context,
      hasExistingAnalyser: !!analyserRef.current,
      contextState: inputNode?.context?.state
    });
    
    if (inputNode && inputNode.context && !analyserRef.current) {
      const analyser = inputNode.context.createAnalyser();
      analyser.fftSize = 512; // Increased for better frequency resolution
      analyser.smoothingTimeConstant = 0.85;
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const frequencyData = new Uint8Array(bufferLength);
      
      try {
        inputNode.connect(analyser);
        analyserRef.current = analyser;
        dataArrayRef.current = dataArray;
        frequencyDataRef.current = frequencyData;
        console.log('[LiveAudioVisual3D] Enhanced audio analyser connected successfully');
      } catch (e) {
        console.error("[LiveAudioVisual3D] Error connecting analyser to inputNode:", e);
        analyserRef.current = null; 
        dataArrayRef.current = null;
        frequencyDataRef.current = null;
      }
    } else if (!inputNode && analyserRef.current) { 
      console.log('[LiveAudioVisual3D] Cleaning up analyser (no inputNode)');
      analyserRef.current = null;
      dataArrayRef.current = null;
      frequencyDataRef.current = null;
    }
  }, [inputNode]);

  const animateParticles = useCallback(() => {
    animationFrameIdRef.current = requestAnimationFrame(animateParticles);
    const { 
      scene, camera, renderer, composer, particleSystem, particleMaterial,
      particleColorBase, particleColorPulse, particleColorAI, particleColorHigh, particleColorAccent,
      additionalAttributes, sizes, mouse, pointLight, cameraBasePosition, directionalLight
    } = threeObjectsRef.current;

    if (!scene || !camera || !renderer || !particleSystem || !particleMaterial) return;

    const time = Date.now() * 0.001;
    particleMaterial.uniforms.time.value = time;
    
    const positions = particleSystem.geometry.attributes.position.array as Float32Array;
    const colors = particleSystem.geometry.attributes.color.array as Float32Array;
    const sizeAttribute = particleSystem.geometry.attributes.size.array as Float32Array;
    
    const basePositions = additionalAttributes.basePosition.array as Float32Array;
    const velocities = additionalAttributes.velocity.array as Float32Array;
    const phases = additionalAttributes.phase.array as Float32Array;
    const lifespans = additionalAttributes.lifespan.array as Float32Array;
    const particleTypes = additionalAttributes.particleType.array as Float32Array;
        
    // Enhanced audio analysis with more frequency bands
    let audioLevel = 0;
    let bassFreq = 0, lowMidFreq = 0, highMidFreq = 0, highFreq = 0;
    
    if (analyserRef.current && dataArrayRef.current && frequencyDataRef.current && isRecording) {
      analyserRef.current.getByteFrequencyData(frequencyDataRef.current);
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);
      
      const bufferLength = frequencyDataRef.current.length;
      const bassEnd = Math.floor(bufferLength * 0.08);
      const lowMidEnd = Math.floor(bufferLength * 0.25);
      const highMidEnd = Math.floor(bufferLength * 0.5);
      
      // Calculate frequency bands with more precision
      for (let i = 0; i < bassEnd; i++) bassFreq += frequencyDataRef.current[i];
      for (let i = bassEnd; i < lowMidEnd; i++) lowMidFreq += frequencyDataRef.current[i];
      for (let i = lowMidEnd; i < highMidEnd; i++) highMidFreq += frequencyDataRef.current[i];
      for (let i = highMidEnd; i < bufferLength; i++) highFreq += frequencyDataRef.current[i];
      
      bassFreq = Math.pow((bassFreq / bassEnd) / 255, 1.5); // Emphasize bass
      lowMidFreq = (lowMidFreq / (lowMidEnd - bassEnd)) / 255;
      highMidFreq = (highMidFreq / (highMidEnd - lowMidEnd)) / 255;
      highFreq = (highFreq / (bufferLength - highMidEnd)) / 255;
      
      // Waveform analysis for transients
      let sum = 0;
      let peak = 0;
      for (let i = 0; i < dataArrayRef.current.length; i++) {
        const value = Math.abs(dataArrayRef.current[i] - 128) / 128;
        sum += value;
        peak = Math.max(peak, value);
      }
      audioLevel = sum / dataArrayRef.current.length;
    }

    // Enhanced interaction parameters with more nuance
    const repulsionStrength = 0.15;
    const attractionStrength = 0.08;
    const interactionRadius = 0.8;
    const returnFactor = 0.06;
    const dampingFactor = 0.92;
    
    // Dynamic pulse calculations with more complexity - ALWAYS animate
    const idlePulseStrength = 0.08 + Math.sin(time * 1.5) * 0.04 + Math.sin(time * 0.7) * 0.02;
    const audioPulseStrength = isRecording ? 
      (bassFreq * 0.5 + lowMidFreq * 0.3 + highMidFreq * 0.2 + highFreq * 0.1) : 0;
    const aiSpeakingPulse = isAiSpeaking ? 
      0.15 + Math.sin(time * 3) * 0.08 + Math.cos(time * 1.5) * 0.04 : 0;
    const dynamicPulseStrength = idlePulseStrength + audioPulseStrength + aiSpeakingPulse;

    // Cinematic camera movement
    const cameraMovementSpeed = 0.3;
    const cameraMovementAmount = 0.05;
    camera.position.x = cameraBasePosition.x + Math.sin(time * cameraMovementSpeed) * cameraMovementAmount;
    camera.position.y = cameraBasePosition.y + Math.cos(time * cameraMovementSpeed * 0.7) * cameraMovementAmount * 0.7;
    camera.position.z = cameraBasePosition.z + Math.sin(time * cameraMovementSpeed * 0.5) * cameraMovementAmount * 0.3;
    camera.lookAt(Math.sin(time * 0.2) * 0.1, Math.cos(time * 0.15) * 0.1, 0);

    // Update directional light for dynamic lighting
    directionalLight.position.x = Math.sin(time * 0.4) * 2;
    directionalLight.position.y = Math.cos(time * 0.3) * 2;
    directionalLight.position.z = 1 + Math.sin(time * 0.5) * 0.5;
    
    // Update point light position based on mouse with more dynamic behavior
    if (mouse.x > -999 && mouse.y > -999) {
      pointLight.position.x = mouse.x * 2;
      pointLight.position.y = mouse.y * 2;
      pointLight.position.z = 1 + Math.sin(time * 4) * 0.2;
      pointLight.intensity = 1.2 + Math.sin(time * 4) * 0.3 + (isRecording ? bassFreq * 0.8 : 0);
      
      // Change light color based on state
      if (isAiSpeaking) {
        pointLight.color.setHSL(0.4, 0.8, 0.5 + Math.sin(time * 3) * 0.2); // Green hue
      } else if (isRecording) {
        pointLight.color.setHSL(0.05, 0.8, 0.5 + audioLevel * 0.5); // Orange hue
      }
    } else {
      pointLight.position.x = Math.sin(time * 0.7) * 0.8;
      pointLight.position.y = Math.cos(time * 0.5) * 0.6;
      pointLight.position.z = 1 + Math.sin(time * 0.9) * 0.3;
      pointLight.intensity = 0.8 + Math.sin(time * 2) * 0.2;
      
      // Reset light color
      if (theme === Theme.DARK) {
        pointLight.color.setHex(0xf97316);
      } else {
        pointLight.color.setHex(0xfb923c);
      }
    }

    // Calculate mouse world position for interaction
    const mouseWorldPos = new THREE.Vector3();
    if (mouse.x > -999 && mouse.y > -999) { 
      const mouse3D = new THREE.Vector3(mouse.x, mouse.y, 0.5); 
      mouse3D.unproject(camera);
      const direction = mouse3D.sub(camera.position).normalize();
      const distance = -camera.position.z / direction.z; 
      mouseWorldPos.copy(camera.position).add(direction.multiplyScalar(distance));
    }

    // Enhanced particle animation with more sophisticated behaviors
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      const particlePhase = phases[i];
      const particleType = particleTypes[i];
      
      // Update particle lifespan for regeneration effect
      lifespans[i] += 0.001;
      if (lifespans[i] > 1) {
        lifespans[i] = 0;
        
        // Regenerate particle at base position with slight variation
        positions[i3] = basePositions[i3] + (Math.random() - 0.5) * 0.1;
        positions[i3 + 1] = basePositions[i3 + 1] + (Math.random() - 0.5) * 0.1;
        positions[i3 + 2] = basePositions[i3 + 2] + (Math.random() - 0.5) * 0.1;
        
        velocities[i3] = (Math.random() - 0.5) * 0.002;
        velocities[i3 + 1] = (Math.random() - 0.5) * 0.002;
        velocities[i3 + 2] = (Math.random() - 0.5) * 0.002;
      }
      
      const particlePosVec = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      
      // Mouse interaction with sophisticated zones
      if (mouse.x > -999 && mouse.y > -999) { 
        const distToMouse = particlePosVec.distanceTo(mouseWorldPos);
        if (distToMouse < interactionRadius) {
          if (distToMouse < interactionRadius * 0.3) {
            // Inner repulsion zone
            const repelVec = particlePosVec.clone().sub(mouseWorldPos).normalize()
              .multiplyScalar(repulsionStrength / (distToMouse + 0.01));
            velocities[i3] += repelVec.x;
            velocities[i3 + 1] += repelVec.y;
            velocities[i3 + 2] += repelVec.z;
          } else if (distToMouse < interactionRadius * 0.6) {
            // Middle vortex zone - circular motion
            const tangentVec = new THREE.Vector3(
              -(mouseWorldPos.y - particlePosVec.y),
              (mouseWorldPos.x - particlePosVec.x),
              0
            ).normalize().multiplyScalar(0.003);
            
            velocities[i3] += tangentVec.x;
            velocities[i3 + 1] += tangentVec.y;
            velocities[i3 + 2] += tangentVec.z;
          } else {
            // Outer attraction zone
            const attractVec = mouseWorldPos.clone().sub(particlePosVec).normalize()
              .multiplyScalar(attractionStrength * (1 - distToMouse / interactionRadius));
            velocities[i3] += attractVec.x * 0.3;
            velocities[i3 + 1] += attractVec.y * 0.3;
            velocities[i3 + 2] += attractVec.z * 0.2;
          }
        }
      }

      // Apply velocities with slight randomness for organic movement
      positions[i3] += velocities[i3] + (Math.random() - 0.5) * 0.0005;
      positions[i3 + 1] += velocities[i3 + 1] + (Math.random() - 0.5) * 0.0005;
      positions[i3 + 2] += velocities[i3 + 2] + (Math.random() - 0.5) * 0.0005;
      
      // Enhanced damping with slight variation
      const individualDamping = dampingFactor * (0.98 + Math.random() * 0.04);
      velocities[i3] *= individualDamping;
      velocities[i3 + 1] *= individualDamping;
      velocities[i3 + 2] *= individualDamping;

      // Frequency-based positioning with more nuance
      let freqInfluence = 0;
      
      if (isRecording) {
        // Different particle types respond to different frequency bands
        if (particleType < 0.3) {
          freqInfluence = bassFreq * 0.6;
        } else if (particleType < 0.6) {
          freqInfluence = lowMidFreq * 0.5;
        } else if (particleType < 0.9) {
          freqInfluence = highMidFreq * 0.4;
        } else {
          freqInfluence = highFreq * 0.7;
        }
      } else {
        // Add subtle frequency-like variation even when not recording
        freqInfluence = (Math.sin(time * 2 + particlePhase) * 0.1 + Math.cos(time * 1.3 + particlePhase * 0.7) * 0.05) * 0.3;
      }
      
      // Calculate pulse multiplier with more organic variation
      const pulseMultiplier = 1 + 
        dynamicPulseStrength * (0.8 + Math.sin(particlePhase + time) * 0.2) + 
        freqInfluence * (0.3 + Math.random() * 0.2);
      
      // Add sophisticated organic movement - ALWAYS active
      const organicOffset = new THREE.Vector3(
        Math.sin(time * 0.8 + particlePhase) * 0.03 * (1 + freqInfluence * 0.5),
        Math.cos(time * 0.6 + particlePhase * 1.3) * 0.03 * (1 + freqInfluence * 0.5),
        Math.sin(time * 0.4 + particlePhase * 0.7) * 0.02 * (1 + freqInfluence * 0.5)
      );

      // Calculate base position with pulse and organic movement
      const basePosVec = new THREE.Vector3(
        basePositions[i3] * pulseMultiplier + organicOffset.x, 
        basePositions[i3+1] * pulseMultiplier + organicOffset.y, 
        basePositions[i3+2] * pulseMultiplier + organicOffset.z
      );
      
      // Apply return force to base position with easing
      const currentPosVec = new THREE.Vector3(positions[i3], positions[i3+1], positions[i3+2]);
      const returnForce = basePosVec.sub(currentPosVec).multiplyScalar(returnFactor);
      
      velocities[i3] += returnForce.x;
      velocities[i3 + 1] += returnForce.y;
      velocities[i3 + 2] += returnForce.z;
      
      // Enhanced color and size animation with more sophisticated transitions
      let targetColor;
      let targetSize;
      
      // Determine particle appearance based on state and type
      if (isAiSpeaking) {
        if (particleType < 0.4) {
          // Core AI particles
          targetColor = particleColorAI;
          targetSize = sizes[i] * (1.3 + Math.sin(time * 4 + particlePhase) * 0.3);
        } else if (particleType < 0.7) {
          // Transition particles
          const mixFactor = 0.5 + Math.sin(time * 2 + particlePhase) * 0.5;
          targetColor = new THREE.Color().lerpColors(
            particleColorBase,
            particleColorAI,
            mixFactor
          );
          targetSize = sizes[i] * (1.1 + Math.sin(time * 3 + particlePhase) * 0.2);
        } else {
          // Accent particles
          targetColor = particleColorAccent;
          targetSize = sizes[i] * (0.9 + Math.sin(time * 5 + particlePhase) * 0.4);
        }
      } else if (isRecording) {
        // Audio reactive coloring
        const audioInfluence = bassFreq * 0.6 + lowMidFreq * 0.3 + highMidFreq * 0.1;
        
        if (highFreq > 0.4 && Math.random() < highFreq * 1.5) {
          // High frequency highlights
          targetColor = particleColorHigh;
          targetSize = sizes[i] * (1.5 + highFreq * 0.5);
        } else if (bassFreq > 0.5 && particleType < 0.3) {
          // Bass reactive particles
          targetColor = new THREE.Color().lerpColors(
            particleColorBase,
            particleColorPulse,
            bassFreq
          );
          targetSize = sizes[i] * (1.2 + bassFreq * 0.8);
        } else if (audioInfluence > 0.3 * Math.random()) {
          // General audio reactive particles
          targetColor = particleColorPulse;
          targetSize = sizes[i] * (1 + audioInfluence * 0.7);
        } else {
          // Default particles with slight audio influence
          targetColor = particleColorBase;
          targetSize = sizes[i] * (0.8 + audioInfluence * 0.4 + Math.sin(time * 2 + particlePhase) * 0.2);
        }
      } else {
        // Idle state with beautiful, vibrant animation
        const idleTime = time * 0.8; // Slower, more graceful movement
        const breathingEffect = Math.sin(idleTime + particlePhase) * 0.3 + Math.cos(idleTime * 0.7 + particlePhase * 1.2) * 0.2;
        
        if (particleType < 0.6) {
          // Main particles with breathing effect
          const colorMix = 0.5 + Math.sin(idleTime * 0.5 + particlePhase) * 0.3;
          targetColor = new THREE.Color().lerpColors(particleColorBase, particleColorPulse, colorMix);
          targetSize = sizes[i] * (1.0 + breathingEffect * 0.4);
        } else if (particleType < 0.85) {
          // Secondary particles with wave motion
          targetColor = particleColorPulse;
          targetSize = sizes[i] * (0.9 + Math.sin(idleTime * 1.2 + particlePhase) * 0.35);
        } else {
          // Accent particles with sparkle effect
          const sparkle = Math.sin(idleTime * 2 + particlePhase) * 0.5 + 0.5;
          targetColor = new THREE.Color().lerpColors(particleColorAccent, particleColorBase, sparkle * 0.6);
          targetSize = sizes[i] * (0.8 + sparkle * 0.6);
        }
      }
      
      // Smooth color transitions with variable speed
      const colorLerpSpeed = 0.1 + Math.random() * 0.1;
      colors[i3] += (targetColor.r - colors[i3]) * colorLerpSpeed;
      colors[i3 + 1] += (targetColor.g - colors[i3 + 1]) * colorLerpSpeed;
      colors[i3 + 2] += (targetColor.b - colors[i3 + 2]) * colorLerpSpeed;
      
      // Update particle size with smooth easing
      sizeAttribute[i] += (targetSize - sizeAttribute[i]) * (0.08 + Math.random() * 0.04);
    }

    // Update geometry attributes
    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.color.needsUpdate = true;
    particleSystem.geometry.attributes.size.needsUpdate = true;
    
    // Enhanced rotation with audio influence and organic movement
    const baseRotationSpeed = 0.02;
    const audioRotationInfluence = isRecording ? 
      (bassFreq * 0.04 + lowMidFreq * 0.02) : 0;
    const aiRotationInfluence = isAiSpeaking ? 0.015 : 0;
    
    particleSystem.rotation.y += baseRotationSpeed + audioRotationInfluence + aiRotationInfluence;
    particleSystem.rotation.x = Math.sin(time * 0.3) * 0.08;
    particleSystem.rotation.z = Math.cos(time * 0.2) * 0.05;

    // Render with post-processing for enhanced visual quality
    composer.render();
  }, [isRecording, isAiSpeaking]);

  useEffect(() => {
    const currentMount = mountRef.current;
    
    console.log('[LiveAudioVisual3D] Component mounting:', {
      hasMount: !!currentMount,
      hasThree: typeof THREE !== 'undefined',
      isRecording,
      isAiSpeaking,
      theme
    });
    
    if (currentMount && typeof THREE !== 'undefined') {
      while (currentMount.firstChild) {
        currentMount.removeChild(currentMount.firstChild);
      }
      console.log('[LiveAudioVisual3D] Initializing Three.js scene');
      initThreeScene(currentMount);
      animateParticles(); 

      return () => {
        if (animationFrameIdRef.current) {
          cancelAnimationFrame(animationFrameIdRef.current);
        }
        if (threeObjectsRef.current.removeEventListeners) {
          threeObjectsRef.current.removeEventListeners();
        }
        if (threeObjectsRef.current.renderer) {
          threeObjectsRef.current.renderer.dispose();
        }
        if (threeObjectsRef.current.composer) {
          threeObjectsRef.current.composer.dispose();
        }
        if (threeObjectsRef.current.scene) {
          threeObjectsRef.current.scene.traverse((object: any) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach((material: any) => material.dispose());
              } else {
                object.material.dispose();
              }
            }
          });
        }
        threeObjectsRef.current = {};
        if (analyserRef.current && inputNode) {
          try {
            if(inputNode.context.state !== 'closed') inputNode.disconnect(analyserRef.current);
          } catch(e) { console.warn("Error disconnecting analyser on cleanup:", e); }
        }
        analyserRef.current = null;
      };
    }
  }, [initThreeScene, animateParticles]); 

  useEffect(() => {
    setupAudioAnalyser();
  }, [setupAudioAnalyser, inputNode]);

  useEffect(() => {
    if (threeObjectsRef.current.particleSystem) {
      const newBaseColor = theme === Theme.DARK 
        ? new THREE.Color(0xf97316).convertSRGBToLinear() 
        : new THREE.Color(0xfb923c).convertSRGBToLinear();
      
      const newPulseColor = theme === Theme.DARK 
        ? new THREE.Color(0xff8c42).convertSRGBToLinear() 
        : new THREE.Color(0xfd9e40).convertSRGBToLinear();
      
      threeObjectsRef.current.particleColorBase = newBaseColor;
      threeObjectsRef.current.particleColorPulse = newPulseColor;
      
      // Update ambient light
      if (threeObjectsRef.current.ambientLight) {
        threeObjectsRef.current.ambientLight.color.setHex(
          theme === Theme.DARK ? 0x1a1a2e : 0xffffff
        );
      }
      
      // Update directional light
      if (threeObjectsRef.current.directionalLight) {
        threeObjectsRef.current.directionalLight.color.setHex(
          theme === Theme.DARK ? 0xf97316 : 0xfb923c
        );
      }
      
      // Update point light
      if (threeObjectsRef.current.pointLight) {
        threeObjectsRef.current.pointLight.color.setHex(
          theme === Theme.DARK ? 0xf97316 : 0xfb923c
        );
      }
      
      // Gradually update all particle colors
      const colorsAttribute = threeObjectsRef.current.particleSystem.geometry.attributes.color;
      const particleTypes = threeObjectsRef.current.additionalAttributes.particleType.array;
      
      for (let i = 0; i < colorsAttribute.count; i++) {
        const particleType = particleTypes[i];
        let targetColor;
        
        if (particleType < 0.7) {
          targetColor = newBaseColor;
        } else if (particleType < 0.9) {
          targetColor = newPulseColor;
        } else {
          targetColor = threeObjectsRef.current.particleColorAccent;
        }
        
        colorsAttribute.setXYZ(i, targetColor.r, targetColor.g, targetColor.b);
      }
      colorsAttribute.needsUpdate = true;
    }
  }, [theme]);

  return (
    <div 
      ref={mountRef}
      className="w-full h-full" 
      style={{ 
        cursor: 'grab',
        background: theme === Theme.DARK ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)',
        minHeight: '100vh'
      }} 
    />
  );
};

export default LiveAudioVisual3D;