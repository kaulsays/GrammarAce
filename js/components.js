
// ── SMALL REUSABLE COMPONENTS ─────────────────────────────────────────────────
function BackBtn(p){
  return React.createElement("button",{
    onClick:p.onClick,
    style:{background:"none",border:"1px solid "+BORDER,color:MUTED,borderRadius:"10px",padding:"7px 13px",fontSize:"13px",fontWeight:"700",cursor:"pointer"}
  },"← Back");
}

function LevelBar(p){
  var info=getLvl(p.xp);
  return React.createElement("div",{style:cs({padding:"11px 15px"})},
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"5px"}},
      React.createElement("span",{style:{color:GOLD,fontWeight:"800",fontSize:"12px"}},"Lv "+info.lv+" · "+info.name),
      React.createElement("span",{style:{color:MUTED,fontSize:"11px"}},p.xp.toLocaleString()+" / "+info.hi.toLocaleString()+" XP")
    ),
    React.createElement("div",{style:{background:BORDER,borderRadius:"4px",height:"6px",overflow:"hidden"}},
      React.createElement("div",{style:{background:"linear-gradient(90deg,"+GOLD+","+ORANGE+")",width:info.pct+"%",height:"100%",borderRadius:"4px",transition:"width .6s"}})
    )
  );
}

function Toast(p){
  if(!p.badge) return null;
  return React.createElement("div",{style:{position:"fixed",top:"14px",right:"14px",zIndex:9999,background:"linear-gradient(135deg,"+PURPLE+","+BLUE+")",borderRadius:"14px",padding:"13px 16px",boxShadow:"0 8px 30px rgba(100,40,200,.55)",maxWidth:"230px",border:"1px solid #2E3A6E",animation:"slideIn .3s ease"}},
    React.createElement("div",{style:{fontSize:"24px"}},p.badge.icon),
    React.createElement("div",{style:{color:GOLD,fontWeight:"900",fontSize:"12px",marginTop:"3px"}},"Badge Unlocked!"),
    React.createElement("div",{style:{color:"#fff",fontWeight:"700",fontSize:"12px"}},p.badge.name),
    React.createElement("div",{style:{color:MUTED,fontSize:"10px",marginTop:"2px"}},p.badge.desc),
    React.createElement("div",{style:{color:GOLD,fontSize:"11px",fontWeight:"700",marginTop:"3px"}},"+"+p.badge.xp+" XP")
  );
}

