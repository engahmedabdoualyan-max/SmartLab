/* ================================================================
   SmartLAP — UI/UX Enhancements
   Scroll animations, animated counters, and interactive effects
   ================================================================ */

(function() {
    'use strict';

    // ================================================================
    // 1. INTERSECTION OBSERVER — Scroll-triggered animations
    // ================================================================
    function initScrollAnimations() {
        var elements = document.querySelectorAll('.fade-up, .scale-in, .slide-in-left, .slide-in-right, .stagger-fade');
        if (elements.length === 0) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        });

        elements.forEach(function(el) {
            observer.observe(el);
        });
    }

    // ================================================================
    // 2. ANIMATED COUNTERS — Count up numbers when visible
    // ================================================================
    function initAnimatedCounters() {
        var counters = document.querySelectorAll('.animated-counter');
        if (counters.length === 0) {
            // Auto-enable for stat-value elements
            counters = document.querySelectorAll('.stat-value, .stat-card .stat-value, .stat-card-enhanced .stat-value');
        }
        if (counters.length === 0) return;

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting && !entry.target.dataset.counted) {
                    entry.target.dataset.counted = 'true';
                    var target = entry.target;
                    var finalText = target.textContent.trim();
                    var finalNum = parseFloat(finalText.replace(/[^0-9.-]/g, ''));
                    var suffix = finalText.replace(/[0-9.-]/g, '').trim();
                    var prefix = '';

                    // Extract prefix (e.g., currency symbols)
                    var prefixMatch = finalText.match(/^[^0-9.-]+/);
                    if (prefixMatch) prefix = prefixMatch[0];

                    if (isNaN(finalNum)) return;

                    // If it's a percentage, split into number part and sign
                    var isPercent = suffix === '%' || finalText.indexOf('%') > -1;
                    var percentSign = '';
                    if (isPercent) {
                        percentSign = '%';
                        suffix = suffix.replace('%', '');
                    }

                    var duration = 1200;
                    var startTime = null;

                    function easeOutCubic(t) {
                        return 1 - Math.pow(1 - t, 3);
                    }

                    function animate(timestamp) {
                        if (!startTime) startTime = timestamp;
                        var elapsed = timestamp - startTime;
                        var progress = Math.min(elapsed / duration, 1);
                        var easedProgress = easeOutCubic(progress);
                        var current = easedProgress * finalNum;

                        var displayStr = prefix + current.toFixed(0) + (percentSign ? percentSign : '') + (suffix ? ' ' + suffix : '');
                        // For small numbers, show decimals
                        if (finalNum < 20 && finalNum % 1 !== 0) {
                            displayStr = prefix + current.toFixed(1) + (percentSign ? percentSign : '') + (suffix ? ' ' + suffix : '');
                        }

                        target.textContent = displayStr;

                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        } else {
                            // Ensure final value is exact
                            target.textContent = finalText;
                            target.classList.add('count-up');
                        }
                    }

                    requestAnimationFrame(animate);
                }
            });
        }, { threshold: 0.3 });

        counters.forEach(function(el) {
            observer.observe(el);
        });
    }

    // ================================================================
    // 3. HEADER SCROLL EFFECT
    // ================================================================
    function initHeaderScroll() {
        var headers = document.querySelectorAll('.enhanced-header');
        if (headers.length === 0) return;

        var ticking = false;
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(function() {
                    var scrollY = window.scrollY;
                    headers.forEach(function(header) {
                        if (scrollY > 10) {
                            header.classList.add('scrolled');
                        } else {
                            header.classList.remove('scrolled');
                        }
                    });
                    ticking = false;
                });
                ticking = true;
            }
        }

        window.addEventListener('scroll', onScroll, { passive: true });
        // Check initial state
        onScroll();
    }

    // ================================================================
    // 4. RIPPLE EFFECT ON BUTTONS
    // ================================================================
    function initRippleEffect() {
        document.addEventListener('click', function(e) {
            var btn = e.target.closest('.ripple-btn, .btn-primary, .btn-secondary, .btn-submit');
            if (!btn) return;

            // Don't add ripple if already has custom ripple
            if (btn.classList.contains('ripple-btn')) return;

            var rect = btn.getBoundingClientRect();
            var x = ((e.clientX - rect.left) / rect.width) * 100;
            var y = ((e.clientY - rect.top) / rect.height) * 100;
            btn.style.setProperty('--x', x + '%');
            btn.style.setProperty('--y', y + '%');
        });
    }

    // ================================================================
    // 5. SKELETON LOADING
    // ================================================================
    function showSkeleton(containerId, count) {
        var container = document.getElementById(containerId);
        if (!container) return;
        count = count || 3;
        var html = '<div class="skeleton-grid">';
        for (var i = 0; i < count; i++) {
            html += '<div class="skeleton skeleton-card">' +
                '<div class="skeleton skeleton-icon"></div>' +
                '<div class="skeleton skeleton-line medium"></div>' +
                '<div class="skeleton skeleton-line"></div>' +
                '<div class="skeleton skeleton-line short"></div>' +
            '</div>';
        }
        html += '</div>';
        container.innerHTML = html;
    }

    function hideSkeleton(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var skeletons = container.querySelectorAll('.skeleton-grid');
        skeletons.forEach(function(s) {
            s.style.opacity = '0';
            s.style.transition = 'opacity 0.3s';
            setTimeout(function() { s.remove(); }, 300);
        });
    }

    // ================================================================
    // 6. TOOLTIP HELPER
    // ================================================================
    function initTooltips() {
        document.querySelectorAll('[data-tooltip]').forEach(function(el) {
            el.addEventListener('mouseenter', function(e) {
                var tooltip = document.createElement('div');
                tooltip.className = 'tooltip-enhanced';
                tooltip.textContent = el.dataset.tooltip;
                document.body.appendChild(tooltip);

                var rect = el.getBoundingClientRect();
                tooltip.style.position = 'fixed';
                tooltip.style.top = (rect.top - tooltip.offsetHeight - 8) + 'px';
                tooltip.style.left = (rect.left + rect.width / 2 - tooltip.offsetWidth / 2) + 'px';
                tooltip.style.zIndex = '99999';
                tooltip.style.background = 'rgba(15,23,42,0.92)';
                tooltip.style.backdropFilter = 'blur(8px)';
                tooltip.style.color = 'white';
                tooltip.style.padding = '6px 12px';
                tooltip.style.borderRadius = '8px';
                tooltip.style.fontSize = '11px';
                tooltip.style.fontWeight = '600';
                tooltip.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
                tooltip.style.border = '1px solid rgba(255,255,255,0.08)';
                tooltip.style.animation = 'fadeIn 0.2s ease';
                tooltip.style.pointerEvents = 'none';
                tooltip.style.whiteSpace = 'nowrap';

                el._tooltipEl = tooltip;
            });

            el.addEventListener('mouseleave', function() {
                if (el._tooltipEl) {
                    el._tooltipEl.remove();
                    el._tooltipEl = null;
                }
            });
        });
    }

    // ================================================================
    // 7. ADD ENHANCED CLASSES TO DOM ELEMENTS
    // ================================================================
    function applyEnhancedClasses() {
        // Add glass effect to existing login split if present
        var loginSplit = document.querySelector('.login-split');
        if (loginSplit && !loginSplit.classList.contains('glass-login-split')) {
            loginSplit.classList.add('glass-login-split');
        }

        // Add enhanced class to login-brand if present
        var loginBrand = document.querySelector('.login-brand');
        if (loginBrand && !loginBrand.classList.contains('enhanced-brand')) {
            loginBrand.classList.add('enhanced-brand');
        }

        // Add enhanced class to headers
        document.querySelectorAll('.app-header').forEach(function(h) {
            if (!h.classList.contains('enhanced-header')) {
                h.classList.add('enhanced-header');
            }
        });

        // Add enhanced class to header logos
        document.querySelectorAll('.header-logo').forEach(function(l) {
            if (!l.classList.contains('enhanced-header-logo')) {
                l.classList.add('enhanced-header-logo');
            }
        });

        // Add enhanced class to header titles
        document.querySelectorAll('.header-title').forEach(function(t) {
            if (!t.classList.contains('enhanced-header-title')) {
                t.classList.add('enhanced-header-title');
            }
        });

        // Add glass effect to panels
        document.querySelectorAll('.panel').forEach(function(p) {
            if (!p.classList.contains('panel-enhanced')) {
                p.classList.add('panel-enhanced');
            }
        });

        // Add enhanced class to panel headers
        document.querySelectorAll('.panel-header').forEach(function(ph) {
            if (!ph.classList.contains('panel-header-enhanced')) {
                ph.classList.add('panel-header-enhanced');
            }
        });

        // Add enhanced class to panel bodies
        document.querySelectorAll('.panel-body').forEach(function(pb) {
            if (!pb.classList.contains('panel-body-enhanced')) {
                pb.classList.add('panel-body-enhanced');
            }
        });

        // Add enhanced class to stat cards
        document.querySelectorAll('.stat-card').forEach(function(sc) {
            if (!sc.classList.contains('stat-card-enhanced')) {
                sc.classList.add('stat-card-enhanced');
            }
        });

        // Add fade-up to test cards
        document.querySelectorAll('.test-card').forEach(function(tc) {
            if (!tc.classList.contains('test-card-enhanced')) {
                tc.classList.add('test-card-enhanced');
            }
        });

        // Add fade-up to domain cards
        document.querySelectorAll('.domain-card').forEach(function(dc) {
            if (!dc.classList.contains('domain-card-enhanced')) {
                dc.classList.add('domain-card-enhanced');
            }
        });

        // Add soft UI to reading cards
        document.querySelectorAll('.reading-card').forEach(function(rc) {
            if (!rc.classList.contains('reading-card-enhanced')) {
                rc.classList.add('reading-card-enhanced');
            }
        });

        // Add ripple effect to buttons
        document.querySelectorAll('.btn-primary, .btn-secondary, .btn-submit, .btn-google, .btn-guest').forEach(function(b) {
            if (!b.classList.contains('ripple-btn')) {
                b.classList.add('ripple-btn');
            }
            if (!b.classList.contains('btn-3d')) {
                b.classList.add('btn-3d');
            }
        });

        // Add gradient class to primary buttons
        document.querySelectorAll('.btn-primary').forEach(function(b) {
            if (!b.classList.contains('btn-gradient')) {
                b.classList.add('btn-gradient');
            }
        });

        // Add slideshow animation order to test cards in grids
        document.querySelectorAll('.tests-grid').forEach(function(grid) {
            grid.classList.add('stagger-fade');
        });

        // Add enhanced FAB
        var fabContainer = document.getElementById('fab-container');
        if (fabContainer && !fabContainer.classList.contains('fab-enhanced')) {
            fabContainer.classList.add('fab-enhanced');
        }

        // Add enhanced footer
        var footer = document.querySelector('.site-footer');
        if (footer && !footer.classList.contains('footer-enhanced')) {
            footer.classList.add('footer-enhanced');
        }
        var footerBottom = document.querySelector('.footer-bottom');
        if (footerBottom && !footerBottom.classList.contains('footer-bottom-enhanced')) {
            footerBottom.classList.add('footer-bottom-enhanced');
        }

        // Add stretched link behavior to test cards
        document.querySelectorAll('.test-card, .domain-card').forEach(function(card) {
            if (!card.querySelector('.stretched-link')) {
                // Make the entire card clickable via its link or onclick
                if (card.tagName === 'A') {
                    card.classList.add('stretched-link-container');
                }
            }
        });

        // Enhanced tables
        document.querySelectorAll('.strike-log table, .history-table, .stats-table').forEach(function(tbl) {
            if (!tbl.classList.contains('table-enhanced')) {
                tbl.classList.add('table-enhanced');
            }
        });

        // Enhanced form elements
        document.querySelectorAll('select[id$="-select"], select[id^="agency-select"], select.lang-select').forEach(function(sel) {
            if (!sel.classList.contains('form-select-enhanced')) {
                sel.classList.add('form-select-enhanced');
            }
        });

        // Enhanced inputs
        document.querySelectorAll('input[type="text"], input[type="email"], input[type="password"], input[type="number"]').forEach(function(inp) {
            // Only add to form inputs within panels or auth forms
            if (inp.closest('.form-group, .form-field, .panel-body, .auth-form')) {
                if (!inp.classList.contains('form-input-enhanced')) {
                    inp.classList.add('form-input-enhanced');
                }
            }
        });

        // Add skeleton loading areas
        var domainList = document.getElementById('domains-list');
        if (domainList && domainList.textContent.trim() === 'Loading...') {
            showSkeleton('domains-list', 3);
        }
    }

    // ================================================================
    // 8. DEMO PARTICLES FOR LOGIN
    // ================================================================
    function addLoginParticles() {
        var loginPage = document.querySelector('.login-page');
        if (!loginPage) return;
        // Check if particles already exist
        if (loginPage.querySelector('.login-particle-overlay')) return;

        var overlay = document.createElement('div');
        overlay.className = 'login-particle-overlay';
        for (var i = 0; i < 8; i++) {
            var particle = document.createElement('div');
            particle.className = 'login-particle';
            overlay.appendChild(particle);
        }
        // Insert at the beginning of login page
        loginPage.insertBefore(overlay, loginPage.firstChild);
    }

    // ================================================================
    // INIT
    // ================================================================
    function init() {
        addLoginParticles();
        applyEnhancedClasses();
        initScrollAnimations();
        initAnimatedCounters();
        initHeaderScroll();
        initRippleEffect();
        initTooltips();

        // Re-initialize after dynamic content changes
        var observer = new MutationObserver(function() {
            applyEnhancedClasses();
            initScrollAnimations();
            initAnimatedCounters();
        });
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // Wait for DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();

