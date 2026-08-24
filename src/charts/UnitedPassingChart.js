import { loadJSON } from '../main.js';

const COLORS = {
  bg: '#0F1117',
  surface: '#1A1D24',
  border: '#2A2D35',
  text1: '#F0F2F6',
  text2: '#9BA3B0',
  red: '#DA291C',
  yellow: '#FBE122',
  gold: '#F59E0B',
  blue: '#4F8BF9',
  green: '#3FB950'
};

const PLOTLY_THEME = {
  paper_bgcolor: 'rgba(0,0,0,0)',
  plot_bgcolor: 'rgba(26,29,36,0.6)',
  font: { family: 'Inter, system-ui', color: COLORS.text1, size: 12 }
};

let passingData = null;
let currentView = 'network';
let currentTier = 'Resto PL';
let currentMinWeight = 5;
let currentPosFilter = ['CDM', 'CM', 'CAM', 'RW', 'ST'];
let currentEx = 'xT';
let currentEy = 'prog';

export async function initUnitedPassing() {
  passingData = await loadJSON('./data/united-passing.json');
  renderViewSelector();
  renderKPIs();
  renderContent();
  attachListeners();
}

function renderViewSelector() {
  const container = document.getElementById('passing-view-selector');
  if (!container) return;
  
  container.innerHTML = `
    <div class="view-tabs">
      <button class="view-tab ${currentView === 'network' ? 'active' : ''}" data-view="network">🗺️ Red de Pases</button>
      <button class="view-tab ${currentView === 'individual' ? 'active' : ''}" data-view="individual">📐 Comparativa Individual</button>
      <button class="view-tab ${currentView === 'benchmark' ? 'active' : ''}" data-view="benchmark">⚖️ Benchmark vs Premier League</button>
      <button class="view-tab ${currentView === 'tier' ? 'active' : ''}" data-view="tier">🔄 Resto PL vs Top 6</button>
    </div>
    <div id="passing-view-controls"></div>
  `;
  
  container.querySelectorAll('[data-view]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentView = e.target.dataset.view;
      renderViewSelector();
      renderContent();
      attachListeners();
    });
  });
}

function renderContent() {
  const container = document.getElementById('passing-content');
  if (!container) return;
  
  switch (currentView) {
    case 'network': renderNetworkView(container); break;
    case 'individual': renderIndividualView(container); break;
    case 'benchmark': renderBenchmarkView(container); break;
    case 'tier': renderTierView(container); break;
  }
}

function renderNetworkView(container) {
  const passesNet = adjustPasses(currentTier);
  const passesF = passesNet.filter(([, , w]) => w >= currentMinWeight);
  const bet = betweennessSimple(passesF, passingData.squad);
  const outDeg = passingData.squad.reduce((acc, p) => {
    acc[p.player] = passesF.filter(([s]) => s === p.player).reduce((sum, [, , w]) => sum + w, 0);
    return acc;
  }, {});
  const inDeg = passingData.squad.reduce((acc, p) => {
    acc[p.player] = passesF.filter(([, t]) => t === p.player).reduce((sum, [, , w]) => sum + w, 0);
    return acc;
  }, {});
  const topBroker = Object.entries(bet).reduce((max, [k, v]) => v > max[1] ? [k, v] : max, ['N/A', 0])[0];
  
  container.innerHTML = `
    <div class="section-header">Visualización de la Red de Pases</div>
    <div class="desc-box" style="border-left-color: var(--blue);">
      <strong>Interpretación:</strong> Cada <strong>círculo</strong> representa un jugador. Su <strong>tamaño</strong> indica
      la betweenness centrality (qué tan crítico es en la circulación). A mayor tamaño, más rutas de pase pasan por él.
      Las <strong>líneas</strong> conectan jugadores que se combinan frecuentemente; más gruesas = mayor volumen de pases.
    </div>
    <div id="passing-network-chart"></div>
    <div class="section-header">Tabla de Centralidad — Jugadores</div>
    <div id="passing-centrality-table"></div>
  `;
  
  renderNetworkChart(passesF, bet, outDeg, inDeg, topBroker);
  renderCentralityTable(bet, outDeg, inDeg);
}

