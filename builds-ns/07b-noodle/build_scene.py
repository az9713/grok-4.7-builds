# One noodle stall, rain, a puddle, a door-sized neon. Camera ends on the bowls.
# Not a cliff. Not a lighthouse. Procedural only.
# Run: blender -b -P build_scene.py
import bpy, bmesh, math, os
from mathutils import Vector, Matrix

OUT = os.path.dirname(os.path.abspath(__file__))
SHOTS = os.path.join(OUT, "screenshots")
os.makedirs(SHOTS, exist_ok=True)
BLEND = os.path.join(OUT, "midnight_broth.blend")
FONT_DIR = r"C:\Windows\Fonts"
SHOT_FRAME = 210
TOTAL_STEPS = 8

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
sc.frame_start, sc.frame_end = 1, 300
sc.render.fps = 24
sc.render.resolution_x, sc.render.resolution_y = 1280, 720
sc.render.resolution_percentage = 100
sc.render.image_settings.file_format = 'PNG'

world = bpy.data.worlds.new("NightStreet")
sc.world = world
world.color = (0.02, 0.025, 0.04)

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
step_pill = link(bpy.data.objects.new("StepPill", rrect_mesh("StepPill", 0.78, 0.042, 0.021)), C_BADGE, (0.12, 0.16, 0.23, 1))
step_text = text_obj("StepText", "", 0.018, seg_reg, C_BADGE, (0.95, 0.95, 0.95, 1), align='LEFT')


def place_overlays(cam):
    hw = (cam.data.sensor_width / 2) / cam.data.lens
    hh = hw * 9 / 16
    s = hw / 0.514
    for ob, loc in ((badge_pill, (0, hh * 0.84, -1.0)), (badge_text, (0, hh * 0.84 - 0.002 * s, -0.999)),
                    (step_pill, (-hw * 0.94 + 0.36 * s, -hh * 0.88, -1.0)),
                    (step_text, (-hw * 0.94 + 0.012 * s, -hh * 0.88 - 0.002 * s, -0.999))):
        ob.parent = cam
        ob.matrix_parent_inverse = Matrix.Identity(4)
        ob.location = loc
        ob.rotation_euler = (0, 0, 0)
        ob.scale = (s, s, s)


def camera(name, lens):
    cd = bpy.data.cameras.new(name)
    cd.lens, cd.clip_start, cd.clip_end = lens, 0.05, 200
    return link(bpy.data.objects.new(name, cd), C_CAM)


def aim(ob, target):
    d = Vector(target) - ob.location
    ob.rotation_euler = d.to_track_quat('-Z', 'Y').to_euler()


def box(name, loc, scale, mat=None):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    ob = link(bpy.context.object)
    ob.name = name
    ob.scale = scale
    if mat:
        ob.data.materials.append(mat)
    return ob


build_cam = camera("BuildCam", 35)
build_cam.location = (0, -8, 2.2)
aim(build_cam, (0, 0, 1.4))


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


# STEP 1 wet street + one puddle
asphalt = principled("Asphalt", (0.02, 0.02, 0.025), 0.72)
box("Street", (0, -1.5, -0.08), (14, 12, 0.08), asphalt)
# puddle reads the neon even without raytracing: a dark glossy disc with a pink emission mix
puddle_m, nt, out = new_mat("Puddle")
b = N(nt, "ShaderNodeBsdfPrincipled", Roughness=0.04)
b.inputs["Base Color"].default_value = (0.01, 0.012, 0.02, 1)
em = N(nt, "ShaderNodeEmission", Color=(0.9, 0.15, 0.35, 1), Strength=0.35)
mx = N(nt, "ShaderNodeMixShader", Fac=0.18)
L(nt, b.outputs[0], mx.inputs[1]); L(nt, em.outputs[0], mx.inputs[2]); L(nt, mx.outputs[0], out.inputs[0])
bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=1.35, depth=0.02, location=(0.2, -2.4, 0.01))
puddle = link(bpy.context.object); puddle.name = "Puddle"
puddle.scale = (1.0, 1.6, 1)
puddle.data.materials.append(puddle_m)
shot(1, "PUDDLE  -  one wet oval in the street")

# STEP 2 one stall
wood = principled("StallWood", (0.18, 0.09, 0.04), 0.65)
red = principled("StallRed", (0.45, 0.05, 0.04), 0.5)
box("BackWall", (0, 1.15, 1.5), (3.2, 0.08, 3.0), wood)
box("SideL", (-1.6, 0.3, 1.3), (0.08, 1.7, 2.6), wood)
box("SideR", (1.6, 0.3, 1.3), (0.08, 1.7, 2.6), wood)
box("Counter", (0, -0.35, 1.0), (3.0, 0.7, 0.08), wood)
box("CounterFace", (0, -0.68, 0.5), (3.0, 0.06, 1.0), red)
box("Roof", (0, 0.15, 3.05), (3.6, 2.4, 0.06), red)
box("RoofPostL", (-1.55, -0.7, 2.0), (0.08, 0.08, 2.0), wood)
box("RoofPostR", (1.55, -0.7, 2.0), (0.08, 0.08, 2.0), wood)
# a door in the back wall, human height, so the neon can be door-sized beside it
box("Door", (0.95, 1.12, 1.05), (0.7, 0.04, 2.0), principled("Door", (0.08, 0.05, 0.03), 0.6))
shot(2, "STALL  -  one counter, one roof, one door")

