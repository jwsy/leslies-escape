import type { LevelDef } from './types';
// A windy, branching-feeling ascent. Every jump remains within the same
// forgiving auto-run arc as The Shore; long ledges offer room to time jumps.
export const level2:LevelDef={id:2,title:'The Cliffs',width:3800,height:1200,start:{x:92,y:888},tideStart:1110,tideSpeed:4,platforms:[
 {id:'p0',x:40,y:930,width:175}, {id:'p1',x:270,y:855,width:110},
 {id:'p2',x:435,y:780,width:440}, {id:'p3',x:930,y:705,width:105,kind:'checkpoint'},
 {id:'p4',x:1105,y:630,width:170,kind:'crumble'}, {id:'p5',x:1345,y:555,width:440},
 {id:'p6',x:1855,y:480,width:160}, {id:'p7',x:2085,y:405,width:110,kind:'checkpoint'},
 {id:'p8',x:2265,y:330,width:180,kind:'crumble'}, {id:'p9',x:2515,y:255,width:440},
 {id:'p10',x:3025,y:180,width:160}, {id:'p11',x:3255,y:105,width:120,kind:'checkpoint'},
 {id:'p12',x:3445,y:35,width:250,kind:'sanctuary'}
],birds:[
 {id:'cliffbird-1',x:300,y:820,color:0xf2a7a0}, {id:'cliffbird-2',x:975,y:670,color:0x91c6dd},
 {id:'cliffbird-3',x:1155,y:595,color:0xd9a9d7}, {id:'cliffbird-4',x:1895,y:445,color:0xf2c46c},
 {id:'cliffbird-5',x:2130,y:370,color:0x9dcead}, {id:'cliffbird-6',x:2315,y:295,color:0xf2a7a0},
 {id:'cliffbird-7',x:3085,y:145,color:0x91c6dd}
],hazards:[{x:655,y:761,width:34},{x:1565,y:536,width:30},{x:2735,y:236,width:34}],powers:[
 {id:'cliff-bubble',x:1185,y:590,kind:'bubble'}, {id:'cliff-spring',x:1925,y:440,kind:'spring'},
 {id:'cliff-call',x:2355,y:290,kind:'call'}, {id:'cliff-rush',x:3095,y:140,kind:'rush'}
]};
