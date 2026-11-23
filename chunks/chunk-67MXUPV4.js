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
import{a as f,b as S,c as n,d as r0,e as F,f as i0,g as a0}from"./chunk-Q4YEZBTT.js";import{D as j,G as $,I as o0,M as I,P as e0,Z as t0,na as s0,p as E,pa as n0,s as K,t as P,u as Q,z as W}from"./chunk-Y7G2TOMY.js";import{a as y,b as d,c as x,d as u,e as q,g as J}from"./chunk-DNQ3AYLV.js";async function M0(c0){let l=await a0(c0,{[y.key]:{rig:"harper",height:1.62,top:"#6f867b",yaw:0}},!0),s=l.scene,b=l.materials.wood,z=l.materials.stone.clone(),C=l.materials.plaster.clone();z.color.set("#aba99e"),z.roughness=.9,z.normalScale.set(.16,.16),C.color.set("#e7dabd");let v=f("#5b4632"),A=f("#bea479",.38,.66),H=f("#dbceb0"),G=f("#325349"),R=f("#46473d",.48,.42);n(s,z,0,-.1,0,14,.2,11),n(s,C,-5.45,2.1,0,.19,4.3,8.7),n(s,b,-5.32,.13,0,.1,.25,8.7);let O=f("#697a70"),f0=S("#b7c4b8");for(let o=0;o<4;o++){let e=-2.22+o*.85;n(s,O,-5.32,2.15,e,.08,1.74,.82),n(s,f0,-5.26,2.15,e,.032,1.6,.73),n(s,O,-5.23,2.13,e,.027,.055,.74)}n(s,b,-5.24,1.22,-.96,.35,.11,3.7);let U=f("#77786b");for(let o=-5;o<6;o+=1.45)n(s,U,o,.002,0,.012,.003,11);for(let o=-4;o<5;o+=1.45)n(s,U,0,.002,o,14,.003,.012);n(s,C,0,1.92,-3.22,12,3.9,.24),n(s,b,0,.13,-3.03,12,.25,.13);let D=[],X=["#625d4d","#c4bca4","#a77c62","#46616a","#cab792","#746b72","#747854","#b2957d","#333e40","#be8a6f"];for(let[o,e]of x.entries()){let t=e.x;for(let i of[1.41,1.94,2.47])n(s,b,t,i,-2.83,2.54,.077,.5);for(let i of[-1.23,0,1.23])n(s,b,t+i,1.92,-2.83,.057,1.15,.5);for(let i=0;i<2;i++)for(let c=0;c<45;c++){if(c%14===9||c===22)continue;let m=.28+(c*7+o*9)%11*.012;D.push({x:t-1.17+c*.0525,y:1.45+i*.53+m/2,z:-2.68+c%5*.007,h:m,c:X[(c*13+o*7+i*3)%X.length],tilt:c%11===0?-.065:0})}n(s,b,t,.52,-2.2,1.5,1.02,.75),n(s,A,t,.94,-1.818,1.53,.054,.048),n(s,H,t,.65,-1.814,1.35,.4,.021);for(let i of[-.7,.7])n(s,v,t+i,1.14,-2.18,.085,.35,.73);n(s,v,t,1.14,-2.52,1.46,.35,.08),n(s,v,t,1.1,-1.85,1.44,.27,.065),F(s,e.name.toUpperCase(),t,.65,-1.788,1.05,.22,"#3c4036","#ded0b3");for(let i=0;i<7;i++)n(s,i%3===0?G:H,t,1.15,-2.4+i*.071,1.27,.2+i%3*.035,.043)}let d0=f("#ffffff"),T=new $(new I(1,1,1),d0,D.length),g=new K;D.forEach((o,e)=>{g.position.set(o.x,o.y,o.z),g.scale.set(.039,o.h,.29),g.rotation.z=o.tilt,g.updateMatrix(),T.setMatrixAt(e,g.matrix),T.setColorAt(e,new Q(o.c))}),T.castShadow=T.receiveShadow=!0,s.add(T),F(s,"SIDE B     /     RECORD ARCHIVE",0,2.95,-3.076,4.3,.35,"#344e44","#ddd2b7");for(let o of[-4.65,4.68])n(s,v,o,1.9,-3.04,.1,3.75,.12),n(s,A,o,2.9,-2.93,.25,.09,.14);for(let o of[-3,0,3]){r0(s,R,[o,3.2,-2.8],[o,3.2,-2.3],.028);let e=new j(new e0(.23,.21,22),G);e.position.set(o,3.12,-2.26),s.add(e),n(s,S("#fff1cd"),o,3.005,-2.26,.31,.015,.29),i0(s,16767649,30,[o,2.96,-2.24],[o,1,-2])}let V=new P;s.add(V);let Y=[];for(let o=0;o<3;o++){let e=new P;V.add(e),Y.push(e),n(e,A,0,1.01,0,1.055,1.54,.08),n(e,G,0,1.01,.052,1.01,1.49,.052);for(let t=0;t<12;t++)n(e,f(t%2?"#60746a":"#6b7d70"),-.455+t*.083,1.02,.084,.031,1.41,.035);for(let t of[.3,1.71])n(e,v,0,t,.098,1.02,.042,.039);for(let t of[-1,1])n(e,R,t*.42,.14,0,.04,.24,.064),n(e,R,t*.42,.052,0,.063,.065,.186)}let p=new j(new I(.49,.49,.035),n0());s.add(p),p.rotation.x=-.12;let l0=x.map(()=>{let o=new W().setFromPoints([new E,new E]),e=new o0(o,new t0({color:"#7db49c",dashSize:.14,gapSize:.09,transparent:!0,opacity:.85}));return s.add(e),e}),p0=x.map(o=>n(s,S("#decba5"),o.x,1.1,-1.805,.25,.055,.012)),M=new E,Z,N;return(o,e,t)=>{Z!==o&&(Z=o,N=s0(o.end,r=>{let a=J(o,r);return{...a.pos,facing:a.yaw}},Math.atan2(2.6,-4.25)));let i=(o.screen.left+o.screen.right)/2,c=o.screen.right-o.screen.left;V.position.set(i,0,(o.screen.front+o.screen.back)/2),Y.forEach((r,a)=>{r.position.x=o.closed?(a-1)*c/3:(a-1)*.035,r.position.z=o.closed?0:(a-1)*.058});let m=x.find(r=>r.id===o.destination),m0=Math.max(0,Math.min(1,(e-u)/8));p.visible=e>=u-6&&e<u+8||t.found,p.position.set(m.x,t.found?1.5:1.6-m0*.42,-2.055),p0.forEach((r,a)=>r.material.color.set(t.inspected.some(w=>w.i===a&&w.found)?"#a7d796":t.visit?.i===a?"#e6a05b":"#beb494")),l0.forEach((r,a)=>{if(r.visible=e>=u&&e<q+2,!r.visible)return;let w=x[a],b0=o.screen.front,k=o.visible[a]?1:(b0-d.z)/(w.z-d.z),L=r.geometry.attributes.position;L.setXYZ(0,d.x,.044,d.z),L.setXYZ(1,d.x+(w.x-d.x)*k,.044,d.z+(w.z-d.z)*k),L.needsUpdate=!0,r.computeLineDistances(),r.material.color.set(o.visible[a]?"#9dcfb2":"#d89c61")});let h0=t.visit&&e>=t.visit.arrive,_=h0?x[t.visit.i]:null,h=Math.max(0,Math.min(1,(e-o.end+6)/6)),x0=N(e),B=[];if(h>0)B.push(["r",m.x+.17,1.14+h*.12,-1.72+h*.17,1]);else if(_){let r=Math.min(1,(e-t.visit.arrive)/2,t.visit.found?1:(t.visit.end-e)/2);B.push(["r",_.x+.15,1.16,-1.73,r])}if(l.pose(y.key,t.pos,x0,e,B),h>0){l.handPosition(y.key,"r",M),p.visible=!0;let r=h*h*(3-2*h);p.position.set(m.x+(M.x-.13-m.x)*r,1.11+(M.y+.09-1.11)*r,-2.04+(M.z-.015+2.04)*r),p.rotation.x=-.12-.17*r}else p.rotation.x=-.12;return l.render([3.12,3.83,7.52],[-.12,1.18,-.63],36.5),l.project(t.pos.x,1.78,t.pos.z)}}export{M0 as a};
