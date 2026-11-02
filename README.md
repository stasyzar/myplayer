# 🎵 MyPlayer — Interactive Web Audio Waveform Player

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript&logoColor=white)
![D3.js](https://img.shields.io/badge/D3.js-v7-F9A03C?logo=d3dotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?logo=vite&logoColor=white)
![Web Audio API](https://img.shields.io/badge/Web_Audio_API-Native-7B2CBF)

**MyPlayer** — сучасний веб-аудіоплеєр із візуалізацією звукової хвилі (waveform) у реальному часі, побудований на базі **React 19**, **TypeScript**, **Web Audio API** та **D3.js**.

---

## ✨ Основні можливості

- 📂 **Drag & Drop та вибір файлу** — зручне завантаження будь-яких локальних аудіофайлів (`audio/*`) перетягуванням у зону плеєра або через стандартний діалог.
- 📊 **Генерація звукової хвилі (D3.js + SVG)** — автоматичний аналіз аудіобуфера (`AudioBuffer.getChannelData`), семплювання та нормалізація амплітуд у градієнтну SVG-діаграму з координатною сіткою та шкалою часу (`MM:SS`).
- 🎯 **Інтерактивний курсор (Playhead & Seek)** — плавна синхронізація позиції відтворення через `requestAnimationFrame` та можливість перемотування треку перетягуванням курсора (`d3.drag`) у реальному часі.
- 🎛️ **Керування відтворенням (Web Audio API)** — повна підтримка `Play ▶`, `Pause ⏸`, `Stop ⏹` через `AudioContext` та `AudioBufferSourceNode`.
- 🔊 **Контроль гучності та Mute** — анімований слайдер гучності на основі `GainNode` із миттєвим вимкненням/відновленням звуку (`🔊 / 🔇`) та збереженням попереднього рівня.

---

## 🛠️ Технологічний стек

| Технологія | Призначення |
| :--- | :--- |
| **React 19** | Компонентна архітектура та керування станом UI |
| **TypeScript** | Статична типізація аудіодрайвера, D3-візуалізатора та компонентів |
| **Web Audio API** | Декодування аудіо (`decodeAudioData`), керування графом звуку (`AudioContext`, `GainNode`, `AudioBufferSourceNode`) |
| **D3.js (v7)** | Побудова SVG-хвилі, масштабування (`scaleLinear`, `scaleBand`), осі часу та `d3.drag` |
| **Vite** | Швидке збирання та миттєвий HMR під час розробки |
| **Oxlint** | Надшвидкий лінтинг коду |

---

## 📁 Структура проєкту

```text
player/
├── public/                 # Статичні асети та іконки
├── src/
│   ├── components/
│   │   ├── Player.tsx      # UI плеєра, Drag & Drop зона, панель керування та цикл анімації
│   │   ├── SoundDriver.tsx # Обгортка над Web Audio API (декодування, play/pause/stop, seek, gain)
│   │   ├── Drawer.tsx      # Візуалізатор звукової хвилі та інтерактивного курсора на D3.js
│   │   └── interface.d.ts  # Типи параметрів візуалізації (IOptions)
│   ├── pages/
│   │   └── HomePage.tsx    # Головна сторінка застосунку
│   ├── App.tsx             # Корінь застосунку
│   └── main.tsx            # Точка входу React DOM
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

---

## 🚀 Швидкий старт

### 1. Клонування репозиторію

```bash
git clone https://github.com/stasyzar/myplayer.git
cd myplayer
```

### 2. Встановлення залежностей

```bash
npm install
```

### 3. Запуск у режимі розробки

```bash
npm run dev
```

Відкрийте у браузері адресу, вказану в терміналі (зазвичай `http://localhost:5173`), та перетягніть будь-який аудіофайл (`.mp3`, `.wav`, `.ogg` тощо) у вікно плеєра.

---

## 📜 Доступні скрипти

- `npm run dev` — запуск локального dev-сервера Vite.
- `npm run build` — перевірка типів TypeScript (`tsc -b`) та продакшн-збірка в папку `dist/`.
- `npm run preview` — локальний перегляд зібраної продакшн-версії.
- `npm run lint` — перевірка коду за допомогою `oxlint`.
