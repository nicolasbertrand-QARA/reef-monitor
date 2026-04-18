import sharp from 'sharp';
import fs from 'fs';

const W = 1290;
const H = 2796;
const BG = '#f5f2ed';
const TEAL = '#5a8f8b';
const TEXT = '#2d2a26';
const TEXT2 = '#8a8478';
const SURFACE = '#ece8e1';
const WHITE = '#ffffff';
const GREEN = '#6b9e7a';
const AMBER = '#c4943e';
const GREEN_BG = '#edf5ef';

function card(x, y, w, h, label, value, unit, status, timeAgo) {
  const bg = status === 'ok' ? WHITE : status === 'warning' ? '#f8f1e4' : WHITE;
  const dotColor = status === 'ok' ? GREEN : status === 'warning' ? AMBER : '#b5ada3';
  return `
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="28" fill="${bg}"/>
    <text x="${x + 32}" y="${y + 44}" font-family="SF Pro Display, Helvetica" font-size="26" fill="${TEXT2}" font-weight="500">${label}</text>
    <circle cx="${x + w - 40}" cy="${y + 36}" r="10" fill="${dotColor}"/>
    <text x="${x + 32}" y="${y + 110}" font-family="SF Pro Display, Helvetica" font-size="60" fill="${TEXT}" font-weight="700">${value}</text>
    <text x="${x + 32 + value.length * 36}" y="${y + 110}" font-family="SF Pro Display, Helvetica" font-size="28" fill="${TEXT2}"> ${unit}</text>
    <text x="${x + 32}" y="${y + 145}" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEXT2}">${timeAgo}</text>
  `;
}

// Screenshot 1: Dashboard
const dashboard = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Status bar area -->
  <text x="${W/2}" y="180" font-family="SF Pro Display, Helvetica" font-size="36" fill="${TEXT}" font-weight="600" text-anchor="middle">Tableau de bord</text>

  <!-- Section: Chimie de l'eau -->
  <text x="50" y="260" font-family="SF Pro Display, Helvetica" font-size="24" fill="${TEXT2}" font-weight="600" letter-spacing="2">CHIMIE DE L'EAU</text>

  ${card(50, 290, 580, 170, 'Température', '25.4', '°C', 'ok', 'il y a 2 heures')}
  ${card(660, 290, 580, 170, 'Salinité', '35.0', 'ppt', 'ok', 'il y a 2 heures')}
  ${card(50, 480, 580, 170, 'pH', '8.15', '', 'ok', 'il y a 3 jours')}
  ${card(660, 480, 580, 170, 'Alcalinité', '8.2', 'dKH', 'ok', 'il y a 1 jour')}
  ${card(50, 670, 580, 170, 'Calcium', '420', 'ppm', 'ok', 'il y a 2 jours')}
  ${card(660, 670, 580, 170, 'Magnésium', '1340', 'ppm', 'ok', 'il y a 2 jours')}

  <!-- Section: Nutriments -->
  <text x="50" y="910" font-family="SF Pro Display, Helvetica" font-size="24" fill="${TEXT2}" font-weight="600" letter-spacing="2">NUTRIMENTS</text>

  ${card(50, 940, 580, 170, 'Nitrates', '5', 'ppm', 'ok', 'il y a 4 jours')}
  ${card(660, 940, 580, 170, 'Phosphates', '0.06', 'ppm', 'ok', 'il y a 4 jours')}

  <!-- Marketing text at bottom -->
  <text x="${W/2}" y="1400" font-family="SF Pro Display, Helvetica" font-size="52" fill="${TEXT}" font-weight="700" text-anchor="middle">Tous vos paramètres</text>
  <text x="${W/2}" y="1465" font-family="SF Pro Display, Helvetica" font-size="52" fill="${TEXT}" font-weight="700" text-anchor="middle">en un coup d'œil</text>
  <text x="${W/2}" y="1540" font-family="SF Pro Display, Helvetica" font-size="32" fill="${TEXT2}" text-anchor="middle">Seuils colorés · Alertes automatiques · Ratios</text>

  <!-- Tab bar -->
  <rect x="0" y="${H - 180}" width="${W}" height="180" fill="${WHITE}"/>
  <line x1="0" y1="${H - 180}" x2="${W}" y2="${H - 180}" stroke="${SURFACE}" stroke-width="1"/>
  <text x="170" y="${H - 70}" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEAL}" text-anchor="middle" font-weight="600">Tableau de bord</text>
  <text x="450" y="${H - 70}" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEXT2}" text-anchor="middle">Mesures</text>
  <text x="730" y="${H - 70}" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEXT2}" text-anchor="middle">Tendances</text>
  <text x="1050" y="${H - 70}" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEXT2}" text-anchor="middle">Réglages</text>
