import Phaser from 'phaser';
export class PauseScene extends Phaser.Scene{constructor(){super('pause')}create(){document.getElementById('pause-screen')?.classList.remove('hidden');}}
