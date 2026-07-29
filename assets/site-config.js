var SITE_CONFIG = (function() {
    var defaults = {
        logo: '/assets/logo.png',
        logoAlt: 'smartLAB',
        siteName: 'smartLAB',
        siteNameAr: 'سمارت لاب',
        favicon: '/favicon.ico'
    };

    try {
        var saved = localStorage.getItem('smartlab_settings');
        if (saved) {
            var parsed = JSON.parse(saved);
            if (parsed.logo && parsed.logo.indexOf('data:') === 0) {
                defaults.logo = parsed.logo;
            } else if (parsed.logo && parsed.logo !== '../assets/logo.png' && parsed.logo !== '/assets/logo.png') {
                defaults.logo = parsed.logo;
            }
            if (parsed.siteName) defaults.siteName = parsed.siteName;
            if (parsed.siteNameAr) defaults.siteNameAr = parsed.siteNameAr;
            if (parsed.favicon) defaults.favicon = parsed.favicon;
        }
    } catch(e) {}

    return defaults;
})();
