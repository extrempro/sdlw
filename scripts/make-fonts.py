"""Erzeugt die eingebetteten Schriften (fonts/*.woff) aus den Original-Downloads von Google Fonts.

Aufruf: python3 scripts/make-fonts.py <Ordner mit Bricolage_Grotesque/ und Atkinson_Hyperlegible/>
Braucht fontTools (pip install fonttools). Danach die Base64-Daten mit
python3 scripts/make-fonts.py --css in src/entdeckerheft.html übernehmen (Block FONTS).
"""
import sys, os, base64
from fontTools.ttLib import TTFont
from fontTools import subset
from fontTools.varLib import instancer

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "fonts")
# Zeichen: Grundlatein, Latin-1 (ä ö ü ß …), typografische Zeichen („ “ – … • ·), Euro, Pfeile, Minus
UNI = "U+0020-007E,U+00A0-00FF,U+0152-0153,U+2010-2027,U+2030-203A,U+20AC,U+2122,U+2190-2193,U+2212"

def sub(font, out):
    opt = subset.Options(); opt.flavor = "woff"; opt.layout_features = ["*"]; opt.name_IDs = ["*"]
    s = subset.Subsetter(opt); s.populate(unicodes=subset.parse_unicodes(UNI)); s.subset(font)
    font.flavor = "woff"; font.save(out); print(out, os.path.getsize(out))

def build(src):
    v = TTFont(os.path.join(src, "Bricolage_Grotesque", "BricolageGrotesque-VariableFont_opsz,wdth,wght.ttf"))
    v = instancer.instantiateVariableFont(v, {"wdth": 100, "wght": (600, 800), "opsz": (12, 96)})
    sub(v, os.path.join(OUT, "bricolage-grotesque-600-800.woff"))
    for w, n in (("400", "Regular"), ("700", "Bold")):
        sub(TTFont(os.path.join(src, "Atkinson_Hyperlegible", f"AtkinsonHyperlegible-{n}.ttf")), os.path.join(OUT, f"atkinson-hyperlegible-{w}.woff"))

def css():
    b64 = lambda f: base64.b64encode(open(os.path.join(OUT, f), "rb").read()).decode()
    print("/* FONTS: eingebettet, SIL Open Font License 1.1 (siehe fonts/) */")
    print("@font-face{font-family:'Bricolage Grotesque';font-style:normal;font-weight:600 800;font-display:swap;src:url(data:font/woff;base64,%s) format('woff')}" % b64("bricolage-grotesque-600-800.woff"))
    for w in ("400", "700"):
        print("@font-face{font-family:'Atkinson Hyperlegible';font-style:normal;font-weight:%s;font-display:swap;src:url(data:font/woff;base64,%s) format('woff')}" % (w, b64(f"atkinson-hyperlegible-{w}.woff")))
    print("/* /FONTS */")

if __name__ == "__main__":
    css() if sys.argv[1:] == ["--css"] else build(sys.argv[1])
