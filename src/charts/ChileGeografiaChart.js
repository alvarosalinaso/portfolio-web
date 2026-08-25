import { loadJSON } from '../main.js';

export async function initChileGeografia() {
  const data = await loadJSON('./data/chile-geografia.json');
  
  const kpiContainer = document.getElementById('chile-geo-kpis');
  if (kpiContainer) {
    kpiContainer.innerHTML = `
      <div class="kpi-card">
        <span class="kpi-value">${data.total_presidents}</span>
        <span class="kpi-label">Presidentes</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-value">${data.total_census_records}</span>
        <span class="kpi-label">Registros Censales</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-value">${data.total_events}</span>
        <span class="kpi-label">Eventos Históricos</span>
      </div>
    `;
  }

  const birthplaces = Object.entries(data.birthplace_counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  Plotly.newPlot('chile-geo-birthplace-chart', [{
    x: birthplaces.map(b => b[0]),
    y: birthplaces.map(b => b[1]),
    type: 'bar',
    marker: { color: '#58a6ff' }
  }], {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#e6edf3' },
    margin: { t: 30, b: 80, l: 40, r: 20 },
    xaxis: { tickangle: -45, title: 'Ciudad de nacimiento' },
    yaxis: { title: 'Número de presidentes' },
    title: { text: 'Presidentes por Lugar de Nacimiento', font: { size: 14 } }
  }, { responsive: true });

  const events = data.events.slice(0, 12);
  Plotly.newPlot('chile-geo-events-chart', [{
    x: events.map(e => e.year),
    y: events.map(e => e.event.substring(0, 40)),
    type: 'bar',
    orientation: 'h',
    marker: { color: '#f0883e' }
  }], {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#e6edf3', size: 10 },
    margin: { t: 30, b: 20, l: 150, r: 20 },
    yaxis: { autorange: 'reversed' },
    title: { text: 'Eventos Históricos Clave', font: { size: 14 } }
  }, { responsive: true });

  const regions = Object.entries(data.region_population)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  Plotly.newPlot('chile-geo-region-chart', [{
    x: regions.map(r => r[0]),
    y: regions.map(r => r[1]),
    type: 'bar',
    marker: { color: '#3fb950' }
  }], {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#e6edf3' },
    margin: { t: 30, b: 80, l: 40, r: 20 },
    xaxis: { tickangle: -45, title: 'Región' },
    yaxis: { title: 'Población (miles)' },
    title: { text: 'Población por Región (Censo más reciente)', font: { size: 14 } }
  }, { responsive: true });
}
