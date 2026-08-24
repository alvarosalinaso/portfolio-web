import { loadJSON } from '../main.js';

const COLORS = {
  steam: '#1b2838',
  steam_l: '#66c0f4',
  itch: '#fa5c5c',
  accent: '#3fb950',
  warn: '#e3b341',
  bad: '#f78166',
  purple: '#d2a8ff',
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
  margin: { l: 10, r: 10, t: 45, b: 10 },
  xaxis: { gridcolor: '#30363d', zerolinecolor: '#30363d' },
  yaxis: { gridcolor: '#30363d', zerolinecolor: '#30363d' }
};

let chileanData = null;
let currentFilters = {
  platforms: ['Steam', 'Itch.io'],
  genres: [],
  yearRange: [2015, 2024],
  minReviews: 0,
  metric: 'revenue_est'
};

export async function initChileanVideogames() {
  chileanData = await loadJSON('./data/chilean-videogames.json');
  currentFilters.genres = [...new Set(chileanData.games.map(g => g.genre))].sort();
  
  renderFilters();
  renderKPIs();
  renderTabs();
  attachFilterListeners();
}

function getFilteredData() {
  return chileanData.games.filter(g => 
    currentFilters.platforms.includes(g.platform) &&
    currentFilters.genres.includes(g.genre) &&
    g.year >= currentFilters.yearRange[0] &&
    g.year <= currentFilters.yearRange[1] &&
    g.reviews >= currentFilters.minReviews
  );
}

function renderFilters() {
  const container = document.getElementById('chilean-filters');
  if (!container) return;
  
  const platforms = ['Steam', 'Itch.io'];
  const genres = currentFilters.genres;
  
  container.innerHTML = `
    <div class="filter-group">
      <label>Plataforma</label>
      <div class="filter-chips">
        ${platforms.map(p => `
          <label class="chip ${currentFilters.platforms.includes(p) ? 'active' : ''}">
            <input type="checkbox" value="${p}" ${currentFilters.platforms.includes(p) ? 'checked' : ''} data-filter="platform"> ${p}
          </label>
        `).join('')}
      </div>
    </div>
    <div class="filter-group">
      <label>Géneros</label>
      <div class="filter-chips" style="max-height: 120px; overflow-y: auto;">
        ${genres.map(g => `
          <label class="chip ${currentFilters.genres.includes(g) ? 'active' : ''}">
            <input type="checkbox" value="${g}" ${currentFilters.genres.includes(g) ? 'checked' : ''} data-filter="genre"> ${g}
          </label>
        `).join('')}
      </div>
    </div>
    <div class="filter-group">
      <label>Rango de años: <span id="year-range-display">${currentFilters.yearRange[0]} - ${currentFilters.yearRange[1]}</span></label>
      <div class="range-slider-container">
        <input type="range" id="year-min" min="2009" max="2024" value="${currentFilters.yearRange[0]}" data-filter="year-min">
        <input type="range" id="year-max" min="2009" max="2024" value="${currentFilters.yearRange[1]}" data-filter="year-max">
      </div>
    </div>
    <div class="filter-group">
      <label>Reviews mínimas: <span id="min-reviews-display">${currentFilters.minReviews}</span></label>
      <input type="range" id="min-reviews" min="0" max="500" value="${currentFilters.minReviews}" step="10" data-filter="min-reviews">
    </div>
    <div class="filter-group">
      <label>Métrica principal</label>
      <select id="metric-select" data-filter="metric">
        <option value="revenue_est" ${currentFilters.metric === 'revenue_est' ? 'selected' : ''}>Revenue estimado (USD)</option>
        <option value="score" ${currentFilters.metric === 'score' ? 'selected' : ''}>Puntuación media</option>
        <option value="reviews" ${currentFilters.metric === 'reviews' ? 'selected' : ''}>Nº de reviews</option>
        <option value="sentiment" ${currentFilters.metric === 'sentiment' ? 'selected' : ''}>Sentimiento</option>
      </select>
    </div>
  `;
}