# STEP 3 bowls the camera will read
broth = principled("Broth", (0.35, 0.12, 0.04), 0.25, emit=(0.55, 0.18, 0.05), estr=0.6)
bowl_m = principled("Bowl", (0.85, 0.82, 0.74), 0.35)
noodle = principled("Noodle", (0.9, 0.82, 0.45), 0.5)
for i, x in enumerate((-0.7, -0.15, 0.4, 0.95)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.16, depth=0.07, location=(x, -0.35, 1.08))
    bowl = link(bpy.context.object); bowl.name = f"Bowl_{i}"
    bowl.data.materials.append(bowl_m)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.12, depth=0.03, location=(x, -0.35, 1.12))
    fill = link(bpy.context.object); fill.name = f"Broth_{i}"
    fill.data.materials.append(broth)
    bpy.ops.mesh.primitive_torus_add(major_radius=0.05, minor_radius=0.012, location=(x, -0.35, 1.15))
    nd = link(bpy.context.object); nd.name = f"Noodle_{i}"
    nd.scale = (1, 1, 0.4)
    nd.data.materials.append(noodle)
# steam cards
steam_m, nt, out = new_mat("Steam")
e = N(nt, "ShaderNodeEmission", Color=(0.9, 0.9, 0.92, 1), Strength=0.4)
tr = N(nt, "ShaderNodeBsdfTransparent")
mx = N(nt, "ShaderNodeMixShader", Fac=0.25)
L(nt, tr.outputs[0], mx.inputs[1]); L(nt, e.outputs[0], mx.inputs[2]); L(nt, mx.outputs[0], out.inputs[0])
try:
    steam_m.surface_render_method = 'BLENDED'
except Exception:
    pass
for i, x in enumerate((-0.7, -0.15, 0.4, 0.95)):
    bpy.ops.mesh.primitive_plane_add(size=0.18, location=(x, -0.35, 1.35))
    st = link(bpy.context.object, C_FX); st.name = f"Steam_{i}"
    st.data.materials.append(steam_m)
    st.visible_shadow = False
    keys(st, "location", [(1, (x, -0.35, 1.22)), (300, (x + 0.05, -0.35, 1.7))], interp='BEZIER')
shot(3, "BOWLS  -  broth, noodles, steam")

# STEP 4 door-sized neon
neon_m = principled("Neon", (1, 0.25, 0.45), 0.3, emit=(1.0, 0.12, 0.35), estr=12)
# door is ~2m tall; the sign matches that height
sign = text_obj("NeonSign", "MIDNIGHT\nBROTH", 0.42, seg_bold, C_SCENE, (1, 0.2, 0.4, 1), spacing=0.96)
sign.location = (-1.55, 1.05, 1.55)
sign.rotation_euler = (math.radians(90), 0, 0)
sign.data.materials.append(neon_m)
# extrude so it has body
sign.data.extrude = 0.02
ld = bpy.data.lights.new("NeonLight", 'AREA')
ld.color = (1.0, 0.2, 0.4)
ld.energy = 250
ld.size = 1.6
lo = link(bpy.data.objects.new("NeonLight", ld), C_FX)
lo.location = (-1.2, 0.4, 1.6)
lo.rotation_euler = (math.radians(90), 0, math.radians(90))
# a practical bulb over the bowls
warm = bpy.data.lights.new("BowlLamp", 'POINT')
warm.color = (1, 0.78, 0.5)
warm.energy = 40
wo = link(bpy.data.objects.new("BowlLamp", warm), C_FX)
wo.location = (0.1, -0.2, 2.4)
shot(4, "NEON  -  door-sized MIDNIGHT BROTH")

