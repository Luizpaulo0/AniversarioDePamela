/**
 * ===================================
 * SISTEMA DE QUIZ DE ANIVERSÁRIO
 * ===================================
 *
 * Quiz personalizado para dar gemas (wishes) como recompensa.
 *
 * INSTRUÇÕES PARA PERSONALIZAR:
 * - Edite o array QUIZ_QUESTIONS abaixo para adicionar suas perguntas
 * - Cada pergunta pode ter de 2 a 4 opções
 * - Defina qual opção é a correta com "correct: true"
 * - Ajuste a recompensa em GEMS_PER_CORRECT
 */

// ===================================
// CONFIGURAÇÃO DO QUIZ
// ===================================

/**
 * Quantidade de gemas por resposta correta
 * Ajuste este valor conforme desejar
 */
const GEMS_PER_CORRECT = 4000

/**
 * Mensagens de feedback
 */
const FEEDBACK_MESSAGES = {
  correct: [
    "Cagou muito fia, ctz",
    "Tá tá, parabéns! ✨",
    "UUUu, SAae muito! 💫",
    "Bagaça!",
    "AINNN Nobru apelaum ",
  ],
  incorrect: ["Ih ala, errou kkkkkkkkk", "Tente perguntar pra alguém com cerébro...", "Ixi...", "Essa não era a resposta certa!"],
}

/**
 * Lista de perguntas do quiz
 *
 * COMO ADICIONAR NOVAS PERGUNTAS:
 * {
 *   question: "Sua pergunta aqui?",
 *   options: [
 *     { text: "Opção A", correct: false },
 *     { text: "Opção B", correct: true },  // Marque a correta
 *     { text: "Opção C", correct: false },
 *     { text: "Opção D", correct: false }
 *   ]
 * }
 */
const QUIZ_QUESTIONS = [
  {
    question: "Qual meu herói favorito?",
    options: [
      { text: "Miranha", correct: false },
      { text: "Morcego Men", correct: false },
      { text: "The Rock", correct: false },
      { text: "Keqing", correct: true },
    ],
  },
  {
    question: "Qual é o meu filme favorito?",
    options: [
      { text: "Os vingativos: The last Dance", correct: false },
      { text: "Num tem", correct: true },
      { text: "Desvio e te mato", correct: false },
      { text: "KEQING", correct: false },
    ],
  },
  {
    question: "Qual é a minha cor favorita?",
    options: [
      { text: "Azul", correct: true },
      { text: "Verde", correct: false },
      { text: "Roxo", correct: false },
      { text: "Rosa", correct: false },
    ],
  },
  {
    question: "3 Letra do 4 nome do meu avô",
    options: [
      { text: "S", correct: false },
      { text: "E", correct: false },
      { text: "I", correct: false },
      { text: "Lá peste", correct: true },
    ],
  },
  {
    question: "Qual é a minha estação do ano favorita?",
    options: [
      { text: "EUTONO INFERNO", correct: false },
      { text: "OUTONO INFERNO 2", correct: true },
      { text: "Inverno", correct: true },
      { text: "PRIMAVERA VEZ NO INFERNO", correct: false },
    ],
  },
]

// ===================================
// ESTADO DO QUIZ
// ===================================

const QuizState = {
  currentQuestion: 0,
  correctAnswers: 0,
  gemsEarned: 0,
  totalGems: 0,
  answered: false,
  questions: [],
}

// ===================================
// STORAGE - PERSISTÊNCIA DE GEMAS
// ===================================

const STORAGE_KEY = "wishSimulator"

/**
 * Carrega gemas do localStorage
 */
function loadGems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      QuizState.totalGems = data.gems ?? 0
    }
  } catch (error) {
    console.error("Erro ao carregar gemas:", error)
  }
}

/**
 * Salva gemas no localStorage
 */
function saveGems() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    const data = saved ? JSON.parse(saved) : {}
    data.gems = QuizState.totalGems
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Erro ao salvar gemas:", error)
  }
}

// ===================================
// ELEMENTOS DO DOM
// ===================================

let DOM = {}

function initDOM() {
  DOM = {
    gemsCount: document.getElementById("gems-count"),
    correctCount: document.getElementById("correct-count"),
    questionProgress: document.getElementById("question-progress"),
    currentQuestion: document.getElementById("current-question"),
    questionText: document.getElementById("question-text"),
    optionsContainer: document.getElementById("options-container"),
    feedback: document.getElementById("feedback"),
    nextBtn: document.getElementById("next-btn"),
    quizActive: document.getElementById("quiz-active"),
    quizComplete: document.getElementById("quiz-complete"),
    finalCorrect: document.getElementById("final-correct"),
    finalGems: document.getElementById("final-gems"),
    restartBtn: document.getElementById("restart-btn"),
  }
}

// ===================================
// FUNÇÕES DO QUIZ
// ===================================

/**
 * Embaralha as perguntas para cada sessão
 */
function shuffleQuestions() {
  QuizState.questions = [...QUIZ_QUESTIONS].sort(() => Math.random() - 0.5)
}

/**
 * Atualiza a interface com os dados atuais
 */
function updateUI() {
  if (DOM.gemsCount) {
    DOM.gemsCount.textContent = QuizState.totalGems
  }
  if (DOM.correctCount) {
    DOM.correctCount.textContent = QuizState.correctAnswers
  }
  if (DOM.questionProgress) {
    DOM.questionProgress.textContent = `${QuizState.currentQuestion}/${QuizState.questions.length}`
  }
}

