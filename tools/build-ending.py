"""Isolated, illustrative process equipment. Run in Blender or through Blender MCP.
Coordinates are diagram metres, not plant/OEM dimensions. Original scenes are retained.
"""
import bpy, math, json, io_scene_gltf2
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[1]
NAME = 'INSIDE_CELL_ENDING'
if bpy.data.scenes.get(NAME):
    raise RuntimeError('Ending scene already exists; inspect before regenerating')
scene = bpy.data.scenes.new(NAME)
previous = bpy.context.window.scene
bpy.context.window.scene = scene
collection = bpy.data.collections.new('STORY_ENDING')
scene.collection.children.link(collection)
materials = {}
for name, color, metal in [('steel', (0.24,0.30,0.28,1),.65), ('lining',(0.53,.45,.33,1),0), ('silver',(.72,.80,.78,1),.8), ('bath',(.58,.38,.15,1),0), ('carbon',(.10,.14,.12,1),0)]:
    mat = bpy.data.materials.new('ENDING_'+name)
    mat.use_nodes = True
    node = next(n for n in mat.node_tree.nodes if n.type == 'BSDF_PRINCIPLED')
    node.inputs['Base Color'].default_value = color
    node.inputs['Metallic'].default_value = metal
    node.inputs['Roughness'].default_value = .33 if metal else .75
    mat.diffuse_color = color
    materials[name] = mat

def xyz(p): return (p[0], -p[2], p[1])
def group(name):
    ob=bpy.data.objects.new(name,None);collection.objects.link(ob);return ob
tap=group('TAP_STUDY');cast=group('CAST_STUDY')
def mesh(name, verts, faces, mat, parent):
    data=bpy.data.meshes.new(name);data.from_pydata([xyz(v) for v in verts],[],faces);data.update()
    ob=bpy.data.objects.new(name,data);collection.objects.link(ob);ob.parent=parent;data.materials.append(materials[mat]);return ob
def box(name, center, size, mat, parent):
    x,y,z=center;a,b,c=[s/2 for s in size]
    vs=[(x+dx*a,y+dy*b,z+dz*c) for dx,dy,dz in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
    return mesh(name,vs,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],mat,parent)
def trough(name, center, size, wall, mat, parent):
    x,y,z=center;w,h,d=size
    box(name+'_base',(x,y+wall/2,z),(w,wall,d),mat,parent)
    for side in [-1,1]:
        box(name+('_left' if side<0 else '_right'),(x+side*(w-wall)/2,y+h/2,z),(wall,h,d),mat,parent)
    box(name+'_back',(x,y+h/2,z-(d-wall)/2),(w-2*wall,h,wall),mat,parent)
    # Near wall intentionally omitted: this is an identified sectional study.
def pipe(name, points, radius, mat, parent):
    for i,(a,b) in enumerate(zip(points,points[1:])):
        av=Vector(a);bv=Vector(b);axis=(bv-av).normalized();helper=Vector((0,0,1))
        if abs(axis.dot(helper))>.95: helper=Vector((0,1,0))
        u=axis.cross(helper).normalized()*radius;v=axis.cross(u).normalized()*radius
        verts=[tuple(p+u*math.cos(t*math.tau/16)+v*math.sin(t*math.tau/16)) for p in [av,bv] for t in range(16)]
        mesh(name+'_'+str(i).zfill(2),verts,[(j,(j+1)%16,(j+1)%16+16,j+16) for j in range(16)],mat,parent)
def vessel(name,x,base,radius,height,wall,parent):
    # Half section with a visibly thick shell/lining; the lid is also sectioned.
    for suffix,r1,r2,material in [('shell',radius-wall/2,radius,'steel'),('lining',radius-wall,radius-wall/2,'lining')]:
        verts=[]
        for y,r in [(base,r1),(base,r2),(base+height,r1),(base+height,r2)]:
            verts += [(x+r*math.cos(i*math.pi/32),y,-r*math.sin(i*math.pi/32)) for i in range(33)]
        faces=[]
        for i in range(32):
            faces.extend([(i,i+1,i+67,i+66),(i+33,i+99,i+100,i+34),(i,i+33,i+34,i+1),(i+66,i+67,i+100,i+99)])
        faces += [(0,66,99,33),(32,65,131,98)]
        mesh(name+'_'+suffix,verts,faces,material,parent)
    box(name+'_floor',(x,base+wall/2,-radius/2),(radius*1.7,wall,radius),'lining',parent)
    box(name+'_lid',(x,base+height+.05,-radius/2),(radius*2,.12,radius),'steel',parent)

