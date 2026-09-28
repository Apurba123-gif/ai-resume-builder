// ============================================================
// YOUR RESUME.AI
// MAIN.JS — LIVE CODE PART 1
// Core App Engine + Navigation + Modal System + Storage
// ============================================================

"use strict";

/* ============================================================
   1. GLOBAL APP CONFIG
   ============================================================ */

const APP_CONFIG = {
    name: "Your Resume.ai",
    version: "1.0.0",
    storagePrefix: "yourResumeAI_",
    defaultLanguage: "en",
    defaultTemplate: "modern",
    defaultAccent: "#6366f1"
};

const APP = {
    user: null,
    currentResumeId: null,
    currentLanguage: APP_CONFIG.defaultLanguage,
    resumes: [],
    resumeVersions: [],
    applications: [],
    certifications: [],
    feedbackRating: 0,
    currentJob: null,
    currentCourse: null,
    currentCareer: null,
    currentQuizQuestion: 0,
    quizAnswers: [],
    quizQuestions: [],
    interviewQuestionIndex: 0,
    interviewQuestions: [],
    interviewAnswers: [],
    selectedPlan: null,
    billingYearly: false
};


/* ============================================================
   2. DOM HELPERS
   ============================================================ */

const $ = (selector, parent = document) =>
    parent.querySelector(selector);

const $$ = (selector, parent = document) =>
    Array.from(parent.querySelectorAll(selector));

function get(id) {
    return document.getElementById(id);
}

function exists(id) {
    return !!document.getElementById(id);
}

function safeText(value) {
    if (value === null || value === undefined) return "";
    return String(value);
}

