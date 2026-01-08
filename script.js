/**
 * ===================================
 * WISH SIMULATOR - SISTEMA PRINCIPAL
 * ===================================
 *
 * Este arquivo contém toda a lógica do simulador de wishes.
 * Estruturado de forma modular para fácil manutenção e expansão.
 */

// ===================================
// CONFIGURAÇÃO DO SISTEMA
// ===================================

/**
 * Configuração dos vídeos por raridade do item
 * O vídeo é exibido baseado na raridade máxima obtida no wish
 */
const VIDEO_CONFIG = {
  star5: "./Midia/5star.mp4", // Vídeo para item lendário (5 estrelas)
  star4: "./Midia/4star.mp4", // Vídeo para item épico (4 estrelas)
  star3: null, // Sem vídeo para itens comuns (3 estrelas)
}

/**
 * Configuração dos banners de wish
 * Adicione novos banners aqui conforme necessário
 */
const WISH_CONFIG = {
  wish1: {
    name: "Banner Especial 1",
    items: [
      { name: "Item Comum 1", rarity: 3 },
      { name: "Item Comum 2", rarity: 3 },
      { name: "Item Raro 1", rarity: 4 },
      { name: "Item Lendário 1", rarity: 5 },
    ],
  },
  wish2: {
    name: "Banner Especial 2",
    items: [
      { name: "Item Comum A", rarity: 3 },
      { name: "Item Comum B", rarity: 3 },
      { name: "Item Raro A", rarity: 4 },
      { name: "Item Lendário A", rarity: 5 },
    ],
  },
}

/**
 * Taxas de drop (probabilidade em porcentagem)
 * Ajuste conforme necessário
 */
const DROP_RATES = {
  star5: 1.0, // 0.6% chance para 5 estrelas
  star4: 5.0, // 5.1% chance para 4 estrelas
  star3: 94.0, // 94.3% chance para 3 estrelas
}

/**
 * Custos dos wishes
 */
const WISH_COSTS = {
  single: 160,
  multi: 1600,
}

// ===================================
// ESTADO DA APLICAÇÃO
// ===================================

const AppState = {
  currentBanner: "wish1",
  gems: 8000,
  coins: 1600,
  pity5Star: 0,
  pity4Star: 0,
  obtainedItems: [],
  isWishing: false,
}

// ===================================
// ELEMENTOS DO DOM
// ===================================

const DOM = {
  // Vídeo e fundo
  video: document.getElementById("wish-video"),
  videoSource: document.getElementById("video-source"),
  backgroundImage: document.getElementById("background-image"),

  // Contadores
  gemsCount: document.getElementById("gems-count"),
  coinsCount: document.getElementById("coins-count"),
  pity5Star: document.getElementById("pity-5star"),
  pity4Star: document.getElementById("pity-4star"),

  // Listas e containers
  itemsList: document.getElementById("items-list"),
  resultItems: document.getElementById("result-items"),

  // Modal
  resultModal: document.getElementById("result-modal"),
  closeModal: document.getElementById("close-modal"),

  // Botões
  wishSingle: document.getElementById("wish-single"),
  wishMulti: document.getElementById("wish-multi"),
  tabButtons: document.querySelectorAll(".tab-button"),
  bannerContents: document.querySelectorAll(".banner-content"),
}

// ===================================
// FUNÇÕES DE UTILIDADE
// ===================================

/**
 * Gera um número aleatório entre min e max
 */
function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

/**
 * Determina a raridade do item baseado nas taxas de drop
 */
function determineRarity() {
  const roll = Math.random() * 100

  // Sistema de pity (garantia)
  if (AppState.pity5Star >= 80) {
    return 5 // Garantia de 5 estrelas no 80º wish
  }

  if (AppState.pity4Star >= 9) {
    return 4 // Garantia de 4 estrelas no 10º wish
  }

  // Roll normal
  if (roll < DROP_RATES.star5) {
    return 5
  } else if (roll < DROP_RATES.star5 + DROP_RATES.star4) {
    return 4
  }
  return 3
}

/**
 * Obtém um item aleatório do banner atual
 */
