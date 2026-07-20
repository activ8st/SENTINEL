import React, { useEffect, useRef } from 'react';

export default function Canvas3DBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    let particles = [];
    const rows = 40;
    const cols = 40;
    const spacing = 45;

    // Camera / View setup
    let angleX = 65 * (Math.PI / 180);
    let angleZ = 0;
    let time = 0;

    // Mouse interaction
    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetAngleZ = 0;

    const onMouseMove = (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      targetAngleZ = ((mouseX / width) - 0.5) * 0.5;
    };

    window.addEventListener('mousemove', onMouseMove);
    
    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        particles.push({
          x: (j - cols / 2) * spacing,
          y: (i - rows / 2) * spacing,
          z: 0,
          baseZ: 0
        });
      }
    }

    let animationFrameId;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      time += 0.015;
      angleZ += (targetAngleZ - angleZ) * 0.05;

      const cosX = Math.cos(angleX);
      const sinX = Math.sin(angleX);
      const cosZ = Math.cos(angleZ + time * 0.2);
      const sinZ = Math.sin(angleZ + time * 0.2);

      const fov = 400;
      const viewerDistance = 800;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Complex wave math for organic "DNA/Radar" feel
        const dist = Math.sqrt(p.x * p.x + p.y * p.y);
        p.z = Math.sin(dist * 0.01 - time * 2) * 50 + Math.cos(p.x * 0.02 + time) * 30;

        // Rotate Z
        let rzX = p.x * cosZ - p.y * sinZ;
        let rzY = p.x * sinZ + p.y * cosZ;

        // Rotate X
        let rxY = rzY * cosX - p.z * sinX;
        let rxZ = rzY * sinX + p.z * cosX;

        // Project
        let z = rxZ + viewerDistance;
        if (z <= 0) continue;

        let scale = fov / z;
        let px = rzX * scale + width / 2;
        let py = rxY * scale + height / 2 + 100; // Offset down

        // Draw particle
        const size = Math.max(0.5, 2.5 * scale);
        const opacity = Math.min(1, Math.max(0, 1 - (z - viewerDistance + 300) / 800));

        if (opacity > 0) {
          ctx.beginPath();
          ctx.arc(px, py, size, 0, Math.PI * 2);
          // Ice Cyan color to match the gradient
          ctx.fillStyle = `rgba(181, 220, 233, ${opacity * 0.8})`;
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#010314]">
      {/* Deep gradient background */}
      <div 
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(180deg, #010314 0%, #0B2E59 60%, #B5DCE9 150%)',
        }}
      />
      
      {/* SVG Noise filter for "grainy" premium feel */}
      <div 
        className="absolute inset-0 opacity-[0.15] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block opacity-80"
      />
      
      {/* Top and bottom vignettes to blend into the UI */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#010314] via-transparent to-transparent opacity-80 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#010314] via-transparent to-transparent opacity-60 pointer-events-none" />
    </div>
  );
}
