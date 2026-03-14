document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedbackForm');
    if (!form) return;

    // ========== LANGUAGE SWITCHER ==========
    const langRu = document.getElementById('langRu');
    const langUz = document.getElementById('langUz');
    let currentLang = 'ru';

    function switchLanguage(lang) {
        currentLang = lang;
        const elements = document.querySelectorAll('[data-ru][data-uz]');
        elements.forEach(element => {
            const text = lang === 'ru' ? element.getAttribute('data-ru') : element.getAttribute('data-uz');
            const btnText = element.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = text;
            } else {
                element.textContent = text;
            }
        });

        const placeholderElements = document.querySelectorAll('[data-ru-placeholder][data-uz-placeholder]');
        placeholderElements.forEach(element => {
            element.placeholder = lang === 'ru'
                ? element.getAttribute('data-ru-placeholder')
                : element.getAttribute('data-uz-placeholder');
        });

        if (lang === 'ru') {
            langRu.classList.add('active');
            langUz.classList.remove('active');
        } else {
            langUz.classList.add('active');
            langRu.classList.remove('active');
        }

        if (typeof updateProgress === 'function') updateProgress();
    }

    if (langRu) langRu.addEventListener('click', () => switchLanguage('ru'));
    if (langUz) langUz.addEventListener('click', () => switchLanguage('uz'));

    // ========== PROGRESS BAR ==========
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const totalSections = 7;

    function updateProgress() {
        let filled = 0;

        if (document.querySelector('input[name="q1_service"]:checked')) filled++;
        if (document.querySelector('input[name="q2_info"]:checked')) filled++;
        if (document.querySelector('input[name="q3_speed"]:checked')) filled++;
        if (document.querySelector('input[name="q4_reason"]:checked')) filled++;
        if (document.querySelector('input[name="q5_nps"]:checked')) filled++;
        if (document.getElementById('q6_suggestions').value.trim()) filled++;
        if (document.getElementById('q7_recommendation').value.trim()) filled++;

        const pct = Math.round((filled / totalSections) * 100);
        progressBar.style.width = pct + '%';

        const tpl = progressText.getAttribute(`data-${currentLang}-template`) || 'Заполнено: {n} из {total}';
        progressText.textContent = tpl.replace('{n}', filled).replace('{total}', totalSections);

        const submitBtn = form.querySelector('button[type="submit"]');
        if (pct === 100) {
            submitBtn.classList.add('ready');
        } else {
            submitBtn.classList.remove('ready');
        }
    }

    form.addEventListener('input', updateProgress);
    form.addEventListener('change', updateProgress);
    updateProgress();

    // ========== FADE-IN ON SCROLL ==========
    const h3s = form.querySelectorAll('h3');
    h3s.forEach((h3) => {
        h3.classList.add('fade-in-section');
        h3.style.transitionDelay = '0.05s';
        let next = h3.nextElementSibling;
        while (next && next.tagName !== 'H3' && next.tagName !== 'BUTTON') {
            next.classList.add('fade-in-section');
            next.style.transitionDelay = '0.1s';
            next = next.nextElementSibling;
        }
    });

    const formGroups = form.querySelectorAll('.form-group, .rating-section');
    formGroups.forEach(el => {
        if (!el.classList.contains('fade-in-section')) {
            el.classList.add('fade-in-section');
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.fade-in-section').forEach(el => observer.observe(el));

    // ========== ERROR HIGHLIGHT REMOVAL ==========
    form.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            const parentElement = radio.closest('.form-group') || radio.closest('.rating-section');
            if (parentElement && parentElement.classList.contains('error-highlight')) {
                parentElement.classList.remove('error-highlight');
            }
        });
    });

    // ========== VALIDATION ==========
    function validateForm() {
        let isValid = true;
        let firstInvalidElement = null;
        let errorMessage = currentLang === 'ru' ? 'Пожалуйста, заполните:' : 'Iltimos, to\'ldiring:';

        document.querySelectorAll('.error-highlight').forEach(el => el.classList.remove('error-highlight'));

        const radioGroups = {};
        const requiredRadios = form.querySelectorAll('input[type="radio"][required]');
        requiredRadios.forEach(radio => {
            const name = radio.name;
            if (!radioGroups[name]) {
                radioGroups[name] = Array.from(form.querySelectorAll(`input[type="radio"][name="${name}"]`));
            }
        });

        for (const name in radioGroups) {
            const group = radioGroups[name];
            const isAnyChecked = group.some(r => r.checked);
            if (!isAnyChecked) {
                isValid = false;
                const parentElement = group[0].closest('.form-group');
                if (parentElement) {
                    parentElement.classList.add('error-highlight');
                    if (!firstInvalidElement) {
                        firstInvalidElement = parentElement;
                        const h3 = parentElement.previousElementSibling;
                        if (h3 && h3.tagName === 'H3') {
                            errorMessage += `\n- ${h3.textContent.replace(/\d+\.\s*/, '').trim()}`;
                        }
                    }
                }
            }
        }

        if (!isValid && firstInvalidElement) {
            showToast(errorMessage, 'error');
            firstInvalidElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }

        return isValid;
    }

    // ========== SEND FORM DATA ==========
    async function sendFormData() {
        const API_URL = '/api/send';

        const getRadio = (name) => {
            const el = document.querySelector(`input[name="${name}"]:checked`);
            return el ? el.value : '—';
        };

        const q1 = getRadio('q1_service');
        const q2 = getRadio('q2_info');
        const q3 = getRadio('q3_speed');
        const q4 = getRadio('q4_reason');
        const q5 = getRadio('q5_nps');
        const q6 = document.getElementById('q6_suggestions').value.trim() || '—';
        const q7 = document.getElementById('q7_recommendation').value.trim() || '—';

        const translations = {
            ru: {
                title: '✈️ *ОТЗЫВ — АВИАКАССА*',
                q1Label: '*1. СООТВЕТСТВИЕ ОЖИДАНИЯМ*',
                q2Label: '*2. ИНФОРМАЦИЯ И РЕЙСЫ*',
                q3Label: '*3. СКОРОСТЬ ОФОРМЛЕНИЯ*',
                q4Label: '*4. ПРИЧИНА ПОКУПКИ*',
                q5Label: '*5. РЕКОМЕНДАЦИЯ (NPS 0-5)*',
                q6Label: '*6. ПРЕДЛОЖЕНИЯ И ЗАМЕЧАНИЯ*',
                q7Label: '*7. ЧТО БЫ ВЫ СКАЗАЛИ ДРУЗЬЯМ*',
                reviewDate: '📅 *Дата отзыва:'
            },
            uz: {
                title: '✈️ *SHARH — AVIAKASSA*',
                q1Label: '*1. KUTILGANGA MOSLIGI*',
                q2Label: '*2. MA\'LUMOT VA REYSLAR*',
                q3Label: '*3. RASMIYLASHTIRISH TEZLIGI*',
                q4Label: '*4. XARID SABABI*',
                q5Label: '*5. TAVSIYA (NPS 0-5)*',
                q6Label: '*6. TAKLIF VA FIKRLAR*',
                q7Label: '*7. DO\'STLARINGIZGA NIMA DEYSIZ*',
                reviewDate: '📅 *Sharh sanasi:'
            }
        };

        const t = translations[currentLang];

        // NPS визуализация
        const npsNum = parseInt(q5);
        const npsStars = !isNaN(npsNum) ? '⭐'.repeat(npsNum) + '☆'.repeat(5 - npsNum) + ` (${npsNum}/5)` : q5;
        const npsEmoji = !isNaN(npsNum) ? (npsNum >= 4 ? '🟢' : npsNum >= 3 ? '🟡' : '🔴') : '⚪';

        const divider = '━━━━━━━━━━━━━━━━━━━━';

        const message = `${t.title}
${divider}

${t.q1Label}
📋 ${q1}

${t.q2Label}
📖 ${q2}

${t.q3Label}
⚡ ${q3}

${t.q4Label}
🎯 ${q4}

${divider}
${t.q5Label}
${npsEmoji} ${npsStars}

${divider}
${t.q6Label}
💭 ${q6}

${t.q7Label}
💬 ${q7}

${divider}
${t.reviewDate} ${new Date().toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'uz-UZ')}*`;

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: message })
            });
            const data = await response.json();

            if (data.ok) {
                showThankYouModal();
                form.reset();
                clearDraft();
                // Reset NPS stars
                document.querySelectorAll('.rating-section .rating-group').forEach(g => {
                    g.querySelectorAll('label').forEach(l => l.classList.remove('star-active', 'star-hover'));
                });
                // Reset character counters
                document.querySelectorAll('.char-counter').forEach(c => {
                    c.textContent = '0';
                    c.classList.remove('has-text');
                });
                form.dispatchEvent(new Event('change'));
                launchConfetti();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                showToast(data.errors ? data.errors.join('\n') : 'Ошибка отправки', 'error');
            }
        } catch (error) {
            showToast('Произошла сетевая ошибка. Проверьте подключение к интернету.', 'error');
        }
    }

    // ========== SUBMIT HANDLER ==========
    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            haptic();

            if (!validateForm()) return;

            submitButton.classList.add('loading');
            submitButton.disabled = true;

            await sendFormData();

            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        });
    }

    // ========== STAR/NPS RATINGS ==========
    document.querySelectorAll('.rating-section .rating-group').forEach(group => {
        const labels = group.querySelectorAll('label');

        labels.forEach(lbl => {
            const text = lbl.textContent.trim();
            lbl.innerHTML = '<span>' + text + '</span>';
        });

        labels.forEach((lbl, idx) => {
            lbl.addEventListener('mouseenter', () => {
                labels.forEach((l, i) => l.classList.toggle('star-hover', i <= idx));
            });
            lbl.addEventListener('mouseleave', () => {
                labels.forEach(l => l.classList.remove('star-hover'));
                updateStarActive(group);
            });
            lbl.addEventListener('click', () => {
                haptic();
                updateStarActive(group);
            });
        });

        updateStarActive(group);
    });

    function updateStarActive(group) {
        const labels = group.querySelectorAll('label');
        let checkedIdx = -1;
        group.querySelectorAll('input[type="radio"]').forEach((r, i) => { if (r.checked) checkedIdx = i; });
        labels.forEach((l, i) => l.classList.toggle('star-active', i <= checkedIdx));
    }

    // ========== CHARACTER COUNTER ==========
    form.querySelectorAll('textarea').forEach(ta => {
        const wrapper = document.createElement('div');
        wrapper.className = 'char-counter-wrapper';
        ta.parentNode.insertBefore(wrapper, ta);
        wrapper.appendChild(ta);

        const counter = document.createElement('span');
        counter.className = 'char-counter';
        counter.textContent = '0';
        wrapper.appendChild(counter);

        ta.addEventListener('input', () => {
            const len = ta.value.length;
            counter.textContent = len;
            counter.classList.toggle('has-text', len > 0);
        });
    });

    // ========== HAPTIC FEEDBACK ==========
    function haptic() {
        if (navigator.vibrate) navigator.vibrate(10);
    }

    form.querySelectorAll('input[type="radio"]').forEach(r => {
        r.addEventListener('change', () => haptic());
    });

    // ========== AUTO-SAVE TO LOCALSTORAGE ==========
    const STORAGE_KEY = 'okstours_avia_draft';

    function saveDraft() {
        const data = {};
        form.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach(el => {
            if (el.id) data[el.id] = el.value;
        });
        form.querySelectorAll('input[type="radio"]:checked').forEach(el => {
            data['radio_' + el.name] = el.value;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    function restoreDraft() {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return;
        try {
            const data = JSON.parse(raw);
            Object.keys(data).forEach(key => {
                if (key.startsWith('radio_')) {
                    const name = key.replace('radio_', '');
                    const radio = form.querySelector(`input[type="radio"][name="${name}"][value="${data[key]}"]`);
                    if (radio) {
                        radio.checked = true;
                        radio.dispatchEvent(new Event('change', { bubbles: true }));
                    }
                } else {
                    const el = document.getElementById(key);
                    if (el) {
                        el.value = data[key];
                        el.dispatchEvent(new Event('input', { bubbles: true }));
                    }
                }
            });
            document.querySelectorAll('.rating-section .rating-group').forEach(updateStarActive);
            updateProgress();
        } catch (e) {}
    }

    function clearDraft() {
        localStorage.removeItem(STORAGE_KEY);
    }

    form.addEventListener('input', saveDraft);
    form.addEventListener('change', saveDraft);
    restoreDraft();
});

// ========== MODAL ==========
function showThankYouModal() {
    const modal = document.getElementById('thankYouModal');
    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('thankYouModal').style.display = 'none';
}

window.addEventListener('click', function(event) {
    const modal = document.getElementById('thankYouModal');
    if (event.target === modal) modal.style.display = 'none';
});

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'error') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentNode) toast.remove(); }, 3600);
}

