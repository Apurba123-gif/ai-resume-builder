/* main.js — final frontend prototype
   - Multi-language UI (English default; switch shows UI in chosen language)
   - Templates locked/unlocked via signup (localStorage)
   - Photo upload preview and included in resume (circular top-left)
   - Resume preview in new window; print button hidden in print output so PDF has only user data
   - Chatbot (canned) aware of site & features
   - Signup counter + feedback stored in localStorage
*/

/* small DOM helpers */
const $ = (sel, ctx=document) => ctx.querySelector(sel);
const $$ = (sel, ctx=document) => Array.from((ctx||document).querySelectorAll(sel));

/* ---------------- i18n resources ---------------- */
const resources = {
  en: {
    "nav.home":"Home","nav.features":"Features","nav.templates":"Templates","nav.about":"About","nav.login":"Login","nav.signup":"Sign Up",
    "hero.title":"Create Your Perfect Resume in Minutes with AI","hero.subtitle":"Generate professional, beautifully formatted resumes instantly — powered by Artificial Intelligence.",
    "cta.build":"Build My Resume","cta.templates":"Choose Template",
    "features.title":"Why Choose Our AI Resume Builder?","features.lead":"Our site gives you fast, accurate & beautifully formatted resumes in a few clicks.",
    "templates.title":"Choose Your Favorite Resume Template","templates.lead":"10 templates — 2 free, 8 premium (login to unlock).",
    "about.title":"Our Project Idea & Analysis","about.desc":"This AI Resume Builder simplifies resume creation for students and job seekers.",
    "feedback.title":"Feedback","stats.signups":"Total signups:",
    "form.fullname":"Full name","form.email":"Email","form.phone":"Phone","form.address":"Address","form.education":"Education (highest)",
    "form.languages":"Languages","form.profile":"Profile Summary","form.skills":"Skills","form.experience":"Work Experience","form.references":"References",
    "form.photo":"Passport size photo","form.captcha":"Captcha"
  },
  bn: {
    "nav.home":"হোম","nav.features":"ফিচারস","nav.templates":"টেমপ্লেটস","nav.about":"অ্যাবাউট","nav.login":"লগইন","nav.signup":"সাইন আপ",
    "hero.title":"কৃত্রিম বুদ্ধিমত্তায় মিনিটে আপনার পারফেক্ট রিজিউম তৈরি করুন","hero.subtitle":"পেশাদার, সুন্দরভাবে ফরম্যাট করা রেজুমে তৎক্ষণাৎ জেনারেট করুন—AI দ্বারা চালিত।",
    "cta.build":"Resume তৈরি করুন","cta.templates":"টেমপ্লেট বেছে নিন",
    "features.title":"কেন আমাদের AI Resume Builder?","features.lead":"আমাদের সাইট আপনাকে দেয় দ্রুত, নির্ভুল ও সুন্দর রেজুমে তৈরির অভিজ্ঞতা — মাত্র কয়েক ক্লিকে।",
    "templates.title":"আপনার পছন্দের টেমপ্লেট বেছে নিন","templates.lead":"১০টি টেমপ্লেট — ২টি ফ্রি, ৮টি প্রিমিয়াম (লগইন করে আনলক)।",
    "about.title":"প্রজেক্ট ধারণা ও বিশ্লেষণ","about.desc":"এই AI Resume Builder ছাত্রছাত্রী ও চাকরিপ্রার্থীদের জন্য রিজিউমে তৈরির কাজকে সহজ করবে।",
    "feedback.title":"ফিডব্যাক","stats.signups":"মোট সাইনআপ:",
    "form.fullname":"পূর্ণ নাম","form.email":"ইমেইল","form.phone":"ফোন","form.address":"ঠিকানা","form.education":"শিক্ষা (সর্বোচ্চ)",
    "form.languages":"ভাষা","form.profile":"প্রোফাইল সারাংশ","form.skills":"দক্ষতা","form.experience":"কর্মজীবন","form.references":"রেফারেন্স",
    "form.photo":"ছবি","form.captcha":"ক্যাপচা"
  },
  hi: {
    "nav.home":"होम","nav.features":"फ़ीचर्स","nav.templates":"टेम्पलेट्स","nav.about":"अबाउट","nav.login":"लॉगिन","nav.signup":"साइन अप",
    "hero.title":"AI के साथ मिनटों में अपना परफेक्ट रिज़्यूमे बनाएं","hero.subtitle":"पेशेवर, खूबसूरती से फ़ॉर्मेटेड रिज्यूमे तुरंत जनरेट करें — AI द्वारा।",
    "cta.build":"मेरा रिज्यूमे बनाएँ","cta.templates":"टेम्प्लेट चुनें",
    "features.title":"हमारे AI Resume Builder को क्यों चुनें?","features.lead":"हमारी साइट कुछ ही क्लिक में तेज़, सटीक और खूबसूरती से फ़ॉर्मेटेड रिज्यूमे देती है।",
    "templates.title":"अपना पसंदीदा टेम्पलेट चुनें","templates.lead":"10 टेम्पलेट — 2 फ्री, 8 प्रीमियम (लॉगिन करके अनलॉक)।",
    "about.title":"हमारा प्रोजेक्ट विचार और विश्लेषण","about.desc":"यह AI Resume Builder छात्रों और नौकरी चाहने वालों के लिए रिज्यूमे निर्माण को सरल बनाता है।",
    "feedback.title":"प्रतिक्रिया","stats.signups":"कुल साइनअप:",
    "form.fullname":"पूरा नाम","form.email":"ईमेल","form.phone":"फ़ोन","form.address":"पता","form.education":"शिक्षा (उच्चतम)",
    "form.languages":"भाषाएँ","form.profile":"प्रोफ़ाइल सारांश","form.skills":"कौशल","form.experience":"कार्य अनुभव","form.references":"संदर्भ",
    "form.photo":"फोटो","form.captcha":"कैप्चा"
  }
};