# STEP 5 rain
rain_m = principled("Rain", (0.65, 0.7, 0.8), 0.2, emit=(0.45, 0.5, 0.65), estr=0.5)
bm = bmesh.new()
bmesh.ops.create_cone(bm, cap_ends=True, segments=4, radius1=0.008, radius2=0.008, depth=0.45)
rme = bpy.data.meshes.new("RainStreak"); bm.to_mesh(rme); bm.free()
streak = link(bpy.data.objects.new("RainStreak", rme), C_FX)
streak.location = (0, 0, -20)
streak.data.materials.append(rain_m)
streak.hide_render = streak.hide_viewport = True
streak.visible_shadow = False
bpy.ops.mesh.primitive_plane_add(size=16, location=(0, -1, 8))
emitter = link(bpy.context.object, C_FX); emitter.name = "RainEmitter"
emitter.rotation_euler = (math.radians(188), 0, math.radians(8))
emitter.show_instancer_for_render = False
emitter.show_instancer_for_viewport = False
emitter.modifiers.new("rain", 'PARTICLE_SYSTEM')
ps = emitter.particle_systems[-1]
s = ps.settings
s.count, s.frame_start, s.frame_end = 9000, 1, 300
s.lifetime = 22
s.emit_from = 'FACE'
s.normal_factor, s.factor_random = 14, 1.0
s.render_type, s.instance_object = 'OBJECT', streak
s.particle_size, s.size_random = 1, 0.4
ps.point_cache.frame_start, ps.point_cache.frame_end = 1, 300
ps.point_cache.use_disk_cache = True
bpy.ops.wm.save_as_mainfile(filepath=BLEND)
bpy.ops.ptcache.bake_all(bake=True)
print("BAKED rain")
shot(5, "RAIN  -  falling into the puddle")

# STEP 6 stools, still one stall
stool = principled("Stool", (0.12, 0.08, 0.05), 0.5)
for i, x in enumerate((-0.8, 0.15)):
    bpy.ops.mesh.primitive_cylinder_add(radius=0.16, depth=0.04, location=(x, -1.15, 0.62))
    top = link(bpy.context.object); top.name = f"Stool_{i}"
    top.data.materials.append(stool)
    bpy.ops.mesh.primitive_cylinder_add(radius=0.04, depth=0.6, location=(x, -1.15, 0.3))
    leg = link(bpy.context.object); leg.name = f"StoolLeg_{i}"
    leg.data.materials.append(stool)
shot(6, "STOOLS  -  two seats, still one stall")

# STEP 7 night world
try:
    world.use_nodes = True
except Exception:
    pass
wnt = world.node_tree
for n in list(wnt.nodes):
    wnt.nodes.remove(n)
wout = wnt.nodes.new("ShaderNodeOutputWorld")
bg = N(wnt, "ShaderNodeBackground", Color=(0.01, 0.012, 0.02, 1), Strength=1.0)
L(wnt, bg.outputs[0], wout.inputs[0])
moon = bpy.data.lights.new("Moon", 'SUN')
moon.color = (0.55, 0.62, 0.8)
moon.energy = 0.35
moon.angle = math.radians(4)
mo = link(bpy.data.objects.new("Moon", moon), C_FX)
mo.rotation_euler = (math.radians(55), 0, math.radians(20))
shot(7, "NIGHT  -  the stall is the only warm thing")

# STEP 8 camera reads the bowls
hero = camera("HeroCam", 40)
target = link(bpy.data.objects.new("HeroTarget", None), C_CAM)
tt = hero.constraints.new('TRACK_TO')
tt.target = target
tt.track_axis = 'TRACK_NEGATIVE_Z'
tt.up_axis = 'UP_Y'
# start wide enough to read the door-sized neon, end low and close on the bowls
keys(hero, "location", [(1, (1.2, -6.5, 2.0)), (140, (0.2, -3.2, 1.55)), (300, (0.15, -1.55, 1.28))], interp='BEZIER')
keys(target, "location", [(1, (-0.4, 0.4, 1.6)), (140, (0.1, -0.2, 1.2)), (300, (0.15, -0.35, 1.12))], interp='BEZIER')

title_mat, nt, out = new_mat("TitleCard")
e = N(nt, "ShaderNodeEmission", Color=(1.0, 0.35, 0.5, 1), Strength=3.0)
tr = N(nt, "ShaderNodeBsdfTransparent")
mx = N(nt, "ShaderNodeMixShader", Fac=0.0)
L(nt, tr.outputs[0], mx.inputs[1]); L(nt, e.outputs[0], mx.inputs[2]); L(nt, mx.outputs[0], out.inputs[0])
keys(mx.inputs["Fac"], "default_value", [(1, 0.0), (240, 0.0), (268, 1.0)])
rig = link(bpy.data.objects.new("TitleRig", None), C_TITLE)
rig.parent = hero
rig.matrix_parent_inverse = Matrix.Identity(4)
rig.location = (0, 0.15, -1.15)
PINK = (1, 0.4, 0.55, 1)
t1 = text_obj("Title", "MIDNIGHT BROTH", 0.055, georgia, C_TITLE, PINK, spacing=1.05)
t1.parent = rig
t1.matrix_parent_inverse = Matrix.Identity(4)
t1.location = (0, 0, 0)
t1.data.materials.append(title_mat)
t1.visible_shadow = False
shot(8, "HERO  -  camera reads the bowls, title MIDNIGHT BROTH", cam=hero)

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