function attachFilterListeners() {
  const container = document.getElementById('chilean-filters');
  if (!container) return;
  
  container.querySelectorAll('[data-filter]').forEach(el => {
    el.addEventListener('change', (e) => {
      const filter = e.target.dataset.filter;
      const value = e.target.type === 'checkbox' ? e.target.value : 
                    e.target.type === 'range' ? parseInt(e.target.value) : e.target.value;
      
      if (filter === 'platform' || filter === 'genre') {
        const arr = currentFilters[filter + 's'];
        if (e.target.checked) arr.push(value);
        else arr.splice(arr.indexOf(value), 1);
      } else if (filter === 'year-min') {
        currentFilters.yearRange[0] = value;
        if (currentFilters.yearRange[0] > currentFilters.yearRange[1]) currentFilters.yearRange[0] = currentFilters.yearRange[1];
      } else if (filter === 'year-max') {
        currentFilters.yearRange[1] = value;
        if (currentFilters.yearRange[1] < currentFilters.yearRange[0]) currentFilters.yearRange[1] = currentFilters.yearRange[0];
      } else if (filter === 'min-reviews') {
        currentFilters.minReviews = value;
      } else if (filter === 'metric') {
        currentFilters.metric = value;
      }
      
      updateFilterDisplay();
      renderKPIs();
      renderTabs();
    });
  });
}

function updateFilterDisplay() {
  document.getElementById('year-range-display').textContent = `${currentFilters.yearRange[0]} - ${currentFilters.yearRange[1]}`;
  document.getElementById('min-reviews-display').textContent = currentFilters.minReviews;
  document.querySelectorAll('#chilean-filters .chip').forEach(chip => {
    const input = chip.querySelector('input');
    chip.classList.toggle('active', input.checked);
  });
}

function renderKPIs() {
  const df = getFilteredData();
  const container = document.getElementById('chilean-kpis');
  if (!container) return;
  
  const totalGames = df.length;
  const totalRev = df.reduce((sum, g) => sum + g.revenue_est, 0);
  const avgScore = df.length ? (df.reduce((sum, g) => sum + g.score, 0) / df.length).toFixed(1) : 0;
  const steamPct = df.length ? ((df.filter(g => g.platform === 'Steam').length / df.length) * 100).toFixed(0) : 0;
  const avgSentiment = df.length ? (df.reduce((sum, g) => sum + g.sentiment, 0) / df.length).toFixed(2) : 0;
  
  container.innerHTML = `
    <div class="kpi-card"><div class="kpi-value">${totalGames}</div><div class="kpi-label">Juegos analizados</div></div>
    <div class="kpi-card"><div class="kpi-value">$${totalRev > 1e6 ? (totalRev/1e6).toFixed(1) + 'M' : totalRev.toLocaleString()}</div><div class="kpi-label">Revenue total est.</div></div>
    <div class="kpi-card"><div class="kpi-value">${avgScore} / 10</div><div class="kpi-label">Score promedio</div></div>
    <div class="kpi-card"><div class="kpi-value">${steamPct}%</div><div class="kpi-label">Distribución Steam</div></div>
    <div class="kpi-card"><div class="kpi-value">${avgSentiment > 0.2 ? 'Positivo 😊' : 'Neutro 😐'}</div><div class="kpi-label">Sentimiento (${avgSentiment})</div></div>
  `;
}

function renderTabs() {
  renderTab1();
  renderTab2();
  renderTab3();
  renderTab4();
}