function renderNetworkChart(passesF, bet, outDeg, inDeg, topBroker) {
  const posXY = Object.fromEntries(passingData.squad.map(p => [p.player, [p.x, p.y]]));
  const maxW = Math.max(...passesF.map(([, , w]) => w), 1);
  
  const edgeTraces = passesF.map(([s, t, w]) => {
    const [x0, y0] = posXY[s];
    const [x1, y1] = posXY[t];
    const op = 0.15 + (w / maxW) * 0.7;
    const wd = 0.8 + (w / maxW) * 7;
    return {
      x: [x0, x1, null], y: [y0, y1, null], mode: 'lines',
      line: { width: wd, color: `rgba(79,139,249,${op.toFixed(2)})` },
      hoverinfo: 'none', showlegend: false
    };
  });
  
  const nodeSizes = passingData.squad.map(p => 14 + Math.max(bet[p.player] || 0, 0) * 85);
  const nodeColors = passingData.squad.map(p => bet[p.player] || 0);
  
  const nodeTrace = {
    x: passingData.squad.map(p => posXY[p.player][0]),
    y: passingData.squad.map(p => posXY[p.player][1]),
    mode: 'markers+text',
    text: passingData.squad.map(p => p.player),
    textposition: 'top center',
    hovertext: passingData.squad.map(p => 
      `<b>${p.player}</b> (${p.pos})<br>Betweenness: ${(bet[p.player] || 0).toFixed(3)}<br>Pases salientes: ${outDeg[p.player] || 0}<br>Precisión: ${passingData.stats[p.player].pass_acc}%<br>xT: ${passingData.stats[p.player].xT}`
    ),
    hoverinfo: 'text',
    textfont: { size: 10, color: COLORS.text1 },
    marker: {
      size: nodeSizes, color: nodeColors,
      colorscale: [[0, COLORS.blue], [0.5, COLORS.red], [1, COLORS.yellow]],
      colorbar: { title: 'Betweenness', thickness: 10, len: 0.55, x: 1.01, tickfont: { color: COLORS.text2 } },
      line: { width: 2, color: COLORS.surface }
    },
    showlegend: false
  };
  
  const shapes = [
    { type: 'rect', x0: 0, y0: 0, x1: 100, y1: 68, line: { color: 'rgba(79,139,249,.25)', width: 1.5 } },
    { type: 'rect', x0: 0, y0: 13.84, x1: 16.5, y1: 54.16, line: { color: 'rgba(79,139,249,.15)', width: 1 } },
    { type: 'rect', x0: 83.5, y0: 13.84, x1: 100, y1: 54.16, line: { color: 'rgba(79,139,249,.15)', width: 1 } },
    { type: 'circle', x0: 44, y0: 28, x1: 56, y1: 40, line: { color: 'rgba(79,139,249,.15)', width: 1 } },
    { type: 'line', x0: 50, y0: 0, x1: 50, y1: 68, line: { color: 'rgba(79,139,249,.10)', width: 1 } }
  ];
  
  const layout = {
    plot_bgcolor: COLORS.surface,
    paper_bgcolor: 'rgba(0,0,0,0)',
    xaxis: { showgrid: false, zeroline: false, showticklabels: false, range: [-5, 110] },
    yaxis: { showgrid: false, zeroline: false, showticklabels: false, range: [-5, 73] },
    height: 560,
    font: { family: 'Inter' },
    title: `Conexiones con ≥${currentMinWeight} pases — vs ${currentTier}`,
    shapes
  };
  
  Plotly.newPlot('passing-network-chart', [...edgeTraces, nodeTrace], layout, { responsive: true, displayModeBar: false });
}

