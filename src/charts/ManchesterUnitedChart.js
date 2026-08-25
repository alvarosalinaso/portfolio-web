import { loadJSON } from '../main.js';

const COLORS = {
  manutd: '#DA291C',
  champ: '#3fb950',
  accent: '#58a6ff',
  warn: '#e3b341',
  bad: '#f78166',
  bg: '#0d1117',
  card: '#161b22',
  border: '#30363d',
  text: '#e6edf3',
  text2: '#8b949e'
};

const PLOTLY_THEME = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(22,27,34,0.6)',
  font: { family: 'Inter, sans-serif', color: COLORS.text, size: 12 },
  margin: { l: 10, r: 10, t: 45, b: 10 },
  xaxis: { gridcolor: '#30363d', zerolinecolor: '#30363d' },
  yaxis: { gridcolor: '#30363d', zerolinecolor: '#30363d' }
};

let manutdData = null;
let currentFilters = {
  seasons: [],
  managers: [],
  benchmarkMode: true,
  showTrend: true
};

export async function initManchesterUnited() {
  manutdData = await loadJSON('./data/manutd.json');
  currentFilters.seasons = manutdData.seasons.map(s => s.season);
  currentFilters.managers = [...new Set(manutdData.seasons.map(s => s.manager_clean))];
  
  renderFilters();
  renderKPIs();
  renderTabs();
  attachFilterListeners();
}

function getFilteredData() {
  return manutdData.seasons.filter(s => 
    currentFilters.seasons.includes(s.season) &&
    currentFilters.managers.includes(s.manager_clean)
  );
}

function renderFilters() {
  const container = document.getElementById('manutd-filters');
  if (!container) return;
  
  container.innerHTML = `
    <div class="filter-group">
      <label>Temporadas</label>
      <div class="filter-chips" style="max-height: 100px; overflow-y: auto;">
        ${currentFilters.seasons.map(s => `
          <label class="chip ${currentFilters.seasons.includes(s) ? 'active' : ''}">
            <input type="checkbox" value="${s}" ${currentFilters.seasons.includes(s) ? 'checked' : ''} data-filter="season"> ${s}
          </label>
        `).join('')}
      </div>
    </div>
    <div class="filter-group">
      <label>Entrenadores</label>
      <div class="filter-chips">
        ${currentFilters.managers.map(m => `
          <label class="chip ${currentFilters.managers.includes(m) ? 'active' : ''}">
            <input type="checkbox" value="${m}" ${currentFilters.managers.includes(m) ? 'checked' : ''} data-filter="manager"> ${m}
          </label>
        `).join('')}
      </div>
    </div>
    <div class="filter-group">
      <label class="toggle-label">
        <input type="checkbox" id="benchmark-toggle" ${currentFilters.benchmarkMode ? 'checked' : ''} data-filter="benchmark">
        📌 Comparativa vs Campeón PL
      </label>
    </div>
    <div class="filter-group">
      <label class="toggle-label">
        <input type="checkbox" id="trend-toggle" ${currentFilters.showTrend ? 'checked' : ''} data-filter="trend">
        📈 Línea de tendencia
      </label>
    </div>
  `;
}

function attachFilterListeners() {
  const container = document.getElementById('manutd-filters');
  if (!container) return;
  
  container.querySelectorAll('[data-filter]').forEach(el => {
    el.addEventListener('change', (e) => {
      const filter = e.target.dataset.filter;
      const value = e.target.type === 'checkbox' ? e.target.value : e.target.checked;
      
      if (filter === 'season' || filter === 'manager') {
        const arr = currentFilters[filter + 's'];
        if (e.target.checked) arr.push(value);
        else arr.splice(arr.indexOf(value), 1);
      } else if (filter === 'benchmark') {
        currentFilters.benchmarkMode = value;
      } else if (filter === 'trend') {
        currentFilters.showTrend = value;
      }
      
      updateFilterDisplay();
      renderKPIs();
      renderTabs();
    });
  });
}

