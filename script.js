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
// FETCH
// ===============================
fetch(URL)
  .then(r => r.text())
  .then(text => {
    const json = JSON.parse(text.substring(47).slice(0, -2));

    // Mapear columnas
    const colMap = {};
    json.table.cols.forEach((c, i) => {
      const partes = c.label.trim().split(" ");
      const key = partes[0].toLowerCase().trim();
      const logo = partes.find(p => p.startsWith("http")) || null;
      colMap[key] = { index: i, logo };
    });

    // Construir data válida
    const data = json.table.rows
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
            premios_especiales: {
              nums: parseNums(get("premios_especiales")),
              logo: colMap.premios_especiales?.logo
            },
            chao_jefe_2m: { nums: parseNums(get("chao_jefe_2m")), logo: colMap.chao_jefe_2m?.logo },
            chao_jefe_3m: { nums: parseNums(get("chao_jefe_3m")), logo: colMap.chao_jefe_3m?.logo },
            super_combo_marraqueta: {
              nums: parseNums(get("super_combo_marraqueta")),
              logo: colMap.super_combo_marraqueta?.logo
            }
          }
        };
      })
      .filter(Boolean);

    if (!data.length) {
      contenedor.innerHTML = "<p>No hay datos disponibles</p>";
      return;
    }

    // Ordenar por sorteo descendente
    data.sort((a, b) => Number(b.sorteo) - Number(a.sorteo));

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
function parseNums(v) {
  if (!v) return [];
  return v
    .toString()
    .split(/[\n,]+/)
    .map(n => parseInt(n.trim(), 10))
    .filter(n => !isNaN(n));
}

function chunkArray(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size));
  }
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
    kino: "Kino",
    rekino: "Rekino",
    requete_kino: "Requete Kino",
    premios_especiales: "Premios Especiales",
    chao_jefe_2m: "Chao Jefe 2 Millones",
    chao_jefe_3m: "Chao Jefe 3 Millones",
    super_combo_marraqueta: "Super Combo Marraqueta"
  }[key];
}

// ===============================
// RENDER
// ===============================
function render(data) {
  contenedor.innerHTML = "";

  data.forEach(s => {
    let html = `
      <div class="card">
        <h2>Sorteo KINO ${s.sorteo}</h2>
        <small>${s.fecha}</small>
    `;

    for (const [key, juego] of Object.entries(s.juegos)) {
      if (!juego.nums.length) continue;

      const grupos = chunkArray(juego.nums, 14);

      html += `
        <h3>
          <img src="${juego.logo}">
          ${nombreCategoria(key)}
        </h3>
      `;

      grupos.forEach(grupo => {
        html += `
          <div class="bolas grupo">
            ${grupo.map(n => `<div class="bola">${n}</div>`).join("")}
          </div>
        `;
      });
    }

    if (s.numero_carton) {
      html += `
        <h3>
          <img src="https://www.loteria.cl/LoteriaWeb/content/img/resultados/kino/subproductos/pc.png">
          Premios al Número de Cartón
        </h3>
        <div class="cartones">
          ${s.numero_carton
            .toString()
            .split(",")
            .map(c => `<span class="carton">${c.trim()}</span>`)
            .join("")}
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
    `Próximo Sorteo N° ${Number(s.sorteo) + 1} – ${calcularProximaFecha(s.fecha)}`;
  bannerMonto.textContent =
    `$${s.monto.toLocaleString("es-CL")}`;
}

function calcularProximaFecha(f) {
  const [d, m, y] = f.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + (date.getDay() === 0 ? 3 : 2));
  return date.toLocaleDateString("es-CL");
}
