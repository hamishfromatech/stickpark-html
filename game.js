// Game constants
const GRAVITY = 0.5;
const JUMP_FORCE = -12;
const MOVE_SPEED = 5;
const SPRINT_MULTIPLIER = 1.8;
const WALL_JUMP_HORIZONTAL_FORCE = 8;
const ROLL_DURATION = 20; // frames
const SLOW_MOTION_FACTOR = 0.3;

// Power-up constants
const SPEED_BOOST_DURATION = 300; // frames
const DOUBLE_JUMP_DURATION = 600; // frames
const INVINCIBILITY_DURATION = 180; // frames

// Particle system constants
const MAX_PARTICLES = 100;
const PARTICLE_LIFETIME = 30;

// Audio system - using MyInstants sound URLs
const AUDIO_URLS = {
    jump: 'https://www.myinstants.com/media/sounds/mario-jump.mp3',
    roll: 'https://www.myinstants.com/media/sounds/dash.mp3',
    levelComplete: 'https://www.myinstants.com/media/sounds/super-mario-bros-level-complete.mp3',
    background: 'https://www.myinstants.com/media/sounds/geometry-dash-level-selected.mp3'
};

// Game state
let gameStarted = false;
let gameTime = 0;
let slowMotion = false;
let currentLevel = 0;
let showTutorial = true;
let tutorialStep = 0;
let levelCompleting = false; // Flag to prevent multiple level completion calls
let modalShown = false; // Flag to prevent game input when modals are shown

// Audio system
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
const audioBuffers = {};
let backgroundMusic = null;
let backgroundMusicPlaying = false;

// Particle system
let particles = [];

// Power-ups
let activePowerUps = {
    speedBoost: 0,
    doubleJump: 0,
    invincibility: 0
};

// Player state
const player = {
    x: 100,
    y: 100,
    width: 20,
    height: 40,
    velocityX: 0,
    velocityY: 0,
    isJumping: false,
    isWallRunning: false,
    isRolling: false,
    rollTimer: 0,
    isSprinting: false,
    facingRight: true,
    onGround: false,
    touchingWall: false,
    animationState: 'idle',
    animationFrame: 0,
    animationTimer: 0,
    hasDoubleJump: false,
    checkpointX: 100,
    checkpointY: 100
};

// Input handling
const keys = {
    left: false,
    right: false,
    up: false,
    down: false,
    shift: false,
    c: false
};

// Mobile controls
const mobileButtons = {
    left: false,
    right: false,
    jump: false,
    sprint: false,
    roll: false
};

// Levels data
const levels = [
    // Level 1: Basic platforming
    {
        name: "Beginner Course",
        platforms: [
            { x: 0, y: 500, width: 800, height: 20 },
            { x: 200, y: 400, width: 100, height: 20 },
            { x: 350, y: 350, width: 100, height: 20 },
            { x: 500, y: 300, width: 100, height: 20 },
            { x: 650, y: 250, width: 100, height: 20 }
        ],
        walls: [
            { x: 700, y: 250, width: 20, height: 250 },
            { x: 400, y: 200, width: 20, height: 150 }
        ],
        billboards: [
            { x: 200, y: 300, width: 120, height: 60, text: "PARKOUR" },
            { x: 450, y: 200, width: 150, height: 60, text: "RUNNER" }
        ],
        obstacles: [
            { x: 300, y: 480, width: 50, height: 20 }
        ],
        powerUps: [
            { x: 220, y: 370, width: 20, height: 20, type: 'speed', collected: false },
            { x: 520, y: 270, width: 20, height: 20, type: 'doubleJump', collected: false }
        ],
        checkpoints: [
            { x: 100, y: 450, width: 20, height: 40 }
        ],
        goal: { x: 750, y: 230, width: 30, height: 20 },
        startX: 100,
        startY: 100
    },
    // Level 2: Wall running challenge
    {
        name: "Wall Runner",
        platforms: [
            { x: 0, y: 500, width: 200, height: 20 },
            { x: 300, y: 500, width: 200, height: 20 },
            { x: 600, y: 500, width: 200, height: 20 },
            { x: 150, y: 350, width: 100, height: 20 },
            { x: 450, y: 350, width: 100, height: 20 }
        ],
        walls: [
            { x: 200, y: 350, width: 20, height: 150 },
            { x: 500, y: 350, width: 20, height: 150 },
            { x: 280, y: 200, width: 20, height: 300 },
            { x: 520, y: 200, width: 20, height: 300 }
        ],
        billboards: [
            { x: 180, y: 250, width: 120, height: 60, text: "WALL" },
            { x: 480, y: 250, width: 120, height: 60, text: "RUN" },
            { x: 380, y: 150, width: 120, height: 60, text: "JUMP" }
        ],
        obstacles: [],
        powerUps: [
            { x: 320, y: 470, width: 20, height: 20, type: 'speed', collected: false },
            { x: 620, y: 470, width: 20, height: 20, type: 'invincibility', collected: false }
        ],
        checkpoints: [
            { x: 100, y: 450, width: 20, height: 40 },
            { x: 350, y: 450, width: 20, height: 40 }
        ],
        goal: { x: 750, y: 480, width: 30, height: 20 },
        startX: 100,
        startY: 100
    },
    // Level 3: Advanced parkour
    {
        name: "Master Course",
        platforms: [
            { x: 0, y: 500, width: 150, height: 20 },
            { x: 200, y: 450, width: 80, height: 20 },
            { x: 350, y: 400, width: 80, height: 20 },
            { x: 500, y: 350, width: 80, height: 20 },
            { x: 650, y: 300, width: 80, height: 20 },
            { x: 750, y: 250, width: 50, height: 20 }
        ],
        walls: [
            { x: 150, y: 350, width: 20, height: 150 },
            { x: 300, y: 300, width: 20, height: 200 },
            { x: 450, y: 250, width: 20, height: 250 },
            { x: 600, y: 200, width: 20, height: 300 }
        ],
        billboards: [
            { x: 180, y: 350, width: 100, height: 60, text: "FAST" },
            { x: 330, y: 300, width: 100, height: 60, text: "ROLL" },
            { x: 480, y: 250, width: 100, height: 60, text: "JUMP" },
            { x: 630, y: 200, width: 100, height: 60, text: "GO!" }
        ],
        obstacles: [
            { x: 220, y: 430, width: 40, height: 20 },
            { x: 370, y: 380, width: 40, height: 20 },
            { x: 520, y: 330, width: 40, height: 20 }
        ],
        powerUps: [
            { x: 220, y: 420, width: 20, height: 20, type: 'doubleJump', collected: false },
            { x: 370, y: 370, width: 20, height: 20, type: 'speed', collected: false },
            { x: 520, y: 320, width: 20, height: 20, type: 'invincibility', collected: false }
        ],
        checkpoints: [
            { x: 100, y: 450, width: 20, height: 40 },
            { x: 250, y: 420, width: 20, height: 40 },
            { x: 400, y: 370, width: 20, height: 40 },
            { x: 550, y: 320, width: 20, height: 40 }
        ],
        goal: { x: 780, y: 230, width: 20, height: 20 },
        startX: 50,
        startY: 100
    }
];

