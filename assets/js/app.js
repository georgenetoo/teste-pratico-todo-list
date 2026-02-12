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
