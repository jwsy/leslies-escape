import Phaser from 'phaser';
import { registerSW } from 'virtual:pwa-register';
import { LevelScene } from './game/scenes/LevelScene';
import { PauseScene } from './game/scenes/PauseScene';
import { CompleteScene } from './game/scenes/CompleteScene';
import { SaveSystem } from './game/systems/SaveSystem';
import { AudioSystem } from './game/systems/AudioSystem';
import './styles/main.css';

export const audio=new AudioSystem();
let game:Phaser.Game|undefined;
const $=(id:string)=>document.getElementById(id)!;
function setVisible(id:string,on:boolean){$(id).classList.toggle('hidden',!on)}
function isLandscape(){return window.matchMedia('(orientation: landscape)').matches&&window.innerWidth>window.innerHeight}
function syncOrientationControls(){const allowed=isLandscape();for(const id of ['play','continue','replay'])($(id) as HTMLButtonElement).disabled=!allowed;setVisible('orientation-hint',!allowed)}
function start(continued=false){syncOrientationControls();if(!isLandscape())return;audio.tone(500,.08);document.documentElement.requestFullscreen?.().catch(()=>{});try{(screen.orientation as ScreenOrientation & {lock?:(orientation:string)=>Promise<void>}).lock?.('landscape').catch(()=>{});}catch{};setVisible('menu',false);setVisible('hud',true);setVisible('pause-screen',false);setVisible('complete',false);syncOrientationHint();if(game){game.destroy(true);game=undefined;}game=new Phaser.Game({type:Phaser.AUTO,parent:'game',width:960,height:540,backgroundColor:'#F8C9B6',scale:{mode:Phaser.Scale.FIT,autoCenter:Phaser.Scale.CENTER_BOTH},render:{antialias:true,roundPixels:false},physics:{default:'arcade',arcade:{debug:false}},scene:[LevelScene,PauseScene,CompleteScene]});game.scene.start('level',{continue:continued});}
function returnTitle(){if(game){game.destroy(true);game=undefined;}setVisible('menu',true);setVisible('hud',false);setVisible('pause-screen',false);setVisible('complete',false);setVisible('continue',!!SaveSystem.load());syncOrientationControls();syncOrientationHint();document.exitFullscreen?.().catch(()=>{});}
function pause(){const level=game?.scene.getScene('level') as LevelScene|undefined;if(level?.scene.isActive()){($('pause-volume') as HTMLInputElement).value=String(audio.volume);level.pause();}}
function resume(){document.getElementById('pause-screen')?.classList.add('hidden');game?.scene.resume('level');game?.scene.stop('pause');}
function syncVolume(v:string){audio.setVolume(Number(v));}
function syncOrientationHint(){setVisible('rotate-nudge',!$('hud').classList.contains('hidden')&&window.matchMedia('(orientation: portrait) and (max-width: 1100px)').matches)}
function setup(){const save=SaveSystem.load();setVisible('continue',!!save);$('play').addEventListener('click',()=>{if(SaveSystem.load()&&!confirm('Start a new adventure? Your saved flock and checkpoint will be replaced.'))return;SaveSystem.clear();start(false)});$('continue').addEventListener('click',()=>start(true));$('settings').addEventListener('click',()=>setVisible('settings-panel',$('settings-panel').classList.contains('hidden')));$('reduced').addEventListener('change',e=>document.documentElement.classList.toggle('reduced-motion',(e.target as HTMLInputElement).checked));$('pause').addEventListener('click',pause);$('mute').addEventListener('click',()=>{audio.setMuted(!audio.muted);$('mute').textContent=audio.muted?'×':'♪';});$('resume').addEventListener('click',resume);$('checkpoint').addEventListener('click',()=>{const level=game?.scene.getScene('level') as LevelScene|undefined;level?.restartCheckpoint();resume()});$('title').addEventListener('click',returnTitle);$('replay').addEventListener('click',()=>{SaveSystem.clear();setVisible('complete',false);start(false)});$('home').addEventListener('click',returnTitle);$('volume').addEventListener('input',e=>syncVolume((e.target as HTMLInputElement).value));$('pause-volume').addEventListener('input',e=>{syncVolume((e.target as HTMLInputElement).value);($('volume') as HTMLInputElement).value=(e.target as HTMLInputElement).value});document.addEventListener('keydown',e=>{if(e.key==='Escape'&&game?.scene.isActive('level'))pause()});const updateOrientation=()=>{syncOrientationControls();syncOrientationHint()};window.addEventListener('resize',updateOrientation);window.addEventListener('orientationchange',updateOrientation);syncOrientationControls();
 if('serviceWorker'in navigator){registerSW({immediate:true,onRegisteredSW:(_url:string,reg:ServiceWorkerRegistration|undefined)=>{if(reg)reg.update();}});navigator.serviceWorker.ready.then(()=>{$('offline').textContent='● Offline-ready · progress saves on this device';}).catch(()=>{$('offline').textContent='Offline setup will finish after install';});}else $('offline').textContent='Offline play is unavailable in this browser';}
setup();
