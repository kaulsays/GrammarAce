// ── GRAMMAR & PUNCTUATION SCREEN ─────────────────────────────────────────────
function GrammarScreen(p){
  var modeSt=React.useState("menu"),  view=modeSt[0],    setView=modeSt[1];
  var qSt=React.useState(null),       q=qSt[0],          setQ=qSt[1];
  var selSt=React.useState(null),     sel=selSt[0],       setSel=selSt[1];
  var ansSt=React.useState(false),    answered=ansSt[0],  setAnswered=ansSt[1];
  var scoreSt=React.useState(0),      score=scoreSt[0],   setScore=scoreSt[1];
  var qNumSt=React.useState(0),       qNum=qNumSt[0],     setQNum=qNumSt[1];
  var histSt=React.useState([]),      hist=histSt[0],     setHist=histSt[1];
  var ldSt=React.useState(false),     loading=ldSt[0],    setLoading=ldSt[1];
  var errSt=React.useState(""),       err=errSt[0],       setErr=errSt[1];
  var TOTAL=10;

  var yearId=p.yearId||"year5";
  var pool=(GRAMMAR_QUESTIONS[yearId]||GRAMMAR_QUESTIONS.year5).slice();
  var modeColors={apply:TEAL,identify:BLUE,terminology:PURPLE,"correct-it":ORANGE};
  var modeLabels={apply:"Apply It",identify:"Identify",terminology:"Terminology","correct-it":"Correct It"};

  function shuffle(arr){
    var a=arr.slice();
    for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}
    return a;
  }

  async function loadAIQuestion(mode){
    setLoading(true); setErr("");
    var modeDesc={
      apply:"a fill-in-the-blank or choose-the-correct-form grammar question",
      identify:"identify a named grammatical feature in a sentence",
      terminology:"match a definition to the correct grammatical term",
      "correct-it":"find and identify the error in a sentence"
    }[mode]||"a grammar question";
    var yr=YEAR_LABEL[yearId]||YEAR_LABEL.year5;
    var prompt="You are a UK primary school grammar teacher. Create one multiple choice grammar question for "+yr+" based on NC Appendix 2.\nQuestion type: "+modeDesc+".\nRules: exactly 4 options labelled A) B) C) D). correctIndex is 0-based. Explanation must state the correct letter.\nRespond with ONLY valid JSON:\n{\"q\":\"question text\",\"opts\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\"],\"ci\":1,\"exp\":\"explanation mentioning correct letter\",\"topic\":\"grammar topic name\",\"mode\":\""+mode+"\"}";
    try{
      var raw=await callGroq(p.apiKey,prompt);
      var parsed=JSON.parse(raw);
      if(!parsed.q||!Array.isArray(parsed.opts)||parsed.opts.length!==4) throw new Error("Invalid format");
      parsed.ci=parseInt(parsed.ci,10);
      if(isNaN(parsed.ci)||parsed.ci<0||parsed.ci>3) throw new Error("Invalid ci");
      setQ(parsed); setLoading(false);
    }catch(e){
      // Fallback to static question
      var fallback=randItem(pool);
      setQ(fallback); setLoading(false);
      setErr("Using saved question (AI unavailable)");
    }
  }

  function startSession(mode){
    var shuffled=shuffle(pool);
    var sessionQ=shuffled[0];
    setView("quiz"); setQ(sessionQ); setSel(null); setAnswered(false);
    setScore(0); setQNum(1); setHist([]);
    setLoading(false); setErr("");
    // If mode is not "mixed", filter by mode or load AI
    if(mode!=="mixed"&&mode!=="static"){
      var modeQ=shuffle(pool.filter(function(x){return x.mode===mode;}));
      if(modeQ.length>0) setQ(modeQ[0]);
      else loadAIQuestion(mode);
    }
  }

  function nextQ(){
    var newQNum=qNum+1;
    if(newQNum>TOTAL){
      setView("results"); return;
    }
    setQNum(newQNum); setSel(null); setAnswered(false); setErr("");
    // Pick next from pool avoiding recent
    var recentQs=hist.slice(-4).map(function(h){return h.q;});
    var available=pool.filter(function(x){return recentQs.indexOf(x.q)===-1;});
    var next=randItem(available.length>0?available:pool);
    setQ(next);
  }

  function handleAnswer(i){
    if(answered) return;
    var isOk=i===q.ci;
    setSel(i); setAnswered(true);
    if(isOk) setScore(function(s){return s+1;});
    setHist(function(h){return h.concat([{q:q.q,correct:isOk,topic:q.topic}]);});
    if(p.onAnswer) p.onAnswer(isOk);
  }

  function optStyle(i){
    var base={background:CARD,border:"2px solid "+BORDER,borderRadius:"12px",padding:"11px 14px",textAlign:"left",cursor:answered?"default":"pointer",color:WHITE,fontSize:"13px",fontWeight:"600",width:"100%",marginBottom:"8px",display:"block",transition:"all .15s"};
    if(!answered) return base;
    if(i===q.ci) return Object.assign({},base,{background:"rgba(6,214,160,.12)",borderColor:TEAL});
    if(i===sel&&i!==q.ci) return Object.assign({},base,{background:"rgba(239,68,68,.12)",borderColor:RED});
    return Object.assign({},base,{opacity:0.4});
  }

  // ── MENU ──────────────────────────────────────────────────────────────────
  if(view==="menu") return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("h2",{style:{color:WHITE,fontSize:"19px",fontWeight:"800",flex:1,margin:0}},"📝 Grammar & Punctuation"),
      React.createElement("button",{onClick:p.onHome,style:{background:"none",border:"1px solid "+BORDER,color:MUTED,borderRadius:"10px",padding:"7px 13px",fontSize:"12px",fontWeight:"700",cursor:"pointer"}},"🏠 Home")
    ),
    React.createElement("div",{style:Object.assign(cs({marginBottom:"14px"}),{background:"rgba(239,93,168,.06)",border:"1px solid "+CORAL+"44"})},
      React.createElement("p",{style:{color:CORAL,fontSize:"11px",fontWeight:"800",margin:"0 0 3px"}},"National Curriculum Appendix 2"),
      React.createElement("p",{style:{color:MUTED,fontSize:"11px",lineHeight:"1.6",margin:0}},"Questions aligned to the statutory grammar and punctuation programme of study for "+yearId.replace("year","Year ")+".")
    ),
    React.createElement("div",{style:{color:MUTED,fontSize:"10px",fontWeight:"700",letterSpacing:"1px",marginBottom:"10px"}},"CHOOSE A MODE"),
    [
      {id:"mixed",    label:"Mixed Practice",   icon:"🔀",desc:"All four types — great for revision",         col:CORAL},
      {id:"apply",    label:"Apply It",          icon:"✏️", desc:"Fill blanks and choose correct forms",        col:TEAL},
      {id:"identify", label:"Identify",          icon:"🔍",desc:"Spot the grammatical feature in a sentence",  col:BLUE},
      {id:"terminology",label:"Terminology",     icon:"📚",desc:"Match definitions to grammar terms",          col:PURPLE},
    ].map(function(m){
      return React.createElement("button",{key:m.id,onClick:function(){startSession(m.id);},style:cs({display:"flex",alignItems:"center",gap:"12px",textAlign:"left",marginBottom:"9px",width:"100%",cursor:"pointer",border:"1px solid "+m.col+"44",padding:"13px 15px"})},
        React.createElement("div",{style:{width:"44px",height:"44px",borderRadius:"12px",background:m.col+"22",border:"2px solid "+m.col,display:"flex",alignItems:"center",justifyContent:"center",fontSize:"20px",flexShrink:0}},m.icon),
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{color:WHITE,fontWeight:"700",fontSize:"13px"}},m.label),
          React.createElement("div",{style:{color:MUTED,fontSize:"11px",marginTop:"2px"}},m.desc)
        ),
        React.createElement("div",{style:{background:m.col+"22",color:m.col,borderRadius:"8px",padding:"4px 9px",fontSize:"11px",fontWeight:"800",flexShrink:0}},TOTAL+"Q")
      );
    })
  );

  // ── QUIZ ───────────────────────────────────────────────────────────────────
  if(view==="quiz") return React.createElement("div",{style:{padding:"14px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .25s ease"}},
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"10px"}},
      React.createElement("button",{onClick:function(){setView("menu");},style:{background:"none",border:"1px solid "+BORDER,color:MUTED,borderRadius:"8px",padding:"5px 11px",fontSize:"12px",fontWeight:"600",cursor:"pointer"}},"🏠 Home"),
      React.createElement("span",{style:{color:MUTED,fontSize:"12px",fontWeight:"700"}},qNum+"/"+TOTAL)
    ),
    React.createElement("div",{style:{background:BORDER,borderRadius:"4px",height:"5px",marginBottom:"12px",overflow:"hidden"}},
      React.createElement("div",{style:{background:"linear-gradient(135deg,"+CORAL+","+PURPLE+")",width:(qNum/TOTAL*100)+"%",height:"100%",transition:"width .3s"}})
    ),
    q&&q.topic&&React.createElement("div",{style:{display:"flex",gap:"6px",marginBottom:"12px",flexWrap:"wrap"}},
      React.createElement("span",{style:{background:CORAL+"22",color:CORAL,borderRadius:"20px",padding:"2px 11px",fontSize:"11px",fontWeight:"800"}},"📝 Grammar"),
      React.createElement("span",{style:{background:CARD,color:MUTED,borderRadius:"20px",padding:"2px 11px",fontSize:"11px"}},q.topic),
      q.mode&&React.createElement("span",{style:{background:(modeColors[q.mode]||PURPLE)+"22",color:modeColors[q.mode]||PURPLE,borderRadius:"20px",padding:"2px 11px",fontSize:"11px",fontWeight:"700"}},modeLabels[q.mode]||q.mode)
    ),
    loading&&React.createElement("div",{style:{textAlign:"center",padding:"50px 0"}},
      React.createElement("div",{style:{fontSize:"56px",animation:"float 2s ease-in-out infinite"}},"🦉"),
      React.createElement("p",{style:{color:MUTED,marginTop:"12px",fontSize:"13px",fontWeight:"600"}},"Loading question...")
    ),
    !loading&&q&&React.createElement("div",null,
      React.createElement("div",{style:cs({marginBottom:"12px"})},
        React.createElement("p",{style:{color:WHITE,fontSize:"14px",fontWeight:"700",lineHeight:"1.7",margin:0}},q.q)
      ),
      (q.opts||[]).map(function(opt,i){
        return React.createElement("button",{key:i,onClick:function(){handleAnswer(i);},style:optStyle(i)},
          opt,
          answered&&i===q.ci&&React.createElement("span",{style:{float:"right",color:TEAL,fontWeight:"900"}},"✓"),
          answered&&i===sel&&i!==q.ci&&React.createElement("span",{style:{float:"right",color:RED,fontWeight:"900"}},"✗")
        );
      }),
      answered&&React.createElement("div",{style:Object.assign(cs({marginBottom:"12px"}),{border:"1px solid "+(sel===q.ci?TEAL:RED),background:sel===q.ci?"rgba(6,214,160,.06)":"rgba(239,68,68,.06)"})},
        React.createElement("div",{style:{color:sel===q.ci?TEAL:RED,fontWeight:"900",fontSize:"14px",marginBottom:"6px"}},sel===q.ci?"Correct! 🎉":"Not quite... 💭"),
        React.createElement("p",{style:{color:WHITE,fontSize:"12px",lineHeight:"1.65",margin:0}},q.exp)
      ),
      answered&&React.createElement("div",{style:{display:"flex",alignItems:"flex-start",gap:"7px",padding:"8px 10px",background:"rgba(107,122,158,.07)",borderRadius:"10px",marginBottom:"8px",border:"1px solid "+BORDER}},
        React.createElement("span",{style:{fontSize:"13px",flexShrink:0}},"⚠️"),
        React.createElement("p",{style:{color:MUTED,fontSize:"10px",lineHeight:"1.6",margin:0}},"Questions and answers are AI-generated and may occasionally contain errors. Parents and teachers should check regularly for accuracy.")
      ),
      answered&&React.createElement("button",{onClick:nextQ,style:bs("linear-gradient(135deg,"+CORAL+","+PURPLE+")",{width:"100%",color:WHITE,fontSize:"14px",padding:"13px"})},qNum>=TOTAL?"See Results":"Next Question")
    )
  );

  // ── RESULTS ────────────────────────────────────────────────────────────────
  if(view==="results"){
    var pct=Math.round(score/TOTAL*100);
    var emoji=pct>=90?"🌟":pct>=70?"🎉":pct>=50?"👍":"📚";
    var msg=pct>=90?"Outstanding!":pct>=70?"Well done!":pct>=50?"Good effort!":"Keep practising!";
    return React.createElement("div",{style:{padding:"24px",maxWidth:"480px",margin:"0 auto",textAlign:"center",paddingTop:"36px",animation:"fadeIn .3s ease"}},
      React.createElement("div",{style:{fontSize:"60px",marginBottom:"8px",animation:"pop .4s ease"}},emoji),
      React.createElement("h2",{style:{color:CORAL,fontSize:"26px",fontWeight:"900",margin:"0 0 4px"}},msg),
      React.createElement("p",{style:{color:MUTED,fontSize:"12px",marginBottom:"22px"}},"Grammar & Punctuation · "+yearId.replace("year","Year ")),
      React.createElement("div",{style:cs({marginBottom:"14px"})},
        React.createElement("div",{style:{fontSize:"56px",fontWeight:"900",color:pct>=70?TEAL:ORANGE,lineHeight:1,margin:"6px 0"}},pct+"%"),
        React.createElement("div",{style:{color:MUTED,fontSize:"13px"}},score+" correct out of "+TOTAL)
      ),
      hist.length>0&&React.createElement("div",{style:cs({marginBottom:"14px",textAlign:"left"})},
        React.createElement("div",{style:{color:WHITE,fontSize:"12px",fontWeight:"800",marginBottom:"8px"}},"TOPIC BREAKDOWN"),
        (function(){
          var topics={};
          hist.forEach(function(h){
            if(!topics[h.topic]) topics[h.topic]={right:0,wrong:0};
            if(h.correct) topics[h.topic].right++;
            else topics[h.topic].wrong++;
          });
          return Object.keys(topics).map(function(t){
            var d=topics[t];
            var total=d.right+d.wrong;
            var tpct=Math.round(d.right/total*100);
            return React.createElement("div",{key:t,style:{marginBottom:"8px"}},
              React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"3px"}},
                React.createElement("span",{style:{color:WHITE,fontSize:"11px",fontWeight:"600"}},t),
                React.createElement("span",{style:{color:tpct>=70?TEAL:ORANGE,fontSize:"11px",fontWeight:"700"}},d.right+"/"+total)
              ),
              React.createElement("div",{style:{background:BORDER,borderRadius:"3px",height:"5px",overflow:"hidden"}},
                React.createElement("div",{style:{background:tpct>=70?TEAL:ORANGE,width:tpct+"%",height:"100%",transition:"width .8s"}})
              )
            );
          });
        })()
      ),
      React.createElement("button",{onClick:function(){startSession("mixed");},style:bs("linear-gradient(135deg,"+CORAL+","+PURPLE+")",{width:"100%",marginBottom:"8px",color:WHITE})},"Try Again"),
      React.createElement("button",{onClick:p.onBack,style:bs(CARD,{width:"100%",border:"1px solid "+BORDER,color:WHITE})},"Back to Subjects")
    );
  }

  return null;
}
