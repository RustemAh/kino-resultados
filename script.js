const contenedor = document.getElementById("resultados");
const buscador = document.getElementById("buscar");

fetch("data/kino.json")
  .then(res => res.json())
  .then(data => render(data));

function render(data) {
  contenedor.innerHTML = "";

  data.forEach(s => {
    contenedor.innerHTML += `
      <div class="card">
        <h2>
          <a href="kino/${s.sorteo}.html">
            Sorteo KINO ${s.sorteo}
          </a>
        </h2>
        <small>${s.fecha}</small>
        <div class="bolas">
          ${s.numeros.map(n => `<div class="bola">${n}</div>`).join("")}
        </div>
      </div>
    `;
  });
}

buscador.addEventListener("input", e => {
  const q = e.target.value;
  fetch("data/kino.json")
    .then(res => res.json())
    .then(data => render(
      data.filter(s => s.sorteo.includes(q) || s.fecha.includes(q))
    ));
});
