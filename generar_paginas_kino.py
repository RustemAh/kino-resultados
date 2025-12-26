import json, os

os.makedirs("kino", exist_ok=True)
data = json.load(open("data/kino.json", encoding="utf-8"))

for s in data:
    html = f"""<!DOCTYPE html>
<html><head>
<title>Resultado KINO {s['sorteo']}</title>
<link rel="stylesheet" href="../style.css">
</head><body>
<h1>Sorteo KINO {s['sorteo']}</h1>
<p>{s['fecha']}</p>
"""
    for k, nums in s["juegos"].items():
        if nums:
            html += f"<h3>{k}</h3><div class='bolas'>"
            html += "".join(f"<div class='bola'>{n}</div>" for n in nums)
            html += "</div>"
    html += "<p><a href='../index.html'>Volver</a></p></body></html>"
    open(f"kino/{s['sorteo']}.html","w",encoding="utf-8").write(html)
