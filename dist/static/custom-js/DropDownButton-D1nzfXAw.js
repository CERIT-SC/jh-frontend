import{r as i,j as e,F as f,b as x,d as j,e as v}from"./index-KynLtoi1.js";const m=({infoText:n})=>{const[o,t]=i.useState(!1),c=()=>{t(!0)},s=()=>{t(!1)};return e.jsxs("div",{className:"info-icon",onMouseEnter:c,onMouseLeave:s,children:[e.jsx(f,{icon:x}),o&&e.jsx("div",{className:"info-text",children:n})]})},w=({title:n="",infoText:o="",children:t,primary:c=!0,isActive:s=!1,hasIcon:r=!1,isSelected:l=!1,onActivate:d=()=>{}})=>{const[a,u]=i.useState(!1);i.useEffect(()=>{u(s)},[s]);const p=()=>{a||d(),u(!a)};return e.jsxs("div",{className:"dropdown",children:[e.jsxs("button",{className:`dropbtn--${c?"primary":"secondary"} ${a?"active":""} ${l?"selected":""}`,onClick:p,children:[n,o&&e.jsx(m,{infoText:o}),r&&!a&&e.jsx(f,{icon:j}),r&&a&&e.jsx(f,{icon:v})]}),a&&e.jsx("div",{className:"dropdown-content",children:t})]})},C=({title:n,index:o,activeIndex:t,onSelect:c})=>{const s=t===o,[r,l]=i.useState(s);i.useEffect(()=>{l(s)},[s]);const d=()=>{r||c(n,o)};return e.jsx("a",{className:`dropdown--option${r?"--active":""}`,onClick:d,children:n})};export{w as D,m as I,C as a};
