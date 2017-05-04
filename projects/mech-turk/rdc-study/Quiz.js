var quizDelim = $("#quiz-delimeter"),
    conditionInput = $(), // TODO
    Quiz = {
      pageIndex: 3,
      condition: Math.floor(Math.random() * 4),
      questions: [
        {
          target: "test",
          options: [{w: "t1", s: 25}, {w: "t2", s: 20}, {w: "t3", s: 10}, {w: "t4", s: 5}]
        },
        {
          target: "test2",
          options: [{w: "t1", s: 25}, {w: "t2", s: 20}, {w: "t3", s: 10}, {w: "t4", s: 5}]
        }
      ]      
    },
    
    prepQuiz = function () {
      for (var q in Quiz.questions) {
        q.id = q.target;
        for (var op in q.options) {
          q.id += "_" + op.w;
        }
      }
    },
    
    renderQuiz = function () {
      for (var q of Quiz.questions) {
        console.log(q);
        var opOrder = [0, 1, 2, 3].shuffle();
        quizDelim.after(
          "<div class='page' id='" + Quiz.pageIndex++ + "' style='display: none;'>" +
            "<div class='cell'>" +
              "<h1 class='text-center'>" + q.target + "</h1>" +
              "<br/>" +
              (function () {
                var result = "";
                for (var op of opOrder) {
                  var ans = q.options[op].w;
                  result += "<div class='radio'><label><input name='" + q.id + "_ans' type='radio' value='" + ans + "' />" + ans + "</label></div>";
                }
                return result;
              })() +
              "<input onclick='next();' type='button' value='Continue' />" +
            "</div>" +
          "</div>"
        );
      }
    };
    

// Main Workflow:
prepQuiz();
renderQuiz();
