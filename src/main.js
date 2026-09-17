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
  document.querySelectorAll('.tab-content').forEach(content => {
    content.classList.toggle('active', content.id === tabId);
  });

  // Scroll to the lab section
  const lab = document.querySelector('.strategy-lab');
  if (lab) lab.scrollIntoView({ behavior: 'smooth', block: 'start' });
  
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

// WCAG tab roles
document.addEventListener('DOMContentLoaded', () => {
  const tabBtns = document.querySelectorAll('.lab-tabs .tab-btn');
  const tabPanels = document.querySelectorAll('.tab-content');
  
  tabBtns.forEach(btn => {
    btn.setAttribute('role', 'tab');
    btn.setAttribute('aria-selected', btn.classList.contains('active'));
    btn.setAttribute('aria-controls', btn.dataset.tab);
  });
  
  tabPanels.forEach(panel => {
    panel.setAttribute('role', 'tabpanel');
  });

  // Keyboard navigation for tabs
  document.querySelector('.lab-tabs')?.addEventListener('keydown', (e) => {
    const tabs = Array.from(tabBtns);
    const current = tabs.findIndex(t => t.classList.contains('active'));
    
    if (e.key === 'ArrowRight') {
      const next = tabs[(current + 1) % tabs.length];
      switchTab(next.dataset.tab);
      next.focus();
    } else if (e.key === 'ArrowLeft') {
      const prev = tabs[(current - 1 + tabs.length) % tabs.length];
      switchTab(prev.dataset.tab);
      prev.focus();
    }
  });
});

// SVG pitch touch support
function initPitchTouch() {
  const svg = document.getElementById('pitch-svg');
  if (!svg) return;

  const nodes = svg.querySelectorAll('#svg-nodes circle, #svg-nodes text');
  
  nodes.forEach(node => {
    let isDragging = false;
    let currentX, currentY;
    
    const getPos = (e) => {
      const pt = svg.createSVGPoint();
      const touch = e.touches ? e.touches[0] : e;
      pt.x = touch.clientX;
      pt.y = touch.clientY;
      return pt.matrixTransform(svg.getScreenCTM().inverse());
    };

    node.addEventListener('touchstart', (e) => {
      isDragging = true;
      const pos = getPos(e);
      currentX = pos.x;
      currentY = pos.y;
      e.preventDefault();
    }, { passive: false });

    node.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      const pos = getPos(e);
      const dx = pos.x - currentX;
      const dy = pos.y - currentY;
      
      const cx = parseFloat(node.getAttribute('cx') || node.getAttribute('x')) + dx;
      const cy = parseFloat(node.getAttribute('cy') || node.getAttribute('y')) + dy;
      
      if (node.getAttribute('cx')) {
        node.setAttribute('cx', cx);
        node.setAttribute('cy', cy);
      }
      
      currentX = pos.x;
      currentY = pos.y;
      e.preventDefault();
    }, { passive: false });

    node.addEventListener('touchend', () => {
      isDragging = false;
    });
  });
}

// Init touch when tactical tab is shown
const originalSwitchTab = window.switchTab;
window.switchTab = function(tabId) {
  originalSwitchTab(tabId);
  if (tabId === 'tactical-cna-tab') {
    setTimeout(initPitchTouch, 100);
  }
};