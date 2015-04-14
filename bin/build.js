function SimulationEngine(a,e,h){function m(){this.time=0;this.particle2=this.particle=null}function f(b,k){var a=new PVector(b.xVel,b.yVel),d=Math.PI/2;0!==b.xVel&&(d=Math.atan(b.yVel/b.xVel));var f=(b.xVel*Math.cos(-d)-b.yVel*Math.sin(-d))*b.cOR,g=b.x-k.x,c=b.y-k.y,e=0,e=0!==g?Math.atan(c/g):Math.atan(c/(g-1E-5));a.x=f*Math.cos(e-d);a.y=f*Math.sin(e-d);return a}this.width=a;this.height=e;var c=[];this.setBounds=function(b,k){this.width=b;this.height=k};this.reset=function(){c=[]};this.addParticle=
function(b){if(c.length<h.maxParticles)b.index=c.length,c.push(b);else throw"ERROR: Number of particles exceeds the maximum value set.";};this.removeParticle=function(b){c.splice(b,1)};this.getParticle=function(b){return c[b]};this.numOfParticles=function(){return c.length};this.edgeCollision=function(b,k){var a=b.cOR;b.x+b.radius>=this.width?k?(b.xVel*=-a,b.yVel*=a):b.x=this.width-b.radius:0>=b.x-b.radius&&(k?(b.xVel*=-a,b.yVel*=a):b.x=b.radius);b.y+b.radius>=this.height?k?(b.xVel*=a,b.yVel*=-a):
b.y=this.height-b.radius:0>=b.y-b.radius&&(k?(b.xVel*=a,b.yVel*=-a):b.y=b.radius)};this.collide=function(b,k,a){var d=k.x-b.x,f=k.y-b.y,g=k.radius+b.radius;return d*d+f*f<g*g?(d=new PVector(b.x-k.x,b.y-k.y),k=new PVector(b.xVel-k.xVel,b.yVel-k.yVel),b=k.dotProduct(k),k=-2*k.dotProduct(d),g=d.dotProduct(d)-g*g,g=k*k-4*b*g,f=d=0,0<=g&&(d=(-k-Math.sqrt(g))/(2*b),f=(-k+Math.sqrt(g))/(2*b)),a.time=0<d&&1>=d?d:0<f&&1>=f?f:1,!0):!1};this.handleCollision=function(b){var a=b.particle,c=b.particle2,d=f(a,c),
e=f(c,a),g=(d.x*(a.mass-c.mass)+2*c.mass*e.x)/(a.mass+c.mass),h=(e.x*(c.mass-a.mass)+2*a.mass*d.x)/(a.mass+c.mass),m=Math.atan((a.y-c.y)/(a.x-c.x)),q=Math.cos(m),r=Math.sin(m),m=g*q+d.y*r,d=g*r-d.y*q,g=h*q+e.y*r,e=h*r-e.y*q;this.seperateObjects(b,a,c);a.xVel=m;a.yVel=d;c.xVel=g;c.yVel=e};this.seperateObjects=function(b,a,c){b=b.time+.001*b.time;if(1>b)a.x-=a.xVel*h.speedConst*b,a.y-=a.yVel*h.speedConst*b,c.x-=c.xVel*h.speedConst*b,c.y-=c.yVel*h.speedConst*b;else{b=c.x-a.x;var d=c.y-a.y;b=c.radius-
Math.abs(Math.sqrt(b*b+d*d)-a.radius)+.1;var d=(new PVector(a.xVel,a.yVel)).getMagnitudeNS()+1E-4,f=(new PVector(c.xVel,c.yVel)).getMagnitudeNS()+1E-4,d=d/(d+f);ang=Math.atan2(a.y-c.y,a.x-c.x);a.x+=b*Math.cos(ang)*d;a.y+=b*Math.sin(ang)*d;d=1-d;c.x-=b*Math.cos(ang)*d;c.y-=b*Math.sin(ang)*d}};this.update=function(){for(var b=0;b<c.length;b++){var a=c[b];this.edgeCollision(a,!0);a.update()}for(var f=[],b=0;b<c.length;b++)for(var a=c[b],d=b+1;d<c.length;d++){var e=c[d],g=new m;this.collide(a,e,g)&&(g.particle=
a,g.particle2=e,f.push(g))}f.sort(function(b,a){return b.time<a.time});for(b=0;b<f.length;b++)g=f[b],this.handleCollision(g);for(b=0;b<c.length;b++)a=c[b],this.edgeCollision(a,!1)}};function Point2D(a,e){this.x=a;this.y=e};function PVector(a,e){this.x=a;this.y=e;this.getMagnitude=function(){return Math.sqrt(this.x*this.x+this.y*this.y)};this.getMagnitudeNS=function(){return this.x*this.x+this.y*this.y};this.dotProduct=function(a){return this.x*a.x+this.y*a.y};this.getNormal=function(){return new PVector(-this.y,this.x)};this.rotate=function(a){var e=this.x,f=this.y;this.x=e*Math.cos(a)-f*Math.sin(a);this.y=e*Math.sin(a)+f*Math.cos(a)}};function Particle(a,e,h,m,f){PhysicsObject.call(this,a,e,10);this.radius=h;this.style=m;this.cOR=1;this.selected=!1;var c=[],b=0;this.draw=function(a,e){this.displayObj.x=a;this.displayObj.y=e;var d=this.displayObj.graphics;d.clear();if(this.selected){for(var h=c.length,g=1;g<h;g++){var m=c[(g+b)%h],u=m.x-a,m=m.y-e;d.beginStroke("rgba(100, 100, 100, "+g/h+")").drawCircle(u,m,this.radius).endStroke()}d.beginStroke("red").setStrokeStyle(3).drawCircle(0,0,this.radius).endStroke()}d.beginFill(this.style).drawCircle(0,
0,this.radius).endFill();(this.selected||f.showVelocities)&&d.beginStroke("red").setStrokeStyle(3).moveTo(0,0).lineTo(this.xVel*f.updateRate,this.yVel*f.updateRate).endStroke()};this.select=function(){this.selected=!0};this.deselect=function(){this.selected=!1;c=[]};this.update=function(){this.x+=this.xVel*f.speedConst;this.y+=this.yVel*f.speedConst;var a=c.length;this.selected&&(b++,b%=f.maxTraceLength,a<f.maxTraceLength?c.push(new Point2D(this.x,this.y)):c[b]=new Point2D(this.x,this.y))};this.copy=
function(){var b=new Particle(this.x,this.y,this.radius,this.style,f);b.index=this.index;b.cOR=this.cOR;b.mass=this.mass;b.xVel=this.xVel;b.yVel=this.yVel;return b}}Particle.prototype=new PhysicsObject;function PhysicsObject(a,e,h){this.x=a;this.y=e;this.lastX=this.x;this.lastY=this.y;this.yVel=this.xVel=0;this.mass=h;this.displayObj=new createjs.Shape;this.displayObj.x=this.x;this.displayObj.y=this.y;this.capture=function(){this.lastX=this.x;this.lastY=this.y};this.update=function(){this.x+=this.xVel*speedConst;this.y+=this.yVel*speedConst};this.addEventHandler=function(a,f){this.displayObj.addEventListener(a,f)};this.getEnergy=function(){return.5*this.mass*(this.xVel*this.xVel+this.yVel*this.yVel)};
this.draw=function(a,f){this.displayObj.x=a;this.displayObj.y=f}};function Graph(a,e,h,m,f){Widget.call(this,a);this.scaleX=h;this.scaleY=m;this.y=this.x=0;this.engine=e;var c=new createjs.Shape,b=0,k=0,p=0,d=[],n=0,g=150,v=!1,u=0,q=0,r=0;this.init=function(){var b=new createjs.Shape,a=new createjs.Shape;b.graphics.beginStroke("red").moveTo(this.x,this.height).lineTo(this.width,this.height);a.graphics.beginStroke("red").moveTo(this.x,this.y).lineTo(this.x,this.height);this.stage.addChild(b);this.stage.addChild(a);this.stage.addChild(c);this.updateData()};this.draw=
function(a){if(null!=this.engine){a=c.graphics;a.clear();for(var g=d.length-1,e=0,l=0;l<g-1;l++){if(v){v=!1;return}var e=e+d[l].y,h=(n+l)%g,m=(n+l+1)%g,y=d[h].x*this.scaleX-b;y>this.width&&(b+=y-this.width);var y=d[h].x*this.scaleX-b,h=d[h].y*this.scaleY+k+p,B=d[m].x*this.scaleX-b,m=d[m].y*this.scaleY+k+p;a.beginStroke("red").moveTo(this.x+y,this.y+this.height-h).lineTo(this.x+B,this.y+this.height-m)}this.paused||(u+=1E3/f.updateRate,q=this.getEnergy(),this.addData(u,q));k=this.height/2-e/d.length*
this.scaleY;this.stage.update()}};this.restart=function(){d=[];b=k=u=q=n=0;v=!0};this.calibrate=function(){p=0};this.zoomIn=function(){if(r<f.graphMaxZoomIndex)this.scaleX*=f.graphZoomFactor,this.scaleY*=f.graphZoomFactor,b*=this.scaleX,k*=this.scaleY,this.updateData(),r++;else throw"ERROR: Maximum zoom reached";};this.zoomOut=function(){if(r>-f.graphMinZoomIndex)this.scaleX/=f.graphZoomFactor,this.scaleY/=f.graphZoomFactor,b*=this.scaleX,k*=this.scaleY,this.updateData(),r--;else throw"ERROR: Minimum zoom reached";
};this.moveUp=function(){p-=5};this.moveDown=function(){p+=5};this.addData=function(a,b){if(d.length>g){var c=n;n=(n+1)%g;d[c]=new Point2D(a,b)}else d.push(new Point2D(a,b))};this.updateData=function(){var a=[];g=Math.round(this.width/(1E3/f.updateRate*this.scaleX))+5;var b=d.length-1,c=0;for(b>g&&(c=b-g);c<b;c++)a.push(d[(n+c)%b]);v=!0;n=0;d=a};this.getEnergy=function(){for(var b=0,a=0;a<this.engine.numOfParticles();a++)b+=this.engine.getParticle(a).getEnergy();return Math.round(b/1E3)}}
Graph.prototype=new Widget;function Overlay(a,e,h){function m(b,a){return a?m(a,b%a):b}function f(){if(1==b){var a=e.addParticle(z,A,l.mass,l.radius,l.style);a.xVel=l.xVel;a.yVel=l.yVel;t.removeChild(l.displayObj);l=null;c=2}else t.stage.removeChild(d),c=0}Widget.call(this,a);this.hide();var c=0,b=-1,k=crossX=this.width/2,p=crossY=this.height/2,d=new createjs.Shape,n=new createjs.Text("","bold 15px Arial"),g=new createjs.Text("","bold 15px Arial","red"),v=0,u=!1,q=new createjs.Text("","bold 15px Arial");q.x=this.width/2-40;
q.y=10;var r=!1,w=!1,z=0,A=0,l=null,x=m(this.width,this.height),t=this;this.canvas.mousewheel(function(a){0>a.deltaY?l.radius>h.minRadius&&--l.radius:l.radius<h.maxRadius&&(l.radius+=1)});this.resize=function(a,b){x=m(this.width,this.height)};$(document).keydown(function(a){r=a.ctrlKey;w=a.shiftKey});$(document).keyup(function(a){w=r=!1});this.canvas.bind("contextmenu",function(a){return!1});this.init=function(){this.stage.removeAllChildren();k=crossX=this.width/2;p=crossY=this.height/2;this.stage.addChild(q)};
this.stage.addEventListener("stagemousemove",function(a){k=crossX=a.stageX;p=crossY=a.stageY;if(!r){a=Math.round(k/x);var b=Math.round(p/x);crossX=a*x;crossY=b*x}switch(c){case 0:d.x=crossX;d.y=crossY;null!=l&&(l.x=crossX,l.y=crossY);n.x=crossX-50;n.y=crossY-50;break;case 1:var g=d.graphics;a=crossX-d.x;b=crossY-d.y;n.x=d.x+a/2;n.y=d.y+b/2;n.text=Math.round(Math.sqrt(a*a+b*b))+" px/s";l.xVel=a/h.updateRate;l.yVel=b/h.updateRate;g.clear().beginStroke("red").setStrokeStyle(3).moveTo(0,0).lineTo(a,b);
break;case 2:for(g=0;g<e.engine.numOfParticles();g++){var f=e.engine.getParticle(g);a=f.x-k;b=f.y-p;a*a+b*b<=f.radius*f.radius?(f.select(),l=f):f.deselect()}}});this.canvas.mousedown(function(a){if(2==a.button&&2!=c)switch(c){case 0:t.end();f();break;case 1:f()}else switch(c){case 0:d.graphics.clear();t.stage.addChild(d);t.stage.addChild(n);c=1;break;case 1:try{var k=e.addParticle(l.x,l.y,l.mass,l.radius,l.style);k.xVel=l.xVel;k.yVel=l.yVel;k.cOR=l.cOR;t.stage.removeChild(d);t.stage.removeChild(n);
l.xVel=l.yVel=0;1!=b||w?c=0:(c=2,t.stage.removeChild(l.displayObj))}catch(m){g.text=m,g.x=t.width-g.getMeasuredWidth(),g.y=t.height/2,t.stage.addChild(g),v=h.errorTime,u=!0}break;case 2:l.displayObj.dispatchEvent("click"),2==a.button?e.removeSelected():(k=l,l=k.copy(),z=k.x,A=k.y,t.stage.addChild(l.displayObj),w||e.removeSelected(),c=0)}a.stopPropagation()});this.draw=function(a){this.hidden||(null!=l&&l.draw(l.x,l.y),u&&(v-=1E3/h.updateRate,0>=v&&(u=!1,this.stage.removeChild(g))),this.stage.update())};
this.beginAdd=function(a,g,f){this.show();this.init();l=new Particle(crossX,crossY,25,f,h);l.mass=a;l.cOR=g;n.x=k;n.y=p;this.stage.addChild(l.displayObj);q.text="Mode: Add";b=c=0};this.beginEdit=function(){this.show();this.init();q.text="Mode: Edit";c=2;b=1};this.end=function(){this.hide();this.stage.removeAllChildren();null!=l&&(l=null);b=-1;w=r=!1};this.getCurrentParticle=function(){return l};this.getMode=function(){return b}}Overlay.prototype=new Widget;function Simulation(a,e,h){Widget.call(this,a);this.engine=e;this.engine.width=this.width;this.engine.height=this.height;var m=-1;this.resize=function(a,c){this.engine.setBounds(a,c)};this.addParticle=function(a,c,b,e,p){a=new Particle(a,c,e,p,h);a.mass=b;var d=this.engine;a.addEventHandler("click",function(a){var b=d.getParticle(m);-1!=m&&b.deselect();for(b=0;b<d.numOfParticles();b++)if(d.getParticle(b).displayObj==a.target){b!=m?(m=b,d.getParticle(b).selected=!0):m=-1;break}});this.stage.addChild(a.displayObj);
this.engine.addParticle(a);return a};this.removeParticle=function(a){this.stage.removeChild(this.engine.getParticle(a).displayObj);this.engine.removeParticle(a)};this.loadParticles=function(a){this.restart();for(var c=0;c<a.length;c++){var b=a[c],e=this.addParticle(b.x,b.y,b.mass,b.radius,b.style);e.xVel=b.xVel;e.yVel=b.yVel;e.cOR=b.cOR}};this.saveParticles=function(a){for(var c=0;c<this.engine.numOfParticles();c++){var b=this.engine.getParticle(c);a.push(b.copy())}};this.removeSelected=function(){-1!=
m&&(this.removeParticle(m),m=-1)};this.getSelected=function(){var a=null;-1!=m&&(a=this.engine.getParticle(m));return a};this.getSelectedID=function(){return m};this.restart=function(){this.stage.removeAllChildren();m=-1;this.engine.reset()};this.draw=function(a){for(var c=0;c<this.engine.numOfParticles();c++){var b=this.engine.getParticle(c),e=b.x,m=b.y;h.enableInterpolation&&(m=b.y-b.lastY,e=b.lastX+a*(b.x-b.lastX),m=b.lastY+a*m);b.draw(e,m)}this.stage.update()}}Simulation.prototype=new Widget;function Widget(a){this.hidden=!1;this.canvasName=a;this.canvas=$("#"+a);this.width=this.canvas.width();this.height=this.canvas.height();this.stage=new createjs.Stage(a);this.canvas.attr("width",this.width);this.canvas.attr("height",this.height);this.init=function(){};this.addEventListener=function(a,h){this.stage.addEventListener(a,h)};this.draw=function(a){};this.restart=function(){};this.stop=function(){};this.resume=function(){this.paused=!1};this.pause=function(){this.paused=!0};this.resize=
function(a,h){};this.show=function(){this.hidden=!1;this.canvas.fadeIn(200)};this.hide=function(){this.hidden=!0;this.canvas.fadeOut(200)}};function ECollision(a){this.settings=a;this.paused=!1;this.engine=new SimulationEngine(a.simulationWidth,a.simulationHeight,this.settings);this.simulationUI=new Simulation(a.simulationCanvas,this.engine,this.settings);this.graphUI=new Graph(a.graphCanvas,this.engine,.02,5,this.settings);this.overlayUI=new Overlay(a.overlayCanvas,this.simulationUI,this.settings);this.fps=0;var e=[this.simulationUI,this.graphUI,this.overlayUI],h=0,m=0,f=timeStamp=curTime=0,c=a.updateRate,b=1E3/c,k=1E3/a.refreshRate,
p=0,d=-1,n=this;this.start=function(){for(var b=0;b<e.length;b++)e[b].init();d=setInterval(this.tick,1E3/a.refreshRate)};this.restart=function(){for(var a=0;a<e.length;a++)e[a].restart()};this.resume=function(){this.paused=!1;for(var a=0;a<e.length;a++)e[a].resume()};this.pause=function(){this.paused=!0;for(var a=0;a<e.length;a++)e[a].pause()};this.stop=function(){-1!=d&&(clearInterval(d),d=-1)};this.getUpdateRate=function(){return c};this.getUpdateTime=function(){return b};this.setUpdateRate=function(a){c=
a;b=1E3/c};this.setSpeedConst=function(a){this.engine.speedConst=a};this.onTick=function(){};this.update=function(){curTime+=k;if(f+b<curTime){timeStamp=curTime;if(a.enableInterpolation)for(var c=0;c<this.engine.numOfParticles();c++)this.engine.getParticle(c).capture();for(;f+b<curTime;)this.engine.update(),f+=b}p=Math.min(1,(curTime-timeStamp)/b)};this.tick=function(){n.paused||n.update();var a=(new Date).getTime();h++;1E3<=a-m&&(n.fps=h,h=0,m=a);for(a=0;a<e.length;a++)e[a].draw(p);n.onTick()}};var eCollisionSettings={simulationWidth:1E3,simulationHeight:1E3,simulationCanvas:"simulation-canvas",graphCanvas:"graph-canvas",overlayCanvas:"overlay-canvas",refreshRate:60,updateRate:60,showVelocities:!1,enableInterpolation:!0,maxTraceLength:30,graphScaleX:.02,graphScaleY:5,graphZoomFactor:1.25,graphMinZoomIndex:5,graphMaxZoomIndex:5,speedConst:1,maxParticles:20,minRadius:5,maxRadius:30,errorTime:5E3};$.widget("custom.sliderEx",$.ui.slider,{_unit:"",_amount:null,_formatVal:function(a){.09<a&&1>a&&(a=a.toPrecision(2));return a+" "+this._unit},_slide:function(){this._superApply(arguments);this._amount.text(this._formatVal(this.options.value));var a=this.handle.position();this._amount.width();this._amount.css("left",a.left+"px")},_start:function(){this._superApply(arguments);var a=this.handle.css("left");this._amount.css("visibility","visible").hide().fadeIn("fast").css("left",a)},_stop:function(){this._superApply(arguments);
this._amount.fadeOut("fast")},_create:function(){var a=parseFloat(this.element.attr("min")),e=parseFloat(this.element.attr("max"));this.options.min=a;this.options.max=e;this.options.step=parseFloat(this.element.attr("step"))||1;this.options.value=parseFloat(this.element.attr("value"))||a+e/2;this._unit=this.element.attr("unit")||"";this._amount=$('<div class="slider-amount">'+this._formatVal(this.options.value)+"</div>");this.element.append(this._amount).mousedown(function(a){a.stopPropagation()});
this._super()}});function getRandomColor(){for(var a="0123456789ABCDEF".split(""),e="#",h=0;6>h;h++)e+=a[Math.floor(16*Math.random())];return e}function toDegrees(a){a=a/Math.PI*180+90;0>a?a+=360:360<a&&(a-=360);return a}function setCol(a,e){return(""+a).fontcolor(e)}function setColGreen(a){return setCol(a,"green")}function dbgBool(a){return a?setCol(""+a,"green"):setCol(""+a,"red")}function log(a){console.log(a)}
$("#slider-mass").sliderEx({slide:function(a,e){var h=ecollision.overlayUI.getCurrentParticle()||ecollision.simulationUI.getSelected();null!=h&&(h.mass=e.value)}});$("#slider-cor").sliderEx({slide:function(a,e){var h=ecollision.overlayUI.getCurrentParticle()||ecollision.simulationUI.getSelected();null!=h&&(h.cOR=e.value)}});
function openAdd(){if(0==ecollision.overlayUI.getMode())ecollision.overlayUI.end();else{var a=$("#slider-mass").sliderEx("value"),e=$("#slider-cor").sliderEx("value");ecollision.overlayUI.beginAdd(a,e,currentColor)}}function openEdit(){1==ecollision.overlayUI.getMode()?ecollision.overlayUI.end():ecollision.overlayUI.beginEdit()}$(document).keypress(function(a){97==a.charCode?openAdd():101==a.charCode&&openEdit()});$("#add-particle").click(function(){openAdd()});$("#remove-particle").click(function(){openEdit()});
var currentColor=getRandomColor();$("#generate-colour").click(function(){var a=ecollision.overlayUI.getCurrentParticle()||ecollision.simulationUI.getSelected();null!=a&&(currentColor=getRandomColor(),a.style=currentColor)});$("#calibrate").click(function(){ecollision.graphUI.calibrate()});$("#zoom-in").click(function(){ecollision.graphUI.zoomIn()});$("#zoom-out").click(function(){ecollision.graphUI.zoomOut()});$("#move-up").click(function(){ecollision.graphUI.moveUp()});$("#move-down").click(function(){ecollision.graphUI.moveDown()});
$("#btn-sim-data").click(function(){eCollisionSettings.showVelocities=!eCollisionSettings.showVelocities});$("#btn-run-pause").click(function(){ecollision.paused?ecollision.resume():ecollision.pause();changeRunPauseBtn()});function changeRunPauseBtn(){ecollision.paused?$("#btn-run-pause").removeClass("icon-pause").addClass("icon-playback-play").text("RUN"):$("#btn-run-pause").removeClass("icon-playback-play").addClass("icon-pause").text("PAUSE")}$("#btn-next").click(function(){ecollision.update()});
var savedState=[];$("#btn-save").click(function(){savedState=[];ecollision.simulationUI.saveParticles(savedState)});$("#btn-load").click(function(){ecollision.simulationUI.loadParticles(savedState)});$("#btn-reset").click(function(){ecollision.restart()});$("#sim-speed-slider").sliderEx({slide:function(a,e){eCollisionSettings.speedConst=parseFloat(e.value)}});var ecollision=new ECollision(eCollisionSettings),fpsDiv=$("#fps-div"),particleInfo=$("#particle-info-box");
ecollision.onTick=function(){(new Date).getTime();if(eCollisionSettings.showVelocities){var a="",a=24>ecollision.fps?setCol(ecollision.fps,"red"):setCol(ecollision.fps,"green");debugStr="Frame rate: "+a+" Hz<br /> Update rate: "+setColGreen(ecollision.getUpdateRate())+" Hz<br /> Energy in system: "+setColGreen(ecollision.graphUI.getEnergy())+" kJ<br /> Number of particles: "+setColGreen(ecollision.engine.numOfParticles());fpsDiv.html(debugStr)}else fpsDiv.html("");a=ecollision.simulationUI.getSelected();
if(null!=a){var e="<b>XVel:</b> "+Math.round(a.xVel*eCollisionSettings.updateRate)+" px/s<br /> <b>YVel:</b> "+Math.round(a.yVel*eCollisionSettings.updateRate)+" px/s<br /> <b>Direction:</b> "+Math.round(toDegrees(Math.atan2(a.yVel,a.xVel)))+" degrees<br /> <b>Mass:</b> "+a.mass+" kg<br /> <b>CoR:</b> "+a.cOR+"<br /> <b>Radius:</b> "+a.radius+" px";"<br /> <b>Energy:</b> "+Math.round(a.getEnergy())+" J";particleInfo.html(e)}else particleInfo.html("")};ecollision.start();