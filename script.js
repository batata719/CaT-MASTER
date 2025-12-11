// --- Configuração Inicial ---
const gameState = {
    cookies: 0,
    totalCookiesBaked: 0,
    cps: 0, // Cookies Por Segundo
    clickValue: 1,
    buildings: [
        { id: 0, name: "Cursor", baseCost: 15, cps: 0.1, count: 0, icon: "👆" },
        { id: 1, name: "Vovó", baseCost: 100, cps: 1, count: 0, icon: "👵" },
        { id: 2, name: "Fazenda", baseCost: 1100, cps: 8, count: 0, icon: "🚜" },
        { id: 3, name: "Mina", baseCost: 12000, cps: 47, count: 0, icon: "⛏️" },
        { id: 4, name: "Fábrica", baseCost: 130000, cps: 260, count: 0, icon: "🏭" },
        { id: 5, name: "Banco", baseCost: 1400000, cps: 1400, count: 0, icon: "🏦" },
        { id: 6, name: "Templo", baseCost: 20000000, cps: 7800, count: 0, icon: "🏛️" }
    ]
};

// --- Elementos do DOM ---
const elements = {
    cookieDisplay: document.getElementById('cookie-display'),
    cpsDisplay: document.getElementById('cps-display'),
    bigCookie: document.getElementById('big-cookie'),
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
    
    // Loop de Jogo (Atualiza lógica e UI)
    setInterval(gameLoop, 100); // Roda 10x por segundo para suavidade
    setInterval(saveGame, 30000); // Auto-save a cada 30s
    
    // Event Listeners
    elements.bigCookie.addEventListener('click', handleCookieClick);
    elements.saveBtn.addEventListener('click', () => { saveGame(); showMessage("Jogo Salvo!"); });
    elements.resetBtn.addEventListener('click', resetGame);
}

// Clique no Cookie
function handleCookieClick(e) {
    addCookies(gameState.clickValue);
    createParticles(e.clientX, e.clientY, `+${formatNumber(gameState.clickValue)}`);
    // Animação CSS extra via JS se necessário, mas o CSS :active já resolve bem
}

// Loop Principal
function gameLoop() {
    // Adiciona Cookies baseados no CPS
    // Se rodamos a cada 100ms, adicionamos CPS / 10
    if (gameState.cps > 0) {
        const cookiesEarned = gameState.cps / 10;
        addCookies(cookiesEarned);
    }
    updateUI();
}

function addCookies(amount) {
    gameState.cookies += amount;
    gameState.totalCookiesBaked += amount;
}

// Atualiza Toda a Interface
function updateUI() {
    elements.cookieDisplay.textContent = `${formatNumber(Math.floor(gameState.cookies))} Cookies`;
    elements.cpsDisplay.textContent = `por segundo: ${formatNumber(gameState.cps.toFixed(1))}`;
    
    // Atualiza o Título da Aba
    elements.title.textContent = `${formatNumber(Math.floor(gameState.cookies))} Cookies - Mestre`;

    // Verifica botões da loja (Habilita/Desabilita visualmente)
    gameState.buildings.forEach(building => {
        const btn = document.getElementById(`btn-building-${building.id}`);
        const cost = getBuildingCost(building);
        
        if (gameState.cookies >= cost) {
            btn.classList.remove('disabled');
        } else {
            btn.classList.add('disabled');
        }
    });
}

// --- Lógica da Loja ---

function getBuildingCost(building) {
    // Fórmula clássica: CustoBase * (1.15 ^ Quantidade)
    return Math.floor(building.baseCost * Math.pow(1.15, building.count));
}

function renderStore() {
    elements.storeContainer.innerHTML = "";
    
    gameState.buildings.forEach(building => {
        const cost = getBuildingCost(building);
        
        const item = document.createElement('div');
        item.className = 'upgrade-item disabled'; // Começa desabilitado até updateUI rodar
        item.id = `btn-building-${building.id}`;
        item.onclick = () => buyBuilding(building.id);
        
        item.innerHTML = `
            <div class="upgrade-icon" style="font-size: 2rem; margin-right: 10px;">${building.icon}</div>
            <div class="upgrade-info" style="flex: 1;">
                <h3>${building.name}</h3>
                <p class="upgrade-cost">🍪 ${formatNumber(cost)}</p>
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

    if (gameState.cookies >= cost) {
        gameState.cookies -= cost;
        building.count++;
        recalculateCPS();
        
        // Atualiza visual da loja apenas para esse item
        const countDisplay = document.getElementById(`count-building-${building.id}`);
        countDisplay.textContent = building.count;
        
        // Atualiza o preço no DOM
        renderStore(); // Re-renderiza para atualizar preços (poderia ser otimizado, mas funciona bem)
        showMessage(`Comprou ${building.name}!`);
    }
}

function recalculateCPS() {
    let cps = 0;
    gameState.buildings.forEach(b => {
        cps += b.count * b.cps;
    });
    gameState.cps = cps;
}

// --- Efeitos Visuais ---

function createParticles(x, y, text) {
    const particle = document.createElement('div');
    particle.className = 'floating-number';
    particle.textContent = text;
    
    // Pequena variação aleatória na posição
    const randomX = (Math.random() - 0.5) * 40;
    particle.style.left = `${x + randomX}px`;
    particle.style.top = `${y - 20}px`;
    
    document.body.appendChild(particle);
    
    // Remove do DOM após a animação (1s)
    setTimeout(() => {
        particle.remove();
    }, 1000);
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

// --- Save / Load System ---

function saveGame() {
    localStorage.setItem('cookieClickerSave', JSON.stringify(gameState));
}

function loadGame() {
    const saved = localStorage.getItem('cookieClickerSave');
    if (saved) {
        const parsed = JSON.parse(saved);
        // Precisamos mesclar para evitar erros se mudarmos a estrutura do objeto no futuro
        gameState.cookies = parsed.cookies;
        gameState.totalCookiesBaked = parsed.totalCookiesBaked || 0;
        
        // Recupera contagem de prédios
        parsed.buildings.forEach((savedB, index) => {
            if (gameState.buildings[index]) {
                gameState.buildings[index].count = savedB.count;
            }
        });
        recalculateCPS();
    }
}

function resetGame() {
    if(confirm("Tem certeza que quer perder todo o progresso?")) {
        localStorage.removeItem('cookieClickerSave');
        location.reload();
    }
}

// Iniciar
init();
