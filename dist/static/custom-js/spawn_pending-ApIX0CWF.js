import{r as g,j as e,c as f}from"./index-KynLtoi1.js";import{J as h,E as v}from"./JupyterHubHeader-DMFqVwqU.js";const x=()=>{const[p,u]=g.useState("0");return g.useEffect(()=>{var c;const i=()=>{window.location.reload()};(c=document.getElementById("refresh"))==null||c.addEventListener("click",i);const o=new EventSource(appConfig.progressUrl),t=document.getElementById("progress-message"),a=document.getElementById("progress-line-filled");document.getElementById("sr-progress");const d=document.getElementById("progress-log");return o.onmessage=n=>{const s=JSON.parse(n.data);console.log(s),s.progress!==void 0&&u(s.progress.toString());let l="";if(s.html_message!==void 0?(t&&(t.innerHTML=s.html_message),l=s.html_message):s.message!==void 0&&(t&&(t.textContent=s.message),l=s.message),l&&d){const r=document.createElement("div");r.className="progress-log-event",r.innerHTML=l,d.appendChild(r)}if(s.ready&&(o.close(),window.location.reload()),s.failed){o.close(),a&&a.classList.add("progress-line-filled-danger");const r=document.getElementById("progress-details");r&&(r.open=!0)}},()=>{var n;o.close(),(n=document.getElementById("refresh"))==null||n.removeEventListener("click",i)}},[appConfig.progressUrl]),e.jsxs(e.Fragment,{children:[e.jsx(h,{userName:appConfig.userName,children:" "}),e.jsxs("div",{className:"wrapper",children:[e.jsx("div",{className:"row",children:e.jsxs("div",{className:"text-center",children:[e.jsxs("div",{className:"message-block",children:[e.jsx("p",{children:"Your server is starting up."}),e.jsx("p",{children:"You will be redirected automatically when it's ready for you."})]}),e.jsx("div",{className:"progress-line",children:e.jsx("div",{className:"progress-line-filled",style:{width:`${p}%`}})})]})}),e.jsx("p",{id:"progress-message"}),e.jsx("div",{className:"row justify-content-center",children:e.jsx("div",{className:"col-md-8",children:e.jsxs("details",{id:"progress-details",children:[e.jsx("summary",{children:"Event log"}),e.jsx("div",{id:"progress-log"})]})})}),e.jsx(v,{})]})]})},m=f(document.getElementById("root"));console.log(m);m.render(e.jsx(x,{}));
