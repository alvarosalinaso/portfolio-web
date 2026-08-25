import { loadJSON } from '../main.js';

const COLORS = {
  steam: '#66c0f4',
  itch: '#fa5c5c',
  accent: '#58a6ff',
  green: '#3fb950',
  orange: '#d29922',
  purple: '#bc8cff',
  bg: '#0d1117',
  text: '#e6edf3',
  text2: '#8b949e',
  card: '#161b22',
  border: '#30363d'
};

const LAYOUT = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(22,27,34,0.6)',
  font: { family: 'Inter, sans-serif', color: COLORS.text, size: 12 },
  margin: { l: 50, r: 20, t: 50, b: 60 },
  xaxis: { gridcolor: '#30363d', zerolinecolor: '#30363d' },
  yaxis: { gridcolor: '#30363d', zerolinecolor: '#30363d' }
};

let data = null;

export async function initChileanVideogames() {
  try {
    data = await loadJSON('./data/chilean-videogames.json');
  } catch {
    data = { games: [], genre_stats: [], year_platform: [] };
  }
  renderKPIs();
  renderGenreChart();
  renderPlatformChart();
  renderYearChart();
  renderTopGames();
}

function renderKPIs() {
  const el = document.getElementById('chilean-kpis');
  if (!el) return;
  const games = data.games || [];
  const total = games.length;
  const steam = games.filter(g => g.platform === 'Steam').length;
  const itch = games.filter(g => g.platform === 'Itch.io').length;
  const totalRevenue = games.reduce((s, g) => s + (g.revenue_est || 0), 0);
  const avgPrice = games.length ? games.reduce((s, g) => s + (g.price || 0), 0) / total : 0;

  el.innerHTML = `
    <div class="kpi-card"><div class="kpi-value">${total}</div><div class="kpi-label">Juegos analizados</div></div>
    <div class="kpi-card"><div class="kpi-value">${steam} / ${itch}</div><div class="kpi-label">Steam / Itch.io</div></div>
    <div class="kpi-card"><div class="kpi-value">$${totalRevenue > 1e6 ? (totalRevenue/1e6).toFixed(1) + 'M' : Math.round(totalRevenue).toLocaleString()}</div><div class="kpi-label">Revenue total est. (USD)</div></div>
    <div class="kpi-card"><div class="kpi-value">$${Math.round(avgPrice).toLocaleString()}</div><div class="kpi-label">Precio promedio (CLP)</div></div>
  `;
}

function renderGenreChart() {
  const el = document.getElementById('chilean-genre-chart');
  if (!el) return;
  const genreStats = data.genre_stats || [];
  if (!genreStats.length) { el.innerHTML = '<p style="color:#8b949e;text-align:center">Sin datos</p>'; return; }

  const top10 = genreStats.slice(0, 10);
  const trace = {
    y: top10.map(g => g.genre),
    x: top10.map(g => g.count),
    type: 'bar',
    orientation: 'h',
    marker: {
      color: top10.map((_, i) => {
        const c = [COLORS.accent, COLORS.green, COLORS.orange, COLORS.purple, COLORS.steam, COLORS.itch, '#f0883e', '#a371f7', '#3fb950', '#58a6ff'];
        return c[i % c.length];
      }),
      line: { width: 0 }
    },
    text: top10.map(g => `${g.count} juegos`),
    textposition: 'outside',
    textfont: { color: COLORS.text, size: 11 },
    hovertemplate: '<b>%{y}</b><br>%{x} juegos<extra></extra>'
  };

  Plotly.newPlot(el, [trace], {
    ...LAYOUT,
    title: { text: 'Juegos por Género (Top 10)', font: { size: 14, color: COLORS.text } },
    xaxis: { ...LAYOUT.xaxis, title: 'Cantidad' },
    yaxis: { ...LAYOUT.yaxis, automargin: true, categoryorder: 'total ascending' },
    showlegend: false,
    margin: { ...LAYOUT.margin, l: 130 }
  }, { responsive: true, displayModeBar: false });
}

