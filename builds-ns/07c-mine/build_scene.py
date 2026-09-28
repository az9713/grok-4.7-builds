# Open-pit mine, harsh noon, white dust, one haul truck. No rain, no sunset.
# Title BENCH 7. Procedural only.
# Run: blender -b -P build_scene.py
import bpy, bmesh, math, os
from mathutils import Vector, Matrix, noise

OUT = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(OUT, "screenshots")
os.makedirs(SHOTS, exist_ok=True)
BLEND = os.path.join(OUT, "bench7.blend")
FONT_DIR = r"C:\Windows\Fonts"
SHOT_FRAME = 160
TOTAL_STEPS = 8

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.frame_start, sc.frame_end = 1, 300
sc.render.fps = 24
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = 'PNG'

world = bpy.data.worlds.new("Noon")
sc.world = world
world.color = (0.62, 0.72, 0.82)

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
    if emit and "Emission Color" in b.inputs:
        b.inputs["Emission Color"].default_value = (*emit, 1)
        b.inputs["Emission Strength"].default_value = estr
    L(nt, b.outputs[0], out.inputs[0])
    return m


seg_bold = bpy.data.fonts.load(os.path.join(FONT_DIR, "segoeuib.ttf"))
seg_reg = bpy.data.fonts.load(os.path.join(FONT_DIR, "segoeui.ttf"))
georgia = bpy.data.fonts.load(os.path.join(FONT_DIR, "georgia.ttf"))


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
    cd.lens, cd.clip_start, cd.clip_end = lens, 0.2, 800
    return link(bpy.data.objects.new(name, cd), C_CAM)


def aim(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


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
    sh.show_shadows, sh.shadow_intensity = True, 0.5
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


build_cam = camera("BuildCam", 28)
build_cam.location = (-40, -70, 28)
aim(build_cam, (-5, 0, -6))

BENCH = 4.0


def pit_z(x, y):
    r = math.hypot(x * 0.85, y)
    ang = math.atan2(y, x)
    # haul ramp cut toward +X
    on_ramp = abs(ang) < 0.22 and x > -8
    depth = -28 + min(r, 55) / 55 * 40
    depth += 1.4 * noise.noise(Vector((x * 0.03, y * 0.03, 1.2)))
    if r > 52:
        depth = 12 + 2 * noise.noise(Vector((x * 0.02, y * 0.02, 0.4)))
    z = math.floor(depth / BENCH) * BENCH
    if on_ramp:
        z = -28 + (x + 8) * 0.55
        z = max(-28, min(12, z))
    return z


# STEP 1 open pit
span, step = 60, 1.15
xs = [i * step - span for i in range(int(2 * span / step) + 1)]
ys = [i * step - span for i in range(int(2 * span / step) + 1)]
verts, faces = [], []
for y in ys:
    for x in xs:
        verts.append((x, y, pit_z(x, y)))
nx = len(xs)
for j in range(len(ys) - 1):
    for i in range(nx - 1):
        a = j * nx + i
        faces.append((a, a + 1, a + 1 + nx, a + nx))
me = bpy.data.meshes.new("Pit")
me.from_pydata(verts, [], faces)
pit = link(bpy.data.objects.new("Pit", me))
rock = principled("PitRock", (0.45, 0.38, 0.3), 0.92)
pit.data.materials.append(rock)
shot(1, "PIT  -  terraced open cut")

# STEP 2 the seventh bench marked as a flat
# Bench 7 sits where floor(z/4) corresponds. Paint a pale berm along z ~= 0.
berm = principled("Berm", (0.72, 0.68, 0.6), 0.85)
bpy.ops.mesh.primitive_cube_add(size=1, location=(-18, 8, 0.4))
mark = link(bpy.context.object); mark.name = "Bench7Mark"
mark.scale = (10, 1.2, 0.25)
mark.data.materials.append(berm)
# stencil that will read in the hero, sitting on that bench
stencil = text_obj("BenchStencil", "BENCH 7", 1.4, seg_bold, C_SCENE, (0.95, 0.95, 0.95, 1), spacing=1.02)
stencil.location = (-18, 10.2, 0.7)
stencil.rotation_euler = (math.radians(90), 0, 0)
shot(2, "BENCH 7  -  one berm and a stencil")

# STEP 3 one haul truck on the ramp
cab_m = principled("Cab", (0.72, 0.55, 0.12), 0.45)
bed_m = principled("Bed", (0.15, 0.15, 0.16), 0.55)
tire_m = principled("Tire", (0.02, 0.02, 0.02), 0.7)
# truck sits on the ramp near x=6, z = -28+(6+8)*0.55 = -20.3
tz = -20.2
tx, ty = 6.0, 0.4


def part(name, loc, scale, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(tx + loc[0], ty + loc[1], tz + loc[2]))
    ob = link(bpy.context.object); ob.name = name
    ob.scale = scale
    ob.data.materials.append(mat)
    return ob


part("Bed", (1.2, 0, 1.5), (3.2, 1.8, 1.1), bed_m)
part("Cab", (-1.8, 0, 1.35), (1.3, 1.5, 1.4), cab_m)
part("Hood", (-2.7, 0, 0.85), (0.7, 1.3, 0.5), cab_m)
part("Glass", (-1.7, 0, 1.7), (1.15, 1.35, 0.45), principled("Glass", (0.6, 0.75, 0.85), 0.1))
for i, (wx, wy) in enumerate(((-1.6, 0.85), (-1.6, -0.85), (0.4, 0.9), (0.4, -0.9), (2.2, 0.9), (2.2, -0.9))):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.55, depth=0.35, location=(tx + wx, ty + wy, tz + 0.55))
    w = link(bpy.context.object); w.name = f"Wheel_{i}"
    w.rotation_euler = (math.radians(90), 0, 0)
    w.data.materials.append(tire_m)
