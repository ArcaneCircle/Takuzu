import "webxdc-scores";
import "./utils.js";
import "./state.js";
import "./game.js";
import "./grid.js";
import "./tile.js";
import "./hint.js";
import "./tutorial.js";
import "./levels.js";

window.highscores.init("Takuzu", "scoreboard-container").then(() => {
  Game.init();
  Game.start();
  $("#container").show();
});
