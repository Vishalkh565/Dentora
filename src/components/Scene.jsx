import { useLayoutEffect, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Icosahedron, Cylinder, Box, MeshTransmissionMaterial, Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Scene() {
  const toothRef = useRef();
  const toothMaterialRef = useRef();
  const particleSystemRef = useRef();
  
  const implantRef = useRef();
  const orthoRef = useRef();
  
  // Random particles for Section 01
  const particlesCount = 200;
  const positions = new Float32Array(particlesCount * 3);
  for(let i = 0; i < particlesCount * 3; i++) {
    positions[i] = (Math.random() - 0.5) * 5;
  }

  useLayoutEffect(() => {
    let ctx = gsap.context(() => {
      
      // ---------- SECTION 01: Preventive (Zoom into tooth, particles scatter) ----------
      const tl01 = gsap.timeline({
        scrollTrigger: {
          trigger: '#section-01',
          start: 'top bottom',
          end: 'bottom bottom',
          scrub: 1,
        }
      });
      
      tl01.to(toothRef.current.position, { z: 4, x: -2, ease: "power1.inOut" }, 0)
          .to(particleSystemRef.current.position, { y: 2, ease: "power1.out" }, 0)
          .to(particleSystemRef.current.material, { opacity: 0, size: 0.2 }, 0);


      // ---------- SECTION 02: Cosmetic (Stained yellow to Brilliant white) ----------
      const tl02 = gsap.timeline({
        scrollTrigger: {
          trigger: '#section-02',
          start: 'top bottom',
          end: 'center center',
          scrub: 1,
        }
      });
      // Assuming initial color is yellowish, morph to white
      tl02.to(toothMaterialRef.current.color, { r: 1, g: 1, b: 1 }, 0)
          .to(toothRef.current.rotation, { y: Math.PI * 2, x: 0 }, 0)
          .to(toothRef.current.position, { x: 2, z: 2 }, 0);


      // ---------- SECTION 03: Implants (Tooth fades, Implant drills down) ----------
      const tl03 = gsap.timeline({
        scrollTrigger: {
          trigger: '#section-03',
          start: 'top bottom',
          end: 'center center',
          scrub: 1,
        }
      });
      tl03.to(toothRef.current.position, { y: 10 }, 0) // Fly away
          .to(implantRef.current.position, { y: 0 }, 0) // Implant comes down
          .to(implantRef.current.rotation, { y: Math.PI * 10 }, 0); // Drilling motion

    });

    return () => ctx.revert();
  }, []);

  useFrame((state, delta) => {
    if (toothRef.current) {
      toothRef.current.rotation.y += delta * 0.2;
      toothRef.current.position.y += Math.sin(state.clock.elapsedTime * 2) * 0.002;
    }
  });

  return (
    <>
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 10, 5]} intensity={2} color="#0D9488" />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#D4BE97" />

      {/* Abstract Glowing Tooth Representation */}
      <mesh ref={toothRef} position={[0, 0, 0]}>
        <Icosahedron args={[1.5, 3]}>
          <MeshTransmissionMaterial 
            ref={toothMaterialRef}
            backside
            samples={4}
            thickness={2}
            chromaticAberration={0.05}
            anisotropy={0.3}
            distortion={0.5}
            distortionScale={0.5}
            temporalDistortion={0.1}
            color="#FFFFDD" // Starts slightly off-white/yellow
            attenuationDistance={1}
            attenuationColor="#0D9488"
          />
        </Icosahedron>
      </mesh>

      {/* Particles for Plaque Dissolve (Sec 01) */}
      <points ref={particleSystemRef} position={[0, 0, 0]}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" count={particlesCount} array={positions} itemSize={3} />
        </bufferGeometry>
        <PointMaterial transparent opacity={0.8} size={0.05} color="#D4BE97" sizeAttenuation={true} depthWrite={false} />
      </points>

      {/* Implant Placeholder (Sec 03) */}
      <mesh ref={implantRef} position={[-2, 10, 0]}>
        <Cylinder args={[0.5, 0.4, 3, 16]}>
          <meshStandardMaterial color="#888888" metalness={0.9} roughness={0.2} wireframe />
        </Cylinder>
      </mesh>

    </>
  );
}