// ── WRITING ANSWER PANEL ──────────────────────────────────────────────────────
function WritingAnswerPanel(p){
  var _s=React.useState,_e=React.useEffect,_r=React.useRef;
  var answerState=_s(""),   answerText=answerState[0], setAnswerText=answerState[1];
  var ocrSt=_s("idle"),     ocrState=ocrSt[0],   setOcrState=ocrSt[1];
  var ocrPcSt=_s(0),        ocrPct=ocrPcSt[0],   setOcrPct=ocrPcSt[1];
  var ocrErrSt=_s(""),      ocrError=ocrErrSt[0], setOcrError=ocrErrSt[1];
  var prevSt=_s(null),      photoPreview=prevSt[0], setPhotoPreview=prevSt[1];
  var fbSt=_s("idle"),      fbState=fbSt[0],     setFbState=fbSt[1];
  var feedSt=_s(null),      feedback=feedSt[0],  setFeedback=feedSt[1];
  var fbErrSt=_s(""),       fbError=fbErrSt[0],  setFbError=fbErrSt[1];

  async function handleFileChange(e){
    var file=e.target.files&&e.target.files[0];
    if(!file) return;
    setPhotoPreview(URL.createObjectURL(file));
    setOcrState("scanning"); setOcrPct(0); setOcrError("");
    try{
      var text=await runOCR(file,p.apiKey,function(pct){setOcrPct(pct);});
      if(!text||text.length<10){ setOcrState("error"); setOcrError("Could not read text. Check the photo is clear and well-lit, or type below."); }
      else{ setAnswerText(text); setOcrState("done"); }
    }catch(err){ setOcrState("error"); setOcrError("OCR failed: "+(err.message||"unknown")+". Please type below."); }
  }

  async function getFeedback(){
    var trimmed=answerText.trim();
    if(trimmed.length<20){ setFbError("Please write at least a few sentences first."); return; }
    setFbState("loading"); setFbError(""); setFeedback(null);
    try{
      var raw=await callGroq(p.apiKey,buildFeedbackPrompt(p.question,trimmed,p.yearId));
      var fb=JSON.parse(raw);
      setFeedback(fb); setFbState("done");
      if(p.onFeedback) p.onFeedback(trimmed,fb);
    }catch(err){ setFbState("error"); setFbError("Could not get feedback: "+(err.message||"unknown error")); }
  }

  function scoreRow(label,val,col){
    return React.createElement("div",{style:{marginBottom:"10px"}},
      React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"4px"}},
        React.createElement("span",{style:{color:WHITE,fontSize:"11px",fontWeight:"700"}},label),
        React.createElement("span",{style:{color:col,fontSize:"11px",fontWeight:"800"}},(val||0)+"/10")
      ),
      React.createElement("div",{style:{background:BORDER,borderRadius:"4px",height:"6px",overflow:"hidden"}},
        React.createElement("div",{style:{background:col,width:((val||0)/10*100)+"%",height:"100%",borderRadius:"4px",transition:"width .8s"}})
      )
    );
  }

  var gradeCol={Excellent:TEAL,Good:BLUE,Developing:ORANGE,"Needs Work":RED};

  return React.createElement("div",null,
    p.guidance&&React.createElement("div",{style:cs({marginBottom:"12px",background:"rgba(255,159,28,.05)",border:"1px solid "+ORANGE+"33"})},
      React.createElement("div",{style:{color:ORANGE,fontSize:"11px",fontWeight:"800",marginBottom:"8px"}},"Writing Tips:"),
      React.createElement("ul",{style:{color:MUTED,fontSize:"12px",paddingLeft:"16px",lineHeight:"1.7",margin:0}},
        p.guidance.map(function(g,i){return React.createElement("li",{key:i},g);})
      )
    ),
    React.createElement("div",{style:cs({marginBottom:"12px"})},
      React.createElement("div",{style:{color:WHITE,fontSize:"12px",fontWeight:"800",marginBottom:"8px"}},"📷 Upload a Photo of Your Handwritten Answer"),
      React.createElement("p",{style:{color:MUTED,fontSize:"11px",lineHeight:"1.6",marginBottom:"10px"}},"Take a clear, well-lit photo of your notebook answer. AI will read the handwriting automatically."),
      photoPreview&&React.createElement("img",{src:photoPreview,style:{width:"100%",borderRadius:"10px",marginBottom:"10px",border:"1px solid "+BORDER,display:"block"},alt:"Your answer photo"}),
      ocrState==="scanning"&&React.createElement("div",{style:{marginBottom:"10px"}},
        React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"8px",marginBottom:"6px"}},
          React.createElement("div",{style:{width:"14px",height:"14px",borderRadius:"50%",border:"2px solid "+TEAL,borderTopColor:"transparent",animation:"spin 0.8s linear infinite",flexShrink:0}}),
          React.createElement("span",{style:{color:TEAL,fontSize:"12px",fontWeight:"700"}},"Reading your handwriting with AI... "+ocrPct+"%")
        ),
        React.createElement("div",{style:{background:BORDER,borderRadius:"4px",height:"5px",overflow:"hidden"}},
          React.createElement("div",{style:{background:TEAL,width:ocrPct+"%",height:"100%",transition:"width .3s"}})
        )
      ),
      ocrState==="done"&&React.createElement("div",{style:{color:TEAL,fontSize:"12px",fontWeight:"700",marginBottom:"8px"}},"Text extracted! Check below and edit if needed."),
      ocrState==="error"&&React.createElement("p",{style:{color:ORANGE,fontSize:"11px",lineHeight:"1.5",marginBottom:"8px"}},ocrError),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:photoPreview?"1fr 1fr":"1fr",gap:"8px"}},
        React.createElement("label",{className:"photo-label"},
          React.createElement("span",null,ocrState==="scanning"?"Scanning...":"📷 Take / Upload Photo"),
          React.createElement("input",{type:"file",accept:"image/*",onChange:handleFileChange,disabled:ocrState==="scanning"})
        ),
        photoPreview&&React.createElement("button",{
          onClick:function(){setPhotoPreview(null);setOcrState("idle");setOcrError("");},
          style:bs(CARD,{border:"1px solid "+BORDER,color:MUTED,fontSize:"12px",padding:"10px 8px",width:"100%"})
        },"Remove Photo")
      )
    ),
    React.createElement("div",{style:{marginBottom:"12px"}},
      React.createElement("div",{style:{color:WHITE,fontSize:"12px",fontWeight:"800",marginBottom:"8px"}},ocrState==="done"?"Your Answer (extracted — edit if needed):":"Type Your Answer Here:"),
      React.createElement("textarea",{
        value:answerText,
        onChange:function(e){setAnswerText(e.target.value);setFeedback(null);setFbState("idle");},
        placeholder:"Write your answer here, or upload a photo above...",
        rows:8,
        style:{width:"100%",background:BG,border:"1px solid "+BORDER,borderRadius:"12px",padding:"12px",color:WHITE,fontSize:"13px",lineHeight:"1.7",display:"block"}
      }),
      React.createElement("div",{style:{color:MUTED,fontSize:"10px",marginTop:"4px",textAlign:"right"}},answerText.trim().split(/\s+/).filter(Boolean).length+" words")
    ),
    fbState!=="done"&&React.createElement("button",{
      onClick:getFeedback,
      disabled:fbState==="loading"||answerText.trim().length<20,
      style:bs("linear-gradient(135deg,"+PURPLE+","+BLUE+")",{width:"100%",color:WHITE,fontSize:"14px",padding:"13px",opacity:(fbState==="loading"||answerText.trim().length<20)?0.6:1,marginBottom:"8px"})
    },fbState==="loading"?"Archie is reading your work...":"Get AI Feedback"),
    fbError&&React.createElement("p",{style:{color:RED,fontSize:"11px",lineHeight:"1.5",marginBottom:"8px"}},fbError),
    feedback&&fbState==="done"&&React.createElement("div",{style:{animation:"fadeIn .4s ease"}},
      React.createElement("div",{style:Object.assign(cs({marginBottom:"10px",textAlign:"center"}),{background:"linear-gradient(135deg,rgba(123,47,190,.15),rgba(67,97,238,.15))",border:"1px solid "+PURPLE+"44"})},
        React.createElement("div",{style:{fontSize:"48px",fontWeight:"900",color:gradeCol[feedback.grade]||TEAL,lineHeight:1.1}},feedback.score+"/"+feedback.scoreOutOf),
        React.createElement("div",{style:{display:"inline-block",background:(gradeCol[feedback.grade]||TEAL)+"22",color:gradeCol[feedback.grade]||TEAL,borderRadius:"20px",padding:"3px 14px",fontSize:"12px",fontWeight:"800",marginTop:"4px"}},feedback.grade),
        feedback.examinerComment&&React.createElement("p",{style:{color:MUTED,fontSize:"11px",marginTop:"8px",fontStyle:"italic",lineHeight:"1.5"}},feedback.examinerComment)
      ),
      React.createElement("div",{style:cs({marginBottom:"10px"})},
        React.createElement("div",{style:{color:WHITE,fontSize:"12px",fontWeight:"800",marginBottom:"12px"}},"SCORE BREAKDOWN"),
        scoreRow("Vocabulary",feedback.vocabulary,CORAL),
        scoreRow("Structure",feedback.structure,BLUE),
        scoreRow("Creativity",feedback.creativity,PURPLE),
        scoreRow("Detail",feedback.detail,TEAL)
      ),
      feedback.praise&&React.createElement("div",{style:Object.assign(cs({marginBottom:"10px"}),{background:"rgba(6,214,160,.06)",border:"1px solid "+TEAL+"44"})},
        React.createElement("div",{style:{color:TEAL,fontSize:"12px",fontWeight:"800",marginBottom:"6px"}},"What you did well:"),
        React.createElement("p",{style:{color:WHITE,fontSize:"12px",lineHeight:"1.7",margin:0}},feedback.praise)
      ),
      feedback.improvements&&React.createElement("div",{style:Object.assign(cs({marginBottom:"10px"}),{background:"rgba(255,209,102,.05)",border:"1px solid "+GOLD+"33"})},
        React.createElement("div",{style:{color:GOLD,fontSize:"12px",fontWeight:"800",marginBottom:"6px"}},"How to improve:"),
        React.createElement("p",{style:{color:WHITE,fontSize:"12px",lineHeight:"1.7",margin:0}},feedback.improvements)
      ),
      p.modelAnswer&&React.createElement("div",{style:Object.assign(cs({marginBottom:"10px"}),{background:"rgba(67,97,238,.07)",border:"1px solid "+BLUE+"44"})},
        React.createElement("div",{style:{color:BLUE,fontSize:"12px",fontWeight:"800",marginBottom:"6px"}},"Example strong opening:"),
        React.createElement("p",{style:{color:WHITE,fontSize:"12px",fontStyle:"italic",lineHeight:"1.7",margin:0}},p.modelAnswer)
      )
    ),
    React.createElement("div",{style:{display:"flex",gap:"8px",marginTop:"8px",flexWrap:"wrap"}},
      fbState!=="done"&&p.onPause&&React.createElement("button",{onClick:p.onPause,style:bs(CARD,{flex:1,border:"1px solid "+PURPLE,color:PURPLE,fontSize:"12px",padding:"11px",minWidth:"120px"})},"Save & Come Back Later"),
      fbState!=="done"&&React.createElement("button",{onClick:p.onSkip,style:bs(CARD,{flex:1,border:"1px solid "+BORDER,color:MUTED,fontSize:"12px",padding:"11px",minWidth:"80px"})},"Skip"),
      fbState==="done"&&React.createElement("button",{onClick:p.onDone,style:bs("linear-gradient(135deg,"+GOLD+","+ORANGE+")",{flex:1,color:BG,fontSize:"14px",padding:"13px"})},"See My Results")
    )
  );
}

