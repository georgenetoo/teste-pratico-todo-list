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

//Cria e insere no DOM o elemento visual de uma tarefa.
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

// Adiciona uma nova tarefa ao array e salva no storage.
function adicionarTarefa(evento) {
  evento.preventDefault();

  const texto = inputTarefa.value.trim();
  const categoria = selectCategoria.value;

  // Validação de campo vazio
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

  // Limpeza automática do campo após adicionar
  inputTarefa.value = "";
  inputTarefa.focus();
}

// Atualiza o contador de tarefas pendentes e controla a visibilidade do botão de limpeza.
function atualizarContador() {
  const pendentes = tarefas.filter((t) => !t.concluida).length;
  const concluidas = tarefas.length - pendentes;

  contadorTarefas.textContent = pendentes;

  botaoLimpar.classList.toggle("escondido", concluidas === 0);
}

formTarefa.addEventListener("submit", adicionarTarefa);

// Alterna o status de conclusão de uma tarefa
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

// Remove uma tarefa da lista
window.deletarTarefa = function (id) {
  if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
    tarefas = tarefas.filter((tarefa) => tarefa.id !== id);
    salvarTarefas();
    renderizarTarefas();
  }
};

window.editarTarefa = function (id) {
  const tarefa = tarefas.find((t) => t.id === id);
  if (!tarefa) return;

  // Cria o overlay (fundo escuro)
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  // HTML interno do modal
  overlay.innerHTML = `
    <div class="modal-conteudo">
      <h3>Editar Tarefa</h3>
      
      <div style="display: flex; flex-direction: column; gap: 0.3rem;">
        <label for="edit-texto" style="font-size: 0.9rem; color: var(--text-secondary);">Descrição</label>
        <input type="text" id="edit-texto" value="${tarefa.texto}" autocomplete="off">
      </div>
      
      <div style="display: flex; flex-direction: column; gap: 0.3rem; margin-top: 0.5rem;">
        <label for="edit-categoria" style="font-size: 0.9rem; color: var(--text-secondary);">Categoria</label>
        <select id="edit-categoria">
          <option value="geral" ${tarefa.categoria === "geral" ? "selected" : ""}>Geral</option>
          <option value="trabalho" ${tarefa.categoria === "trabalho" ? "selected" : ""}>Trabalho</option>
          <option value="estudo" ${tarefa.categoria === "estudo" ? "selected" : ""}>Estudo</option>
          <option value="pessoal" ${tarefa.categoria === "pessoal" ? "selected" : ""}>Pessoal</option>
        </select>
      </div>

      <div class="modal-botoes">
        <button id="btn-cancelar-edicao">Cancelar</button>
        <button id="btn-salvar-edicao">Salvar</button>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.getElementById("edit-texto").focus();

  // Evento Cancelar
  document.getElementById("btn-cancelar-edicao").onclick = () => {
    overlay.remove();
  };

  // Evento Salvar
  document.getElementById("btn-salvar-edicao").onclick = () => {
    const novoTexto = document.getElementById("edit-texto").value.trim();
    const novaCategoria = document.getElementById("edit-categoria").value;

    if (novoTexto !== "") {
      tarefas = tarefas.map((t) =>
        t.id === id ? { ...t, texto: novoTexto, categoria: novaCategoria } : t,
      );
      salvarTarefas();
      renderizarTarefas();
      overlay.remove();
    } else {
      alert("A descrição da tarefa não pode ficar vazia.");
    }
  };
};