</svg>`;

// Screenshot 2: Log screen
const logScreen = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <text x="${W/2}" y="180" font-family="SF Pro Display, Helvetica" font-size="36" fill="${TEXT}" font-weight="600" text-anchor="middle">Mesures</text>
  <text x="${W/2}" y="230" font-family="SF Pro Display, Helvetica" font-size="26" fill="${TEXT2}" text-anchor="middle">Appuyez sur un paramètre pour enregistrer</text>

  <text x="50" y="300" font-family="SF Pro Display, Helvetica" font-size="24" fill="${TEXT2}" font-weight="600" letter-spacing="2">CHIMIE DE L'EAU</text>

  ${[
    ['Température', '°C'], ['Salinité', 'ppt'], ['pH', '—'],
    ['Alcalinité', 'dKH'], ['Calcium', 'ppm'], ['Magnésium', 'ppm']
  ].map(([label, unit], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = 50 + col * 610;
    const y = 330 + row * 200;
    return `
      <rect x="${x}" y="${y}" width="580" height="180" rx="28" fill="${WHITE}"/>
      <text x="${x + 290}" y="${y + 85}" font-family="SF Pro Display, Helvetica" font-size="32" fill="${TEXT}" font-weight="600" text-anchor="middle">${label}</text>
      <text x="${x + 290}" y="${y + 125}" font-family="SF Pro Display, Helvetica" font-size="26" fill="${TEXT2}" text-anchor="middle">${unit}</text>
    `;
  }).join('')}

  <text x="50" y="960" font-family="SF Pro Display, Helvetica" font-size="24" fill="${TEXT2}" font-weight="600" letter-spacing="2">NUTRIMENTS</text>

  ${[['Nitrates', 'ppm'], ['Phosphates', 'ppm']].map(([label, unit], i) => {
    const x = 50 + i * 610;
    return `
      <rect x="${x}" y="990" width="580" height="180" rx="28" fill="${WHITE}"/>
      <text x="${x + 290}" y="1075" font-family="SF Pro Display, Helvetica" font-size="32" fill="${TEXT}" font-weight="600" text-anchor="middle">${label}</text>
      <text x="${x + 290}" y="1115" font-family="SF Pro Display, Helvetica" font-size="26" fill="${TEXT2}" text-anchor="middle">${unit}</text>
    `;
  }).join('')}

  <!-- Marketing text -->
  <text x="${W/2}" y="1480" font-family="SF Pro Display, Helvetica" font-size="52" fill="${TEXT}" font-weight="700" text-anchor="middle">Conçu pour les</text>
  <text x="${W/2}" y="1545" font-family="SF Pro Display, Helvetica" font-size="52" fill="${TEXT}" font-weight="700" text-anchor="middle">mains mouillées</text>
  <text x="${W/2}" y="1620" font-family="SF Pro Display, Helvetica" font-size="32" fill="${TEXT2}" text-anchor="middle">Grands boutons · Retour haptique · Minuteurs</text>

  <!-- Tab bar -->
  <rect x="0" y="${H - 180}" width="${W}" height="180" fill="${WHITE}"/>
  <line x1="0" y1="${H - 180}" x2="${W}" y2="${H - 180}" stroke="${SURFACE}" stroke-width="1"/>
  <text x="170" y="${H - 70}" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEXT2}" text-anchor="middle">Tableau de bord</text>
  <text x="450" y="${H - 70}" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEAL}" text-anchor="middle" font-weight="600">Mesures</text>
  <text x="730" y="${H - 70}" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEXT2}" text-anchor="middle">Tendances</text>
  <text x="1050" y="${H - 70}" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEXT2}" text-anchor="middle">Réglages</text>
</svg>`;

