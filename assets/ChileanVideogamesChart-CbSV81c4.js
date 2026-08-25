import{t as e}from"./rolldown-runtime-lhHHWwHU.js";import{t}from"./main-2avnwFrq.js";var n=e({initChileanVideogames:()=>o}),r={steam:`#66c0f4`,itch:`#fa5c5c`,accent:`#58a6ff`,green:`#3fb950`,orange:`#d29922`,purple:`#bc8cff`,bg:`#0d1117`,text:`#e6edf3`,text2:`#8b949e`,card:`#161b22`,border:`#30363d`},i={paper_bgcolor:`rgba(0,0,0,0)`,plot_bgcolor:`rgba(22,27,34,0.6)`,font:{family:`Inter, sans-serif`,color:r.text,size:12},margin:{l:50,r:20,t:50,b:60},xaxis:{gridcolor:`#30363d`,zerolinecolor:`#30363d`},yaxis:{gridcolor:`#30363d`,zerolinecolor:`#30363d`}},a=null;async function o(){try{a=await t(`./data/chilean-videogames.json`)}catch{a={games:[],genre_stats:[],year_platform:[]}}s(),c(),l(),u(),d()}function s(){let e=document.getElementById(`chilean-kpis`);if(!e)return;let t=a.games||[],n=t.length,r=t.filter(e=>e.platform===`Steam`).length,i=t.filter(e=>e.platform===`Itch.io`).length,o=t.reduce((e,t)=>e+(t.revenue_est||0),0),s=t.length?t.reduce((e,t)=>e+(t.price||0),0)/n:0;e.innerHTML=`
    <div class="kpi-card"><div class="kpi-value">${n}</div><div class="kpi-label">Juegos analizados</div></div>
    <div class="kpi-card"><div class="kpi-value">${r} / ${i}</div><div class="kpi-label">Steam / Itch.io</div></div>
    <div class="kpi-card"><div class="kpi-value">$${o>1e6?(o/1e6).toFixed(1)+`M`:Math.round(o).toLocaleString()}</div><div class="kpi-label">Revenue total est. (USD)</div></div>
    <div class="kpi-card"><div class="kpi-value">$${Math.round(s).toLocaleString()}</div><div class="kpi-label">Precio promedio (CLP)</div></div>
  `}function c(){let e=document.getElementById(`chilean-genre-chart`);if(!e)return;let t=a.genre_stats||[];if(!t.length){e.innerHTML=`<p style="color:#8b949e;text-align:center">Sin datos</p>`;return}let n=t.slice(0,10),o={y:n.map(e=>e.genre),x:n.map(e=>e.count),type:`bar`,orientation:`h`,marker:{color:n.map((e,t)=>{let n=[r.accent,r.green,r.orange,r.purple,r.steam,r.itch,`#f0883e`,`#a371f7`,`#3fb950`,`#58a6ff`];return n[t%n.length]}),line:{width:0}},text:n.map(e=>`${e.count} juegos`),textposition:`outside`,textfont:{color:r.text,size:11},hovertemplate:`<b>%{y}</b><br>%{x} juegos<extra></extra>`};Plotly.newPlot(e,[o],{...i,title:{text:`Juegos por Género (Top 10)`,font:{size:14,color:r.text}},xaxis:{...i.xaxis,title:`Cantidad`},yaxis:{...i.yaxis,automargin:!0,categoryorder:`total ascending`},showlegend:!1,margin:{...i.margin,l:130}},{responsive:!0,displayModeBar:!1})}function l(){let e=document.getElementById(`chilean-platform-chart`);if(!e)return;let t=a.games||[],n={labels:[`Steam`,`Itch.io`],values:[t.filter(e=>e.platform===`Steam`).length,t.filter(e=>e.platform===`Itch.io`).length],type:`pie`,hole:.5,marker:{colors:[r.steam,r.itch]},textinfo:`label+percent`,textfont:{color:r.text,size:12},hovertemplate:`<b>%{label}</b><br>%{value} juegos (%{percent})<extra></extra>`};Plotly.newPlot(e,[n],{...i,title:{text:`Distribución por Plataforma`,font:{size:14,color:r.text}},showlegend:!1,annotations:[{text:`${t.length}<br>total`,showarrow:!1,font:{size:16,color:r.text}}]},{responsive:!0,displayModeBar:!1})}function u(){let e=document.getElementById(`chilean-year-chart`);if(!e)return;let t=a.year_platform||[];if(!t.length){e.innerHTML=`<p style="color:#8b949e;text-align:center">Sin datos</p>`;return}let n=[...new Set(t.map(e=>e.year))].sort(),o=n.map(e=>{let n=t.find(t=>t.year===e&&t.platform===`Steam`);return n?n.count:0}),s=n.map(e=>{let n=t.find(t=>t.year===e&&t.platform===`Itch.io`);return n?n.count:0}),c={x:n,y:o,name:`Steam`,type:`bar`,marker:{color:r.steam,line:{width:0}},hovertemplate:`<b>Steam %{x}</b><br>%{y} juegos<extra></extra>`},l={x:n,y:s,name:`Itch.io`,type:`bar`,marker:{color:r.itch,line:{width:0}},hovertemplate:`<b>Itch.io %{x}</b><br>%{y} juegos<extra></extra>`};Plotly.newPlot(e,[c,l],{...i,title:{text:`Lanzamientos por Año`,font:{size:14,color:r.text}},barmode:`stack`,xaxis:{...i.xaxis,title:`Año`,dtick:1},yaxis:{...i.yaxis,title:`Juegos`},showlegend:!0,legend:{font:{color:r.text},bgcolor:`rgba(0,0,0,0)`}},{responsive:!0,displayModeBar:!1})}function d(){let e=document.getElementById(`chilean-top-games`);e&&(e.innerHTML=`
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
        ${[...a.games||[]].sort((e,t)=>(t.revenue_est||0)-(e.revenue_est||0)).slice(0,10).map((e,t)=>`
          <tr style="border-bottom:1px solid #21262d">
            <td style="padding:8px;color:#8b949e">${t+1}</td>
            <td style="padding:8px;font-weight:600">${e.name}</td>
            <td style="padding:8px"><span style="color:${e.platform===`Steam`?r.steam:r.itch}">${e.platform}</span></td>
            <td style="padding:8px;color:#8b949e">${e.genre}</td>
            <td style="padding:8px;text-align:right">${e.year}</td>
            <td style="padding:8px;text-align:right;font-weight:600">$${(e.revenue_est||0)>1e3?((e.revenue_est||0)/1e3).toFixed(1)+`K`:Math.round(e.revenue_est||0)}</td>
          </tr>
        `).join(``)}
      </tbody>
    </table>
  `)}export{o as n,n as t};