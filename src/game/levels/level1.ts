import type { LevelDef } from './types';
export const level1:LevelDef={id:1,title:'The Shore',width:1560,start:{x:90,y:608},tideStart:758,tideSpeed:5,platforms:[
 {id:'p0',x:20,y:650,width:165},{id:'p1',x:205,y:590,width:125},{id:'p2',x:348,y:532,width:128},{id:'p3',x:494,y:474,width:120,kind:'checkpoint'},
 {id:'p4',x:635,y:416,width:130},{id:'p5',x:787,y:358,width:125,kind:'crumble'},{id:'p6',x:935,y:300,width:145,kind:'checkpoint'},
 {id:'p7',x:1104,y:242,width:180,kind:'sanctuary'},
 // Safe intermediate ledges make each automatic-run jump forgiving.
 {id:'s1',x:286,y:559,width:60},{id:'s2',x:430,y:501,width:55},{id:'s3',x:565,y:445,width:56},{id:'s4',x:711,y:386,width:55},{id:'s5',x:858,y:327,width:55},{id:'s6',x:1020,y:270,width:55}
],birds:[{id:'shorebird-1',x:255,y:557,color:0xf2a7a0},{id:'shorebird-2',x:674,y:382,color:0x91c6dd},{id:'shorebird-3',x:824,y:324,color:0xd9a9d7},{id:'shorebird-4',x:996,y:266,color:0xf2c46c},{id:'shorebird-5',x:1170,y:208,color:0x9dcead}],hazards:[{x:390,y:518,width:26}],powers:[{id:'glide-feather',x:700,y:374,kind:'glide'},{id:'tide-calm',x:1000,y:258,kind:'calm'}]};
