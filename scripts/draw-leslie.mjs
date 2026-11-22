// Original artwork, drawn in world pixels and rasterized at 2× for Retina displays.
// Run with node scripts/draw-leslie.mjs (requires rsvg-convert and vips).
import { spawnSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const write = (name, data) => writeFileSync(new URL('../' + name, import.meta.url), data);
function render(executable, args, input) {
  const result = spawnSync(executable, args, {input});
  if (result.error || result.status !== 0) throw result.error ?? Error(result.stderr.toString());
}

function png(svg, file, size) {
  const args = size ? ['-w', String(size), '-h', String(size)] : [];
  const destination = fileURLToPath(new URL('../public/' + file, import.meta.url));
  if (size) {
    render('rsvg-convert', [...args, '-o', destination], svg);
    return;
  }
  const temp = mkdtempSync(join(tmpdir(), 'leslie-art-'));
  try {
    const source = join(temp, 'source.png');
    render('rsvg-convert', ['-o', source], svg);
    render('vips', ['pngsave', source, destination, '--palette', '--Q', '95', '--dither', '0', '--effort', '7']);
  } finally {
    rmSync(temp, {recursive: true, force: true});
  }
}
const ink = '#886778', fur = 'url(#fur)', shade = 'url(#far)';
const line = (color = ink, w = 1.25) => `stroke="${color}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;
const path = (d, fill, outline = '') => `<path d="${d}" fill="${fill}" ${outline}/>`;
const mark = (d, color, w) => path(d, 'none', line(color,w));
const oval = (x,y,rx,ry,fill) => `<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}"/>`;
const group = (art, transform) => `<g transform="${transform}">${art}</g>`;
const place = (art,x,y,angle=0,sx=1,sy=sx) => group(art,`translate(${x} ${y}) rotate(${angle}) scale(${sx} ${sy})`);
const defs = `<defs>
  <linearGradient id="fur" x2=".28" y2="1"><stop stop-color="#fffef9"/><stop offset=".55" stop-color="#fffaf3"/><stop offset=".88" stop-color="#f5e8eb"/><stop offset="1" stop-color="#e6d8e7"/></linearGradient>
  <linearGradient id="far" x2=".4" y2="1"><stop stop-color="#f7e9ec"/><stop offset="1" stop-color="#ceb9d0"/></linearGradient>
  <linearGradient id="lining" x2=".2" y2="1"><stop stop-color="#ffd7cc"/><stop offset=".6" stop-color="#f4a5b2"/><stop offset="1" stop-color="#dc88a6"/></linearGradient>
  <linearGradient id="iris" x2="0" y2="1"><stop stop-color="#8b3c62"/><stop offset=".55" stop-color="#c95a85"/><stop offset="1" stop-color="#ffabc0"/></linearGradient>
  <linearGradient id="silk" x2=".5" y2="1"><stop stop-color="#b8e2d7"/><stop offset="1" stop-color="#75b4aa"/></linearGradient>
  <radialGradient id="coatHighlight"><stop stop-color="#fffef8"/><stop offset=".62" stop-color="#fffdf8" stop-opacity=".9"/><stop offset="1" stop-color="#fffcf6" stop-opacity="0"/></radialGradient>
  <radialGradient id="cheek"><stop stop-color="#f5a5b2"/><stop offset=".59" stop-color="#f7b5bd"/><stop offset="1" stop-color="#f9c6cb" stop-opacity="0"/></radialGradient>
  <radialGradient id="light"><stop stop-color="#ffe5a4" stop-opacity=".64"/><stop offset=".58" stop-color="#ffe7a7" stop-opacity=".39"/><stop offset="1" stop-color="#fff1bd" stop-opacity="0"/></radialGradient>
</defs>`;
const star = path('M0 -4.6 Q.6 -1 3.8 0 Q.8 .7 0 4.6 Q-.6 1 -3.8 0 Q-.7 -.7 0 -4.6Z','#fff0b5',line('#d99c70',.55));
const tail = 'M6 1 C5 6 0 8 -4 6 Q-10 7 -10 2 Q-14 -1 -10 -5 Q-11 -10 -5 -9 Q-1 -14 3 -10 C9 -11 10 -3 6 1Z';
const torso = 'M-30 -2 C-31 -15 -23 -27 -11 -28 C1 -30 13 -22 16 -10 C20 1 16 9 7 11 C-1 14 -13 14 -20 10 Q-30 7 -30 -2Z';

