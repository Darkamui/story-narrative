# Milestones 2–8: revised requirements

Recorded from the owner's review of Milestone 1. These requirements guide subsequent implementation; they do not imply that the changes already exist in the running prototype. The original handoff remains the baseline, with the owner's latest feedback taking priority.

Checkpoint status: implementation records now cover M2–M8. The owner authorized completion with “continue until end.” Read `MILESTONE_8.md` for measured release checks and external acceptance work that has not been claimed as complete.

## Requirements brought forward

### Every part remains identifiable

Every semantic component must have a human-readable name, purpose, stable ID, model mapping and anchor. Every visible assembly must have a persistent label or numbered marker linked to a visible legend. Repeated parts may share a family label with a count, but individual members must be identifiable through pointer, touch and keyboard selection. Use expanding labels in close-ups. Labels must not be limited to the exploded chapter or depend exclusively on hover.

Resolve overlap by moving labels to reserved margins and retaining leaders/numbered references. Do not silently hide the only identifier for a visible assembly. An off-screen or occluded selected part needs a visible identification panel. Mobile uses the same identities with a compact legend. Explicitly label bath, molten aluminium and carbon separately.

### Choreography begins in M2, not the polish milestone

Replace the permanent left-copy/right-model split with a full-stage composition system. Each narrative beat defines its focal component, framing, camera path, layout, short caption, labels and scroll-operated change. Use whole-object reveals, detail shots, overhead sections, matched section transitions, wide exploded diagrams and material-following sequences. Placement must follow the shot's available space, not alternate sides arbitrarily.

Each chapter must teach something visually even if the prose is covered. A repeated shot needs a specific comparative purpose and a meaningful visible state change. The normal/anode-effect comparison can retain a matched camera; current, electrolysis, normal operation and metal collection cannot all reuse the same wide view with moving dots.

### Scientific fidelity is a prerequisite

Maintain a claim register: claim ID, source with page/section, applicable process/cell type, unit, value/range if relevant, status and linked scene. Maintain a parallel visual register for component geometry, material paths, charge carriers, process timing and schematic exaggerations. Introduce no unverified operating number merely to fill a display.

Scope: conventional carbon-anode, prebake Hall–Héroult primary aluminium production, centered on the existing 400 kA model. Briefly locate alumina refining before the opening grain; keep the main experience focused on the cell. Do not substitute inert-anode technology or imply that the grain simply melts into metal.

The existing model is not a documented replica of a particular operating plant. Its above-rim geometry is marked assumed, and it contains accepted dimensional/section simplifications. Process fidelity can be grounded in published evidence; exact plant geometry and operating values require matching plant/OEM references. Record and resolve these gaps rather than describing assumptions as exact.

## Milestone tasks and acceptance

| Milestone | Work | Acceptance |
|---|---|---|
| **2 — Real cell, identity and stage** | Integrate GLB; measure bounds/triangles/pivots; map every node to a component family; preserve assembly transforms and choose one explosion authority. Build persistent labels, selection and legend. Replace fixed split layout with scene-specific compositions. Establish claim register and geometry assumptions. | Real cell supports forward/reverse choreography; visible assemblies are identifiable in every shot; the reveal, anatomy and process-entry shots have distinct compositions; no missing required node or double-transformed rig. |
| **3 — Exploded anatomy and sections** | Author staged hood removal, conductor separation, anode lift and lining/cathode separation. Give layers room, keep leaders attached, provide a readable hold. Prepare section geometry in Blender MCP if runtime clipping is inadequate. | Parts remain legible and named; endpoints do not intersect; exact reassembly; bath and metal are distinguishable; section transitions preserve orientation. |
| **4 — Detailed operating process** | Separate feeding/dissolution, electrical path, electrode reactions, gas evolution/collection, carbon consumption, heat containment and metal collection into explanatory beats. Tie effects to real model anchors. Add close-up and section transitions. | Each beat has a distinct visible mechanism and source-backed explanation. Current markers do not replace chemistry; bath is not confused with metal; no fictional physical route or unsourced operating value. |
| **5 — Normal operation and anode effect** | Show the operating baseline, then a matched close-up comparison of the affected interface and a separate voltage indicator. Explain the abnormal condition and return to baseline with an explicit narrative transition. | Difference is visible without relying on a color change or title. Voltage, current, gas and alumina are distinct concepts. The abnormal event is not portrayed as an inevitable stage of producing metal. |
| **6 — Tapping and casting** | Source and depict a representative tapping/transfer arrangement. Add necessary story assets in Blender MCP. Establish passage to the cast house, subsequent treatment where applicable, and one clearly identified casting route. | Withdrawal, transfer and solidification are understandable; no unexplained morph from pool to block. Machine details match references or remain explicitly schematic. |
| **7 — Editorial and interaction refinement** | Refine typography, pacing, transitions, lighting, material readability, optional detail panels, labels and mobile shot choices. Assess the intended 10–15 minute exploration with real readers. | One coherent journey with varied scale/composition; useful holds; readable labels; the opening resolves at the ending. This milestone refines choreography already working in M2–M6. |
| **8 — Release verification** | Profile the real asset; implement justified quality tiers; test browser/device and scroll/restoration behavior, reduced motion, keyboard, load failures and slow networks. Audit every scientific claim and visual mechanism; obtain a relevant technical review for remaining fidelity questions. | Verified performance and accessible content; reproducible checks; explicit resolution of factual gaps; no claim of completed validation for untested platforms. |

