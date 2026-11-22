// Run with Node and librsvg's rsvg-convert to regenerate Leslie's sprite sheet and icons.
import { spawnSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const fur = (id) => `url(#${id})`;
const outline = '#ad93ab';
const ink = '#944765';
const stroke = (color = outline, width = 1.15) =>
  `stroke="${color}" stroke-width="${width}" stroke-linecap="round" stroke-linejoin="round"`;
const path = (d, fill, line = '') => `<path d="${d}" fill="${fill}" ${line}/>`;
const ellipse = (x, y, rx, ry, fill) =>
  `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const place = (art, x, y, angle = 0, scale = 1) =>
  `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${scale})">${art}</g>`;

const glow = ellipse(0, 0, 34, 33, fur('glow'));
const tail = path('M5 1C5 5 1 7-3 6C-8 5-9 1-7-2Q-6-5-3-5Q0-8 3-5Q6-4 5 1Z', fur('shade'), stroke())
  + ellipse(-3, -3, 2.5, 1.3, '#fffdf9');

const farEar = path('M-3 1C-6-7-7-16-5-23C-3-29 2-31 5-26C8-20 6-13 4-7L3 2Z', fur('shade'), stroke('#b09bb1'))
  + path('M0-4C-3-13-4-22 0-25C4-27 5-18 2-9L1-4Z', fur('ear'));
const nearEar = path('M-4 2C-5-7-7-15-9-20C-12-27-10-33-5-32C0-31 5-25 6-19C7-13 2-5 3 2Z', fur('white'), stroke())
  + path('M-2-4C-4-12-6-18-7-23C-9-29-6-30-3-27C1-24 4-19 3-15C2-10 0-6 0-4Q-1-2-2-4Z', fur('ear'))
  + path('M-3-26Q1-22 2-18', 'none', stroke('#ffd9df', 1));

const torso = path('M-18 4C-18-5-11-12-1-12C8-12 16-8 16 1C17 11 9 13 0 13C-10 13-17 11-18 4Z', fur('white'), stroke())
  + path('M-13 2Q-13-5-6-7', 'none', stroke('#ffffff', 1.8))
  + path('M-14 7C-10 11 2 12 10 7Q7 12-2 12Q-11 12-14 7Z', '#eee1ed');

const head = path('M-14 3C-17-6-10-16-1-16.5C8-17.5 14-12 14.5-5.4C18.5-4.5 19.6-1.3 17.8 2C20.1 8.3 13.8 13.5 5.1 13.5C-4.6 14.9-13 10.7-14 3Z', fur('white'), stroke())
  + path('M-10-6Q-7-13 1-13.3', 'none', stroke('#ffffff', 2.05));

const hindPaw = path('M-8 0C-8-3-6-6-2-6C1-6 2-3 5-3Q9-3 9 1C9 4 4 5-1 5C-5 5-9 4-8 0Z', fur('white'), stroke())
  + path('M5-1Q6 0 6 1.5', 'none', stroke('#dac2d6', .85));
const forePaw = path('M-4-5C-1-7 4-6 4-2L4 0Q9 0 9 3C9 6 3 7 0 6C-3 5-6-2-4-5Z', fur('white'), stroke())
  + path('M5 2Q6 2.5 6 4', 'none', stroke('#dac2d6', .85));

const nose = path('M14-2.7C15-3.7 17-3.2 17.2-2.1C17.4-.9 15.4.2 14.8-.2C14.2-.5 13.5-1.8 14-2.7Z', '#cf6c8a')
  + ellipse(15.7, -2.55, .75, .4, '#ffe4eb');
const eye = (x, y, rx, ry) => ellipse(x, y, rx, ry, fur('eye'))
  + ellipse(x + .95, y - 1.55, 1.12, 1.3, '#fff9fc')
  + ellipse(x - 1.05, y + 1.9, .66, .73, '#ffd3e1');
const cheek = (opacity = 1) => `<g opacity="${opacity}">${ellipse(5.15, 5.1, 6.75, 4.35, fur('blush'))}${path('M3.3 5.5L4 4.4M5.1 5.7L5.8 4.6M6.9 5.5L7.6 4.4', 'none', stroke('#e58da9', .8))}</g>`;
const smile = path('M15.2.2Q14.4 4.4 10.8 3.7', 'none', stroke(ink, 1.05));
const openSmile = path('M15.1.4C14.5 2.2 12.1 3 9.1 2.7C9.8 8.7 16.9 7.4 15.1.4Z', '#a64e70', stroke(ink, .65))
  + path('M10.4 5.8Q12.5 3.9 14.6 5.5Q12.8 7.5 10.4 5.8Z', '#f29db5');

const neutral = eye(5.3, -3.4, 3.2, 4.2) + cheek(.76) + nose + smile;
const happy = eye(5.6, -3.8, 3.15, 4) + cheek(.95) + nose
  + path('M15.3.2Q14.1 5.4 10 3.1', 'none', stroke(ink, 1.2));
const joyful = eye(5.55, -4, 3.35, 4.35) + cheek() + nose + openSmile;
const surprised = eye(5.6, -3.8, 3.4, 4.55) + cheek(.84) + nose
  + ellipse(12.7, 3.6, 1.65, 1.8, '#a65473') + ellipse(12.9, 4.15, .75, .6, '#e998b1');
