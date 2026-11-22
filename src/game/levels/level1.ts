import type { LevelDef } from './types';

// Eleven broad ledges form a long, rising diagonal. The gaps are deliberate:
// each asks for a well-timed jump from near an edge, while remaining reachable.
export const level1:LevelDef={id:1,title:'The Shore',width:2700,height:1200,start:{x:92,y:888},tideStart:1120,tideSpeed:5,platforms:[
 {id:'p0',x:40,y:930,width:150},
 {id:'p1',x:275,y:855,width:115},
 {id:'p2',x:510,y:780,width:115},
 {id:'p3',x:745,y:705,width:115},
 {id:'p4',x:980,y:630,width:115,kind:'checkpoint'},
 {id:'p5',x:1215,y:555,width:115},
 {id:'p6',x:1450,y:480,width:115,kind:'crumble'},
 {id:'p7',x:1685,y:405,width:115},
 {id:'p8',x:1920,y:330,width:115,kind:'checkpoint'},
 {id:'p9',x:2155,y:255,width:115},
 {id:'p10',x:2390,y:180,width:180,kind:'sanctuary'}
],birds:[
 {id:'shorebird-1',x:322,y:820,color:0xf2a7a0},
 {id:'shorebird-2',x:1035,y:595,color:0x91c6dd},
 {id:'shorebird-3',x:1505,y:445,color:0xd9a9d7},
 {id:'shorebird-4',x:1970,y:295,color:0xf2c46c},
 {id:'shorebird-5',x:2245,y:220,color:0x9dcead}
],hazards:[],powers:[
 {id:'glide-feather',x:1060,y:585,kind:'glide'},
 {id:'tide-calm',x:2240,y:220,kind:'calm'}
]};
