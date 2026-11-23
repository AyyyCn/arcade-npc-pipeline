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
import{a as K,b as Q,d as X,e as Y}from"./chunk-6ZA3Y4SI.js";import{C as E,D as S,K as V,M as k,O as B,R as F,X as P,a as C,aa as A,ca as O,d as R,da as W,fa as D,ha as H,ia as q,ja as I,k as j,la as N,ma as U,oa as J,p as M,ra as Z,u as G,w as L,x as z}from"./chunk-Y7G2TOMY.js";var we=(r,a=.75,t=0)=>new P({color:r,roughness:a,metalness:t}),ge=r=>new E({color:r}),ae=new k(1,1,1);function xe(r,a,t,o,e,n,p,i){let s=new S(ae,a);return s.position.set(t,o,e),s.scale.set(n,p,i),s.castShadow=s.receiveShadow=!0,r.add(s),s}function Te(r,a,t,o,e=.028){let n=new M(...t),p=new M(...o),i=p.clone().sub(n),s=new S(new B(e,e,i.length(),9),a);return s.position.copy(n.add(p).multiplyScalar(.5)),s.quaternion.setFromUnitVectors(new M(0,1,0),i.normalize()),r.add(s),s}function Me(r,a,t,o,e,n,p,i="#f2e9d1",s="#24352f"){let c=document.createElement("canvas");c.width=768,c.height=Math.max(48,Math.round(c.width*p/n));let h=c.getContext("2d");h.fillStyle=s,h.fillRect(0,0,c.width,c.height),h.fillStyle=i,h.textAlign="center",h.textBaseline="middle",h.font="bold "+Math.floor(c.height*.6)+"px Helvetica Neue, Arial, sans-serif",h.fillText(a,c.width/2,c.height*.52,c.width*.92);let y=new V(c);y.colorSpace=j,y.anisotropy=8;let x=new S(new F(n,p),new P({map:y,roughness:.78}));return x.position.set(t,o,e),r.add(x),x}function ye(r,a,t,o,e){let n=new W(a,t,22,1.02,.62,2);return n.position.set(...o),n.target.position.set(...e),r.add(n,n.target),n}async function Se(r,a,t){let o=new q({canvas:r,antialias:!0,powerPreference:"high-performance"});o.setPixelRatio(Math.min(devicePixelRatio||1,1.55)),o.toneMapping=R,o.toneMappingExposure=t?1.04:1.08,o.shadowMap.enabled=!0,o.shadowMap.type=C;let e=new z;e.background=new G(t?"#494137":"#24252a"),e.fog=new L(e.background,13,27);let n=new H(o),p=new I;e.environment=n.fromScene(p,.04).texture,e.environmentIntensity=t?.24:.21,p.dispose(),n.dispose(),e.add(new A(t?16771792:12900077,t?11770230:8349797,t?1.15:.82));let i=new D(t?16771016:16767920,t?2.35:1.76);i.position.set(-4.8,7.8,4.1),i.castShadow=!0,i.shadow.mapSize.set(2048,2048),Object.assign(i.shadow.camera,{left:-7,right:7,top:5,bottom:-5,near:1,far:22}),i.shadow.normalBias=.016,i.shadow.bias=-16e-5,e.add(i,i.target);let s=new N().setMeshoptDecoder(U),c=Object.keys(a).map(d=>a[d].rig),[h,y]=await Promise.all([Y(s,Object.fromEntries(Object.entries(X).filter(([d])=>c.includes(d)))),Z()]),x=Q(e,h,a),l=new O(37,1,.05,45),u=new M,b=0,v=0;function _(d,f,m,w,g=[]){let T=x.get(d);T.root.position.set(f.x,.009,f.z),T.root.rotation.y=m.yaw,J(T,m,w),T.root.updateWorldMatrix(!0,!0);for(let[oe,ne,re,ie,se=1]of g)T.root.worldToLocal(u.set(ne,re,ie)),K(T,oe,u.x,u.y,u.z,se)}function $(d,f,m){return x.get(d).arms[f][2].getWorldPosition(m)}function ee(d,f,m=38){let w=r.clientWidth,g=r.clientHeight;!w||!g||((b!==w||v!==g)&&(b=w,v=g,o.setSize(w,g,!1)),l.aspect=w/g,l.fov=m,l.position.set(...d),l.aspect<1.45&&l.position.lerp(new M(...f),1-1.45/l.aspect),l.lookAt(...f),l.updateProjectionMatrix(),o.render(e,l))}function te(d,f,m){return u.set(d,f,m).project(l),{x:(.5+.5*u.x)*b,y:(.5-.5*u.y)*v}}return{scene:e,materials:y,pose:_,handPosition:$,render:ee,project:te}}export{we as a,ge as b,xe as c,Te as d,Me as e,ye as f,Se as g};
