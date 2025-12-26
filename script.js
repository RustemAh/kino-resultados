const contenedor = document.getElementById("resultados");
const buscador = document.getElementById("buscar");

fetch("data/kino.json")
  .then(res => res.json())
  .then(data => render(data));

function render(data) {
  contenedor.innerHTML = "";
  data.forEach(s => {
    let html = `
      <div class="card">
        <h2><a href="kino/${s.sorteo}.html">Sorteo KINO ${s.sorteo}</a></h2>
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
    chao_jefe_2m: "Chao Jefe $2.000.000",
    chao_jefe_3m: "Chao Jefe $3.000.000",
    super_combo_marraqueta: "Súper Combo Marraqueta"
  }[k];
}

buscador.oninput = e => {
  const q = e.target.value;
  fetch("data/kino.json")
    .then(r => r.json())
    .then(d => render(d.filter(s => s.sorteo.includes(q) || s.fecha.includes(q))));
};
