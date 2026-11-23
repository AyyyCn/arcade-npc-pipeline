/*!
Three.js

The MIT License

Copyright © 2010-2026 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

meshoptimizer

MIT License

Copyright (c) 2016-2026 Arseny Kapoulkine

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

Earcut

ISC License

Copyright (c) 2024, Mapbox

Permission to use, copy, modify, and/or distribute this software for any purpose
with or without fee is hereby granted, provided that the above copyright notice
and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY AND
FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM LOSS
OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR OTHER
TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR PERFORMANCE OF
THIS SOFTWARE.

*/
import{a as l,b as T,c as n,d as b,e as S,f as P,g as B}from"./chunk-Q4YEZBTT.js";import{D as g,N as R,O as I,R as V,na as W,t as N}from"./chunk-Y7G2TOMY.js";import{c as G,g as f,i as v,j as O,k as H}from"./chunk-6DELKLQG.js";var D={esme:{rig:"maya",height:1.7,top:"#d9b979",yaw:0},wes:{rig:"sam",height:1.8,top:"#637f88",yaw:0},nina:{rig:"harper",height:1.67,top:"#a2849a",yaw:0},maya:{rig:"jordan",height:1.76,top:"#7e9478",yaw:0}};async function c0(F){let w=await B(F,D,!1),r=w.scene,p=l("#b4bdc3",.33,.79),x=l("#24272a"),o0=l("#474d50",.48,.45),X=l("#c5a062"),q=l("#612c35",.98),J=l("#263b40",.63,.3),K=l("#393934",.89,.1);n(r,K,0,-.12,0,17,.24,11);let Y=l("#262a27"),Q=l("#4b4b40");for(let o=-3.3;o<5.4;o+=.66){n(r,Y,0,.003,o,17,.005,.012);for(let t=-7+Math.round(o*10)%2*.57;t<8;t+=2.65)n(r,Y,t,.004,o+.33,.01,.006,.66),n(r,Q,t+.029,.008,o+.038,.027,.004,.02)}n(r,x,-7.05,2.1,.2,.16,4.25,7.3);for(let o=-2.5;o<3.8;o+=.18)n(r,l("#302d30"),-6.95,1.96,o,.13,3.96,.074);for(let o of[-5.48,5.48])for(let t of[-2.7,-2.37]){b(r,p,[o,.1,t],[o,3.24,t],.05);for(let s=.12;s<2.9;s+=.41)b(r,p,[o,s,t],[o+.19,s+.28,t],.018)}n(r,x,0,2,-3.33,14,4.2,.25);let Z=new V(14,4.1,180,3),M=Z.attributes.position;for(let o=0;o<M.count;o++)M.setZ(o,.12*Math.cos(M.getX(o)*8.8)+.035*Math.cos(M.getX(o)*17.6));Z.computeVertexNormals();let A=new g(Z,q);A.position.set(0,2.02,-3.02),A.receiveShadow=!0,r.add(A);for(let o of[-2.7,-2.37])for(let t of[2.91,3.24])b(r,p,[-6.2,t,o],[6.2,t,o],.036);for(let o=-6;o<=6;o+=.48)b(r,p,[o,2.91,-2.36],[o+.48,3.24,-2.36],.019),b(r,p,[o,3.24,-2.36],[o+.48,2.91,-2.36],.019);let U=new I(.13,.16,.36,16);for(let o=0;o<7;o++){let t=-5.4+o*1.8,s=new g(U,x);s.position.set(t,2.79,-2.33),s.rotation.x=.58,r.add(s),b(r,p,[t,3.04,-2.45],[t,2.84,-2.34]);let e=new g(new R(.13,24),T(o%2?"#eebd83":"#8cbfc5"));e.position.set(t,2.63,-2.41),e.rotation.x=-1.06,r.add(e)}function y(o,t,s,e,a,i,m){let d=new N;o.add(d),d.position.set(t,0,s),n(d,J,0,a/2+.15,0,e,a,i);for(let h of[.16,.16+a,.16+a*.77]){n(d,p,0,h,i/2,e+.025,.028,.028),n(d,p,0,h,-i/2,e+.025,.028,.028);for(let c of[-1,1])n(d,p,c*e/2,h,0,.028,.028,i)}for(let h of[-1,1])for(let c of[-1,1]){n(d,p,h*e*.5,.16+a*.5,c*i*.5,.026,a,.026);for(let z of[.19,.13+a])n(d,p,h*(e/2-.012),z,c*(i/2-.012),.075,.073,.075);let u=new g(new I(.081,.081,.056,12),x);u.rotation.z=Math.PI/2,u.position.set(h*(e/2-.11),.073,c*(i/2-.1)),d.add(u)}for(let h of[-1,1])n(d,x,h*e*.29,.16+a*.6,i*.5+.015,.12,.13,.022),n(d,p,h*e*.29,.16+a*.61,i*.5+.029,.07,.044,.012);return m&&S(d,m,0,.16+a*.42,i/2+.021,e*.66,a*.22,"#f0dfb7","#344448"),d}let k=y(r,0,0,f.halfX*2,.9,f.halfZ*2,"PA  /  04");for(let o of[-1,1]){let t=o*(f.halfZ-.055);b(k,p,[-f.halfX,.92,t],[f.barX,f.barY,t],.027)}b(k,p,[f.barX,f.barY,-.61],[f.barX,f.barY,.61],.029),n(k,x,.045,.76,-f.halfZ,.45,.23,.035);for(let o of[-.08,.04,.16])n(k,p,o,.8,-f.halfZ-.023,.063,.072,.029);y(r,.05,-1.96,1.24,.82,.5,"SHOW CONTROL"),y(r,-4.7,-2.15,1.06,.82,.58,"PATCH"),y(r,-3.47,-2.23,1.1,.68,.66),y(r,4.47,-2.28,1.1,.64,.58),y(r,5.45,-2.2,.72,1.45,.8,"PA");for(let o of[-2.1,2.12]){let t=y(r,o,-2.15,1.1,.81,.71,o<0?"POWER":"LX");for(let s=0;s<9;s++)n(t,s%3===0?T("#97c4a1"):x,-.39+s*.096,1,.02,.034,.025,.17)}let _=S(r,"SIDE B    /    STAGE LEFT",-.58,2.06,-2.83,3.35,.39,"#ede2c9","#352d32");_.rotation.x=-.018;for(let o of[-1,1])for(let t=-4.45;t<2.26;t+=.52)n(r,X,t,.008,.74+o*.83,.26,.008,.028);for(let o of[1.24,2.55])for(let t of[.17,1.31])n(r,X,o,.012,t,.21,.011,.033),n(r,X,o,.012,t,.033,.011,.21);P(r,14789756,90,[-3,3.6,.2],[-1,.4,0]),P(r,9553375,88,[3.4,3.4,-.9],[1.5,.6,.7]),P(r,14582912,62,[-2.5,.5,-2.4],[-.9,2,-3]);let $=n(r,T("#557c60"),1.76,.89,-1.8,.19,.06,.025),j,E,L=(o,t,s)=>{let e=v(o,t,s),a=e.kind==="work"&&e.part.task==="rack",i=e.part?.task,m;return a||i==="rack"&&e.kind==="standby"?m=Math.PI/2:(e.kind==="work"||e.kind==="standby")&&(m=i==="sound"?0:Math.PI),{...e,pushing:a,facing:m}};function C(o,t,s,e){return[0,.65,1.3,1.95].reduce((a,i)=>a+(e(v(o,t,Math.max(0,s-i)))?.25:0),0)}return(o,t)=>{if(o!==j){j=o;let e=Math.max(o.end,...o.tracks.map(a=>a.at(-1)?.end??0));E=G.map(a=>W(e,i=>L(o,a.id,i),Math.PI/2))}let s=O(o,t);k.position.set(s.x,0,s.z);for(let e of G){let a=L(o,e.id,t),i=E[e.id](t),m=[],d=C(o,e.id,t,c=>c.kind==="work"&&c.part.task==="rack"),h=C(o,e.id,t,c=>c.kind==="away");if(d){let c=a.z<s.z?-f.stanceZ:f.stanceZ;m.push(["l",s.x+f.barX,f.barY,s.z+c-.15,d],["r",s.x+f.barX,f.barY,s.z+c+.15,d])}if(h){let c=i.yaw;m.push(["r",a.x-.15*Math.cos(c)+.075*Math.sin(c),D[e.person.key].height*.88,a.z+.15*Math.sin(c)+.075*Math.cos(c),h])}else if(a.kind==="work"&&a.part.task!=="rack"){let c=a.part.task==="sound"?1:-1,u=C(o,e.id,t,z=>z.kind==="work"&&z.part.task===a.part.task);m.push(["r",a.x-c*.14,.95+.018*Math.sin(t*.25),a.z+c*.43,u*.9])}w.pose(e.person.key,a,i,t,m)}return $.material.color.set(H(o,"lights",t).done?"#a5ffb5":"#665741"),w.render([2.85,3.05,7.65],[-.58,1.02,-.29],36.3),w.project(s.x,1.13,s.z)}}export{c0 as a};
