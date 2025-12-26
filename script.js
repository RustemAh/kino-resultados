// ===============================
// CONFIGURACIÓN
// ===============================
const SHEET_ID = "1a4XxgaYrixLeSQ0EOnI4thHA-_075uVAxQvvGlGhxQA";
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:json`;

// ===============================
// DOM
// ===============================
const contenedor = document.getElementById("resultados");
const selectSorteo = document.getElementById("selectSorteo");
const selectFecha = document.getElementById("selectFecha");

const bannerTexto = document.getElementById("bannerTexto");
const bannerMonto = document.getElementById("bannerMonto");

// ===============================
// FETCH GOOGLE SHEETS
// ===============================
fetch(URL)
  .then(r => r.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));

    // Normalizar encabezados + capturar logos
    const colMap = {};
    json.table.cols.forEach((c, i) => {
      const partes = c.label.trim().split(" ");
      const key = partes[0].toLowerCase();
      const logo = partes.find(p => p.startsWith("http")) || null;
      colMap[key] = { index: i, logo };
    });

    const data = json.table.rows.map(row => {
      const get = key =>
        row.c[colMap[key]?.index]
          ? row.c[colMap[key].index].v
          : "";

      return {
        sorteo: get("sorteo")?.toString() || "",
        fecha: formatearFecha(get("fecha")),
        monto: get("monto") || "",
        numero_carton: get("numero_carton") || "",
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
    });

    cargarSelectores(data);
    render([data[0]]);
    renderBanner(data[0]);
  })
  .catch(err => {
    console.error(err);
    contenedor.innerHTML = "<p>Error cargando datos</p>";
  });

// ===============================
// HELPERS
// ===============================
function parseNums(valor) {
  if (!valor) return [];
  return valor
    .toString()
    .split(",")
    .map(n => parseInt(n.trim()))
    .filter(n => !isNaN(n));
}

function formatearFecha(fecha) {
  if (!fecha) return "";

  if (typeof fecha === "string" && fecha.startsWith("Date(")) {
    const match = fecha.match(/Date\((\d+),(\d+),(\d+)\)/);
    if (match) {
      const y = match[1];
      const m = String(Number(match[2]) + 1).padStart(2, "0");
      const d = String(match[3]).padStart(2, "0");
      return `${d}-${m}-${y}`;
    }
  }

  if (fecha instanceof Date) {
    const d = String(fecha.getDate()).padStart(2, "0");
    const m = String(fecha.getMonth() + 1).padStart(2, "0");
    const y = fecha.getFullYear();
    return `${d}-${m}-${y}`;
  }

  if (typeof fecha === "string" && fecha.includes("-")) {
    const [y, m, d] = fecha.split("-");
    return `${d}-${m}-${y}`;
  }

  return fecha.toString();
}

function nombreCategoria(key) {
  return {
    kino: "Kino",
    rekino: "Rekino",
    requete_kino: "Requete Kino",
    premios_especiales: "Premios Especiales",
    chao_jefe_2m: "Chao Jefe 2 Millones",
    chao_jefe_3m: "Chao Jefe 3 Millones",
    super_combo_marraqueta: "Super Combo Marraqueta"
  }[key] || key.replace(/_/g, " ").replace(/\b\w/g, l => l.toUpperCase());
}

// ===============================
// RENDER RESULTADOS
// ===============================
function render(data) {
  contenedor.innerHTML = "";

  data.forEach(s => {
    let html = `
      <div class="card">
        <h2>Sorteo KINO ${s.sorteo}</h2>
        <small>${s.fecha}</small>
        ${s.numero_carton ? `<p><strong>N° Cartón:</strong> ${s.numero_carton}</p>` : ""}
    `;

    for (const [key, juego] of Object.entries(s.juegos)) {
      if (!juego.nums.length) continue;

      html += `
        <h3>
          ${juego.logo ? `<img src="${juego.logo}" alt="${key}">` : ""}
          ${nombreCategoria(key)}
        </h3>
        <div class="bolas">
          ${juego.nums.map(n => `<div class="bola">${n}</div>`).join("")}
        </div>
      `;
    }

    html += `</div>`;
    contenedor.innerHTML += html;
  });
}

// ===============================
// SELECTORES
// ===============================
function cargarSelectores(data) {
  selectSorteo.innerHTML = `<option value="">Selecciona sorteo</option>`;
  selectFecha.innerHTML = `<option value="">Selecciona fecha</option>`;

  data.forEach(s => {
    selectSorteo.innerHTML += `<option value="${s.sorteo}">${s.sorteo}</option>`;
    selectFecha.innerHTML += `<option value="${s.fecha}">${s.fecha}</option>`;
  });

  selectSorteo.onchange = selectFecha.onchange = () => {
    const filtrado = data.filter(s =>
      (!selectSorteo.value || s.sorteo === selectSorteo.value) &&
      (!selectFecha.value || s.fecha === selectFecha.value)
    );

    if (filtrado.length) {
      render(filtrado);
      renderBanner(filtrado[0]);
    }
  };
}

// ===============================
// BANNER
// ===============================
function renderBanner(s) {
  bannerTexto.textContent =
    `Próximo Sorteo N° ${parseInt(s.sorteo) + 1} – ${s.fecha}`;
  bannerMonto.textContent =
    `$${Number(s.monto).toLocaleString("es-CL")}`;
}
