import "@webxdc/highscores";
import "./utils.js";
import "./state.js";
import "./game.js";
import "./grid.js";
import "./tile.js";
import "./hint.js";
import "./tutorial.js";
import "./levels.js";

const scoreboard = document.getElementById("scoreboard-container");
window.highscores
  .init({
    onHighscoresChanged: () => {
      scoreboard.innerHTML = window.highscores.renderScoreboard().innerHTML;
    },
  })
  .then(() => {
    Game.init();
    Game.start();
    $("#container").show();
  });
