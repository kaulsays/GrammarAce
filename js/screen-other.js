
// ── DASHBOARD SCREEN ──────────────────────────────────────────────────────────
function DashboardScreen(p){
  var info=getLvl(p.xp);
  return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"18px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("h2",{style:{color:WHITE,fontSize:"15px",fontWeight:"900",margin:0}},"📊 Parent & Teacher Dashboard")
    ),
    React.createElement("div",{style:Object.assign(cs({marginBottom:"12px"}),{background:"rgba(255,209,102,.05)",border:"1px solid "+GOLD+"33"})},
      React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"10px"}},
        React.createElement("div",{style:{width:"38px",height:"38px",borderRadius:"50%",background:"linear-gradient(135deg,"+PURPLE+","+BLUE+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"18px"}},p.profile.avatar),
        React.createElement("div",null,
          React.createElement("div",{style:{color:WHITE,fontWeight:"800",fontSize:"14px"}},p.profile.name),
          React.createElement("div",{style:{color:MUTED,fontSize:"11px"}},"Lv "+info.lv+" · "+info.name)
        )
      )
    ),
    React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"9px",marginBottom:"12px"}},
      [["🏅","Level",info.lv+" · "+info.name,GOLD],["⭐","Total XP",p.xp.toLocaleString(),ORANGE],["✅","Questions",p.total,TEAL],["🔥","Streak",p.streak+" days",CORAL]].map(function(item){
        return React.createElement("div",{key:item[1],style:cs({padding:"14px"})},
          React.createElement("div",{style:{fontSize:"18px",marginBottom:"4px"}},item[0]),
          React.createElement("div",{style:{color:item[3],fontWeight:"900",fontSize:"17px"}},item[2]),
          React.createElement("div",{style:{color:MUTED,fontSize:"10px",marginTop:"2px"}},item[1])
        );
      })
    ),
    React.createElement("div",{style:cs({marginBottom:"10px"})},
      React.createElement("div",{style:{color:WHITE,fontSize:"12px",fontWeight:"800",margin:"0 0 12px"}},"SUBJECT ACTIVITY"),
      SUBJECTS.map(function(s){
        var count=p.counts[s.id]||0;
        return React.createElement("div",{key:s.id,style:{marginBottom:"10px"}},
          React.createElement("div",{style:{display:"flex",justifyContent:"space-between",marginBottom:"3px"}},
            React.createElement("span",{style:{color:WHITE,fontSize:"12px",fontWeight:"600"}},s.icon+" "+s.name),
            React.createElement("span",{style:{color:MUTED,fontSize:"10px"}},count+" sessions")
          ),
          React.createElement("div",{style:{background:BORDER,borderRadius:"4px",height:"6px",overflow:"hidden"}},
            React.createElement("div",{style:{background:s.grad,height:"100%",borderRadius:"4px",width:Math.min(100,count/10*100)+"%",transition:"width .8s"}})
          )
        );
      })
    ),
    React.createElement("div",{style:cs({marginBottom:"10px"})},
      React.createElement("div",{style:{color:WHITE,fontSize:"12px",fontWeight:"800",margin:"0 0 10px"}},"BADGES ("+p.badges.length+"/"+BADGES.length+")"),
      React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:"8px"}},
        BADGES.map(function(b){
          return React.createElement("div",{key:b.id,title:b.name,style:{textAlign:"center",opacity:p.badges.includes(b.id)?1:0.2}},
            React.createElement("div",{style:{fontSize:"22px"}},b.icon),
            React.createElement("div",{style:{fontSize:"9px",color:MUTED,marginTop:"2px",lineHeight:"1.2"}},b.name.split(" ")[0])
          );
        })
      )
    ),
    React.createElement("div",{style:cs({marginBottom:"10px",background:"rgba(67,97,238,.07)",border:"1px solid "+BLUE+"44"})},
      React.createElement("p",{style:{color:MUTED,fontSize:"11px",lineHeight:"1.7",margin:0}},
        React.createElement("strong",{style:{color:WHITE}},"About these questions: "),
        "All questions are AI-generated (Groq · Llama 3.3) and not sourced from official past papers. They match the style of UK KS1-KS2 and 11+ assessments for practice only."
      )
    ),
    React.createElement("div",{style:cs({background:"rgba(6,214,160,.05)",border:"1px solid "+TEAL+"44"})},
      React.createElement("p",{style:{color:TEAL,fontSize:"12px",fontWeight:"800",margin:"0 0 8px"}},"🔒 Privacy Notice"),
      React.createElement("div",{style:{color:MUTED,fontSize:"11px",lineHeight:"1.8"}},
        React.createElement("p",{style:{margin:"0 0 6px"}},React.createElement("strong",{style:{color:WHITE}},"Data stored on this device only: "),"All progress, history, badges and profiles are saved in your browser's local storage. No personal data is stored on any external server."),
        React.createElement("p",{style:{margin:"0 0 6px"}},React.createElement("strong",{style:{color:WHITE}},"AI question generation: "),"When generating questions or marking writing, the question text and written answers are sent to Groq's API (api.groq.com). No names or personal details are included."),
        React.createElement("p",{style:{margin:"0 0 6px"}},React.createElement("strong",{style:{color:WHITE}},"Spelling & Pronunciation: "),"The spelling audio uses your device's built-in speech engine — no data is sent externally. The pronunciation check uses your device's microphone API, processed locally by the browser."),
        React.createElement("p",{style:{margin:0}},React.createElement("strong",{style:{color:WHITE}},"No accounts, no tracking: "),"GrammarAce does not use cookies, analytics, advertising or any form of user tracking.")
      )
    )
  );
}

