/* ==========================================================================
   GREENWAVE AI — VECTOR FLOW VISUALIZER
   Compressible Fluid Flow & Shockwave Dissipation Simulation Engine
   ========================================================================== */

'use strict';

class VectorFlowVisualizer {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    
    this.ctx = this.canvas.getContext('2d');
    this.particles = [];
    this.maxParticles = 90;
    this.connectionDistance = 90;
    this.focalLength = 300;
    
    this.shockwaveTimer = 0;
    this.shockwaveActive = false;
    this.dissipationActive = false;
    
    this.mouse = { x: null, y: null, radius: 100 };
    
    this.init();
    this.animate();
    
    window.addEventListener('resize', () => this.resize());
    window.addEventListener('mousemove', (e) => this.onMouseMove(e));
    window.addEventListener('mouseleave', () => this.onMouseLeave());
    
    // Scroll triggers a compression shockwave instantly
    window.addEventListener('scroll', () => {
      if (!this.shockwaveActive && !this.dissipationActive) {
        this.shockwaveActive = true;
        this.shockwaveTimer = 0;
        console.log('SYS:: Scroll vector interrupt. Simulating compression shockwave clumping...');
      }
    }, { passive: true });
  }

  init() {
    this.resize();
    this.particles = [];
    
    // East-West particles (horizontal conduit)
    for (let i = 0; i < this.maxParticles / 2; i++) {
      this.particles.push(this.createParticle('EW', true));
    }
    // North-South particles (vertical conduit)
    for (let i = 0; i < this.maxParticles / 2; i++) {
      this.particles.push(this.createParticle('NS', true));
    }
  }

  createParticle(direction, randomize = false) {
    const isEW = direction === 'EW';
    const x = randomize ? (Math.random() - 0.5) * this.width : -this.width / 2;
    const y = randomize ? (Math.random() - 0.5) * this.height : -this.height / 2;
    
    return {
      x: isEW ? x : (Math.random() - 0.5) * 80, // Avenue width conduit is 80px
      y: isEW ? (Math.random() - 0.5) * 80 : y,
      z: (Math.random() - 0.5) * 120, // depth layering
      direction: direction,
      speed: Math.random() * 0.7 + 0.9,
      size: Math.random() * 2 + 1.2,
      pulseOffset: Math.random() * Math.PI * 2
    };
  }

  resize() {
    this.width = this.canvas.parentElement.clientWidth;
    this.height = this.canvas.parentElement.clientHeight;
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.centerX = this.width / 2;
    this.centerY = this.height / 2;
  }

  onMouseMove(event) {
    const rect = this.canvas.getBoundingClientRect();
    this.mouse.x = event.clientX - rect.left;
    this.mouse.y = event.clientY - rect.top;
  }

  onMouseLeave() {
    this.mouse.x = null;
    this.mouse.y = null;
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    
    this.ctx.fillStyle = '#0B0C10';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    const time = Date.now() * 0.001;
    
    // Shockwave cycle timings
    this.shockwaveTimer++;
    
    if (!this.shockwaveActive && !this.dissipationActive) {
      if (this.shockwaveTimer > 450) { // ~7 seconds of smooth flow
        this.shockwaveActive = true;
        this.shockwaveTimer = 0;
        console.log('SYS:: Compression shockwave wave detection at center grid.');
      }
    } else if (this.shockwaveActive) {
      if (this.shockwaveTimer > 180) { // ~3 seconds bottleneck clump
        this.shockwaveActive = false;
        this.dissipationActive = true;
        this.shockwaveTimer = 0;
        console.log('SYS:: GreenWave override active. Dissipating compression shockwave...');
      }
    } else if (this.dissipationActive) {
      if (this.shockwaveTimer > 200) { // ~3 seconds speed clearance
        this.dissipationActive = false;
        this.shockwaveTimer = 0;
        console.log('SYS:: Grid stable. Returning to baseline fluid flow.');
      }
    }

    // Step 1: Move and project particles
    this.particles.forEach(p => {
      let currentSpeed = p.speed;
      let isRed = false;

      // Distance of particle from center (in grid pixels)
      const dx = p.x;
      const dy = p.y;
      const distFromCenter = Math.sqrt(dx * dx + dy * dy);

      if (this.shockwaveActive) {
        // Clumping bottleneck: particles traveling toward center slow down
        if (distFromCenter < 130) {
          const factor = Math.max(0.04, distFromCenter / 130);
          currentSpeed = p.speed * factor * 0.25;
          isRed = true;
        }
      } else if (this.dissipationActive) {
        // Dissipation: particles speed up to dissolve clump
        if (distFromCenter < 180) {
          currentSpeed = p.speed * 2.8;
        }
      }

      // Move along channels
      if (p.direction === 'EW') {
        p.x += currentSpeed;
        if (p.x > this.width / 2) {
          p.x = -this.width / 2;
          p.y = (Math.random() - 0.5) * 80;
        }
      } else {
        p.y += currentSpeed;
        if (p.y > this.height / 2) {
          p.y = -this.height / 2;
          p.x = (Math.random() - 0.5) * 80;
        }
      }

      // Calculate 3D projection (slight tilt for deep tech spec layout)
      const angleY = Math.sin(time * 0.04) * 0.15;
      const angleX = Math.cos(time * 0.04) * 0.08;

      let cosY = Math.cos(angleY);
      let sinY = Math.sin(angleY);
      let x1 = p.x * cosY - p.z * sinY;
      let z1 = p.z * cosY + p.x * sinY;
      
      let cosX = Math.cos(angleX);
      let sinX = Math.sin(angleX);
      let y2 = p.y * cosX - z1 * sinX;
      let z2 = z1 * cosX + p.y * sinX;

      const scale = this.focalLength / (this.focalLength + z2);
      p.projX = this.centerX + x1 * scale;
      p.projY = this.centerY + y2 * scale;
      p.projScale = scale;
      p.isRed = isRed;
    });

    // Step 2: Draw connecting lines
    for (let i = 0; i < this.particles.length; i++) {
      const pi = this.particles[i];
      for (let j = i + 1; j < this.particles.length; j++) {
        const pj = this.particles[j];
        
        const dx = pi.projX - pj.projX;
        const dy = pi.projY - pj.projY;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < this.connectionDistance) {
          const alpha = (1 - dist / this.connectionDistance) * 0.22;
          
          if (pi.isRed && pj.isRed) {
            // Draw red lines inside shockwave bottleneck clumping
            this.ctx.strokeStyle = `rgba(255, 59, 48, ${alpha * 1.6})`;
            this.ctx.lineWidth = 0.8 * pi.projScale;
          } else if (this.dissipationActive && (pi.projX - this.centerX) * (pi.projX - this.centerX) + (pi.projY - this.centerY) * (pi.projY - this.centerY) < 180 * 180) {
            // Bright neon green lines during dissipation
            this.ctx.strokeStyle = `rgba(0, 255, 102, ${alpha * 1.2})`;
            this.ctx.lineWidth = 0.6 * pi.projScale;
          } else {
            // Standard thin dim green lines for baseline flows
            this.ctx.strokeStyle = `rgba(26, 95, 72, ${alpha})`;
            this.ctx.lineWidth = 0.45 * pi.projScale;
          }
          
          this.ctx.beginPath();
          this.ctx.moveTo(pi.projX, pi.projY);
          this.ctx.lineTo(pj.projX, pj.projY);
          this.ctx.stroke();
        }
      }
    }

    // Step 3: Draw particle nodes
    this.particles.forEach(p => {
      const rad = p.size * p.projScale;
      const pulse = Math.sin(time * 3.5 + p.pulseOffset) * 0.3 + 0.7;
      
      if (p.isRed) {
        this.ctx.fillStyle = `rgba(255, 59, 48, ${pulse})`;
        this.ctx.shadowColor = '#FF3B30';
      } else if (this.dissipationActive) {
        this.ctx.fillStyle = `rgba(0, 255, 102, ${pulse})`;
        this.ctx.shadowColor = '#00FF66';
      } else {
        this.ctx.fillStyle = `rgba(0, 255, 102, ${pulse * 0.8})`;
        this.ctx.shadowColor = '#00FF66';
      }

      this.ctx.shadowBlur = 8 * p.projScale;
      
      this.ctx.beginPath();
      this.ctx.arc(p.projX, p.projY, rad, 0, Math.PI * 2);
      this.ctx.fill();
    });
    
    this.ctx.shadowBlur = 0; // Reset
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  new VectorFlowVisualizer('bg-canvas');
});
