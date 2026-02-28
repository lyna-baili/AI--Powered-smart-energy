// Clock
function updateClock() {
  const now = new Date();
  document.getElementById('clock').textContent = now.toLocaleTimeString('fr-FR');
}
setInterval(updateClock, 1000);
updateClock();

// --- BAR CHART ---
const hourlyData = [
  {h:'00h',v:42},{h:'01h',v:35},{h:'02h',v:28},{h:'03h',v:25},{h:'04h',v:27},
  {h:'05h',v:32},{h:'06h',v:48},{h:'07h',v:72},{h:'08h',v:88},{h:'09h',v:95},
  {h:'10h',v:100},{h:'11h',v:98},{h:'12h',v:92},{h:'13h',v:90},{h:'14h',v:84},
  {h:'15h',v:null},{h:'16h',v:null},{h:'17h',v:null},{h:'18h',v:null}
];

const barChart = document.getElementById('bar-chart');
const maxV = 100;
const chartH = 156; // chart height minus label space

// Add grid lines
for(let g of [25,50,75,100]) {
  const line = document.createElement('div');
  line.className = 'chart-grid-line';
  line.style.bottom = (g/maxV * chartH) + 'px';
  line.innerHTML = `<span>${g}%</span>`;
  barChart.appendChild(line);
}

hourlyData.forEach(d => {
  const wrap = document.createElement('div');
  wrap.className = 'chart-bar-wrap';
  
  const bar = document.createElement('div');
  bar.className = 'chart-bar';
  const heightPct = d.v ? (d.v / maxV * chartH) : (chartH * 0.1);
  bar.style.height = heightPct + 'px';
  
  if(d.v === null) {
    bar.style.background = 'repeating-linear-gradient(45deg, rgba(0,229,160,0.15), rgba(0,229,160,0.15) 4px, transparent 4px, transparent 8px)';
    bar.style.border = '1px dashed rgba(0,229,160,0.3)';
  } else if(d.v > 90) {
    bar.style.background = 'linear-gradient(to top, #ef4444, #f97316)';
  } else if(d.v > 70) {
    bar.style.background = 'linear-gradient(to top, #f59e0b, #fbbf24)';
  } else {
    bar.style.background = 'linear-gradient(to top, #00e5a0, #00aaff)';
  }
  
  const tooltip = document.createElement('div');
  tooltip.className = 'chart-tooltip';
  tooltip.textContent = d.v ? d.v+'%' : 'PRED';
  
  const label = document.createElement('div');
  label.className = 'chart-bar-label';
  label.textContent = d.h;
  
  wrap.appendChild(tooltip);
  wrap.appendChild(bar);
  wrap.appendChild(label);
  barChart.appendChild(wrap);
});

// --- LINE CHART (SVG) ---
const svg = document.getElementById('line-chart');
const W = 400, H = 160;
const actual = [null,null,null,null,null,null, 48,72,88,95,100,98,92,90,84];
const predicted = [38,30,25,23,25,30,45,68,84,92,96,95,89,87,80,95,105,98,88,82,78,70,60,52];

function toSVGPoint(i, v, total, maxV, H, W) {
  const x = (i / (total-1)) * W;
  const y = H - (v / maxV) * (H * 0.85) - H*0.05;
  return [x, y];
}

const maxAll = 110;
const totalPred = predicted.length;

// Predicted area
let areaPath = `M0,${H}`;
predicted.forEach((v, i) => {
  const [x,y] = toSVGPoint(i, v, totalPred, maxAll, H, W);
  areaPath += ` L${x.toFixed(1)},${y.toFixed(1)}`;
});
areaPath += ` L${W},${H} Z`;

const area = document.createElementNS('http://www.w3.org/2000/svg','path');
area.setAttribute('d', areaPath);
area.setAttribute('fill', 'url(#predGrad)');
svg.appendChild(area);

// Predicted line
let predLine = '';
predicted.forEach((v, i) => {
  const [x,y] = toSVGPoint(i, v, totalPred, maxAll, H, W);
  predLine += (i===0 ? 'M' : 'L') + `${x.toFixed(1)},${y.toFixed(1)} `;
});
const pLine = document.createElementNS('http://www.w3.org/2000/svg','path');
pLine.setAttribute('d', predLine);
pLine.setAttribute('fill','none');
pLine.setAttribute('stroke','rgba(0,170,255,0.6)');
pLine.setAttribute('stroke-width','1.5');
pLine.setAttribute('stroke-dasharray','5 3');
svg.appendChild(pLine);

// Actual line
let actLine = '';
actual.forEach((v, i) => {
  if(v === null) return;
  const xi = (i / (predicted.length - 1));
  const x = xi * W;
  const y = H - (v / maxAll) * (H * 0.85) - H*0.05;
  actLine += (actLine==='' ? 'M' : 'L') + `${x.toFixed(1)},${y.toFixed(1)} `;
});
const aLine = document.createElementNS('http://www.w3.org/2000/svg','path');
aLine.setAttribute('d', actLine);
aLine.setAttribute('fill','none');
aLine.setAttribute('stroke','#00e5a0');
aLine.setAttribute('stroke-width','2.5');
svg.appendChild(aLine);

// Gradient defs
const defs = document.createElementNS('http://www.w3.org/2000/svg','defs');
defs.innerHTML = `<linearGradient id="predGrad" x1="0" y1="0" x2="0" y2="1">
  <stop offset="0%" stop-color="#00aaff" stop-opacity="0.15"/>
  <stop offset="100%" stop-color="#00aaff" stop-opacity="0"/>
</linearGradient>`;
svg.insertBefore(defs, svg.firstChild);

// Legend
const legText1 = document.createElementNS('http://www.w3.org/2000/svg','text');
legText1.setAttribute('x','10'); legText1.setAttribute('y','14');
legText1.setAttribute('fill','#00e5a0'); legText1.setAttribute('font-size','9');
legText1.setAttribute('font-family','Space Mono, monospace');
legText1.textContent = '— Réel';
svg.appendChild(legText1);

const legText2 = document.createElementNS('http://www.w3.org/2000/svg','text');
legText2.setAttribute('x','60'); legText2.setAttribute('y','14');
legText2.setAttribute('fill','#00aaff'); legText2.setAttribute('font-size','9');
legText2.setAttribute('font-family','Space Mono, monospace');
legText2.textContent = '-- Prédiction IA';
svg.appendChild(legText2);

// --- ANIMATE KPI ---
let dir = 1;
setInterval(() => {
  const v = (2.84 + Math.sin(Date.now()/3000) * 0.12).toFixed(2);
  document.getElementById('kpi-current').textContent = v;
}, 2000);
