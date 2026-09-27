# Stage 04 — Exploded detail audit

Inspected all initial Stage 04 PNGs: `stage-04-exploded-initial.png`, `stage-04-assembled-initial.png`, `stage-04-side-initial.png`, `stage-04-PCB_macro-initial.png`, `stage-04-PCB_back-initial.png`, `stage-04-Cooler_under-initial.png`, `stage-04-Hardware-initial.png`. Corrected evidence inspected: `stage-04-PCB_back.png`, `stage-04-Hardware.png`, `stage-04-exploded.png`, `stage-04-assembled.png`.

The clay macro exposes modeled memory packages, package capacitors, die layers, contacts, annular rings and small component bodies. The cooling underside shows all six pipes and the contact network. The full stack exposes every major assembly. GPU, memory, regulators and soldered sockets stay attached to the stationary board. Cooler constituents share one parent.

Defects corrected: rear PCB initially had only a central capacitor field; added regulator-side components, memory vias, perimeter routes and test points. Hardware camera missed withdrawn screws; reframed it and moved to an earlier explosion value, showing top and bottom fasteners along their mounting axes. Numerical audit found raised decorative seams and markings extended the body thickness by 0.36 mm. Recessed seams and screw inserts; reduced marking offsets to 1 micrometre.

Gate: PASS. Updated body measures 320.0000 × 132.0000 × 62.0020 mm including surface markings, within the documented 0.01 mm numerical tolerance. Manifest covers 4,217 modeled/simplified objects. Blade collision check has zero unwanted intersections in the tested pairs. No empty meshes or non-finite vertices. Review does not certify every possible mechanical interference or manufacturing tolerance.
