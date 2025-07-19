# Tetris Game

A classic Tetris game implementation using vanilla JavaScript, HTML, and CSS.

## Features

- 🎮 Classic Tetris gameplay
- 🧩 Seven different tetromino shapes
- 🔢 Score tracking and level progression
- 🚀 Increasing difficulty as levels progress
- 🔄 Next piece preview
- ⏸️ Pause functionality
- 📱 Responsive design

## How to Play

1. Click the "게임 시작" (Game Start) button to begin
2. Use the arrow keys to control the tetrominos:
   - Left/Right arrows: Move horizontally
   - Down arrow: Move down faster
   - Up arrow: Rotate piece
   - Spacebar: Hard drop (instantly drop the piece)
3. Complete horizontal lines to score points
4. The game ends when the pieces stack up to the top

## Controls

- ← → : Move left/right
- ↑ : Rotate piece
- ↓ : Soft drop (move down faster)
- Spacebar : Hard drop (instant drop)
- "게임 시작" button : Start game
- "일시정지" button : Pause/resume game

## Scoring System

- 1 line cleared: 40 points × level
- 2 lines cleared: 100 points × level
- 3 lines cleared: 300 points × level
- 4 lines cleared: 1200 points × level

## Level Progression

The level increases after every 10 lines cleared. Each level increases the falling speed of the tetrominos.

## Technical Details

This game is built using:
- HTML5 for structure
- CSS3 for styling
- Vanilla JavaScript for game logic
- HTML5 Canvas for rendering

No external libraries or frameworks are used - this is a pure vanilla JavaScript implementation.