shot(3, "TRUCK  -  one haul truck on the ramp")

# STEP 4 highwall rubble, still noon, still dry
rubble = principled("Rubble", (0.4, 0.34, 0.28), 0.95)
for i in range(14):
    ang = i * 0.45
    rad = 22 + (i % 4) * 3
    x, y = math.cos(ang) * rad, math.sin(ang) * rad
    z = pit_z(x, y) + 0.8
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.8 + (i % 3) * 0.4, location=(x, y, z))
    ob = link(bpy.context.object); ob.name = f"Rubble_{i}"
    ob.scale = (1.3, 0.9, 0.6)
    ob.data.materials.append(rubble)
shot(4, "HIGHWALL  -  loose rock on the benches")

# STEP 5 white dust, not rain
dust_m = principled("Dust", (0.92, 0.92, 0.9), 0.6, emit=(0.9, 0.9, 0.88), estr=0.15)
bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=1, radius=0.12, location=(0, 0, -40))
mote = link(bpy.context.object, C_FX); mote.name = "DustMote"
mote.data.materials.append(dust_m)
mote.hide_render = mote.hide_viewport = True
bpy.ops.mesh.primitive_plane_add(size=6, location=(tx + 1.5, ty, tz + 1.2))
emitter = link(bpy.context.object, C_FX); emitter.name = "DustEmitter"
emitter.rotation_euler = (math.radians(80), 0, math.radians(-90))
emitter.show_instancer_for_render = False
emitter.show_instancer_for_viewport = False
emitter.modifiers.new("dust", 'PARTICLE_SYSTEM')
ps = emitter.particle_systems[-1]
s = ps.settings
s.count, s.frame_start, s.frame_end = 2500, 1, 300
s.lifetime = 48
s.emit_from = 'FACE'
s.normal_factor, s.factor_random = 3.5, 2.5
s.render_type, s.instance_object = 'OBJECT', mote
s.particle_size, s.size_random = 1.4, 0.6
try:
    s.effector_weights.gravity = 0.05
except Exception:
    pass
try:
    s.brownian_factor = 1.4
except Exception:
    pass
ps.point_cache.frame_start, ps.point_cache.frame_end = 1, 300
ps.point_cache.use_disk_cache = True
bpy.ops.wm.save_as_mainfile(filepath=BLEND)
bpy.ops.ptcache.bake_all(bake=True)
print("BAKED dust")
shot(5, "DUST  -  white dust off the truck, no rain")

