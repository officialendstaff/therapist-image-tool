(function(){
function install(){
 const f=document.getElementById('app'); if(!f||!f.contentWindow||!f.contentDocument)return;
 const w=f.contentWindow,d=f.contentDocument;
 const KEY='therapist_pose_selected_v31_';
 function targetFor(kind){
  if(kind==='stand'||kind==='standing')return d.getElementById('preview-stand');
  if(kind==='seat1'||kind==='seated1'||kind==='sit01')return d.getElementById('preview-seat1');
  if(kind==='seat2'||kind==='seated2'||kind==='sit02')return d.getElementById('preview-seat2');
  return null;
 }
 function normalize(kind){
  if(kind==='standing')return 'stand';
  if(kind==='seated1'||kind==='sit01')return 'seat1';
  if(kind==='seated2'||kind==='sit02')return 'seat2';
  return kind;
 }
 function setPreview(kind,src,id){
  kind=normalize(kind); const box=targetFor(kind); if(!box||!src)return false;
  let img=box.querySelector('img'); if(!img){img=d.createElement('img');box.prepend(img)}
  img.src=src; box.classList.add('has'); box.dataset.selectedId=id||'';
  try{localStorage.setItem(KEY+kind,JSON.stringify({id:id||'',src:src}))}catch(e){}
  return true;
 }
 w.selectPose=function(id,kind){
  kind=normalize(kind);
  const card=d.querySelector('[data-id="'+id+'"]');
  const img=card&&card.querySelector('.image-wrap img, img');
  if(!img||!img.src){if(w.toast)w.toast('画像を取得できませんでした');return}
  setPreview(kind,img.src,id);
  d.querySelectorAll('[data-group="standing"],[data-kind]').forEach(x=>x.classList.remove('selected'));
  if(card)card.classList.add('selected');
  if(w.toast)w.toast('POSEに反映しました');
  if(w.showPage)w.showPage('home');
 };
 w.copySelectedPose=function(kind){
  kind=normalize(kind); const box=targetFor(kind); const img=box&&box.querySelector('img');
  if(!img||!box.classList.contains('has')||!img.src){if(w.toast)w.toast('画像が選択されていません');return}
  if(w.copyImageElement)w.copyImageElement(img); else if(w.toast)w.toast('画像コピー機能を取得できません');
 };
 ['stand','seat1','seat2'].forEach(kind=>{try{const v=JSON.parse(localStorage.getItem(KEY+kind)||'null'); if(v&&v.src)setPreview(kind,v.src,v.id)}catch(e){}});
 d.querySelectorAll('#standing .stand-ref-card .image-wrap,#seated1 .pose-card .image-wrap,#seated2 .pose-card .image-wrap').forEach(wrap=>{
  wrap.style.cursor='pointer';
  wrap.onclick=function(e){e.preventDefault();e.stopPropagation();const card=wrap.closest('[data-id]');if(!card)return;let kind='stand';if(card.closest('#seated1'))kind='seat1';else if(card.closest('#seated2'))kind='seat2';w.selectPose(card.dataset.id,kind)};
 });
}
const f=document.getElementById('app'); if(f){f.addEventListener('load',()=>setTimeout(install,80)); if(f.contentDocument&&f.contentDocument.readyState==='complete')setTimeout(install,120)}
})();
