import type { LevelDef } from './types';

// Eleven broad ledges form a long, rising diagonal. The gaps are deliberate:
// each asks for a well-timed jump from near an edge, while remaining reachable.
export const level1:LevelDef={id:1,title:'The Shore',width:2700,height:1200,start:{x:92,y:888},tideStart:1120,tideSpeed:5,platforms:[
 {id:'p0',x:40,y:930,width:175},
 {id:'p1',x:270,y:855,width:130},
 {id:'p2',x:455,y:780,width:180},
 {id:'p3',x:690,y:705,width:125},
 {id:'p4',x:870,y:630,width:170,kind:'checkpoint'},
 {id:'p5',x:1095,y:555,width:140},
 {id:'p6',x:1290,y:480,width:185,kind:'crumble'},
 {id:'p7',x:1530,y:405,width:125},
 {id:'p8',x:1710,y:330,width:175,kind:'checkpoint'},
 {id:'p9',x:1940,y:255,width:135},
 {id:'p10',x:2130,y:180,width:220,kind:'sanctuary'}
],birds:[
 {id:'shorebird-1',x:315,y:820,color:0xf2a7a0},
 {id:'shorebird-2',x:925,y:595,color:0x91c6dd},
 {id:'shorebird-3',x:1370,y:445,color:0xd9a9d7},
 {id:'shorebird-4',x:1760,y:295,color:0xf2c46c},
 {id:'shorebird-5',x:1980,y:220,color:0x9dcead}
],hazards:[],powers:[
 {id:'glide-feather',x:990,y:585,kind:'glide'},
 {id:'tide-calm',x:2040,y:220,kind:'calm'}
]};
