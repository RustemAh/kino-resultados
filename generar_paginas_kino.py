import json, os

os.makedirs("kino", exist_ok=True)
data = json.load(open("data/kino.json", encoding="utf-8"))

for s in data:
    bolas = "".join(f"<div class='bola'>{n}</div>" for n in s["numeros"])
    html = f"""
<!DOCTYPE html>
<html><head>
<title>Resultado KINO {s['sorteo']}</title>
<link rel="stylesheet" href="../style.css">
</head>
<body>
<h1>Sorteo KINO {s['sorteo']}</h1>
<p>{s['fecha']}</p>
<div class="bolas">{bolas}</div>
<p><a href="../index.html">Volver</a></p>
</body></html>
"""
    open(f"kino/{s['sorteo']}.html", "w", encoding="utf-8").write(html)
