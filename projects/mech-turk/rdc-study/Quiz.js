var quizDelim = $("#quiz-delimeter"),
    conditionInput = $("#condition"),
    questionOrder = $("#question-order"),
    questionResults = $("#question-order"),
    questionBonuses = $("#question-bonuses"),
    
    // Main Quiz Object
    Quiz = {
      startIndex: 3,
      pageIndex: 3,
      activeQuestion: 0,
      condition: Math.floor(Math.random() * 4),
      questions: [
        {
          target: "test",
          options: [{w: "t1", s: 25}, {w: "t2asdf", s: 20}, {w: "t3", s: 10}, {w: "t4asf", s: 5}]
        },
        {
          target: "test2",
          options: [{w: "t1", s: 25}, {w: "t2", s: 20}, {w: "t3", s: 10}, {w: "t4", s: 5}]
        }
      ],
      qmap: {},
      timer: {
        startTime: 20, // s
        currentTime: 20,
        expired: false,
        active: null
      }
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
    
    renderQuiz = function () {
      for (var q of Quiz.questions) {
        var opOrder = [0, 1, 2, 3].shuffle();
        
        // Add each question
        quizDelim.after(
          "<div class='page' id='" + Quiz.pageIndex++ + "' style='display: none;'>" +
            "<div class='cell'>" +
              "<table class='table'>" +
                "<tbody>" +
                  "<tr class='alert alert-warning'>" +
                    "<td><h3>Question: " + (Quiz.pageIndex - Quiz.startIndex) + " / " + Quiz.questions.length + "</h3></td>" +
                    "<td class='text-right'><span class='glyphicon glyphicon-time'></span>&nbsp;&nbsp;<h3 class='ilb' id='" + q.id + "_timer'>" + Quiz.timer.startTime + "</h3></td>" +
                  "</tr>" +
                  "<tr>" +
                    "<td colspan=2 class='text-center'><h1 class='text-center'>" + q.target + "</h1></td>" +
                  "</tr>" +
                  "<tr>" +
                    "<td class='col-md-6 text-center'><div class='radio'><label><input name='" + q.id + "_ans' type='radio' value='" + q.options[opOrder[0]].w + "' />" + q.options[opOrder[0]].w + "</label></div></td>" +
                    "<td class='col-md-6 text-center'><div class='radio'><label><input name='" + q.id + "_ans' type='radio' value='" + q.options[opOrder[1]].w + "' />" + q.options[opOrder[1]].w + "</label></div></td>" +
                  "</tr>" +
                  "<tr>" +
                    "<td class='col-md-6 text-center'><div class='radio'><label><input name='" + q.id + "_ans' type='radio' value='" + q.options[opOrder[2]].w + "' />" + q.options[opOrder[2]].w + "</label></div></td>" +
                    "<td class='col-md-6 text-center'><div class='radio'><label><input name='" + q.id + "_ans' type='radio' value='" + q.options[opOrder[3]].w + "' />" + q.options[opOrder[3]].w + "</label></div></td>" +
                  "</tr>" +
                "</tbody>" +
              "</table>" +
              "<input id='" + q.id + "_result' type='text' disabled='true' style='display: none' />" +
              "<div class='text-center'><input id='" + q.id + "_next' style='display: none' disabled='true' onclick='next();' type='button' value='Continue' /></div>" +
            "</div>" +
          "</div>"
        );
        
        // Add event handlers
        (function (id) {
          $("[name='" + id + "_ans']").click(function (event) {
            var val = $(this).val(),
                qId = $(this).attr("name").split("_"),
                result,
                resultText,
                resultCSS,
                resultBit,
                bonusBit;
                
            event.stopPropagation();
            $("[name='" + id + "_ans']")
              .unbind("click")
              .attr("disabled", true);
              
            // Stop timer
            clearInterval(Quiz.timer.active);
            
            // Mark as correct or incorrect
            qId = qId.slice(0, qId.length - 1).join("_");
            result = val === Quiz.qmap[qId].options[Quiz.condition].w;
            if (result) {
              resultText = "Correct!";
              resultCSS  = "alert alert-success";
              resultBit  = "1";
              bonusBit   = (Quiz.timer.expired) ? 0 : 1;
            } else {
              resultText = "Incorrect";
              resultCSS  = "alert alert-danger";
              resultBit  = "0";
            }
            
            $("#" + id + "_next")
              .show()
              .attr("disabled", false)
              .before("<p class='" + resultCSS + "'>" + resultText + "</p>");
            $("#" + id + "_result").val(result);
            questionResults += resultBit;
            questionBonuses += bonusBit;
          });
        })(q.id);
      }
      
      // Finish quiz id naming
      $("#dec-question").attr("id", Quiz.pageIndex++);
      $("#dem-question").attr("id", Quiz.pageIndex++);
      $("#sub-question").attr("id", Quiz.pageIndex++);
    },
    
    nextQuestion = function () {
      var currentQuestion = Quiz.questions[Quiz.activeQuestion],
          currentId = currentQuestion.id;
      startTimer(currentId);
      Quiz.activeQuestion++;
    },
    
    startTimer = function (id) {
      console.log(id);
      var currentTimer = $("#" + id + "_timer");
      Quiz.timer.currentTime = Quiz.timer.startTime;
      Quiz.timer.expired = false;
      Quiz.timer.active = setInterval(function () {
        tickTimer(id);
      }, 1000);
    },
    
    tickTimer = function (id) {
      Quiz.timer.currentTime--;
      var timerText = Quiz.timer.currentTime;
      if (Quiz.timer.currentTime <= 0) {
        Quiz.timer.expired = true;
        clearInterval(Quiz.timer.active);
        timerText = "Out of Time!";
      }
      $("#" + id + "_timer").text(timerText);
    };
    

// Main Workflow:
prepQuiz();
renderQuiz();
console.log(Quiz.condition);
