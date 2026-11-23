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
var r=o=>document.getElementById(o),x=o=>(o/10).toFixed(1)+" s";function f(o,n){let c=r(o);c.textContent!==n&&(c.textContent=n)}function y({initial:o,limit:n,draw:c,describe:h}){let t=o,a=!1,u=!1,i=null,s=()=>{u&&(r("scrub").max=Math.ceil(n()),r("scrub").value=Math.round(t),f("time",x(t)),f("play",a?"Pause":t>=n()?"Replay":"Play"),c(t,a))},l=(e,d=!1)=>{t=Math.max(0,Math.min(n(),e)),a=d&&t<n(),s()},m=e=>{u&&a&&(t=Math.min(n(),t+Math.max(0,e)/100),t>=n()&&(a=!1)),s()};function p(e){u&&a&&m(i==null?0:Math.min(100,e-i)),i=e,requestAnimationFrame(p)}function g(){l(t>=n()?0:t,!a)}return r("play").onclick=g,r("finish").onclick=()=>l(n()),r("scrub").oninput=e=>l(Number(e.target.value)),window.addEventListener("resize",s),document.addEventListener("keydown",e=>{e.repeat||/INPUT|SELECT|BUTTON|A/.test(e.target.tagName)||(e.key===" "&&(e.preventDefault(),g()),e.key.toLowerCase()==="f"&&(document.fullscreenElement?document.exitFullscreen():document.documentElement.requestFullscreen().catch(()=>{})))}),window.advanceTime=m,window.render_game_to_text=()=>JSON.stringify(u?{ready:!0,tick:Math.floor(t),playing:a,axes:"x increases right, z toward the front, metres",...h(t)}:{ready:!1}),{get tick(){return t},jump:l,paint:s,open(){u=!0,r("loading").hidden=!0,s(),requestAnimationFrame(p)},fail(e){f("loading","Could not open the 3D venue. "+e.message);for(let d of document.querySelectorAll("button,select,input"))d.disabled=!0}}}export{r as a,x as b,f as c,y as d};
