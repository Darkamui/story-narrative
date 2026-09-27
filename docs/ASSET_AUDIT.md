# Asset audit for Milestone 2

Integration update: Three.js runtime measurement now confirms 723 meshes and 140,556 triangles. All meshes map to 13 semantic families, with 36 anode blocks and 15 source rig controls. See `runtime-asset.json` for measurements and `MILESTONE_2.md` for the implemented adapter. The original inventory below is retained as the M1 audit record.

Measured from GLB JSON chunks on 2026-09-19. Reproduce with `node tools/inventory-glb.mjs` from this folder. The root `out/` files are ignored by Git, so a fresh clone must regenerate or receive them.

| Asset | Bytes | Nodes | Meshes | Materials | Animation |
|---|---:|---:|---:|---:|---|
| `../out/cell.glb` | 3,411,720 | 740 | 352 | 17 | none |
| `../out/cell_anim.glb` | 3,424,824 | 740 | 352 | 17 | `Scene`, 15 channels |

| Existing prefix | Node count | Proposed runtime semantic family |
|---|---:|---|
| `01_SHELL` | 43 | SHELL |
| `02_REFRACTORY` | 13 | REFRACTORY |
| `03_CATHODE` | 61 | CATHODE |
| `04_PROCESS` | 4 | BATH / ALUMINUM_POOL / crust / cover |
| `05_ANODES` | 252 | ANODES; blocks, rods and associated hardware |
| `06_BUSBARS` | 50 | BUSBARS; split by actual circuit/side |
| `07_SUPERSTRUCTURE` | 50 | SUPERSTRUCTURE |
| `08_HOODING` | 150 | HOODING |
| `09_HARDWARE` | 100 | HARDWARE; assign with parent assemblies |
| `10_EXPLOSION` | 17 | Existing rig empties |

Names are already suitable for an adapter; renaming the source is unnecessary. The four process nodes are `04_PROCESS_bath_000`, `04_PROCESS_metal_000`, `04_PROCESS_crust_000`, and `04_PROCESS_cover_000`. Example: `05_ANODES_block_000` has glTF translation approximately `[-7.225, 1.27, -1.05]`, consistent with Blender Z becoming runtime Y. Preserve the source scale and establish camera framing from measured world bounds in M2, rather than adopting this prototype’s arbitrary units.

Root documentation records 140,556 evaluated triangles in Blender. That count was **not remeasured for these GLBs** in this milestone. Node/mesh counts above are actual export inventories and differ from Blender object/datablock counts.

## Information to establish at M2 entry

No additional asset upload is currently needed. Both candidate GLBs are present. Before integration:

1. Measure runtime bounds, pivots, parent hierarchy, materials and actual triangle count in Three.js.
2. Map all four process-node suffixes and assign shell walls, busbar sides and rig descendants to semantic groups. Fail clearly on missing required nodes.
3. Choose one explosion authority: the existing baked clip or an adapter derived from the source rig vectors. Do not animate children and their rig parents twice.
4. Verify static assembly is at Explosion=0 and establish authored section/clipping behavior on the real model.
5. Keep 400 kA as the default project basis. A 450 kA concept requires an explicit narrative distinction from the geometry’s design basis.
6. Preserve accepted source-model assumptions: above-rim assemblies are plausible-class; the gas throat opening is deliberately uncut; the lining width divergence is documented in the root design history.

Blender MCP is available in the tool catalog, but no scene mutation was needed or performed for M0–M1. The handoff explicitly requires primitives before final asset integration.