function renderTab1() {
  const df = getFilteredData();
  const trendData = df.reduce((acc, g) => {
    const key = `${g.year}-${g.platform}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  
  const revenueTrend = df.reduce((acc, g) => {
    const key = `${g.year}-${g.platform}`;
    acc[key] = (acc[key] || 0) + g.revenue_est;
    return acc;
  }, {});
  
  const years = [...new Set(df.map(g => g.year))].sort();
  const platforms = currentFilters.platforms;
  
  const fig = {
    data: platforms.map(plat => {
      const color = plat === 'Steam' ? COLORS.steam_l : COLORS.itch;
      const hex = color.replace('#', '');
      const r = parseInt(hex.slice(0,2), 16);
      const g = parseInt(hex.slice(2,4), 16);
      const b = parseInt(hex.slice(4,6), 16);
      
      return {
        x: years,
        y: years.map(y => trendData[`${y}-${plat}`] || 0),
        mode: 'lines+markers',
        name: plat,
        line: { color, width: 3 },
        marker: { size: 8 },
        fill: 'tozeroy',
        fillcolor: `rgba(${r},${g},${b},0.1)`,
        hovertemplate: `<b>${plat}</b><br>Año: %{x}<br>Juegos: %{y}<extra></extra>`
      };
    }),
    layout: {
      ...PLOTLY_THEME,
      title: 'Juegos chilenos publicados por año',
      height: 380,
      legend: { orientation: 'h', y: -0.15 },
      shapes: [{
        type: 'line', x0: 2020, x1: 2020, y0: 0, y1: 1, yref: 'paper',
        line: { dash: 'dot', color: COLORS.warn, width: 1.5 }
      }],
      annotations: [{
        x: 2020, y: 1, yref: 'paper', text: '📌 COVID-19: boom indie',
        showarrow: false, font: { color: COLORS.warn, size: 10 }, yshift: -10
      }]
    }
  };
  
  Plotly.newPlot('chilean-trend-chart', fig.data, fig.layout, { responsive: true, displayModeBar: false });
  
  // Revenue trend
  const figRev = {
    data: platforms.map(plat => ({
      x: years,
      y: years.map(y => revenueTrend[`${y}-${plat}`] || 0),
      name: plat,
      type: 'bar',
      marker: { color: plat === 'Steam' ? COLORS.steam_l : COLORS.itch, opacity: 0.85 }
    })),
    layout: { ...PLOTLY_THEME, barmode: 'group', title: 'Revenue estimado por año y plataforma', height: 320, legend: { orientation: 'h', y: -0.2 } }
  };
  Plotly.newPlot('chilean-revenue-chart', figRev.data, figRev.layout, { responsive: true, displayModeBar: false });
  
  // Heatmap
  const monthNames = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const heatData = df.reduce((acc, g) => {
    const key = `${g.launch_month}-${g.year}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});
  
  const z = monthNames.map((_, mi) => years.map(y => heatData[`${mi+1}-${y}`] || 0));
  
  const figHm = {
    data: [{ z, x: years.map(String), y: monthNames, type: 'heatmap',
      colorscale: [[0, '#161b22'], [0.5, '#3fb950'], [1, '#FBE122']],
      colorbar: { title: 'Lanzam.', bgcolor: 'rgba(0,0,0,0)', tickfont: { color: '#8b949e' } },
      hovertemplate: 'Mes: %{y}<br>Año: %{x}<br>Juegos: %{z}<extra></extra>'
    }],
    layout: { ...PLOTLY_THEME, title: 'Mapa de calor: lanzamientos por mes/año', height: 320 }
  };
  Plotly.newPlot('chilean-heatmap-chart', figHm.data, figHm.layout, { responsive: true, displayModeBar: false });
}