const headShape = path('M-16 -6 Q-17 -11 -12 -13 Q-10 -17 -5 -17 Q-7 -20 -4 -19 Q0 -19 2 -17 Q3 -21 6 -18 Q7 -17 8 -16 C16 -15 18 -8 18 -4 Q24 -3 22 1 C24 7 18 13 12 14 Q4 18 -5 14 Q-14 13 -16 8 Q-20 8 -18 4 C-21 1 -19 -3 -16 -6Z',fur,line())
  + mark('M-12 -9 Q-10 -13 -6 -14','#fff',2);
const openMouth = path('M11 2.7 Q15 4.4 19.2 .8 Q18.8 10.4 13.2 8 Q11.1 6.6 11 2.7Z','#a35670',line('#88475e',.85))
  + path('M13 6.7 Q15.2 4.5 17.4 5.4 Q15.6 9 13 6.7Z','#ffa8b5');
const smile = mark('M19.8 .5 Q19 4.6 16.3 4 Q14.6 5.7 12.8 4.1','#95566c',1.05);
const nose = path('M18.1 -3 Q19.4 -4.5 21.6 -3.8 Q23.4 -4.2 23.1 -2.7 Q22.5 -.7 20.6 -.25 Q18.9 -.8 18.1 -3Z','#de7e93',line('#aa667c',.7))
  + mark('M19.8 -3.2 L21 -3.2','#ffe1dc',.8);
const cuppedPaw = path('M-2 5 Q-6 4 -5 0 Q-6 -5 -2 -5 Q1 -7 4 -4 Q7 -1 4 3 Q2 6 -2 5Z',fur)
  + oval(.4,-.5,2.2,1.8,'#f1c4cc');
function head(mood) {
  const cheerful = ['joy','delight','cheer','joyBlink'].includes(mood);
  let eye;
  if (mood === 'joyBlink') {
    eye = mark('M3 -4 Q7 -.8 11 -4','#89495f',1.6);
  } else if (cheerful) {
    // A single soft, peaked ^ in profile, as in the Korean happy-eye emoticon ^^.
    eye = mood === 'delight' ? mark('M2.4 -3.3 L6.8 -7.5 Q7.3 -8 7.8 -7.4 L11.8 -3.8 M2 -4.9 L3.2 -4.6','#873e5b',2.1)
      : mark('M3.3 -2.8 L7.2 -8.1 Q7.6 -8.6 8 -8 L11.5 -3.4','#803e5b',2.15);
  } else if (mood === 'blink') {
    eye = mark('M3.6 -4.1 Q7.2 -.9 10.9 -4.4','#89495f',1.6);
  } else {
    const calm = mood === 'calm', wide = mood === 'wonder';
    eye = place(oval(0,0,4.35,5.25,'url(#iris)') + mark('M-4.1 -.7 Q-3.9 -5.7 .5 -5.1 Q2.7 -5 3.7 -3','#85435f',1.15)
      + oval(-1.1,-2.2,1.4,1.5,'#fffaf5') + oval(1.7,2.3,.8,.9,'#ffe2df'),7.6,-4.8,-5,1,calm?.72:wide?1.09:1);
    if (wide || mood === 'curious') eye += mark('M3 -12 Q5 -13.6 7.5 -13','#b293a0',1);
  }
  const mouth = cheerful ? openMouth : mood === 'wonder' ? oval(16.4,4.9,1.8,2.05,'#aa607a') : smile;
  const paws = mood === 'cheer' ? place(cuppedPaw,16,11,22,.82) + place(cuppedPaw,-3,11,-25) : '';
  return headShape + oval(-.2,4.3,cheerful?9.6:8.1,cheerful?5.8:4.9,'url(#cheek)')
    + mark('M-1.6 4.4 l.65 -1.1 M.8 4.8 l.7 -1.2','#dd859e',.85)
    + eye + mouth + nose + mark('M13 1 l.1 0 M15 .5 l.1 0','#c19aa3',1) + paws;
}

