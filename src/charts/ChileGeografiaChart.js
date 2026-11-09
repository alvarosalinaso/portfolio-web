import { loadJSON } from '../main.js';

export async function initChileGeografia() {
  const data = await loadJSON('./data/chile-geografia.json');
  
  const kpiContainer = document.getElementById('chile-geo-kpis');
  if (kpiContainer) {
    kpiContainer.innerHTML = `
      <div class="kpi-card">
        <span class="kpi-value">${data.total_presidents}</span>
        <span class="kpi-label">Presidentes (BCN)</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-value">${data.total_census_records}</span>
        <span class="kpi-label">Registros censales (${data.census_years?.[0]}–${data.census_years?.slice(-1)})</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-value">${data.total_events}</span>
        <span class="kpi-label">Eventos históricos</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-value">${data.census_national?.slice(-1)[0]?.population?.toLocaleString('es-CL')}</span>
        <span class="kpi-label">Población 2017 (INE)</span>
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
    marker: { color: '#3fb950' },
    text: regions.map(r => r[1].toLocaleString('es-CL')),
    textposition: 'outside',
    textfont: { size: 10, color: '#e6edf3' },
    hovertemplate: '<b>%{x}</b><br>Población: %{y:,.0f} personas<extra></extra>'
  }], {
    paper_bgcolor: 'transparent',
    plot_bgcolor: 'transparent',
    font: { color: '#e6edf3' },
    margin: { t: 30, b: 80, l: 60, r: 20 },
    xaxis: { tickangle: -45, title: 'Región' },
    yaxis: { title: 'Personas (Censo 2017, INE)' },
    title: { text: 'Población por Región (Censo 2017, personas exactas INE)', font: { size: 14 } }
  }, { responsive: true });
}