// Current level data (will be set from levels array)
let platforms = [];
let walls = [];
let billboards = [];
let obstacles = [];
let powerUps = [];
let checkpoints = [];
let goal = {};

// Leaderboard data
let leaderboard = JSON.parse(localStorage.getItem('parkourLeaderboard') || '[]');

// Tutorial messages
const tutorialMessages = [
    "Welcome to Stickman Parkour! Use arrow keys to move.",
    "Press SPACE to jump. Try jumping on platforms!",
    "Hold SHIFT to sprint for extra speed.",
    "Press C to roll - you can roll through obstacles!",
    "Run along walls and billboards to wall run across gaps!",
    "Collect colored power-ups for special abilities!",
    "Reach the green goal to complete the level!",
    "Good luck! Complete levels quickly for the leaderboard!"
];

// Setup canvas
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const timerElement = document.getElementById('timer');
const levelDisplay = document.getElementById('levelDisplay');
const restartButton = document.getElementById('restartButton');
const levelSelectButton = document.getElementById('levelSelectButton');
const leaderboardButton = document.getElementById('leaderboardButton');
const mobileControls = document.getElementById('mobileControls');

// Modal elements
const customModal = document.getElementById('customModal');
const modalTitle = document.getElementById('modalTitle');
const modalMessage = document.getElementById('modalMessage');
const modalCancelBtn = document.getElementById('modalCancelBtn');
const modalOkBtn = document.getElementById('modalOkBtn');

// Custom modal functions
function showAlert(title, message, callback = null) {
    modalShown = true;
    modalTitle.textContent = title;
    modalMessage.innerHTML = ''; // Clear any previous content
    modalMessage.textContent = message;
    modalCancelBtn.style.display = 'none';
    modalOkBtn.textContent = 'OK';
    
    customModal.style.display = 'flex';
    
    function handleOk() {
        modalShown = false;
        customModal.style.display = 'none';
        modalOkBtn.removeEventListener('click', handleOk);
        document.removeEventListener('keydown', handleKey);
        if (callback) callback();
    }
    
    function handleKey(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOk();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleOk();
        }
    }
    
    modalOkBtn.addEventListener('click', handleOk);
    document.addEventListener('keydown', handleKey);
}

function showConfirm(title, message, callback) {
    modalShown = true;
    modalTitle.textContent = title;
    modalMessage.innerHTML = ''; // Clear any previous content
    modalMessage.textContent = message;
    modalCancelBtn.style.display = 'inline-block';
    modalOkBtn.textContent = 'Continue';
    modalCancelBtn.textContent = 'Cancel';
    
    customModal.style.display = 'flex';
    
    function handleOk() {
        modalShown = false;
        customModal.style.display = 'none';
        modalOkBtn.removeEventListener('click', handleOk);
        modalCancelBtn.removeEventListener('click', handleCancel);
        document.removeEventListener('keydown', handleKey);
        callback(true);
    }
    
    function handleCancel() {
        modalShown = false;
        customModal.style.display = 'none';
        modalOkBtn.removeEventListener('click', handleOk);
        modalCancelBtn.removeEventListener('click', handleCancel);
        document.removeEventListener('keydown', handleKey);
        callback(false);
    }
    
    function handleKey(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOk();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleCancel();
        }
    }
    
    modalOkBtn.addEventListener('click', handleOk);
    modalCancelBtn.addEventListener('click', handleCancel);
    document.addEventListener('keydown', handleKey);
}

