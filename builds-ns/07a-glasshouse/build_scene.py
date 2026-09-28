# Glasshouse at blue hour, storm arriving. Procedural only. Not a lighthouse.
# Run: blender -b -P build_scene.py
import bpy, bmesh, math, random, os
from mathutils import Vector, Matrix, noise

OUT = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(OUT, "screenshots")
os.makedirs(SHOTS, exist_ok=True)
BLEND = os.path.join(OUT, "glasshouse.blend")
FONT_DIR = r"C:\Windows\Fonts"
SHOT_FRAME = 220
TOTAL_STEPS = 8

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.frame_start, sc.frame_end = 1, 300
sc.render.fps = 24
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = 'PNG'
random.seed(11)

world = bpy.data.worlds.new("BlueHour")
sc.world = world
world.color = (0.45, 0.52, 0.62)

CLAY = (0.72, 0.72, 0.72, 1.0)


def coll(name):
    c = bpy.data.collections.new(name)
    sc.collection.children.link(c)
    return c

C_SCENE, C_FX, C_CAM, C_BADGE, C_TITLE = (coll(n) for n in ("Scene", "FX", "Cameras", "Badge", "Title"))


def link(ob, c=None, color=CLAY):
    for uc in list(ob.users_collection):
        uc.objects.unlink(ob)
    (c or C_SCENE).objects.link(ob)
    ob.color = color
    return ob


def keys(target, path, pairs, interp='LINEAR', index=-1):
    bpy.context.preferences.edit.keyframe_new_interpolation_type = interp
    for f, v in pairs:
        if index >= 0:
            getattr(target, path)[index] = v
        else:
            setattr(target, path, v)
        target.keyframe_insert(path, frame=f, index=index)


def new_mat(name):
    m = bpy.data.materials.new(name)
    try:
        m.use_nodes = True
    except Exception:
        pass
    nt = m.node_tree
    for n in list(nt.nodes):
        nt.nodes.remove(n)
    out = nt.nodes.new("ShaderNodeOutputMaterial")
    return m, nt, out


def N(nt, kind, **inputs):
    n = nt.nodes.new(kind)
    for k, v in inputs.items():
        if k in n.inputs:
            n.inputs[k].default_value = v
    return n


def L(nt, a, b):
    nt.links.new(a, b)


def principled(name, rgb, rough=0.8, emit=None, estr=0.0):
    m, nt, out = new_mat(name)
    b = N(nt, "ShaderNodeBsdfPrincipled")
    b.inputs["Base Color"].default_value = (*rgb, 1)
    b.inputs["Roughness"].default_value = rough
    if emit:
        if "Emission Color" in b.inputs:
            b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = estr
    L(nt, b.outputs[0], out.inputs[0])
    return m


def glass_mat(name):
    m, nt, out = new_mat(name)
    t = N(nt, "ShaderNodeBsdfTransparent")
    b = N(nt, "ShaderNodeBsdfPrincipled", Roughness=0.04)
    b.inputs["Base Color"].default_value = (0.62, 0.78, 0.9, 1)
    if "Transmission Weight" in b.inputs:
        b.inputs["Transmission Weight"].default_value = 1.0
    mx = N(nt, "ShaderNodeMixShader", Fac=0.22)
    L(nt, t.outputs[0], mx.inputs[1])
    L(nt, b.outputs[0], mx.inputs[2])
    L(nt, mx.outputs[0], out.inputs[0])
    try:
        m.surface_render_method = 'BLENDED'
    except Exception:
        pass
    return m


seg_bold = bpy.data.fonts.load(os.path.join(FONT_DIR, "segoeuib.ttf"))
seg_reg = bpy.data.fonts.load(os.path.join(FONT_DIR, "segoeui.ttf"))
georgia = bpy.data.fonts.load(os.path.join(FONT_DIR, "georgia.ttf"))
georgia_i = bpy.data.fonts.load(os.path.join(FONT_DIR, "georgiai.ttf"))


def text_obj(name, body, size, font, c, color, align='CENTER', spacing=1.0):
    cu = bpy.data.curves.new(name, 'FONT')
    cu.body, cu.size, cu.font = body, size, font
    cu.align_x, cu.align_y = align, 'CENTER'
    cu.space_character = spacing
    return link(bpy.data.objects.new(name, cu), c, color)


