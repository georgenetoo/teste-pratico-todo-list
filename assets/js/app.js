const formTarefa = document.getElementById("formulario-tarefa");
const inputTarefa = document.getElementById("input-nova-tarefa");
const selectCategoria = document.getElementById("select-categoria");
const listaTarefas = document.getElementById("lista-tarefas");
const mensagemVazia = document.getElementById("mensagem-vazia");
const contadorTarefas = document.getElementById("numero-tarefas");
const botaoLimpar = document.getElementById("botao-limpar");
const botoesFiltro = document.querySelectorAll(".botao-filtro");
const botaoTema = document.getElementById("botao-tema");

// Elementos do Modal de Edição
const modalEditar = document.getElementById("modal-editar");
const inputEditarTexto = document.getElementById("input-editar-texto");
const selectEditarCategoria = document.getElementById(
  "select-editar-categoria",
);
const btnCancelarEdicao = document.getElementById("btn-cancelar-edicao");
const btnSalvarEdicao = document.getElementById("btn-salvar-edicao");

/* =========================================================
   Estado da aplicação
   ========================================================= */
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let filtroAtual = "todas";
let idTarefaEmEdicao = null;

document.addEventListener("DOMContentLoaded", () => {
  carregarTema();
  renderizarTarefas();
});

function formatarData(dataISO) {
  if (!dataISO) return "";
  const data = new Date(dataISO);
  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function salvarTarefas() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

function renderizarTarefas() {
  listaTarefas.innerHTML = ""; // Limpa apenas os itens da lista

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtroAtual === "pendentes") return !tarefa.concluida;
    if (filtroAtual === "concluidas") return tarefa.concluida;
    return true;
  });

  // Controle de visibilidade do estado vazio via Classe CSS
  if (tarefasFiltradas.length === 0) {
    mensagemVazia.classList.remove("escondido");
  } else {
    mensagemVazia.classList.add("escondido");
    tarefasFiltradas.forEach(criarElementoTarefa);
  }

  atualizarContador();
}

// Cria o elemento da tarefa usando APENAS a API do DOM (Sem innerHTML)
function criarElementoTarefa(tarefa) {
  const li = document.createElement("li");
  li.className = `item-tarefa ${tarefa.concluida ? "concluida" : ""}`;

  // 1. Checkbox
  const checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className = "checkbox-tarefa";
  checkbox.checked = tarefa.concluida;
  checkbox.onclick = () => alternarStatus(tarefa.id);

  // 2. Container de Texto
  const divTexto = document.createElement("div");
  divTexto.className = "texto-tarefa";

  // Cabeçalho (Texto + Tag)
  const divCabecalho = document.createElement("div");
  divCabecalho.className = "item-cabecalho";

  const spanTitulo = document.createElement("span");
  spanTitulo.textContent = tarefa.texto;

  const spanTag = document.createElement("span");
  spanTag.className = "tag-categoria";
  spanTag.textContent = tarefa.categoria;

  divCabecalho.appendChild(spanTitulo);
  divCabecalho.appendChild(spanTag);

  // Data
  const divData = document.createElement("div");
  divData.className = "datas-tarefa";
  const dataCriacao = formatarData(tarefa.dataCriacao);
  const dataConclusao =
    tarefa.concluida && tarefa.dataConclusao
      ? ` | Concluída em: ${formatarData(tarefa.dataConclusao)}`
      : "";
  divData.textContent = `Criada em: ${dataCriacao}${dataConclusao}`;

  divTexto.appendChild(divCabecalho);
  divTexto.appendChild(divData);

  // 3. Botões de Ação
  const divAcoes = document.createElement("div");
  divAcoes.className = "acoes-tarefa";

  // Botão Editar
  const btnEditar = document.createElement("button");
  btnEditar.className = "botao-editar";
  btnEditar.ariaLabel = "Editar tarefa";
  btnEditar.onclick = () => editarTarefa(tarefa.id);

  const iconeEditar = document.createElement("i");
  iconeEditar.className = "ph ph-pencil-simple";
  btnEditar.appendChild(iconeEditar);

  // Botão Deletar
  const btnDeletar = document.createElement("button");
  btnDeletar.className = "botao-deletar";
  btnDeletar.ariaLabel = "Deletar tarefa";
  btnDeletar.onclick = () => deletarTarefa(tarefa.id);

  const iconeDeletar = document.createElement("i");
  iconeDeletar.className = "ph ph-trash";
  btnDeletar.appendChild(iconeDeletar);

  divAcoes.appendChild(btnEditar);
  divAcoes.appendChild(btnDeletar);

  // Montagem final do LI
  li.appendChild(checkbox);
  li.appendChild(divTexto);
  li.appendChild(divAcoes);

  listaTarefas.appendChild(li);
}

