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
  } catch {
    wcData = generateSyntheticData();
  }
  renderBracket();
  renderAttendanceChart();
  renderMonteCarloChart();
  renderKPIs();
}

function generateSyntheticData() {
  const confederations = ['AFC', 'CAF', 'CONCACAF', 'CONMEBOL', 'OFC', 'UEFA'];
  const confCounts = [8, 9, 6, 6, 1, 16];
  const groups = 'ABCDEFGH'.split('');
  const teams = [
    { name: 'Argentina', elo: 2141, conf: 'CONMEBOL' },
    { name: 'France', elo: 2030, conf: 'UEFA' },
    { name: 'Brazil', elo: 2056, conf: 'CONMEBOL' },
    { name: 'England', elo: 2017, conf: 'UEFA' },
    { name: 'Spain', elo: 2013, conf: 'UEFA' },
    { name: 'Germany', elo: 1986, conf: 'UEFA' },
    { name: 'Portugal', elo: 1978, conf: 'UEFA' },
    { name: 'Netherlands', elo: 1964, conf: 'UEFA' },
    { name: 'Japan', elo: 1619, conf: 'AFC' },
    { name: 'Morocco', elo: 1667, conf: 'CAF' },
    { name: 'USA', elo: 1645, conf: 'CONCACAF' },
    { name: 'Mexico', elo: 1632, conf: 'CONCACAF' },
    { name: 'Uruguay', elo: 1879, conf: 'CONMEBOL' },
    { name: 'Colombia', elo: 1825, conf: 'CONMEBOL' },
    { name: 'Croatia', elo: 1832, conf: 'UEFA' },
    { name: 'Senegal', elo: 1584, conf: 'CAF' }
  ];
  const matches = [];
  groups.forEach(g => {
    for (let i = 0; i < 3; i++) {
      for (let j = i + 1; j < 4; j++) {
        matches.push({
          group: g,
          team1: teams[i % teams.length].name,
          team2: teams[j % teams.length].name,
          score1: Math.floor(Math.random() * 4),
          score2: Math.floor(Math.random() * 3)
        });
      }
    }
  });
  return {
    teams,
    groups,
    confederations,
    confCounts,
    matches,
    totalMatches: 104,
    totalTeams: 48,
    totalAttend: 6800000,
    venues: 16,
    attendance_by_month: ['Jun', 'Jul'].map(m => ({
      month: m,
      avg: Math.floor(Math.random() * 15000 + 60000),
      capacity: 72000
    })),
    elo_ranking: teams.sort((a, b) => b.elo - a.elo).slice(0, 10),
    monte_carlo_results: teams.slice(0, 8).map(t => ({
      name: t.name,
      win_prob: parseFloat((Math.random() * 20 + 2).toFixed(1)),
      final_prob: parseFloat((Math.random() * 25 + 8).toFixed(1)),
      semis_prob: parseFloat((Math.random() * 20 + 15).toFixed(1))
    }))
  };
}

function renderKPIs() {
  const container = document.getElementById('wc-kpis');
  if (!container) return;
  container.innerHTML = `
    <div class="kpi-card"><div class="kpi-label">Equipos</div><div class="kpi-value">${wcData.totalTeams}</div></div>
    <div class="kpi-card"><div class="kpi-label">Partidos</div><div class="kpi-value">${wcData.totalMatches}</div></div>
    <div class="kpi-card"><div class="kpi-label">Asistencia Total</div><div class="kpi-value">${(wcData.totalAttend / 1e6).toFixed(1)}M</div></div>
    <div class="kpi-card"><div class="kpi-label">Sedes</div><div class="kpi-value">${wcData.venues}</div></div>
  `;
}