trough('TAP_cell_section',(-2.1,0,0),(3.4,.95,1.55),.12,'lining',tap)
box('TAP_cathode',(-2.1,.22,0),(3.16,.2,1.3),'carbon',tap)
box('TAP_metal_pad',(-2.1,.46,0),(3.16,.28,1.3),'silver',tap)
box('TAP_electrolyte',(-2.1,.72,0),(3.16,.24,1.3),'bath',tap)
vessel('TAP_crucible',2.05,0,.9,1.8,.18,tap)
pipe('TAP_tube',[(-1.45,.43,-.18),(-1.45,2.35,-.18),(2.05,2.35,-.18),(2.05,1.63,-.18)],.09,'steel',tap)
pipe('TAP_vacuum_connection',[(2.5,1.88,-.45),(2.5,2.65,-.45),(3.1,2.65,-.45)],.055,'steel',tap)
box('TAP_lifting_lug',(2.05,2.05,-.65),(.25,.35,.2),'steel',tap)
trough('CAST_holding_furnace',(-2.8,.15,0),(2.2,1.8,1.9),.2,'lining',cast)
# Open the discharge port at the launder; liquid must not pass through a wall.
bpy.data.objects.remove(bpy.data.objects['CAST_holding_furnace_right'],do_unlink=True)
box('CAST_furnace_port_sill',(-1.8,.49,0),(.2,.68,1.9),'lining',cast)
box('CAST_furnace_port_lintel',(-1.8,1.57,0),(.2,.76,1.9),'lining',cast)
for s in [-1,1]: box('CAST_furnace_port_jamb_'+str(s),(-1.8,1.01,s*.6),(.2,.36,.7),'lining',cast)
box('CAST_furnace_cladding',(-2.8,1.1,-1.06),(2.4,2.05,.15),'steel',cast)
box('CAST_furnace_metal',(-2.8,.9,0),(1.8,.35,1.5),'silver',cast)
box('CAST_launder_base',(-.65,.79,0),(2.45,.12,.38),'lining',cast)
for s in [-1,1]: box('CAST_launder_wall_'+str(s),(-.65,.95,s*.22),(2.45,.4,.09),'lining',cast)
box('CAST_support_frame',(1.45,.18,0),(3.0,.18,2.2),'steel',cast)
for x in [.3,2.6]: box('CAST_support_leg_'+str(x),(x,-.2,-.8),(.16,.8,.16),'steel',cast)
mould=group('CAST_MOULD');mould.parent=cast
trough('CAST_mould',(1.45,.35,0),(1.8,.46,1.15),.11,'steel',mould)
box('CAST_solid_ingot',(1.45,.57,0),(1.55,.23,.92),'silver',cast)
box('CAST_cooling_duct',(1.45,.52,-1.0),(2,.6,.25),'steel',cast)
for x in [.65,1.45,2.25]: pipe('CAST_air_outlet_'+str(x),[(x,.53,-.86),(x,.53,-.67)],.09,'steel',cast)

bpy.context.view_layer.update()
for ob in scene.objects: ob.select_set(True)
formats=[i[0] for i in io_scene_gltf2.ExportGLTF2_Base.__annotations__['export_format'].keywords['items'](None,bpy.context)]
assert 'GLB' in formats,formats
out=ROOT/'public/assets/ending.glb'
bpy.ops.export_scene.gltf(filepath=str(out),export_format='GLB',use_selection=True,use_active_scene=True,export_animations=False)
bpy.data.libraries.write(str(ROOT/'assets/ending.blend'),{scene})
(ROOT/'docs/ending-asset.json').write_text(json.dumps({'scope':'Illustrative sectional equipment, not OEM geometry','objects':[o.name for o in scene.objects],'bytes':out.stat().st_size},indent=2))
# Leave new scene visible for MCP inspection; previous scene name is retained.
scene['previous_scene']=previous.name
for ob in cast.children_recursive: ob.hide_set(True)
print(json.dumps({'scene':scene.name,'objects':len(scene.objects),'bytes':out.stat().st_size,'previous_scene':previous.name}))
