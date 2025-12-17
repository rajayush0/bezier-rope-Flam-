# Interactive Bézier Rope

A physics-based simulation of a cubic Bézier curve that behaves like a springy rope.

## Math & Physics

### Bézier Curve
The curve is generated using the explicit cubic Bézier formula:
$$ B(t) = (1-t)^3 P_0 + 3(1-t)^2 t P_1 + 3(1-t) t^2 P_2 + t^3 P_3 $$

### Tangents
Tangent vectors are calculated using the first derivative:
$$ B'(t) = 3(1-t)^2(P_1-P_0) + 6(1-t)t(P_2-P_1) + 3t^2(P_3-P_2) $$
These are normalized and drawn at intervals along the curve.

### Physics Model
Control points $P_1$ and $P_2$ are modeled as particles with mass attached to a "target" position via a spring.
- **Hooke's Law**: $F = -k(x - x_{target})$
- **Damping**: $v_{new} = v_{old} \times \text{damping}$

This creates a smooth, organic response when the points are disturbed by mouse interaction.

## Interaction
- **Mouse Move**: The cursor exerts a magnetic pull on the control points.
- **Drag**: Click and drag the inner control points ($P_1, P_2$) to pull the rope.
