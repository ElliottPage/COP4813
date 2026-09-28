const canvas = document.getElementById("spiroCanvas");
const ctx = canvas.getContext("2d");
const drawButton = document.getElementById("drawButton");
const statusMessage = document.getElementById("statusMessage");

let animationId = null;
let drawingVersion = 0;

function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

drawButton.addEventListener("click", function () {
  drawingVersion += 1;
  const currentVersion = drawingVersion;

  if (animationId !== null) {
    cancelAnimationFrame(animationId);
    animationId = null;
  }

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const R = randomNumber(120, 180);
  const r = randomNumber(20, 80);
  const O = randomNumber(20, 100);

  statusMessage.textContent =
    `Drawing a new pattern with R = ${R}, r = ${r}, and O = ${O}.`;

  let t = 0;
  const increment = 0.05;
  const maxT = Math.PI * 40;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  const startX =
    centerX +
    (R + r) * Math.cos(t) -
    (r + O) * Math.cos(((R + r) / r) * t);

  const startY =
    centerY +
    (R + r) * Math.sin(t) -
    (r + O) * Math.sin(((R + r) / r) * t);

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.strokeStyle = "#2563eb";
  ctx.lineWidth = 1.5;

  function drawSpirograph() {
    if (currentVersion !== drawingVersion) {
      return;
    }

    for (let i = 0; i < 15 && t < maxT; i++) {
      t += increment;

      const x =
        centerX +
        (R + r) * Math.cos(t) -
        (r + O) * Math.cos(((R + r) / r) * t);

      const y =
        centerY +
        (R + r) * Math.sin(t) -
        (r + O) * Math.sin(((R + r) / r) * t);

      ctx.lineTo(x, y);
    }

    ctx.stroke();

    if (t < maxT) {
      animationId = requestAnimationFrame(drawSpirograph);
    } else {
      animationId = null;

      statusMessage.textContent =
        `Pattern complete. R = ${R}, r = ${r}, and O = ${O}.`;
    }
  }

  drawSpirograph();
});