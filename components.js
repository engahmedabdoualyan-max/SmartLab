(function () {
    'use strict';

/* ========== i18n Translations (common) ========== */
    var defaultTranslations = {
        'en': {
            'home': 'Home', 'about': 'about', 'services': 'Services', 'contact': 'Contact',
            'Enter Lab': 'Enter Lab', 'Guest': 'Guest', 'Sign Out': 'Sign Out',
            'Fimto Soft': 'Fimto <span>Soft</span>',
            'Integrated Tech Solutions': 'Integrated Tech Solutions',
            'Quick Links': 'Quick Links', 'Our Locations': 'Our Locations',
            'We provide comprehensive software solutions including advanced interactive ERP systems, maintenance and development of ready-mix concrete plants, web design and development, distinguished digital marketing, creation and development of security and surveillance systems, establishment and development of infrastructure networks, creation and development of AI applications, and establishment and development of smart home systems.': 'We provide comprehensive software solutions including advanced interactive ERP systems, maintenance and development of ready-mix concrete plants, web design and development, distinguished digital marketing, creation and development of security and surveillance systems, establishment and development of infrastructure networks, creation and development of AI applications, and establishment and development of smart home systems.',
            // French
            'accueil': 'Accueil', 'à propos': 'à propos', 'services': 'Services', 'contact': 'Contact',
            'Entrer Lab': 'Entrer Lab', 'Invité': 'Invité', 'Se déconnecter': 'Se déconnecter',
            'Fimto Soft': 'Fimto <span>Soft</span>',
            'Integrated Tech Solutions': 'Solutions technologiques intégrées',
            'Liens rapides': 'Liens rapides', 'Nos emplacements': 'Nos emplacements',
            'Nous fournissons des solutions logicielles complètes y compris des systèmes ERP interactifs avancés...': 'Nous fournissons des solutions logicielles complètes y compris des systèmes ERP interactifs avancés...',
            // Chinese
            '家': '家', '关于': '关于', '服务': '服务', '联系': '联系',
            '进入实验室': '进入实验室', '客人': '客人', '退出': '退出',
            'Fimto Soft': 'Fimto <span>Soft</span>',
            'Integrated Tech Solutions': '集成技术解决方案',
            '快速链接': '快速链接', '我们的地点': '我们的地点',
            '我们提供全面的软件解决方案，包括先进的交互式 ERP 系统...': '我们提供全面的软件解决方案，包括先进的交互式 ERP 系统...',
            // Russian
            'главная': 'главная', 'об': 'об', 'услуги': 'услуги', 'контакты': 'контакты',
            'Вход в лабораторию': 'Вход в лабораторию', 'Гость': 'Гость', 'Выйти': 'Выйти',
            'Fimto Soft': 'Fimto <span>Soft</span>',
            'Integrated Tech Solutions': 'Интегрированные технологические решения',
            'Быстрые ссылки': 'Быстрые ссылки', 'Наши места': 'Наши места',
            'Мы предоставляем комплексные программные решения, включая передовые интерактивные системы ERP...': 'Мы предоставляем комплексные программные решения, включая передовые интерактивные системы ERP...',
            // German
            'Startseite': 'Startseite', 'Über': 'Über', 'Service': 'Service', 'Kontakt': 'Kontakt',
            'Ins Labor': 'Ins Labor', 'Gast': 'Gast', 'Ausloggen': 'Ausloggen',
            'Fimto Soft': 'Fimto <span>Soft</span>',
            'Integrated Tech Solutions': 'Integrierte Technologielösungen',
            'Schnelle Links': 'Schnelle Links', 'Unsere Standorte': 'Unsere Standorte',
            'Wir bieten umfassende Softwarelösungen, einschließlich fortgeschrittener interaktiver ERP-Systeme...': 'Wir bieten umfassende Softwarelösungen, einschließlich fortgeschrittener interaktiver ERP-Systeme...',
            // Urdu
            'اہم': 'اہم', 'کے بارے میں': 'کے بارے میں', 'خدمات': 'خدمات', 'رابطہ': 'رابطہ',
            'لیبار میں داخل ہوں': 'لیبار میں داخل ہوں', 'مہمان': 'مہمان', 'باہر جاؤ': 'باہر جاؤ',
            'Fimto Soft': 'Fimto <span>Soft</span>',
            'Integrated Tech Solutions': 'انٹیگریٹڈ ٹیکنولوجی حل',
            'فوری لنکس': 'فوری لنکس', 'ہمارے مقامات': 'ہمارے مقامات',
            'ہم جامع سافٹ ویئر حل فراہم کرتے ہیں، بشمول اعلی درجے کے انٹرایکٹو ERP سسٹمز، تیارآمد ریڈی میکس کنکری پلانٹس، ویب ڈیزائن اور ڈیویلپمنٹ، تمیز دار ڈیجیٹل مارکیٹنگ، تحری رجن اور تیارآمد سکیورٹی اینڈ سوریلنس سسٹمز، تیارآمد اینڈ ڈیولوپمنٹ شمولس اینڈ بینائے انفراسٹراکچر انٹیگریشن، تیارآمد اینڈ ڈیویلپمنٹ کے ایپلیکنیشنز کی بنانی اینڈ تیارآمد اینڈ ہوم سویسم سسٹمز۔': 'ہم جامع سافٹ ویئر حل فراہم کرتے ہیں، بشمول اعلی درجے کے انٹرایکٹو ERP سسٹمز، تیارآمد ریڈی میکس کنکری پلانٹس، ویب ڈیزائن اور ڈیویلپمنٹ، تمیز دار ڈیجیٹل مارکیٹنگ، تحریج رجن اور تیارآمد سکیورٹی اینڈ سوریلنس سسٹمز، تیارآمد اینڈ ڈیولوپمنٹ شمولس اینڈ بینائے انفراسٹراکچر اینٹیگریشن، تیارآمد اینڈ ڈیویلپمنٹ کے ایپلیکنیشنز کی بنانی اینڈ تیارآمد اینڈ ہوم سویسم سسٹمز۔',
            // Italian
            'homepage': 'Homepage', 'about us': 'about us', 'services': 'services', 'contacts': 'contacts',
            'Enter Laboratory': 'Enter Laboratory', 'Guest': 'Guest', 'Logout': 'Logout',
            'Fimto Soft': 'Fimto <span>Soft</span>',
            'Integrated Tech Solutions': 'Soluzioni tecnologiche integrate',
            'Quick Links': 'Link veloci', 'Our Locations': 'Our Locations',
            'We provide comprehensive software solutions including advanced interactive ERP systems...': 'We provide comprehensive software solutions including advanced interactive ERP systems...',
            // Hindi
            'मुख्य पृष्ठ': 'मुख्य पृष्ठ', 'के बारे में': 'के बारे में', 'सेवाएँ': 'सेवाएँ', 'संपर्क': 'संपर्क',
            'प्रयोगशाला में प्रवेश': 'प्रयोगशाला में प्रवेश', 'अतिथि': 'अतिथि', 'बाहर निकलें': 'बाहर निकलें',
            'Fimto Soft': 'Fimto <span>Soft</span>',
            'Integrated Tech Solutions': 'एकीकृत प्रौद्योगिक समाधान',
            'त्वरित लिंक': 'त्वरित लिंक', 'हमारे स्थान': 'हमारे स्थान',
            'हम व्यापक सॉफ्टवेयर समाधान प्रदान करते हैं, जिसमें एडवांस्ड इंटरएक्टिव ERP सिस्टम...': 'हम व्यापक सॉफ्टवेयर समाधान प्रदान करते हैं, जिसमें एडवांस्ड इंटरएक्टिव ERP सिस्टम...',
        }
    };

    window.translations = window.translations || {};
    if (!window.translations.en) window.translations.en = {};
    if (!window.translations.ar) window.translations.ar = {};
    
    // Initialize all supported languages
    const languages = ['en', 'ar', 'fr', 'zh', 'ru', 'de', 'ur', 'it', 'hi'];
    const langLabels = { en: 'EN', ar: 'AR', fr: 'FR', zh: 'ZH', ru: 'RU', de: 'DE', ur: 'UR', it: 'IT', hi: 'HI' };
    for (var lang of languages) {
        if (!window.translations[lang]) window.translations[lang] = {};
    }
    
    // Merge translations for each language
    for (var k in defaultTranslations.en) { 
        if (!window.translations.en.hasOwnProperty(k)) window.translations.en[k] = defaultTranslations.en[k];
    }
    for (var k in defaultTranslations.ar) { 
        if (!window.translations.ar.hasOwnProperty(k)) window.translations.ar[k] = defaultTranslations.ar[k];
    }
    
    // Add missing translations for other languages based on patterns
    for (var lang of ['fr', 'zh', 'ru', 'de', 'ur', 'it', 'hi']) {
        for (var k in defaultTranslations.en) {
            if (!window.translations[lang].hasOwnProperty(k)) {
                window.translations[lang][k] = defaultTranslations.en[k];
            }
        }
        // Add language-specific translations
        if (lang === 'fr') {
            window.translations.fr['home'] = 'Accueil';
            window.translations.fr['about'] = 'À propos';
            window.translations.fr['services'] = 'Services';
            window.translations.fr['contact'] = 'Contact';
            window.translations.fr['Enter Lab'] = 'Entrer Lab';
            window.translations.fr['Guest'] = 'Invité';
            window.translations.fr['Sign Out'] = 'Se déconnecter';
        } else if (lang === 'zh') {
            window.translations.zh['home'] = '主页';
            window.translations.zh['about'] = '关于';
            window.translations.zh['services'] = '服务';
            window.translations.zh['contact'] = '联系';
            window.translations.zh['Enter Lab'] = '进入实验室';
            window.translations.zh['Guest'] = '客人';
            window.translations.zh['Sign Out'] = '离开';
        } else if (lang === 'ru') {
            window.translations.ru['home'] = 'Главная';
            window.translations.ru['about'] = 'О нас';
            window.translations.ru['services'] = 'Услуги';
            window.translations.ru['contact'] = 'Контакты';
            window.translations.ru['Enter Lab'] = 'Войти в лабораторию';
            window.translations.ru['Guest'] = 'Гость';
            window.translations.ru['Sign Out'] = 'Выйти';
        } else if (lang === 'de') {
            window.translations.de['home'] = 'Startseite';
            window.translations.de['about'] = 'Über uns';
            window.translations.de['services'] = 'Service';
            window.translations.de['contact'] = 'Kontakt';
            window.translations.de['Enter Lab'] = 'Ins Labor';
            window.translations.de['Guest'] = 'Gast';
            window.translations.de['Sign Out'] = 'Ausloggen';
        } else if (lang === 'ur') {
            window.translations.ur['home'] = 'اہم';
            window.translations.ur['about'] = 'کے بارے میں';
            window.translations.ur['services'] = 'خدمات';
            window.translations.ur['contact'] = 'رابطہ';
            window.translations.ur['Enter Lab'] = 'لیبار میں داخل ہوں';
            window.translations.ur['Guest'] = 'مہمان';
            window.translations.ur['Sign Out'] = 'باہر جاؤ';
        } else if (lang === 'it') {
            window.translations.it['home'] = 'Homepage';
            window.translations.it['about'] = 'Chi siamo';
            window.translations.it['services'] = 'Servizi';
            window.translations.it['contact'] = 'Contatti';
            window.translations.it['Enter Lab'] = 'Entrare nel Laboratorio';
            window.translations.it['Guest'] = 'Ospite';
            window.translations.it['Sign Out'] = 'Esci';
        } else if (lang === 'hi') {
            window.translations.hi['home'] = 'मुख्य पृष्ठ';
            window.translations.hi['about'] = 'के बारे में';
            window.translations.hi['services'] = 'सेवाएँ';
            window.translations.hi['contact'] = 'संपर्क';
            window.translations.hi['Enter Lab'] = 'प्रयोगशाला में प्रवेश';
            window.translations.hi['Guest'] = 'अतिथि';
            window.translations.hi['Sign Out'] = 'बाहर निकलें';
        }
    }

    window.translatePage = function () {
        var lang = localStorage.getItem('smartlab_lang') || 'en';
        var dict = window.translations[lang] || window.translations['en'] || {};
        var els = document.querySelectorAll('[data-i18n]');
        for (var i = 0; i < els.length; i++) {
            var key = els[i].getAttribute('data-i18n');
            if (dict[key] !== undefined) {
                els[i].innerHTML = dict[key];
            }
        }
        var btn = document.getElementById('lang-toggle');
        if (btn) btn.innerHTML = '<span class="lang-dot"></span> ' + (langLabels[lang] || lang.toUpperCase());
    };

    /* ========== Header / Footer loader ========== */
    function loadHTML(relativeUrl, placeholderId, callback) {
        var url = relativeUrl.startsWith('/') ? relativeUrl : '/' + relativeUrl;
        var el = document.getElementById(placeholderId);
        if (!el) { console.warn('[smartLAB] Placeholder not found:', placeholderId); return; }
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url, true);
        xhr.onload = function () {
            if (xhr.status >= 200 && xhr.status < 400) {
                el.innerHTML = xhr.responseText;
                if (callback) callback();
            } else {
                console.error('[smartLAB] Failed to load:', url, xhr.status);
            }
        };
        xhr.onerror = function() { console.error('[smartLAB] Network error loading:', url); };
        xhr.send();
    }

    function initLangToggle() {
        var btn = document.getElementById('lang-toggle');
        if (!btn) return;
        btn.addEventListener('click', function () {
            var current = localStorage.getItem('smartlab_lang') || 'en';
            var idx = languages.indexOf(current);
            var next = languages[(idx + 1) % languages.length];
            localStorage.setItem('smartlab_lang', next);
            document.body.classList.toggle('rtl', next === 'ar' || next === 'ur');
            if (typeof translatePage === 'function') translatePage();
        });
    }

    function applySavedLang() {
        var lang = localStorage.getItem('smartlab_lang') || 'en';
        if (lang === 'ar') document.body.classList.add('rtl');
        if (typeof translatePage === 'function') translatePage();
    }

    function loadHeaderFooter() {
        loadHTML('header.html', 'header-placeholder', function () {
            initLangToggle();
            applySavedLang();
        });
        loadHTML('footer.html', 'footer-placeholder', function() {
            setTimeout(initEgyptFlag, 100);
        });
        setTimeout(initEgyptFlag, 300);
    }

    var egyptClickCount = 0;
    var egyptClickTimer = null;
    var egyptFlagInitialized = false;
    function initEgyptFlag() {
        if (egyptFlagInitialized) return;
        var flag = document.getElementById('egypt-flag');
        if (!flag) return;
        egyptFlagInitialized = true;
        flag.style.transition = 'transform 0.15s';
        flag.addEventListener('mouseenter', function() { this.style.transform = 'scale(1.3)'; });
        flag.addEventListener('mouseleave', function() { this.style.transform = 'scale(1)'; });
        flag.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            egyptClickCount++;
            flag.style.transform = 'scale(0.9)';
            setTimeout(function() { flag.style.transform = 'scale(1.3)'; }, 100);
            if (egyptClickTimer) clearTimeout(egyptClickTimer);
            egyptClickTimer = setTimeout(function() { egyptClickCount = 0; }, 3000);
            if (egyptClickCount >= 5) {
                egyptClickCount = 0;
                flag.style.transform = 'scale(1.5)';
                setTimeout(function() {
                    window.location.href = '/admin/login.html';
                }, 300);
            }
        });
    }
    function applySiteConfig() {
        try {
            var cfg = window.SITE_CONFIG;
            if (!cfg) {
                var saved = localStorage.getItem('smartlab_settings');
                if (saved) {
                    var p = JSON.parse(saved);
                    cfg = {
                        logo: (p.logo && p.logo.indexOf('data:') === 0) ? p.logo : (p.logo && p.logo !== '../assets/logo.png' ? p.logo : '/assets/logo.png'),
                        siteName: p.siteName || 'smartLAB',
                        siteNameAr: p.siteNameAr || 'سمارت لاب'
                    };
                } else {
                    cfg = { logo: '/assets/logo.png', siteName: 'smartLAB', siteNameAr: 'سمارت لاب' };
                }
            }
            /* Apply logo to header images */
            var imgs = document.querySelectorAll('.header-logo img');
            for (var i = 0; i < imgs.length; i++) {
                imgs[i].src = cfg.logo;
            }
            /* Apply logo to index.html inline text logo — replace text span with img if custom logo */
            var logoSpans = document.querySelectorAll('.header-logo .logo-svg, .logo-box .logo-svg, .slab-banner-logo');
            var isCustom = cfg.logo && cfg.logo.indexOf('data:') === 0;
            for (var j = 0; j < logoSpans.length; j++) {
                var span = logoSpans[j];
                if (isCustom) {
                    var img = document.createElement('img');
                    img.src = cfg.logo;
                    img.alt = cfg.siteName;
                    img.style.cssText = 'width:42px;height:42px;object-fit:contain;border-radius:10px;box-shadow:0 0 20px rgba(59,130,246,0.25)';
                    span.parentNode.replaceChild(img, span);
                }
            }
            /* Favicon */
            if (cfg.favicon) {
                var link = document.querySelector('link[rel="icon"]');
                if (link) link.href = cfg.favicon;
            }
        } catch(e) { console.warn('[smartLAB] applySiteConfig error:', e); }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            loadHeaderFooter();
            setTimeout(applySiteConfig, 100);
        });
    } else {
        loadHeaderFooter();
        setTimeout(applySiteConfig, 100);
    }

    /* ========== MIX CLASS DEFINITIONS ========== */
    const MIX_CLASSES = {
        A: {
            name: 'Wearing Course - Heavy Traffic',
            nmas: 12.5,
            bitumen: [4.0, 6.0],
            bitumenDefault: 5.0,
            specLow: [100,100,90,90,90,90,28,0,0,0,0,2],
            specHigh: [100,100,100,100,100,100,100,100,100,100,100,100],
            aggregates: [
                { key: 'a4', name: '3/4" (19mm)', note: '19 mm', pct: 12 },
                { key: 'a3', name: '1/2" (12.5mm)', note: '12.5 mm', pct: 18 },
                { key: 'a2', name: '3/8" (9.5mm)', note: '9.5 mm', pct: 20 },
                { key: 'a1', name: 'Sand', note: '4.75 mm', pct: 35 },
                { key: 'ns', name: 'Natural Sand', note: '2.36 mm', pct: 10 },
                { key: 'fl', name: 'Filler', note: '0.075 mm', pct: 5 },
            ]
        },
        B: {
            name: 'Binder Course - Medium Traffic',
            nmas: 12.5,
            bitumen: [4.0, 6.0],
            bitumenDefault: 5.0,
            specLow: [100,100,90,90,90,90,28,0,0,0,0,2],
            specHigh: [100,100,100,100,100,100,100,100,100,100,100,100],
            aggregates: [
                { key: 'a4', name: '3/4" (19mm)', note: '19 mm', pct: 15 },
                { key: 'a3', name: '1/2" (12.5mm)', note: '12.5 mm', pct: 20 },
                { key: 'a2', name: '3/8" (9.5mm)', note: '9.5 mm', pct: 15 },
                { key: 'a1', name: 'Sand', note: '4.75 mm', pct: 30 },
                { key: 'ns', name: 'Natural Sand', note: '2.36 mm', pct: 8 },
                { key: 'fl', name: 'Filler', note: '0.075 mm', pct: 7 },
            ]
        },
        C: {
            name: 'Base Course - Light Traffic',
            nmas: 25.0,
            bitumen: [3.5, 5.5],
            bitumenDefault: 4.5,
            specLow: [100,90,90,90,90,90,23,0,0,0,0,2],
            specHigh: [100,100,100,100,100,100,100,100,100,100,100,100],
            aggregates: [
                { key: 'a4', name: '1" (25mm)', note: '25 mm', pct: 20 },
                { key: 'a3', name: '3/4" (19mm)', note: '19 mm', pct: 25 },
                { key: 'a2', name: '1/2" (12.5mm)', note: '12.5 mm', pct: 20 },
                { key: 'a1', name: 'Sand', note: '4.75 mm', pct: 25 },
                { key: 'ns', name: 'Natural Sand', note: '2.36 mm', pct: 5 },
                { key: 'fl', name: 'Filler', note: '0.075 mm', pct: 5 },
            ]
        },
        D: {
            name: 'Surface Course - Standard',
            nmas: 12.5,
            bitumen: [4.0, 6.0],
            bitumenDefault: 5.2,
            specLow: [100,100,90,90,90,90,28,0,0,0,0,2],
            specHigh: [100,100,100,100,100,100,100,100,100,100,100,100],
            aggregates: [
                { key: 'a4', name: '3/4" (19mm)', note: '19 mm', pct: 12 },
                { key: 'a3', name: '1/2" (12.5mm)', note: '12.5 mm', pct: 18 },
                { key: 'a2', name: '3/8" (9.5mm)', note: '9.5 mm', pct: 20 },
                { key: 'a1', name: 'Sand', note: '4.75 mm', pct: 35 },
                { key: 'ns', name: 'Natural Sand', note: '2.36 mm', pct: 10 },
                { key: 'fl', name: 'Filler', note: '0.075 mm', pct: 5 },
            ]
        }
    };

    const SIEVES = [37.5, 25, 19, 12.5, 9.5, 4.75, 2.36, 1.18, 0.6, 0.3, 0.15, 0.075];
    const AGG_KEYS = ['a4', 'a3', 'a2', 'a1', 'ns', 'fl'];

    /* ========== GRADATION TABLES FOR ALL MATERIALS ========== */
    const DEFAULT_GRADATIONS = {
        a4: [100,100,92,55,12,3,1,0,0,0,0,0],
        a3: [100,100,100,98,78,30,4,1,0,0,0,0],
        a2: [100,100,100,100,100,92,28,6,2,1,0,0],
        a1: [100,100,100,100,100,100,96,72,52,36,22,12],
        ns: [100,100,100,100,100,100,99,92,76,56,30,10],
        fl: [100,100,100,100,100,100,100,100,100,100,98,92],
    };

    /* ========== CORE MIX DESIGN ENGINE ========== */
    let currentClass = 'D';
    let aggregates = [];
    let batchSize = 1000;
    let bitumenPct = 5.2;
    let customBatchMode = false;
    let savedDesigns = [];
    let updatesPending = false;
    let lastUpdateTime = 0;

    const translationKeys = {
        statBatch: 'Batch Size', statBitumenWeight: 'Bitumen Weight', statAggWeight: 'Aggregate Weight',
        statCompliance: 'Compliance', weightUnit: 'kg', pctSumWarn: (p) => `Sum: ${p.toFixed(1)}% — must equal 100%`,
        bitumenOk: 'Bitumen content within range', bitumenBad: 'Bitumen out of range',
        aggBitumen: 'Bitumen', bitumenSizeNote: 'Pen 60/70', totalRow: 'TOTAL',
        aggA4: '3/4"', aggA3: '1/2"', aggA2: '3/8"', aggA1: 'Sand', aggNS: 'Natural Sand', aggFL: 'Filler',
        sectionTable: 'Batch Weights', sectionCurve: 'Gradation Curve', specStd: 'AASHTO M 323',
        uploadBtn: 'Upload Design', designName: 'Design Name', uploadHint: 'JSON, PDF, Image, Excel, CSV',
        apply: 'Apply', noDesigns: 'No saved designs yet. Upload your first design file.',
        uploadedAt: 'Uploaded', classAFull: 'Wearing Course - Heavy', classBFull: 'Binder Course - Medium',
        classCFull: 'Base Course - Light', classDFull: 'Surface Course - Standard',
        colMaterial: 'Material', colSize: 'Size', colPct: '%', colWeight: 'Weight',
        sieveHeader: 'Sieve', upperLimit: 'Upper Limit', combined: 'Combined', lowerLimit: 'Lower Limit',
        violations: (v) => `Out of spec: ${v}`, axisX: 'Sieve Size (mm)', axisY: '% Passing',
        legendCurve: 'Combined Gradation', legendSpec: 'Spec Limits',
        dymPass: '✓ PASS — All criteria met', dymFail: '✗ FAIL — Some criteria not met',
        dymOptimalPcts: 'Optimal Proportions', dymOptimalAC: 'Optimal AC %', dymResults: 'Design Results',
        dymStability: 'Stability', dymFlow: 'Flow', dymVoids: 'Air Voids', dymVMA: 'VMA', dymVFA: 'VFB', dymDensity: 'Density',
    };

    /* ========== INPUT VALIDATION UTILITIES ========== */
    function isValidPercentage(value) {
        return typeof value === 'number' && !isNaN(value) && value >= 0 && value <= 100;
    }

    function isValidBitumen(value, limits) {
        return typeof value === 'number' && !isNaN(value) && value >= limits[0] && value <= limits[1];
    }

    function isValidBatchSize(value) {
        return typeof value === 'number' && !isNaN(value) && value >= 100 && value <= 5000;
    }

    /* ========== CORE MIX FUNCTIONS ========== */
    function setClass(cls) {
        currentClass = cls;
        const def = MIX_CLASSES[cls];
        aggregates = def.aggregates.map(a => ({...a}));
        bitumenPct = def.bitumenDefault;
        document.getElementById('bitumenPct').value = bitumenPct;
        document.querySelectorAll('.class-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.class === cls);
        });
        document.getElementById('nmasDisplay').textContent = def.nmas + ' mm';
        debouncedRecalc();
    }

    function updatePct(key, val) {
        if (!isValidPercentage(val)) return;
        aggregates = aggregates.map(a => a.key === key ? { ...a, pct: val } : a);
        debouncedRecalc();
    }

    function useCustomBatch() {
        customBatchMode = true;
        document.getElementById('batchSize').value = document.getElementById('customBatch').value;
        debouncedRecalc();
    }

    /* ========== CALCULATION ENGINE WITH DEBOUNCING ========== */
    function debouncedRecalc() {
        const now = Date.now();
        if (now - lastUpdateTime > 16) {
            lastUpdateTime = now;
            recalc();
        }
    }

    function recalc() {
        const def = MIX_CLASSES[currentClass];
        batchSize = customBatchMode ? parseFloat(document.getElementById('customBatch').value) || 0 : parseFloat(document.getElementById('batchSize').value);
        bitumenPct = parseFloat(document.getElementById('bitumenPct').value);

        if (!isValidBatchSize(batchSize)) return;
        if (!isValidBitumen(bitumenPct, def.bitumen)) return;

        const bitumenWeight = (batchSize * bitumenPct) / 100;
        const aggWeight = batchSize - bitumenWeight;
        const totalPct = aggregates.reduce((s, a) => s + a.pct, 0);

        const rows = aggregates.map(a => ({
            ...a, weight: totalPct > 0 ? (aggWeight * a.pct) / totalPct : 0,
        }));

        updateUI(rows, totalPct, bitumenWeight, aggWeight, def);
    }

    function updateUI(rows, totalPct, bitumenWeight, aggWeight, def) {
        const tbody = document.getElementById('aggTableBody');
        tbody.innerHTML = rows.map((r, i) => {
            const safeName = translationKeys['agg' + r.key.toUpperCase()] || r.name || '';
            return `
                <tr style="${i % 2 === 0 ? 'background:rgba(30,41,59,0.2);' : ''}border-top:1px solid var(--border-glass);">
                    <td>${DOMPurify.sanitize(safeName)}</td>
                    <td class="center" style="font-family:'SF Mono',Monaco,'Cascadia Code',monospace;font-size:11px;color:var(--text-muted)">${DOMPurify.sanitize(r.note)}</td>
                    <td class="center">
                        <input type="number" min="0" max="100" step="0.5" value="${r.pct}"
                            onchange="MixDesign.updatePct('${r.key}', parseFloat(this.value) || 0)"
                            class="input-cell">
                    </td>
                    <td class="center font-mono" style="color:var(--accent-emerald)">${r.weight.toFixed(2)}</td>
                </tr>
            `;}).join('');

        document.getElementById('totalAggPct').textContent = totalPct.toFixed(1) + '%';
        document.getElementById('totalAggWeight').textContent = aggWeight.toFixed(2);
        document.getElementById('bitumenPctDisplay').textContent = bitumenPct.toFixed(1) + '%';
        document.getElementById('bitumenWeight').textContent = bitumenWeight.toFixed(2);
        document.getElementById('totalBatchWeight').textContent = batchSize.toLocaleString();

        const warn = document.getElementById('pctWarning');
        if (Math.abs(totalPct - 100) > 0.1) {
            warn.textContent = translationKeys.pctSumWarn(totalPct);
            warn.style.display = 'block';
        } else {
            warn.style.display = 'none';
        }

        const bitumenOk = bitumenPct >= def.bitumen[0] && bitumenPct <= def.bitumen[1];
        document.getElementById('bitumenStatus').textContent = bitumenOk ? translationKeys.bitumenOk : translationKeys.bitumenBad;
        document.getElementById('bitumenStatus').className = 'badge ' + (bitumenOk ? 'badge-pass' : 'badge-fail');

        updateStatsGrid(batchSize, bitumenWeight, aggWeight, def);
        updateChart(computeCombined(), def);
        updateSieveTable(computeCombined(), def);
        updateParamSummary(rows, def);
    }

    function updateStatsGrid(batchSize, bitumenWeight, aggWeight, def) {
        document.getElementById('statsGrid').innerHTML = `
            <div class="stat-card"><div class="stat-label">${translationKeys.statBatch}</div><div class="stat-value accent">${batchSize.toLocaleString()}</div><div class="stat-unit">${translationKeys.weightUnit}</div></div>
            <div class="stat-card"><div class="stat-label">${translationKeys.statBitumenWeight}</div><div class="stat-value accent">${bitumenWeight.toFixed(1)}</div><div class="stat-unit">${translationKeys.weightUnit}</div></div>
            <div class="stat-card"><div class="stat-label">${translationKeys.statAggWeight}</div><div class="stat-value accent">${aggWeight.toFixed(1)}</div><div class="stat-unit">${translationKeys.weightUnit}</div></div>
            <div class="stat-card"><div class="stat-label">${translationKeys.statCompliance}</div><div class="stat-value ${aggWeight === 0 ? '' : ''}">${computeCompliance()}</div><div class="stat-unit">%</div></div>
        `;
    }

    function computeCombined() {
        const totalPct = aggregates.reduce((s, a) => s + a.pct, 0);
        if (totalPct === 0) return SIEVES.map(() => 0);
        return SIEVES.map((_, idx) => {
            let sum = 0;
            aggregates.forEach(a => {
                sum += (a.pct / totalPct) * (DEFAULT_GRADATIONS[a.key]?.[idx] || 0);
            });
            return Math.round(sum * 10) / 10;
        });
    }

    function computeCompliance() {
        const def = MIX_CLASSES[currentClass];
        const combined = computeCombined();
        let inSpec = 0;
        SIEVES.forEach((s, i) => {
            if (combined[i] >= def.specLow[i] && combined[i] <= def.specHigh[i]) inSpec++;
        });
        return ((inSpec / SIEVES.length) * 100).toFixed(0);
    }

    /* ========== CHART RENDERING ========== */
    function updateChart(combined, def) {
        const W = 560, H = 320;
        const P = { t: 18, r: 18, b: 50, l: 42 };
        const iW = W - P.l - P.r, iH = H - P.t - P.b;
        const logMin = Math.log10(0.075), logMax = Math.log10(37.5);
        const xOf = (mm) => P.l + ((Math.log10(mm) - logMin) / (logMax - logMin)) * iW;
        const yOf = (pct) => P.t + (1 - pct / 100) * iH;

        const pathFrom = (vals) => SIEVES.map((s, i) => `${i === 0 ? 'M' : 'L'} ${xOf(s).toFixed(1)} ${yOf(vals[i]).toFixed(1)}`).join(' ');
        const areaPath = [...SIEVES.map((s, i) => `${i === 0 ? 'M' : 'L'} ${xOf(s).toFixed(1)} ${yOf(def.specHigh[i]).toFixed(1)}`), ...[...SIEVES].reverse().map((s, i) => `L ${xOf(s).toFixed(1)} ${yOf(def.specLow[SIEVES.length - 1 - i]).toFixed(1)}`), 'Z'].join(' ');

        document.getElementById('chartContainer').innerHTML = `
            <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;" direction="ltr">
                <defs>
                    <linearGradient id="specGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stop-color="#10b981" stop-opacity="0.28" />
                        <stop offset="100%" stop-color="#10b981" stop-opacity="0.08" />
                    </linearGradient>
                </defs>
                <rect x=${P.l} y=${P.t} width=${iW} height=${iH} fill="#0f172a" stroke="#334155" />
                ${[0,20,40,60,80,100].map(p => `
                    <line x1=${P.l} x2=${P.l + iW} y1=${yOf(p)} y2=${yOf(p)} stroke="#1e293b" stroke-width="1" />
                    <text x=${P.l - 6} y=${yOf(p) + 4} font-size="10" fill="#94a3b8" text-anchor="end">${p}%</text>
                `).join('')}
                ${SIEVES.map(s => `
                    <line x1=${xOf(s)} x2=${xOf(s)} y1=${P.t} y2=${P.t + iH} stroke="#1e293b" stroke-width="1" />
                    <text x=${xOf(s)} y=${P.t + iH + 14} font-size="9" fill="#94a3b8" text-anchor="middle">${s}</text>
                `).join('')}
                <path d="${areaPath}" fill="url(#specGrad)" stroke="none" />
                <path d="${pathFrom(def.specHigh)}" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 3" />
                <path d="${pathFrom(def.specLow)}" fill="none" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 3" />
                <path d="${pathFrom(combined)}" fill="none" stroke="#fbbf24" stroke-width="2.5" />
                ${SIEVES.map((s, i) => `<circle cx=${xOf(s)} cy=${yOf(combined[i])} r="3.5" fill="#fbbf24" stroke="#0f172a" stroke-width="1" />`).join('')}
                <text x=${P.l + iW / 2} y=${H - 14} font-size="11" fill="#cbd5e1" text-anchor="middle">Sieve Size (mm)</text>
                <text x=${-(P.t + iH / 2)} y=14 font-size="11" fill="#cbd5e1" text-anchor="middle" transform="rotate(-90)">% Passing</text>
                <g transform="translate(${P.l + 12}, ${P.t + 10})">
                    <rect width="180" height="50" fill="#0b1220" stroke="#334155" rx="4" />
                    <line x1="10" y1="18" x2="32" y2="18" stroke="#fbbf24" stroke-width="2.5" />
                    <text x="38" y="22" font-size="10" fill="#fbbf24">Combined</text>
                    <line x1="10" y1="36" x2="32" y2="36" stroke="#10b981" stroke-width="1.5" stroke-dasharray="4 3" />
                    <text x="38" y="40" font-size="10" fill="#10b981">Spec Limits</text>
                </g>
            </svg>
        `;
    }

    function updateSieveTable(combined, def) {
        SIEVES.forEach((s, i) => {
            const el = document.getElementById('combined-' + s);
            if (el) {
                const inSpec = combined[i] >= def.specLow[i] && combined[i] <= def.specHigh[i];
                el.textContent = combined[i].toFixed(1);
                el.style.color = inSpec ? 'var(--accent-gold)' : 'var(--accent-red)';
                el.style.fontWeight = inSpec ? '600' : '700';
            }
        });
        const violations = SIEVES.filter((s, i) => combined[i] < def.specLow[i] || combined[i] > def.specHigh[i]);
        const violEl = document.getElementById('violations');
        if (violations.length > 0) {
            violEl.textContent = '⚠ ' + translationKeys.violations(violations.map(s => s + 'mm').join(', '));
            violEl.style.display = 'block';
        } else {
            violEl.style.display = 'none';
        }
    }

    function updateParamSummary(rows, def) {
        const totalAggregatePct = rows.reduce((sum, a) => sum + a.pct, 0);
        const minBitumen = def.bitumen[0];
        const maxBitumen = def.bitumen[1];
        document.getElementById('paramSummary').innerHTML = `
            <div style="background:rgba(15,23,42,0.6);border:1px solid var(--border-glass);padding:10px;border-radius:8px;">
                <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;font-size:12px;">
                    <div>
                        <div style="color:var(--text-muted);margin-bottom:4px;">Aggregate Distribution</div>
                        <div style="display:flex;align-items:center;gap:8px;">
                            <div style="width:120px;height:6px;background:rgba(255,255,255,0.1);border-radius:3px;overflow:hidden;">
                                <div style="width:${Math.max(5, Math.min(90, totalAggregatePct))}% ;height:100%;background:linear-gradient(90deg,var(--accent-emerald),var(--accent-gold));"></div>
                            </div>
                            <span style="color:var(--text-primary);font-weight:600;">${totalAggregatePct.toFixed(1)}%</span>
                        </div>
                    </div>
                    <div>
                        <div style="color:var(--text-muted);margin-bottom:4px;">Bitumen Range</div>
                        <div style="color:var(--text-primary);font-weight:600;">${minBitumen}% - ${maxBitumen}%</div>
                    </div>
                    <div>
                        <div style="color:var(--text-muted);margin-bottom:4px;">NMAS Size</div>
                        <div style="color:var(--text-primary);font-weight:600;">${def.nmas} mm</div>
                    </div>
                </div>
            </div>
        `;
    }

    /* ========== DESIGN MANAGEMENT ========== */
    function loadDesigns() {
        try {
            const raw = localStorage.getItem('asphalt_designs_v3');
            savedDesigns = raw ? JSON.parse(raw) : [];
        } catch { savedDesigns = []; }
        renderDesigns();
    }

    function saveDesigns() {
        localStorage.setItem('asphalt_designs_v3', JSON.stringify(savedDesigns));
    }

    function renderDesigns() {
        const container = document.getElementById('savedDesigns');
        if (savedDesigns.length === 0) {
            container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:32px 0;color:#64748b;font-size:14px;border:1px dashed rgba(100,116,139,0.5);border-radius:12px;">${translationKeys.noDesigns}</div>`;
            return;
        }
        container.innerHTML = savedDesigns.map(d => {
            const icon = d.fileType?.startsWith('image/') ? '🖼️' : d.fileType === 'application/pdf' ? '📕' : d.fileName?.endsWith('.json') ? '📄' : '📎';
            const imgHtml = d.fileData && d.fileType?.startsWith('image/') ? `<img src="${DOMPurify.sanitize(d.fileData)}" alt="${DOMPurify.sanitize(d.name)}" style="width:100%;height:120px;object-fit:cover;border-radius:6px;margin:8px 0;border:1px solid var(--border-glass);">` : '';
            return `
                <div class="design-card">
                    <div class="design-header">
                        <div class="design-name">${DOMPurify.sanitize(d.name)}</div>
                        <span class="text-lg">${icon}</span>
                    </div>
                    <div class="design-meta">Class ${d.mixClass} • ${d.bitumenPct.toFixed(1)}% AC • ${d.batchSize} kg</div>
                    <div class="design-meta" style="margin-top:4px;">${translationKeys.uploadedAt}: ${new Date(d.uploadedAt).toLocaleDateString()}</div>
                    ${imgHtml}
                    <div class="design-actions">
                        <button class="btn btn-primary" onclick="MixDesign.applyDesign('${d.id}')">✓ Apply</button>
                        <button class="btn btn-secondary" onclick="MixDesign.deleteDesign('${d.id}')">🗑 Delete</button>
                    </div>
                </div>
            `;}).join('');
    }

    function applyDesign(id) {
        const d = savedDesigns.find(x => x.id === id);
        if (!d) return;
        setClass(d.mixClass);
        document.getElementById('batchSize').value = d.batchSize;
        customBatchMode = false;
        document.getElementById('customBatch').value = '';
        document.getElementById('bitumenPct').value = d.bitumenPct;
        aggregates = d.aggregates.map(a => ({...a}));
        document.getElementById('designCode').value = d.designCode || 'AASHTO T 245';
        document.getElementById('compaction').value = d.compaction || '75 blows - Heavy traffic';
        document.getElementById('application').value = d.application || 'Road paving / Highway works';
        debouncedRecalc();
    }

    function deleteDesign(id) {
        savedDesigns = savedDesigns.filter(x => x.id !== id);
        saveDesigns();
        renderDesigns();
    }

    /* ===== UPLOAD MODAL ===== */
    let uploadFile = null;
    function openUploadModal() { document.getElementById('uploadModal').classList.add('open'); }
    function closeUploadModal() {
        document.getElementById('uploadModal').classList.remove('open');
        uploadFile = null;
        document.getElementById('uploadName').value = '';
        document.getElementById('dropText').textContent = 'Click to select file';
        document.getElementById('submitUpload').disabled = true;
        document.getElementById('fileInput').value = '';
    }
    function handleFileSelect(file) {
        if (!file) return;
        uploadFile = file;
        document.getElementById('uploadName').value = file.name.replace(/\.[^.]+$/, '');
        document.getElementById('dropText').innerHTML = `<strong>${DOMPurify.sanitize(file.name)}</strong><br><span class="text-xs">${(file.size/1024).toFixed(1)} KB</span>`;
        document.getElementById('submitUpload').disabled = false;
    }
    async function submitUpload() {
        const name = document.getElementById('uploadName').value.trim() || uploadFile.name;
        let fileData, parsed = null;
        if (uploadFile.type.startsWith('image/') && uploadFile.size < 2_000_000) {
            fileData = await new Promise(r => { const fr = new FileReader(); fr.onload = () => r(String(fr.result)); fr.readAsDataURL(uploadFile); });
        }
        if (uploadFile.name.toLowerCase().endsWith('.json')) {
            try { parsed = JSON.parse(await uploadFile.text()); } catch {}
        }
        const design = {
            id: Date.now().toString(36),
            name, mixClass: parsed?.mixClass || currentClass,
            bitumenPct: parsed?.bitumenPct ?? bitumenPct,
            batchSize: parsed?.batchSize ?? batchSize,
            aggregates: parsed?.aggregates || aggregates.map(a => ({...a})),
            fileName: uploadFile.name, fileType: uploadFile.type, fileSize: uploadFile.size,
            fileData, uploadedAt: new Date().toISOString(),
            designCode: document.getElementById('designCode').value,
            compaction: document.getElementById('compaction').value,
            application: document.getElementById('application').value,
        };
        savedDesigns.unshift(design);
        saveDesigns();
        renderDesigns();
        closeUploadModal();
    }

    /* ===== GLOBAL ACCESS ===== */
    window.MixDesign = {
        init: () => {
            loadDesigns();
            setClass('D');
        },
        updatePct: updatePct,
        applyDesign: applyDesign,
        deleteDesign: deleteDesign,
        setClass: setClass,
        recalc: debouncedRecalc,
    };
})();

