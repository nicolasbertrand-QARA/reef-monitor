#!/usr/bin/env node
/**
 * Composes App Store screenshots from REAL simulator captures.
 *
 * Usage: node scripts/compose-screenshots.mjs <captures-dir> <locale>
 *   captures-dir must contain: dashboard.png, log.png, trends.png, dosing.png, settings.png
 *   locale: en | fr
 *
 * Outputs appstore/screenshots/v1.5/<locale>/{6.7,6.5}/NN-name.png
 * Replaces the retired synthetic SVG pipeline (real UI only; concept cards
 * 7-10 are marketing art, not UI).
 */
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const [, , capDir, locale = 'en'] = process.argv;
if (!capDir || !fs.existsSync(capDir)) { console.error('captures dir missing'); process.exit(1); }

const BG = '#f5f2ed', TEXT = '#2d2a26', TEXT2 = '#6e685c', ACCENT = '#47736f', SURFACE = '#ece8e1', WHITE = '#ffffff';
const FONT = "Helvetica Neue, Helvetica, Arial, sans-serif";
const SIZES = [
  { tag: '6.7', W: 1290, H: 2796 },
  { tag: '6.5', W: 1242, H: 2688 },
];

const COPY = {
  en: {
    pills: ['100% free', 'Offline', 'No account'],
    shots: [
      { img: 'dashboard', name: 'hook', h1: 'Track your reef.', h2: 'Beat the drift.', cap: 'The free reef tank log for saltwater keepers' },
      { img: 'log', name: 'timers', h1: 'Test-kit timers', h2: 'built in.', cap: 'Shake, wait, read, enter. The verdict before you save.' },
      { img: 'trends', name: 'trends', h1: 'Spot alkalinity', h2: 'drift early.', cap: 'Consumption rate, target zones, saltwater trends' },
      { img: 'dashboard', name: 'params', h1: '15 parameters', h2: 'at a glance.', cap: 'Mini trends on every card. Words, not just colors.' },
      { img: 'dosing', name: 'dosing', h1: 'Dosing & water changes,', h2: 'correlated.', cap: 'Kalkwasser, 2-part, All-for-Reef on your charts' },
      { img: 'settings', name: 'tanks', h1: 'Every tank', h2: 'in one app.', cap: 'Multi-tank, per-tank thresholds and units' },
      { concept: 'privacy', name: 'privacy', h1: 'Your data stays', h2: 'on your device.', cap: 'No cloud. No account. Not one network request.' },
      { concept: 'backup', name: 'backup', h1: 'Full CSV backup.', h2: 'Never trapped.', cap: 'Readings, doses, water changes, thresholds' },
      { concept: 'languages', name: 'languages', h1: 'Speaks', h2: '15 languages.', cap: 'Auto-detected. Fully offline.' },
      { concept: 'closer', name: 'closer', h1: 'Free. No ads.', h2: 'No tracking.', cap: 'Built by a reef keeper, for reef keepers.' },
    ],
    langs: ['English', 'Français', 'Deutsch', 'Español', 'Português', 'Italiano', 'Nederlands', 'Русский', '日本語', '한국어', '中文', 'العربية', 'हिन्दी', 'Türkçe', 'Polski'],
  },
  fr: {
    pills: ['100% gratuit', 'Hors ligne', 'Sans compte'],
    shots: [
      { img: 'dashboard', name: 'hook', h1: 'Suivez votre récif.', h2: 'Devancez la dérive.', cap: "Le journal de bac récifal gratuit" },
      { img: 'log', name: 'timers', h1: 'Minuteurs de test', h2: 'intégrés.', cap: "Agiter, attendre, lire, saisir. Le verdict avant d'enregistrer." },
      { img: 'trends', name: 'trends', h1: "Repérez la dérive", h2: "d'alcalinité tôt.", cap: 'Taux de consommation, zones cibles, tendances' },
      { img: 'dashboard', name: 'params', h1: '15 paramètres', h2: "d'un coup d'œil.", cap: 'Mini-tendances sur chaque carte. Des mots, pas que des couleurs.' },
      { img: 'dosing', name: 'dosing', h1: "Dosages et changements d'eau,", h2: 'corrélés.', cap: 'Kalkwasser, balling, All-for-Reef sur vos courbes' },
      { img: 'settings', name: 'tanks', h1: 'Tous vos bacs', h2: 'dans une app.', cap: 'Multi-bacs, seuils et unités par bac' },
      { concept: 'privacy', name: 'privacy', h1: 'Vos données restent', h2: 'sur votre appareil.', cap: 'Pas de cloud. Pas de compte. Aucune requête réseau.' },
      { concept: 'backup', name: 'backup', h1: 'Sauvegarde CSV complète.', h2: 'Jamais captives.', cap: "Mesures, dosages, changements d'eau, seuils" },
      { concept: 'languages', name: 'languages', h1: 'Parle', h2: '15 langues.', cap: 'Détection automatique. Entièrement hors ligne.' },
      { concept: 'closer', name: 'closer', h1: 'Gratuit. Sans pub.', h2: 'Sans tracking.', cap: 'Par un récifaliste, pour les récifalistes.' },
    ],
    langs: ['Français', 'English', 'Deutsch', 'Español', 'Português', 'Italiano', 'Nederlands', 'Русский', '日本語', '한국어', '中文', 'العربية', 'हिन्दी', 'Türkçe', 'Polski'],
  },
};

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

