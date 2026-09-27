# Stage 02 — Cooler and board

Inspected initial images: `stage-02-exploded-initial.png`, `stage-02-assembled-initial.png`, `stage-02-side-initial.png`, `stage-02-PCB_top-initial.png`, `stage-02-Cooler_under-initial.png`, `stage-02-Cooler_top-initial.png`.

Inspected corrected evidence: `stage-02-exploded.png`, `stage-02-assembled.png`, `stage-02-side.png`, `stage-02-PCB_top.png`, `stage-02-Cooler_under.png`, `stage-02-Cooler_top.png`, `stage-02-Mating.png`.

Eight memory packages surround the central die. Two five-stage regulator rows have chokes, power packages, capacitors and small supporting parts. Separate PCIe contacts and the power socket's 12 main/four sense positions are visible. Cooler underside shows six continuous pipes, the central nickel contact, eight memory lands, and two VRM spreaders. Three bank regions use real separated fins.

Defects and corrections: initial PCB had broad empty regions; added package-specific decoupling strips and structured linked small-component fields with subtle trace/via geometry. Power socket overlapped the original fin envelope; the positive-X bank now has a lower-edge notch, retaining fins above the connector. Raised the I/O bank's lower fin edge to clear port housings, extended sockets toward the bracket, and corrected GPU die/paste contact heights. Mating camera was changed to a side alignment view.

Gate: PASS for modeled layout and thermal alignment. Cooler reflections remain bright, so contact positions are also checked in clay at Stage 04. Trace routing is cosmetic; BGA balls, internal board layers, and electrical validation are outside scope. Fins are soldered through continuous pipe paths; their joint intersections are intentional.
