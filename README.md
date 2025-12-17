# Interactive Bézier Curve with Physics
## live demo: 
https://bezir-curve.netlify.app/

## Overview
This project implements an interactive cubic Bézier curve that behaves like a springy rope. The curve responds in real time to mouse movement and is rendered using HTML Canvas.
## Bézier Curve Math
A cubic Bézier curve is defined using four control points P0, P1, P2, and P3.
B(t) = (1-t)^3 * P0 + 3 * (1-t)^2 * t * P1 + 3 * (1-t) * t^2 * P2 + t^3 * P3
The curve is rendered by sampling t from 0 to 1 in small increments (0.01).
## Tangent Computation
Tangents are computed using the analytical derivative of the cubic Bézier curve:
B'(t) = 3 * (1-t)^2 * (P1-P0) + 6 * (1-t) * t * (P2-P1) + 3 * t^2 * (P3-P2)
The tangent vectors are scaled and drawn at regular intervals along the curve.
## Physics Model
The control points P1 and P2 follow the mouse input using a spring-damping model:
acceleration = k * (target - position)
velocity = (velocity + acceleration) * damping
position = position + velocity
This creates smooth, natural, rope-like motion.
## Design Choices
- P0 and P3 are fixed endpoints.
- P1 and P2 are dynamically controlled by user input (magnetic pull or drag).
- All Bézier math and physics logic is implemented manually.
- Rendering is done using a custom animation loop (~60 FPS).
## Technologies Used
- HTML Canvas
- JavaScript (no external libraries)
## How to Run
1. Clone the repository.
2. Open `index.html` in a web browser.
3. Move the mouse to interact with the Bézier curve.
