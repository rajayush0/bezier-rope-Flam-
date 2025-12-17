// Math & Physics Classes

class Vector {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }

    add(v) { return new Vector(this.x + v.x, this.y + v.y); }
    sub(v) { return new Vector(this.x - v.x, this.y - v.y); }
    mult(s) { return new Vector(this.x * s, this.y * s); }
    mag() { return Math.sqrt(this.x * this.x + this.y * this.y); }

    normalize() {
        const m = this.mag();
        return m === 0 ? new Vector(0, 0) : new Vector(this.x / m, this.y / m);
    }

    dist(v) { return this.sub(v).mag(); }
}

class PhysicsPoint {
    constructor(x, y, isFixed = false) {
        this.pos = new Vector(x, y);
        this.vel = new Vector(0, 0);
        this.target = new Vector(x, y); // The "resting" position or target
        this.isFixed = isFixed;

        // Spring constants
        this.k = 0.1;       // Spring stiffness
        this.damping = 0.85; // Velocity damping
        this.mass = 1.0;
    }

    update() {
        if (this.isFixed) return;

        // F = -k * (pos - target)
        const force = this.target.sub(this.pos).mult(this.k);

        // a = F / m
        const accel = force.mult(1 / this.mass);

        // v += a
        this.vel = this.vel.add(accel);

        // Apply damping
        this.vel = this.vel.mult(this.damping);

        // p += v
        this.pos = this.pos.add(this.vel);
    }
}

//Bézier Math

function cubicBezier(t, p0, p1, p2, p3) {
    // B(t) = (1-t)^3*P0 + 3(1-t)^2*t*P1 + 3(1-t)t^2*P2 + t^3*P3
    const u = 1 - t;
    const tt = t * t;
    const uu = u * u;
    const uuu = uu * u;
    const ttt = tt * t;

    const term0 = p0.mult(uuu);
    const term1 = p1.mult(3 * uu * t);
    const term2 = p2.mult(3 * u * tt);
    const term3 = p3.mult(ttt);

    return term0.add(term1).add(term2).add(term3);
}

function cubicBezierDerivative(t, p0, p1, p2, p3) {
    // B'(t) = 3(1-t)^2(P1-P0) + 6(1-t)t(P2-P1) + 3t^2(P3-P2)
    const u = 1 - t;
    const uu = u * u;
    const tt = t * t;

    const d0 = p1.sub(p0).mult(3 * uu);
    const d1 = p2.sub(p1).mult(6 * u * t);
    const d2 = p3.sub(p2).mult(3 * tt);

    return d0.add(d1).add(d2);
}

//Main Application

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let width, height;
let points = [];
let mouse = new Vector(0, 0);
let isDragging = false;
let draggedPointIndex = -1;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Reset points on resize if not initialized or just to center them
    if (points.length === 0) {
        initPoints();
    } else {
        // Re-center endpoints
        points[0].pos = new Vector(width * 0.1, height * 0.5);
        points[0].target = new Vector(width * 0.1, height * 0.5);

        points[3].pos = new Vector(width * 0.9, height * 0.5);
        points[3].target = new Vector(width * 0.9, height * 0.5);

        // Update targets for middle points relative to screen
        points[1].target = new Vector(width * 0.35, height * 0.5);
        points[2].target = new Vector(width * 0.65, height * 0.5);
    }
}

function initPoints() {
    // P0 (Fixed Left)
    points[0] = new PhysicsPoint(width * 0.1, height * 0.5, true);

    // P1 (Dynamic)
    points[1] = new PhysicsPoint(width * 0.35, height * 0.5, false);

    // P2 (Dynamic)
    points[2] = new PhysicsPoint(width * 0.65, height * 0.5, false);

    // P3 (Fixed Right)
    points[3] = new PhysicsPoint(width * 0.9, height * 0.5, true);
}

