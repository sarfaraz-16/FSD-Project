import zipfile, xml.etree.ElementTree as ET, sys

def dx(p):
    try:
        with zipfile.ZipFile(p) as z:
            t = ET.XML(z.read('word/document.xml'))
            return '\n'.join(''.join(n.text for n in pa.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}t') if n.text) for pa in t.iter('{http://schemas.openxmlformats.org/wordprocessingml/2006/main}p'))
    except Exception as e: return str(e)

def px(p):
    try:
        with zipfile.ZipFile(p) as z:
            r = []
            for f in z.namelist():
                if f.startswith('ppt/slides/') and f.endswith('.xml'):
                    t = ET.XML(z.read(f))
                    for n in t.iter('{http://schemas.openxmlformats.org/drawingml/2006/main}t'):
                        if n.text: r.append(n.text)
            return '\n'.join(r)
    except Exception as e: return str(e)

d = sys.argv[1]
p = sys.argv[2]
print('DOCX:\n' + dx(d) + '\n\nPPTX:\n' + px(p))
