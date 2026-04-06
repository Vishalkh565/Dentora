import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Scene';
import { FileDown, ShieldCheck, Sparkles, Syringe, Braces, Baby, Computer, ChevronDown } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

export default function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      direction: 'vertical',
      gestureDirection: 'vertical',
      smooth: true,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    return () => {
      lenis.destroy();
    };
  }, []);

  return (
    <div className="relative w-full bg-dentalDark text-white overflow-hidden font-sans">
      
      {/* 3D Context - Fixed to background */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 8], fov: 45 }}>
          <Scene />
        </Canvas>
      </div>

      {/* Overlay Scroll Content */}
      <div className="relative z-10 w-full">
        
        {/* SECTION 00 - HERO */}
        <section id="section-00" className="h-[100vh] w-full flex flex-col justify-center items-center relative">
          <div className="text-center z-10 mix-blend-difference pointer-events-none">
            <h1 className="text-5xl md:text-7xl font-editorial font-bold tracking-tight mb-6">
              Will it be <span className="italic text-gray-400">Pain</span>,<br/> or a <span className="text-dentalTeal font-normal">Perfect Smile</span>?
            </h1>
            <p className="text-xl md:text-2xl text-white/50 tracking-widest uppercase text-sm">
              At dentOra, we treat both.
            </p>
          </div>
          <div className="absolute bottom-12 flex flex-col items-center opacity-50 animate-bounce">
            <span className="text-xs tracking-[0.2em] mb-2 uppercase">Scroll to enter</span>
            <ChevronDown size={20} />
          </div>
        </section>

        {/* SECTION 01 - PREVENTIVE */}
        <section id="section-01" className="min-h-[120vh] w-full flex items-center justify-end px-10 md:px-32 relative border-t border-white/5">
          <div className="w-full md:w-1/2">
            <div className="flex items-center gap-4 mb-6">
              <ShieldCheck className="text-dentalTeal" size={32} />
              <h2 className="text-sm tracking-[0.3em] uppercase text-dentalTeal">Section 01</h2>
            </div>
            <h1 className="text-6xl font-editorial font-bold mb-8">Prevention<br/>First</h1>
            <p className="text-lg text-white/60 mb-12 max-w-md leading-relaxed">
              We intercept problems before they begin. Routine examinations and hygiene protocols to preserve natural tooth structure.
            </p>
            <ul className="space-y-6 border-l border-white/10 pl-6">
              <li className="flex items-start gap-4">
                <span className="text-dentalTeal font-bold">01</span>
                <div>
                  <h4 className="font-bold text-lg">Diagnostics & X-Rays</h4>
                  <p className="text-sm text-white/40 mt-1">High-res minimal radiation imaging.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <span className="text-dentalTeal font-bold">02</span>
                <div>
                  <h4 className="font-bold text-lg">Prophylactic Scaling</h4>
                  <p className="text-sm text-white/40 mt-1">Ultrasonic tartar removal.</p>
                </div>
              </li>
            </ul>
          </div>
        </section>

        {/* SECTION 02 - COSMETIC */}
        <section id="section-02" className="min-h-[120vh] w-full flex items-center justify-start px-10 md:px-32 relative border-t border-white/5 bg-gradient-to-b from-transparent to-[#080d19]">
          <div className="w-full md:w-1/2">
            <div className="flex items-center gap-4 mb-6">
              <Sparkles className="text-[#D4BE97]" size={32} />
              <h2 className="text-sm tracking-[0.3em] uppercase text-[#D4BE97]">Section 02</h2>
            </div>
            <h1 className="text-6xl font-editorial font-bold mb-8 text-[#D4BE97]">Your Smile.<br/>Redesigned.</h1>
            <p className="text-lg text-white/60 mb-12 max-w-md leading-relaxed">
              Precision aesthetics. Custom ceramic veneers, guided smile design, and powerful clinical whitening systems.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <h3 className="font-bold mb-2">Veneers</h3>
                <p className="text-sm text-white/50">Porcelain & Composite</p>
              </div>
              <div className="p-6 bg-white/5 border border-white/10 rounded-2xl backdrop-blur-md">
                <h3 className="font-bold mb-2">Whitening</h3>
                <p className="text-sm text-white/50">Laser accelerated</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 03 - IMPLANTS */}
        <section id="section-03" className="min-h-[120vh] w-full flex items-center justify-end px-10 md:px-32 relative border-t border-white/5 bg-dentalDark overflow-hidden">
          {/* Subtle blueprint grid overlay */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
          <div className="w-full md:w-1/2 relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <Syringe className="text-[#3b82f6]" size={32} />
              <h2 className="text-sm tracking-[0.3em] uppercase text-[#3b82f6]">Section 03</h2>
            </div>
            <h1 className="text-6xl font-editorial font-bold mb-8 text-white">Permanent.<br/>Precise. <span className="text-[#3b82f6]">Painless.</span></h1>
            <p className="text-lg text-white/60 mb-12 max-w-md leading-relaxed">
              Engineered for life. Surgical grade titanium osseointegration delivering unparalleled stability and function.
            </p>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between p-4 border border-[#3b82f6]/30 bg-[#3b82f6]/5 rounded-lg">
                <span className="font-mono text-sm text-[#3b82f6]">DIA: 4.0MM / LEN: 11.5MM</span>
                <span className="text-xs uppercase tracking-widest text-white/50">Titanium Grade V</span>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 04 - ORTHODONTICS */}
        <section id="section-04" className="min-h-[120vh] w-full flex items-center justify-start px-10 md:px-32 relative bg-white text-dentalDark">
          <div className="w-full md:w-1/2">
            <div className="flex items-center gap-4 mb-6">
              <Braces className="text-dentalDark" size={32} />
              <h2 className="text-sm tracking-[0.3em] uppercase font-bold">Section 04</h2>
            </div>
            <h1 className="text-6xl font-editorial font-bold mb-8">Straight Talk<br/>About Straight Teeth.</h1>
            <p className="text-lg text-dentalDark/70 mb-12 max-w-md leading-relaxed">
              Biomechanically optimized tooth movement. From traditional bracket systems to invisible aligner therapy.
            </p>
            <div className="flex items-center gap-6 mt-8">
              <div className="h-1 flex-1 bg-gray-200 rounded-full relative">
                <div className="absolute top-0 left-0 h-full w-2/3 bg-dentalTeal rounded-full"></div>
              </div>
              <span className="font-bold text-sm">Target Alignment: 6 Months</span>
            </div>
          </div>
        </section>

        {/* SECTION 05 - KIDS */}
        <section id="section-05" className="min-h-[120vh] w-full flex items-center justify-center text-center px-10 md:px-32 relative bg-[#FDF8F5] text-dentalDark">
          <div className="w-full max-w-2xl">
            <div className="flex justify-center mb-6">
              <div className="h-16 w-16 bg-[#FFEBE5] text-[#FF8A65] rounded-full flex items-center justify-center">
                <Baby size={32} />
              </div>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-8 text-[#FF8A65]" style={{ fontFamily: '"Inter", sans-serif', letterSpacing: '-1px' }}>Little Teeth.<br/>Big Smiles.</h1>
            <p className="text-xl text-[#3A322F]/70 mb-12 leading-relaxed">
              A playful, fear-free environment designed explicitly for children's dental health and habit formation.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <span className="px-6 py-2 bg-white rounded-full font-bold shadow-sm border border-gray-100">🧸 Fear-Free</span>
              <span className="px-6 py-2 bg-white rounded-full font-bold shadow-sm border border-gray-100">🦷 Preventative</span>
              <span className="px-6 py-2 bg-white rounded-full font-bold shadow-sm border border-gray-100">✨ Fluoride Boost</span>
            </div>
          </div>
        </section>

        {/* SECTION 06 - TECH */}
        <section id="section-06" className="min-h-[120vh] w-full flex items-center justify-end px-10 md:px-32 relative bg-gradient-to-b from-[#111827] to-dentalDark border-t border-white/10">
          <div className="w-full md:w-1/2">
            <div className="flex items-center gap-4 mb-6">
              <Computer className="text-dentalTeal" size={32} />
              <h2 className="text-sm tracking-[0.3em] uppercase text-dentalTeal">Section 06</h2>
            </div>
            <h1 className="text-6xl font-editorial font-bold mb-8 text-white">Clinic-Grade<br/>Technology.<br/><span className="text-gray-500">Zero Compromise.</span></h1>
            
            <div className="mt-12 space-y-8">
              <div className="group border-l-2 border-white/20 pl-6 hover:border-dentalTeal transition-colors">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-dentalTeal transition-colors">CBCT 3D Scanning</h3>
                <p className="text-white/50 text-sm">Micron-level diagnostic imaging.</p>
              </div>
              <div className="group border-l-2 border-white/20 pl-6 hover:border-dentalTeal transition-colors">
                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-dentalTeal transition-colors">CAD/CAM Milling</h3>
                <p className="text-white/50 text-sm">Same-day ceramic crown fabrication.</p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 07 - CLOSING */}
        <section id="section-07" className="min-h-[100vh] w-full flex flex-col justify-center items-center text-center relative border-t border-white/10 bg-black">
          <h1 className="text-4xl md:text-6xl font-editorial font-bold mb-4 z-10 text-white">dentOra</h1>
          <p className="text-xl tracking-[0.2em] uppercase text-white/50 mb-12 z-10">A Multispeciality Dental Clinic</p>
          <div className="flex gap-6 z-10">
            <button className="px-8 py-4 bg-dentalTeal text-white font-bold rounded-full hover:bg-teal-500 transition-colors">Book Appointment</button>
            <button className="px-8 py-4 bg-white/10 text-white font-bold rounded-full hover:bg-white/20 transition-colors backdrop-blur-md">Explore Services</button>
          </div>
        </section>

      </div>
    </div>
  );
}
