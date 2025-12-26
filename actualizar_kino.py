import requests, json
from bs4 import BeautifulSoup

URL = "https://chileresultados.com/kino/ultimosorteo"
ARCHIVO = "data/kino.json"

soup = BeautifulSoup(requests.get(URL).text, "html.parser")

sorteo = soup.select_one("span.numero-sorteo").text.strip()
fecha = soup.select_one("span.fecha-sorteo").text.strip()
numeros = [int(n.text) for n in soup.select("ul.bolas li")]

nuevo = {"sorteo": sorteo, "fecha": fecha, "numeros": numeros}

data = json.load(open(ARCHIVO, encoding="utf-8"))
if any(s["sorteo"] == sorteo for s in data):
    exit(0)

data.insert(0, nuevo)
json.dump(data, open(ARCHIVO, "w", encoding="utf-8"), indent=2, ensure_ascii=False)
