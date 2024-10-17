import React, { useRef, useEffect, useState } from 'react';

const width = 800;
const height = 600;

class Cattle {
  constructor(x, y, color) {
    this.x = x;
    this.y = y;
    this.size = 8;
    this.color = color;
    this.grazingTime = 0;
    this.grazingDuration = Math.floor(Math.random() * 100) + 50;
  }

  move() {
    if (this.grazingTime < this.grazingDuration) {
      // Graze in a small area
      this.x += Math.random() * 2 - 1;
      this.y += Math.random() * 2 - 1;
      this.grazingTime++;
    } else {
      // Move to a new area
      this.x += Math.random() * 40 - 20;
      this.y += Math.random() * 40 - 20;
      this.grazingTime = 0;
      this.grazingDuration = Math.floor(Math.random() * 100) + 50;
    }
    this.x = Math.max(0, Math.min(this.x, width - 1));
    this.y = Math.max(0, Math.min(this.y, height - 1));
  }

  draw(ctx) {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Environment {
  constructor() {
    this.grid = Array(height).fill().map(() => 
      Array(width).fill().map(() => ({
        base: Math.random() * 0.1 + 0.8, // Light sandy base color
        moisture: 0, // Initial moisture level (dry)
        vegetation: Math.random() * 0.1 // Initial sparse vegetation
      }))
    );
  }

  update(cattle) {
    cattle.forEach(cow => {
      for (let dy = -5; dy <= 5; dy++) {
        for (let dx = -5; dx <= 5; dx++) {
          const x = Math.floor(cow.x + dx);
          const y = Math.floor(cow.y + dy);
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const distance = Math.sqrt(dx*dx + dy*dy);
            if (distance <= 5) {
              const cell = this.grid[y][x];
              // Increase moisture
              cell.moisture = Math.min(1, cell.moisture + 0.01 * (1 - distance/5));
              // Decrease vegetation (grazing effect)
              cell.vegetation = Math.max(0, cell.vegetation - 0.005 * (1 - distance/5));
              // Slowly regrow vegetation
              cell.vegetation = Math.min(1, cell.vegetation + 0.0005);
            }
          }
        }
      }
    });
  }

  draw(ctx) {
    const imageData = ctx.createImageData(width, height);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const cell = this.grid[y][x];
        const moisture = cell.base - cell.moisture * 0.5; // Darken based on moisture
        const r = Math.floor(moisture * 240 - cell.vegetation * 60); // Reddish, less green
        const g = Math.floor(moisture * 220 + cell.vegetation * 100); // Yellowish, more green
        const b = Math.floor(moisture * 180 - cell.vegetation * 50); // Blueish (sand), less green
        imageData.data[index] = Math.max(0, Math.min(255, r));
        imageData.data[index + 1] = Math.max(0, Math.min(255, g));
        imageData.data[index + 2] = Math.max(0, Math.min(255, b));
        imageData.data[index + 3] = 255; // Alpha
      }
    }
    ctx.putImageData(imageData, 0, 0);
  }
}

const DesertEcosystemSimulation = () => {
  const canvasRef = useRef(null);
  const [cattle] = useState([
    new Cattle(width * 0.2, height * 0.2, 'brown'),
    new Cattle(width * 0.4, height * 0.4, 'tan'),
    new Cattle(width * 0.6, height * 0.6, 'sienna'),
    new Cattle(width * 0.3, height * 0.7, 'saddlebrown'),
    new Cattle(width * 0.7, height * 0.3, 'peru')
  ]);
  const [environment] = useState(new Environment());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    const animate = () => {
      cattle.forEach(cow => cow.move());
      environment.update(cattle);

      environment.draw(ctx);
      cattle.forEach(cow => cow.draw(ctx));

      requestAnimationFrame(animate);
    };

    animate();
  }, [cattle, environment]);

  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h2 className="text-xl font-bold mb-4">Desert Ecosystem Restoration Simulation with Cattle Grazing</h2>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="border border-gray-300"
      />
      <p className="mt-4 text-sm text-gray-600">
        The colored circles represent cattle grazing in the desert ecosystem.
        Darker areas indicate increased soil moisture, while greener areas show vegetation growth.
        Notice how the cattle's movement patterns affect the distribution of moisture and vegetation.
      </p>
    </div>
  );
};

export default DesertEcosystemSimulation;
