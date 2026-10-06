const loadStatus = document.getElementById("load-status");
const scoresTable = document.getElementById("scores-table");
const scoresBody = document.getElementById("scores-body");

async function loadGameScores() {
  try {
    const response = await fetch("NFL-2024-Game-Scores.json");

    if (!response.ok) {
      throw new Error(`Could not load the file: HTTP ${response.status}`);
    }

    const data = await response.json();

    if (
      !Array.isArray(data.regular_season) ||
      !Array.isArray(data.playoffs)
    ) {
      throw new Error("The JSON file is missing the expected game arrays.");
    }

    scoresBody.replaceChildren();

    // Add the regular-season games.
    data.regular_season.forEach(function (game) {
      addGameRow(game, `Week ${game.week}`);
    });

    // Add the playoff games.
    data.playoffs.forEach(function (game) {
      addGameRow(game, game.round);
    });

    const regularCount = data.regular_season.length;
    const playoffCount = data.playoffs.length;
    const totalCount = regularCount + playoffCount;

    scoresTable.hidden = false;

    loadStatus.textContent =
      `Loaded ${totalCount} games: ${regularCount} regular-season games ` +
      `and ${playoffCount} playoff games.`;
  } catch (error) {
    scoresTable.hidden = true;

    loadStatus.textContent =
      "Unable to load game results. Check that the JSON file is in " +
      "the assignment6 folder and its filename matches exactly.";

    console.error("Error loading NFL scores:", error);
  }
}

function addGameRow(game, weekOrRound) {
  const row = document.createElement("tr");

  const values = [
    weekOrRound,
    game.date,
    game.away_team,
    game.away_score,
    game.home_team,
    game.home_score,
    game.overtime ? "Yes" : "No"
  ];

  values.forEach(function (value) {
    const cell = document.createElement("td");
    cell.textContent = value;
    row.appendChild(cell);
  });

  scoresBody.appendChild(row);
}

loadGameScores();