export type PowerKind = 'glide'|'bubble'|'spring'|'call'|'calm'|'rush';
export interface PlatformDef { id:string; x:number; y:number; width:number; kind?:'solid'|'crumble'|'checkpoint'|'sanctuary'; }
export interface BirdDef { id:string; x:number; y:number; color:number; }
export interface PowerDef { id:string; x:number; y:number; kind:PowerKind; }
export interface LevelDef { id:number; title:string; width:number; start:{x:number;y:number}; platforms:PlatformDef[]; birds:BirdDef[]; hazards:{x:number;y:number;width:number}[]; powers:PowerDef[]; tideStart:number; tideSpeed:number; }