function renderBracket() {
  const el = document.getElementById('wc-bracket-chart');
  if (!el) return;

  const topTeams = wcData.elo_ranking.slice(0, 8);
  const trace = {
    y: topTeams.map(t => t.name),
    x: topTeams.map(t => t.elo),
    type: 'bar',
    orientation: 'h',
    marker: {
      color: topTeams.map((_, i) => {
        const colors = [COLORS.gold, COLORS.accent, COLORS.green, COLORS.purple, COLORS.orange, COLORS.red, COLORS.text2, COLORS.text2];
        return colors[i];
      }),
      line: { width: 0 }
    },
    text: topTeams.map(t => `${t.elo}`),
    textposition: 'outside',
    textfont: { color: COLORS.text, size: 11 },
    hovertemplate: '<b>%{y}</b><br>ELO: %{x}<extra></extra>'
  };

  const layout = {
    ...PLOTLY_THEME,
    title: { text: 'Ranking ELO — Top 8 Favoritos', font: { size: 14, color: COLORS.text } },
    xaxis: { ...PLOTLY_THEME.xaxis, title: 'ELO Rating' },
    yaxis: { ...PLOTLY_THEME.yaxis, automargin: true },
    showlegend: false,
    margin: { ...PLOTLY_THEME.margin, l: 120 }
  };

  Plotly.newPlot(el, [trace], layout, { responsive: true, displayModeBar: false });
}

function renderAttendanceChart() {
  const el = document.getElementById('wc-attendance-chart');
  if (!el) return;

  const trace = {
    x: wcData.attendance_by_month.map(a => a.month),
    y: wcData.attendance_by_month.map(a => a.avg),
    type: 'bar',
    name: 'Asistencia Promedio',
    marker: { color: COLORS.accent, line: { width: 0 } },
    text: wcData.attendance_by_month.map(a => `${(a.avg / 1000).toFixed(0)}K`),
    textposition: 'outside',
    textfont: { color: COLORS.text, size: 11 },
    hovertemplate: '<b>%{x}</b><br>Promedio: %{y:,}<extra></extra>'
  };

  const trace2 = {
    x: wcData.attendance_by_month.map(a => a.month),
    y: wcData.attendance_by_month.map(a => a.capacity),
    type: 'scatter',
    mode: 'lines',
    name: 'Capacidad Máxima',
    line: { color: COLORS.red, width: 2, dash: 'dash' },
    hovertemplate: '<b>%{x}</b><br>Capacidad: %{y:,}<extra></extra>'
  };

  const layout = {
    ...PLOTLY_THEME,
    title: { text: 'Asistencia vs Capacidad por Fase', font: { size: 14, color: COLORS.text } },
    xaxis: { ...PLOTLY_THEME.xaxis, title: 'Fase' },
    yaxis: { ...PLOTLY_THEME.yaxis, title: 'Asistentes' },
    showlegend: true,
    legend: { font: { color: COLORS.text }, bgcolor: 'rgba(0,0,0,0)' }
  };

  Plotly.newPlot(el, [trace, trace2], layout, { responsive: true, displayModeBar: false });
}

function renderMonteCarloChart() {
  const el = document.getElementById('wc-monte-carlo-chart');
  if (!el) return;

  const results = wcData.monte_carlo_results;

  const trace1 = {
    y: results.map(r => r.name),
    x: results.map(r => r['win_prob']),
    type: 'bar',
    orientation: 'h',
    name: 'Campeón',
    marker: { color: COLORS.gold, line: { width: 0 } },
    text: results.map(r => `${r['win_prob']}%`),
    textposition: 'outside',
    textfont: { color: COLORS.text, size: 10 },
    hovertemplate: '<b>%{y}</b><br>Campeón: %{x:.1f}%<extra></extra>'
  };

  const trace2 = {
    y: results.map(r => r.name),
    x: results.map(r => r['final_prob']),
    type: 'bar',
    orientation: 'h',
    name: 'Final',
    marker: { color: COLORS.accent, line: { width: 0 } },
    hovertemplate: '<b>%{y}</b><br>Final: %{x:.1f}%<extra></extra>'
  };

  const layout = {
    ...PLOTLY_THEME,
    title: { text: 'Simulación Monte Carlo — Probabilidades de Avance (1000 sims)', font: { size: 14, color: COLORS.text } },
    barmode: 'stack',
    xaxis: { ...PLOTLY_THEME.xaxis, title: 'Probabilidad (%)' },
    yaxis: { ...PLOTLY_THEME.yaxis, automargin: true },
    showlegend: true,
    legend: { font: { color: COLORS.text }, bgcolor: 'rgba(0,0,0,0)' },
    margin: { ...PLOTLY_THEME.margin, l: 120 }
  };

  Plotly.newPlot(el, [trace1, trace2], layout, { responsive: true, displayModeBar: false });
}

window.initWorldCup = initWorldCup;
