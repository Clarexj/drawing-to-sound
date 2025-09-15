// --- 全局变量 ---
let canvas;
let selectedColor;
const colors = ['#FF4136', '#FF851B', '#FFDC00', '#2ECC40', '#0074D9', '#B10DC9', '#F012BE'];
let colorBrushes = []; // 用于存储颜色按钮的DOM元素

// --- “自然声景”引擎 ---
let melody = []; 
let birdSound, waterSound, windSound;
let playbackTimeout;

// --- 播放状态管理 ---
let playbackState = 'stopped'; // 'stopped', 'playing', 'paused'
let currentNoteIndex = 0;
let playButton;

function preload() {
    birdSound = loadSound('assets/bird.mp3');
    waterSound = loadSound('assets/water.mp3');
    windSound = loadSound('assets/wind.mp3');
}

function setup() {
    document.getElementById('loading-message').style.display = 'none';
    document.getElementById('app-content').style.display = 'flex';

    canvas = createCanvas(500, 300);
    canvas.parent('canvas-container');
    
    playButton = select('#playSoundBtn');
    playButton.mousePressed(handlePlayPause);
    select('#clearBtn').mousePressed(clearCanvas);

    const brushesContainer = select('#color-brushes');
    colors.forEach(color => {
        const brush = createDiv('');
        brush.class('color-brush');
        brush.style('background-color', color);
        brush.parent(brushesContainer);
        
        // --- 关键修复：为每个按钮添加完整的点击逻辑 ---
        brush.mousePressed(() => {
            // 1. 更新当前选中的颜色变量
            selectedColor = color;
            
            // 2. 移除所有按钮的高亮样式
            colorBrushes.forEach(b => b.removeClass('active'));
            
            // 3. 只给当前点击的这一个按钮添加高亮样式
            brush.addClass('active');
        });
        
        colorBrushes.push(brush); // 将按钮元素存入数组
    });

    // 初始状态设定
    selectedColor = colors[0];
    colorBrushes[0].addClass('active'); // 默认高亮第一个

    clearCanvas();
}

function clearCanvas() {
    stopPlayback();
    melody = [];
    background(255);
}

function draw() {
    if (mouseIsPressed && mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height) {
        stroke(selectedColor);
        strokeWeight(10);
        line(pmouseX, pmouseY, mouseX, mouseY);
        melody.push({ x: mouseX, y: mouseY });
    }
}

function handlePlayPause() {
    if (getAudioContext().state !== 'running') getAudioContext().resume();

    if (playbackState === 'playing') {
        pausePlayback();
    } else {
        startPlayback();
    }
}

function startPlayback() {
    if (melody.length === 0) return;
    
    if (playbackState === 'stopped') {
        melody.sort((a, b) => a.x - b.x);
        currentNoteIndex = 0;
    }
    
    playbackState = 'playing';
    updatePlayButton('Pause', 'paused');
    playNote(currentNoteIndex);
}

function pausePlayback() {
    playbackState = 'paused';
    clearTimeout(playbackTimeout);
    updatePlayButton('Resume', 'paused');
}

function stopPlayback() {
    playbackState = 'stopped';
    clearTimeout(playbackTimeout);
    
    if (birdSound && birdSound.isPlaying()) birdSound.stop();
    if (waterSound && waterSound.isPlaying()) waterSound.stop();
    if (windSound && windSound.isPlaying()) windSound.stop();
    
    updatePlayButton('Turn Drawing Into Sound', '');
    currentNoteIndex = 0;
}

function playNote(index) {
    if (index >= melody.length || playbackState !== 'playing') {
        stopPlayback();
        return;
    }

    const currentNote = melody[index];
    const yPos = currentNote.y;

    if (yPos < height / 3) {
        birdSound.rate(random(0.8, 1.5));
        birdSound.setVolume(random(0.5, 1));
        birdSound.play();
    } else if (yPos > height * 2 / 3) {
        waterSound.setVolume(random(0.6, 1));
        waterSound.play(0, 1, 1, 0, 0.5);
    } else {
        windSound.setVolume(random(0.4, 0.7));
        windSound.play(0, 1, 1, 0, 1);
    }
    
    const intervalThreshold = 20;
    let nextIndex = index + 1;
    while (nextIndex < melody.length && melody[nextIndex].x < currentNote.x + intervalThreshold) {
        nextIndex++;
    }
    
    currentNoteIndex = nextIndex;

    const timeToNextNote = 180;
    playbackTimeout = setTimeout(() => playNote(currentNoteIndex), timeToNextNote);
}

function updatePlayButton(text, className) {
    playButton.html(text);
    playButton.removeClass('paused'); // 先移除旧样式
    if (className) {
        playButton.addClass(className);
    }
}