function renderPlatformChart() {
  const el = document.getElementById('chilean-platform-chart');
  if (!el) return;
  const games = data.games || [];
  const steam = games.filter(g => g.platform === 'Steam').length;
  const itch = games.filter(g => g.platform === 'Itch.io').length;

  const trace = {
    labels: ['Steam', 'Itch.io'],
    values: [steam, itch],
    type: 'pie',
    hole: 0.5,
    marker: { colors: [COLORS.steam, COLORS.itch] },
    textinfo: 'label+percent',
    textfont: { color: COLORS.text, size: 12 },
    hovertemplate: '<b>%{label}</b><br>%{value} juegos (%{percent})<extra></extra>'
  };

  Plotly.newPlot(el, [trace], {
    ...LAYOUT,
    title: { text: 'Distribución por Plataforma', font: { size: 14, color: COLORS.text } },
    showlegend: false,
    annotations: [{ text: `${games.length}<br>total`, showarrow: false, font: { size: 16, color: COLORS.text } }]
  }, { responsive: true, displayModeBar: false });
}

function renderYearChart() {
  const el = document.getElementById('chilean-year-chart');
  if (!el) return;
  const yearPlatform = data.year_platform || [];
  if (!yearPlatform.length) { el.innerHTML = '<p style="color:#8b949e;text-align:center">Sin datos</p>'; return; }

  const years = [...new Set(yearPlatform.map(y => y.year))].sort();
  const steamByYear = years.map(y => {
    const found = yearPlatform.find(yp => yp.year === y && yp.platform === 'Steam');
    return found ? found.count : 0;
  });
  const itchByYear = years.map(y => {
    const found = yearPlatform.find(yp => yp.year === y && yp.platform === 'Itch.io');
    return found ? found.count : 0;
  });

  const trace1 = {
    x: years, y: steamByYear, name: 'Steam', type: 'bar',
    marker: { color: COLORS.steam, line: { width: 0 } },
    hovertemplate: '<b>Steam %{x}</b><br>%{y} juegos<extra></extra>'
  };
  const trace2 = {
    x: years, y: itchByYear, name: 'Itch.io', type: 'bar',
    marker: { color: COLORS.itch, line: { width: 0 } },
    hovertemplate: '<b>Itch.io %{x}</b><br>%{y} juegos<extra></extra>'
  };

  Plotly.newPlot(el, [trace1, trace2], {
    ...LAYOUT,
    title: { text: 'Lanzamientos por Año', font: { size: 14, color: COLORS.text } },
    barmode: 'stack',
    xaxis: { ...LAYOUT.xaxis, title: 'Año', dtick: 1 },
    yaxis: { ...LAYOUT.yaxis, title: 'Juegos' },
    showlegend: true,
    legend: { font: { color: COLORS.text }, bgcolor: 'rgba(0,0,0,0)' }
  }, { responsive: true, displayModeBar: false });
}

function renderTopGames() {
  const el = document.getElementById('chilean-top-games');
  if (!el) return;
  const games = data.games || [];
  const sorted = [...games].sort((a, b) => (b.revenue_est || 0) - (a.revenue_est || 0)).slice(0, 10);

  el.innerHTML = `
    <table style="width:100%;border-collapse:collapse;font-size:0.85rem">
      <thead><tr style="border-bottom:1px solid #30363d;color:#8b949e">
        <th style="text-align:left;padding:8px">#</th>
        <th style="text-align:left;padding:8px">Juego</th>
        <th style="text-align:left;padding:8px">Plataforma</th>
        <th style="text-align:left;padding:8px">Género</th>
        <th style="text-align:right;padding:8px">Año</th>
        <th style="text-align:right;padding:8px">Revenue est.</th>
      </tr></thead>
      <tbody>
        ${sorted.map((g, i) => `
          <tr style="border-bottom:1px solid #21262d">
            <td style="padding:8px;color:#8b949e">${i + 1}</td>
            <td style="padding:8px;font-weight:600">${g.name}</td>
            <td style="padding:8px"><span style="color:${g.platform === 'Steam' ? COLORS.steam : COLORS.itch}">${g.platform}</span></td>
            <td style="padding:8px;color:#8b949e">${g.genre}</td>
            <td style="padding:8px;text-align:right">${g.year}</td>
            <td style="padding:8px;text-align:right;font-weight:600">$${(g.revenue_est || 0) > 1000 ? ((g.revenue_est || 0)/1000).toFixed(1) + 'K' : Math.round(g.revenue_est || 0)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}