// A tapered ribbon along a cubic spine. Each key drawing places the ear bend and
// the tip independently. The second ribbon is inset to form the pink lining.
function ear(bendX,bendY,tipX,tipY,far) {
  const cx = bendX*.42+3, cy = bendY*.88;
  function ribbon(from,to,width) {
    const left=[], right=[];
    for(let i=0;i<=32;i++){
      const u=i/32, t=from+(to-from)*u, s=1-t;
      const x=3*s*s*t*cx + 3*s*t*t*bendX + t*t*t*tipX;
      const y=3*s*s*t*cy + 3*s*t*t*bendY + t*t*t*tipY;
      const dx=3*(s*s*cx+2*s*t*(bendX-cx)+t*t*(tipX-bendX));
      const dy=3*(s*s*cy+2*s*t*(bendY-cy)+t*t*(tipY-bendY));
      const radius=width*Math.pow(Math.sin(Math.PI*u),.48)*(.75+.46*u)/Math.hypot(dx,dy);
      left.push(`${(x-dy*radius).toFixed(2)} ${(y+dx*radius).toFixed(2)}`);
      right.push(`${(x+dy*radius).toFixed(2)} ${(y-dx*radius).toFixed(2)}`);
    }
    return 'M'+left.concat(right.reverse()).join(' L')+'Z';
  }
  return path(ribbon(0,1,far?4.45:5.55),far?shade:fur,line(far?'#a38899':ink,1.2))
    + path(ribbon(.14,.89,far?2.2:3),'url(#lining)');
}

// Side-view leg silhouettes. The haunch flows directly into the long back foot.
const hind = {
  fold:'M-7 -4 C-1 -10 7 -5 6 1 Q5 4 2 5 Q8 3 10 6 Q11 9 7 10 L-3 10 C-11 10 -13 1 -7 -4Z',
  drive:'M-6 -5 Q2 -8 5 -2 Q8 4 1 7 L-13 12 Q-18 13 -18 10 Q-18 8 -15 7 L-7 2 Q-10 -1 -6 -5Z',
  trail:'M-7 -5 Q2 -9 6 -3 Q8 2 2 6 Q-6 11 -16 8 L-20 6 Q-22 3 -18 3 L-8 4 Q-11 0 -7 -5Z',
  gather:'M-7 -5 Q0 -9 5 -4 Q7 0 4 4 L11 1 Q16 0 15 4 Q13 8 4 10 C-4 13 -13 6 -7 -5Z',
};
const fore = {
  stand:'M-3 -4 Q0 -7 3 -3 L5 4 Q10 4 10 7 Q10 9 6 9 L2 9 Q-1 8 -2 4Z',
  tuck:'M-4 -3 Q-1 -6 2 -3 L4 0 Q8 -4 10 -1 Q11 2 7 5 Q3 8 0 5Z',
  reach:'M-4 -3 Q-1 -6 3 -2 L9 2 Q14 1 15 4 Q16 7 11 7 Q4 8 -1 4Z',
  raise:'M-3 3 Q-6 0 -3 -3 Q0 -5 4 -6 Q5 -13 8 -12 Q12 -11 11 -6 Q11 0 6 2 Q1 6 -3 3Z',
};
// Outline the combined silhouette first, then cover every internal overlap with
// one coat colour. The soft highlight sits inside the rump across all limb poses.
function coat(shapes) {
  const silhouette = shapes.join('');
  return `<g fill="${ink}" ${line(ink, 2.2)}>${silhouette}</g><g fill="#f7eff0">${silhouette}</g>`;
}
const shape = (d, x, y, angle = 0) => place(`<path d="${d}"/>`, x, y, angle);
const pads = {
  drive: place(oval(0,0,2.6,1.1,'#efc3cc'),-13.3,9.1,-19),
  trail: place(oval(0,0,2.7,1.1,'#efc3cc'),-15.1,5.7,9),
};
const scarf = path('M0 -5 Q-5 -8 -12 -7 L-16 -8 Q-14 -4 -10 -2 L-14 1 Q-7 2 -2 -1Z','#83c5b9',line('#698f91',.9))
  + path('M-4 -9 Q4 -2 13 -8 L12 -3 Q4 1 -4 -3Z','url(#silk)',line('#709b98',.95))
  + place(star,-3,-4,8,.74);

