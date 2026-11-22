import type { LevelDef } from './types';

// Eleven broad ledges form a long, rising diagonal. The gaps are deliberate:
// each asks for a well-timed jump from near an edge, while remaining reachable.
export const level1:LevelDef={id:1,title:'The Shore',width:2700,height:1200,start:{x:92,y:888},tideStart:1120,tideSpeed:5,platforms:[
 {id:'p0',x:40,y:930,width:160},
 {id:'p1',x:250,y:855,width:150},
 {id:'p2',x:460,y:780,width:150},
 {id:'p3',x:670,y:705,width:150},
 {id:'p4',x:880,y:630,width:150,kind:'checkpoint'},
 {id:'p5',x:1090,y:555,width:150},
 {id:'p6',x:1300,y:480,width:150,kind:'crumble'},
 {id:'p7',x:1510,y:405,width:150},
 {id:'p8',x:1720,y:330,width:150,kind:'checkpoint'},
 {id:'p9',x:1930,y:255,width:150},
 {id:'p10',x:2140,y:180,width:180,kind:'sanctuary'}
],birds:[
 {id:'shorebird-1',x:295,y:820,color:0xf2a7a0},
 {id:'shorebird-2',x:935,y:595,color:0x91c6dd},
 {id:'shorebird-3',x:1355,y:445,color:0xd9a9d7},
 {id:'shorebird-4',x:1765,y:295,color:0xf2c46c},
 {id:'shorebird-5',x:1975,y:220,color:0x9dcead}
],hazards:[],powers:[
 {id:'glide-feather',x:960,y:585,kind:'glide'},
 {id:'tide-calm',x:1970,y:220,kind:'calm'}
]};
