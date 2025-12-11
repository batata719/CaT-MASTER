// --- Configuração Inicial ---
const gameState = {
    score: 0, // Agora representa "Ronrons"
    totalScoreAccumulated: 0,
    cps: 0, // Ronrons Por Segundo
    clickValue: 1,
    // AQUI ESTÁ A MÁGICA: Itens de Gato!
    buildings: [
        { id: 0, name: "Petisco", baseCost: 15, cps: 0.1, count: 0, icon: "🐟" },
        { id: 1, name: "Caixa de Papelão", baseCost: 100, cps: 1, count: 0, icon: "📦" },
        { id: 2, name: "Arranhador", baseCost: 1100, cps: 8, count: 0, icon: "🧶" },
        { id: 3, name: "Catnip (Erva)", baseCost: 12000, cps: 47, count: 0, icon: "🌿" },
        { id: 4, name: "Fábrica de Sachê", baseCost: 130000, cps: 260, count: 0, icon: "🏭" },
        { id: 5, name: "Santuário Felino", baseCost: 1400000, cps: 1400, count: 0, icon: "⛩️" },
        { id: 6, name: "Planeta dos Gatos", baseCost: 20000000, cps: 7800, count: 0, icon: "🪐" }
    ]
};

// --- Elementos do DOM ---
const elements = {
    scoreDisplay: document.getElementById('score-display'),
    cpsDisplay: document.getElementById('cps-display'),
    bigCat: document.getElementById('big-cat'),
    storeContainer: document.getElementById('store-container'),
    msgLog: document.getElementById('message-log'),
    saveBtn: document.getElementById('save-btn'),
    resetBtn: document.getElementById('reset-btn'),
    title: document.querySelector('title')
};

// --- Funções Principais ---

function init() {
    loadGame();
    renderStore();
    
    // Loops
    setInterval(gameLoop, 100); 
    setInterval(saveGame, 30000); 
    
    // Eventos
    elements.bigCat.addEventListener('click', handleCatClick);
    elements.saveBtn.addEventListener('click', () => { saveGame(); showMessage("Progresso salvo! Miau!"); });
    elements.resetBtn.addEventListener('click', resetGame);
}

function handleCatClick(e) {
    addScore(gameState.clickValue);
    // Efeito visual com corações ou "miau"
    const randomText = Math.random() > 0.7 ? "Miau!" : `+${formatNumber(gameState.clickValue)}`;
    createParticles(e.clientX, e.clientY, randomText);
}

function gameLoop() {
    if (gameState.cps > 0) {
        const earned = gameState.cps / 10;
        addScore(earned);
    }
    updateUI();
}

function addScore(amount) {
    gameState.score += amount;
    gameState.totalScoreAccumulated += amount;
}

function updateUI() {
    elements.scoreDisplay.textContent = `${formatNumber(Math.floor(gameState.score))} Ronrons`;
    elements.cpsDisplay.textContent = `por segundo: ${formatNumber(gameState.cps.toFixed(1))}`;
    
    elements.title.textContent = `${formatNumber(Math.floor(gameState.score))} Ronrons - Gatos`;

    gameState.buildings.forEach(building => {
        const btn = document.getElementById(`btn-building-${building.id}`);
        const cost = getBuildingCost(building);
        
        if (gameState.score >= cost) {
            btn.classList.remove('disabled');
        } else {
            btn.classList.add('disabled');
        }
    });
}

// --- Loja ---

function getBuildingCost(building) {
    return Math.floor(building.baseCost * Math.pow(1.15, building.count));
}

function renderStore() {
    elements.storeContainer.innerHTML = "";
    
    gameState.buildings.forEach(building => {
        const cost = getBuildingCost(building);
        
        const item = document.createElement('div');
        item.className = 'upgrade-item disabled';
        item.id = `btn-building-${building.id}`;
        item.onclick = () => buyBuilding(building.id);
        
        item.innerHTML = `
            <div class="upgrade-icon" style="font-size: 2rem; margin-right: 10px;">${building.icon}</div>
            <div class="upgrade-info" style="flex: 1;">
                <h3>${building.name}</h3>
                <p class="upgrade-cost">🧶 ${formatNumber(cost)}</p>
                <p>+${formatNumber(building.cps)} CPS</p>
            </div>
            <div class="upgrade-count" id="count-building-${building.id}">${building.count}</div>
        `;
        
        elements.storeContainer.appendChild(item);
    });
}

function buyBuilding(id) {
    const building = gameState.buildings.find(b => b.id === id);
    const cost = getBuildingCost(building);

    if (gameState.score >= cost) {
        gameState.score -= cost;
        building.count++;
        recalculateCPS();
        
        const countDisplay = document.getElementById(`count-building-${building.id}`);
        countDisplay.textContent = building.count;
        
        renderStore();
        
        // Mensagens temáticas
        const msgs = ["Boa escolha!", "Os gatos amaram!", "Mais ronrons!", "Purr purr..."];
        showMessage(`${building.name} comprado! ${msgs[Math.floor(Math.random()*msgs.length)]}`);
    }
}

function recalculateCPS() {
    let cps = 0;
    gameState.buildings.forEach(b => {
        cps += b.count * b.cps;
    });
    gameState.cps = cps;
}

// --- Efeitos ---

function createParticles(x, y, text) {
    const particle = document.createElement('div');
    particle.className = 'floating-number';
    particle.textContent = text;
    
    const randomX = (Math.random() - 0.5) * 40;
    particle.style.left = `${x + randomX}px`;
    particle.style.top = `${y - 20}px`;
    
    document.body.appendChild(particle);
    
    setTimeout(() => { particle.remove(); }, 1000);
}

function showMessage(msg) {
    elements.msgLog.textContent = msg;
    elements.msgLog.style.opacity = 1;
    setTimeout(() => elements.msgLog.style.opacity = 0.5, 2000);
}

// --- Utilitários ---

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k';
    return num;
}

// --- Save/Load (Atualizado para chave 'catClickerSave') ---

function saveGame() {
    localStorage.setItem('catClickerSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('catClickerSave');
    if (saved) {
        const parsed = JSON.parse(saved);
        gameState.score = parsed.score || 0;
        gameState.totalScoreAccumulated = parsed.totalScoreAccumulated || 0;
        
        parsed.buildings.forEach((savedB, index) => {
            if (gameState.buildings[index]) {
                gameState.buildings[index].count = savedB.count;
            }
        });
        recalculateCPS();
    }
}

function resetGame() {
    if(confirm("Quer mesmo abandonar seus gatos? (O progresso será perdido)")) {
        localStorage.removeItem('catClickerSave');
        location.reload();
    }
}

init();
