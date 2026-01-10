/**
 * ===================================
 * WISH SIMULATOR - SISTEMA PRINCIPAL
 * ===================================
 */

// ===================================
// CONFIGURAÇÃO DO SISTEMA
// ===================================

const VIDEO_CONFIG = {
  star5: "../Midia/5star.mp4",
  star4: "../Midia/4star.mp4",
  star3: "../Midia/3star.mp4",
}

const WISH_CONFIG = {
  wish1: {
    name: "Banner Especial 1",
    items: [
      { name: "Biscoitin", rarity: 3, image: "../wishes/biscoito.jpeg" },
      { name: "Biscoitin", rarity: 3, image: "../wishes/biscoito.jpeg" },
      { name: "Nescauzin", rarity: 4, image: "../wishes/Toddy.jpeg" },
      { name: "Tortelete Lendário", rarity: 5, image: "../wishes/TierS.jpeg" },
    ],
  },
  wish2: {
    name: "Banner Especial 2",
    items: [
      { name: "Item Comum A", rarity: 3, image: "../wishes/biscoito.jpeg" },
      { name: "Item Comum B", rarity: 3, image: "../wishes/biscoito.jpeg" },
      { name: "Item Raro A", rarity: 4, image: "../wishes/Toddy.jpeg" },
      { name: "Item Lendário A", rarity: 5, image: "../wishes/TierS.jpeg" },
    ],
  },
}

const DROP_RATES = {
  star5: 0.6,
  star4: 5.1,
  star3: 94.3,
}

const WISH_COSTS = {
  single: 160,
  multi: 1600,
}

// ===================================
// STORAGE
// ===================================

const STORAGE_KEY = "wishSimulator"

function loadFromStorage() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      AppState.gems = data.gems ?? 8000
      AppState.coins = data.coins ?? 1600
      AppState.pity5Star = data.pity5Star ?? 0
      AppState.pity4Star = data.pity4Star ?? 0
      AppState.obtainedItems = data.obtainedItems ?? []
      AppState.totalWishesToday = data.totalWishesToday ?? 0
      AppState.lastWishDate = data.lastWishDate ?? null
      checkDailyReset()
    }
  } catch (error) {
    console.error("Erro ao carregar dados:", error)
  }
}

function saveToStorage() {
  try {
    const data = {
      gems: AppState.gems,
      coins: AppState.coins,
      pity5Star: AppState.pity5Star,
      pity4Star: AppState.pity4Star,
      obtainedItems: AppState.obtainedItems.slice(0, 100),
      totalWishesToday: AppState.totalWishesToday,
      lastWishDate: AppState.lastWishDate,
      questProgress: getQuestProgress(),
      completedToday: getCompletedToday(),
      gemsEarnedToday: getGemsEarnedToday(),
      lastResetDate: getLastResetDate(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("Erro ao salvar dados:", error)
  }
}

function getQuestProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      return data.questProgress ?? null
    }
  } catch (e) {}
  return null
}

function getCompletedToday() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      return data.completedToday ?? 0
    }
  } catch (e) {}
  return 0
}

function getGemsEarnedToday() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      return data.gemsEarnedToday ?? 0
    }
  } catch (e) {}
  return 0
}

function getLastResetDate() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      return data.lastResetDate ?? null
    }
  } catch (e) {}
  return null
}

function checkDailyReset() {
  const today = new Date().toDateString()
  if (AppState.lastWishDate !== today) {
    AppState.totalWishesToday = 0
    AppState.lastWishDate = today
  }
}

function updateQuestProgress(wishCount, got5Star) {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const data = JSON.parse(saved)
      if (data.questProgress) {
        data.questProgress = data.questProgress.map((quest) => {
          if (quest.id === "daily_wish_1" || quest.id === "daily_wish_5" || quest.id === "daily_wish_10") {
            const newProgress = (quest.progress || 0) + wishCount
            const target = quest.id === "daily_wish_1" ? 1 : quest.id === "daily_wish_5" ? 5 : 10
            return { ...quest, progress: newProgress, completed: newProgress >= target }
          }
          if (quest.id === "weekly_wish_50") {
            const newProgress = (quest.progress || 0) + wishCount
            return { ...quest, progress: newProgress, completed: newProgress >= 50 }
          }
          if (quest.id === "weekly_5star" && got5Star) {
            return { ...quest, progress: 1, completed: true }
          }
          return quest
        })
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
      }
    }
  } catch (error) {
    console.error("Erro ao atualizar progresso de quests:", error)
  }
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
  totalWishesToday: 0,
  lastWishDate: null,
}