function renderCentralityTable(bet, outDeg, inDeg) {
  const container = document.getElementById('passing-centrality-table');
  if (!container) return;
  
  const rows = passingData.squad.map(p => ({
    Jugador: p.player, Pos: p.pos,
    Betweenness: (bet[p.player] || 0).toFixed(4),
    'Pases salientes': outDeg[p.player] || 0,
    'Pases recibidos': inDeg[p.player] || 0,
    'Pass acc %': passingData.stats[p.player].pass_acc,
    xT: passingData.stats[p.player].xT
  })).sort((a,b) => b.Betweenness - a.Betweenness);
  
  container.innerHTML = `
    <table class="data-table">
      <thead><tr>${Object.keys(rows[0]).map(k => `<th>${k}</th>`).join('')}</tr></thead>
      <tbody>
        ${rows.map(r => `<tr>${Object.values(r).map(v => `<td>${v}</td>`).join('')}</tr>`).join('')}
      </tbody>
    </table>
  `;
}

function renderIndividualView(container) {
  const statsDf = passingData.squad.map(p => ({ player: p.player, pos: p.pos, ...passingData.stats[p.player] }));
  const dff = statsDf.filter(p => currentPosFilter.includes(p.pos));
  
  const lm = { pass_acc: 'Precisión pase %', prog: 'Pases progresivos/90', xT: 'xT generado', vert: 'Verticalidad (0–1)' };
  const sizes = dff.map(p => Math.max(passingData.stats[p.player].pass_acc, 0) * 1.5);
  
  container.innerHTML = `
    <div class="section-header">Comparativa de Rendimiento Individual</div>
    <div class="desc-box">
      <strong>Interpretación:</strong> Cada <strong>burbuja</strong> es un jugador. Los ejes X e Y los elegís para comparar
      dos métricas. El <strong>tamaño</strong> de la burbuja representa su precisión de pase.
      Las <strong>líneas punteadas</strong> marcan el promedio del equipo en cada métrica.
    </div>
    <div class="controls-row">
      <div class="control-group">
        <label>Filtrar por posición</label>
        <div class="filter-chips">
          ${['GK','RB','LB','CB','CDM','CM','CAM','RW','ST'].map(pos => `
            <label class="chip ${currentPosFilter.includes(pos) ? 'active' : ''}">
              <input type="checkbox" value="${pos}" ${currentPosFilter.includes(pos) ? 'checked' : ''} data-pos-filter> ${pos}
            </label>
          `).join('')}
        </div>
      </div>
      <div class="control-group">
        <label>Eje X</label>
        <select id="ex-select">${Object.entries(lm).map(([k,v]) => `<option value="${k}" ${currentEx===k?'selected':''}>${v}</option>`).join('')}</select>
      </div>
      <div class="control-group">
        <label>Eje Y</label>
        <select id="ey-select">${Object.entries(lm).map(([k,v]) => `<option value="${k}" ${currentEy===k?'selected':''}>${v}</option>`).join('')}</select>
      </div>
    </div>
    <div id="passing-individual-chart"></div>
  `;
  
  renderIndividualChart(dff, lm, sizes);
  attachIndividualListeners();
}

