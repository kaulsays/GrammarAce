
// ── GROQ API CALL ─────────────────────────────────────────────────────────────
async function callGroq(apiKey,prompt){
  var res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
    body:JSON.stringify({model:"llama-3.3-70b-versatile",messages:[{role:"user",content:prompt}],max_tokens:1024,temperature:0.8})
  });
  var data=await res.json();
  if(data.error) throw new Error(data.error.message);
  var text=(data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||"";
  var clean=text.replace(/```json|```/g,"").trim();
  var s=clean.indexOf("{"), e=clean.lastIndexOf("}");
  if(s===-1||e===-1) throw new Error("No JSON found in response");
  return clean.slice(s,e+1);
}

// ── PROMPT BUILDERS ───────────────────────────────────────────────────────────
function buildPrompt(subj,topic,yearId,prevQs){
  var yr=YEAR_LABEL[yearId]||YEAR_LABEL.year5;
  var seed=Math.floor(Math.random()*99999);
  var avoid=prevQs.length>0?" Do NOT repeat: "+prevQs.slice(-3).map(function(q){return '"'+q+'"';}).join(", ")+".":"";
  if(subj==="writing"){
    return "You are a UK exam question writer. Create one creative writing task for "+yr+". Topic: "+topic+". Seed:"+seed+avoid+"\nRespond with ONLY a valid JSON object, no markdown:\n{\"question\":\"2-3 sentence writing prompt\",\"type\":\"writing\",\"guidance\":[\"tip1\",\"tip2\",\"tip3\"],\"modelAnswer\":\"strong 2-sentence example opening\",\"explanation\":\"what 11+ examiners look for\",\"hint\":\"one key technique\",\"topic\":\""+topic+"\"}";
  }
  var sn=subj==="nvr"?"Non-Verbal Reasoning (text-based: sequences, codes, analogies only)":subj==="english"?"English and Verbal Reasoning":"Mathematics";
  return "You are a UK exam question writer. Create one "+sn+" MCQ for "+yr+". Topic: "+topic+". Seed:"+seed+avoid+"\nRules: exactly 4 options labelled A) B) C) D). correctIndex is 0-based (0=A,1=B,2=C,3=D). Double-check explanation matches correctIndex.\nRespond with ONLY a valid JSON object, no markdown:\n{\"question\":\"question text\",\"options\":[\"A) ...\",\"B) ...\",\"C) ...\",\"D) ...\"],\"correctIndex\":0,\"explanation\":\"solution stating correct option letter\",\"hint\":\"hint without giving answer\",\"topic\":\""+topic+"\"}";
}

function buildFeedbackPrompt(question,answer,yearId){
  var yr=YEAR_LABEL[yearId]||YEAR_LABEL.year5;
  return "You are an experienced UK 11+ examiner marking creative writing for "+yr+".\n\nWriting prompt: "+question+"\n\nStudent answer:\n"+answer+"\n\nEvaluate against 11+ criteria. Be encouraging but specific.\nRespond with ONLY a valid JSON object, no markdown:\n{\"score\":7,\"scoreOutOf\":10,\"grade\":\"Good\",\"praise\":\"2-3 specific sentences\",\"improvements\":\"2-3 specific improvements\",\"examinerComment\":\"1-2 sentences overall\",\"vocabulary\":6,\"structure\":7,\"creativity\":8,\"detail\":6}\ngrade must be one of: Excellent, Good, Developing, Needs Work.";
}

// ── QUESTION VALIDATOR ────────────────────────────────────────────────────────
function validateQuestion(p){
  if(!p||typeof p!=="object") throw new Error("Invalid response format");
  if(p.type==="writing") return p;
  if(!p.question) throw new Error("Missing question text");
  if(!Array.isArray(p.options)||p.options.length!==4) throw new Error("Expected exactly 4 options");
  var ci=parseInt(p.correctIndex,10);
  if(isNaN(ci)||ci<0||ci>3) throw new Error("Invalid correctIndex: "+p.correctIndex);
  p.correctIndex=ci;
  return p;
}

// ── OCR VIA GROQ VISION ───────────────────────────────────────────────────────
async function runOCR(imageFile,apiKey,onProgress){
  if(onProgress) onProgress(20);
  var base64=await new Promise(function(resolve,reject){
    var reader=new FileReader();
    reader.onload=function(){ resolve(reader.result.split(",")[1]); };
    reader.onerror=function(){ reject(new Error("Could not read image file")); };
    reader.readAsDataURL(imageFile);
  });
  if(onProgress) onProgress(50);
  var mtype=imageFile.type||"image/jpeg";
  var res=await fetch("https://api.groq.com/openai/v1/chat/completions",{
    method:"POST",
    headers:{"Content-Type":"application/json","Authorization":"Bearer "+apiKey},
    body:JSON.stringify({
      model:"meta-llama/llama-4-scout-17b-16e-instruct",
      messages:[{role:"user",content:[
        {type:"image_url",image_url:{url:"data:"+mtype+";base64,"+base64}},
        {type:"text",text:"Transcribe all handwritten text in this image exactly as written. Return only the transcribed text, no commentary. Preserve line breaks."}
      ]}],
      max_tokens:1024,
      temperature:0.1
    })
  });
  if(onProgress) onProgress(90);
  var data=await res.json();
  if(data.error) throw new Error(data.error.message);
  var text=(data.choices&&data.choices[0]&&data.choices[0].message&&data.choices[0].message.content)||"";
  if(onProgress) onProgress(100);
  return text.trim();
}