function updateFilterDisplay() {
  document.querySelectorAll('#manutd-filters .chip').forEach(chip => {
    const input = chip.querySelector('input');
    chip.classList.toggle('active', input.checked);
  });
}

function renderKPIs() {
  const df = getFilteredData();
  const container = document.getElementById('manutd-kpis');
  if (!container) return;
  
  const totalGap = df.reduce((sum, s) => sum + (s.champ_pts - s.points), 0);
  const avgGap = df.length ? (totalGap / df.length).toFixed(0) : 0;
  const avgPpg = df.length ? (df.reduce((sum, s) => sum + s.ppg, 0) / df.length).toFixed(2) : 0;
  const bestPpg = manutdData.manager_summary.reduce((max, m) => Math.max(max, m.ppg), 0).toFixed(2);
  const totalComp = manutdData.totals.total_comp_fee;
  const avgPos = df.length ? (df.reduce((sum, s) => sum + s.position, 0) / df.length).toFixed(1) : 0;
  
  container.innerHTML = `
    <div class="kpi-card"><div class="kpi-value">${df.length}</div><div class="kpi-label">Temporadas analizadas</div></div>
    <div class="kpi-card"><div class="kpi-value">${totalGap}</div><div class="kpi-label">Puntos perdidos vs campeón</div><div class="kpi-delta down">${avgGap} pts/temporada</div></div>
    <div class="kpi-card"><div class="kpi-value">${avgPpg}</div><div class="kpi-label">PPG promedio</div><div class="kpi-delta">${avgPpg >= bestPpg ? 'up' : 'down'}vs ${bestPpg} (Mourinho)</div></div>
    <div class="kpi-card"><div class="kpi-value">£${totalComp}M</div><div class="kpi-label">Coste indemnizaciones</div><div class="kpi-delta off">10 años</div></div>
    <div class="kpi-card"><div class="kpi-value">1</div><div class="kpi-label">Títulos Premier</div><div class="kpi-delta down">-9 vs Top6 líderes</div></div>
    <div class="kpi-card"><div class="kpi-value">${avgPos}°</div><div class="kpi-label">Posición promedio PL</div></div>
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
  const seasons = df.map(s => s.season);
  
  const traces = [{
    x: seasons, y: df.map(s => s.points), type: 'bar', name: 'Man Utd',
    marker: { color: df.map(s => s.points), colorscale: [[0, COLORS.bad], [0.5, COLORS.warn], [1, COLORS.manutd]], showscale: false },
    text: df.map(s => s.points), textposition: 'outside', textfont: { size: 11, color: COLORS.text },
    customdata: df.map(s => [s.manager_clean, s.season]),
    hovertemplate: '<b>%{customdata[1]}</b><br>Puntos: %{y}<br>DT: %{customdata[0]}<extra></extra>'
  }];
  
  if (currentFilters.benchmarkMode) {
    traces.push({
      x: seasons, y: df.map(s => s.champ_pts), mode: 'lines+markers', name: 'Campeón PL',
      line: { color: COLORS.champ, width: 2.5, dash: 'dash' }, marker: { size: 6 },
      hovertemplate: '<b>%{x}</b><br>Campeón: %{y} pts<extra></extra>'
    });
    
    traces.push({
      x: [...seasons, ...seasons.slice().reverse()],
      y: [...df.map(s => s.champ_pts), ...df.map(s => s.points).slice().reverse()],
      fill: 'toself', fillcolor: 'rgba(247,129,102,0.1)', line: { color: 'rgba(0,0,0,0)' },
      name: 'Brecha con campeón', showlegend: true, hoverinfo: 'skip'
    });
  }
  
  if (currentFilters.showTrend) {
    const xNum = Array.from({ length: df.length }, (_, i) => i);
    const yVals = df.map(s => s.points);
    const n = xNum.length;
    const sumX = xNum.reduce((a,b) => a+b, 0);
    const sumY = yVals.reduce((a,b) => a+b, 0);
    const sumXY = xNum.reduce((a,b,i) => a + b*yVals[i], 0);
    const sumXX = xNum.reduce((a,b) => a+b*b, 0);
    const slope = (n*sumXY - sumX*sumY) / (n*sumXX - sumX*sumX);
    const intercept = (sumY - slope*sumX) / n;
    const trendY = xNum.map(x => slope*x + intercept);
    
    traces.push({
      x: seasons, y: trendY, mode: 'lines', name: `Tendencia (${slope >= 0 ? '+' : ''}${slope.toFixed(1)} pts/temp)`,
      line: { color: COLORS.accent, width: 1.5, dash: 'longdash' }
    });
  }
  
  const firedSeasons = df.filter(s => s.manager_fired).map(s => s.season);
  const seasonPositions = Object.fromEntries(seasons.map((s,i) => [s, i]));
  
  const shapes = firedSeasons.map(s => ({
    type: 'line', x0: seasonPositions[s], x1: seasonPositions[s], y0: 0, y1: 1, yref: 'paper',
    line: { dash: 'dot', color: COLORS.warn, width: 1.5 }
  }));
  
  const annotations = firedSeasons.map(s => ({
    x: seasonPositions[s], y: 1, yref: 'paper', text: '⚠ Despido',
    showarrow: false, font: { color: COLORS.warn, size: 10 }, yshift: -10
  }));
  
  const layout = {
    ...PLOTLY_THEME,
    title: 'Puntos por temporada — Manchester United vs Campeón de la Premier League',
    height: 420,
    barmode: 'overlay',
    legend: { orientation: 'h', y: -0.15, x: 0 },
    shapes,
    annotations
  };
  
  Plotly.newPlot('manutd-points-chart', traces, layout, { responsive: true, displayModeBar: false });
  
  // Row 2: Goals and Position
  renderGoalsChart(df);
  renderPositionChart(df);
}

function renderGoalsChart(df) {
  const seasons = df.map(s => s.season);
  
  const traces = [
    { x: seasons, y: df.map(s => s.gf), name: 'Goles a favor', type: 'bar', marker: { color: 'rgba(63,185,80,0.7)' }, text: df.map(s => s.gf), textposition: 'inside' },
    { x: seasons, y: df.map(s => -s.ga), name: 'Goles en contra', type: 'bar', marker: { color: 'rgba(247,129,102,0.7)' }, text: df.map(s => s.ga), textposition: 'inside' },
    { x: seasons, y: df.map(s => s.gd), mode: 'lines+markers', name: 'Diferencial', line: { color: COLORS.accent, width: 2.5 }, marker: { size: 6 } }
  ];
  
  const layout = { ...PLOTLY_THEME, title: 'Goles: a favor / en contra / diferencial', height: 320, barmode: 'overlay' };
  Plotly.newPlot('manutd-goals-chart', traces, layout, { responsive: true, displayModeBar: false });
}

function renderPositionChart(df) {
  const seasons = df.map(s => s.season);
  const colorsPos = df.map(s => s.position <= 4 ? COLORS.manutd : (s.position <= 6 ? COLORS.warn : COLORS.bad));
  
  const traces = [{
    x: seasons, y: df.map(s => s.position), type: 'bar', marker: { color: colorsPos },
    text: df.map(s => s.position + '°'), textposition: 'outside', textfont: { size: 11 }
  }];
  
  const layout = {
    ...PLOTLY_THEME,
    title: 'Posición final en Premier League',
    height: 320,
    showlegend: false,
    shapes: [{ type: 'line', x0: -0.5, x1: seasons.length - 0.5, y0: 4, y1: 4, line: { dash: 'dash', color: COLORS.champ } }],
    annotations: [{ x: seasons.length - 1, y: 4, text: 'Champions League zone', showarrow: false, font: { color: COLORS.champ, size: 10 }, xshift: -60 }],
    yaxis: { ...PLOTLY_THEME.yaxis, autorange: 'reversed', range: [0.5, 10.5] }
  };
  Plotly.newPlot('manutd-position-chart', traces, layout, { responsive: true, displayModeBar: false });
}

function renderTab2() {
  const mgrDf = manutdData.manager_summary.sort((a,b) => a.ppg - b.ppg);
  
  const barColors = mgrDf.map(m => m.ppg >= 1.8 ? COLORS.manutd : (m.ppg >= 1.6 ? COLORS.warn : COLORS.bad));
  
  const figMgr = {
    data: [{
      y: mgrDf.map(m => m.manager_clean), x: mgrDf.map(m => m.ppg), orientation: 'h', type: 'bar',
      marker: { color: barColors, opacity: 0.85 }, text: mgrDf.map(m => m.ppg.toFixed(3)), textposition: 'outside', textfont: { size: 12 }
    }],
    layout: { ...PLOTLY_THEME, title: 'Puntos por partido (PPG) — Comparativa de gestiones', height: 360, shapes: [{ type: 'line', x0: 2.0, x1: 2.0, y0: -0.5, y1: mgrDf.length - 0.5, line: { dash: 'dot', color: COLORS.champ } }], annotations: [{ x: 2.0, y: mgrDf.length - 0.5, text: 'Elite (>2.0 ppg)', showarrow: false, font: { color: COLORS.champ, size: 10 }, xshift: 40 }] }
  };
  Plotly.newPlot('manutd-mgr-bar', figMgr.data, figMgr.layout, { responsive: true, displayModeBar: false });
  
  // Scatter PPG vs GF
  const figScat = {
    data: [{
      x: mgrDf.map(m => m.ppg), y: mgrDf.map(m => m.avg_gf), mode: 'markers+text', type: 'scatter',
      text: mgrDf.map(m => m.manager_clean), textposition: 'top center', textfont: { size: 10 },
      marker: { size: mgrDf.map(m => m.seasons * 15), color: mgrDf.map((_,i) => i), colorscale: 'Plotly', showscale: false, line: { color: '#0d1117', width: 1 } },
      hovertemplate: '<b>%{text}</b><br>PPG: %{x}<br>GF/temp: %{y}<extra></extra>'
    }],
    layout: { ...PLOTLY_THEME, title: 'PPG vs Goles a favor (tamaño = temporadas)', height: 360, showlegend: false }
  };
  Plotly.newPlot('manutd-mgr-scatter', figScat.data, figScat.layout, { responsive: true, displayModeBar: false });
  
  // Table
  const tableContainer = document.getElementById('manutd-mgr-table');
  if (tableContainer) {
    tableContainer.innerHTML = `
      <table class="data-table">
        <thead><tr><th>Entrenador</th><th>Temporadas</th><th>Pts totales</th><th>PPG</th><th>Pos. media</th><th>GF/temp.</th><th>GA/temp.</th><th>Indemniz. (£M)</th></tr></thead>
        <tbody>
          ${manutdData.manager_summary.sort((a,b)=>b.ppg-a.ppg).map(m => `
            <tr>
              <td>${m.manager_clean}</td>
              <td>${m.seasons}</td>
              <td>${m.pts_total}</td>
              <td style="background: ${m.ppg >= 1.8 ? 'rgba(63,185,80,0.2)' : m.ppg >= 1.6 ? 'rgba(227,179,65,0.2)' : 'rgba(247,129,102,0.2)'}"><strong>${m.ppg.toFixed(3)}</strong></td>
              <td>${m.avg_pos.toFixed(1)}</td>
              <td>${m.avg_gf.toFixed(1)}</td>
              <td>${m.avg_ga.toFixed(1)}</td>
              <td style="background: ${m.total_comp > 0 ? 'rgba(247,129,102,0.2)' : 'transparent'}">${m.total_comp.toFixed(1)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }
}

function renderTab3() {
  const df = getFilteredData();
  const corrVars = ['points', 'gf', 'ga', 'gd', 'wins', 'position', 'gap'];
  const corrMatrix = computeCorrelation(df, corrVars);
  
  // Correlation heatmap
  const figCorr = {
    data: [{ z: corrMatrix.values, x: corrVars, y: corrVars, type: 'heatmap',
      colorscale: [[0, COLORS.bad], [0.5, '#0d1117'], [1, COLORS.champ]], zmid: 0,
      text: corrMatrix.values.map(row => row.map(v => v.toFixed(2))), texttemplate: '%{text}', textfont: { size: 11 },
      colorbar: { bgcolor: 'rgba(0,0,0,0)', tickfont: { color: '#8b949e' } }
    }],
    layout: { ...PLOTLY_THEME, title: 'Matriz de correlaciones — variables de rendimiento', height: 400 }
  };
  Plotly.newPlot('manutd-corr-chart', figCorr.data, figCorr.layout, { responsive: true, displayModeBar: false });
  
  // Wins/Draws/Losses stacked
  const seasons = df.map(s => s.season);
  const figWins = {
    data: [
      { x: seasons, y: df.map(s => s.wins), name: 'Victorias', type: 'bar', marker: { color: COLORS.champ, opacity: 0.85 } },
      { x: seasons, y: df.map(s => s.draws), name: 'Empates', type: 'bar', marker: { color: COLORS.warn, opacity: 0.85 } },
      { x: seasons, y: df.map(s => s.losses), name: 'Derrotas', type: 'bar', marker: { color: COLORS.manutd, opacity: 0.85 } }
    ],
    layout: { ...PLOTLY_THEME, barmode: 'stack', title: 'Distribución de resultados por temporada', height: 320, legend: { orientation: 'h', y: -0.2 } }
  };
  Plotly.newPlot('manutd-results-chart', figWins.data, figWins.layout, { responsive: true, displayModeBar: false });
  
  // Regression GF vs Points
  const xReg = df.map(s => s.gf);
  const yReg = df.map(s => s.points);
  const n = xReg.length;
  const sumX = xReg.reduce((a,b) => a+b, 0);
  const sumY = yReg.reduce((a,b) => a+b, 0);
  const sumXY = xReg.reduce((a,b,i) => a + b*yReg[i], 0);
  const sumXX = xReg.reduce((a,b) => a+b*b, 0);
  const sumYY = yReg.reduce((a,b) => a+b*b, 0);
  const slope = (n*sumXY - sumX*sumY) / (n*sumXX - sumX*sumX);
  const intercept = (sumY - slope*sumX) / n;
  const r = (n*sumXY - sumX*sumY) / Math.sqrt((n*sumXX - sumX*sumX) * (n*sumYY - sumY*sumY));
  const xLine = Array.from({length: 50}, (_,i) => Math.min(...xReg) - 2 + i * (Math.max(...xReg) - Math.min(...xReg) + 4) / 49);
  const yLine = xLine.map(x => slope*x + intercept);
  
  const figReg = {
    data: [
      { x: xReg, y: yReg, mode: 'markers', type: 'scatter', marker: { size: 10, color: COLORS.manutd, opacity: 0.8 }, text: seasons, hovertemplate: '<b>%{text}</b><br>GF: %{x}<br>Pts: %{y}<extra></extra>', name: 'Temporadas' },
      { x: xLine, y: yLine, mode: 'lines', type: 'scatter', line: { color: COLORS.accent, width: 2, dash: 'dash' }, name: `Regresión (R²=${(r*r).toFixed(2)})` }
    ],
    layout: { ...PLOTLY_THEME, title: 'Regresión: Goles a Favor → Puntos', height: 320 }
  };
  Plotly.newPlot('manutd-reg-chart', figReg.data, figReg.layout, { responsive: true, displayModeBar: false });
}

function computeCorrelation(df, vars) {
  const n = df.length;
  const values = vars.map(v1 => vars.map(v2 => {
    const x = df.map(d => d[v1]);
    const y = df.map(d => d[v2]);
    const sumX = x.reduce((a,b) => a+b, 0);
    const sumY = y.reduce((a,b) => a+b, 0);
    const sumXY = x.reduce((a,b,i) => a + b*y[i], 0);
    const sumXX = x.reduce((a,b) => a+b*b, 0);
    const sumYY = y.reduce((a,b) => a+b*b, 0);
    return (n*sumXY - sumX*sumY) / Math.sqrt((n*sumXX - sumX*sumX) * (n*sumYY - sumY*sumY));
  }));
  return { values };
}

function renderTab4() {
  const container = document.getElementById('manutd-simulator');
  if (!container) return;
  
  container.innerHTML = `
    <div class="simulator-controls">
      <div class="control-group">
        <label>PPG esperado del DT: <span id="sim-ppg-val">1.75</span></label>
        <input type="range" id="sim-ppg" min="1.2" max="2.3" step="0.05" value="1.75">
      </div>
      <div class="control-group">
        <label>Goles a favor esperados: <span id="sim-gf-val">62</span></label>
        <input type="range" id="sim-gf" min="40" max="90" step="1" value="62">
      </div>
      <div class="control-group">
        <label>Índice estabilidad táctica (1-10): <span id="sim-stab-val">7</span></label>
        <input type="range" id="sim-stab" min="1" max="10" step="1" value="7">
      </div>
    </div>
    <div class="simulator-results" id="manutd-sim-results"></div>
    <div id="manutd-gauge-chart"></div>
  `;
  
  attachSimulatorListeners();
  updateSimulator();
}

function attachSimulatorListeners() {
  ['sim-ppg', 'sim-gf', 'sim-stab'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', updateSimulator);
  });
}

function updateSimulator() {
  const ppg = parseFloat(document.getElementById('sim-ppg').value);
  const gf = parseInt(document.getElementById('sim-gf').value);
  const stab = parseInt(document.getElementById('sim-stab').value);
  
  document.getElementById('sim-ppg-val').textContent = ppg.toFixed(2);
  document.getElementById('sim-gf-val').textContent = gf;
  document.getElementById('sim-stab-val').textContent = stab;
  
  const simPts = Math.round(ppg * 38);
  const simGap = Math.max(0, 89 - simPts);
  const simPos = Math.max(1, Math.min(20, Math.round(10 - (simPts - 58) / 4)));
  const simUCL = simPts >= 71 ? 'Champions League ✅' : (simPts >= 60 ? 'Europa League ⚠️' : 'Nada 🔴');
  
  const resultsEl = document.getElementById('manutd-sim-results');
  if (resultsEl) {
    resultsEl.innerHTML = `
      <div class="sim-metric"><div class="sim-value">${simPts}</div><div class="sim-label">Puntos proyectados</div><div class="sim-delta">${simPts - 64 > 0 ? '+' : ''}${simPts - 64} vs baseline</div></div>
      <div class="sim-metric"><div class="sim-value">${simPos}°</div><div class="sim-label">Posición estimada</div></div>
      <div class="sim-metric"><div class="sim-value">${simGap}</div><div class="sim-label">Brecha vs campeón</div></div>
      <div class="sim-metric"><div class="sim-value">${simUCL}</div><div class="sim-label">Clasificación europea</div></div>
    `;
  }
  
  // Gauge
  const figGauge = {
    data: [{ type: 'indicator', mode: 'gauge+number+delta', value: ppg, delta: { reference: 1.64, valueformat: '.2f' },
      title: { text: 'PPG vs Media Histórica ManUtd (1.64)', font: { size: 14 } },
      gauge: {
        axis: { range: [1.0, 2.3], tickcolor: '#8b949e' },
        bar: { color: COLORS.manutd },
        steps: [
          { range: [1.0, 1.5], color: 'rgba(247,129,102,0.3)' },
          { range: [1.5, 1.8], color: 'rgba(227,179,65,0.3)' },
          { range: [1.8, 2.3], color: 'rgba(63,185,80,0.3)' }
        ],
        threshold: { line: { color: COLORS.champ, width: 2 }, value: 2.0 },
        bgcolor: 'rgba(22,27,34,0.8)'
      },
      number: { font: { color: COLORS.text, family: 'Inter' }, valueformat: '.2f' }
    }],
    layout: { ...PLOTLY_THEME, height: 300, margin: { t: 60, b: 10, l: 10, r: 10 } }
  };
  Plotly.newPlot('manutd-gauge-chart', figGauge.data, figGauge.layout, { responsive: true, displayModeBar: false });
}