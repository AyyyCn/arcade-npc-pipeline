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
import{a as U}from"./chunk-6PAI3A5S.js";import{a as i,b as a,c as m,d as V}from"./chunk-5I6CTITS.js";import"./chunk-Q4YEZBTT.js";import"./chunk-6ZA3Y4SI.js";import"./chunk-Y7G2TOMY.js";import{a as k,b as D,c as b,d as K,e as B,f as I,h as _,i as q,j as F,k as H,l as R,m as S}from"./chunk-6DELKLQG.js";import"./chunk-PQNXGCHF.js";import{c as x,f as J}from"./chunk-DNQ3AYLV.js";import"./chunk-EJRCZQV5.js";import"./chunk-KXWL3TAT.js";var C=new URLSearchParams(location.search),l=B(C),L=C.get("archive"),N=x.find(e=>e.id===C.get("bin"))??x[2],T=["open","closed"].includes(L)?J(L==="closed",N.id):null,h=C.get("run")==="altered"?"altered":"original",d,o,g,Z,M="",O="";function G(){d=_(I(l[h],T?.end??0)),o=d,g=null,M=O=""}G();m("lab-title","Crew coordination");m("premise","Call a stagehand on the radio mid-transfer. Can the crew still open the doors on time?");m("experiment","The opening cue");var E=i("related");E.hidden=!1;E.href="?crowd&seed="+l.seed+"&hold="+l.hold;E.textContent="See the crowd that booked this hall \u2197";i("fields").innerHTML='<label>Audience<select id="attendance"><option value="original">Original crowd \xB7 '+l.original+'</option><option value="altered">Interrupted crowd \xB7 '+l.altered+'</option></select></label><label>Radio recipient<select id="who">'+b.map(e=>'<option value="'+e.id+'">'+e.name+" \xB7 "+e.title+"</option>").join("")+'</select></label><label>Absence<select id="duration"><option value="60">6 seconds</option><option value="120" selected>12 seconds</option><option value="200">20 seconds</option></select></label>';i("attendance").value=h;i("who").value=1;i("actions").innerHTML='<button id="apply" class="main-action">Make radio call</button><button id="restore">Reset plan</button>';i("under").innerHTML='<h3>Crew schedule</h3><div id="gantt"></div><p class="proof-note">Solid bars show assigned work. Stripes mark the absence. The line follows the replay.</p>';i("details").innerHTML='<h3 id="decision-title">Current work</h3><p class="notes" id="decision"></p><p class="proof-note" id="order"></p><p class="proof-note interactive"><a id="to-archive">Open the record search \u2197</a></p>';var w=e=>e.team.map(n=>b[n].name).join(" and "),y=()=>Math.max(k,o.end,g?.end??0),v=V({initial:S(d),limit:y,draw:Y,describe:X});function P(){G(),v.jump(S(d))}i("attendance").onchange=e=>{h=e.target.value,P()};i("restore").onclick=P;i("who").onchange=i("duration").onchange=()=>{o.incident?P():v.paint()};i("apply").onclick=()=>{let e=Math.floor(v.tick);if(e>=d.end||o.incident)return;let n=Number(i("who").value),p=Number(i("duration").value);o=R(d,e,n,p),g=R(d,e,n,p,{keepTeams:!0}),M=O="",v.jump(e,!0)};function X(e){let n=H(o,"rack",e),p=o.incident;return{mode:"crew",recordReady:T?.end??0,audience:l[h],run:h,seed:l.seed,doors:k,baseEnd:d.end,finish:o.end,keptTeamsEnd:g?.end??null,incident:p??null,rack:{position:F(o,e),worked:n.worked,total:n.total,team:n.current?w(n.current):null},jobs:o.jobs.map(r=>r.id),assignments:o.entries.map(r=>({id:r.job.id,team:w(r),start:r.start,end:r.end})),crew:b.map(r=>{let f=q(o,r.id,e);return{name:r.name,x:f.x,z:f.z,activity:f.kind,skills:r.skills}})}}function Y(e){Z(o,e);let n=o.incident,p=H(o,"rack",e),r=Math.round(100*p.worked/p.total),f=o.entries.filter(c=>c.start<=e&&e<c.end),Q=e>=o.end?"Opening cue complete":p.current?w(p.current)+" move the PA rack":!p.done&&r>0?"PA rack parked at "+r+"%":f.length?f.map(c=>c.job.short).join("  \xB7  "):"Crew moving into position";m("scene-caption",Q),i("apply").disabled=!!n||Math.floor(e)>=d.end;let j=h+"/"+(n?[n.t,n.absent,n.until].join("-"):"base");if(j!==M){M=j;let c=n?[[a(g.end),"Keep original teams"],[a(o.end),"Reassign the crew"]]:[[a(d.end),"Planned opening cue"],[a(k),"Doors open"]];if(i("result").innerHTML='<div class="metrics">'+c.map(([u,t])=>'<div class="metric"><strong>'+u+"</strong><span>"+t+"</span></div>").join("")+"</div><p>"+(n?o.end<=k?"Replanned crew makes doors by "+a(k-o.end)+".":"Opening runs "+a(o.end-k)+" past doors.":"Doors are set for "+a(k)+". Each job needs the right skills and a crew member on site.")+"</p>",i("to-archive").href="?perception&seed="+l.seed+"&hold="+l.hold+"&run="+h+"&screen="+(L??"closed")+"&bin="+N.id,m("order",l[h]+" guests in East Hall. "+(l[h]>=D?"The work order includes a second speaker zone.":"One speaker zone covers this audience.")+(T?" The reference sleeve arrives from "+N.name+" at "+a(T.end)+" for the main sound check.":"")),m("decision-title",n?"Handoff":"On the clock"),n){let u=b[n.absent],t=d.entries.find(s=>s.team.includes(u.id)&&s.start<=n.t&&n.t<s.end);if(t){let s=o.entries.find(A=>A.job.id===t.job.id&&!A.interrupted&&A.start>=n.t),z=Math.round((n.t-t.start)/(t.end-t.start)*100);m("decision",u.name+" answers the radio at "+a(n.t)+". "+(t.job.id==="rack"?"The rack is "+z+"% across the stage. ":t.job.name+" is "+z+"% complete. ")+w(s)+" "+(s.team.length===1?"resumes":"resume")+" at "+a(s.start)+"."+(t.job.id==="rack"?" Both are trained rack handlers.":""))}else m("decision",u.name+" is unavailable from "+a(n.t)+" to "+a(n.until)+". The planner schedules the remaining work from each person\u2019s current position.")}else{let u=d.entries.find(s=>s.job.id==="rack"),t=d.entries.find(s=>s.job.id==="feed");m("decision",w(u)+" move the rack. "+w(t)+" sets up power. Interrupt one crew member to compare the two schedules.")}}let W=Number(i("who").value);i("who").title=b[W].skills.map(c=>K[c]).join(", "),O!==j&&(O=j,i("gantt").innerHTML=b.map((c,u)=>'<div class="report-row"><b>'+c.name+'</b><div class="work-track">'+o.tracks[u].filter(t=>t.kind==="work"||t.kind==="away").map(t=>'<i class="'+t.kind+'" style="left:'+100*t.start/y()+"%;width:"+100*(t.end-t.start)/y()+'%" title="'+(t.kind==="away"?"Called away":o.jobs.find(s=>s.id===t.task).name)+" \xB7 "+a(t.start)+" to "+a(t.end)+'"></i>').join("")+"<em></em></div></div>").join(""));for(let c of i("gantt").querySelectorAll("em"))c.style.left=e/y()*100+"%"}U(i("world")).then(e=>{Z=e,v.open()}).catch(v.fail);
