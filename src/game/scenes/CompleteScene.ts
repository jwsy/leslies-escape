import Phaser from 'phaser';
export class CompleteScene extends Phaser.Scene{constructor(){super('complete')}create(data:{count:number;total:number}){document.getElementById('complete-copy')!.textContent=`Leslie and ${data.count} of ${data.total} little birds found a safe home. The flock is together at last!`;document.getElementById('complete')?.classList.remove('hidden');}}
