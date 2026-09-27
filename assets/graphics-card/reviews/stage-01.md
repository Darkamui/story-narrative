# Stage 01 — Assembly architecture

Inspected: `stage-01-exploded-initial.png`, `stage-01-assembled-initial.png`, `stage-01-side-initial.png`, then corrected `stage-01-exploded.png`, `stage-01-assembled.png`, `stage-01-side.png`.

The exploded stack separates shell, rotor envelopes, three cooler banks, footprint-derived thermal interfaces, the short PCB, and the vented backplate. The bracket is a single separate assembly at negative X. The board ends before the flow-through slots. Side view exposes parallel layers and the cooling contact heights.

Initial defects: the timeline overwrote the requested assembled parameter at render time, leaving an exploded model cropped by the assembled camera. Excessive light energy washed out surface depth. The still-render function now detaches the saved motion action before evaluating the root property, and light energy was reduced. Corrected images show an assembled stack and readable clay shading.

Gate: PASS for architecture. Detailed blades, fins, surface population, rails, and hardware are deliberately absent at this checkpoint. Camera stays on +Z / −X / +Y as specified; no geometry mirroring. This projects the I/O end at screen right in the upright exploded composition.
