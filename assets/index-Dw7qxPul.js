import n from"https://cdn.jsdelivr.net/npm/fullpage-vertical-slider@0.0.0/dist/fvs.es.js";(function(){const r=document.createElement("link").relList;if(r&&r.supports&&r.supports("modulepreload"))return;for(const e of document.querySelectorAll('link[rel="modulepreload"]'))s(e);new MutationObserver(e=>{for(const t of e)if(t.type==="childList")for(const c of t.addedNodes)c.tagName==="LINK"&&c.rel==="modulepreload"&&s(c)}).observe(document,{childList:!0,subtree:!0});function i(e){const t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin==="use-credentials"?t.credentials="include":e.crossOrigin==="anonymous"?t.credentials="omit":t.credentials="same-origin",t}function s(e){if(e.ep)return;e.ep=!0;const t=i(e);fetch(e.href,t)}})();const l=new n({scrollContainerSelector:".scroll-container",scrollSectionSelector:".section",responsiveMediaQuery:"(max-height: 600px)",subsections:[1,1,4,1],onSubsectionEnter:(o,r)=>{o===2&&document.querySelectorAll(".s3 .subsections .subsection").forEach((s,e)=>{e===r?s.classList.add("active"):s.classList.remove("active")})}}),u=document.querySelectorAll(".s3 .subsections .subsection");u.forEach((o,r)=>{o.addEventListener("click",()=>{l.setSubsection(2,r,!0)})});