// ── LEADERBOARD SCREEN ────────────────────────────────────────────────────────
function LeaderboardScreen(p){
  var eSt=React.useState(function(){try{return JSON.parse(localStorage.getItem("ga_leaderboard")||"[]").sort(function(a,b){return b.xp-a.xp;}).slice(0,20);}catch(e){return [];}}),entries=eSt[0],setEntries=eSt[1];
  var aSt=React.useState(false),added=aSt[0],setAdded=aSt[1];
  function addScore(){
    var all=[];try{all=JSON.parse(localStorage.getItem("ga_leaderboard")||"[]");}catch(e){}
    all.push({name:p.profile.name,avatar:p.profile.avatar,xp:p.xp,total:p.total,date:new Date().toLocaleDateString("en-GB")});
    localStorage.setItem("ga_leaderboard",JSON.stringify(all));
    setAdded(true);
    setEntries(all.sort(function(a,b){return b.xp-a.xp;}).slice(0,20));
  }
  return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"20px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("h2",{style:{color:WHITE,fontSize:"19px",fontWeight:"800",margin:0}},"🏆 Leaderboard")
    ),
    !added&&React.createElement("div",{style:cs({marginBottom:"14px"})},
      React.createElement("p",{style:{color:MUTED,fontSize:"12px",margin:"0 0 10px"}},"Add your current score to the board?"),
      React.createElement("button",{onClick:addScore,style:bs(GOLD,{width:"100%",color:BG,fontSize:"13px"})},"Add My Score ("+p.xp.toLocaleString()+" XP)")
    ),
    entries.length===0
      ?React.createElement("div",{style:{textAlign:"center",padding:"40px 0"}},React.createElement("div",{style:{fontSize:"44px",marginBottom:"10px"}},"🏆"),React.createElement("p",{style:{color:MUTED,fontSize:"13px"}},"No scores yet — be the first!"))
      :entries.map(function(e,i){
        return React.createElement("div",{key:i,style:Object.assign(cs({display:"flex",alignItems:"center",gap:"12px",padding:"12px 14px",marginBottom:"8px"}),{border:"1px solid "+(i<3?[GOLD,"#C0C0C0","#CD7F32"][i]:BORDER)})},
          React.createElement("span",{style:{fontSize:"18px",width:"24px",textAlign:"center"}},["🥇","🥈","🥉"][i]||(i+1)),
          React.createElement("div",{style:{width:"32px",height:"32px",borderRadius:"50%",background:"linear-gradient(135deg,"+PURPLE+","+BLUE+")",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"14px",flexShrink:0}},e.avatar||"🦉"),
          React.createElement("div",{style:{flex:1}},
            React.createElement("div",{style:{color:WHITE,fontWeight:"700",fontSize:"13px"}},e.name),
            React.createElement("div",{style:{color:MUTED,fontSize:"10px"}},e.total+" questions · "+e.date)
          ),
          React.createElement("div",{style:{color:GOLD,fontWeight:"900",fontSize:"14px"}},e.xp.toLocaleString()+" XP")
        );
      })
  );
}

// ── ACHIEVEMENTS SCREEN ───────────────────────────────────────────────────────
function AchievementsScreen(p){
  return React.createElement("div",{style:{padding:"18px",maxWidth:"480px",margin:"0 auto",animation:"fadeIn .3s ease"}},
    React.createElement("div",{style:{display:"flex",alignItems:"center",gap:"12px",marginBottom:"6px"}},
      React.createElement(BackBtn,{onClick:p.onBack}),
      React.createElement("h2",{style:{color:WHITE,fontSize:"19px",fontWeight:"800",margin:0}},"🎖️ Badges")
    ),
    React.createElement("p",{style:{color:MUTED,fontSize:"11px",margin:"0 0 16px"}},p.earned.length+"/"+BADGES.length+" unlocked"),
    BADGES.map(function(b){
      var got=p.earned.includes(b.id);
      return React.createElement("div",{key:b.id,style:Object.assign(cs({display:"flex",alignItems:"center",gap:"12px",marginBottom:"8px",padding:"13px 15px"}),{opacity:got?1:0.35,border:"1px solid "+(got?GOLD+"55":BORDER),background:got?"rgba(255,209,102,.04)":CARD})},
        React.createElement("span",{style:{fontSize:"24px"}},b.icon),
        React.createElement("div",{style:{flex:1}},
          React.createElement("div",{style:{color:got?GOLD:WHITE,fontWeight:"800",fontSize:"13px"}},b.name),
          React.createElement("div",{style:{color:MUTED,fontSize:"11px",marginTop:"2px"}},b.desc)
        ),
        React.createElement("div",{style:{color:GOLD,fontSize:"11px",fontWeight:"800",flexShrink:0}},"+"+b.xp+" XP"),
        got&&React.createElement("span",{style:{color:TEAL,fontWeight:"900"}},"✓")
      );
    })
  );
}