// Root of the shot is the Arcade sprite's centre. The standing sole is at y=17.
// Each drawing specifies a head socket, the spine of each ear, and a pair of leg silhouettes.
const ears = {
  perk:[[-13,-31,-25,-22],[-1,-32,-10,-27]],
  listen:[[-12,-32,-22,-21],[3,-34,-5,-31]],
  folded:[[-16,-20,-28,-10],[-9,-22,-22,-9]],
  stream:[[-18,-22,-27,-16],[-20,-12,-33,1]],
  loose:[[-15,-24,-26,-19],[-12,-20,-26,-10]],
  lift:[[-8,-32,-18,-32],[4,-36,-5,-38]],
  float:[[-21,-4,-39,6],[-21,13,-44,20]],
};
function drawing(headX,headY,tilt,earStyle,hindKey,foreKey, opts={}) {
  const {bodyY=2,bodyX=-2,sx=1,sy=1,tailAngle=0,hindAngle=0,foreAngle=0,farForeAngle=foreAngle-18,
    farHindAngle=hindAngle+13, nearTip=0,farTip=0,earTilt=0,nearForeY=5, hindY=5} = opts;
  const [far,near]=ears[earStyle];
  const earPair=place(ear(far[0],far[1],far[2],far[3]+farTip,true),-6,-10,earTilt+(['perk','listen','lift'].includes(earStyle)?-7:17))
    +place(ear(near[0],near[1],near[2],near[3]+nearTip,false),-2,-10,earTilt);
  const body = coat([
    shape(tail,-29,-2,tailAngle),
    shape(hind[hindKey],-11,hindY-1,farHindAngle),
    shape(fore[foreKey],12,nearForeY-2,farForeAngle),
    shape(torso,0,0),
    shape(hind[hindKey],-14,hindY,hindAngle),
    shape(fore[foreKey],10,nearForeY,foreAngle),
  ]) + oval(-8,-8,21,18,'url(#coatHighlight)')
    + place(oval(-3,-3,6,5,'url(#coatHighlight)'),-29,-2,tailAngle)
    + place(pads[hindKey] ?? '',-14,hindY,hindAngle);
  return {art:place(body,bodyX,bodyY,0,sx,sy)+place(earPair,headX,headY,tilt)
    +place(scarf,headX-8,headY+18,tilt*.35), socket:[headX,headY,tilt]};
}
const d=drawing;
const sitting=d(7,-8,-5,'perk','fold','stand');
const squash=d(11,-4,6,'folded','fold','stand',{sx:1.09,sy:.77,bodyY:5});
const longLeap=d(10,-12,-12,'stream','drive','reach',{bodyX:-3,sy:.88,hindAngle:-11,foreAngle:-34,tailAngle:-17});
const hover=d(9,-11,-9,'loose','gather','tuck',{bodyY:0,foreAngle:-25,hindAngle:-8,nearTip:-4});
const falling=d(10,-7,6,'lift','fold','reach',{foreAngle:35,nearForeY:6,hindAngle:13,tailAngle:-20});
const cheer=d(5,-15,-14,'listen','fold','raise',{bodyX:-3,sx:.83,sy:1.14,foreAngle:-15,nearForeY:2});
const clips = {
  idle:[sitting,d(7,-8.7,-7,'listen','fold','stand',{sy:1.025,nearTip:2}),d(7,-9.2,-8,'listen','fold','stand',{sy:1.045,farTip:2}),d(7,-8.6,-6,'perk','fold','stand',{sy:1.02,nearTip:2})],
  // Forefoot contact, weight catch, hind feet pass, compression, drive, flight, reach.
  run:[
    d(11,-7,4,'loose','trail','reach',{foreAngle:33,hindAngle:14,bodyY:0,nearForeY:5}),
    d(10,-5,7,'folded','gather','stand',{sy:.87,bodyY:4,foreAngle:12,farTip:-4}),
    d(8,-6,2,'folded','gather','tuck',{sx:.94,bodyY:2,hindAngle:6,nearTip:5}),
    d(9,-8,-5,'loose','fold','tuck',{bodyY:1,nearTip:6,farTip:4}),
    d(11,-11,-8,'loose','drive','tuck',{sx:1.04,bodyY:0,hindAngle:-14,nearTip:4}),
    d(12,-13,-7,'stream','trail','reach',{bodyY:-2,sy:.88,foreAngle:-20,hindAngle:12}),
    d(12,-12,-2,'stream','trail','reach',{bodyY:-2,sy:.9,nearTip:-4,hindAngle:15}),
    d(12,-9,2,'loose','drive','reach',{bodyY:-1,foreAngle:16,farTip:-6})
  ],
  takeoff:[squash,d(10,-9,-8,'folded','drive','tuck',{bodyY:0,sy:.94}),longLeap],
  ascent:[longLeap,d(10,-12,-13,'stream','drive','tuck',{hindAngle:4,foreAngle:-28,nearTip:-5,bodyY:-1})],
  apex:[hover,d(9,-11,-6,'loose','gather','tuck',{bodyY:-1,nearTip:-6,farTip:-3})],
  fall:[falling,d(10,-6,8,'lift','fold','reach',{nearTip:3,earTilt:7,foreAngle:34,hindAngle:17})],
  land:[squash,d(10,-3,7,'folded','gather','stand',{sx:1.12,sy:.73,bodyY:5,nearTip:5}),d(8,-8,-3,'loose','fold','stand',{nearTip:7}),sitting],
  swim:Array.from({length:8},(_,i)=>{
    const beat=i*Math.PI/4,stroke=Math.sin(beat);
    return d(11,2+Math.cos(beat)*.6,-5,'float','drive','reach',{bodyX:-4,bodyY:9,sx:1.01,sy:.69,
      foreAngle:27+48*stroke,farForeAngle:27-48*stroke,hindAngle:-6-16*stroke,farHindAngle:-6+16*stroke,
      nearTip:4+2*Math.sin(beat-.7),farTip:3+2*Math.sin(beat+.5),earTilt:-8});
  }),
  celebrate:[squash,d(6,-12,-10,'loose','gather','raise',{bodyY:-1,sy:1.04,nearForeY:1}),d(5,-18,-17,'listen','gather','raise',{bodyY:-6,sy:1.03,nearForeY:2,nearTip:4}),d(6,-17,-13,'perk','fold','raise',{bodyY:-3,nearForeY:1}),cheer],
};
const glow=oval(0,0,38,35,'url(#light)');
const wake=mark('M-30 1 Q-22 -2 -14 0 M-17 2 Q-6 5 6 3 M12 1 Q18 -1 26 0','#d9faf2',1.8)
  +mark('M-26 3 Q-19 5 -12 4 M16 3 Q20 2 24 2','#84cbcd',1.2);