// ── WRITING VERSION PANEL ─────────────────────────────────────────────────────
function WritingVersionPanel(p){
  var showSt=React.useState(false), show=showSt[0], setShow=showSt[1];
  if(!show){
    return React.createElement("button",{
      onClick:function(){setShow(true);},
      style:bs("linear-gradient(135deg,"+PURPLE+","+BLUE+")",{width:"100%",color:WHITE,fontSize:"12px",padding:"10px",marginTop:"8px"})
    },p.hasAnswer?"Add Revised Answer":"Upload Answer");
  }
  return React.createElement("div",{style:{marginTop:"10px",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:"10px"}},
      React.createElement("div",{style:{color:PURPLE,fontSize:"12px",fontWeight:"800"}},p.hasAnswer?"Add Revised Answer (v"+(p.versionCount+1)+")":"Upload Your Answer"),
      React.createElement("button",{onClick:function(){setShow(false);},style:{background:"none",border:"none",color:MUTED,fontSize:"16px",cursor:"pointer",padding:"2px 6px"}},"X")
    ),
    React.createElement(WritingAnswerPanel,{
      question:p.question,guidance:p.guidance,modelAnswer:p.modelAnswer,
      yearId:p.yearId,apiKey:p.apiKey,
      onFeedback:function(studentAnswer,fb){p.onVersion(studentAnswer,fb);setShow(false);},
      onSkip:function(){setShow(false);},
      onDone:function(){setShow(false);}
    })
  );
}