let currentLang = localStorage.getItem('yr_lang') || 'en';
function applyI18n(lang='en'){
  currentLang = lang;
  localStorage.setItem('yr_lang', lang);
  const res = resources[lang] || resources.en;
  Object.keys(res).forEach(k => {
    $$(`[data-i18n="${k}"]`).forEach(el => el.textContent = res[k]);
  });
}
$('#language').value = currentLang;
$('#language').addEventListener('change', e => applyI18n(e.target.value));
applyI18n(currentLang);

/* ------------- storage helpers ------------- */
function getUsers(){ try { return JSON.parse(localStorage.getItem('yr_users')||'[]'); } catch { return []; } }
function saveUsers(u){ localStorage.setItem('yr_users', JSON.stringify(u)); }
function getCurrentUser(){ return JSON.parse(localStorage.getItem('yr_currentUser') || 'null'); }
function setCurrentUser(u){ localStorage.setItem('yr_currentUser', JSON.stringify(u)); }
function logoutUser(){ localStorage.removeItem('yr_currentUser'); location.reload(); }

/* signup counter & feedback */
function getSignupCount(){ return Number(localStorage.getItem('yr_signupCount') || 0); }
function setSignupCount(n){ localStorage.setItem('yr_signupCount', n); renderSignupCount(); }
function incrementSignupCount(){ setSignupCount(getSignupCount()+1); }
function renderSignupCount(){ const el = $('#signup-count'); if(el) el.textContent = getSignupCount(); }
if(!localStorage.getItem('yr_signupCount')) localStorage.setItem('yr_signupCount', 125);
renderSignupCount();

function saveFeedback(obj){
  const arr = JSON.parse(localStorage.getItem('yr_feedback')||'[]');
  arr.unshift({...obj, date: new Date().toISOString()});
  localStorage.setItem('yr_feedback', JSON.stringify(arr));
  renderReviews();
}
function renderReviews(){
  const arr = JSON.parse(localStorage.getItem('yr_feedback')||'[]');
  const container = $('#reviews-list'); container.innerHTML = '';
  arr.slice(0,8).forEach(r => {
    const d = document.createElement('div'); d.className='review-card';
    d.innerHTML = `<strong>Rating: ${r.rating} ★</strong><p>${r.text}</p><small style="color:gray">${new Date(r.date).toLocaleString()}</small>`;
    container.appendChild(d);
  });
}
renderReviews();

