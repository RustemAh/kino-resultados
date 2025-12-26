import requests
from bs4 import BeautifulSoup
import json
import re

URL = "https://chileresultados.com/kino/ultimosorteo"
ARCHIVO = "data/kino.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; KinoBot/1.0)"
}

html = requests.get(URL, headers=HEADERS, timeout=15).text
soup = BeautifulSoup(html, "html.parser")

# ---------- 1️⃣ sorteo y fecha ----------
h1 = soup.find("h1")
texto = h1.get_text(" ", strip=True)

sorteo = re.search(r"KINO\s+(\d+)", texto).group(1)
fecha = re.search(r"(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})", texto).group(1)

# ---------- 2️⃣ mapa final ----------
juegos = {
    "kino": [],
    "rekino": [],
    "requete_kino": [],
    "premios_especiales": [],
    "chao_jefe_2m": [],
    "chao_jefe_3m": [],
    "super_combo_marraqueta": []
}

# ---------- 3️⃣ recorrer bloques reales ----------
bloques = soup.select("section, article, div")

for bloque in bloques:
    titulo = bloque.find(["h2", "h3"])
    if not titulo:
        continue

    t = titulo.get_text(strip=True).lower()

    numeros = [
        int(li.text.strip())
        for li in bloque.select("li")
        if li.text.strip().isdigit()
    ]

    if not numeros:
        continue

    if "sorteo kino" in t:
        juegos["kino"] = numeros
    elif "rekino" in t:
        juegos["rekino"] = numeros
    elif "requete" in t:
        juegos["requete_kino"] = numeros
    elif "premios especiales" in t:
        juegos["premios_especiales"] = numeros
    elif "chao jefe" in t and "2" in t:
        juegos["chao_jefe_2m"] = numeros
    elif "chao jefe" in t and "3" in t:
        juegos["chao_jefe_3m"] = numeros
    elif "marraqueta" in t:
        juegos["super_combo_marraqueta"] = numeros

# ---------- 4️⃣ guardar ----------
nuevo = {
    "sorteo": sorteo,
    "fecha": fecha,
    "juegos": juegos
}

with open(ARCHIVO, "r", encoding="utf-8") as f:
    data = json.load(f)

if any(s["sorteo"] == sorteo for s in data):
    print("✔ Sorteo ya existe")
    exit(0)

data.insert(0, nuevo)

with open(ARCHIVO, "w", encoding="utf-8") as f:
    json.dump(data, f, indent=2, ensure_ascii=False)

print("✅ Sorteo KINO actualizado correctamente")
