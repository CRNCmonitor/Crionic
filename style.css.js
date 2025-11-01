// --- JAZYKOVÉ DÁTA (lang.json by bolo lepšie, ale pre jeden súbor je toto OK) ---
const translations = {
    en: {
        network_market_title: "NETWORK & MARKET DATA",
        pools_explorer_title: "POOLS & EXPLORER API",
        hashrate_label: "Network Hashrate",
        difficulty_label: "Difficulty",
        market_price_label: "CRNC Price (USD)",
        block_count_label: "Block Count",
        connections_label: "Connections",
        pools_title: "Available Pools",
        api_docs_title: "API Documentation",
        wallet_download: "Crionic Core Wallet",
        miner_download: "SRB Miner",
        downloads_title: "DOWNLOADS & SOCIAL",
        social_title: "Connect with us",
        visitors_label: "Unique Visitors:",
        refresh_label: "Auto-Refresh:",
        refresh_on: "ON",
        refresh_off: "OFF",
        api_getdifficulty: "getdifficulty:",
        api_getblockcount: "getblockcount:",
        // ... doplňte všetky kľúče
    },
    sk: {
        network_market_title: "DÁTA SIETE A TRHU",
        pools_explorer_title: "POOLY A EXPLORER API",
        hashrate_label: "Hashrate Siete",
        difficulty_label: "Obtiažnosť",
        market_price_label: "Cena CRNC (USD)",
        block_count_label: "Počet Blokov",
        connections_label: "Pripojenia",
        pools_title: "Dostupné Pooly",
        api_docs_title: "API Dokumentácia",
        wallet_download: "Peňaženka Crionic Core",
        miner_download: "SRB Miner",
        downloads_title: "SŤAHOVANIE A SOCIÁLNE SIETE",
        social_title: "Spojte sa s nami",
        visitors_label: "Unikátni Návštevníci:",
        refresh_label: "Auto-Obnovenie:",
        refresh_on: "ZAP.",
        refresh_off: "VYP.",
        api_getdifficulty: "getdifficulty:",
        api_getblockcount: "getblockcount:",
        // ... doplňte všetky kľúče
    },
    // ... DE, FR, RU atď.
};

let currentLang = 'en';

// Funkcia na preklad textu na základe data-lang-key
function applyTranslations(lang) {
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[lang] && translations[lang][key]) {
            element.textContent = translations[lang][key];
        }
    });

    // Aktualizácia textov, ktoré nie sú v data-lang-key atribúte (ako tlačidlá)
    document.querySelector('.button-wallet').textContent = translations[lang].wallet_download;
    document.querySelector('.button-miner').textContent = translations[lang].miner_download;
    document.getElementById('refresh-status').textContent = isRefreshing ? translations[lang].refresh_on : translations[lang].refresh_off;
    // ... (pridajte ďalšie)
}

// Auto detekcia jazyka prehliadača
function detectAndSetLanguage() {
    const browserLang = navigator.language.substring(0, 2).toLowerCase();
    if (translations[browserLang]) {
        currentLang = browserLang;
    } else {
        currentLang = 'en'; // Prednastavený EN
    }
    document.documentElement.lang = currentLang;
    applyTranslations(currentLang);
}

// Event Listenery pre vlajky
document.querySelectorAll('.flag-button').forEach(button => {
    button.addEventListener('click', () => {
        const newLang = button.getAttribute('data-lang');
        currentLang = newLang;
        document.documentElement.lang = newLang;
        applyTranslations(newLang);
    });
});


// --- API DÁTA A AKTUALIZÁCIA LOGIKA ---
let isRefreshing = true;

// Pomocná funkcia na simuláciu získania dát z API
async function fetchApiData(url) {
    // V reálnej aplikácii by to bol: return (await fetch(url)).json();
    // Tu len simulujeme dáta
    await new Promise(r => setTimeout(r, 100)); // Simulácia latencie
    const dummyData = {
        hashrate: (Math.random() * 1000 + 500).toFixed(2) + ' GH/s',
        difficulty: (Math.random() * 50000 + 10000).toFixed(0),
        price: (Math.random() * 0.5 + 0.1).toFixed(4),
        blockcount: (Math.random() * 100000 + 500000).toFixed(0),
        connections: (Math.random() * 500 + 100).toFixed(0)
    };
    return dummyData;
}

// 1. Rýchla aktualizácia (1 sekunda)
async function fastUpdate() {
    if (!isRefreshing) return;

    const data = await fetchApiData('API_URL_NETWORK_MARKET');

    // Aktualizácia textu
    document.getElementById('network-hashrate').textContent = data.hashrate;
    document.getElementById('difficulty').textContent = data.difficulty;
    document.getElementById('market-price').textContent = `$${data.price}`;

    // Aktualizácia progress barov (príklad - percento z Max Difficulty 100 000)
    const difficultyProgress = (parseInt(data.difficulty) / 100000) * 100;
    document.getElementById('difficulty-bar').style.width = `${Math.min(difficultyProgress, 100)}%`;
    
    // Hashrate Progress (príklad - percento z Max Hashrate 2000 GH/s)
    const hashrateValue = parseFloat(data.hashrate.replace(' GH/s', ''));
    const hashrateProgress = (hashrateValue / 2000) * 100;
    document.getElementById('hashrate-bar').style.width = `${Math.min(hashrateProgress, 100)}%`;
}

// 2. Pomalá aktualizácia (10 sekúnd)
async function slowUpdate() {
    if (!isRefreshing) return;

    const data = await fetchApiData('API_URL_POOLS_EXPLORER');
    
    document.getElementById('block-count').textContent = data.blockcount;
    document.getElementById('connections').textContent = data.connections;

    // Connections Progress (príklad - percento z Max Connections 600)
    const connectionsProgress = (parseInt(data.connections) / 600) * 100;
    document.getElementById('connections-bar').style.width = `${Math.min(connectionsProgress, 100)}%`;
}

// Spustenie aktualizácií
setInterval(fastUpdate, 1000); // 1-sekundová aktualizácia
setInterval(slowUpdate, 10000); // 10-sekundová aktualizácia


// --- OSTATNÉ ---

// Počítadlo návštev (jednoduchá simulácia)
function updateVisitorCounter() {
    let count = localStorage.getItem('crionic_visitors');
    if (count === null) {
        count = 1;
    } else {
        count = parseInt(count) + 1;
    }
    // Pre unikátnych návštevníkov by bola potrebná backend logika/Google Analytics
    // Tu len simulujeme, že pri každom loadu pridáme 1 pre vizuálny efekt
    document.getElementById('visitor-counter').textContent = `${translations[currentLang].visitors_label} ${count}`;
    localStorage.setItem('crionic_visitors', count);
}

// Indikátor auto-refresh
document.getElementById('refresh-indicator').addEventListener('click', () => {
    isRefreshing = !isRefreshing;
    const statusElement = document.getElementById('refresh-status');
    statusElement.textContent = isRefreshing ? translations[currentLang].refresh_on : translations[currentLang].refresh_off;
    statusElement.classList.toggle('on', isRefreshing);
    // Pridanie pulzovania k indikátoru ON/OFF
    statusElement.classList.toggle('neon-glow-green', isRefreshing);
});


// Inicializácia
document.addEventListener('DOMContentLoaded', () => {
    detectAndSetLanguage(); // Nastaví jazyk a spustí preklady
    updateVisitorCounter(); // Aktualizuje počítadlo
    fastUpdate(); // Prvý rýchly update
    slowUpdate(); // Prvý pomalý update
    document.getElementById('refresh-status').classList.add('on'); // Inicializuje pulzovanie
});