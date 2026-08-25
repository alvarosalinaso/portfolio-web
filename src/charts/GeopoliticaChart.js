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
    geoData = generateSyntheticData();
  }
  renderNERChart();
  renderSentimentChart();
  renderTimelineChart();
  renderKPIs();
}

function generateSyntheticData() {
  const presidents = [
    'Pinto', 'Balmaceda', 'Alessandri', 'Ibáñez', 'Alessandri',
    'Aguirre Cerda', 'González Videla', 'Alessandri', 'Frei', 'Allende',
    'Pinochet', 'Aylwin', 'Frei Ruiz-Tagle', 'Lagos', 'Bachelet',
    'Piñera', 'Boric'
  ];
  const entities = [
    'Chile', 'Estados Unidos', 'Argentina', 'Perú', 'Bolivia',
    'Europa', 'Inglaterra', 'Francia', 'España', 'Brasil'
  ];
  const sentiments = presidents.map(() => ({
    value: (Math.random() * 2 - 1).toFixed(3),
    magnitude: (Math.random() * 1.5 + 0.2).toFixed(3)
  }));
  return {
    presidents,
    entities,
    ner_counts: entities.map(() => Math.floor(Math.random() * 200 + 50)),
    entity_types: ['LOC', 'PERSON', 'ORG', 'GPE', 'NORP'],
    entity_type_counts: [45, 32, 18, 25, 12],
    sentiments,
    timeline: presidents.map((p, i) => ({ president: p, year: 1833 + i * 12, sentiment: parseFloat(sentiments[i].value) })),
    total_speeches: 39,
    total_entities: 1520,
    avg_sentiment: 0.12,
    coverage_years: '1881-2010'
  };
}

function renderKPIs() {
  const container = document.getElementById('geo-kpis');
  if (!container) return;
  container.innerHTML = `
    <div class="kpi-card"><div class="kpi-label">Discursos Analizados</div><div class="kpi-value">${geoData.total_speeches}</div></div>
    <div class="kpi-card"><div class="kpi-label">Entidades NER Detectadas</div><div class="kpi-value">${geoData.total_entities.toLocaleString()}</div></div>
    <div class="kpi-card"><div class="kpi-label">Sentimiento Promedio</div><div class="kpi-value ${geoData.avg_sentiment > 0 ? 'positive' : 'negative'}">${geoData.avg_sentiment > 0 ? '+' : ''}${geoData.avg_sentiment}</div></div>
    <div class="kpi-card"><div class="kpi-label">Cobertura Temporal</div><div class="kpi-value">${geoData.coverage_years}</div></div>
  `;
}

function renderNERChart() {
  const el = document.getElementById('geo-ner-chart');
  if (!el) return;

  const trace = {
    x: geoData.entities,
    y: geoData.ner_counts,
    type: 'bar',
    marker: {
      color: geoData.entities.map((_, i) => {
        const colors = [COLORS.accent, COLORS.green, COLORS.orange, COLORS.purple, COLORS.red];
        return colors[i % colors.length];
      }),
      line: { width: 0 }
    },
    text: geoData.ner_counts.map(v => v.toLocaleString()),
    textposition: 'outside',
    textfont: { color: COLORS.text, size: 11 },
    hovertemplate: '<b>%{x}</b><br>Menciones: %{y}<extra></extra>'
  };

  const layout = {
    ...PLOTLY_THEME,
    title: { text: 'Distribución de Entidades Nombradas (NER)', font: { size: 14, color: COLORS.text } },
    xaxis: { ...PLOTLY_THEME.xaxis, title: 'Entidad' },
    yaxis: { ...PLOTLY_THEME.yaxis, title: 'Frecuencia' },
    showlegend: false
  };

  Plotly.newPlot(el, [trace], layout, { responsive: true, displayModeBar: false });
}

function renderSentimentChart() {
  const el = document.getElementById('geo-sentiment-chart');
  if (!el) return;

  const trace = {
    x: geoData.timeline.map(t => t.president),
    y: geoData.timeline.map(t => t.sentiment),
    type: 'bar',
    marker: {
      color: geoData.timeline.map(t => t.sentiment >= 0 ? COLORS.green : COLORS.red),
      line: { width: 0 }
    },
    hovertemplate: '<b>%{x}</b><br>Sentimiento: %{y:.3f}<extra></extra>'
  };

  const layout = {
    ...PLOTLY_THEME,
    title: { text: 'Sentimiento por Presidente (1881-2010)', font: { size: 14, color: COLORS.text } },
    xaxis: { ...PLOTLY_THEME.xaxis, tickangle: -45 },
    yaxis: { ...PLOTLY_THEME.yaxis, title: 'Sentimiento', zeroline: true, zerolinecolor: '#58a6ff', zerolinewidth: 1 },
    showlegend: false,
    shapes: [{
      type: 'line', x0: -0.5, x1: geoData.timeline.length - 0.5,
      y0: 0, y1: 0, line: { color: '#58a6ff', width: 1, dash: 'dot' }
    }]
  };

  Plotly.newPlot(el, [trace], layout, { responsive: true, displayModeBar: false });
}

function renderTimelineChart() {
  const el = document.getElementById('geo-timeline-chart');
  if (!el) return;

  const trace = {
    x: geoData.timeline.map(t => t.year),
    y: geoData.timeline.map(t => t.sentiment),
    text: geoData.timeline.map(t => t.president),
    type: 'scatter',
    mode: 'lines+markers+text',
    textposition: 'top center',
    textfont: { size: 10, color: COLORS.text2 },
    line: { color: COLORS.accent, width: 2 },
    marker: {
      size: 10,
      color: geoData.timeline.map(t => t.sentiment >= 0 ? COLORS.green : COLORS.red),
      line: { color: COLORS.text, width: 1 }
    },
    hovertemplate: '<b>%{text}</b><br>Año: %{x}<br>Sentimiento: %{y:.3f}<extra></extra>'
  };

  const layout = {
    ...PLOTLY_THEME,
    title: { text: 'Evolución Temporal del Sentimiento Político', font: { size: 14, color: COLORS.text } },
    xaxis: { ...PLOTLY_THEME.xaxis, title: 'Año' },
    yaxis: { ...PLOTLY_THEME.yaxis, title: 'Sentimiento' },
    showlegend: false
  };

  Plotly.newPlot(el, [trace], layout, { responsive: true, displayModeBar: false });
}

window.initGeopolitica = initGeopolitica;