function adicionarTarefa(evento) {
  evento.preventDefault();

  const texto = inputTarefa.value.trim();
  const categoria = selectCategoria.value;

  if (texto === "") {
    alert("Por favor, digite uma descrição para a tarefa.");
    return;
  }

  const novaTarefa = {
    id: Date.now(),
    texto,
    categoria,
    concluida: false,
    dataCriacao: new Date().toISOString(),
    dataConclusao: null,
  };

  tarefas.push(novaTarefa);
  salvarTarefas();
  renderizarTarefas();

  inputTarefa.value = "";
  inputTarefa.focus();
}

function atualizarContador() {
  const pendentes = tarefas.filter((t) => !t.concluida).length;
  const concluidas = tarefas.length - pendentes;

  contadorTarefas.textContent = pendentes;
  botaoLimpar.classList.toggle("escondido", concluidas === 0);
}

formTarefa.addEventListener("submit", adicionarTarefa);

window.alternarStatus = function (id) {
  tarefas = tarefas.map((tarefa) => {
    if (tarefa.id === id) {
      const concluida = !tarefa.concluida;
      return {
        ...tarefa,
        concluida,
        dataConclusao: concluida ? new Date().toISOString() : null,
      };
    }
    return tarefa;
  });
  salvarTarefas();
  renderizarTarefas();
};

window.deletarTarefa = function (id) {
  if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
    tarefas = tarefas.filter((tarefa) => tarefa.id !== id);
    salvarTarefas();
    renderizarTarefas();
  }
};

/* =========================================================
   Lógica do Modal de Edição
   ========================================================= */
window.editarTarefa = function (id) {
  const tarefa = tarefas.find((t) => t.id === id);
  if (!tarefa) return;

  inputEditarTexto.value = tarefa.texto;
  selectEditarCategoria.value = tarefa.categoria;
  idTarefaEmEdicao = id;

  modalEditar.classList.remove("escondido");
  inputEditarTexto.focus();
};

btnCancelarEdicao.addEventListener("click", () => {
  modalEditar.classList.add("escondido");
  idTarefaEmEdicao = null;
});

btnSalvarEdicao.addEventListener("click", () => {
  const novoTexto = inputEditarTexto.value.trim();
  const novaCategoria = selectEditarCategoria.value;

  if (novoTexto === "") {
    alert("A descrição da tarefa não pode ficar vazia.");
    return;
  }

  if (idTarefaEmEdicao) {
    tarefas = tarefas.map((t) =>
      t.id === idTarefaEmEdicao
        ? { ...t, texto: novoTexto, categoria: novaCategoria }
        : t,
    );
    salvarTarefas();
    renderizarTarefas();
    modalEditar.classList.add("escondido");
    idTarefaEmEdicao = null;
  }
});

function limparConcluidas() {
  if (confirm("Deseja remover todas as tarefas concluídas?")) {
    tarefas = tarefas.filter((tarefa) => !tarefa.concluida);
    salvarTarefas();
    renderizarTarefas();
  }
}

botaoLimpar.addEventListener("click", limparConcluidas);

botoesFiltro.forEach((botao) => {
  botao.addEventListener("click", () => {
    botoesFiltro.forEach((b) => b.classList.remove("ativo"));
    botao.classList.add("ativo");
    filtroAtual = botao.getAttribute("data-filtro");
    renderizarTarefas();
  });
});

botaoTema.addEventListener("click", () => {
  document.body.classList.toggle("dark-mode");
  const icone = botaoTema.querySelector("i");
  const temaAtual = document.body.classList.contains("dark-mode")
    ? "dark"
    : "light";

  icone.classList.replace(
    temaAtual === "dark" ? "ph-moon" : "ph-sun",
    temaAtual === "dark" ? "ph-sun" : "ph-moon",
  );

  localStorage.setItem("tema", temaAtual);
});

function carregarTema() {
  const temaSalvo = localStorage.getItem("tema");
  if (temaSalvo === "dark") {
    document.body.classList.add("dark-mode");
    const icone = botaoTema.querySelector("i");
    if (icone.classList.contains("ph-moon")) {
      icone.classList.replace("ph-moon", "ph-sun");
    }
  }
}
