const dealButton = document.getElementById("deal-button");
const playerHand = document.getElementById("player-hand");
const gameMessage = document.getElementById("game-message");
const discardPile = document.getElementById("discard-pile");
const discardPlaceholder = document.getElementById("discard-placeholder");
const discardCount = document.getElementById("discard-count");

const suits = ["Hearts", "Clubs", "Diamonds", "Spades"];

const ranks = [
    "2", "3", "4", "5", "6", "7", "8",
    "9", "10", "Jack", "Queen", "King", "Ace"
];

let deck = [];
let discardedCards = 0;
let draggedCardId = null;

function createDeck() {
    const newDeck = [];

    for (let row = 1; row <= suits.length; row++) {
        for (let column = 1; column <= ranks.length; column++) {
            newDeck.push({
                id: `card-${row}-${column}`,
                name: `${ranks[column - 1]} of ${suits[row - 1]}`,
                image: `images/row-${row}-column-${column}.png`
            });
        }
    }

    return newDeck;
}

function shuffleDeck(cards) {
    for (let i = cards.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1));

        [cards[i], cards[randomIndex]] =
            [cards[randomIndex], cards[i]];
    }
}

function startDragging(event) {
    draggedCardId = event.currentTarget.id;

    event.dataTransfer.setData("text/plain", draggedCardId);
    event.dataTransfer.effectAllowed = "move";
}

function stopDragging() {
    draggedCardId = null;
}

function dealCards() {
    playerHand.replaceChildren();

    discardPile.replaceChildren(discardPlaceholder);
    discardPlaceholder.hidden = false;

    discardedCards = 0;
    discardCount.textContent = "0";
    draggedCardId = null;

    deck = createDeck();
    shuffleDeck(deck);

    for (let i = 0; i < 5; i++) {
        const card = deck.pop();

        const image = document.createElement("img");
        image.id = card.id;
        image.src = card.image;
        image.alt = card.name;
        image.title = card.name;
        image.className = "playing-card";
        image.width = 142;
        image.height = 190;
        image.draggable = true;

        image.addEventListener("dragstart", startDragging);
        image.addEventListener("dragend", stopDragging);

        playerHand.appendChild(image);
    }

    gameMessage.textContent =
        `Dealt 5 cards. Drag cards into the discard pile to remove them from your hand.`;
}

function allowDrop(event) {
    if (!draggedCardId) {
        return;
    }

    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
}

function discardCard(event) {
    event.preventDefault();

    const cardId = event.dataTransfer.getData("text/plain");
    const card = document.getElementById(cardId);

    if (
        !card ||
        cardId !== draggedCardId ||
        card.parentElement !== playerHand
    ) {
        return;
    }

    const cardName = card.alt;

    // Display only the most recently discarded card.
    discardPile.replaceChildren(card);
    card.draggable = false;

    // Fit the card inside the discard box's border.
    card.style.width = "100%";
    card.style.height = "100%";

    discardedCards++;
    discardCount.textContent = String(discardedCards);

    gameMessage.textContent =
        `You discarded the ${cardName}. ` +
        `${playerHand.children.length} cards remain in your hand.`;

    draggedCardId = null;
}

dealButton.addEventListener("click", dealCards);
discardPile.addEventListener("dragover", allowDrop);
discardPile.addEventListener("drop", discardCard);