function renderIndividualChart(dff, lm, sizes) {
  if (dff.length === 0) {
    document.getElementById('passing-individual-chart').innerHTML = '<div class="desc-box" style="border-left-color: var(--warn);">Selecciona al menos una posición para ver el gráfico.</div>';
    return;
  }
  
  const fig = {
    data: [{
      x: dff.map(p => p[currentEx]), y: dff.map(p => p[currentEy]), mode: 'markers+text', type: 'scatter',
      text: dff.map(p => p.player), textposition: 'top center',
      marker: { size: sizes, color: dff.map(p => p.pos), colorscale: 'Vivid', showscale: false, line: { width: 1, color: COLORS.surface }, sizemode: 'diameter' },
      hovertemplate: '<b>%{text}</b><br>' + lm[currentEx] + ': %{x}<br>' + lm[currentEy] + ': %{y}<extra></extra>'
    }],
    layout: {
      ...PLOTLY_THEME,
      title: `${lm[currentEx]} vs ${lm[currentEy]}`,
      height: 460,
      legend: { orientation: 'h', y: -0.2 },
      shapes: [
        { type: 'line', x0: Math.min(...dff.map(p => p[currentEx])), x1: Math.max(...dff.map(p => p[currentEx])), y0: dff.reduce((a,b)=>a+b[currentEy],0)/dff.length, y1: dff.reduce((a,b)=>a+b[currentEy],0)/dff.length, line: { dash: 'dot', color: COLORS.text2 }, xref: 'x', yref: 'y' },
        { type: 'line', x0: dff.reduce((a,b)=>a+b[currentEx],0)/dff.length, x1: dff.reduce((a,b)=>a+b[currentEx],0)/dff.length, y0: Math.min(...dff.map(p => p[currentEy])), y1: Math.max(...dff.map(p => p[currentEy])), line: { dash: 'dot', color: COLORS.text2 }, xref: 'x', yref: 'y' }
      ]
    }
  };
  Plotly.newPlot('passing-individual-chart', fig.data, fig.layout, { responsive: true, displayModeBar: false });
}

function attachIndividualListeners() {
  document.querySelectorAll('[data-pos-filter]').forEach(el => {
    el.addEventListener('change', (e) => {
      const pos = e.target.value;
      if (e.target.checked) currentPosFilter.push(pos);
      else currentPosFilter.splice(currentPosFilter.indexOf(pos), 1);
      renderViewSelector();
      renderContent();
      attachListeners();
    });
  });
  
  const exSel = document.getElementById('ex-select');
  const eySel = document.getElementById('ey-select');
  if (exSel) exSel.addEventListener('change', (e) => { currentEx = e.target.value; renderContent(); attachListeners(); });
  if (eySel) eySel.addEventListener('change', (e) => { currentEy = e.target.value; renderContent(); attachListeners(); });
}

function renderBenchmarkView(container) {
  const dfPL = Object.entries(passingData.pl_benchmark).map(([equipo, v]) => ({ equipo, ...v }));
  
  container.innerHTML = `
    <div class="section-header">Benchmarking — Manchester United vs Premier League</div>
    <div class="desc-box">
      <strong>Interpretación:</strong> Ranking del Manchester United (en <strong>rojo</strong>) frente al resto de la
      Premier League. Seleccioná la métrica a comparar: posesión, precisión de pase, pases progresivos o xT.
    </div>
    <div class="control-group">
      <label>Métrica</label>
      <select id="pl-metric-select">
        <option value="pass_acc" ${currentEx==='pass_acc'?'selected':''}>Precisión pase %</option>
        <option value="prog" ${currentEx==='prog'?'selected':''}>Pases progresivos/partido</option>
        <option value="xT" ${currentEx==='xT'?'selected':''}>xT generado/partido</option>
        <option value="poss" ${currentEx==='poss'?'selected':''}>Posesión %</option>
      </select>
    </div>
    <div id="passing-benchmark-chart"></div>
    <div id="passing-benchmark-info"></div>
  `;
  
  renderBenchmarkChart(dfPL);
  document.getElementById('pl-metric-select').addEventListener('change', (e) => {
    currentEx = e.target.value;
    renderBenchmarkChart(dfPL);
  });
}

