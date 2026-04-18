import sharp from 'sharp';

const SIZE = 1024;
const BG = '#f5f2ed';
const TEAL = '#5a8f8b';

// Drop path reused for clipping
const DROP = `M 512 170
  C 512 170, 330 400, 330 565
  C 330 665, 410 750, 512 750
  C 614 750, 694 665, 694 565
  C 694 400, 512 170, 512 170 Z`;

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs>
    <clipPath id="rounded">
      <rect width="${SIZE}" height="${SIZE}" rx="224" ry="224"/>
    </clipPath>
    <clipPath id="dropClip">
      <path d="${DROP}"/>
    </clipPath>
    <!-- Left half clip -->
    <clipPath id="leftHalf">
      <rect x="0" y="0" width="512" height="${SIZE}"/>
    </clipPath>
    <!-- Right half clip -->
    <clipPath id="rightHalf">
      <rect x="512" y="0" width="512" height="${SIZE}"/>
    </clipPath>
  </defs>

  <g clip-path="url(#rounded)">
    <!-- Background -->
    <rect width="${SIZE}" height="${SIZE}" fill="${BG}"/>

    <!-- Full outline around the entire drop -->
    <path d="${DROP}" fill="none" stroke="${TEAL}" stroke-width="18"/>

    <!-- RIGHT HALF: filled solid teal -->
    <g clip-path="url(#rightHalf)">
      <path d="${DROP}" fill="${TEAL}"/>
    </g>

    <!-- Graduation ticks from left outline inward, rounded ends -->
    <g clip-path="url(#dropClip)" stroke-linecap="round">
      <!-- Major ticks -->
      <line x1="339" y1="345" x2="480" y2="345" stroke="${TEAL}" stroke-width="28"/>
      <line x1="339" y1="455" x2="480" y2="455" stroke="${TEAL}" stroke-width="28"/>
      <line x1="339" y1="565" x2="480" y2="565" stroke="${TEAL}" stroke-width="28"/>
      <line x1="339" y1="675" x2="480" y2="675" stroke="${TEAL}" stroke-width="28"/>
      <!-- Half ticks -->
      <line x1="339" y1="400" x2="415" y2="400" stroke="${TEAL}" stroke-width="16"/>
      <line x1="339" y1="510" x2="415" y2="510" stroke="${TEAL}" stroke-width="16"/>
      <line x1="339" y1="620" x2="415" y2="620" stroke="${TEAL}" stroke-width="16"/>
    </g>

  </g>
</svg>
`;

const sizes = [
  { name: 'icon', size: 1024 },
  { name: 'adaptive-icon', size: 1024 },
  { name: 'favicon', size: 48 },
  { name: 'splash-icon', size: 200 },
];

for (const { name, size } of sizes) {
  await sharp(Buffer.from(svg))
    .resize(size, size)
    .flatten({ background: '#f5f2ed' })
    .png()
    .toFile(`assets/images/${name}.png`);
  console.log(`✓ ${name}.png (${size}x${size})`);
}

console.log('\nDone.');
