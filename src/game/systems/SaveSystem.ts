export interface SaveData { version:1; rescued:string[]; checkpoint:string; waterY:number; powers:string[]; }
const KEY='leslies-escape-save-v1';
export const SaveSystem={load():SaveData|null{try{const s=localStorage.getItem(KEY);if(!s)return null;const d=JSON.parse(s) as SaveData;return d?.version===1&&Array.isArray(d.rescued)&&typeof d.checkpoint==='string'?d:null;}catch{return null;}},save(d:SaveData){try{localStorage.setItem(KEY,JSON.stringify(d));}catch{}},clear(){try{localStorage.removeItem(KEY);}catch{}}};
