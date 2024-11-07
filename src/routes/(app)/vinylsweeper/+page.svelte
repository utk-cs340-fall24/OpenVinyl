<!-- src/routes/minesweeper.svelte -->
<script>
    import { onMount, onDestroy } from 'svelte';
    import { supabase } from '$lib/supabaseClient.js';
    import { addVinyls } from '$lib/vinylsStore.js';
    import Cell from '$lib/Cell.svelte'; // Ensure this component exists
    import { fly, fade } from 'svelte/transition';

    let user = null;
    let message = '';
    let gameOver = false;
    let score = 0;

    const rows = 10;
    const cols = 10;
    const minesCount = 20;

    let grid = [];
    let mines = new Set();
    let revealedCount = 0;

    $: gridTemplateRows = `repeat(${rows}, 40px)`;
    $: gridTemplateColumns = `repeat(${cols}, 40px)`;

    function initializeGrid() {
        grid = [];
        for (let r = 0; r < rows; r++) {
            const row = [];
            for (let c = 0; c < cols; c++) {
                row.push({
                    row: r,
                    col: c,
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    adjacentMines: 0
                });
            }
            grid.push(row);
        }

        placeMines();
        calculateAdjacentMines();
    }

    function placeMines() {
        mines = new Set();
        while (mines.size < minesCount) {
            const r = Math.floor(Math.random() * rows);
            const c = Math.floor(Math.random() * cols);
            const key = `${r},${c}`;
            if (!mines.has(key)) {
                mines.add(key);
                grid[r][c].isMine = true;
            }
        }
    }

    function calculateAdjacentMines() {
        const directions = [
            [-1, -1], [-1, 0], [-1, 1],
            [ 0, -1],         [ 0, 1],
            [ 1, -1], [ 1, 0], [ 1, 1]
        ];

        for (let r = 0; r < rows; r++) {
            for (let c = 0; c < cols; c++) {
                if (grid[r][c].isMine) continue;
                let count = 0;
                for (const [dr, dc] of directions) {
                    const nr = r + dr;
                    const nc = c + dc;
                    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols && grid[nr][nc].isMine) {
                        count++;
                    }
                }
                grid[r][c].adjacentMines = count;
            }
        }
    }

    function handleCellClick(cell) {
        if (gameOver || cell.isRevealed || cell.isFlagged) return;

        if (cell.isMine) {
            revealMine(cell);
            endGame(false);
        } else {
            revealCell(cell);
            checkWin();
        }
    }

    function handleCellRightClick(event, cell) {
        event.preventDefault();
        if (gameOver || cell.isRevealed) return;

        cell.isFlagged = !cell.isFlagged;

        grid = [...grid]; // Trigger reactivity
    }

    function revealCell(cell) {
        if (cell.isRevealed || cell.isFlagged) return;
        cell.isRevealed = true;
        revealedCount++;

        if (cell.adjacentMines === 0) {
            const directions = [
                [-1, -1], [-1, 0], [-1, 1],
                [ 0, -1],         [ 0, 1],
                [ 1, -1], [ 1, 0], [ 1, 1]
            ];
            for (const [dr, dc] of directions) {
                const nr = cell.row + dr;
                const nc = cell.col + dc;
                if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
                    revealCell(grid[nr][nc]);
                }
            }
        }

        grid = [...grid];
    }

    function revealMine(cell) {
        grid.forEach(row => row.forEach(c => {
            if (c.isMine) c.isRevealed = true;
        }));
        grid = [...grid];
    }

    function checkWin() {
        if (revealedCount === rows * cols - minesCount) {
            endGame(true);
        }
    }
async function endGame(won) {
    gameOver = true;
    message = won ? 'You won! 100 Vinyls added.' : 'Game Over!';
    if (won) {
        try {
            await addVinyls(user.id, 100); // Add 100 Vinyls
            console.log('100 Vinyls added successfully.');
        } catch (err) {
            console.error('Vinyl Error:', err);
        }
    }
    grid = [...grid];
}

    function startGame() {
        gameOver = false;
        revealedCount = 0;
        message = '';
        initializeGrid();
    }

    onMount(async () => {
        const { data: session } = await supabase.auth.getSession();
        user = session?.session?.user;
        if (!user) {
            message = 'Log in to play.';
            return;
        }
        startGame();
    });
</script>

<!-- Game UI -->
<div class="minesweeper-game">
    <h2>Vinylsweeper</h2>
    {#if message}
        <div class="message" transition:fade>{message}</div>
    {/if}
    <div class="grid" style="grid-template-rows: {gridTemplateRows}; grid-template-columns: {gridTemplateColumns};">
        {#each grid as row, rowIndex}
            {#each row as cell}
                <Cell {cell} on:click={() => handleCellClick(cell)} on:contextmenu={(e) => handleCellRightClick(e, cell)} />
            {/each}
        {/each}
    </div>
    {#if gameOver}
        <button class="restart-button" on:click={startGame} transition:fly>Restart</button>
    {/if}
</div>

<style>
    .minesweeper-game {
        text-align: center;
        margin: auto;
        background: #16181c;
        padding: 20px;
        border-radius: 10px;
        width: fit-content;
    }

    .grid {
        display: grid;
        gap: 2px;
    }

    .message {
        background-color: #ffcccb;
        margin-bottom: 10px;
        padding: 10px;
        border-radius: 5px;
        font-weight: bold;
    }

    .restart-button {
        background-color: #007bff;
        color: #fff;
        padding: 10px;
        border: none;
        cursor: pointer;
    }

    .restart-button:hover {
        background-color: #0056b3;
    }
</style>