/**
 * Carrega uma pergunta na tela
 */
function loadQuestion() {
  const question = QuizState.questions[QuizState.currentQuestion]
  QuizState.answered = false

  // Atualiza número da pergunta
  if (DOM.currentQuestion) {
    DOM.currentQuestion.textContent = QuizState.currentQuestion + 1
  }

  // Atualiza texto da pergunta
  if (DOM.questionText) {
    DOM.questionText.textContent = question.question
  }

  // Limpa feedback
  if (DOM.feedback) {
    DOM.feedback.classList.add("hidden")
    DOM.feedback.className = "quiz-feedback hidden"
  }

  // Esconde botão de próxima
  if (DOM.nextBtn) {
    DOM.nextBtn.classList.add("hidden")
  }

  // Renderiza opções
  renderOptions(question.options)

  updateUI()
}

/**
 * Renderiza as opções de resposta
 */
function renderOptions(options) {
  if (!DOM.optionsContainer) return

  // Embaralha opções também
  const shuffledOptions = [...options].sort(() => Math.random() - 0.5)

  DOM.optionsContainer.innerHTML = shuffledOptions
    .map(
      (option, index) => `
    <button 
      class="option-btn" 
      data-correct="${option.correct}"
      data-index="${index}"
    >
      ${option.text}
    </button>
  `,
    )
    .join("")

  // Adiciona event listeners
  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.addEventListener("click", () => handleAnswer(btn))
  })
}

/**
 * Processa a resposta do usuário
 */
function handleAnswer(button) {
  if (QuizState.answered) return
  QuizState.answered = true

  const isCorrect = button.dataset.correct === "true"

  // Marca todas as opções
  document.querySelectorAll(".option-btn").forEach((btn) => {
    btn.disabled = true
    if (btn.dataset.correct === "true") {
      btn.classList.add("correct")
    } else if (btn === button && !isCorrect) {
      btn.classList.add("incorrect")
    }
  })

  // Mostra feedback
  showFeedback(isCorrect)

  // Atualiza pontuação
  if (isCorrect) {
    QuizState.correctAnswers++
    QuizState.gemsEarned += GEMS_PER_CORRECT
    QuizState.totalGems += GEMS_PER_CORRECT
    saveGems()
  }

  updateUI()

  // Mostra botão de próxima pergunta
  if (DOM.nextBtn) {
    DOM.nextBtn.classList.remove("hidden")

    // Muda texto se for a última pergunta
    if (QuizState.currentQuestion >= QuizState.questions.length - 1) {
      DOM.nextBtn.textContent = "Ver Resultado"
    }
  }
}

/**
 * Mostra mensagem de feedback
 */
function showFeedback(isCorrect) {
  if (!DOM.feedback) return

  const messages = isCorrect ? FEEDBACK_MESSAGES.correct : FEEDBACK_MESSAGES.incorrect
  const message = messages[Math.floor(Math.random() * messages.length)]

  DOM.feedback.textContent = isCorrect ? `${message} +${GEMS_PER_CORRECT} gemas!` : message

  DOM.feedback.className = `quiz-feedback ${isCorrect ? "correct" : "incorrect"}`
  DOM.feedback.classList.remove("hidden")
}

/**
 * Avança para a próxima pergunta ou finaliza o quiz
 */
function nextQuestion() {
  QuizState.currentQuestion++

  if (QuizState.currentQuestion >= QuizState.questions.length) {
    showResults()
  } else {
    loadQuestion()
  }
}

/**
 * Mostra a tela de resultados
 */
function showResults() {
  if (DOM.quizActive) {
    DOM.quizActive.classList.add("hidden")
  }
  if (DOM.quizComplete) {
    DOM.quizComplete.classList.remove("hidden")
  }
  if (DOM.finalCorrect) {
    DOM.finalCorrect.textContent = `${QuizState.correctAnswers}/${QuizState.questions.length}`
  }
  if (DOM.finalGems) {
    DOM.finalGems.textContent = QuizState.gemsEarned
  }
}

/**
 * Reinicia o quiz
 */
function restartQuiz() {
  QuizState.currentQuestion = 0
  QuizState.correctAnswers = 0
  QuizState.gemsEarned = 0
  QuizState.answered = false

  shuffleQuestions()

  if (DOM.quizComplete) {
    DOM.quizComplete.classList.add("hidden")
  }
  if (DOM.quizActive) {
    DOM.quizActive.classList.remove("hidden")
  }
  if (DOM.nextBtn) {
    DOM.nextBtn.textContent = "Próxima Pergunta"
  }

  loadQuestion()
}

// ===================================
// EVENT LISTENERS
// ===================================

function initEventListeners() {
  if (DOM.nextBtn) {
    DOM.nextBtn.addEventListener("click", nextQuestion)
  }
  if (DOM.restartBtn) {
    DOM.restartBtn.addEventListener("click", restartQuiz)
  }
}

// ===================================
// INICIALIZAÇÃO
// ===================================

function init() {
  initDOM()
  loadGems()
  shuffleQuestions()
  initEventListeners()
  loadQuestion()
  updateUI()
}

document.addEventListener("DOMContentLoaded", init)
