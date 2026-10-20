import './style.css';
import { initChileanVideogames } from './src/charts/ChileanVideogamesChart.js';
import { initManchesterUnited } from './src/charts/ManchesterUnitedChart.js';
import { initGeopolitica } from './src/charts/GeopoliticaChart.js';
import { initWorldCup } from './src/charts/WorldCupChart.js';
import { initChileGeografia } from './src/charts/ChileGeografiaChart.js';

document.addEventListener("DOMContentLoaded", () => {
  console.log("Sistema de Decisiones e Inteligencia de Datos Inicializado.");

  // ==========================================
  // TAB NAVIGATION ENGINE
  // ==========================================
  const tabBtns = document.querySelectorAll(".tab-btn");
  const tabContents = document.querySelectorAll(".tab-content");

  tabBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      // Remove active class from all buttons and contents
      tabBtns.forEach(b => b.classList.remove("active"));
      tabContents.forEach(c => c.classList.remove("active"));

      // Add active class to clicked button
      btn.classList.add("active");

      // Show the targeted content
      const tabId = btn.getAttribute("data-tab");
      const targetContent = document.getElementById(tabId);
      if (targetContent) {
        targetContent.classList.add("active");
        
        // Trigger specific tab activation tasks
        if (tabId === "tactical-cna-tab") {
          initTacticalGraph();
        }
        if (tabId === "chilean-tab" && !window.chileanInitialized) {
          initChileanVideogames().catch(err => console.error('Chilean chart init failed:', err));
          window.chileanInitialized = true;
        }
        if (tabId === "manutd-tab" && !window.manutdInitialized) {
          initManchesterUnited().catch(err => console.error('ManUtd chart init failed:', err));
          window.manutdInitialized = true;
        }
        if (tabId === "geopolitica-tab" && !window.geopoliticaInitialized) {
          initGeopolitica().catch(err => console.error('Geopolitica chart init failed:', err));
          window.geopoliticaInitialized = true;
        }
        if (tabId === "worldcup-tab" && !window.worldcupInitialized) {
          initWorldCup().catch(err => console.error('WorldCup chart init failed:', err));
          window.worldcupInitialized = true;
        }
        if (tabId === "chile-geo-tab" && !window.chileGeoInitialized) {
          initChileGeografia().catch(err => console.error('ChileGeo chart init failed:', err));
          window.chileGeoInitialized = true;
        }
      }
    });
  });

  // ==========================================
  // TAB 2: GAMER VIABILITY SIMULATOR
  // ==========================================
  const gameGenre = document.getElementById("game-genre");
  const budgetSlider = document.getElementById("budget-slider");
  const budgetVal = document.getElementById("budget-val");
  const marketingFocus = document.getElementById("marketing-focus");
  const simulateGameBtn = document.getElementById("simulate-game-btn");

  const gSuccessBar = document.getElementById("g-success-bar");
  const gSuccessPercent = document.getElementById("g-success-percent");
  const gRevenue = document.getElementById("g-revenue");
  const gInsightText = document.getElementById("g-insight-text");

  if (budgetSlider && budgetVal) {
    budgetSlider.addEventListener("input", () => {
      budgetVal.textContent = `$${parseInt(budgetSlider.value).toLocaleString()}`;
    });
  }

  function simulateGameViability() {
    const genre = gameGenre.value;
    const budget = parseInt(budgetSlider.value);
    const marketing = marketingFocus.value;

    simulateGameBtn.disabled = true;
    simulateGameBtn.textContent = "Calculando con reglas simples...";

    // Reset gauge visually during calculation
    gSuccessBar.style.width = "0%";
    gSuccessPercent.textContent = "0%";
    gRevenue.textContent = "Procesando...";
    gInsightText.textContent = "Evaluando vectores descriptivos de mercado y cruzando base histórica de benchmarks...";

    setTimeout(() => {
      let baseSuccess = 50;
      let multiplier = 1.0;

      // Logic based on real market findings
      if (genre === "indie-rpg") {
        baseSuccess = 60;
        multiplier = 1.8;
      } else if (genre === "action-roguelike") {
        baseSuccess = 55;
        multiplier = 1.5;
      } else if (genre === "coop-party") {
        baseSuccess = 45;
        multiplier = 1.2;
      } else if (genre === "casual-mobile") {
        baseSuccess = 35;
        multiplier = 0.8;
      }

      // Marketing multiplier
      if (marketing === "early-access") {
        baseSuccess += 15;
        multiplier += 0.4;
      } else if (marketing === "publisher-deal") {
        baseSuccess += 10;
        multiplier -= 0.1; // Publisher takes a cut of revenues, though safer success
      } else {
        baseSuccess -= 10;
        multiplier -= 0.3;
      }

      // Budget sensitivity
      if (budget > 150000 && genre === "casual-mobile") {
        // Over-investment in casual mobile is extremely risky
        baseSuccess -= 20;
      } else if (budget < 30000 && genre === "indie-rpg") {
        // Underfunding highly descriptive narrative RPG is a failure point
        baseSuccess -= 15;
      } else if (budget > 50000 && budget < 120000) {
        // "Sweet spot" for Indie LatAm development
        baseSuccess += 10;
      }

      // Calculations Capped
      const successChance = Math.min(95, Math.max(10, Math.round(baseSuccess)));
      const projectedRevenue = Math.round(budget * multiplier * (successChance / 60));

      // Visual updates
      gSuccessBar.style.width = `${successChance}%`;
      gSuccessPercent.textContent = `${successChance}%`;
      gRevenue.textContent = `$${projectedRevenue.toLocaleString()} USD`;

      // Color adjustments based on success probability
      if (successChance > 70) {
        gSuccessPercent.className = "result-percent text-glow-green";
      } else if (successChance < 45) {
        gSuccessPercent.className = "result-percent text-glow-red";
      } else {
        gSuccessPercent.className = "result-percent";
      }

      // Strategic recommendation synthesis
      let strategicText = "";
      if (successChance > 70) {
        strategicText = `PROYECTO ALTAMENTE VIABLE. El revenue proyectado de $${projectedRevenue.toLocaleString()} USD excede holgadamente la estructura local chilena de costos de desarrollo ($720 USD/mes, parámetro ilustrativo). La estrategia de Early Access combinada con actualizaciones recurrentes asegura tracción comercial.`;
      } else if (successChance >= 45) {
        strategicText = `VIABILIDAD COMERCIAL MODERADA. El proyecto presenta oportunidades de retorno de capital, pero está expuesto a un alto riesgo operativo por saturación de nicho. Se recomienda optimizar el presupuesto inicial a un sweet-spot de ~$60,000 USD y explorar un acuerdo de pre-financiamiento con un Publisher para transferir el riesgo de marketing digital.`;
      } else {
        strategicText = `VULNERABILIDAD FINANCIERA CRÍTICA. El simulador clasifica este proyecto bajo zona de alta tasa de mortalidad comercial. La combinación de género de software con la estrategia de lanzamiento no genera el volumen mínimo de reviews orgánicas exigido por algoritmos de distribución (Steam). Decisión Recomendada: Pivotar el concepto o re-estructurar costos antes de iniciar la inversión.`;
      }
      gInsightText.textContent = strategicText;

      simulateGameBtn.disabled = false;
      simulateGameBtn.textContent = "Calcular Viabilidad Comercial";
    }, 1200);
  }

  if (simulateGameBtn) {
    simulateGameBtn.addEventListener("click", simulateGameViability);
    // Initial run
    simulateGameViability();
  }

  // ==========================================
  // TAB 3: TACTICAL GRAPHS (CNA SCIENCE)
  // ==========================================
  let isGraphInitialized = false;

  const playerNodesData = {
    casemiro: { id: "casemiro", name: "Casemiro (DMF)", baseCx: 150, baseCy: 150, cx: 150, cy: 150, degree: 14, betweenness: 0.42, state: "Estable" },
    mainoo: { id: "mainoo", name: "K. Mainoo (CMF)", baseCx: 230, baseCy: 200, cx: 230, cy: 200, degree: 18, betweenness: 0.38, state: "Estable" },
    bruno: { id: "bruno", name: "B. Fernandes (AMF)", baseCx: 330, baseCy: 150, cx: 330, cy: 150, degree: 26, betweenness: 0.64, state: "Punto Crítico" },
    rashford: { id: "rashford", name: "M. Rashford (LWF)", baseCx: 380, baseCy: 70, cx: 380, cy: 70, degree: 11, betweenness: 0.12, state: "Aislado" },
    garnacho: { id: "garnacho", name: "A. Garnacho (RWF)", baseCx: 380, baseCy: 230, cx: 380, cy: 230, degree: 12, betweenness: 0.14, state: "Aislado" }
  };

  const highPressMetrics = {
    casemiro: { degree: 4, betweenness: 0.05, state: "BLOQUEADO" },
    mainoo: { degree: 15, betweenness: 0.44, state: "Presionado" },
    bruno: { degree: 28, betweenness: 0.72, state: "Bajo Estrés" },
    rashford: { degree: 8, betweenness: 0.08, state: "Aislado" },
    garnacho: { degree: 9, betweenness: 0.10, state: "Aislado" }
  };

  function initTacticalGraph() {
    if (isGraphInitialized) return;
    isGraphInitialized = true;

    const svgNodes = document.getElementById("svg-nodes");
    const svgEdges = document.getElementById("svg-edges");
    const pressToggle = document.getElementById("press-toggle");
    const cnaTableBody = document.getElementById("cna-table-body");
    const cnaInsightText = document.getElementById("cna-insight-text");

    let activeDragNode = null;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    // Define adjacency relationships
    const edges = [
      { from: "casemiro", to: "mainoo" },
      { from: "casemiro", to: "bruno" },
      { from: "mainoo", to: "bruno" },
      { from: "bruno", to: "rashford" },
      { from: "bruno", to: "garnacho" },
      { from: "mainoo", to: "garnacho" }
    ];

    function drawGraph() {
      // 1. Clear SVG elements
      svgEdges.innerHTML = "";
      svgNodes.innerHTML = "";

      const pressActive = pressToggle.checked;

      // 2. Draw Connections (Aristas/Edges)
      edges.forEach(edge => {
        const fromNode = playerNodesData[edge.from];
        const toNode = playerNodesData[edge.to];
        
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", fromNode.cx);
        line.setAttribute("y1", fromNode.cy);
        line.setAttribute("x2", toNode.cx);
        line.setAttribute("y2", toNode.cy);
        line.setAttribute("class", "edge-line");
        
        // Dynamic edge style under oponent high press
        if (pressActive && (edge.from === "casemiro" || edge.to === "casemiro")) {
          // Severed or weak connections
          line.setAttribute("stroke", "rgba(239, 68, 68, 0.25)");
          line.setAttribute("stroke-width", "1.5");
        } else {
          line.setAttribute("stroke", "rgba(99, 102, 241, 0.4)");
          line.setAttribute("stroke-width", "3");
        }

        svgEdges.appendChild(line);
      });

      // 3. Draw Nodes (Circle + Text)
      Object.keys(playerNodesData).forEach(key => {
        const node = playerNodesData[key];
        const metrics = pressActive ? highPressMetrics[key] : node;

        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("class", "node-group");
        group.setAttribute("data-id", node.id);

        // Circle background glow
        const glowCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        glowCircle.setAttribute("cx", node.cx);
        glowCircle.setAttribute("cy", node.cy);
        glowCircle.setAttribute("r", 20);
        glowCircle.setAttribute("fill", "transparent");
        glowCircle.setAttribute("stroke", pressActive && metrics.state === "BLOQUEADO" ? "rgba(239, 68, 68, 0.4)" : "rgba(99, 102, 241, 0.2)");
        glowCircle.setAttribute("stroke-width", "6");

        // Main Node Circle
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", node.cx);
        circle.setAttribute("cy", node.cy);
        circle.setAttribute("r", 15);
        circle.setAttribute("class", "node-circle");
        
        // Node color states
        if (pressActive && metrics.state === "BLOQUEADO") {
          circle.setAttribute("fill", "#ef4444"); // Red under heavy lock
        } else if (pressActive && metrics.state === "Bajo Estrés") {
          circle.setAttribute("fill", "#f59e0b"); // Orange under stress
        } else {
          circle.setAttribute("fill", "#6366f1"); // Indigo standard
        }
        circle.setAttribute("stroke", "#fff");
        circle.setAttribute("stroke-width", "2");

        // Player Name Label
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", node.cx);
        text.setAttribute("y", node.cy - 22);
        text.setAttribute("class", "node-text");
        text.setAttribute("fill", "#ffffff");
        text.setAttribute("text-anchor", "middle");
        text.textContent = node.name.split(" ")[0]; // Just first name for SVGs

        group.appendChild(glowCircle);
        group.appendChild(circle);
        group.appendChild(text);

        // Drag Event Binding on node circle
        circle.addEventListener("mousedown", (e) => {
          activeDragNode = node;
          const rect = svgNodes.parentNode.getBoundingClientRect();
          // Adjust client coordinates relative to SVG aspect ratio coordinates
          const scaleX = 500 / rect.width;
          const scaleY = 300 / rect.height;
          
          dragOffsetX = (e.clientX - rect.left) * scaleX - node.cx;
          dragOffsetY = (e.clientY - rect.top) * scaleY - node.cy;
        });

        svgNodes.appendChild(group);
      });

      // 4. Update CNA Metrics Table
      updateCnaTable();
    }

    function updateCnaTable() {
      cnaTableBody.innerHTML = "";
      const pressActive = pressToggle.checked;

      Object.keys(playerNodesData).forEach(key => {
        const node = playerNodesData[key];
        const metrics = pressActive ? highPressMetrics[key] : node;

        const tr = document.createElement("tr");

        const tdNode = document.createElement("td");
        tdNode.textContent = node.name;
        tdNode.style.fontWeight = "600";

        const tdDegree = document.createElement("td");
        tdDegree.textContent = `${metrics.degree} pases/partido`;

        const tdBetween = document.createElement("td");
        tdBetween.textContent = metrics.betweenness.toFixed(2);

        const tdState = document.createElement("td");
        const spanState = document.createElement("span");
        spanState.className = `badge-value`;
        
        if (metrics.state === "BLOQUEADO") {
          spanState.style.background = "rgba(239, 68, 68, 0.15)";
          spanState.style.borderColor = "rgba(239, 68, 68, 0.3)";
          spanState.style.color = "#fca5a5";
        } else if (metrics.state === "Bajo Estrés" || metrics.state === "Presionado") {
          spanState.style.background = "rgba(245, 158, 11, 0.15)";
          spanState.style.borderColor = "rgba(245, 158, 11, 0.3)";
          spanState.style.color = "#fcd34d";
        } else {
          spanState.style.background = "rgba(34, 197, 94, 0.15)";
          spanState.style.borderColor = "rgba(34, 197, 94, 0.3)";
          spanState.style.color = "#86efac";
        }
        spanState.textContent = metrics.state;
        tdState.appendChild(spanState);

        tr.appendChild(tdNode);
        tr.appendChild(tdDegree);
        tr.appendChild(tdBetween);
        tr.appendChild(tdState);

        cnaTableBody.appendChild(tr);
      });

      // Update Strategic CNA Narrative
      if (pressActive) {
        cnaInsightText.textContent = "ALERTA TÁCTICA: El oponente despliega una presión alta orientada a estrangular el eje Casemiro (DMF). Su betweenness centrality colapsa a 0.05 (Bloqueado), lo que desactiva la progresión del mediocentro. El juego se embotella y Bruno Fernandes (AMF) se ve obligado a descender de su zona de influencia para recibir bajo estrés (Betweenness sube a 0.72), incrementando el riesgo de pérdidas en transiciones críticas.";
      } else {
        cnaInsightText.textContent = "ESTRUCTURA RELACIONAL SALUDABLE: En escenario de bloque bajo rival, la distribución de cargas de pase es balanceada. Casemiro opera con libertad como pivote articulador principal (Betweenness de 0.42), facilitando transiciones fluidas hacia Bruno Fernandes, quien puede retener y asistir en zonas limpias de finalización con un índice óptimo de ROI de peligro esperado.";
      }
    }

    // Global SVG Mouse move logic for Dragging
    const svgParent = document.getElementById("pitch-svg");
    svgParent.addEventListener("mousemove", (e) => {
      if (!activeDragNode) return;
      
      const rect = svgParent.getBoundingClientRect();
      const scaleX = 500 / rect.width;
      const scaleY = 300 / rect.height;

      // Calculate new coordinate, capping inside pitch boundary
      const newCx = Math.max(20, Math.min(480, (e.clientX - rect.left) * scaleX - dragOffsetX));
      const newCy = Math.max(20, Math.min(280, (e.clientY - rect.top) * scaleY - dragOffsetY));

      // Update Node coordinates on data store
      activeDragNode.cx = newCx;
      activeDragNode.cy = newCy;

      // Re-draw immediately
      drawGraph();
    });

    // Global window mouseup to release drag
    window.addEventListener("mouseup", () => {
      activeDragNode = null;
    });

    pressToggle.addEventListener("change", () => {
      drawGraph();
    });

    // Initial Drawing
    drawGraph();
  }

  // Initialize Chilean tab on load (it's the default active tab)
  if (!window.chileanInitialized) {
    initChileanVideogames().catch(err => console.error('Chilean chart init failed:', err));
    window.chileanInitialized = true;
  }

});
