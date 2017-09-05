var quizDelim = $("#quiz-delimeter"),
    quizStart = $("#quiz-start"),
    quizLoad = $("#quiz-loading"),
    conditionInput = $("#condition"),
    questionOrder = $("#question-order"),
    questionResults = $("#question-results"),
    questionResultsTally = $("#question-results-tally"),
    questionResultsNum = 0,
    questionBonuses = $("#question-bonuses"),
    questionBonusesNum = 0,
    questionBonusesTally = $("#question-bonuses-tally"),
    questionIntents = $("#question-intents"),
    reportCorrect = $("#report-correct"),
    reportPossible = $("#report-possible"),
    reportBonus = $("#report-bonus"),
    ruleList = $("#rule-list"),
    progressTracker = $("#progress-tracker"),
    retestString = "-retest",
    masterTimer = 0,
    masterTimerRec = $("#master-timer"),
    
    // Main Quiz Object
    Quiz = {
      startIndex: 3,
      pageIndex: 3,
      activeQuestion: 0,
      cIndex: 2,
      condition: Math.floor(Math.random() * 2),
      questions: [
        {
          target: "accelerate",
          options: [{w: "speed", s: 0.386}, {w: "fast", s: 0.271}, {w: "gas", s: 0.029}]
        },
        {
          target: "adjective",
          options: [{w: "noun", s: 0.333}, {w: "verb", s: 0.181}, {w: "English", s: 0.043}]
        },
        {
          target: "bell",
          options: [{w: "ring", s: 0.399}, {w: "xxx", s: 0.159}, {w: "school", s: 0.041}]
        },
        {
          target: "bandage",
          options: [{w: "cut", s: 0.331}, {w: "wound", s: 0.188}, {w: "hurt", s: 0.071}]
        },
        {
          target: "cow",
          options: [{w: "milk", s: 0.352}, {w: "calf", s: 0.194}, {w: "pasture", s: 0.042}]
        },
        {
          target: "chair",
          options: [{w: "table", s: 0.314}, {w: "sit", s: 0.212}, {w: "sofa", s: 0.077}]
        },
        {
          target: "dig",
          options: [{w: "shovel", s: 0.320}, {w: "hole", s: 0.186}, {w: "grave", s: 0.031}]
        },
        {
          target: "dart",
          options: [{w: "board", s: 0.358}, {w: "game", s: 0.169}, {w: "throw", s: 0.081}]
        },
        {
          target: "extinct",
          options: [{w: "dinosaur", s: 0.320}, {w: "gone", s: 0.233}, {w: "animal", s: 0.033}]
        },
        {
          target: "enrage",
          options: [{w: "mad", s: 0.304}, {w: "angry", s: 0.135}, {w: "temper", s: 0.014}]
        },
        {
          target: "frost",
          options: [{w: "cold", s: 0.370}, {w: "snow", s: 0.255}, {w: "jack", s: 0.036}]
        },
        {
          target: "fur",
          options: [{w: "coat", s: 0.324}, {w: "xxx", s: 0.228}, {w: "warm", s: 0.047}]
        },
        {
          target: "gain",
          options: [{w: "weight", s: 0.260}, {w: "xxx", s: 0.244}, {w: "acquire", s: 0.016}]
        },
        {
          target: "glue",
          options: [{w: "sticky", s: 0.371}, {w: "xxx", s: 0.245}, {w: "paper", s: 0.053}]
        },
        {
          target: "hoop",
          options: [{w: "hula", s: 0.392}, {w: "basketball", s: 0.173}, {w: "earring", s: 0.039}]
        },
        {
          target: "hand",
          options: [{w: "finger", s: 0.358}, {w: "foot", s: 0.158}, {w: "glove", s: 0.048}]
        },
        {
          target: "injection",
          options: [{w: "needle", s: 0.331}, {w: "shot", s: 0.257}, {w: "drug", s: 0.047}]
        },
        {
          target: "imagine",
          options: [{w: "dream", s: 0.336}, {w: "think", s: 0.164}, {w: "fantasy", s: 0.075}]
        },
        {
          target: "juggler",
          options: [{w: "circus", s: 0.362}, {w: "ball", s: 0.165}, {w: "act", s: 0.039}]
        },
        {
          target: "jazz",
          options: [{w: "music", s: 0.367}, {w: "dance", s: 0.163}, {w: "blues", s: 0.048}]
        },
        {
          target: "keyboard",
          options: [{w: "piano", s: 0.355}, {w: "computer", s: 0.217}, {w: "play", s: 0.033}]
        },
        {
          target: "knife",
          options: [{w: "fork", s: 0.327}, {w: "cut", s: 0.179}, {w: "spoon", s: 0.051}]
        },
        {
          target: "lobby",
          options: [{w: "hotel", s: 0.345}, {w: "xxx", s: 0.185}, {w: "lounge", s: 0.034}]
        },
        {
          target: "lung",
          options: [{w: "breathe", s: 0.362}, {w: "cancer", s: 0.150}, {w: "smoke", s: 0.057}]
        },
        {
          target: "mortgage",
          options: [{w: "house", s: 0.349}, {w: "payment", s: 0.221}, {w: "bill", s: 0.024}]
        },
        {
          target: "mansion",
          options: [{w: "house", s: 0.326}, {w: "rich", s: 0.167}, {w: "huge", s: 0.036}]
        },
        {
          target: "nucleus",
          options: [{w: "atom", s: 0.316}, {w: "center", s: 0.237}, {w: "science", s: 0.053}]
        },
        {
          target: "noise",
          options: [{w: "loud", s: 0.340}, {w: "sound", s: 0.147}, {w: "ear", s: 0.058}]
        },
        {
          target: "outcome",
          options: [{w: "end", s: 0.310}, {w: "result", s: 0.228}, {w: "future", s: 0.021}]
        },
        {
          target: "orchestra",
          options: [{w: "music", s: 0.309}, {w: "band", s: 0.175}, {w: "conductor", s: 0.052}]
        },
        {
          target: "peer",
          options: [{w: "friend", s: 0.325}, {w: "pressure", s: 0.195}, {w: "group", s: 0.039}]
        },
        {
          target: "picture",
          options: [{w: "frame", s: 0.316}, {w: "xxx", s: 0.236}, {w: "camera", s: 0.051}]
        },
        {
          target: "quantity",
          options: [{w: "amount", s: 0.379}, {w: "quality", s: 0.229}, {w: "many", s: 0.043}]
        },
        {
          target: "roof",
          options: [{w: "house", s: 0.307}, {w: "top", s: 0.197}, {w: "tar", s: 0.024}]
        },
        {
          target: "ray",
          options: [{w: "sun", s: 0.362}, {w: "xxx", s: 0.197}, {w: "beam", s: 0.047}]
        },
        {
          target: "scold",
          options: [{w: "yell", s: 0.320}, {w: "punish", s: 0.190}, {w: "anger", s: 0.020}]
        },
        {
          target: "scheme",
          options: [{w: "plan", s: 0.392}, {w: "xxx", s: 0.205}, {w: "sneaky", s: 0.028}]
        },
        {
          target: "sailing",
          options: [{w: "boat", s: 0.359}, {w: "water", s: 0.148}, {w: "swim", s: 0.021}]
        },
        {
          target: "task",
          options: [{w: "job", s: 0.370}, {w: "work", s: 0.212}, {w: "duty", s: 0.055}]
        },
        {
          target: "thief",
          options: [{w: "steal", s: 0.388}, {w: "robber", s: 0.224}, {w: "crook", s: 0.091}]
        },
        {
          target: "universe",
          options: [{w: "world", s: 0.385}, {w: "planet", s: 0.176}, {w: "everything", s: 0.014}]
        },
        {
          target: "used",
          options: [{w: "old", s: 0.358}, {w: "car", s: 0.155}, {w: "worn", s: 0.061}]
        },
        {
          target: "virus",
          options: [{w: "sick", s: 0.351}, {w: "cold", s: 0.192}, {w: "germ", s: 0.026}]
        },
        {
          target: "visitor",
          options: [{w: "guest", s: 0.365}, {w: "friend", s: 0.189}, {w: "relative", s: 0.061}]
        },
        {
          target: "wrist",
          options: [{w: "watch", s: 0.345}, {w: "xxx", s: 0.217}, {w: "bracelet", s: 0.061}]
        },
        {
          target: "weird",
          options: [{w: "strange", s: 0.312}, {w: "crazy", s: 0.132}, {w: "normal", s: 0.049}]
        },
        {
          target: "yummy",
          options: [{w: "good", s: 0.340}, {w: "food", s: 0.207}, {w: "sweet", s: 0.020}]
        },
        {
          target: "year",
          options: [{w: "month", s: 0.321}, {w: "day", s: 0.122}, {w: "annual", s: 0.045}]
        },
        {
          target: "zero",
          options: [{w: "none", s: 0.338}, {w: "nothing", s: 0.209}, {w: "number", s: 0.065}]
        },
        {
          target: "zucchini",
          options: [{w: "vegetable", s: 0.331}, {w: "green", s: 0.149}, {w: "broccoli", s: 0.034}]
        }
      ],
      qmap: {},
      timer: {
        startTime: 30, // s
        currentTime: 30,
        expired: false,
        active: null
      },
      completed: false
    },
    
    prepQuiz = function () {
      var qOrderString = "",
          boxWidth = 100 / Quiz.questions.length;
      boxWidth = boxWidth.toPrecision(2);
      
      Quiz.questions.shuffle();
      for (var q of Quiz.questions) {
        q.id = q.target;
        var limitedOps = [q.options[0], q.options[2]];
        for (var op of limitedOps) {
          q.id += "_" + op.w;
        }
        Quiz.qmap[q.id] = q;
        qOrderString += q.id + ",";
        
        // Prep progress tracker
        progressTracker.append("<span class='progress-block' id='" + q.id  + "-progress-block' style='width:" + boxWidth + "%;'></span>");
      }
      questionOrder.val(qOrderString);
      conditionInput.val(Quiz.condition);
    },
    
    renderQuiz = function (idAdd) {
      for (var q of Quiz.questions) {
        // var opOrder = [0, 1, 2].shuffle();
        var opOrder = [0, 2].shuffle();
        
        // Add each question
        quizDelim.after(
          "<div class='page' id='" + Quiz.pageIndex++ + "' style='display: none;'>" +
            "<div class='cell'>" +
              "<table class='table'>" +
                "<tbody>" +
                  "<tr class='alert alert-warning'>" +
                    "<td colspan=2><h3>Question: " + (Quiz.pageIndex - Quiz.startIndex) + " / " + (Quiz.questions.length) + "</h3></td>" +
                    "<td class='text-right'><span class='glyphicon glyphicon-time'></span>&nbsp;&nbsp;<h3 class='ilb' id='" + q.id + "_timer" + idAdd + "'>" + Quiz.timer.startTime + "</h3></td>" +
                  "</tr>" +
                  "<tr><td id='" + q.id + "-progress' class='progress-holder text-center' colspan=3></td></tr>" +
                  "<tr>" +
                    "<td colspan=3 class='text-center'><h1 class='text-center'>" + q.target + "</h1></td>" +
                  "</tr>" +
                  "<tr class='text-center'>" +
                    "<td colspan=3>" +
                      "<input id='" + q.id + "_reveal' type='button' value='Reveal Answer Choices' />" +
                      "<div class='radio " + q.id + "_choices' style='display:none;'><label><input name='" + q.id + "_ans" + idAdd + "' type='radio' value='" + q.options[opOrder[0]].w + "' />" + q.options[opOrder[0]].w + "</label></div>" +
                      "<div class='radio " + q.id + "_choices' style='display:none;'><label><input name='" + q.id + "_ans" + idAdd + "' type='radio' value='" + q.options[opOrder[1]].w + "' />" + q.options[opOrder[1]].w + "</label></div>" +
                      // "<div class='radio'><label><input name='" + q.id + "_ans" + idAdd + "' type='radio' value='" + q.options[opOrder[2]].w + "' />" + q.options[opOrder[2]].w + "</label></div>" +
                    "</td>" +
                  "</tr>" +
                "</tbody>" +
              "</table>" +
              "<input id='" + q.id + "_result" + idAdd + "' type='text' disabled='true' style='display: none' />" +
              "<div class='text-center'><input id='" + q.id + "_next" + idAdd + "' style='display: none' disabled='true' onclick='next();' type='button' value='Continue' /></div>" +
              ((Quiz.condition) ? "<br/><p id='" + q.id + "-hint' class='alert alert-info' style='display:none;'><b>HINT:</b> the hidden rule relates to which answer choice you <i>feel</i> like choosing first. Take this into consideration before making your final choice!</p>" : "") +
            "</div>" +
          "</div>"
        );
        
        // Add event handlers
        (function (id, idAdd) {
          // Setup reveal buttons
          $("#" + id + "_reveal")
            .click(function () {
              $(this).hide();
              $("." + id + "_choices").show();
            });
          
          // Setup choice buttons
          $("[name='" + id + "_ans" + idAdd + "']").click(function (event) {
            var val = $(this).val(),
                result,
                resultText,
                resultCSS,
                resultBit,
                bonusBit = "0",
                intentBit,
                currentTracker = $("#" + id + "-progress-block");
                
            event.stopPropagation();
            $("[name='" + id + "_ans" + idAdd + "']")
              .unbind("click")
              .attr("disabled", true);
              
            // Stop timer
            clearInterval(Quiz.timer.active);
            
            // Mark as correct or incorrect
            result = val === Quiz.qmap[id].options[Quiz.cIndex].w;
            if (result) {
              resultText = "Correct!";
              resultCSS  = "alert alert-success";
              resultBit  = "1";
              bonusBit   = (Quiz.timer.expired) ? "0" : "1";
              currentTracker.addClass("alert-success");
            } else {
              resultText = "Incorrect";
              resultCSS  = "alert alert-danger";
              resultBit  = "0";
              currentTracker.addClass("alert-danger");
            }
            intentBit  = (val === Quiz.qmap[id].options[0].w) ? "1" : "0";
            
            if (Quiz.condition) {
              $("#" + id + "-hint").show();
            }
            
            $("#" + id + "_next" + idAdd)
              .show()
              .attr("disabled", false)
              .before("<p class='" + resultCSS + "'>" + resultText + "</p>");
            $("#" + id + "_result").val(result);
            questionResults.val(questionResults.val() + resultBit);
            questionBonuses.val(questionBonuses.val() + bonusBit);
            questionIntents.val(questionIntents.val() + intentBit);
            questionResultsNum += parseInt(resultBit);
            questionBonusesNum += parseInt(bonusBit);
          });
        })(q.id, idAdd);
      }
      
      if (Quiz.condition) {
        ruleList.after(
          "<p class='alert alert-info'><b>HINT:</b> the hidden rule relates to which answer choice you <i>feel</i> like choosing first. Take this into consideration before making your final choice!</p>"
        );
      }
      
      // Setup first progress tracker
      moveProgressTracker($("#" + Quiz.questions[0].id + "-progress"));
      progressTracker.show();
      
      // Finished loading quiz, ready to start!
      quizLoad.hide();
      quizStart.show();
    },
    
    nextQuestion = function () {
      var effectiveActive = Quiz.activeQuestion % Quiz.questions.length,
          currentQuestion = Quiz.questions[effectiveActive],
          currentId = currentQuestion.id,
          idAdd = (Quiz.activeQuestion > Quiz.questions.length) ? retestString : "";
      
      startTimer(currentId, idAdd);
      Quiz.activeQuestion++;
      moveProgressTracker($("#" + Quiz.questions[effectiveActive].id + "-progress"));
      if (Quiz.activeQuestion === Quiz.questions.length) {
        completeQuiz();
      }
    },
    
    moveProgressTracker = function (moveTo) {
      progressTracker.appendTo(moveTo);
      progressTracker = $("#progress-tracker");
    },
    
    startTimer = function (id, idAdd) {
      var currentTimer = $("#" + id + "_timer" + idAdd);
      Quiz.timer.currentTime = Quiz.timer.startTime;
      Quiz.timer.expired = false;
      Quiz.timer.active = setInterval(function () {
        tickTimer(id, idAdd);
      }, 1000);
    },
    
    tickTimer = function (id, idAdd) {
      Quiz.timer.currentTime--;
      var timerText = Quiz.timer.currentTime;
      if (Quiz.timer.currentTime <= 0) {
        Quiz.timer.expired = true;
        clearInterval(Quiz.timer.active);
        timerText = "Out of Time!";
      }
      masterTimer++;
      $("#" + id + "_timer" + idAdd).text(timerText);
    },
    
    completeQuiz = function () {
      reportCorrect.text(questionResultsNum);
      questionResultsTally.val(questionResultsNum);
      reportPossible.text(Quiz.questions.length);
      reportBonus.text(questionBonusesNum);
      questionBonusesTally.val(questionBonusesNum);
      masterTimerRec.val(masterTimer);
      Quiz.completed = true;
    };
    

// Main Workflow:
prepQuiz();
renderQuiz("");

// Finish quiz id naming
$("#dec-question").attr("id", Quiz.pageIndex++);
$("#dem-question").attr("id", Quiz.pageIndex++);
$("#sub-question").attr("id", Quiz.pageIndex++);
