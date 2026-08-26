import{t as e}from"./main-BBvCdV1K.js";async function t(){let t=await e(`./data/chile-geografia.json`),n=document.getElementById(`chile-geo-kpis`);n&&(n.innerHTML=`
      <div class="kpi-card">
        <span class="kpi-value">${t.total_presidents}</span>
        <span class="kpi-label">Presidentes</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-value">${t.total_census_records}</span>
        <span class="kpi-label">Registros Censales</span>
      </div>
      <div class="kpi-card">
        <span class="kpi-value">${t.total_events}</span>
        <span class="kpi-label">Eventos Históricos</span>
      </div>
    `);let r=Object.entries(t.birthplace_counts).sort((e,t)=>t[1]-e[1]).slice(0,10);Plotly.newPlot(`chile-geo-birthplace-chart`,[{x:r.map(e=>e[0]),y:r.map(e=>e[1]),type:`bar`,marker:{color:`#58a6ff`}}],{paper_bgcolor:`transparent`,plot_bgcolor:`transparent`,font:{color:`#e6edf3`},margin:{t:30,b:80,l:40,r:20},xaxis:{tickangle:-45,title:`Ciudad de nacimiento`},yaxis:{title:`Número de presidentes`},title:{text:`Presidentes por Lugar de Nacimiento`,font:{size:14}}},{responsive:!0});let i=t.events.slice(0,12);Plotly.newPlot(`chile-geo-events-chart`,[{x:i.map(e=>e.year),y:i.map(e=>e.event.substring(0,40)),type:`bar`,orientation:`h`,marker:{color:`#f0883e`}}],{paper_bgcolor:`transparent`,plot_bgcolor:`transparent`,font:{color:`#e6edf3`,size:10},margin:{t:30,b:20,l:150,r:20},yaxis:{autorange:`reversed`},title:{text:`Eventos Históricos Clave`,font:{size:14}}},{responsive:!0});let a=Object.entries(t.region_population).sort((e,t)=>t[1]-e[1]).slice(0,10);Plotly.newPlot(`chile-geo-region-chart`,[{x:a.map(e=>e[0]),y:a.map(e=>e[1]),type:`bar`,marker:{color:`#3fb950`}}],{paper_bgcolor:`transparent`,plot_bgcolor:`transparent`,font:{color:`#e6edf3`},margin:{t:30,b:80,l:40,r:20},xaxis:{tickangle:-45,title:`Región`},yaxis:{title:`Población (miles)`},title:{text:`Población por Región (Censo más reciente)`,font:{size:14}}},{responsive:!0})}export{t as initChileGeografia};