function renderBenchmarkChart(dfPL) {
  const lm2 = { pass_acc: 'Precisión pase %', prog: 'Pases prog./partido', xT: 'xT/partido', poss: 'Posesión %' };
  const dfSorted = [...dfPL].sort((a,b) => a[currentEx] - b[currentEx]);
  
  const fig = {
    data: [{
      x: dfSorted.map(d => d[currentEx]), y: dfSorted.map(d => d.equipo), orientation: 'h', type: 'bar',
      marker: { color: dfSorted.map(d => d.equipo === 'Man United' ? COLORS.red : COLORS.border) },
      text: dfSorted.map(d => d[currentEx].toFixed(1)), textposition: 'outside', textfont: { size: 11, color: COLORS.text1 }
    }],
    layout: { ...PLOTLY_THEME, title: `Premier League — ${lm2[currentEx]}`, height: 420 }
  };
  Plotly.newPlot('passing-benchmark-chart', fig.data, fig.layout, { responsive: true, displayModeBar: false });
  
  const utd = passingData.pl_benchmark['Man United'];
  const others = Object.values(passingData.pl_benchmark).filter(v => v !== utd);
  const avgAcc = others.reduce((a,b) => a + b.pass_acc, 0) / others.length;
  const avgXT = others.reduce((a,b) => a + b.xT, 0) / others.length;
  
  document.getElementById('passing-benchmark-info').innerHTML = `
    <div class="insight-card">
      Man United — Precisión: <strong>${utd.pass_acc}%</strong> vs promedio PL <strong>${avgAcc.toFixed(1)}%</strong> | 
      xT: <strong>${utd.xT}</strong> vs promedio <strong>${avgXT.toFixed(2)}</strong>
    </div>
  `;
}

function renderTierView(container) {
  const avgAcc = Object.values(passingData.stats).reduce((a,b) => a + b.pass_acc, 0) / Object.keys(passingData.stats).length;
  
  const rows = ['Resto PL', 'Top 6'].map(t => {
    const adj = adjustPasses(t);
    const accM = t === 'Resto PL' ? 0 : -4.2;
    return {
      Rival: t,
      'Pases totales': adj.reduce((sum, [, , w]) => sum + w, 0),
      'Precisión media %': (avgAcc + accM).toFixed(1),
      'xT total': (Object.values(passingData.stats).reduce((a,b) => a + b.xT, 0) * (t === 'Resto PL' ? 1.0 : 0.78)).toFixed(2)
    };
  });
  
  const dfR = rows;
  
  container.innerHTML = `
    <div class="section-header">Rendimiento del Equipo: Resto PL vs Top 6</div>
    <div class="desc-box">
      <strong>Interpretación:</strong> Compara el rendimiento del Manchester United cuando enfrenta al <strong>Top 6</strong>
      (Arsenal, City, Liverpool, Tottenham, Chelsea, Aston Villa) vs el <strong>resto de la liga</strong>.
      Revela cómo bajan los pases totales, la precisión y el xT generado contra rivales de élite.
    </div>
    <div class="charts-row">
      <div id="passing-tier-passes"></div>
      <div id="passing-tier-acc"></div>
      <div id="passing-tier-xt"></div>
    </div>
    <div id="passing-tier-insight"></div>
  `;
  
  ['Pases totales', 'Precisión media %', 'xT total'].forEach((met, i) => {
    const fig = {
      data: [{ x: dfR.map(d => d.Rival), y: dfR.map(d => d[met]), type: 'bar',
        marker: { color: [COLORS.red, COLORS.gold] },
        text: dfR.map(d => parseFloat(d[met]).toFixed(1)), textposition: 'outside', textfont: { color: COLORS.text1, size: 13 }
      }],
      layout: { ...PLOTLY_THEME, title: met, height: 300, margin: { t: 40, b: 20, l: 10, r: 10 } }
    };
    Plotly.newPlot(`passing-tier-${met.toLowerCase().replace(/\s+/g, '-').replace('%', 'pct')}`, fig.data, fig.layout, { responsive: true, displayModeBar: false });
  });
  
  const passesNet = adjustPasses(currentTier);
  const bet = betweennessSimple(passesNet, passingData.squad);
  const topBroker = Object.entries(bet).reduce((max, [k, v]) => v > max[1] ? [k, v] : max, ['N/A', 0])[0];
  
  document.getElementById('passing-tier-insight').innerHTML = `
    <div class="insight-card warning">
      Contra el <strong>Top 6</strong>, United reduce su precisión de pase ~4pp y su xT generado cae un <strong>22%</strong>. 
      ${topBroker !== 'N/A' ? `<strong>${topBroker}</strong> (Betweenness: ${bet[topBroker].toFixed(3)}) es el jugador cuya neutralización más interrumpe el flujo ofensivo.` : ''}
    </div>
  `;
}

