// ===============================
// CONFIGURACIÓN
// ===============================
const SHEET_ID = "1a4XxgaYrixLeSQ0EOnI4thHA-_075uVAxQvvGlGhxQA";
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// DOM
const contenedor = document.getElementById("resultados");
const selectSorteo = document.getElementById("selectSorteo");
const selectFecha = document.getElementById("selectFecha");
const bannerTexto = document.getElementById("bannerTexto");
const bannerMonto = document.getElementById("bannerMonto");

const btnEmbed = document.getElementById("btnEmbed");
const embedBox = document.getElementById("embedBox");
const embedCode = document.getElementById("embedCode");
const copyEmbed = document.getElementById("copyEmbed");

let ALL_DATA = [];

// ===============================
// UI: EMBED
// ===============================
btnEmbed?.addEventListener("click", () => {
  const visible = !embedBox.hidden;
  embedBox.hidden = visible;
  btnEmbed.textContent = visible ? "Mostrar embed" : "Ocultar embed";
});

copyEmbed?.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(embedCode.value);
    copyEmbed.textContent = "Copiado ✅";
    setTimeout(() => (copyEmbed.textContent = "Copiar"), 1200);
  } catch {
    embedCode.select();
  }
});

// ===============================
// FETCH Y LÓGICA INICIAL
// ===============================
fetch(URL)
  .then(r => r.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));

    const colMap = {};
    json.table.cols.forEach((c, i) => {
      const partes = c.label.trim().split(" ");
      const key = partes[0].toLowerCase().trim();
      const logo = partes.find(p => p.startsWith("http")) || null;
      colMap[key] = { index: i, logo };
    });

    ALL_DATA = json.table.rows
      .map(row => {
        const get = key => row.c[colMap[key]?.index]?.v || "";
        if (!get("sorteo")) return null;

        return {
          sorteo: get("sorteo").toString(),
          fecha: formatearFecha(get("fecha")),
          monto: normalizarMonto(get("monto")),
          numero_carton: get("numero_carton"),
          juegos: {
            kino: { nums: parseNums(get("kino")), logo: colMap.kino?.logo },
            rekino: { nums: parseNums(get("rekino")), logo: colMap.rekino?.logo },
            requete_kino: { nums: parseNums(get("requete_kino")), logo: colMap.requete_kino?.logo },
            premios_especiales: { nums: parseNums(get("premios_especiales")), logo: colMap.premios_especiales?.logo },
            chao_jefe_2m: { nums: parseNums(get("chao_jefe_2m")), logo: colMap.chao_jefe_2m?.logo },
            chao_jefe_3m: { nums: parseNums(get("chao_jefe_3m")), logo: colMap.chao_jefe_3m?.logo },
            super_combo_marraqueta: { nums: parseNums(get("super_combo_marraqueta")), logo: colMap.super_combo_marraqueta?.logo }
          }
        };
      })
      .filter(Boolean)
      .sort((a, b) => Number(b.sorteo) - Number(a.sorteo));

    cargarSelectores(ALL_DATA);

    // ✅ MANEJO DE PARÁMETROS URL
    const params = new URLSearchParams(location.search);
    const sorteoParam = params.get("sorteo");
    const embedMode = params.get("embed") === "1";

    if (embedMode) document.body.classList.add("is-embed");

    if (sorteoParam) {
      const item = ALL_DATA.find(s => s.sorteo === sorteoParam);
      if (item) {
        selectSorteo.value = item.sorteo;
        aplicarFiltros();
      } else { cargarUltimo(); }
    } else {
      cargarUltimo();
    }
  });

function cargarUltimo() {
  if (ALL_DATA.length) {
    render([ALL_DATA[0]]);
    renderBanner(ALL_DATA[0]);
    actualizarEmbed(ALL_DATA[0].sorteo);
  }
}

function aplicarFiltros() {
  const sVal = selectSorteo.value;
  const fVal = selectFecha.value;

  const filtrado = ALL_DATA.filter(s =>
    (!sVal || s.sorteo === sVal) && (!fVal || s.fecha === fVal)
  );

  if (filtrado.length) {
    render(filtrado);
    renderBanner(filtrado[0]);
    actualizarEmbed(filtrado[0].sorteo);
    pushUrl(filtrado[0].sorteo);
    // Sincronizar select de fecha si se eligió sorteo
    if (sVal) selectFecha.value = filtrado[0].fecha;
  }
}