def rrect_mesh(name, w, h, r, seg=8):
    pts = []
    for cx, cy, a0 in ((w/2-r, h/2-r, 0), (-w/2+r, h/2-r, 90), (-w/2+r, -h/2+r, 180), (w/2-r, -h/2+r, 270)):
        for i in range(seg + 1):
            a = math.radians(a0 + 90 * i / seg)
            pts.append((cx + r * math.cos(a), cy + r * math.sin(a), 0))
    me = bpy.data.meshes.new(name)
    me.from_pydata(pts, [], [list(range(len(pts)))])
    return me


badge_pill = link(bpy.data.objects.new("BadgePill", rrect_mesh("BadgePill", 0.20, 0.056, 0.028)), C_BADGE, (0.12, 0.16, 0.23, 1))
badge_text = text_obj("BadgeText", "Opus 5.5", 0.034, seg_bold, C_BADGE, (0.98, 0.57, 0.24, 1))
step_pill = link(bpy.data.objects.new("StepPill", rrect_mesh("StepPill", 0.72, 0.042, 0.021)), C_BADGE, (0.12, 0.16, 0.23, 1))
step_text = text_obj("StepText", "", 0.02, seg_reg, C_BADGE, (0.95, 0.95, 0.95, 1), align='LEFT')


def place_overlays(cam):
    hw = (cam.data.sensor_width / 2) / cam.data.lens
    hh = hw * 9 / 16
    s = hw / 0.514
    for ob, loc in ((badge_pill, (0, hh * 0.84, -1.0)), (badge_text, (0, hh * 0.84 - 0.002 * s, -0.999)),
                    (step_pill, (-hw * 0.94 + 0.345 * s, -hh * 0.88, -1.0)),
                    (step_text, (-hw * 0.94 + 0.018 * s, -hh * 0.88 - 0.002 * s, -0.999))):
        ob.parent = cam
        ob.matrix_parent_inverse = Matrix.Identity(4)
        ob.location = loc
        ob.rotation_euler = (0, 0, 0)
        ob.scale = (s, s, s)


def camera(name, lens):
    cd = bpy.data.cameras.new(name)
    cd.lens, cd.clip_start, cd.clip_end = lens, 0.1, 400
    return link(bpy.data.objects.new(name, cd), C_CAM)