/* ===== DOM SANITIZATION ===== */
var DOMPurify = (function() {
    function createSanitizeElement() {
        var el = document.createElement('div');
        el.innerHTML = '';
        return el;
    }
    /* ========== Floating Action Button Injection ========== */
    (function injectFAB() {
        if (document.getElementById('fab-global')) return;

        var style = document.createElement('style');
        style.textContent = `
.fab-global{position:fixed;bottom:32px;right:32px;width:58px;height:58px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#10b981);box-shadow:0 6px 24px rgba(59,130,246,0.35);z-index:10000;display:flex;align-items:center;justify-content:center;cursor:pointer;transition:all 0.3s cubic-bezier(0.4,0,0.2,1);animation:fabFloat 3s ease-in-out infinite;border:none;outline:none}
.fab-global:hover{transform:scale(1.08) rotate(45deg);box-shadow:0 10px 32px rgba(59,130,246,0.5)}
.fab-global.open{background:linear-gradient(135deg,#ef4444,#f97316);transform:rotate(45deg);animation:none}
.fab-global-icon{width:26px;height:26px;color:#fff;transition:transform 0.3s ease}
.fab-global.open .fab-global-icon{transform:rotate(45deg)}
@keyframes fabFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
.fab-menu-global{position:fixed;bottom:102px;right:32px;width:270px;background:var(--bg-card,#1a1a2e);border:1px solid var(--border-glass,rgba(255,255,255,0.08));border-radius:14px;box-shadow:0 16px 48px rgba(0,0,0,0.5);padding:14px;z-index:9999;opacity:0;visibility:hidden;transform:translateY(16px) scale(0.95);transition:all 0.25s cubic-bezier(0.4,0,0.2,1);transform-origin:bottom right}
.fab-menu-global.open{opacity:1;visibility:visible;transform:translateY(0) scale(1)}
.fab-menu-header-global{display:flex;align-items:center;gap:10px;padding-bottom:12px;margin-bottom:8px;border-bottom:1px solid var(--border-glass,rgba(255,255,255,0.08))}
.fab-menu-icon-global{width:26px;height:26px;border-radius:50%;background:linear-gradient(135deg,#3b82f6,#10b981);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.fab-menu-icon-global svg{width:14px;height:14px;color:#fff}
.fab-menu-title-global{font-size:15px;font-weight:700;color:var(--text-primary,#fff)}
.fab-menu-items-global{display:flex;flex-direction:column;gap:6px}
.fab-menu-item-global{display:flex;align-items:center;gap:10px;padding:10px 12px;border-radius:10px;background:transparent;border:none;color:var(--text-secondary,#bbb);font-size:13px;font-weight:500;cursor:pointer;transition:all 0.2s ease;text-decoration:none}
.fab-menu-item-global:hover{background:rgba(59,130,246,0.08);color:var(--text-primary,#fff);transform:translateX(3px)}
.fab-menu-item-global svg{width:18px;height:18px;color:var(--accent-blue,#3b82f6);flex-shrink:0}
.fab-menu-item-global span{flex:1}
.fab-backdrop-global{position:fixed;inset:0;z-index:9998;background:transparent;display:none}
.fab-backdrop-global.show{display:block}

/* modals global */
.m-overlay-global{display:none;position:fixed;inset:0;background:rgba(0,0,0,0.6);backdrop-filter:blur(6px);z-index:11000;justify-content:center;align-items:center;padding:20px}
.m-overlay-global.active{display:flex}
.m-box-global{background:var(--bg-card,#1a1a2e);border:1px solid var(--border-glass,rgba(255,255,255,0.08));border-radius:16px;width:100%;max-height:85vh;overflow:hidden;display:flex;flex-direction:column;box-shadow:0 25px 60px rgba(0,0,0,0.5);animation:modalIn 0.3s ease}
@keyframes modalIn{from{transform:translateY(30px) scale(0.96);opacity:0}to{transform:translateY(0) scale(1);opacity:1}}
.m-box-global-header{display:flex;justify-content:space-between;align-items:center;padding:18px 22px;border-bottom:1px solid var(--border-glass,rgba(255,255,255,0.08))}
.m-box-global-header h2{margin:0;font-size:17px;font-weight:700;color:var(--text-primary,#fff)}
.m-box-global-close{background:none;border:none;color:var(--text-secondary,#aaa);font-size:26px;cursor:pointer;padding:0 4px;line-height:1;transition:color 0.2s}
.m-box-global-close:hover{color:#ef4444}
.m-box-global-body{padding:20px 22px;overflow-y:auto;flex:1;text-align:right}
.m-box-global.wide{max-width:700px}
.m-box-global.narrow{max-width:440px}
.m-box-global.medium{max-width:500px}

/* features */
.f-list-global{padding:0}
.f-item-global{border:1px solid var(--border-glass,rgba(255,255,255,0.06));border-radius:10px;margin-bottom:8px;overflow:hidden}
.f-title-global{display:flex;align-items:center;gap:10px;padding:13px 16px;font-size:14px;font-weight:600;color:var(--text-primary,#fff);background:rgba(255,255,255,0.03);cursor:pointer;user-select:none;margin:0;transition:background 0.2s}
.f-title-global:hover{background:rgba(59,130,246,0.08)}
.f-title-global svg:first-child{color:var(--accent-blue,#3b82f6);flex-shrink:0}
.f-title-global span{flex:1}
.f-arrow-global{color:var(--text-secondary,#888);transition:transform 0.3s;flex-shrink:0}
.f-title-global.open .f-arrow-global{transform:rotate(180deg)}
.f-body-global{max-height:0;overflow:hidden;transition:max-height 0.35s ease,padding 0.3s ease;padding:0 16px}
.f-title-global.open+.f-body-global{max-height:2000px;padding:10px 16px 14px}
.f-body-global ul{margin:0;padding-right:18px;list-style:none}
.f-body-global li{font-size:13px;color:var(--text-secondary,#ccc);padding:3px 0;position:relative}
.f-body-global li::before{content:"‹";position:absolute;right:-14px;color:var(--accent-blue,#3b82f6);font-weight:bold}
.f-body-global p{font-size:13px;color:var(--text-secondary,#ccc);margin:4px 0;line-height:1.6}

/* rating */
.r-body-global{text-align:center}
.r-stars-global{display:flex;justify-content:center;gap:8px;margin:20px 0 14px}
.r-star-global{background:none;border:none;font-size:42px;color:var(--text-tertiary,#444);cursor:pointer;padding:0;line-height:1;transition:color 0.2s,transform 0.2s}
.r-star-global:hover,.r-star-global.active{color:#f59e0b;transform:scale(1.15)}
.r-label-global{font-size:14px;font-weight:600;color:#f59e0b;min-height:22px;margin-bottom:18px}
.r-note-global{font-size:14px;color:var(--text-secondary,#bbb);margin-bottom:20px}
.r-submit-global{background:linear-gradient(135deg,#f59e0b,#f97316)!important;width:100%}

/* contact */
.c-form-global .c-group-global{margin-bottom:16px}
.c-form-global label{display:block;font-size:13px;font-weight:600;color:var(--text-primary,#fff);margin-bottom:6px}
.c-form-global input,.c-form-global textarea,.c-form-global select{width:100%;padding:11px 13px;background:rgba(255,255,255,0.05);border:1px solid var(--border-glass,rgba(255,255,255,0.1));border-radius:10px;color:var(--text-primary,#fff);font-family:inherit;font-size:13px;box-sizing:border-box}
.c-form-global input:focus,.c-form-global textarea:focus{outline:none;border-color:var(--accent-blue,#3b82f6)}
.c-form-global textarea{resize:vertical}
.phone-row-global{display:flex;gap:10px}
.phone-row-global select{width:130px;flex-shrink:0}
.phone-row-global input{flex:1}
.c-status-global{font-size:13px;margin-top:4px}
.c-status-global.success{color:#10b981}
.c-status-global.error{color:#ef4444}
.c-submit-global{width:100%}
`;
        document.head.appendChild(style);

        var html = `
<div class="fab-backdrop-global" id="fab-backdrop-global"></div>
<button class="fab-global" id="fab-global" aria-label="Quick actions">
  <svg class="fab-global-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
</button>
<div class="fab-menu-global" id="fab-menu-global">
  <div class="fab-menu-header-global">
    <div class="fab-menu-icon-global"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg></div>
    <div class="fab-menu-title-global">Quick Actions</div>
  </div>
  <div class="fab-menu-items-global">
    <a class="fab-menu-item-global" id="g-fab-features"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg><span>المميزات</span></a>
    <a class="fab-menu-item-global" id="g-fab-values"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg><span>قيمنا</span></a>
    <a class="fab-menu-item-global" id="g-fab-contact"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg><span>اتصل بنا</span></a>
  </div>
</div>

<!-- Features Modal -->
<div class="m-overlay-global" id="g-modal-features">
  <div class="m-box-global wide">
    <div class="m-box-global-header"><h2>مميزات سمارت لاب</h2><button class="m-box-global-close" id="g-close-features">&times;</button></div>
    <div class="m-box-global-body"><div class="f-list-global">
      <div class="f-item-global"><h3 class="f-title-global open" onclick="this.classList.toggle('open')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>لوحة التحكم الرئيسية</span><svg class="f-arrow-global" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg></h3><div class="f-body-global"><p>لوحة تحكم شاملة تعرض إحصائيات فورية عن كل اختبارات الموقع، أحدث النتائج، مؤشرات الأداء، وملخص سريع لنشاط المستخدمين.</p></div></div>
      <div class="f-item-global"><h3 class="f-title-global" onclick="this.classList.toggle('open')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg><span>اختبارات الخرسانة</span><svg class="f-arrow-global" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg></h3><div class="f-body-global"><ul><li>Slump test - اختبار الهبوط</li><li>Compressive Strength - مقاومة الضغط</li><li>Unit Weight - وزن الوحدة</li><li>Temperature - درجة الحرارة</li><li>مع إمكانية تنزيل التقارير (PDF) والمراجع والبروتوكولات</li></ul></div></div>
      <div class="f-item-global"><h3 class="f-title-global" onclick="this.classList.toggle('open')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg><span>اختبارات التربة</span><svg class="f-arrow-global" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg></h3><div class="f-body-global"><ul><li>Atterberg Limits (LL, PL, PI)</li><li>Sieve Analysis - التحليل المنخلي</li><li>Proctor (Standard & Modified)</li><li>CBR (California Bearing Ratio)</li><li>Triaxial Test</li><li>Direct Shear Test</li></ul></div></div>
      <div class="f-item-global"><h3 class="f-title-global" onclick="this.classList.toggle('open')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg><span>اختبارات الأسفلت</span><svg class="f-arrow-global" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg></h3><div class="f-body-global"><ul><li>Marshall Test</li><li>Extraction - استخلاص</li><li>Penetration - الاختراق</li><li>Softening Point - نقطة التليين</li><li>Viscosity - اللزوجة</li><li>مع ملفات دعم للتحميل (إجراءات، مراجع، تقارير)</li></ul></div></div>
      <div class="f-item-global"><h3 class="f-title-global" onclick="this.classList.toggle('open')"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg><span>التقارير والملفات</span><svg class="f-arrow-global" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><polyline points="6 9 12 15 18 9"/></svg></h3><div class="f-body-global"><p>لكل اختبار في الموقع تجد: تقرير (Report) للتحميل بصيغة PDF، بروتوكول (Procedure) شرح خطوات الاختبار، ومراجع (References) علمية.</p></div></div>
    </div></div>
  </div>
</div>

<!-- Rating Modal -->
<div class="m-overlay-global" id="g-modal-rating">
  <div class="m-box-global narrow">
    <div class="m-box-global-header"><h2>قيمنا</h2><button class="m-box-global-close" id="g-close-rating">&times;</button></div>
    <div class="m-box-global-body r-body-global">
      <p class="r-note-global">ما رأيك في سمارت لاب؟</p>
      <div class="r-stars-global" id="g-stars">
        <button class="r-star-global" data-val="1">&#9733;</button>
        <button class="r-star-global" data-val="2">&#9733;</button>
        <button class="r-star-global" data-val="3">&#9733;</button>
        <button class="r-star-global" data-val="4">&#9733;</button>
        <button class="r-star-global" data-val="5">&#9733;</button>
      </div>
      <div class="r-label-global" id="g-rate-label"></div>
      <button class="btn-primary r-submit-global" id="g-rate-submit">إرسال التقييم</button>
    </div>
  </div>
</div>

<!-- Contact Modal -->
<div class="m-overlay-global" id="g-modal-contact">
  <div class="m-box-global medium">
    <div class="m-box-global-header"><h2>اتصل بنا</h2><button class="m-box-global-close" id="g-close-contact">&times;</button></div>
    <div class="m-box-global-body">
      <form class="c-form-global" id="g-contact-form">
        <div class="c-group-global"><label for="g-email">البريد الإلكتروني</label><input type="email" id="g-email" required placeholder="your@email.com"></div>
        <div class="c-group-global"><label for="g-phone">رقم الموبايل</label><div class="phone-row-global"><select id="g-country"><option value="+20">🇪🇬 +20</option><option value="+966">🇸🇦 +966</option><option value="+971">🇦🇪 +971</option><option value="+1">🇺🇸 +1</option><option value="+44">🇬🇧 +44</option></select><input type="tel" id="g-phone" required placeholder="500000000"></div></div>
        <div class="c-group-global"><label for="g-msg">الرسالة</label><textarea id="g-msg" rows="4" required placeholder="اكتب رسالتك هنا..."></textarea></div>
        <div class="c-status-global" id="g-contact-status"></div>
        <button type="submit" class="btn-primary c-submit-global">إرسال</button>
      </form>
    </div>
  </div>
</div>`;

        var wrapper = document.createElement('div');
        wrapper.innerHTML = html;
        document.body.appendChild(wrapper);

        var fabBtn = document.getElementById('fab-global');
        var fabMenu = document.getElementById('fab-menu-global');
        var fabBackdrop = document.getElementById('fab-backdrop-global');
        var fabOpen = false;

        function openFab() { fabOpen = true; fabBtn.classList.add('open'); fabMenu.classList.add('open'); fabBackdrop.classList.add('show'); }
        function closeFab() { fabOpen = false; fabBtn.classList.remove('open'); fabMenu.classList.remove('open'); fabBackdrop.classList.remove('show'); }
        fabBtn.addEventListener('click', function() { fabOpen ? closeFab() : openFab(); });
        fabBackdrop.addEventListener('click', closeFab);
        document.addEventListener('keydown', function(e) { if (e.key === 'Escape' && fabOpen) closeFab(); });

        function modalOpen(id) { document.getElementById(id).classList.add('active'); document.body.style.overflow = 'hidden'; closeFab(); }
        function modalClose(id) { document.getElementById(id).classList.remove('active'); document.body.style.overflow = ''; }

        document.getElementById('g-fab-features').addEventListener('click', function(e) { e.preventDefault(); modalOpen('g-modal-features'); });
        document.getElementById('g-fab-values').addEventListener('click', function(e) { e.preventDefault(); modalOpen('g-modal-rating'); });
        document.getElementById('g-fab-contact').addEventListener('click', function(e) { e.preventDefault(); modalOpen('g-modal-contact'); });

        document.getElementById('g-close-features').addEventListener('click', function() { modalClose('g-modal-features'); });
        document.getElementById('g-close-rating').addEventListener('click', function() { modalClose('g-modal-rating'); });
        document.getElementById('g-close-contact').addEventListener('click', function() { modalClose('g-modal-contact'); });

        document.getElementById('g-modal-features').addEventListener('click', function(e) { if (e.target === this) modalClose('g-modal-features'); });
        document.getElementById('g-modal-rating').addEventListener('click', function(e) { if (e.target === this) modalClose('g-modal-rating'); });
        document.getElementById('g-modal-contact').addEventListener('click', function(e) { if (e.target === this) modalClose('g-modal-contact'); });

        /* rating logic */
        var gCurrentRate = 0;
        var gLabels = ['', 'سيء', 'ضعيف', 'جيد', 'جيد جداً', 'ممتاز'];
        var gStars = document.querySelectorAll('#g-stars .r-star-global');
        function gHighlight(n) { gStars.forEach(function(s, i) { s.style.color = i < n ? '#f59e0b' : ''; }); }
        function gReset() { gStars.forEach(function(s, i) { s.style.color = i < gCurrentRate ? '#f59e0b' : ''; s.classList.toggle('active', i < gCurrentRate); }); }
        gStars.forEach(function(s) {
            s.addEventListener('mouseenter', function() { gHighlight(parseInt(this.dataset.val)); });
            s.addEventListener('mouseleave', gReset);
            s.addEventListener('click', function() {
                gCurrentRate = parseInt(this.dataset.val);
                gReset();
                document.getElementById('g-rate-label').textContent = gLabels[gCurrentRate] + ' (' + gCurrentRate + '/5)';
            });
        });
        document.getElementById('g-rate-submit').addEventListener('click', function() {
            if (!gCurrentRate) return;
            var btn = this;
            btn.textContent = '✓ شكراً لك!';
            btn.style.background = 'linear-gradient(135deg, #10b981, #059669) !important';
            setTimeout(function() {
                modalClose('g-modal-rating');
                btn.textContent = 'إرسال التقييم';
                btn.style.background = '';
                gCurrentRate = 0;
                gReset();
                document.getElementById('g-rate-label').textContent = '';
            }, 1500);
        });

        /* contact logic */
        document.getElementById('g-contact-form').addEventListener('submit', function(e) {
            e.preventDefault();
            var email = document.getElementById('g-email').value.trim();
            var country = document.getElementById('g-country').value;
            var phone = document.getElementById('g-phone').value.trim();
            var msg = document.getElementById('g-msg').value.trim();
            var status = document.getElementById('g-contact-status');
            var btn = this.querySelector('.c-submit-global');
            if (!email || !phone || !msg) {
                status.className = 'c-status-global error';
                status.textContent = 'يرجى ملء جميع الحقول المطلوبة.';
                return;
            }
            btn.disabled = true;
            btn.textContent = 'جاري الإرسال...';
            var mailto = 'mailto:info@fimtosoft.com?subject=' + encodeURIComponent('اتصال من سمارت لاب - ' + email) + '&body=' + encodeURIComponent('البريد: ' + email + '\nالهاتف: ' + country + ' ' + phone + '\n\nالرسالة:\n' + msg);
            setTimeout(function() {
                window.location.href = mailto;
                status.className = 'c-status-global success';
                status.textContent = '✓ جاري فتح بريدك الإلكتروني...';
                btn.textContent = 'إرسال';
                btn.disabled = false;
                setTimeout(function() {
                    modalClose('g-modal-contact');
                    document.getElementById('g-contact-form').reset();
                    status.textContent = '';
                }, 2000);
            }, 800);
        });
    })();

    return {
        sanitize: function(text) {
            if (!text) return '';
            var el = createSanitizeElement();
            el.textContent = text;
            return el.textContent;
        }
    };
})();
