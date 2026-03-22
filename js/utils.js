
// ── HELPERS ───────────────────────────────────────────────────────────────────
function getLvl(xp){
  var lv=1;
  for(var i=0;i<XP_TH.length-1;i++) if(xp>=XP_TH[i]) lv=i+1;
  var lo=XP_TH[lv-1]||0, hi=XP_TH[lv]||XP_TH[XP_TH.length-1];
  return {lv:lv, name:LV_NM[Math.min(lv,10)], pct:Math.min(100,(xp-lo)/(hi-lo)*100), hi:hi};
}
function cs(ex){ return Object.assign({background:CARD,border:"1px solid "+BORDER,borderRadius:"16px",padding:"18px"},ex||{}); }
function bs(bg,ex){ return Object.assign({background:bg||GOLD,color:(bg===GOLD||!bg)?BG:"#fff",border:"none",borderRadius:"12px",padding:"13px 20px",fontSize:"14px",fontWeight:"800",cursor:"pointer"},ex||{}); }
function uid(){ return "u_"+Date.now()+"_"+Math.floor(Math.random()*9999); }
function randItem(arr){ return arr[Math.floor(Math.random()*arr.length)]; }
function getKey(id,sfx){ return "ga_"+id+"_"+sfx; }
function fmtDate(iso){
  try{
    var d=new Date(iso);
    return d.toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"})+" at "+d.toLocaleTimeString("en-GB",{hour:"2-digit",minute:"2-digit"});
  }catch(e){return "";}
}

// ── STORAGE ───────────────────────────────────────────────────────────────────
function loadProfiles(){ try{return JSON.parse(localStorage.getItem("ga_profiles")||"[]");}catch(e){return [];} }
function saveProfiles(p){ try{localStorage.setItem("ga_profiles",JSON.stringify(p));}catch(e){} }
function loadProgress(id){ try{return JSON.parse(localStorage.getItem(getKey(id,"progress"))||"{}");}catch(e){return {};} }
function saveProgress(id,d){ try{localStorage.setItem(getKey(id,"progress"),JSON.stringify(d));}catch(e){} }
function loadHistory(id){ try{return JSON.parse(localStorage.getItem(getKey(id,"history"))||"[]");}catch(e){return [];} }
function saveHistory(id,h){ try{localStorage.setItem(getKey(id,"history"),JSON.stringify(h.slice(-500)));}catch(e){} }
function loadPaused(id){ try{return JSON.parse(localStorage.getItem(getKey(id,"paused"))||"[]");}catch(e){return [];} }
function savePaused(id,arr){ try{localStorage.setItem(getKey(id,"paused"),JSON.stringify(arr));}catch(e){} }
function addPaused(id,p){ savePaused(id,loadPaused(id).concat([p])); }
function removePaused(id,pid){ savePaused(id,loadPaused(id).filter(function(p){return p.id!==pid;})); }
function loadTypingProgress(uid){ try{return JSON.parse(localStorage.getItem("ga_typing_"+uid)||"{}");}catch(e){return {};} }
function saveTypingProgress(uid,d){ try{localStorage.setItem("ga_typing_"+uid,JSON.stringify(d));}catch(e){} }
