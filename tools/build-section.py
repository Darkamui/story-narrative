"""Build longitudinal section faces from the delivered GLB, in an isolated Blender.

Run with Blender --background --factory-startup --python this_file.
No design dimensions or source model files are changed. Blender Y=0 maps to
runtime Z=0; the visible half is Blender Y>=0. Export only the new cut faces.
"""
from pathlib import Path
import hashlib
import json
import bpy
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "public/assets/cell.glb"
OUTPUT = ROOT / "public/assets/section-caps.glb"

bpy.ops.object.select_all(action="SELECT")
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(SOURCE))
bpy.context.scene.frame_set(0)
bpy.context.view_layer.update()
originals = [o for o in bpy.context.scene.objects if o.type == "MESH"]
# Enclose the discarded half using measured geometry, with one model-span padding.
points = [o.matrix_world @ Vector(p) for o in originals for p in o.bound_box]
lo = Vector(tuple(min(p[a] for p in points) for a in range(3)))
hi = Vector(tuple(max(p[a] for p in points) for a in range(3)))
pad = max(hi - lo)
bpy.ops.mesh.primitive_cube_add(size=1)
cutter = bpy.context.object
cutter.name = "STORY_SECTION_CUTTER"
cutter.location = ((lo.x + hi.x)/2, (lo.y-pad)/2, (lo.z+hi.z)/2)
cutter.dimensions = (hi.x-lo.x+2*pad, -(lo.y-pad), hi.z-lo.z+2*pad)
bpy.context.view_layer.update()
caps = []
report = []
for obj in originals:
    # These assemblies are removed entirely for the operating section. The open
    # duct is deliberately not a closed solid and must not enter a solid boolean.
    if obj.name.startswith(("07_", "08_", "09_", "04_PROCESS_cover_", "04_PROCESS_crust_")):
        continue
    world = obj.matrix_world.copy()
    source_points = [world @ Vector(p) for p in obj.bound_box]
    ys = [p.y for p in source_points]
    if not min(ys) < -1e-6 or not max(ys) > 1e-6:
        continue
    modifier = obj.modifiers.new("STORY_SECTION", "BOOLEAN")
    modifier.operation = "DIFFERENCE"
    modifier.solver = "EXACT"
    modifier.object = cutter
    bpy.context.view_layer.update()
    evaluated = obj.evaluated_get(bpy.context.evaluated_depsgraph_get())
    mesh = evaluated.to_mesh()
    # Only polygons on the new cut plane, preserving boolean-resolved holes.
    faces = [list(p.vertices) for p in mesh.polygons
             if all(abs((world @ mesh.vertices[i].co).y) < 2e-6 for i in p.vertices)]
    if faces:
        used = sorted({i for face in faces for i in face})
        indices = {old: new for new, old in enumerate(used)}
        vertices = [world @ mesh.vertices[i].co for i in used]
        for axis in range(3):
            lower = min(p[axis] for p in source_points) - 2e-5
            upper = max(p[axis] for p in source_points) + 2e-5
            assert all(lower <= p[axis] <= upper for p in vertices), f"Boolean escaped source bounds: {obj.name}"
        data = bpy.data.meshes.new(obj.name + "_section")
        data.from_pydata(vertices, [], [[indices[i] for i in f] for f in faces])
        data.update()
        cap = bpy.data.objects.new("CAP_" + obj.name, data)
        bpy.context.scene.collection.objects.link(cap)
        cap["source_node"] = obj.name
        caps.append(cap)
        report.append({"node": obj.name, "polygons": len(faces), "vertices": len(vertices),
                       "area_m2": sum(p.area for p in data.polygons)})
    evaluated.to_mesh_clear()
    obj.modifiers.remove(modifier)

assert caps, "No section faces were generated"
bpy.ops.object.select_all(action="DESELECT")
for cap in caps:
    cap.select_set(True)
bpy.context.view_layer.objects.active = caps[0]
bpy.ops.export_scene.gltf(filepath=str(OUTPUT), use_selection=True,
                          export_animations=False, export_extras=True)
(ROOT / "docs/section-asset.json").write_text(json.dumps({
    "source_sha256": hashlib.sha256(SOURCE.read_bytes()).hexdigest(),
    "plane": "Blender Y=0 / glTF Z=0", "kept_half": "glTF Z<=0",
    "blender": bpy.app.version_string, "bytes": OUTPUT.stat().st_size,
    "caps": report,
}, indent=2), encoding="utf-8")
print(f"SECTION COMPLETE: {len(caps)} facesets; {OUTPUT.stat().st_size} bytes")