// Screenshot 3: Trends
const trends = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <text x="${W/2}" y="180" font-family="SF Pro Display, Helvetica" font-size="36" fill="${TEXT}" font-weight="600" text-anchor="middle">Tendances</text>

  <!-- Parameter chips -->
  ${['Température', 'Salinité', 'pH', 'Alcalinité', 'Calcium'].map((label, i) => {
    const x = 50 + i * 220;
    const active = label === 'Alcalinité';
    return `
      <rect x="${x}" y="220" width="200" height="56" rx="28" fill="${active ? TEAL : SURFACE}"/>
      <text x="${x + 100}" y="255" font-family="SF Pro Display, Helvetica" font-size="24" fill="${active ? WHITE : TEXT2}" font-weight="600" text-anchor="middle">${label}</text>
    `;
  }).join('')}

  <!-- Time range -->
  ${['7j', '30j', '90j', 'Tout'].map((label, i) => {
    const x = 50 + i * 150;
    const active = label === '30j';
    return `
      <rect x="${x}" y="300" width="130" height="50" rx="25" fill="${active ? TEAL : SURFACE}"/>
      <text x="${x + 65}" y="332" font-family="SF Pro Display, Helvetica" font-size="24" fill="${active ? WHITE : TEXT2}" font-weight="600" text-anchor="middle">${label}</text>
    `;
  }).join('')}

  <!-- Chart area with range band -->
  <rect x="100" y="420" width="1090" height="350" rx="8" fill="${GREEN_BG}"/>

  <!-- Chart dots simulating a trend line -->
  ${[
    [120, 680], [200, 650], [280, 670], [360, 630], [440, 610],
    [520, 640], [600, 600], [680, 580], [760, 590], [840, 560],
    [920, 570], [1000, 540], [1080, 550], [1160, 530]
  ].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="8" fill="${TEAL}"/>`).join('')}

  <!-- Y axis labels -->
  <text x="50" y="440" font-family="SF Pro Display, Helvetica" font-size="20" fill="${TEXT2}">9.2</text>
  <text x="50" y="760" font-family="SF Pro Display, Helvetica" font-size="20" fill="${TEXT2}">7.4</text>

  <!-- X axis -->
  <text x="120" y="800" font-family="SF Pro Display, Helvetica" font-size="20" fill="${TEXT2}">19 mars</text>
  <text x="1100" y="800" font-family="SF Pro Display, Helvetica" font-size="20" fill="${TEXT2}">18 avr.</text>

  <!-- Stats row -->
  <rect x="50" y="830" width="1190" height="110" rx="28" fill="${WHITE}"/>
  ${[
    ['Actuel', '8.2'], ['Min', '7.8'], ['Max', '9.0'], ['Moy', '8.3']
  ].map(([label, val], i) => {
    const x = 150 + i * 290;
    return `
      <text x="${x}" y="875" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEXT2}" font-weight="500" text-anchor="middle">${label}</text>
      <text x="${x}" y="915" font-family="SF Pro Display, Helvetica" font-size="32" fill="${TEXT}" font-weight="600" text-anchor="middle">${val}</text>
    `;
  }).join('')}

  <!-- Consumption card -->
  <rect x="50" y="970" width="1190" height="180" rx="28" fill="${WHITE}"/>
  <text x="82" y="1015" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEXT2}" font-weight="600" letter-spacing="1.5">TAUX DE CONSOMMATION</text>
  <text x="82" y="1075" font-family="SF Pro Display, Helvetica" font-size="52" fill="${TEXT}" font-weight="700">-0.45</text>
  <text x="340" y="1075" font-family="SF Pro Display, Helvetica" font-size="28" fill="${TEXT2}"> dKH/jour</text>
  <text x="82" y="1120" font-family="SF Pro Display, Helvetica" font-size="24" fill="${TEXT2}">Normal — absorption régulière</text>

  <!-- Marketing text -->
  <text x="${W/2}" y="1430" font-family="SF Pro Display, Helvetica" font-size="52" fill="${TEXT}" font-weight="700" text-anchor="middle">Anticipez les dérives</text>
  <text x="${W/2}" y="1495" font-family="SF Pro Display, Helvetica" font-size="52" fill="${TEXT}" font-weight="700" text-anchor="middle">avant vos coraux</text>
  <text x="${W/2}" y="1570" font-family="SF Pro Display, Helvetica" font-size="32" fill="${TEXT2}" text-anchor="middle">Consommation KH · Historique · Ratio NO3:PO4</text>

  <!-- Tab bar -->
  <rect x="0" y="${H - 180}" width="${W}" height="180" fill="${WHITE}"/>
  <line x1="0" y1="${H - 180}" x2="${W}" y2="${H - 180}" stroke="${SURFACE}" stroke-width="1"/>
  <text x="170" y="${H - 70}" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEXT2}" text-anchor="middle">Tableau de bord</text>
  <text x="450" y="${H - 70}" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEXT2}" text-anchor="middle">Mesures</text>
  <text x="730" y="${H - 70}" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEAL}" text-anchor="middle" font-weight="600">Tendances</text>
  <text x="1050" y="${H - 70}" font-family="SF Pro Display, Helvetica" font-size="22" fill="${TEXT2}" text-anchor="middle">Réglages</text>
</svg>`;

