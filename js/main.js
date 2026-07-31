/* ==========================================
   YOUR RESUME AI
   main.js - Part 1
========================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ==========================
       LOADER
    ========================== */

    const loader = document.getElementById("loader");

    window.addEventListener("load", () => {

        setTimeout(() => {

            if (loader) {
                loader.style.opacity = "0";
                loader.style.visibility = "hidden";
            }

        }, 800);

    });

    /* ==========================
       STICKY NAVBAR
    ========================== */

    const header = document.getElementById("header");

    window.addEventListener("scroll", () => {

        if (!header) return;

        if (window.scrollY > 60) {

            header.classList.add("scrolled");

        } else {

            header.classList.remove("scrolled");

        }

    });

    /* ==========================
       MOBILE MENU
    ========================== */

    const menuBtn = document.getElementById("menuBtn");
    const navMenu = document.getElementById("navMenu");

    if (menuBtn && navMenu) {

        menuBtn.addEventListener("click", () => {

            navMenu.classList.toggle("active");

        });

        document.querySelectorAll("#navMenu a").forEach(link => {

            link.addEventListener("click", () => {

                navMenu.classList.remove("active");

            });

        });

    }

    /* ==========================
       SCROLL PROGRESS
    ========================== */

    const progress = document.getElementById("progress-bar");

    window.addEventListener("scroll", () => {

        if (!progress) return;

        const scrollTop = window.scrollY;

        const height =
            document.documentElement.scrollHeight -
            window.innerHeight;

        const percent = (scrollTop / height) * 100;

        progress.style.width = percent + "%";

    });

    /* ==========================
       BACK TO TOP
    ========================== */

    const backToTop = document.getElementById("backToTop");

    window.addEventListener("scroll", () => {

        if (!backToTop) return;

        if (window.scrollY > 500) {

            backToTop.style.display = "flex";

        } else {

            backToTop.style.display = "none";

        }

    });

    if (backToTop) {

        backToTop.addEventListener("click", () => {

            window.scrollTo({

                top: 0,

                behavior: "smooth"

            });

        });

    }

    /* ==========================
       SMOOTH SCROLL
    ========================== */

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {

        anchor.addEventListener("click", function (e) {

            const target = document.querySelector(
                this.getAttribute("href")
            );

            if (!target) return;

            e.preventDefault();

            target.scrollIntoView({

                behavior: "smooth"

            });

        });

    });

    /* ==========================
       SCROLL REVEAL
    ========================== */

    const revealItems = document.querySelectorAll(

        ".feature-card, .template-card, .step, .stat-card, .section-title"

    );

    const reveal = () => {

        revealItems.forEach(item => {

            const top = item.getBoundingClientRect().top;

            if (top < window.innerHeight - 100) {

                item.classList.add("show");

            }

        });

    };

    window.addEventListener("scroll", reveal);

    reveal();

    /* ==========================
       COUNTER
    ========================== */

    const counters = document.querySelectorAll("[data-count]");

    counters.forEach(counter => {

        let start = 0;

        const end = Number(counter.dataset.count);

        const speed = Math.max(10, Math.floor(2000 / end));

        const update = () => {

            start++;

            counter.innerText = start;

            if (start < end) {

                setTimeout(update, speed);

            }

        };

        update();

    });

});

/* ==========================================
   main.js - Part 2
========================================== */

/* ==========================
   MODALS
========================== */

const loginModal = document.getElementById("loginModal");
const signupModal = document.getElementById("signupModal");
const premiumModal = document.getElementById("premiumModal");

const loginBtn = document.getElementById("loginBtn");
const signupBtn = document.getElementById("signupBtn");

if(loginBtn){

    loginBtn.addEventListener("click",()=>{

        loginModal.classList.remove("hidden");

    });

}

if(signupBtn){

    signupBtn.addEventListener("click",()=>{

        signupModal.classList.remove("hidden");

    });

}

/* Close Modal */

document.querySelectorAll(".close-modal").forEach(btn=>{

    btn.addEventListener("click",()=>{

        document.querySelectorAll(".modal").forEach(modal=>{

            modal.classList.add("hidden");

        });

    });

});

/* Click Outside */

window.addEventListener("click",(e)=>{

    document.querySelectorAll(".modal").forEach(modal=>{

        if(e.target===modal){

            modal.classList.add("hidden");

        }

    });

});

/* ==========================
   PREMIUM POPUP
========================== */

document.querySelectorAll(".unlock-btn").forEach(btn=>{

    btn.addEventListener("click",()=>{

        if(premiumModal){

            premiumModal.classList.remove("hidden");

        }

    });

});

/* ==========================
   PHOTO PREVIEW
========================== */

const photoInput=document.getElementById("profilePhoto");
const previewPhoto=document.getElementById("previewPhoto");

if(photoInput){

photoInput.addEventListener("change",(e)=>{

const file=e.target.files[0];

if(file){

const reader=new FileReader();

reader.onload=function(event){

if(previewPhoto){

previewPhoto.src=event.target.result;

}

}

reader.readAsDataURL(file);

}

});

}

/* ==========================
   LIVE RESUME PREVIEW
========================== */

const form=document.getElementById("resumeForm");

if(form){

form.addEventListener("input",()=>{

const name=document.getElementById("fullName")?.value || "";

const email=document.getElementById("email")?.value || "";

const phone=document.getElementById("phone")?.value || "";

const summary=document.getElementById("summary")?.value || "";

const preview=document.getElementById("resumePreview");

if(preview){

preview.innerHTML=`

<h2>${name}</h2>

<p>${email}</p>

<p>${phone}</p>

<hr>

<p>${summary}</p>

`;

}

});

}

