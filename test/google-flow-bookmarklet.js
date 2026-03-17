javascript:{
 const data=   window.__data246653 ??= new WeakSet();
document.onpointerdown = () => {
   for (const link of document.querySelectorAll ('[data-discover="true"]')) {
if (data.has(link)) continue;
       const url = new URL(link.querySelector('img,video').src);
       link.href = url;
                                const wow=[...link.nextElementSibling.querySelectorAll('i + div')].at(-1).textContent;
                                if (!wow) {console.warn(link);;}
       link.onclick =async e =>{ e.stopPropagation();
e.preventDefault();
            const blob = await fetch(url).then(r => r.blob()) 
                         ;       link.href=URL.createObjectURL(blob)
                const h = ()=>(link.style.filter=`hue-rotate(${Math.random()*300+30}deg)`);h();
                            ;    link.click()
                              ;  link.onclick=e=>(e.stopPropagation(),h());
                          }
   ;    link.download = `${wow} ${url.searchParams.get('name')}`
    ;   data.add(link)
   }
      for (const link of document.querySelectorAll ('.reuse-prompt-button')) {
if (data.has(link)) continue
      ;    let btn = link.parentNode.previousElementSibling
       ;   btn.onclick=e =>{/* e.stopPropagation()*/
navigator.clipboard.writeText(btn.textContent)
        ;      btn.style.color = `hsl(${Math.random()*360},50\x25,50\x25)`
                           }
       ;   data.add(link)
      }
};
document.onclick=e=>{
if (!e.shiftKey)return;
const btn = e.target.closest('button');
if (btn?.textContent==='deleteDelete'&&e.shiftKey){
requestAnimationFrame(() => {
const confirmDel=document.querySelector('[role="dialog"] :last-child > [data-type="button-overlay"]').parentNode;
if (confirmDel.textContent!=='Delete')return alert(confirmDel.textContent);
confirmDel.click()
})
}}
}
