var quizDelim = $("#quiz-delimeter"),
    conditionInput = $("#condition"),
    questionOrder = $("#question-order"),
    questionResults = $("#question-results"),
    questionBonuses = $("#question-bonuses"),
    questionIntents = $("#question-intents"),
    reportCorrect = $("#report-correct"),
    reportPossible = $("#report-possible"),
    reportBonus = $("#report-bonus"),
    retestString = "-retest",
    
    // Main Quiz Object
    Quiz = {
      startIndex: 3,
      pageIndex: 3,
      activeQuestion: 0,
      condition: 2, // Math.floor(Math.random() * 4),
      questions: [
        {
          target: "accelerate",
          options: [{w: "speed", s: 0.386}, {w: "fast", s: 0.271}, {w: "gas", s: 0.029}]
        },
        {
          target: "bargain",
          options: [{w: "sale", s: 0.371}, {w: "deal", s: 0.159}, {w: "basement", s: 0.032}]
        },
        {
          target: "cow",
          options: [{w: "milk", s: 0.352}, {w: "calf", s: 0.194}, {w: "pasture", s: 0.042}]
        },
        {
          target: "dig",
          options: [{w: "shovel", s: 0.320}, {w: "hole", s: 0.186}, {w: "grave", s: 0.031}]
        },
        {
          target: "extinct",
          options: [{w: "dinosaur", s: 0.320}, {w: "gone", s: 0.233}, {w: "animal", s: 0.033}]
        },
        {
          target: "frost",
          options: [{w: "cold", s: 0.370}, {w: "snow", s: 0.255}, {w: "jack", s: 0.036}]
        },
        {
          target: "galoshes",
          options: [{w: "rain", s: 0.307}, {w: "boots", s: 0.244}, {w: "mud", s: 0.024}]
        },
        {
          target: "hoop",
          options: [{w: "hula", s: 0.392}, {w: "basketball", s: 0.173}, {w: "earring", s: 0.039}]
        },
        {
          target: "injection",
          options: [{w: "needle", s: 0.331}, {w: "shot", s: 0.257}, {w: "drug", s: 0.047}]
        },
        {
          target: "juggler",
          options: [{w: "circus", s: 0.362}, {w: "ball", s: 0.165}, {w: "act", s: 0.039}]
        },
        {
          target: "keyboard",
          options: [{w: "piano", s: 0.355}, {w: "computer", s: 0.217}, {w: "play", s: 0.033}]
        },
        {
          target: "lawn",
          options: [{w: "grass", s: 0.397}, {w: "mower", s: 0.185}, {w: "cut", s: 0.038}]
        },
        {
          target: "moron",
          options: [{w: "idiot", s: 0.331}, {w: "stupid", s: 0.221}, {w: "jerk", s: 0.039}]
        },
        {
          target: "nucleus",
          options: [{w: "atom", s: 0.316}, {w: "center", s: 0.237}, {w: "science", s: 0.053}]
        },
        {
          target: "outcome",
          options: [{w: "end", s: 0.310}, {w: "result", s: 0.228}, {w: "future", s: 0.021}]
        },
        {
          target: "peer",
          options: [{w: "friend", s: 0.325}, {w: "pressure", s: 0.195}, {w: "group", s: 0.039}]
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
          target: "scold",
          options: [{w: "yell", s: 0.320}, {w: "punish", s: 0.190}, {w: "anger", s: 0.020}]
        },
        {
          target: "task",
          options: [{w: "job", s: 0.370}, {w: "work", s: 0.212}, {w: "duty", s: 0.055}]
        },
        {
          target: "universe",
          options: [{w: "world", s: 0.385}, {w: "planet", s: 0.176}, {w: "everything", s: 0.014}]
        },
        {
          target: "virus",
          options: [{w: "sick", s: 0.351}, {w: "cold", s: 0.192}, {w: "germ", s: 0.026}]
        },
        {
          target: "when",
          options: [{w: "where", s: 0.401}, {w: "now", s: 0.217}, {w: "how", s: 0.046}]
        },
        {
          target: "yummy",
          options: [{w: "good", s: 0.340}, {w: "food", s: 0.207}, {w: "sweet", s: 0.020}]
        },
        {
          target: "zero",
          options: [{w: "none", s: 0.338}, {w: "nothing", s: 0.209}, {w: "number", s: 0.065}]
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
      var qOrderString = "";
      Quiz.questions.shuffle();
      for (var q of Quiz.questions) {
        q.id = q.target;
        for (var op of q.options) {
          q.id += "_" + op.w;
        }
        Quiz.qmap[q.id] = q;
        qOrderString += q.id + ",";
      }
      questionOrder.val(qOrderString);
      conditionInput.val(Quiz.condition);
    },
    
    renderQuiz = function (idAdd) {
      for (var q of Quiz.questions) {
        var opOrder = [0, 1, 2].shuffle();
        
        // Add each question
        quizDelim.after(
          "<div class='page' id='" + Quiz.pageIndex++ + "' style='display: none;'>" +
            "<div class='cell'>" +
              "<table class='table'>" +
                "<tbody>" +
                  "<tr class='alert alert-warning'>" +
                    "<td colspan=2><h3>Question: " + (Quiz.pageIndex - Quiz.startIndex) + " / " + (2*Quiz.questions.length) + "</h3></td>" +
                    "<td class='text-right'><span class='glyphicon glyphicon-time'></span>&nbsp;&nbsp;<h3 class='ilb' id='" + q.id + "_timer" + idAdd + "'>" + Quiz.timer.startTime + "</h3></td>" +
                  "</tr>" +
                  "<tr>" +
                    "<td colspan=3 class='text-center'><h1 class='text-center'>" + q.target + "</h1></td>" +
                  "</tr>" +
                  "<tr class='text-center'>" +
                    "<td colspan=3>" +
                      "<div class='radio'><label><input name='" + q.id + "_ans" + idAdd + "' type='radio' value='" + q.options[opOrder[0]].w + "' />" + q.options[opOrder[0]].w + "</label></div>" +
                      "<div class='radio'><label><input name='" + q.id + "_ans" + idAdd + "' type='radio' value='" + q.options[opOrder[1]].w + "' />" + q.options[opOrder[1]].w + "</label></div>" +
                      "<div class='radio'><label><input name='" + q.id + "_ans" + idAdd + "' type='radio' value='" + q.options[opOrder[2]].w + "' />" + q.options[opOrder[2]].w + "</label></div>" +
                    "</td>" +
                  "</tr>" +
                "</tbody>" +
              "</table>" +
              "<input id='" + q.id + "_result" + idAdd + "' type='text' disabled='true' style='display: none' />" +
              "<div class='text-center'><input id='" + q.id + "_next" + idAdd + "' style='display: none' disabled='true' onclick='next();' type='button' value='Continue' /></div>" +
            "</div>" +
          "</div>"
        );
        
        // Add event handlers
        (function (id, idAdd) {
          $("[name='" + id + "_ans" + idAdd + "']").click(function (event) {
            var val = $(this).val(),
                result,
                resultText,
                resultCSS,
                resultBit,
                bonusBit = "0",
                intentBit;
                
            event.stopPropagation();
            $("[name='" + id + "_ans" + idAdd + "']")
              .unbind("click")
              .attr("disabled", true);
              
            // Stop timer
            clearInterval(Quiz.timer.active);
            
            // Mark as correct or incorrect
            result = val === Quiz.qmap[id].options[Quiz.condition].w;
            if (result) {
              resultText = "Correct!";
              resultCSS  = "alert alert-success";
              resultBit  = "1";
              bonusBit   = (Quiz.timer.expired) ? "0" : "1";
            } else {
              resultText = "Incorrect";
              resultCSS  = "alert alert-danger";
              resultBit  = "0";
            }
            intentBit  = (val === Quiz.qmap[id].options[0].w) ? "1" : "0";
            
            $("#" + id + "_next" + idAdd)
              .show()
              .attr("disabled", false)
              .before("<p class='" + resultCSS + "'>" + resultText + "</p>");
            $("#" + id + "_result").val(result);
            questionResults.val(questionResults.val() + resultBit);
            questionBonuses.val(questionBonuses.val() + bonusBit);
            questionIntents.val(questionIntents.val() + intentBit);
          });
        })(q.id, idAdd);
      }
    },
    
    nextQuestion = function () {
      var effectiveActive = Quiz.activeQuestion % Quiz.questions.length,
          currentQuestion = Quiz.questions[effectiveActive],
          currentId = currentQuestion.id,
          idAdd = (Quiz.activeQuestion > Quiz.questions.length) ? retestString : "";
      
      startTimer(currentId, idAdd);
      Quiz.activeQuestion++;
      completeQuiz();
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
      $("#" + id + "_timer" + idAdd).text(timerText);
    },
    
    completeQuiz = function () {
      var correct  = questionResults.val().split("1").length,
          bonus    = questionBonuses.val().split("1").length,
          possible = Quiz.questions.length * 2;
      
      reportCorrect.text(correct);
      reportPossible.text(possible);
      reportBonus.text(bonus);
      Quiz.completed = true;
    };
    

// Main Workflow:
prepQuiz();
renderQuiz("");           // 1st test
renderQuiz(retestString); // 2nd test

// Finish quiz id naming
$("#dec-question").attr("id", Quiz.pageIndex++);
$("#dem-question").attr("id", Quiz.pageIndex++);
$("#sub-question").attr("id", Quiz.pageIndex++);
