// --- JAZYKOVÉ DÁTA ---
const translations = {
    en: {
        page_title: "Crionic Network Dashboard - Futurism",
        network_market_title: "NETWORK & MARKET DATA (1s Update)",
        pools_explorer_title: "POOLS & EXPLORER API (10s Update)",
        hashrate_label: "Network Hashrate",
        difficulty_label: "Difficulty",
        market_price_label: "CRNC Price (USD)",
        block_count_label: "Block Count",
        connections_label: "Connections",
        supply_label: "Money Supply",
        pools_title: "Available Pools",
        api_docs_title: "Explorer API Documentation",
        wallet_download: "Crionic Core Wallet",
        miner_download: "SRB Miner",
        komodo_wallet: "Komodo Wallet (CRNC)",
        nestex_exchange: "Nestex Exchange (CRNC/USDT)",
        downloads_title: "DOWNLOADS & SOCIAL",
        social_title: "Connect with us",
        visitors_label: "Unique Visitors:",
        refresh_label: "Auto-Refresh:",
        refresh_on: "ON",
        refresh_off: "OFF",
        api_getdifficulty: "getdifficulty:",
        api_getblockcount: "getblockcount:",
        api_getnetworkhashps: "getnetworkhashps:",
        api_getmoneysupply: "getmoneysupply:",
        api_pool_status: "Coin-Miners Pool Status:"
    },
    sk: {
        page_title: "Crionic Network Dashboard - Futurizmus",
        network_market_title: "DÁTA SIETE A TRHU (1s Obnova)",
        pools_explorer_title: "POOLY A EXPLORER API (10s Obnova)",
        hashrate_label: "Hashrate Siete",
        difficulty_label: "Obtiažnosť",
        market_price_label: "Cena CRNC (USD)",
        block_count_label: "Počet Blokov",
        connections_label: "Pripojenia",
        supply_label: "Obeh peňazí",
        pools_title: "Dostupné Pooly",
        api_docs_title: "Explorer API Dokumentácia",
        wallet_download: "Peňaženka Crionic Core",
        miner_download: "SRB Miner",
        komodo_wallet: "Komodo Peňaženka (CRNC)",
        nestex_exchange: "Nestex Burza (CRNC/USDT)",
        downloads_title: "SŤAHOVANIE A SOCIÁLNE SIETE",
        social_title: "Spojte sa s nami",
        visitors_label: "Unikátni Návštevníci:",
        refresh_label: "Auto-Obnovenie:",
        refresh_on: "ZAP.",
        refresh_off: "VYP.",
        api_getdifficulty: "getdifficulty:",
        api_getblockcount: "getblockcount:",
        api_getnetworkhashps: "getnetworkhashps:",
        api_getmoneysupply: "getmoneysupply:",
        api_pool_status: "Coin-Miners Stav Poolu:"
    },
    // Pridajte DE, RU atď. pre plnú multijazyčnosť.
    de: { /* ... */ }, ru: { /* ... */ }
};

let currentLang = 'en';
let isRefreshing = true;

// --- UTILITY FUNKCIE ---

// Funkcia na formátovanie hashrate (H/s, KH/s, MH/s, GH/s, TH/s, PH/s)
function formatHashrate(hashrate) {
    if (hashrate === null || isNaN(hashrate) || hashrate === 0) return '0 H/s';
    const units = ['H/s', 'KH/s', 'MH/s', 'GH/s', 'TH/s', 'PH/s'];
    let i = 0;
    while (hashrate > 1000 && i < units.length - 1) {
        hashrate /= 1000;
        i++;
    }
    return `${hashrate.toFixed(2)} ${units[i]}`;
}

// Funkcia na preklad textu
function applyTranslations(lang) {
    document.querySelectorAll('[data-lang-key]').forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (translations[lang] && translations[lang][key]) {
            // Pre titulok stránky
            if (key === 'page_title') {
                 document.title = translations[lang][key];
            } else {
                element.textContent = translations[lang][key];
            }
        }
    });

    // Aktualizácia textov tlačidiel
    document.querySelector('.button-wallet').textContent = translations[lang].wallet_download;
    document.querySelector('.button-miner').textContent = translations[lang].miner_download;
    document.querySelector('.button-komodo').textContent = translations[lang].komodo_wallet;
    document.querySelector('.button-nestex').textContent = translations[lang].nestex_exchange;
    
    // Aktualizácia refresh indikátora
    const refreshStatusEl = document.getElementById('refresh-status');
    refreshStatusEl.textContent = isRefreshing ? translations[lang].refresh_on : translations[lang].refresh_off;
}

// Auto detekcia jazyka prehliadača
function detectAndSetLanguage() {
    const browserLang = navigator.language.substring(0, 2).toLowerCase();
    if (translations[browserLang]) {
        currentLang = browserLang;
    } else {
        currentLang = 'en';
    }
    document.documentElement.lang = currentLang;
    applyTranslations(currentLang);
}


// --- API VOLANIA ---

// Spoločná funkcia pre Fetch
async function fetchData(url) {
    try {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP Chyba: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Chyba pri získavaní API dát z URL:", url, error);
        return null; 
    }
}

