import{t as e}from"./rolldown-runtime-lhHHWwHU.js";import{t}from"./main-BBvCdV1K.js";var n=e({initUnitedPassing:()=>f}),r={bg:`#0F1117`,surface:`#1A1D24`,border:`#2A2D35`,text1:`#F0F2F6`,text2:`#9BA3B0`,red:`#DA291C`,yellow:`#FBE122`,gold:`#F59E0B`,blue:`#4F8BF9`,green:`#3FB950`},i={paper_bgcolor:`rgba(0,0,0,0)`,plot_bgcolor:`rgba(26,29,36,0.6)`,font:{family:`Inter, system-ui`,color:r.text1,size:12}},a=null,o=`network`,s=`Resto PL`,c=5,l=[`CDM`,`CM`,`CAM`,`RW`,`ST`],u=`xT`,d=`prog`;async function f(){a=await t(`./data/passing.json`),p(),w(),m(),T()}function p(){let e=document.getElementById(`passing-view-selector`);e&&(e.innerHTML=`
    <div class="view-tabs">
      <button class="view-tab ${o===`network`?`active`:``}" data-view="network">🗺️ Red de Pases</button>
      <button class="view-tab ${o===`individual`?`active`:``}" data-view="individual">📐 Comparativa Individual</button>
      <button class="view-tab ${o===`benchmark`?`active`:``}" data-view="benchmark">⚖️ Benchmark vs Premier League</button>
      <button class="view-tab ${o===`tier`?`active`:``}" data-view="tier">🔄 Resto PL vs Top 6</button>
    </div>
    <div id="passing-view-controls"></div>
  `,e.querySelectorAll(`[data-view]`).forEach(e=>{e.addEventListener(`click`,e=>{o=e.target.dataset.view,p(),m(),T()})}))}function m(){let e=document.getElementById(`passing-content`);if(e)switch(o){case`network`:h(e);break;case`individual`:v(e);break;case`benchmark`:x(e);break;case`tier`:C(e);break}}function h(e){let t=E(s).filter(([,,e])=>e>=c),n=D(t,a.squad),r=a.squad.reduce((e,n)=>(e[n.player]=t.filter(([e])=>e===n.player).reduce((e,[,,t])=>e+t,0),e),{}),i=a.squad.reduce((e,n)=>(e[n.player]=t.filter(([,e])=>e===n.player).reduce((e,[,,t])=>e+t,0),e),{}),o=Object.entries(n).reduce((e,[t,n])=>n>e[1]?[t,n]:e,[`N/A`,0])[0];e.innerHTML=`
    <div class="section-header">Visualización de la Red de Pases</div>
    <div class="desc-box" style="border-left-color: var(--blue);">
      <strong>Interpretación:</strong> Cada <strong>círculo</strong> representa un jugador. Su <strong>tamaño</strong> indica
      la betweenness centrality (qué tan crítico es en la circulación). A mayor tamaño, más rutas de pase pasan por él.
      Las <strong>líneas</strong> conectan jugadores que se combinan frecuentemente; más gruesas = mayor volumen de pases.
    </div>
    <div id="passing-network-chart"></div>
    <div class="section-header">Tabla de Centralidad — Jugadores</div>
    <div id="passing-centrality-table"></div>
  `,g(t,n,r,i,o),_(n,r,i)}function g(e,t,n,i,o){let l=Object.fromEntries(a.squad.map(e=>[e.player,[e.x,e.y]])),u=Math.max(...e.map(([,,e])=>e),1),d=e.map(([e,t,n])=>{let[r,i]=l[e],[a,o]=l[t],s=.15+n/u*.7,c=.8+n/u*7;return{x:[r,a,null],y:[i,o,null],mode:`lines`,line:{width:c,color:`rgba(79,139,249,${s.toFixed(2)})`},hoverinfo:`none`,showlegend:!1}}),f=a.squad.map(e=>14+Math.max(t[e.player]||0,0)*85),p=a.squad.map(e=>t[e.player]||0),m={x:a.squad.map(e=>l[e.player][0]),y:a.squad.map(e=>l[e.player][1]),mode:`markers+text`,text:a.squad.map(e=>e.player),textposition:`top center`,hovertext:a.squad.map(e=>`<b>${e.player}</b> (${e.pos})<br>Betweenness: ${(t[e.player]||0).toFixed(3)}<br>Pases salientes: ${n[e.player]||0}<br>Precisión: ${a.stats[e.player].pass_acc}%<br>xT: ${a.stats[e.player].xT}`),hoverinfo:`text`,textfont:{size:10,color:r.text1},marker:{size:f,color:p,colorscale:[[0,r.blue],[.5,r.red],[1,r.yellow]],colorbar:{title:`Betweenness`,thickness:10,len:.55,x:1.01,tickfont:{color:r.text2}},line:{width:2,color:r.surface}},showlegend:!1},h={plot_bgcolor:r.surface,paper_bgcolor:`rgba(0,0,0,0)`,xaxis:{showgrid:!1,zeroline:!1,showticklabels:!1,range:[-5,110]},yaxis:{showgrid:!1,zeroline:!1,showticklabels:!1,range:[-5,73]},height:560,font:{family:`Inter`},title:`Conexiones con ≥${c} pases — vs ${s}`,shapes:[{type:`rect`,x0:0,y0:0,x1:100,y1:68,line:{color:`rgba(79,139,249,.25)`,width:1.5}},{type:`rect`,x0:0,y0:13.84,x1:16.5,y1:54.16,line:{color:`rgba(79,139,249,.15)`,width:1}},{type:`rect`,x0:83.5,y0:13.84,x1:100,y1:54.16,line:{color:`rgba(79,139,249,.15)`,width:1}},{type:`circle`,x0:44,y0:28,x1:56,y1:40,line:{color:`rgba(79,139,249,.15)`,width:1}},{type:`line`,x0:50,y0:0,x1:50,y1:68,line:{color:`rgba(79,139,249,.10)`,width:1}}]};Plotly.newPlot(`passing-network-chart`,[...d,m],h,{responsive:!0,displayModeBar:!1})}function _(e,t,n){let r=document.getElementById(`passing-centrality-table`);if(!r)return;let i=a.squad.map(r=>({Jugador:r.player,Pos:r.pos,Betweenness:(e[r.player]||0).toFixed(4),"Pases salientes":t[r.player]||0,"Pases recibidos":n[r.player]||0,"Pass acc %":a.stats[r.player].pass_acc,xT:a.stats[r.player].xT})).sort((e,t)=>t.Betweenness-e.Betweenness);r.innerHTML=`
    <table class="data-table">
      <thead><tr>${Object.keys(i[0]).map(e=>`<th>${e}</th>`).join(``)}</tr></thead>
      <tbody>
        ${i.map(e=>`<tr>${Object.values(e).map(e=>`<td>${e}</td>`).join(``)}</tr>`).join(``)}
      </tbody>
    </table>
  `}function v(e){let t=a.squad.map(e=>({player:e.player,pos:e.pos,...a.stats[e.player]})).filter(e=>l.includes(e.pos)),n={pass_acc:`Precisión pase %`,prog:`Pases progresivos/90`,xT:`xT generado`,vert:`Verticalidad (0–1)`},r=t.map(e=>Math.max(a.stats[e.player].pass_acc,0)*1.5);e.innerHTML=`
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
          ${[`GK`,`RB`,`LB`,`CB`,`CDM`,`CM`,`CAM`,`RW`,`ST`].map(e=>`
            <label class="chip ${l.includes(e)?`active`:``}">
              <input type="checkbox" value="${e}" ${l.includes(e)?`checked`:``} data-pos-filter> ${e}
            </label>
          `).join(``)}
        </div>
      </div>
      <div class="control-group">
        <label>Eje X</label>
        <select id="ex-select">${Object.entries(n).map(([e,t])=>`<option value="${e}" ${u===e?`selected`:``}>${t}</option>`).join(``)}</select>
      </div>
      <div class="control-group">
        <label>Eje Y</label>
        <select id="ey-select">${Object.entries(n).map(([e,t])=>`<option value="${e}" ${d===e?`selected`:``}>${t}</option>`).join(``)}</select>
      </div>
    </div>
    <div id="passing-individual-chart"></div>
  `,y(t,n,r),b()}function y(e,t,n){if(e.length===0){document.getElementById(`passing-individual-chart`).innerHTML=`<div class="desc-box" style="border-left-color: var(--warn);">Selecciona al menos una posición para ver el gráfico.</div>`;return}let a={data:[{x:e.map(e=>e[u]),y:e.map(e=>e[d]),mode:`markers+text`,type:`scatter`,text:e.map(e=>e.player),textposition:`top center`,marker:{size:n,color:e.map(e=>e.pos),colorscale:`Vivid`,showscale:!1,line:{width:1,color:r.surface},sizemode:`diameter`},hovertemplate:`<b>%{text}</b><br>`+t[u]+`: %{x}<br>`+t[d]+`: %{y}<extra></extra>`}],layout:{...i,title:`${t[u]} vs ${t[d]}`,height:460,legend:{orientation:`h`,y:-.2},shapes:[{type:`line`,x0:Math.min(...e.map(e=>e[u])),x1:Math.max(...e.map(e=>e[u])),y0:e.reduce((e,t)=>e+t[d],0)/e.length,y1:e.reduce((e,t)=>e+t[d],0)/e.length,line:{dash:`dot`,color:r.text2},xref:`x`,yref:`y`},{type:`line`,x0:e.reduce((e,t)=>e+t[u],0)/e.length,x1:e.reduce((e,t)=>e+t[u],0)/e.length,y0:Math.min(...e.map(e=>e[d])),y1:Math.max(...e.map(e=>e[d])),line:{dash:`dot`,color:r.text2},xref:`x`,yref:`y`}]}};Plotly.newPlot(`passing-individual-chart`,a.data,a.layout,{responsive:!0,displayModeBar:!1})}function b(){document.querySelectorAll(`[data-pos-filter]`).forEach(e=>{e.addEventListener(`change`,e=>{let t=e.target.value;e.target.checked?l.push(t):l.splice(l.indexOf(t),1),p(),m(),T()})});let e=document.getElementById(`ex-select`),t=document.getElementById(`ey-select`);e&&e.addEventListener(`change`,e=>{u=e.target.value,m(),T()}),t&&t.addEventListener(`change`,e=>{d=e.target.value,m(),T()})}function x(e){let t=Object.entries(a.pl_benchmark).map(([e,t])=>({equipo:e,...t}));e.innerHTML=`
    <div class="section-header">Benchmarking — Manchester United vs Premier League</div>
    <div class="desc-box">
      <strong>Interpretación:</strong> Ranking del Manchester United (en <strong>rojo</strong>) frente al resto de la
      Premier League. Seleccioná la métrica a comparar: posesión, precisión de pase, pases progresivos o xT.
    </div>
    <div class="control-group">
      <label>Métrica</label>
      <select id="pl-metric-select">
        <option value="pass_acc" ${u===`pass_acc`?`selected`:``}>Precisión pase %</option>
        <option value="prog" ${u===`prog`?`selected`:``}>Pases progresivos/partido</option>
        <option value="xT" ${u===`xT`?`selected`:``}>xT generado/partido</option>
        <option value="poss" ${u===`poss`?`selected`:``}>Posesión %</option>
      </select>
    </div>
    <div id="passing-benchmark-chart"></div>
    <div id="passing-benchmark-info"></div>
  `,S(t),document.getElementById(`pl-metric-select`).addEventListener(`change`,e=>{u=e.target.value,S(t)})}function S(e){let t={pass_acc:`Precisión pase %`,prog:`Pases prog./partido`,xT:`xT/partido`,poss:`Posesión %`},n=[...e].sort((e,t)=>e[u]-t[u]),o={data:[{x:n.map(e=>e[u]),y:n.map(e=>e.equipo),orientation:`h`,type:`bar`,marker:{color:n.map(e=>e.equipo===`Man United`?r.red:r.border)},text:n.map(e=>e[u].toFixed(1)),textposition:`outside`,textfont:{size:11,color:r.text1}}],layout:{...i,title:`Premier League — ${t[u]}`,height:420}};Plotly.newPlot(`passing-benchmark-chart`,o.data,o.layout,{responsive:!0,displayModeBar:!1});let s=a.pl_benchmark[`Man United`],c=Object.values(a.pl_benchmark).filter(e=>e!==s),l=c.reduce((e,t)=>e+t.pass_acc,0)/c.length,d=c.reduce((e,t)=>e+t.xT,0)/c.length;document.getElementById(`passing-benchmark-info`).innerHTML=`
    <div class="insight-card">
      Man United — Precisión: <strong>${s.pass_acc}%</strong> vs promedio PL <strong>${l.toFixed(1)}%</strong> | 
      xT: <strong>${s.xT}</strong> vs promedio <strong>${d.toFixed(2)}</strong>
    </div>
  `}function C(e){let t=Object.values(a.stats).reduce((e,t)=>e+t.pass_acc,0)/Object.keys(a.stats).length,n=[`Resto PL`,`Top 6`].map(e=>{let n=E(e),r=e===`Resto PL`?0:-4.2;return{Rival:e,"Pases totales":n.reduce((e,[,,t])=>e+t,0),"Precisión media %":(t+r).toFixed(1),"xT total":(Object.values(a.stats).reduce((e,t)=>e+t.xT,0)*(e===`Resto PL`?1:.78)).toFixed(2)}});e.innerHTML=`
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
  `,[`Pases totales`,`Precisión media %`,`xT total`].forEach((e,t)=>{let a={data:[{x:n.map(e=>e.Rival),y:n.map(t=>t[e]),type:`bar`,marker:{color:[r.red,r.gold]},text:n.map(t=>parseFloat(t[e]).toFixed(1)),textposition:`outside`,textfont:{color:r.text1,size:13}}],layout:{...i,title:e,height:300,margin:{t:40,b:20,l:10,r:10}}};Plotly.newPlot(`passing-tier-${e.toLowerCase().replace(/\s+/g,`-`).replace(`%`,`pct`)}`,a.data,a.layout,{responsive:!0,displayModeBar:!1})});let o=D(E(s),a.squad),c=Object.entries(o).reduce((e,[t,n])=>n>e[1]?[t,n]:e,[`N/A`,0])[0];document.getElementById(`passing-tier-insight`).innerHTML=`
    <div class="insight-card warning">
      Contra el <strong>Top 6</strong>, United reduce su precisión de pase ~4pp y su xT generado cae un <strong>22%</strong>. 
      ${c===`N/A`?``:`<strong>${c}</strong> (Betweenness: ${o[c].toFixed(3)}) es el jugador cuya neutralización más interrumpe el flujo ofensivo.`}
    </div>
  `}function w(){let e=E(s),t=D(e,a.squad),n=Object.entries(t).reduce((e,[t,n])=>n>e[1]?[t,n]:e,[`N/A`,0])[0],r=Object.values(a.stats).reduce((e,t)=>e+t.pass_acc,0)/Object.keys(a.stats).length,i=Object.entries(a.stats).reduce((e,[t,n])=>n.xT>e[1].xT?[t,n]:e,[``,{xT:0}])[0],o=document.getElementById(`passing-kpis`);o&&(o.innerHTML=`
    <div class="kpi-card"><div class="kpi-value">${e.reduce((e,[,,t])=>e+t,0)}</div><div class="kpi-label">Pases totales en muestra</div></div>
    <div class="kpi-card"><div class="kpi-value">${r.toFixed(1)}%</div><div class="kpi-label">Precisión pase promedio</div></div>
    <div class="kpi-card"><div class="kpi-value">${n}</div><div class="kpi-label">Broker táctico (betweenness)</div></div>
    <div class="kpi-card"><div class="kpi-value">${i}</div><div class="kpi-label">Mayor xT generado</div></div>
  `)}function T(){if(o===`network`){document.querySelectorAll(`input[name="tier-radio"]`).forEach(e=>e.addEventListener(`change`,e=>{s=e.target.value,w(),m()}));let e=document.getElementById(`min-weight-slider`);e&&e.addEventListener(`input`,e=>{c=parseInt(e.target.value),document.getElementById(`min-weight-val`).textContent=c,m()})}}function E(e){let t=e===`Top 6`?.725:1.05;return a.base_passes.map(([e,n,r])=>[e,n,Math.max(1,Math.round(r*t))])}function D(e,t){let n=t.map(e=>e.player),r=Object.fromEntries(n.map(e=>[e,{}]));e.forEach(([e,t,n])=>{e in r&&t in r&&(r[e][t]=n)});let i=Object.fromEntries(n.map(e=>[e,0]));n.forEach(e=>{n.forEach(t=>{if(e===t)return;let n=new Set,a=[[e]],o=null;for(;a.length&&!o;){let e=a.shift(),i=e[e.length-1];if(i===t){o=e;break}n.has(i)||(n.add(i),Object.keys(r[i]||{}).forEach(t=>{n.has(t)||a.push([...e,t])}))}o&&o.slice(1,-1).forEach(e=>i[e]++)})});let a=Math.max(Object.values(i).reduce((e,t)=>e+t,0),1);return Object.fromEntries(Object.entries(i).map(([e,t])=>[e,t/a]))}export{f as n,n as t};