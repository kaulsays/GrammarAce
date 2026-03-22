
// ── TYPING TUTOR SCREEN ───────────────────────────────────────────────────────
function TypingTutorScreen(p){
  var hasKeyboard=(function(){
    var coarse=window.matchMedia&&window.matchMedia("(pointer:coarse)").matches;
    var touch=navigator.maxTouchPoints>0;
    var narrow=window.screen&&window.screen.width<768;
    return !(coarse&&touch&&narrow);
  })();

  var viewSt=React.useState("menu"),   view=viewSt[0],    setView=viewSt[1];
  var lsSt=React.useState(null),       lesson=lsSt[0],    setLesson=lsSt[1];
  var typSt=React.useState(""),        typed=typSt[0],    setTyped=typSt[1];
  var stSt=React.useState(null),       startTime=stSt[0], setStartTime=stSt[1];
  var finSt=React.useState(false),     finished=finSt[0], setFinished=finSt[1];
  var wpmSt=React.useState(0),         wpm=wpmSt[0],      setWpm=wpmSt[1];
  var accSt=React.useState(100),       accuracy=accSt[0], setAcc=accSt[1];
  var errSt=React.useState(0),         errors=errSt[0],   setErrors=errSt[1];
  var progSt=React.useState(function(){return loadTypingProgress(p.userId);}),progress=progSt[0],setProgress=progSt[1];
  var inputRef=React.useRef(null);

  function saveTypingProg(lessonId,newWpm,newAcc){
    var updated=Object.assign({},progress);
    var prev=updated[lessonId]||{bestWpm:0,bestAcc:0,attempts:0};
    updated[lessonId]={bestWpm:Math.max(prev.bestWpm,newWpm),bestAcc:Math.max(prev.bestAcc,newAcc),attempts:prev.attempts+1,lastDate:new Date().toISOString()};
    setProgress(updated);
    saveTypingProgress(p.userId,updated);
  }

  function startLesson(ls){
    setLesson(ls); setTyped(""); setStartTime(null); setFinished(false);
    setWpm(0); setAcc(100); setErrors(0); setView("lesson");
    setTimeout(function(){if(inputRef.current)inputRef.current.focus();},100);
  }

  function handleTyping(e){
    var val=e.target.value;
    if(finished) return;
    if(!startTime&&val.length===1) setStartTime(Date.now());
    setTyped(val);
    if(startTime){
      var elapsed=(Date.now()-startTime)/1000/60;
      var words=val.trim().split(/\s+/).length;
      setWpm(elapsed>0?Math.round(words/elapsed):0);
    }
    var errs=0;
    for(var i=0;i<val.length;i++){if(val[i]!==(lesson.text[i]||"")) errs++;}
    setErrors(errs);
    var acc=val.length>0?Math.round((1-errs/val.length)*100):100;
    setAcc(Math.max(0,acc));
    if(val.length>=lesson.text.length){
      setFinished(true);
      var elapsed2=(Date.now()-(startTime||Date.now()))/1000/60;
      var finalWpm=elapsed2>0?Math.round(val.trim().split(/\s+/).length/elapsed2):0;
      var finalAcc=Math.max(0,Math.round((1-errs/val.length)*100));
      setWpm(finalWpm); setAcc(finalAcc);
      saveTypingProg(lesson.id,finalWpm,finalAcc);
      if(p.onFinish) p.onFinish();
    }
  }

  function renderText(){
    var chars=lesson.text.split("");
    return React.createElement("div",{style:{fontFamily:"monospace",fontSize:"16px",lineHeight:"1.9",letterSpacing:"1px",userSelect:"none",marginBottom:"16px",padding:"14px",background:BG,borderRadius:"12px",border:"1px solid "+BORDER,wordBreak:"break-word"}},
      chars.map(function(ch,i){
        var col=MUTED, bg2="transparent";
        if(i<typed.length){if(typed[i]===ch){col=TEAL;}else{col=RED;bg2="rgba(239,68,68,.2)";}}
        else if(i===typed.length){bg2="rgba(255,209,102,.25)";col=WHITE;}
        return React.createElement("span",{key:i,style:{color:col,background:bg2,borderRadius:"2px"}},ch);
      })
    );
  }

  if(!hasKeyboard) return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("h2",{style:{color:WHITE,fontSize:"19px",fontWeight:"800",margin:0}},"⌨️ Typing Tutor")
    ),
    React.createElement("div",{style:cs({textAlign:"center",padding:"32px 16px"})},
      React.createElement("div",{style:{fontSize:"64px",marginBottom:"16px"}},"⌨️"),
      React.createElement("h3",{style:{color:GOLD,fontSize:"18px",fontWeight:"800",marginBottom:"12px"}},"Keyboard Required"),
      React.createElement("p",{style:{color:MUTED,fontSize:"13px",lineHeight:"1.7",marginBottom:"16px"}},"The Typing Tutor is designed for use with a physical keyboard on a laptop or desktop computer."),
      React.createElement("p",{style:{color:MUTED,fontSize:"13px",lineHeight:"1.7"}},"Open GrammarAce on your laptop or PC to use this feature.")
    )
  );

  if(view==="menu") return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("h2",{style:{color:WHITE,fontSize:"19px",fontWeight:"800",margin:0}},"⌨️ Typing Tutor")
    ),
    React.createElement("div",{style:cs({marginBottom:"14px",background:"rgba(255,209,102,.05)",border:"1px solid "+GOLD+"33"})},
      React.createElement("p",{style:{color:GOLD,fontSize:"12px",fontWeight:"800",margin:"0 0 4px"}},"How to use"),
      React.createElement("p",{style:{color:MUTED,fontSize:"11px",lineHeight:"1.6",margin:0}},"Work through lessons in order. Aim for 95%+ accuracy before focusing on speed. Your best WPM and accuracy are saved per lesson.")
    ),
    TYPING_LESSONS.map(function(ls,i){
      var prog2=progress[ls.id];
      var done=prog2&&prog2.attempts>0;
      return React.createElement("button",{key:ls.id,onClick:function(){startLesson(ls);},style:cs({display:"flex",alignItems:"center",gap:"12px",textAlign:"left",marginBottom:"8px",width:"100%",cursor:"pointer",border:"1px solid "+(done?GOLD+"44":BORDER),padding:"12px 14px"})},
        React.createElement("div",{style:{width:"36px",height:"36px",borderRadius:"10px",background:done?"rgba(255,209,102,.15)":BORDER,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",fontWeight:"900",color:done?GOLD:MUTED,flexShrink:0}},i+1),
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{color:WHITE,fontWeight:"700",fontSize:"13px"}},ls.name),
          React.createElement("div",{style:{color:MUTED,fontSize:"11px",marginTop:"2px"}},ls.tip)
        ),
        done&&React.createElement("div",{style:{textAlign:"right",flexShrink:0}},
          React.createElement("div",{style:{color:GOLD,fontSize:"12px",fontWeight:"800"}},prog2.bestWpm+" WPM"),
          React.createElement("div",{style:{color:TEAL,fontSize:"10px"}},prog2.bestAcc+"%")
        ),
        !done&&React.createElement("span",{style:{color:MUTED,fontSize:"11px",flexShrink:0}},"Not started")
      );
    })
  );

  if(view==="lesson"&&lesson) return React.createElement("div",{style:{padding:"18px",maxWidth:"580px",margin:"0 auto",animation:"fadeIn .25s ease"}},
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}},
      React.createElement("button",{onClick:function(){setView("menu");},style:{background:"none",border:"1px solid "+BORDER,color:MUTED,borderRadius:"8px",padding:"5px 11px",fontSize:"12px",cursor:"pointer"}},"Exit"),
      React.createElement("h3",{style:{color:WHITE,fontSize:"15px",fontWeight:"800",margin:0}},lesson.name)
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:"8px",marginBottom:"14px"}},
      [[wpm+" WPM","Speed",GOLD],[accuracy+"%","Accuracy",accuracy>=95?TEAL:accuracy>=80?ORANGE:RED],[errors+" errors","Errors",errors===0?TEAL:errors<5?ORANGE:RED]].map(function(item){
        return React.createElement("div",{key:item[1],style:cs({textAlign:"center",padding:"10px 6px"})},
          React.createElement("div",{style:{color:item[2],fontWeight:"900",fontSize:"18px"}},item[0]),
          React.createElement("div",{style:{color:MUTED,fontSize:"10px",marginTop:"2px"}},item[1])
        );
      })
    ),
    React.createElement("div",{style:{background:BORDER,borderRadius:"4px",height:"5px",marginBottom:"14px",overflow:"hidden"}},
      React.createElement("div",{style:{background:"linear-gradient(90deg,"+GOLD+","+ORANGE+")",width:Math.min(100,typed.length/lesson.text.length*100)+"%",height:"100%",transition:"width .1s"}})
    ),
    lesson.tip&&React.createElement("p",{style:{color:PURPLE,fontSize:"11px",marginBottom:"10px",fontStyle:"italic"}},lesson.tip),
    renderText(),
    !finished&&React.createElement("textarea",{ref:inputRef,value:typed,onChange:handleTyping,placeholder:"Start typing here...",rows:3,style:{width:"100%",background:BG,border:"2px solid "+BORDER,borderRadius:"12px",padding:"12px",color:WHITE,fontSize:"16px",fontFamily:"monospace",letterSpacing:"1px",display:"block",resize:"none"}}),
    finished&&React.createElement("div",{style:Object.assign(cs({textAlign:"center",padding:"24px"}),{border:"1px solid "+GOLD,background:"rgba(255,209,102,.06)"})},
      React.createElement("div",{style:{fontSize:"48px",marginBottom:"8px",animation:"pop .4s ease"}},accuracy>=95?"🌟":accuracy>=80?"🎉":"👍"),
      React.createElement("div",{style:{color:GOLD,fontSize:"22px",fontWeight:"900",marginBottom:"4px"}},wpm+" WPM"),
      React.createElement("div",{style:{color:accuracy>=95?TEAL:ORANGE,fontSize:"16px",fontWeight:"700",marginBottom:"16px"}},accuracy+"% accuracy"),
      React.createElement("div",{style:{display:"flex",gap:"8px",justifyContent:"center"}},
        React.createElement("button",{onClick:function(){startLesson(lesson);},style:bs("linear-gradient(135deg,"+GOLD+","+ORANGE+")",{color:BG})},"Try Again"),
        React.createElement("button",{onClick:function(){setView("menu");},style:bs(CARD,{border:"1px solid "+BORDER,color:WHITE})},"Lessons")
      )
    )
  );

  return null;
}
