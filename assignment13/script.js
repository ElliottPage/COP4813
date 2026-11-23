"use strict";

const startButton = document.getElementById("start-button");
const fishGrid = document.getElementById("fish-grid");
const message = document.getElementById("game-message");
const results = document.getElementById("results");

const LIONFISH_COUNT = 10;
const NATIVE_COUNT = 5;
const POINTS_PER_FISH = 10;

const SPAWN_DELAY = 1200;
const VISIBLE_TIME = 3000;
const SLOT_COUNT = 12;

const lionfishImages = [
    {
        name: "Lionfish",
        src: "images/lionfish1.png"
    },
    {
        name: "Lionfish",
        src: "images/lionfish2.png"
    },
    {
        name: "Lionfish",
        src: "images/lionfish3.png"
    }
];

const nativeImages = [
    {
        name: "Atlantic blue tang",
        src: "images/blue-tang.png"
    },
    {
        name: "Queen angelfish",
        src: "images/queen-angelfish.png"
    },
    {
        name: "Yellowtail snapper",
        src: "images/yellowtail-snapper.png"
    }
];

const slots = [];
const activeFish = new Map();
const effectTimers = new Set();

let roundFish = [];
let nextFishIndex = 0;
let caught = 0;
let nativeClicked = 0;

let running = false;
let spawnTimer = null;

function randomItem(items) {
    return items[Math.floor(Math.random() * items.length)];
}

function shuffle(items) {
    for (let i = items.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));

        [items[i], items[j]] = [items[j], items[i]];
    }

    return items;
}

function createSlots() {
    for (let i = 0; i < SLOT_COUNT; i++) {
        const slot = document.createElement("div");

        slot.className = "fish-slot";

        fishGrid.appendChild(slot);
        slots.push(slot);
    }
}

function createRound() {
    const fish = [];

    for (let i = 0; i < LIONFISH_COUNT; i++) {
        fish.push({
            ...randomItem(lionfishImages),
            type: "lionfish"
        });
    }

    for (let i = 0; i < NATIVE_COUNT; i++) {
        fish.push({
            ...randomItem(nativeImages),
            type: "native"
        });
    }

    return shuffle(fish);
}

function getScore() {
    return Math.max(
        0,
        (caught - nativeClicked) * POINTS_PER_FISH
    );
}

function clearRound() {
    clearInterval(spawnTimer);
    spawnTimer = null;

    for (const fish of activeFish.values()) {
        clearTimeout(fish.timer);
    }

    activeFish.clear();

    for (const timer of effectTimers) {
        clearTimeout(timer);
    }

    effectTimers.clear();

    for (const slot of slots) {
        slot.replaceChildren();
    }
}

function showEffect(slot, text) {
    const effect = document.createElement("span");

    effect.className = "catch-effect";
    effect.textContent = text;
    effect.setAttribute("aria-hidden", "true");

    slot.appendChild(effect);

    const timer = setTimeout(() => {
        effect.remove();
        effectTimers.delete(timer);
    }, 450);

    effectTimers.add(timer);
}

function checkRoundComplete() {
    if (
        running &&
        nextFishIndex === roundFish.length &&
        activeFish.size === 0
    ) {
        finishRound();
    }
}

function removeFish(slot, wasClicked) {
    if (!running || !activeFish.has(slot)) {
        return;
    }

    const fish = activeFish.get(slot);

    clearTimeout(fish.timer);

    activeFish.delete(slot);
    fish.button.remove();

    if (wasClicked) {
        if (fish.type === "lionfish") {
            caught++;
        } else {
            nativeClicked++;
        }
    }

    checkRoundComplete();
}

function spawnFish() {
    if (!running || nextFishIndex >= roundFish.length) {
        return;
    }

    const availableSlots = slots.filter(
        (slot) => !activeFish.has(slot)
    );

    if (availableSlots.length === 0) {
        return;
    }

    const slot = randomItem(availableSlots);
    const fish = roundFish[nextFishIndex];

    const button = document.createElement("button");
    const image = document.createElement("img");

    button.type = "button";
    button.className = "fish-target";
    button.setAttribute("aria-label", fish.name);

    image.src = fish.src;
    image.alt = "";
    image.draggable = false;

    button.appendChild(image);
    slot.appendChild(button);

    const timer = setTimeout(() => {
        removeFish(slot, false);
    }, VISIBLE_TIME);

    activeFish.set(slot, {
        ...fish,
        button,
        timer
    });

    button.addEventListener("click", () => {
        removeFish(slot, true);
    });

    nextFishIndex++;

    if (nextFishIndex === roundFish.length) {
        clearInterval(spawnTimer);
        spawnTimer = null;
    }
}

function startRound() {
    if (running) {
        return;
    }

    clearRound();

    caught = 0;
    nativeClicked = 0;
    nextFishIndex = 0;

    roundFish = createRound();
    running = true;

    results.hidden = true;
    startButton.disabled = true;

    message.textContent = "";

    spawnTimer = setInterval(spawnFish, SPAWN_DELAY);
    spawnFish();
}

function finishRound() {
    running = false;

    clearInterval(spawnTimer);
    spawnTimer = null;

    document.getElementById("final-score").textContent =
        `${getScore()} / 100`;

    const summary = document.getElementById("result-summary");

    if (caught === LIONFISH_COUNT && nativeClicked === 0) {
        summary.textContent =
            "Perfect rescue! Every lionfish caught and every native fish left alone.";
    } else {
        summary.textContent =
            "Try again to catch more lionfish while leaving native fish alone.";
    }

    startButton.textContent = "Play Again";
    startButton.disabled = false;

    results.hidden = false;
    results.focus();
}

function preloadImage(fish) {
    return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = () => {
            if (image.naturalWidth > 0) {
                resolve();
            } else {
                reject(new Error(`Empty image: ${fish.src}`));
            }
        };

        image.onerror = () => {
            reject(new Error(`Could not load ${fish.src}`));
        };

        image.src = fish.src;
    });
}

async function prepareGame() {
    createSlots();

    try {
        await Promise.all(
            [...lionfishImages, ...nativeImages].map(preloadImage)
        );

        message.textContent = "";
        startButton.disabled = false;
    } catch (error) {
        message.textContent =
            "A fish image could not be loaded. Check the filenames in the images folder.";

        console.error("Fish image error:", error);
    }
}

startButton.addEventListener("click", startRound);

prepareGame();