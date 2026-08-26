import './style.css'

let currentLang = localStorage.getItem('lang') || 'es';
let translations = {};

export async function loadJSON(path) {
  const res = await fetch(path);
  if (!res.ok) throw new Error(`Failed to load ${path}`);
  return res.json();
}

async function loadTranslations() {
  try {
    translations = await loadJSON('./data/translations.json');
  } catch (e) {
    console.warn('Translations not loaded:', e);
  }
}

function applyTranslations() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.getAttribute('data-i18n');
    if (translations[currentLang] && translations[currentLang][key]) {
      el.textContent = translations[currentLang][key];
    }
  });
  
  const langBtn = document.getElementById('lang-btn');
  if (langBtn) {
    langBtn.textContent = currentLang === 'es' ? 'EN' : 'ES';
  }
  
  document.documentElement.lang = currentLang;
}

window.toggleLanguage = function() {
  currentLang = currentLang === 'es' ? 'en' : 'es';
  localStorage.setItem('lang', currentLang);
  applyTranslations();
};

loadTranslations().then(() => {
  applyTranslations();
});

function switchTab(tabId) {
  document.querySelectorAll('.lab-tabs .tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabId);
  });
  document.querySelectorAll('.lab-content-wrapper .tab-content').forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });
  
  if (tabId === 'chilean-tab' && !window.chileanInitialized) {
    import('./charts/ChileanVideogamesChart.js').then(m => m.initChileanVideogames());
    window.chileanInitialized = true;
  }
  if (tabId === 'manutd-tab' && !window.manutdInitialized) {
    import('./charts/ManchesterUnitedChart.js').then(m => m.initManchesterUnited());
    window.manutdInitialized = true;
  }
  if (tabId === 'passing-tab' && !window.passingInitialized) {
    import('./charts/UnitedPassingChart.js').then(m => m.initUnitedPassing());
    window.passingInitialized = true;
  }
  if (tabId === 'geopolitica-tab' && !window.geopoliticaInitialized) {
    import('./charts/GeopoliticaChart.js').then(m => m.initGeopolitica());
    window.geopoliticaInitialized = true;
  }
  if (tabId === 'worldcup-tab' && !window.worldcupInitialized) {
    import('./charts/WorldCupChart.js').then(m => m.initWorldCup());
    window.worldcupInitialized = true;
  }
  if (tabId === 'chile-geo-tab' && !window.chileGeoInitialized) {
    import('./charts/ChileGeografiaChart.js').then(m => m.initChileGeografia());
    window.chileGeoInitialized = true;
  }
}

function switchDashTab(containerId, tabId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  container.querySelectorAll('.dash-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.dashTab === tabId);
  });
  container.querySelectorAll('.dash-tab-content').forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });
}

document.addEventListener('click', (e) => {
  if (e.target.matches('.dash-tab-btn')) {
    const container = e.target.closest('.tab-content');
    if (container) switchDashTab(container.id, e.target.dataset.dashTab);
  }
});

window.switchTab = switchTab;