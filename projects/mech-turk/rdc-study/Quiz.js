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
      ],
      qmap: {}
    },
    
    prepQuiz = function () {
      for (var q of Quiz.questions) {
        q.id = q.target;
        for (var op of q.options) {
          q.id += "_" + op.w;
        }
        Quiz.qmap[q.id] = q;
      }
    },
    
    renderQuiz = function () {
      for (var q of Quiz.questions) {
        var opOrder = [0, 1, 2, 3].shuffle();
        
        // Add each question
        quizDelim.after(
          "<div class='page' id='" + Quiz.pageIndex++ + "' style='display: none;'>" +
            "<div class='cell'>" +
              "<h1 class='text-center'>" + q.target + "</h1>" +
              "<br/>" +
              "<table class='table'>" +
                "<tbody>" +
                  "<tr>" +
                    "<td><div class='radio'><label><input name='" + q.id + "_ans' type='radio' value='" + q.options[opOrder[0]].w + "' />" + q.options[opOrder[0]].w + "</label></div></td>" +
                    "<td><div class='radio'><label><input name='" + q.id + "_ans' type='radio' value='" + q.options[opOrder[1]].w + "' />" + q.options[opOrder[1]].w + "</label></div></td>" +
                  "</tr>" +
                  "<tr>" +
                    "<td><div class='radio'><label><input name='" + q.id + "_ans' type='radio' value='" + q.options[opOrder[2]].w + "' />" + q.options[opOrder[2]].w + "</label></div></td>" +
                    "<td><div class='radio'><label><input name='" + q.id + "_ans' type='radio' value='" + q.options[opOrder[3]].w + "' />" + q.options[opOrder[3]].w + "</label></div></td>" +
                  "</tr>" +
                "</tbody>" +
              "</table>" +
              "<div class='text-center'><input id='" + q.id + "_next' style='display: none' disabled='true' onclick='next();' type='button' value='Continue' /></div>" +
            "</div>" +
          "</div>"
        );
        
        // Add event handlers
        (function (id) {
          $("[name='" + id + "_ans']").click(function (event) {
            event.stopPropagation();
            $("[name='" + id + "_ans']")
              .unbind("click")
              .attr("disabled", true);
            $("#" + id + "_next")
              .show()
              .attr("disabled", false);
            
            // Mark as correct or incorrect
            var val = $(this).val(),
                qId = $(this).attr("name").split("_");
            qId = qId.slice(0, qId.length - 1).join("_");
            
            if (val === Quiz.qmap[qId].options[Quiz.condition].w) {
              alert("correct!");
            } else {
              alert("incorrect");
            }
          });
        })(q.id);
      }
      
      // Finish quiz id naming
      $("#dec-question").attr("id", Quiz.pageIndex++);
      $("#dem-question").attr("id", Quiz.pageIndex++);
      $("#sub-question").attr("id", Quiz.pageIndex++);
    };
    

// Main Workflow:
prepQuiz();
renderQuiz();
console.log(Quiz.condition);