// Screenshot 4: Input modal
const inputModal = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="${BG}"/>

  <!-- Header -->
  <text x="60" y="180" font-family="SF Pro Display, Helvetica" font-size="32" fill="${TEXT2}">Annuler</text>
  <text x="${W/2}" y="180" font-family="SF Pro Display, Helvetica" font-size="34" fill="${TEXT}" font-weight="600" text-anchor="middle">Alcalinité</text>

  <!-- Big value -->
  <text x="${W/2}" y="550" font-family="SF Pro Display, Helvetica" font-size="144" fill="${TEXT}" font-weight="700" text-anchor="middle" letter-spacing="-4">8.2</text>
  <text x="${W/2}" y="610" font-family="SF Pro Display, Helvetica" font-size="40" fill="${TEXT2}" text-anchor="middle">dKH</text>

  <!-- Steppers -->
  <rect x="220" y="720" width="128" height="128" rx="32" fill="${SURFACE}"/>
  <text x="284" y="800" font-family="SF Pro Display, Helvetica" font-size="30" fill="${TEXT2}" font-weight="600" text-anchor="middle">-1</text>

  <rect x="370" y="700" width="148" height="148" rx="32" fill="${TEAL}"/>
  <text x="444" y="790" font-family="SF Pro Display, Helvetica" font-size="56" fill="${WHITE}" font-weight="500" text-anchor="middle">−</text>

  <rect x="540" y="700" width="148" height="148" rx="32" fill="${TEAL}"/>
  <text x="614" y="790" font-family="SF Pro Display, Helvetica" font-size="56" fill="${WHITE}" font-weight="500" text-anchor="middle">+</text>

  <rect x="710" y="720" width="128" height="128" rx="32" fill="${SURFACE}"/>
  <text x="774" y="800" font-family="SF Pro Display, Helvetica" font-size="30" fill="${TEXT2}" font-weight="600" text-anchor="middle">+1</text>

  <text x="${W/2}" y="900" font-family="SF Pro Display, Helvetica" font-size="24" fill="${TEXT2}" text-anchor="middle">Pas : 0.1 dKH</text>

  <!-- Save button -->
  <rect x="60" y="1000" width="1170" height="90" rx="28" fill="${TEAL}"/>
  <text x="${W/2}" y="1058" font-family="SF Pro Display, Helvetica" font-size="34" fill="${WHITE}" font-weight="600" text-anchor="middle">Enregistrer</text>

  <!-- Marketing text -->
  <text x="${W/2}" y="1400" font-family="SF Pro Display, Helvetica" font-size="52" fill="${TEXT}" font-weight="700" text-anchor="middle">Saisie précise</text>
  <text x="${W/2}" y="1465" font-family="SF Pro Display, Helvetica" font-size="52" fill="${TEXT}" font-weight="700" text-anchor="middle">en quelques taps</text>
  <text x="${W/2}" y="1540" font-family="SF Pro Display, Helvetica" font-size="32" fill="${TEXT2}" text-anchor="middle">Pas ajustables · Grands boutons · Confirmation tactile</text>

  <!-- Tab bar -->
  <rect x="0" y="${H - 180}" width="${W}" height="180" fill="${WHITE}"/>
</svg>`;

const screens = [
  { name: 'screenshot_dashboard', svg: dashboard },
  { name: 'screenshot_log', svg: logScreen },
  { name: 'screenshot_trends', svg: trends },
  { name: 'screenshot_input', svg: inputModal },
];

fs.mkdirSync('appstore', { recursive: true });

for (const { name, svg } of screens) {
  // 6.7" (1290x2796)
  await sharp(Buffer.from(svg))
    .flatten({ background: BG })
    .png()
    .toFile(`appstore/${name}_6.7.png`);

  // 6.5" (1242x2688) — scale down
  await sharp(Buffer.from(svg))
    .resize(1242, 2688)
    .flatten({ background: BG })
    .png()
    .toFile(`appstore/${name}_6.5.png`);

  console.log(`✓ ${name}`);
}

console.log('\nDone — screenshots in appstore/');
