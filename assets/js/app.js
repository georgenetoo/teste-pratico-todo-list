const formTarefa = document.getElementById("formulario-tarefa");
const inputTarefa = document.getElementById("input-nova-tarefa");
const selectCategoria = document.getElementById("select-categoria");
const listaTarefas = document.getElementById("lista-tarefas");
const contadorTarefas = document.getElementById("numero-tarefas");
const botaoLimpar = document.getElementById("botao-limpar");
const botoesFiltro = document.querySelectorAll(".botao-filtro");
const botaoTema = document.getElementById("botao-tema");

/* =========================================================
   Estado da aplicação
   Requisito 2.5: Persistência de dados via localStorage
   ========================================================= */
let tarefas = JSON.parse(localStorage.getItem("tarefas")) || [];
let filtroAtual = "todas";

document.addEventListener("DOMContentLoaded", () => {
  // Funções de inicialização serão chamadas aqui futuramente
  renderizarTarefas();
});

// Formata a data ISO para o padrão brasileiro (DD/MM/AAAA HH:MM)
function formatarData(dataISO) {
  if (!dataISO) return "";
  const data = new Date(dataISO);
  return data.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

// Salva o array de tarefas no localStorage.
function salvarTarefas() {
  localStorage.setItem("tarefas", JSON.stringify(tarefas));
}

// Renderiza a lista de tarefas conforme o filtro selecionado.
function renderizarTarefas() {
  listaTarefas.innerHTML = "";

  const tarefasFiltradas = tarefas.filter((tarefa) => {
    if (filtroAtual === "pendentes") return !tarefa.concluida;
    if (filtroAtual === "concluidas") return tarefa.concluida;
    return true;
  });

  // Exibição de estado vazio quando não houver tarefas
  if (tarefasFiltradas.length === 0) {
    listaTarefas.innerHTML = `
      <li class="estado-vazio">
        <i class="ph ph-clipboard-text"></i>
        <p><strong>Nenhuma tarefa encontrada</strong></p>
        <p>O que você deseja realizar hoje?</p>
      </li>
    `;
  } else {
    tarefasFiltradas.forEach(criarElementoTarefa);
  }

  atualizarContador();
}

// Cria e insere no DOM o elemento visual de uma tarefa.
function criarElementoTarefa(tarefa) {
  const li = document.createElement("li");
  li.className = `item-tarefa ${tarefa.concluida ? "concluida" : ""}`;

  const dataCriacaoFormatada = formatarData(tarefa.dataCriacao);
  const dataConclusaoStr =
    tarefa.concluida && tarefa.dataConclusao
      ? ` | Concluída em: ${formatarData(tarefa.dataConclusao)}`
      : "";

  li.innerHTML = `
    <input 
      type="checkbox" 
      class="checkbox-tarefa" 
      ${tarefa.concluida ? "checked" : ""}
      onclick="alternarStatus(${tarefa.id})"
    >
    <div class="texto-tarefa">
      <div style="margin-bottom: 0.3rem;">
        <span>${tarefa.texto}</span>
        <span class="tag-categoria">${tarefa.categoria}</span>
      </div>
      <div class="datas-tarefa">Criada em: ${dataCriacaoFormatada}${dataConclusaoStr}</div>
    </div>
    <div class="acoes-tarefa">
      <button 
        class="botao-editar" 
        onclick="editarTarefa(${tarefa.id})"
        aria-label="Editar tarefa"
      >
        <i class="ph ph-pencil-simple"></i>
      </button>
      <button 
        class="botao-deletar" 
        onclick="deletarTarefa(${tarefa.id})"
        aria-label="Deletar tarefa"
      >
        <i class="ph ph-trash"></i>
      </button>
    </div>
  `;

  listaTarefas.appendChild(li);
}

// Stub para evitar erros antes da implementação completa
function atualizarContador() {}
