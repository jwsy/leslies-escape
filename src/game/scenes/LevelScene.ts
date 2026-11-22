import Phaser from 'phaser';
import { level1 } from '../levels/level1';
import type { LevelDef, PowerKind } from '../levels/types';
import { SaveSystem } from '../systems/SaveSystem';
import { chooseSwimTarget, recoveryLandingX, riseTide, swimStep } from '../systems/GameplayRules';
import { audio } from '../../main';
import { LeslieView } from '../characters/LeslieView';

export const PHYSICS={runSpeed:175,jumpVelocity:-455,gravity:950,coyoteTimeMs:110,jumpBufferMs:130};
type BirdObj={def:{id:string;x:number;y:number;color:number};g:Phaser.GameObjects.Graphics; rescued:boolean;phase:number};
type PowerState={glide:number;bubble:number;spring:number;call:number;calm:number;rush:number};
export class LevelScene extends Phaser.Scene{
 private level:LevelDef=level1; private player!:Phaser.Physics.Arcade.Sprite; private leslie!:LeslieView; private playerEffects!:Phaser.GameObjects.Graphics; private scenery!:Phaser.GameObjects.Graphics; private water!:Phaser.GameObjects.Graphics;
 private platforms!:Phaser.Physics.Arcade.StaticGroup; private birds:BirdObj[]=[]; private birdFlock:Phaser.GameObjects.Graphics[]=[]; private birdCount=0; private rescued=new Set<string>(); private powers:PowerState={glide:0,bubble:0,spring:0,call:0,calm:0,rush:0};
 private hazards!:Phaser.Physics.Arcade.StaticGroup; private powerObjects:{id:string;kind:PowerKind;x:number;y:number;g:Phaser.GameObjects.Graphics;active:boolean}[]=[]; private waterY=1120; private lastGroundAt=0; private lastPlatform='p0'; private checkpoint='p0'; private jumpPressedAt=-10000; private lastTap=0; private recovering=false; private swimStart=0; private recoveryTarget:LevelDef['platforms'][number]|null=null; private recoveryGoalX=0; private recoveryArriveAt=0; private gameTime=0; private footstepAt=0; private paused=false; private finishing=false; private keys!: {up:Phaser.Input.Keyboard.Key;space:Phaser.Input.Keyboard.Key};
 constructor(){super('level')}
 preload(){LeslieView.preload(this);}
 create(data:{continue?:boolean}={}){
  this.level=level1;this.gameTime=0;this.paused=false;this.recovering=false;this.finishing=false;
  const saved=data.continue?SaveSystem.load():null;if(saved){this.rescued=new Set(saved.rescued);this.checkpoint=saved.checkpoint;this.waterY=saved.waterY;for(const k of saved.powers as PowerKind[])this.powers[k]=k==='bubble'?1:8000;}else{this.rescued=new Set();this.checkpoint='p0';this.waterY=this.level.tideStart;this.powers={glide:0,bubble:0,spring:0,call:0,calm:0,rush:0};}
  this.lastPlatform=this.checkpoint;this.birdCount=this.rescued.size;audio.startAmbience(); this.cameras.main.setBackgroundColor('#F8C9B6');this.cameras.main.setBounds(0,0,this.level.width,this.level.height);this.physics.world.gravity.y=PHYSICS.gravity;
  this.scenery=this.add.graphics().setDepth(-20);this.drawScenery();this.water=this.add.graphics().setDepth(-1);
  this.platforms=this.physics.add.staticGroup();this.level.platforms.forEach(p=>{const obj=this.add.rectangle(p.x+p.width/2,p.y+12,p.width,24,0xf6e2ba).setStrokeStyle(2,0xd8c7ae);this.physics.add.existing(obj,true);this.platforms.add(obj);obj.setData('id',p.id);obj.setData('kind',p.kind??'solid');const decoration=this.add.graphics().setDepth(1);decoration.fillStyle(p.kind==='checkpoint'?0xb4d2a6:p.kind==='sanctuary'?0x92bd9b:0xeee2ca,1);decoration.fillRoundedRect(p.x,p.y,p.width,15,8);decoration.fillStyle(0xffffff,.65);decoration.fillRoundedRect(p.x+8,p.y+2,p.width-16,3,2);if(p.kind==='checkpoint'){decoration.fillStyle(0xffe6a1,1);decoration.fillCircle(p.x+p.width/2,p.y-9,9);decoration.fillStyle(0xffffff,1);decoration.fillCircle(p.x+p.width/2,p.y-9,4);}if(p.kind==='sanctuary'){decoration.fillStyle(0x789b83,1);for(let i=0;i<3;i++){const tx=p.x+p.width-35+i*15;decoration.fillRoundedRect(tx-3,p.y-15,6,15,3);decoration.fillStyle(0xa9c7a1,1);decoration.fillCircle(tx,p.y-19-i%2*4,11);decoration.fillCircle(tx-7,p.y-15-i%2*4,7);decoration.fillCircle(tx+7,p.y-15-i%2*4,7);decoration.fillStyle(0x789b83,1);}decoration.fillStyle(0xffefb8,1);decoration.fillCircle(p.x+p.width/2,p.y-29,11);}});
  this.hazards=this.physics.add.staticGroup();this.level.hazards.forEach(h=>{const o=this.add.rectangle(h.x,h.y,h.width,17,0xd67f9e);this.physics.add.existing(o,true);this.hazards.add(o);const g=this.add.graphics();g.fillStyle(0xf9bfd0,1);for(let x=-h.width/2;x<h.width/2;x+=12)g.fillTriangle(h.x+x,h.y+5,h.x+x+6,h.y-11,h.x+x+12,h.y+5);});
  this.level.birds.forEach(def=>{const g=this.add.graphics().setDepth(6);this.birds.push({def,g,rescued:this.rescued.has(def.id),phase:Math.random()*6});});
  this.level.powers.forEach(def=>{const g=this.add.graphics().setDepth(4);this.powerObjects.push({...def,g,active:!this.powers[def.kind]});});
  const cp=this.level.platforms.find(p=>p.id===this.checkpoint)??this.level.platforms[0]!;const start=data.continue?{x:cp.x+Math.min(cp.width*.55,90),y:cp.y-20}:this.level.start;
  this.player=this.physics.add.sprite(start.x,start.y,'').setVisible(false);this.player.setCircle(14,2,5);this.player.setCollideWorldBounds(false);this.player.setMaxVelocity(260,800);this.player.setVelocityX(PHYSICS.runSpeed);this.leslie=new LeslieView(this);this.playerEffects=this.add.graphics().setDepth(8);
  this.physics.add.collider(this.player,this.platforms,(a,b)=>this.onLand(b as Phaser.GameObjects.GameObject));this.physics.add.overlap(this.player,this.hazards,()=>this.onHazard());
  this.cameras.main.startFollow(this.player,true,.08,.08);this.cameras.main.setDeadzone(230,100);this.cameras.main.setZoom(1);
  this.input.on('pointerdown',(p:Phaser.Input.Pointer)=>{if(p.y>74)this.queueJump()});this.keys={up:this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.UP),space:this.input.keyboard!.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE)};
  this.events.on('resume',()=>{this.paused=false});
  // Arcade syncs its body back to the hidden sprite during POST_UPDATE.
  this.events.on(Phaser.Scenes.Events.POST_UPDATE,this.updateLeslie,this);
  this.events.once(Phaser.Scenes.Events.SHUTDOWN,()=>this.events.off(Phaser.Scenes.Events.POST_UPDATE,this.updateLeslie,this));
  this.drawWater();this.updateLeslie(0,0);this.updateHud();
 }
 private drawScenery(){const g=this.scenery;g.fillGradientStyle(0xf8c9b6,0xf8c9b6,0xc5b8e8,0xc5b8e8,1);g.fillRect(0,0,this.level.width,this.level.height);g.fillStyle(0xffe3a7,.8);g.fillCircle(780,110,49);g.fillStyle(0xffffff,.38);g.fillCircle(780,110,65);for(let layer=0;layer<4;layer++){g.fillStyle([0xc8b9dc,0xb4b0d0,0xa7b6bd,0x9eac9f][layer]!,.48+layer*.11);g.beginPath();g.moveTo(0,340+layer*75);for(let x=0;x<=this.level.width;x+=90)g.lineTo(x,Math.sin(x*.009+layer*2)*50+380+layer*70);g.lineTo(this.level.width,this.level.height);g.lineTo(0,this.level.height);g.closePath();g.fillPath();}for(let i=0;i<90;i++){const x=(i*137)%this.level.width,y=85+(i*73)%(this.level.height-160);g.fillStyle(i%2?0xfff5dc:0xffd8cb,.45);g.fillCircle(x,y,1.3);}}
 private drawWater(){const g=this.water;g.clear();const y=this.waterY;g.fillStyle(0x75c9db,.96);g.fillRect(0,y,this.level.width,this.level.height-y);g.fillStyle(0x4e9fbf,.36);g.fillRect(0,y+32,this.level.width,this.level.height-y-32);g.lineStyle(3,0xb7edf0,.7);g.beginPath();for(let x=0;x<=this.level.width;x+=12){const yy=y+Math.sin(x*.025+this.gameTime*.002)*4; x===0?g.moveTo(x,yy):g.lineTo(x,yy);}g.strokePath();for(let i=0;i<22;i++){const x=(i*79+this.gameTime*.012)%this.level.width, yy=y+22+(i*37)%85;g.fillStyle(0xd7f7ed,.34);g.fillEllipse(x,yy,13,2);}}
 private updateLeslie(_time:number,dt:number){
  const {x,y,body}=this.player;
  const {x:vx,y:vy}=body!.velocity;
  this.leslie.update(dt,{x,y,vx,vy,grounded:body!.blocked.down||body!.touching.down,swimming:this.recovering,waterY:this.waterY});
  const g=this.playerEffects;
  g.clear();
  if(this.powers.glide>0){g.lineStyle(2,0xf3dc9a,.8);g.strokeCircle(x,y,34);}
  if(this.powers.bubble>0){g.lineStyle(2,0x9ee6ef,.75);g.strokeCircle(x,y,29);}
  if(this.powers.rush>0){g.fillStyle(0xfff4de,.35);g.fillEllipse(x-25,y+6,15,5);}
 }
 private drawBird(g:Phaser.GameObjects.Graphics,x:number,y:number,color:number,phase:number){g.clear();g.fillStyle(color,1);g.fillEllipse(x,y,21,14);g.fillCircle(x+8,y-5,8);g.fillStyle(0xfff7e9,1);g.fillCircle(x+10,y-6,4);g.fillStyle(0x514454,1);g.fillCircle(x+11,y-6,1.5);g.fillStyle(0xf2bd7e,1);g.fillTriangle(x+14,y-3,x+21,y,x+14,y+1);g.fillStyle(color,1);const flap=Math.sin(this.gameTime*.018+phase)*4;g.fillEllipse(x-1,y-2+flap,10,5);g.lineStyle(1.5,0xe5a98d,1);g.beginPath();g.moveTo(x-4,y+6);g.lineTo(x-4,y+10);g.moveTo(x+1,y+6);g.lineTo(x+1,y+10);g.strokePath();}
 private onLand(obj:Phaser.GameObjects.GameObject){if(this.player.body!.velocity.y<10){this.lastGroundAt=this.time.now;const id=String(obj.getData('id')??'p0');const kind=String(obj.getData('kind')??'solid');const newPlatform=id!==this.lastPlatform;this.lastPlatform=id;if(kind==='crumble'&&newPlatform&&!obj.getData('crumbleTriggered')){obj.setData('crumbleTriggered',true);const body=obj.body as Phaser.Physics.Arcade.StaticBody;this.time.delayedCall(650,()=>{if(obj.active){body.enable=false;this.time.delayedCall(2300,()=>{if(obj.active){body.enable=true;body.updateFromGameObject();body.reset((obj as Phaser.GameObjects.Rectangle).x,(obj as Phaser.GameObjects.Rectangle).y);obj.setData('crumbleTriggered',false);}})}});}if((kind==='checkpoint'||kind==='sanctuary')&&this.checkpoint!==id){this.checkpoint=id;SaveSystem.save({version:1,rescued:[...this.rescued],checkpoint:id,waterY:this.waterY,powers:Object.keys(this.powers).filter(k=>this.powers[k as keyof PowerState]>0)});if(kind==='checkpoint')audio.checkpoint();else this.finish();}}}
 private queueJump(){if(this.paused||this.recovering||this.finishing)return;this.jumpPressedAt=this.time.now;this.tryJump();}
 private tryJump(){const grounded=this.player.body!.blocked.down||this.player.body!.touching.down||this.time.now-this.lastGroundAt<PHYSICS.coyoteTimeMs;if(grounded&&this.time.now-this.jumpPressedAt<PHYSICS.jumpBufferMs){const boost=this.powers.spring>0?1.27:1;this.player.setVelocityY(PHYSICS.jumpVelocity*boost);this.leslie.jump();this.jumpPressedAt=-10000;if(this.powers.glide>0)this.powers.glide=Math.max(0,this.powers.glide-2200);audio.jump();}}
 private onHazard(){if(this.recovering)return;if(this.powers.bubble>0){this.powers.bubble=0;this.player.setVelocityY(-330);this.showToast('Bubble shield!');return;}this.beginRecovery(false);}
 private beginRecovery(water:boolean){if(this.recovering)return;this.recovering=true;this.swimStart=this.time.now;this.recoveryArriveAt=0;this.recoveryTarget=chooseSwimTarget(this.level.platforms,this.lastPlatform,this.checkpoint,this.player.x,this.waterY);if(!this.recoveryTarget){this.recoveryTarget=this.level.platforms.find(p=>p.id===this.checkpoint)??this.level.platforms[0]!;this.waterY=this.recoveryTarget.y+140;this.drawWater();}this.recoveryGoalX=recoveryLandingX(this.recoveryTarget);if(water)audio.splash();this.player.setVelocity(0,0);(this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(false);}
 private recover(dt:number){const now=this.time.now,target=this.recoveryTarget;if(!target)return;const elapsed=now-this.swimStart;const surface=this.waterY-15;if(elapsed<450){this.player.y=surface+Math.sin(now*.006)*2;return;}const dx=this.recoveryGoalX-this.player.x;if(Math.abs(dx)>5){this.player.x=swimStep(this.player.x,this.recoveryGoalX,220,dt);this.player.y=surface+Math.sin(now*.006)*2;return;}if(!this.recoveryArriveAt)this.recoveryArriveAt=now;const climb=Phaser.Math.Clamp((now-this.recoveryArriveAt)/320,0,1);this.player.x=this.recoveryGoalX;this.player.y=Phaser.Math.Linear(surface,target.y-19,climb);if(climb<1)return;this.lastPlatform=target.id;(this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);this.player.setVelocityX(PHYSICS.runSpeed);this.recovering=false;this.recoveryTarget=null;this.lastGroundAt=now;this.player.setTint(0xbdebea);this.time.delayedCall(350,()=>this.player.clearTint());this.showToast('Back on the path!');}
 private rescueBird(b:BirdObj){if(b.rescued)return;b.rescued=true;this.rescued.add(b.def.id);this.birdCount=this.rescued.size;this.leslie.rescue();audio.rescue();this.showToast('A friend joined your flock!');this.updateHud();this.save();}
 private activate(kind:PowerKind,id:string){const ms:Record<PowerKind,number>={glide:7000,bubble:1,spring:12000,call:12000,calm:10000,rush:6000};this.powers[kind]=ms[kind];this.powerObjects.find(p=>p.id===id)!.active=false;audio.power();this.showToast(({glide:'Glide Feather',bubble:'Bubble Shield',spring:'Spring Bloom',call:'Bird Call',calm:'Tide Calm',rush:'Wing Rush'} as Record<PowerKind,string>)[kind]);this.save();}
 private save(){SaveSystem.save({version:1,rescued:[...this.rescued],checkpoint:this.checkpoint,waterY:this.waterY,powers:Object.keys(this.powers).filter(k=>this.powers[k as keyof PowerState]>0)});}
 private showToast(msg:string){const el=document.getElementById('toast')!;el.textContent=msg;el.classList.remove('hidden');window.setTimeout(()=>el.classList.add('hidden'),1700);}
 private updateBirds(rescueNearby:boolean){this.birds.forEach(b=>{if(!b.rescued){this.drawBird(b.g,b.def.x,b.def.y+Math.sin(this.gameTime*.003+b.phase)*2,b.def.color,b.phase);if(rescueNearby&&Phaser.Math.Distance.Between(this.player.x,this.player.y,b.def.x,b.def.y)<36)this.rescueBird(b);}else{const idx=[...this.rescued].indexOf(b.def.id);const tx=this.player.x-38-Math.floor(idx/3)*24,ty=this.player.y-(this.recovering?47:28)+(idx%3-1)*16;const oldX=b.g.getData('fx') as number|undefined,oldY=b.g.getData('fy') as number|undefined;const fx=Phaser.Math.Linear(oldX??tx,tx,.09),followY=Phaser.Math.Linear(oldY??ty,ty,.09),fy=this.recovering?Math.min(followY,this.waterY-20):followY;b.g.setData('fx',fx);b.g.setData('fy',fy);this.drawBird(b.g,fx,fy,b.def.color,b.phase);}});if(rescueNearby&&this.powers.call>0)this.birds.filter(b=>!b.rescued&&Phaser.Math.Distance.Between(this.player.x,this.player.y,b.def.x,b.def.y)<135).forEach(b=>this.rescueBird(b));}
 private updateHud(){document.getElementById('bird-count')!.textContent=`🐦 ${this.birdCount} / ${this.level.birds.length}`;document.getElementById('power-icons')!.textContent=Object.entries(this.powers).filter(([,v])=>v>0).map(([k])=>({glide:'🪶',bubble:'🫧',spring:'🌸',call:'🎵',calm:'🌊',rush:'💨'} as Record<string,string>)[k]).join(' ');}
 private finish(){
  if(this.finishing)return;
  this.finishing=true;
  this.save();
  this.physics.world.pause();
  this.leslie.celebrate();
  this.time.delayedCall(this.leslie.reducedMotion?360:760,()=>{
   this.scene.launch('complete',{count:this.birdCount,total:this.level.birds.length});
   this.scene.pause();
  });
 }
 update(_t:number,dt:number){if(this.finishing)return;if(this.paused||this.recovering){if(this.recovering){this.gameTime+=dt;this.recover(dt);this.updateBirds(false);this.drawWater();}return;}this.gameTime+=dt;this.lastTap=this.time.now;
  if(Phaser.Input.Keyboard.JustDown(this.keys.up)||Phaser.Input.Keyboard.JustDown(this.keys.space))this.queueJump();this.tryJump();
  if(this.powers.rush>0)this.player.setVelocityX(PHYSICS.runSpeed*1.25);else this.player.setVelocityX(PHYSICS.runSpeed);if(this.player.body!.blocked.down&&this.time.now-this.footstepAt>420){this.footstepAt=this.time.now;audio.tone(92,.035,'sine',68);}
  if(this.powers.glide>0&&this.player.body!.velocity.y>100)this.player.setVelocityY(Math.min(this.player.body!.velocity.y,190));
  for(const k of Object.keys(this.powers) as PowerKind[]){if(this.powers[k]>1)this.powers[k]=Math.max(0,this.powers[k]-dt);}
  this.waterY=riseTide(this.waterY,dt,this.level.tideSpeed,this.powers.calm>0);if(this.player.y>this.waterY-8)this.beginRecovery(true);
  this.updateBirds(true);
  this.powerObjects.forEach(p=>{if(!p.active)return;p.g.clear();p.g.fillStyle(p.kind==='glide'?0xffedb7:0x9ce7ec,1);p.g.fillCircle(p.x,p.y+Math.sin(this.gameTime*.004)*4,12);p.g.fillStyle(0xffffff,.85);p.g.fillCircle(p.x-4,p.y-5,4);p.g.lineStyle(2,0xffffff,.85);p.g.strokeCircle(p.x,p.y,17);if(Phaser.Math.Distance.Between(this.player.x,this.player.y,p.x,p.y)<28)this.activate(p.kind,p.id);});
  this.drawWater();this.updateHud();if(this.player.x>this.level.width-50)this.finish();if(this.player.y>this.level.height+50)this.beginRecovery(true);
 }
 pause(){if(this.finishing)return;this.paused=true;this.scene.launch('pause');this.scene.pause();}
 restartCheckpoint(){const p=this.level.platforms.find(q=>q.id===this.checkpoint)??this.level.platforms[0]!;this.lastPlatform=p.id;this.player.setPosition(p.x+45,p.y-20);this.player.setVelocity(PHYSICS.runSpeed,0);(this.player.body as Phaser.Physics.Arcade.Body).setAllowGravity(true);this.recovering=false;this.leslie.reset();}
}