function headerSvg(W, H, shot, copy, withPills) {
  const cx = W / 2;
  const pillRow = withPills ? copy.pills.map((p, i) => {
    const pw = p.length * 19 + 56;
    const total = copy.pills.reduce((s, q) => s + q.length * 19 + 56 + 20, -20);
    let x = cx - total / 2;
    for (let j = 0; j < i; j++) x += copy.pills[j].length * 19 + 56 + 20;
    return `<rect x="${x}" y="492" width="${pw}" height="64" rx="32" fill="${SURFACE}"/>
            <text x="${x + pw / 2}" y="535" font-family="${FONT}" font-size="32" font-weight="600" fill="${ACCENT}" text-anchor="middle">${esc(p)}</text>`;
  }).join('') : '';
  return Buffer.from(`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${W}" height="${H}" fill="${BG}"/>
    <text x="${cx}" y="200" font-family="${FONT}" font-size="92" font-weight="800" fill="${TEXT}" text-anchor="middle" letter-spacing="-2">${esc(shot.h1)}</text>
    <text x="${cx}" y="310" font-family="${FONT}" font-size="92" font-weight="800" fill="${TEXT}" text-anchor="middle" letter-spacing="-2">${esc(shot.h2)}</text>
    <text x="${cx}" y="412" font-family="${FONT}" font-size="40" font-weight="500" fill="${TEXT2}" text-anchor="middle">${esc(shot.cap)}</text>
    ${pillRow}
  </svg>`);
}