function update() {
    // Interaction Logic
    // If dragging, the dragged point's target is the mouse
    if (isDragging && draggedPointIndex !== -1) {
        points[draggedPointIndex].target = mouse;
        // Increase stiffness while dragging for responsiveness
        points[draggedPointIndex].k = 0.3;
    } else {
        // Reset stiffness and targets when not dragging
        // "Home" positions for P1 and P2
        const homeY = height * 0.5;
        const homeX1 = width * 0.35;
        const homeX2 = width * 0.65;

        points[1].target = new Vector(homeX1, homeY);
        points[2].target = new Vector(homeX2, homeY);

        points[1].k = 0.05;
        points[2].k = 0.05;

        // Mouse influence (repel or attract if close)
        // Let's make it playful: if mouse is close, push points away slightly
        // or pull them towards mouse to simulate "wind" or "magnetic" feel.
        // Let's go with a "magnetic" pull if close, but not dragging.

        [1, 2].forEach(i => {
            const d = points[i].pos.dist(mouse);
            if (d < 200) {
                const pull = mouse.sub(points[i].pos).normalize().mult(20 * (1 - d / 200));
                points[i].vel = points[i].vel.add(pull);
            }
        });
    }

    points.forEach(p => p.update());
}

function draw() {
    // Clear
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(0, 0, width, height);

    // Draw Grid (Optional, for aesthetics)
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 0; x < width; x += 50) { ctx.moveTo(x, 0); ctx.lineTo(x, height); }
    for (let y = 0; y < height; y += 50) { ctx.moveTo(0, y); ctx.lineTo(width, y); }
    ctx.stroke();

    // Draw Connecting Lines (Control Polygon) - faint
    ctx.strokeStyle = '#444';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(points[0].pos.x, points[0].pos.y);
    ctx.lineTo(points[1].pos.x, points[1].pos.y);
    ctx.lineTo(points[2].pos.x, points[2].pos.y);
    ctx.lineTo(points[3].pos.x, points[3].pos.y);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw Bézier Curve
    ctx.strokeStyle = '#00ffcc'; // Cyan/Neon
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();

    const steps = 100;
    const p0 = points[0].pos;
    const p1 = points[1].pos;
    const p2 = points[2].pos;
    const p3 = points[3].pos;

    ctx.moveTo(p0.x, p0.y);
    for (let i = 1; i <= steps; i++) {
        const t = i / steps;
        const pos = cubicBezier(t, p0, p1, p2, p3);
        ctx.lineTo(pos.x, pos.y);
    }
    ctx.stroke();

    // Draw Tangents
    ctx.strokeStyle = '#ff0066'; // Pink/Neon
    ctx.lineWidth = 2;
    const tangentSteps = [0.25, 0.5, 0.75];
    tangentSteps.forEach(t => {
        const pos = cubicBezier(t, p0, p1, p2, p3);
        const tan = cubicBezierDerivative(t, p0, p1, p2, p3).normalize();

        const len = 40;
        const start = pos.sub(tan.mult(len / 2));
        const end = pos.add(tan.mult(len / 2));

        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();

        // Draw arrow head (simple dot for now)
        ctx.fillStyle = '#ff0066';
        ctx.beginPath();
        ctx.arc(end.x, end.y, 3, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw Control Points
    points.forEach((p, i) => {
        ctx.fillStyle = i === 0 || i === 3 ? '#888' : '#fff';
        if (i === draggedPointIndex) ctx.fillStyle = '#ffff00';

        ctx.beginPath();
        ctx.arc(p.pos.x, p.pos.y, 8, 0, Math.PI * 2);
        ctx.fill();

        // Label
        ctx.fillStyle = '#aaa';
        ctx.font = '12px monospace';
        ctx.fillText(`P${i}`, p.pos.x + 12, p.pos.y - 12);
    });
}

function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
}

// Input Handling
window.addEventListener('resize', resize);

window.addEventListener('mousemove', (e) => {
    mouse = new Vector(e.clientX, e.clientY);
});

window.addEventListener('mousedown', (e) => {
    mouse = new Vector(e.clientX, e.clientY);
    isDragging = true;

    // Check if clicked near a point
    let minDist = 30; // Hit radius
    draggedPointIndex = -1;

    points.forEach((p, i) => {
        if (p.isFixed) return; // Can't drag fixed points
        const d = p.pos.dist(mouse);
        if (d < minDist) {
            minDist = d;
            draggedPointIndex = i;
        }
    });
});

window.addEventListener('mouseup', () => {
    isDragging = false;
    draggedPointIndex = -1;
});

// Init
resize();
loop();
