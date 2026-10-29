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

   // Добавьте этот код в самый конец функции buildSidebar() прямо перед закрывающей фигурной скобкой }
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

    // --- НОВАЯ КНОПКА ВОЗВРАТА К СХЕМЕ ---
    const btnMatrixSchema = document.createElement('button');
    btnMatrixSchema.className = 'btn-chapter schema-matrix-btn';
    btnMatrixSchema.innerHTML = '⚙️ СХЕМА ПОЭМЫ'; // Можно использовать эзотерический символ вроде ☵ или 🎛️
    btnMatrixSchema.style.marginTop = 'auto'; // Вытолкнет кнопку вниз панели
    btnMatrixSchema.style.borderTop = '1px solid var(--border-color)';
    
    btnMatrixSchema.addEventListener('click', () => {
        stopAllAudio();
        // Если схема романа у вас открывается по вызову функции или смене экрана:
        // Вариант А: если схема — это отдельный экранwelcomeScreen, где вы нажимали кнопку:
        novelInterface.style.display = 'none';
        welcomeScreen.classList.remove('hidden');
        welcomeScreen.style.opacity = '1';
        
        // Автоматически эмулируем клик по кнопке "Схема романа" на главном экране, если она там есть:
        const mainSchemaBtn = document.querySelector('button[id*="Schema"], .btn-schema, a[href*="schema"]');
        if (mainSchemaBtn) mainSchemaBtn.click();
    });
    chaptersList.appendChild(btnMatrixSchema);
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

// =========================================================================
// ЧАСТЬ 2 (ПРОДОЛЖЕНИЕ): ИСПРАВЛЕННЫЙ БЛОК УПРАВЛЕНИЯ СКВОЗНЫМ АУДИОПЛЕЕРОМ
// =========================================================================

   function loadEpisode(epIndex) {
    // СТОП-СИГНАЛ УДАЛЕН: Сквозной плеер продолжает играть при смене вкладок.
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
    div.className = 'track-launcher-block';
    
    const currentSection = window.bookStructure[currentSectionIndex];
    const currentEpisode = currentSection.episodes[currentEpisodeIndex];
    const locationString = `${currentSection.displayName} • ${currentEpisode.name}`;

    const globalAudio = document.getElementById('globalAudioEngine');
    const isThisPlaying = (globalAudio.src && globalAudio.src.includes(scene.file) && !globalAudio.paused);

    div.innerHTML = `
        <div class="track-meta">${scene.genre} • Композиция №${scene.id}</div>
        <div class="track-name">${scene.title}</div>
        <button class="btn-launch-track ${isThisPlaying ? 'active-playing' : ''}" id="launch-${scene.id}">
            ${isThisPlaying ? '‖ Пауза' : '▶ Слушать трек'}
        </button>
    `;
    sceneViewport.appendChild(div);

    const launchBtn = document.getElementById(`launch-${scene.id}`);
    launchBtn.addEventListener('click', () => {
        initGlobalTrack(scene.file, scene.title, locationString, launchBtn);
    });
}

function initGlobalTrack(fileUrl, title, location, triggerBtn) {
    const audio = document.getElementById('globalAudioEngine');
    const playerPanel = document.getElementById('globalFloatingPlayer');
    const playBtn = document.getElementById('globalPlayBtn');
    const trackName = document.getElementById('globalTrackName');
    const trackLocation = document.getElementById('globalTrackLocation');
    const progressBar = document.getElementById('globalProgressBar');
    const progressArea = document.getElementById('globalProgressArea');
    const timeDisplay = document.getElementById('globalTimeDisplay');
    const volumeSlider = document.getElementById('globalVolumeSlider');

    // Если кликнули по тому же треку, который уже играет/загружен
    if (audio.src && audio.src.includes(fileUrl)) {
        if (audio.paused) {
            audio.play();
            playBtn.innerText = '‖';
            triggerBtn.innerText = '‖ Пауза';
            triggerBtn.classList.add('active-playing');
        } else {
            audio.pause();
            playBtn.innerText = '▶';
            triggerBtn.innerText = '▶ Слушать трек';
            triggerBtn.classList.remove('active-playing');
        }
        return;
    }

    // Сброс визуального состояния прошлых кнопок на текущей странице
    document.querySelectorAll('.btn-launch-track').forEach(btn => {
        btn.innerText = '▶ Слушать трек';
        btn.classList.remove('active-playing');
    });

    // Загрузка нового трека
    audio.src = fileUrl;
    trackName.innerText = title;
    trackLocation.innerText = location;
    
    playerPanel.classList.remove('hidden'); 
    
    // Изначальная громкость на 50%, если слайдер не трогали
    audio.volume = volumeSlider.value; 
    
    audio.play();
    playBtn.innerText = '‖';
    triggerBtn.innerText = '‖ Пауза';
    triggerBtn.classList.add('active-playing');

    // Инициализация системных событий управления ползунками (навешивается строго ОДИН раз)
    if (!audio.dataset.initialized) {
        audio.dataset.initialized = 'true';

        audio.addEventListener('timeupdate', () => {
            const percentage = (audio.currentTime / audio.duration) * 100;
            progressBar.style.width = `${percentage}%`;
            
            const mins = Math.floor(audio.currentTime / 60);
            const secs = Math.floor(audio.currentTime % 60).toString().padStart(2, '0');
            timeDisplay.innerText = `${mins}:${secs}`;
        });

        playBtn.addEventListener('click', () => {
            if (audio.paused) {
                audio.play();
                playBtn.innerText = '‖';
                const activeBtn = document.querySelector('.btn-launch-track.active-playing'); 
                if (activeBtn) activeBtn.innerText = '‖ Пауза';
            } else {
                audio.pause();
                playBtn.innerText = '▶';
                const activeBtn = document.querySelector('.btn-launch-track.active-playing');
                if (activeBtn) activeBtn.innerText = '▶ Слушать трек';
            }
        });

        progressArea.addEventListener('click', (e) => {
            const width = progressArea.clientWidth;
            const clickX = e.offsetX;
            if (audio.duration) {
                audio.currentTime = (clickX / width) * audio.duration;
            }
        });

        volumeSlider.addEventListener('input', (e) => {
            audio.volume = e.target.value;
        });

        audio.addEventListener('ended', () => {
            playBtn.innerText = '▶';
            progressBar.style.width = '0%';
            timeDisplay.innerText = '0:00';
            const activeBtn = document.querySelector('.btn-launch-track.active-playing');
            if (activeBtn) {
                activeBtn.innerText = '▶ Слушать трек';
                activeBtn.classList.remove('active-playing');
            }
        });
    }
}

// ЕДИНАЯ ИСПРАВЛЕННАЯ СИСТЕМНАЯ ФУНКЦИЯ ОСТАНОВКИ АУДИО (вызывается при выходе в меню/схему)
function stopAllAudio() {
    const audio = document.getElementById('globalAudioEngine');
    if (audio) {
        audio.pause();
        audio.src = ''; // Полностью освобождаем аудиопоток
    }
    const playBtn = document.getElementById('globalPlayBtn');
    if (playBtn) playBtn.innerText = '▶';
    
    // Сбрасываем интерактивные классы кнопок на страницах
    document.querySelectorAll('.btn-launch-track').forEach(btn => {
        btn.innerText = '▶ Слушать трек';
        btn.classList.remove('active-playing');
    });
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


   
    // ИНИЦИАЛИЗАЦИЯ ДВИЖКА ПРИ СТАРТЕ СТРАНИЦЫ
    const hashLoaded = checkUrlHash();
    if (!hashLoaded) {
        checkSavedProgress();
    }
});

