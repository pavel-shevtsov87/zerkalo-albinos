// data.js — Обновленная структура романа "Зеркало-Альбинос" по принципу "Горы"

function generateTrueNovelStructure() {
    const structure = [];
    const totalTracks = 66;
    const peakTrack = 33;

    // Вспомогательные базы текстов (измените под свои шедевры)
    const drawingsTitles = {
        1: "Пробуждение пустоты", 2: "Искажение реальности", 7: "Голос Интерлюдии I", 
        14: "Взгляд Интерлюдии II", 21: "Финал иллюзии"
    };
    
// =========================================================================
    // ПУТИ К ТЕКСТОВЫМ ФАЙЛАМ (.TXT)
    // =========================================================================
    // Теперь тексты загружаются из внешних файлов. 
    // Здесь указаны только пути к ним для автоматической подгрузки.
    
    const poemsData = {
        1: { title: "Стихотворение 1", file: "texts/poems/poem1.txt" },
        2: { title: "Стихотворение 2", file: "texts/poems/poem2.txt" },
        3: { title: "Стихотворение 3", file: "texts/poems/poem3.txt" },
        4: { title: "Стихотворение 4", file: "texts/poems/poem4.txt" },
        5: { title: "Стихотворение 5", file: "texts/poems/poem5.txt" },
        6: { title: "Стихотворение 6", file: "texts/poems/poem6.txt" },
        7: { title: "Стихотворение 7", file: "texts/poems/poem7.txt" },
        8: { title: "Стихотворение 8", file: "texts/poems/poem8.txt" },
        9: { title: "Стихотворение 9 (Финал)", file: "texts/poems/poem9.txt" }
    };

    const storiesData = {
        1: { title: "Рассказ 1", file: "story1.txt" },
        2: { title: "Рассказ 2", file: "texts/stories/story2.txt" },
        3: { title: "Рассказ 3", file: "texts/stories/story3.txt" },
        4: { title: "Рассказ 4", file: "texts/stories/story4.txt" },
        5: { title: "Рассказ 5", file: "texts/stories/story5.txt" },
        6: { title: "Рассказ 6", file: "texts/stories/story6.txt" },
        7: { title: "Рассказ 7", file: "texts/stories/story7.txt" },
        8: { title: "Рассказ 8", file: "texts/stories/story8.txt" }
    };

    const specialTexts = {
        "Поэма": { title: "Поэма (Психолого-мистический хоррор/триллер)", file: "texts/poems/novel_poem.txt" },
        "Повесть": { title: "Повесть (Центральный узел усложнения)", file: "novel_novella.txt" }
    };

    let globalTrack = 1;
    let globalDrawing = 1;
    let globalPoem = 1;
    let globalStory = 1;

    function createStandardChapter(partNum, chapNum, chapName) {
        const episodes = [];
        const isPeakChapter = (partNum === 2 && chapNum === 2); // Проверка на Главу II Части II

        // Эпизод 1: Рисунок, Трек, Трек
        episodes.push({
            name: "Эпизод 1",
            scenes: [
                { type: "drawing", id: globalDrawing, src: `drawings/drawing${globalDrawing}.jpg`, title: drawingsTitles[globalDrawing] || `Рисунок ${globalDrawing}` },
                { type: "track", id: globalTrack, file: `audio/track${globalTrack}.mp3`, title: `Трек ${globalTrack}`, genre: "Арт-рок" },
                { type: "track", id: globalTrack + 1, file: `audio/track${globalTrack + 1}.mp3`, title: `Трек ${globalTrack + 1}`, genre: "Прог-рок" }
            ]
        });
        globalDrawing++;
        globalTrack += 2;

        // Эпизод 2: Стихотворение ИЛИ Поэма (на пике)
        if (isPeakChapter) {
            episodes.push({
                name: "Эпизод 2",
                scenes: [{ type: "poem", id: "novel_poem", title: specialTexts["Поэма"].title, file: specialTexts["Поэма"].file, isPeak: true }]
            });
        } else {
            const pData = poemsData[globalPoem] || { title: `Стихотворение ${globalPoem}`, text: "Текст..." };
            episodes.push({
                name: "Эпизод 2",
                scenes: [{ type: "poem", id: globalPoem, title: pData.title, file: pData.file }]
            });
            globalPoem++;
        }

        // Эпизод 3: Трек, Трек, Трек
        const t3_1 = globalTrack;
        const t3_2 = globalTrack + 1;
        const t3_3 = globalTrack + 2;
        episodes.push({
            name: "Эпизод 3",
            scenes: [
                { type: "track", id: t3_1, file: `audio/track${t3_1}.mp3`, title: t3_1 === 33 ? "Зеркало-Альбинос" : `Трек ${t3_1}`, genre: "Арт-рок" },
                { type: "track", id: t3_2, file: `audio/track${t3_2}.mp3`, title: t3_2 === 33 ? "Зеркало-Альбинос" : `Трек ${t3_2}`, genre: "Прог-рок" },
                { type: "track", id: t3_3, file: `audio/track${t3_3}.mp3`, title: t3_3 === 33 ? "Зеркало-Альбинос" : `Трек ${t3_3}`, genre: "Арт-рок" }
            ]
        });
        globalTrack += 3;

        // Эпизод 4: Рассказ ИЛИ Повесть (на пике)
        if (isPeakChapter) {
            episodes.push({
                name: "Эпизод 4",
                scenes: [{ type: "story", id: "novel_novella", title: specialTexts["Повесть"].title, text: specialTexts["Повесть"].text, isPeak: true }]
            });
        } else {
            const sData = storiesData[globalStory] || { title: `Рассказ ${globalStory}`, text: "Текст..." };
            episodes.push({
                name: "Эпизод 4",
                scenes: [{ type: "story", id: globalStory, title: sData.title, text: sData.text }]
            });
            globalStory++;
        }

        // Эпизод 5: Трек, Трек, Рисунок
        episodes.push({
            name: "Эпизод 5",
            scenes: [
                { type: "track", id: globalTrack, file: `audio/track${globalTrack}.mp3`, title: `Трек ${globalTrack}`, genre: "Прог-рок" },
                { type: "track", id: globalTrack + 1, file: `audio/track${globalTrack + 1}.mp3`, title: `Трек ${globalTrack + 1}`, genre: "Арт-рок" },
                { type: "drawing", id: globalDrawing, src: `drawings/drawing${globalDrawing}.jpg`, title: drawingsTitles[globalDrawing] || `Рисунок ${globalDrawing}` }
            ]
        });
        globalDrawing++;
        globalTrack += 2;

        return {
            type: "chapter",
            id: `p${partNum}c${chapNum}`,
            displayName: `Часть ${partNum === 1 ? 'I' : partNum === 2 ? 'II' : 'III'} • Глава ${chapNum === 1 ? 'I' : chapNum === 2 ? 'II' : 'III'}`,
            episodes: episodes
        };
    }

    // --- СБОРКА МАТРИЦЫ ---
    structure.push(createStandardChapter(1, 1, "Глава I"));
    structure.push(createStandardChapter(1, 2, "Глава II"));
    structure.push(createStandardChapter(1, 3, "Глава III"));

    structure.push({
        type: "interlude",
        id: "interlude1",
        displayName: "Интерлюдия I",
        episodes: [{
            name: "Контент",
            scenes: [
                { type: "drawing", id: globalDrawing, src: `drawings/drawing${globalDrawing}.jpg`, title: drawingsTitles[globalDrawing] || "Рисунок 7" },
                { type: "track", id: globalTrack, file: `audio/track${globalTrack}.mp3`, title: `Трек ${globalTrack}`, genre: "Арт-рок" }
            ]
        }]
    });
    globalDrawing++; globalTrack++;

    structure.push(createStandardChapter(2, 1, "Глава I"));
    structure.push(createStandardChapter(2, 2, "Глава II")); // ПИК: Поэма, Повесть, Семь длинных треков (2+3+2)
    structure.push(createStandardChapter(2, 3, "Глава III"));

    structure.push({
        type: "interlude",
        id: "interlude2",
        displayName: "Интерлюдия II",
        episodes: [{
            name: "Контент",
            scenes: [
                { type: "drawing", id: globalDrawing, src: `drawings/drawing${globalDrawing}.jpg`, title: drawingsTitles[globalDrawing] || "Рисунок 14" },
                { type: "track", id: globalTrack, file: `audio/track${globalTrack}.mp3`, title: `Трек ${globalTrack}`, genre: "Прог-рок" }
            ]
        }]
    });
    globalDrawing++; globalTrack++;

    structure.push(createStandardChapter(3, 1, "Глава I"));
    structure.push(createStandardChapter(3, 2, "Глава II"));
    structure.push(createStandardChapter(3, 3, "Глава III"));

    // КОДА: Рисунок 21, Стихотворение 9 (Финальное), Трек 66
    structure.push({
        type: "coda",
        id: "coda",
        displayName: "КОДА",
        episodes: [{
            name: "Финал",
            scenes: [
                { type: "drawing", id: globalDrawing, src: `drawings/drawing${globalDrawing}.jpg`, title: drawingsTitles[globalDrawing] || "Рисунок 21" },
                { type: "poem", id: 9, title: poemsData[9].title, text: poemsData[9].text },
                { type: "track", id: globalTrack, file: `audio/track${globalTrack}.mp3`, title: `Трек ${globalTrack}`, genre: "Прог-рок" }
            ]
        }]
    });

    // Применение стабильной цветовой карты автора (HEX)
    const colorMatrix = {
        "p1c1": { hex: "#000000", brightness: 0 }, "p1c2": { hex: "#4f4f4f", brightness: 31 }, "p1c3": { hex: "#6d6d6d", brightness: 43 }, "interlude1": { hex: "#939393", brightness: 58 },
        "p2c1": { hex: "#c2c2c2", brightness: 76 }, "p2c2": { hex: "#ffffff", brightness: 100 }, "p2c3": { hex: "#c2c2c2", brightness: 76 }, "interlude2": { hex: "#939393", brightness: 58 },
        "p3c1": { hex: "#6d6d6d", brightness: 43 }, "p3c2": { hex: "#4f4f4f", brightness: 31 }, "p3c3": { hex: "#434343", brightness: 26 }, "coda": { hex: "#000000", brightness: 0 }
    };

    structure.forEach((section) => {
        const colorData = colorMatrix[section.id];
        if (colorData) {
            section.hexColor = colorData.hex;
            section.brightness = colorData.brightness;
        }
    });

    return structure;
}

window.bookStructure = generateTrueNovelStructure();