/* ------------- templates ------------- */
const templates = Array.from({length:10}).map((_,i)=>({
  id:i+1,
  name:`Template ${i+1}`,
  free: i<2,
  bg: i<2? '#ffffff' : (['linear-gradient(135deg,#f0f7ff,#e6f0ff)','linear-gradient(135deg,#fff1f7,#f7e8ff)','linear-gradient(135deg,#f0fff3,#e6ffe8)','linear-gradient(135deg,#fff8e6,#fff1d6)'][i%4])
}));

function renderTemplates(){
  const grid = $('#template-grid'); grid.innerHTML = '';
  const cur = getCurrentUser();
  templates.forEach(t => {
    const card = document.createElement('div'); card.className='template-card';
    const preview = document.createElement('div'); preview.className='template-preview'; preview.style.background = t.bg;
    preview.innerHTML = `<div style="font-weight:800">${t.name}</div>`;
    const meta = document.createElement('div'); meta.className='template-meta'; meta.textContent = t.free? `${t.name} (Free)` : `${t.name} (Premium)`;
    const btn = document.createElement('button'); btn.className = 'use-btn '+(t.free?'free':'premium'); btn.textContent = t.free? 'Use Template' : 'Locked - Login'; btn.dataset.id=t.id; if(!t.free) btn.dataset.premium='1';

    card.appendChild(preview); card.appendChild(meta); card.appendChild(btn);

    if(!t.free && !cur){
      const overlay = document.createElement('div'); overlay.className='lock-overlay';
      overlay.innerHTML = `<div class="lock-text">Premium</div><div>Login/Signup to unlock</div>`;
      card.appendChild(overlay);
    }

    grid.appendChild(card);
  });
}
renderTemplates();

/* ------------- modals & UI ------------- */
function showModal(sel){ const m=$(sel); if(m) { m.classList.remove('hidden'); m.setAttribute('aria-hidden','false'); } }
function hideModal(sel){ const m=$(sel); if(m) { m.classList.add('hidden'); m.setAttribute('aria-hidden','true'); } }

$('#build-btn').addEventListener('click', ()=> showModal('#resume-modal'));
$('#modal-close').addEventListener('click', ()=> hideModal('#resume-modal'));
$('#login-link').addEventListener('click', e=>{ e.preventDefault(); showModal('#login-modal'); });
$('#login-close').addEventListener('click', ()=> hideModal('#login-modal'));
$('#signup-btn').addEventListener('click', ()=> showModal('#signup-modal'));
$('#signup-close').addEventListener('click', ()=> hideModal('#signup-modal'));

/* template click handling */
$('#template-grid').addEventListener('click', e=>{
  const btn = e.target.closest('button');
  if(!btn) return;
  const id = btn.dataset.id; const premium = btn.dataset.premium === '1';
  const cur = getCurrentUser();
  if(premium && !cur){ alert('This is premium. Please login or signup to unlock.'); showModal('#login-modal'); return; }
  localStorage.setItem('yr_selectedTemplate', id);
  showModal('#resume-modal');
});

/* signup/login */
$('#signup-form').addEventListener('submit', e=>{
  e.preventDefault();
  const name = $('#su-name').value.trim(); const email = $('#su-email').value.trim();
  const phone = $('#su-phone').value.trim(); const pass = $('#su-pass').value; const pass2 = $('#su-pass2').value;
  if(!name||!email||!pass||!pass2){ alert('Fill all required'); return; }
  if(pass !== pass2){ alert('Passwords do not match'); return; }
  const arr = getUsers();
  if(arr.some(u=>u.email===email)){ alert('Email exists'); return; }
  arr.push({name,email,phone,pass}); saveUsers(arr);
  setCurrentUser({name,email}); incrementSignupCount();
  alert('Account created — templates unlocked!');
  hideModal('#signup-modal'); renderTemplates(); renderSignupState();
});

$('#login-form').addEventListener('submit', e=>{
  e.preventDefault();
  const email = $('#login-email').value.trim(), pass = $('#login-password').value;
  const arr = getUsers(); const user = arr.find(u=>u.email===email && u.pass===pass);
  if(!user){ alert('Invalid credentials'); return; }
  setCurrentUser({name:user.name,email:user.email}); alert('Welcome back, '+user.name); hideModal('#login-modal'); renderTemplates(); renderSignupState();
});

