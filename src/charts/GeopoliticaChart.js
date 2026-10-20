import { loadJSON } from '../main.js';

const COLORS = {
  accent: '#58a6ff',
  green: '#3fb950',
  orange: '#d29922',
  red: '#f85149',
  purple: '#bc8cff',
  bg: '#0d1117',
  text: '#e6edf3',
  text2: '#8b949e',
  card: '#161b22',
  border: '#30363d'
};

const PLOTLY_THEME = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(22,27,34,0.6)',
  font: { family: 'Inter, sans-serif', color: COLORS.text, size: 12 },
  margin: { l: 50, r: 20, t: 50, b: 50 },
  xaxis: { gridcolor: '#30363d', zerolinecolor: '#30363d' },
  yaxis: { gridcolor: '#30363d', zerolinecolor: '#30363d' }
};

let geoData = null;

export async function initGeopolitica() {
  try {
    geoData = await loadJSON('./data/geopolitica.json');
  } catch {
    const el = document.getElementById('geo-kpis');
    if (el) el.innerHTML = '<p style="color:#8b949e">No se pudieron cargar las cifras del corpus BCN.</p>';
    return;
  }
  renderKPIs();
  renderTopPlacesChart();
  renderSantiagoChart();
}

function renderKPIs() {
  const container = document.getElementById('geo-kpis');
  if (!container) return;
  container.innerHTML = `
    <div class="kpi-card"><div class="kpi-label">Mensajes BCN</div><div class="kpi-value">${geoData.n_speeches}</div><div class="kpi-delta">corpus real</div></div>
    <div class="kpi-card"><div class="kpi-label">Menciones GPE/LOC</div><div class="kpi-value">${geoData.total_gpe_loc_mentions.toLocaleString('es-CL')}</div><div class="kpi-delta">${geoData.unique_places.toLocaleString('es-CL')} formas únicas</div></div>
    <div class="kpi-card"><div class="kpi-label">Santiago</div><div class="kpi-value">${geoData.santiago_mentions}</div><div class="kpi-delta">${geoData.santiago_share_pct}% de las menciones</div></div>
    <div class="kpi-card"><div class="kpi-label">Cobertura</div><div class="kpi-value">${geoData.year_min}–${geoData.year_max}</div><div class="kpi-delta">un mensaje por gobierno</div></div>
  `;
}

function renderTopPlacesChart() {
  const el = document.getElementById('geo-ner-chart');
  if (!el) return;

  const top = geoData.top_places.slice(0, 10);
  const trace = {
    y: top.map(t => t.place),
    x: top.map(t => t.mentions),
    type: 'bar',
    orientation: 'h',
    marker: {
      color: top.map((_, i) => {
        const colors = [COLORS.accent, COLORS.green, COLORS.orange, COLORS.purple, COLORS.red];
        return colors[i % colors.length];
      }),
      line: { width: 0 }
    },
    text: top.map(t => t.mentions.toLocaleString('es-CL')),
    textposition: 'outside',
    textfont: { color: COLORS.text, size: 11 },
    hovertemplate: '<b>%{y}</b><br>Menciones: %{x}<extra></extra>'
  };

  const layout = {
    ...PLOTLY_THEME,
    title: { text: 'Top lugares por menciones GPE/LOC (NER spaCy)', font: { size: 14, color: COLORS.text } },
    xaxis: { ...PLOTLY_THEME.xaxis, title: 'Menciones' },
    yaxis: { ...PLOTLY_THEME.yaxis, automargin: true, autorange: 'reversed' },
    showlegend: false,
    margin: { ...PLOTLY_THEME.margin, l: 130 }
  };

  Plotly.newPlot(el, [trace], layout, { responsive: true, displayModeBar: false });
}

function renderSantiagoChart() {
  const el = document.getElementById('geo-sentiment-chart');
  if (!el) return;

  const chile = geoData.top_places.find(t => t.place === 'Chile')?.mentions ?? 0;
  const santiago = geoData.santiago_mentions;

  const trace = {
    x: ['"Chile" (país)', 'Santiago'],
    y: [chile, santiago],
    type: 'bar',
    marker: { color: [COLORS.accent, COLORS.orange], line: { width: 0 } },
    text: [`${chile} menciones`, `${santiago} (${geoData.santiago_share_pct}%)`],
    textposition: 'outside',
    textfont: { color: COLORS.text, size: 12 },
    hovertemplate: '<b>%{x}</b><br>Menciones: %{y}<extra></extra>'
  };

  const layout = {
    ...PLOTLY_THEME,
    title: { text: 'Sin dominancia metropolitana: manda el país', font: { size: 14, color: COLORS.text } },
    xaxis: { ...PLOTLY_THEME.xaxis },
    yaxis: { ...PLOTLY_THEME.yaxis, title: 'Menciones' },
    showlegend: false,
    margin: { ...PLOTLY_THEME.margin, b: 60 }
  };

  Plotly.newPlot(el, [trace], layout, { responsive: true, displayModeBar: false });
}

window.initGeopolitica = initGeopolitica;
