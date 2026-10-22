// app.js — Часть 1: Навигация и Система Сохранений (Save/Load)

document.addEventListener('DOMContentLoaded', () => {
    const welcomeScreen = document.getElementById('welcomeScreen');
    const novelInterface = document.getElementById('novelInterface');
    const btnEnter = document.getElementById('btnEnter');
    const btnContinue = document.getElementById('btnContinue');
    const btnBackToMenu = document.getElementById('btnBackToMenu');
    
    const chaptersList = document.getElementById('chaptersList');
    const chapterTitle = document.getElementById('chapterTitle');
    const episodesBar = document.getElementById('episodesBar');
    const sceneViewport = document.getElementById('sceneViewport');

    const contemplationOverlay = document.getElementById('contemplationOverlay');
    const contemplationImg = document.getElementById('contemplationImg');
    const contemplationCaption = document.getElementById('contemplationCaption');

    let currentSectionIndex = 0; 
    let currentEpisodeIndex = 0; 

    // Проверка истории сохранений при старте
    function checkSavedProgress() {
        const savedSec = localStorage.getItem('albino_mirror_sec');
        const savedEp = localStorage.getItem('albino_mirror_ep');
        if (savedSec !== null && savedEp !== null) {
            btnEnter.innerText = "Начать сначала →";
            btnContinue.classList.remove('hidden');
        }
    }

    function saveProgress(secIdx, epIdx) {
        localStorage.setItem('albino_mirror_sec', secIdx);
        localStorage.setItem('albino_mirror_ep', epIdx);
    }

    btnEnter.addEventListener('click', () => {
        welcomeScreen.style.opacity = '0';
        setTimeout(() => {
            welcomeScreen.classList.add('hidden');
            novelInterface.style.display = 'grid';
            buildSidebar();
            loadSection(0, 0); 
        }, 600);
    });

    btnContinue.addEventListener('click', () => {
        const savedSec = parseInt(localStorage.getItem('albino_mirror_sec'), 10);
        const savedEp = parseInt(localStorage.getItem('albino_mirror_ep'), 10);
        welcomeScreen.style.opacity = '0';
        setTimeout(() => {
            welcomeScreen.classList.add('hidden');
            novelInterface.style.display = 'grid';
            buildSidebar();
            loadSection(savedSec, savedEp);
        }, 600);
    });

    btnBackToMenu.addEventListener('click', () => {
        stopAllAudio();
        if (window.location.hash) {
            history.pushState("", document.title, window.location.pathname + window.location.search);
        }
        novelInterface.style.display = 'none';
        welcomeScreen.classList.remove('hidden');
        welcomeScreen.style.opacity = '1';
        checkSavedProgress();
    });

    function checkUrlHash() {
        const hash = window.location.hash;
        if (hash && hash.includes('sec=') && hash.includes('ep=')) {
            const params = new URLSearchParams(hash.replace('#', ''));
            const secIdx = parseInt(params.get('sec'), 10);
            const epIdx = parseInt(params.get('ep'), 10);
            if (!isNaN(secIdx) && secIdx >= 0 && secIdx < window.bookStructure.length && !isNaN(epIdx)) {
                welcomeScreen.classList.add('hidden');
                novelInterface.style.display = 'grid';
                buildSidebar();
                loadSection(secIdx, epIdx); 
                return true;
            }
        }
        return false;
    }

    function buildSidebar() {
        chaptersList.innerHTML = '';
        window.bookStructure.forEach((section, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-chapter';
            btn.id = `sidebar-sec-${index}`;
            btn.innerText = section.displayName;
            btn.addEventListener('click', () => { loadSection(index, 0); });
            chaptersList.appendChild(btn);
        });
    }
// app.js — Часть 2: Управление главами, эпизодами и автопереходом плеера

    function loadSection(index, targetEpisodeIndex = 0) {
        currentSectionIndex = index;
        const section = window.bookStructure[index];
        if (!section) return;

        document.querySelectorAll('.btn-chapter').forEach(b => b.classList.remove('active'));
        const activeSidebarBtn = document.getElementById(`sidebar-sec-${index}`);
        if (activeSidebarBtn) activeSidebarBtn.classList.add('active');

        applyDynamicTheme(section.brightness);
        chapterTitle.innerText = section.displayName;
        buildEpisodesBar(section.episodes);
        
        loadEpisode(targetEpisodeIndex);
    }

    function buildEpisodesBar(episodes) {
        episodesBar.innerHTML = '';
        episodes.forEach((episode, index) => {
            const btn = document.createElement('button');
            btn.className = 'btn-episode';
            btn.id = `btn-ep-${index}`;
            btn.innerText = episode.name;
            
            btn.addEventListener('click', () => { loadEpisode(index); });
            episodesBar.appendChild(btn);
        });
    }

    function loadEpisode(epIndex) {
        stopAllAudio();
        currentEpisodeIndex = epIndex;
        
        const section = window.bookStructure[currentSectionIndex];
        if (!section || !section.episodes[epIndex]) return;
        
        const episode = section.episodes[epIndex];

        document.querySelectorAll('.btn-episode').forEach(b => b.classList.remove('active'));
        const activeEpBtn = document.getElementById('btn-ep-' + epIndex);
        if (activeEpBtn) activeEpBtn.classList.add('active');

        sceneViewport.innerHTML = '';

        episode.scenes.forEach(scene => {
            if (scene.type === 'drawing') renderDrawing(scene);
            else if (scene.type === 'track') renderTrack(scene);
            else if (scene.type === 'poem') renderText(scene, 'poem');
            else if (scene.type === 'story') renderText(scene, 'story');
        });

        saveProgress(currentSectionIndex, currentEpisodeIndex);
        document.querySelector('.display-viewport').scrollTop = 0;
    }

    function renderDrawing(scene) {
        const div = document.createElement('div');
        div.className = 'drawing-block';
        div.innerHTML = `
            <div class="image-frame" id="frame-${scene.id}">
                <img src="${scene.src}" alt="${scene.title}" id="img-${scene.id}">
            </div>
            <div class="drawing-caption">${scene.title}</div>
        `;
        sceneViewport.appendChild(div);

        const imgEl = document.getElementById(`img-${scene.id}`);
        imgEl.onerror = function() {
            this.src = "https://picsum.photos"; 
            this.onerror = null;
        };

        const frameEl = document.getElementById(`frame-${scene.id}`);
        frameEl.addEventListener('click', () => { openContemplation(imgEl.src, scene.title); });
    }

    function renderTrack(scene) {
        const div = document.createElement('div');
        div.className = 'audio-track-item';
        div.innerHTML = `
            <div class="track-meta">${scene.genre} • Композиция №${scene.id}</div>
            <div class="track-name">${scene.title}</div>
            <audio controls class="audio-player" src="${scene.file}"></audio>
        `;
        sceneViewport.appendChild(div);

        // Находим созданный плеер в разметке
        const audioEl = div.querySelector('.audio-player');
        
        // Устанавливаем изначальную громкость ровно на 50% (значение от 0.0 до 1.0)
        audioEl.volume = 0.5;

        // Автоматический переход удален. По окончании трека музыка просто остановится,
        // давая посетителю возможность побыть в тишине или самостоятельно перейти к следующему шагу.
    }


    function renderText(scene, styleType) {
        const div = document.createElement('div');
        div.className = 'text-block';
        const layoutClass = styleType === 'poem' ? 'poetry-layout' : 'prose-layout';
        div.innerHTML = `<h3 class="text-title">${scene.title}</h3><div class="${layoutClass}">${scene.text}</div>`;
        sceneViewport.appendChild(div);
    }
// app.js — Часть 3: Режимы созерцания, макро-рассмотрения и системные утилиты

    let isZoomed = false; 

    function openContemplation(src, title) {
        contemplationImg.src = src;
        contemplationCaption.innerText = title;
        isZoomed = false;
        contemplationOverlay.classList.remove('zoomed');
        contemplationImg.style.transform = 'none';
        contemplationOverlay.classList.add('active');
    }

    // Слежение за мышью для детального перемещения рисунка
    contemplationOverlay.addEventListener('mousemove', (e) => {
        if (!isZoomed) return;
        
        // Рассчитываем позицию курсора от центра экрана
        const xPercent = (e.clientX / window.innerWidth) - 0.5;
        const yPercent = (e.clientY / window.innerHeight) - 0.5;
        
        // Сдвигаем увеличенный холст (коэффициент масштаба 2.5)
        const moveX = xPercent * -60;
        const moveY = yPercent * -60;
        
        contemplationImg.style.transition = 'none';
        contemplationImg.style.transform = `scale(2.5) translate(${moveX}%, ${moveY}%)`;
    });

    // Обработка двух уровней кликов
    contemplationOverlay.addEventListener('click', (e) => {
        if (!isZoomed) {
            if (e.target === contemplationImg) {
                isZoomed = true;
                contemplationOverlay.classList.add('zoomed');
                contemplationImg.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
                
                const xPercent = (e.clientX / window.innerWidth) - 0.5;
                const yPercent = (e.clientY / window.innerHeight) - 0.5;
                const startX = xPercent * -60;
                const startY = yPercent * -60;
                
                contemplationImg.style.transform = `scale(2.5) translate(${startX}%, ${startY}%)`;
            } else {
                contemplationOverlay.classList.remove('active');
            }
        } else {
            exitMacroMode();
        }
    });

    function exitMacroMode() {
        isZoomed = false;
        contemplationOverlay.classList.remove('zoomed');
        contemplationImg.style.transition = 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)';
        contemplationImg.style.transform = 'scale(1) translate(0%, 0%)';
    }

    // Кнопка Escape для пошагового выхода
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && contemplationOverlay.classList.contains('active')) {
            if (isZoomed) exitMacroMode();
            else contemplationOverlay.classList.remove('active');
        }
    });

    // Динамический расчет темы оформления на основе точной авторской HEX-матрицы
    function applyDynamicTheme(brightness) {
        // Берем точный цвет текущей секции романа
        const currentSection = window.bookStructure[currentSectionIndex];
        const bgColor = currentSection ? currentSection.hexColor : "#000000";
        
        // Красим фоны сайта
        document.body.style.backgroundColor = bgColor;
        novelInterface.style.backgroundColor = bgColor;

        // Рассчитываем инверсию текста (порог 50% яркости)
        // Для #939393 (яркость 58) текст станет чёрным, обеспечивая идеальную читаемость
        const textColor = brightness > 50 ? '#000000' : '#ffffff';
        const cardBg = brightness > 50 ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)';
        const borderColor = brightness > 50 ? 'rgba(0, 0, 0, 0.18)' : 'rgba(255, 255, 255, 0.22)';

        document.documentElement.style.setProperty('--text-color', textColor);
        document.documentElement.style.setProperty('--card-bg', cardBg);
        document.documentElement.style.setProperty('--border-color', borderColor);
        document.documentElement.style.setProperty('--novel-bg', bgColor);
    }


    function stopAllAudio() {
        document.querySelectorAll('audio').forEach(audio => audio.pause());
    }

    // ИНИЦИАЛИЗАЦИЯ ДВИЖКА ПРИ СТАРТЕ СТРАНИЦЫ
    const hashLoaded = checkUrlHash();
    if (!hashLoaded) {
        checkSavedProgress();
    }
});
