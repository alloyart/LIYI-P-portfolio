"use strict";
const projects=[
{key:"cover",title:"封面"},{key:"contents",title:"目录"},
{key:"validation",title:"汽车试验验证平台",kind:"产品设计",color:"#8f70ff"},
{key:"autoclaw",title:"AutoClaw官网",kind:"界面设计",color:"#ff6a00"},
{key:"car-assistant",title:"新能源车控app中的AI用车助手",kind:"功能设计",color:"#00bfa0"},
{key:"portrait",title:"商业人像生成式AI平台",kind:"图像质量优化",color:"#15beed"}];
const main=document.querySelector("#portfolio"),root=document.querySelector("#toc-root"),toggle=document.querySelector("#toc-toggle"),panel=document.querySelector("#toc-panel");
let pinned=false,leaveTimer=null;
function setOpen(open){panel.hidden=!open;toggle.setAttribute("aria-expanded",String(open));toggle.setAttribute("aria-label",open?"收起项目目录":"展开项目目录");}
function closeMenu(){pinned=false;clearTimeout(leaveTimer);setOpen(false);}
root.addEventListener("pointerenter",e=>{if(e.pointerType==="mouse"){clearTimeout(leaveTimer);setOpen(true);}});
root.addEventListener("pointerleave",e=>{if(e.pointerType==="mouse"&&!pinned)leaveTimer=setTimeout(()=>setOpen(false),180);});
toggle.addEventListener("click",e=>{clearTimeout(leaveTimer);pinned=!pinned;setOpen(pinned);if(pinned&&e.detail===0)panel.querySelector("a")?.focus();});
document.querySelector("#toc-close").addEventListener("click",()=>{closeMenu();toggle.focus({preventScroll:true});});
document.addEventListener("pointerdown",e=>{if(!root.contains(e.target))closeMenu();});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!panel.hidden){closeMenu();toggle.focus({preventScroll:true});}});
root.addEventListener("focusout",e=>{if(e.relatedTarget&&!root.contains(e.relatedTarget))closeMenu();});
document.querySelector(".toc-top").addEventListener("click",closeMenu);
const basename=t=>"assets/"+t.asset;
function loadTile(tile){const img=tile.querySelector("img");if(img.dataset.started)return;img.dataset.started="1";img.srcset=img.dataset.srcset;img.sizes="(min-width:1920px) 1920px, 100vw";img.src=img.dataset.src;}
async function init(){
 const response=await fetch("pages-v2.json");if(!response.ok)throw Error("页面资源无法读取");const data=await response.json(),tiles=[];
 for(const project of projects){
  const section=document.createElement("section");section.id=project.key;
  const heading=document.createElement("h2");heading.className="sr-only";heading.textContent=project.title;section.append(heading);main.append(section);
  for(const t of data.filter(t=>t.key===project.key)){
   const index=data.indexOf(t),tile=document.createElement("figure");tile.className="tile";tile.style.setProperty("--tile-height",t.height);tile.style.setProperty("--tile-bg",project.key==="cover"?"#1d2744":project.key==="autoclaw"?"#392018":"#92959c");
   const img=document.createElement("img");img.width=1920;img.height=t.height;img.alt=project.title+"，内容第 "+(t.order+1)+" 段";img.draggable=false;img.decoding="async";img.loading=index===0?"eager":"lazy";if(index===0)img.fetchPriority="high";
   img.dataset.src=basename(t)+"-medium.webp";img.dataset.srcset=basename(t)+"-small.webp 960w, "+basename(t)+"-medium.webp 1920w, "+basename(t)+"-large.webp 3840w";
   img.addEventListener("load",()=>{tile.classList.add("loaded");tile.classList.remove("failed");tile.querySelector(".retry")?.remove();});
   img.addEventListener("error",()=>{tile.classList.add("failed");if(tile.querySelector(".retry"))return;const retry=document.createElement("button");retry.className="retry";retry.textContent="加载失败，点击重试";retry.addEventListener("click",()=>{delete img.dataset.started;tile.classList.remove("failed");loadTile(tile);});tile.append(retry);});tile.append(img);
   if(project.key==="contents")projects.slice(2).forEach((p,i)=>{const a=document.createElement("a");a.className="directory-link";a.href="#"+p.key;a.style.top=(36.85+i*13.888889)+"%";a.setAttribute("aria-label","查看"+p.title);tile.append(a);});
   section.append(tile);tiles.push(tile);
  }
 }
 const links=document.querySelector("#toc-links");
 projects.slice(2).forEach((p,i)=>{const a=document.createElement("a");a.href="#"+p.key;a.style.setProperty("--accent",p.color);a.innerHTML='<span class="toc-num">0'+(i+1)+'</span><span><span class="toc-name">'+p.title+'</span><span class="toc-kind">'+p.kind+'</span></span><span class="toc-arrow" aria-hidden="true">↗</span>';a.addEventListener("click",closeMenu);links.append(a);});
 if("IntersectionObserver"in window){
  const loader=new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){loadTile(entry.target);loader.unobserve(entry.target);}},{rootMargin:"650px 0px"});tiles.forEach(t=>loader.observe(t));
  const tracker=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting)document.querySelectorAll("#toc-links a").forEach(a=>{if(a.hash==="#"+e.target.id)a.setAttribute("aria-current","location");else a.removeAttribute("aria-current");});});},{rootMargin:"0px 0px -65% 0px"});projects.slice(2).forEach(p=>tracker.observe(document.getElementById(p.key)));
 }else tiles.forEach(loadTile);
 loadTile(tiles[0]);if(location.hash)document.getElementById(location.hash.slice(1))?.scrollIntoView({behavior:"instant"});
}
init().catch(error=>{main.innerHTML='<p class="no-script">加载遇到问题，请刷新页面重试。</p>';console.error(error);});
