document.addEventListener('DOMContentLoaded', () => {

    // Trigger calculation function
    const triggerCalculation = (tabId) => {
        const form = document.getElementById(`${tabId}-form`);
        if (form) {
            const submitEvent = new Event('submit', { cancelable: true });
            form.dispatchEvent(submitEvent);
        }
    };

    // Trigger calculation for the initial tab
    const initialTab = document.querySelector('.nav-link.active');
    if (initialTab) {
        const initialTabId = initialTab.id.replace('-tab', '');
        triggerCalculation(initialTabId);
    }

    const tabElms = document.querySelectorAll('button[data-bs-toggle="tab"]');
    tabElms.forEach(tabElm => {
        tabElm.addEventListener('shown.bs.tab', event => {
            const tabId = event.target.id.replace('-tab', '');
            triggerCalculation(tabId);
        });
    });

    // Format number inputs with commas
    document.querySelectorAll('.format-number').forEach(input => {
        input.addEventListener('input', (e) => {
            let value = e.target.value.replace(/,/g, '');
            if (!isNaN(value) && value.length > 0) {
                e.target.value = formatNumber(value);
            }
        });
    });

    // Auto-create sliders for inputs with has-slider
    document.querySelectorAll('.has-slider').forEach(input => {
        const rangeMin = parseFloat(input.getAttribute('data-range-min') || '0');
        const rangeMax = parseFloat(input.getAttribute('data-range-max') || '100');
        const rangeStep = parseFloat(input.getAttribute('data-range-step') || '1');
        const wrapper = document.createElement('div');
        wrapper.className = 'slider-wrapper';
        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = String(rangeMin);
        slider.max = String(rangeMax);
        slider.step = String(rangeStep);

        // Ensure number input accepts decimals matching slider step
        if (input.type === 'number') {
            input.step = String(rangeStep);
        }

        const isCurrency = input.classList.contains('format-number');
        const parseValue = (val) => isCurrency ? parseNumber(val) : parseFloat(val);
        const formatValue = (num) => isCurrency ? formatNumber(num) : String(num);

        // Initialize slider position from input value
        slider.value = String(parseValue(input.value) || rangeMin);

        // Keep in sync: slider -> input
        slider.addEventListener('input', () => {
            input.value = formatValue(Number(slider.value));
            // Trigger calculation debounced
            const activeTab = document.querySelector('.nav-link.active');
            if (activeTab) {
                const tabId = activeTab.id.replace('-tab', '');
                triggerCalculation(tabId);
            }
        });

        // input -> slider
        input.addEventListener('change', () => {
            const parsed = parseValue(input.value);
            if (!isNaN(parsed)) {
                slider.value = String(parsed);
            }
        });

        // Insert after input
        input.closest('.mb-3')?.appendChild(wrapper);
        wrapper.appendChild(slider);
    });

    // Step-up mode toggle for SIP
    const stepUpMode = document.getElementById('sip-step-up-mode');
    if (stepUpMode) {
        const stepUpInput = document.getElementById('sip-step-up');
        const stepUpUnit = document.getElementById('sip-step-up-unit');
        const amountLabel = document.getElementById('sip-amount-label');
        const cadenceSel = document.getElementById('sip-cadence');
        
        const updateUI = () => {
            if (stepUpMode.value === 'percent') {
                stepUpUnit.textContent = '%';
                stepUpInput.setAttribute('data-range-max', '20');
                stepUpInput.setAttribute('data-range-step', '1');
                stepUpInput.value = '0';
            } else {
                stepUpUnit.textContent = '$';
                stepUpInput.setAttribute('data-range-max', '10000');
                stepUpInput.setAttribute('data-range-step', '100');
                stepUpInput.value = '1000';
            }
            
            // Update slider if it exists
            const slider = stepUpInput.closest('.mb-3')?.querySelector('input[type="range"]');
            if (slider) {
                slider.max = stepUpInput.getAttribute('data-range-max');
                slider.step = stepUpInput.getAttribute('data-range-step');
                slider.value = stepUpInput.value;
            }
            
            if (amountLabel && cadenceSel) {
                amountLabel.textContent = cadenceSel.value === 'weekly' ? 'Weekly Investment' : (cadenceSel.value === 'quarterly' ? 'Quarterly Investment' : 'Monthly Investment');
            }
        };
        
        stepUpMode.addEventListener('change', updateUI);
        cadenceSel?.addEventListener('change', updateUI);
        updateUI();
    }

    // SWP cadence label update
    const swpCadenceSel = document.getElementById('swp-cadence');
    const swpWithdrawalLabel = document.getElementById('swp-withdrawal-label');
    const updateSwpLabel = () => {
        if (!swpCadenceSel || !swpWithdrawalLabel) return;
        const labelMap = { weekly: 'Weekly Withdrawal', monthly: 'Monthly Withdrawal', quarterly: 'Quarterly Withdrawal' };
        swpWithdrawalLabel.textContent = labelMap[swpCadenceSel.value] || 'Withdrawal';
    };
    swpCadenceSel?.addEventListener('change', updateSwpLabel);
    updateSwpLabel();

    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // PNG export buttons (clean export)
    document.querySelectorAll('.btn-export-png').forEach(btn => {
        btn.addEventListener('click', async () => {
            const targetId = btn.getAttribute('data-target');
            const container = document.getElementById(targetId);
            if (!container) return;

            const originalScrollY = window.scrollY;
            document.body.classList.add('exporting');
            // Scroll the container into view to ensure images/fonts are loaded
            container.scrollIntoView({ block: 'center' });

            const bg = getComputedStyle(document.body).backgroundColor;
            const canvas = await html2canvas(container, {
                scale: 2,
                useCORS: true,
                backgroundColor: bg,
                onclone: (doc) => {
                    doc.body.classList.add('exporting');
                    // Ensure active tab pane is visible in clone
                    const activePanel = doc.getElementById(targetId);
                    if (activePanel) {
                        activePanel.style.display = 'block';
                        activePanel.classList.add('active');
                    }
                }
            });

            const link = document.createElement('a');
            link.download = `${targetId}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();

            document.body.classList.remove('exporting');
            window.scrollTo(0, originalScrollY);
        });
    });

    // Lazy-load AdSense ad units using IntersectionObserver
    // Targets elements with class 'lazy-ad' and a data-ad-slot attribute
    (function setupLazyAds() {
        const lazyAds = document.querySelectorAll('.lazy-ad[data-ad-slot]');
        if (!lazyAds || lazyAds.length === 0) return;

        const injectAd = (container) => {
            if (!container || container.dataset.adInjected === '1') return;
            const slot = container.getAttribute('data-ad-slot');
            const client = 'ca-pub-1882981188824223';

            // Build ins element
            const ins = document.createElement('ins');
            ins.className = 'adsbygoogle';
            ins.style.display = 'block';
            ins.setAttribute('data-ad-client', client);
            ins.setAttribute('data-ad-slot', slot);
            ins.setAttribute('data-ad-format', 'auto');
            ins.setAttribute('data-full-width-responsive', 'true');

            container.appendChild(ins);
            // mark injected so we don't double inject
            container.dataset.adInjected = '1';

            // Ask adsbygoogle to render if available; if not, attempt to load the loader script dynamically
            try {
                (adsbygoogle = window.adsbygoogle || []).push({});
            } catch (e) {
                // adsbygoogle not present. Try to append loader script and render after it's ready.
                ensureAdsLoader().then(() => {
                    try { (adsbygoogle = window.adsbygoogle || []).push({}); } catch (_) { /* still unavailable */ }
                }).catch(() => {
                    // loader could not be appended or blocked; nothing more we can do here.
                });
            }
        };

        const options = {
            root: null,
            rootMargin: '300px 0px', // start loading when 300px near viewport
            threshold: 0.01
        };

        const observer = new IntersectionObserver((entries, obs) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    injectAd(entry.target);
                    obs.unobserve(entry.target);
                }
            });
        }, options);

        lazyAds.forEach(el => {
            observer.observe(el);
        });
    })();

    // Ensure the adsbygoogle loader script is appended if missing. Returns a promise that resolves when loaded.
    function ensureAdsLoader() {
        return new Promise((resolve, reject) => {
            if (window.adsbygoogle) return resolve();

            // Check if there's already a loader script tag referencing pagead2.googlesyndication
            const existing = Array.from(document.getElementsByTagName('script')).find(s => s.src && s.src.indexOf('pagead2.googlesyndication.com/pagead/js/adsbygoogle.js') !== -1);
            if (existing) {
                // wait for it to load if not yet
                if (existing.getAttribute('data-loaded') === '1' || existing.readyState === 'complete') return resolve();
                existing.addEventListener('load', () => resolve());
                existing.addEventListener('error', () => reject());
                return;
            }

            const script = document.createElement('script');
            script.async = true;
            script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1882981188824223';
            script.crossOrigin = 'anonymous';
            script.onload = function () { script.setAttribute('data-loaded', '1'); resolve(); };
            script.onerror = function () { reject(); };
            document.head.appendChild(script);
        });
    }
});