$(function () {
  var constOptions = {
        bezierCurve: false,
        pointDot: false,
        datasetStrokeWidth: 10,
        scaleOverride: true,
        scaleSteps: 2,
        scaleStepWidth: 1,
        scaleStartValue: 0
      },
  
      options = {
        bezierCurve: false,
        pointDot: false
      },
  
      ctxConstant = $("#bigOConstant").get(0).getContext("2d"),
      constantChart = new Chart(ctxConstant).Line(
        {
          labels: [0, 200, 400, 600, 800, 1000],
          datasets: [
            {
              strokeColor: "rgba(151,187,205,1)",
              fillColor: "rgba(151,187,205,0.5)",
              data: [1, 1, 1, 1, 1, 1]
            }
          ]
        },
        constOptions
      ),
      
      ctxLinear = $("#bigOLinear").get(0).getContext("2d"),
      linearChart = new Chart(ctxLinear).Line(
        {
          labels: [0, 200, 400, 600, 800, 1000],
          datasets: [
            {
              strokeColor: "rgba(151,187,205,1)",
              fillColor: "rgba(151,187,205,0.5)",
              data: [0, 200, 400, 600, 800, 1000]
            }
          ]
        },
        options
      ),
      
      ctxQuadratic = $("#bigOQuadratic").get(0).getContext("2d"),
      quadraticChart = new Chart(ctxQuadratic).Line(
        {
          labels: [0, 200, 400, 600, 800, 1000],
          datasets: [
            {
              strokeColor: "rgba(151,187,205,1)",
              fillColor: "rgba(151,187,205,0.5)",
              data: [0, 200*200, 400*400, 600*600, 800*800, 1000*1000]
            }
          ]
        },
        options
      );
});