def aim(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


build_cam = camera("BuildCam", 32)
build_cam.location = (-16, -22, 7.5)
aim(build_cam, (0, 0, 3))


def shot(n, label, cam=None):
    cam = cam or build_cam
    sc.camera = cam
    place_overlays(cam)
    step_text.data.body = f"STEP {n:02d} / {TOTAL_STEPS:02d}   {label}"
    sc.render.engine = 'BLENDER_WORKBENCH'
    sh = sc.display.shading
    sh.light, sh.studio_light = 'STUDIO', 'Default'
    sh.color_type = 'OBJECT'
    sh.show_cavity, sh.cavity_type = True, 'BOTH'
    sh.show_shadows, sh.shadow_intensity = True, 0.45
    sh.show_specular_highlight = False
    sc.display.render_aa = '8'
    sc.view_settings.view_transform = 'Standard'
    sc.render.use_compositing = False
    sc.render.image_settings.file_format = 'PNG'
    C_BADGE.hide_render = False
    sc.frame_set(SHOT_FRAME)
    sc.render.filepath = os.path.join(SHOTS, f"step_{n:02d}.png")
    bpy.ops.render.render(write_still=True)
    print("SHOT", n, label)


def box(name, loc, scale, mat=None, color=CLAY):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = link(bpy.context.object, color=color)
    ob.name = name
    ob.scale = scale
    if mat:
        ob.data.materials.append(mat)
    return ob


# STEP 1 ground and path
def ground_height(x, y):
    return 0.18 * noise.noise(Vector((x * 0.08, y * 0.08, 0.2)))

verts, faces = [], []
span, step = 28, 0.7
xs = [i * step - span for i in range(int(2 * span / step) + 1)]
ys = [i * step - span for i in range(int(2 * span / step) + 1)]
for y in ys:
    for x in xs:
        verts.append((x, y, ground_height(x, y)))
nx = len(xs)
for j in range(len(ys) - 1):
    for i in range(nx - 1):
        a = j * nx + i
        faces.append((a, a + 1, a + 1 + nx, a + nx))
me = bpy.data.meshes.new("Ground")
me.from_pydata(verts, [], faces)
me.polygons.foreach_set("use_smooth", [True] * len(faces))
ground = link(bpy.data.objects.new("Ground", me))
grass = principled("Grass", (0.08, 0.12, 0.07), 0.9)
ground.data.materials.append(grass)
box("Path", (0, -8.5, 0.05), (1.3, 6.5, 0.04), principled("Path", (0.22, 0.2, 0.16), 0.85))
shot(1, "GROUND  -  blue-hour lawn and a path to the door")

# STEP 2 iron frame
iron = principled("Iron", (0.08, 0.09, 0.1), 0.4)
# footprint 12 x 7, walls 4.2, ridge 6.6
posts = []
for x in (-6, 6):
    for y in (-3.5, 3.5):
        posts.append(box(f"Post_{x}_{y}", (x, y, 2.1), (0.12, 0.12, 4.2), iron))
for x in (-6, 0, 6):
    box(f"RidgePost_{x}", (x, 0, 3.3), (0.1, 0.1, 6.6), iron)
box("Ridge", (0, 0, 6.6), (12.2, 0.1, 0.1), iron)
box("Plate_S", (0, -3.5, 4.2), (12.2, 0.08, 0.08), iron)
box("Plate_N", (0, 3.5, 4.2), (12.2, 0.08, 0.08), iron)
box("Plate_W", (-6, 0, 4.2), (0.08, 7.1, 0.08), iron)
box("Plate_E", (6, 0, 4.2), (0.08, 7.1, 0.08), iron)
for i, x in enumerate((-4, -2, 0, 2, 4)):
    box(f"RafterS_{i}", (x, -1.75, 5.4), (0.06, 3.6, 0.06), iron).rotation_euler = (math.radians(34), 0, 0)
    box(f"RafterN_{i}", (x, 1.75, 5.4), (0.06, 3.6, 0.06), iron).rotation_euler = (math.radians(-34), 0, 0)
box("DoorFrameL", (-0.7, -3.5, 1.3), (0.08, 0.08, 2.6), iron)
box("DoorFrameR", (0.7, -3.5, 1.3), (0.08, 0.08, 2.6), iron)
box("DoorHead", (0, -3.5, 2.6), (1.5, 0.08, 0.08), iron)
shot(2, "FRAME  -  iron glasshouse, ridge and door")

# STEP 3 glass
glass = glass_mat("Pane")
def pane(name, loc, scale, rot=(0, 0, 0)):
    bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
    ob = link(bpy.context.object)
    ob.name = name
    ob.scale = scale
    ob.rotation_euler = rot
    ob.data.materials.append(glass)
    return ob

for i, x in enumerate((-4.5, -1.5, 1.5, 4.5)):
    pane(f"WallS_{i}", (x, -3.52, 2.05), (2.7, 3.8, 1), (math.radians(90), 0, 0))
    pane(f"WallN_{i}", (x, 3.52, 2.05), (2.7, 3.8, 1), (math.radians(90), 0, 0))
for i, y in enumerate((-1.6, 1.6)):
    pane(f"WallW_{i}", (-6.02, y, 2.05), (3.0, 3.8, 1), (math.radians(90), 0, math.radians(90)))
    pane(f"WallE_{i}", (6.02, y, 2.05), (3.0, 3.8, 1), (math.radians(90), 0, math.radians(90)))
for i, x in enumerate((-4, -2, 0, 2, 4)):
    pane(f"RoofS_{i}", (x, -1.7, 5.35), (2.3, 3.5, 1), (math.radians(56), 0, 0))
    pane(f"RoofN_{i}", (x, 1.7, 5.35), (2.3, 3.5, 1), (math.radians(-56), 0, 0))
shot(3, "GLASS  -  panes you can see through")

# STEP 4 benches and plants
wood = principled("BenchWood", (0.28, 0.16, 0.08), 0.7)
pot_m = principled("Pot", (0.35, 0.16, 0.1), 0.6)
leaf = principled("Leaf", (0.1, 0.28, 0.12), 0.55)
for side, y in (("S", -1.6), ("N", 1.6)):
    box(f"Bench_{side}", (0, y, 0.85), (9.5, 0.7, 0.08), wood)
    box(f"Leg_{side}a", (-4, y, 0.4), (0.08, 0.08, 0.8), wood)
    box(f"Leg_{side}b", (4, y, 0.4), (0.08, 0.08, 0.8), wood)
for i in range(9):
    x = -4 + i * 1.0
    y = -1.6 if i % 2 == 0 else 1.6
    bpy.ops.mesh.primitive_cylinder_add(radius=0.16, depth=0.22, location=(x, y, 1.05))
    pot = link(bpy.context.object); pot.name = f"Pot_{i}"
    pot.data.materials.append(pot_m)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=0.28, location=(x, y, 1.4 + (i % 3) * 0.08))
    plant = link(bpy.context.object); plant.name = f"Plant_{i}"
    plant.scale = (1, 1, 0.7 + (i % 3) * 0.25)
    plant.data.materials.append(leaf)