## Proposed shot progression

This is an authored direction to implement, not a list of already completed scenes.

| Beat | Viewer experience | Explanatory action |
|---|---|---|
| Grain | Full-screen macro; a small caption close to the grain | Name alumina and establish its place after refining. |
| Reveal | Descend, then pull out into a full-width cell view | Connect the feed location to the scale of the vessel. |
| Assemblies | Move between named groups with short local captions | Show how support, enclosure, conductors and electrodes relate. |
| Anatomy | Wide centered exploded diagram, labels on both margins | Separate layers sequentially; give each new layer a readable introduction. |
| Section | Reassemble into a side section | Establish bath, metal, cathode and protective lining in their correct relative positions. |
| Current | Follow a reviewed conductor path into a close section | Distinguish conventional current direction from physical material transport. |
| Feed/electrolysis | Move from the feeder to the bath and electrode interfaces | Separate delivery, dissolution and electrochemical reduction; explain the reaction products. |
| Normal | Wider sectional overview with process-specific identifiers | Connect the mechanisms into continuous operation without replaying the current chapter. |
| Anode effect | Matched interface close-up and comparison | Expose the abnormal interface and voltage change; label schematic elements. |
| Metal | Lower sectional camera centered on the metal pad | Identify where aluminium collects without making it glow like molten iron. |
| Tapping | Follow the removal path into a receiving vessel | Preserve material continuity through withdrawal and transfer. |
| Casting | Establish the downstream location, then the mould and solid form | Show the selected casting process and resolve grain-to-metal. |

## Source foundation and remaining research

- [IAI: Reduction](https://alustory.international-aluminium.org/primary-production/reduction/) and [primary production](https://alustory.international-aluminium.org/primary-production/) establish the process family and placement of smelting after refining.
- [Hydro: Trust, transparency and transition](https://www.hydro.com/globalassets/download-center/publications/whitepapers/trust-transparency-and-transition.pdf), printed p. 04 / PDF p. 3, describes the molten electrolyte, carbon anodes, current route, CO₂ formation, tapping and transfer to the cast house. Use this as process evidence, not as dimensions for this cell.
- [IAI Aluminium Sector GHG Protocol](https://ghgprotocol.org/sites/default/files/2023-03/aluminium_1.pdf), Appendix B §1.2 and Appendix C, supports carbon-anode electrolysis and the association of anode effect with insufficient dissolved alumina, increased cell voltage, gas film and PFC formation. No historical numeric threshold is automatically adopted as a universal modern setpoint.
- [IAI: Casting](https://alustory.international-aluminium.org/primary-production/casting/) is a starting point for selecting and documenting the ending's actual process.
- Root `spec.py` and `docs/DESIGN_HISTORY.md` remain the local model design authority. Measured GLB names and inventories are in `ASSET_AUDIT.md`.

M4 added evidence for feeder sequencing, electrode reactions, bubbles, collection and heat balance. M6 added Fives ECL vacuum-tapping evidence and ALTEK/Hertwich/Pyrotek references for the selected casting route and treatment context. Exact conductor connections and the internal hood passage remain unresolved geometry assumptions. Simplified diagrams continue to identify their abstraction rather than invent electrolyte speciation.