function pushUrl(sorteo) {
  const url = new URL(window.location);
  url.searchParams.set("sorteo", sorteo);
  if (url.searchParams.get("embed") !== "1") url.searchParams.delete("embed");
  history.replaceState({}, "", url);
}

function actualizarEmbed(sorteo) {
  const base = `${location.origin}${location.pathname}`;
  const src = `${base}?sorteo=${sorteo}&embed=1`;
  embedCode.value = `<iframe src="${src}" width="100%" height="1600" style="border:0;border-radius:12px;overflow:hidden" loading="lazy"></iframe>`;
  btnEmbed.disabled = false;
}

// ===============================
// HELPERS (Mantenidos de tu original)
// ===============================
function parseNums(v) {
  if (!v) return [];
  return v.toString().split(/[\n,]+/).map(n => parseInt(n.trim(), 10)).filter(n => !isNaN(n));
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) { chunks.push(arr.slice(i, i + size)); }
  return chunks;
}

function formatearFecha(f) {
  if (typeof f === "string" && f.startsWith("Date")) {
    const [, y, m, d] = f.match(/Date\((\d+),(\d+),(\d+)\)/);
    return `${d.padStart(2, "0")}-${String(+m + 1).padStart(2, "0")}-${y}`;
  }
  return f;
}

function normalizarMonto(m) {
  if (!m) return 0;
  if (typeof m === "number") return m;
  return Number(m.toString().replace(/[^\d]/g, "")) || 0;
}

function nombreCategoria(key) {
  return {
    kino: "Kino", rekino: "Rekino", requete_kino: "Requete Kino",
    premios_especiales: "Premios Especiales", chao_jefe_2m: "Chao Jefe 2 Millones",
    chao_jefe_3m: "Chao Jefe 3 Millones", super_combo_marraqueta: "Super Combo Marraqueta"
  }[key];
}

function cargarSelectores(data) {
  selectSorteo.innerHTML = `<option value="">Selecciona sorteo</option>` + 
    data.map(s => `<option value="${s.sorteo}">${s.sorteo}</option>`).join("");
  
  const fechasUnicas = [...new Set(data.map(s => s.fecha))];
  selectFecha.innerHTML = `<option value="">Selecciona fecha</option>` + 
    fechasUnicas.map(f => `<option value="${f}">${f}</option>`).join("");

  selectSorteo.onchange = selectFecha.onchange = aplicarFiltros;
}

function render(data) {
  contenedor.innerHTML = "";
  data.forEach(s => {
    let html = `<div class="card"><h2>Sorteo KINO ${s.sorteo}</h2><small>${s.fecha}</small>`;
    for (const [key, juego] of Object.entries(s.juegos)) {
      if (!juego.nums.length) continue;
      const grupos = chunkArray(juego.nums, 14);
      html += `<h3><img src="${juego.logo}"> ${nombreCategoria(key)}</h3>`;
      grupos.forEach(grupo => {
        html += `<div class="bolas grupo">${grupo.map(n => `<div class="bola">${n}</div>`).join("")}</div>`;
      });
    }
    if (s.numero_carton) {
      html += `<h3><img src="https://www.loteria.cl/LoteriaWeb/content/img/resultados/kino/subproductos/pc.png"> Premios al Número de Cartón</h3>
               <div class="cartones">${s.numero_carton.toString().split(",").map(c => `<span class="carton">${c.trim()}</span>`).join("")}</div>`;
    }
    html += `</div>`;
    contenedor.innerHTML += html;
  });
}

function renderBanner(s) {
  bannerTexto.textContent = `Próximo Sorteo N° ${Number(s.sorteo) + 1} – ${calcularProximaFecha(s.fecha)}`;
  bannerMonto.textContent = `$${s.monto.toLocaleString("es-CL")}`;
}

function calcularProximaFecha(f) {
  const [d, m, y] = f.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + (date.getDay() === 0 ? 3 : 2));
  return date.toLocaleDateString("es-CL");
}