function renderTab2() {
  const df = getFilteredData();
  const metricMap = { revenue_est: 'avg_rev', score: 'avg_score', reviews: 'count', sentiment: 'avg_sentiment' };
  const sortCol = metricMap[currentFilters.metric];
  
  const genreKpi = df.reduce((acc, g) => {
    if (!acc[g.genre]) acc[g.genre] = { genre: g.genre, count: 0, avg_rev: 0, avg_score: 0, avg_sentiment: 0, sum_rev: 0, sum_score: 0, sum_sentiment: 0 };
    const ag = acc[g.genre];
    ag.count++;
    ag.sum_rev += g.revenue_est;
    ag.sum_score += g.score;
    ag.sum_sentiment += g.sentiment;
    return acc;
  }, {});
  
  Object.values(genreKpi).forEach(g => {
    g.avg_rev = g.sum_rev / g.count;
    g.avg_score = g.sum_score / g.count;
    g.avg_sentiment = g.sum_sentiment / g.count;
  });
  
  const sorted = Object.values(genreKpi).sort((a,b) => b[sortCol] - a[sortCol]);
  
  // Bar chart
  const figBar = {
    data: [{ y: sorted.map(g => g.genre), x: sorted.map(g => g.avg_rev), orientation: 'h', type: 'bar',
      marker: { color: sorted.map(g => g.avg_rev), colorscale: [[0, '#161b22'], [0.5, '#3fb950'], [1, '#FBE122']], showscale: false },
      text: sorted.map(g => '$' + g.avg_rev.toLocaleString()), textposition: 'outside' }],
    layout: { ...PLOTLY_THEME, title: 'Revenue promedio por género', height: 380, bargap: 0.25 }
  };
  Plotly.newPlot('chilean-genre-bar', figBar.data, figBar.layout, { responsive: true, displayModeBar: false });
  
  // Bubble chart
  const figBubble = {
    data: [{ x: sorted.map(g => g.avg_score), y: sorted.map(g => g.avg_rev), mode: 'markers+text', type: 'scatter',
      text: sorted.map(g => g.genre), textposition: 'top center', textfont: { size: 9 },
      marker: { size: sorted.map(g => g.count * 3), color: sorted.map(g => g.genre), colorscale: 'Vivid', showscale: false, line: { color: '#0d1117', width: 1 } },
      hovertemplate: '<b>%{text}</b><br>Score: %{x}<br>Revenue: $%{y:,.0f}<extra></extra>' }],
    layout: { ...PLOTLY_THEME, title: 'Score vs Revenue: tamaño = cantidad de juegos', height: 380, showlegend: false }
  };
  Plotly.newPlot('chilean-bubble-chart', figBubble.data, figBubble.layout, { responsive: true, displayModeBar: false });
  
  // Table
  const tableContainer = document.getElementById('chilean-genre-table');
  if (tableContainer) {
    tableContainer.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Género</th><th>Juegos</th><th>Revenue prom. (USD)</th><th>Score medio</th><th>Sentimiento</th></tr></thead>
        <tbody>
          ${sorted.map(g => `
            <tr>
              <td>${g.genre}</td>
              <td>${g.count}</td>
              <td>$${g.avg_rev.toLocaleString()}</td>
              <td>${g.avg_score.toFixed(1)}</td>
              <td>${g.avg_sentiment.toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}

function renderTab3() {
  const df = getFilteredData();
  const steamData = df.filter(g => g.platform === 'Steam');
  
  // Sentiment histogram
  const figSent = {
    data: [
      { x: df.filter(g => g.platform === 'Steam').map(g => g.sentiment), name: 'Steam', type: 'histogram', nbinsx: 30, marker: { color: COLORS.steam_l, opacity: 0.7 } },
      { x: df.filter(g => g.platform === 'Itch.io').map(g => g.sentiment), name: 'Itch.io', type: 'histogram', nbinsx: 30, marker: { color: COLORS.itch, opacity: 0.7 } }
    ],
    layout: { ...PLOTLY_THEME, barmode: 'overlay', title: 'Distribución de sentimiento por plataforma', height: 320, legend: { orientation: 'h', y: -0.2 } }
  };
  Plotly.newPlot('chilean-sentiment-hist', figSent.data, figSent.layout, { responsive: true, displayModeBar: false });
  
  // Sentiment by genre boxplot
  const genres = [...new Set(df.map(g => g.genre))].sort();
  const figBox = {
    data: genres.flatMap(genre => [
      { y: df.filter(g => g.genre === genre && g.platform === 'Steam').map(g => g.sentiment), name: genre + ' (Steam)', type: 'box', marker: { color: COLORS.steam_l }, showlegend: false },
      { y: df.filter(g => g.genre === genre && g.platform === 'Itch.io').map(g => g.sentiment), name: genre + ' (Itch.io)', type: 'box', marker: { color: COLORS.itch }, showlegend: false }
    ]),
    layout: { ...PLOTLY_THEME, title: 'Distribución de sentimiento por género', height: 320 }
  };
  Plotly.newPlot('chilean-sentiment-box', figBox.data, figBox.layout, { responsive: true, displayModeBar: false });
  
  // Sentiment vs Revenue scatter
  const figSentRev = {
    data: [{
      x: steamData.map(g => g.sentiment), y: steamData.map(g => g.revenue_est), mode: 'markers', type: 'scatter',
      text: steamData.map(g => g.title), marker: { size: steamData.map(g => Math.max(5, g.reviews/50)), color: steamData.map(g => g.genre), colorscale: 'Vivid', showscale: false, line: { color: '#0d1117', width: 1 } },
      hovertemplate: '<b>%{text}</b><br>Sentimiento: %{x}<br>Revenue: $%{y:,.0f}<extra></extra>'
    }],
    layout: { ...PLOTLY_THEME, title: 'Correlación Sentimiento → Revenue (Steam)', height: 380 }
  };
  Plotly.newPlot('chilean-sentiment-revenue', figSentRev.data, figSentRev.layout, { responsive: true, displayModeBar: false });
}

function renderTab4() {
  const df = getFilteredData();
  const opp = df.reduce((acc, g) => {
    if (!acc[g.genre]) acc[g.genre] = { genre: g.genre, count: 0, sum_rev: 0, sum_score: 0 };
    acc[g.genre].count++;
    acc[g.genre].sum_rev += g.revenue_est;
    acc[g.genre].sum_score += g.score;
    return acc;
  }, {});
  
  Object.values(opp).forEach(o => {
    o.avg_rev = o.sum_rev / o.count;
    o.avg_score = o.sum_score / o.count;
  });
  
  const maxCount = Math.max(...Object.values(opp).map(o => o.count));
  Object.values(opp).forEach(o => {
    o.saturation = o.count / maxCount;
    o.opportunity = o.avg_rev / (o.saturation + 0.1);
  });
  
  const sortedOpp = Object.values(opp).sort((a,b) => b.opportunity - a.opportunity);
  const qSat = sortedOpp.map(o => o.saturation).sort((a,b)=>a-b)[Math.floor(sortedOpp.length/2)];
  const qRev = sortedOpp.map(o => o.avg_rev).sort((a,b)=>a-b)[Math.floor(sortedOpp.length/2)];
  const maxRev = Math.max(...Object.values(opp).map(o => o.avg_rev));
  
  const shapes = [
    { type: 'rect', x0: 0, x1: qSat, y0: qRev, y1: maxRev * 1.1, fillcolor: 'rgba(63,185,80,0.06)', line: { color: 'rgba(0,0,0,0)' } },
    { type: 'rect', x0: qSat, x1: 1, y0: qRev, y1: maxRev * 1.1, fillcolor: 'rgba(88,166,255,0.06)', line: { color: 'rgba(0,0,0,0)' } },
    { type: 'rect', x0: 0, x1: qSat, y0: 0, y1: qRev, fillcolor: 'rgba(227,179,65,0.06)', line: { color: 'rgba(0,0,0,0)' } },
    { type: 'rect', x0: qSat, x1: 1, y0: 0, y1: qRev, fillcolor: 'rgba(247,129,102,0.06)', line: { color: 'rgba(0,0,0,0)' } }
  ];
  
  const annotations = [
    { x: qSat/2, y: (qRev + maxRev*1.1)/2, text: '💎 Alta Oportunidad', font: { color: '#8b949e', size: 11 }, showarrow: false },
    { x: (qSat+1)/2, y: (qRev + maxRev*1.1)/2, text: '⚔️ Competitivo', font: { color: '#8b949e', size: 11 }, showarrow: false },
    { x: qSat/2, y: qRev/2, text: '🌱 Nicho Emergente', font: { color: '#8b949e', size: 11 }, showarrow: false },
    { x: (qSat+1)/2, y: qRev/2, text: '⚠️ Saturado', font: { color: '#8b949e', size: 11 }, showarrow: false }
  ];
  
  const figOpp = {
    data: [{
      x: sortedOpp.map(o => o.saturation), y: sortedOpp.map(o => o.avg_rev), mode: 'markers+text', type: 'scatter',
      text: sortedOpp.map(o => o.genre), textposition: 'top center', textfont: { size: 10, color: '#e6edf3' },
      marker: { size: sortedOpp.map(o => o.avg_score * 8), color: sortedOpp.map(o => o.opportunity), colorscale: [[0, '#f78166'], [0.5, '#e3b341'], [1, '#3fb950']], showscale: true, colorbar: { title: 'Score de oportunidad', bgcolor: 'rgba(0,0,0,0)', tickfont: { color: '#8b949e' } }, line: { color: '#0d1117', width: 1.5 } },
      hovertemplate: '<b>%{text}</b><br>Saturación: %{x:.2f}<br>Revenue prom.: $%{y:,.0f}<extra></extra>'
    }],
    layout: { ...PLOTLY_THEME, title: 'Cuadrante de Oportunidad de Mercado — Géneros de videojuegos chilenos', height: 480, shapes, annotations },
    config: { responsive: true, displayModeBar: false }
  };
  Plotly.newPlot('chilean-opportunity-chart', figOpp.data, figOpp.layout, { responsive: true, displayModeBar: false });
}