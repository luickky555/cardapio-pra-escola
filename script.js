const form = document.getElementById("form-cardapio");
const dias = document.querySelectorAll(".dia");
const sugestoesDiv = document.getElementById("sugestoes");
let cardapio = JSON.parse(localStorage.getItem("cardapio")) || [];
let grafico;

// Evento do formulário
form.addEventListener("submit", e => {
  e.preventDefault();

  const comida = document.getElementById("comida").value;
  const proteina = parseInt(document.getElementById("proteina").value);
  const carbo = parseInt(document.getElementById("carbo").value);
  const calorias = parseInt(document.getElementById("calorias").value);
  const dia = document.getElementById("dia").value;

  cardapio.push({ comida, proteina, carbo, calorias, dia });
  localStorage.setItem("cardapio", JSON.stringify(cardapio));

  form.reset();
  renderizarCardapio();
});

// Renderizar lista
function renderizarCardapio() {
  dias.forEach(dia => dia.querySelector("ul").innerHTML = "");

  let totais = {};

  cardapio.forEach((item, index) => {
    const li = document.createElement("li");

    li.innerHTML = `
      <strong>${item.comida}</strong>
      <span>🥩 Proteínas: ${item.proteina}g</span>
      <span>🍞 Carboidratos: ${item.carbo}g</span>
      <span>🔥 Calorias: ${item.calorias} kcal</span>
    `;

    // Botão remover
    const btn = document.createElement("button");
    btn.textContent = "Remover";
    btn.addEventListener("click", () => removerItem(index));
    li.appendChild(btn);

    li.classList.add("fade-in");

    const diaLista = document.querySelector(`.dia[data-dia="${item.dia}"] ul`);
    diaLista.appendChild(li);

    // Somando totais
    if (!totais[item.dia]) totais[item.dia] = { proteina: 0, carbo: 0, calorias: 0 };
    totais[item.dia].proteina += item.proteina;
    totais[item.dia].carbo += item.carbo;
    totais[item.dia].calorias += item.calorias;
  });

  atualizarGrafico(totais);
  gerarSugestoes(totais);
}

function removerItem(index) {
  cardapio.splice(index, 1);
  localStorage.setItem("cardapio", JSON.stringify(cardapio));
  renderizarCardapio();
}

// Gráfico com Chart.js
function atualizarGrafico(totais) {
  const ctx = document.getElementById("graficoSemana").getContext("2d");
  const dias = Object.keys(totais);
  const proteinas = dias.map(d => totais[d].proteina);
  const carbos = dias.map(d => totais[d].carbo);
  const calorias = dias.map(d => totais[d].calorias);

  if (grafico) grafico.destroy();

  grafico = new Chart(ctx, {
    type: "bar",
    data: {
      labels: dias,
      datasets: [
        { label: "Proteínas (g)", data: proteinas, backgroundColor: "rgba(54,162,235,0.6)" },
        { label: "Carboidratos (g)", data: carbos, backgroundColor: "rgba(255,206,86,0.6)" },
        { label: "Calorias (kcal)", data: calorias, backgroundColor: "rgba(255,99,132,0.6)" }
      ]
    },
    options: { responsive: true, plugins: { legend: { position: "top" } } }
  });
}

// Sugestões automáticas
function gerarSugestoes(totais) {
  sugestoesDiv.innerHTML = "";

  Object.keys(totais).forEach(dia => {
    const { proteina, carbo, calorias } = totais[dia];
    let sugestao = `<p><strong>${dia}:</strong> `;

    if (proteina < 50) sugestao += "Pouca proteína 🥩, sugerir frango, ovos ou feijão. ";
    if (carbo < 150) sugestao += "Carboidratos baixos 🍞, sugerir arroz, macarrão ou pão. ";
    if (calorias < 600) sugestao += "Calorias insuficientes 🔥, sugerir batata, óleo ou sobremesa. ";
    if (sugestao === `<p><strong>${dia}:</strong> `) sugestao += "Cardápio equilibrado ✅";

    sugestao += "</p>";
    sugestoesDiv.innerHTML += sugestao;
  });
}

// Lista de alimentos para IA
const alimentosBase = [
  { comida: "Frango grelhado", proteina: 40, carbo: 0, calorias: 200 },
  { comida: "Arroz integral", proteina: 5, carbo: 45, calorias: 220 },
  { comida: "Feijão preto", proteina: 10, carbo: 30, calorias: 150 },
  { comida: "Ovo cozido", proteina: 7, carbo: 1, calorias: 80 },
  { comida: "Macarrão", proteina: 8, carbo: 40, calorias: 250 },
  { comida: "Batata cozida", proteina: 3, carbo: 30, calorias: 120 },
  { comida: "Peixe assado", proteina: 35, carbo: 0, calorias: 180 },
  { comida: "Salada de legumes", proteina: 3, carbo: 12, calorias: 60 },
  { comida: "Carne moída", proteina: 30, carbo: 0, calorias: 250 }
];

// Embaralhar array
function embaralhar(array) {
  return array.sort(() => Math.random() - 0.5);
}

// Gerar cardápio automático variado
document.getElementById("gerar-ia").addEventListener("click", () => {
  const diasSemana = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
  cardapio = [];
  let usados = {};

  diasSemana.forEach(dia => {
    let refeicao = [];
    let totalProteina = 0, totalCarbo = 0, totalCalorias = 0;

    let listaDia = embaralhar([...alimentosBase]);

    while (totalProteina < 50 || totalCarbo < 150 || totalCalorias < 600) {
      if (listaDia.length === 0) listaDia = embaralhar([...alimentosBase]);
      let alimento = listaDia.pop();
      if (usados[alimento.comida] >= 2) continue;

      refeicao.push({ ...alimento, dia });
      totalProteina += alimento.proteina;
      totalCarbo += alimento.carbo;
      totalCalorias += alimento.calorias;

      usados[alimento.comida] = (usados[alimento.comida] || 0) + 1;
    }

    cardapio.push(...refeicao);
  });

  localStorage.setItem("cardapio", JSON.stringify(cardapio));
  renderizarCardapio();
  alert("✅ Cardápio equilibrado e variado gerado com sucesso!");
});

// Inicializa
renderizarCardapio();