const calm = eye(5.6, -2.8, 2.85, 3.1) + cheek(.72) + nose + smile;
const closedEye = path('M2.6-3.7Q5.4-.9 8.3-3.85', 'none', stroke(ink, 1.3));
const blink = closedEye + cheek() + nose + smile;
const delighted = path('M2.6-2.6Q5.3-8.1 8.5-2.8', 'none', stroke(ink, 1.5)) + cheek() + nose + openSmile;

const ripple = path('M-33 0Q-23-3-13-1Q1 2 10 0Q22-3 32 0Q23 0 12 3Q-1 5-13 2Q-27 1-33 3Z', fur('ripple'))
  + path('M-22 2Q-15 1-8 3M12 2Q18 1 23 1', 'none', stroke('#dcfaf4', 1.05));
const sparkle = path('M0-5Q.8-.7 4 0Q.8.8 0 5Q-.8.8-4 0Q-.8-.7 0-5Z', '#fff2c3')
  + ellipse(0, 0, .85, .85, '#fffdfa');
const smallSparkle = ellipse(0, 0, 1.65, 1.65, '#fff3d7');

function jumpingPoster(expression) {
  const bunny = place(tail, -19, 5, -10)
    + place(hindPaw, -9, 13, 29)
    + place(forePaw, 10, 0, -38)
    + place(farEar, 0, -19, -74)
    + place(torso, -2, 2)
    + place(hindPaw, -11, 12, 39)
    + place(nearEar, 7, -20, -39)
    + place(head + expression, 9, -9, -4)
    + place(forePaw, 15, 5, -54);
  const stars = path('M0-5Q.9-.8 4.1 0Q.9.9 0 5Q-.9.9-4.1 0Q-.9-.8 0-5Z', '#ffd580', stroke('#eab272', .48));
  return glow + place(bunny, 0, 4, -13, .95)
    + place(stars, 25, -16, 10) + place(stars, -23, 12, -12, .77)
    + ellipse(-27, 5, 1.35, 1.35, '#efbb9d');
}

// Cells are 144×144 at 2×. Keep this order in sync with LeslieView.ts.
const cells = [
  glow, tail, farEar, nearEar, torso,
  head, hindPaw, forePaw, neutral, happy,
  joyful, surprised, calm, blink, delighted,
  ripple, sparkle, smallSparkle, jumpingPoster(joyful), jumpingPoster(closedEye + cheek() + nose + openSmile),
];
const definitions = `
  <radialGradient id="glow"><stop stop-color="#ffe8b2" stop-opacity=".68"/><stop offset=".58" stop-color="#ffebbb" stop-opacity=".41"/><stop offset="1" stop-color="#fff5db" stop-opacity="0"/></radialGradient>
  <linearGradient id="white" x1=".25" y1="0" x2=".62" y2="1" gradientUnits="objectBoundingBox"><stop stop-color="#fffefa"/><stop offset=".58" stop-color="#fffcf7"/><stop offset="1" stop-color="#eaddf0"/></linearGradient>
  <linearGradient id="shade" x1=".3" y1="0" x2=".65" y2="1"><stop stop-color="#f9ecf6"/><stop offset="1" stop-color="#d8c4dc"/></linearGradient>
  <linearGradient id="ear" x1="0" y1="0" x2=".8" y2="1"><stop stop-color="#f8c3d0"/><stop offset="1" stop-color="#e691af"/></linearGradient>
  <linearGradient id="eye" x1="0" y1="0" x2="0" y2="1"><stop stop-color="#9e3d67"/><stop offset="1" stop-color="#e782aa"/></linearGradient>
  <radialGradient id="blush"><stop stop-color="#f28faf" stop-opacity=".86"/><stop offset="1" stop-color="#f4a8bc" stop-opacity="0"/></radialGradient>
  <linearGradient id="ripple"><stop stop-color="#a6e7e9" stop-opacity="0"/><stop offset=".2" stop-color="#9edce6" stop-opacity=".83"/><stop offset=".78" stop-color="#b9edf0" stop-opacity=".81"/><stop offset="1" stop-color="#b9edf0" stop-opacity="0"/></linearGradient>`;
const sheet = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="576" viewBox="0 0 360 288">
  <defs>${definitions}</defs>
  ${cells.map((cell, i) => place(cell, (i % 5) * 72 + 36, Math.floor(i / 5) * 72 + 36)).join('\n')}
</svg>`;

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-36 -36 72 72">
  <defs>${definitions}
    <linearGradient id="icon-bg" x1="0" y1="0" x2=".9" y2="1">
      <stop stop-color="#f9cdbd"/><stop offset="1" stop-color="#e8b9d8"/>
    </linearGradient>
  </defs>
  <rect x="-36" y="-36" width="72" height="72" fill="url(#icon-bg)"/>
  ${place(jumpingPoster(joyful), 0, 0, 0, .93)}
</svg>
`;

const publicFile = (file) => fileURLToPath(new URL(`../public/${file}`, import.meta.url));
function renderPng(svg, file, dimensions = []) {
  const args = [...dimensions, '--output', publicFile(file)];
  const result = spawnSync('rsvg-convert', args, { input: svg, stdio: ['pipe', 'inherit', 'inherit'] });
  if (result.error) throw result.error;
  if (result.status !== 0) throw new Error(`rsvg-convert failed for ${file}`);
}

renderPng(sheet, 'sprites/leslie.png');
writeFileSync(publicFile('icons/bunny.svg'), icon);
for (const size of ['192', '512']) {
  renderPng(icon, `icons/bunny-${size}.png`, ['--width', size, '--height', size]);
}