/* ==========================
   LOCAL STORAGE AUTO SAVE
========================== */

if(form){

form.addEventListener("input",()=>{

const formData={};

form.querySelectorAll("input,textarea,select").forEach(field=>{

formData[field.id]=field.value;

});

localStorage.setItem(

"resumeData",

JSON.stringify(formData)

);

});

}

window.addEventListener("load",()=>{

const saved=JSON.parse(

localStorage.getItem("resumeData")

);

if(saved){

Object.keys(saved).forEach(key=>{

const field=document.getElementById(key);

if(field){

field.value=saved[key];

}

});

}

});

/* ==========================
   TOAST
========================== */

function showToast(message){

const toast=document.createElement("div");

toast.className="toast";

toast.innerText=message;

document.body.appendChild(toast);

setTimeout(()=>{

toast.classList.add("show");

},100);

setTimeout(()=>{

toast.classList.remove("show");

setTimeout(()=>{

toast.remove();

},400);

},3000);

}

/* Example */

if(form){

form.addEventListener("submit",(e)=>{

e.preventDefault();

showToast("Resume Saved Successfully ✅");

});

}

/* ==========================================
   main.js - Part 3
========================================== */

/* ==========================
   AI CHAT
========================== */

const chatButton = document.getElementById("chatButton");
const chatBox = document.getElementById("chatBox");
const chatInput = document.getElementById("chatInput");
const sendChat = document.getElementById("sendChat");
const chatMessages = document.getElementById("chatMessages");

if(chatButton){

chatButton.onclick=()=>{

chatBox.classList.toggle("hidden");

}

}

function addMessage(sender,text){

if(!chatMessages) return;

const div=document.createElement("div");

div.className="chat-message "+sender;

div.innerHTML=`<strong>${sender==="user"?"You":"AI"}:</strong> ${text}`;

chatMessages.appendChild(div);

chatMessages.scrollTop=chatMessages.scrollHeight;

}

function aiReply(message){

message=message.toLowerCase();

if(message.includes("resume"))

return "I can help you build a professional ATS-friendly resume.";

if(message.includes("template"))

return "You can unlock all Premium templates for only ₹10.";

if(message.includes("premium"))

return "Premium gives unlimited resumes, PDF export, and all templates.";

if(message.includes("hello") || message.includes("hi"))

return "Hello 👋 How can I help you today?";

return "I'm your Resume AI Assistant. Ask me anything about resumes.";

}

if(sendChat){

sendChat.onclick=()=>{

const text=chatInput.value.trim();

if(!text) return;

addMessage("user",text);

chatInput.value="";

setTimeout(()=>{

addMessage("ai",aiReply(text));

},600);

}

}

if(chatInput){

chatInput.addEventListener("keypress",e=>{

if(e.key==="Enter"){

e.preventDefault();

sendChat.click();

}

});

}

/* ==========================
   PDF DOWNLOAD
========================== */

const downloadBtn=document.getElementById("downloadResume");

if(downloadBtn){

downloadBtn.onclick=()=>{

window.print();

};

}

/* ==========================
   PREMIUM VERIFY
========================== */

const verifyBtn=document.getElementById("verifyPayment");

if(verifyBtn){

verifyBtn.onclick=()=>{

const utr=document.getElementById("utrNumber").value.trim();

if(utr.length<8){

showToast("Please enter a valid UTR Number");

return;

}

localStorage.setItem("premiumUser","true");

showToast("Payment Submitted Successfully");

document.getElementById("premiumStatus").innerText="PREMIUM USER";

document.getElementById("premiumStatus").classList.remove("free");

document.getElementById("premiumStatus").classList.add("premium");

premiumModal.classList.add("hidden");

};

}

/* ==========================
   LOAD PREMIUM STATUS
========================== */

if(localStorage.getItem("premiumUser")==="true"){

const status=document.getElementById("premiumStatus");

if(status){

status.innerText="PREMIUM USER";

status.classList.remove("free");

status.classList.add("premium");

}

}

/* ==========================
   RESUME HISTORY
========================== */

const history=document.getElementById("resumeHistory");

if(form){

form.addEventListener("submit",()=>{

const li=document.createElement("li");

const name=document.getElementById("fullName").value || "Untitled Resume";

li.innerText=name;

history.appendChild(li);

});

}

/* ==========================
   RESET BUILDER
========================== */

const resetBtn=document.getElementById("resetResume");

if(resetBtn){

resetBtn.onclick=()=>{

if(confirm("Reset Resume Builder?")){

form.reset();

localStorage.removeItem("resumeData");

showToast("Builder Reset");

}

};

}

/* ==========================
   SHARE
========================== */

const shareBtn=document.getElementById("shareResume");

if(shareBtn){

shareBtn.onclick=async()=>{

if(navigator.share){

await navigator.share({

title:"My Resume",

text:"Check my Resume",

url:location.href

});

}else{

navigator.clipboard.writeText(location.href);

showToast("Link Copied");

}

};

}

/* ==========================
   DELETE HISTORY
========================== */

const clearBtn=document.getElementById("clearHistory");

if(clearBtn){

clearBtn.onclick=()=>{

history.innerHTML="";

showToast("History Cleared");

};

}

/* ==========================
   LANGUAGE
========================== */

const lang=document.getElementById("languageSelect");

if(lang){

lang.onchange=()=>{

localStorage.setItem("language",lang.value);

showToast("Language Changed");

};

lang.value=localStorage.getItem("language")||"en";

}

/* ==========================
   YEAR
========================== */

const year=document.getElementById("year");

if(year){

year.innerText=new Date().getFullYear();

}

