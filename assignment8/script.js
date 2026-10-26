const canvas = document.getElementById("balloon-canvas");
const ctx = canvas.getContext("2d");
const message = document.getElementById("animation-message");

const balloon = {
    x: 160,
    y: 120,
    radius: 42,
    speedX: 3,
    speedY: 3,
    color: "#d83a63",
    popped: false
};

let popStartTime = null;
const popDuration = 2000;

function drawBackground() {
    ctx.fillStyle = "#eaf5ff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "#9db8cc";
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, canvas.width, canvas.height);
}

function drawBalloon() {
    // Balloon body
    ctx.beginPath();
    ctx.ellipse(
        balloon.x,
        balloon.y,
        balloon.radius,
        balloon.radius + 10,
        0,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = balloon.color;
    ctx.fill();

    // Highlight
    ctx.beginPath();
    ctx.arc(
        balloon.x - 13,
        balloon.y - 15,
        9,
        0,
        Math.PI * 2
    );
    ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
    ctx.fill();

    // Balloon knot
    ctx.beginPath();
    ctx.moveTo(balloon.x - 8, balloon.y + balloon.radius + 7);
    ctx.lineTo(balloon.x + 8, balloon.y + balloon.radius + 7);
    ctx.lineTo(balloon.x, balloon.y + balloon.radius + 20);
    ctx.closePath();
    ctx.fillStyle = balloon.color;
    ctx.fill();
}

function drawPopEffect() {
    ctx.strokeStyle = "#f4a261";
    ctx.lineWidth = 5;

    for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 4) {
        const innerX = balloon.x + Math.cos(angle) * 15;
        const innerY = balloon.y + Math.sin(angle) * 15;
        const outerX = balloon.x + Math.cos(angle) * 70;
        const outerY = balloon.y + Math.sin(angle) * 70;

        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(outerX, outerY);
        ctx.stroke();
    }
}

function updateBalloon() {
    balloon.x += balloon.speedX;
    balloon.y += balloon.speedY;

    const leftEdge = balloon.radius;
    const rightEdge = canvas.width - balloon.radius;
    const topEdge = balloon.radius + 10;
    const bottomEdge = canvas.height - balloon.radius - 20;

    if (balloon.x >= rightEdge) {
        balloon.x = rightEdge;
        balloon.speedX = -Math.abs(balloon.speedX);
    } else if (balloon.x <= leftEdge) {
        balloon.x = leftEdge;
        balloon.speedX = Math.abs(balloon.speedX);
    }

    if (balloon.y >= bottomEdge) {
        balloon.y = bottomEdge;
        balloon.speedY = -Math.abs(balloon.speedY);
    } else if (balloon.y <= topEdge) {
        balloon.y = topEdge;
        balloon.speedY = Math.abs(balloon.speedY);
    }
}

function resetBalloon() {
    balloon.popped = false;
    balloon.x = 160;
    balloon.y = 120;
    balloon.speedX = 3;
    balloon.speedY = 3;
    popStartTime = null;


}

function animate(timestamp) {
    drawBackground();

    if (balloon.popped) {
        if (timestamp - popStartTime >= popDuration) {
            resetBalloon();
            drawBalloon();
        } else {
            drawPopEffect();
        }
    } else {
        updateBalloon();
        drawBalloon();
    }

    requestAnimationFrame(animate);
}

canvas.addEventListener("click", function (event) {
    if (balloon.popped) {
        return;
    }

    const canvasBox = canvas.getBoundingClientRect();

    const clickX =
        (event.clientX - canvasBox.left) *
        (canvas.width / canvasBox.width);

    const clickY =
        (event.clientY - canvasBox.top) *
        (canvas.height / canvasBox.height);

    const distanceX = clickX - balloon.x;
    const distanceY = clickY - balloon.y;

    // Check whether the click is inside the oval balloon body.
    const insideBalloon =
        (distanceX * distanceX) / (balloon.radius * balloon.radius) +
        (distanceY * distanceY) /
            ((balloon.radius + 10) * (balloon.radius + 10)) <=
        1;

    if (insideBalloon) {
        balloon.popped = true;
        popStartTime = performance.now();


    }
});

requestAnimationFrame(animate);