function renderKPIs() {
  const passesNet = adjustPasses(currentTier);
  const bet = betweennessSimple(passesNet, passingData.squad);
  const topBroker = Object.entries(bet).reduce((max, [k, v]) => v > max[1] ? [k, v] : max, ['N/A', 0])[0];
  const avgPassAcc = Object.values(passingData.stats).reduce((a,b) => a + b.pass_acc, 0) / Object.keys(passingData.stats).length;
  const maxXTPlayer = Object.entries(passingData.stats).reduce((max, [k, v]) => v.xT > max[1].xT ? [k, v] : max, ['', {xT: 0}])[0];
  
  const container = document.getElementById('passing-kpis');
  if (!container) return;
  
  container.innerHTML = `
    <div class="kpi-card"><div class="kpi-value">${passesNet.reduce((sum, [, , w]) => sum + w, 0)}</div><div class="kpi-label">Pases totales en muestra</div></div>
    <div class="kpi-card"><div class="kpi-value">${avgPassAcc.toFixed(1)}%</div><div class="kpi-label">Precisión pase promedio</div></div>
    <div class="kpi-card"><div class="kpi-value">${topBroker}</div><div class="kpi-label">Broker táctico (betweenness)</div></div>
    <div class="kpi-card"><div class="kpi-value">${maxXTPlayer}</div><div class="kpi-label">Mayor xT generado</div></div>
  `;
}

function attachListeners() {
  if (currentView === 'network') {
    const tierRadios = document.querySelectorAll('input[name="tier-radio"]');
    tierRadios.forEach(r => r.addEventListener('change', (e) => {
      currentTier = e.target.value;
      renderKPIs();
      renderContent();
    }));
    
    const minWeightSlider = document.getElementById('min-weight-slider');
    if (minWeightSlider) {
      minWeightSlider.addEventListener('input', (e) => {
        currentMinWeight = parseInt(e.target.value);
        document.getElementById('min-weight-val').textContent = currentMinWeight;
        renderContent();
      });
    }
  }
}

// Helper functions
function adjustPasses(tier) {
  const mul = tier === 'Top 6' ? 0.725 : 1.05; // approx average of 0.6-0.85 and 0.95-1.15
  return passingData.base_passes.map(([s, t, w]) => [s, t, Math.max(1, Math.round(w * mul))]);
}

function betweennessSimple(passes, players) {
  const names = players.map(p => p.player);
  const adj = Object.fromEntries(names.map(n => [n, {}]));
  passes.forEach(([s, t, w]) => { if (s in adj && t in adj) adj[s][t] = w; });
  
  const scores = Object.fromEntries(names.map(n => [n, 0]));
  
  names.forEach(start => {
    names.forEach(end => {
      if (start === end) return;
      const visited = new Set();
      const queue = [[start]];
      let found = null;
      
      while (queue.length && !found) {
        const path = queue.shift();
        const node = path[path.length - 1];
        if (node === end) { found = path; break; }
        if (visited.has(node)) continue;
        visited.add(node);
        Object.keys(adj[node] || {}).forEach(nb => {
          if (!visited.has(nb)) queue.push([...path, nb]);
        });
      }
      
      if (found) {
        found.slice(1, -1).forEach(n => scores[n]++);
      }
    });
  });
  
  const total = Math.max(Object.values(scores).reduce((a,b) => a+b, 0), 1);
  return Object.fromEntries(Object.entries(scores).map(([k,v]) => [k, v/total]));
}