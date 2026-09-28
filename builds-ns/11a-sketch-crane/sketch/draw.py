"""Graphite studies on cream paper. Not a render."""
import math
import random
from PIL import Image, ImageDraw, ImageFilter

random.seed(11)

def paper(w, h):
    img = Image.new("RGB", (w, h), (236, 226, 206))
    px = img.load()
    for y in range(h):
        for x in range(0, w, 2):
            n = random.randint(-10, 8)
            r, g, b = px[x, y]
            px[x, y] = (max(0, r + n), max(0, g + n - 1), max(0, b + n - 2))
            if x + 1 < w:
                px[x + 1, y] = px[x, y]
    return img

def wobble(pts, amp=1.4, phase=0.0):
    out = []
    for i, (x, y) in enumerate(pts):
        out.append((
            x + math.sin(i * 0.73 + phase) * amp + random.uniform(-0.4, 0.4),
            y + math.cos(i * 0.61 + phase) * amp + random.uniform(-0.4, 0.4),
        ))
    return out

def stroke(draw, pts, fill, width, passes=3, amp=1.3):
    for p in range(passes):
        draw.line(wobble(pts, amp, p * 1.7), fill=fill, width=width, joint="curve")

def hatch(draw, x0, y0, x1, y1, gap, color, width=1):
    y = y0
    while y < y1:
        stroke(draw, [(x0, y), (x1, y + 8)], color, width, passes=1, amp=0.6)
        y += gap

INK = (48, 44, 40)
MID = (78, 72, 66)
LIGHT = (110, 102, 94)

def crane(path):
    img = paper(1280, 900)
    d = ImageDraw.Draw(img)
    # dock
    stroke(d, [(80, 760), (1180, 748)], INK, 3, 2, 1.2)
    hatch(d, 120, 770, 1100, 860, 14, LIGHT, 1)
    # mast
    stroke(d, [(360, 740), (350, 180)], INK, 4, 3)
    stroke(d, [(420, 740), (430, 190)], INK, 4, 3)
    stroke(d, [(350, 190), (430, 190)], INK, 3, 2)
    # heel pin
    stroke(d, [(250, 700), (360, 690)], INK, 5, 2)
    d.ellipse((330, 672, 372, 712), outline=INK, width=3)
    # cab
    stroke(d, [(300, 250), (300, 140), (520, 130), (530, 250), (300, 250)], INK, 3, 2)
    stroke(d, [(340, 200), (400, 195), (400, 160), (338, 164), (340, 200)], MID, 2, 2)
    hatch(d, 310, 210, 510, 245, 8, LIGHT, 1)
    # jib
    stroke(d, [(430, 150), (1120, 210)], INK, 4, 3)
    stroke(d, [(450, 190), (1100, 248)], INK, 3, 2)
    for x in range(500, 1080, 70):
        y0 = 150 + (x - 430) * 0.09
        y1 = 190 + (x - 450) * 0.09
        stroke(d, [(x, y0), (x + 10, y1)], MID, 2, 1, 0.4)
    # cable + crate
    stroke(d, [(860, 230), (860, 520)], INK, 2, 3, 0.8)
    stroke(d, [(780, 520), (780, 680), (960, 690), (955, 525), (780, 520)], INK, 3, 2)
    hatch(d, 790, 540, 940, 670, 10, MID, 1)
    # notes
    d.text((90, 70), "harbor crane  —  pin at the heel", fill=MID)
    img.filter(ImageFilter.SMOOTH_MORE).save(path, "JPEG", quality=86)
    print("wrote", path)

def chair(path):
    img = paper(1100, 1400)
    d = ImageDraw.Draw(img)
    # back posts
    stroke(d, [(340, 180), (360, 980)], INK, 4, 3)
    stroke(d, [(760, 170), (740, 980)], INK, 4, 3)
    # crest
    stroke(d, [(340, 190), (550, 140), (760, 185)], INK, 3, 3, 1.6)
    # slats
    for x in (430, 510, 590, 670):
        stroke(d, [(x, 230), (x + 8, 620)], MID, 2, 2, 0.7)
    # seat
    stroke(d, [(250, 640), (860, 620), (820, 760), (230, 770), (250, 640)], INK, 3, 2)
    hatch(d, 270, 680, 800, 750, 9, LIGHT, 1)
    # book
    stroke(d, [(470, 600), (680, 590), (690, 650), (480, 658), (470, 600)], INK, 2, 2)
    hatch(d, 490, 610, 670, 645, 7, MID, 1)
    # legs
    stroke(d, [(300, 760), (250, 1240)], INK, 4, 3)
    stroke(d, [(400, 760), (370, 1240)], INK, 3, 2)
    stroke(d, [(700, 750), (760, 1240)], INK, 4, 3)
    stroke(d, [(790, 750), (860, 1230)], INK, 3, 2)
    # rails
    stroke(d, [(280, 1000), (400, 990)], INK, 3, 2)
    stroke(d, [(740, 990), (840, 1005)], INK, 3, 2)
    # dowel callout
    d.ellipse((250, 860, 310, 920), outline=INK, width=3)
    stroke(d, [(310, 890), (430, 860)], MID, 2, 1, 0.5)
    d.text((440, 830), "dowel", fill=MID)
    d.text((80, 60), "kitchen chair  —  one dowel", fill=MID)
    img.filter(ImageFilter.SMOOTH_MORE).save(path, "JPEG", quality=86)
    print("wrote", path)

def well(path):
    img = paper(1200, 1200)
    d = ImageDraw.Draw(img)
    # shaft
    d.ellipse((160, 140, 1040, 1040), outline=INK, width=4)
    d.ellipse((230, 210, 970, 970), outline=MID, width=2)
    hatch(d, 180, 160, 1020, 220, 8, LIGHT, 1)
    # spiral treads
    cx, cy = 600, 590
    for i in range(12):
        a0 = -0.4 + i * 0.48
        a1 = a0 + 0.42
        r0, r1 = 180 + i * 8, 340
        p0 = (cx + math.cos(a0) * r0, cy + math.sin(a0) * r0 * 0.92)
        p1 = (cx + math.cos(a0) * r1, cy + math.sin(a0) * r1 * 0.92)
        p2 = (cx + math.cos(a1) * r1, cy + math.sin(a1) * r1 * 0.92)
        p3 = (cx + math.cos(a1) * r0, cy + math.sin(a1) * r0 * 0.92)
        stroke(d, [p0, p1, p2, p3, p0], INK if i != 2 else (90, 55, 40), 2, 2, 0.8)
        if i % 2 == 0:
            hatch(d, p0[0], p0[1], p2[0], p2[1], 7, LIGHT, 1)
    # bucket + rope
    stroke(d, [(cx, 250), (cx, 560)], INK, 2, 3, 0.5)
    d.ellipse((cx - 36, 540, cx + 36, 610), outline=INK, width=3)
    stroke(d, [(cx - 30, 575), (cx + 30, 575)], MID, 2, 1, 0.3)
    d.text((80, 50), "spiral well  —  one tread", fill=MID)
    d.text((430, 1080), "bucket on the rope", fill=MID)
    img.filter(ImageFilter.SMOOTH_MORE).save(path, "JPEG", quality=86)
    print("wrote", path)

if __name__ == "__main__":
    crane(r"C:\Users\simon\Downloads\cursor_build\builds-ns\11a-sketch-crane\sketch\crane.jpg")
    chair(r"C:\Users\simon\Downloads\cursor_build\builds-ns\11b-sketch-chair\sketch\chair.jpg")
    well(r"C:\Users\simon\Downloads\cursor_build\builds-ns\11c-sketch-well\sketch\well.jpg")