// 1. Rýchla aktualizácia (1 sekunda) - Hashrate, Difficulty, Cena
async function fastUpdate() {
    if (!isRefreshing) return;

    // A. Explorer API (Hashrate a Difficulty)
    const [hashrateData, difficultyData] = await Promise.all([
        fetchData('https://explorer.crionic.org/api/getnetworkhashps'),
        fetchData('https://explorer.crionic.org/api/getdifficulty')
    ]);

    if (hashrateData !== null) {
        const formattedHashrate = formatHashrate(parseFloat(hashrateData));
        document.getElementById('network-hashrate').textContent = formattedHashrate;
        // Progress bar pre hashrate (Max napr. 1 TH/s = 1000 GH/s = 1 000 000 000 KH/s)
        const hashrateProgress = (parseFloat(hashrateData) / 1000000000000) * 100; // Použijeme napr. 1 TH/s ako 100%
        document.getElementById('hashrate-bar').style.width = `${Math.min(hashrateProgress, 100)}%`;
    }

    if (difficultyData !== null) {
        const difficulty = parseFloat(difficultyData).toFixed(4);
        document.getElementById('difficulty').textContent = difficulty;
        // Progress bar pre difficulty (Max napr. 1 000 000)
        const difficultyProgress = (parseFloat(difficultyData) / 1000000) * 100;
        document.getElementById('difficulty-bar').style.width = `${Math.min(difficultyProgress, 100)}%`;
    }

    // B. CoinPaprika API (Cena CRNC/USD)
    // NOTE: CoinPaprika obmedzuje volania, pre produkčné nasadenie zvážte proxy alebo vlastný backend
    const priceData = await fetchData('https://api.coinpaprika.com/v1/tickers/crnc-crionic?quotes=USD');

    if (priceData && priceData.quotes && priceData.quotes.USD) {
        const price = priceData.quotes.USD.price.toFixed(5);
        document.getElementById('market-price').textContent = `$${price}`;
    }
}


// 2. Pomalá aktualizácia (10 sekúnd) - Block Count, Connections, Supply
async function slowUpdate() {
    if (!isRefreshing) return;

    const [blockData, connectionData, supplyData] = await Promise.all([
        fetchData('https://explorer.crionic.org/api/getblockcount'),
        fetchData('https://explorer.crionic.org/api/getconnectioncount'),
        fetchData('https://explorer.crionic.org/ext/getmoneysupply')
    ]);

    if (blockData !== null) {
        document.getElementById('block-count').textContent = parseInt(blockData).toLocaleString('en-US');
    }

    if (connectionData !== null) {
        const connections = parseInt(connectionData);
        document.getElementById('connections').textContent = connections;
        // Progress bar pre connections (Max napr. 500)
        const connectionsProgress = (connections / 500) * 100;
        document.getElementById('connections-bar').style.width = `${Math.min(connectionsProgress, 100)}%`;
    }

    if (supplyData !== null) {
        document.getElementById('money-supply').textContent = parseFloat(supplyData).toFixed(2).toLocaleString('en-US');
    }
}


// --- OSTATNÉ FUNKCIE ---

// Počítadlo návštev (jednoduchá simulácia lokálne)
function updateVisitorCounter() {
    let count = localStorage.getItem('crionic_visitors');
    if (count === null) {
        count = 1;
    } else {
        count = parseInt(count) + 1;
    }
    // Lokálne ukladanie počtu pre simuláciu
    document.getElementById('visitor-counter').textContent = `${translations[currentLang].visitors_label} ${count}`;
    localStorage.setItem('crionic_visitors', count);
}

// Logika pre auto-refresh indikátor
function setupRefreshIndicator() {
    const refreshIndicatorEl = document.getElementById('refresh-indicator');
    const refreshStatusEl = document.getElementById('refresh-status');

    refreshIndicatorEl.addEventListener('click', () => {
        isRefreshing = !isRefreshing;
        refreshStatusEl.textContent = isRefreshing ? translations[currentLang].refresh_on : translations[currentLang].refresh_off;
        refreshStatusEl.classList.toggle('on', isRefreshing);
        // Ak zapneme refresh, spustíme ihneď aktualizáciu
        if (isRefreshing) {
            fastUpdate();
            slowUpdate();
        }
    });

    // Inicializácia stavu
    refreshStatusEl.textContent = translations[currentLang].refresh_on;
    refreshStatusEl.classList.add('on');
}


// --- INICIALIZÁCIA A SPÚŠŤANIE ---

document.addEventListener('DOMContentLoaded', () => {
    detectAndSetLanguage(); // 1. Nastaví jazyk
    updateVisitorCounter(); // 2. Aktualizuje počítadlo
    setupRefreshIndicator(); // 3. Nastaví prepínač refreshu

    // Spustenie prvej aktualizácie
    fastUpdate();
    slowUpdate();

    // Nastavenie intervalov
    setInterval(fastUpdate, 1000); // 1-sekundová aktualizácia
    setInterval(slowUpdate, 10000); // 10-sekundová aktualizácia
});

// Event Listenery pre vlajky
document.querySelectorAll('.flag-button').forEach(button => {
    button.addEventListener('click', () => {
        const newLang = button.getAttribute('data-lang');
        currentLang = newLang;
        document.documentElement.lang = newLang;
        applyTranslations(newLang);
    });
});