/* forgot password prototype */
$('#forgot-password').addEventListener('click', ()=>{
  const email = prompt('Enter your registered email:'); if(!email) return;
  const arr = getUsers(); const u = arr.find(x=>x.email===email); if(!u){ alert('No account'); return; }
  const np = prompt('Enter new password:'); if(!np) return; u.pass = np; saveUsers(arr); alert('Password reset; login with new password.');
});

/* render signup state in nav */
function renderSignupState(){
  const cur = getCurrentUser();
  const ln = $('#login-link');
  if(cur){ ln.textContent = `Hi, ${cur.name.split(' ')[0]}`; ln.onclick = (e)=>{ e.preventDefault(); if(confirm('Logout?')) { logoutUser(); } } }
  else { ln.textContent = resources[currentLang]['nav.login']; ln.onclick = (e)=>{ e.preventDefault(); showModal('#login-modal'); } }
}
renderSignupState();

// ---------- SIGNUP COUNT ----------
function getSignupCount(){
  return Number(localStorage.getItem('signupCount') || 0);
}

function increaseSignupCount(){
  const count = getSignupCount() + 1;
  localStorage.setItem('signupCount', count);
  renderSignupCount();
}

function renderSignupCount(){
  const el = document.getElementById('signup-count');
  if(el) el.textContent = getSignupCount();
}

// initial render
document.addEventListener('DOMContentLoaded', renderSignupCount);

// ---------- FEEDBACK ----------
document.getElementById('send-feedback')?.addEventListener('click', ()=>{
  const text = document.getElementById('feedback-text').value.trim();
  const rating = document.getElementById('rating').value;

  if(!text || !rating){
    alert('Please write feedback and give rating');
    return;
  }

  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  reviews.push({
    text,
    rating,
    date: new Date().toLocaleDateString()
  });
  localStorage.setItem('reviews', JSON.stringify(reviews));

  document.getElementById('feedback-text').value='';
  document.getElementById('rating').value='';
  renderReviews();
});

function renderReviews(){
  const list = document.getElementById('reviews-list');
  if(!list) return;

  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]');
  list.innerHTML='';

  reviews.reverse().forEach(r=>{
    const div = document.createElement('div');
    div.className='review-item';
    div.innerHTML = `
      <p>"${r.text}"</p>
      <small>⭐ ${r.rating} | ${r.date}</small>
    `;
    list.appendChild(div);
  });
}

renderReviews();


/* photo preview */
$('#photo').addEventListener('change', e=>{
  const file = e.target.files && e.target.files[0]; const preview = $('#photo-preview'); preview.innerHTML='';
  if(file){
    const img = document.createElement('img'); img.alt='photo'; img.className='small-photo';
    const reader = new FileReader();
    reader.onload = function(ev){ img.src = ev.target.result; preview.appendChild(img); };
    reader.readAsDataURL(file);
  }
});

/* ---------------- preview & generate resume ---------------- */
/* collect form data; auto-translate if needed (naive) */
function collectFormData(){
  const fullName = $('#fullName').value.trim(), email = $('#email').value.trim();
  if(!fullName || !email){ alert('Name and email required'); return null; }
  const data = {
    fullName, email,
    phone: $('#phone').value.trim(),
    address: $('#address').value.trim(),
    education: $('#education').value.trim(),
    languages: $('#languages').value.trim(),
    profile: $('#profile').value.trim(),
    skills: $('#skills').value.trim(),
    experience: $('#experience').value.trim(),
    references: $('#references').value.trim(),
    templateId: localStorage.getItem('yr_selectedTemplate') || '1',
    autoTranslate: $('#auto-translate').checked,
    photoFile: ($('#photo').files && $('#photo').files[0]) ? $('#photo').files[0] : null
  };
  if(data.autoTranslate && (currentLang==='bn' || currentLang==='hi')){
    data.profile = naiveToEnglish(data.profile);
    data.skills = naiveToEnglish(data.skills);
    data.experience = naiveToEnglish(data.experience);
    data.education = naiveToEnglish(data.education);
    data.references = naiveToEnglish(data.references);
    data.address = naiveToEnglish(data.address);
    data.languages = naiveToEnglish(data.languages);
  }
  return data;
}

