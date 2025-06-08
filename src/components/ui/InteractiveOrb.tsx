import React, { useRef, useCallback, useEffect, useState } from 'react';
import * as THREE from 'three';
import { Theme } from '../../contexts/ThemeContext';

interface InteractiveOrbProps {
  theme?: Theme;
  className?: string;
  particleCount?: number;
  isVisible?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  intensity?: 'subtle' | 'normal' | 'intense';
}

interface ThreeObjects {
  scene?: THREE.Scene;
  camera?: THREE.PerspectiveCamera;
  renderer?: THREE.WebGLRenderer;
  particleSystem?: THREE.Points;
  mouse?: THREE.Vector2;
  cleanup?: () => void;
}

const InteractiveOrb: React.FC<InteractiveOrbProps> = ({
  theme = Theme.LIGHT,
  className = '',
  particleCount = 800,
  isVisible = true,
  size = 'lg',
  intensity = 'normal'
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const threeObjectsRef = useRef<ThreeObjects | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced size configurations
  const sizeConfig = {
    sm: { base: 180, md: 200, lg: 220, xl: 240 },
    md: { base: 220, md: 240, lg: 260, xl: 280 },
    lg: { base: 260, md: 280, lg: 300, xl: 320 },
    xl: { base: 300, md: 320, lg: 340, xl: 360 }
  };

  const intensityConfig = {
    subtle: { particles: 0.7, interaction: 0.6, glow: 0.5 },
    normal: { particles: 1.0, interaction: 1.0, glow: 1.0 },
    intense: { particles: 1.4, interaction: 1.5, glow: 1.8 }
  };

  const getResponsiveSize = useCallback(() => {
    const config = sizeConfig[size];
    if (window.innerWidth >= 1280) return { width: config.xl, height: config.xl };
    if (window.innerWidth >= 1024) return { width: config.lg, height: config.lg };
    if (window.innerWidth >= 768) return { width: config.md, height: config.md };
    return { width: config.base, height: config.base };
  }, [size]);

  // Enhanced particle texture with better falloff
  const createParticleTexture = useCallback(() => {
    const canvas = document.createElement('canvas');
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext('2d');
    
    if (!ctx) return null;

    const centerX = 32;
    const centerY = 32;
    const radius = 32;

    // Create radial gradient with smoother falloff
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(0.2, 'rgba(255, 255, 255, 0.9)');
    gradient.addColorStop(0.4, 'rgba(255, 255, 255, 0.6)');
    gradient.addColorStop(0.7, 'rgba(255, 255, 255, 0.2)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 64, 64);
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return texture;
  }, []);

  const initializeOrb = useCallback((mount: HTMLDivElement) => {
    try {
      const { width: targetWidth, height: targetHeight } = getResponsiveSize();
      const config = intensityConfig[intensity];
      
      mount.style.width = `${targetWidth}px`;
      mount.style.height = `${targetHeight}px`;

      // Scene setup with enhanced settings
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(60, targetWidth / targetHeight, 0.1, 1000);
      camera.position.z = 3;

      const renderer = new THREE.WebGLRenderer({ 
        antialias: true, 
        alpha: true,
        powerPreference: 'high-performance'
      });
      renderer.setSize(targetWidth, targetHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setClearColor(0x000000, 0);
      mount.appendChild(renderer.domElement);

      // Enhanced, theme-aware color scheme
      const lightThemeColors = {
        primary: new THREE.Color(0xea580c),   // orange-600
        secondary: new THREE.Color(0xf97316),  // orange-500
        accent: new THREE.Color(0xc2410c),    // orange-700
        glow: new THREE.Color(0xfb923c)       // orange-400
      };

      const darkThemeColors = {
        primary: new THREE.Color(0xf97316),   // orange-500
        secondary: new THREE.Color(0xfb923c),  // orange-400
        accent: new THREE.Color(0xffa726),    // amber-400
        glow: new THREE.Color(0xfed7aa)       // orange-200
      };

      const brandColors = theme === Theme.DARK ? darkThemeColors : lightThemeColors;

      // Main particle system
      const particlesGeometry = new THREE.BufferGeometry();
      const adjustedParticleCount = Math.floor(particleCount * config.particles);
      const positions = new Float32Array(adjustedParticleCount * 3);
      const basePositions = new Float32Array(adjustedParticleCount * 3);
      const velocities = new Float32Array(adjustedParticleCount * 3);
      const colors = new Float32Array(adjustedParticleCount * 3);
      const sizes = new Float32Array(adjustedParticleCount);

      // Generate particles with improved distribution
      for (let i = 0; i < adjustedParticleCount; i++) {
        const i3 = i * 3;
        
        // Fibonacci sphere distribution for even spacing
        const y = 1 - (i / (adjustedParticleCount - 1)) * 2;
        const radiusAtY = Math.sqrt(1 - y * y);
        const theta = (i * 2.399963229728653) % (2 * Math.PI); // Golden angle
        
        const baseRadius = 0.8 + Math.random() * 0.4;
        const x = Math.cos(theta) * radiusAtY * baseRadius;
        const z = Math.sin(theta) * radiusAtY * baseRadius;
        
        positions[i3] = x;
        positions[i3 + 1] = y * baseRadius;
        positions[i3 + 2] = z;

        basePositions[i3] = x;
        basePositions[i3 + 1] = y * baseRadius;
        basePositions[i3 + 2] = z;
        
        velocities[i3] = 0;
        velocities[i3 + 1] = 0;
        velocities[i3 + 2] = 0;

        // Varied particle colors
        const colorVariation = Math.random();
        let particleColor;
        if (colorVariation < 0.6) {
          particleColor = brandColors.primary;
        } else if (colorVariation < 0.85) {
          particleColor = brandColors.secondary;
        } else {
          particleColor = brandColors.accent;
        }

        colors[i3] = particleColor.r;
        colors[i3 + 1] = particleColor.g;
        colors[i3 + 2] = particleColor.b;

        // Varied particle sizes
        sizes[i] = 0.8 + Math.random() * 0.4;
      }

      particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      particlesGeometry.setAttribute('basePosition', new THREE.BufferAttribute(basePositions, 3));
      particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));
      particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
      particlesGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

      const particleTexture = createParticleTexture();
      if (!particleTexture) throw new Error('Failed to create particle texture');

      const particleMaterial = new THREE.PointsMaterial({
        size: 0.08 * config.particles,
        map: particleTexture,
        vertexColors: true,
        transparent: true,
        alphaTest: 0.001,
        opacity: theme === Theme.DARK ? 0.9 : 0.8,
        sizeAttenuation: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });

      const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
      scene.add(particleSystem);

      const mouse = new THREE.Vector2(-1000, -1000); // Initialize off-screen

      const handlePointerMove = (clientX: number, clientY: number) => {
        const rect = mount.getBoundingClientRect();
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      };

      const handlePointerLeave = () => {
        mouse.x = -1000;
        mouse.y = -1000;
      };

      const onMouseMove = (e: MouseEvent) => handlePointerMove(e.clientX, e.clientY);
      const onTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
        }
      };

      mount.addEventListener('mousemove', onMouseMove);
      mount.addEventListener('touchmove', onTouchMove, { passive: true });
      mount.addEventListener('mouseleave', handlePointerLeave);
      mount.addEventListener('touchend', handlePointerLeave);

      // Resize handling
      const handleResize = () => {
        const { width: newWidth, height: newHeight } = getResponsiveSize();
        
        if (mountRef.current) {
          mountRef.current.style.width = `${newWidth}px`;
          mountRef.current.style.height = `${newHeight}px`;
        }

        camera.aspect = newWidth / newHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(newWidth, newHeight);
      };

      const resizeObserver = new ResizeObserver(handleResize);
      resizeObserver.observe(mount);

      threeObjectsRef.current = {
        scene,
        camera,
        renderer,
        particleSystem,
        mouse,
        cleanup: handlePointerLeave,
      };

      setIsInitialized(true);
    } catch (error) {
      console.error('Failed to initialize Interactive Orb:', error);
    }
  }, [theme, particleCount, intensity, getResponsiveSize, createParticleTexture]);

  // Enhanced animation loop
  const animate = useCallback(() => {
    const threeObjects = threeObjectsRef.current;
    if (!isVisible || !isInitialized || !threeObjects) {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      return;
    }

    const { scene, camera, renderer, particleSystem, mouse } = threeObjects;
    if (!scene || !camera || !renderer || !particleSystem || !mouse) {
      animationFrameIdRef.current = requestAnimationFrame(animate);
      return;
    }

    const time = Date.now() * 0.00005;
    const config = intensityConfig[intensity];
    
    // Main particle system animation
    const positions = particleSystem.geometry.attributes.position.array as Float32Array;
    const basePositions = particleSystem.geometry.attributes.basePosition.array as Float32Array;
    const velocities = particleSystem.geometry.attributes.velocity.array as Float32Array;
    
    const repulsionStrength = 0.25 * config.interaction;
    const repulsionRadius = 0.8;
    const returnFactor = 0.06;
    const dampingFactor = 0.88;
    const globalPulse = 1 + Math.sin(time * 0.8) * 0.05;

    // Mouse world position
    const mouseWorldPos = new THREE.Vector3();
    if (mouse.x > -999 && mouse.y > -999) {
      const mouseVector = new THREE.Vector3(mouse.x, mouse.y, 0.5);
      mouseVector.unproject(camera);
      const direction = mouseVector.sub(camera.position).normalize();
      const distance = -camera.position.z / direction.z;
      mouseWorldPos.copy(camera.position).add(direction.multiplyScalar(distance));
      mouseWorldPos.multiplyScalar(0.7);
    }

    // Update particles
    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      const particlePos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      
      // Mouse interaction
      if (mouse.x > -999 && mouse.y > -999) {
        const distToMouse = particlePos.distanceTo(mouseWorldPos);
        if (distToMouse < repulsionRadius) {
          const repelForce = repulsionStrength / Math.max(distToMouse * distToMouse, 0.01);
          const repelVec = particlePos.clone()
            .sub(mouseWorldPos)
            .normalize()
            .multiplyScalar(repelForce);
          
          velocities[i3] += repelVec.x;
          velocities[i3 + 1] += repelVec.y;
          velocities[i3 + 2] += repelVec.z;
        }
      }

      // Apply velocity and damping
      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      
      velocities[i3] *= dampingFactor;
      velocities[i3 + 1] *= dampingFactor;
      velocities[i3 + 2] *= dampingFactor;

      // Return to base with pulse
      const targetPos = new THREE.Vector3(
        basePositions[i3] * globalPulse,
        basePositions[i3 + 1] * globalPulse,
        basePositions[i3 + 2] * globalPulse
      );
      
      const returnForce = targetPos.sub(particlePos).multiplyScalar(returnFactor);
      velocities[i3] += returnForce.x;
      velocities[i3 + 1] += returnForce.y;
      velocities[i3 + 2] += returnForce.z;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    
    // Smooth rotation
    particleSystem.rotation.y = time * 0.02;
    particleSystem.rotation.x = Math.sin(time * 0.3) * 0.05;

    renderer.render(scene, camera);
    animationFrameIdRef.current = requestAnimationFrame(animate);
  }, [isVisible, isInitialized, intensity]);

  // Initialize on mount
  useEffect(() => {
    const currentMount = mountRef.current;
    if (currentMount && typeof THREE !== 'undefined') {
      currentMount.innerHTML = '';
      initializeOrb(currentMount);
    }

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
      
      const threeObjects = threeObjectsRef.current;
      if (threeObjects) {
        threeObjects.cleanup?.();
        
        if (threeObjects.renderer) {
          threeObjects.renderer.dispose();
        }
        if (threeObjects.scene) {
          // You might want to traverse and dispose geometries/materials here
        }
        if (threeObjects.particleSystem) {
          threeObjects.particleSystem.geometry.dispose();
          (threeObjects.particleSystem.material as THREE.Material).dispose();
        }
      }

      threeObjectsRef.current = null;
      setIsInitialized(false);
    };
  }, [isInitialized, isVisible, intensity]);

  // Start animation
  useEffect(() => {
    if (isInitialized) {
      animate();
    }
  }, [isInitialized, animate]);

  const containerSize = getResponsiveSize();

  return (
    <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
      {/* Orb Container */}
      <div 
        className={`relative transition-all duration-500 ${
          theme === Theme.DARK 
            ? 'drop-shadow-2xl' 
            : 'drop-shadow-lg'
        }`}
        style={{ 
          filter: theme === Theme.DARK 
            ? 'drop-shadow(0 0 40px rgba(249, 115, 22, 0.3))' 
            : 'drop-shadow(0 0 25px rgba(234, 88, 12, 0.25))'
        }}
      >
        <div
          ref={mountRef}
          className="relative rounded-full overflow-hidden"
          style={{ 
            minHeight: containerSize.height,
            minWidth: containerSize.width,
            background: theme === Theme.DARK 
              ? 'radial-gradient(circle, rgba(249, 115, 22, 0.05) 0%, transparent 70%)'
              : 'radial-gradient(circle, rgba(249, 115, 22, 0.03) 0%, transparent 70%)'
          }}
        />
        
        {/* Ambient glow overlay */}
        <div 
          className={`absolute inset-0 rounded-full pointer-events-none transition-opacity duration-500 ${
            theme === Theme.DARK ? 'opacity-40' : 'opacity-20'
          }`}
          style={{
            background: 'radial-gradient(circle, rgba(249, 115, 22, 0.1) 0%, rgba(249, 115, 22, 0.05) 30%, transparent 60%)',
            filter: 'blur(20px)',
            transform: 'scale(1.2)'
          }}
        />
      </div>
    </div>
  );
};

export const InteractiveOrbDemo: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(Theme.DARK);

  const toggleTheme = () => {
    setTheme(current => (current === Theme.DARK ? Theme.LIGHT : Theme.DARK));
  };

  return (
    <div 
      className={`relative flex h-screen w-full flex-col items-center justify-center overflow-hidden rounded-lg
        ${theme === Theme.DARK ? 'bg-black' : 'bg-white'}`}
    >
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-md font-semibold transition-colors
            ${theme === Theme.DARK
              ? 'bg-white/10 text-white hover:bg-white/20'
              : 'bg-black/10 text-black hover:bg-black/20'
            }`}
        >
          Toggle Theme
        </button>
      </div>
      
      <InteractiveOrb theme={theme} size="xl" />

    </div>
  );
};

export default InteractiveOrb;