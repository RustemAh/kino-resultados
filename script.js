const URL_SHEETS =
  "https://docs.google.com/spreadsheets/d/1a4XxgaYrixLeSQ0EOnI4thHA-_075uVAxQvvGlGhxQA/gviz/tq?tqx=out:json";

const contenedor = document.getElementById("resultados");
const buscador = document.getElementById("buscar");

// Cargar los datos
fetch(URL_SHEETS)
  .then(res => res.text())
  .then(text => {
    // La respuesta viene envuelta, así que la limpiamos
    const json = JSON.parse(
      text
        .replace(/^.*google\.visualization\.Query\.setResponse\(/, "")
        .slice(0, -2)
    );

    // La data viene en table.rows
    const filas = json.table.rows;

    const data = filas.map(r => ({
      sorteo: r.c[0]?.v?.toString() || "",
      fecha: r.c[1]?.v || "",
      juegos: {
        kino: r.c[2]?.v ? r.c[2].v.split(",").map(n => parseInt(n)) : [],
        rekino: r.c[3]?.v ? r.c[3].v.split(",").map(n => parseInt(n)) : [],
        requete_kino: r.c[4]?.v
          ? r.c[4].v.split(",").map(n => parseInt(n))
          : [],
        premios_especiales: r.c[5]?.v
          ? r.c[5].v.split(",").map(n => parseInt(n))
          : [],
        chao_jefe_2m: r.c[6]?.v
          ? r.c[6].v.split(",").map(n => parseInt(n))
          : [],
        chao_jefe_3m: r.c[7]?.v
          ? r.c[7].v.split(",").map(n => parseInt(n))
          : [],
        super_combo_marraqueta: r.c[8]?.v
          ? r.c[8].v.split(",").map(n => parseInt(n))
          : []
      }
    }));

    render(data);
  });

function render(data) {
  contenedor.innerHTML = "";
  data.forEach(s => {
    let html = `
      <div class="card">
        <h2>Sorteo KINO ${s.sorteo}</h2>
        <small>${s.fecha}</small>
    `;
    for (const [k, nums] of Object.entries(s.juegos)) {
      if (!nums.length) continue;
      html += `<h3>${titulo(k)}</h3><div class="bolas">`;
      html += nums.map(n => `<div class="bola">${n}</div>`).join("");
      html += `</div>`;
    }
    html += `</div>`;
    contenedor.innerHTML += html;
  });
}

function titulo(k) {
  return {
    kino: "KINO",
    rekino: "ReKino",
    requete_kino: "Requete KINO",
    premios_especiales: "Premios Especiales",
    chao_jefe_2m: "Chao Jefe $2.000.000",
    chao_jefe_3m: "Chao Jefe $3.000.000",
    super_combo_marraqueta: "Súper Combo Marraqueta"
  }[k];
}

buscador.oninput = e => {
  const q = e.target.value.toLowerCase();
  document.querySelectorAll(".card").forEach(card => {
    card.style.display = card.innerText.toLowerCase().includes(q)
      ? "block"
      : "none";
  });
};