let DOM = {}

// ===================================
// FUNÇÕES DE UTILIDADE
// ===================================

function randomBetween(min, max) {
  return Math.random() * (max - min) + min
}

function determineRarity() {
  const roll = Math.random() * 100

  if (AppState.pity5Star >= 89) {
    return 5
  }

  if (AppState.pity4Star >= 9) {
    return 4
  }

  if (roll < DROP_RATES.star5) {
    return 5
  } else if (roll < DROP_RATES.star5 + DROP_RATES.star4) {
    return 4
  }
  return 3
}

function getRandomItem(rarity) {
  const config = WISH_CONFIG[AppState.currentBanner]
  const possibleItems = config.items.filter((item) => item.rarity === rarity)

  if (possibleItems.length === 0) {
    return { name: `Item ${rarity}★`, rarity: rarity }
  }

  return possibleItems[Math.floor(Math.random() * possibleItems.length)]
}

// ===================================
// FUNÇÕES DE VÍDEO
// ===================================

function getVideoPathByRarity(maxRarity) {
  if (maxRarity >= 5) {
    return VIDEO_CONFIG.star5
  } else if (maxRarity >= 4) {
    return VIDEO_CONFIG.star4
  }
  return VIDEO_CONFIG.star3
}

function playWishVideo(videoPath) {
  return new Promise((resolve) => {
    if (!videoPath || !DOM.video || !DOM.videoSource) {
      resolve()
      return
    }

    // Remove event listeners antigos
    DOM.video.onended = null
    DOM.video.onerror = null

    DOM.videoSource.src = videoPath
    DOM.video.load()

    DOM.video.classList.add("active")
    DOM.video.classList.remove("hidden")
    if (DOM.backgroundImage) {
      DOM.backgroundImage.classList.add("hidden")
    }

    // Evento quando o vídeo termina
    DOM.video.onended = () => {
      DOM.video.onended = null
      resolve()
    }

    // Evento de erro
    DOM.video.onerror = () => {
      DOM.video.onerror = null
      console.warn("Vídeo não encontrado em:", videoPath)
      hideVideo()
      resolve()
    }

    // Tenta reproduzir o vídeo
    const playPromise = DOM.video.play()
    if (playPromise !== undefined) {
      playPromise.catch((error) => {
        console.warn("Erro ao reproduzir vídeo:", error)
        hideVideo()
        resolve()
      })
    }
  })
}

function hideVideo() {
  if (!DOM.video) return

  DOM.video.classList.remove("active")
  DOM.video.classList.add("hidden")
  if (DOM.backgroundImage) {
    DOM.backgroundImage.classList.remove("hidden")
  }
  DOM.video.pause()
  DOM.video.currentTime = 0
}

// ===================================
// FUNÇÕES DE WISH
// ===================================

