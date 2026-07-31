/*=========================================
        YOUR RESUME.AI
        MAIN.JS PART-1
=========================================*/

document.addEventListener("DOMContentLoaded", () => {

    /*==========================
        LOADER
    ==========================*/

    const loader = document.getElementById("loader");

    window.addEventListener("load", () => {

        setTimeout(() => {

            if(loader){

                loader.style.opacity = "0";

                loader.style.visibility = "hidden";

            }

        },800);

    });

    /*==========================
        HAMBURGER MENU
    ==========================*/

    const menuToggle = document.getElementById("menu-toggle");

    const menu = document.getElementById("menu");

    if(menuToggle && menu){

        menuToggle.addEventListener("click",()=>{

            menu.classList.toggle("active");

        });

    }

    /*==========================
        CLOSE MENU AFTER CLICK
    ==========================*/

    document.querySelectorAll(".menu a").forEach(link=>{

        link.addEventListener("click",()=>{

            menu.classList.remove("active");

        });

    });

    /*==========================
        STICKY NAVBAR
    ==========================*/

    const navbar=document.getElementById("main-header");

    window.addEventListener("scroll",()=>{

        if(window.scrollY>50){

            navbar.classList.add("scrolled");

        }

        else{

            navbar.classList.remove("scrolled");

        }

    });

    /*==========================
        BACK TO TOP
    ==========================*/

    const back=document.getElementById("backToTop");

    window.addEventListener("scroll",()=>{

        if(window.scrollY>400){

            back.style.display="block";

        }

        else{

            back.style.display="none";

        }

    });

    if(back){

        back.addEventListener("click",()=>{

            window.scrollTo({

                top:0,

                behavior:"smooth"

            });

        });

    }

    /*==========================
        SCROLL PROGRESS
    ==========================*/

    const progress=document.getElementById("progress-bar");

    window.addEventListener("scroll",()=>{

        let total=document.documentElement.scrollHeight-window.innerHeight;

        let progressValue=(window.scrollY/total)*100;

        progress.style.width=progressValue+"%";

    });

    /*==========================
        HERO BUTTON
    ==========================*/

    const buildBtn=document.getElementById("build-btn");

    const resumeModal=document.getElementById("resume-modal");

    if(buildBtn){

        buildBtn.addEventListener("click",()=>{

            resumeModal.classList.remove("hidden");

        });

    }

    /*==========================
        CLOSE MODAL
    ==========================*/

    const modalClose=document.getElementById("modal-close");

    if(modalClose){

        modalClose.addEventListener("click",()=>{

            resumeModal.classList.add("hidden");

        });

    }

    window.addEventListener("click",(e)=>{

        if(e.target===resumeModal){

            resumeModal.classList.add("hidden");

        }

    });

});

/*=========================================
        YOUR RESUME.AI
        MAIN.JS PART-2
=========================================*/

document.addEventListener("DOMContentLoaded", () => {

    /*==========================
        LOGIN MODAL
    ==========================*/

    const loginLink = document.getElementById("login-link");
    const loginModal = document.getElementById("login-modal");
    const loginClose = document.getElementById("login-close");

    if(loginLink && loginModal){

        loginLink.addEventListener("click",(e)=>{

            e.preventDefault();

            loginModal.classList.remove("hidden");

        });

    }

    if(loginClose){

        loginClose.addEventListener("click",()=>{

            loginModal.classList.add("hidden");

        });

    }

    /*==========================
        SIGNUP MODAL
    ==========================*/

    const signupBtn = document.getElementById("signup-btn");
    const signupModal = document.getElementById("signup-modal");
    const signupClose = document.getElementById("signup-close");

    if(signupBtn){

        signupBtn.addEventListener("click",()=>{

            signupModal.classList.remove("hidden");

        });

    }

    if(signupClose){

        signupClose.addEventListener("click",()=>{

            signupModal.classList.add("hidden");

        });

    }

    /*==========================
        CLOSE ALL MODALS
    ==========================*/

    window.addEventListener("click",(e)=>{

        if(e.target===loginModal){

            loginModal.classList.add("hidden");

        }

        if(e.target===signupModal){

            signupModal.classList.add("hidden");

        }

    });

    /*==========================
        PHOTO PREVIEW
    ==========================*/

    const photo=document.getElementById("photo");

    const preview=document.getElementById("photo-preview");

    if(photo){

        photo.addEventListener("change",()=>{

            const file=photo.files[0];

            if(file){

                const reader=new FileReader();

                reader.onload=function(e){

                    preview.innerHTML=

                    `<img src="${e.target.result}" alt="Preview">`;

                }

                reader.readAsDataURL(file);

            }

        });

    }

    /*==========================
        SIGNUP COUNTER
    ==========================*/

    let count=localStorage.getItem("signupCount");

    if(!count){

        count=0;

    }

    const counter=document.getElementById("signup-count");

    if(counter){

        counter.innerText=count;

    }

    const signupForm=document.getElementById("signup-form");

    if(signupForm){

        signupForm.addEventListener("submit",(e)=>{

            e.preventDefault();

            count++;

            localStorage.setItem("signupCount",count);

            counter.innerText=count;

            alert("Account Created Successfully!");

            signupModal.classList.add("hidden");

            signupForm.reset();

        });

    }

    /*==========================
        FEEDBACK
    ==========================*/

    const sendBtn=document.getElementById("send-feedback");

    if(sendBtn){

        sendBtn.addEventListener("click",()=>{

            const text=document.getElementById("feedback-text").value;

            const rating=document.getElementById("rating").value;

            const reviews=document.getElementById("reviews-list");

            if(text===""){

                alert("Write Feedback");

                return;

            }

            const card=document.createElement("div");

            card.className="review-card";

            card.innerHTML=`

            <h4>⭐⭐⭐⭐⭐ ${rating}</h4>

            <p>${text}</p>

            `;

            reviews.prepend(card);

            document.getElementById("feedback-text").value="";

            document.getElementById("rating").value="";

        });

    }

    /*==========================
        CHATBOT
    ==========================*/

    const chatToggle=document.getElementById("chat-toggle");

    const chatPanel=document.getElementById("chat-panel");

    const chatInput=document.getElementById("chat-input");

    const chatLog=document.getElementById("chat-log");

    const chatSend=document.getElementById("chat-send");

    if(chatToggle){

        chatToggle.addEventListener("click",()=>{

            chatPanel.classList.toggle("hidden");

        });

    }

    function sendMessage(){

        let msg=chatInput.value.trim();

        if(msg==="") return;

        chatLog.innerHTML+=`

        <div class="user-msg">

        ${msg}

        </div>

        `;

        let reply="Sorry, I didn't understand.";

        if(msg.toLowerCase().includes("resume")){

            reply="Click 'Build My Resume' to create your professional resume.";

        }

        if(msg.toLowerCase().includes("template")){

            reply="Go to Templates section and choose your favorite design.";

        }

        if(msg.toLowerCase().includes("login")){

            reply="Click Login from the navigation bar.";

        }

        chatLog.innerHTML+=`

        <div class="bot-msg">

        🤖 ${reply}

        </div>

        `;

        chatInput.value="";

        chatLog.scrollTop=chatLog.scrollHeight;

    }

    if(chatSend){

        chatSend.addEventListener("click",sendMessage);

    }

    if(chatInput){

        chatInput.addEventListener("keypress",(e)=>{

            if(e.key==="Enter"){

                sendMessage();

            }

        });

    }

});