// Custom leaderboard modal function
function showLeaderboardModal() {
    if (leaderboard.length === 0) {
        showAlert('🏆 No Scores Yet', 'Complete some levels to see your leaderboard!');
        return;
    }

    modalShown = true;
    modalTitle.textContent = '🏆 LEADERBOARD - Best Times 🏆';
    
    // Create leaderboard content
    const leaderboardHTML = `
        <div style="margin-bottom: 20px; color: #666; font-size: 14px;">
            Your fastest completion times across all levels
        </div>
        <div style="max-height: 300px; overflow-y: auto;">
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #f8fafc; border-bottom: 2px solid #e2e8f0;">
                        <th style="padding: 12px; text-align: left; font-weight: bold; color: #374151; border-radius: 6px 0 0 0;">Rank</th>
                        <th style="padding: 12px; text-align: left; font-weight: bold; color: #374151;">Level</th>
                        <th style="padding: 12px; text-align: right; font-weight: bold; color: #374151;">Time</th>
                        <th style="padding: 12px; text-align: right; font-weight: bold; color: #374151; border-radius: 0 6px 0 0;">Date</th>
                    </tr>
                </thead>
                <tbody>
                    ${leaderboard.slice(0, 10).map((entry, index) => {
                        const rankColors = ['#ffd700', '#c0c0c0', '#cd7f32', '#666'];
                        const rankColor = index < 3 ? rankColors[index] : rankColors[3];
                        const isTopThree = index < 3;
                        
                        return `
                            <tr style="border-bottom: 1px solid #e5e7eb; ${isTopThree ? 'background: rgba(255, 215, 0, 0.1);' : ''}">
                                <td style="padding: 12px; font-weight: bold; color: ${rankColor}; font-size: 18px;">
                                    ${isTopThree ? ['🥇', '🥈', '🥉'][index] : `#${index + 1}`}
                                </td>
                                <td style="padding: 12px; color: #374151; font-weight: 500;">
                                    ${entry.level + 1}. ${levels[entry.level].name}
                                </td>
                                <td style="padding: 12px; text-align: right; color: #059669; font-weight: bold; font-family: monospace;">
                                    ${entry.time.toFixed(2)}s
                                </td>
                                <td style="padding: 12px; text-align: right; color: #6b7280; font-size: 14px;">
                                    ${entry.date}
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
        ${leaderboard.length > 10 ? `<div style="margin-top: 16px; color: #6b7280; font-size: 14px; text-align: center;">Showing top 10 of ${leaderboard.length} scores</div>` : ''}
    `;
    
    modalMessage.innerHTML = leaderboardHTML;
    modalCancelBtn.style.display = 'none';
    modalOkBtn.textContent = 'Close';
    
    customModal.style.display = 'flex';
    
    function handleClose() {
        modalShown = false;
        customModal.style.display = 'none';
        modalOkBtn.removeEventListener('click', handleClose);
        document.removeEventListener('keydown', handleKey);
    }
    
    function handleKey(e) {
        if (e.key === 'Enter' || e.key === ' ' || e.key === 'Escape') {
            e.preventDefault();
            handleClose();
        }
    }
    
    modalOkBtn.addEventListener('click', handleClose);
    document.addEventListener('keydown', handleKey);
}

// Custom end screen modal function
function showEndScreenModal() {
    modalShown = true;
    modalTitle.textContent = '🎉 GAME COMPLETE! 🎉';
    
    // Calculate overall statistics
    const totalLevels = levels.length;
    const completedLevels = leaderboard.length;
    const bestTimes = levels.map((_, index) => getBestTime(index)).filter(time => time !== null);
    const averageTime = bestTimes.length > 0 ? bestTimes.reduce((sum, time) => sum + time, 0) / bestTimes.length : 0;
    const fastestLevel = bestTimes.length > 0 ? Math.min(...bestTimes) : 0;
    const slowestLevel = bestTimes.length > 0 ? Math.max(...bestTimes) : 0;
    
    const endScreenHTML = `
        <div style="text-align: center; margin-bottom: 24px;">
            <div style="font-size: 48px; margin-bottom: 16px;">🏆</div>
            <h3 style="margin: 0 0 8px 0; color: #059669; font-size: 24px; font-weight: bold;">Congratulations!</h3>
            <p style="margin: 0; color: #6b7280; font-size: 16px;">You have mastered all parkour challenges!</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 16px 0; color: #374151; font-size: 18px; font-weight: bold;">Your Journey Summary</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #4f46e5;">${totalLevels}</div>
                    <div style="color: #6b7280; font-size: 14px;">Levels Completed</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #059669;">${averageTime.toFixed(1)}s</div>
                    <div style="color: #6b7280; font-size: 14px;">Average Time</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #dc2626;">${fastestLevel.toFixed(1)}s</div>
                    <div style="color: #6b7280; font-size: 14px;">Fastest Level</div>
                </div>
                <div style="text-align: center;">
                    <div style="font-size: 32px; font-weight: bold; color: #d97706;">${slowestLevel.toFixed(1)}s</div>
                    <div style="color: #6b7280; font-size: 14px;">Slowest Level</div>
                </div>
            </div>
        </div>
        
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
            <h4 style="margin: 0 0 12px 0; font-size: 16px;">🏅 Achievements Unlocked</h4>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px;">Parkour Master</span>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px;">Speed Runner</span>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px;">Wall Runner</span>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px;">Power Collector</span>
                <span style="background: rgba(255,255,255,0.2); padding: 4px 8px; border-radius: 4px; font-size: 12px;">Perfect Completion</span>
            </div>
        </div>
        
        <div style="text-align: center; color: #6b7280; font-size: 14px; margin-bottom: 20px;">
            "The journey of a thousand jumps begins with a single step."<br>
            Thanks for playing Stickman Parkour!
        </div>
    `;
    
    modalMessage.innerHTML = endScreenHTML;
    modalCancelBtn.style.display = 'inline-block';
    modalOkBtn.textContent = 'Play Again';
    modalCancelBtn.textContent = 'View Leaderboard';
    
    customModal.style.display = 'flex';
    
    function handlePlayAgain() {
        // Close modal and clean up
        modalShown = false;
        customModal.style.display = 'none';
        modalOkBtn.removeEventListener('click', handlePlayAgain);
        modalCancelBtn.removeEventListener('click', handleViewLeaderboard);
        document.removeEventListener('keydown', handleKey);
        
        // Force complete reset to level 1
        currentLevel = 0;
        levelDisplay.textContent = '1';
        
        // Load level data
        const level = levels[0];
        platforms = level.platforms;
        walls = level.walls;
        billboards = level.billboards;
        obstacles = level.obstacles;
        powerUps = level.powerUps.map(p => ({ ...p })); // Deep copy
        checkpoints = level.checkpoints;
        goal = level.goal;
        
        // Reset game state
        player.x = level.startX;
        player.y = level.startY;
        player.checkpointX = level.startX;
        player.checkpointY = level.startY;
        player.velocityX = 0;
        player.velocityY = 0;
        player.isJumping = false;
        player.isWallRunning = false;
        player.isRolling = false;
        player.rollTimer = 0;
        player.isSprinting = false;
        player.facingRight = true;
        player.hasDoubleJump = false;
        
        gameTime = 0;
        gameStarted = false;
        slowMotion = false;
        showTutorial = true; // Show tutorial for level 1
        tutorialStep = 0;
        levelCompleting = false;
        modalShown = false;
        
        // Reset power-ups
        activePowerUps = {
            speedBoost: 0,
            doubleJump: 0,
            invincibility: 0
        };
        
        // Reset collected power-ups
        powerUps.forEach(powerUp => powerUp.collected = false);
        
        stopBackgroundMusic();
    }
    
    function handleViewLeaderboard() {
        modalShown = false;
        customModal.style.display = 'none';
        modalOkBtn.removeEventListener('click', handlePlayAgain);
        modalCancelBtn.removeEventListener('click', handleViewLeaderboard);
        document.removeEventListener('keydown', handleKey);
        
        // Show leaderboard
        showLeaderboardModal();
    }
    
    function handleKey(e) {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handlePlayAgain();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            handleViewLeaderboard();
        }
    }
    
    modalOkBtn.addEventListener('click', handlePlayAgain);
    modalCancelBtn.addEventListener('click', handleViewLeaderboard);
    document.addEventListener('keydown', handleKey);
}

// Mobile control buttons
const leftBtn = document.getElementById('leftBtn');
const rightBtn = document.getElementById('rightBtn');
const jumpBtn = document.getElementById('jumpBtn');
const sprintBtn = document.getElementById('sprintBtn');
const rollBtn = document.getElementById('rollBtn');

// Audio loading function
async function loadAudio(url, name) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBuffers[name] = audioBuffer;
    } catch (error) {
        console.warn(`Failed to load audio ${name}:`, error);
    }
}

// Play sound effect
function playSound(name, volume = 0.3) {
    if (!audioBuffers[name]) return;

    const source = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    source.buffer = audioBuffers[name];
    gainNode.gain.value = volume;

    source.connect(gainNode);
    gainNode.connect(audioContext.destination);

    source.start();
}

// Play background music
function playBackgroundMusic() {
    if (backgroundMusicPlaying || !audioBuffers.background) return;

    backgroundMusic = audioContext.createBufferSource();
    const gainNode = audioContext.createGain();

    backgroundMusic.buffer = audioBuffers.background;
    backgroundMusic.loop = true;
    gainNode.gain.value = 0.1;

    backgroundMusic.connect(gainNode);
    gainNode.connect(audioContext.destination);

    backgroundMusic.start();
    backgroundMusicPlaying = true;
}

// Stop background music
function stopBackgroundMusic() {
    if (backgroundMusic) {
        backgroundMusic.stop();
        backgroundMusic = null;
        backgroundMusicPlaying = false;
    }
}

// Set canvas size
function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetWidth * 0.6;

    if (!gameStarted) {
        resetGame();
    }
}

// Load level data
function loadLevel(levelIndex) {
    const level = levels[levelIndex];
    platforms = level.platforms;
    walls = level.walls;
    billboards = level.billboards;
    obstacles = level.obstacles;
    powerUps = level.powerUps.map(p => ({ ...p })); // Deep copy
    checkpoints = level.checkpoints;
    goal = level.goal;

    levelDisplay.textContent = currentLevel + 1;
}

// Initialize game
async function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Load audio files
    await Promise.all([
        loadAudio(AUDIO_URLS.jump, 'jump'),
        loadAudio(AUDIO_URLS.roll, 'roll'),
        loadAudio(AUDIO_URLS.levelComplete, 'levelComplete'),
        loadAudio(AUDIO_URLS.background, 'background')
    ]);

    // Load first level
    loadLevel(currentLevel);

    // Event listeners for keyboard
    window.addEventListener('keydown', (e) => {
        // Skip game input if modal is shown
        if (modalShown) return;

        switch(e.key) {
            case 'ArrowLeft': keys.left = true; break;
            case 'ArrowRight': keys.right = true; break;
            case 'ArrowUp': case ' ': keys.up = true; break;
            case 'ArrowDown': keys.down = true; break;
            case 'Shift': keys.shift = true; break;
            case 'c': case 'C': keys.c = true; break;
            case 'Escape':
                if (showTutorial) {
                    showTutorial = false;
                }
                break;
        }

        if (!gameStarted && (keys.left || keys.right || keys.up)) {
            gameStarted = true;
            playBackgroundMusic();
        }
    });

    window.addEventListener('keyup', (e) => {
        // Skip game input if modal is shown
        if (modalShown) return;

        switch(e.key) {
            case 'ArrowLeft': keys.left = false; break;
            case 'ArrowRight': keys.right = false; break;
            case 'ArrowUp': case ' ': keys.up = false; break;
            case 'ArrowDown': keys.down = false; break;
            case 'Shift': keys.shift = false; break;
            case 'c': case 'C': keys.c = false; break;
        }
    });

    // Mobile controls
    leftBtn.addEventListener('touchstart', (e) => { 
        if (modalShown) return;
        e.preventDefault(); mobileButtons.left = true; 
    });
    leftBtn.addEventListener('touchend', (e) => { 
        if (modalShown) return;
        e.preventDefault(); mobileButtons.left = false; 
    });
    rightBtn.addEventListener('touchstart', (e) => { 
        if (modalShown) return;
        e.preventDefault(); mobileButtons.right = true; 
    });
    rightBtn.addEventListener('touchend', (e) => { 
        if (modalShown) return;
        e.preventDefault(); mobileButtons.right = false; 
    });
    jumpBtn.addEventListener('touchstart', (e) => { 
        if (modalShown) return;
        e.preventDefault(); mobileButtons.jump = true; 
    });
    jumpBtn.addEventListener('touchend', (e) => { 
        if (modalShown) return;
        e.preventDefault(); mobileButtons.jump = false; 
    });
    sprintBtn.addEventListener('touchstart', (e) => { 
        if (modalShown) return;
        e.preventDefault(); mobileButtons.sprint = true; 
    });
    sprintBtn.addEventListener('touchend', (e) => { 
        if (modalShown) return;
        e.preventDefault(); mobileButtons.sprint = false; 
    });
    rollBtn.addEventListener('touchstart', (e) => { 
        if (modalShown) return;
        e.preventDefault(); mobileButtons.roll = true; 
    });
    rollBtn.addEventListener('touchend', (e) => { 
        if (modalShown) return;
        e.preventDefault(); mobileButtons.roll = false; 
    });

    // Show mobile controls on touch devices
    if ('ontouchstart' in window) {
        mobileControls.style.display = 'flex';
    }

    // Button event listeners
    restartButton.addEventListener('click', resetGame);
    levelSelectButton.addEventListener('click', showLevelSelect);
    leaderboardButton.addEventListener('click', showLeaderboard);

    // Start game loop
    resetGame();
    gameLoop();
}

// Show level select menu
function showLevelSelect() {
    stopBackgroundMusic();
    gameStarted = false;
    showTutorial = false;

    const levelOptions = levels.map((level, index) => {
        const bestTime = getBestTime(index);
        return `${index + 1}. ${level.name}${bestTime ? ` (Best: ${bestTime.toFixed(2)}s)` : ''}`;
    }).join('\n');

    showInputModal(
        '🎯 Select Level',
        `Choose a level to play:\n\n${levelOptions}`,
        `Enter level number (1-${levels.length})`,
        (selectedLevel) => {
            if (selectedLevel && !isNaN(selectedLevel)) {
                const levelIndex = parseInt(selectedLevel) - 1;
                if (levelIndex >= 0 && levelIndex < levels.length) {
                    currentLevel = levelIndex;
                    loadLevel(currentLevel);
                    resetGame();
                } else {
                    // Invalid level number, show error and retry
                    showAlert('Invalid Level', `Please enter a number between 1 and ${levels.length}.`, () => {
                        showLevelSelect();
                    });
                }
            }
        }
    );
}

// Show leaderboard
function showLeaderboard() {
    showLeaderboardModal();
}

// Get best time for a level
function getBestTime(levelIndex) {
    const levelScores = leaderboard.filter(entry => entry.level === levelIndex);
    if (levelScores.length === 0) return null;

    return Math.min(...levelScores.map(entry => entry.time));
}

// Reset game state
function resetGame() {
    const level = levels[currentLevel];
    player.x = level.startX;
    player.y = level.startY;
    player.checkpointX = level.startX;
    player.checkpointY = level.startY;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isJumping = false;
    player.isWallRunning = false;
    player.isRolling = false;
    player.rollTimer = 0;
    player.isSprinting = false;
    player.facingRight = true;
    player.hasDoubleJump = false;

    gameTime = 0;
    gameStarted = false;
    slowMotion = false;
    showTutorial = currentLevel === 0; // Show tutorial only on first level
    tutorialStep = 0;
    levelCompleting = false; // Reset level completion flag
    modalShown = false; // Reset modal shown flag

    // Reset power-ups
    activePowerUps = {
        speedBoost: 0,
        doubleJump: 0,
        invincibility: 0
    };

    // Reset collected power-ups
    powerUps.forEach(powerUp => powerUp.collected = false);

    stopBackgroundMusic();
}

// Game loop
function gameLoop() {
    update();
    render();
    requestAnimationFrame(gameLoop);
}

// Update game state
function update() {
    if (!gameStarted) return;

    // Update timer
    if (!slowMotion) {
        gameTime += 1/60;
    } else {
        gameTime += (1/60) * SLOW_MOTION_FACTOR;
    }
    timerElement.textContent = gameTime.toFixed(2);

    // Update power-ups
    updatePowerUps();

    // Handle player input
    handleInput();

    // Apply physics
    applyPhysics();

    // Check collisions
    checkCollisions();

    // Update particles
    updateParticles();

    // Check if player reached the goal
    if (!levelCompleting && checkCollision(player, goal)) {
        completeLevel();
    }

    // Check if player fell off screen
    if (player.y > canvas.height + 100) {
        resetToCheckpoint();
    }
}

// Complete level
function completeLevel() {
    if (levelCompleting) return; // Prevent multiple calls
    levelCompleting = true;

    playSound('levelComplete');
    stopBackgroundMusic();

    const completionTime = gameTime;
    const levelName = levels[currentLevel].name;

    // Add to leaderboard
    leaderboard.push({
        level: currentLevel,
        time: completionTime,
        date: new Date().toLocaleDateString()
    });

    // Sort leaderboard by time (ascending)
    leaderboard.sort((a, b) => a.time - b.time);

    // Keep only top 100 scores
    if (leaderboard.length > 100) {
        leaderboard = leaderboard.slice(0, 100);
    }

    // Save to localStorage
    localStorage.setItem('parkourLeaderboard', JSON.stringify(leaderboard));

    // Show completion message
    setTimeout(() => {
        const nextLevel = currentLevel + 1;
        if (nextLevel < levels.length) {
            showConfirm(
                `🎉 Level ${currentLevel + 1} Complete! 🎉`,
                `Time: ${completionTime.toFixed(2)} seconds\\n\\nContinue to Level ${nextLevel + 1}?`,
                (confirmed) => {
                    if (confirmed) {
                        currentLevel = nextLevel;
                        loadLevel(currentLevel);
                        resetGame();
                        levelCompleting = false; // Reset flag when progressing to next level
                    } else {
                        levelCompleting = false; // Reset flag if player chooses not to continue
                    }
                }
            );
        } else {
            showEndScreenModal();
            levelCompleting = false; // Reset flag for game completion
        }
    }, 500);
}

// Reset to last checkpoint
function resetToCheckpoint() {
    player.x = player.checkpointX;
    player.y = player.checkpointY;
    player.velocityX = 0;
    player.velocityY = 0;
    player.isJumping = false;
    player.isWallRunning = false;
    player.isRolling = false;
    player.rollTimer = 0;
    player.isSprinting = false;
    player.facingRight = true;
    player.hasDoubleJump = false;

    // Reset power-ups
    activePowerUps = {
        speedBoost: 0,
        doubleJump: 0,
        invincibility: 0
    };
}

// Update power-ups
function updatePowerUps() {
    if (activePowerUps.speedBoost > 0) activePowerUps.speedBoost--;
    if (activePowerUps.doubleJump > 0) activePowerUps.doubleJump--;
    if (activePowerUps.invincibility > 0) activePowerUps.invincibility--;
}

// Handle player input
function handleInput() {
    // Combine keyboard and mobile inputs
    const leftPressed = keys.left || mobileButtons.left;
    const rightPressed = keys.right || mobileButtons.right;
    const upPressed = keys.up || mobileButtons.jump;
    const sprintPressed = keys.shift || mobileButtons.sprint;
    const rollPressed = keys.c || mobileButtons.roll;

    // Sprinting
    player.isSprinting = sprintPressed;

    // Horizontal movement
    player.velocityX = 0;

    if (leftPressed) {
        let speed = MOVE_SPEED;
        if (player.isSprinting || activePowerUps.speedBoost > 0) {
            speed *= SPRINT_MULTIPLIER;
        }
        player.velocityX = -speed;
        player.facingRight = false;
    }

    if (rightPressed) {
        let speed = MOVE_SPEED;
        if (player.isSprinting || activePowerUps.speedBoost > 0) {
            speed *= SPRINT_MULTIPLIER;
        }
        player.velocityX = speed;
        player.facingRight = true;
    }

    // Jumping
    if (upPressed && !player.isJumping && (player.onGround || activePowerUps.doubleJump > 0 || player.hasDoubleJump)) {
        player.velocityY = JUMP_FORCE;
        player.isJumping = true;
        player.onGround = false;
        if (!player.onGround && !player.hasDoubleJump) {
            player.hasDoubleJump = false;
            activePowerUps.doubleJump = 0;
        } else if (player.hasDoubleJump) {
            player.hasDoubleJump = false;
        }
        playSound('jump');
    }

    // Wall jumping
    if (upPressed && player.touchingWall && !player.onGround) {
        player.velocityY = JUMP_FORCE * 0.8;
        player.velocityX = player.facingRight ? -WALL_JUMP_HORIZONTAL_FORCE : WALL_JUMP_HORIZONTAL_FORCE;
        player.isWallRunning = false;
        player.facingRight = !player.facingRight;

        // Activate slow motion for wall jumps
        slowMotion = true;
        setTimeout(() => { slowMotion = false; }, 500);
        playSound('jump');
    }

    // Rolling
    if (rollPressed && player.onGround && !player.isRolling) {
        player.isRolling = true;
        player.rollTimer = ROLL_DURATION;
        player.height = 20; // Make player shorter during roll
        playSound('roll');
    }

    // Update roll state
    if (player.isRolling) {
        player.rollTimer--;
        if (player.rollTimer <= 0) {
            player.isRolling = false;
            player.height = 40; // Return to normal height
        }
    }
}

// Apply physics to player
function applyPhysics() {
    // Apply gravity
    player.velocityY += GRAVITY * (slowMotion ? SLOW_MOTION_FACTOR : 1);

    // Wall running (horizontal)
    if (player.touchingWall && !player.onGround) {
        // Allow horizontal wall running by reducing gravity effect
        player.velocityY *= 0.8; // Reduce falling speed when touching wall

        // If player is pressing toward the wall, enable wall running
        if ((player.facingRight && (keys.right || mobileButtons.right)) ||
            (!player.facingRight && (keys.left || mobileButtons.left))) {
            player.isWallRunning = true;
            player.velocityY *= 0.5; // Further reduce falling speed when actively wall running

            // Add running particles
            if (Math.random() < 0.3) {
                addParticle(player.x + player.width / 2, player.y + player.height, 0, 2, '#8B4513', 10);
            }
        } else {
            player.isWallRunning = false;
        }
    } else {
        player.isWallRunning = false;
    }

    // Update position
    player.x += player.velocityX * (slowMotion ? SLOW_MOTION_FACTOR : 1);
    player.y += player.velocityY * (slowMotion ? SLOW_MOTION_FACTOR : 1);

    // Reset ground and wall touching flags
    player.onGround = false;
    player.touchingWall = false;

    // Update animation state
    updateAnimationState();
}

// Update the animation state based on player movement
function updateAnimationState() {
    // Update animation timer
    player.animationTimer++;

    if (player.animationTimer >= 5) { // Change animation frame every 5 game frames
        player.animationFrame = (player.animationFrame + 1) % 4; // 4 frames per animation
        player.animationTimer = 0;
    }

    // Determine animation state
    if (player.isWallRunning) {
        player.animationState = 'wallRunning';
    } else if (player.isRolling) {
        player.animationState = 'rolling';
    } else if (!player.onGround) {
        if (player.velocityY < 0) {
            player.animationState = 'jumping';
        } else {
            player.animationState = 'falling';
        }
    } else if (Math.abs(player.velocityX) > 0.1) {
        player.animationState = 'running';

        // Add running particles
        if (Math.random() < 0.2) {
            const particleX = player.x + (player.facingRight ? player.width : 0);
            addParticle(particleX, player.y + player.height - 5, (player.facingRight ? -1 : 1) * 2, 1, '#8B4513', 8);
        }
    } else {
        player.animationState = 'idle';
    }
}

// Add particle to system
function addParticle(x, y, velocityX, velocityY, color, lifetime) {
    if (particles.length < MAX_PARTICLES) {
        particles.push({
            x: x,
            y: y,
            velocityX: velocityX,
            velocityY: velocityY,
            color: color,
            lifetime: lifetime,
            maxLifetime: lifetime
        });
    }
}

// Update particles
function updateParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        const particle = particles[i];

        // Update position
        particle.x += particle.velocityX;
        particle.y += particle.velocityY;

        // Add gravity to particles
        particle.velocityY += 0.1;

        // Update lifetime
        particle.lifetime--;

        // Remove dead particles
        if (particle.lifetime <= 0) {
            particles.splice(i, 1);
        }
    }
}

// Check collisions with platforms, walls, billboards, obstacles, power-ups, and checkpoints
function checkCollisions() {
    // Check platform collisions
    for (const platform of platforms) {
        if (checkCollision(player, platform)) {
            // Collision from above (landing)
            if (player.velocityY > 0 && player.y + player.height - player.velocityY <= platform.y) {
                player.y = platform.y - player.height;
                player.velocityY = 0;
                player.isJumping = false;
                player.onGround = true;

                // Add landing particles
                if (player.velocityY > 5) {
                    for (let i = 0; i < 5; i++) {
                        addParticle(
                            player.x + Math.random() * player.width,
                            player.y + player.height,
                            (Math.random() - 0.5) * 4,
                            Math.random() * -2,
                            '#8B4513',
                            15
                        );
                    }
                }
            }
            // Collision from below (hitting head)
            else if (player.velocityY < 0 && player.y >= platform.y + platform.height) {
                player.y = platform.y + platform.height;
                player.velocityY = 0;
            }
            // Horizontal collision
            else if (activePowerUps.invincibility === 0) {
                if (player.x + player.width > platform.x && player.x < platform.x) {
                    player.x = platform.x - player.width;
                } else if (player.x < platform.x + platform.width && player.x + player.width > platform.x + platform.width) {
                    player.x = platform.x + platform.width;
                }
            }
        }
    }

    // Check wall collisions
    for (const wall of walls) {
        if (checkCollision(player, wall)) {
            // Horizontal collision with wall
            if (player.x + player.width > wall.x && player.x < wall.x) {
                player.x = wall.x - player.width;
                player.touchingWall = true;
            } else if (player.x < wall.x + wall.width && player.x + player.width > wall.x + wall.width) {
                player.x = wall.x + wall.width;
                player.touchingWall = true;
            }
            // Vertical collision with wall
            else if (activePowerUps.invincibility === 0) {
                if (player.velocityY > 0) {
                    player.y = wall.y - player.height;
                    player.velocityY = 0;
                    player.isJumping = false;
                    player.onGround = true;
                } else if (player.velocityY < 0) {
                    player.y = wall.y + wall.height;
                    player.velocityY = 0;
                }
            }
        }
    }

    // Check billboard collisions (for wall running across gaps)
    for (const billboard of billboards) {
        if (checkCollision(player, billboard)) {
            // Collision from sides (for wall running)
            if (player.x + player.width > billboard.x && player.x < billboard.x) {
                player.x = billboard.x - player.width;
                player.touchingWall = true;

                // Enable wall running if player is moving toward the billboard
                if (keys.right || mobileButtons.right) {
                    player.isWallRunning = true;
                }
            } else if (player.x < billboard.x + billboard.width && player.x + player.width > billboard.x + billboard.width) {
                player.x = billboard.x + billboard.width;
                player.touchingWall = true;

                // Enable wall running if player is moving toward the billboard
                if (keys.left || mobileButtons.left) {
                    player.isWallRunning = true;
                }
            }
            // Collision from top/bottom
            else if (activePowerUps.invincibility === 0) {
                if (player.velocityY > 0 && player.y + player.height - player.velocityY <= billboard.y) {
                    player.y = billboard.y - player.height;
                    player.velocityY = 0;
                    player.isJumping = false;
                    player.onGround = true;
                } else if (player.velocityY < 0 && player.y >= billboard.y + billboard.height) {
                    player.y = billboard.y + billboard.height;
                    player.velocityY = 0;
                }
            }
        }
    }

    // Check obstacle collisions
    for (const obstacle of obstacles) {
        if (checkCollision(player, obstacle)) {
            // If rolling or invincible, pass through obstacles
            if (!player.isRolling && activePowerUps.invincibility === 0) {
                // Collision from above
                if (player.velocityY > 0 && player.y + player.height - player.velocityY <= obstacle.y) {
                    player.y = obstacle.y - player.height;
                    player.velocityY = 0;
                    player.isJumping = false;
                    player.onGround = true;
                }
                // Horizontal collision
                else {
                    if (player.x + player.width > obstacle.x && player.x < obstacle.x) {
                        player.x = obstacle.x - player.width;
                    } else if (player.x < obstacle.x + obstacle.width && player.x + player.width > obstacle.x + obstacle.width) {
                        player.x = obstacle.x + obstacle.width;
                    }
                }
            }
        }
    }

    // Check power-up collisions
    for (const powerUp of powerUps) {
        if (!powerUp.collected && checkCollision(player, powerUp)) {
            powerUp.collected = true;
            activatePowerUp(powerUp.type);

            // Add collection particles
            for (let i = 0; i < 8; i++) {
                addParticle(
                    powerUp.x + powerUp.width / 2,
                    powerUp.y + powerUp.height / 2,
                    (Math.random() - 0.5) * 6,
                    (Math.random() - 0.5) * 6,
                    getPowerUpColor(powerUp.type),
                    20
                );
            }
        }
    }

    // Check checkpoint collisions
    for (const checkpoint of checkpoints) {
        if (checkCollision(player, checkpoint)) {
            player.checkpointX = checkpoint.x;
            player.checkpointY = checkpoint.y;
        }
    }

    // Keep player within canvas bounds
    if (player.x < 0) player.x = 0;
    if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;
    if (player.y < 0) player.y = 0;
}

// Activate power-up
function activatePowerUp(type) {
    switch (type) {
        case 'speed':
            activePowerUps.speedBoost = SPEED_BOOST_DURATION;
            break;
        case 'doubleJump':
            activePowerUps.doubleJump = DOUBLE_JUMP_DURATION;
            player.hasDoubleJump = true;
            break;
        case 'invincibility':
            activePowerUps.invincibility = INVINCIBILITY_DURATION;
            break;
    }
}

// Get power-up color
function getPowerUpColor(type) {
    switch (type) {
        case 'speed': return '#FFD700'; // Gold
        case 'doubleJump': return '#FF69B4'; // Hot Pink
        case 'invincibility': return '#00FFFF'; // Cyan
        default: return '#FFFFFF';
    }
}

// Helper function to check collision between two rectangles
function checkCollision(rect1, rect2) {
    return rect1.x < rect2.x + rect2.width &&
           rect1.x + rect1.width > rect2.x &&
           rect1.y < rect2.y + rect2.height &&
           rect1.y + rect1.height > rect2.y;
}

// Render game
function render() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background
    ctx.fillStyle = '#87CEEB';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw platforms
    ctx.fillStyle = '#8B4513';
    for (const platform of platforms) {
        ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
    }

    // Draw walls
    ctx.fillStyle = '#696969';
    for (const wall of walls) {
        ctx.fillRect(wall.x, wall.y, wall.width, wall.height);
    }

    // Draw billboards
    for (const billboard of billboards) {
        // Draw billboard background
        ctx.fillStyle = '#4169E1'; // Royal Blue
        ctx.fillRect(billboard.x, billboard.y, billboard.width, billboard.height);

        // Draw billboard border
        ctx.strokeStyle = '#FFD700'; // Gold
        ctx.lineWidth = 3;
        ctx.strokeRect(billboard.x, billboard.y, billboard.width, billboard.height);

        // Draw billboard text
        ctx.fillStyle = 'white';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(billboard.text, billboard.x + billboard.width / 2, billboard.y + billboard.height / 2);
    }

    // Draw obstacles
    ctx.fillStyle = '#FF4500';
    for (const obstacle of obstacles) {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    }

    // Draw power-ups
    for (const powerUp of powerUps) {
        if (!powerUp.collected) {
            ctx.fillStyle = getPowerUpColor(powerUp.type);
            ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);

            // Draw power-up icon
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            let icon = '?';
            switch (powerUp.type) {
                case 'speed': icon = '⚡'; break;
                case 'doubleJump': icon = '⬆'; break;
                case 'invincibility': icon = '🛡️'; break;
            }
            ctx.fillText(icon, powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
        }
    }

    // Draw checkpoints
    ctx.fillStyle = '#FFFF00';
    for (const checkpoint of checkpoints) {
        ctx.fillRect(checkpoint.x, checkpoint.y, checkpoint.width, checkpoint.height);
        // Draw flag
        ctx.fillStyle = '#FF0000';
        ctx.fillRect(checkpoint.x + checkpoint.width - 5, checkpoint.y, 5, 10);
    }

    // Draw goal
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(goal.x, goal.y, goal.width, goal.height);
    ctx.fillStyle = 'white';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('🏁', goal.x + goal.width / 2, goal.y + goal.height / 2);

    // Draw particles
    for (const particle of particles) {
        const alpha = particle.lifetime / particle.maxLifetime;
        ctx.globalAlpha = alpha;
        ctx.fillStyle = particle.color;
        ctx.fillRect(particle.x - 2, particle.y - 2, 4, 4);
    }
    ctx.globalAlpha = 1;

    // Draw player (stickman)
    drawStickman(player.x, player.y, player.width, player.height, player.facingRight, player.isRolling, player.isWallRunning);

    // Draw power-up indicators
    drawPowerUpIndicators();

    // Draw debug info if needed
    if (false) { // Set to true to enable debug info
        ctx.fillStyle = 'white';
        ctx.font = '12px Arial';
        ctx.fillText(`State: ${player.animationState}`, player.x, player.y - 10);
        ctx.fillText(`Frame: ${player.animationFrame}`, player.x, player.y - 25);
    }

    // Draw start message
    if (!gameStarted) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.font = '24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        if (showTutorial) {
            // Draw tutorial
            const tutorialY = canvas.height / 2;
            ctx.fillText(tutorialMessages[tutorialStep], canvas.width / 2, tutorialY);

            ctx.font = '16px Arial';
            ctx.fillText('Press ESC to skip tutorial', canvas.width / 2, tutorialY + 50);
            ctx.fillText('Press any arrow key to continue', canvas.width / 2, tutorialY + 80);
        } else {
            ctx.fillText('Press any arrow key to start', canvas.width / 2, canvas.height / 2);
        }
    }

    // Draw slow motion effect
    if (slowMotion) {
        ctx.fillStyle = 'rgba(0, 0, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Draw invincibility effect
    if (activePowerUps.invincibility > 0) {
        ctx.fillStyle = 'rgba(0, 255, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
}

// Draw power-up indicators
function drawPowerUpIndicators() {
    const indicatorSize = 20;
    let x = 10;
    const y = 10;

    if (activePowerUps.speedBoost > 0) {
        ctx.fillStyle = '#FFD700';
        ctx.fillRect(x, y, indicatorSize, indicatorSize);
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚡', x + indicatorSize / 2, y + indicatorSize / 2 + 4);
        x += indicatorSize + 5;
    }

    if (activePowerUps.doubleJump > 0) {
        ctx.fillStyle = '#FF69B4';
        ctx.fillRect(x, y, indicatorSize, indicatorSize);
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⬆', x + indicatorSize / 2, y + indicatorSize / 2 + 4);
        x += indicatorSize + 5;
    }

    if (activePowerUps.invincibility > 0) {
        ctx.fillStyle = '#00FFFF';
        ctx.fillRect(x, y, indicatorSize, indicatorSize);
        ctx.fillStyle = 'black';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🛡️', x + indicatorSize / 2, y + indicatorSize / 2 + 4);
    }
}

// Draw stickman (same as before, keeping the existing implementation)
function drawStickman(x, y, width, height, facingRight, isRolling, isWallRunning) {
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    if (!facingRight) {
        ctx.scale(-1, 1);
    }

    // Draw stickman
    ctx.strokeStyle = 'black';
    ctx.lineWidth = 2;

    // Draw based on animation state
    switch (player.animationState) {
        case 'rolling':
            // Draw rolling stickman (ball shape)
            ctx.beginPath();
            ctx.arc(0, 0, width / 2, 0, Math.PI * 2);
            ctx.stroke();

            // Draw face direction
            ctx.beginPath();
            ctx.arc(width / 4, -height / 8, 2, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'wallRunning':
            // Draw horizontal wall running stickman
            // Head
            ctx.beginPath();
            ctx.arc(0, -height / 3, width / 3, 0, Math.PI * 2);
            ctx.stroke();

            // Body - slightly angled toward wall
            ctx.beginPath();
            ctx.moveTo(0, -height / 5);
            ctx.lineTo(width / 8, height / 4);
            ctx.stroke();

            // Arms - one reaching for wall
            ctx.beginPath();
            ctx.moveTo(0, -height / 10);
            ctx.lineTo(width / 2, -height / 15);
            ctx.stroke();

            // Other arm
            ctx.beginPath();
            ctx.moveTo(0, -height / 10);
            ctx.lineTo(-width / 4, height / 10);
            ctx.stroke();

            // Legs - running position against wall
            const legOffset = (player.animationFrame % 2) * (width / 5);

            // Front leg
            ctx.beginPath();
            ctx.moveTo(width / 8, height / 4);
            ctx.lineTo(width / 2 - legOffset, height / 3);
            ctx.stroke();

            // Back leg
            ctx.beginPath();
            ctx.moveTo(width / 8, height / 4);
            ctx.lineTo(width / 4 + legOffset, height / 3);
            ctx.stroke();

            // Face
            ctx.beginPath();
            ctx.arc(width / 8, -height / 3, 2, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'running':
            // Draw running stickman with animated legs and arms
            // Head
            ctx.beginPath();
            ctx.arc(0, -height / 3, width / 3, 0, Math.PI * 2);
            ctx.stroke();

            // Body - slightly leaning forward when running
            ctx.beginPath();
            ctx.moveTo(0, -height / 5);
            ctx.lineTo(width / 10, height / 4);
            ctx.stroke();

            // Arms - alternating swing
            const armOffset = Math.sin(player.animationFrame * Math.PI / 2) * (width / 3);

            // Left arm
            ctx.beginPath();
            ctx.moveTo(0, -height / 10);
            ctx.lineTo(-width / 3 + armOffset, 0);
            ctx.stroke();

            // Right arm
            ctx.beginPath();
            ctx.moveTo(0, -height / 10);
            ctx.lineTo(width / 3 - armOffset, 0);
            ctx.stroke();

            // Legs - alternating stride
            const legSwing = Math.sin(player.animationFrame * Math.PI / 2) * (width / 3);

            // Left leg
            ctx.beginPath();
            ctx.moveTo(width / 10, height / 4);
            ctx.lineTo(-width / 5 + legSwing, height / 3);
            ctx.stroke();

            // Right leg
            ctx.beginPath();
            ctx.moveTo(width / 10, height / 4);
            ctx.lineTo(width / 5 - legSwing, height / 3);
            ctx.stroke();

            // Face
            ctx.beginPath();
            ctx.arc(width / 8, -height / 3, 2, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'jumping':
            // Draw jumping stickman
            // Head
            ctx.beginPath();
            ctx.arc(0, -height / 3, width / 3, 0, Math.PI * 2);
            ctx.stroke();

            // Body
            ctx.beginPath();
            ctx.moveTo(0, -height / 5);
            ctx.lineTo(0, height / 4);
            ctx.stroke();

            // Arms - raised up for jump
            ctx.beginPath();
            ctx.moveTo(0, -height / 10);
            ctx.lineTo(-width / 3, -height / 5);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, -height / 10);
            ctx.lineTo(width / 3, -height / 5);
            ctx.stroke();

            // Legs - tucked up for jump
            ctx.beginPath();
            ctx.moveTo(0, height / 4);
            ctx.lineTo(-width / 4, height / 6);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, height / 4);
            ctx.lineTo(width / 4, height / 6);
            ctx.stroke();

            // Face
            ctx.beginPath();
            ctx.arc(width / 8, -height / 3, 2, 0, Math.PI * 2);
            ctx.fill();
            break;

        case 'falling':
            // Draw falling stickman
            // Head
            ctx.beginPath();
            ctx.arc(0, -height / 3, width / 3, 0, Math.PI * 2);
            ctx.stroke();

            // Body
            ctx.beginPath();
            ctx.moveTo(0, -height / 5);
            ctx.lineTo(0, height / 4);
            ctx.stroke();

            // Arms - out to sides for balance
            ctx.beginPath();
            ctx.moveTo(0, -height / 10);
            ctx.lineTo(-width / 2.5, 0);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, -height / 10);
            ctx.lineTo(width / 2.5, 0);
            ctx.stroke();

            // Legs - extended for landing
            ctx.beginPath();
            ctx.moveTo(0, height / 4);
            ctx.lineTo(-width / 3, height / 2.5);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, height / 4);
            ctx.lineTo(width / 3, height / 2.5);
            ctx.stroke();

            // Face
            ctx.beginPath();
            ctx.arc(width / 8, -height / 3, 2, 0, Math.PI * 2);
            ctx.fill();
            break;

        default: // idle
            // Draw idle stickman with slight animation
            const idleBob = Math.sin(player.animationFrame * Math.PI / 2) * (height / 30);

            // Head - slight bobbing
            ctx.beginPath();
            ctx.arc(0, -height / 3 + idleBob/2, width / 3, 0, Math.PI * 2);
            ctx.stroke();

            // Body
            ctx.beginPath();
            ctx.moveTo(0, -height / 5 + idleBob/2);
            ctx.lineTo(0, height / 4);
            ctx.stroke();

            // Arms - slight movement
            ctx.beginPath();
            ctx.moveTo(0, -height / 10 + idleBob/2);
            ctx.lineTo(-width / 3, idleBob);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, -height / 10 + idleBob/2);
            ctx.lineTo(width / 3, idleBob);
            ctx.stroke();

            // Legs
            ctx.beginPath();
            ctx.moveTo(0, height / 4);
            ctx.lineTo(-width / 3, height / 3);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(0, height / 4);
            ctx.lineTo(width / 3, height / 3);
            ctx.stroke();

            // Face
            ctx.beginPath();
            ctx.arc(width / 8, -height / 3 + idleBob/2, 2, 0, Math.PI * 2);
            ctx.fill();
            break;
    }

    ctx.restore();
}

// Start the game
window.onload = init;
