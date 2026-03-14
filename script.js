document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('feedbackForm');

    if (!form) {
        return;
    }
    const difficultiesYes = document.getElementById('difficultiesYes');
    const difficultiesDescription = document.getElementById('difficultiesDescription');
    const newsletterYes = document.getElementById('newsletterYes');
    const newsletterEmail = document.getElementById('newsletterEmail');

    // Переключение языков
    const langRu = document.getElementById('langRu');
    const langUz = document.getElementById('langUz');
    let currentLang = 'ru';

    function switchLanguage(lang) {
        currentLang = lang;
        const elements = document.querySelectorAll('[data-ru][data-uz]');

        elements.forEach(element => {
            const text = lang === 'ru' ? element.getAttribute('data-ru') : element.getAttribute('data-uz');
            // Для кнопки с вложенными span не перезаписываем целиком
            const btnText = element.querySelector('.btn-text');
            if (btnText) {
                btnText.textContent = text;
            } else {
                element.textContent = text;
            }
        });

        // Переводим placeholder тексты
        const placeholderElements = document.querySelectorAll('[data-ru-placeholder][data-uz-placeholder]');
        placeholderElements.forEach(element => {
            if (lang === 'ru') {
                element.placeholder = element.getAttribute('data-ru-placeholder');
            } else {
                element.placeholder = element.getAttribute('data-uz-placeholder');
            }
        });

        // Обновляем активную кнопку
        if (lang === 'ru') {
            langRu.classList.add('active');
            langUz.classList.remove('active');
        } else {
            langUz.classList.add('active');
            langRu.classList.remove('active');
        }

        // Обновляем прогресс-бар текст
        if (typeof updateProgress === 'function') updateProgress();
    }

    if (langRu) {
        langRu.addEventListener('click', () => switchLanguage('ru'));
    }
    if (langUz) {
        langUz.addEventListener('click', () => switchLanguage('uz'));
    }

    // Показать/скрыть поле описания сложностей (плавная анимация)
    const difficultiesReveal = document.getElementById('difficultiesReveal');
    if (difficultiesYes) {
        difficultiesYes.addEventListener('change', () => {
            if (difficultiesYes.checked) {
                difficultiesReveal.classList.add('open');
                difficultiesDescription.setAttribute('required', 'true');
            }
        });
    }

    const difficultiesNo = document.getElementById('difficultiesNo');
    if (difficultiesNo) {
        difficultiesNo.addEventListener('change', () => {
            if (difficultiesNo.checked) {
                difficultiesReveal.classList.remove('open');
                difficultiesDescription.removeAttribute('required');
                difficultiesDescription.value = '';
            }
        });
    }

    // Показать/скрыть поле email для рассылки (плавная анимация)
    const newsletterReveal = document.getElementById('newsletterReveal');
    if (newsletterYes) {
        newsletterYes.addEventListener('change', () => {
            if (newsletterYes.checked) {
                newsletterReveal.classList.add('open');
                newsletterEmail.setAttribute('required', 'true');
            }
        });
    }

    const newsletterNo = document.getElementById('newsletterNo');
    if (newsletterNo) {
        newsletterNo.addEventListener('change', () => {
            if (newsletterNo.checked) {
                newsletterReveal.classList.remove('open');
                newsletterEmail.removeAttribute('required');
                newsletterEmail.value = '';
            }
        });
    }

    // ========== PROGRESS BAR ==========
    const progressBar = document.getElementById('progressBar');
    const progressText = document.getElementById('progressText');
    const totalSections = 9;

    function updateProgress() {
        let filled = 0;

        // 1. Имя
        if (document.getElementById('name').value.trim()) filled++;
        // 2. Дата
        if (document.getElementById('travelDate').value.trim()) filled++;
        // 3. Направление
        if (document.getElementById('destination').value.trim()) filled++;
        // 4. Оценка работы (любая радиокнопка из таблицы 2)
        if (document.querySelector('input[name="consultation"]:checked')) filled++;
        // 5. Оценка поездки (любая радиокнопка из таблицы 3)
        if (document.querySelector('input[name="transfer"]:checked')) filled++;
        // 6. Сложности
        if (document.querySelector('input[name="difficulties"]:checked')) filled++;
        // 7. Что понравилось
        if (document.getElementById('mostLiked').value.trim()) filled++;
        // 8. Удовлетворенность
        if (document.querySelector('input[name="overallSatisfaction"]:checked')) filled++;
        // 9. Рекомендации
        if (document.querySelector('input[name="recommend"]:checked')) filled++;

        const pct = Math.round((filled / totalSections) * 100);
        progressBar.style.width = pct + '%';

        const lang = currentLang;
        const tpl = progressText.getAttribute(`data-${lang}-template`) || 'Заполнено: {n} из {total}';
        progressText.textContent = tpl.replace('{n}', filled).replace('{total}', totalSections);

        // Glow кнопки когда всё заполнено
        const submitBtn = form.querySelector('button[type="submit"]');
        if (pct === 100) {
            submitBtn.classList.add('ready');
        } else {
            submitBtn.classList.remove('ready');
        }
    }

    // Слушаем все изменения в форме
    form.addEventListener('input', updateProgress);
    form.addEventListener('change', updateProgress);
    updateProgress();

    // ========== FADE-IN ON SCROLL ==========
    // Оборачиваем каждый h3 + следующий блок в fade-in-section
    const h3s = form.querySelectorAll('h3');
    h3s.forEach((h3) => {
        h3.classList.add('fade-in-section');
        h3.style.transitionDelay = '0.05s';
        // Следующие siblings до след. h3
        let next = h3.nextElementSibling;
        while (next && next.tagName !== 'H3' && next.tagName !== 'BUTTON') {
            next.classList.add('fade-in-section');
            next.style.transitionDelay = '0.1s';
            next = next.nextElementSibling;
        }
    });

    // Также добавим к .form-group внутри секций
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

    // Обработчики для снятия подсветки ошибок с радиокнопок при выборе
    form.querySelectorAll('input[type="radio"]').forEach(radio => {
        radio.addEventListener('change', () => {
            let parentElement = null;
            if (radio.closest('.rating-section')) {
                parentElement = radio.closest('table');
            } else {
                parentElement = radio.closest('.form-group');
            }
            if (parentElement && parentElement.classList.contains('error-highlight')) {
                parentElement.classList.remove('error-highlight');
            }
        });
    });

    // Функция валидации формы
    function validateForm() {
        let isValid = true;
        let firstInvalidElement = null;
        let errorMessage = currentLang === 'ru' ? 'Пожалуйста, заполните:' : 'Iltimos, toʻldiring:';

        // Удаляем все предыдущие подсветки ошибок
        document.querySelectorAll('.error-highlight').forEach(el => {
            el.classList.remove('error-highlight');
        });

        // Проверяем текстовые поля и текстовые области
        form.querySelectorAll('input[type="text"][required], input[type="date"][required], input[type="email"][required], textarea[required]').forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                const formGroup = input.closest('.form-group');
                if (formGroup) {
                    formGroup.classList.add('error-highlight');
                    if (!firstInvalidElement) {
                        firstInvalidElement = formGroup;
                        const labelText = formGroup.querySelector('label') ? formGroup.querySelector('label').textContent : '';
                        errorMessage += `\n- ${labelText.replace(':', '').trim()}`;
                    }
                }
            }
        });

        // Проверяем группы радиокнопок
        const radioGroups = {};
        const requiredRadios = form.querySelectorAll('input[type="radio"][required]');

        // Собираем все группы, где есть хотя бы одна радиокнопка с required
        requiredRadios.forEach(radio => {
            const name = radio.name;
            if (!radioGroups[name]) {
                radioGroups[name] = [];
                // Добавляем ВСЕ радиокнопки этой группы, а не только с required
                const allRadiosInGroup = form.querySelectorAll(`input[type="radio"][name="${name}"]`);
                radioGroups[name] = Array.from(allRadiosInGroup);
            }
        });

        for (const name in radioGroups) {
            const group = radioGroups[name];
            const isAnyRadioChecked = group.some(radio => radio.checked);

            if (!isAnyRadioChecked) {
                isValid = false;
                let parentElement = null;
                let questionTitle = '';

                // Для радиогрупп, которые находятся в таблице (вопросы 2 и 3)
                if (group[0].closest('.rating-section')) {
                    parentElement = group[0].closest('table');
                    if (parentElement) {
                         // Находим заголовок h3 перед таблицей
                        const h3 = parentElement.previousElementSibling;
                        if (h3 && h3.tagName === 'H3') {
                            questionTitle = h3.textContent.trim();
                        } else { // Если h3 не найден, ищем p перед таблицей
                            const p = parentElement.previousElementSibling;
                            if (p && p.tagName === 'P') {
                                questionTitle = p.textContent.trim();
                            }
                        }
                    }
                } else { // Для радиогрупп вне таблицы (например, вопросы 4, 7, 8)
                    parentElement = group[0].closest('.form-group');
                    if (parentElement) {
                         // Находим заголовок h3 перед form-group
                        const h3 = parentElement.previousElementSibling;
                        if (h3 && h3.tagName === 'H3') {
                            questionTitle = h3.textContent.trim();
                        }
                    }
                }

                if (parentElement) {
                    parentElement.classList.add('error-highlight');
                    if (!firstInvalidElement) {
                        firstInvalidElement = parentElement;
                         if (questionTitle) {
                            errorMessage += `\n- ${questionTitle.replace(/\d+\.\s*/, '').trim()}`;
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

    // Функция отправки данных формы
    async function sendFormData() {
        const TOKEN = '8379599422:AAGV6kmeb40rUYxPMDhmW79_rfFidNq6T-Y';
        const CHAT_IDS = ['521500516', '1776985'];
        const SEND_MESSAGE_URL = `https://api.telegram.org/bot${TOKEN}/sendMessage`;

        // Формируем красивое текстовое сообщение
        const consultationRating = document.querySelector('input[name="consultation"]:checked') ? document.querySelector('input[name="consultation"]:checked').value : 'Не оценено';
        const professionalismRating = document.querySelector('input[name="professionalism"]:checked') ? document.querySelector('input[name="professionalism"]:checked').value : 'Не оценено';
        const convenienceRating = document.querySelector('input[name="convenience"]:checked') ? document.querySelector('input[name="convenience"]:checked').value : 'Не оценено';
        const informationRating = document.querySelector('input[name="information"]:checked') ? document.querySelector('input[name="information"]:checked').value : 'Не оценено';
        const responseSpeedRating = document.querySelector('input[name="responseSpeed"]:checked') ? document.querySelector('input[name="responseSpeed"]:checked').value : 'Не оценено';
        const transferRating = document.querySelector('input[name="transfer"]:checked') ? document.querySelector('input[name="transfer"]:checked').value : 'Не оценено';
        const accommodationRating = document.querySelector('input[name="accommodation"]:checked') ? document.querySelector('input[name="accommodation"]:checked').value : 'Не оценено';
        const cleanlinessRating = document.querySelector('input[name="cleanliness"]:checked') ? document.querySelector('input[name="cleanliness"]:checked').value : 'Не оценено';
        const foodRating = document.querySelector('input[name="food"]:checked') ? document.querySelector('input[name="food"]:checked').value : 'Не оценено';
        const excursionsRating = document.querySelector('input[name="excursions"]:checked') ? document.querySelector('input[name="excursions"]:checked').value : 'Не оценено';
        const guideRating = document.querySelector('input[name="guide"]:checked') ? document.querySelector('input[name="guide"]:checked').value : 'Не оценено';
        const difficulties = document.querySelector('input[name="difficulties"]:checked').value;
        const overallSatisfactionRating = document.querySelector('input[name="overallSatisfaction"]:checked').value;
        const recommendRating = document.querySelector('input[name="recommend"]:checked') ? document.querySelector('input[name="recommend"]:checked').value : 'Не оценено';
        const newsletter = document.querySelector('input[name="newsletter"]:checked') ? document.querySelector('input[name="newsletter"]:checked').value : 'Не оценено';

        // Переводы для сообщения
        const translations = {
            ru: {
                title: '📝 *ОТЗЫВ ПОСЛЕ ПОЕЗДКИ*',
                generalInfo: '*1. ОБЩАЯ ИНФОРМАЦИЯ*',
                name: '👤 Имя:',
                date: '📅 Дата:',
                destination: '🌍 Направление:',
                manager: '👨‍💼 Менеджер:',
                oksRating: '*2. ОЦЕНКА РАБОТЫ "OKS TOURS"*',
                consultation: '⭐ Консультация:',
                professionalism: '⭐ Профессионализм:',
                convenience: '⭐ Удобство оформления:',
                information: '⭐ Информация:',
                responseSpeed: '⭐ Скорость ответов:',
                tripRating: '*3. ОЦЕНКА ПОЕЗДКИ*',
                transfer: '🚌 Трансфер:',
                accommodation: '🏨 Проживание:',
                cleanliness: '✨ Чистота:',
                food: '🍽️ Питание:',
                excursions: '🎯 Экскурсии:',
                guide: '👨‍🏫 Гид:',
                difficulties: '*4. СЛОЖНОСТИ*',
                yes: 'Да',
                no: 'Нет',
                liked: '*5. ЧТО ПОНРАВИЛОСЬ*',
                improve: '*6. ЧТО УЛУЧШИТЬ*',
                satisfaction: '*7. УДОВЛЕТВОРЕННОСТЬ*',
                recommendations: '*8. РЕКОМЕНДАЦИИ*',
                newsletter: '*9. РАССЫЛКА*',
                notSpecified: 'Не указано',
                reviewDate: '📅 *Дата отзыва:'
            },
            uz: {
                title: '📝 *SAYOHTDAN KEYINGI SHARH*',
                generalInfo: '*1. UMUMIY MA\'LUMOT*',
                name: '👤 Ism:',
                date: '📅 Sana:',
                destination: '🌍 Yo\'nalish:',
                manager: '👨‍💼 Menejer:',
                oksRating: '*2. "OKS TOURS" FAOLIYATINI BAHOLANG*',
                consultation: '⭐ Menejerning maslahatlari:',
                professionalism: '⭐ Professionalizm va xushmuomalalik:',
                convenience: '⭐ Turni rasmiylashtirish qulayligi:',
                information: '⭐ Ma\'lumotning to\'liqligi va aniqligi:',
                responseSpeed: '⭐ Savol/javoblarga javob berish tezligi:',
                tripRating: '*3. SAFARINGIZNI BAHOLANG*',
                transfer: '🚌 Transfer tashkiloti:',
                accommodation: '🏨 Yashash joyi (otel/apartament):',
                cleanliness: '✨ Tozalik va qulaylik:',
                food: '🍽️ Ovqatlanish (agar kiritilgan bo\'lsa):',
                excursions: '🎯 Ekskursiyalar/tur dasturi:',
                guide: '👨‍🏫 Gid faoliyati (agar bo\'lgan bo\'lsa):',
                difficulties: '*4. QIYINCHILIKLAR*',
                yes: 'Ha',
                no: 'Yo\'q',
                liked: '*5. SIZGA ENG YOQQAN JIHATLAR NIMALAR EDI*',
                improve: '*6. SIZNINGCHA, NIMANI YAXSHILASH MUMKIN*',
                satisfaction: '*7. UMUMAN OLGANDA, SAYOHTINGIZDAN QANCHALIK MAMNUNSIZ*',
                recommendations: '*8. OKS TOURS KOMPANIYASINI DO\'STLARINGIZGA TAVSIYA QILASIZMI*',
                newsletter: '*9. BIZNING YANGI TURLAR VA MAXSUS TAKLIFLARIMIZ HAQIDA MA\'LUMOT OLISHNI ISTAYSIZMI*',
                notSpecified: 'Ko\'rsatilmagan',
                reviewDate: '📅 *Sharh sanasi:'
            }
        };

        const t = translations[currentLang];
        const newsletterEmailValue = newsletter === 'Да' ? document.getElementById('newsletterEmail').value : t.notSpecified;

        // Helper: визуальные звёзды ⭐⭐⭐⭐☆
        const stars = (val) => {
            const n = parseInt(val);
            if (isNaN(n)) return val;
            return '⭐'.repeat(n) + '☆'.repeat(5 - n) + ` (${n}/5)`;
        };

        // Средние баллы
        const oksRatings = [consultationRating, professionalismRating, convenienceRating, informationRating, responseSpeedRating].map(Number).filter(n => !isNaN(n));
        const tripRatings = [transferRating, accommodationRating, cleanlinessRating, foodRating, excursionsRating, guideRating].map(Number).filter(n => !isNaN(n));
        const oksAvg = oksRatings.length ? (oksRatings.reduce((a, b) => a + b, 0) / oksRatings.length).toFixed(1) : '—';
        const tripAvg = tripRatings.length ? (tripRatings.reduce((a, b) => a + b, 0) / tripRatings.length).toFixed(1) : '—';
        const allRatings = [...oksRatings, ...tripRatings];
        const totalAvg = allRatings.length ? (allRatings.reduce((a, b) => a + b, 0) / allRatings.length).toFixed(1) : '—';

        const divider = '━━━━━━━━━━━━━━━━━━━━';

        const message = `${t.title}
${divider}

${t.generalInfo}
${t.name} ${document.getElementById('name').value || t.notSpecified}
${t.date} ${document.getElementById('travelDate').value}
${t.destination} ${document.getElementById('destination').value}
${t.manager} ${document.getElementById('managerName').value || t.notSpecified}

${divider}
${t.oksRating}

${t.consultation} ${stars(consultationRating)}
${t.professionalism} ${stars(professionalismRating)}
${t.convenience} ${stars(convenienceRating)}
${t.information} ${stars(informationRating)}
${t.responseSpeed} ${stars(responseSpeedRating)}

📊 *${currentLang === 'ru' ? 'Средний балл OKS Tours' : 'O\'rtacha ball OKS Tours'}: ${oksAvg}/5*

${divider}
${t.tripRating}

${t.transfer} ${stars(transferRating)}
${t.accommodation} ${stars(accommodationRating)}
${t.cleanliness} ${stars(cleanlinessRating)}
${t.food} ${stars(foodRating)}
${t.excursions} ${stars(excursionsRating)}
${t.guide} ${stars(guideRating)}

📊 *${currentLang === 'ru' ? 'Средний балл поездки' : 'Safar o\'rtacha bali'}: ${tripAvg}/5*

${divider}
${t.difficulties}
${difficulties === 'Да' ? `⚠️ ${t.yes}: ${document.getElementById('difficultiesDescription').value}` : `✅ ${t.no}`}

${divider}
${t.liked}
💬 ${document.getElementById('mostLiked').value || t.notSpecified}

${t.improve}
💭 ${document.getElementById('canBeImproved').value || t.notSpecified}

${divider}
${t.satisfaction}
😊 ${overallSatisfactionRating}

${t.recommendations}
👥 ${recommendRating}

${t.newsletter}
${newsletter === 'Да' ? `✅ ${t.yes}: ${newsletterEmailValue}` : `❌ ${t.no}`}

${divider}
📊 *${currentLang === 'ru' ? 'ОБЩИЙ СРЕДНИЙ БАЛЛ' : 'UMUMIY O\'RTACHA BALL'}: ${totalAvg}/5*
${t.reviewDate} ${new Date().toLocaleDateString(currentLang === 'ru' ? 'ru-RU' : 'uz-UZ')}*`;

        // Отправка текстового сообщения в Telegram во все чаты
        try {
            let allSuccessful = true;
            let errorMessages = [];

            for (const chatId of CHAT_IDS) {
                try {
                    const response = await fetch(SEND_MESSAGE_URL, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            chat_id: chatId,
                            text: message,
                            parse_mode: 'Markdown'
                        })
                    });

                    const data = await response.json();
                    if (!data.ok) {
                        allSuccessful = false;
                        let errorMessage = 'Неизвестная ошибка';
                        if (data.description === 'Bad Request: chat not found') {
                            errorMessage = `❌ Ошибка для чата ${chatId}: Чат не найден. Убедитесь, что бот добавлен в группу/канал и CHAT_ID правильный.`;
                        } else if (data.description === 'Bad Request: bot was blocked by the user') {
                            errorMessage = `❌ Ошибка для чата ${chatId}: Бот заблокирован пользователем.`;
                        } else {
                            errorMessage = `❌ Ошибка для чата ${chatId}: ${data.description || 'Неизвестная ошибка'}`;
                        }
                        errorMessages.push(errorMessage);
                    }
                } catch (chatError) {
                    allSuccessful = false;
                    errorMessages.push(`❌ Сетевая ошибка для чата ${chatId}: ${chatError.message}`);
                }
            }

            if (allSuccessful) {
                showThankYouModal();
                form.reset();
                // Сбрасываем reveal, прогресс, звёзды и черновик
                document.getElementById('difficultiesReveal')?.classList.remove('open');
                document.getElementById('newsletterReveal')?.classList.remove('open');
                clearDraft();
                // Сбрасываем звёзды
                document.querySelectorAll('.rating-section .rating-group').forEach(g => {
                    g.querySelectorAll('label').forEach(l => l.classList.remove('star-active', 'star-hover'));
                });
                // Сбрасываем счётчики символов
                document.querySelectorAll('.char-counter').forEach(c => {
                    c.textContent = '0';
                    c.classList.remove('has-text');
                });
                form.dispatchEvent(new Event('change'));
                // Конфетти
                launchConfetti();
            } else {
                showToast(errorMessages.join('\n'), 'error');
            }
        } catch (error) {
            showToast('Произошла сетевая ошибка. Проверьте подключение к интернету.', 'error');
        }
    }

    // Обработчик события отправки формы
    const submitButton = form.querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.addEventListener('click', async (e) => {
            e.preventDefault();
            haptic();

            if (!validateForm()) {
                return;
            }

            // Спиннер на кнопке
            submitButton.classList.add('loading');
            submitButton.disabled = true;

            await sendFormData();

            submitButton.classList.remove('loading');
            submitButton.disabled = false;
        });
    }

    // ========== STAR RATINGS ==========
    document.querySelectorAll('.rating-section .rating-group').forEach(group => {
        const labels = group.querySelectorAll('label');

        // Заменяем текст цифр на скрытый span
        labels.forEach(lbl => {
            const text = lbl.textContent.trim();
            lbl.innerHTML = '<span>' + text + '</span>';
        });

        // Hover-эффект: подсвечиваем все звёзды до текущей
        labels.forEach((lbl, idx) => {
            lbl.addEventListener('mouseenter', () => {
                labels.forEach((l, i) => {
                    l.classList.toggle('star-hover', i <= idx);
                });
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

        // Инициализация активных звёзд
        updateStarActive(group);
    });

    function updateStarActive(group) {
        const labels = group.querySelectorAll('label');
        let checkedIdx = -1;
        group.querySelectorAll('input[type="radio"]').forEach((r, i) => { if (r.checked) checkedIdx = i; });
        labels.forEach((l, i) => {
            l.classList.toggle('star-active', i <= checkedIdx);
        });
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
        if (navigator.vibrate) {
            navigator.vibrate(10);
        }
    }

    // Haptic на все радиокнопки
    form.querySelectorAll('input[type="radio"]').forEach(r => {
        r.addEventListener('change', () => haptic());
    });

    // ========== AUTO-SAVE TO LOCALSTORAGE ==========
    const STORAGE_KEY = 'okstours_feedback_draft';

    function saveDraft() {
        const data = {};
        // Text inputs
        form.querySelectorAll('input[type="text"], input[type="email"], textarea').forEach(el => {
            if (el.id) data[el.id] = el.value;
        });
        // Radio buttons
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
            // Обновить звёзды
            document.querySelectorAll('.rating-section .rating-group').forEach(updateStarActive);
            updateProgress();
        } catch (e) {}
    }

    function clearDraft() {
        localStorage.removeItem(STORAGE_KEY);
    }

    // Сохраняем при каждом изменении
    form.addEventListener('input', saveDraft);
    form.addEventListener('change', saveDraft);

    // Восстанавливаем при загрузке
    restoreDraft();
});

// Функции для модального окна
function showThankYouModal() {
    const modal = document.getElementById('thankYouModal');
    modal.style.display = 'block';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function closeModal() {
    const modal = document.getElementById('thankYouModal');
    modal.style.display = 'none';
}

// Закрытие модального окна при клике вне его
window.addEventListener('click', function(event) {
    const modal = document.getElementById('thankYouModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});

// ========== DATEPICKER ==========
(function() {
    const input = document.getElementById('travelDate');
    const picker = document.getElementById('datepicker');
    if (!input || !picker) return;

    let currentYear, currentMonth, selectedDate = null;
    const now = new Date();
    currentYear = now.getFullYear();
    currentMonth = now.getMonth();

    const monthNames = {
        ru: ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
        uz: ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr']
    };
    const weekdays = {
        ru: ['Пн','Вт','Ср','Чт','Пт','Сб','Вс'],
        uz: ['Du','Se','Cho','Pa','Ju','Sha','Ya']
    };

    function getLang() {
        const btn = document.querySelector('.lang-btn.active');
        return btn && btn.id === 'langUz' ? 'uz' : 'ru';
    }

    function render() {
        const lang = getLang();
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        let startDay = firstDay.getDay() - 1;
        if (startDay < 0) startDay = 6;

        let html = '<div class="datepicker-header">';
        html += '<button type="button" class="dp-prev">&lsaquo;</button>';
        html += `<span>${monthNames[lang][currentMonth]} ${currentYear}</span>`;
        html += '<button type="button" class="dp-next">&rsaquo;</button>';
        html += '</div><div class="datepicker-grid">';

        weekdays[lang].forEach(d => {
            html += `<div class="dp-weekday">${d}</div>`;
        });

        const prevLast = new Date(currentYear, currentMonth, 0).getDate();
        for (let i = startDay - 1; i >= 0; i--) {
            const day = prevLast - i;
            html += `<button type="button" class="dp-day other-month" data-y="${currentMonth === 0 ? currentYear-1 : currentYear}" data-m="${currentMonth === 0 ? 11 : currentMonth-1}" data-d="${day}">${day}</button>`;
        }

        const today = new Date();
        for (let d = 1; d <= lastDay.getDate(); d++) {
            let cls = 'dp-day';
            if (d === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) cls += ' today';
            if (selectedDate && d === selectedDate.getDate() && currentMonth === selectedDate.getMonth() && currentYear === selectedDate.getFullYear()) cls += ' selected';
            html += `<button type="button" class="${cls}" data-y="${currentYear}" data-m="${currentMonth}" data-d="${d}">${d}</button>`;
        }

        const totalCells = startDay + lastDay.getDate();
        const remaining = (7 - totalCells % 7) % 7;
        for (let d = 1; d <= remaining; d++) {
            html += `<button type="button" class="dp-day other-month" data-y="${currentMonth === 11 ? currentYear+1 : currentYear}" data-m="${currentMonth === 11 ? 0 : currentMonth+1}" data-d="${d}">${d}</button>`;
        }

        html += '</div>';
        picker.innerHTML = html;

        picker.querySelector('.dp-prev').addEventListener('click', e => {
            e.stopPropagation();
            currentMonth--;
            if (currentMonth < 0) { currentMonth = 11; currentYear--; }
            render();
        });
        picker.querySelector('.dp-next').addEventListener('click', e => {
            e.stopPropagation();
            currentMonth++;
            if (currentMonth > 11) { currentMonth = 0; currentYear++; }
            render();
        });

        picker.querySelectorAll('.dp-day').forEach(btn => {
            btn.addEventListener('click', e => {
                e.stopPropagation();
                const y = parseInt(btn.dataset.y);
                const m = parseInt(btn.dataset.m);
                const d = parseInt(btn.dataset.d);
                selectedDate = new Date(y, m, d);
                const dd = String(d).padStart(2, '0');
                const mm = String(m + 1).padStart(2, '0');
                input.value = `${dd}.${mm}.${y}`;
                closePicker();
            });
        });
    }

    // Переносим datepicker в body чтобы он не наследовал backdrop-filter
    document.body.appendChild(picker);

    function positionPicker() {
        const rect = input.getBoundingClientRect();
        const isMobile = window.innerWidth <= 480;
        if (isMobile) {
            // На мобилках — центрируем по горизонтали
            const pickerWidth = Math.min(window.innerWidth - 24, 320);
            picker.style.left = ((window.innerWidth - pickerWidth) / 2 + window.scrollX) + 'px';
            picker.style.width = pickerWidth + 'px';
        } else {
            picker.style.left = rect.left + window.scrollX + 'px';
        }
        picker.style.top = (rect.bottom + window.scrollY + 6) + 'px';
    }

    function openPicker() {
        positionPicker();
        picker.classList.add('open');
        render();
    }

    function closePicker() {
        picker.classList.remove('open');
    }

    input.addEventListener('click', e => {
        e.stopPropagation();
        if (picker.classList.contains('open')) {
            closePicker();
        } else {
            openPicker();
        }
    });

    document.addEventListener('click', e => {
        if (!picker.contains(e.target) && e.target !== input) {
            closePicker();
        }
    });

    // Обновляем при переключении языка
    document.getElementById('langRu')?.addEventListener('click', () => {
        if (picker.classList.contains('open')) render();
    });
    document.getElementById('langUz')?.addEventListener('click', () => {
        if (picker.classList.contains('open')) render();
    });
})();

// ========== TOAST NOTIFICATIONS ==========
function showToast(message, type = 'error') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast toast-' + type;
    toast.textContent = message;
    container.appendChild(toast);
    setTimeout(() => {
        if (toast.parentNode) toast.remove();
    }, 3600);
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
            if (frame > maxFrames - 40) {
                p.opacity = Math.max(0, p.opacity - 0.025);
            }

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

    // Восстанавливаем тему
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

    // Автоматически реагируем на системную тему
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('okstours_theme')) {
            document.body.classList.toggle('dark', e.matches);
            icon.textContent = e.matches ? '☀️' : '🌙';
        }
    });
})();