/*=========================================
        YOUR RESUME.AI
        MAIN.JS PART-3
=========================================*/

document.addEventListener("DOMContentLoaded",()=>{

/*==========================
LANGUAGE SWITCHER
==========================*/

const language=document.getElementById("language");

if(language){

language.addEventListener("change",()=>{

localStorage.setItem("language",language.value);

showToast("Language changed to "+language.value.toUpperCase());

});

const savedLanguage=localStorage.getItem("language");

if(savedLanguage){

language.value=savedLanguage;

}

}

/*==========================
THEME MODE
==========================*/

const themeBtn=document.getElementById("theme-toggle");

if(themeBtn){

themeBtn.addEventListener("click",()=>{

document.body.classList.toggle("light-mode");

localStorage.setItem(

"theme",

document.body.classList.contains("light-mode")?"light":"dark"

);

});

}

const savedTheme=localStorage.getItem("theme");

if(savedTheme==="light"){

document.body.classList.add("light-mode");

}

/*==========================
SCROLL REVEAL
==========================*/

const revealItems=document.querySelectorAll(

".card,.template-card,.dev-card,.hero-left,.hero-right,.stat-box"

);

const reveal=()=>{

revealItems.forEach(item=>{

const top=item.getBoundingClientRect().top;

if(top<window.innerHeight-120){

item.classList.add("show");

}

});

};

window.addEventListener("scroll",reveal);

reveal();

/*==========================
COUNTER ANIMATION
==========================*/

document.querySelectorAll("[data-count]").forEach(counter=>{

let target=parseInt(counter.dataset.count);

let count=0;

let speed=Math.ceil(target/120);

const update=()=>{

count+=speed;

if(count>=target){

counter.innerText=target;

}else{

counter.innerText=count;

requestAnimationFrame(update);

}

}

update();

});

/*==========================
RESUME PREVIEW
==========================*/

const previewBtn=document.getElementById("preview-btn");

if(previewBtn){

previewBtn.addEventListener("click",()=>{

const name=document.getElementById("fullName").value||"Your Name";

const email=document.getElementById("email").value||"email@example.com";

const phone=document.getElementById("phone").value||"Phone Number";

alert(

"Resume Preview\n\n"+

"Name : "+name+

"\nEmail : "+email+

"\nPhone : "+phone

);

});

}

/*==========================
LOGIN
==========================*/

const loginForm=document.getElementById("login-form");

if(loginForm){

loginForm.addEventListener("submit",(e)=>{

e.preventDefault();

showToast("Login Successful");

document.getElementById("login-modal").classList.add("hidden");

loginForm.reset();

});

}

/*==========================
RESUME FORM
==========================*/

const resumeForm=document.getElementById("resume-form");

if(resumeForm){

resumeForm.addEventListener("submit",(e)=>{

e.preventDefault();

showToast("Resume Generated Successfully!");

});

}

/*==========================
TOAST
==========================*/

function showToast(message){

let toast=document.createElement("div");

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

},300);

},2500);

}

/*==========================
SMOOTH NAVIGATION
==========================*/

document.querySelectorAll('a[href^="#"]').forEach(anchor=>{

anchor.addEventListener("click",function(e){

const target=document.querySelector(this.getAttribute("href"));

if(target){

e.preventDefault();

target.scrollIntoView({

behavior:"smooth"

});

}

});

});

/*==========================
COPYRIGHT YEAR
==========================*/

const year=document.getElementById("year");

if(year){

year.innerText=new Date().getFullYear();

}

});