function getRandomItem(rarity) {
  const config = WISH_CONFIG[AppState.currentBanner]
  const possibleItems = config.items.filter((item) => item.rarity === rarity)

  if (possibleItems.length === 0) {
    // Fallback se não houver itens da raridade específica
    return {
      name: `Item ${rarity}★`,
      rarity: rarity,
    }
  }

  return possibleItems[Math.floor(Math.random() * possibleItems.length)]
}

// ===================================
// FUNÇÕES DE VÍDEO
// ===================================

/**
 * Obtém o caminho do vídeo baseado na raridade máxima
 * @param {number} maxRarity - Raridade máxima obtida no wish
 * @returns {string|null} - Caminho do vídeo ou null se não houver
 */
function getVideoPathByRarity(maxRarity) {
  if (maxRarity >= 5) {
    return VIDEO_CONFIG.star5
  } else if (maxRarity >= 4) {
    return VIDEO_CONFIG.star4
  }
  return VIDEO_CONFIG.star3
}

/**
 * Reproduz o vídeo de wish
 * @param {string} videoPath - Caminho do arquivo de vídeo
 * @returns {Promise} - Resolve quando o vídeo termina
 */
function playWishVideo(videoPath) {
  return new Promise((resolve) => {
    if (!videoPath) {
      resolve()
      return
    }

    // Configura o vídeo
    DOM.videoSource.src = videoPath
    DOM.video.load()

    DOM.video.classList.add("active")
    DOM.video.classList.remove("hidden")
    DOM.backgroundImage.classList.add("hidden")

    // Evento quando o vídeo termina
    const onVideoEnd = () => {
      DOM.video.removeEventListener("ended", onVideoEnd)
      resolve()
    }

    // Evento de erro (caso o vídeo não carregue)
    const onVideoError = () => {
      DOM.video.removeEventListener("error", onVideoError)
      console.warn("Vídeo não encontrado em:", videoPath)
      // Simula um delay para representar o vídeo
      setTimeout(resolve, 1500)
    }

    DOM.video.addEventListener("ended", onVideoEnd)
    DOM.video.addEventListener("error", onVideoError)

    // Tenta reproduzir o vídeo
    DOM.video.play().catch(() => {
      // Se não conseguir reproduzir, resolve após delay
      setTimeout(resolve, 1500)
    })
  })
}

/**
 * Esconde o vídeo e mostra o fundo novamente
 */
function hideVideo() {
  DOM.video.classList.remove("active")
  DOM.video.classList.add("hidden")
  DOM.backgroundImage.classList.remove("hidden")
  DOM.video.pause()
  DOM.video.currentTime = 0
}

// ===================================
// FUNÇÕES DE WISH
// ===================================

/**
 * Executa um wish (pode ser single ou multi)
 * @param {number} count - Número de wishes (1 ou 10)
 */
async function performWish(count) {
  // Verifica se já está fazendo wish
  if (AppState.isWishing) return

  // Calcula o custo
  const cost = count === 1 ? WISH_COSTS.single : WISH_COSTS.multi

  // Verifica se tem gemas suficientes
  if (AppState.gems < cost) {
    alert("Gemas insuficientes!")
    return
  }

  // Marca como fazendo wish
  AppState.isWishing = true

  // Deduz o custo
  AppState.gems -= cost
  updateUI()

  const results = []
  let maxRarity = 3

  for (let i = 0; i < count; i++) {
    const rarity = determineRarity()
    const item = getRandomItem(rarity)

    // Rastreia a maior raridade para escolher o vídeo
    if (rarity > maxRarity) {
      maxRarity = rarity
    }

    // Atualiza pity
    if (rarity === 5) {
      AppState.pity5Star = 0
      AppState.pity4Star = 0
    } else if (rarity === 4) {
      AppState.pity5Star++
      AppState.pity4Star = 0
    } else {
      AppState.pity5Star++
      AppState.pity4Star++
    }

    results.push(item)
    AppState.obtainedItems.unshift(item)
  }

  const videoPath = getVideoPathByRarity(maxRarity)

  // Reproduz o vídeo (se houver)
  if (videoPath) {
    await playWishVideo(videoPath)
    // Esconde o vídeo
    hideVideo()
  }

  // Mostra os resultados
  showResults(results)

  // Atualiza a UI
  updateUI()

  // Libera para próximo wish
  AppState.isWishing = false
}

