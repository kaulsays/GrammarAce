
// ── SPELLING & SPEAKING SCREEN ────────────────────────────────────────────────
function SpellingScreen(p){
  var modeSt=React.useState("menu"), mode=modeSt[0], setMode=modeSt[1];
  var wordSt=React.useState(""),     theWord=wordSt[0], setWord=wordSt[1];
  var phonSt=React.useState(""),     phonetic=phonSt[0], setPhonetic=phonSt[1];
  var typSt=React.useState(""),      typed=typSt[0], setTyped=typSt[1];
  var chkSt=React.useState(false),   checked=chkSt[0], setChecked=chkSt[1];
  var corSt=React.useState(false),   correct=corSt[0], setCorrect=corSt[1];
  var scSt=React.useState({right:0,wrong:0}), score=scSt[0], setScore=scSt[1];
  var qcSt=React.useState(0),        qCount=qcSt[0], setQCount=qcSt[1];
  var ldSt=React.useState(false),    loading=ldSt[0], setLoading=ldSt[1];
  var vcSt=React.useState([]),       voices=vcSt[0], setVoices=vcSt[1];
  var svSt=React.useState(null),     selVoice=svSt[0], setSelVoice=svSt[1];
  var lisSt=React.useState(false),   listening=lisSt[0], setListening=lisSt[1];
  var heardSt=React.useState(""),    heard=heardSt[0], setHeard=heardSt[1];
  var pronSt=React.useState(null),   pronResult=pronSt[0], setPronResult=pronSt[1];
  var warnSt=React.useState(false),  httpsWarn=warnSt[0], setHttpsWarn=warnSt[1];
  var whSt=React.useState([]),       wordHist=whSt[0], setWordHist=whSt[1];
  var MAX_Q=10;
  var RecogRef=window.SpeechRecognition||window.webkitSpeechRecognition||null;

  React.useEffect(function(){
    function loadVoices(){
      if(!window.speechSynthesis) return;
      var all=window.speechSynthesis.getVoices();
      var uk=all.filter(function(v){return v.lang==="en-GB"||v.lang.startsWith("en-GB");});
      var en=all.filter(function(v){return v.lang.startsWith("en");});
      var list=uk.length>0?uk:en.length>0?en:all;
      setVoices(list);
      if(list.length>0&&!selVoice) setSelVoice(list[0].name);
    }
    loadVoices();
    if(window.speechSynthesis) window.speechSynthesis.onvoiceschanged=loadVoices;
  },[]);

  function speak(w){
    if(!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    var utt=new SpeechSynthesisUtterance(w||theWord);
    utt.lang="en-GB"; utt.rate=0.85; utt.pitch=1;
    if(selVoice){
      var v=window.speechSynthesis.getVoices().find(function(v){return v.name===selVoice;});
      if(v) utt.voice=v;
    }
    window.speechSynthesis.speak(utt);
  }

  async function fetchWord(forPronounce){
    setLoading(true); setTyped(""); setChecked(false); setHeard(""); setPronResult(null);
    var wordList=(forPronounce?PRONOUN_WORDS:SPELL_WORDS)[p.yearId]||(forPronounce?PRONOUN_WORDS:SPELL_WORDS).year5;
    var available=wordList.filter(function(w){return wordHist.indexOf(w)===-1;});
    var pool=available.length>0?available:wordList;
    try{
      var w=pool[Math.floor(Math.random()*pool.length)];
      var prompt="Give the phonetic transcription for the English word: "+w+". Reply ONLY with valid JSON: {\"word\":\""+w+"\",\"phonetic\":\"/fəˈnetɪk/\"}";
      var raw=await callGroq(p.apiKey,prompt);
      var parsed=JSON.parse(raw);
      var fw=(parsed.word||w).toLowerCase().trim();
      setWord(fw); setPhonetic(parsed.phonetic||"");
      setWordHist(function(h){return h.concat([fw]).slice(-20);});
      if(!forPronounce) setTimeout(function(){speak(fw);},300);
    }catch(e){
      var w2=pool[Math.floor(Math.random()*pool.length)];
      setWord(w2); setPhonetic("");
      if(!forPronounce) setTimeout(function(){speak(w2);},300);
    }
    setLoading(false);
  }

  function startSpell(){setMode("spell");setScore({right:0,wrong:0});setQCount(0);setWordHist([]);fetchWord(false);}
  function startPronounce(){
    if(!RecogRef){setHttpsWarn(true);return;}
    if(typeof location!=="undefined"&&location.protocol==="file:"){setHttpsWarn(true);return;}
    setMode("pronounce");setScore({right:0,wrong:0});setQCount(0);setWordHist([]);fetchWord(true);
  }

  function checkSpelling(){
    if(!typed.trim()||checked) return;
    var ok=typed.trim().toLowerCase()===theWord.toLowerCase();
    setCorrect(ok); setChecked(true);
    setScore(function(s){return ok?{right:s.right+1,wrong:s.wrong}:{right:s.right,wrong:s.wrong+1};});
    speak(theWord);
  }

  function nextWord(forPronounce){
    var next=qCount+1;
    if(next>=MAX_Q){setMode(forPronounce?"pronounceDone":"spellDone");}
    else{setQCount(next);fetchWord(forPronounce);}
  }

  function startListening(){
    if(!RecogRef) return;
    var recog=new RecogRef();
    recog.lang="en-GB"; recog.continuous=false; recog.interimResults=false;
    recog.onstart=function(){setListening(true);};
    recog.onend=function(){setListening(false);};
    recog.onresult=function(e){
      var t=e.results[0][0].transcript.toLowerCase().trim();
      setHeard(t);
      var ok=t===theWord.toLowerCase()||t.includes(theWord.toLowerCase());
      setPronResult(ok?"correct":"incorrect");
      setScore(function(s){return ok?{right:s.right+1,wrong:s.wrong}:{right:s.right,wrong:s.wrong+1};});
      setTimeout(function(){speak(theWord);},500);
    };
    recog.onerror=function(){setListening(false);};
    recog.start();
  }

  function gradeEmoji(r,t){var pct=Math.round(r/t*100);return pct>=90?"🌟":pct>=70?"🎉":pct>=50?"👍":"📚";}

  if(mode==="menu") return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("h2",{style:{color:WHITE,fontSize:"19px",fontWeight:"800",margin:0}},"🔊 Spelling & Speaking")
    ),
    voices.length>0&&React.createElement("div",{style:cs({marginBottom:"12px",background:"rgba(6,214,160,.05)",border:"1px solid "+TEAL+"44"})},
      React.createElement("div",{style:{color:MUTED,fontSize:"10px",fontWeight:"700",letterSpacing:"1px",marginBottom:"8px"}},"VOICE SETTINGS"),
      React.createElement("select",{value:selVoice||"",onChange:function(e){setSelVoice(e.target.value);},style:{width:"100%",background:BG,border:"1px solid "+BORDER,borderRadius:"8px",padding:"8px 10px",color:WHITE,fontSize:"12px"}},
        voices.map(function(v){return React.createElement("option",{key:v.name,value:v.name},v.name+" ("+v.lang+")");})
      )
    ),
    React.createElement("button",{onClick:startSpell,style:cs({display:"flex",alignItems:"center",gap:"14px",textAlign:"left",marginBottom:"12px",width:"100%",cursor:"pointer",border:"1px solid "+TEAL,padding:"16px"})},
      React.createElement("div",{style:{width:"52px",height:"52px",borderRadius:"14px",background:"linear-gradient(135deg,#06D6A0,#4361EE)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px",flexShrink:0}},"🔊"),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{color:WHITE,fontWeight:"800",fontSize:"15px"}},"Spelling Test"),
        React.createElement("div",{style:{color:MUTED,fontSize:"12px",marginTop:"3px"}},"Hear a word · Type what you hear · "+MAX_Q+" words")
      ),
      React.createElement("span",{style:{color:MUTED,fontSize:"22px"}},"›")
    ),
    React.createElement("button",{onClick:startPronounce,style:cs({display:"flex",alignItems:"center",gap:"14px",textAlign:"left",marginBottom:"12px",width:"100%",cursor:"pointer",border:"1px solid "+PURPLE,padding:"16px"})},
      React.createElement("div",{style:{width:"52px",height:"52px",borderRadius:"14px",background:"linear-gradient(135deg,#7B2FBE,#4361EE)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"26px",flexShrink:0}},"🎤"),
      React.createElement("div",{style:{flex:1}},
        React.createElement("div",{style:{color:WHITE,fontWeight:"800",fontSize:"15px"}},"Pronunciation Check"),
        React.createElement("div",{style:{color:MUTED,fontSize:"12px",marginTop:"3px"}},"See a word · Say it aloud · AI checks pronunciation")
      ),
      React.createElement("span",{style:{color:MUTED,fontSize:"22px"}},"›")
    ),
    httpsWarn&&React.createElement("div",{style:cs({background:"rgba(239,68,68,.07)",border:"1px solid "+RED+"44"})},
      React.createElement("p",{style:{color:RED,fontSize:"12px",fontWeight:"800",margin:"0 0 6px"}},"Pronunciation Check requires HTTPS"),
      React.createElement("p",{style:{color:MUTED,fontSize:"11px",lineHeight:"1.6",margin:0}},"Your browser blocks the microphone on local files. To use Pronunciation Check, host GrammarAce on a web server (e.g. GitHub Pages — free) or open via localhost. Spelling Test works fine without HTTPS.")
    )
  );

  if(mode==="spell") return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}},
      React.createElement("button",{onClick:function(){setMode("menu");},style:{background:"none",border:"1px solid "+BORDER,color:MUTED,borderRadius:"8px",padding:"5px 11px",fontSize:"12px",cursor:"pointer"}},"Exit"),
      React.createElement("span",{style:{color:MUTED,fontSize:"12px",fontWeight:"700"}},(qCount+1)+"/"+MAX_Q)
    ),
    React.createElement("div",{style:{background:BORDER,borderRadius:"4px",height:"5px",marginBottom:"16px",overflow:"hidden"}},
      React.createElement("div",{style:{background:"linear-gradient(90deg,"+TEAL+","+PURPLE+")",width:((qCount+1)/MAX_Q*100)+"%",height:"100%",transition:"width .3s"}})
    ),
    loading?React.createElement("div",{style:{textAlign:"center",padding:"50px 0"}},React.createElement("div",{style:{fontSize:"48px",animation:"float 2s ease-in-out infinite"}},"🔊"),React.createElement("p",{style:{color:MUTED,marginTop:"12px",fontSize:"13px",fontWeight:"600"}},"Getting your word..."))
    :React.createElement("div",null,
      React.createElement("div",{style:cs({marginBottom:"16px",textAlign:"center"})},
        React.createElement("p",{style:{color:MUTED,fontSize:"12px",marginBottom:"16px"}},"Listen carefully, then type the word you hear."),
        React.createElement("button",{onClick:function(){speak();},style:bs("linear-gradient(135deg,"+TEAL+","+BLUE+")",{fontSize:"16px",padding:"16px 32px",borderRadius:"14px",color:WHITE})},"🔊 Hear Word"),
        React.createElement("button",{onClick:function(){speak();},style:bs(CARD,{fontSize:"12px",padding:"9px 16px",marginLeft:"8px",border:"1px solid "+BORDER,color:MUTED})},"Hear Again")
      ),
      !checked&&React.createElement("div",{style:{marginBottom:"12px"}},
        React.createElement("div",{style:{color:MUTED,fontSize:"10px",fontWeight:"700",letterSpacing:"1px",marginBottom:"8px"}},"TYPE THE WORD:"),
        React.createElement("input",{value:typed,autoFocus:true,onChange:function(e){setTyped(e.target.value);},onKeyDown:function(e){if(e.key==="Enter")checkSpelling();},placeholder:"Type what you heard...",style:{width:"100%",background:BG,border:"1px solid "+BORDER,borderRadius:"12px",padding:"14px",color:WHITE,fontSize:"18px",fontWeight:"700",textAlign:"center",display:"block",marginBottom:"10px",letterSpacing:"2px"}}),
        React.createElement("button",{onClick:checkSpelling,disabled:!typed.trim(),style:bs("linear-gradient(135deg,"+GOLD+","+ORANGE+")",{width:"100%",color:BG,fontSize:"14px",padding:"13px",opacity:typed.trim()?1:0.5})},"Check Spelling")
      ),
      checked&&React.createElement("div",null,
        React.createElement("div",{style:Object.assign(cs({marginBottom:"12px",textAlign:"center"}),{border:"1px solid "+(correct?TEAL:RED),background:correct?"rgba(6,214,160,.06)":"rgba(239,68,68,.06)"})},
          React.createElement("div",{style:{fontSize:"36px",marginBottom:"8px"}},correct?"🎉":"❌"),
          React.createElement("div",{style:{color:correct?TEAL:RED,fontWeight:"900",fontSize:"18px",marginBottom:"6px"}},correct?"Correct!":"Not quite..."),
          React.createElement("div",{style:{color:WHITE,fontSize:"22px",fontWeight:"900",letterSpacing:"3px"}},theWord),
          React.createElement("button",{onClick:function(){speak(theWord);},style:{background:"none",border:"none",color:TEAL,fontSize:"12px",cursor:"pointer",marginTop:"8px",display:"block",width:"100%",fontFamily:"Nunito,sans-serif"}},"🔊 Hear pronunciation")
        ),
        React.createElement("div",{style:{display:"flex",gap:"8px",justifyContent:"space-between",marginBottom:"8px"}},
          React.createElement("div",{style:cs({flex:1,textAlign:"center",padding:"10px"})},React.createElement("div",{style:{color:TEAL,fontWeight:"900",fontSize:"20px"}},score.right),React.createElement("div",{style:{color:MUTED,fontSize:"10px"}},"Correct")),
          React.createElement("div",{style:cs({flex:1,textAlign:"center",padding:"10px"})},React.createElement("div",{style:{color:RED,fontWeight:"900",fontSize:"20px"}},score.wrong),React.createElement("div",{style:{color:MUTED,fontSize:"10px"}},"Wrong"))
        ),
        React.createElement("button",{onClick:function(){nextWord(false);},style:bs("linear-gradient(135deg,"+GOLD+","+ORANGE+")",{width:"100%",color:BG,fontSize:"14px",padding:"13px"})},qCount+1>=MAX_Q?"See Results":"Next Word")
      )
    )
  );

  if(mode==="spellDone"){
    var pct=Math.round(score.right/MAX_Q*100);
    return React.createElement("div",{style:{padding:"24px",maxWidth:"480px",margin:"0 auto",textAlign:"center",paddingTop:"36px",animation:"fadeIn .3s ease"}},
      React.createElement("div",{style:{fontSize:"60px",marginBottom:"8px",animation:"pop .4s ease"}},gradeEmoji(score.right,MAX_Q)),
      React.createElement("h2",{style:{color:TEAL,fontSize:"24px",fontWeight:"900",margin:"0 0 4px"}},"Spelling Complete!"),
      React.createElement("div",{style:cs({marginBottom:"16px"})},
        React.createElement("div",{style:{fontSize:"48px",fontWeight:"900",color:pct>=70?TEAL:ORANGE,lineHeight:1}},pct+"%"),
        React.createElement("div",{style:{color:MUTED,fontSize:"13px",marginTop:"4px"}},score.right+" correct out of "+MAX_Q)
      ),
      React.createElement("button",{onClick:function(){if(p.onFinish)p.onFinish(score);setMode("menu");setScore({right:0,wrong:0});},style:bs("linear-gradient(135deg,"+TEAL+","+BLUE+")",{width:"100%",color:WHITE,marginBottom:"8px"})},"Done"),
      React.createElement("button",{onClick:startSpell,style:bs(CARD,{width:"100%",border:"1px solid "+BORDER,color:WHITE})},"Try Again")
    );
  }

  if(mode==="pronounce") return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:"12px"}},
      React.createElement("button",{onClick:function(){setMode("menu");},style:{background:"none",border:"1px solid "+BORDER,color:MUTED,borderRadius:"8px",padding:"5px 11px",fontSize:"12px",cursor:"pointer"}},"Exit"),
      React.createElement("span",{style:{color:MUTED,fontSize:"12px",fontWeight:"700"}},(qCount+1)+"/"+MAX_Q)
    ),
    React.createElement("div",{style:{background:BORDER,borderRadius:"4px",height:"5px",marginBottom:"16px",overflow:"hidden"}},
      React.createElement("div",{style:{background:"linear-gradient(90deg,"+PURPLE+","+BLUE+")",width:((qCount+1)/MAX_Q*100)+"%",height:"100%",transition:"width .3s"}})
    ),
    loading?React.createElement("div",{style:{textAlign:"center",padding:"50px 0"}},React.createElement("div",{style:{fontSize:"48px",animation:"float 2s ease-in-out infinite"}},"🎤"),React.createElement("p",{style:{color:MUTED,marginTop:"12px",fontSize:"13px",fontWeight:"600"}},"Getting your word..."))
    :React.createElement("div",null,
      React.createElement("div",{style:cs({marginBottom:"16px",textAlign:"center"})},
        React.createElement("div",{style:{fontSize:"42px",fontWeight:"900",color:WHITE,letterSpacing:"3px",marginBottom:"8px"}},theWord),
        phonetic&&React.createElement("div",{style:{color:PURPLE,fontSize:"16px",marginBottom:"8px"}},phonetic),
        React.createElement("button",{onClick:function(){speak(theWord);},style:{background:"none",border:"none",color:TEAL,fontSize:"12px",cursor:"pointer",fontFamily:"Nunito,sans-serif",marginBottom:"16px",display:"block",margin:"0 auto 16px"}},"🔊 Hear correct pronunciation"),
        !pronResult&&React.createElement("div",null,
          React.createElement("p",{style:{color:MUTED,fontSize:"12px",marginBottom:"12px"}},"Tap the button and say the word aloud:"),
          React.createElement("button",{onClick:startListening,disabled:listening,style:bs("linear-gradient(135deg,"+PURPLE+","+BLUE+")",{fontSize:"16px",padding:"16px 32px",borderRadius:"50px",color:WHITE,opacity:listening?0.7:1})},listening?"Listening...":"🎤 Say the Word")
        ),
        heard&&React.createElement("div",{style:{color:MUTED,fontSize:"11px",marginTop:"8px"}},"I heard: \""+heard+"\""),
        pronResult&&React.createElement("div",{style:Object.assign(cs({marginTop:"12px",marginBottom:"12px"}),{border:"1px solid "+(pronResult==="correct"?TEAL:RED),background:pronResult==="correct"?"rgba(6,214,160,.06)":"rgba(239,68,68,.06)"})},
          React.createElement("div",{style:{color:pronResult==="correct"?TEAL:RED,fontWeight:"900",fontSize:"18px",marginBottom:"4px"}},pronResult==="correct"?"Great pronunciation!":"Listen to the correct pronunciation"),
          React.createElement("button",{onClick:function(){speak(theWord);},style:{background:"none",border:"none",color:TEAL,fontSize:"12px",cursor:"pointer",fontFamily:"Nunito,sans-serif"}},"🔊 Hear it again")
        )
      ),
      pronResult&&React.createElement("div",null,
        React.createElement("div",{style:{display:"flex",gap:"8px",justifyContent:"space-between",marginBottom:"12px"}},
          React.createElement("div",{style:cs({flex:1,textAlign:"center",padding:"10px"})},React.createElement("div",{style:{color:TEAL,fontWeight:"900",fontSize:"20px"}},score.right),React.createElement("div",{style:{color:MUTED,fontSize:"10px"}},"Correct")),
          React.createElement("div",{style:cs({flex:1,textAlign:"center",padding:"10px"})},React.createElement("div",{style:{color:RED,fontWeight:"900",fontSize:"20px"}},score.wrong),React.createElement("div",{style:{color:MUTED,fontSize:"10px"}},"Wrong"))
        ),
        React.createElement("button",{onClick:function(){nextWord(true);},style:bs("linear-gradient(135deg,"+GOLD+","+ORANGE+")",{width:"100%",color:BG,fontSize:"14px",padding:"13px"})},qCount+1>=MAX_Q?"See Results":"Next Word")
      )
    )
  );

  if(mode==="pronounceDone"){
    var pct2=Math.round(score.right/MAX_Q*100);
    return React.createElement("div",{style:{padding:"24px",maxWidth:"480px",margin:"0 auto",textAlign:"center",paddingTop:"36px",animation:"fadeIn .3s ease"}},
      React.createElement("div",{style:{fontSize:"60px",marginBottom:"8px",animation:"pop .4s ease"}},gradeEmoji(score.right,MAX_Q)),
      React.createElement("h2",{style:{color:PURPLE,fontSize:"24px",fontWeight:"900",margin:"0 0 4px"}},"Pronunciation Complete!"),
      React.createElement("div",{style:cs({marginBottom:"16px"})},
        React.createElement("div",{style:{fontSize:"48px",fontWeight:"900",color:pct2>=70?TEAL:ORANGE,lineHeight:1}},pct2+"%"),
        React.createElement("div",{style:{color:MUTED,fontSize:"13px",marginTop:"4px"}},score.right+" correct out of "+MAX_Q)
      ),
      React.createElement("button",{onClick:function(){if(p.onFinish)p.onFinish(score);setMode("menu");setScore({right:0,wrong:0});},style:bs("linear-gradient(135deg,"+PURPLE+","+BLUE+")",{width:"100%",color:WHITE,marginBottom:"8px"})},"Done"),
      React.createElement("button",{onClick:startPronounce,style:bs(CARD,{width:"100%",border:"1px solid "+BORDER,color:WHITE})},"Try Again")
    );
  }

  return null;
}