async function performWish(count) {
  if (AppState.isWishing) return

  const cost = count === 1 ? WISH_COSTS.single : WISH_COSTS.multi

  if (AppState.gems < cost) {
    alert("Gemas insuficientes! Complete quests para ganhar mais gemas.")
    return
  }

  AppState.isWishing = true
  AppState.gems -= cost
  updateUI()

  const results = []
  let maxRarity = 3
  let got5Star = false

  for (let i = 0; i < count; i++) {
    const rarity = determineRarity()
    const item = getRandomItem(rarity)

    if (rarity > maxRarity) {
      maxRarity = rarity
    }

    if (rarity === 5) {
      got5Star = true
    }

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

  AppState.totalWishesToday += count
  updateQuestProgress(count, got5Star)

  const videoPath = getVideoPathByRarity(maxRarity)

  if (videoPath) {
    await playWishVideo(videoPath)
    hideVideo()
  }

  showResults(results)
  updateUI()
  saveToStorage()

  AppState.isWishing = false
}

function showResults(items) {
  if (!DOM.resultItems || !DOM.resultModal) return

  DOM.resultItems.innerHTML = ""

  items.forEach((item) => {
    const itemEl = document.createElement("div")
    itemEl.className = `result-item star-${item.rarity}`
    itemEl.innerHTML = `
      <div class="item-display">
        ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-image" />` : ""}
        <div class="item-info">
          <span class="item-name">${item.name}</span>
          <span class="item-rarity">${"★".repeat(item.rarity)}</span>
        </div>
      </div>
    `
    DOM.resultItems.appendChild(itemEl)
  })

  DOM.resultModal.classList.remove("hidden")
}

function closeResultsModal() {
  if (DOM.resultModal) {
    DOM.resultModal.classList.add("hidden")
  }
}

// ===================================
// FUNÇÕES DE INTERFACE
// ===================================

function updateUI() {
  if (DOM.gemsCount) DOM.gemsCount.textContent = AppState.gems
  if (DOM.coinsCount) DOM.coinsCount.textContent = AppState.coins
  if (DOM.pity5Star) DOM.pity5Star.textContent = AppState.pity5Star
  if (DOM.pity4Star) DOM.pity4Star.textContent = AppState.pity4Star
  updateItemsList()
}

function updateItemsList() {
  if (!DOM.itemsList) return

  if (AppState.obtainedItems.length === 0) {
    DOM.itemsList.innerHTML = '<li class="item-placeholder">Nenhum item ainda</li>'
    return
  }

  const recentItems = AppState.obtainedItems.slice(0, 20)

  DOM.itemsList.innerHTML = recentItems
    .map(
      (item) => `
    <li class="item-entry star-${item.rarity}">
      ${item.image ? `<img src="${item.image}" alt="${item.name}" class="item-thumb" />` : ""}
      <span>${item.name} (${item.rarity}★)</span>
    </li>
  `,
    )
    .join("")
}

function switchBanner(bannerId) {
  AppState.currentBanner = bannerId

  DOM.tabButtons.forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.tab === bannerId)
  })

  DOM.bannerContents.forEach((content) => {
    content.classList.toggle("active", content.id === `${bannerId}-banner`)
  })
}

// ===================================
// EVENT LISTENERS
// ===================================

function initEventListeners() {
  if (DOM.wishSingle) {
    DOM.wishSingle.addEventListener("click", () => performWish(1))
  }
  if (DOM.wishMulti) {
    DOM.wishMulti.addEventListener("click", () => performWish(10))
  }

  if (DOM.closeModal) {
    DOM.closeModal.addEventListener("click", closeResultsModal)
  }
  if (DOM.resultModal) {
    DOM.resultModal.addEventListener("click", (e) => {
      if (e.target === DOM.resultModal) {
        closeResultsModal()
      }
    })
  }

  DOM.tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      switchBanner(btn.dataset.tab)
    })
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeResultsModal()
    }
  })
}

// ===================================
// INICIALIZAÇÃO
// ===================================

function initDOM() {
  DOM = {
    video: document.getElementById("wish-video"),
    videoSource: document.getElementById("video-source"),
    backgroundImage: document.getElementById("background-image"),
    gemsCount: document.getElementById("gems-count"),
    coinsCount: document.getElementById("coins-count"),
    pity5Star: document.getElementById("pity-5star"),
    pity4Star: document.getElementById("pity-4star"),
    itemsList: document.getElementById("items-list"),
    resultItems: document.getElementById("result-items"),
    resultModal: document.getElementById("result-modal"),
    closeModal: document.getElementById("close-modal"),
    wishSingle: document.getElementById("wish-single"),
    wishMulti: document.getElementById("wish-multi"),
    tabButtons: document.querySelectorAll(".tab-button"),
    bannerContents: document.querySelectorAll(".banner-content"),
  }
}

function init() {
  console.log("🎮 Wish Simulator iniciado!")

  initDOM()
  loadFromStorage()
  initEventListeners()
  updateUI()
}

document.addEventListener("DOMContentLoaded", init)
