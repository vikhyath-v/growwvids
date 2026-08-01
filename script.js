const API="https://opensheet.elk.sh/1i0dWthUd7ZKNKHjFc2I96g5L7AWbalLmzB92Wuo-Unk/1";
const grid=document.getElementById("grid");
const search=document.getElementById("search");
let cards=[];

function vid(u){
 const m=u.match(/(?:v=|youtu\.be\/|shorts\/)([A-Za-z0-9_-]{11})|([A-Za-z0-9_-]{11})/);
 return (m&& (m[1]||m[2]))||"";
}

async function load(){
 const rows=await fetch(API).then(r=>r.json());
 cards=await Promise.all(rows.map(async r=>{
   const url=r.url||r.URL||Object.values(r)[0];
   if(!url) return null;
   const id=vid(url);
   let title="YouTube Video",channel="";
   try{
      const meta=await fetch("https://noembed.com/embed?url="+encodeURIComponent(url)).then(r=>r.json());
      title=meta.title||title;
      channel=meta.author_name||"";
   }catch(e){}
   return {url,title,channel,thumb:`https://img.youtube.com/vi/${id}/maxresdefault.jpg`,fallback:`https://img.youtube.com/vi/${id}/hqdefault.jpg`};
 }));
 render(cards.filter(Boolean));
}
function render(list){
 grid.innerHTML="";
 list.forEach(v=>{
  grid.insertAdjacentHTML("beforeend",`
   <a class="card" href="${v.url}" target="_blank">
    <img class="thumb" src="${v.thumb}" onerror="this.src='${v.fallback}'">
    <div class="info">
      <div class="title">${v.title}</div>
      <div class="channel">${v.channel}</div>
    </div>
   </a>`);
 });
}
search.oninput=()=>{
 const q=search.value.toLowerCase();
 render(cards.filter(v=>v && (v.title.toLowerCase().includes(q)||v.channel.toLowerCase().includes(q))));
};
load();