shot(4, "PLANTS  -  benches, pots, leaves")

# STEP 5 warm lamps against the blue
lamp_mat = principled("LampGlow", (1, 0.8, 0.45), 0.4, emit=(1, 0.7, 0.3), estr=8)
for i, x in enumerate((-3, 3)):
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.12, location=(x, 0, 3.4))
    bulb = link(bpy.context.object); bulb.name = f"Bulb_{i}"
    bulb.data.materials.append(lamp_mat)
    ld = bpy.data.lights.new(f"Warm_{i}", 'POINT')
    ld.color = (1.0, 0.72, 0.4)
    ld.energy = 80
    ld.shadow_soft_size = 0.4
    lo = link(bpy.data.objects.new(f"Warm_{i}", ld), C_FX)
    lo.location = (x, 0, 3.3)
shot(5, "LAMPS  -  warm practicals inside the glass")

# STEP 6 blue hour sky, storm arriving from the west
try:
    world.use_nodes = True
except Exception:
    pass
wnt = world.node_tree
for n in list(wnt.nodes):
    wnt.nodes.remove(n)
wout = wnt.nodes.new("ShaderNodeOutputWorld")
bg = N(wnt, "ShaderNodeBackground", Strength=1.0)
L(wnt, bg.outputs[0], wout.inputs[0])
storm = wnt.nodes.new("ShaderNodeValue"); storm.name = "Storm"
keys(storm.outputs[0], "default_value", [(1, 0.05), (80, 0.2), (200, 0.85), (300, 1.0)])
blue = (0.05, 0.1, 0.22, 1)
deeper = (0.01, 0.015, 0.03, 1)
mix = N(wnt, "ShaderNodeMix"); mix.data_type = 'RGBA'
mix.inputs["A"].default_value = blue
mix.inputs["B"].default_value = deeper
L(wnt, storm.outputs[0], mix.inputs["Factor"])
L(wnt, mix.outputs["Result"], bg.inputs["Color"])

sun = bpy.data.lights.new("BlueSun", 'SUN')
sun.color = (0.62, 0.72, 0.95)
sun.angle = math.radians(2.5)
so = link(bpy.data.objects.new("BlueSun", sun), C_FX)
so.rotation_euler = (math.radians(28), 0, math.radians(-50))
keys(sun, "energy", [(1, 3.2), (120, 1.6), (220, 0.35), (300, 0.15)])

cloud_m = principled("Cloud", (0.25, 0.28, 0.34), 1.0)
for i in range(5):
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=1, location=(-18 + i * 3, -6 + (i % 2), 9))
    c = link(bpy.context.object, C_FX); c.name = f"Cloud_{i}"
    c.scale = (6 + i, 3.2, 1.4)
    c.data.materials.append(cloud_m)
    keys(c, "location", [(1, (-28 - i * 4, -4, 10)), (300, (8 + i * 2, -2, 8.5))], interp='BEZIER')
shot(6, "STORM  -  blue hour, cloud bank arriving")