# STEP 6 harsh noon sun
try:
    world.use_nodes = True
except Exception:
    pass
wnt = world.node_tree
for n in list(wnt.nodes):
    wnt.nodes.remove(n)
wout = wnt.nodes.new("ShaderNodeOutputWorld")
bg = N(wnt, "ShaderNodeBackground", Color=(0.55, 0.68, 0.86, 1), Strength=1.0)
L(wnt, bg.outputs[0], wout.inputs[0])
sun = bpy.data.lights.new("NoonSun", 'SUN')
sun.color = (1.0, 0.98, 0.94)
sun.energy = 7.5
sun.angle = math.radians(0.6)
so = link(bpy.data.objects.new("NoonSun", sun), C_FX)
so.rotation_euler = (math.radians(48), math.radians(8), math.radians(30))
shot(6, "NOON  -  hard sun, white sky, no sunset")

# STEP 7 a second catch-light so the pit floor is not a black hole, still noon
fill = bpy.data.lights.new("SkyFill", 'SUN')
fill.color = (0.75, 0.82, 0.9)
fill.energy = 0.6
fill.angle = math.radians(20)
fo = link(bpy.data.objects.new("SkyFill", fill), C_FX)
fo.rotation_euler = (math.radians(-30), 0, math.radians(140))
shot(7, "FILL  -  sky bounce, still harsh noon")

# STEP 8 hero
hero = camera("HeroCam", 32)
target = link(bpy.data.objects.new("HeroTarget", None), C_CAM)
tt = hero.constraints.new('TRACK_TO')
tt.target = target
tt.track_axis = 'TRACK_NEGATIVE_Z'
tt.up_axis = 'UP_Y'
keys(hero, "location", [(1, (-55, -80, 32)), (180, (-28, -36, 8)), (300, (-8, -16, 2))], interp='BEZIER')
keys(target, "location", [(1, (0, 0, -8)), (180, (tx, ty, tz + 2)), (300, (tx + 0.5, ty, tz + 2.2))], interp='BEZIER')

title_mat, nt, out = new_mat("Title")
e = N(nt, "ShaderNodeEmission", Color=(0.95, 0.95, 0.92, 1), Strength=2.2)
tr = N(nt, "ShaderNodeBsdfTransparent")
mx = N(nt, "ShaderNodeMixShader", Fac=0.0)
L(nt, tr.outputs[0], mx.inputs[1]); L(nt, e.outputs[0], mx.inputs[2]); L(nt, mx.outputs[0], out.inputs[0])
keys(mx.inputs["Fac"], "default_value", [(1, 0.0), (230, 0.0), (260, 1.0)])
rig = link(bpy.data.objects.new("TitleRig", None), C_TITLE)
rig.parent = hero
rig.matrix_parent_inverse = Matrix.Identity(4)
rig.location = (0, 0, -3.0)
WHITE = (0.95, 0.95, 0.92, 1)
t1 = text_obj("Title", "BENCH 7", 0.24, georgia, C_TITLE, WHITE, spacing=1.2)
t1.parent = rig
t1.matrix_parent_inverse = Matrix.Identity(4)
t1.location = (0, 0, 0)
t1.data.materials.append(title_mat)
t1.visible_shadow = False
shot(8, "HERO CAMERA + TITLE BENCH 7", cam=hero)

sc.render.engine = 'BLENDER_EEVEE'
ee = sc.eevee
ee.taa_render_samples = 16
ee.use_shadows = True
try:
    ee.use_raytracing = False
except Exception:
    pass
sc.render.use_motion_blur = False
sc.view_settings.view_transform = 'AgX'
try:
    sc.view_settings.look = 'AgX - High Contrast'
except Exception as ex:
    print("LOOK skipped", ex)
sc.camera = hero
C_BADGE.hide_render = True
sc.render.image_settings.file_format = 'PNG'
sc.frame_set(1)
bpy.ops.wm.save_as_mainfile(filepath=BLEND)
print("BUILD_OK", BLEND)
