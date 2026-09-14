(function(){
function install(){
  const frame=document.getElementById('app');
  if(!frame||!frame.contentWindow||!frame.contentDocument)return;
  const w=frame.contentWindow;
  const d=frame.contentDocument;
  const STORAGE_KEY='poseSelectionsV30';
  const LEGACY_PREFIX='therapist_pose_selected_v31_';
  const SLOTS=['stand','seat1','seat2'];
  let memorySelections={};

  function normalizeKind(kind){
    if(kind==='standing')return 'stand';
    if(kind==='seated1'||kind==='sit01')return 'seat1';
    if(kind==='seated2'||kind==='sit02')return 'seat2';
    return kind;
  }

  function sanitizeSelections(value){
    if(!value||typeof value!=='object'||Array.isArray(value))return {};
    const clean={};
    for(const slot of SLOTS){
      if(typeof value[slot]==='string'&&value[slot])clean[slot]=value[slot];
    }
    return clean;
  }

  function readSelections(){
    let stored={};
    try{stored=sanitizeSelections(JSON.parse(w.localStorage.getItem(STORAGE_KEY)||'{}'))}catch(e){}
    memorySelections={...memorySelections,...stored};
    return {...memorySelections};
  }

  function writeSelections(value){
    memorySelections=sanitizeSelections(value);
    try{w.localStorage.setItem(STORAGE_KEY,JSON.stringify(memorySelections))}catch(e){}
    return {...memorySelections};
  }

  function findCard(id){
    return Array.from(d.querySelectorAll('[data-id]')).find(card=>card.dataset.id===id)||null;
  }

  function previewBox(slot){
    return d.getElementById('preview-'+slot);
  }

  function renderPreviews(){
    const selections=readSelections();
    for(const slot of SLOTS){
      const box=previewBox(slot);
      if(!box)continue;
      let image=box.querySelector('img');
      if(!image){image=d.createElement('img');box.prepend(image)}
      const card=selections[slot]?findCard(selections[slot]):null;
      const source=card&&card.querySelector('.image-wrap img, img');
      if(source&&source.src){
        image.src=source.currentSrc||source.src;
        box.classList.add('has');
        box.dataset.selectedId=selections[slot];
      }else{
        image.removeAttribute('src');
        box.classList.remove('has');
        delete box.dataset.selectedId;
      }
    }
    const selectedIds=new Set(Object.values(selections));
    d.querySelectorAll('[data-id]').forEach(card=>card.classList.toggle('selected',selectedIds.has(card.dataset.id)));
  }

  function migrateLegacySelections(){
    const next=readSelections();
    let changed=false;
    for(const slot of SLOTS){
      try{
        const legacy=JSON.parse(w.localStorage.getItem(LEGACY_PREFIX+slot)||'null');
        if(!next[slot]&&legacy&&typeof legacy.id==='string'&&findCard(legacy.id)){
          next[slot]=legacy.id;
          changed=true;
        }
        w.localStorage.removeItem(LEGACY_PREFIX+slot);
      }catch(e){}
    }
    if(changed)writeSelections(next);
  }

  w.poseSelectionsV30=readSelections;
  w.renderPosePreviewsV30=renderPreviews;
  w.findPoseCardV30=findCard;

  w.selectPose=function(id,kind){
    const slot=normalizeKind(kind);
    const card=findCard(id);
    const source=card&&card.querySelector('.image-wrap img, img');
    if(!SLOTS.includes(slot)||!source||!source.src){
      if(w.toast)w.toast('画像を取得できませんでした');
      return;
    }
    const next=readSelections();
    next[slot]=id;
    writeSelections(next);
    if(w.showPage)w.showPage('home');
    renderPreviews();
    if(w.requestAnimationFrame)w.requestAnimationFrame(renderPreviews);
    if(w.toast)w.toast('POSEに反映しました');
  };

  w.copySelectedPoseV30=async function(kind){
    const slot=normalizeKind(kind);
    const selections=readSelections();
    const card=selections[slot]?findCard(selections[slot]):null;
    const image=card&&card.querySelector('.image-wrap img, img');
    if(!image||!image.src){
      if(w.toast)w.toast('画像が選択されていません');
      return;
    }
    if(w.copyImageElement)await w.copyImageElement(image);
  };
  w.copySelectedPose=w.copySelectedPoseV30;

  d.querySelectorAll('#standing .stand-ref-card .image-wrap,#seated1 .pose-card .image-wrap,#seated2 .pose-card .image-wrap').forEach(wrap=>{
    wrap.style.cursor='pointer';
    wrap.onclick=function(event){
      event.preventDefault();
      event.stopPropagation();
      const card=wrap.closest('[data-id]');
      if(!card)return;
      let slot='stand';
      if(card.closest('#seated1'))slot='seat1';
      else if(card.closest('#seated2'))slot='seat2';
      w.selectPose(card.dataset.id,slot);
    };
  });

  migrateLegacySelections();
  renderPreviews();
}

const frame=document.getElementById('app');
if(frame){
  frame.addEventListener('load',()=>setTimeout(install,80));
  if(frame.contentDocument&&frame.contentDocument.readyState==='complete')setTimeout(install,120);
}
})();
