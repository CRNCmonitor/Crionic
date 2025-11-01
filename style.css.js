// --- Jazykové preklady ---
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
        api_getblockcount: "getblockcount:"
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
        api_getblockcount: "getblockcount:"
    },
    de: {
        network_market_title: "NETZWERK & MARKTDATEN",
        pools_explorer_title: "POOLS & EXPLORER API",
        hashrate_label: "Netzwerk Hashrate",
        difficulty_label: "Schwierigkeit",
        market_price_label: "CRNC Preis (USD)",
        block_count_label: "Blockanzahl",
        connections_label: "Verbindungen",
        pools_title: "Verfügbare Pools",
        api_docs_title: "API Dokumentation",
        wallet_download: "Crionic Core Wallet",
        miner_download: "SRB Miner",
        downloads_title: "DOWNLOADS & SOZIALE NETZWERKE",
        social_title: "Verbinde dich mit uns",
        visitors_label: "Einzigartige Besucher:",
        refresh_label: "Auto-Aktualisierung:",
        refresh_on: "AN",
        refresh_off: "AUS",
        api_getdifficulty: "getdifficulty:",
        api_getblockcount: "getblockcount:"
    }
};

let currentLang = "en";
let isRefreshing = true;

function applyTranslations(lang) {
    document.querySelectorAll("[data-lang-key]").forEach(el => {
        const key = el.getAttribute("data-lang-key");
        if (translations[lang] && translations[lang][key]) {
            el.textContent = translations[lang][key];
        }
    });

    document.querySelector(".button-wallet").textContent = translations[lang].wallet_download;
    document.querySelector(".button-miner").textContent = translations[lang].miner_download;
    document.getElementById("refresh-status").textContent = isRefreshing ? translations[lang].refresh_on : translations[lang].refresh_off;
}

function detectAndSetLanguage() {
    const browserLang = navigator.language.substring(0, 2).toLowerCase();
    currentLang = translations[browserLang] ? browserLang : "en";
    document.documentElement.lang = currentLang;
    applyTranslations(currentLang);
}

// --- API Fetch simulácia (nahraď reálnymi URL) ---
async function fetchApiData(url) {
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error("HTTP error");
        return await res.json();
    } catch {
        // fallback – simulované dáta
        return {
            hashrate: (Math.random() * 2000).toFixed(2) + " GH/s",
            difficulty: (Math.random() * 80000).toFixed(0),
            price: (Math.random() * 0.5 + 0.1).toFixed(4),
            blockcount: (Math.random() * 800000).toFixed(0),
            connections: (Math.random() * 300 + 50).toFixed(0)
        };
    }
}

// --- UPDATE FUNKCIE ---
async function fastUpdate() {
    if (!isRefreshing) return;
    const data = await fetchApiData("https://explorer.crionic.org/ext/getsummary");

    document.getElementById("network-hashrate").textContent = data.hashrate || data.hashrate || "N/A";
    document.getElementById("difficulty").textContent = data.difficulty || "N/A";
    document.getElementById("market-price").textContent = data.price ? `$${data.price}` : "$0.0000";

    // animácia barov
    const diffValue = parseFloat(data.difficulty || 0);
    const hashrateValue = parseFloat((data.hashrate || "0").toString().replace(/[^\d.]/g, ""));
    document.getElementById("difficulty-bar").style.width = `${Math.min((diffValue / 100000) * 100, 100)}%`;
    document.getElementById("hashrate-bar").style.width = `${Math.min((hashrateValue / 2000) * 100, 100)}%`;
}

async function slowUpdate() {
    if (!isRefreshing) return;
    const data = await fetchApiData("https://explorer.crionic.org/ext/getsummary");

    document.getElementById("block-count").textContent = data.blockcount || "N/A";
    document.getElementById("connections").textContent = data.connections || "N/A";

    const conn = parseFloat(data.connections || 0);
    document.getElementById("connections-bar").style.width = `${Math.min((conn / 600) * 100, 100)}%`;
}

function updateVisitorCounter() {
    let count = localStorage.getItem("crionic_visitors");
    count = count ? parseInt(count) + 1 : 1;
    localStorage.setItem("crionic_visitors", count);
    document.getElementById("visitor-counter").textContent = `${translations[currentLang].visitors_label} ${count}`;
}

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
    detectAndSetLanguage();
    updateVisitorCounter();

    document.querySelectorAll(".flag-button").forEach(btn => {
        btn.addEventListener("click", () => {
            const lang = btn.getAttribute("data-lang");
            currentLang = translations[lang] ? lang : "en";
            document.documentElement.lang = currentLang;
            applyTranslations(currentLang);
        });
    });

    document.getElementById("refresh-indicator").addEventListener("click", () => {
        isRefreshing = !isRefreshing;
        const el = document.getElementById("refresh-status");
        el.textContent = isRefreshing ? translations[currentLang].refresh_on : translations[currentLang].refresh_off;
        el.classList.toggle("on", isRefreshing);
    });

    // Spusti hneď
    fastUpdate();
    slowUpdate();

    // Intervaly
    setInterval(fastUpdate, 1000);
    setInterval(slowUpdate, 10000);

    // Aktivuj pulzovanie
    document.getElementById("refresh-status").classList.add("on");
});
