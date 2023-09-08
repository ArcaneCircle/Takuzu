/*
 * Game
 * The main game, a singleton object in global scope.
 */
window.Game = {
  debug: Config.debug,
  startedTutorial: false,
  grid: undefined,
  sizes: [4, 6, 8, 10],
  lastSize: 0,
  currentPuzzle: null,
  checkTOH: 0,
  ojoos: [
    "Wonderful",
    "Spectacular",
    "Marvelous",
    "Outstanding",
    "Remarkable",
    "Shazam",
    "Impressive",
    "Great",
    "Well done",
    "Fabulous",
    "Clever",
    "Dazzling",
    "Fantastic",
    "Excellent",
    "Nice",
    "Super",
    "Awesome",
    "Ojoo",
    "Brilliant",
    "Splendid",
    "Exceptional",
    "Magnificent",
    "Yay",
  ],
  remainingOjoos: [],
  endGameTOH1: undefined,
  endGameTOH2: undefined,
  endGameTOH3: undefined,
  onHomeScreen: true,
  undoStack: [],
  undone: false,
  gameEnded: true,

  init: function () {
    $("#scorenr").html(window.highscores.getScore());

    if (Utils.isTouch()) $("html").addClass("touch");

    $("[data-size]").each((i, el) => {
      const $el = $(el),
        size = $el.attr("data-size") * 1,
        label = this.sizes[size - 1];
      $el.html(label);
      $el.on("touchstart mousedown", (evt) => {
        if (Utils.isDoubleTapBug(evt)) return false;
        const size =
          this.sizes[
            $(evt.target).closest("[data-size]").attr("data-size") * 1 - 1
          ];
        this.loadGame(size);
      });
    });
    this.resize();
    $(window).on("resize", this.resize.bind(this));
    $(window).on("orientationchange", this.resize.bind(this));

    this.resize();

    const colors = ["#a7327c", "#c24b31", "#c0cd31"];
    Utils.setColorScheme(colors[1]);
  },

  start: function () {
    this.addEventListeners();
    this.showMenu();
  },

  resize: function () {
    const desired = {
        width: 320,
        height: 480,
      },
      aspectRatio = desired.width / desired.height,
      viewport = {
        width: $("#feelsize").width(),
        height: $("#feelsize").height(),
      },
      sizeToWidth = viewport.width / viewport.height < aspectRatio;

    const box = {
      width: Math.floor(
        sizeToWidth
          ? viewport.width
          : (viewport.height / desired.height) * desired.width,
      ),
      height: Math.floor(
        sizeToWidth
          ? (viewport.width / desired.width) * desired.height
          : viewport.height,
      ),
    };

    $("#container").css({ width: box.width + "px", height: box.height + "px" });

    const containerSize = box.width;

    $("h1").css("font-size", Math.round(containerSize * 0.24) + "px");
    $("h2").css("font-size", Math.round(containerSize * 0.18) + "px");
    $("h3").css("font-size", Math.round(containerSize * 0.15) + "px");
    $("p").css("font-size", Math.round(containerSize * 0.07) + "px");
    $("#menu h2").css("font-size", Math.round(containerSize * 0.24) + "px");
    $("#menu p").css("font-size", Math.round(containerSize * 0.1) + "px");
    $("#menu p").css("padding", Math.round(containerSize * 0.05) + "px 0");
    $("#menu p").css("line-height", Math.round(containerSize * 0.1) + "px");
    const scoreSize = Math.round(containerSize * 0.1);
    $("#score").css({
      "font-size": scoreSize + "px",
      "line-height": scoreSize * 0.85 + "px",
      height: scoreSize + "px",
    });

    const iconSize = Math.floor((22 / 320) * containerSize);
    $(".icon").css({
      width: iconSize,
      height: iconSize,
      marginLeft: iconSize,
      marginRight: iconSize,
    });

    $(".board table").each((i, el) => {
      const $el = $(el),
        id = $el.attr("data-grid"),
        w = $el.width(),
        size = $el.find("tr").first().children("td").length;

      const tileSize = Math.floor(w / size);

      if (!tileSize) return;

      $el.find(".tile").css({
        width: tileSize,
        height: tileSize,
        "line-height": Math.round(tileSize * 0.85) + "px",
        "font-size": Math.round(tileSize * 0.5) + "px",
      });
      const radius = Math.round(tileSize * 0.1);
      const radiusCss =
        "#" +
        id +
        " .tile .inner { border-radius: " +
        radius +
        "px; }" +
        "#" +
        id +
        " .tile-1 .inner:after, #" +
        id +
        " .tile-2 .inner:after { border-radius: " +
        radius +
        "px; }";

      Utils.createCSS(radiusCss, id + "radius");
      Utils.createCSS(
        ".tile.marked .inner { border-width: " +
          Math.floor(tileSize / 24) +
          "px }",
        "tileSize",
      );
    });

    const topVSpace = Math.floor(
      $("#container").height() / 2 - $("#board").height() / 2,
    );
    $("#hintMsg").height(topVSpace + "px");
  },

  showScoreboard: function () {
    this.onHomeScreen = false;
    $(".screen").hide().removeClass("show");
    $("#scoreboard").show();
    setTimeout(() => {
      $("#scoreboard").addClass("show");
    }, 0);
    this.resize();
  },

  showGame: function () {
    this.onHomeScreen = false;
    $(".screen").hide().removeClass("show");
    $("#game").show();
    setTimeout(() => {
      $("#game").addClass("show");
    }, 0);
    this.resize();
  },

  showMenu: function () {
    this.onHomeScreen = true;
    this.clearTimeouts();
    if (window.highscores.getHighScores().length) $("#scores-btn").show();
    $(".screen").hide().removeClass("show");
    $("#menu").show();
    $("#scorenr").html(window.highscores.getScore());
    setTimeout(() => {
      $("#menu").addClass("show");
    }, 0);
    this.resize();
  },

  showAbout: function () {
    this.onHomeScreen = false;
    $(".screen").hide().removeClass("show");
    $("#about").show();
    setTimeout(() => {
      $("#about").addClass("show");
    }, 0);
    this.resize();
  },

  showSizes: function () {
    this.onHomeScreen = false;
    this.showGame();
    $("#boardsize").html("<span>Select a size</span>");
    $("#menugrid").removeClass("hidden");
    $("#board").addClass("hidden");
    $("#bar [data-action]").not('[data-action="back"]').hide();
    $("#board").addClass("hidden");
    $("#score").show();
    setTimeout(() => {
      if (this.grid) this.grid.clear();
      $("#score").addClass("show");
    }, 0);
  },

  showLoad: function () {
    this.onHomeScreen = false;
    $(".screen").hide().removeClass("show");
    $("#loading").show();
    setTimeout(() => {
      $("#loading").addClass("show");
    }, 0);
  },

  loadGame: function (size) {
    this.onHomeScreen = false;
    $("#game").removeClass("show");
    this.showLoad();
    this.resize();

    // don't show a loading screen if we have a puzzle ready
    if (Levels.hasPuzzleAvailable(size)) {
      setTimeout(() => {
        this.startGame(Levels.getSize(size));
      }, 100);
      return;
    }

    setTimeout(() => {
      const puzzle = Levels.getSize(size);
      this.startGame(puzzle);
    }, 100);
  },

  // puzzle is object with format { size:6, full:[2,1,...], empty:[0,0,2,...], quality: 76, ms: 42 }
  startGame: function (puzzle) {
    this.onHomeScreen = false;
    if (!puzzle || !puzzle.size || !puzzle.full)
      throw "no proper puzzle object received";

    //console.log(puzzle);
    this.clearTimeouts();
    if (window.STOPPED) return;
    this.startedTutorial = false;
    $("#undo").closest(".iconcon").css("display", "inline-block");
    $("#menugrid").addClass("hidden");
    $("#board").removeClass("hidden");
    $("#bar [data-action]").show();
    $("#chooseSize").removeClass("show");
    $("#score").removeClass("show").hide();
    $('#bar [data-action="help"]').removeClass("hidden wiggle");
    $("#boardsize").html(
      "<span>" + puzzle.size + " x " + puzzle.size + "</span>",
    );
    this.grid = new Grid(puzzle.size, puzzle.size);
    this.lastSize = puzzle.size;

    this.grid.load(puzzle.empty, puzzle.full);
    // set system tiles manually
    this.grid.each(function () {
      this.value = this.value; // yes, do so
      if (this.value > 0) this.system = true;
    });
    this.grid.state.save("empty");

    this.currentPuzzle = puzzle;
    this.grid.hint.active = true;
    this.grid.activateDomRenderer();
    this.grid.render();
    this.undoStack = [];
    this.undone = false;
    this.gameEnded = false;

    setTimeout(this.showGame.bind(this), 0);
  },

  endGame: function () {
    // first of all, save the score, so if you quit while the animation runs, the score is kept
    const oldScore = window.highscores.getScore();
    this.setScore(this.grid.width * this.grid.height);
    const newScore = window.highscores.getScore();

    this.grid.unmark();
    this.grid.hint.hide();
    this.grid.hint.active = false;
    const ojoo = this.getOjoo() + "!";
    $("#boardsize").html("<span>" + ojoo + "</span>");
    this.grid.each(() => {
      this.system = true;
    });
    $("#bar [data-action]").not('[data-action="back"]').hide();

    this.endGameTOH3 = setTimeout(() => {
      $("#grid .tile").addClass("completed");
      this.endGameTOH1 = setTimeout(() => {
        $("#board").addClass("hidden");
        this.endGameTOH2 = setTimeout(() => {
          this.gameEnded = true;
          $("#menugrid").removeClass("hidden");
          $("#chooseSize").addClass("show");
          $("#score").show();

          // animate the score visually from its old value to the new one
          if (!this.startedTutorial) {
            if (newScore > oldScore) {
              this.animateScore(oldScore, newScore);
            }
          }

          setTimeout(() => {
            $("#score").addClass("show");
          }, 0);
        }, 50);
      }, 2000);
    }, 1200);

    // shift
    if (!this.currentPuzzle.isTutorial) Levels.finishedSize(this.grid.width);
  },

  quitCurrentGame: function () {
    this.gameEnded = true;
    if (this.grid) {
      this.grid.unmark();
      this.grid.hint.hide();
      this.grid.hint.active = false;
      this.grid.each(() => {
        this.system = true;
      });
    }
    this.showSizes();
  },

  addEventListeners: function () {
    document.addEventListener(
      "backbutton",
      this.backButtonPressed.bind(this),
      false,
    );

    $(document).on("keydown", (evt) => {
      if (evt.keyCode == 27 /* escape */) {
        backButtonPressed();
        return false;
      }
      if (evt.keyCode == 32 /* space */) {
        this.doAction("help");
        return false;
      }
      if (evt.keyCode == 90 /* Z */ && (evt.metaKey || evt.ctrlKey)) {
        this.doAction("undo");
        return false;
      }
    });
    $(document).on("touchend mouseup", this.click.bind(this));
    $(document).on("touchstart mousedown", "#grid td", (e) => {
      if (Utils.isDoubleTapBug(e)) return false;
      const $el = $(e.target).closest("td"),
        x = $el.attr("data-x") * 1,
        y = $el.attr("data-y") * 1,
        tile = this.grid.tile(x, y);

      clearTimeout(this.checkTOH);

      if (tile.system) {
        const $tile = $el.find(".tile");
        $tile.addClass("error");
        setTimeout(() => {
          $tile.removeClass("error");
        }, 500);
        return false;
      }

      if (Tutorial.active) {
        Tutorial.tapTile(tile);
        return false;
      }

      if (this.grid && this.grid.hint) this.grid.hint.clear();

      // create new undo
      const undoState = [tile, tile.value, new Date()];
      if (this.undoStack.length) {
        // check if the last state was done a few ms ago, then consider it as one change
        const lastState = this.undoStack[this.undoStack.length - 1],
          lastTile = lastState[0],
          lastChange = lastState[2];
        if (lastTile.id != tile.id || new Date() - lastChange > 500)
          this.undoStack.push(undoState);
      } else this.undoStack.push(undoState);

      if (tile.isEmpty) tile.value = 1;
      else if (tile.value == 1) tile.value = 2;
      else tile.clear();

      if (tile.value > 0)
        this.checkTOH = setTimeout(() => {
          this.checkForLevelComplete();
        }, 700);
      return false;
    });
  },

  click: function (evt) {
    if (Utils.isDoubleTapBug(evt)) return false;
    const $el = $(evt.target).closest("*[data-action]"),
      action = $el.attr("data-action"),
      value = $el.attr("data-value");
    if (action) {
      this.doAction(action, value);
      return false;
    }
  },

  doAction: function (action, value) {
    switch (action) {
      case "show-menu":
        clearTimeout(this.checkTOH);
        Tutorial.end();
        if (this.grid) this.grid.hint.clear();
        this.showMenu();
        break;
      case "back":
        if (this.gameEnded) return this.doAction("show-menu");
        clearTimeout(this.checkTOH);
        Tutorial.end();
        this.quitCurrentGame();
        break;
      case "next":
        clearTimeout(this.checkTOH);
        Tutorial.end();
        if (this.grid) this.grid.hint.clear();
        this.loadGame(this.lastSize);
        break;
      case "undo":
        if (!this.gameEnded) this.undo();
        break;
      case "retry":
        clearTimeout(this.checkTOH);
        $("#game").removeClass("show");
        if (Tutorial.active || this.currentPuzzle.isTutorial) {
          setTimeout(() => {
            Tutorial.start();
          }, 300);
          return;
        }
        setTimeout(() => {
          this.startGame(this.currentPuzzle);
        }, 300);
        //this.grid.hint.clear();
        //this.grid.each(function() { this.system = true;});

        //this.grid.state.restore('empty');
        break;
      case "help":
        if (this.gameEnded) break;
        clearTimeout(this.checkTOH);
        if (Tutorial.active && !Tutorial.hintAllowed()) return;
        if (this.grid.hint.visible) this.grid.hint.clear();
        else {
          this.grid.hint.clear();
          this.grid.hint.next();
        }
        break;
      case "play":
        this.showSizes();
        break;
      case "scoreboard":
        this.showScoreboard();
        break;
      case "tutorial":
        this.startTutorial();
        break;
      case "about":
        this.showAbout();
        break;
    }
  },

  checkForLevelComplete: function () {
    if (this.grid.emptyTileCount > 0) return;

    if (this.grid.wrongTiles.length > 0) {
      this.grid.hint.next();
      return;
    }

    this.endGame();
  },

  tutorialPlayed: function () {
    if (!window.localStorage) return true;
    return window.localStorage.getItem("tutorialPlayed") + "" == "true";
  },

  markTutorialAsPlayed: function () {
    if (!window.localStorage) return;
    window.localStorage.setItem("tutorialPlayed", true);
  },

  startTutorial: function () {
    this.onHomeScreen = false;
    Tutorial.start();
    // set flag to not get points for the tutorial...
    this.startedTutorial = true;
    // ... except when this is the first time
    if (!this.tutorialPlayed()) this.startedTutorial = false;

    this.markTutorialAsPlayed();
    $("#undo").closest(".iconcon").css("display", "none");
  },

  backButtonPressed: function () {
    if (this.onHomeScreen) navigator.app.exitApp();
    else this.doAction("back");
  },

  getOjoo: function () {
    if (!this.remainingOjoos.length)
      this.remainingOjoos = Utils.shuffle(this.ojoos.slice(0));
    return Utils.draw(this.remainingOjoos);
  },

  setScore: function (addPoints) {
    if (this.currentPuzzle.isTutorial) return;

    clearTimeout(this.setScore.TOH);
    window.highscores.setScore(window.highscores.getScore() + addPoints);
    return window.highscores.getScore();
  },

  animateScore: function (curScore, newScore) {
    const delay = 500 / (newScore - curScore);
    next(this);

    function next(game) {
      $("#scorenr").html(curScore);
      if (curScore < newScore) curScore++;
      game.setScore.TOH = setTimeout(() => next(game), delay);
    }
  },

  undo: function () {
    if (!this.undoStack.length) {
      if (this.grid.hint.visible) {
        this.grid.unmark();
        this.grid.hint.hide();
        return;
      }
      if (!this.undone) this.grid.hint.show("That's the undo button.");
      else this.grid.hint.show("Nothing to undo.");
      return;
    }
    const undoState = this.undoStack.pop(),
      tile = undoState[0],
      value = undoState[1];
    this.grid.unmark();
    if (value >= 0) {
      tile.value = value;
    } else {
      tile.clear();
    }
    tile.mark();
    let s = "This tile was reversed to ";
    if (value == 1) s += "red.";
    if (value == 2) s += "blue.";
    if (value == 0) s += "its empty state.";
    this.grid.hint.show(s);
    this.undone = true;
    clearTimeout(this.checkTOH);
    this.checkTOH = setTimeout(() => {
      this.checkForLevelComplete();
    }, 700);
  },

  clearTimeouts: function () {
    clearTimeout(this.endGameTOH1);
    clearTimeout(this.endGameTOH2);
    clearTimeout(this.endGameTOH3);
  },
};

window.__defineGetter__("tile", function () {
  return Game.grid.tile;
});
