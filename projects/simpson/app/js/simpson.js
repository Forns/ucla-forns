/**
 * simpson.js
 * Includes DAGitty-mediated functionality for Simpson's Paradox operations
 */



var $sim = {
      cpts: {},
      population: [],
      
      
      // Adds a CPT to the given simulation 
      addCPT: function (cptName, cptParents, mappedCProbs) {
        if (this.cpts[cptName]) {
          console.warn("[!] Warning: Attempting to overwrite CPT values");
        }
        this.cpts[cptName] = {
          variables: [cptName],
          params: [],
          name: cptName + ((cptParents.length) ? " | " + cptParents.join(", ") : "")
        };
        // Sometimes, may not have parent to push
        if (cptParents.length) {
          this.cpts[cptName].variables = this.cpts[cptName].variables.concat(cptParents);
        }
        
        this.cpts[cptName].params = mappedCProbs;
      },
      
      
      // Returns the given CPT parameter given the instantiation over variables
      getParameter: function (cptName, instantiation) {
        var currentCPT = this.cpts[cptName],
            ordering = [],
            count = 0;
            
        for (var i in instantiation) {
          count++;
          for (var j = 0; j < currentCPT.variables.length; j++) {
            if (i === currentCPT.variables[j]) {
              ordering[j] = instantiation[i];
              break;
            }
          }
        }
        
        if (count !== currentCPT.variables.length) {
          console.error("[X] Request for undefined parameter");
        }
        
        return (currentCPT.params[parseInt(ordering.join(""), 2)]);
      },
      
      
      // Runs the simulation parameter calculation on a causal diagram with the given
      // Simpson's reversal order
      simulateSimpson: function (dag) {
        // Clear any previous sim
        this.population = [];
        
        var example = examples[currentExample].dist,
            currentPop = this.population,
        
            // Modifies the population given the current population and
            // frequencies for a new covariate
            modifyPopulation = function (covariate, pop) {
              var freq = covariate.freq,
                  freqCopy = [[freq[0][0], freq[0][1]], [freq[1][0], freq[1][1]]],
                  name = covariate.covariate,
                  conditionOn = covariate.conditionOn,
                  prev = covariate.previous;
                  
              // Seed the population with samples of the cause on effect (aggregate) from examples table
              for (var x = 0; x < 2; x++) {
                for (var y = 0; y < 2; y++) {
                  for (var s = 0; s < pop.length; s++) {
                    var currentSubject = pop[s],
                        match = true;
                        
                    // Only add to this data point if it is consistent with x and y for this subject,
                    // hasn't been set yet, still has a point to "give," and is consistent with the previously
                    // conditioned-upon stuff
                    if (currentSubject["X"] === x && 
                        currentSubject["Y"] === y && 
                        !currentSubject[name] &&
                        freqCopy[x][y] > 0) {
                          
                      // Finally, check that the previous covariates conditioned on are consistent
                      // with this data point
                      for (var p in prev) {
                        if (pop[p] !== prev[p]) {
                          match = false;
                        }
                      }
                      if (match) {
                        pop[s][name] = conditionOn;
                        freqCopy[x][y]--;
                      }
                    }
                  }
                }
              }
            };
        
        // OBJECTIVES:
        //  1) Find the aggregate over Y|X and generate the population
        //  2) For each sub population over covariates Z = {Z1, ...},
        //     add the appropriate value for each variable to the population
        //     found in (1)
        //  3) With the full population over Y|X,Z established, learn the
        //     network parameters that could model it
        
        if (example) {
          var aggregate = example[0].freq;
          // Seed the population with samples of the cause on effect (aggregate) from examples table
          for (var x = 0; x < 2; x++) {
            for (var y = 0; y < 2; y++) {
              for (var s = 0; s < aggregate[x][y]; s++) {
                this.population.push({"X": x, "Y": y});
              }
            }
          }
              
          for (var e = 1; e < example.length; e++) {
            modifyPopulation(example[e], currentPop);
          }
        }
        
        // At this point, our population is stable, so we'll 
          
        console.log(this.population);
        
      },
      
      
      // Takes the population and returns the Y | X, Z counts
      countFromPopulation: function (source, target, covariates, table) {
        var matches = [[0, 0], [0, 0]],
            currentSubject,
            targetRates = [0, 0],
            targetDifference;
            
        if (table) {
          matches = table;
        } else {
          // TODO: Once general solution is found
          /*
          for (var i = 0; i < this.population.length; i++) {
            currentSubject = this.population[i];
            var instantiationMatches = true;
            for (var c in covariates) {
              if (currentSubject[c] !== covariates[c]) {
                instantiationMatches = false;
                break;
              }
            }
            if (instantiationMatches) {
              matches[currentSubject[source]][currentSubject[target]]++;
            }
          }
          */
        }
        
        targetRates[0] = matches[0][1] / (matches[0][0] + matches[0][1]);
        targetRates[1] = matches[1][1] / (matches[1][0] + matches[1][1]);
        targetDifference = targetRates[0] - targetRates[1];
        
        return {
          tabs: matches,
          rates: targetRates,
          difference: targetDifference
        };
      },
      
      
      // Reports a table with exposure and recovery rates
      ratesToTable: function (source, target, covariates, table) {
        console.log(table);
        // Covariates represents the filtering, otherwise, we'll
        // use a 2D array to count the matches
        var rateColoring,
            covariateString = "",
            counts = this.countFromPopulation(source, target, covariates, table),
            matches = counts.tabs,
            targetRates = counts.rates;
            
        // TODO: Temporary; will flush out once general solution is found
        covariateString = covariates;
        
        rateColoring = (targetRates[0] > targetRates[1]) ? "danger" : "success";
        
        return "<table class='table table-bordered table-compressed'>" +
                 "<caption>" + target + " | " + source + ((covariateString) ? ", " + covariateString : "") + "</caption>" +
                 "<thead>" +
                   "<tr>" +
                     "<th></th>" +
                     "<th>" + target + " = 0</th>" +
                     "<th>" + target + " = 1</th>" +
                     "<th>Total " + source + "</th>" +
                     "<th class='" + rateColoring + "'>Rate</th>" +
                   "</tr>" +
                 "</thead>" +
                 "<tbody>" +
                   "<tr>" +
                     "<th>" + source + " = 0</th>" +
                     "<td>" + matches[0][0] + "</td>" +
                     "<td>" + matches[0][1] + "</td>" +
                     "<td>" + (matches[0][0] + matches[0][1]) + "</td>" +
                     "<td class='" + rateColoring + "'>" + (100.0 * targetRates[0]).toFixed(4) + "%</td>" +
                   "</tr>" +
                   "<tr>" +
                     "<th>" + source + " = 1</th>" +
                     "<td>" + matches[1][0] + "</td>" +
                     "<td>" + matches[1][1] + "</td>" +
                     "<td>" + (matches[1][0] + matches[1][1]) + "</td>" +
                     "<td class='" + rateColoring + "'>" + (100.0 * targetRates[1]).toFixed(4) + "%</td>" +
                   "</tr>" +
                   "<tr>" +
                     "<th>Total " + target + "</th>" +
                     "<td>" + (matches[0][0] + matches[1][0]) + "</td>" +
                     "<td>" + (matches[0][1] + matches[1][1]) + "</td>" +
                     "<td>" + (matches[0][0] + matches[0][1] + matches[1][0] + matches[1][1]) + "</td>" +
                     "<td class='" + rateColoring + "'></td>" +
                   "</tr>" +
                 "</tbody>" +
               "</table>";
      },
      
      
      // Provides a table print-out of the given CPT
      cptToTable: function (cptName) {
        if (!this.cpts[cptName]) {
          console.error("[X] No CPT with that variable name found!");
          return "";
        }
        var currentCPT = this.cpts[cptName],
            rows = Math.pow(2, currentCPT.variables.length),
            rowDisplays = [],
            result = 
              "<table class='table table-bordered table-compressed'>" +
                "<caption>CPT for: " + currentCPT.name + "</caption>" +
                "<thead>" +
                  "<tr>";
            
        // Add headings
        for (var i = 0; i < currentCPT.variables.length; i++) {
          result += "<th>" + currentCPT.variables[i] + "</th>";
          // Set row displays of binary values
          rowDisplays.push(Math.pow(2, (currentCPT.variables.length - i - 1)));
        }
        result += "<th>Pr</th></tr></thead><tbody><tr>";
        
        
        // Add parameters
        for (var i = 0; i < rows; i++) {
          // Add variable values
          for (var j = 0; j < currentCPT.variables.length; j++) {
            // 0 or 1 depending on which row for the variable
            result += "<td>" + Math.floor(i / rowDisplays[j]) % (rowDisplays[j] * 2) + "</td>"
          }
          result += "<td>" + currentCPT.params[i] + "</td></tr>";
        }
        result += "</tbody></table>";
        
        return result;
      }
    },
    
    simpsonAnalysis = function () {
      var dag = Model.dag,
          allPaths = [],
          pathCount = 0,
          sources = dag.getSources(),
          targets = dag.getTargets(),
          minimalSeparators = GraphAnalyzer.listMsasTotalEffect(dag),
          dontCondition = [],
          allLatentReport = "";
      
      // Let's make sure we can even run the rest of our algorithm before continuing
      if (dag.containsCycle()) {
        return {
          possible: "No; cycle in graph",
          condition: "N/A",
          code: 0
        };
      }
      
      if (sources.length === 0 || targets.length === 0) {
        return {
          possible: "No; exposure or outcome not set",
          condition: "N/A",
          code: -1
        }
      }
      
      // We'll start off by looking at every path between our sources and targets
      sources.each(function (s) {
        targets.each(function (t) {
          dag.listPathsBetween(s, t).each(function (p) {
            allPaths.push(p.splice(0));
          });
        });
      });
      
      pathCount = allPaths.length;
      
      // Verify that there are enough paths between X and Y for Simpson's paradox
      if (pathCount <= 1) {
        return {
          possible: "No; one path from exposure to outcome",
          condition: "N/A",
          code: 1
        };
      }
      
      // Next, we want to test if there's an all-latent variable undirected path from X to Y
      allPaths.each(function (p) {
        if (dag.isLatentPath(p, dag)) {
          allLatentReport = {
            possible:
              "No; all latent path:<br/>" +
              "<ul>" +
                (function () {
                  var result = "";
                  p.each(function (n) {
                    result += "<li><p>" + n.id + "</p></li>"
                  });
                  return result;
                })() +
              "</ul>",
            condition: "N/A",
            code: 2
          };
        }
      });
      
      if (allLatentReport) {
        return allLatentReport;
      }
      
      // Otherwise, it's possible and we should report where the correct answer is!
      
      // Check if we've accidentally conditioned on something along the causal path:
      dag.nodesOnCausalPaths().each(function (n) {
        if (dag.isAdjustedNode(n)) {
          dontCondition.push(n.id);
        }
      });
      
      if (dontCondition.length) {
        dontCondition = "{" + dontCondition.join(", ") + "}";
      }
      
      if (dag.activeBiasGraph().edges.length) {
        return {
          possible: "Yes",
          report: "sets",
          condition: minimalSeparators,
          dontCondition: dontCondition,
          answer: "Bias requires resolution",
          code: 3
        };
      } else {
        var conditioned = false;
        dag.getVertices().each(function (v) {
          if (dag.isAdjustedNode(v)) {
            minimalSeparators.each(function (s) {
              s.each(function (n) {
                if (n.id === v.id) {
                  conditioned = true;
                }
              });
            });
          }
        });
        
        return {
          possible: "Yes",
          condition: "No",
          dontCondition: dontCondition,
          answer: (conditioned) ? "Disaggregated Data" : "Aggregated Data",
          code: 4
        };
      }
      
      // [TESTING] Default return
      return {
        possible: "N/A",
        condition: "N/A",
        code: -2
      };
    },


    displaySimpsonInfo = function () {
      $sim.simulateSimpson(Model.dag);
      
      var results = simpsonAnalysis(),
          infoSimpsonPossible = $("info_simpson_possible"),
          infoButton = jQuery("#simpson_info_button"),
          simpsonPopup = jQuery("#simpsonPopup"),
          popupBody = simpsonPopup.find(".modal-body"),
          example = examples[currentExample].dist,
          
          generateTables = function () {
            var tableSchemas = [],
                covariateString = [],
                result = "";
                
            if (!example) {
              return "<br/><p class='text-center'>No example frequencies available for this model</p>";
            }
            
            for (var i = 0; i < example.length; i++) {
              covariateString = [];
              if (example[i].covariate) {
                covariateString.push((example[i].covariate + "=" + example[i].conditionOn));
                for (var j in example[i].previous) {
                  covariateString.push(j + "=" + example[i].previous[j]);
                }
              }
              covariateString = covariateString.join(",");
              result += $sim.ratesToTable("X", "Y", covariateString, example[i].freq);
            }
            return result;
          },
          
          // Holds the report info... could probably be cleaned up but... meh
          infoReport = 
            // --------------------------------------------------------------------
            // Nav tabs
            "<ul class='nav nav-tabs'>" +
              "<li class='active'><a href='#explanation' data-toggle='tab'>Explanation</a></li>" +
              "<li><a href='#simulation' data-toggle='tab'>Simulation</a></li>" +
              "<li><a href='#sim-analysis' data-toggle='tab'>Analysis</a></li>" +
            "</ul>" +
            
            // --------------------------------------------------------------------
            // Nav panes
            "<div class='tab-content'>" +
            
              // Explanation nav pane
              "<div class='tab-pane active' id='explanation'>" +
              
                "<div class='table-responsive table-bordered'>" +
                  "<table class='table'>" +
                    "<thead>" +
                    "</thead>" +
                    "<tbody>" +
                    
                      "<tr class='" + ((results.code > 2) ? "success" : "danger") + "'>" +
                        "<td><strong>Is it possible?<strong></td>" +
                        "<td>" + results.possible + "</td>" +
                      "</tr>" +
                      
                      ((results.code > 2) ? 
                      (
                        "<tr class='" + ((results.code === 3) ? "warning" : "success") + "'>" +
                          "<td><strong>Unblocked backdoor?</strong></td>" +
                          "<td>" +
                            
                            // Messy way to display the minimal separating set(s)
                            (function () {
                              var report = results.condition;
                              if (results.code === 3) {
                                report = [];
                                for (var i = 0; i < results.condition.length; i++) {
                                  report.push(
                                    (function () {
                                      var subRepo = [];
                                      results.condition[i].each(function (j) {
                                        subRepo.push(j.id);
                                      });
                                      return "{" + subRepo.join(", ") + "}";
                                    })()
                                  );
                                }
                                report = "Yes, adjust for (at least one of):<br/>" + ((report.length) ? report.join(", ") : "{}");
                              }
                              return report;
                            })() +
                            
                          "</td>" +
                        "</tr>" +
                        
                        // Check for NOT conditioning along the causal path
                        ((results.dontCondition.length) 
                          ? 
                            "<tr class='danger'>" +
                              "<td><strong>Should NOT adjust for:</strong></td>" +
                              "<td>" + results.dontCondition + "</td>" +
                            "</tr>"
                          : "") +
                          
                        // If all green, report where answer is
                        ((!results.dontCondition.length && results.code === 4) 
                          ? 
                            "<tr class='success'>" +
                              "<td><strong>Correct TE of exposure on outcome in:</strong></td>" +
                              "<td>" + results.answer + "</td>" +
                            "</tr>"
                          : "")
                        
                      ) : "") +
                      
                    "</tbody>" +
                  "</table>" +
                "</div>" +
              
              "</div>" +
              
              // Simulation nav pane
              "<div class='tab-pane' id='simulation'>" +
                "<p class='text-center'><strong>NOTE: Simulation currently only supported for example models; any changes made will not be reflected here... yet!</strong></p>" +
                ((results.code > 2) 
                  ? "<br/><p class='text-center'>Simulation presently unsupported... check back soon!</p>"
                  : "<br/><p class='text-center'>Simulation not available on models where paradox is not possible</p>") +
              "</div>" +
              
              // Analysis nav pane
              "<div class='tab-pane' id='sim-analysis'>" +
                "<p class='text-center'><strong>NOTE: Analysis currently only supported for example models; any changes made will not be reflected here... yet!</strong></p>" +
                generateTables() +
              "</div>" +
              
            "</div>";
          
      infoSimpsonPossible.innerHTML = results.possible;
      
      // Event handler for the explanation button
      infoButton
        .click(function () {
          popupBody
            .html(infoReport);
          simpsonPopup
            .modal("show");
        });
        
    };
    
jQuery(function () {
  modalPopup(
    "body",
    "simpsonPopup",
    "Simpson's Paradox",
    "<p>Loading...</p>",
    "<button type='button' class='btn btn-default' data-dismiss='modal'>Close</button>",
    {
      show: false
    },
    {
      image: true
    }
  );
});
