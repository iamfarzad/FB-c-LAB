
import React, { useEffect, useRef, useCallback, useState } from 'react';
import { Theme } from '../../../types';
import * as THREE from 'three';
import { MessageSquare, ArrowRight } from 'lucide-react'; 
import { FlickeringGrid } from '../ui/FlickeringGrid';

interface HomePageHeroProps {
  theme: Theme;
  onToggleChat: (message?: string) => void; 
}

const createParticleTexture = () => {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  if (!context) return null;

  const gradient = context.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  gradient.addColorStop(0, 'rgba(255,255,255,1)');
  gradient.addColorStop(0.2, 'rgba(255,255,255,0.8)');
  gradient.addColorStop(0.4, 'rgba(255,255,255,0.3)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');

  context.fillStyle = gradient;
  context.fillRect(0, 0, canvas.width, canvas.height);

  return new THREE.CanvasTexture(canvas);
};

export const HomePageHero: React.FC<HomePageHeroProps> = ({ theme, onToggleChat }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const animationFrameIdRef = useRef<number | null>(null);
  const threeObjectsRef = useRef<any>({}); 
  const [isVisible, setIsVisible] = useState(false);

  // Intersection Observer for performance and animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const heroElement = document.getElementById('hero-home');
    if (heroElement) {
      observer.observe(heroElement);
    }

    return () => observer.disconnect();
  }, []);

  const initHeroOrbAnimation = useCallback((mount: HTMLDivElement, currentTheme: Theme) => {
    let targetWidth = 280;
    let targetHeight = 280;
    if (window.innerWidth >= 1024) { 
        targetWidth = 320;
        targetHeight = 320;
    } else if (window.innerWidth >= 768) { 
        targetWidth = 300;
        targetHeight = 300;
    } else if (window.innerWidth >= 640) { 
        targetWidth = 260;
        targetHeight = 260;
    }

    mount.style.width = `${targetWidth}px`;
    mount.style.height = `${targetHeight}px`;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, targetWidth / targetHeight, 0.1, 1000);
    camera.position.z = 2.2; 

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(targetWidth, targetHeight); 
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    mount.appendChild(renderer.domElement);

    const particleCount = 1200;
    const particlesGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const basePositions = new Float32Array(particleCount * 3);
    const velocities = new Float32Array(particleCount * 3);
    const colorsAttribute = new Float32Array(particleCount * 3);

    const particleColor = currentTheme === Theme.DARK ? new THREE.Color(0xf97316) : new THREE.Color(0xfb923c);

    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      const phi = Math.acos(-1 + (2 * i) / particleCount);
      const theta = Math.sqrt(particleCount * Math.PI) * phi;
      
      const radius = 0.9 + Math.random() * 0.4; 
      positions[i3] = Math.cos(theta) * Math.sin(phi) * radius;
      positions[i3 + 1] = Math.sin(theta) * Math.sin(phi) * radius;
      positions[i3 + 2] = Math.cos(phi) * radius;

      basePositions[i3] = positions[i3];
      basePositions[i3 + 1] = positions[i3 + 1];
      basePositions[i3 + 2] = positions[i3 + 2];
      
      velocities[i3] = 0;
      velocities[i3 + 1] = 0;
      velocities[i3 + 2] = 0;

      colorsAttribute[i3] = particleColor.r;
      colorsAttribute[i3 + 1] = particleColor.g;
      colorsAttribute[i3 + 2] = particleColor.b;
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particlesGeometry.setAttribute('color', new THREE.BufferAttribute(colorsAttribute, 3));
    particlesGeometry.setAttribute('basePosition', new THREE.BufferAttribute(basePositions, 3));
    particlesGeometry.setAttribute('velocity', new THREE.BufferAttribute(velocities, 3));

    const particleTexture = createParticleTexture();

    const particleMaterial = new THREE.PointsMaterial({
      size: 0.05, 
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      alphaTest: 0.1, 
      opacity: 0.85,
      sizeAttenuation: true,
    });

    const particleSystem = new THREE.Points(particlesGeometry, particleMaterial);
    scene.add(particleSystem);

    threeObjectsRef.current = { scene, camera, renderer, particleSystem, particleColor, particleTexture };

    const onResize = () => {
      let newTargetWidth = 280;
      let newTargetHeight = 280;
      if (window.innerWidth >= 1024) {
          newTargetWidth = 320;
          newTargetHeight = 320;
      } else if (window.innerWidth >= 768) {
          newTargetWidth = 300;
          newTargetHeight = 300;
      } else if (window.innerWidth >= 640) {
          newTargetWidth = 260;
          newTargetHeight = 260;
      }

      if (mountRef.current) {
          mountRef.current.style.width = `${newTargetWidth}px`;
          mountRef.current.style.height = `${newTargetHeight}px`;
      }

      camera.aspect = newTargetWidth / newTargetHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newTargetWidth, newTargetHeight);
    };
    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(mount);

    const mouse = new THREE.Vector2(-1000, -1000);
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

    threeObjectsRef.current.mouse = mouse;
    threeObjectsRef.current.removeEventListeners = () => {
      resizeObserver.disconnect();
      mount.removeEventListener('mousemove', onMouseMove);
      mount.removeEventListener('touchmove', onTouchMove);
      mount.removeEventListener('mouseleave', onMouseLeave);
      mount.removeEventListener('touchend', onMouseLeave);
      particleTexture?.dispose();
    };
  }, []); 

  const animateHeroOrb = useCallback(() => {
    if (!isVisible) {
      animationFrameIdRef.current = requestAnimationFrame(animateHeroOrb);
      return;
    }

    animationFrameIdRef.current = requestAnimationFrame(animateHeroOrb);
    const { scene, camera, renderer, particleSystem, mouse, particleColor } = threeObjectsRef.current;
    if (!scene || !camera || !renderer || !particleSystem || !mouse || !particleColor) return;

    const time = Date.now() * 0.0008;
    const positions = particleSystem.geometry.attributes.position.array as Float32Array;
    const basePositions = particleSystem.geometry.attributes.basePosition.array as Float32Array;
    const velocities = particleSystem.geometry.attributes.velocity.array as Float32Array;
    const colors = particleSystem.geometry.attributes.color.array as Float32Array;
    
    const repulsionStrength = 0.12; 
    const repulsionRadius = 0.5;   
    const returnFactor = 0.06;    
    const dampingFactor = 0.88;   
    const generalPulseStrength = 0.08 + Math.sin(time * 1.2) * 0.04;

    const mouseWorldPos = new THREE.Vector3();
    if(mouse.x > -999 && mouse.y > -999) { 
        const mouse3D = new THREE.Vector3(mouse.x, mouse.y, 0.5); 
        mouse3D.unproject(camera);
        const direction = mouse3D.sub(camera.position).normalize();
        const distance = -camera.position.z / direction.z; 
        mouseWorldPos.copy(camera.position).add(direction.multiplyScalar(distance));
    }

    for (let i = 0; i < positions.length / 3; i++) {
      const i3 = i * 3;
      
      const particlePos = new THREE.Vector3(positions[i3], positions[i3 + 1], positions[i3 + 2]);
      
      if (mouse.x > -999 && mouse.y > -999) { 
        const distToMouse = particlePos.distanceTo(mouseWorldPos);
        if (distToMouse < repulsionRadius) {
            const repelVec = particlePos.clone().sub(mouseWorldPos).normalize().multiplyScalar(repulsionStrength / (distToMouse + 0.01));
            velocities[i3] += repelVec.x;
            velocities[i3 + 1] += repelVec.y;
            velocities[i3 + 2] += repelVec.z;
        }
      }

      positions[i3] += velocities[i3];
      positions[i3 + 1] += velocities[i3 + 1];
      positions[i3 + 2] += velocities[i3 + 2];
      
      velocities[i3] *= dampingFactor;
      velocities[i3 + 1] *= dampingFactor;
      velocities[i3 + 2] *= dampingFactor;

      const basePos = new THREE.Vector3(
        basePositions[i3] * (1 + generalPulseStrength), 
        basePositions[i3+1] * (1 + generalPulseStrength), 
        basePositions[i3+2] * (1 + generalPulseStrength)
      );
      const currentPos = new THREE.Vector3(positions[i3], positions[i3+1], positions[i3+2]);
      const returnForce = basePos.sub(currentPos).multiplyScalar(returnFactor);
      
      velocities[i3] += returnForce.x;
      velocities[i3 + 1] += returnForce.y;
      velocities[i3 + 2] += returnForce.z;

      colors[i3] = particleColor.r;
      colors[i3 + 1] = particleColor.g;
      colors[i3 + 2] = particleColor.b;
    }

    particleSystem.geometry.attributes.position.needsUpdate = true;
    particleSystem.geometry.attributes.color.needsUpdate = true; 
    particleSystem.rotation.y = time * 0.03; 
    particleSystem.rotation.x = Math.sin(time * 0.5) * 0.1;

    renderer.render(scene, camera);
  }, [isVisible]);

  useEffect(() => {
    const currentMount = mountRef.current;
    if (currentMount && typeof THREE !== 'undefined') {
      initHeroOrbAnimation(currentMount, theme);
      animateHeroOrb();

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
      };
    }
  }, [initHeroOrbAnimation, animateHeroOrb, theme]); 

  useEffect(() => { 
    if (threeObjectsRef.current.particleSystem && threeObjectsRef.current.particleSystem.geometry) {
        const newParticleColor = theme === Theme.DARK 
          ? new THREE.Color(0xf97316)
          : new THREE.Color(0xfb923c);
        
        threeObjectsRef.current.particleColor = newParticleColor;
        
        const colorsAttribute = threeObjectsRef.current.particleSystem.geometry.attributes.color;
        for (let i = 0; i < colorsAttribute.count; i++) {
            colorsAttribute.setXYZ(i, newParticleColor.r, newParticleColor.g, newParticleColor.b);
        }
        colorsAttribute.needsUpdate = true;
    }
  }, [theme]);

  // Simplified, professional action prompts
  const actionPrompts = [
    { text: "Services", prompt: "Tell me about your AI consulting services." },
    { text: "Workshops", prompt: "What AI workshops do you offer?" },
    { text: "Consulting", prompt: "I'd like to discuss custom AI development." },
    { text: "Book Call", prompt: "I'd like to book a consultation." },
  ];

  return (
    <section 
      id="hero-home" 
      className={`relative min-h-screen flex items-center justify-center text-center transition-all duration-700 overflow-hidden
        ${theme === Theme.DARK ? 'bg-black' : 'bg-white'}`}
    >
      {/* Keep the sophisticated FlickeringGrid background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0">
          <FlickeringGrid
            className="absolute inset-0 z-0"
            squareSize={3}
            gridGap={8}
            maxOpacity={0.15}
            flickerChance={0.015}
            width={1920}
            height={1080}
            theme={theme === Theme.DARK ? 'dark' : 'light'}
            blur={0.8}
          />
          <div 
            className="absolute inset-0 z-10"
            style={{
              background: `radial-gradient(ellipse 70% 50% at center, transparent 0%, ${theme === Theme.DARK ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.1)'} 40%, ${theme === Theme.DARK ? 'rgba(0,0,0,0.3)' : 'rgba(255,255,255,0.3)'} 70%)`
            }}
          />
        </div>
      </div>

      <div className="container mx-auto px-6 relative z-30 max-w-6xl">
        {/* Clean, professional typography */}
        <div className="space-y-12 mb-16">
          <div className="space-y-8">
            <h1 className={`text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-light leading-tight tracking-tight
              ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}
              ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}
              style={{ animationDelay: '0.2s' }}
            >
              <span className="block font-medium">AI Automation</span>
              <span className="block text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-light mt-4 opacity-60">
                Without the Hype
              </span>
            </h1>
          </div>
          
          <p className={`text-lg sm:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed font-light
            ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'}
            ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
            style={{ animationDelay: '0.4s' }}
          >
            I'm <span className="font-medium text-orange-500">Farzad Bayat</span>—a self-taught AI consultant who spent{' '}
            <span className="font-medium">10,000+ hours</span> figuring out what works so your business doesn't have to.
          </p>
        </div>

        {/* Keep the orb - it's sophisticated */}
        <div className={`flex justify-center mb-16 ${isVisible ? 'animate-fade-in-scale' : 'opacity-0 scale-95'}`}
             style={{ animationDelay: '0.6s' }}>
          <div 
            id="hero-orb-canvas-container" 
            ref={mountRef} 
            className="relative group cursor-pointer transition-transform duration-500 hover:scale-105"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-orange-500/20 to-orange-400/20 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </div>
        </div>

        {/* Simplified interaction area */}
        <div className={`space-y-12 ${isVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'}`}
             style={{ animationDelay: '0.8s' }}>
          
          {/* Clean main prompt */}
          <div 
            onClick={() => onToggleChat("Start a conversation")}
            className={`group relative w-full max-w-2xl mx-auto p-6 border-2 transition-all duration-300 cursor-pointer
              ${theme === Theme.DARK 
                ? 'border-white/20 hover:border-white/40 bg-black/20 hover:bg-black/40' 
                : 'border-black/20 hover:border-black/40 bg-white/20 hover:bg-white/40'}
              hover:scale-[1.02] backdrop-blur-xl`}
            role="button"
            tabIndex={0}
            aria-label="Open AI Assistant"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`p-3 rounded-full border ${
                  theme === Theme.DARK ? 'border-white/20' : 'border-black/20'
                }`}>
                  <MessageSquare size={20} className="text-orange-500" />
                </div>
                <div className="text-left">
                  <p className={`font-medium text-lg ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}>
                    Start a conversation
                  </p>
                  <p className={`text-sm ${theme === Theme.DARK ? 'text-gray-400' : 'text-gray-600'}`}>
                    Ask about AI, services, or tap an action below
                  </p>
                </div>
              </div>
              <ArrowRight size={20} className={`text-orange-500 opacity-0 group-hover:opacity-100 
                transform translate-x-2 group-hover:translate-x-0 transition-all duration-300`} />
            </div>
          </div>

          {/* Clean action buttons */}
          <div className="flex flex-wrap justify-center items-center gap-4 max-w-4xl mx-auto">
            {actionPrompts.map((btn, index) => (
              <button
                key={btn.text}
                onClick={() => onToggleChat(btn.prompt || '')}
                className={`py-3 px-6 border font-medium text-sm transition-all duration-200 hover:scale-105
                  ${theme === Theme.DARK 
                    ? 'border-white/20 text-gray-300 hover:border-white/40 hover:text-white' 
                    : 'border-black/20 text-gray-700 hover:border-black/40 hover:text-black'
                  }`}
                style={{ 
                  animationDelay: `${1 + index * 0.1}s`
                }}
              >
                {btn.text}
              </button>
            ))}
          </div>
        </div>

        {/* Minimal scroll indicator */}
        <div className={`absolute left-1/2 transform -translate-x-1/2 bottom-8
          ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}
             style={{ animationDelay: '1.5s' }}>
          <div className={`flex flex-col items-center space-y-2 opacity-40 hover:opacity-100 transition-opacity
            ${theme === Theme.DARK ? 'text-white' : 'text-black'}`}>
            <span className="text-xs font-medium tracking-wider uppercase">Explore</span>
            <div className="w-px h-8 bg-current animate-pulse" />
          </div>
        </div>
      </div>

      {/* ... existing styles ... */}
      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes fade-in-scale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }
        
        .animate-fade-in-scale {
          animation: fade-in-scale 1s ease-out forwards;
        }
      `}</style>
    </section>
  );
};
