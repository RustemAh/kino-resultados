import requests
from bs4 import BeautifulSoup
import json

URL = "https://chileresultados.com/kino/ultimosorteo"
ARCHIVO = "data/kino.json"

HEADERS = {
    "User-Agent": "Mozilla/5.0 (compatible; KinoBot/1.0)"
}

# 1️⃣ Descargar página
resp = requests.get(URL, headers=HEADERS, timeout=15)
resp.raise_for_status()
soup = BeautifulSoup(resp.text, "html.parser")

# 2️⃣ Función CLAVE: extraer números por sección
def extraer_numeros_por_titulo(texto_titulo):
    """
    Busca un título (h2 o h3) que contenga el texto
    y extrae SOLO los números que pertenecen a esa sección
    """
    titulo = soup.find(
        lambda tag: tag.name in ["h2", "h3"] and texto_titulo.lower() in tag.text.lower()
    )
    if not titulo:
        return []

    # El contenedor real está justo después del título
    contenedor = titulo.find_next("div")
    if not contenedor:
        return []

    return [
        int(n.text.strip())
        for n in contenedor.select("li")
        if n.text.strip().isdigit()
    ]

# 3️⃣ Extraer datos generales
sorteo = soup.find("h1").text.strip().split("Sorteo")[1].strip()
fecha = soup.find("h1").text.strip().split("de")[-1].strip()

# 4️⃣ Extraer CADA juego correctamente
kino = extraer_numeros_por_titulo("Sorteo KINO")
rekino = extraer_numeros_por_titulo("Sorteo ReKino")
requete = extraer_numeros_por_titulo("Requete KINO")
premios_especiales = extraer_numeros_por_titulo("Premios Especiales")
chao_jefe_2m = extraer_numeros_por_titulo("Chao Jefe $2")
chao_jefe_3m = extraer_numeros_por_titulo("Chao Jefe $3")
super_combo = extraer_numeros_por_titulo("Súper Combo Marraqueta")

# 5️⃣ Construir sorteo final
nuevo_sorteo = {
    "sorteo": sorteo,
    "fecha": fecha,
    "juegos": {
        "kino": kino,
        "rekino": rekino,
        "requete_kino": requete,
        "premios_esp_