function escapeHTML(value) {
    return safeText(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ============================================================
   3. STORAGE ENGINE
   ============================================================ */

const Storage = {

    key(name) {
        return APP_CONFIG.storagePrefix + name;
    },

    set(name, value) {
        try {
            localStorage.setItem(
                this.key(name),
                JSON.stringify(value)
            );
            return true;
        } catch (error) {
            console.error("Storage set error:", error);
            return false;
        }
    },

    get(name, fallback = null) {
        try {
            const value = localStorage.getItem(this.key(name));

            if (value === null) {
                return fallback;
            }

            return JSON.parse(value);

        } catch (error) {
            console.error("Storage get error:", error);
            return fallback;
        }
    },

    remove(name) {
        localStorage.removeItem(this.key(name));
    },

    clearAppData() {
        Object.keys(localStorage)
            .filter(key => key.startsWith(APP_CONFIG.storagePrefix))
            .forEach(key => localStorage.removeItem(key));
    }
};


/* ============================================================
   4. UNIQUE ID
   ============================================================ */

function createId(prefix = "id") {
    return (
        prefix +
        "_" +
        Date.now().toString(36) +
        "_" +
        Math.random().toString(36).substring(2, 8)
    );
}


/* ============================================================
   5. DATE / TIME HELPERS
   ============================================================ */

function formatDate(date = new Date()) {

    return new Intl.DateTimeFormat(
        APP.currentLanguage === "bn" ? "bn-IN" : "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric"
        }
    ).format(new Date(date));
}

function formatDateTime(date = new Date()) {

    return new Intl.DateTimeFormat(
        APP.currentLanguage === "bn" ? "bn-IN" : "en-IN",
        {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit"
        }
    ).format(new Date(date));
}


/* ============================================================
   6. TOAST SYSTEM
   ============================================================ */

function showToast(message, type = "success") {

    let container = get("toastContainer");

    if (!container) {
        container = document.createElement("div");
        container.id = "toastContainer";

        Object.assign(container.style, {
            position: "fixed",
            top: "85px",
            right: "20px",
            zIndex: "99999",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            maxWidth: "360px"
        });

        document.body.appendChild(container);
    }

    const toast = document.createElement("div");

    const icons = {
        success: "fa-circle-check",
        error: "fa-circle-exclamation",
        warning: "fa-triangle-exclamation",
        info: "fa-circle-info"
    };

    const icon = icons[type] || icons.info;

    toast.innerHTML = `
        <div style="
            display:flex;
            align-items:center;
            gap:10px;
            padding:13px 16px;
            border-radius:12px;
            background:#ffffff;
            border:1px solid #e5e7eb;
            box-shadow:0 12px 30px rgba(15,23,42,.12);
            color:#303746;
            font-size:13px;
        ">
            <i class="fa-solid ${icon}"></i>
            <span>${escapeHTML(message)}</span>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = "0";
        toast.style.transform = "translateX(20px)";
        toast.style.transition = ".3s ease";

        setTimeout(() => toast.remove(), 300);

    }, 3500);
}


/* ============================================================
   7. MODAL ENGINE
   ============================================================ */

function openModal(modalId) {

    const modal = get(modalId);

    if (!modal) {
        console.warn(`Modal not found: ${modalId}`);
        return;
    }

    modal.classList.add("active");
    modal.style.display = "flex";

    document.body.classList.add("modal-open");
    document.body.style.overflow = "hidden";

    modal.setAttribute("aria-hidden", "false");
}

function closeModal(modalId) {

    const modal = get(modalId);

    if (!modal) return;

    modal.classList.remove("active");
    modal.style.display = "none";

    modal.setAttribute("aria-hidden", "true");

    if (!$(".modal-overlay.active")) {
        document.body.classList.remove("modal-open");
        document.body.style.overflow = "";
    }
}

function closeAllModals() {

    $$(".modal-overlay").forEach(modal => {
        modal.classList.remove("active");
        modal.style.display = "none";
        modal.setAttribute("aria-hidden", "true");
    });

    document.body.classList.remove("modal-open");
    document.body.style.overflow = "";
}


/* ============================================================
   8. MODAL EVENTS
   ============================================================ */

document.addEventListener("click", event => {

    const closeButton = event.target.closest(
        ".modal-close, [data-modal-close]"
    );

    if (closeButton) {

        const modal = closeButton.closest(".modal-overlay");

        if (modal) {
            closeModal(modal.id);
        }

        return;
    }

    if (event.target.classList.contains("modal-overlay")) {
        closeModal(event.target.id);
    }
});


document.addEventListener("keydown", event => {

    if (event.key === "Escape") {
        closeAllModals();
    }
});


/* ============================================================
   9. NAVIGATION
   ============================================================ */

function scrollToSection(target) {

    if (!target) return;

    const element =
        typeof target === "string"
            ? document.querySelector(target)
            : target;

    if (!element) return;

    const navbar = $(".navbar");

    const offset = navbar
        ? navbar.offsetHeight + 15
        : 15;

    const position =
        element.getBoundingClientRect().top +
        window.scrollY -
        offset;

    window.scrollTo({
        top: position,
        behavior: "smooth"
    });
}


document.addEventListener("click", event => {

    const link = event.target.closest(
        'a[href^="#"], [data-scroll-target]'
    );

    if (!link) return;

    const href =
        link.dataset.scrollTarget ||
        link.getAttribute("href");

    if (!href || href === "#") return;

    const target = document.querySelector(href);

    if (!target) return;

    event.preventDefault();

    scrollToSection(target);

    const mobileMenu = $(".nav-menu");

    if (mobileMenu) {
        mobileMenu.classList.remove("active");
    }
});


/* ============================================================
   10. MOBILE MENU
   ============================================================ */

function initMobileMenu() {

    const menuButton = $(".mobile-menu-btn");
    const navMenu = $(".nav-menu");

    if (!menuButton || !navMenu) return;

    menuButton.addEventListener("click", () => {

        navMenu.classList.toggle("active");
        menuButton.classList.toggle("active");

        const icon = menuButton.querySelector("i");

        if (icon) {

            icon.className =
                navMenu.classList.contains("active")
                    ? "fa-solid fa-xmark"
                    : "fa-solid fa-bars";
        }
    });
}


/* ============================================================
   11. NAVBAR SCROLL
   ============================================================ */

function initNavbarScroll() {

    const navbar = $(".navbar");

    if (!navbar) return;

    function updateNavbar() {

        if (window.scrollY > 30) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    }

    updateNavbar();

    window.addEventListener(
        "scroll",
        updateNavbar,
        { passive: true }
    );
}


/* ============================================================
   12. SCROLL PROGRESS
   ============================================================ */

function initScrollProgress() {

    const progress = $(".scroll-progress");

    if (!progress) return;

    function updateProgress() {

        const documentHeight =
            document.documentElement.scrollHeight -
            window.innerHeight;

        if (documentHeight <= 0) {
            progress.style.width = "0%";
            return;
        }

        const percentage =
            (window.scrollY / documentHeight) * 100;

        progress.style.width =
            `${Math.min(100, Math.max(0, percentage))}%`;
    }

    updateProgress();

    window.addEventListener(
        "scroll",
        updateProgress,
        { passive: true }
    );
}


/* ============================================================
   13. BACK TO TOP
   ============================================================ */

function initBackToTop() {

    const button = $(".back-to-top");

    if (!button) return;

    function toggle() {

        if (window.scrollY > 500) {
            button.classList.add("show");
        } else {
            button.classList.remove("show");
        }
    }

    toggle();

    window.addEventListener(
        "scroll",
        toggle,
        { passive: true }
    );

    button.addEventListener("click", () => {

        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    });
}


/* ============================================================
   14. SCROLL REVEAL
   ============================================================ */

function initScrollReveal() {

    const elements = $$(".reveal");

    if (!elements.length) return;

    if (!("IntersectionObserver" in window)) {

        elements.forEach(element => {
            element.classList.add("active");
        });

        return;
    }

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                entry.target.classList.add("active");

                observer.unobserve(entry.target);
            });

        },
        {
            threshold: 0.12
        }
    );

    elements.forEach(element => {
        observer.observe(element);
    });
}


/* ============================================================
   15. COUNTER ANIMATION
   ============================================================ */

function animateCounter(element) {

    const target =
        parseInt(
            element.dataset.target ||
            element.textContent.replace(/\D/g, ""),
            10
        ) || 0;

    const duration = 1300;
    const startTime = performance.now();

    function update(currentTime) {

        const progress =
            Math.min(
                (currentTime - startTime) / duration,
                1
            );

        const eased =
            1 - Math.pow(1 - progress, 3);

        element.textContent =
            Math.floor(target * eased).toLocaleString();

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

function initCounters() {

    const counters = $$(".counter");

    if (!counters.length) return;

    const observer = new IntersectionObserver(
        entries => {

            entries.forEach(entry => {

                if (!entry.isIntersecting) return;

                animateCounter(entry.target);

                observer.unobserve(entry.target);
            });

        },
        {
            threshold: .5
        }
    );

    counters.forEach(counter => {
        observer.observe(counter);
    });
}


/* ============================================================
   16. APP INITIALIZATION
   ============================================================ */

function loadAppState() {

    APP.user =
        Storage.get("user", null);

    APP.resumes =
        Storage.get("resumes", []);

    APP.resumeVersions =
        Storage.get("resumeVersions", []);

    APP.applications =
        Storage.get("applications", []);

    APP.certifications =
        Storage.get("certifications", []);

    APP.currentResumeId =
        Storage.get("currentResumeId", null);

    APP.currentLanguage =
        Storage.get(
            "language",
            APP_CONFIG.defaultLanguage
        );

    if (
        APP.currentResumeId &&
        !APP.resumes.some(
            resume => resume.id === APP.currentResumeId
        )
    ) {
        APP.currentResumeId =
            APP.resumes.length
                ? APP.resumes[0].id
                : null;
    }
}


function saveAppState() {

    Storage.set("user", APP.user);
    Storage.set("resumes", APP.resumes);
    Storage.set("resumeVersions", APP.resumeVersions);
    Storage.set("applications", APP.applications);
    Storage.set("certifications", APP.certifications);
    Storage.set("currentResumeId", APP.currentResumeId);
    Storage.set("language", APP.currentLanguage);
}


/* ============================================================
   17. USER SESSION
   ============================================================ */

function setUser(user) {

    APP.user = {
        id: user.id || createId("user"),
        name: user.name || "",
        email: user.email || "",
        photo: user.photo || "",
        createdAt: user.createdAt || new Date().toISOString()
    };

    Storage.set("user", APP.user);

    updateUserUI();
}


function logoutUser() {

    APP.user = null;

    Storage.remove("user");

    updateUserUI();

    showToast("Logged out successfully.", "success");
}


function updateUserUI() {

    const user = APP.user;

    $$(".user-name").forEach(element => {
        element.textContent =
            user?.name || "Guest";
    });

    $$(".user-email").forEach(element => {
        element.textContent =
            user?.email || "";
    });

    $$(".user-avatar").forEach(element => {

        if (user?.photo) {
            element.innerHTML =
                `<img src="${escapeHTML(user.photo)}" alt="Profile">`;
        } else {
            element.innerHTML =
                `<i class="fa-solid fa-user"></i>`;
        }
    });
}


/* ============================================================
   18. AUTH MODAL
   ============================================================ */

function initAuthUI() {

    document.addEventListener("click", event => {

        const loginButton =
            event.target.closest(
                "#loginBtn, [data-action='login']"
            );

        if (loginButton) {
            event.preventDefault();
            openModal("loginModal");
            return;
        }

        const signupButton =
            event.target.closest(
                "#signupBtn, [data-action='signup']"
            );

        if (signupButton) {
            event.preventDefault();
            openModal("signupModal");
            return;
        }

        const logoutButton =
            event.target.closest(
                "#logoutBtn, [data-action='logout']"
            );

        if (logoutButton) {
            event.preventDefault();
            logoutUser();
        }
    });
}


/* ============================================================
   19. PREMIUM PLAN
   ============================================================ */

function selectPlan(plan) {

    APP.selectedPlan = plan;

    const planName = get("paymentPlanName");
    const planPrice = get("paymentPlanPrice");

    const plans = {
        free: {
            name: "Free Plan",
            monthly: 0,
            yearly: 0
        },
        pro: {
            name: "Pro Plan",
            monthly: 199,
            yearly: 1999
        },
        career: {
            name: "Career Plan",
            monthly: 399,
            yearly: 3999
        }
    };

    const selected = plans[plan];

    if (!selected) return;

    if (planName) {
        planName.textContent = selected.name;
    }

    if (planPrice) {

        const price =
            APP.billingYearly
                ? selected.yearly
                : selected.monthly;

        planPrice.textContent =
            `₹${price}`;
    }

    openModal("paymentModal");
}


function initPricing() {

    document.addEventListener("click", event => {

        const planButton =
            event.target.closest(
                "[data-plan], .pricing-action"
            );

        if (!planButton) return;

        const plan =
            planButton.dataset.plan;

        if (!plan) return;

        selectPlan(plan);
    });
}


/* ============================================================
   20. BILLING TOGGLE
   ============================================================ */

function initBillingToggle() {

    const toggle =
        get("billingToggle");

    if (!toggle) return;

    toggle.addEventListener("click", () => {

        APP.billingYearly =
            !APP.billingYearly;

        toggle.classList.toggle(
            "active",
            APP.billingYearly
        );

        updatePricingPrices();
    });
}


function updatePricingPrices() {

    const elements =
        $$("[data-monthly][data-yearly]");

    elements.forEach(element => {

        const value =
            APP.billingYearly
                ? element.dataset.yearly
                : element.dataset.monthly;

        element.textContent = value;
    });
}


/* ============================================================
   21. FAQ
   ============================================================ */

function initFAQ() {

    $$(".faq-question").forEach(button => {

        button.addEventListener("click", () => {

            const item =
                button.closest(".faq-item");

            if (!item) return;

            const isActive =
                item.classList.contains("active");

            $$(".faq-item.active").forEach(activeItem => {

                activeItem.classList.remove("active");

                const answer =
                    $(".faq-answer", activeItem);

                if (answer) {
                    answer.style.maxHeight = null;
                }
            });

            if (!isActive) {

                item.classList.add("active");

                const answer =
                    $(".faq-answer", item);

                if (answer) {
                    answer.style.maxHeight =
                        answer.scrollHeight + "px";
                }
            }
        });
    });
}


/* ============================================================
   22. FEEDBACK RATING
   ============================================================ */

function initFeedbackRating() {

    const buttons =
        $$(".feedback-rating button");

    buttons.forEach((button, index) => {

        button.addEventListener("click", () => {

            APP.feedbackRating = index + 1;

            buttons.forEach((item, itemIndex) => {

                item.classList.toggle(
                    "active",
                    itemIndex <= index
                );
            });
        });
    });
}


/* ============================================================
   23. COOKIE CONSENT
   ============================================================ */

function initCookieConsent() {

    const cookieBox =
        get("cookieConsent");

    if (!cookieBox) return;

    const accepted =
        Storage.get("cookieAccepted", false);

    if (accepted) {
        cookieBox.style.display = "none";
    }
}


function acceptCookies() {

    Storage.set(
        "cookieAccepted",
        true
    );

    const cookieBox =
        get("cookieConsent");

    if (cookieBox) {
        cookieBox.style.display = "none";
    }

    showToast(
        "Cookie preferences saved.",
        "success"
    );
}


/* ============================================================
   24. LANGUAGE
   ============================================================ */

const translations = {

    en: {
        home: "Home",
        features: "Features",
        templates: "Templates",
        career: "Career",
        dashboard: "Dashboard",
        login: "Login",
        signup: "Signup"
    },

    hi: {
        home: "होम",
        features: "फीचर्स",
        templates: "टेम्पलेट्स",
        career: "करियर",
        dashboard: "डैशबोर्ड",
        login: "लॉगिन",
        signup: "साइनअप"
    },

    bn: {
        home: "হোম",
        features: "ফিচার",
        templates: "টেমপ্লেট",
        career: "ক্যারিয়ার",
        dashboard: "ড্যাশবোর্ড",
        login: "লগইন",
        signup: "সাইনআপ"
    }
};


function changeLanguage(language) {

    if (!translations[language]) {
        language = "en";
    }

    APP.currentLanguage = language;

    Storage.set(
        "language",
        language
    );

    const dictionary =
        translations[language];

    $$("[data-i18n]").forEach(element => {

        const key =
            element.dataset.i18n;

        if (dictionary[key]) {
            element.textContent =
                dictionary[key];
        }
    });

    const selector =
        get("languageSelector");

    if (selector) {
        selector.value = language;
    }

    showToast(
        language === "bn"
            ? "ভাষা পরিবর্তন হয়েছে।"
            : language === "hi"
                ? "भाषा बदल दी गई है।"
                : "Language changed.",
        "success"
    );
}


function initLanguage() {

    const selector =
        get("languageSelector");

    if (!selector) return;

    selector.value =
        APP.currentLanguage;

    selector.addEventListener(
        "change",
        event => {
            changeLanguage(event.target.value);
        }
    );
}


/* ============================================================
   25. CURRENT YEAR
   ============================================================ */

function initCurrentYear() {

    const year =
        new Date().getFullYear();

    $$(".current-year").forEach(element => {
        element.textContent = year;
    });
}


/* ============================================================
   26. PAGE LOADER
   ============================================================ */

function initLoader() {

    const loader =
        get("loader");

    if (!loader) return;

    window.addEventListener(
        "load",
        () => {

            setTimeout(() => {

                loader.classList.add("hidden");

                setTimeout(() => {
                    loader.style.display = "none";
                }, 400);

            }, 350);
        }
    );
}


/* ============================================================
   27. ONLINE / OFFLINE STATUS
   ============================================================ */

function initNetworkStatus() {

    window.addEventListener(
        "offline",
        () => {
            showToast(
                "You are offline. Saved data will remain available.",
                "warning"
            );
        }
    );

    window.addEventListener(
        "online",
        () => {
            showToast(
                "Internet connection restored.",
                "success"
            );
        }
    );
}


/* ============================================================
   28. GLOBAL BUTTON ROUTER
   ============================================================ */

document.addEventListener("click", event => {

    const actionElement =
        event.target.closest("[data-action]");

    if (!actionElement) return;

    const action =
        actionElement.dataset.action;

    switch (action) {

        case "close-modal":
            closeAllModals();
            break;

        case "accept-cookies":
            acceptCookies();
            break;

        case "logout":
            logoutUser();
            break;

        case "home":
            scrollToSection("#home");
            break;

        case "dashboard":
            scrollToSection("#dashboard");
            break;

        case "resume-builder":
            scrollToSection("#resumeBuilder");
            break;

        case "career":
            scrollToSection("#careerExplorer");
            break;

        case "jobs":
            scrollToSection("#jobSearch");
            break;

        case "courses":
            scrollToSection("#courseExplorer");
            break;

        case "pricing":
            scrollToSection("#pricing");
            break;
    }
});


/* ============================================================
   29. AUTO SAVE APP STATE
   ============================================================ */

let autoSaveTimer = null;

function scheduleAutoSave() {

    clearTimeout(autoSaveTimer);

    autoSaveTimer = setTimeout(() => {

        saveAppState();

    }, 600);
}


/* ============================================================
   30. BEFORE UNLOAD
   ============================================================ */

window.addEventListener(
    "beforeunload",
    () => {
        saveAppState();
    }
);


/* ============================================================
   31. INITIALIZE APPLICATION
   ============================================================ */

function initializeApp() {

    loadAppState();

    initLoader();
    initMobileMenu();
    initNavbarScroll();
    initScrollProgress();
    initBackToTop();
    initScrollReveal();
    initCounters();

    initAuthUI();
    initPricing();
    initBillingToggle();
    initFAQ();
    initFeedbackRating();
    initCookieConsent();
    initLanguage();
    initCurrentYear();
    initNetworkStatus();

    updateUserUI();

    console.log(
        `%c${APP_CONFIG.name} v${APP_CONFIG.version}`,
        "color:#6366f1;font-weight:700;font-size:16px"
    );

    console.log(
        "Your Resume.ai application initialized successfully."
    );
}


/* ============================================================
   32. DOM READY
   ============================================================ */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeApp
    );

} else {

    initializeApp();
}


/* ============================================================
   END OF JAVASCRIPT PART 1
   NEXT:
   PART 2 → Resume Builder Engine
   Dynamic Education / Experience / Projects
   Skills / Certifications / Languages
   Live Resume Preview + Auto Save
   ============================================================ */

// ============================================================
// YOUR RESUME.AI
// MAIN.JS — LIVE CODE PART 2
// Resume Builder Engine
// Dynamic Fields + Live Preview + Auto Save
// ============================================================


/* ============================================================
   1. DEFAULT RESUME DATA
   ============================================================ */

const DEFAULT_RESUME = {

    id: null,

    personal: {
        fullName: "",
        professionalTitle: "",
        email: "",
        phone: "",
        location: "",
        website: "",
        linkedin: "",
        github: "",
        dob: "",
        nationality: "",
        photo: ""
    },

    summary: "",

    objective: "",

    education: [],

    experience: [],

    projects: [],

    skills: {
        technical: [],
        soft: [],
        tools: [],
        other: []
    },

    certifications: [],

    achievements: [],

    languages: [],

    interests: "",

    references: [],

    settings: {
        template: "modern",
        accent: "#6366f1",
        paperSize: "A4",
        language: "English",
        showPhoto: true,
        showReferences: true,
        twoPage: false,
        autoTranslate: false
    },

    createdAt: null,
    updatedAt: null
};


/* ============================================================
   2. RESUME FACTORY
   ============================================================ */

function createEmptyResume() {

    const resume = structuredClone(DEFAULT_RESUME);

    resume.id = createId("resume");

    resume.createdAt =
        new Date().toISOString();

    resume.updatedAt =
        new Date().toISOString();

    return resume;
}


/* ============================================================
   3. CURRENT RESUME
   ============================================================ */

function getCurrentResume() {

    if (!APP.currentResumeId) {
        return null;
    }

    return APP.resumes.find(
        resume =>
            resume.id === APP.currentResumeId
    ) || null;
}


function ensureCurrentResume() {

    let resume = getCurrentResume();

    if (!resume) {

        resume = createEmptyResume();

        APP.resumes.push(resume);

        APP.currentResumeId =
            resume.id;

        saveAppState();
    }

    return resume;
}


/* ============================================================
   4. CREATE NEW RESUME
   ============================================================ */

function createNewResume(name = "My Resume") {

    const resume =
        createEmptyResume();

    resume.personal.fullName =
        name === "My Resume"
            ? ""
            : name;

    APP.resumes.push(resume);

    APP.currentResumeId =
        resume.id;

    saveAppState();

    loadResumeIntoBuilder(resume);

    renderResumeManager();

    showToast(
        "New resume created successfully.",
        "success"
    );

    return resume;
}


/* ============================================================
   5. SAVE CURRENT RESUME
   ============================================================ */

function saveCurrentResume() {

    const resume =
        getCurrentResume();

    if (!resume) return;

    collectBuilderData(resume);

    resume.updatedAt =
        new Date().toISOString();

    saveAppState();

    renderResumeManager();

    showToast(
        "Resume saved successfully.",
        "success"
    );
}


/* ============================================================
   6. AUTO SAVE CURRENT RESUME
   ============================================================ */

function autoSaveResume() {

    const resume =
        getCurrentResume();

    if (!resume) return;

    collectBuilderData(resume);

    resume.updatedAt =
        new Date().toISOString();

    Storage.set(
        "resumes",
        APP.resumes
    );

    scheduleAutoSave();
}


/* ============================================================
   7. INPUT HELPER
   ============================================================ */

function getValue(id) {

    const element = get(id);

    return element
        ? element.value.trim()
        : "";
}


function setValue(id, value) {

    const element = get(id);

    if (element) {
        element.value =
            value ?? "";
    }
}


/* ============================================================
   8. COLLECT PERSONAL DATA
   ============================================================ */

function collectPersonalData(resume) {

    resume.personal.fullName =
        getValue("fullName");

    resume.personal.professionalTitle =
        getValue("professionalTitle");

    resume.personal.email =
        getValue("email");

    resume.personal.phone =
        getValue("phone");

    resume.personal.location =
        getValue("location");

    resume.personal.website =
        getValue("website");

    resume.personal.linkedin =
        getValue("linkedin");

    resume.personal.github =
        getValue("github");

    resume.personal.dob =
        getValue("dob");

    resume.personal.nationality =
        getValue("nationality");

    return resume;
}


/* ============================================================
   9. COLLECT MAIN TEXT DATA
   ============================================================ */

function collectMainTextData(resume) {

    resume.summary =
        getValue("professionalSummary");

    resume.objective =
        getValue("careerObjective");

    resume.interests =
        getValue("interests");

    return resume;
}


/* ============================================================
   10. COLLECT SETTINGS
   ============================================================ */

function collectSettings(resume) {

    const template =
        $("input[name='resumeTemplate']:checked");

    const accent =
        $("input[name='accentColor']:checked");

    const paperSize =
        get("paperSize");

    const language =
        get("resumeLanguage");

    const showPhoto =
        get("showPhoto");

    const showReferences =
        get("showReferences");

    const twoPage =
        get("twoPage");

    const autoTranslate =
        get("autoTranslate");

    if (template) {
        resume.settings.template =
            template.value;
    }

    if (accent) {
        resume.settings.accent =
            accent.value;
    }

    if (paperSize) {
        resume.settings.paperSize =
            paperSize.value;
    }

    if (language) {
        resume.settings.language =
            language.value;
    }

    if (showPhoto) {
        resume.settings.showPhoto =
            showPhoto.checked;
    }

    if (showReferences) {
        resume.settings.showReferences =
            showReferences.checked;
    }

    if (twoPage) {
        resume.settings.twoPage =
            twoPage.checked;
    }

    if (autoTranslate) {
        resume.settings.autoTranslate =
            autoTranslate.checked;
    }

    return resume;
}


/* ============================================================
   11. COLLECT ALL BUILDER DATA
   ============================================================ */

function collectBuilderData(resume) {

    collectPersonalData(resume);

    collectMainTextData(resume);

    collectEducationData(resume);

    collectExperienceData(resume);

    collectProjectsData(resume);

    collectSkillsData(resume);

    collectCertificationData(resume);

    collectAchievementData(resume);

    collectLanguageData(resume);

    collectReferenceData(resume);

    collectSettings(resume);

    return resume;
}


/* ============================================================
   12. EDUCATION DATA
   ============================================================ */

function collectEducationData(resume) {

    const items =
        $$(".education-item");

    resume.education =
        items.map(item => {

            return {
                id:
                    item.dataset.id ||
                    createId("education"),

                degree:
                    $(".education-degree", item)?.value.trim() || "",

                institution:
                    $(".education-institution", item)?.value.trim() || "",

                location:
                    $(".education-location", item)?.value.trim() || "",

                startDate:
                    $(".education-start", item)?.value.trim() || "",

                endDate:
                    $(".education-end", item)?.value.trim() || "",

                grade:
                    $(".education-grade", item)?.value.trim() || "",

                description:
                    $(".education-description", item)?.value.trim() || ""
            };

        });

    return resume.education;
}


/* ============================================================
   13. EXPERIENCE DATA
   ============================================================ */

function collectExperienceData(resume) {

    const items =
        $$(".experience-item");

    resume.experience =
        items.map(item => {

            return {
                id:
                    item.dataset.id ||
                    createId("experience"),

                jobTitle:
                    $(".experience-job-title", item)?.value.trim() || "",

                company:
                    $(".experience-company", item)?.value.trim() || "",

                location:
                    $(".experience-location", item)?.value.trim() || "",

                startDate:
                    $(".experience-start", item)?.value.trim() || "",

                endDate:
                    $(".experience-end", item)?.value.trim() || "",

                current:
                    $(".experience-current", item)?.checked || false,

                description:
                    $(".experience-description", item)?.value.trim() || "",

                achievements:
                    $(".experience-achievements", item)?.value.trim() || ""
            };

        });

    return resume.experience;
}


/* ============================================================
   14. PROJECT DATA
   ============================================================ */

function collectProjectsData(resume) {

    const items =
        $$(".project-item");

    resume.projects =
        items.map(item => {

            return {
                id:
                    item.dataset.id ||
                    createId("project"),

                name:
                    $(".project-name", item)?.value.trim() || "",

                role:
                    $(".project-role", item)?.value.trim() || "",

                url:
                    $(".project-url", item)?.value.trim() || "",

                technologies:
                    $(".project-technologies", item)?.value.trim() || "",

                startDate:
                    $(".project-start", item)?.value.trim() || "",

                endDate:
                    $(".project-end", item)?.value.trim() || "",

                description:
                    $(".project-description", item)?.value.trim() || ""
            };

        });

    return resume.projects;
}


/* ============================================================
   15. SKILLS DATA
   ============================================================ */

function collectSkillsData(resume) {

    const groups = [
        "technical",
        "soft",
        "tools",
        "other"
    ];

    groups.forEach(group => {

        const input =
            get(`${group}Skills`);

        if (!input) {
            resume.skills[group] = [];
            return;
        }

        resume.skills[group] =
            input.value
                .split(",")
                .map(skill => skill.trim())
                .filter(Boolean);
    });

    return resume.skills;
}


/* ============================================================
   16. CERTIFICATIONS DATA
   ============================================================ */

function collectCertificationData(resume) {

    const items =
        $$(".certification-item");

    resume.certifications =
        items.map(item => {

            return {
                id:
                    item.dataset.id ||
                    createId("certification"),

                name:
                    $(".certification-name", item)?.value.trim() || "",

                issuer:
                    $(".certification-issuer", item)?.value.trim() || "",

                date:
                    $(".certification-date", item)?.value.trim() || "",

                credential:
                    $(".certification-credential", item)?.value.trim() || "",

                url:
                    $(".certification-url", item)?.value.trim() || ""
            };

        });

    return resume.certifications;
}


/* ============================================================
   17. ACHIEVEMENT DATA
   ============================================================ */

function collectAchievementData(resume) {

    const items =
        $$(".achievement-item");

    resume.achievements =
        items.map(item => {

            return {
                id:
                    item.dataset.id ||
                    createId("achievement"),

                title:
                    $(".achievement-title", item)?.value.trim() || "",

                date:
                    $(".achievement-date", item)?.value.trim() || "",

                description:
                    $(".achievement-description", item)?.value.trim() || ""
            };

        });

    return resume.achievements;
}


/* ============================================================
   18. LANGUAGE DATA
   ============================================================ */

function collectLanguageData(resume) {

    const items =
        $$(".language-item");

    resume.languages =
        items.map(item => {

            return {
                id:
                    item.dataset.id ||
                    createId("language"),

                language:
                    $(".language-name", item)?.value.trim() || "",

                proficiency:
                    $(".language-proficiency", item)?.value || "",

                certification:
                    $(".language-certification", item)?.value.trim() || ""
            };

        });

    return resume.languages;
}


/* ============================================================
   19. REFERENCE DATA
   ============================================================ */

function collectReferenceData(resume) {

    const items =
        $$(".reference-item");

    resume.references =
        items.map(item => {

            return {
                id:
                    item.dataset.id ||
                    createId("reference"),

                name:
                    $(".reference-name", item)?.value.trim() || "",

                position:
                    $(".reference-position", item)?.value.trim() || "",

                company:
                    $(".reference-company", item)?.value.trim() || "",

                email:
                    $(".reference-email", item)?.value.trim() || "",

                phone:
                    $(".reference-phone", item)?.value.trim() || ""
            };

        });

    return resume.references;
}


/* ============================================================
   20. LOAD RESUME INTO BUILDER
   ============================================================ */

function loadResumeIntoBuilder(resume) {

    if (!resume) return;

    setValue(
        "fullName",
        resume.personal.fullName
    );

    setValue(
        "professionalTitle",
        resume.personal.professionalTitle
    );

    setValue(
        "email",
        resume.personal.email
    );

    setValue(
        "phone",
        resume.personal.phone
    );

    setValue(
        "location",
        resume.personal.location
    );

    setValue(
        "website",
        resume.personal.website
    );

    setValue(
        "linkedin",
        resume.personal.linkedin
    );

    setValue(
        "github",
        resume.personal.github
    );

    setValue(
        "dob",
        resume.personal.dob
    );

    setValue(
        "nationality",
        resume.personal.nationality
    );

    setValue(
        "professionalSummary",
        resume.summary
    );

    setValue(
        "careerObjective",
        resume.objective
    );

    setValue(
        "interests",
        resume.interests
    );

    loadEducationItems(resume.education);

    loadExperienceItems(resume.experience);

    loadProjectItems(resume.projects);

    loadSkillInputs(resume.skills);

    loadCertificationItems(resume.certifications);

    loadAchievementItems(resume.achievements);

    loadLanguageItems(resume.languages);

    loadReferenceItems(resume.references);

    loadResumeSettings(resume.settings);

    updateLivePreview();

    updateJobReadyScore();
}


/* ============================================================
   21. LOAD SKILL INPUTS
   ============================================================ */

function loadSkillInputs(skills = {}) {

    const groups = [
        "technical",
        "soft",
        "tools",
        "other"
    ];

    groups.forEach(group => {

        setValue(
            `${group}Skills`,
            (skills[group] || []).join(", ")
        );
    });
}


/* ============================================================
   22. LOAD SETTINGS
   ============================================================ */

function loadResumeSettings(settings = {}) {

    const template =
        $(
            `input[name='resumeTemplate'][value='${settings.template}']`
        );

    if (template) {
        template.checked = true;
    }

    const accent =
        $(
            `input[name='accentColor'][value='${settings.accent}']`
        );

    if (accent) {
        accent.checked = true;
    }

    setValue(
        "paperSize",
        settings.paperSize || "A4"
    );

    setValue(
        "resumeLanguage",
        settings.language || "English"
    );

    if (get("showPhoto")) {
        get("showPhoto").checked =
            settings.showPhoto !== false;
    }

    if (get("showReferences")) {
        get("showReferences").checked =
            settings.showReferences !== false;
    }

    if (get("twoPage")) {
        get("twoPage").checked =
            settings.twoPage === true;
    }

    if (get("autoTranslate")) {
        get("autoTranslate").checked =
            settings.autoTranslate === true;
    }

    applyResumeAccent(
        settings.accent ||
        APP_CONFIG.defaultAccent
    );
}


/* ============================================================
   23. PHOTO PREVIEW
   ============================================================ */

function initResumePhoto() {

    const input =
        get("resumePhoto");

    if (!input) return;

    input.addEventListener(
        "change",
        event => {

            const file =
                event.target.files?.[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {

                showToast(
                    "Please select an image file.",
                    "error"
                );

                input.value = "";
                return;
            }

            if (file.size > 5 * 1024 * 1024) {

                showToast(
                    "Image size should be below 5MB.",
                    "warning"
                );

                input.value = "";
                return;
            }

            const reader =
                new FileReader();

            reader.onload = () => {

                const image =
                    reader.result;

                const resume =
                    ensureCurrentResume();

                resume.personal.photo =
                    image;

                const preview =
                    get("photoPreview");

                if (preview) {
                    preview.src = image;
                }

                const previewImage =
                    get("previewProfileImage");

                if (previewImage) {
                    previewImage.src = image;
                }

                const icon =
                    get("previewProfileIcon");

                if (icon) {
                    icon.style.display = "none";
                }

                autoSaveResume();

                showToast(
                    "Profile photo updated.",
                    "success"
                );
            };

            reader.readAsDataURL(file);
        }
    );
}


/* ============================================================
   24. APPLY PHOTO TO PREVIEW
   ============================================================ */

function updatePreviewPhoto(resume) {

    const image =
        get("previewProfileImage");

    const icon =
        get("previewProfileIcon");

    if (!image) return;

    const showPhoto =
        resume.settings.showPhoto !== false;

    if (
        showPhoto &&
        resume.personal.photo
    ) {

        image.src =
            resume.personal.photo;

        image.style.display =
            "block";

        if (icon) {
            icon.style.display =
                "none";
        }

    } else {

        image.style.display =
            "none";

        if (icon) {
            icon.style.display =
                "flex";
        }
    }
}


/* ============================================================
   25. LIVE PERSONAL PREVIEW
   ============================================================ */

function updatePersonalPreview(resume) {

    const mapping = {

        previewName:
            resume.personal.fullName,

        previewJobTitle:
            resume.personal.professionalTitle,

        previewEmail:
            resume.personal.email,

        previewPhone:
            resume.personal.phone,

        previewLocation:
            resume.personal.location,

        previewLinkedin:
            resume.personal.linkedin,

        previewGithub:
            resume.personal.github,

        previewWebsite:
            resume.personal.website,

        previewSummary:
            resume.summary
    };

    Object.entries(mapping).forEach(
        ([id, value]) => {

            const element =
                get(id);

            if (!element) return;

            element.textContent =
                value || "";
        }
    );

    updatePreviewPhoto(resume);
}


/* ============================================================
   26. EXPERIENCE PREVIEW
   ============================================================ */

function updateExperiencePreview(resume) {

    const container =
        get("previewExperience");

    if (!container) return;

    const validItems =
        resume.experience.filter(
            item =>
                item.jobTitle ||
                item.company
        );

    if (!validItems.length) {

        container.innerHTML = "";

        return;
    }

    container.innerHTML =
        validItems.map(item => {

            const dateText =
                [
                    item.startDate,
                    item.endDate ||
                    (item.current ? "Present" : "")
                ]
                .filter(Boolean)
                .join(" - ");

            return `
                <div class="resume-experience-item">

                    <div class="resume-experience-header">

                        <div>
                            <h4>
                                ${escapeHTML(item.jobTitle)}
                            </h4>

                            <span>
                                ${escapeHTML(item.company)}
                                ${item.location
                                    ? ` · ${escapeHTML(item.location)}`
                                    : ""}
                            </span>
                        </div>

                        <small>
                            ${escapeHTML(dateText)}
                        </small>

                    </div>

                    ${
                        item.description
                            ? `<p>
                                ${escapeHTML(item.description)}
                               </p>`
                            : ""
                    }

                    ${
                        item.achievements
                            ? `<div class="resume-bullets">
                                ${escapeHTML(item.achievements)}
                               </div>`
                            : ""
                    }

                </div>
            `;

        }).join("");
}


/* ============================================================
   27. EDUCATION PREVIEW
   ============================================================ */

function updateEducationPreview(resume) {

    const container =
        get("previewEducation");

    if (!container) return;

    const items =
        resume.education.filter(
            item =>
                item.degree ||
                item.institution
        );

    container.innerHTML =
        items.map(item => {

            const dates =
                [
                    item.startDate,
                    item.endDate
                ]
                .filter(Boolean)
                .join(" - ");

            return `
                <div class="resume-education-item">

                    <div>
                        <h4>
                            ${escapeHTML(item.degree)}
                        </h4>

                        <span>
                            ${escapeHTML(item.institution)}
                            ${
                                item.location
                                    ? ` · ${escapeHTML(item.location)}`
                                    : ""
                            }
                        </span>
                    </div>

                    <div class="resume-education-meta">
                        ${escapeHTML(dates)}

                        ${
                            item.grade
                                ? `<br>${escapeHTML(item.grade)}`
                                : ""
                        }
                    </div>

                </div>
            `;

        }).join("");
}


/* ============================================================
   28. PROJECT PREVIEW
   ============================================================ */

function updateProjectPreview(resume) {

    const container =
        get("previewProjects");

    if (!container) return;

    const items =
        resume.projects.filter(
            item =>
                item.name ||
                item.description
        );

    container.innerHTML =
        items.map(item => {

            return `
                <div class="resume-project-item">

                    <div class="resume-project-header">

                        <h4>
                            ${escapeHTML(item.name)}
                        </h4>

                        ${
                            item.url
                                ? `<a
                                    href="${escapeHTML(item.url)}"
                                    target="_blank"
                                    rel="noopener"
                                   >
                                    View Project
                                   </a>`
                                : ""
                        }

                    </div>

                    ${
                        item.technologies
                            ? `<small>
                                ${escapeHTML(item.technologies)}
                               </small>`
                            : ""
                    }

                    ${
                        item.description
                            ? `<p>
                                ${escapeHTML(item.description)}
                               </p>`
                            : ""
                    }

                </div>
            `;

        }).join("");
}


/* ============================================================
   29. SKILLS PREVIEW
   ============================================================ */

function updateSkillsPreview(resume) {

    const container =
        get("previewSkills");

    if (!container) return;

    const allSkills = [
        ...(resume.skills.technical || []),
        ...(resume.skills.soft || []),
        ...(resume.skills.tools || []),
        ...(resume.skills.other || [])
    ];

    const uniqueSkills =
        [...new Set(
            allSkills
                .map(skill => skill.trim())
                .filter(Boolean)
        )];

    container.innerHTML =
        uniqueSkills.map(skill => {

            return `
                <span class="resume-skill">
                    ${escapeHTML(skill)}
                </span>
            `;

        }).join("");
}


/* ============================================================
   30. CERTIFICATIONS PREVIEW
   ============================================================ */

function updateCertificationPreview(resume) {

    const container =
        get("previewCertificates");

    if (!container) return;

    container.innerHTML =
        resume.certifications
            .filter(item =>
                item.name ||
                item.issuer
            )
            .map(item => {

                return `
                    <div class="resume-certificate-item">

                        <strong>
                            ${escapeHTML(item.name)}
                        </strong>

                        ${
                            item.issuer
                                ? `<span>
                                    ${escapeHTML(item.issuer)}
                                   </span>`
                                : ""
                        }

                        ${
                            item.date
                                ? `<small>
                                    ${escapeHTML(item.date)}
                                   </small>`
                                : ""
                        }

                    </div>
                `;

            }).join("");
}


/* ============================================================
   31. ACHIEVEMENTS PREVIEW
   ============================================================ */

function updateAchievementPreview(resume) {

    const container =
        get("previewAchievements");

    if (!container) return;

    container.innerHTML =
        resume.achievements
            .filter(item =>
                item.title ||
                item.description
            )
            .map(item => {

                return `
                    <div class="resume-achievement-item">

                        <strong>
                            ${escapeHTML(item.title)}
                        </strong>

                        ${
                            item.date
                                ? `<small>
                                    ${escapeHTML(item.date)}
                                   </small>`
                                : ""
                        }

                        ${
                            item.description
                                ? `<p>
                                    ${escapeHTML(item.description)}
                                   </p>`
                                : ""
                        }

                    </div>
                `;

            }).join("");
}


/* ============================================================
   32. LANGUAGES PREVIEW
   ============================================================ */

function updateLanguagePreview(resume) {

    const container =
        get("previewLanguages");

    if (!container) return;

    container.innerHTML =
        resume.languages
            .filter(item => item.language)
            .map(item => {

                return `
                    <div class="resume-language-item">

                        <span>
                            ${escapeHTML(item.language)}
                        </span>

                        ${
                            item.proficiency
                                ? `<small>
                                    ${escapeHTML(item.proficiency)}
                                   </small>`
                                : ""
                        }

                    </div>
                `;

            }).join("");
}


/* ============================================================
   33. INTERESTS PREVIEW
   ============================================================ */

function updateInterestsPreview(resume) {

    const container =
        get("previewInterests");

    if (!container) return;

    container.textContent =
        resume.interests || "";
}


/* ============================================================
   34. LIVE PREVIEW ENGINE
   ============================================================ */

function updateLivePreview() {

    const resume =
        getCurrentResume();

    if (!resume) return;

    collectBuilderData(resume);

    updatePersonalPreview(resume);

    updateExperiencePreview(resume);

    updateEducationPreview(resume);

    updateProjectPreview(resume);

    updateSkillsPreview(resume);

    updateCertificationPreview(resume);

    updateAchievementPreview(resume);

    updateLanguagePreview(resume);

    updateInterestsPreview(resume);

    applyResumeTemplate(
        resume.settings.template
    );

    applyResumeAccent(
        resume.settings.accent
    );

    updateJobReadyScore();
}


/* ============================================================
   35. TEMPLATE ENGINE
   ============================================================ */

function applyResumeTemplate(template = "modern") {

    const preview =
        get("resumePreview");

    if (!preview) return;

    preview.dataset.template =
        template;

    preview.classList.remove(
        "template-modern",
        "template-classic",
        "template-minimal",
        "template-creative",
        "template-professional"
    );

    preview.classList.add(
        `template-${template}`
    );
}


/* ============================================================
   36. ACCENT COLOR
   ============================================================ */

function applyResumeAccent(color) {

    const preview =
        get("resumePreview");

    if (!preview) return;

    preview.style.setProperty(
        "--resume-accent",
        color
    );

    preview.style.setProperty(
        "--resume-primary",
        color
    );
}


/* ============================================================
   37. INPUT LISTENER
   ============================================================ */

function initBuilderInputs() {

    const builder =
        get("resumeBuilder");

    if (!builder) return;

    builder.addEventListener(
        "input",
        event => {

            const target =
                event.target;

            if (
                target.matches(
                    "input, textarea, select"
                )
            ) {

                autoSaveResume();

                updateLivePreview();
            }
        }
    );

    builder.addEventListener(
        "change",
        event => {

            const target =
                event.target;

            if (
                target.matches(
                    "input, textarea, select"
                )
            ) {

                autoSaveResume();

                updateLivePreview();
            }
        }
    );
}


/* ============================================================
   38. GENERIC DYNAMIC ITEM CREATOR
   ============================================================ */

function appendDynamicItem(
    containerId,
    html,
    itemId
) {

    const container =
        get(containerId);

    if (!container) return null;

    const wrapper =
        document.createElement("div");

    wrapper.innerHTML = html.trim();

    const item =
        wrapper.firstElementChild;

    if (!item) return null;

    item.dataset.id =
        itemId || createId("item");

    container.appendChild(item);

    return item;
}


/* ============================================================
   39. EDUCATION ITEM TEMPLATE
   ============================================================ */

function educationTemplate(data = {}) {

    return `
        <div class="dynamic-item education-item"
             data-id="${escapeHTML(data.id || createId("education"))}">

            <div class="dynamic-item-header">

                <strong>
                    Education
                </strong>

                <button
                    type="button"
                    class="remove-item-btn"
                    data-remove-item
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

            <div class="builder-form-grid">

                <div class="builder-form-group">

                    <label>Degree / Qualification</label>

                    <input
                        type="text"
                        class="education-degree"
                        value="${escapeHTML(data.degree || "")}"
                        placeholder="B.Tech Computer Science"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Institution</label>

                    <input
                        type="text"
                        class="education-institution"
                        value="${escapeHTML(data.institution || "")}"
                        placeholder="University / College"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Location</label>

                    <input
                        type="text"
                        class="education-location"
                        value="${escapeHTML(data.location || "")}"
                        placeholder="Kolkata, India"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Grade / CGPA</label>

                    <input
                        type="text"
                        class="education-grade"
                        value="${escapeHTML(data.grade || "")}"
                        placeholder="8.5 CGPA"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Start Date</label>

                    <input
                        type="text"
                        class="education-start"
                        value="${escapeHTML(data.startDate || "")}"
                        placeholder="2023"
                    >

                </div>

                <div class="builder-form-group">

                    <label>End Date</label>

                    <input
                        type="text"
                        class="education-end"
                        value="${escapeHTML(data.endDate || "")}"
                        placeholder="2027"
                    >

                </div>

                <div class="builder-form-group full-width">

                    <label>Description</label>

                    <textarea
                        class="education-description"
                        placeholder="Relevant coursework, achievements..."
                    >${escapeHTML(data.description || "")}</textarea>

                </div>

            </div>

        </div>
    `;
}


/* ============================================================
   40. EXPERIENCE ITEM TEMPLATE
   ============================================================ */

function experienceTemplate(data = {}) {

    return `
        <div class="dynamic-item experience-item"
             data-id="${escapeHTML(data.id || createId("experience"))}">

            <div class="dynamic-item-header">

                <strong>
                    Work Experience
                </strong>

                <button
                    type="button"
                    class="remove-item-btn"
                    data-remove-item
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

            <div class="builder-form-grid">

                <div class="builder-form-group">

                    <label>Job Title</label>

                    <input
                        type="text"
                        class="experience-job-title"
                        value="${escapeHTML(data.jobTitle || "")}"
                        placeholder="Software Developer"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Company</label>

                    <input
                        type="text"
                        class="experience-company"
                        value="${escapeHTML(data.company || "")}"
                        placeholder="Company Name"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Location</label>

                    <input
                        type="text"
                        class="experience-location"
                        value="${escapeHTML(data.location || "")}"
                        placeholder="Remote / Kolkata"
                    >

                </div>

                <div class="builder-form-group">

                    <label>
                        <input
                            type="checkbox"
                            class="experience-current"
                            ${data.current ? "checked" : ""}
                        >
                        Currently working here
                    </label>

                </div>

                <div class="builder-form-group">

                    <label>Start Date</label>

                    <input
                        type="text"
                        class="experience-start"
                        value="${escapeHTML(data.startDate || "")}"
                        placeholder="Jan 2025"
                    >

                </div>

                <div class="builder-form-group">

                    <label>End Date</label>

                    <input
                        type="text"
                        class="experience-end"
                        value="${escapeHTML(data.endDate || "")}"
                        placeholder="Present"
                    >

                </div>

                <div class="builder-form-group full-width">

                    <label>Description</label>

                    <textarea
                        class="experience-description"
                        placeholder="Describe your responsibilities..."
                    >${escapeHTML(data.description || "")}</textarea>

                </div>

                <div class="builder-form-group full-width">

                    <label>Key Achievements</label>

                    <textarea
                        class="experience-achievements"
                        placeholder="Increased sales by 25%..."
                    >${escapeHTML(data.achievements || "")}</textarea>

                </div>

            </div>

        </div>
    `;
}


/* ============================================================
   41. PROJECT ITEM TEMPLATE
   ============================================================ */

function projectTemplate(data = {}) {

    return `
        <div class="dynamic-item project-item"
             data-id="${escapeHTML(data.id || createId("project"))}">

            <div class="dynamic-item-header">

                <strong>
                    Project
                </strong>

                <button
                    type="button"
                    class="remove-item-btn"
                    data-remove-item
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

            <div class="builder-form-grid">

                <div class="builder-form-group">

                    <label>Project Name</label>

                    <input
                        type="text"
                        class="project-name"
                        value="${escapeHTML(data.name || "")}"
                        placeholder="Your Project"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Your Role</label>

                    <input
                        type="text"
                        class="project-role"
                        value="${escapeHTML(data.role || "")}"
                        placeholder="Frontend Developer"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Project URL</label>

                    <input
                        type="url"
                        class="project-url"
                        value="${escapeHTML(data.url || "")}"
                        placeholder="https://..."
                    >

                </div>

                <div class="builder-form-group">

                    <label>Technologies</label>

                    <input
                        type="text"
                        class="project-technologies"
                        value="${escapeHTML(data.technologies || "")}"
                        placeholder="HTML, CSS, JavaScript"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Start Date</label>

                    <input
                        type="text"
                        class="project-start"
                        value="${escapeHTML(data.startDate || "")}"
                    >

                </div>

                <div class="builder-form-group">

                    <label>End Date</label>

                    <input
                        type="text"
                        class="project-end"
                        value="${escapeHTML(data.endDate || "")}"
                    >

                </div>

                <div class="builder-form-group full-width">

                    <label>Description</label>

                    <textarea
                        class="project-description"
                        placeholder="Describe your project..."
                    >${escapeHTML(data.description || "")}</textarea>

                </div>

            </div>

        </div>
    `;
}


/* ============================================================
   42. CERTIFICATION TEMPLATE
   ============================================================ */

function certificationTemplate(data = {}) {

    return `
        <div class="dynamic-item certification-item"
             data-id="${escapeHTML(data.id || createId("certification"))}">

            <div class="dynamic-item-header">

                <strong>
                    Certification
                </strong>

                <button
                    type="button"
                    class="remove-item-btn"
                    data-remove-item
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

            <div class="builder-form-grid">

                <div class="builder-form-group">

                    <label>Certificate Name</label>

                    <input
                        type="text"
                        class="certification-name"
                        value="${escapeHTML(data.name || "")}"
                        placeholder="AWS Certified Cloud Practitioner"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Issuing Organization</label>

                    <input
                        type="text"
                        class="certification-issuer"
                        value="${escapeHTML(data.issuer || "")}"
                        placeholder="Amazon Web Services"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Date</label>

                    <input
                        type="text"
                        class="certification-date"
                        value="${escapeHTML(data.date || "")}"
                        placeholder="2026"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Credential ID</label>

                    <input
                        type="text"
                        class="certification-credential"
                        value="${escapeHTML(data.credential || "")}"
                    >

                </div>

                <div class="builder-form-group full-width">

                    <label>Credential URL</label>

                    <input
                        type="url"
                        class="certification-url"
                        value="${escapeHTML(data.url || "")}"
                        placeholder="https://..."
                    >

                </div>

            </div>

        </div>
    `;
}


/* ============================================================
   43. ACHIEVEMENT TEMPLATE
   ============================================================ */

function achievementTemplate(data = {}) {

    return `
        <div class="dynamic-item achievement-item"
             data-id="${escapeHTML(data.id || createId("achievement"))}">

            <div class="dynamic-item-header">

                <strong>
                    Achievement
                </strong>

                <button
                    type="button"
                    class="remove-item-btn"
                    data-remove-item
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

            <div class="builder-form-grid">

                <div class="builder-form-group">

                    <label>Achievement</label>

                    <input
                        type="text"
                        class="achievement-title"
                        value="${escapeHTML(data.title || "")}"
                        placeholder="Winner of Hackathon"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Date</label>

                    <input
                        type="text"
                        class="achievement-date"
                        value="${escapeHTML(data.date || "")}"
                    >

                </div>

                <div class="builder-form-group full-width">

                    <label>Description</label>

                    <textarea
                        class="achievement-description"
                    >${escapeHTML(data.description || "")}</textarea>

                </div>

            </div>

        </div>
    `;
}


/* ============================================================
   44. LANGUAGE TEMPLATE
   ============================================================ */

function languageTemplate(data = {}) {

    return `
        <div class="dynamic-item language-item"
             data-id="${escapeHTML(data.id || createId("language"))}">

            <div class="dynamic-item-header">

                <strong>
                    Language
                </strong>

                <button
                    type="button"
                    class="remove-item-btn"
                    data-remove-item
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

            <div class="builder-form-grid">

                <div class="builder-form-group">

                    <label>Language</label>

                    <input
                        type="text"
                        class="language-name"
                        value="${escapeHTML(data.language || "")}"
                        placeholder="English"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Proficiency</label>

                    <select class="language-proficiency">

                        <option value="">
                            Select
                        </option>

                        <option
                            value="Native"
                            ${data.proficiency === "Native" ? "selected" : ""}
                        >
                            Native
                        </option>

                        <option
                            value="Fluent"
                            ${data.proficiency === "Fluent" ? "selected" : ""}
                        >
                            Fluent
                        </option>

                        <option
                            value="Professional"
                            ${data.proficiency === "Professional" ? "selected" : ""}
                        >
                            Professional
                        </option>

                        <option
                            value="Intermediate"
                            ${data.proficiency === "Intermediate" ? "selected" : ""}
                        >
                            Intermediate
                        </option>

                        <option
                            value="Basic"
                            ${data.proficiency === "Basic" ? "selected" : ""}
                        >
                            Basic
                        </option>

                    </select>

                </div>

                <div class="builder-form-group full-width">

                    <label>Certification / Test</label>

                    <input
                        type="text"
                        class="language-certification"
                        value="${escapeHTML(data.certification || "")}"
                        placeholder="IELTS 7.5"
                    >

                </div>

            </div>

        </div>
    `;
}


/* ============================================================
   45. REFERENCE TEMPLATE
   ============================================================ */

function referenceTemplate(data = {}) {

    return `
        <div class="dynamic-item reference-item"
             data-id="${escapeHTML(data.id || createId("reference"))}">

            <div class="dynamic-item-header">

                <strong>
                    Reference
                </strong>

                <button
                    type="button"
                    class="remove-item-btn"
                    data-remove-item
                >
                    <i class="fa-solid fa-trash"></i>
                </button>

            </div>

            <div class="builder-form-grid">

                <div class="builder-form-group">

                    <label>Name</label>

                    <input
                        type="text"
                        class="reference-name"
                        value="${escapeHTML(data.name || "")}"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Position</label>

                    <input
                        type="text"
                        class="reference-position"
                        value="${escapeHTML(data.position || "")}"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Company</label>

                    <input
                        type="text"
                        class="reference-company"
                        value="${escapeHTML(data.company || "")}"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Email</label>

                    <input
                        type="email"
                        class="reference-email"
                        value="${escapeHTML(data.email || "")}"
                    >

                </div>

                <div class="builder-form-group">

                    <label>Phone</label>

                    <input
                        type="tel"
                        class="reference-phone"
                        value="${escapeHTML(data.phone || "")}"
                    >

                </div>

            </div>

        </div>
    `;
}


/* ============================================================
   46. LOAD DYNAMIC ITEMS
   ============================================================ */

function loadEducationItems(items = []) {

    const container =
        get("educationList");

    if (!container) return;

    container.innerHTML = "";

    items.forEach(item => {

        appendDynamicItem(
            "educationList",
            educationTemplate(item),
            item.id
        );
    });
}


function loadExperienceItems(items = []) {

    const container =
        get("experienceList");

    if (!container) return;

    container.innerHTML = "";

    items.forEach(item => {

        appendDynamicItem(
            "experienceList",
            experienceTemplate(item),
            item.id
        );
    });
}


function loadProjectItems(items = []) {

    const container =
        get("projectList");

    if (!container) return;

    container.innerHTML = "";

    items.forEach(item => {

        appendDynamicItem(
            "projectList",
            projectTemplate(item),
            item.id
        );
    });
}


function loadCertificationItems(items = []) {

    const container =
        get("certificationList");

    if (!container) return;

    container.innerHTML = "";

    items.forEach(item => {

        appendDynamicItem(
            "certificationList",
            certificationTemplate(item),
            item.id
        );
    });
}


function loadAchievementItems(items = []) {

    const container =
        get("achievementList");

    if (!container) return;

    container.innerHTML = "";

    items.forEach(item => {

        appendDynamicItem(
            "achievementList",
            achievementTemplate(item),
            item.id
        );
    });
}


function loadLanguageItems(items = []) {

    const container =
        get("languageList");

    if (!container) return;

    container.innerHTML = "";

    items.forEach(item => {

        appendDynamicItem(
            "languageList",
            languageTemplate(item),
            item.id
        );
    });
}


function loadReferenceItems(items = []) {

    const container =
        get("referenceList");

    if (!container) return;

    container.innerHTML = "";

    items.forEach(item => {

        appendDynamicItem(
            "referenceList",
            referenceTemplate(item),
            item.id
        );
    });
}


/* ============================================================
   47. ADD DYNAMIC ITEMS
   ============================================================ */

function addEducation() {

    appendDynamicItem(
        "educationList",
        educationTemplate()
    );

    autoSaveResume();

    updateLivePreview();
}


function addExperience() {

    appendDynamicItem(
        "experienceList",
        experienceTemplate()
    );

    autoSaveResume();

    updateLivePreview();
}


function addProject() {

    appendDynamicItem(
        "projectList",
        projectTemplate()
    );

    autoSaveResume();

    updateLivePreview();
}


function addCertification() {

    appendDynamicItem(
        "certificationList",
        certificationTemplate()
    );

    autoSaveResume();

    updateLivePreview();
}


function addAchievement() {

    appendDynamicItem(
        "achievementList",
        achievementTemplate()
    );

    autoSaveResume();

    updateLivePreview();
}


function addLanguage() {

    appendDynamicItem(
        "languageList",
        languageTemplate()
    );

    autoSaveResume();

    updateLivePreview();
}


function addReference() {

    appendDynamicItem(
        "referenceList",
        referenceTemplate()
    );

    autoSaveResume();

    updateLivePreview();
}


/* ============================================================
   48. DYNAMIC BUTTON ROUTER
   ============================================================ */

document.addEventListener("click", event => {

    const button =
        event.target.closest(
            "[data-add-item], [data-remove-item]"
        );

    if (!button) return;

    if (button.hasAttribute("data-remove-item")) {

        const item =
            button.closest(".dynamic-item");

        if (item) {

            item.remove();

            autoSaveResume();

            updateLivePreview();

            updateJobReadyScore();
        }

        return;
    }

    const type =
        button.dataset.addItem;

    switch (type) {

        case "education":
            addEducation();
            break;

        case "experience":
            addExperience();
            break;

        case "project":
            addProject();
            break;

        case "certification":
            addCertification();
            break;

        case "achievement":
            addAchievement();
            break;

        case "language":
            addLanguage();
            break;

        case "reference":
            addReference();
            break;
    }
});


/* ============================================================
   49. BUILDER ACTION BUTTONS
   ============================================================ */

function initBuilderActions() {

    const saveButton =
        get("saveResume");

    if (saveButton) {

        saveButton.addEventListener(
            "click",
            saveCurrentResume
        );
    }

    const previewButton =
        get("previewResume");

    if (previewButton) {

        previewButton.addEventListener(
            "click",
            () => {

                updateLivePreview();

                scrollToSection(
                    get("resumePreview")
                );
            }
        );
    }

    const generateButton =
        get("generateResume");

    if (generateButton) {

        generateButton.addEventListener(
            "click",
            () => {

                updateLivePreview();

                saveCurrentResume();

                showToast(
                    "Resume generated successfully.",
                    "success"
                );

                scrollToSection(
                    get("resumePreview")
                );
            }
        );
    }
}


/* ============================================================
   50. TEMPLATE / COLOR SETTINGS
   ============================================================ */

function initResumeSettings() {

    $$(
        "input[name='resumeTemplate']"
    ).forEach(input => {

        input.addEventListener(
            "change",
            () => {

                const resume =
                    ensureCurrentResume();

                resume.settings.template =
                    input.value;

                applyResumeTemplate(
                    input.value
                );

                autoSaveResume();
            }
        );
    });


    $$(
        "input[name='accentColor']"
    ).forEach(input => {

        input.addEventListener(
            "change",
            () => {

                const resume =
                    ensureCurrentResume();

                resume.settings.accent =
                    input.value;

                applyResumeAccent(
                    input.value
                );

                autoSaveResume();
            }
        );
    });
}


/* ============================================================
   51. RESET CURRENT RESUME
   ============================================================ */

function resetCurrentResume() {

    const resume =
        getCurrentResume();

    if (!resume) return;

    const confirmed =
        window.confirm(
            "Reset this resume and remove all entered information?"
        );

    if (!confirmed) return;

    const fresh =
        createEmptyResume();

    fresh.id =
        resume.id;

    const index =
        APP.resumes.findIndex(
            item => item.id === resume.id
        );

    if (index !== -1) {
        APP.resumes[index] =
            fresh;
    }

    loadResumeIntoBuilder(fresh);

    saveAppState();

    showToast(
        "Resume reset successfully.",
        "success"
    );
}


/* ============================================================
   52. RESET BUTTON
   ============================================================ */

function initResetResume() {

    const button =
        get("resetResume");

    if (!button) return;

    button.addEventListener(
        "click",
        resetCurrentResume
    );
}


/* ============================================================
   53. INITIALIZE RESUME BUILDER
   ============================================================ */

function initializeResumeBuilder() {

    const builder =
        get("resumeBuilder");

    if (!builder) return;

    const resume =
        ensureCurrentResume();

    loadResumeIntoBuilder(resume);

    initResumePhoto();

    initBuilderInputs();

    initBuilderActions();

    initResumeSettings();

    initResetResume();

    updateLivePreview();
}


/* ============================================================
   54. AUTO CREATE FIRST RESUME
   ============================================================ */

function ensureFirstResume() {

    if (APP.resumes.length > 0) {
        return;
    }

    const resume =
        createEmptyResume();

    APP.resumes.push(resume);

    APP.currentResumeId =
        resume.id;

    saveAppState();
}


/* ============================================================
   55. RESUME NAME HELPER
   ============================================================ */

function getResumeDisplayName(resume) {

    if (!resume) {
        return "Untitled Resume";
    }

    return (
        resume.personal.fullName ||
        "Untitled Resume"
    );
}


/* ============================================================
   56. INITIALIZE PART 2
   ============================================================ */

function initializeResumeEngine() {

    ensureFirstResume();

    initializeResumeBuilder();

    console.log(
        "Resume Builder Engine initialized."
    );
}


/* ============================================================
   57. START
   ============================================================ */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeResumeEngine
    );

} else {

    initializeResumeEngine();
}


/* ============================================================
   END OF JAVASCRIPT PART 2
   NEXT:
   PART 3 →
   ATS Scanner
   Job Description Matcher
   Job Ready Score
   Skill Gap Analyzer
   Career Roadmap
   ============================================================ */

// ============================================================
// YOUR RESUME.AI
// MAIN.JS — LIVE CODE PART 3
// ATS + Job Matcher + Job Ready Score
// Skill Gap Analyzer + Career Roadmap
// ============================================================


/* ============================================================
   1. ATS KEYWORD DATABASE
   ============================================================ */

const ATS_KEYWORDS = {

    software: [
        "javascript",
        "typescript",
        "html",
        "css",
        "react",
        "node.js",
        "node",
        "python",
        "java",
        "git",
        "github",
        "api",
        "sql",
        "mongodb",
        "firebase",
        "rest api",
        "testing",
        "debugging"
    ],

    frontend: [
        "html",
        "css",
        "javascript",
        "react",
        "typescript",
        "responsive design",
        "bootstrap",
        "tailwind",
        "git",
        "github",
        "api",
        "ui",
        "ux"
    ],

    backend: [
        "node.js",
        "python",
        "java",
        "sql",
        "mongodb",
        "postgresql",
        "api",
        "rest api",
        "authentication",
        "firebase",
        "docker"
    ],

    data: [
        "python",
        "sql",
        "excel",
        "statistics",
        "data analysis",
        "pandas",
        "numpy",
        "power bi",
        "tableau",
        "machine learning",
        "data visualization"
    ],

    marketing: [
        "seo",
        "sem",
        "social media",
        "content marketing",
        "email marketing",
        "google analytics",
        "copywriting",
        "branding",
        "campaign",
        "digital marketing"
    ],

    sales: [
        "sales",
        "lead generation",
        "crm",
        "communication",
        "negotiation",
        "customer relationship",
        "cold calling",
        "business development",
        "salesforce",
        "conversion"
    ],

    customer_service: [
        "customer service",
        "communication",
        "problem solving",
        "crm",
        "customer support",
        "email support",
        "chat support",
        "telecalling",
        "complaint resolution"
    ],

    hr: [
        "recruitment",
        "talent acquisition",
        "human resources",
        "employee engagement",
        "payroll",
        "onboarding",
        "communication",
        "interview",
        "hrms",
        "performance management"
    ],

    finance: [
        "accounting",
        "excel",
        "financial analysis",
        "finance",
        "taxation",
        "gst",
        "tally",
        "auditing",
        "budgeting",
        "bookkeeping"
    ]
};


/* ============================================================
   2. SKILL DATABASE
   ============================================================ */

const SKILL_DATABASE = {

    frontend: [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Git",
        "GitHub",
        "Responsive Design",
        "REST API",
        "UI/UX",
        "Testing"
    ],

    backend: [
        "Node.js",
        "Express.js",
        "Python",
        "Java",
        "SQL",
        "MongoDB",
        "REST API",
        "Authentication",
        "Git",
        "Docker"
    ],

    fullstack: [
        "HTML",
        "CSS",
        "JavaScript",
        "React",
        "Node.js",
        "Express.js",
        "SQL",
        "MongoDB",
        "Git",
        "REST API",
        "Authentication"
    ],

    data: [
        "Python",
        "SQL",
        "Excel",
        "Statistics",
        "Pandas",
        "NumPy",
        "Power BI",
        "Tableau",
        "Data Visualization",
        "Machine Learning"
    ],

    cybersecurity: [
        "Networking",
        "Linux",
        "Cyber Security",
        "Ethical Hacking",
        "Cryptography",
        "OWASP",
        "SIEM",
        "Incident Response",
        "Firewalls",
        "Security Testing"
    ],

    digitalMarketing: [
        "SEO",
        "SEM",
        "Social Media Marketing",
        "Content Marketing",
        "Google Analytics",
        "Email Marketing",
        "Copywriting",
        "Branding",
        "Canva",
        "Campaign Management"
    ],

    sales: [
        "Communication",
        "Lead Generation",
        "CRM",
        "Negotiation",
        "Customer Relationship",
        "Cold Calling",
        "Business Development",
        "Salesforce",
        "Presentation",
        "Closing"
    ],

    customerService: [
        "Communication",
        "Customer Support",
        "CRM",
        "Problem Solving",
        "Email Support",
        "Chat Support",
        "Telecalling",
        "Complaint Resolution",
        "Active Listening"
    ]
};


/* ============================================================
   3. NORMALIZE TEXT
   ============================================================ */

function normalizeText(text) {

    return safeText(text)
        .toLowerCase()
        .replace(/[^\w\s+#./-]/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}


/* ============================================================
   4. EXTRACT RESUME TEXT
   ============================================================ */

function getResumeText(resume = getCurrentResume()) {

    if (!resume) return "";

    const parts = [];

    parts.push(
        resume.personal.fullName,
        resume.personal.professionalTitle,
        resume.personal.location,
        resume.summary,
        resume.objective,
        resume.interests
    );

    resume.education.forEach(item => {

        parts.push(
            item.degree,
            item.institution,
            item.location,
            item.grade,
            item.description
        );
    });

    resume.experience.forEach(item => {

        parts.push(
            item.jobTitle,
            item.company,
            item.location,
            item.description,
            item.achievements
        );
    });

    resume.projects.forEach(item => {

        parts.push(
            item.name,
            item.role,
            item.url,
            item.technologies,
            item.description
        );
    });

    Object.values(resume.skills).forEach(group => {

        if (Array.isArray(group)) {
            parts.push(...group);
        }
    });

    resume.certifications.forEach(item => {

        parts.push(
            item.name,
            item.issuer,
            item.credential
        );
    });

    resume.achievements.forEach(item => {

        parts.push(
            item.title,
            item.description
        );
    });

    resume.languages.forEach(item => {

        parts.push(
            item.language,
            item.proficiency,
            item.certification
        );
    });

    resume.references.forEach(item => {

        parts.push(
            item.name,
            item.position,
            item.company
        );
    });

    return normalizeText(
        parts
            .filter(Boolean)
            .join(" ")
    );
}


/* ============================================================
   5. GET RESUME SKILLS
   ============================================================ */

function getResumeSkills(resume = getCurrentResume()) {

    if (!resume) return [];

    const skills = [];

    Object.values(resume.skills).forEach(group => {

        if (Array.isArray(group)) {
            skills.push(...group);
        }
    });

    resume.experience.forEach(item => {

        if (item.jobTitle) {
            skills.push(item.jobTitle);
        }
    });

    resume.projects.forEach(item => {

        if (item.technologies) {

            item.technologies
                .split(",")
                .forEach(skill => {
                    skills.push(skill.trim());
                });
        }
    });

    return [
        ...new Set(
            skills
                .map(skill => normalizeText(skill))
                .filter(Boolean)
        )
    ];
}


/* ============================================================
   6. KEYWORD MATCHER
   ============================================================ */

function findKeywordMatches(text, keywords) {

    const normalized =
        normalizeText(text);

    const matches = [];
    const missing = [];

    keywords.forEach(keyword => {

        const normalizedKeyword =
            normalizeText(keyword);

        if (
            normalized.includes(
                normalizedKeyword
            )
        ) {
            matches.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    return {
        matches,
        missing
    };
}


/* ============================================================
   7. ATS SCORE CALCULATOR
   ============================================================ */

function calculateATSScore(
    resumeText,
    keywords = []
) {

    const normalized =
        normalizeText(resumeText);

    if (!normalized) {
        return {
            score: 0,
            matched: [],
            missing: keywords
        };
    }

    const result =
        findKeywordMatches(
            normalized,
            keywords
        );

    const keywordScore =
        keywords.length
            ? Math.round(
                (
                    result.matches.length /
                    keywords.length
                ) * 100
            )
            : 0;

    return {
        score: keywordScore,
        matched: result.matches,
        missing: result.missing
    };
}


/* ============================================================
   8. ATS CATEGORY DETECTION
   ============================================================ */

function detectATSCategory(text) {

    const normalized =
        normalizeText(text);

    const scores = {};

    Object.entries(
        ATS_KEYWORDS
    ).forEach(
        ([category, keywords]) => {

            let count = 0;

            keywords.forEach(keyword => {

                if (
                    normalized.includes(
                        normalizeText(keyword)
                    )
                ) {
                    count++;
                }
            });

            scores[category] =
                count;
        }
    );

    const sorted =
        Object.entries(scores)
            .sort(
                (a, b) => b[1] - a[1]
            );

    return sorted[0]?.[0] || "software";
}


/* ============================================================
   9. ATS STRENGTH ANALYSIS
   ============================================================ */

function generateATSStrengths(
    resume,
    matchedKeywords
) {

    const strengths = [];

    if (resume.personal.fullName) {
        strengths.push(
            "Your name is clearly included."
        );
    }

    if (
        resume.personal.email &&
        resume.personal.phone
    ) {
        strengths.push(
            "Contact information is complete."
        );
    }

    if (resume.summary) {
        strengths.push(
            "Professional summary is available."
        );
    }

    if (resume.education.length) {
        strengths.push(
            "Education section is present."
        );
    }

    if (resume.experience.length) {
        strengths.push(
            "Work experience is included."
        );
    }

    if (resume.projects.length) {
        strengths.push(
            "Projects demonstrate practical experience."
        );
    }

    if (matchedKeywords.length >= 5) {
        strengths.push(
            "Good number of job-relevant keywords detected."
        );
    }

    return strengths;
}


/* ============================================================
   10. ATS IMPROVEMENTS
   ============================================================ */

function generateATSImprovements(
    resume,
    missingKeywords
) {

    const improvements = [];

    if (!resume.personal.professionalTitle) {
        improvements.push(
            "Add a clear professional title."
        );
    }

    if (!resume.summary) {
        improvements.push(
            "Add a concise professional summary."
        );
    }

    if (!resume.experience.length) {
        improvements.push(
            "Add relevant internship, freelance or work experience."
        );
    }

    if (!resume.projects.length) {
        improvements.push(
            "Add practical projects related to your target role."
        );
    }

    if (!resume.skills.technical.length) {
        improvements.push(
            "Add technical skills relevant to the target job."
        );
    }

    if (missingKeywords.length) {

        improvements.push(
            `Consider adding relevant keywords such as ${missingKeywords
                .slice(0, 6)
                .join(", ")} if they genuinely match your experience.`
        );
    }

    return improvements;
}


/* ============================================================
   11. ATS FILE READER
   ============================================================ */

function readResumeFile(file) {

    return new Promise((resolve, reject) => {

        if (!file) {
            reject(
                new Error("No file selected.")
            );
            return;
        }

        const reader =
            new FileReader();

        const extension =
            file.name
                .split(".")
                .pop()
                .toLowerCase();

        if (
            extension === "txt" ||
            file.type === "text/plain"
        ) {

            reader.onload = () => {
                resolve(
                    reader.result
                );
            };

            reader.onerror = reject;

            reader.readAsText(file);

            return;
        }

        reject(
            new Error(
                "For browser-only mode, TXT files are supported directly. Use the resume text box for PDF/DOCX content."
            )
        );
    });
}


/* ============================================================
   12. ATS SCANNER UI
   ============================================================ */

function renderATSResult(result) {

    const score =
        get("atsScore");

    const strengths =
        get("atsStrengths");

    const improvements =
        get("atsImprovements");

    const matched =
        get("atsMatchedKeywords");

    const missing =
        get("atsMissingKeywords");

    if (score) {

        score.textContent =
            `${result.score}%`;
    }

    if (strengths) {

        strengths.innerHTML =
            result.strengths
                .map(item =>
                    `<li>
                        <i class="fa-solid fa-check"></i>
                        ${escapeHTML(item)}
                    </li>`
                )
                .join("");
    }

    if (improvements) {

        improvements.innerHTML =
            result.improvements
                .map(item =>
                    `<li>
                        <i class="fa-solid fa-arrow-up"></i>
                        ${escapeHTML(item)}
                    </li>`
                )
                .join("");
    }

    if (matched) {

        matched.innerHTML =
            result.matched
                .map(item =>
                    `<span class="keyword-tag matched">
                        ${escapeHTML(item)}
                    </span>`
                )
                .join("");
    }

    if (missing) {

        missing.innerHTML =
            result.missing
                .map(item =>
                    `<span class="keyword-tag missing">
                        ${escapeHTML(item)}
                    </span>`
                )
                .join("");
    }
}


/* ============================================================
   13. SCAN CURRENT RESUME
   ============================================================ */

function scanCurrentResumeATS() {

    const resume =
        getCurrentResume();

    if (!resume) {

        showToast(
            "Please create a resume first.",
            "warning"
        );

        return;
    }

    const resumeText =
        getResumeText(resume);

    const category =
        detectATSCategory(
            resumeText
        );

    const keywords =
        ATS_KEYWORDS[category] ||
        ATS_KEYWORDS.software;

    const result =
        calculateATSScore(
            resumeText,
            keywords
        );

    result.strengths =
        generateATSStrengths(
            resume,
            result.matched
        );

    result.improvements =
        generateATSImprovements(
            resume,
            result.missing
        );

    renderATSResult(result);

    Storage.set(
        "lastATSResult",
        {
            ...result,
            category,
            date: new Date().toISOString()
        }
    );

    return result;
}


/* ============================================================
   14. ATS TEXT SCANNER
   ============================================================ */

function scanATSProvidedText() {

    const textInput =
        get("atsResumeText");

    const text =
        textInput?.value.trim();

    if (!text) {

        showToast(
            "Paste your resume text first.",
            "warning"
        );

        return;
    }

    const category =
        detectATSCategory(text);

    const keywords =
        ATS_KEYWORDS[category] ||
        ATS_KEYWORDS.software;

    const result =
        calculateATSScore(
            text,
            keywords
        );

    result.strengths = [
        "Resume text was successfully analyzed.",
        `Detected profile category: ${category.replace("_", " ")}.`
    ];

    result.improvements =
        result.missing.length
            ? [
                `Review missing keywords: ${result.missing
                    .slice(0, 8)
                    .join(", ")}.`
            ]
            : [
                "The selected keyword set was detected successfully."
            ];

    renderATSResult(result);

    return result;
}


/* ============================================================
   15. ATS INITIALIZATION
   ============================================================ */

function initATSScanner() {

    const button =
        get("scanResumeBtn");

    if (!button) return;

    button.addEventListener(
        "click",
        async () => {

            const file =
                get("atsResumeFile")?.files?.[0];

            const text =
                get("atsResumeText")?.value.trim();

            if (text) {
                scanATSProvidedText();
                return;
            }

            if (file) {

                try {

                    const fileText =
                        await readResumeFile(file);

                    if (get("atsResumeText")) {
                        get("atsResumeText").value =
                            fileText;
                    }

                    scanATSProvidedText();

                } catch (error) {

                    showToast(
                        error.message,
                        "error"
                    );
                }

                return;
            }

            scanCurrentResumeATS();
        }
    );
}


/* ============================================================
   16. JOB DESCRIPTION PARSER
   ============================================================ */

function extractJobKeywords(jobDescription) {

    const text =
        normalizeText(
            jobDescription
        );

    const allKeywords =
        [
            ...new Set(
                Object.values(
                    ATS_KEYWORDS
                ).flat()
            )
        ];

    return allKeywords.filter(
        keyword =>
            text.includes(
                normalizeText(keyword)
            )
    );
}


/* ============================================================
   17. JOB MATCH CALCULATOR
   ============================================================ */

function calculateJobMatch(
    resumeText,
    jobDescription
) {

    const jobKeywords =
        extractJobKeywords(
            jobDescription
        );

    if (!jobKeywords.length) {

        return {
            score: 0,
            matched: [],
            missing: [],
            jobKeywords: []
        };
    }

    const result =
        findKeywordMatches(
            resumeText,
            jobKeywords
        );

    const score =
        Math.round(
            (
                result.matches.length /
                jobKeywords.length
            ) * 100
        );

    return {
        score,
        matched: result.matches,
        missing: result.missing,
        jobKeywords
    };
}


/* ============================================================
   18. JOB MATCH UI
   ============================================================ */

function renderJobMatch(result) {

    const score =
        get("jobMatchScore");

    const matched =
        get("matchingSkills");

    const missing =
        get("missingSkills");

    const total =
        get("jobKeywordCount");

    if (score) {
        score.textContent =
            `${result.score}%`;
    }

    if (matched) {

        matched.innerHTML =
            result.matched
                .map(skill =>
                    `<span class="keyword-tag matched">
                        ${escapeHTML(skill)}
                    </span>`
                )
                .join("");
    }

    if (missing) {

        missing.innerHTML =
            result.missing
                .map(skill =>
                    `<span class="keyword-tag missing">
                        ${escapeHTML(skill)}
                    </span>`
                )
                .join("");
    }

    if (total) {
        total.textContent =
            result.jobKeywords.length;
    }

    const matchCount =
        get("matchingSkillCount");

    const missingCount =
        get("missingSkillCount");

    if (matchCount) {
        matchCount.textContent =
            result.matched.length;
    }

    if (missingCount) {
        missingCount.textContent =
            result.missing.length;
    }
}


/* ============================================================
   19. JOB DESCRIPTION MATCHER
   ============================================================ */

function runJobDescriptionMatcher() {

    const resume =
        getCurrentResume();

    if (!resume) {

        showToast(
            "Please create a resume first.",
            "warning"
        );

        return;
    }

    const jobDescription =
        get("jobDescription")?.value.trim();

    if (!jobDescription) {

        showToast(
            "Paste the job description first.",
            "warning"
        );

        return;
    }

    const result =
        calculateJobMatch(
            getResumeText(resume),
            jobDescription
        );

    renderJobMatch(result);

    Storage.set(
        "lastJobMatch",
        {
            ...result,
            date: new Date().toISOString()
        }
    );

    showToast(
        "Job description analyzed.",
        "success"
    );

    return result;
}


/* ============================================================
   20. JOB MATCH INITIALIZATION
   ============================================================ */

function initJobMatcher() {

    const button =
        get("matchJobBtn");

    if (!button) return;

    button.addEventListener(
        "click",
        runJobDescriptionMatcher
    );
}


/* ============================================================
   21. JOB READY SCORE
   ============================================================ */

function calculateJobReadyScore(
    resume = getCurrentResume()
) {

    if (!resume) {
        return {
            total: 0,
            resume: 0,
            skills: 0,
            experience: 0,
            ats: 0,
            completeness: 0
        };
    }

    let completeness = 0;

    const personalFields = [
        resume.personal.fullName,
        resume.personal.professionalTitle,
        resume.personal.email,
        resume.personal.phone,
        resume.personal.location
    ];

    const personalCompleted =
        personalFields.filter(Boolean).length;

    completeness +=
        Math.round(
            (
                personalCompleted /
                personalFields.length
            ) * 25
        );

    if (resume.summary) {
        completeness += 15;
    }

    if (resume.education.length) {
        completeness += 15;
    }

    if (resume.skills.technical.length) {
        completeness += 15;
    }

    if (
        resume.experience.length ||
        resume.projects.length
    ) {
        completeness += 15;
    }

    if (
        resume.certifications.length ||
        resume.achievements.length
    ) {
        completeness += 5;
    }

    if (resume.languages.length) {
        completeness += 5;
    }

    if (resume.personal.linkedin) {
        completeness += 5;
    }

    completeness =
        Math.min(
            100,
            completeness
        );

    const skillsCount =
        getResumeSkills(resume).length;

    const skillsScore =
        Math.min(
            100,
            skillsCount * 10
        );

    const experienceScore =
        Math.min(
            100,
            (
                resume.experience.length * 35
            ) +
            (
                resume.projects.length * 20
            )
        );

    const resumeScore =
        completeness;

    const atsResult =
        Storage.get(
            "lastATSResult",
            null
        );

    const atsScore =
        atsResult?.score || 0;

    const total =
        Math.round(
            (
                resumeScore * .30 +
                skillsScore * .20 +
                experienceScore * .20 +
                atsScore * .15 +
                completeness * .15
            )
        );

    return {
        total: Math.min(100, total),
        resume: Math.round(resumeScore),
        skills: Math.round(skillsScore),
        experience: Math.round(experienceScore),
        ats: Math.round(atsScore),
        completeness: Math.round(completeness)
    };
}


/* ============================================================
   22. JOB READY SCORE UI
   ============================================================ */

function updateJobReadyScore() {

    const result =
        calculateJobReadyScore();

    const score =
        get("jobReadyScore");

    if (score) {
        score.textContent =
            result.total;
    }

    const scoreRing =
        get("jobReadyScoreRing");

    if (scoreRing) {

        scoreRing.style.setProperty(
            "--score",
            result.total
        );

        scoreRing.style.setProperty(
            "--progress",
            `${result.total * 3.6}deg`
        );
    }

    const mapping = {

        resumeScore:
            result.resume,

        skillsScore:
            result.skills,

        experienceScore:
            result.experience,

        atsScore:
            result.ats,

        completenessScore:
            result.completeness
    };

    Object.entries(mapping)
        .forEach(
            ([id, value]) => {

                const element =
                    get(id);

                if (element) {
                    element.textContent =
                        `${value}%`;
                }
            }
        );

    const status =
        get("jobReadyStatus");

    if (status) {

        let label =
            "Needs Improvement";

        if (result.total >= 80) {
            label = "Job Ready";
        } else if (result.total >= 60) {
            label = "Almost Ready";
        }

        status.textContent =
            label;
    }

    return result;
}


/* ============================================================
   23. CALCULATE BUTTON
   ============================================================ */

function initJobReadyButton() {

    const button =
        get("calculateJobReady");

    if (!button) return;

    button.addEventListener(
        "click",
        () => {

            const result =
                updateJobReadyScore();

            showToast(
                `Your Job Ready Score is ${result.total}/100.`,
                "success"
            );
        }
    );
}


/* ============================================================
   24. CAREER NORMALIZER
   ============================================================ */

function normalizeCareerName(
    career
) {

    const value =
        normalizeText(career);

    const aliases = {

        "frontend developer":
            "frontend",

        "front end developer":
            "frontend",

        "web developer":
            "frontend",

        "backend developer":
            "backend",

        "back end developer":
            "backend",

        "full stack developer":
            "fullstack",

        "fullstack developer":
            "fullstack",

        "data analyst":
            "data",

        "data scientist":
            "data",

        "cyber security":
            "cybersecurity",

        "cybersecurity":
            "cybersecurity",

        "digital marketing":
            "digitalMarketing",

        "sales executive":
            "sales",

        "customer service":
            "customerService"
    };

    return aliases[value] || value;
}


/* ============================================================
   25. SKILL GAP CALCULATOR
   ============================================================ */

function calculateSkillGap(
    currentSkills,
    targetCareer
) {

    const career =
        normalizeCareerName(
            targetCareer
        );

    const required =
        SKILL_DATABASE[career] ||
        [];

    const normalizedCurrent =
        currentSkills.map(
            skill =>
                normalizeText(skill)
        );

    const existing =
        required.filter(
            skill =>
                normalizedCurrent.includes(
                    normalizeText(skill)
                )
        );

    const missing =
        required.filter(
            skill =>
                !normalizedCurrent.includes(
                    normalizeText(skill)
                )
        );

    const score =
        required.length
            ? Math.round(
                (
                    existing.length /
                    required.length
                ) * 100
            )
            : 0;

    return {
        career,
        required,
        existing,
        missing,
        score
    };
}


/* ============================================================
   26. SKILL GAP UI
   ============================================================ */

function renderSkillGap(result) {

    const existing =
        get("existingSkills");

    const required =
        get("requiredSkills");

    const learning =
        get("learningRecommendations");

    const score =
        get("skillGapScore");

    if (score) {
        score.textContent =
            `${result.score}%`;
    }

    if (existing) {

        existing.innerHTML =
            result.existing
                .map(skill =>
                    `<li>
                        <i class="fa-solid fa-check"></i>
                        ${escapeHTML(skill)}
                    </li>`
                )
                .join("");
    }

    if (required) {

        required.innerHTML =
            result.required
                .map(skill =>
                    `<li>
                        <i class="fa-solid fa-star"></i>
                        ${escapeHTML(skill)}
                    </li>`
                )
                .join("");
    }

    if (learning) {

        learning.innerHTML =
            result.missing
                .map((skill, index) =>
                    `<li>
                        <span>${index + 1}</span>
                        Learn ${escapeHTML(skill)}
                    </li>`
                )
                .join("");
    }
}


/* ============================================================
   27. SKILL GAP ANALYZER
   ============================================================ */

function runSkillGapAnalyzer() {

    const currentSkillsInput =
        get("currentSkills");

    const targetCareerInput =
        get("targetCareer");

    const currentSkills =
        currentSkillsInput
            ?.value
            .split(",")
            .map(skill => skill.trim())
            .filter(Boolean) || [];

    const targetCareer =
        targetCareerInput
            ?.value.trim();

    if (!targetCareer) {

        showToast(
            "Enter your target career.",
            "warning"
        );

        return;
    }

    const result =
        calculateSkillGap(
            currentSkills,
            targetCareer
        );

    renderSkillGap(result);

    Storage.set(
        "lastSkillGap",
        {
            ...result,
            date: new Date().toISOString()
        }
    );

    showToast(
        "Skill gap analysis completed.",
        "success"
    );

    return result;
}


/* ============================================================
   28. SKILL GAP INITIALIZATION
   ============================================================ */

function initSkillGap() {

    const button =
        get("analyzeSkillGapBtn");

    if (!button) return;

    button.addEventListener(
        "click",
        runSkillGapAnalyzer
    );
}


/* ============================================================
   29. CAREER ROADMAP DATABASE
   ============================================================ */

const ROADMAP_DATABASE = {

    frontend: [
        {
            title: "Build Web Foundations",
            description:
                "Learn HTML, CSS, responsive design and browser fundamentals."
        },
        {
            title: "Master JavaScript",
            description:
                "Learn modern JavaScript, DOM, events, async programming and APIs."
        },
        {
            title: "Learn React",
            description:
                "Build component-based applications using React and modern tooling."
        },
        {
            title: "Build Real Projects",
            description:
                "Create portfolio projects such as dashboards, websites and web apps."
        },
        {
            title: "Prepare Resume & Portfolio",
            description:
                "Create an ATS-friendly resume and professional developer portfolio."
        },
        {
            title: "Apply & Prepare for Interviews",
            description:
                "Apply to relevant roles and practice technical and behavioral interviews."
        }
    ],

    backend: [
        {
            title: "Programming Foundation",
            description:
                "Strengthen JavaScript, Python or Java fundamentals."
        },
        {
            title: "Backend Framework",
            description:
                "Learn Node.js/Express, Django, Spring Boot or another backend stack."
        },
        {
            title: "Databases",
            description:
                "Learn SQL, database design and NoSQL concepts."
        },
        {
            title: "APIs & Authentication",
            description:
                "Build REST APIs with authentication, validation and authorization."
        },
        {
            title: "Deploy Real Applications",
            description:
                "Learn Git, hosting, environment variables and basic deployment."
        },
        {
            title: "Interview & Job Preparation",
            description:
                "Practice backend interview questions and apply for suitable roles."
        }
    ],

    fullstack: [
        {
            title: "Frontend Foundations",
            description:
                "Master HTML, CSS and JavaScript."
        },
        {
            title: "Modern Frontend",
            description:
                "Learn React and responsive application development."
        },
        {
            title: "Backend Development",
            description:
                "Learn Node.js, Express and server-side development."
        },
        {
            title: "Database & APIs",
            description:
                "Learn SQL/NoSQL and REST API development."
        },
        {
            title: "Build Full Projects",
            description:
                "Create complete applications from frontend to backend."
        },
        {
            title: "Portfolio & Job Search",
            description:
                "Build your portfolio, optimize your resume and start applying."
        }
    ],

    data: [
        {
            title: "Statistics Foundation",
            description:
                "Learn descriptive statistics, probability and data interpretation."
        },
        {
            title: "Python & SQL",
            description:
                "Learn Python, SQL and data manipulation."
        },
        {
            title: "Data Analysis",
            description:
                "Practice Pandas, NumPy, Excel and visualization."
        },
        {
            title: "BI Tools",
            description:
                "Learn Power BI, Tableau or another visualization platform."
        },
        {
            title: "Build Data Projects",
            description:
                "Create dashboards, analysis reports and portfolio projects."
        },
        {
            title: "Apply for Data Roles",
            description:
                "Prepare your resume, portfolio and data interview skills."
        }
    ],

    cybersecurity: [
        {
            title: "Networking Fundamentals",
            description:
                "Learn TCP/IP, DNS, HTTP, networking devices and protocols."
        },
        {
            title: "Linux & Security Basics",
            description:
                "Learn Linux administration and fundamental security concepts."
        },
        {
            title: "Security Tools",
            description:
                "Learn defensive monitoring, vulnerability assessment and security tooling."
        },
        {
            title: "Web Security",
            description:
                "Study common web vulnerabilities and secure development practices."
        },
        {
            title: "Build Security Projects",
            description:
                "Create safe labs, monitoring projects and security documentation."
        },
        {
            title: "Certifications & Jobs",
            description:
                "Prepare for relevant certifications and entry-level security roles."
        }
    ]
};


/* ============================================================
   30. GENERATE ROADMAP
   ============================================================ */

function generateCareerRoadmap() {

    const targetInput =
        get("roadmapCareer") ||
        get("targetCareer");

    const target =
        targetInput
            ?.value.trim();

    if (!target) {

        showToast(
            "Enter your target career.",
            "warning"
        );

        return;
    }

    const career =
        normalizeCareerName(
            target
        );

    const steps =
        ROADMAP_DATABASE[career] ||
        ROADMAP_DATABASE.frontend;

    const container =
        get("roadmapTimeline");

    if (!container) return;

    container.innerHTML =
        steps.map(
            (step, index) => {

                return `
                    <div class="roadmap-step">

                        <div class="roadmap-number">
                            ${index + 1}
                        </div>

                        <div class="roadmap-content">

                            <span class="roadmap-label">
                                Step ${index + 1}
                            </span>

                            <h3>
                                ${escapeHTML(step.title)}
                            </h3>

                            <p>
                                ${escapeHTML(step.description)}
                            </p>

                        </div>

                    </div>
                `;

            }
        ).join("");

    Storage.set(
        "lastRoadmap",
        {
            career,
            steps,
            date: new Date().toISOString()
        }
    );

    showToast(
        "Career roadmap generated.",
        "success"
    );

    return {
        career,
        steps
    };
}


/* ============================================================
   31. ROADMAP INITIALIZATION
   ============================================================ */

function initCareerRoadmap() {

    const button =
        get("generateRoadmapBtn");

    if (!button) return;

    button.addEventListener(
        "click",
        generateCareerRoadmap
    );
}


/* ============================================================
   32. ATS / MATCH / SCORE INITIALIZATION
   ============================================================ */

function initializeCareerTools() {

    initATSScanner();

    initJobMatcher();

    initJobReadyButton();

    initSkillGap();

    initCareerRoadmap();

    const existingATS =
        Storage.get(
            "lastATSResult",
            null
        );

    if (existingATS) {
        renderATSResult(existingATS);
    }

    const existingMatch =
        Storage.get(
            "lastJobMatch",
            null
        );

    if (existingMatch) {
        renderJobMatch(existingMatch);
    }

    updateJobReadyScore();
}


/* ============================================================
   33. RUN AFTER DOM LOAD
   ============================================================ */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCareerTools
    );

} else {

    initializeCareerTools();
}


/* ============================================================
   END OF JAVASCRIPT PART 3
   NEXT:
   PART 4 →
   AI Cover Letter Generator
   Job Application Email
   LinkedIn Profile Generator
   ============================================================ */

// ============================================================
// YOUR RESUME.AI
// MAIN.JS — LIVE CODE PART 4
// AI Cover Letter + Job Application Email
// LinkedIn Profile Generator
// ============================================================


/* ============================================================
   1. TEXT UTILITIES
   ============================================================ */

function capitalizeWords(text) {

    return safeText(text)
        .trim()
        .split(/\s+/)
        .map(word =>
            word.charAt(0).toUpperCase() +
            word.slice(1)
        )
        .join(" ");
}


function firstName(name) {

    return safeText(name)
        .trim()
        .split(/\s+/)[0] || "";
}


function getSelectedValue(id, fallback = "") {

    const element = get(id);

    if (!element) {
        return fallback;
    }

    return element.value || fallback;
}


/* ============================================================
   2. COVER LETTER DATA
   ============================================================ */

function getCoverLetterData() {

    const resume =
        getCurrentResume();

    return {

        name:
            getValue("coverLetterName") ||
            resume?.personal?.fullName ||
            "",

        company:
            getValue("coverLetterCompany"),

        jobTitle:
            getValue("coverLetterJobTitle"),

        hiringManager:
            getValue("coverLetterHiringManager"),

        experience:
            getValue("coverLetterExperience"),

        tone:
            getSelectedValue(
                "coverLetterTone",
                "Professional"
            ),

        jobDescription:
            getValue("coverLetterJobDescription"),

        highlights:
            getValue("coverLetterHighlights")
    };
}


/* ============================================================
   3. COVER LETTER GENERATOR
   ============================================================ */

function generateCoverLetterText(data) {

    const name =
        data.name ||
        "Your Name";

    const company =
        data.company ||
        "your company";

    const jobTitle =
        data.jobTitle ||
        "the advertised position";

    const hiringManager =
        data.hiringManager ||
        "Hiring Manager";

    const experience =
        data.experience ||
        "my academic background and practical experience";

    const highlights =
        data.highlights ||
        "my ability to learn quickly, solve problems and contribute effectively";

    const tone =
        normalizeText(data.tone);

    let opening = "";

    if (tone.includes("friendly")) {

        opening =
            `I am excited to apply for the ${jobTitle} position at ${company}.`;

    } else if (tone.includes("confident")) {

        opening =
            `I am writing to express my strong interest in the ${jobTitle} position at ${company}.`;

    } else {

        opening =
            `I am writing to apply for the ${jobTitle} position at ${company}.`;
    }


    const bodyParagraph =
        `My background in ${experience} has helped me develop a strong foundation that I believe is relevant to this opportunity. I am particularly interested in this role because it provides an opportunity to apply my skills while continuing to grow professionally.`;


    const highlightParagraph =
        `Some of the strengths I would bring to this position include ${highlights}. I am comfortable learning new tools, collaborating with others and taking responsibility for delivering quality work.`;


    const closing =
        `Thank you for considering my application. I would welcome the opportunity to discuss how my background and skills could contribute to ${company}. I look forward to hearing from you.`;


    return `Dear ${hiringManager},

${opening}

${bodyParagraph}

${highlightParagraph}

${closing}

Sincerely,
${name}`;
}


/* ============================================================
   4. COVER LETTER OUTPUT
   ============================================================ */

function renderCoverLetter(text, data) {

    const output =
        get("coverLetterOutput");

    if (!output) return;

    output.innerHTML = `
        <div class="cover-letter-meta">

            <div>
                <strong>
                    ${escapeHTML(data.name)}
                </strong>
            </div>

            <div>
                ${escapeHTML(data.company)}
            </div>

            <div>
                ${escapeHTML(data.jobTitle)}
            </div>

        </div>

        <div class="cover-letter-body">
            ${escapeHTML(text)
                .replace(/\n/g, "<br>")}
        </div>
    `;

    output.dataset.rawText =
        text;
}


/* ============================================================
   5. COVER LETTER GENERATE BUTTON
   ============================================================ */

function initCoverLetterGenerator() {

    const button =
        get("generateCoverLetter");

    if (!button) return;

    button.addEventListener(
        "click",
        () => {

            const data =
                getCoverLetterData();

            if (!data.name) {

                showToast(
                    "Enter your name first.",
                    "warning"
                );

                return;
            }

            if (!data.company) {

                showToast(
                    "Enter the company name.",
                    "warning"
                );

                return;
            }

            if (!data.jobTitle) {

                showToast(
                    "Enter the job title.",
                    "warning"
                );

                return;
            }

            const text =
                generateCoverLetterText(
                    data
                );

            renderCoverLetter(
                text,
                data
            );

            Storage.set(
                "lastCoverLetter",
                {
                    data,
                    text,
                    createdAt:
                        new Date().toISOString()
                }
            );

            showToast(
                "Cover letter generated successfully.",
                "success"
            );
        }
    );
}


/* ============================================================
   6. CLEAR COVER LETTER
   ============================================================ */

function initCoverLetterClear() {

    const button =
        get("clearCoverLetter");

    if (!button) return;

    button.addEventListener(
        "click",
        () => {

            [
                "coverLetterName",
                "coverLetterCompany",
                "coverLetterJobTitle",
                "coverLetterHiringManager",
                "coverLetterExperience",
                "coverLetterJobDescription",
                "coverLetterHighlights"
            ].forEach(id => {
                setValue(id, "");
            });

            const output =
                get("coverLetterOutput");

            if (output) {
                output.innerHTML = `
                    <div class="tool-empty">
                        Your generated cover letter will appear here.
                    </div>
                `;
            }

            showToast(
                "Cover letter cleared.",
                "info"
            );
        }
    );
}


/* ============================================================
   7. COPY COVER LETTER
   ============================================================ */

async function copyCoverLetter() {

    const output =
        get("coverLetterOutput");

    if (!output) return;

    const text =
        output.dataset.rawText ||
        output.innerText;

    if (!text) {

        showToast(
            "Generate a cover letter first.",
            "warning"
        );

        return;
    }

    try {

        await navigator.clipboard.writeText(
            text
        );

        showToast(
            "Cover letter copied.",
            "success"
        );

    } catch (error) {

        showToast(
            "Unable to copy automatically.",
            "error"
        );
    }
}


/* ============================================================
   8. DOWNLOAD TEXT FILE
   ============================================================ */

function downloadTextFile(
    filename,
    text
) {

    const blob =
        new Blob(
            [text],
            {
                type: "text/plain;charset=utf-8"
            }
        );

    const url =
        URL.createObjectURL(blob);

    const anchor =
        document.createElement("a");

    anchor.href = url;
    anchor.download = filename;

    document.body.appendChild(anchor);

    anchor.click();

    anchor.remove();

    URL.revokeObjectURL(url);
}


/* ============================================================
   9. DOWNLOAD COVER LETTER
   ============================================================ */

function initCoverLetterDownload() {

    const button =
        get("downloadCoverLetter");

    if (!button) return;

    button.addEventListener(
        "click",
        () => {

            const output =
                get("coverLetterOutput");

            if (!output) return;

            const text =
                output.dataset.rawText ||
                output.innerText;

            if (!text) {

                showToast(
                    "Generate a cover letter first.",
                    "warning"
                );

                return;
            }

            downloadTextFile(
                "cover-letter.txt",
                text
            );

            showToast(
                "Cover letter downloaded.",
                "success"
            );
        }
    );
}


/* ============================================================
   10. JOB APPLICATION EMAIL DATA
   ============================================================ */

function getJobEmailData() {

    const resume =
        getCurrentResume();

    return {

        name:
            getValue("jobEmailName") ||
            resume?.personal?.fullName ||
            "",

        email:
            getValue("jobEmailAddress") ||
            resume?.personal?.email ||
            "",

        recipient:
            getValue("jobEmailRecipient"),

        company:
            getValue("jobEmailCompany"),

        position:
            getValue("jobEmailPosition"),

        type:
            getSelectedValue(
                "jobEmailType",
                "Job Application"
            ),

        tone:
            getSelectedValue(
                "jobEmailTone",
                "Professional"
            ),

        language:
            getSelectedValue(
                "jobEmailLanguage",
                "English"
            ),

        details:
            getValue("jobEmailDetails")
    };
}


/* ============================================================
   11. JOB EMAIL SUBJECT
   ============================================================ */

function generateJobEmailSubject(data) {

    const position =
        data.position ||
        "Job Application";

    const name =
        data.name ||
        "Candidate";

    switch (
        normalizeText(data.type)
    ) {

        case "follow up":
            return `Follow-up on Application – ${position}`;

        case "interview":
            return `Interview Follow-up – ${position}`;

        case "thank you":
            return `Thank You – ${position} Interview`;

        case "referral":
            return `Referral Request – ${position}`;

        default:
            return `Application for ${position} – ${name}`;
    }
}


/* ============================================================
   12. JOB EMAIL GENERATOR
   ============================================================ */

function generateJobEmailText(data) {

    const recipient =
        data.recipient ||
        "Hiring Manager";

    const company =
        data.company ||
        "the company";

    const position =
        data.position ||
        "the position";

    const name =
        data.name ||
        "Your Name";

    const details =
        data.details ||
        `I am interested in the ${position} opportunity at ${company}. I believe my skills and background could be relevant to the role.`;

    const tone =
        normalizeText(data.tone);

    let greeting =
        `Dear ${recipient},`;

    if (tone.includes("friendly")) {
        greeting =
            `Hello ${recipient},`;
    }


    let body = `
${greeting}

I am writing to express my interest in the ${position} position at ${company}.

${details}

I have attached my resume for your consideration. I would appreciate the opportunity to discuss the position and how my background may align with your requirements.

Thank you for your time and consideration.

Best regards,
${name}
${data.email || ""}
`;

    return body.trim();
}


/* ============================================================
   13. RENDER JOB EMAIL
   ============================================================ */

function renderJobEmail(
    text,
    subject,
    data
) {

    const output =
        get("jobEmailOutput");

    if (!output) return;

    output.innerHTML = `

        <div class="email-preview-window">

            <div class="email-window-header">
                <strong>
                    Email Preview
                </strong>
            </div>

            <div class="email-header-fields">

                <div>
                    <strong>To:</strong>
                    ${escapeHTML(
                        data.recipient ||
                        "Hiring Manager"
                    )}
                </div>

                <div>
                    <strong>Company:</strong>
                    ${escapeHTML(
                        data.company
                    )}
                </div>

                <div>
                    <strong>Subject:</strong>
                    ${escapeHTML(subject)}
                </div>

            </div>

            <div class="email-body">
                ${escapeHTML(text)
                    .replace(/\n/g, "<br>")}
            </div>

        </div>
    `;

    output.dataset.rawText =
        text;

    output.dataset.subject =
        subject;
}


/* ============================================================
   14. JOB EMAIL GENERATE
   ============================================================ */

function initJobEmailGenerator() {

    const button =
        get("generateJobEmail");

    if (!button) return;

    button.addEventListener(
        "click",
        () => {

            const data =
                getJobEmailData();

            if (!data.name) {

                showToast(
                    "Enter your name first.",
                    "warning"
                );

                return;
            }

            if (!data.company) {

                showToast(
                    "Enter company name.",
                    "warning"
                );

                return;
            }

            if (!data.position) {

                showToast(
                    "Enter the job position.",
                    "warning"
                );

                return;
            }

            const subject =
                generateJobEmailSubject(
                    data
                );

            const text =
                generateJobEmailText(
                    data
                );

            renderJobEmail(
                text,
                subject,
                data
            );

            Storage.set(
                "lastJobEmail",
                {
                    data,
                    subject,
                    text,
                    createdAt:
                        new Date().toISOString()
                }
            );

            showToast(
                "Job application email generated.",
                "success"
            );
        }
    );
}


/* ============================================================
   15. COPY JOB EMAIL
   ============================================================ */

function initJobEmailCopy() {

    const button =
        get("copyJobEmail");

    if (!button) return;

    button.addEventListener(
        "click",
        async () => {

            const output =
                get("jobEmailOutput");

            if (!output) return;

            const text =
                output.dataset.rawText;

            const subject =
                output.dataset.subject;

            if (!text) {

                showToast(
                    "Generate an email first.",
                    "warning"
                );

                return;
            }

            const fullText =
                `Subject: ${subject}\n\n${text}`;

            try {

                await navigator.clipboard.writeText(
                    fullText
                );

                showToast(
                    "Email copied.",
                    "success"
                );

            } catch (error) {

                showToast(
                    "Unable to copy email.",
                    "error"
                );
            }
        }
    );
}


/* ============================================================
   16. DOWNLOAD JOB EMAIL
   ============================================================ */

function initJobEmailDownload() {

    const button =
        get("downloadJobEmail");

    if (!button) return;

    button.addEventListener(
        "click",
        () => {

            const output =
                get("jobEmailOutput");

            if (!output) return;

            const text =
                output.dataset.rawText;

            const subject =
                output.dataset.subject;

            if (!text) {

                showToast(
                    "Generate an email first.",
                    "warning"
                );

                return;
            }

            downloadTextFile(
                "job-application-email.txt",
                `Subject: ${subject}\n\n${text}`
            );

            showToast(
                "Email downloaded.",
                "success"
            );
        }
    );
}


/* ============================================================
   17. LINKEDIN PROFILE DATA
   ============================================================ */

function getLinkedinData() {

    const resume =
        getCurrentResume();

    return {

        name:
            getValue("linkedinName") ||
            resume?.personal?.fullName ||
            "",

        targetRole:
            getValue("linkedinTargetRole") ||
            resume?.personal?.professionalTitle ||
            "",

        experience:
            getValue("linkedinExperience"),

        location:
            getValue("linkedinLocation") ||
            resume?.personal?.location ||
            "",

        skills:
            getValue("linkedinSkills"),

        experienceDetails:
            getValue("linkedinExperienceDetails"),

        projects:
            getValue("linkedinProjects"),

        industry:
            getValue("linkedinIndustry"),

        tone:
            getSelectedValue(
                "linkedinTone",
                "Professional"
            )
    };
}


/* ============================================================
   18. LINKEDIN HEADLINE
   ============================================================ */

function generateLinkedinHeadline(
    data
) {

    const role =
        data.targetRole ||
        "Professional";

    const skills =
        data.skills
            ? data.skills
                .split(",")
                .map(item => item.trim())
                .filter(Boolean)
                .slice(0, 3)
                .join(" | ")
            : "";

    if (skills) {

        return `${role} | ${skills} | Open to Opportunities`;
    }

    return `${role} | Building Skills | Open to Opportunities`;
}


/* ============================================================
   19. LINKEDIN ABOUT
   ============================================================ */

function generateLinkedinAbout(
    data
) {

    const name =
        data.name ||
        "I";

    const role =
        data.targetRole ||
        "professional";

    const experience =
        data.experience ||
        "a growing professional background";

    const skills =
        data.skills ||
        "problem solving, communication and continuous learning";

    const projects =
        data.projects ||
        "practical projects and real-world learning experiences";

    const industry =
        data.industry ||
        "the technology and professional services space";


    return `I am ${name}, a ${role} with ${experience}.

My professional interests are focused on ${industry}. I enjoy learning new technologies, solving practical problems and continuously improving my skills.

My core skills include ${skills}.

I have worked on ${projects}, which has helped me strengthen my ability to turn ideas into practical results.

I am always interested in learning from other professionals, collaborating on meaningful projects and exploring opportunities where I can contribute and grow.

If you would like to connect or discuss a relevant opportunity, feel free to reach out.`;
}


/* ============================================================
   20. LINKEDIN SKILL LIST
   ============================================================ */

function getLinkedinSkills(
    data
) {

    const skills =
        data.skills
            .split(",")
            .map(skill => skill.trim())
            .filter(Boolean);

    if (!skills.length) {

        return [
            "Communication",
            "Problem Solving",
            "Teamwork",
            "Time Management",
            "Continuous Learning"
        ];
    }

    return [
        ...new Set(skills)
    ].slice(0, 15);
}


/* ============================================================
   21. LINKEDIN GENERATOR
   ============================================================ */

function generateLinkedinProfile() {

    const data =
        getLinkedinData();

    if (!data.name) {

        showToast(
            "Enter your name first.",
            "warning"
        );

        return;
    }

    if (!data.targetRole) {

        showToast(
            "Enter your target role.",
            "warning"
        );

        return;
    }

    const headline =
        generateLinkedinHeadline(
            data
        );

    const about =
        generateLinkedinAbout(
            data
        );

    const skills =
        getLinkedinSkills(
            data
        );

    renderLinkedinProfile(
        data,
        headline,
        about,
        skills
    );

    Storage.set(
        "lastLinkedinProfile",
        {
            data,
            headline,
            about,
            skills,
            createdAt:
                new Date().toISOString()
        }
    );

    showToast(
        "LinkedIn profile generated.",
        "success"
    );
}


/* ============================================================
   22. LINKEDIN UI
   ============================================================ */

function renderLinkedinProfile(
    data,
    headline,
    about,
    skills
) {

    const output =
        get("linkedinOutput");

    if (output) {

        output.innerHTML = `

            <div class="linkedin-profile-content">

                <div class="linkedin-avatar">

                    ${
                        getCurrentResume()
                            ?.personal
                            ?.photo

                            ? `<img
                                src="${escapeHTML(
                                    getCurrentResume()
                                        .personal
                                        .photo
                                )}"
                                alt="Profile"
                               >`

                            : `<i class="fa-solid fa-user"></i>`
                    }

                </div>

                <h2 class="linkedin-name">
                    ${escapeHTML(data.name)}
                </h2>

                <div class="linkedin-headline">
                    ${escapeHTML(headline)}
                </div>

                ${
                    data.location
                        ? `
                            <div class="linkedin-location">
                                <i class="fa-solid fa-location-dot"></i>
                                ${escapeHTML(data.location)}
                            </div>
                          `
                        : ""
                }

                <div class="linkedin-preview-section">

                    <h3>About</h3>

                    <p>
                        ${escapeHTML(about)
                            .replace(/\n/g, "<br>")}
                    </p>

                </div>

                <div class="linkedin-preview-section">

                    <h3>Skills</h3>

                    <div class="linkedin-skill-list">

                        ${skills.map(skill =>
                            `<span class="linkedin-skill">
                                ${escapeHTML(skill)}
                            </span>`
                        ).join("")}

                    </div>

                </div>

            </div>
        `;

        output.dataset.headline =
            headline;

        output.dataset.about =
            about;

        output.dataset.skills =
            JSON.stringify(skills);
    }

    const headlineOutput =
        get("linkedinHeadline");

    if (headlineOutput) {
        headlineOutput.textContent =
            headline;
    }

    const aboutOutput =
        get("linkedinAbout");

    if (aboutOutput) {
        aboutOutput.textContent =
            about;
    }

    const skillsOutput =
        get("linkedinSkillsOutput");

    if (skillsOutput) {

        skillsOutput.innerHTML =
            skills.map(skill =>
                `<span class="linkedin-skill">
                    ${escapeHTML(skill)}
                </span>`
            ).join("");
    }
}


/* ============================================================
   23. COPY LINKEDIN PROFILE
   ============================================================ */

function initLinkedinCopy() {

    const button =
        get("copyLinkedin");

    if (!button) return;

    button.addEventListener(
        "click",
        async () => {

            const output =
                get("linkedinOutput");

            if (!output) return;

            const headline =
                output.dataset.headline;

            const about =
                output.dataset.about;

            const skills =
                JSON.parse(
                    output.dataset.skills ||
                    "[]"
                );

            if (!headline && !about) {

                showToast(
                    "Generate a LinkedIn profile first.",
                    "warning"
                );

                return;
            }

            const text = `
Headline:
${headline}

About:
${about}

Skills:
${skills.join(", ")}
`.trim();

            try {

                await navigator.clipboard.writeText(
                    text
                );

                showToast(
                    "LinkedIn profile copied.",
                    "success"
                );

            } catch (error) {

                showToast(
                    "Unable to copy profile.",
                    "error"
                );
            }
        }
    );
}


/* ============================================================
   24. DOWNLOAD LINKEDIN PROFILE
   ============================================================ */

function initLinkedinDownload() {

    const button =
        get("downloadLinkedin");

    if (!button) return;

    button.addEventListener(
        "click",
        () => {

            const output =
                get("linkedinOutput");

            if (!output) return;

            const headline =
                output.dataset.headline;

            const about =
                output.dataset.about;

            const skills =
                JSON.parse(
                    output.dataset.skills ||
                    "[]"
                );

            if (!headline && !about) {

                showToast(
                    "Generate a LinkedIn profile first.",
                    "warning"
                );

                return;
            }

            const text = `
LINKEDIN PROFILE

Headline:
${headline}

About:
${about}

Skills:
${skills.join(", ")}
`.trim();

            downloadTextFile(
                "linkedin-profile.txt",
                text
            );

            showToast(
                "LinkedIn profile downloaded.",
                "success"
            );
        }
    );
}


/* ============================================================
   25. LOAD PREVIOUS AI RESULTS
   ============================================================ */

function loadPreviousAITools() {

    const coverLetter =
        Storage.get(
            "lastCoverLetter",
            null
        );

    if (
        coverLetter &&
        get("coverLetterOutput")
    ) {

        renderCoverLetter(
            coverLetter.text,
            coverLetter.data
        );
    }


    const jobEmail =
        Storage.get(
            "lastJobEmail",
            null
        );

    if (
        jobEmail &&
        get("jobEmailOutput")
    ) {

        renderJobEmail(
            jobEmail.text,
            jobEmail.subject,
            jobEmail.data
        );
    }


    const linkedin =
        Storage.get(
            "lastLinkedinProfile",
            null
        );

    if (
        linkedin &&
        get("linkedinOutput")
    ) {

        renderLinkedinProfile(
            linkedin.data,
            linkedin.headline,
            linkedin.about,
            linkedin.skills
        );
    }
}


/* ============================================================
   26. INITIALIZE AI TOOLS PART 4
   ============================================================ */

function initializeAIToolsPart4() {

    initCoverLetterGenerator();
    initCoverLetterClear();
    initCoverLetterDownload();

    initJobEmailGenerator();
    initJobEmailCopy();
    initJobEmailDownload();

    const linkedinButton =
        get("generateLinkedin");

    if (linkedinButton) {

        linkedinButton.addEventListener(
            "click",
            generateLinkedinProfile
        );
    }

    initLinkedinCopy();
    initLinkedinDownload();

    loadPreviousAITools();

    console.log(
        "AI writing tools initialized."
    );
}


/* ============================================================
   27. DOM READY
   ============================================================ */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAIToolsPart4
    );

} else {

    initializeAIToolsPart4();
}


/* ============================================================
   END OF JAVASCRIPT PART 4
   NEXT:
   PART 5 →
   AI Interview Preparation
   Interview Practice
   Career Assistant / AI Chat
   ============================================================ */

// ============================================================
// YOUR RESUME.AI
// MAIN.JS — LIVE CODE PART 5
// AI INTERVIEW PREPARATION
// AI INTERVIEW PRACTICE
// AI CAREER ASSISTANT
// ============================================================


/* ============================================================
   1. INTERVIEW QUESTION DATABASE
   ============================================================ */

const INTERVIEW_QUESTIONS = {

    general: [
        "Tell me about yourself.",
        "Why should we hire you?",
        "What are your greatest strengths?",
        "What is one weakness you are currently improving?",
        "Why do you want to join our company?",
        "Where do you see yourself in the next five years?",
        "Why are you looking for a job?",
        "Tell me about a challenge you faced and how you handled it.",
        "How do you handle pressure?",
        "How do you prioritize your work?"
    ],

    fresher: [
        "Tell me about yourself.",
        "Why did you choose your field of study?",
        "What projects have you worked on?",
        "What skills have you developed during your studies?",
        "What did you learn from your most recent project?",
        "Are you comfortable learning new technologies?",
        "How do you handle situations where you do not know something?",
        "What are your career goals?",
        "Why should we hire a fresher?",
        "What are your expectations from your first job?"
    ],

    technical: [
        "Explain one technical project you have worked on.",
        "Which programming languages are you comfortable with?",
        "How do you debug a technical problem?",
        "How do you learn a new technology?",
        "What is the difference between frontend and backend development?",
        "What is an API?",
        "What is a database?",
        "How do you improve website performance?",
        "What is version control?",
        "Explain a technical problem you solved."
    ],

    hr: [
        "Tell me about yourself.",
        "Why do you want to work with us?",
        "What motivates you?",
        "How do you handle criticism?",
        "How do you work in a team?",
        "Describe a difficult situation you handled.",
        "What are your salary expectations?",
        "Are you willing to relocate?",
        "What are your short-term career goals?",
        "Do you have any questions for us?"
    ],

    customerService: [
        "How would you handle an angry customer?",
        "How would you deal with a difficult customer?",
        "What does good customer service mean to you?",
        "How would you handle multiple customers at the same time?",
        "How do you remain calm under pressure?",
        "How would you explain a complicated issue to a customer?",
        "What would you do if you did not know the answer to a customer's question?",
        "How do you handle customer complaints?",
        "What makes a good customer support executive?",
        "Why are you interested in customer service?"
    ]
};


/* ============================================================
   2. INTERVIEW QUESTION GENERATOR
   ============================================================ */

function getInterviewQuestions(category, count = 10) {

    const key =
        normalizeText(category)
            .replace(/\s+/g, "");

    let questions =
        INTERVIEW_QUESTIONS[key] ||
        INTERVIEW_QUESTIONS.general;

    questions =
        [...questions];

    for (
        let i = questions.length - 1;
        i > 0;
        i--
    ) {

        const j =
            Math.floor(
                Math.random() * (i + 1)
            );

        [
            questions[i],
            questions[j]
        ] =
        [
            questions[j],
            questions[i]
        ];
    }

    return questions.slice(
        0,
        Math.min(
            count,
            questions.length
        )
    );
}


/* ============================================================
   3. INTERVIEW ANSWER FRAMEWORK
   ============================================================ */

function generateInterviewAnswer(
    question,
    resume
) {

    const name =
        resume?.personal?.fullName ||
        "I";

    const title =
        resume?.personal?.professionalTitle ||
        "my field";

    const summary =
        resume?.personal?.summary ||
        "";

    const skills =
        getResumeSkills(
            resume
        ).slice(0, 5);

    const skillText =
        skills.length
            ? skills.join(", ")
            : "communication, problem solving and continuous learning";


    const q =
        normalizeText(
            question
        );


    if (
        q.includes("tell me about yourself")
    ) {

        return `My name is ${name}. I am focused on building my career in ${title}. My background has helped me develop skills in ${skillText}. ${summary || "I enjoy learning new things, working on practical problems and continuously improving myself. I am now looking for an opportunity where I can contribute to a team while developing my professional skills further."}`;
    }


    if (
        q.includes("greatest strengths") ||
        q.includes("your strengths")
    ) {

        return `My main strengths are ${skillText}. I would also say that I am willing to learn, responsible with my work and comfortable adapting to new situations. I try to understand a problem properly before deciding on the best solution.`;
    }


    if (
        q.includes("weakness")
    ) {

        return `One area I am actively improving is becoming more efficient when handling multiple tasks at the same time. I have been working on this by prioritizing tasks, breaking larger work into smaller steps and maintaining clear deadlines.`;
    }


    if (
        q.includes("why should we hire")
    ) {

        return `I believe I can bring a combination of relevant skills, willingness to learn and a responsible approach to the role. I may still be developing professionally, but I am committed to learning quickly, accepting feedback and contributing consistently to the team.`;
    }


    if (
        q.includes("five years") ||
        q.includes("5 years")
    ) {

        return `Over the next five years, I want to become highly capable in my field, take on greater responsibilities and contribute to meaningful projects. I also want to keep improving my technical and professional skills.`;
    }


    if (
        q.includes("pressure")
    ) {

        return `I try to stay calm under pressure by identifying the most important task first, breaking the problem into manageable steps and communicating early if I need clarification or support.`;
    }


    if (
        q.includes("angry customer")
    ) {

        return `I would first listen carefully without interrupting the customer. I would acknowledge the concern, understand the actual problem, explain what I can do to help and then take the appropriate action. My goal would be to solve the issue professionally while keeping the conversation respectful.`;
    }


    return `I would approach this situation by first understanding the requirement, identifying the most practical solution and then taking action. If I needed additional information, I would ask the right questions rather than making assumptions. I would also learn from the experience so I can handle a similar situation better in the future.`;
}


/* ============================================================
   4. INTERVIEW PREPARATION DATA
   ============================================================ */

function getInterviewPrepData() {

    const resume =
        getCurrentResume();

    return {

        name:
            getValue("interviewName") ||
            resume?.personal?.fullName ||
            "",

        role:
            getValue("interviewRole") ||
            resume?.personal?.professionalTitle ||
            "",

        company:
            getValue("interviewCompany"),

        category:
            getSelectedValue(
                "interviewCategory",
                "general"
            ),

        experience:
            getValue("interviewExperience"),

        jobDescription:
            getValue("interviewJobDescription")
    };
}


/* ============================================================
   5. INTERVIEW PREPARATION GENERATOR
   ============================================================ */

function generateInterviewPreparation() {

    const data =
        getInterviewPrepData();

    const questions =
        getInterviewQuestions(
            data.category,
            10
        );

    const resume =
        getCurrentResume();

    const output =
        get("interviewPrepOutput");

    if (!output) return;

    output.innerHTML = `

        <div class="interview-prep-result">

            <div class="interview-result-header">

                <div>
                    <span class="tool-label">
                        Interview Preparation
                    </span>

                    <h3>
                        ${escapeHTML(
                            data.role ||
                            "Your Target Role"
                        )}
                    </h3>

                    ${
                        data.company
                            ? `
                                <p>
                                    ${escapeHTML(
                                        data.company
                                    )}
                                </p>
                              `
                            : ""
                    }

                </div>

                <div class="interview-score-badge">
                    Ready
                </div>

            </div>

            <div class="interview-question-list">

                ${questions.map(
                    (question, index) => {

                        const answer =
                            generateInterviewAnswer(
                                question,
                                resume
                            );

                        return `

                            <div
                                class="interview-question-card"
                                data-question-index="${index}"
                            >

                                <div class="question-number">
                                    ${index + 1}
                                </div>

                                <div class="question-content">

                                    <h4>
                                        ${escapeHTML(
                                            question
                                        )}
                                    </h4>

                                    <div class="suggested-answer">

                                        <strong>
                                            Suggested Answer
                                        </strong>

                                        <p>
                                            ${escapeHTML(
                                                answer
                                            )}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        `;
                    }
                ).join("")}

            </div>

        </div>
    `;


    Storage.set(
        "lastInterviewPreparation",
        {
            data,
            questions,
            createdAt:
                new Date().toISOString()
        }
    );


    showToast(
        "Interview preparation generated.",
        "success"
    );
}


/* ============================================================
   6. INTERVIEW PREPARATION INITIALIZATION
   ============================================================ */

function initInterviewPreparation() {

    const button =
        get("generateInterviewPrep");

    if (!button) return;

    button.addEventListener(
        "click",
        () => {

            generateInterviewPreparation();
        }
    );
}


/* ============================================================
   7. INTERVIEW PRACTICE STATE
   ============================================================ */

const InterviewPractice = {

    questions: [],

    currentIndex: 0,

    answers: [],

    startedAt: null,

    score: 0
};


/* ============================================================
   8. START INTERVIEW PRACTICE
   ============================================================ */

function startInterviewPractice() {

    const category =
        getSelectedValue(
            "practiceCategory",
            "general"
        );

    InterviewPractice.questions =
        getInterviewQuestions(
            category,
            5
        );

    InterviewPractice.currentIndex =
        0;

    InterviewPractice.answers =
        [];

    InterviewPractice.startedAt =
        Date.now();

    InterviewPractice.score =
        0;

    renderInterviewPractice();

    showToast(
        "Interview practice started.",
        "success"
    );
}


/* ============================================================
   9. RENDER PRACTICE QUESTION
   ============================================================ */

function renderInterviewPractice() {

    const output =
        get("interviewPracticeOutput");

    if (!output) return;

    const questions =
        InterviewPractice.questions;

    if (!questions.length) {

        output.innerHTML = `
            <div class="tool-empty">
                Start the interview to begin practice.
            </div>
        `;

        return;
    }


    const index =
        InterviewPractice.currentIndex;

    const question =
        questions[index];


    output.innerHTML = `

        <div class="practice-question-wrapper">

            <div class="practice-progress">

                <span>
                    Question ${index + 1}
                    of ${questions.length}
                </span>

                <div class="practice-progress-bar">

                    <span
                        style="
                            width:
                            ${
                                ((index + 1) /
                                questions.length) *
                                100
                            }%;
                        "
                    ></span>

                </div>

            </div>


            <div class="practice-question">

                <span class="practice-label">
                    Interviewer asks
                </span>

                <h3>
                    ${escapeHTML(question)}
                </h3>

            </div>


            <div class="practice-answer-area">

                <textarea
                    id="practiceAnswer"
                    class="form-control"
                    rows="7"
                    placeholder="Type your answer here..."
                ></textarea>

            </div>


            <div class="practice-actions">

                <button
                    type="button"
                    class="btn btn-primary"
                    data-practice-action="submit"
                >
                    Submit Answer
                </button>

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-practice-action="skip"
                >
                    Skip
                </button>

            </div>


            <div
                id="practiceFeedback"
                class="practice-feedback"
            ></div>

        </div>
    `;
}


/* ============================================================
   10. EVALUATE INTERVIEW ANSWER
   ============================================================ */

function evaluateInterviewAnswer(
    question,
    answer
) {

    const text =
        safeText(answer).trim();

    if (!text) {

        return {

            score: 0,

            feedback:
                "Try to give a complete answer instead of leaving it blank.",

            strengths: [],

            improvements: [
                "Add a clear explanation.",
                "Give a specific example.",
                "Explain the result or lesson."
            ]
        };
    }


    const words =
        text.split(/\s+/)
            .filter(Boolean);

    let score = 40;

    const strengths = [];

    const improvements = [];


    if (words.length >= 30) {

        score += 15;

        strengths.push(
            "Good level of detail."
        );

    } else {

        improvements.push(
            "Add more relevant details."
        );
    }


    if (
        /\b(example|project|experience|situation|result|learned)\b/i
            .test(text)
    ) {

        score += 15;

        strengths.push(
            "Includes experience or example-based information."
        );

    } else {

        improvements.push(
            "Use a specific example from your experience."
        );
    }


    if (
        /\b(because|therefore|so|result|reason|approach)\b/i
            .test(text)
    ) {

        score += 10;

        strengths.push(
            "Shows reasoning."
        );

    } else {

        improvements.push(
            "Explain why you took your approach."
        );
    }


    if (
        /\b(I|my|me|we)\b/i
            .test(text)
    ) {

        score += 5;

        strengths.push(
            "Uses personal experience appropriately."
        );
    }


    if (
        /\b(learn|improve|growth|feedback)\b/i
            .test(text)
    ) {

        score += 10;

        strengths.push(
            "Shows a growth mindset."
        );
    }


    score =
        Math.min(
            100,
            score
        );


    return {

        score,

        feedback:
            score >= 80
                ? "Strong answer. Keep it concise and natural during the real interview."
                : score >= 60
                    ? "Good starting answer. Add a specific example and measurable result if possible."
                    : "The answer needs more structure, detail and a concrete example.",

        strengths,

        improvements
    };
}


/* ============================================================
   11. SUBMIT PRACTICE ANSWER
   ============================================================ */

function submitPracticeAnswer() {

    const textarea =
        get("practiceAnswer");

    const answer =
        textarea?.value || "";

    const question =
        InterviewPractice.questions[
            InterviewPractice.currentIndex
        ];

    const evaluation =
        evaluateInterviewAnswer(
            question,
            answer
        );


    InterviewPractice.answers.push({

        question,

        answer,

        score:
            evaluation.score,

        feedback:
            evaluation.feedback,

        strengths:
            evaluation.strengths,

        improvements:
            evaluation.improvements
    });


    InterviewPractice.score +=
        evaluation.score;


    const feedback =
        get("practiceFeedback");

    if (feedback) {

        feedback.innerHTML = `

            <div class="practice-score">

                <span>
                    Answer Score
                </span>

                <strong>
                    ${evaluation.score}/100
                </strong>

            </div>

            <p>
                ${escapeHTML(
                    evaluation.feedback
                )}
            </p>

            ${
                evaluation.strengths.length
                    ? `
                        <div>
                            <strong>
                                Strengths
                            </strong>

                            <ul>
                                ${evaluation.strengths
                                    .map(item =>
                                        `<li>
                                            ${escapeHTML(item)}
                                        </li>`
                                    )
                                    .join("")}
                            </ul>
                        </div>
                      `
                    : ""
            }

            ${
                evaluation.improvements.length
                    ? `
                        <div>
                            <strong>
                                Improve
                            </strong>

                            <ul>
                                ${evaluation.improvements
                                    .map(item =>
                                        `<li>
                                            ${escapeHTML(item)}
                                        </li>`
                                    )
                                    .join("")}
                            </ul>
                        </div>
                      `
                    : ""
            }

            <button
                type="button"
                class="btn btn-primary"
                data-practice-action="next"
            >
                ${
                    InterviewPractice.currentIndex <
                    InterviewPractice.questions.length - 1

                        ? "Next Question"

                        : "Finish Interview"
                }
            </button>
        `;
    }
}


/* ============================================================
   12. FINISH INTERVIEW PRACTICE
   ============================================================ */

function finishInterviewPractice() {

    const total =
        InterviewPractice.answers.length;

    const average =
        total
            ? Math.round(
                InterviewPractice.score /
                total
              )
            : 0;


    const output =
        get("interviewPracticeOutput");

    if (!output) return;


    output.innerHTML = `

        <div class="interview-final-result">

            <div class="final-score-circle">

                <strong>
                    ${average}
                </strong>

                <span>
                    / 100
                </span>

            </div>

            <h3>
                Interview Practice Complete
            </h3>

            <p>
                You completed
                ${total}
                practice questions.
            </p>


            <div class="final-result-summary">

                <div>
                    <strong>
                        ${average >= 80
                            ? "Strong"
                            : average >= 60
                                ? "Developing"
                                : "Needs Practice"}
                    </strong>

                    <span>
                        Overall performance
                    </span>
                </div>

                <div>
                    <strong>
                        ${total}
                    </strong>

                    <span>
                        Questions answered
                    </span>
                </div>

            </div>


            <button
                type="button"
                class="btn btn-primary"
                data-practice-action="restart"
            >
                Practice Again
            </button>

        </div>
    `;


    Storage.set(
        "lastInterviewPractice",
        {
            answers:
                InterviewPractice.answers,

            average,

            completedAt:
                new Date().toISOString()
        }
    );


    updateJobReadyScoreFromInterview(
        average
    );
}


/* ============================================================
   13. INTERVIEW PRACTICE ACTION ROUTER
   ============================================================ */

function initInterviewPracticeActions() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-practice-action]"
                );

            if (!button) return;

            const action =
                button.dataset.practiceAction;


            if (action === "submit") {

                submitPracticeAnswer();

                return;
            }


            if (action === "next") {

                if (
                    InterviewPractice.currentIndex <
                    InterviewPractice.questions.length - 1
                ) {

                    InterviewPractice.currentIndex++;

                    renderInterviewPractice();

                } else {

                    finishInterviewPractice();
                }

                return;
            }


            if (action === "skip") {

                InterviewPractice.answers.push({

                    question:
                        InterviewPractice.questions[
                            InterviewPractice.currentIndex
                        ],

                    answer:
                        "",

                    score:
                        0,

                    feedback:
                        "Question skipped.",

                    strengths: [],

                    improvements: [
                        "Practice answering this type of question."
                    ]
                });


                if (
                    InterviewPractice.currentIndex <
                    InterviewPractice.questions.length - 1
                ) {

                    InterviewPractice.currentIndex++;

                    renderInterviewPractice();

                } else {

                    finishInterviewPractice();
                }

                return;
            }


            if (action === "restart") {

                startInterviewPractice();

            }
        }
    );
}


/* ============================================================
   14. START PRACTICE BUTTON
   ============================================================ */

function initInterviewPractice() {

    const button =
        get("startInterviewPractice");

    if (!button) return;

    button.addEventListener(
        "click",
        startInterviewPractice
    );

    initInterviewPracticeActions();
}


/* ============================================================
   15. JOB READY SCORE INTERVIEW UPDATE
   ============================================================ */

function updateJobReadyScoreFromInterview(
    interviewScore
) {

    const current =
        Storage.get(
            "jobReadyScore",
            null
        );

    if (!current) return;

    current.interview =
        interviewScore;

    current.updatedAt =
        new Date().toISOString();

    Storage.set(
        "jobReadyScore",
        current
    );
}


/* ============================================================
   16. AI CAREER ASSISTANT
   ============================================================ */

const CareerAssistant = {

    messages: [],

    initialized: false
};


/* ============================================================
   17. CAREER ASSISTANT KNOWLEDGE
   ============================================================ */

function getCareerAssistantResponse(
    userMessage
) {

    const resume =
        getCurrentResume();

    const text =
        normalizeText(
            userMessage
        );


    const skills =
        getResumeSkills(
            resume
        );


    const role =
        resume?.personal
            ?.professionalTitle ||
        "your target career";


    if (
        text.includes("resume") &&
        (
            text.includes("improve") ||
            text.includes("better")
        )
    ) {

        return `To improve your resume, focus on three areas: ATS-friendly keywords, measurable achievements and clear skill alignment with the target job. Your current profile appears to be oriented toward ${role}. Add specific project results wherever possible.`;
    }


    if (
        text.includes("job") &&
        (
            text.includes("find") ||
            text.includes("search")
        )
    ) {

        return `Start by choosing 2–3 target job roles instead of applying randomly. Then compare each job description with your skills, customize your resume keywords and prepare a matching cover letter.`;
    }


    if (
        text.includes("skill") &&
        (
            text.includes("learn") ||
            text.includes("improve")
        )
    ) {

        const currentSkills =
            skills.length
                ? skills.slice(0, 6).join(", ")
                : "your current skills";

        return `Based on your current profile, you already have ${currentSkills}. The next step is to identify the skills repeatedly requested in your target job descriptions and prioritize the most relevant gaps.`;
    }


    if (
        text.includes("interview")
    ) {

        return `For interview preparation, practice your introduction, strengths, project explanations, problem-solving examples and questions related to the target role. Use the STAR structure for behavioral questions: Situation, Task, Action and Result.`;
    }


    if (
        text.includes("linkedin")
    ) {

        return `A strong LinkedIn profile should have a clear headline, focused About section, relevant skills, projects and measurable achievements. Keep your headline aligned with the role you actually want.`;
    }


    if (
        text.includes("career") &&
        (
            text.includes("roadmap") ||
            text.includes("plan")
        )
    ) {

        return `Build your career roadmap in stages: choose a target role, identify required skills, learn the highest-priority skills, build practical projects, improve your resume and LinkedIn profile, then apply and practice interviews.`;
    }


    if (
        text.includes("salary")
    ) {

        return `When discussing salary, consider the role, location, experience, skills and current market range. During an interview, you can communicate a reasonable range while remaining open to discussing the complete compensation package.`;
    }


    if (
        text.includes("cover letter")
    ) {

        return `A good cover letter should be customized for the company and role. Mention why you are interested, which relevant strengths you bring and how your background connects to the position.`;
    }


    return `I can help you with resumes, ATS optimization, job matching, cover letters, LinkedIn profiles, interview preparation, skill gaps and career planning. Tell me what you are currently trying to achieve and I will help you break it into practical steps.`;
}


/* ============================================================
   18. ADD CAREER ASSISTANT MESSAGE
   ============================================================ */

function addCareerAssistantMessage(
    role,
    text
) {

    CareerAssistant.messages.push({

        role,

        text,

        createdAt:
            new Date().toISOString()
    });


    if (
        CareerAssistant.messages.length >
        30
    ) {

        CareerAssistant.messages =
            CareerAssistant.messages.slice(-30);
    }


    Storage.set(
        "careerAssistantMessages",
        CareerAssistant.messages
    );
}


/* ============================================================
   19. RENDER CAREER ASSISTANT
   ============================================================ */

function renderCareerAssistant() {

    const output =
        get("careerAssistantMessages");

    if (!output) return;


    output.innerHTML =
        CareerAssistant.messages
            .map(message => {

                const isUser =
                    message.role === "user";

                return `

                    <div
                        class="
                            assistant-message
                            ${isUser
                                ? "user-message"
                                : "ai-message"}
                        "
                    >

                        <div class="assistant-avatar">

                            ${
                                isUser
                                    ? `<i class="fa-solid fa-user"></i>`
                                    : `<i class="fa-solid fa-sparkles"></i>`
                            }

                        </div>

                        <div class="assistant-message-content">

                            <div class="assistant-message-role">
                                ${
                                    isUser
                                        ? "You"
                                        : "Career Assistant"
                                }
                            </div>

                            <div class="assistant-message-text">
                                ${escapeHTML(
                                    message.text
                                ).replace(
                                    /\n/g,
                                    "<br>"
                                )}
                            </div>

                        </div>

                    </div>
                `;
            })
            .join("");


    output.scrollTop =
        output.scrollHeight;
}


/* ============================================================
   20. SEND CAREER ASSISTANT MESSAGE
   ============================================================ */

function sendCareerAssistantMessage() {

    const input =
        get("careerAssistantInput");

    if (!input) return;

    const message =
        input.value.trim();

    if (!message) {

        showToast(
            "Type a message first.",
            "warning"
        );

        return;
    }


    addCareerAssistantMessage(
        "user",
        message
    );


    input.value = "";

    renderCareerAssistant();


    setTimeout(
        () => {

            const response =
                getCareerAssistantResponse(
                    message
                );

            addCareerAssistantMessage(
                "assistant",
                response
            );

            renderCareerAssistant();

        },
        350
    );
}


/* ============================================================
   21. CAREER ASSISTANT INITIALIZATION
   ============================================================ */

function initCareerAssistant() {

    const sendButton =
        get("sendCareerAssistant");

    const input =
        get("careerAssistantInput");


    CareerAssistant.messages =
        Storage.get(
            "careerAssistantMessages",
            []
        );


    if (
        !Array.isArray(
            CareerAssistant.messages
        )
    ) {

        CareerAssistant.messages =
            [];
    }


    if (
        !CareerAssistant.messages.length
    ) {

        addCareerAssistantMessage(
            "assistant",
            "Hi! I’m your Career Assistant. I can help with resumes, ATS optimization, job matching, interviews, LinkedIn, skills and career planning."
        );
    }


    renderCareerAssistant();


    if (sendButton) {

        sendButton.addEventListener(
            "click",
            sendCareerAssistantMessage
        );
    }


    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter" &&
                    !event.shiftKey
                ) {

                    event.preventDefault();

                    sendCareerAssistantMessage();
                }
            }
        );
    }


    CareerAssistant.initialized =
        true;
}


/* ============================================================
   22. QUICK CAREER ASSISTANT QUESTIONS
   ============================================================ */

function initCareerAssistantQuickQuestions() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-assistant-question]"
                );

            if (!button) return;

            const question =
                button.dataset.assistantQuestion;

            const input =
                get("careerAssistantInput");

            if (!input) return;

            input.value =
                question;

            input.focus();
        }
    );
}


/* ============================================================
   23. INTERVIEW PREP RESTORE
   ============================================================ */

function restoreInterviewPreparation() {

    const saved =
        Storage.get(
            "lastInterviewPreparation",
            null
        );

    if (
        !saved ||
        !get("interviewPrepOutput")
    ) {
        return;
    }


    const resume =
        getCurrentResume();

    const data =
        saved.data || {};

    const questions =
        saved.questions || [];


    if (!questions.length) return;


    const output =
        get("interviewPrepOutput");


    output.innerHTML = `

        <div class="interview-prep-result">

            <div class="interview-result-header">

                <div>

                    <span class="tool-label">
                        Previous Preparation
                    </span>

                    <h3>
                        ${escapeHTML(
                            data.role ||
                            "Interview"
                        )}
                    </h3>

                </div>

            </div>

            <div class="interview-question-list">

                ${questions.map(
                    (question, index) => {

                        const answer =
                            generateInterviewAnswer(
                                question,
                                resume
                            );

                        return `

                            <div
                                class="interview-question-card"
                            >

                                <div class="question-number">
                                    ${index + 1}
                                </div>

                                <div class="question-content">

                                    <h4>
                                        ${escapeHTML(
                                            question
                                        )}
                                    </h4>

                                    <div class="suggested-answer">

                                        <strong>
                                            Suggested Answer
                                        </strong>

                                        <p>
                                            ${escapeHTML(
                                                answer
                                            )}
                                        </p>

                                    </div>

                                </div>

                            </div>

                        `;
                    }
                ).join("")}

            </div>

        </div>
    `;
}


/* ============================================================
   24. INITIALIZE PART 5
   ============================================================ */

function initializeAIToolsPart5() {

    initInterviewPreparation();

    initInterviewPractice();

    initCareerAssistant();

    initCareerAssistantQuickQuestions();

    restoreInterviewPreparation();

    console.log(
        "Interview & Career Assistant tools initialized."
    );
}


/* ============================================================
   25. DOM READY
   ============================================================ */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeAIToolsPart5
    );

} else {

    initializeAIToolsPart5();
}


/* ============================================================
   END OF JAVASCRIPT PART 5
   NEXT:
   PART 6 →
   Dashboard
   Multiple Resumes
   Resume Versions
   Public Resume
   Portfolio Generator
   QR / Share
   ============================================================ */

// ============================================================
// YOUR RESUME.AI
// MAIN.JS — LIVE CODE PART 6
// DASHBOARD
// MULTIPLE RESUMES
// RESUME VERSION HISTORY
// PUBLIC RESUME
// PORTFOLIO GENERATOR
// QR / SHARE
// ============================================================


/* ============================================================
   1. DASHBOARD STATE
   ============================================================ */

const DashboardState = {

    initialized: false,

    currentTab: "overview",

    applications: [],

    activities: []
};


/* ============================================================
   2. DASHBOARD DEFAULT DATA
   ============================================================ */

function getDefaultDashboardData() {

    return {

        applications: [],

        activities: [],

        stats: {

            resumesCreated: 0,

            applications: 0,

            interviews: 0,

            profileViews: 0,

            savedJobs: 0
        }
    };
}


/* ============================================================
   3. LOAD DASHBOARD DATA
   ============================================================ */

function getDashboardData() {

    const saved =
        Storage.get(
            "dashboardData",
            null
        );

    if (!saved) {

        const defaults =
            getDefaultDashboardData();

        Storage.set(
            "dashboardData",
            defaults
        );

        return defaults;
    }

    return saved;
}


/* ============================================================
   4. SAVE DASHBOARD DATA
   ============================================================ */

function saveDashboardData(data) {

    Storage.set(
        "dashboardData",
        data
    );
}


/* ============================================================
   5. ADD DASHBOARD ACTIVITY
   ============================================================ */

function addDashboardActivity(
    type,
    title,
    description = ""
) {

    const data =
        getDashboardData();

    data.activities =
        data.activities || [];


    data.activities.unshift({

        id:
            createId("activity"),

        type,

        title,

        description,

        createdAt:
            new Date().toISOString()
    });


    data.activities =
        data.activities.slice(0, 30);


    saveDashboardData(data);
}


/* ============================================================
   6. DASHBOARD STATISTICS
   ============================================================ */

function calculateDashboardStats() {

    const data =
        getDashboardData();

    const resumes =
        Storage.get(
            "resumes",
            []
        );


    const versions =
        Storage.get(
            "resumeVersions",
            []
        );


    const applications =
        data.applications || [];


    const savedJobs =
        Storage.get(
            "savedJobs",
            []
        );


    return {

        resumesCreated:
            Array.isArray(resumes)
                ? resumes.length
                : 0,

        versions:
            Array.isArray(versions)
                ? versions.length
                : 0,

        applications:
            applications.length,

        interviews:
            applications.filter(
                item =>
                    normalizeText(
                        item.status
                    ).includes("interview")
            ).length,

        profileViews:
            Number(
                Storage.get(
                    "publicProfileViews",
                    0
                )
            ),

        savedJobs:
            Array.isArray(savedJobs)
                ? savedJobs.length
                : 0
    };
}


/* ============================================================
   7. UPDATE DASHBOARD STATS
   ============================================================ */

function updateDashboardStats() {

    const stats =
        calculateDashboardStats();


    const mappings = {

        dashboardResumeCount:
            stats.resumesCreated,

        dashboardApplicationCount:
            stats.applications,

        dashboardInterviewCount:
            stats.interviews,

        dashboardProfileViews:
            stats.profileViews,

        dashboardSavedJobs:
            stats.savedJobs,

        totalResumeCount:
            stats.resumesCreated,

        totalApplicationCount:
            stats.applications
    };


    Object.entries(
        mappings
    ).forEach(
        ([id, value]) => {

            const element =
                get(id);

            if (element) {

                element.textContent =
                    value;
            }
        }
    );
}


/* ============================================================
   8. RENDER DASHBOARD ACTIVITY
   ============================================================ */

function renderDashboardActivities() {

    const output =
        get("dashboardActivities");

    if (!output) return;


    const data =
        getDashboardData();

    const activities =
        data.activities || [];


    if (!activities.length) {

        output.innerHTML = `
            <div class="tool-empty">
                No recent activity yet.
            </div>
        `;

        return;
    }


    output.innerHTML =
        activities
            .slice(0, 10)
            .map(activity => {

                return `

                    <div class="activity-item">

                        <div class="activity-icon">

                            <i class="fa-solid fa-check"></i>

                        </div>

                        <div class="activity-content">

                            <strong>
                                ${escapeHTML(
                                    activity.title
                                )}
                            </strong>

                            ${
                                activity.description
                                    ? `
                                        <p>
                                            ${escapeHTML(
                                                activity.description
                                            )}
                                        </p>
                                      `
                                    : ""
                            }

                            <small>
                                ${formatRelativeTime(
                                    activity.createdAt
                                )}
                            </small>

                        </div>

                    </div>
                `;
            })
            .join("");
}


/* ============================================================
   9. RELATIVE TIME
   ============================================================ */

function formatRelativeTime(
    dateString
) {

    const date =
        new Date(dateString);

    const now =
        new Date();

    const seconds =
        Math.floor(
            (now - date) / 1000
        );


    if (seconds < 60) {

        return "Just now";
    }


    const minutes =
        Math.floor(
            seconds / 60
        );

    if (minutes < 60) {

        return `${minutes} min ago`;
    }


    const hours =
        Math.floor(
            minutes / 60
        );

    if (hours < 24) {

        return `${hours} hr ago`;
    }


    const days =
        Math.floor(
            hours / 24
        );

    if (days < 30) {

        return `${days} day${days > 1 ? "s" : ""} ago`;
    }


    return date.toLocaleDateString();
}


/* ============================================================
   10. MULTIPLE RESUME STORAGE
   ============================================================ */

function getAllResumes() {

    const resumes =
        Storage.get(
            "resumes",
            []
        );

    return Array.isArray(
        resumes
    )
        ? resumes
        : [];
}


/* ============================================================
   11. SAVE RESUME TO COLLECTION
   ============================================================ */

function saveResumeToCollection(
    resume,
    createVersion = true
) {

    if (!resume) return null;


    const resumes =
        getAllResumes();


    if (!resume.id) {

        resume.id =
            createId("resume");
    }


    resume.updatedAt =
        new Date().toISOString();


    const index =
        resumes.findIndex(
            item =>
                item.id === resume.id
        );


    if (index >= 0) {

        resumes[index] =
            resume;

    } else {

        resumes.push(
            resume
        );
    }


    Storage.set(
        "resumes",
        resumes
    );


    Storage.set(
        "currentResumeId",
        resume.id
    );


    if (createVersion) {

        createResumeVersion(
            resume,
            "Manual save"
        );
    }


    updateDashboardStats();


    return resume;
}


/* ============================================================
   12. CREATE NEW RESUME
   ============================================================ */

function createNewResumeProfile(
    name = "Untitled Resume"
) {

    const resume =
        createEmptyResume();

    resume.id =
        createId("resume");

    resume.name =
        name;

    resume.title =
        name;

    resume.createdAt =
        new Date().toISOString();

    resume.updatedAt =
        new Date().toISOString();


    const resumes =
        getAllResumes();

    resumes.push(
        resume
    );


    Storage.set(
        "resumes",
        resumes
    );

    Storage.set(
        "currentResumeId",
        resume.id
    );


    setCurrentResume(
        resume
    );


    addDashboardActivity(
        "resume",
        "New resume created",
        name
    );


    updateDashboardStats();


    showToast(
        "New resume created.",
        "success"
    );


    return resume;
}


/* ============================================================
   13. DELETE RESUME
   ============================================================ */

function deleteResumeProfile(
    resumeId
) {

    if (!resumeId) return;


    const resumes =
        getAllResumes();


    if (resumes.length <= 1) {

        showToast(
            "Keep at least one resume in your account.",
            "warning"
        );

        return;
    }


    const updated =
        resumes.filter(
            resume =>
                resume.id !== resumeId
        );


    Storage.set(
        "resumes",
        updated
    );


    if (
        Storage.get(
            "currentResumeId",
            ""
        ) === resumeId
    ) {

        Storage.set(
            "currentResumeId",
            updated[0].id
        );

        setCurrentResume(
            updated[0]
        );
    }


    addDashboardActivity(
        "resume",
        "Resume deleted"
    );


    updateDashboardStats();

    renderResumeManager();

    showToast(
        "Resume deleted.",
        "success"
    );
}


/* ============================================================
   14. DUPLICATE RESUME
   ============================================================ */

function duplicateResumeProfile(
    resumeId
) {

    const resumes =
        getAllResumes();


    const original =
        resumes.find(
            resume =>
                resume.id === resumeId
        );


    if (!original) return;


    const copy =
        JSON.parse(
            JSON.stringify(
                original
            )
        );


    copy.id =
        createId("resume");

    copy.name =
        `${original.name || "Resume"} Copy`;

    copy.title =
        copy.name;

    copy.createdAt =
        new Date().toISOString();

    copy.updatedAt =
        new Date().toISOString();


    resumes.push(
        copy
    );


    Storage.set(
        "resumes",
        resumes
    );


    addDashboardActivity(
        "resume",
        "Resume duplicated",
        copy.name
    );


    updateDashboardStats();

    renderResumeManager();


    showToast(
        "Resume duplicated.",
        "success"
    );
}


/* ============================================================
   15. SWITCH RESUME
   ============================================================ */

function switchResumeProfile(
    resumeId
) {

    const resumes =
        getAllResumes();


    const resume =
        resumes.find(
            item =>
                item.id === resumeId
        );


    if (!resume) return;


    Storage.set(
        "currentResumeId",
        resumeId
    );


    setCurrentResume(
        resume
    );


    loadResumeIntoBuilder(
        resume
    );


    addDashboardActivity(
        "resume",
        "Resume switched",
        resume.name
    );


    renderResumeManager();

    updateLivePreview();


    showToast(
        `${resume.name} selected.`,
        "success"
    );
}


/* ============================================================
   16. RENDER RESUME MANAGER
   ============================================================ */

function renderResumeManager() {

    const output =
        get("resumeManagerList");

    if (!output) return;


    const resumes =
        getAllResumes();


    const currentId =
        Storage.get(
            "currentResumeId",
            ""
        );


    if (!resumes.length) {

        output.innerHTML = `
            <div class="tool-empty">
                No resumes created yet.
            </div>
        `;

        return;
    }


    output.innerHTML =
        resumes
            .map(resume => {

                const isCurrent =
                    resume.id === currentId;


                const name =
                    resume.name ||
                    resume.personal?.fullName ||
                    "Untitled Resume";


                const title =
                    resume.personal
                        ?.professionalTitle ||
                    "Professional Resume";


                return `

                    <div
                        class="
                            resume-manager-card
                            ${isCurrent
                                ? "active"
                                : ""}
                        "
                    >

                        <div class="resume-manager-icon">

                            <i class="fa-solid fa-file-lines"></i>

                        </div>

                        <div class="resume-manager-info">

                            <h3>
                                ${escapeHTML(name)}
                            </h3>

                            <p>
                                ${escapeHTML(title)}
                            </p>

                            <small>
                                Updated
                                ${
                                    resume.updatedAt
                                        ? formatRelativeTime(
                                            resume.updatedAt
                                          )
                                        : "recently"
                                }
                            </small>

                        </div>


                        <div class="resume-manager-actions">

                            ${
                                !isCurrent
                                    ? `
                                        <button
                                            type="button"
                                            class="btn btn-sm btn-primary"
                                            data-resume-action="switch"
                                            data-resume-id="${resume.id}"
                                        >
                                            Use
                                        </button>
                                      `
                                    : `
                                        <span class="active-badge">
                                            Current
                                        </span>
                                      `
                            }


                            <button
                                type="button"
                                class="btn btn-sm btn-secondary"
                                data-resume-action="duplicate"
                                data-resume-id="${resume.id}"
                            >
                                Duplicate
                            </button>


                            <button
                                type="button"
                                class="btn btn-sm btn-danger"
                                data-resume-action="delete"
                                data-resume-id="${resume.id}"
                            >
                                Delete
                            </button>

                        </div>

                    </div>
                `;
            })
            .join("");
}


/* ============================================================
   17. RESUME MANAGER ACTIONS
   ============================================================ */

function initResumeManagerActions() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-resume-action]"
                );

            if (!button) return;


            const action =
                button.dataset.resumeAction;

            const resumeId =
                button.dataset.resumeId;


            if (action === "switch") {

                switchResumeProfile(
                    resumeId
                );
            }


            if (action === "duplicate") {

                duplicateResumeProfile(
                    resumeId
                );
            }


            if (action === "delete") {

                const confirmed =
                    window.confirm(
                        "Delete this resume?"
                    );

                if (confirmed) {

                    deleteResumeProfile(
                        resumeId
                    );
                }
            }
        }
    );
}


/* ============================================================
   18. RESUME VERSION HISTORY
   ============================================================ */

function getResumeVersions() {

    const versions =
        Storage.get(
            "resumeVersions",
            []
        );

    return Array.isArray(
        versions
    )
        ? versions
        : [];
}


/* ============================================================
   19. CREATE RESUME VERSION
   ============================================================ */

function createResumeVersion(
    resume,
    label = "Saved version"
) {

    if (!resume) return;


    const versions =
        getResumeVersions();


    const snapshot =
        JSON.parse(
            JSON.stringify(
                resume
            )
        );


    const version = {

        id:
            createId("version"),

        resumeId:
            resume.id,

        label,

        resume:
            snapshot,

        createdAt:
            new Date().toISOString()
    };


    versions.unshift(
        version
    );


    Storage.set(
        "resumeVersions",
        versions.slice(0, 50)
    );


    return version;
}


/* ============================================================
   20. RENDER VERSION HISTORY
   ============================================================ */

function renderVersionHistory() {

    const output =
        get("versionHistoryList");

    if (!output) return;


    const current =
        getCurrentResume();


    const versions =
        getResumeVersions()
            .filter(
                version =>
                    !current?.id ||
                    version.resumeId === current.id
            );


    if (!versions.length) {

        output.innerHTML = `
            <div class="tool-empty">
                No saved versions yet.
            </div>
        `;

        return;
    }


    output.innerHTML =
        versions
            .map(
                (version, index) => {

                    return `

                        <div class="version-history-item">

                            <div class="version-number">
                                ${index + 1}
                            </div>

                            <div class="version-info">

                                <h4>
                                    ${escapeHTML(
                                        version.label
                                    )}
                                </h4>

                                <p>
                                    ${new Date(
                                        version.createdAt
                                    ).toLocaleString()}
                                </p>

                            </div>

                            <div class="version-actions">

                                <button
                                    type="button"
                                    class="btn btn-sm btn-secondary"
                                    data-version-action="restore"
                                    data-version-id="${version.id}"
                                >
                                    Restore
                                </button>

                                <button
                                    type="button"
                                    class="btn btn-sm btn-danger"
                                    data-version-action="delete"
                                    data-version-id="${version.id}"
                                >
                                    Delete
                                </button>

                            </div>

                        </div>
                    `;
                }
            )
            .join("");
}


/* ============================================================
   21. RESTORE RESUME VERSION
   ============================================================ */

function restoreResumeVersion(
    versionId
) {

    const versions =
        getResumeVersions();


    const version =
        versions.find(
            item =>
                item.id === versionId
        );


    if (!version) return;


    const restored =
        JSON.parse(
            JSON.stringify(
                version.resume
            )
        );


    restored.updatedAt =
        new Date().toISOString();


    saveResumeToCollection(
        restored,
        false
    );


    setCurrentResume(
        restored
    );


    loadResumeIntoBuilder(
        restored
    );


    updateLivePreview();


    addDashboardActivity(
        "version",
        "Resume version restored",
        version.label
    );


    renderVersionHistory();


    showToast(
        "Resume version restored.",
        "success"
    );
}


/* ============================================================
   22. DELETE VERSION
   ============================================================ */

function deleteResumeVersion(
    versionId
) {

    const versions =
        getResumeVersions()
            .filter(
                version =>
                    version.id !== versionId
            );


    Storage.set(
        "resumeVersions",
        versions
    );


    renderVersionHistory();


    showToast(
        "Version deleted.",
        "success"
    );
}


/* ============================================================
   23. VERSION ACTIONS
   ============================================================ */

function initVersionHistoryActions() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-version-action]"
                );

            if (!button) return;


            const action =
                button.dataset.versionAction;

            const id =
                button.dataset.versionId;


            if (action === "restore") {

                restoreResumeVersion(
                    id
                );
            }


            if (action === "delete") {

                if (
                    window.confirm(
                        "Delete this saved version?"
                    )
                ) {

                    deleteResumeVersion(
                        id
                    );
                }
            }
        }
    );
}


/* ============================================================
   24. PUBLIC RESUME STATE
   ============================================================ */

function getPublicResumeData() {

    return Storage.get(
        "publicResume",
        {
            enabled: false,

            slug: "",

            views: 0,

            createdAt: null,

            updatedAt: null,

            resumeId: null
        }
    );
}


/* ============================================================
   25. GENERATE PUBLIC SLUG
   ============================================================ */

function generatePublicSlug(
    resume
) {

    const name =
        resume?.personal?.fullName ||
        "resume";

    const clean =
        normalizeText(
            name
        )
        .replace(
            /[^a-z0-9]+/g,
            "-"
        )
        .replace(
            /^-+|-+$/g,
            ""
        );


    return `${clean || "resume"}-${Math.random()
        .toString(36)
        .substring(2, 8)}`;
}


/* ============================================================
   26. ENABLE PUBLIC RESUME
   ============================================================ */

function enablePublicResume() {

    const resume =
        getCurrentResume();

    if (!resume) {

        showToast(
            "Create a resume first.",
            "warning"
        );

        return;
    }


    const existing =
        getPublicResumeData();


    const publicResume = {

        enabled: true,

        slug:
            existing.slug ||
            generatePublicSlug(
                resume
            ),

        views:
            existing.views || 0,

        createdAt:
            existing.createdAt ||
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString(),

        resumeId:
            resume.id,

        resume:
            JSON.parse(
                JSON.stringify(
                    resume
                )
            )
    };


    Storage.set(
        "publicResume",
        publicResume
    );


    addDashboardActivity(
        "public",
        "Public resume enabled"
    );


    renderPublicResumeSettings();


    showToast(
        "Public resume link created.",
        "success"
    );
}


/* ============================================================
   27. DISABLE PUBLIC RESUME
   ============================================================ */

function disablePublicResume() {

    const data =
        getPublicResumeData();


    data.enabled =
        false;

    data.updatedAt =
        new Date().toISOString();


    Storage.set(
        "publicResume",
        data
    );


    renderPublicResumeSettings();


    showToast(
        "Public resume disabled.",
        "success"
    );
}


/* ============================================================
   28. GET PUBLIC RESUME URL
   ============================================================ */

function getPublicResumeURL() {

    const data =
        getPublicResumeData();


    if (!data.enabled) {

        return "";
    }


    const base =
        window.location.origin +
        window.location.pathname;


    return `${base}?resume=${encodeURIComponent(
        data.slug
    )}`;
}


/* ============================================================
   29. RENDER PUBLIC RESUME SETTINGS
   ============================================================ */

function renderPublicResumeSettings() {

    const data =
        getPublicResumeData();


    const link =
        getPublicResumeURL();


    const linkElements = [
        get("publicResumeLink"),
        get("publicProfileLink")
    ];


    linkElements.forEach(
        element => {

            if (!element) return;

            if (element.tagName === "INPUT") {

                element.value =
                    link;

            } else {

                element.textContent =
                    link ||
                    "Public link disabled.";
            }
        }
    );


    const status =
        get("publicResumeStatus");

    if (status) {

        status.textContent =
            data.enabled
                ? "Public"
                : "Private";


        status.classList.toggle(
            "active",
            data.enabled
        );
    }


    const views =
        get("publicResumeViews");

    if (views) {

        views.textContent =
            data.views || 0;
    }
}


/* ============================================================
   30. COPY PUBLIC LINK
   ============================================================ */

async function copyPublicResumeLink() {

    const link =
        getPublicResumeURL();


    if (!link) {

        showToast(
            "Enable your public resume first.",
            "warning"
        );

        return;
    }


    try {

        await navigator.clipboard.writeText(
            link
        );

        showToast(
            "Public resume link copied.",
            "success"
        );

    } catch (error) {

        showToast(
            "Unable to copy link.",
            "error"
        );
    }
}


/* ============================================================
   31. SHARE PUBLIC RESUME
   ============================================================ */

async function sharePublicResume() {

    const link =
        getPublicResumeURL();


    if (!link) {

        showToast(
            "Enable your public resume first.",
            "warning"
        );

        return;
    }


    const resume =
        getCurrentResume();


    const shareData = {

        title:
            resume?.personal?.fullName
                ? `${resume.personal.fullName} – Resume`
                : "My Resume",

        text:
            "Check out my professional resume.",

        url:
            link
    };


    if (
        navigator.share
    ) {

        try {

            await navigator.share(
                shareData
            );

        } catch (error) {

            if (
                error.name !==
                "AbortError"
            ) {

                await copyPublicResumeLink();
            }
        }

    } else {

        await copyPublicResumeLink();
    }
}


/* ============================================================
   32. PUBLIC RESUME ACTIONS
   ============================================================ */

function initPublicResumeActions() {

    const enable =
        get("enablePublicResume");

    const disable =
        get("disablePublicResume");

    const copy =
        get("copyPublicResume");

    const share =
        get("sharePublicResume");


    if (enable) {

        enable.addEventListener(
            "click",
            enablePublicResume
        );
    }


    if (disable) {

        disable.addEventListener(
            "click",
            disablePublicResume
        );
    }


    if (copy) {

        copy.addEventListener(
            "click",
            copyPublicResumeLink
        );
    }


    if (share) {

        share.addEventListener(
            "click",
            sharePublicResume
        );
    }


    renderPublicResumeSettings();
}


/* ============================================================
   33. PUBLIC RESUME VIEW
   ============================================================ */

function renderPublicResumeView(
    resume
) {

    const output =
        get("publicResumeViewer");

    if (!output) return;


    const personal =
        resume.personal || {};


    output.innerHTML = `

        <div class="public-resume-card">

            ${
                personal.photo
                    ? `
                        <img
                            class="public-resume-photo"
                            src="${escapeHTML(
                                personal.photo
                            )}"
                            alt="Profile"
                        >
                      `
                    : ""
            }


            <h1>
                ${escapeHTML(
                    personal.fullName ||
                    "Professional"
                )}
            </h1>


            <h2>
                ${escapeHTML(
                    personal.professionalTitle ||
                    ""
                )}
            </h2>


            ${
                personal.location
                    ? `
                        <p>
                            <i class="fa-solid fa-location-dot"></i>
                            ${escapeHTML(
                                personal.location
                            )}
                        </p>
                      `
                    : ""
            }


            ${
                personal.summary
                    ? `
                        <section>
                            <h3>Profile</h3>

                            <p>
                                ${escapeHTML(
                                    personal.summary
                                )}
                            </p>
                        </section>
                      `
                    : ""
            }


            ${renderPublicEducation(
                resume.education
            )}


            ${renderPublicExperience(
                resume.experience
            )}


            ${renderPublicProjects(
                resume.projects
            )}


            ${renderPublicSkills(
                resume.skills
            )}


            ${renderPublicCertifications(
                resume.certifications
            )}

        </div>
    `;
}


/* ============================================================
   34. PUBLIC EDUCATION
   ============================================================ */

function renderPublicEducation(
    items = []
) {

    if (!Array.isArray(items) ||
        !items.length
    ) {

        return "";
    }


    return `

        <section>

            <h3>
                Education
            </h3>

            ${items.map(item => `

                <div class="public-resume-item">

                    <strong>
                        ${escapeHTML(
                            item.degree ||
                            item.course ||
                            ""
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            item.institution ||
                            item.school ||
                            ""
                        )}
                    </span>

                </div>

            `).join("")}

        </section>
    `;
}


/* ============================================================
   35. PUBLIC EXPERIENCE
   ============================================================ */

function renderPublicExperience(
    items = []
) {

    if (!Array.isArray(items) ||
        !items.length
    ) {

        return "";
    }


    return `

        <section>

            <h3>
                Experience
            </h3>

            ${items.map(item => `

                <div class="public-resume-item">

                    <strong>
                        ${escapeHTML(
                            item.position ||
                            item.role ||
                            ""
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            item.company ||
                            ""
                        )}
                    </span>

                    ${
                        item.description
                            ? `
                                <p>
                                    ${escapeHTML(
                                        item.description
                                    )}
                                </p>
                              `
                            : ""
                    }

                </div>

            `).join("")}

        </section>
    `;
}


/* ============================================================
   36. PUBLIC PROJECTS
   ============================================================ */

function renderPublicProjects(
    items = []
) {

    if (!Array.isArray(items) ||
        !items.length
    ) {

        return "";
    }


    return `

        <section>

            <h3>
                Projects
            </h3>

            ${items.map(item => `

                <div class="public-resume-item">

                    <strong>
                        ${escapeHTML(
                            item.name ||
                            ""
                        )}
                    </strong>

                    ${
                        item.description
                            ? `
                                <p>
                                    ${escapeHTML(
                                        item.description
                                    )}
                                </p>
                              `
                            : ""
                    }

                </div>

            `).join("")}

        </section>
    `;
}


/* ============================================================
   37. PUBLIC SKILLS
   ============================================================ */

function renderPublicSkills(
    skills = []
) {

    const list =
        getResumeSkills({
            skills
        });


    if (!list.length) {

        return "";
    }


    return `

        <section>

            <h3>
                Skills
            </h3>

            <div class="public-skill-list">

                ${list.map(skill =>
                    `<span>
                        ${escapeHTML(skill)}
                    </span>`
                ).join("")}

            </div>

        </section>
    `;
}


/* ============================================================
   38. PUBLIC CERTIFICATIONS
   ============================================================ */

function renderPublicCertifications(
    items = []
) {

    if (!Array.isArray(items) ||
        !items.length
    ) {

        return "";
    }


    return `

        <section>

            <h3>
                Certifications
            </h3>

            ${items.map(item => `

                <div class="public-resume-item">

                    <strong>
                        ${escapeHTML(
                            item.name ||
                            item.title ||
                            ""
                        )}
                    </strong>

                    <span>
                        ${escapeHTML(
                            item.issuer ||
                            ""
                        )}
                    </span>

                </div>

            `).join("")}

        </section>
    `;
}


/* ============================================================
   39. PUBLIC PORTFOLIO DATA
   ============================================================ */

function getPortfolioData() {

    return Storage.get(
        "portfolioData",
        {

            enabled: false,

            slug: "",

            theme: "modern",

            title: "",

            tagline: "",

            bio: "",

            projects: [],

            links: {},

            updatedAt: null
        }
    );
}


/* ============================================================
   40. GENERATE PORTFOLIO
   ============================================================ */

function generatePortfolio() {

    const resume =
        getCurrentResume();


    if (!resume) {

        showToast(
            "Create a resume first.",
            "warning"
        );

        return;
    }


    const personal =
        resume.personal || {};


    const portfolio = {

        enabled: true,

        slug:
            generatePublicSlug(
                resume
            ),

        theme:
            getSelectedValue(
                "portfolioTheme",
                "modern"
            ),

        title:
            getValue(
                "portfolioTitle"
            ) ||
            personal.fullName ||
            "My Portfolio",

        tagline:
            getValue(
                "portfolioTagline"
            ) ||
            personal.professionalTitle ||
            "Professional Portfolio",

        bio:
            getValue(
                "portfolioBio"
            ) ||
            personal.summary ||
            "",

        projects:
            resume.projects || [],

        links: {

            website:
                personal.website || "",

            linkedin:
                personal.linkedin || "",

            github:
                personal.github || ""
        },

        updatedAt:
            new Date().toISOString()
    };


    Storage.set(
        "portfolioData",
        portfolio
    );


    renderPortfolioPreview(
        portfolio,
        resume
    );


    addDashboardActivity(
        "portfolio",
        "Portfolio generated"
    );


    showToast(
        "Portfolio generated.",
        "success"
    );
}


/* ============================================================
   41. PORTFOLIO PREVIEW
   ============================================================ */

function renderPortfolioPreview(
    portfolio,
    resume
) {

    const output =
        get("portfolioPreview");

    if (!output) return;


    const personal =
        resume.personal || {};


    output.innerHTML = `

        <div
            class="
                portfolio-preview
                portfolio-theme-${escapeHTML(
                    portfolio.theme
                )}
            "
        >

            <div class="portfolio-hero">

                ${
                    personal.photo
                        ? `
                            <img
                                src="${escapeHTML(
                                    personal.photo
                                )}"
                                alt="Profile"
                            >
                          `
                        : ""
                }


                <span>
                    ${escapeHTML(
                        portfolio.tagline
                    )}
                </span>


                <h2>
                    ${escapeHTML(
                        portfolio.title
                    )}
                </h2>


                ${
                    portfolio.bio
                        ? `
                            <p>
                                ${escapeHTML(
                                    portfolio.bio
                                )}
                            </p>
                          `
                        : ""
                }

            </div>


            ${
                portfolio.projects.length
                    ? `
                        <div class="portfolio-projects">

                            <h3>
                                Selected Projects
                            </h3>

                            <div class="portfolio-project-grid">

                                ${portfolio.projects
                                    .map(
                                        project => `

                                            <article>

                                                <h4>
                                                    ${escapeHTML(
                                                        project.name ||
                                                        project.title ||
                                                        "Project"
                                                    )}
                                                </h4>

                                                <p>
                                                    ${escapeHTML(
                                                        project.description ||
                                                        ""
                                                    )}
                                                </p>

                                            </article>

                                        `
                                    )
                                    .join("")}

                            </div>

                        </div>
                      `
                    : ""
            }


            <div class="portfolio-links">

                ${
                    portfolio.links.linkedin
                        ? `
                            <a
                                href="${escapeHTML(
                                    portfolio.links.linkedin
                                )}"
                                target="_blank"
                                rel="noopener"
                            >
                                LinkedIn
                            </a>
                          `
                        : ""
                }


                ${
                    portfolio.links.github
                        ? `
                            <a
                                href="${escapeHTML(
                                    portfolio.links.github
                                )}"
                                target="_blank"
                                rel="noopener"
                            >
                                GitHub
                            </a>
                          `
                        : ""
                }


                ${
                    portfolio.links.website
                        ? `
                            <a
                                href="${escapeHTML(
                                    portfolio.links.website
                                )}"
                                target="_blank"
                                rel="noopener"
                            >
                                Website
                            </a>
                          `
                        : ""
                }

            </div>

        </div>
    `;
}


/* ============================================================
   42. PORTFOLIO INITIALIZATION
   ============================================================ */

function initPortfolioGenerator() {

    const button =
        get("generatePortfolio");

    if (!button) return;


    button.addEventListener(
        "click",
        generatePortfolio
    );


    const saved =
        getPortfolioData();


    const resume =
        getCurrentResume();


    if (
        saved.enabled &&
        resume
    ) {

        renderPortfolioPreview(
            saved,
            resume
        );
    }
}


/* ============================================================
   43. QR CODE GENERATOR
   ============================================================ */

function generateQRCode(
    text,
    container
) {

    if (!container) return;


    container.innerHTML = "";


    if (
        typeof QRCode ===
        "undefined"
    ) {

        container.innerHTML = `

            <div class="tool-empty">

                <p>
                    QR generator library is not loaded.
                </p>

                <small>
                    Add a QRCode library before deployment.
                </small>

            </div>
        `;

        return;
    }


    try {

        new QRCode(
            container,
            {
                text,
                width: 180,
                height: 180
            }
        );

    } catch (error) {

        container.innerHTML = `
            <div class="tool-empty">
                Unable to generate QR code.
            </div>
        `;
    }
}


/* ============================================================
   44. PUBLIC RESUME QR
   ============================================================ */

function generatePublicResumeQR() {

    const link =
        getPublicResumeURL();


    if (!link) {

        showToast(
            "Enable your public resume first.",
            "warning"
        );

        return;
    }


    const container =
        get("resumeQRCode");


    if (!container) return;


    generateQRCode(
        link,
        container
    );


    showToast(
        "QR code generated.",
        "success"
    );
}


/* ============================================================
   45. PORTFOLIO QR
   ============================================================ */

function generatePortfolioQR() {

    const portfolio =
        getPortfolioData();


    if (!portfolio.enabled) {

        showToast(
            "Generate your portfolio first.",
            "warning"
        );

        return;
    }


    const url =
        `${window.location.origin}${window.location.pathname}?portfolio=${encodeURIComponent(
            portfolio.slug
        )}`;


    const container =
        get("portfolioQRCode");


    if (!container) return;


    generateQRCode(
        url,
        container
    );


    showToast(
        "Portfolio QR code generated.",
        "success"
    );
}


/* ============================================================
   46. QR BUTTONS
   ============================================================ */

function initQRTools() {

    const resumeQR =
        get("generateResumeQR");

    const portfolioQR =
        get("generatePortfolioQR");


    if (resumeQR) {

        resumeQR.addEventListener(
            "click",
            generatePublicResumeQR
        );
    }


    if (portfolioQR) {

        portfolioQR.addEventListener(
            "click",
            generatePortfolioQR
        );
    }
}


/* ============================================================
   47. DASHBOARD REFRESH
   ============================================================ */

function refreshDashboard() {

    updateDashboardStats();

    renderDashboardActivities();

    renderResumeManager();

    renderVersionHistory();

    renderPublicResumeSettings();


    const resume =
        getCurrentResume();


    const portfolio =
        getPortfolioData();


    if (
        resume &&
        portfolio.enabled
    ) {

        renderPortfolioPreview(
            portfolio,
            resume
        );
    }
}


/* ============================================================
   48. DASHBOARD INITIALIZATION
   ============================================================ */

function initializeDashboardTools() {

    initResumeManagerActions();

    initVersionHistoryActions();

    initPublicResumeActions();

    initPortfolioGenerator();

    initQRTools();

    refreshDashboard();


    DashboardState.initialized =
        true;


    console.log(
        "Dashboard tools initialized."
    );
}


/* ============================================================
   49. AUTO REFRESH AFTER RESUME SAVE
   ============================================================ */

document.addEventListener(
    "resume:saved",
    () => {

        refreshDashboard();
    }
);


/* ============================================================
   50. DOM READY
   ============================================================ */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeDashboardTools
    );

} else {

    initializeDashboardTools();
}


/* ============================================================
   END OF JAVASCRIPT PART 6
   NEXT:
   PART 7 →
   Career Explorer
   Job Search
   Job Details
   Courses
   Certifications
   Career Quiz
   Career Comparison
   Interview Question Bank
   Career Resources
   ============================================================ */

// ============================================================
// YOUR RESUME.AI
// MAIN.JS — LIVE CODE PART 7
// CAREER EXPLORER
// JOB SEARCH
// JOB DETAILS
// COURSES
// CERTIFICATIONS
// CAREER QUIZ
// CAREER COMPARISON
// INTERVIEW QUESTION BANK
// CAREER RESOURCES
// ============================================================


/* ============================================================
   1. CAREER DATABASE
   ============================================================ */

const CAREER_DATABASE = [

    {
        id: "frontend-developer",
        title: "Frontend Developer",
        category: "Technology",
        level: "Entry Level",
        salary: "₹3L – ₹8L",
        skills: [
            "HTML",
            "CSS",
            "JavaScript",
            "Git",
            "Responsive Design"
        ],
        description:
            "Build responsive and interactive websites and web applications.",
        roadmap: [
            "HTML & CSS",
            "JavaScript",
            "Git & GitHub",
            "Responsive Design",
            "Frontend Framework",
            "Build Projects",
            "Apply for Jobs"
        ]
    },

    {
        id: "backend-developer",
        title: "Backend Developer",
        category: "Technology",
        level: "Entry Level",
        salary: "₹4L – ₹10L",
        skills: [
            "Programming",
            "APIs",
            "Databases",
            "Node.js",
            "Python",
            "Git"
        ],
        description:
            "Develop server-side applications, APIs and database systems.",
        roadmap: [
            "Programming Fundamentals",
            "Databases",
            "Backend Language",
            "REST APIs",
            "Authentication",
            "Projects",
            "Job Preparation"
        ]
    },

    {
        id: "full-stack-developer",
        title: "Full Stack Developer",
        category: "Technology",
        level: "Entry / Mid Level",
        salary: "₹5L – ₹12L",
        skills: [
            "HTML",
            "CSS",
            "JavaScript",
            "Frontend",
            "Backend",
            "Database",
            "Git"
        ],
        description:
            "Work across frontend, backend and database layers of web applications.",
        roadmap: [
            "HTML & CSS",
            "JavaScript",
            "Frontend Framework",
            "Backend",
            "Database",
            "Authentication",
            "Deployment"
        ]
    },

    {
        id: "data-analyst",
        title: "Data Analyst",
        category: "Data",
        level: "Entry Level",
        salary: "₹4L – ₹9L",
        skills: [
            "Excel",
            "SQL",
            "Python",
            "Statistics",
            "Data Visualization"
        ],
        description:
            "Analyze data and create insights to support business decisions.",
        roadmap: [
            "Excel",
            "Statistics",
            "SQL",
            "Python",
            "Data Visualization",
            "Projects",
            "Portfolio"
        ]
    },

    {
        id: "ui-ux-designer",
        title: "UI/UX Designer",
        category: "Design",
        level: "Entry Level",
        salary: "₹3L – ₹8L",
        skills: [
            "Figma",
            "UI Design",
            "UX Research",
            "Wireframing",
            "Prototyping"
        ],
        description:
            "Design intuitive user interfaces and digital experiences.",
        roadmap: [
            "Design Fundamentals",
            "UX Research",
            "Wireframes",
            "Figma",
            "Prototypes",
            "Portfolio",
            "Apply"
        ]
    },

    {
        id: "digital-marketer",
        title: "Digital Marketing Executive",
        category: "Marketing",
        level: "Entry Level",
        salary: "₹2.5L – ₹7L",
        skills: [
            "SEO",
            "Social Media",
            "Content Marketing",
            "Analytics",
            "Email Marketing"
        ],
        description:
            "Plan and execute digital marketing campaigns across online channels.",
        roadmap: [
            "Marketing Basics",
            "SEO",
            "Social Media",
            "Content",
            "Analytics",
            "Campaign Projects",
            "Job Search"
        ]
    },

    {
        id: "customer-support",
        title: "Customer Support Executive",
        category: "Customer Service",
        level: "Entry Level",
        salary: "₹2L – ₹5L",
        skills: [
            "Communication",
            "Problem Solving",
            "CRM",
            "English",
            "Customer Handling"
        ],
        description:
            "Assist customers, resolve issues and provide product or service support.",
        roadmap: [
            "Communication",
            "Customer Handling",
            "Product Knowledge",
            "CRM Tools",
            "Mock Calls",
            "Resume",
            "Interview"
        ]
    },

    {
        id: "software-tester",
        title: "Software Tester",
        category: "Technology",
        level: "Entry Level",
        salary: "₹3L – ₹8L",
        skills: [
            "Testing",
            "Test Cases",
            "Bug Tracking",
            "SQL",
            "API Testing"
        ],
        description:
            "Test software applications and identify defects before release.",
        roadmap: [
            "Testing Fundamentals",
            "Test Cases",
            "Bug Tracking",
            "SQL",
            "API Testing",
            "Automation Basics",
            "Projects"
        ]
    },

    {
        id: "cloud-engineer",
        title: "Cloud Engineer",
        category: "Technology",
        level: "Mid Level",
        salary: "₹5L – ₹15L",
        skills: [
            "Linux",
            "Networking",
            "Cloud",
            "Security",
            "DevOps"
        ],
        description:
            "Build, deploy and maintain cloud infrastructure and services.",
        roadmap: [
            "Linux",
            "Networking",
            "Cloud Fundamentals",
            "AWS / Azure / GCP",
            "Security",
            "DevOps",
            "Projects"
        ]
    },

    {
        id: "hr-executive",
        title: "HR Executive",
        category: "Human Resources",
        level: "Entry Level",
        salary: "₹2.5L – ₹7L",
        skills: [
            "Communication",
            "Recruitment",
            "Interviewing",
            "HR Operations",
            "Excel"
        ],
        description:
            "Support recruitment, employee operations and HR processes.",
        roadmap: [
            "HR Fundamentals",
            "Recruitment",
            "Interview Skills",
            "HR Operations",
            "Excel",
            "HR Tools",
            "Job Search"
        ]
    },

    {
        id: "business-analyst",
        title: "Business Analyst",
        category: "Business",
        level: "Entry / Mid Level",
        salary: "₹4L – ₹10L",
        skills: [
            "Excel",
            "SQL",
            "Business Analysis",
            "Communication",
            "Data"
        ],
        description:
            "Analyze business requirements and translate them into actionable solutions.",
        roadmap: [
            "Business Fundamentals",
            "Excel",
            "SQL",
            "Requirement Gathering",
            "Documentation",
            "Projects",
            "Interview"
        ]
    }
];


/* ============================================================
   2. COURSE DATABASE
   ============================================================ */

const COURSE_DATABASE = [

    {
        id: "html-css",
        title: "HTML & CSS Fundamentals",
        category: "Web Development",
        level: "Beginner",
        duration: "4–6 Weeks",
        mode: "Online",
        skills: [
            "HTML",
            "CSS",
            "Responsive Design"
        ],
        provider: "Your Resume.ai Learning",
        free: true
    },

    {
        id: "javascript",
        title: "JavaScript Development",
        category: "Web Development",
        level: "Beginner / Intermediate",
        duration: "6–10 Weeks",
        mode: "Online",
        skills: [
            "JavaScript",
            "DOM",
            "APIs",
            "ES6"
        ],
        provider: "Your Resume.ai Learning",
        free: true
    },

    {
        id: "sql",
        title: "SQL for Beginners",
        category: "Data",
        level: "Beginner",
        duration: "3–5 Weeks",
        mode: "Online",
        skills: [
            "SQL",
            "Databases",
            "Queries"
        ],
        provider: "Your Resume.ai Learning",
        free: true
    },

    {
        id: "python",
        title: "Python Programming",
        category: "Programming",
        level: "Beginner",
        duration: "6–10 Weeks",
        mode: "Online",
        skills: [
            "Python",
            "Programming",
            "Problem Solving"
        ],
        provider: "Your Resume.ai Learning",
        free: true
    },

    {
        id: "figma",
        title: "UI/UX Design with Figma",
        category: "Design",
        level: "Beginner",
        duration: "4–6 Weeks",
        mode: "Online",
        skills: [
            "Figma",
            "UI",
            "UX",
            "Prototyping"
        ],
        provider: "Your Resume.ai Learning",
        free: true
    },

    {
        id: "digital-marketing",
        title: "Digital Marketing Fundamentals",
        category: "Marketing",
        level: "Beginner",
        duration: "4–8 Weeks",
        mode: "Online",
        skills: [
            "SEO",
            "Social Media",
            "Analytics"
        ],
        provider: "Your Resume.ai Learning",
        free: true
    },

    {
        id: "testing",
        title: "Software Testing Fundamentals",
        category: "Software Testing",
        level: "Beginner",
        duration: "5–8 Weeks",
        mode: "Online",
        skills: [
            "Manual Testing",
            "Test Cases",
            "Bug Tracking"
        ],
        provider: "Your Resume.ai Learning",
        free: true
    },

    {
        id: "communication",
        title: "Professional Communication",
        category: "Soft Skills",
        level: "Beginner",
        duration: "3–4 Weeks",
        mode: "Online",
        skills: [
            "English",
            "Communication",
            "Interview Skills"
        ],
        provider: "Your Resume.ai Learning",
        free: true
    }
];


/* ============================================================
   3. JOB DATABASE
   ============================================================ */

const JOB_DATABASE = [

    {
        id: "job-001",
        title: "Junior Frontend Developer",
        company: "Tech Solutions",
        location: "Kolkata, India",
        mode: "Hybrid",
        experience: "0–2 Years",
        salary: "₹3L – ₹5L",
        skills: [
            "HTML",
            "CSS",
            "JavaScript",
            "Git"
        ],
        type: "Full Time",
        description:
            "Build responsive web interfaces and collaborate with designers and backend developers."
    },

    {
        id: "job-002",
        title: "Customer Support Executive",
        company: "Service Hub",
        location: "Kolkata, India",
        mode: "Work From Office",
        experience: "0–1 Year",
        salary: "₹2L – ₹4L",
        skills: [
            "Communication",
            "English",
            "Customer Handling"
        ],
        type: "Full Time",
        description:
            "Handle customer queries and provide support through calls, chat and email."
    },

    {
        id: "job-003",
        title: "Junior Data Analyst",
        company: "DataWorks",
        location: "Remote",
        mode: "Remote",
        experience: "0–2 Years",
        salary: "₹4L – ₹7L",
        skills: [
            "Excel",
            "SQL",
            "Python",
            "Data Analysis"
        ],
        type: "Full Time",
        description:
            "Analyze datasets and prepare reports and dashboards for business teams."
    },

    {
        id: "job-004",
        title: "Software Testing Trainee",
        company: "Quality Labs",
        location: "Kolkata, India",
        mode: "Hybrid",
        experience: "Fresher",
        salary: "₹2.5L – ₹4L",
        skills: [
            "Manual Testing",
            "Test Cases",
            "Bug Tracking"
        ],
        type: "Full Time",
        description:
            "Execute test cases, report bugs and support the quality assurance team."
    },

    {
        id: "job-005",
        title: "Digital Marketing Executive",
        company: "Growth Media",
        location: "Remote",
        mode: "Remote",
        experience: "0–2 Years",
        salary: "₹2.5L – ₹5L",
        skills: [
            "SEO",
            "Social Media",
            "Content",
            "Analytics"
        ],
        type: "Full Time",
        description:
            "Assist with SEO, social media campaigns and digital marketing analytics."
    },

    {
        id: "job-006",
        title: "Junior UI/UX Designer",
        company: "Creative Studio",
        location: "Bengaluru, India",
        mode: "Hybrid",
        experience: "0–2 Years",
        salary: "₹3L – ₹6L",
        skills: [
            "Figma",
            "UI Design",
            "UX Research",
            "Prototyping"
        ],
        type: "Full Time",
        description:
            "Create user interfaces, wireframes and prototypes for digital products."
    }
];


/* ============================================================
   4. RESOURCE DATABASE
   ============================================================ */

const CAREER_RESOURCES = [

    {
        id: "resume-guide",
        title: "Resume Building Guide",
        category: "Resume",
        icon: "fa-file-lines",
        description:
            "Learn how to structure an ATS-friendly resume and present your achievements clearly."
    },

    {
        id: "interview-guide",
        title: "Interview Preparation Guide",
        category: "Interview",
        icon: "fa-comments",
        description:
            "Prepare for HR, behavioral and role-specific interview questions."
    },

    {
        id: "linkedin-guide",
        title: "LinkedIn Profile Guide",
        category: "Career Branding",
        icon: "fa-linkedin",
        description:
            "Improve your LinkedIn headline, About section, skills and professional presence."
    },

    {
        id: "job-search-guide",
        title: "Job Search Strategy",
        category: "Job Search",
        icon: "fa-magnifying-glass",
        description:
            "Build a focused job search strategy and track your applications."
    },

    {
        id: "skills-guide",
        title: "Skill Development Guide",
        category: "Skills",
        icon: "fa-bolt",
        description:
            "Identify important skills and create a practical learning plan."
    },

    {
        id: "career-roadmap-guide",
        title: "Career Roadmap Guide",
        category: "Career",
        icon: "fa-road",
        description:
            "Plan your next career steps from learning to job readiness."
    }
];


/* ============================================================
   5. CAREER EXPLORER
   ============================================================ */

function renderCareerExplorer(
    careers = CAREER_DATABASE
) {

    const output =
        get("careerExplorerGrid");

    if (!output) return;


    if (!careers.length) {

        output.innerHTML = `
            <div class="tool-empty">
                No career found.
            </div>
        `;

        return;
    }


    output.innerHTML =
        careers
            .map(career => `

                <article
                    class="career-card"
                    data-career-id="${career.id}"
                >

                    <div class="career-card-icon">

                        <i class="fa-solid fa-briefcase"></i>

                    </div>


                    <span class="career-category">
                        ${escapeHTML(
                            career.category
                        )}
                    </span>


                    <h3>
                        ${escapeHTML(
                            career.title
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            career.description
                        )}
                    </p>


                    <div class="career-meta">

                        <span>
                            ${escapeHTML(
                                career.level
                            )}
                        </span>

                        <span>
                            ${escapeHTML(
                                career.salary
                            )}
                        </span>

                    </div>


                    <div class="career-skill-tags">

                        ${career.skills
                            .slice(0, 4)
                            .map(skill =>
                                `<span>
                                    ${escapeHTML(skill)}
                                </span>`
                            )
                            .join("")}

                    </div>


                    <button
                        type="button"
                        class="btn btn-primary btn-sm"
                        data-career-action="details"
                        data-career-id="${career.id}"
                    >
                        Explore Career
                    </button>

                </article>

            `)
            .join("");
}


/* ============================================================
   6. CAREER SEARCH / FILTER
   ============================================================ */

function filterCareers() {

    const query =
        normalizeText(
            getValue(
                "careerSearch"
            )
        );

    const category =
        normalizeText(
            getSelectedValue(
                "careerCategory",
                "all"
            )
        );


    const filtered =
        CAREER_DATABASE.filter(
            career => {

                const matchesQuery =
                    !query ||
                    normalizeText(
                        career.title
                    ).includes(query) ||
                    normalizeText(
                        career.category
                    ).includes(query) ||
                    career.skills.some(
                        skill =>
                            normalizeText(
                                skill
                            ).includes(query)
                    );


                const matchesCategory =
                    category === "all" ||
                    !category ||
                    normalizeText(
                        career.category
                    ) === category;


                return (
                    matchesQuery &&
                    matchesCategory
                );
            }
        );


    renderCareerExplorer(
        filtered
    );
}


/* ============================================================
   7. CAREER DETAILS MODAL
   ============================================================ */

function showCareerDetails(
    careerId
) {

    const career =
        CAREER_DATABASE.find(
            item =>
                item.id === careerId
        );


    if (!career) return;


    const modal =
        get("careerDetailsModal");

    if (!modal) return;


    const content =
        modal.querySelector(
            ".modal-content"
        ) ||
        modal;


    content.innerHTML = `

        <div class="modal-header">

            <div>

                <span class="career-category">
                    ${escapeHTML(
                        career.category
                    )}
                </span>

                <h2>
                    ${escapeHTML(
                        career.title
                    )}
                </h2>

            </div>

            <button
                type="button"
                class="modal-close"
                data-modal-close
            >
                ×
            </button>

        </div>


        <div class="modal-body">

            <p>
                ${escapeHTML(
                    career.description
                )}
            </p>


            <div class="career-detail-grid">

                <div>
                    <strong>
                        Level
                    </strong>

                    <span>
                        ${escapeHTML(
                            career.level
                        )}
                    </span>
                </div>


                <div>
                    <strong>
                        Salary Range
                    </strong>

                    <span>
                        ${escapeHTML(
                            career.salary
                        )}
                    </span>
                </div>

            </div>


            <h3>
                Required Skills
            </h3>

            <div class="career-skill-tags">

                ${career.skills
                    .map(skill =>
                        `<span>
                            ${escapeHTML(skill)}
                        </span>`
                    )
                    .join("")}

            </div>


            <h3>
                Career Roadmap
            </h3>

            <div class="career-roadmap-mini">

                ${career.roadmap
                    .map(
                        (step, index) => `

                            <div>

                                <span>
                                    ${index + 1}
                                </span>

                                <p>
                                    ${escapeHTML(
                                        step
                                    )}
                                </p>

                            </div>
                        `
                    )
                    .join("")}

            </div>


            <button
                type="button"
                class="btn btn-primary"
                data-career-action="use"
                data-career-id="${career.id}"
            >
                Use This Career
            </button>

        </div>
    `;


    openModal(
        "careerDetailsModal"
    );
}


/* ============================================================
   8. USE CAREER AS TARGET
   ============================================================ */

function useCareerTarget(
    careerId
) {

    const career =
        CAREER_DATABASE.find(
            item =>
                item.id === careerId
        );


    if (!career) return;


    const resume =
        getCurrentResume();


    if (resume) {

        resume.personal =
            resume.personal || {};

        resume.personal
            .professionalTitle =
            career.title;


        saveResumeToCollection(
            resume,
            false
        );


        setCurrentResume(
            resume
        );


        loadResumeIntoBuilder(
            resume
        );

        updateLivePreview();
    }


    setValue(
        "interviewRole",
        career.title
    );


    setValue(
        "linkedinTargetRole",
        career.title
    );


    addDashboardActivity(
        "career",
        "Career selected",
        career.title
    );


    closeAllModals();


    showToast(
        `${career.title} selected as your target career.`,
        "success"
    );
}


/* ============================================================
   9. CAREER ACTION ROUTER
   ============================================================ */

function initCareerActions() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-career-action]"
                );

            if (!button) return;


            const action =
                button.dataset.careerAction;

            const careerId =
                button.dataset.careerId;


            if (action === "details") {

                showCareerDetails(
                    careerId
                );
            }


            if (action === "use") {

                useCareerTarget(
                    careerId
                );
            }
        }
    );
}


/* ============================================================
   10. CAREER FILTER INITIALIZATION
   ============================================================ */

function initCareerExplorer() {

    renderCareerExplorer();


    const search =
        get("careerSearch");

    const category =
        get("careerCategory");


    if (search) {

        search.addEventListener(
            "input",
            filterCareers
        );
    }


    if (category) {

        category.addEventListener(
            "change",
            filterCareers
        );
    }


    initCareerActions();
}


/* ============================================================
   11. JOB SEARCH
   ============================================================ */

function searchJobs() {

    const query =
        normalizeText(
            getValue(
                "jobSearchInput"
            )
        );


    const location =
        normalizeText(
            getValue(
                "jobLocationInput"
            )
        );


    const mode =
        normalizeText(
            getSelectedValue(
                "jobModeFilter",
                "all"
            )
        );


    const filtered =
        JOB_DATABASE.filter(
            job => {

                const searchable = [
                    job.title,
                    job.company,
                    job.location,
                    job.description,
                    ...job.skills
                ]
                    .map(normalizeText)
                    .join(" ");


                const matchesQuery =
                    !query ||
                    searchable.includes(
                        query
                    );


                const matchesLocation =
                    !location ||
                    normalizeText(
                        job.location
                    ).includes(
                        location
                    );


                const matchesMode =
                    mode === "all" ||
                    !mode ||
                    normalizeText(
                        job.mode
                    ) === mode;


                return (
                    matchesQuery &&
                    matchesLocation &&
                    matchesMode
                );
            }
        );


    renderJobResults(
        filtered
    );
}


/* ============================================================
   12. RENDER JOB RESULTS
   ============================================================ */

function renderJobResults(
    jobs = JOB_DATABASE
) {

    const output =
        get("jobResultsGrid");

    if (!output) return;


    if (!jobs.length) {

        output.innerHTML = `
            <div class="tool-empty">
                No jobs matched your search.
            </div>
        `;

        return;
    }


    const savedJobs =
        Storage.get(
            "savedJobs",
            []
        );


    output.innerHTML =
        jobs.map(job => {

            const saved =
                savedJobs.includes(
                    job.id
                );


            return `

                <article
                    class="job-card"
                    data-job-id="${job.id}"
                >

                    <div class="job-card-top">

                        <div class="job-company-icon">
                            <i class="fa-solid fa-building"></i>
                        </div>

                        <button
                            type="button"
                            class="
                                job-save-btn
                                ${saved ? "saved" : ""}
                            "
                            data-job-action="save"
                            data-job-id="${job.id}"
                            aria-label="Save job"
                        >
                            <i class="
                                fa-${saved
                                    ? "solid"
                                    : "regular"}
                                fa-heart
                            "></i>
                        </button>

                    </div>


                    <span class="job-type">
                        ${escapeHTML(
                            job.type
                        )}
                    </span>


                    <h3>
                        ${escapeHTML(
                            job.title
                        )}
                    </h3>


                    <p class="job-company">
                        ${escapeHTML(
                            job.company
                        )}
                    </p>


                    <div class="job-meta">

                        <span>
                            <i class="fa-solid fa-location-dot"></i>
                            ${escapeHTML(
                                job.location
                            )}
                        </span>

                        <span>
                            <i class="fa-solid fa-briefcase"></i>
                            ${escapeHTML(
                                job.experience
                            )}
                        </span>

                    </div>


                    <div class="job-salary">
                        ${escapeHTML(
                            job.salary
                        )}
                    </div>


                    <div class="job-skills">

                        ${job.skills
                            .slice(0, 4)
                            .map(skill =>
                                `<span>
                                    ${escapeHTML(skill)}
                                </span>`
                            )
                            .join("")}

                    </div>


                    <button
                        type="button"
                        class="btn btn-primary btn-sm"
                        data-job-action="details"
                        data-job-id="${job.id}"
                    >
                        View Job
                    </button>

                </article>
            `;
        }).join("");
}


/* ============================================================
   13. SAVE JOB
   ============================================================ */

function toggleSavedJob(
    jobId
) {

    let savedJobs =
        Storage.get(
            "savedJobs",
            []
        );


    if (!Array.isArray(
        savedJobs
    )) {

        savedJobs = [];
    }


    const index =
        savedJobs.indexOf(
            jobId
        );


    if (index >= 0) {

        savedJobs.splice(
            index,
            1
        );

        showToast(
            "Job removed from saved jobs.",
            "info"
        );

    } else {

        savedJobs.push(
            jobId
        );

        showToast(
            "Job saved.",
            "success"
        );
    }


    Storage.set(
        "savedJobs",
        savedJobs
    );


    updateDashboardStats();

    searchJobs();
}


/* ============================================================
   14. JOB DETAILS
   ============================================================ */

function showJobDetails(
    jobId
) {

    const job =
        JOB_DATABASE.find(
            item =>
                item.id === jobId
        );


    if (!job) return;


    const modal =
        get("jobDetailsModal");

    if (!modal) return;


    const content =
        modal.querySelector(
            ".modal-content"
        ) ||
        modal;


    content.innerHTML = `

        <div class="modal-header">

            <div>

                <span class="job-type">
                    ${escapeHTML(
                        job.type
                    )}
                </span>

                <h2>
                    ${escapeHTML(
                        job.title
                    )}
                </h2>

                <p>
                    ${escapeHTML(
                        job.company
                    )}
                </p>

            </div>


            <button
                type="button"
                class="modal-close"
                data-modal-close
            >
                ×
            </button>

        </div>


        <div class="modal-body">

            <div class="job-detail-grid">

                <div>
                    <strong>
                        Location
                    </strong>

                    <span>
                        ${escapeHTML(
                            job.location
                        )}
                    </span>
                </div>


                <div>
                    <strong>
                        Work Mode
                    </strong>

                    <span>
                        ${escapeHTML(
                            job.mode
                        )}
                    </span>
                </div>


                <div>
                    <strong>
                        Experience
                    </strong>

                    <span>
                        ${escapeHTML(
                            job.experience
                        )}
                    </span>
                </div>


                <div>
                    <strong>
                        Salary
                    </strong>

                    <span>
                        ${escapeHTML(
                            job.salary
                        )}
                    </span>
                </div>

            </div>


            <h3>
                Job Description
            </h3>

            <p>
                ${escapeHTML(
                    job.description
                )}
            </p>


            <h3>
                Required Skills
            </h3>

            <div class="job-skills">

                ${job.skills
                    .map(skill =>
                        `<span>
                            ${escapeHTML(skill)}
                        </span>`
                    )
                    .join("")}

            </div>


            <div class="job-detail-actions">

                <button
                    type="button"
                    class="btn btn-primary"
                    data-job-action="apply"
                    data-job-id="${job.id}"
                >
                    Apply / Track Application
                </button>

                <button
                    type="button"
                    class="btn btn-secondary"
                    data-job-action="match"
                    data-job-id="${job.id}"
                >
                    Match My Resume
                </button>

            </div>

        </div>
    `;


    openModal(
        "jobDetailsModal"
    );
}


/* ============================================================
   15. JOB APPLICATION TRACKER
   ============================================================ */

function addJobApplication(
    job
) {

    const data =
        getDashboardData();


    data.applications =
        data.applications || [];


    const existing =
        data.applications.find(
            item =>
                item.jobId === job.id
        );


    if (existing) {

        showToast(
            "This job is already in your tracker.",
            "info"
        );

        return;
    }


    data.applications.unshift({

        id:
            createId("application"),

        jobId:
            job.id,

        title:
            job.title,

        company:
            job.company,

        location:
            job.location,

        status:
            "Applied",

        appliedAt:
            new Date().toISOString(),

        updatedAt:
            new Date().toISOString()
    });


    saveDashboardData(
        data
    );


    addDashboardActivity(
        "application",
        "Job application added",
        `${job.title} – ${job.company}`
    );


    updateDashboardStats();


    showToast(
        "Application added to tracker.",
        "success"
    );
}


/* ============================================================
   16. JOB RESUME MATCH
   ============================================================ */

function calculateJobMatch(
    job
) {

    const resume =
        getCurrentResume();


    const resumeSkills =
        getResumeSkills(
            resume
        ).map(
            normalizeText
        );


    const required =
        job.skills.map(
            normalizeText
        );


    const matched =
        required.filter(
            skill =>
                resumeSkills.some(
                    userSkill =>
                        userSkill.includes(
                            skill
                        ) ||
                        skill.includes(
                            userSkill
                        )
                )
        );


    const missing =
        required.filter(
            skill =>
                !matched.includes(
                    skill
                )
        );


    const score =
        required.length
            ? Math.round(
                (
                    matched.length /
                    required.length
                ) * 100
              )
            : 0;


    return {

        score,

        matched,

        missing
    };
}


/* ============================================================
   17. SHOW JOB MATCH
   ============================================================ */

function showJobMatch(
    jobId
) {

    const job =
        JOB_DATABASE.find(
            item =>
                item.id === jobId
        );


    if (!job) return;


    const result =
        calculateJobMatch(
            job
        );


    showToast(
        `Resume match: ${result.score}%`,
        result.score >= 70
            ? "success"
            : "warning"
    );


    const modal =
        get("jobDetailsModal");


    if (!modal) return;


    const content =
        modal.querySelector(
            ".modal-content"
        ) ||
        modal;


    content.innerHTML = `

        <div class="modal-header">

            <div>

                <span>
                    Resume Match
                </span>

                <h2>
                    ${escapeHTML(
                        job.title
                    )}
                </h2>

            </div>

            <button
                type="button"
                class="modal-close"
                data-modal-close
            >
                ×
            </button>

        </div>


        <div class="modal-body">

            <div class="job-match-score">

                <strong>
                    ${result.score}%
                </strong>

                <span>
                    Skill Match
                </span>

            </div>


            <h3>
                Matched Skills
            </h3>

            <div class="job-skills">

                ${
                    result.matched.length
                        ? result.matched
                            .map(
                                skill =>
                                    `<span>
                                        ${escapeHTML(
                                            skill
                                        )}
                                    </span>`
                            )
                            .join("")
                        : "<p>No direct matches found.</p>"
                }

            </div>


            <h3>
                Skills to Improve
            </h3>

            <div class="job-skills">

                ${
                    result.missing.length
                        ? result.missing
                            .map(
                                skill =>
                                    `<span>
                                        ${escapeHTML(
                                            skill
                                        )}
                                    </span>`
                            )
                            .join("")
                        : "<p>Your resume contains the listed skills.</p>"
                }

            </div>

        </div>
    `;


    openModal(
        "jobDetailsModal"
    );
}


/* ============================================================
   18. JOB ACTION ROUTER
   ============================================================ */

function initJobActions() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-job-action]"
                );

            if (!button) return;


            const action =
                button.dataset.jobAction;

            const jobId =
                button.dataset.jobId;


            const job =
                JOB_DATABASE.find(
                    item =>
                        item.id === jobId
                );


            if (!job) return;


            if (action === "save") {

                toggleSavedJob(
                    jobId
                );

                return;
            }


            if (action === "details") {

                showJobDetails(
                    jobId
                );

                return;
            }


            if (action === "apply") {

                addJobApplication(
                    job
                );

                return;
            }


            if (action === "match") {

                showJobMatch(
                    jobId
                );
            }
        }
    );
}


/* ============================================================
   19. JOB SEARCH INITIALIZATION
   ============================================================ */

function initJobSearch() {

    renderJobResults();


    const searchButton =
        get("searchJobsBtn");


    if (searchButton) {

        searchButton.addEventListener(
            "click",
            searchJobs
        );
    }


    const input =
        get("jobSearchInput");


    if (input) {

        input.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    searchJobs();
                }
            }
        );
    }


    const location =
        get("jobLocationInput");


    if (location) {

        location.addEventListener(
            "keydown",
            event => {

                if (
                    event.key === "Enter"
                ) {

                    searchJobs();
                }
            }
        );
    }


    initJobActions();
}


/* ============================================================
   20. COURSE EXPLORER
   ============================================================ */

function renderCourses(
    courses = COURSE_DATABASE
) {

    const output =
        get("courseExplorerGrid");

    if (!output) return;


    if (!courses.length) {

        output.innerHTML = `
            <div class="tool-empty">
                No courses found.
            </div>
        `;

        return;
    }


    const savedCourses =
        Storage.get(
            "savedCourses",
            []
        );


    output.innerHTML =
        courses.map(course => {

            const saved =
                savedCourses.includes(
                    course.id
                );


            return `

                <article class="course-card">

                    <div class="course-card-icon">

                        <i class="fa-solid fa-graduation-cap"></i>

                    </div>


                    <span class="course-category">
                        ${escapeHTML(
                            course.category
                        )}
                    </span>


                    <h3>
                        ${escapeHTML(
                            course.title
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            course.provider
                        )}
                    </p>


                    <div class="course-meta">

                        <span>
                            ${escapeHTML(
                                course.level
                            )}
                        </span>

                        <span>
                            ${escapeHTML(
                                course.duration
                            )}
                        </span>

                    </div>


                    <div class="course-skills">

                        ${course.skills
                            .map(skill =>
                                `<span>
                                    ${escapeHTML(
                                        skill
                                    )}
                                </span>`
                            )
                            .join("")}

                    </div>


                    <div class="course-actions">

                        <button
                            type="button"
                            class="btn btn-primary btn-sm"
                            data-course-action="view"
                            data-course-id="${course.id}"
                        >
                            View Course
                        </button>


                        <button
                            type="button"
                            class="
                                btn btn-sm
                                ${saved
                                    ? "btn-success"
                                    : "btn-secondary"}
                            "
                            data-course-action="save"
                            data-course-id="${course.id}"
                        >
                            ${
                                saved
                                    ? "Saved"
                                    : "Save"
                            }
                        </button>

                    </div>

                </article>
            `;
        }).join("");
}


/* ============================================================
   21. COURSE SEARCH
   ============================================================ */

function filterCourses() {

    const query =
        normalizeText(
            getValue(
                "courseSearch"
            )
        );


    const category =
        normalizeText(
            getSelectedValue(
                "courseCategory",
                "all"
            )
        );


    const filtered =
        COURSE_DATABASE.filter(
            course => {

                const text = [
                    course.title,
                    course.category,
                    course.level,
                    ...course.skills
                ]
                    .map(normalizeText)
                    .join(" ");


                return (
                    (!query ||
                        text.includes(query)) &&

                    (
                        category === "all" ||
                        !category ||
                        normalizeText(
                            course.category
                        ) === category
                    )
                );
            }
        );


    renderCourses(
        filtered
    );
}


/* ============================================================
   22. SAVE COURSE
   ============================================================ */

function toggleSavedCourse(
    courseId
) {

    let saved =
        Storage.get(
            "savedCourses",
            []
        );


    if (!Array.isArray(saved)) {

        saved = [];
    }


    const index =
        saved.indexOf(
            courseId
        );


    if (index >= 0) {

        saved.splice(
            index,
            1
        );

        showToast(
            "Course removed.",
            "info"
        );

    } else {

        saved.push(
            courseId
        );

        showToast(
            "Course saved.",
            "success"
        );
    }


    Storage.set(
        "savedCourses",
        saved
    );


    renderCourses();
}


/* ============================================================
   23. COURSE DETAILS
   ============================================================ */

function showCourseDetails(
    courseId
) {

    const course =
        COURSE_DATABASE.find(
            item =>
                item.id === courseId
        );


    if (!course) return;


    const modal =
        get("courseDetailsModal");


    if (!modal) return;


    const content =
        modal.querySelector(
            ".modal-content"
        ) ||
        modal;


    content.innerHTML = `

        <div class="modal-header">

            <div>

                <span>
                    ${escapeHTML(
                        course.category
                    )}
                </span>

                <h2>
                    ${escapeHTML(
                        course.title
                    )}
                </h2>

            </div>

            <button
                type="button"
                class="modal-close"
                data-modal-close
            >
                ×
            </button>

        </div>


        <div class="modal-body">

            <div class="course-detail-grid">

                <div>
                    <strong>
                        Level
                    </strong>

                    <span>
                        ${escapeHTML(
                            course.level
                        )}
                    </span>
                </div>

                <div>
                    <strong>
                        Duration
                    </strong>

                    <span>
                        ${escapeHTML(
                            course.duration
                        )}
                    </span>
                </div>

                <div>
                    <strong>
                        Mode
                    </strong>

                    <span>
                        ${escapeHTML(
                            course.mode
                        )}
                    </span>
                </div>

                <div>
                    <strong>
                        Provider
                    </strong>

                    <span>
                        ${escapeHTML(
                            course.provider
                        )}
                    </span>
                </div>

            </div>


            <h3>
                Skills Covered
            </h3>

            <div class="course-skills">

                ${course.skills
                    .map(skill =>
                        `<span>
                            ${escapeHTML(
                                skill
                            )}
                        </span>`
                    )
                    .join("")}

            </div>


            <button
                type="button"
                class="btn btn-primary"
                data-course-action="start"
                data-course-id="${course.id}"
            >
                Start Learning
            </button>

        </div>
    `;


    openModal(
        "courseDetailsModal"
    );
}


/* ============================================================
   24. COURSE ACTIONS
   ============================================================ */

function initCourseActions() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-course-action]"
                );

            if (!button) return;


            const action =
                button.dataset.courseAction;

            const id =
                button.dataset.courseId;


            if (action === "save") {

                toggleSavedCourse(
                    id
                );

                return;
            }


            if (action === "view") {

                showCourseDetails(
                    id
                );

                return;
            }


            if (action === "start") {

                const course =
                    COURSE_DATABASE.find(
                        item =>
                            item.id === id
                    );


                if (!course) return;


                addDashboardActivity(
                    "course",
                    "Course started",
                    course.title
                );


                closeAllModals();


                showToast(
                    `${course.title} added to your learning plan.`,
                    "success"
                );
            }
        }
    );
}


/* ============================================================
   25. COURSE INITIALIZATION
   ============================================================ */

function initCourseExplorer() {

    renderCourses();


    const search =
        get("courseSearch");


    const category =
        get("courseCategory");


    if (search) {

        search.addEventListener(
            "input",
            filterCourses
        );
    }


    if (category) {

        category.addEventListener(
            "change",
            filterCourses
        );
    }


    initCourseActions();
}


/* ============================================================
   26. CERTIFICATION TRACKER
   ============================================================ */

function getCertificationData() {

    return Storage.get(
        "certifications",
        []
    );
}


/* ============================================================
   27. ADD CERTIFICATION
   ============================================================ */

function addCertification() {

    const name =
        getValue(
            "certificationName"
        );

    const issuer =
        getValue(
            "certificationIssuer"
        );

    const date =
        getValue(
            "certificationDate"
        );

    const credential =
        getValue(
            "certificationCredential"
        );


    if (!name) {

        showToast(
            "Enter certification name.",
            "warning"
        );

        return;
    }


    const certifications =
        getCertificationData();


    certifications.unshift({

        id:
            createId("cert"),

        name,

        issuer,

        date,

        credential,

        createdAt:
            new Date().toISOString()
    });


    Storage.set(
        "certifications",
        certifications
    );


    renderCertificationTracker();


    addDashboardActivity(
        "certification",
        "Certification added",
        name
    );


    [
        "certificationName",
        "certificationIssuer",
        "certificationDate",
        "certificationCredential"
    ].forEach(
        id =>
            setValue(
                id,
                ""
            )
    );


    showToast(
        "Certification added.",
        "success"
    );
}


/* ============================================================
   28. RENDER CERTIFICATIONS
   ============================================================ */

function renderCertificationTracker() {

    const output =
        get("certificationList");

    if (!output) return;


    const certifications =
        getCertificationData();


    if (!certifications.length) {

        output.innerHTML = `
            <div class="tool-empty">
                No certifications added yet.
            </div>
        `;

        return;
    }


    output.innerHTML =
        certifications.map(cert => `

            <div class="certification-card">

                <div class="certification-icon">

                    <i class="fa-solid fa-certificate"></i>

                </div>


                <div class="certification-info">

                    <h3>
                        ${escapeHTML(
                            cert.name
                        )}
                    </h3>

                    ${
                        cert.issuer
                            ? `
                                <p>
                                    ${escapeHTML(
                                        cert.issuer
                                    )}
                                </p>
                              `
                            : ""
                    }

                    ${
                        cert.date
                            ? `
                                <small>
                                    ${escapeHTML(
                                        cert.date
                                    )}
                                </small>
                              `
                            : ""
                    }

                </div>


                <button
                    type="button"
                    class="btn btn-sm btn-danger"
                    data-cert-action="delete"
                    data-cert-id="${cert.id}"
                >
                    Delete
                </button>

            </div>

        `).join("");
}


/* ============================================================
   29. CERTIFICATION ACTIONS
   ============================================================ */

function initCertificationTracker() {

    const addButton =
        get("addCertificationBtn");


    if (addButton) {

        addButton.addEventListener(
            "click",
            addCertification
        );
    }


    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-cert-action]"
                );

            if (!button) return;


            if (
                button.dataset.certAction ===
                "delete"
            ) {

                const id =
                    button.dataset.certId;


                const updated =
                    getCertificationData()
                        .filter(
                            cert =>
                                cert.id !== id
                        );


                Storage.set(
                    "certifications",
                    updated
                );


                renderCertificationTracker();


                showToast(
                    "Certification deleted.",
                    "success"
                );
            }
        }
    );


    renderCertificationTracker();
}


/* ============================================================
   30. CAREER QUIZ QUESTIONS
   ============================================================ */

const CAREER_QUIZ = [

    {
        id: 1,
        question:
            "Which type of work sounds most interesting to you?",
        options: [
            {
                text: "Building websites or software",
                tags: [
                    "Technology"
                ]
            },
            {
                text: "Working with numbers and data",
                tags: [
                    "Data"
                ]
            },
            {
                text: "Designing creative experiences",
                tags: [
                    "Design"
                ]
            },
            {
                text: "Helping and communicating with people",
                tags: [
                    "Customer Service",
                    "Human Resources"
                ]
            }
        ]
    },

    {
        id: 2,
        question:
            "Which activity do you enjoy most?",
        options: [
            {
                text: "Coding and solving technical problems",
                tags: [
                    "Technology"
                ]
            },
            {
                text: "Finding patterns in information",
                tags: [
                    "Data",
                    "Business"
                ]
            },
            {
                text: "Creating visual designs",
                tags: [
                    "Design"
                ]
            },
            {
                text: "Talking to and helping people",
                tags: [
                    "Customer Service",
                    "Human Resources"
                ]
            }
        ]
    },

    {
        id: 3,
        question:
            "What type of problem do you prefer solving?",
        options: [
            {
                text: "Technical problems",
                tags: [
                    "Technology"
                ]
            },
            {
                text: "Business or data problems",
                tags: [
                    "Data",
                    "Business"
                ]
            },
            {
                text: "User experience problems",
                tags: [
                    "Design"
                ]
            },
            {
                text: "People or communication problems",
                tags: [
                    "Customer Service",
                    "Human Resources"
                ]
            }
        ]
    },

    {
        id: 4,
        question:
            "Which environment sounds best?",
        options: [
            {
                text: "Technology team",
                tags: [
                    "Technology"
                ]
            },
            {
                text: "Analytics or business team",
                tags: [
                    "Data",
                    "Business"
                ]
            },
            {
                text: "Creative team",
                tags: [
                    "Design",
                    "Marketing"
                ]
            },
            {
                text: "People-focused team",
                tags: [
                    "Customer Service",
                    "Human Resources"
                ]
            }
        ]
    },

    {
        id: 5,
        question:
            "Which skill would you most like to develop?",
        options: [
            {
                text: "Programming",
                tags: [
                    "Technology"
                ]
            },
            {
                text: "Data analysis",
                tags: [
                    "Data"
                ]
            },
            {
                text: "Design",
                tags: [
                    "Design"
                ]
            },
            {
                text: "Communication",
                tags: [
                    "Customer Service",
                    "Human Resources"
                ]
            }
        ]
    }
];


/* ============================================================
   31. QUIZ STATE
   ============================================================ */

const CareerQuizState = {

    current: 0,

    answers: [],

    scores: {}
};


/* ============================================================
   32. START QUIZ
   ============================================================ */

function startCareerQuiz() {

    CareerQuizState.current =
        0;

    CareerQuizState.answers =
        [];

    CareerQuizState.scores =
        {};


    renderCareerQuiz();


    openModal(
        "careerQuizModal"
    );
}


/* ============================================================
   33. RENDER QUIZ
   ============================================================ */

function renderCareerQuiz() {

    const output =
        get("careerQuizContent");

    if (!output) return;


    const question =
        CAREER_QUIZ[
            CareerQuizState.current
        ];


    if (!question) {

        finishCareerQuiz();

        return;
    }


    output.innerHTML = `

        <div class="quiz-progress">

            <span>
                Question
                ${CareerQuizState.current + 1}
                of
                ${CAREER_QUIZ.length}
            </span>

            <div class="quiz-progress-bar">

                <span
                    style="
                        width:
                        ${
                            (
                                (
                                    CareerQuizState.current +
                                    1
                                ) /
                                CAREER_QUIZ.length
                            ) * 100
                        }%;
                    "
                ></span>

            </div>

        </div>


        <div class="quiz-question">

            <h2>
                ${escapeHTML(
                    question.question
                )}
            </h2>


            <div class="quiz-options">

                ${question.options
                    .map(
                        (option, index) => `

                            <button
                                type="button"
                                class="quiz-option"
                                data-quiz-option="${index}"
                            >
                                ${escapeHTML(
                                    option.text
                                )}
                            </button>

                        `
                    )
                    .join("")}

            </div>

        </div>
    `;
}


/* ============================================================
   34. QUIZ ANSWER
   ============================================================ */

function answerCareerQuiz(
    optionIndex
) {

    const question =
        CAREER_QUIZ[
            CareerQuizState.current
        ];


    const option =
        question.options[
            optionIndex
        ];


    if (!option) return;


    CareerQuizState.answers.push(
        option
    );


    option.tags.forEach(
        tag => {

            CareerQuizState.scores[tag] =
                (
                    CareerQuizState.scores[tag] ||
                    0
                ) + 1;
        }
    );


    CareerQuizState.current++;


    renderCareerQuiz();
}


/* ============================================================
   35. QUIZ RESULT
   ============================================================ */

function finishCareerQuiz() {

    const output =
        get("careerQuizContent");

    if (!output) return;


    const sorted =
        Object.entries(
            CareerQuizState.scores
        )
        .sort(
            (a, b) =>
                b[1] - a[1]
        );


    const topCategories =
        sorted
            .slice(0, 3)
            .map(
                item =>
                    item[0]
            );


    const recommended =
        CAREER_DATABASE.filter(
            career =>
                topCategories.includes(
                    career.category
                )
        ).slice(0, 5);


    Storage.set(
        "careerQuizResult",
        {
            categories:
                topCategories,

            careers:
                recommended.map(
                    career =>
                        career.id
                ),

            completedAt:
                new Date().toISOString()
        }
    );


    output.innerHTML = `

        <div class="quiz-result">

            <div class="quiz-result-icon">

                <i class="fa-solid fa-compass"></i>

            </div>

            <h2>
                Your Career Directions
            </h2>

            <p>
                Based on your answers, these areas may be worth exploring.
            </p>


            <div class="quiz-category-results">

                ${topCategories
                    .map(
                        category => `

                            <span>
                                ${escapeHTML(
                                    category
                                )}
                            </span>

                        `
                    )
                    .join("")}

            </div>


            <h3>
                Careers to Explore
            </h3>


            <div class="quiz-career-results">

                ${recommended
                    .map(
                        career => `

                            <button
                                type="button"
                                class="quiz-career-item"
                                data-career-action="details"
                                data-career-id="${career.id}"
                            >

                                <strong>
                                    ${escapeHTML(
                                        career.title
                                    )}
                                </strong>

                                <span>
                                    ${escapeHTML(
                                        career.category
                                    )}
                                </span>

                            </button>

                        `
                    )
                    .join("")}

            </div>


            <button
                type="button"
                class="btn btn-primary"
                data-quiz-action="restart"
            >
                Retake Quiz
            </button>

        </div>
    `;
}


/* ============================================================
   36. QUIZ ACTIONS
   ============================================================ */

function initCareerQuiz() {

    const startButton =
        get("startCareerQuiz");


    if (startButton) {

        startButton.addEventListener(
            "click",
            startCareerQuiz
        );
    }


    document.addEventListener(
        "click",
        event => {

            const option =
                event.target.closest(
                    "[data-quiz-option]"
                );


            if (option) {

                answerCareerQuiz(
                    Number(
                        option.dataset.quizOption
                    )
                );

                return;
            }


            const action =
                event.target.closest(
                    "[data-quiz-action]"
                );


            if (
                action &&
                action.dataset.quizAction ===
                "restart"
            ) {

                startCareerQuiz();
            }
        }
    );
}


/* ============================================================
   37. CAREER COMPARISON
   ============================================================ */

function compareCareers() {

    const firstId =
        getSelectedValue(
            "compareCareerOne"
        );


    const secondId =
        getSelectedValue(
            "compareCareerTwo"
        );


    if (
        !firstId ||
        !secondId
    ) {

        showToast(
            "Select two careers to compare.",
            "warning"
        );

        return;
    }


    if (
        firstId === secondId
    ) {

        showToast(
            "Choose two different careers.",
            "warning"
        );

        return;
    }


    const first =
        CAREER_DATABASE.find(
            career =>
                career.id === firstId
        );


    const second =
        CAREER_DATABASE.find(
            career =>
                career.id === secondId
        );


    if (
        !first ||
        !second
    ) return;


    const output =
        get("careerComparisonResult");


    if (!output) return;


    const firstSkills =
        first.skills.map(
            normalizeText
        );


    const secondSkills =
        second.skills.map(
            normalizeText
        );


    const shared =
        first.skills.filter(
            skill =>
                secondSkills.includes(
                    normalizeText(
                        skill
                    )
                )
        );


    output.innerHTML = `

        <div class="career-comparison-table">

            <div class="comparison-header">

                <div>
                    Career
                </div>

                <div>
                    ${escapeHTML(
                        first.title
                    )}
                </div>

                <div>
                    ${escapeHTML(
                        second.title
                    )}
                </div>

            </div>


            <div class="comparison-row">

                <strong>
                    Category
                </strong>

                <span>
                    ${escapeHTML(
                        first.category
                    )}
                </span>

                <span>
                    ${escapeHTML(
                        second.category
                    )}
                </span>

            </div>


            <div class="comparison-row">

                <strong>
                    Level
                </strong>

                <span>
                    ${escapeHTML(
                        first.level
                    )}
                </span>

                <span>
                    ${escapeHTML(
                        second.level
                    )}
                </span>

            </div>


            <div class="comparison-row">

                <strong>
                    Salary
                </strong>

                <span>
                    ${escapeHTML(
                        first.salary
                    )}
                </span>

                <span>
                    ${escapeHTML(
                        second.salary
                    )}
                </span>

            </div>


            <div class="comparison-row">

                <strong>
                    Skills
                </strong>

                <span>
                    ${firstSkills
                        .map(
                            skill =>
                                escapeHTML(
                                    skill
                                )
                        )
                        .join(", ")}
                </span>

                <span>
                    ${second.skills
                        .map(
                            skill =>
                                escapeHTML(
                                    skill
                                )
                        )
                        .join(", ")}
                </span>

            </div>


            <div class="comparison-row">

                <strong>
                    Shared Skills
                </strong>

                <span>
                    ${shared.length
                        ? shared
                            .map(
                                skill =>
                                    escapeHTML(
                                        skill
                                    )
                            )
                            .join(", ")
                        : "None"}
                </span>

                <span>
                    ${shared.length
                        ? shared
                            .map(
                                skill =>
                                    escapeHTML(
                                        skill
                                    )
                            )
                            .join(", ")
                        : "None"}
                </span>

            </div>

        </div>
    `;
}


/* ============================================================
   38. COMPARISON INITIALIZATION
   ============================================================ */

function initCareerComparison() {

    const button =
        get("compareCareersBtn");


    if (button) {

        button.addEventListener(
            "click",
            compareCareers
        );
    }


    const selects = [
        get("compareCareerOne"),
        get("compareCareerTwo")
    ];


    selects.forEach(
        select => {

            if (!select) return;


            if (
                !select.options.length
            ) {

                CAREER_DATABASE
                    .forEach(
                        career => {

                            const option =
                                document.createElement(
                                    "option"
                                );

                            option.value =
                                career.id;

                            option.textContent =
                                career.title;

                            select.appendChild(
                                option
                            );
                        }
                    );
            }
        }
    );
}


/* ============================================================
   39. INTERVIEW QUESTION BANK
   ============================================================ */

function renderInterviewQuestionBank(
    category = "general"
) {

    const output =
        get("interviewQuestionBank");

    if (!output) return;


    const questions =
        INTERVIEW_QUESTIONS[
            category
        ] ||
        INTERVIEW_QUESTIONS.general;


    output.innerHTML =
        questions.map(
            (question, index) => `

                <div class="question-bank-item">

                    <div class="question-bank-number">
                        ${index + 1}
                    </div>

                    <div class="question-bank-content">

                        <h4>
                            ${escapeHTML(
                                question
                            )}
                        </h4>

                        <button
                            type="button"
                            class="btn btn-sm btn-secondary"
                            data-question-action="practice"
                            data-question="${escapeHTML(
                                question
                            )}"
                        >
                            Practice
                        </button>

                    </div>

                </div>

            `
        ).join("");
}


/* ============================================================
   40. QUESTION BANK INITIALIZATION
   ============================================================ */

function initInterviewQuestionBank() {

    const category =
        get("questionBankCategory");


    renderInterviewQuestionBank(
        category
            ? category.value
            : "general"
    );


    if (category) {

        category.addEventListener(
            "change",
            () => {

                renderInterviewQuestionBank(
                    category.value
                );
            }
        );
    }


    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-question-action]"
                );


            if (!button) return;


            if (
                button.dataset.questionAction ===
                "practice"
            ) {

                const question =
                    button.dataset.question;


                const input =
                    get("careerAssistantInput");


                if (input) {

                    input.value =
                        `Help me practice this interview question: ${question}`;

                    input.focus();
                }


                showToast(
                    "Question sent to Career Assistant.",
                    "success"
                );
            }
        }
    );
}


/* ============================================================
   41. CAREER RESOURCES
   ============================================================ */

function renderCareerResources(
    category = "all"
) {

    const output =
        get("careerResourcesGrid");

    if (!output) return;


    const resources =
        CAREER_RESOURCES.filter(
            resource =>
                category === "all" ||
                !category ||
                normalizeText(
                    resource.category
                ) === normalizeText(
                    category
                )
        );


    output.innerHTML =
        resources.map(
            resource => `

                <article
                    class="resource-card"
                >

                    <div class="resource-icon">

                        <i class="
                            fa-solid
                            ${escapeHTML(
                                resource.icon
                            )}
                        "></i>

                    </div>


                    <span>
                        ${escapeHTML(
                            resource.category
                        )}
                    </span>


                    <h3>
                        ${escapeHTML(
                            resource.title
                        )}
                    </h3>


                    <p>
                        ${escapeHTML(
                            resource.description
                        )}
                    </p>


                    <button
                        type="button"
                        class="btn btn-secondary btn-sm"
                        data-resource-action="open"
                        data-resource-id="${resource.id}"
                    >
                        Read Guide
                    </button>

                </article>
            `
        ).join("");
}


/* ============================================================
   42. RESOURCE DETAILS
   ============================================================ */

function showResourceDetails(
    resourceId
) {

    const resource =
        CAREER_RESOURCES.find(
            item =>
                item.id === resourceId
        );


    if (!resource) return;


    const modal =
        get("resourceDetailsModal");


    if (!modal) return;


    const content =
        modal.querySelector(
            ".modal-content"
        ) ||
        modal;


    content.innerHTML = `

        <div class="modal-header">

            <div>

                <span>
                    ${escapeHTML(
                        resource.category
                    )}
                </span>

                <h2>
                    ${escapeHTML(
                        resource.title
                    )}
                </h2>

            </div>


            <button
                type="button"
                class="modal-close"
                data-modal-close
            >
                ×
            </button>

        </div>


        <div class="modal-body">

            <p>
                ${escapeHTML(
                    resource.description
                )}
            </p>


            <div class="resource-guide-content">

                <h3>
                    Key Steps
                </h3>

                <ol>

                    <li>
                        Understand your target role.
                    </li>

                    <li>
                        Identify the most important skills.
                    </li>

                    <li>
                        Build practical evidence through projects or experience.
                    </li>

                    <li>
                        Update your resume and professional profile.
                    </li>

                    <li>
                        Practice interviews and track applications.
                    </li>

                </ol>

            </div>

        </div>
    `;


    openModal(
        "resourceDetailsModal"
    );
}


/* ============================================================
   43. RESOURCE INITIALIZATION
   ============================================================ */

function initCareerResources() {

    const category =
        get("resourceCategory");


    renderCareerResources(
        category
            ? category.value
            : "all"
    );


    if (category) {

        category.addEventListener(
            "change",
            () => {

                renderCareerResources(
                    category.value
                );
            }
        );
    }


    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-resource-action]"
                );


            if (!button) return;


            if (
                button.dataset.resourceAction ===
                "open"
            ) {

                showResourceDetails(
                    button.dataset.resourceId
                );
            }
        }
    );
}


/* ============================================================
   44. CAREER CENTER PERSONALIZATION
   ============================================================ */

function personalizeCareerCenter() {

    const resume =
        getCurrentResume();


    if (!resume) return;


    const skills =
        getResumeSkills(
            resume
        );


    if (!skills.length) return;


    const recommended =
        CAREER_DATABASE
            .map(
                career => {

                    const required =
                        career.skills.map(
                            normalizeText
                        );


                    const matches =
                        required.filter(
                            skill =>
                                skills
                                    .map(
                                        normalizeText
                                    )
                                    .some(
                                        userSkill =>
                                            userSkill.includes(
                                                skill
                                            ) ||
                                            skill.includes(
                                                userSkill
                                            )
                                    )
                        );


                    return {

                        career,

                        score:
                            required.length
                                ? Math.round(
                                    (
                                        matches.length /
                                        required.length
                                    ) * 100
                                  )
                                : 0
                    };
                }
            )
            .sort(
                (a, b) =>
                    b.score - a.score
            )
            .slice(0, 4);


    const output =
        get("recommendedCareers");


    if (!output) return;


    output.innerHTML =
        recommended.map(
            item => `

                <div class="recommended-career-card">

                    <div>

                        <span>
                            ${item.score}% match
                        </span>

                        <h3>
                            ${escapeHTML(
                                item.career.title
                            )}
                        </h3>

                        <p>
                            ${escapeHTML(
                                item.career.category
                            )}
                        </p>

                    </div>


                    <button
                        type="button"
                        class="btn btn-sm btn-primary"
                        data-career-action="details"
                        data-career-id="${item.career.id}"
                    >
                        Explore
                    </button>

                </div>
            `
        ).join("");
}


/* ============================================================
   45. CAREER CENTER INITIALIZATION
   ============================================================ */

function initializeCareerCenter() {

    initCareerExplorer();

    initJobSearch();

    initCourseExplorer();

    initCertificationTracker();

    initCareerQuiz();

    initCareerComparison();

    initInterviewQuestionBank();

    initCareerResources();

    personalizeCareerCenter();


    console.log(
        "Career Center initialized."
    );
}


/* ============================================================
   46. DOM READY
   ============================================================ */

if (document.readyState === "loading") {

    document.addEventListener(
        "DOMContentLoaded",
        initializeCareerCenter
    );

} else {

    initializeCareerCenter();
}


/* ============================================================
   END OF JAVASCRIPT PART 7
   NEXT:
   PART 8 →
   Pricing
   Premium Plans
   Payment UI
   FAQ
   Testimonials
   Feedback
   Contact
   Newsletter
   Developer Section
   Legal / Cookie
   Final Platform Controls
   ============================================================ */

// ============================================================
// YOUR RESUME.AI
// MAIN.JS — LIVE CODE PART 8
// PRICING + PREMIUM
// PAYMENT UI
// FAQ
// TESTIMONIALS
// FEEDBACK
// CONTACT
// NEWSLETTER
// DEVELOPER
// LEGAL
// COOKIE
// FINAL PLATFORM CONTROLS
// ============================================================


/* ============================================================
   1. PREMIUM / SUBSCRIPTION STATE
   ============================================================ */

const PremiumState = {

    currentPlan:
        Storage.get(
            "currentPlan",
            "free"
        ),

    billing:
        Storage.get(
            "billingCycle",
            "monthly"
        ),

    initialized: false
};


/* ============================================================
   2. PREMIUM PLANS
   ============================================================ */

const PREMIUM_PLANS = {

    free: {

        id: "free",

        name: "Free",

        monthly: 0,

        yearly: 0,

        features: [
            "1 Resume",
            "Basic Resume Builder",
            "Basic ATS Checker",
            "Basic Career Tools",
            "Limited AI Tools"
        ]
    },


    pro: {

        id: "pro",

        name: "Pro",

        monthly: 199,

        yearly: 1599,

        features: [
            "Unlimited Resumes",
            "Advanced ATS Checker",
            "Job Description Matcher",
            "AI Cover Letter",
            "AI Job Email",
            "LinkedIn Generator",
            "Interview Preparation",
            "Career Roadmap",
            "Public Resume",
            "Portfolio Generator"
        ]
    },


    career: {

        id: "career",

        name: "Career",

        monthly: 399,

        yearly: 2999,

        features: [
            "Everything in Pro",
            "Advanced Career Analytics",
            "Multiple Resume Versions",
            "Advanced Job Matching",
            "Interview Practice",
            "Skill Gap Analysis",
            "Job Ready Score",
            "Career Assistant",
            "Priority Features"
        ]
    }
};


/* ============================================================
   3. GET CURRENT PLAN
   ============================================================ */

function getCurrentPlan() {

    return (
        PREMIUM_PLANS[
            PremiumState.currentPlan
        ] ||
        PREMIUM_PLANS.free
    );
}


/* ============================================================
   4. PLAN PRICE
   ============================================================ */

function getPlanPrice(
    planId
) {

    const plan =
        PREMIUM_PLANS[
            planId
        ];


    if (!plan) {
        return 0;
    }


    return PremiumState.billing ===
        "yearly"

        ? plan.yearly

        : plan.monthly;
}


/* ============================================================
   5. RENDER PRICING
   ============================================================ */

function renderPricingPlans() {

    const containers =
        $$("[data-pricing-plan]");


    containers.forEach(
        container => {

            const planId =
                container.dataset.pricingPlan;


            const plan =
                PREMIUM_PLANS[
                    planId
                ];


            if (!plan) return;


            const price =
                getPlanPrice(
                    planId
                );


            const priceElement =
                container.querySelector(
                    "[data-plan-price]"
                );


            if (priceElement) {

                priceElement.textContent =
                    price === 0
                        ? "Free"
                        : `₹${price}`;
            }


            const cycleElement =
                container.querySelector(
                    "[data-plan-cycle]"
                );


            if (cycleElement) {

                cycleElement.textContent =
                    price === 0
                        ? ""
                        : PremiumState.billing ===
                          "yearly"

                            ? "/year"
                            : "/month";
            }


            const button =
                container.querySelector(
                    "[data-plan-action]"
                );


            if (button) {

                if (
                    PremiumState.currentPlan ===
                    planId
                ) {

                    button.textContent =
                        "Current Plan";

                    button.disabled =
                        true;

                } else {

                    button.textContent =
                        planId === "free"
                            ? "Use Free"
                            : "Upgrade";

                    button.disabled =
                        false;
                }
            }
        }
    );
}


/* ============================================================
   6. BILLING TOGGLE
   ============================================================ */

function initBillingToggle() {

    const buttons =
        $$("[data-billing]");


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    PremiumState.billing =
                        button.dataset.billing;


                    Storage.set(
                        "billingCycle",
                        PremiumState.billing
                    );


                    buttons.forEach(
                        item => {

                            item.classList.toggle(
                                "active",
                                item === button
                            );
                        }
                    );


                    renderPricingPlans();
                }
            );
        }
    );


    const active =
        buttons.find(
            button =>
                button.dataset.billing ===
                PremiumState.billing
        );


    if (active) {

        active.classList.add(
            "active"
        );
    }
}


/* ============================================================
   7. UPGRADE MODAL
   ============================================================ */

function openUpgradeModal(
    planId
) {

    const plan =
        PREMIUM_PLANS[
            planId
        ];


    if (!plan) return;


    const modal =
        get("premiumUpgradeModal");


    if (!modal) {

        showToast(
            `Selected ${plan.name} plan.`,
            "info"
        );

        return;
    }


    const content =
        modal.querySelector(
            ".modal-content"
        ) ||
        modal;


    const price =
        getPlanPrice(
            planId
        );


    content.innerHTML = `

        <div class="modal-header">

            <div>

                <span>
                    Premium Plan
                </span>

                <h2>
                    ${escapeHTML(
                        plan.name
                    )}
                </h2>

            </div>


            <button
                type="button"
                class="modal-close"
                data-modal-close
            >
                ×
            </button>

        </div>


        <div class="modal-body">

            <div class="premium-price">

                ${
                    price === 0
                        ? "Free"
                        : `₹${price}`
                }

                ${
                    price > 0
                        ? `
                            <small>
                                ${
                                    PremiumState.billing ===
                                    "yearly"
                                        ? "/year"
                                        : "/month"
                                }
                            </small>
                          `
                        : ""
                }

            </div>


            <ul class="premium-feature-list">

                ${plan.features
                    .map(
                        feature =>
                            `<li>
                                <i class="fa-solid fa-check"></i>
                                ${escapeHTML(
                                    feature
                                )}
                            </li>`
                    )
                    .join("")}

            </ul>


            ${
                price > 0
                    ? `
                        <button
                            type="button"
                            class="btn btn-primary btn-lg"
                            data-payment-plan="${plan.id}"
                        >
                            Continue to Payment
                        </button>
                      `
                    : `
                        <button
                            type="button"
                            class="btn btn-primary"
                            data-free-plan
                        >
                            Continue with Free
                        </button>
                      `
            }

        </div>
    `;


    openModal(
        "premiumUpgradeModal"
    );
}


/* ============================================================
   8. PAYMENT MODAL
   ============================================================ */

function openPaymentModal(
    planId
) {

    const plan =
        PREMIUM_PLANS[
            planId
        ];


    if (!plan) return;


    const price =
        getPlanPrice(
            planId
        );


    const modal =
        get("paymentModal");


    if (!modal) {

        showToast(
            "Payment interface is ready to connect.",
            "info"
        );

        return;
    }


    const content =
        modal.querySelector(
            ".modal-content"
        ) ||
        modal;


    content.innerHTML = `

        <div class="modal-header">

            <div>

                <span>
                    Secure Checkout
                </span>

                <h2>
                    ${escapeHTML(
                        plan.name
                    )} Plan
                </h2>

            </div>


            <button
                type="button"
                class="modal-close"
                data-modal-close
            >
                ×
            </button>

        </div>


        <div class="modal-body">

            <div class="payment-summary">

                <span>
                    Total
                </span>

                <strong>
                    ₹${price}
                </strong>

            </div>


            <form
                id="premiumPaymentForm"
                class="payment-form"
            >

                <div class="form-group">

                    <label>
                        Full Name
                    </label>

                    <input
                        type="text"
                        id="paymentName"
                        required
                        placeholder="Enter your name"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Email
                    </label>

                    <input
                        type="email"
                        id="paymentEmail"
                        required
                        placeholder="Enter your email"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Payment Method
                    </label>

                    <select
                        id="paymentMethod"
                    >

                        <option value="upi">
                            UPI
                        </option>

                        <option value="card">
                            Card
                        </option>

                        <option value="netbanking">
                            Net Banking
                        </option>

                    </select>

                </div>


                <input
                    type="hidden"
                    id="selectedPaymentPlan"
                    value="${escapeHTML(planId)}"
                >


                <button
                    type="submit"
                    class="btn btn-primary btn-lg"
                >
                    Proceed to Payment
                </button>

            </form>


            <small class="payment-note">

                Payment gateway integration can be connected
                here when Razorpay / another gateway is configured.

            </small>

        </div>
    `;


    openModal(
        "paymentModal"
    );


    initPaymentForm();
}


/* ============================================================
   9. PAYMENT FORM
   ============================================================ */

function initPaymentForm() {

    const form =
        get("premiumPaymentForm");


    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const planId =
                getValue(
                    "selectedPaymentPlan"
                );


            const name =
                getValue(
                    "paymentName"
                );


            const email =
                getValue(
                    "paymentEmail"
                );


            if (!name || !email) {

                showToast(
                    "Enter your name and email.",
                    "warning"
                );

                return;
            }


            /*
             * Demo browser-side payment flow.
             * Replace this section with a real
             * payment gateway order + verification
             * before production payments.
             */

            Storage.set(
                "pendingPayment",
                {

                    planId,

                    name,

                    email,

                    amount:
                        getPlanPrice(
                            planId
                        ),

                    createdAt:
                        new Date().toISOString()
                }
            );


            closeAllModals();


            showToast(
                "Payment flow prepared. Connect your payment gateway for live transactions.",
                "info"
            );
        }
    );
}


/* ============================================================
   10. ACTIVATE FREE PLAN
   ============================================================ */

function activateFreePlan() {

    PremiumState.currentPlan =
        "free";


    Storage.set(
        "currentPlan",
        "free"
    );


    addDashboardActivity(
        "plan",
        "Free plan selected"
    );


    closeAllModals();

    renderPricingPlans();

    updatePremiumUI();


    showToast(
        "Free plan activated.",
        "success"
    );
}


/* ============================================================
   11. PREMIUM UI
   ============================================================ */

function updatePremiumUI() {

    const plan =
        getCurrentPlan();


    $$("[data-current-plan]").forEach(
        element => {

            element.textContent =
                plan.name;
        }
    );


    $$("[data-premium-only]").forEach(
        element => {

            const isPremium =
                PremiumState.currentPlan !==
                "free";


            element.classList.toggle(
                "premium-locked",
                !isPremium
            );
        }
    );


    renderPricingPlans();
}


/* ============================================================
   12. PRICING ACTIONS
   ============================================================ */

function initPricingActions() {

    document.addEventListener(
        "click",
        event => {

            const planButton =
                event.target.closest(
                    "[data-plan-action]"
                );


            if (planButton) {

                const planId =
                    planButton.closest(
                        "[data-pricing-plan]"
                    )?.dataset
                        .pricingPlan;


                if (!planId) return;


                if (
                    planId === "free"
                ) {

                    activateFreePlan();

                } else {

                    openUpgradeModal(
                        planId
                    );
                }

                return;
            }


            const paymentButton =
                event.target.closest(
                    "[data-payment-plan]"
                );


            if (paymentButton) {

                openPaymentModal(
                    paymentButton.dataset
                        .paymentPlan
                );

                return;
            }


            if (
                event.target.closest(
                    "[data-free-plan]"
                )
            ) {

                activateFreePlan();
            }
        }
    );
}


/* ============================================================
   13. FAQ
   ============================================================ */

function initFAQ() {

    const items =
        $$(".faq-item");


    items.forEach(
        item => {

            const question =
                item.querySelector(
                    ".faq-question"
                );


            if (!question) return;


            question.addEventListener(
                "click",
                () => {

                    const wasActive =
                        item.classList.contains(
                            "active"
                        );


                    items.forEach(
                        other => {

                            other.classList.remove(
                                "active"
                            );
                        }
                    );


                    if (!wasActive) {

                        item.classList.add(
                            "active"
                        );
                    }
                }
            );
        }
    );
}


/* ============================================================
   14. TESTIMONIALS
   ============================================================ */

function getTestimonials() {

    return Storage.get(
        "testimonials",
        [
            {
                name: "Demo User",
                role: "Job Seeker",
                rating: 5,
                text:
                    "The resume and career tools make it easier to organize my job search."
            },
            {
                name: "Demo Student",
                role: "Student",
                rating: 5,
                text:
                    "The career roadmap and interview preparation tools are useful for planning my next steps."
            },
            {
                name: "Demo Professional",
                role: "Professional",
                rating: 4,
                text:
                    "I like having resume, job matching and career preparation tools in one place."
            }
        ]
    );
}


/* ============================================================
   15. RENDER TESTIMONIALS
   ============================================================ */

function renderTestimonials() {

    const output =
        get("testimonialsGrid");


    if (!output) return;


    const testimonials =
        getTestimonials();


    output.innerHTML =
        testimonials
            .map(
                testimonial => `

                    <article
                        class="testimonial-card"
                    >

                        <div class="testimonial-stars">

                            ${Array.from(
                                {
                                    length:
                                        Math.min(
                                            5,
                                            Math.max(
                                                1,
                                                testimonial.rating || 5
                                            )
                                        )
                                }
                            )
                                .map(
                                    () =>
                                        `<i class="fa-solid fa-star"></i>`
                                )
                                .join("")}

                        </div>


                        <p>
                            “${escapeHTML(
                                testimonial.text
                            )}”
                        </p>


                        <div class="testimonial-author">

                            <strong>
                                ${escapeHTML(
                                    testimonial.name
                                )}
                            </strong>

                            <span>
                                ${escapeHTML(
                                    testimonial.role
                                )}
                            </span>

                        </div>

                    </article>
                `
            )
            .join("");
}


/* ============================================================
   16. FEEDBACK
   ============================================================ */

const FeedbackState = {

    rating: 0,

    initialized: false
};


/* ============================================================
   17. FEEDBACK RATING
   ============================================================ */

function initFeedbackRating() {

    const buttons =
        $$("[data-rating]");


    buttons.forEach(
        button => {

            button.addEventListener(
                "click",
                () => {

                    FeedbackState.rating =
                        Number(
                            button.dataset.rating
                        );


                    buttons.forEach(
                        item => {

                            item.classList.toggle(
                                "active",
                                Number(
                                    item.dataset.rating
                                ) <=
                                FeedbackState.rating
                            );
                        }
                    );
                }
            );
        }
    );
}


/* ============================================================
   18. FEEDBACK SUBMIT
   ============================================================ */

function initFeedbackSubmit() {

    const form =
        get("feedbackForm");


    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const message =
                getValue(
                    "feedbackMessage"
                );


            if (
                !FeedbackState.rating
            ) {

                showToast(
                    "Please select a rating.",
                    "warning"
                );

                return;
            }


            if (!message) {

                showToast(
                    "Please write your feedback.",
                    "warning"
                );

                return;
            }


            const feedback =
                Storage.get(
                    "userFeedback",
                    []
                );


            feedback.unshift({

                id:
                    createId("feedback"),

                rating:
                    FeedbackState.rating,

                message,

                createdAt:
                    new Date().toISOString()
            });


            Storage.set(
                "userFeedback",
                feedback.slice(0, 50)
            );


            form.reset();


            FeedbackState.rating =
                0;


            $$("[data-rating]").forEach(
                button => {

                    button.classList.remove(
                        "active"
                    );
                }
            );


            showToast(
                "Thank you for your feedback.",
                "success"
            );
        }
    );
}


/* ============================================================
   19. CONTACT FORM
   ============================================================ */

function initContactForm() {

    const form =
        get("contactForm");


    if (!form) return;


    form.addEventListener(
        "submit",
        event => {

            event.preventDefault();


            const name =
                getValue(
                    "contactName"
                );


            const email =
                getValue(
                    "contactEmail"
                );


            const subject =
                getValue(
                    "contactSubject"
                );


            const message =
                getValue(
                    "contactMessage"
                );


            if (
                !name ||
                !email ||
                !message
            ) {

                showToast(
                    "Please complete the required fields.",
                    "warning"
                );

                return;
            }


            const messages =
                Storage.get(
                    "contactMessages",
                    []
                );


            messages.unshift({

                id:
                    createId("contact"),

                name,

                email,

                subject,

                message,

                createdAt:
                    new Date().toISOString()
            });


            Storage.set(
                "contactMessages",
                messages.slice(
                    0,
                    50
                )
            );


            form.reset();


            showToast(
                "Your message has been saved.",
                "success"
            );
        }
    );
}


/* ============================================================
   20. NEWSLETTER
   ============================================================ */

function initNewsletter() {

    const forms =
        $$("[data-newsletter-form]");


    forms.forEach(
        form => {

            form.addEventListener(
                "submit",
                event => {

                    event.preventDefault();


                    const input =
                        form.querySelector(
                            'input[type="email"]'
                        );


                    const email =
                        input?.value.trim();


                    if (!email) {

                        showToast(
                            "Enter your email address.",
                            "warning"
                        );

                        return;
                    }


                    const subscribers =
                        Storage.get(
                            "newsletterSubscribers",
                            []
                        );


                    const exists =
                        subscribers.some(
                            item =>
                                item.email ===
                                email
                        );


                    if (exists) {

                        showToast(
                            "You are already subscribed.",
                            "info"
                        );

                        return;
                    }


                    subscribers.push({

                        email,

                        subscribedAt:
                            new Date().toISOString()
                    });


                    Storage.set(
                        "newsletterSubscribers",
                        subscribers
                    );


                    form.reset();


                    showToast(
                        "Subscribed successfully.",
                        "success"
                    );
                }
            );
        }
    );
}


/* ============================================================
   21. LEGAL MODAL CONTENT
   ============================================================ */

const LEGAL_CONTENT = {

    privacy: {

        title:
            "Privacy Policy",

        content: `
            <p>
                Your Resume.ai should explain what information
                the platform collects, why it is collected,
                how it is stored and how users can request
                changes or deletion.
            </p>

            <h3>Information</h3>

            <p>
                Resume information may include personal details,
                education, experience, skills and professional links.
            </p>

            <h3>Security</h3>

            <p>
                Production deployments should use appropriate
                authentication, access controls and secure storage.
            </p>
        `
    },


    terms: {

        title:
            "Terms of Service",

        content: `
            <p>
                Users should review the platform rules,
                account responsibilities, acceptable use
                and limitations before using the service.
            </p>

            <h3>User Responsibility</h3>

            <p>
                Users are responsible for the accuracy of
                information they add to their resumes and profiles.
            </p>
        `
    },


    cookies: {

        title:
            "Cookie Policy",

        content: `
            <p>
                Your Resume.ai may use browser storage,
                cookies or similar technologies to maintain
                preferences, sessions and application settings.
            </p>
        `
    }
};


/* ============================================================
   22. LEGAL MODAL
   ============================================================ */

function openLegalModal(
    type
) {

    const legal =
        LEGAL_CONTENT[
            type
        ];


    if (!legal) return;


    const modal =
        get("legalModal");


    if (!modal) return;


    const content =
        modal.querySelector(
            ".modal-content"
        ) ||
        modal;


    content.innerHTML = `

        <div class="modal-header">

            <h2>
                ${escapeHTML(
                    legal.title
                )}
            </h2>


            <button
                type="button"
                class="modal-close"
                data-modal-close
            >
                ×
            </button>

        </div>


        <div class="modal-body legal-content">

            ${legal.content}

        </div>
    `;


    openModal(
        "legalModal"
    );
}


/* ============================================================
   23. LEGAL ACTIONS
   ============================================================ */

function initLegalActions() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-legal]"
                );


            if (!button) return;


            openLegalModal(
                button.dataset.legal
            );
        }
    );
}


/* ============================================================
   24. COOKIE CONSENT
   ============================================================ */

function initCookieConsent() {

    const banner =
        get("cookieConsent");


    if (!banner) return;


    const accepted =
        Storage.get(
            "cookieConsent",
            false
        );


    if (accepted) {

        banner.classList.add(
            "hidden"
        );
    }


    const accept =
        banner.querySelector(
            "[data-cookie-accept]"
        );


    const decline =
        banner.querySelector(
            "[data-cookie-decline]"
        );


    if (accept) {

        accept.addEventListener(
            "click",
            () => {

                Storage.set(
                    "cookieConsent",
                    true
                );


                banner.classList.add(
                    "hidden"
                );
            }
        );
    }


    if (decline) {

        decline.addEventListener(
            "click",
            () => {

                Storage.set(
                    "cookieConsent",
                    false
                );


                banner.classList.add(
                    "hidden"
                );
            }
        );
    }
}


/* ============================================================
   25. DEVELOPER CONTACT
   ============================================================ */

function initDeveloperSection() {

    const developerEmail =
        get("developerEmail");


    if (!developerEmail) return;


    const email =
        APP_CONFIG?.developerEmail ||
        "support@example.com";


    developerEmail.textContent =
        email;


    developerEmail.href =
        `mailto:${email}`;
}


/* ============================================================
   26. COPY DEVELOPER EMAIL
   ============================================================ */

function initDeveloperEmailCopy() {

    document.addEventListener(
        "click",
        async event => {

            const button =
                event.target.closest(
                    "[data-copy-email]"
                );


            if (!button) return;


            const email =
                button.dataset.copyEmail;


            if (!email) return;


            try {

                await navigator.clipboard.writeText(
                    email
                );


                showToast(
                    "Email copied.",
                    "success"
                );

            } catch (error) {

                showToast(
                    "Unable to copy email.",
                    "error"
                );
            }
        }
    );
}


/* ============================================================
   27. SOCIAL LINKS
   ============================================================ */

function initSocialLinks() {

    const links =
        Storage.get(
            "socialLinks",
            {}
        );


    $$("[data-social]").forEach(
        element => {

            const platform =
                element.dataset.social;


            if (
                links[platform]
            ) {

                element.href =
                    links[platform];
            }
        }
    );
}


/* ============================================================
   28. PLATFORM STATISTICS
   ============================================================ */

function renderPlatformStats() {

    const resumes =
        getAllResumes();


    const applications =
        getDashboardData()
            .applications || [];


    const users =
        Storage.get(
            "registeredUsers",
            []
        );


    const stats = {

        resumes:
            resumes.length,

        applications:
            applications.length,

        users:
            Array.isArray(users)
                ? users.length
                : 0
    };


    const mapping = {

        platformResumeCount:
            stats.resumes,

        platformApplicationCount:
            stats.applications,

        platformUserCount:
            stats.users
    };


    Object.entries(
        mapping
    ).forEach(
        ([id, value]) => {

            const element =
                get(id);


            if (element) {

                element.textContent =
                    value;
            }
        }
    );
}


/* ============================================================
   29. PRINT CURRENT RESUME
   ============================================================ */

function printCurrentResume() {

    const resume =
        getCurrentResume();


    if (!resume) {

        showToast(
            "Create a resume first.",
            "warning"
        );

        return;
    }


    const preview =
        get("resumePreview");


    if (!preview) {

        window.print();

        return;
    }


    document.body.classList.add(
        "printing-resume"
    );


    window.print();


    setTimeout(
        () => {

            document.body.classList.remove(
                "printing-resume"
            );

        },
        1000
    );
}


/* ============================================================
   30. PRINT ACTION
   ============================================================ */

function initPrintAction() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-print-resume]"
                );


            if (!button) return;


            printCurrentResume();
        }
    );
}


/* ============================================================
   31. GLOBAL ESCAPE KEY
   ============================================================ */

function initGlobalEscape() {

    document.addEventListener(
        "keydown",
        event => {

            if (
                event.key ===
                "Escape"
            ) {

                closeAllModals();
            }
        }
    );
}


/* ============================================================
   32. GLOBAL TOOL SEARCH
   ============================================================ */

function initGlobalSearch() {

    const input =
        get("globalSearch");


    if (!input) return;


    input.addEventListener(
        "input",
        () => {

            const query =
                normalizeText(
                    input.value
                );


            if (!query) return;


            const sections =
                $$("[data-searchable]");


            sections.forEach(
                section => {

                    const text =
                        normalizeText(
                            section.innerText
                        );


                    section.classList.toggle(
                        "search-match",
                        text.includes(
                            query
                        )
                    );
                }
            );
        }
    );
}


/* ============================================================
   33. PREMIUM FEATURE GUARD
   ============================================================ */

function requirePremium(
    callback,
    minimumPlan = "pro"
) {

    const planOrder = {

        free: 0,

        pro: 1,

        career: 2
    };


    const current =
        planOrder[
            PremiumState.currentPlan
        ] || 0;


    const required =
        planOrder[
            minimumPlan
        ] || 1;


    if (
        current < required
    ) {

        openUpgradeModal(
            minimumPlan
        );

        return false;
    }


    if (
        typeof callback ===
        "function"
    ) {

        callback();
    }


    return true;
}


/* ============================================================
   34. PREMIUM BUTTON GUARD
   ============================================================ */

function initPremiumFeatureGuards() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-requires-plan]"
                );


            if (!button) return;


            const requiredPlan =
                button.dataset.requiresPlan;


            const currentPlan =
                PremiumState.currentPlan;


            const order = {

                free: 0,

                pro: 1,

                career: 2
            };


            if (
                (order[currentPlan] || 0) <
                (order[requiredPlan] || 1)
            ) {

                event.preventDefault();

                event.stopPropagation();


                openUpgradeModal(
                    requiredPlan
                );
            }
        }
    );
}


/* ============================================================
   35. ACCOUNT DATA EXPORT
   ============================================================ */

function exportAccountData() {

    const exportData = {

        exportedAt:
            new Date().toISOString(),

        plan:
            PremiumState.currentPlan,

        resume:
            getCurrentResume(),

        resumes:
            getAllResumes(),

        versions:
            getResumeVersions(),

        dashboard:
            getDashboardData(),

        publicResume:
            getPublicResumeData(),

        portfolio:
            getPortfolioData(),

        certifications:
            getCertificationData(),

        savedJobs:
            Storage.get(
                "savedJobs",
                []
            ),

        savedCourses:
            Storage.get(
                "savedCourses",
                []
            )
    };


    downloadTextFile(
        "your-resume-ai-data.json",
        JSON.stringify(
            exportData,
            null,
            2
        )
    );


    showToast(
        "Account data exported.",
        "success"
    );
}


/* ============================================================
   36. ACCOUNT DATA EXPORT BUTTON
   ============================================================ */

function initDataExport() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-export-account]"
                );


            if (!button) return;


            exportAccountData();
        }
    );
}


/* ============================================================
   37. RESET LOCAL APPLICATION
   ============================================================ */

function resetLocalApplication() {

    const confirmed =
        window.confirm(
            "This will remove locally stored Your Resume.ai data from this browser. Continue?"
        );


    if (!confirmed) return;


    Storage.clear();


    window.location.reload();
}


/* ============================================================
   38. RESET BUTTON
   ============================================================ */

function initApplicationReset() {

    document.addEventListener(
        "click",
        event => {

            const button =
                event.target.closest(
                    "[data-reset-app]"
                );


            if (!button) return;


            resetLocalApplication();
        }
    );
}


/* ============================================================
   39. FINAL PLATFORM REFRESH
   ============================================================ */

function refreshEntirePlatform() {

    try {

        updatePremiumUI();

        updateDashboardStats();

        renderDashboardActivities();

        renderResumeManager();

        renderVersionHistory();

        renderPublicResumeSettings();

        renderPlatformStats();

        renderTestimonials();

        renderCareerExplorer();

        renderJobResults();

        renderCourses();

        renderCertificationTracker();

        personalizeCareerCenter();

    } catch (error) {

        console.error(
            "Platform refresh error:",
            error
        );
    }
}


/* ============================================================
   40. FINAL INITIALIZATION
   ============================================================ */

function initializeFinalPlatform() {

    PremiumState.currentPlan =
        Storage.get(
            "currentPlan",
            "free"
        );


    PremiumState.billing =
        Storage.get(
            "billingCycle",
            "monthly"
        );


    initBillingToggle();

    initPricingActions();

    initFAQ();

    renderTestimonials();

    initFeedbackRating();

    initFeedbackSubmit();

    initContactForm();

    initNewsletter();

    initLegalActions();

    initCookieConsent();

    initDeveloperSection();

    initDeveloperEmailCopy();

    initSocialLinks();

    initPrintAction();

    initGlobalEscape();

    initGlobalSearch();

    initPremiumFeatureGuards();

    initDataExport();

    initApplicationReset();


    refreshEntirePlatform();


    PremiumState.initialized =
        true;


    console.log(
        "Your Resume.ai final platform initialized."
    );
}


/* ============================================================
   41. FINAL DOM READY
   ============================================================ */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeFinalPlatform
    );

} else {

    initializeFinalPlatform();
}


/* ============================================================
   42. GLOBAL REFRESH EVENT
   ============================================================ */

document.addEventListener(
    "resume:saved",
    () => {

        refreshEntirePlatform();
    }
);


/* ============================================================
   43. BEFORE UNLOAD
   ============================================================ */

window.addEventListener(
    "beforeunload",
    () => {

        try {

            const resume =
                getCurrentResume();


            if (resume) {

                saveResumeToCollection(
                    resume,
                    false
                );
            }

        } catch (error) {

            console.warn(
                "Unable to save before unload.",
                error
            );
        }
    }
);


/* ============================================================
   44. FINAL CONSOLE
   ============================================================ */

console.log(
    "%cYour Resume.ai",
    "font-size:20px;font-weight:bold;"
);

console.log(
    "Career platform loaded successfully."
);

console.log(
    "Resume Builder → ATS → Job Match → Cover Letter → Interview → Career Roadmap"
);


/* ============================================================
   END OF MAIN.JS PART 8
   ============================================================ */