/* naive transliteration mapping (very small) */
function naiveToEnglish(text=''){ if(!text) return ''; const map={'আমি':'I','কাজ':'work','দক্ষতা':'skills','বাংলা':'Bengali','ইংরেজি':'English','হিন্দি':'Hindi','স্নাতক':'Bachelor','স্নাতকোত্তর':'Masters','পিএইচডি':'PhD'}; let out=text; Object.keys(map).forEach(k=> out = out.replace(new RegExp(k,'g'), map[k])); return out; }

/* Preview window (clean resume only) */
function openPreviewWindow(data, opts={previewOnly:true}){
  const w = window.open('','_blank','width=900,height=820');
  const style = `
    body{font-family:Arial,Helvetica,sans-serif;color:#111;padding:20px}
    .resume{max-width:820px;margin:0 auto}
    .top{position:relative;padding-left:150px;min-height:120px}
    .photo{position:absolute;left:0;top:0;width:120px;height:120px;border-radius:50%;overflow:hidden;background:#ddd;display:flex;align-items:center;justify-content:center}
    .photo img{width:100%;height:100%;object-fit:cover}
    h1{margin:0;font-size:22px}
    .contact{color:#555;margin-top:6px}
    .columns{display:flex;gap:24px;margin-top:18px}
    .col{flex:1}
    .section{margin-bottom:12px}
    .section strong{display:block;margin-bottom:6px}
    /* Print button hidden when printing (so PDF contains only resume data) */
    #printBtn{margin-top:12px;padding:8px 12px;border-radius:8px;border:none;background:#2563eb;color:#fff;cursor:pointer}
    @media print{
      #printBtn{display:none}
      .no-print{display:none !important}
    }
  `;

  const html = [];
  html.push('<!doctype html><html><head><meta charset="utf-8"><title>Resume</title>');
  html.push(`<style>${style}</style></head><body>`);
  html.push('<div class="resume">');

  // top: photo left, name & contact right (photo displayed circular)
  html.push('<div class="top">');
  if(data.photoFile){
    html.push('<div class="photo"><img id="preview-photo" alt="photo"></div>');
  } else {
    html.push('<div class="photo">📷</div>');
  }
  html.push(`<h1>${escapeHtml(data.fullName)}</h1>`);
  const contactLine = [escapeHtml(data.email), data.phone? escapeHtml(data.phone): null].filter(Boolean).join(' | ');
  html.push(`<div class="contact">${contactLine}</div>`);
  html.push(`<div style="margin-top:8px;color:#444">${escapeHtml(data.address)}</div>`);
  html.push(`<div style="margin-top:8px;color:#444">${escapeHtml(data.education)}</div>`);
  html.push('</div>'); // top

  // columns: left: profile, languages; right: skills, experience, references
  html.push('<div class="columns">');
  html.push('<div class="col">');
  html.push(`<div class="section"><strong>Profile</strong><div>${escapeHtml(data.profile)}</div></div>`);
  html.push(`<div class="section"><strong>Languages</strong><div>${escapeHtml(data.languages)}</div></div>`);
  html.push('</div>');
  html.push('<div class="col">');
  html.push(`<div class="section"><strong>Skills</strong><div>${escapeHtml(data.skills)}</div></div>`);
  html.push(`<div class="section"><strong>Experience</strong><div>${escapeHtml(data.experience)}</div></div>`);
  html.push(`<div class="section"><strong>References</strong><div>${escapeHtml(data.references)}</div></div>`);
  html.push('</div>');
  html.push('</div>'); // columns

  // print button (no-print)
  html.push('<div class="no-print"><button id="printBtn">Print / Save as PDF</button></div>');

  html.push('</div></body></html>');

  w.document.write(html.join(''));
  w.document.close();

  // attach photo if provided
  if(data.photoFile){
    const reader = new FileReader();
    reader.onload = function(ev){
      const img = w.document.getElementById('preview-photo');
      if(img) img.src = ev.target.result;
    };
    reader.readAsDataURL(data.photoFile);
  }

  // attach print
  const btn = w.document.getElementById('printBtn');
  if(btn) btn.addEventListener('click', ()=> w.print());
}

