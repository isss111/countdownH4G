(function (window) {

  var canvasId = "countdownCanvas";
  var canvas = document.getElementById(canvasId);
  var ctx = canvas.getContext("2d");
  ctx.canvas.width = window.innerWidth;
  ctx.canvas.height = window.innerHeight;

  // YEAR 2016, MONTH-1, DAY, HOUR, MIN, SEC, MSEC
  var countTo = new Date(2016, 4, 13, 16, 0, 0, 0);

  function calcPositions() {
    var width = 100;
    var height = 200;
    var spacing = 25;
    var biggerSpacing = 75;

    var top = window.innerHeight / 2 - height / 2;

    var wholeWidth = width * 6 + spacing * 5 + biggerSpacing * 2;
    var left = window.innerWidth / 2 - wholeWidth / 2;

    var positions = {};
    for(var i = 0; i < 6; i++) {
      var posLeft = left + (width * i) + (spacing * i);
      if (i >= 2) posLeft += biggerSpacing;
      if (i >= 4) posLeft += biggerSpacing;
      positions[i + ""] = { top: top, left: posLeft}
    }

    return positions;
  }

  var positions = calcPositions();

  var timeNow = new Date();

  var colorDigits = {
    "0": { from: ["", ""], to: ["", ""], curr: ["", ""], diff: [null, null] },
    "1": { from: ["", ""], to: ["", ""], curr: ["", ""], diff: [null, null] },
    "2": { from: ["", ""], to: ["", ""], curr: ["", ""], diff: [null, null] },
    "3": { from: ["", ""], to: ["", ""], curr: ["", ""], diff: [null, null] },
    "4": { from: ["", ""], to: ["", ""], curr: ["", ""], diff: [null, null] },
    "5": { from: ["", ""], to: ["", ""], curr: ["", ""], diff: [null, null] }
  };

  // prefill colorDigits
  colorDigits["0"].from[0] = color2color(getSuitableColor(), "hsl");
  colorDigits["0"].from[1] = color2color(getSuitableColor(), "hsl");
  colorDigits["0"].to[0] = color2color(getSuitableColor(), "hsl");
  colorDigits["0"].to[1] = color2color(getSuitableColor(), "hsl");
  colorDigits["1"].from[0] = color2color(getSuitableColor(), "hsl");
  colorDigits["1"].from[1] = color2color(getSuitableColor(), "hsl");
  colorDigits["1"].to[0] = color2color(getSuitableColor(), "hsl");
  colorDigits["1"].to[1] = color2color(getSuitableColor(), "hsl");
  colorDigits["2"].from[0] = color2color(getSuitableColor(), "hsl");
  colorDigits["2"].from[1] = color2color(getSuitableColor(), "hsl");
  colorDigits["2"].to[0] = color2color(getSuitableColor(), "hsl");
  colorDigits["2"].to[1] = color2color(getSuitableColor(), "hsl");
  colorDigits["3"].from[0] = color2color(getSuitableColor(), "hsl");
  colorDigits["3"].from[1] = color2color(getSuitableColor(), "hsl");
  colorDigits["3"].to[0] = color2color(getSuitableColor(), "hsl");
  colorDigits["3"].to[1] = color2color(getSuitableColor(), "hsl");
  colorDigits["4"].from[0] = color2color(getSuitableColor(), "hsl");
  colorDigits["4"].from[1] = color2color(getSuitableColor(), "hsl");
  colorDigits["4"].to[0] = color2color(getSuitableColor(), "hsl");
  colorDigits["4"].to[1] = color2color(getSuitableColor(), "hsl");
  colorDigits["5"].from[0] = color2color(getSuitableColor(), "hsl");
  colorDigits["5"].from[1] = color2color(getSuitableColor(), "hsl");
  colorDigits["5"].to[0] = color2color(getSuitableColor(), "hsl");
  colorDigits["5"].to[1] = color2color(getSuitableColor(), "hsl");

  window.colorDigits = colorDigits;

  function parseHSL(hsl) {
    hsl = hsl.replace("hsl(", "");
    hsl = hsl.replace(")", "");
    hsl = hsl.replace("%", "");
    hsl = hsl.replace("%", "");
    hsl = hsl.replace(" ", "");
    hsl = hsl.split(",");
    return [ Number(Number(hsl[0]).toFixed(0)), Number(Number(hsl[1]).toFixed(3)), Number(Number(hsl[2]).toFixed(3))];
  }

  function newColorTo(digit, i) {
    colorDigits[digit+""].from[i] = colorDigits[digit+""].to[i];
    colorDigits[digit+""].curr[i] = null;
    colorDigits[digit+""].to[i] = color2color(getSuitableColor(), "hsl");
    colorDigits[digit+""].diff[i] = null;
  }

  function easeColors() {
    for (var i = 0; i < 6; i++) {
      for (var k = 0; k < 2; k++) {
        if (!colorDigits[i+""].curr[k]) {
          colorDigits[i+""].curr[k] = colorDigits[i+""].from[k];
        }

        var c = parseHSL(colorDigits[i+""].curr[k]);
        var f = parseHSL(colorDigits[i+""].from[k]);
        var t = parseHSL(colorDigits[i+""].to[k]);

        if (Math.ceil(c[0]) === t[0] && Math.ceil(c[1]) === t[1] && Math.ceil(c[2]) === t[2]) {
          newColorTo(i, k);
        }

        if (!colorDigits[i+""].curr[k]) {
          colorDigits[i+""].curr[k] = colorDigits[i+""].from[k];
        }

        c = parseHSL(colorDigits[i+""].curr[k]);
        f = parseHSL(colorDigits[i+""].from[k]);
        t = parseHSL(colorDigits[i+""].to[k]);

        if (!colorDigits[i+""].diff[k]) {
          var ahue = Math.abs(f[0]-t[0]) > 180 ? Math.abs(t[0]-f[0]) : Math.abs(f[0]-t[0]);
          var d = [ ahue, Math.abs(f[1]-t[1]), Math.abs(f[2]-t[2]) ];
          var largest = Math.max.apply(Math, d);
          if (largest < 1) largest = 1;

          var huei = t[0]-f[0];
          if (Math.abs(huei) > 180) {
            if (huei < 0) {
              huei += 360;
            } else {
              huei -= 360;
            }
          }

          var huediff = Math.ceil(huei/largest);

          colorDigits[i+""].diff[k] = [ huediff, (t[1]-f[1])/largest, (t[2]-f[2])/largest ];
        }
        var add = colorDigits[i+""].diff[k];
        var newh, news, newl;
        if ((add[0] >= 0 && c[0] >= t[0]) || (add[0] <= 0 && c[0] <= t[0])) {
          newh = t[0];
        } else {
          newh = c[0] + add[0];
        }
        if ((add[1] >= 0 && c[1] >= t[1]) || (add[1] <= 0 && c[1] <= t[1])) {
          news = t[1];
        } else {
          news = c[1] + add[1];
        }
        if ((add[2] >= 0 && c[2] >= t[2]) || (add[2] <= 0 && c[2] <= t[2])) {
          newl = t[2];
        } else {
          newl = c[2] + add[2];
        }
        colorDigits[i+""].curr[k] = "hsl(" + newh + "," + news + "%," + newl + "%)";
      }
    }
  }

  function getSuitableColor() {
    timeNow = new Date();
    var timeColorMappings = {
      "21": [ "Purple", "Deep Purple", "Indigo" ],
      "22": [ "Purple", "Deep Purple", "Indigo" ],
      "23": [ "Purple", "Deep Purple", "Indigo" ],
      "0": [ "Purple", "Deep Purple", "Indigo" ],
      "1": [ "Purple", "Deep Purple", "Indigo" ],
      "2": [ "Purple", "Deep Purple", "Indigo" ],
      "3": [ "Purple", "Deep Purple", "Indigo" ],
      "4": [ "Purple", "Deep Purple", "Indigo" ],
      "5": [ "Purple", "Deep Purple", "Indigo" ],
      "6": [ "Blue", "Light Blue", "Teal" ],
      "7": [ "Blue", "Light Blue", "Teal" ],
      "8": [ "Blue", "Light Blue", "Teal" ],
      "9": [ "Light Green", "Green", "Teal" ],
      "10": [ "Light Green", "Green", "Teal", "Lime", "Amber" ],
      "11": [ "Lime", "Amber", "Orange", "Pink" ],
      "12": [ "Lime", "Amber", "Orange", "Pink" ],
      "13": [ "Lime", "Amber", "Orange", "Pink" ],
      "14": [ "Pink", "Light Blue", "Cyan", "Purple" ],
      "15": [ "Light Green", "Orange", "Cyan", "Purple", "Deep Purple" ],
      "16": [ "Purple", "Amber", "Light Green", "Orange", "Deep Purple" ],
      "17": [ "Pink", "Purple", "Blue", "Teal", "Amber", "Orange", "Cyan" ],
      "18": [ "Pink", "Purple", "Teal", "Deep Purple", "Light Green", "Orange", "Cyan" ],
      "19": [ "Pink", "Purple", "Teal", "Deep Purple", "Light Green", "Orange" ],
      "20": [ "Purple", "Teal", "Deep Purple", "Light Green", "Orange" ]
    };
    var timeBrightnessMappings = {
      "21": [ "800", "900" ],
      "22": [ "800", "900" ],
      "23": [ "800", "900" ],
      "0": [ "800", "900" ],
      "1": [ "800", "900" ],
      "2": [ "800", "900" ],
      "3": [ "800", "900" ],
      "4": [ "800", "900" ],
      "5": [ "800", "900" ],
      "6": [ "800", "900" ],
      "7": [ "800", "900" ],
      "8": [ "800", "900" ],
      "9": [ "500", "600", "700" ],
      "10": [ "500", "600", "700" ],
      "11": [ "400", "500", "600" ],
      "12": [ "400", "500", "600" ],
      "13": [ "400", "500", "600" ],
      "14": [ "400", "500", "600" ],
      "15": [ "400", "500", "600" ],
      "16": [ "400", "500" ],
      "17": [ "400", "500", "600", "700" ],
      "18": [ "500", "600", "700" ],
      "19": [ "500", "600", "700" ],
      "20": [ "600", "700", "800" ]
    };

    // I'm way too lazy to write this more... understandable.
    var colorHour = timeNow.getHours()+"";
    var chosenColor = timeColorMappings[colorHour][Math.floor(Math.random() * timeColorMappings[colorHour].length)];
    var chosenBrightness = timeBrightnessMappings[colorHour][Math.floor(Math.random() * timeBrightnessMappings[colorHour].length)];

    return palette.get(chosenColor, chosenBrightness);
  }

  var stage = new createjs.Stage(canvasId);
  var shadow = new createjs.Shadow("rgba(0, 0, 0, 0.5)", 0, 0, 10);

  var numbers = {
    "0": function zero(inPosition) {
      var circle = new createjs.Shape();
      circle.graphics.beginFill(colorDigits[inPosition+""].curr[0]);
      circle.graphics.drawCircle(50, 150, 50);
      circle.shadow = shadow;

      return [ circle ];
    },
    "1": function one(inPosition) {
      var bar = new createjs.Shape();
      bar.shadow = shadow;
      bar.graphics.beginFill(colorDigits[inPosition+""].curr[0]).drawRect(50, 0, 50, 200);
      return [ bar ];
    },
    "2": function two(inPosition) {
      var triangle = new createjs.Shape();
      triangle.graphics.beginFill(colorDigits[inPosition+""].curr[1]);
      triangle.graphics.moveTo(0, 200).lineTo(100, 200).lineTo(100, 80).closePath();
      triangle.shadow = shadow;

      var halfcircle = new createjs.Shape();
      halfcircle.graphics.beginFill(colorDigits[inPosition+""].curr[0]);
      halfcircle.graphics.arc(50, 50, 50, Math.PI*0.35, Math.PI*1.05, true).closePath();
      halfcircle.shadow = shadow;

      return [ halfcircle, triangle ];
    },
    "3": function three(inPosition) {
      var half1 = new createjs.Shape();
      half1.graphics.beginFill(colorDigits[inPosition+""].curr[0]);
      half1.graphics.arc(50, 50, 50, Math.PI*1.35, Math.PI*0.65).closePath();
      half1.shadow = shadow;

      var half2 = new createjs.Shape();
      half2.graphics.beginFill(colorDigits[inPosition+""].curr[1]);
      half2.graphics.arc(50, 150, 50, Math.PI*1.35, Math.PI*0.65).closePath();
      half2.shadow = shadow;

      return [ half2, half1 ];
    },
    "4": function four(inPosition) {
      var triangle = new createjs.Shape();
      triangle.graphics.beginFill(colorDigits[inPosition+""].curr[0]);
      triangle.graphics.moveTo(5, 140).lineTo(95, 140).lineTo(95, 0).closePath();
      triangle.shadow = shadow;

      var bar = new createjs.Shape();
      bar.shadow = shadow;
      bar.graphics.beginFill(colorDigits[inPosition+""].curr[1]).drawRect(45, 150, 50, 50);

      return [ triangle, bar ];
    },
    "5": function six(inPosition) {
      var bar = new createjs.Shape();
      bar.shadow = shadow;
      bar.graphics.beginFill(colorDigits[inPosition+""].curr[0]).drawRect(0, 0, 100, 50);

      var circle = new createjs.Shape();
      circle.graphics.beginFill(colorDigits[inPosition+""].curr[1]);
      circle.graphics.drawCircle(50, 150, 50);
      circle.shadow = shadow;

      return [ bar, circle ];
    },
    "6": function six(inPosition) {
      var bar = new createjs.Shape();
      bar.shadow = shadow;
      bar.graphics.beginFill(colorDigits[inPosition+""].curr[0]).drawRect(0, 0, 50, 90);

      var circle = new createjs.Shape();
      circle.graphics.beginFill(colorDigits[inPosition+""].curr[1]);
      circle.graphics.drawCircle(50, 150, 50);
      circle.shadow = shadow;

      return [ bar, circle ];
    },
    "7": function seven(inPosition) {
      var triangle = new createjs.Shape();
      triangle.graphics.beginFill(colorDigits[inPosition+""].curr[1]);
      triangle.graphics.moveTo(100, 0).lineTo(100, 200).lineTo(0, 200).closePath();
      triangle.shadow = shadow;

      var bar = new createjs.Shape();
      bar.shadow = shadow;
      bar.graphics.beginFill(colorDigits[inPosition+""].curr[0]).drawRect(0, 0, 60, 50);

      return [ bar, triangle ];
    },
    "8": function eight(inPosition) {
      var c1 = new createjs.Shape();
      c1.graphics.beginFill(colorDigits[inPosition+""].curr[0]);
      c1.graphics.drawCircle(50, 50, 50);
      c1.shadow = shadow;

      var c2 = new createjs.Shape();
      c2.graphics.beginFill(colorDigits[inPosition+""].curr[1]);
      c2.graphics.drawCircle(50, 150, 50);
      c2.shadow = shadow;

      return [ c1, c2 ];
    },
    "9": function nine(inPosition) {
      var bar = new createjs.Shape();
      bar.shadow = shadow;
      bar.graphics.beginFill(colorDigits[inPosition+""].curr[1]).drawRect(50, 110, 50, 90);

      var circle = new createjs.Shape();
      circle.graphics.beginFill(colorDigits[inPosition+""].curr[0]);
      circle.graphics.drawCircle(50, 50, 50);
      circle.shadow = shadow;

      return [ circle, bar ];
    }
  };

  function drawInPosition(position, obj) {
    obj(position).forEach(subobj => {
      subobj.x += positions[position].left;
      subobj.y += positions[position].top;
      stage.addChild(subobj)
    });
  }


  function remainingTime() {
    var now = new Date();
    var diff = now.getTime() - countTo.getTime();
    var seconds = Math.floor(Math.abs(diff / 1000));

    var days = Math.floor(seconds/24/60/60);
    var hoursLeft = Math.floor(seconds - (days*86400));
    var hours = Math.floor(hoursLeft/3600);
    var minutesLeft = Math.floor(hoursLeft - (hours*3600));
    var minutes = Math.floor(minutesLeft/60);
    var remainingSeconds = seconds % 60;

    return {
      h: hours,
      m: minutes,
      s: remainingSeconds
    };
  }

  function drawHours(hours) {
    var hdigits = hours + "";
    if (hdigits.length < 2) {
      // don't draw leading zero in hours
      drawInPosition(1, numbers[hdigits[0]]);
    } else {
      drawInPosition(0, numbers[hdigits[0]]);
      drawInPosition(1, numbers[hdigits[1]]);
    }
  }

  function drawMinutes(mins) {
    var mdigits = mins + "";
    if (mdigits.length < 2) {
      drawInPosition(2, numbers["0"]);
      drawInPosition(3, numbers[mdigits[0]]);
    } else {
      drawInPosition(2, numbers[mdigits[0]]);
      drawInPosition(3, numbers[mdigits[1]]);
    }
  }

  function drawSeconds(secs) {
    var sdigits = secs + "";
    if (sdigits.length < 2) {
      drawInPosition(4, numbers["0"]);
      drawInPosition(5, numbers[sdigits[0]]);
    } else {
      drawInPosition(4, numbers[sdigits[0]]);
      drawInPosition(5, numbers[sdigits[1]]);
    }
  }

  //createjs.Tween.get(circle, { loop: true })
  //  .to({ x: 400 }, 1000, createjs.Ease.getPowInOut(4));
  //

  var pauseCheck = true;

  function drawTime(e) {
    if (!e.paused) {
      easeColors();
      var time = remainingTime();
      stage.removeAllChildren();
      drawHours(time.h);
      drawMinutes(time.m);
      drawSeconds(time.s);
      stage.update();
      if ((new Date()).getTime() >= countTo.getTime() && pauseCheck) {
        createjs.Ticker.setPaused(true);
      }
    }
  }

  createjs.Ticker.setFPS(1);
  createjs.Ticker.addEventListener("tick", drawTime);

  window.resumeTimer = function () {
    pauseCheck = false;
    createjs.Ticker.setPaused(false);
  }

  window.stopTimer = function () {
    createjs.Ticker.setPaused(true);
  }

  window.setZero = function () {
    stage.removeAllChildren();
    drawHours(0);
    drawMinutes(0);
    drawSeconds(0);
    stage.update();
  }

  window.setNewStop = function(day, hour, min) {
    countTo = new Date(2016, 4, day, hour, min, 0, 0);
    pauseCheck = true;
    createjs.Ticker.setPaused(false);
  }

}(window));
