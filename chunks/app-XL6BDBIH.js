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
import{a as M}from"./chunk-67MXUPV4.js";import{a as i,b as H,c as l,d as I}from"./chunk-5I6CTITS.js";import"./chunk-Q4YEZBTT.js";import"./chunk-6ZA3Y4SI.js";import"./chunk-Y7G2TOMY.js";import{a as k,c as a,d as h,e as L,f as v,g as u}from"./chunk-DNQ3AYLV.js";import"./chunk-EJRCZQV5.js";import"./chunk-KXWL3TAT.js";var p=new URLSearchParams(location.search),t=p.get("screen")!=="open",r=a.some(e=>e.id===p.get("bin"))?p.get("bin"):"dispatch",o,b,j,f="";function F(){o=v(t,r),b=v(!t,r),f=""}F();l("lab-title","Perception & search");l("premise","File the same record behind a movable screen. Watch where Ida looks for it.");l("experiment","The missing sleeve");i("fields").innerHTML='<label>File the sleeve in<select id="bin">'+a.map(e=>'<option value="'+e.id+'">'+e.name+"</option>").join("")+'</select></label><label>Folding screen<select id="screen"><option value="closed">Across the room</option><option value="open">Folded aside</option></select></label>';i("actions").innerHTML='<button class="main-action" id="search-start">Watch the search</button><button id="compare-screen">Fold screen aside</button>';i("under").innerHTML='<h3>Ida\u2019s observations</h3><ol class="evidence-list" id="observations"></ol>';i("details").innerHTML='<h3>Where Ida thinks the sleeve is</h3><div id="weights"></div><p class="proof-note">Starting odds use 50 sample filings. Seeing the deposit or finding an empty bin changes Ida\u2019s estimate.</p><p class="interactive"><a id="send-record" hidden>Send the sleeve to sound check \u2197</a></p>';i("weights").innerHTML=a.map(e=>'<div class="prob"><span>'+e.name+"</span><i><b></b></i><span>0%</span></div>").join("");var m=I({initial:h,limit:()=>o.end,draw:C,describe:y});function g(e=!1){F(),m.jump(h,e)}i("bin").value=r;i("screen").value=t?"closed":"open";i("bin").onchange=e=>{r=e.target.value,g()};i("screen").onchange=e=>{t=e.target.value==="closed",g()};i("compare-screen").onclick=()=>{t=!t,i("screen").value=t?"closed":"open",g(!0)};i("search-start").onclick=()=>m.jump(0,!0);function y(e){let n=u(o,e);return{mode:"perception",closed:t,bin:r,seen:e<h?null:o.seen,visible:o.visible,weights:n.weights,observer:{name:k.name,...n.pos},found:n.found,inspected:n.inspected.map(d=>a[d.i].name),currentSearch:n.visit?a[n.visit.i].name:null,evidence:n.evidence.map(d=>d.text),finishedAt:o.end}}function C(e){let n=u(o,e);j(o,e,n);let d=i("send-record");if(d.hidden=!n.found,n.found){let s=new URLSearchParams("crew");s.set("archive",t?"closed":"open"),s.set("bin",r);for(let c of["run","seed","hold"])p.has(c)&&s.set(c,p.get(c));d.href="?"+s}let w=n.visit?a[n.visit.i].name:null,x=n.found?"Ida found the sleeve in "+a.find(s=>s.id===r).name:e<h?"The sleeve is about to be filed":e<L?o.seen?"Ida saw the deposit":"The screen blocked the deposit":e<n.visit.arrive?"Ida is walking to "+w:"Ida checks "+w;l("scene-caption",x),l("compare-screen",t?"Fold screen aside":"Unfold screen");let T=t+"/"+r+"/"+n.evidence.length;if(T===f)return;f=T;let A=t?o:b,E=t?b:o;i("result").innerHTML='<div class="metrics">'+[[A,"Screen across"],[E,"Screen aside"]].map(([s,c])=>'<div class="metric"><strong>'+s.visits.length+" "+(s.visits.length===1?"bin":"bins")+"</strong><span>"+c+"</span></div>").join("")+"</div><p>Same sleeve in "+a.find(s=>s.id===r).name+". The counts compare complete replays.</p>";let S=i("weights").children;n.weights.forEach((s,c)=>{S[c].querySelector("b").style.width=s*100+"%",S[c].lastChild.textContent=Math.round(s*100)+"%"}),i("observations").innerHTML=n.evidence.map(s=>"<li><time>"+H(s.t)+"</time><span>"+s.text+"</span></li>").join("")}M(i("world")).then(e=>{j=e,m.open()}).catch(m.fail);