/* simple escape */
function escapeHtml(s=''){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

/* preview & generate handlers */
$('#preview-btn').addEventListener('click', ()=> {
  const data = collectFormData(); if(!data) return;
  openPreviewWindow(data, {previewOnly:true});
});
$('#resume-form').addEventListener('submit', e=>{
  e.preventDefault();
  const data = collectFormData(); if(!data) return;
  if(!confirm('Confirm: generate resume in English?')) return;
  openPreviewWindow(data, {previewOnly:false});
  hideModal('#resume-modal');
  alert('Preview opened — use Print -> Save as PDF to export (English only).');
});

/* navbar scroll & modal close on outside/Escape */
window.addEventListener('scroll', ()=>{ const h = $('#main-header'); if(window.scrollY>30) h.classList.add('scrolled'); else h.classList.remove('scrolled'); });
window.addEventListener('keydown', e=>{ if(e.key==='Escape') $$('.modal').forEach(m=>m.classList.add('hidden')); });
$$('.modal').forEach(m=> m.addEventListener('click', e=> { if(e.target===m) m.classList.add('hidden'); }));

document.getElementById('scrollTop')
?.addEventListener('click',()=>{
  window.scrollTo({ top: 0, behavior: 'smooth' });
});


/* ---------------- Chatbot (canned, aware of site) ---------------- */
$('#chat-toggle').addEventListener('click', ()=> {
  const panel = $('#chat-panel'); panel.classList.toggle('hidden');
});
function appendChat(message, from='bot'){
  const log = $('#chat-log'); const el = document.createElement('div'); el.style.marginBottom='8px';
  if(from==='user') el.innerHTML = `<div style="text-align:right"><small>You</small><div style="display:inline-block;background:#eef2ff;padding:6px;border-radius:8px">${escapeHtml(message)}</div></div>`;
  else el.innerHTML = `<div style="text-align:left"><small>AI Helper</small><div style="display:inline-block;background:#f3f3f3;padding:6px;border-radius:8px">${escapeHtml(message)}</div></div>`;
  log.appendChild(el); log.scrollTop = log.scrollHeight;
}
$('#chat-send').addEventListener('click', ()=> {
  const q = $('#chat-input').value.trim(); if(!q) return; appendChat(q,'user'); $('#chat-input').value='';
  setTimeout(()=> { const a = chatBotResponse(q); appendChat(a,'bot'); }, 400);
});
$('#chat-input').addEventListener('keydown', e=> { if(e.key==='Enter'){ e.preventDefault(); $('#chat-send').click(); } });

function chatBotResponse(q){
  const txt = q.toLowerCase();
  if(txt.includes('who') && txt.includes('Developer')) return 'This site was built by Apurba Sikdar (Lead Developer).and Rythm bar (project concept). More query check the About section for team details.';
  if(txt.includes('generate') || txt.includes('how to')) return 'Click "Build My Resume", fill the form and press Generate. The resume will be created in English (auto-translate option converts input to English).';
  if(txt.includes('premium')|| txt.includes('unlock')) return 'Premium templates are locked. Sign up to unlock them — sign up increases the live signup counter.';
  if(txt.includes('download')|| txt.includes('pdf')) return 'Open the preview and choose Print → Save as PDF. The PDF will contain only your resume details.';
  if(txt.includes('language')) return 'The UI language changes to what you select. Generated resume is always in English.';
 if(txt.includes('ok') && txt.includes('ok')) return 'Thank you Sir or Mam have a nice day.. ';
  if(txt.includes('template')) return 'There are 10 templates. First 2 are free. Premium templates have unique backgrounds and unlock after signup.';
  return 'I can help with templates, signup, preview, and PDF export. Try: "How to generate resume?" or "How to unlock premium?"';
}

/* init */
if(!localStorage.getItem('yr_users')) localStorage.setItem('yr_users', JSON.stringify([]));
renderTemplates();
renderSignupState();
renderReviews();

renderSignupCount();


