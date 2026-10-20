import { loadJSON } from '../main.js';

const COLORS = {
  accent: '#58a6ff',
  green: '#3fb950',
  orange: '#d29922',
  red: '#f85149',
  purple: '#bc8cff',
  gold: '#e3b341',
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

let wcData = null;

export async function initWorldCup() {
  try {
    wcData = await loadJSON('./data/worldcup.json');
  } catch (e) {
    const el = document.getElementById('wc-kpis');
    if (el) el.innerHTML = '<p style="color:#8b949e">No se pudieron cargar los datos reales del torneo.</p>';
    return;
  }
  renderKPIs();
  renderStagesChart();
  renderHistoricalChart();
}

function renderKPIs() {
  const container = document.getElementById('wc-kpis');
  if (!container) return;
  const t = wcData.totals;
  container.innerHTML = `
    <div class="kpi-card"><div class="kpi-label">Selecciones</div><div class="kpi-value">${t.teams}</div></div>
    <div class="kpi-card"><div class="kpi-label">Partidos</div><div class="kpi-value">${t.matches}</div><div class="kpi-delta">resultados reales</div></div>
    <div class="kpi-card"><div class="kpi-label">Goles</div><div class="kpi-value">${t.goals}</div><div class="kpi-delta">openfootball CC0</div></div>
    <div class="kpi-card"><div class="kpi-label">Sedes</div><div class="kpi-value">${t.venues}</div><div class="kpi-delta">Canadá · EE.UU. · México</div></div>
  `;
}

function renderStagesChart() {
  const el = document.getElementById('wc-bracket-chart');
  if (!el) return;

  const stages = wcData.stages;
  const trace = {
    y: stages.map(s => s.stage),
    x: stages.map(s => s.goals),
    type: 'bar',
    orientation: 'h',
    marker: { color: COLORS.accent, line: { width: 0 } },
    text: stages.map(s => `${s.goals} goles · ${s.matches} partidos`),
    textposition: 'outside',
    textfont: { color: COLORS.text, size: 11 },
    hovertemplate: '<b>%{y}</b><br>Goles: %{x}<br>Partidos: %{customdata}<extra></extra>',
    customdata: stages.map(s => s.matches)
  };

  const layout = {
    ...PLOTLY_THEME,
    title: { text: 'Goles por fase — Mundial 2026 (resultados reales)', font: { size: 14, color: COLORS.text } },
    xaxis: { ...PLOTLY_THEME.xaxis, title: 'Goles' },
    yaxis: { ...PLOTLY_THEME.yaxis, automargin: true, autorange: 'reversed' },
    showlegend: false,
    margin: { ...PLOTLY_THEME.margin, l: 140, b: 70 }
  };

  Plotly.newPlot(el, [trace], layout, { responsive: true, displayModeBar: false });
}

function renderHistoricalChart() {
  const el = document.getElementById('wc-comparison-chart');
  if (!el) return;

  const hist = wcData.historical;
  const years = hist.map(h => h.year);

  const traceGoals = {
    x: years, y: hist.map(h => h.goals),
    name: 'Goles', type: 'bar',
    marker: { color: COLORS.gold, line: { width: 0 } },
    text: hist.map(h => h.goals), textposition: 'outside',
    textfont: { color: COLORS.text, size: 11 },
    hovertemplate: '<b>%{x}</b><br>Goles: %{y}<br>Campeón: %{customdata}<extra></extra>',
    customdata: hist.map(h => `${h.champion} · ${h.matches} partidos`)
  };

  const histWithAtt = hist.filter(h => h.attendance != null);
  const traceAtt = {
    x: histWithAtt.map(h => h.year), y: histWithAtt.map(h => h.attendance / 1e6),
    name: 'Asistencia total (M)', type: 'scatter', mode: 'lines+markers',
    yaxis: 'y2',
    line: { color: COLORS.green, width: 2.5 }, marker: { size: 8 },
    hovertemplate: '<b>%{x}</b><br>Asistencia: %{y:.2f}M<extra></extra>'
  };

  const layout = {
    ...PLOTLY_THEME,
    title: { text: 'Comparativo Mundiales 2014–2026 (goles y asistencia)', font: { size: 14, color: COLORS.text } },
    barmode: 'group',
    xaxis: { ...PLOTLY_THEME.xaxis, title: 'Mundial', dtick: 1 },
    yaxis: { ...PLOTLY_THEME.yaxis, title: 'Goles' },
    yaxis2: { title: 'Asistencia (millones)', overlaying: 'y', side: 'right', gridcolor: 'rgba(0,0,0,0)', color: COLORS.text2 },
    legend: { font: { color: COLORS.text }, bgcolor: 'rgba(0,0,0,0)' },
    margin: { ...PLOTLY_THEME.margin, b: 70 }
  };

  Plotly.newPlot(el, [traceGoals, traceAtt], layout, { responsive: true, displayModeBar: false });
}

window.initWorldCup = initWorldCup;