/**
 * Mostra o modal com os resultados do wish
 */
function showResults(items) {
  // Limpa resultados anteriores
  DOM.resultItems.innerHTML = ""

  // Adiciona cada item
  items.forEach((item) => {
    const itemEl = document.createElement("div")
    itemEl.className = `result-item star-${item.rarity}`
    itemEl.innerHTML = `
      <img 
        src="/--item-rarity--star-game-item-icon---item-name-.jpg" 
        alt="${item.name}"
        title="${item.name}"
      >
    `
    DOM.resultItems.appendChild(itemEl)
  })

  // Mostra o modal
  DOM.resultModal.classList.remove("hidden")
}

/**
 * Fecha o modal de resultados
 */
function closeResultsModal() {
  DOM.resultModal.classList.add("hidden")
}

// ===================================
// FUNÇÕES DE INTERFACE
// ===================================

/**
 * Atualiza toda a interface com o estado atual
 */
function updateUI() {
  // Atualiza contadores
  DOM.gemsCount.textContent = AppState.gems
  DOM.coinsCount.textContent = AppState.coins
  DOM.pity5Star.textContent = AppState.pity5Star
  DOM.pity4Star.textContent = AppState.pity4Star

  // Atualiza lista de itens obtidos
  updateItemsList()
}

/**
 * Atualiza a lista de itens obtidos
 */
function updateItemsList() {
  if (AppState.obtainedItems.length === 0) {
    DOM.itemsList.innerHTML = '<li class="item-placeholder">Nenhum item ainda</li>'
    return
  }

  // Mostra apenas os últimos 20 itens
  const recentItems = AppState.obtainedItems.slice(0, 20)

  DOM.itemsList.innerHTML = recentItems
    .map(
      (item) => `
    <li class="item-entry star-${item.rarity}">
      ${item.name} (${item.rarity}★)
    </li>
  `,
    )
    .join("")
}

/**
 * Troca o banner ativo
 */
function switchBanner(bannerId) {
  // Atualiza estado
  AppState.currentBanner = bannerId

  // Atualiza abas
  DOM.tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === bannerId)
  })

  // Atualiza conteúdo do banner
  DOM.bannerContents.forEach((content) => {
    content.classList.toggle("active", content.id === `${bannerId}-banner`)
  })
}

// ===================================
// EVENT LISTENERS
// ===================================

/**
 * Inicializa todos os event listeners
 */
function initEventListeners() {
  // Botões de wish
  DOM.wishSingle.addEventListener("click", () => performWish(1))
  DOM.wishMulti.addEventListener("click", () => performWish(10))

  // Fechar modal
  DOM.closeModal.addEventListener("click", closeResultsModal)
  DOM.resultModal.addEventListener("click", (e) => {
    if (e.target === DOM.resultModal) {
      closeResultsModal()
    }
  })

  // Abas de banner
  DOM.tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchBanner(btn.dataset.tab)
    })
  })

  // Tecla ESC para fechar modal
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeResultsModal()
    }
  })
}

// ===================================
// API PÚBLICA DE ECONOMIA (GEMAS)
// ===================================

/**
 * Adiciona gemas ao jogador
 * Pode ser chamada por scripts externos (quests, eventos, recompensas)
 * @param {number} amount - Quantidade de gemas
 */
function addGems(amount) {
  if (typeof amount !== "number" || amount <= 0) return

  AppState.gems += amount
  updateUI()

  console.log(`💎 +${amount} gemas adicionadas`)
}

// Expõe globalmente para outros arquivos JS
window.addGems = addGems


// ===================================
// INICIALIZAÇÃO
// ===================================

/**
 * Inicializa a aplicação
 */
function init() {
  console.log("🎮 Wish Simulator iniciado!")
  console.log("📁 Lembre-se de adicionar seus vídeos em:")
  console.log("   - videos/wish1-video.mp4")
  console.log("   - videos/wish2-video.mp4")

  initEventListeners()
  updateUI()
}

// Inicia quando o DOM estiver pronto
document.addEventListener("DOMContentLoaded", init)
