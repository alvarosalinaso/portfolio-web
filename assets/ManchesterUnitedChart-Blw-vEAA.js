import{t as e}from"./rolldown-runtime-lhHHWwHU.js";import{t}from"./main-BS6onijg.js";var n=e({initManchesterUnited:()=>s}),r={manutd:`#DA291C`,champ:`#3fb950`,accent:`#58a6ff`,warn:`#e3b341`,bad:`#f78166`,bg:`#0d1117`,card:`#161b22`,border:`#30363d`,text:`#e6edf3`,text2:`#8b949e`},i={paper_bgcolor:`rgba(0,0,0,0)`,plot_bgcolor:`rgba(22,27,34,0.6)`,font:{family:`Inter, sans-serif`,color:r.text,size:12},margin:{l:10,r:10,t:45,b:10},xaxis:{gridcolor:`#30363d`,zerolinecolor:`#30363d`},yaxis:{gridcolor:`#30363d`,zerolinecolor:`#30363d`}},a=null,o={seasons:[],managers:[],benchmarkMode:!0,showTrend:!0};async function s(){a=await t(`./data/manchester-united.json`),o.seasons=a.seasons.map(e=>e.season),o.managers=[...new Set(a.seasons.map(e=>e.manager_clean))],l(),f(),p(),u()}function c(){return a.seasons.filter(e=>o.seasons.includes(e.season)&&o.managers.includes(e.manager_clean))}function l(){let e=document.getElementById(`manutd-filters`);e&&(e.innerHTML=`
    <div class="filter-group">
      <label>Temporadas</label>
      <div class="filter-chips" style="max-height: 100px; overflow-y: auto;">
        ${o.seasons.map(e=>`
          <label class="chip ${o.seasons.includes(e)?`active`:``}">
            <input type="checkbox" value="${e}" ${o.seasons.includes(e)?`checked`:``} data-filter="season"> ${e}
          </label>
        `).join(``)}
      </div>
    </div>
    <div class="filter-group">
      <label>Entrenadores</label>
      <div class="filter-chips">
        ${o.managers.map(e=>`
          <label class="chip ${o.managers.includes(e)?`active`:``}">
            <input type="checkbox" value="${e}" ${o.managers.includes(e)?`checked`:``} data-filter="manager"> ${e}
          </label>
        `).join(``)}
      </div>
    </div>
    <div class="filter-group">
      <label class="toggle-label">
        <input type="checkbox" id="benchmark-toggle" ${o.benchmarkMode?`checked`:``} data-filter="benchmark">
        📌 Comparativa vs Campeón PL
      </label>
    </div>
    <div class="filter-group">
      <label class="toggle-label">
        <input type="checkbox" id="trend-toggle" ${o.showTrend?`checked`:``} data-filter="trend">
        📈 Línea de tendencia
      </label>
    </div>
  `)}function u(){let e=document.getElementById(`manutd-filters`);e&&e.querySelectorAll(`[data-filter]`).forEach(e=>{e.addEventListener(`change`,e=>{let t=e.target.dataset.filter,n=e.target.type===`checkbox`?e.target.value:e.target.checked;if(t===`season`||t===`manager`){let r=o[t+`s`];e.target.checked?r.push(n):r.splice(r.indexOf(n),1)}else t===`benchmark`?o.benchmarkMode=n:t===`trend`&&(o.showTrend=n);d(),f(),p()})})}function d(){document.querySelectorAll(`#manutd-filters .chip`).forEach(e=>{let t=e.querySelector(`input`);e.classList.toggle(`active`,t.checked)})}function f(){let e=c(),t=document.getElementById(`manutd-kpis`);if(!t)return;let n=e.reduce((e,t)=>e+(t.champ_pts-t.points),0),r=e.length?(n/e.length).toFixed(0):0,i=e.length?(e.reduce((e,t)=>e+t.ppg,0)/e.length).toFixed(2):0,o=a.manager_summary.reduce((e,t)=>Math.max(e,t.ppg),0).toFixed(2),s=a.totals.total_comp_fee,l=e.length?(e.reduce((e,t)=>e+t.position,0)/e.length).toFixed(1):0;t.innerHTML=`
    <div class="kpi-card"><div class="kpi-value">${e.length}</div><div class="kpi-label">Temporadas analizadas</div></div>
    <div class="kpi-card"><div class="kpi-value">${n}</div><div class="kpi-label">Puntos perdidos vs campeón</div><div class="kpi-delta down">${r} pts/temporada</div></div>
    <div class="kpi-card"><div class="kpi-value">${i}</div><div class="kpi-label">PPG promedio</div><div class="kpi-delta">${i>=o?`up`:`down`}vs ${o} (Mourinho)</div></div>
    <div class="kpi-card"><div class="kpi-value">£${s}M</div><div class="kpi-label">Coste indemnizaciones</div><div class="kpi-delta off">10 años</div></div>
    <div class="kpi-card"><div class="kpi-value">1</div><div class="kpi-label">Títulos Premier</div><div class="kpi-delta down">-9 vs Top6 líderes</div></div>
    <div class="kpi-card"><div class="kpi-value">${l}°</div><div class="kpi-label">Posición promedio PL</div></div>
  `}function p(){m(),_(),v(),b()}function m(){let e=c(),t=e.map(e=>e.season),n=[{x:t,y:e.map(e=>e.points),type:`bar`,name:`Man Utd`,marker:{color:e.map(e=>e.points),colorscale:[[0,r.bad],[.5,r.warn],[1,r.manutd]],showscale:!1},text:e.map(e=>e.points),textposition:`outside`,textfont:{size:11,color:r.text},customdata:e.map(e=>[e.manager_clean,e.season]),hovertemplate:`<b>%{customdata[1]}</b><br>Puntos: %{y}<br>DT: %{customdata[0]}<extra></extra>`}];if(o.benchmarkMode&&(n.push({x:t,y:e.map(e=>e.champ_pts),mode:`lines+markers`,name:`Campeón PL`,line:{color:r.champ,width:2.5,dash:`dash`},marker:{size:6},hovertemplate:`<b>%{x}</b><br>Campeón: %{y} pts<extra></extra>`}),n.push({x:[...t,...t.slice().reverse()],y:[...e.map(e=>e.champ_pts),...e.map(e=>e.points).slice().reverse()],fill:`toself`,fillcolor:`rgba(247,129,102,0.1)`,line:{color:`rgba(0,0,0,0)`},name:`Brecha con campeón`,showlegend:!0,hoverinfo:`skip`})),o.showTrend){let i=Array.from({length:e.length},(e,t)=>t),a=e.map(e=>e.points),o=i.length,s=i.reduce((e,t)=>e+t,0),c=a.reduce((e,t)=>e+t,0),l=i.reduce((e,t,n)=>e+t*a[n],0),u=i.reduce((e,t)=>e+t*t,0),d=(o*l-s*c)/(o*u-s*s),f=(c-d*s)/o,p=i.map(e=>d*e+f);n.push({x:t,y:p,mode:`lines`,name:`Tendencia (${d>=0?`+`:``}${d.toFixed(1)} pts/temp)`,line:{color:r.accent,width:1.5,dash:`longdash`}})}let a=e.filter(e=>e.manager_fired).map(e=>e.season),s=Object.fromEntries(t.map((e,t)=>[e,t])),l=a.map(e=>({type:`line`,x0:s[e],x1:s[e],y0:0,y1:1,yref:`paper`,line:{dash:`dot`,color:r.warn,width:1.5}})),u=a.map(e=>({x:s[e],y:1,yref:`paper`,text:`⚠ Despido`,showarrow:!1,font:{color:r.warn,size:10},yshift:-10})),d={...i,title:`Puntos por temporada — Manchester United vs Campeón de la Premier League`,height:420,barmode:`overlay`,legend:{orientation:`h`,y:-.15,x:0},shapes:l,annotations:u};Plotly.newPlot(`manutd-points-chart`,n,d,{responsive:!0,displayModeBar:!1}),h(e),g(e)}function h(e){let t=e.map(e=>e.season),n=[{x:t,y:e.map(e=>e.gf),name:`Goles a favor`,type:`bar`,marker:{color:`rgba(63,185,80,0.7)`},text:e.map(e=>e.gf),textposition:`inside`},{x:t,y:e.map(e=>-e.ga),name:`Goles en contra`,type:`bar`,marker:{color:`rgba(247,129,102,0.7)`},text:e.map(e=>e.ga),textposition:`inside`},{x:t,y:e.map(e=>e.gd),mode:`lines+markers`,name:`Diferencial`,line:{color:r.accent,width:2.5},marker:{size:6}}],a={...i,title:`Goles: a favor / en contra / diferencial`,height:320,barmode:`overlay`};Plotly.newPlot(`manutd-goals-chart`,n,a,{responsive:!0,displayModeBar:!1})}function g(e){let t=e.map(e=>e.season),n=e.map(e=>e.position<=4?r.manutd:e.position<=6?r.warn:r.bad),a=[{x:t,y:e.map(e=>e.position),type:`bar`,marker:{color:n},text:e.map(e=>e.position+`°`),textposition:`outside`,textfont:{size:11}}],o={...i,title:`Posición final en Premier League`,height:320,showlegend:!1,shapes:[{type:`line`,x0:-.5,x1:t.length-.5,y0:4,y1:4,line:{dash:`dash`,color:r.champ}}],annotations:[{x:t.length-1,y:4,text:`Champions League zone`,showarrow:!1,font:{color:r.champ,size:10},xshift:-60}],yaxis:{...i.yaxis,autorange:`reversed`,range:[.5,10.5]}};Plotly.newPlot(`manutd-position-chart`,a,o,{responsive:!0,displayModeBar:!1})}function _(){let e=a.manager_summary.sort((e,t)=>e.ppg-t.ppg),t=e.map(e=>e.ppg>=1.8?r.manutd:e.ppg>=1.6?r.warn:r.bad),n={data:[{y:e.map(e=>e.manager_clean),x:e.map(e=>e.ppg),orientation:`h`,type:`bar`,marker:{color:t,opacity:.85},text:e.map(e=>e.ppg.toFixed(3)),textposition:`outside`,textfont:{size:12}}],layout:{...i,title:`Puntos por partido (PPG) — Comparativa de gestiones`,height:360,shapes:[{type:`line`,x0:2,x1:2,y0:-.5,y1:e.length-.5,line:{dash:`dot`,color:r.champ}}],annotations:[{x:2,y:e.length-.5,text:`Elite (>2.0 ppg)`,showarrow:!1,font:{color:r.champ,size:10},xshift:40}]}};Plotly.newPlot(`manutd-mgr-bar`,n.data,n.layout,{responsive:!0,displayModeBar:!1});let o={data:[{x:e.map(e=>e.ppg),y:e.map(e=>e.avg_gf),mode:`markers+text`,type:`scatter`,text:e.map(e=>e.manager_clean),textposition:`top center`,textfont:{size:10},marker:{size:e.map(e=>e.seasons*15),color:e.map((e,t)=>t),colorscale:`Plotly`,showscale:!1,line:{color:`#0d1117`,width:1}},hovertemplate:`<b>%{text}</b><br>PPG: %{x}<br>GF/temp: %{y}<extra></extra>`}],layout:{...i,title:`PPG vs Goles a favor (tamaño = temporadas)`,height:360,showlegend:!1}};Plotly.newPlot(`manutd-mgr-scatter`,o.data,o.layout,{responsive:!0,displayModeBar:!1});let s=document.getElementById(`manutd-mgr-table`);s&&(s.innerHTML=`
      <table class="data-table">
        <thead><tr><th>Entrenador</th><th>Temporadas</th><th>Pts totales</th><th>PPG</th><th>Pos. media</th><th>GF/temp.</th><th>GA/temp.</th><th>Indemniz. (£M)</th></tr></thead>
        <tbody>
          ${a.manager_summary.sort((e,t)=>t.ppg-e.ppg).map(e=>`
            <tr>
              <td>${e.manager_clean}</td>
              <td>${e.seasons}</td>
              <td>${e.pts_total}</td>
              <td style="background: ${e.ppg>=1.8?`rgba(63,185,80,0.2)`:e.ppg>=1.6?`rgba(227,179,65,0.2)`:`rgba(247,129,102,0.2)`}"><strong>${e.ppg.toFixed(3)}</strong></td>
              <td>${e.avg_pos.toFixed(1)}</td>
              <td>${e.avg_gf.toFixed(1)}</td>
              <td>${e.avg_ga.toFixed(1)}</td>
              <td style="background: ${e.total_comp>0?`rgba(247,129,102,0.2)`:`transparent`}">${e.total_comp.toFixed(1)}</td>
            </tr>
          `).join(``)}
        </tbody>
      </table>
    `)}function v(){let e=c(),t=[`points`,`gf`,`ga`,`gd`,`wins`,`position`,`gap`],n=y(e,t),a={data:[{z:n.values,x:t,y:t,type:`heatmap`,colorscale:[[0,r.bad],[.5,`#0d1117`],[1,r.champ]],zmid:0,text:n.values.map(e=>e.map(e=>e.toFixed(2))),texttemplate:`%{text}`,textfont:{size:11},colorbar:{bgcolor:`rgba(0,0,0,0)`,tickfont:{color:`#8b949e`}}}],layout:{...i,title:`Matriz de correlaciones — variables de rendimiento`,height:400}};Plotly.newPlot(`manutd-corr-chart`,a.data,a.layout,{responsive:!0,displayModeBar:!1});let o=e.map(e=>e.season),s={data:[{x:o,y:e.map(e=>e.wins),name:`Victorias`,type:`bar`,marker:{color:r.champ,opacity:.85}},{x:o,y:e.map(e=>e.draws),name:`Empates`,type:`bar`,marker:{color:r.warn,opacity:.85}},{x:o,y:e.map(e=>e.losses),name:`Derrotas`,type:`bar`,marker:{color:r.manutd,opacity:.85}}],layout:{...i,barmode:`stack`,title:`Distribución de resultados por temporada`,height:320,legend:{orientation:`h`,y:-.2}}};Plotly.newPlot(`manutd-results-chart`,s.data,s.layout,{responsive:!0,displayModeBar:!1});let l=e.map(e=>e.gf),u=e.map(e=>e.points),d=l.length,f=l.reduce((e,t)=>e+t,0),p=u.reduce((e,t)=>e+t,0),m=l.reduce((e,t,n)=>e+t*u[n],0),h=l.reduce((e,t)=>e+t*t,0),g=u.reduce((e,t)=>e+t*t,0),_=(d*m-f*p)/(d*h-f*f),v=(p-_*f)/d,b=(d*m-f*p)/Math.sqrt((d*h-f*f)*(d*g-p*p)),x=Array.from({length:50},(e,t)=>Math.min(...l)-2+t*(Math.max(...l)-Math.min(...l)+4)/49),S=x.map(e=>_*e+v),C={data:[{x:l,y:u,mode:`markers`,type:`scatter`,marker:{size:10,color:r.manutd,opacity:.8},text:o,hovertemplate:`<b>%{text}</b><br>GF: %{x}<br>Pts: %{y}<extra></extra>`,name:`Temporadas`},{x,y:S,mode:`lines`,type:`scatter`,line:{color:r.accent,width:2,dash:`dash`},name:`Regresión (R²=${(b*b).toFixed(2)})`}],layout:{...i,title:`Regresión: Goles a Favor → Puntos`,height:320}};Plotly.newPlot(`manutd-reg-chart`,C.data,C.layout,{responsive:!0,displayModeBar:!1})}function y(e,t){let n=e.length;return{values:t.map(r=>t.map(t=>{let i=e.map(e=>e[r]),a=e.map(e=>e[t]),o=i.reduce((e,t)=>e+t,0),s=a.reduce((e,t)=>e+t,0),c=i.reduce((e,t,n)=>e+t*a[n],0),l=i.reduce((e,t)=>e+t*t,0),u=a.reduce((e,t)=>e+t*t,0);return(n*c-o*s)/Math.sqrt((n*l-o*o)*(n*u-s*s))}))}}function b(){let e=document.getElementById(`manutd-simulator`);e&&(e.innerHTML=`
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
  `,x(),S())}function x(){[`sim-ppg`,`sim-gf`,`sim-stab`].forEach(e=>{let t=document.getElementById(e);t&&t.addEventListener(`input`,S)})}function S(){let e=parseFloat(document.getElementById(`sim-ppg`).value),t=parseInt(document.getElementById(`sim-gf`).value),n=parseInt(document.getElementById(`sim-stab`).value);document.getElementById(`sim-ppg-val`).textContent=e.toFixed(2),document.getElementById(`sim-gf-val`).textContent=t,document.getElementById(`sim-stab-val`).textContent=n;let a=Math.round(e*38),o=Math.max(0,89-a),s=Math.max(1,Math.min(20,Math.round(10-(a-58)/4))),c=a>=71?`Champions League ✅`:a>=60?`Europa League ⚠️`:`Nada 🔴`,l=document.getElementById(`manutd-sim-results`);l&&(l.innerHTML=`
      <div class="sim-metric"><div class="sim-value">${a}</div><div class="sim-label">Puntos proyectados</div><div class="sim-delta">${a-64>0?`+`:``}${a-64} vs baseline</div></div>
      <div class="sim-metric"><div class="sim-value">${s}°</div><div class="sim-label">Posición estimada</div></div>
      <div class="sim-metric"><div class="sim-value">${o}</div><div class="sim-label">Brecha vs campeón</div></div>
      <div class="sim-metric"><div class="sim-value">${c}</div><div class="sim-label">Clasificación europea</div></div>
    `);let u={data:[{type:`indicator`,mode:`gauge+number+delta`,value:e,delta:{reference:1.64,valueformat:`.2f`},title:{text:`PPG vs Media Histórica ManUtd (1.64)`,font:{size:14}},gauge:{axis:{range:[1,2.3],tickcolor:`#8b949e`},bar:{color:r.manutd},steps:[{range:[1,1.5],color:`rgba(247,129,102,0.3)`},{range:[1.5,1.8],color:`rgba(227,179,65,0.3)`},{range:[1.8,2.3],color:`rgba(63,185,80,0.3)`}],threshold:{line:{color:r.champ,width:2},value:2},bgcolor:`rgba(22,27,34,0.8)`},number:{font:{color:r.text,family:`Inter`},valueformat:`.2f`}}],layout:{...i,height:300,margin:{t:60,b:10,l:10,r:10}}};Plotly.newPlot(`manutd-gauge-chart`,u.data,u.layout,{responsive:!0,displayModeBar:!1})}export{s as n,n as t};