function conceptSvg(W, H, kind, copy) {
  const cx = W / 2, cy = H * 0.62;
  if (kind === 'languages') {
    const items = copy.langs;
    const cols = 3, pw = 330, ph = 96, gx = 30, gy = 26;
    const x0 = cx - (cols * pw + (cols - 1) * gx) / 2, y0 = H * 0.34;
    return items.map((l, i) => {
      const x = x0 + (i % cols) * (pw + gx), y = y0 + Math.floor(i / cols) * (ph + gy);
      return `<rect x="${x}" y="${y}" width="${pw}" height="${ph}" rx="48" fill="${WHITE}"/>
              <text x="${x + pw / 2}" y="${y + ph / 2 + 14}" font-family="${FONT}" font-size="38" font-weight="600" fill="${TEXT}" text-anchor="middle">${esc(l)}</text>`;
    }).join('');
  }
  if (kind === 'privacy') {
    return `<circle cx="${cx}" cy="${cy}" r="300" fill="${SURFACE}"/>
      <rect x="${cx - 110}" y="${cy - 60}" width="220" height="190" rx="36" fill="${ACCENT}"/>
      <path d="M ${cx - 62} ${cy - 60} v -40 a 62 62 0 0 1 124 0 v 40" stroke="${ACCENT}" stroke-width="34" fill="none" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${cy + 28}" r="26" fill="${BG}"/>`;
  }
  if (kind === 'backup') {
    return `<circle cx="${cx}" cy="${cy}" r="300" fill="${SURFACE}"/>
      <rect x="${cx - 130}" y="${cy - 170}" width="260" height="340" rx="28" fill="${WHITE}" stroke="${ACCENT}" stroke-width="10"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="${cx - 86}" y="${cy - 110 + i * 64}" width="${i === 3 ? 100 : 172}" height="26" rx="13" fill="${i === 0 ? ACCENT : SURFACE}"/>`).join('')}
      <text x="${cx}" y="${cy + 240}" font-family="${FONT}" font-size="44" font-weight="700" fill="${ACCENT}" text-anchor="middle">.csv</text>`;
  }
  return ''; // closer: icon composited separately
}

async function run() {
  const copy = COPY[locale];
  const iconPath = path.join(import.meta.dirname, '..', 'assets', 'images', 'icon.png');
  for (const { tag, W, H } of SIZES) {
    const outDir = path.join(import.meta.dirname, '..', 'appstore', 'screenshots', 'v1.5', locale, tag);
    fs.mkdirSync(outDir, { recursive: true });
    for (let i = 0; i < copy.shots.length; i++) {
      const shot = copy.shots[i];
      const base = sharp(headerSvg(W, H, shot, copy, i === 0 || i === 9)).png();
      const layers = [];
      if (shot.img) {
        const capPath = path.join(capDir, `${shot.img}.png`);
        const devW = Math.round(W * 0.78);
        const cap = await sharp(capPath).resize({ width: devW }).toBuffer();
        const meta = await sharp(cap).metadata();
        const radius = Math.round(devW * 0.115);
        const mask = Buffer.from(`<svg width="${meta.width}" height="${meta.height}"><rect width="${meta.width}" height="${meta.height}" rx="${radius}" fill="#fff"/></svg>`);
        const rounded = await sharp(cap).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
        const frame = Buffer.from(`<svg width="${W}" height="${H}"><rect x="${(W - devW) / 2 - 6}" y="${i === 0 ? 610 : 530}" width="${devW + 12}" height="${H}" rx="${radius + 6}" fill="#ddd8d0"/></svg>`);
        layers.push({ input: frame, top: 0, left: 0 });
        layers.push({ input: rounded, top: (i === 0 ? 616 : 536), left: Math.round((W - devW) / 2) });
      } else if (shot.concept === 'closer') {
        const icon = await sharp(iconPath).resize(420, 420).toBuffer();
        const mask = Buffer.from(`<svg width="420" height="420"><rect width="420" height="420" rx="94" fill="#fff"/></svg>`);
        const rounded = await sharp(icon).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
        layers.push({ input: rounded, top: Math.round(H * 0.5), left: Math.round(W / 2 - 210) });
      } else {
        layers.push({ input: Buffer.from(`<svg width="${W}" height="${H}">${conceptSvg(W, H, shot.concept, copy)}</svg>`), top: 0, left: 0 });
      }
      const out = path.join(outDir, `${String(i + 1).padStart(2, '0')}-${shot.name}.png`);
      await base.composite(layers).toFile(out);
    }
    console.log(`${locale}/${tag}: ${copy.shots.length} screenshots → ${outDir}`);
  }
}
run().catch((e) => { console.error(e); process.exit(1); });