// ========== CONFETTI ==========
function launchConfetti() {
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#4DB6A0', '#6DC8B6', '#3A9A87', '#f0c040', '#ff6b8a', '#7c6df0', '#ff9a3c'];
    const pieces = [];

    for (let i = 0; i < 120; i++) {
        pieces.push({
            x: canvas.width / 2 + (Math.random() - 0.5) * 200,
            y: canvas.height / 2,
            vx: (Math.random() - 0.5) * 16,
            vy: Math.random() * -18 - 4,
            w: Math.random() * 10 + 5,
            h: Math.random() * 6 + 3,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * 360,
            rotV: (Math.random() - 0.5) * 12,
            gravity: 0.25 + Math.random() * 0.15,
            opacity: 1
        });
    }

    let frame = 0;
    const maxFrames = 180;

    function draw() {
        frame++;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        pieces.forEach(p => {
            p.x += p.vx;
            p.vy += p.gravity;
            p.y += p.vy;
            p.rot += p.rotV;
            p.vx *= 0.99;
            if (frame > maxFrames - 40) p.opacity = Math.max(0, p.opacity - 0.025);

            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate((p.rot * Math.PI) / 180);
            ctx.globalAlpha = p.opacity;
            ctx.fillStyle = p.color;
            ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
            ctx.restore();
        });

        if (frame < maxFrames) {
            requestAnimationFrame(draw);
        } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
        }
    }

    draw();
}

// ========== DARK THEME ==========
(function() {
    const toggle = document.getElementById('themeToggle');
    const icon = document.getElementById('themeIcon');
    if (!toggle) return;

    const saved = localStorage.getItem('okstours_theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const isDark = saved === 'dark' || (!saved && prefersDark);

    if (isDark) {
        document.body.classList.add('dark');
        icon.textContent = '☀️';
    }

    toggle.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        const dark = document.body.classList.contains('dark');
        icon.textContent = dark ? '☀️' : '🌙';
        localStorage.setItem('okstours_theme', dark ? 'dark' : 'light');
    });

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('okstours_theme')) {
            document.body.classList.toggle('dark', e.matches);
            icon.textContent = e.matches ? '☀️' : '🌙';
        }
    });
})();
