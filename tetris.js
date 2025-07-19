document.addEventListener('DOMContentLoaded', () => {
    // 캔버스 설정
    const canvas = document.getElementById('tetris');
    const ctx = canvas.getContext('2d');
    const nextPieceCanvas = document.getElementById('next-piece');
    const nextPieceCtx = nextPieceCanvas.getContext('2d');
    
    // 게임 상수
    const BLOCK_SIZE = 20;
    const BOARD_WIDTH = 12;
    const BOARD_HEIGHT = 20;
    const COLORS = [
        null,
        '#FF0D72', // I
        '#0DC2FF', // J
        '#0DFF72', // L
        '#F538FF', // O
        '#FF8E0D', // S
        '#FFE138', // T
        '#3877FF'  // Z
    ];

    // 테트로미노 모양
    const PIECES = [
        null,
        // I
        [
            [0, 0, 0, 0],
            [1, 1, 1, 1],
            [0, 0, 0, 0],
            [0, 0, 0, 0]
        ],
        // J
        [
            [2, 0, 0],
            [2, 2, 2],
            [0, 0, 0]
        ],
        // L
        [
            [0, 0, 3],
            [3, 3, 3],
            [0, 0, 0]
        ],
        // O
        [
            [4, 4],
            [4, 4]
        ],
        // S
        [
            [0, 5, 5],
            [5, 5, 0],
            [0, 0, 0]
        ],
        // T
        [
            [0, 6, 0],
            [6, 6, 6],
            [0, 0, 0]
        ],
        // Z
        [
            [7, 7, 0],
            [0, 7, 7],
            [0, 0, 0]
        ]
    ];

    // 게임 변수
    let board = createBoard();
    let score = 0;
    let level = 1;
    let lines = 0;
    let gameOver = false;
    let isPaused = false;
    let dropInterval = 1000;
    let lastTime = 0;
    let dropCounter = 0;
    let player = {
        pos: { x: 0, y: 0 },
        piece: null,
        score: 0
    };
    let nextPiece = null;

    // 게임 보드 생성
    function createBoard() {
        return Array.from({ length: BOARD_HEIGHT }, () => Array(BOARD_WIDTH).fill(0));
    }

    // 점수 업데이트
    function updateScore(rowCount) {
        const points = [0, 40, 100, 300, 1200];
        score += points[rowCount] * level;
        document.getElementById('score').textContent = score;
        
        lines += rowCount;
        document.getElementById('lines').textContent = lines;
        
        if (lines >= level * 10) {
            level++;
            document.getElementById('level').textContent = level;
            dropInterval = Math.max(100, 1000 - (level - 1) * 100);
        }
    }

    // 충돌 감지
    function collide(board, player) {
        const { piece, pos } = player;
        for (let y = 0; y < piece.length; y++) {
            for (let x = 0; x < piece[y].length; x++) {
                if (piece[y][x] !== 0 &&
                    (board[y + pos.y] === undefined ||
                     board[y + pos.y][x + pos.x] === undefined ||
                     board[y + pos.y][x + pos.x] !== 0)) {
                    return true;
                }
            }
        }
        return false;
    }

    // 보드에 테트로미노 병합
    function merge(board, player) {
        player.piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    board[y + player.pos.y][x + player.pos.x] = value;
                }
            });
        });
    }

    // 테트로미노 생성
    function createPiece(type = Math.floor(Math.random() * 7) + 1) {
        return PIECES[type].map(row => [...row]);
    }

    // 다음 테트로미노 그리기
    function drawNextPiece() {
        nextPieceCtx.clearRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
        nextPieceCtx.fillStyle = '#f0f0f0';
        nextPieceCtx.fillRect(0, 0, nextPieceCanvas.width, nextPieceCanvas.height);
        
        if (!nextPiece) return;
        
        nextPiece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    nextPieceCtx.fillStyle = COLORS[value];
                    nextPieceCtx.fillRect(
                        x * BLOCK_SIZE + 20,
                        y * BLOCK_SIZE + 20,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            });
        });
    }

    // 플레이어 리셋
    function playerReset() {
        player.piece = nextPiece || createPiece();
        nextPiece = createPiece();
        drawNextPiece();
        
        player.pos.y = 0;
        player.pos.x = Math.floor(BOARD_WIDTH / 2) - Math.floor(player.piece[0].length / 2);
        
        // 게임 오버 체크
        if (collide(board, player)) {
            gameOver = true;
            alert('게임 오버! 점수: ' + score);
            board = createBoard();
            score = 0;
            level = 1;
            lines = 0;
            document.getElementById('score').textContent = score;
            document.getElementById('level').textContent = level;
            document.getElementById('lines').textContent = lines;
        }
    }

    // 테트로미노 회전
    function playerRotate(dir) {
        const pos = player.pos.x;
        let offset = 1;
        rotate(player.piece, dir);
        
        // 회전 후 충돌 시 위치 조정
        while (collide(board, player)) {
            player.pos.x += offset;
            offset = -(offset + (offset > 0 ? 1 : -1));
            if (offset > player.piece[0].length) {
                rotate(player.piece, -dir);
                player.pos.x = pos;
                return;
            }
        }
    }

    // 행렬 회전
    function rotate(matrix, dir) {
        // 행렬 전치
        for (let y = 0; y < matrix.length; y++) {
            for (let x = 0; x < y; x++) {
                [matrix[x][y], matrix[y][x]] = [matrix[y][x], matrix[x][y]];
            }
        }
        
        // 행 반전
        if (dir > 0) {
            matrix.forEach(row => row.reverse());
        } else {
            matrix.reverse();
        }
    }

    // 테트로미노 드롭
    function playerDrop() {
        player.pos.y++;
        if (collide(board, player)) {
            player.pos.y--;
            merge(board, player);
            playerReset();
            sweepRows();
        }
        dropCounter = 0;
    }

    // 테트로미노 하드 드롭
    function playerHardDrop() {
        while (!collide(board, player)) {
            player.pos.y++;
        }
        player.pos.y--;
        merge(board, player);
        playerReset();
        sweepRows();
        dropCounter = 0;
    }

    // 테트로미노 이동
    function playerMove(dir) {
        player.pos.x += dir;
        if (collide(board, player)) {
            player.pos.x -= dir;
        }
    }

    // 완성된 행 제거
    function sweepRows() {
        let rowCount = 0;
        outer: for (let y = board.length - 1; y >= 0; y--) {
            for (let x = 0; x < board[y].length; x++) {
                if (board[y][x] === 0) {
                    continue outer;
                }
            }
            
            // 행 제거
            const row = board.splice(y, 1)[0].fill(0);
            board.unshift(row);
            y++;
            rowCount++;
        }
        
        if (rowCount > 0) {
            updateScore(rowCount);
        }
    }

    // 그리기 함수
    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // 보드 그리기
        board.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = COLORS[value];
                    ctx.fillRect(
                        x * BLOCK_SIZE,
                        y * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            });
        });
        
        // 현재 테트로미노 그리기
        player.piece.forEach((row, y) => {
            row.forEach((value, x) => {
                if (value !== 0) {
                    ctx.fillStyle = COLORS[value];
                    ctx.fillRect(
                        (x + player.pos.x) * BLOCK_SIZE,
                        (y + player.pos.y) * BLOCK_SIZE,
                        BLOCK_SIZE - 1,
                        BLOCK_SIZE - 1
                    );
                }
            });
        });
    }

    // 게임 업데이트
    function update(time = 0) {
        if (gameOver || isPaused) return;
        
        const deltaTime = time - lastTime;
        lastTime = time;
        
        dropCounter += deltaTime;
        if (dropCounter > dropInterval) {
            playerDrop();
        }
        
        draw();
        requestAnimationFrame(update);
    }

    // 키보드 이벤트 처리
    document.addEventListener('keydown', event => {
        if (gameOver || isPaused) return;
        
        switch (event.keyCode) {
            case 37: // 왼쪽 화살표
                playerMove(-1);
                break;
            case 39: // 오른쪽 화살표
                playerMove(1);
                break;
            case 40: // 아래쪽 화살표
                playerDrop();
                break;
            case 38: // 위쪽 화살표
                playerRotate(1);
                break;
            case 32: // 스페이스바
                playerHardDrop();
                break;
        }
    });

    // 게임 시작 버튼
    document.getElementById('start-button').addEventListener('click', () => {
        if (gameOver || isPaused) {
            gameOver = false;
            isPaused = false;
            board = createBoard();
            score = 0;
            level = 1;
            lines = 0;
            document.getElementById('score').textContent = score;
            document.getElementById('level').textContent = level;
            document.getElementById('lines').textContent = lines;
            nextPiece = createPiece();
            playerReset();
            update();
        }
    });

    // 일시정지 버튼
    document.getElementById('pause-button').addEventListener('click', () => {
        if (!gameOver) {
            isPaused = !isPaused;
            if (!isPaused) {
                lastTime = performance.now();
                update();
            }
        }
    });

    // 초기 설정
    nextPiece = createPiece();
    playerReset();
    drawNextPiece();
    update();
});