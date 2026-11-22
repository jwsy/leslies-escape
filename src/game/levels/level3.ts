import type { LevelDef } from './types';
// Final climb above the clouds: the ledges narrow and crumbles return, while
// checkpoint nests keep the finale gentle and recoverable.
export const level3:LevelDef={id:3,title:'The Sanctuary',width:4200,height:1200,start:{x:92,y:888},tideStart:1110,tideSpeed:6,platforms:[
 {id:'p0',x:40,y:930,width:190}, {id:'p1',x:285,y:855,width:115,kind:'checkpoint'},
 {id:'p2',x:455,y:780,width:440,kind:'crumble'}, {id:'p3',x:950,y:705,width:115},
 {id:'p4',x:1135,y:630,width:190,kind:'checkpoint'}, {id:'p5',x:1395,y:555,width:440,kind:'crumble'},
 {id:'p6',x:1905,y:480,width:165}, {id:'p7',x:2140,y:405,width:115,kind:'crumble'},
 {id:'p8',x:2325,y:330,width:440,kind:'checkpoint'}, {id:'p9',x:2835,y:255,width:110},
 {id:'p10',x:3015,y:180,width:440,kind:'crumble'}, {id:'p11',x:3525,y:105,width:130,kind:'checkpoint'},
 {id:'p12',x:3725,y:35,width:280,kind:'sanctuary'}
],birds:[
 {id:'skybird-1',x:325,y:820,color:0xf2a7a0}, {id:'skybird-2',x:675,y:745,color:0x91c6dd},
 {id:'skybird-3',x:1195,y:595,color:0xd9a9d7}, {id:'skybird-4',x:1435,y:520,color:0xf2c46c},
 {id:'skybird-5',x:1955,y:445,color:0x9dcead}, {id:'skybird-6',x:2395,y:295,color:0xf2a7a0},
 {id:'skybird-7',x:3075,y:145,color:0x91c6dd}, {id:'skybird-8',x:3570,y:70,color:0xd9a9d7}
],hazards:[{x:675,y:761,width:34},{x:1615,y:536,width:30},{x:2545,y:311,width:30},{x:3235,y:161,width:34}],powers:[
 {id:'sky-glide',x:1205,y:590,kind:'glide'}, {id:'sky-call',x:1995,y:440,kind:'call'},
 {id:'sky-bubble',x:2455,y:290,kind:'bubble'}, {id:'sky-calm',x:3155,y:140,kind:'calm'},
 {id:'sky-spring',x:3570,y:65,kind:'spring'}
]};