# STEP 7 rain
rain_m = principled("Rain", (0.7, 0.78, 0.88), 0.2, emit=(0.5, 0.6, 0.75), estr=0.4)
bm = bmesh.new()
bmesh.ops.create_cone(bm, cap_ends=True, segments=4, radius1=0.012, radius2=0.012, depth=0.7)
rme = bpy.data.meshes.new("RainStreak"); bm.to_mesh(rme); bm.free()
streak = link(bpy.data.objects.new("RainStreak", rme), C_FX)
streak.location = (0, 0, -30)
streak.data.materials.append(rain_m)
streak.hide_render = streak.hide_viewport = True
streak.visible_shadow = False
bpy.ops.mesh.primitive_plane_add(size=36, location=(0, 0, 14))
emitter = link(bpy.context.object, C_FX); emitter.name = "RainEmitter"
emitter.rotation_euler = (math.radians(180), 0, math.radians(12))
emitter.show_instancer_for_render = False
emitter.show_instancer_for_viewport = False
emitter.modifiers.new("rain", 'PARTICLE_SYSTEM')
ps = emitter.particle_systems[-1]
s = ps.settings
s.count, s.frame_start, s.frame_end = 12000, 70, 300
s.lifetime = 28
s.emit_from = 'FACE'
s.normal_factor, s.factor_random = 18, 1.2
s.render_type, s.instance_object = 'OBJECT', streak
s.particle_size, s.size_random = 1.0, 0.35
ps.point_cache.frame_start, ps.point_cache.frame_end = 1, 300
ps.point_cache.use_disk_cache = True
bpy.ops.wm.save_as_mainfile(filepath=BLEND)
bpy.ops.ptcache.bake_all(bake=True)
print("BAKED rain")
shot(7, "RAIN  -  the storm reaches the glass")

# STEP 8 hero camera + title
hero = camera("HeroCam", 35)
target = link(bpy.data.objects.new("HeroTarget", None), C_CAM)
tt = hero.constraints.new('TRACK_TO')
tt.target = target
tt.track_axis = 'TRACK_NEGATIVE_Z'
tt.up_axis = 'UP_Y'
keys(hero, "location", [(1, (-18, -24, 8)), (160, (-10, -14, 4.2)), (300, (-4.2, -9.5, 2.4))], interp='BEZIER')
keys(target, "location", [(1, (0, 0, 3.2)), (160, (0, 0, 2.6)), (300, (0.4, -0.4, 1.8))], interp='BEZIER')

title_mat, nt, out = new_mat("Title")
e = N(nt, "ShaderNodeEmission", Color=(0.85, 0.92, 1.0, 1), Strength=2.4)
tr = N(nt, "ShaderNodeBsdfTransparent")
mx = N(nt, "ShaderNodeMixShader", Fac=0.0)
L(nt, tr.outputs[0], mx.inputs[1]); L(nt, e.outputs[0], mx.inputs[2]); L(nt, mx.outputs[0], out.inputs[0])
keys(mx.inputs["Fac"], "default_value", [(1, 0.0), (230, 0.0), (260, 1.0)])
rig = link(bpy.data.objects.new("TitleRig", None), C_TITLE)
rig.parent = hero
rig.matrix_parent_inverse = Matrix.Identity(4)
rig.location = (0, 0, -3.2)
GOLD = (0.82, 0.9, 1.0, 1)
t1 = text_obj("Title", "GLASSHOUSE", 0.22, georgia, C_TITLE, GOLD, spacing=1.15)
t2 = text_obj("Subtitle", "blue hour, storm arriving", 0.07, georgia_i, C_TITLE, GOLD)
for ob, y in ((t1, -0.15), (t2, -0.42)):
    ob.parent = rig
    ob.matrix_parent_inverse = Matrix.Identity(4)
    ob.location = (0, y, 0)
    ob.data.materials.append(title_mat)
    ob.visible_shadow = False
shot(8, "HERO CAMERA + TITLE GLASSHOUSE", cam=hero)

sc.render.engine = 'BLENDER_EEVEE'
ee = sc.eevee
ee.taa_render_samples = 24
ee.use_shadows = True
try:
    ee.use_raytracing = False
except Exception:
    pass
sc.render.use_motion_blur = False
sc.view_settings.view_transform = 'AgX'
try:
    sc.view_settings.look = 'AgX - Medium High Contrast'
except Exception as ex:
    print("LOOK skipped", ex)
sc.camera = hero
C_BADGE.hide_render = True
sc.render.image_settings.file_format = 'PNG'
sc.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=BLEND)
print("BUILD_OK", BLEND)