function portrait(mood) {
  return group(place(glow,0,-5) + longLeap.art + place(head(mood),...longLeap.socket) + place(star,36,-25) + place(star,-30,9,5,.68),'translate(0 0)');
}

const cells=[];
const add=art=>{cells.push(art);return cells.length-1;};
const poses={};
for(const [state,drawings] of Object.entries(clips)){
  poses[state]=drawings.map(({art,socket})=>({frame:add(art),x:socket[0],y:socket[1],angle:socket[2]}));
}
const heads=Object.fromEntries(['curious','happy','joy','wonder','calm','blink','delight','cheer'].map(mood=>[mood,add(head(mood))]));
const effects={glow:add(glow),wake:add(wake),star:add(star),speck:add(oval(0,0,1.55,1.55,'#ffedc2'))};
const cell=104, pivotY=65, columns=8;
// Portraits occupy the last two cells for the title and completion screens.
while(cells.length%columns!==columns-2) add('');
add(portrait('joy'));add(portrait('joyBlink'));
const rows=cells.length/columns, width=columns*cell, height=rows*cell;
const sheet=`<svg xmlns="http://www.w3.org/2000/svg" width="${width*2}" height="${height*2}" viewBox="0 0 ${width} ${height}">${defs}${cells.map((art,i)=>place(art,(i%columns+.5)*cell,Math.floor(i/columns)*cell+pivotY)).join('')}</svg>`;
png(sheet,'sprites/leslie.png');
write('src/game/characters/leslieFrames.json', JSON.stringify({cell:cell*2,pivotY:pivotY/cell,poses,heads,effects},null,2)+'\n');
const icon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="-42 -42 84 84">${defs}<rect x="-42" y="-42" width="84" height="84" fill="#f2ccca"/>${place(portrait('joy'),2,5,0,.82)}</svg>\n`;
write('public/icons/bunny.svg',icon);
for(const size of [192,512]) png(icon,`icons/bunny-${size}.png`,size);
