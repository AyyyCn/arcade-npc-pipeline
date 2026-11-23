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
import{a as z}from"./chunk-6PAI3A5S.js";import{a as A}from"./chunk-67MXUPV4.js";import"./chunk-Q4YEZBTT.js";import"./chunk-6ZA3Y4SI.js";import"./chunk-Y7G2TOMY.js";import{e as O,f as g,h as w}from"./chunk-6DELKLQG.js";import{e as M}from"./chunk-PQNXGCHF.js";import{f as B,g as F}from"./chunk-DNQ3AYLV.js";import"./chunk-EJRCZQV5.js";import"./chunk-KXWL3TAT.js";var v=[{name:"Opening night",text:"Make a game about saving a sold-out record shop gig when the venue changes at the last minute.",facts:{goal:"stage_show",venue:"moved"}},{name:"The missing pressing",text:"Make a cozy mystery about a rare pressing that vanished from a record shop.",facts:{goal:"find_record",venue:"none"}},{name:"The booked hall",text:"Make a game about putting on a record shop gig in the hall everyone booked.",facts:{goal:"stage_show",venue:"booked"}}];function I(t){if(t?.goal==="find_record"&&t.venue==="none")return{goal:t.goal,venue:t.venue};if(t?.goal==="stage_show"&&["booked","moved"].includes(t.venue))return{goal:t.goal,venue:t.venue};throw new Error("This venue supports putting on a gig or finding a lost record. Try a brief with one of those goals.")}function P(t){let{goal:s,venue:d}=I(t),i=s==="stage_show",l=i&&d==="moved",a=l?O(new URLSearchParams):null;return{goal:s,venue:d,forecast:a,systems:[...l?["social"]:[],...i?["crew"]:[],"perception"]}}function R(t,{delayMessenger:s=!1,blockView:d=!1}={}){let i=B(d,"dispatch");if(t.goal==="find_record")return{search:i,stage:null,attendance:null,zones:null};let{forecast:l}=t,a=l?l[s?"altered":"original"]:M,c=g(a,i.end),m=w(c);return{search:i,stage:m,attendance:a,zones:c.some(J=>J.id==="zone")?2:1}}var e=t=>document.getElementById(t),b=e("game-brief"),f=document.documentElement.hasAttribute("data-interviews"),N=w(g(40)),T,k,S,o,n,u=0,p=!1,r=!1,h=0,y=!1;e("pipe-source").textContent=f?"Live local model":"Saved model briefs";b.readOnly=!f;e("pipe-examples").replaceChildren(...v.map((t,s)=>new Option(t.name,s)));function L(){let t=[];o.forecast&&t.push(["Social memory",p?"A message missed":"Word of mouth","?crowd"]),n.stage&&t.push(["Crew coordination",n.zones===1?"Smaller stage setup":"Full stage setup",o.forecast?"?crew&run="+(p?"altered":"original")+"&archive="+(r?"closed":"open")+"&bin=dispatch":null]),t.push(["Perception & search",n.search.seen?"Filing witnessed":"Search under way","?perception&bin=dispatch&screen="+(r?"closed":"open")]),e("pipe-rows").replaceChildren(...t.map(([s,d,i])=>{let l=document.createElement("div"),a=document.createElement("dt"),c=document.createElement("dd");if(i){let m=document.createElement("a");m.href=i,m.textContent=s,a.append(m)}else a.textContent=s;return c.textContent=d,l.append(a,c),l}))}function x(){if(y){if(!n){T(N,44);return}n.stage?T(n.stage,Math.min(h,n.stage.end)):S&&S(n.search,Math.min(h,n.search.end),F(n.search,Math.min(h,n.search.end))),e("pipe-clock").textContent=n.stage?"East Hall":"Record archive"}}function E(){n=R(o,{delayMessenger:p,blockView:r}),h=0,e("pipe-title").textContent=n.stage?o.forecast?"Opening night moves halls":"Opening night in the booked hall":"The missing pressing",e("pipe-caption").textContent=n.stage?"The crew prepares the stage":"Ida searches the archive",e("pipe-stage").hidden=!n.stage,e("pipe-archive").hidden=!!n.stage,e("pipe-venue").hidden=!0,e("pipe-inferred").hidden=!1,e("pipe-delay").hidden=!o.forecast,e("pipe-block").hidden=!1,e("pipe-delay").setAttribute("aria-pressed",String(p)),e("pipe-block").setAttribute("aria-pressed",String(r)),e("pipe-delay").textContent=p?"Restore the messenger":"Delay the messenger",e("pipe-block").textContent=r?"Restore Ida\u2019s view":"Block Ida\u2019s view";let t;n.stage?r?t="Ida misses the filing. Soundcheck waits while she searches the archive.":p&&o.forecast?t="The news misses part of the crowd. The crew scales back the stage setup.":o.forecast?t="Guests pass on the new address. The crew prepares for the crowd that hears.":t="The guests know the hall. The crew prepares for the booked audience.":t="Ida "+(r?"misses the filing and searches the likely bins.":"sees where the pressing is filed and goes straight there."),e("pipe-status").textContent=t,L(),x()}function _(){u++,o=n=null,p=r=!1,h=0,e("run-brief").disabled=!y,e("pipe-title").textContent="From a game brief to play",e("pipe-venue").hidden=e("pipe-stage").hidden=!1,e("pipe-inferred").hidden=e("pipe-archive").hidden=e("pipe-delay").hidden=e("pipe-block").hidden=!0,e("pipe-caption").textContent="Side B stage",e("pipe-clock").textContent="Venue preview",e("pipe-status").textContent="",x()}function V(){b.value=v[Number(e("pipe-examples").value)].text,_()}e("pipe-examples").onchange=V;b.oninput=_;e("pipe-delay").onclick=()=>{p=!p,E()};e("pipe-block").onclick=()=>{r=!r,E()};e("pipe-form").onsubmit=async t=>{t.preventDefault();let s=++u,d=b.value.trim();if(!d){e("pipe-status").textContent="Enter a game brief.";return}e("run-brief").disabled=!0,e("pipe-status").textContent=f?"Interpreting the game brief\u2026":"Loading the saved interpretation\u2026";try{let i;if(f){let a=await fetch("/game-brief",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({prompt:d})}),c=await a.json();if(!a.ok)throw new Error(c.error||"The model could not interpret this game brief.");i=c.facts}else{let a=v.find(c=>c.text===d);if(!a)throw new Error("Choose one of the saved game briefs.");i=a.facts}let l=P(i);if(l.goal==="find_record"&&(k??=A(e("pipe-archive")).catch(a=>{throw k=null,a}),S=await k),s!==u)return;p=r=!1,o=l,E()}catch(i){s===u&&(_(),e("pipe-status").textContent=i.message)}finally{s===u&&(e("run-brief").disabled=!1)}};window.advanceTime=t=>{n&&(h=Math.min(h+t/100,n.stage?.end??n.search.end),x())};window.render_game_to_text=()=>JSON.stringify({mode:"pipeline",ready:y,live:f,goal:o?.goal??null,venue:o?.venue??null,systems:o?.systems??[],attendance:n?.attendance??null,zones:n?.zones??null,bins:n?.search.visits.length??null,recordReady:n?.search.end??null,soundStarts:n?.stage?.entries.find(t=>t.job.id==="sound")?.start??null,clock:Math.floor(h),delayed:p,blocked:r});var C;function j(t){n&&h<(n.stage?.end??n.search.end)&&window.advanceTime(C?Math.min(100,t-C):0),C=t,requestAnimationFrame(j)}V();z(e("pipe-stage")).then(t=>{T=t,y=!0,e("run-brief").disabled=!1,x(),requestAnimationFrame(j)}).catch(t=>{e("pipe-status").textContent=t.message});
