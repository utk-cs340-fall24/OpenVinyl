<script>
    export let cell;

    // Determine the content to display
    let content = '';

    $: if (cell.isRevealed) {
        if (cell.isMine) {
            content = '💣';
        } else if (cell.adjacentMines > 0) {
            content = cell.adjacentMines;
        } else {
            content = '';
        }
    }

    // Determine the background color
    let backgroundColor = '#bdbdbd'; // Default hidden cell color
    if (cell.isRevealed) {
        backgroundColor = '#e0e0e0'; // Revealed cell color
        if (cell.isMine) {
            backgroundColor = '#ff4d4d'; // Mine color
        }
    } else if (cell.isFlagged) {
        backgroundColor = '#ffeb3b'; // Flagged cell color
    }
</script>

<!-- Cell UI -->
<div
    class="cell"
    style="background-color: {backgroundColor};"
    on:click
    on:contextmenu|preventDefault
>
    {#if cell.isFlagged}
        <img src="/logo.svg" alt="Flag" class="flag-icon" />
    {:else if cell.isRevealed}
        <span>{content}</span>
    {/if}
</div>

<style>
    .cell {
        width: 30px;
        height: 30px;
        border: 1px solid #757575;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        user-select: none;
        font-weight: bold;
        font-size: 18px;
        color: black;
    }

    .cell:hover {
        filter: brightness(90%);
    }

    .flag-icon {
        width: 20px;
        height: 20px;
        pointer-events: none; /* Prevent interaction with the icon */
    }

    span {
        pointer-events: none;
    }

    /* Responsive Design */
    @media (max-width: 600px) {
        .cell {
            width: 25px;
            height: 25px;
            font-size: 16px;
        }

        .flag-icon {
            width: 15px;
            height: 15px;
        }
    }
</style>