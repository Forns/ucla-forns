/**
 * simulation.js
 * Simulation of the Multi-armed bandits with observations 
 */


/*
 * =========================================================
 * CLASS DEFINITIONS
 * =========================================================
 */
var getN = function (node) {
      if (typeof(node) === "number") {
        return node;
      }
      return getN(node.children[0]) + getN(node.children[1]);
    },
    
    constructTree = function (vars) {
      if (!vars.length) {
        return 0;
      }
      return {variable: vars[0], children: [constructTree(vars.slice(1)), constructTree(vars.slice(1))]};
    },
    
    Distribution = function (vars) {
      this.vars = vars;
      this.table = constructTree(vars);
      this.count = getN(this.table);
    },
    
    queryCountExec;

Distribution.prototype.addToTree = function (item, node) {
  if (!node) {
    return;
  }
  
  var value, target;
  for (var i in item) {
    if (i === node.variable) {
      value = item[i];
      target = node.children[value];
      break;
    }
  }
  
  // If it's a number, we've reached a leaf
  if (typeof(target) === "number") {
    node.children[value] += 1;
    this.count++;
    return;
  } else {
    this.addToTree(item, target);
  }
};


/*
 * Adds data points to the table / tree in form of:
 * items = [{"X":1, "Y":0}, ...]
 */
Distribution.prototype.addItems = function (items) {
  for (i in items) {
    this.addToTree(items[i], this.table);
  }
};

queryCountExec = function (query, node) {
  if (!node) {
    return 0;
  }
  
  if (typeof(node) === "number") {
    return node;
  }
  
  var value, target;
  for (var q in query) {
    if (q === node.variable) {
      value = query[q];
      target = node.children[value];
      break;
    }
  }
  
  if (typeof(target) !== "undefined") {
    return queryCountExec(query, target);
  }
  return queryCountExec(query, node.children[0]) + queryCountExec(query, node.children[1]);
};

/*
 * Query and evidence will be objects in form: {"X": 1},
 * so for example, P(Y = 1 | X = 1) === dist.getQueryCount([{"Y":1}], [{"X":1}])
 */
Distribution.prototype.query = function (query, evidence) {
  var numerator = query, numCount, eCount;
  
  // First check that we don't have conflicting evidence / query
  for (var e in evidence) {
    for (var q in query) {
      if (e === q && evidence[e] !== query[q]) {
        return 0;
      }
    }
    numerator[e] = evidence[e];
  }

  numCount = queryCountExec(numerator, this.table);
  eCount = queryCountExec(evidence, this.table);
  
  return (eCount) ? numCount / eCount : 0;
};



/*
 * Variables must be listed in topological order
 * Structural equations will look like:
 * {
 *   dependencies: ["X", ...], // variables on which the function depends
 *   // NB: params = {"X":0, ...}
 *   eq: function (params) {
 *     // ...
 *   }
 * }
 */
var Simulation = function (vars, structuralEqs) {
      this.vars = vars;
      this.structuralEqs = structuralEqs;
    },
    
    newSampleMap = function (vars) {
      var sample = {};
      for (var v = 0; v < vars.length; v++) {
        sample[vars[v]] = 0;
      }
      return sample;
    };
    
Simulation.prototype.generateSamples = function (n) {
  var samples = [];
  for (var i = 0; i < n; i++) {
    var currentSample = newSampleMap(this.vars);
    for (var v = 0; v < this.vars.length; v++) {
      // Must construct the parameter object for the structural
      // equation
      var params = {},
          currentEqs = this.structuralEqs[v];
      for (var p in currentEqs.dependencies) {
        var currentDep = currentEqs.dependencies[p];
        params[currentDep] = currentSample[currentDep];
      }
      
      // Decide value of current variable in this sample
      // based on its dependencies
      currentSample[this.vars[v]] = this.structuralEqs[v].eq(params);
    }
    // Finally, push that sample onto our return of samples
    samples.push(currentSample);
  }
  return samples;
}


/*
 * Computes the probability of necessity for exposure variable
 * on outcome variable. Parameter examples:
 * exposure: {"X": 0} // Binary assumed, 0 = false, 1 = true
 * outcome: {"Y": 1}, // Samesies
 * obsDist and expDist are loaded Distribution objects
 */
var ProbNecessity = function (exposure, outcome, obsDist, expDist) {
      // We will compute the lower and upper bounds separately,
      // breaking each into its component probability expressions
      var exVar = Object.keys(exposure)[0],
          exVal = exposure[exVar],
          outVar = Object.keys(outcome)[0],
          outVal = outcome[outVar],
          
          // LB
          P_Y_q = {},
          P_Y,
          P_YdoXp_q = {},
          P_YdoXp_e = {},
          P_YdoXp,
          P_XY_q = {},
          P_XY,
          
          // UB
          P_YpdoXp_q = {},
          P_YpdoXp_e = {},
          P_YpdoXp,
          P_XpYp_q = {},
          P_XpYp,
          
          lowerBound = 0,
          upperBound = 0;
          
          
      // Set up query and evidence vars
      P_Y_q[outVar] = outVal;          // P(y)
      P_Y = obsDist.query(P_Y_q, []);
      
      P_YdoXp_q[outVar] = outVal;      // P(y | do(x'))
      P_YdoXp_e[exVar] = 1 - exVal;    // P(y | do(x'))
      P_YdoXp = expDist.query(P_YdoXp_q, P_YdoXp_e);
      
      P_XY_q[outVar] = outVal;         // P(x, y)
      P_XY_q[exVar] = exVal;           // P(x, y)
      P_XY = obsDist.query(P_XY_q, []);
      
      P_YpdoXp_q[outVar] = 1 - outVal; // P(y' | do(x'))
      P_YpdoXp_e[exVar] = 1 - exVal;
      P_YpdoXp = expDist.query(P_YpdoXp_q, P_YpdoXp_e);
      
      P_XpYp_q[exVar] = 1 - exVal;     // P(x', y')
      P_XpYp_q[outVar] = 1 - outVal;
      P_XpYp = obsDist.query(P_XpYp_q, []);
      
      lowerBound = Math.min(1, Math.max(0, (P_Y - P_YdoXp)/P_XY));
      upperBound = Math.max(0, Math.min(1, (P_YpdoXp - P_XpYp)/P_XY));
      
      lowerBound = (isNaN(lowerBound)) ? 0 : lowerBound;
      upperBound = (isNaN(upperBound)) ? 1 : upperBound;
      
      return {lowerBound: lowerBound, upperBound: upperBound};
  },
  
  ProbSufficiency = function (exposure, outcome, obsDist, expDist) {
      // We will compute the lower and upper bounds separately,
      // breaking each into its component probability expressions
      var exVar = Object.keys(exposure)[0],
          exVal = exposure[exVar],
          outVar = Object.keys(outcome)[0],
          outVal = outcome[outVar],
          
          // LB
          P_Y_q = {},
          P_Y,
          P_YdoX_q = {},
          P_YdoX_e = {},
          P_YdoX,
          P_XpYp_q = {},
          P_XpYp,
          
          // UB
          P_XY_q = {},
          P_XY,
          
          lowerBound = 0,
          upperBound = 0;
          
          
      // Set up query and evidence vars
      P_Y_q[outVar] = outVal;          // P(y)
      P_Y = obsDist.query(P_Y_q, []);
      
      P_YdoX_q[outVar] = outVal;       // P(y | do(x))
      P_YdoX_e[exVar] = exVal;    
      P_YdoX = expDist.query(P_YdoX_q, P_YdoX_e);
      
      P_XY_q[outVar] = outVal;         // P(x, y)
      P_XY_q[exVar] = exVal;           
      P_XY = obsDist.query(P_XY_q, []);
      
      P_XpYp_q[exVar] = 1 - exVal;     // P(x', y')
      P_XpYp_q[outVar] = 1 - outVal;
      P_XpYp = obsDist.query(P_XpYp_q, []);
      
      lowerBound = Math.min(1, Math.max(0, (P_YdoX - P_Y)/P_XpYp));
      upperBound = Math.max(0, Math.min(1, (P_YdoX - P_XY)/P_XpYp));
      
      lowerBound = (isNaN(lowerBound)) ? 0 : lowerBound;
      upperBound = (isNaN(upperBound)) ? 1 : upperBound;
      
      return {lowerBound: lowerBound, upperBound: upperBound};
    },
    
    allMax = function (vals) {
      var currentMax = 0;
      for (var v in vals) {
        if (vals[v] > currentMax) {
          currentMax = vals[v];
        }
      }
      return currentMax;
    },
    
    allMin = function (vals) {
      var currentMin = 1;
      for (var v in vals) {
        if (vals[v] < currentMin) {
          currentMin = vals[v];
        }
      }
      return currentMin;
    },
    
    ProbNeccSuff = function (exposure, outcome, obsDist, expDist) {
      // We will compute the lower and upper bounds separately,
      // breaking each into its component probability expressions
      var exVar = Object.keys(exposure)[0],
          exVal = exposure[exVar],
          outVar = Object.keys(outcome)[0],
          outVal = outcome[outVar],
          
          // LB
          P_Y_q = {},
          P_Y,
          P_YdoX_q = {},
          P_YdoX_e = {},
          P_YdoX,
          P_YdoXp_q = {},
          P_YdoXp_e = {},
          P_YdoXp,
          P_YpdoXp_q = {},
          P_YpdoXp_e = {},
          P_YpdoXp,
          
          // UB
          P_XY_q = {},
          P_XY,
          P_XpYp_q = {},
          P_XpYp,
          P_XpY_q = {},
          P_XpY,
          P_XYp_q = {},
          P_XYp,
          
          lowerBound = 0,
          upperBound = 0;
          
          
      // Set up query and evidence vars
      P_Y_q[outVar] = outVal;          // P(y)
      P_Y = obsDist.query(P_Y_q, []);
      
      P_YdoX_q[outVar] = outVal;       // P(y | do(x))
      P_YdoX_e[exVar] = exVal;    
      P_YdoX = expDist.query(P_YdoX_q, P_YdoX_e);
      
      P_YdoXp_q[outVar] = outVal;      // P(y | do(x'))
      P_YdoXp_e[exVar] = 1 - exVal;    
      P_YdoXp = expDist.query(P_YdoXp_q, P_YdoXp_e);
      
      P_YpdoXp_q[outVar] = 1 - outVal; // P(y' | do(x'))
      P_YpdoXp_e[exVar] = 1 - exVal;    
      P_YpdoXp = expDist.query(P_YpdoXp_q, P_YpdoXp_e);
      
      P_XY_q[outVar] = outVal;         // P(x, y)
      P_XY_q[exVar] = exVal;           
      P_XY = obsDist.query(P_XY_q, []);
      
      P_XpY_q[outVar] = outVal;        // P(x', y)
      P_XpY_q[exVar] = 1 - exVal;           
      P_XpY = obsDist.query(P_XpY_q, []);
      
      P_XYp_q[outVar] = 1 - outVal;    // P(x, y')
      P_XYp_q[exVar] = exVal;           
      P_XYp = obsDist.query(P_XYp_q, []);
      
      P_XpYp_q[exVar] = 1 - exVal;     // P(x', y')
      P_XpYp_q[outVar] = 1 - outVal;
      P_XpYp = obsDist.query(P_XpYp_q, []);
      
      lowerBound = Math.min(1, allMax([
        P_YdoX - P_YdoXp,
        P_Y - P_YdoXp,
        P_YdoX - P_Y
      ]));
      upperBound = Math.max(0, allMin([
        P_YdoX,
        P_YpdoXp,
        P_XY + P_XpYp,
        P_YdoX - P_YdoXp + P_XYp + P_XpY
      ]));
      
      lowerBound = (isNaN(lowerBound)) ? 0 : lowerBound;
      upperBound = (isNaN(upperBound)) ? 1 : upperBound;
      
      return {lowerBound: lowerBound, upperBound: upperBound};
    };

/*
 * =========================================================
 * SIMULATION
 * =========================================================
 */

var obsDist_COND_OBS = new Distribution(["X", "Y"]),
    obsDist_COND_COM = new Distribution(["X", "Y"]),
    obsDist_COND_EPS = new Distribution(["X", "Y"]),
    obsDist_COND_EPS_PROP = new Distribution(["Z", "X", "Y"]),
    expDist_COND_EXP = new Distribution(["X", "Y"]),
    expDist_COND_COM = new Distribution(["X", "Y"]),
    
    // Returns a boolean 
    isCorrectChoice = function (choice, context) {
      var w = context["W"],
          u = context["U"];
      
      return (rewardDist[u][w][choice] > rewardDist[u][w][1 - choice]);
    },
    
    f_Y = function (params) {
      var outcome = Math.random();
      return (outcome < rewardDist[params["U"]][params["W"]][params["X"]]) ? 1 : 0;
    },
    
    f_U = function (params) {
      if (FIXED_U) {
        return 0;
      } else {
        return (Math.random() < 0.5) ? 0 : 1;
      }
    },
    
    f_W = function (params) {
      if (FIXED_U) {
        return 0;
      } else {
        return (Math.random() < 0.5) ? 0 : 1;
      }
    },
    
    f_X_COND_OBS = function (params) {
      return Math.abs(params["U"] - params["W"]);
    },
    
    f_X_COND_EXP = function (params) {
      return (Math.random() < 0.5) ? 0 : 1;
    },
    
    time = 1,
    f_X_COND_COM = function (params) {
      // Here, X will be chosen based on the PN and PS lower bounds
      
      // The original choice is what the agent would have chosen
      // by Nature's system
      var originalChoice = f_X_COND_OBS(params),
          
          // We'll assess whether or not that original choice should
          // be kept!
          pOrig = obsDist_COND_COM.query({"Y":1}, []);
          pAlt = expDist_COND_COM.query({"Y":1}, {"X": 1 - originalChoice}),
          
          pDiff = (obsDist_COND_COM.count) ? (Math.abs(obsDist_COND_COM.query({"Y": 1}, {"X": originalChoice}) - expDist_COND_COM.query({"Y": 1}, {"X": originalChoice}))) : TOLERANCE + 1;
          
      if (Math.random() < EPSILON) {
        return (Math.random() < 0.5) ? 0 : 1;
        
      // Here we're exploiting by examining counterfactual regret
      } else {
        exploitCom++;
        var result;
        if (!obsDist_COND_COM.count || pDiff < TOLERANCE) {
          result = (expDist_COND_COM.query({"Y":1}, {"X":0}) > expDist_COND_COM.query({"Y":1}, {"X":1})) ? 0 : 1;
          
        } else if (pOrig > pAlt) {
          result = originalChoice;
          
        } else {
          result = 1 - originalChoice;
        }
        
        if (isCorrectChoice(result, params)) {
          correctChoicesCom++;
        }
        return result;
      }
    },
    
    f_X_COND_EPS = function (params) {
      // Here, X will be chosen based on the epsilon-greedy
      // algorithm
      
      // Explore with probability epsilon
      if (Math.random() < EPSILON) {
        return (Math.random() < 0.5) ? 0 : 1;
        
      // Here we're exploiting by choosing the current best
      } else {
        exploitEps++;
        var result = (obsDist_COND_EPS.query({"Y":1}, {"X":0}) > obsDist_COND_EPS.query({"Y":1}, {"X":1})) ? 0 : 1;
        if (isCorrectChoice(result, params)) {
          correctChoicesEps++;
        }
        return result;
      }
    },
    
    f_X_COND_EPS_PROP = function (params) {
      // Here, X will be chosen based on the epsilon-greedy
      // algorithm accounting for initial choice
      var originalChoice = params["Z"];
      
      // Explore with probability epsilon
      if (Math.random() < EPSILON) {
        return (Math.random() < 0.5) ? 0 : 1;
        
      // Here we're exploiting by choosing the current best
      } else {
        var result = (obsDist_COND_EPS_PROP.query({"Y":1}, {"X":0, "Z": originalChoice}) > obsDist_COND_EPS_PROP.query({"Y":1}, {"X":1, "Z": originalChoice})) ? 0 : 1;
        exploitEpsProp++;
        if (isCorrectChoice(result, params)) {
          correctChoicesEpsProp++;
        }
        return result;
      }
    },
    
    sim_orig = new Simulation(
      // Variables:
      ["U", "W", "X", "Y"],
      
      // Structural Eqs:
      [
        // f_U
        {
          dependencies: [],
          eq: f_U
        },
        
        // f_X = U
        {
          dependencies: ["U"],
          eq: f_X_COND_OBS
        },
        
        // f_Y = XOR(U, X)
        {
          dependencies: ["U", "X"],
          eq: f_Y
        }
      ]
    ),
    
    sim = new Simulation(
      // Variables:
      ["U", "W", "X", "Y"],
      
      // Structural Eqs:
      [
        // f_U
        {
          dependencies: [],
          eq: f_U
        },
        
        // f_W
        {
          dependencies: [],
          eq: f_W
        },
        
        // f_X = U
        {
          dependencies: ["U", "W"],
          eq: f_X_COND_OBS
        },
        
        // f_Y
        {
          dependencies: ["U", "W", "X"],
          eq: f_Y
        }
      ]
    ),
    
    expSim = new Simulation(
      // Variables:
      ["U", "W", "X", "Y"],
      
      // Structural Eqs:
      [
        // f_U
        {
          dependencies: [],
          eq: f_U
        },
        
        // f_W
        {
          dependencies: [],
          eq: f_W
        },
        
        // f_X
        {
          dependencies: [],
          eq: f_X_COND_EXP
        },
        
        // f_Y
        {
          dependencies: ["U", "W", "X"],
          eq: f_Y
        }
      ]
    ),
    
    epsSim = new Simulation(
      // Variables:
      ["U", "W", "X", "Y"],
      
      // Structural Eqs:
      [
        // f_U
        {
          dependencies: [],
          eq: f_U
        },
        
        // f_W
        {
          dependencies: [],
          eq: f_W
        },
        
        // f_X
        // U W added as dependency for record-keeping only
        {
          dependencies: ["U", "W"],
          eq: f_X_COND_EPS
        },
        
        // f_Y = XOR(U, X)
        {
          dependencies: ["U", "W", "X"],
          eq: f_Y
        }
      ]
    ),
    
    epsPropSim = new Simulation(
      // Variables:
      ["U", "W", "Z", "X", "Y"],
      
      // Structural Eqs:
      [
        // f_U
        {
          dependencies: [],
          eq: f_U
        },
        
        // f_W
        {
          dependencies: [],
          eq: f_W
        },
        
        // f_Z
        {
          dependencies: ["U", "W"],
          eq: function (params) {
            return f_X_COND_OBS(params);
          }
        },
        
        // f_X
        {
          dependencies: ["U", "W", "Z"],
          eq: f_X_COND_EPS_PROP
        },
        
        // f_Y = XOR(U, X)
        {
          dependencies: ["U", "W", "X"],
          eq: f_Y
        }
      ]
    ),
    
    combinedSim = new Simulation(
      // Variables:
      ["U", "W", "X", "Y"],
      
      // Structural Eqs:
      [
        // f_U
        {
          dependencies: [],
          eq: f_U
        },
        
        // f_W
        {
          dependencies: [],
          eq: f_W
        },
        
        // f_X
        {
          dependencies: ["U", "W"],
          eq: f_X_COND_COM
        },
        
        // f_Y = XOR(U, X)
        {
          dependencies: ["U", "W", "X"],
          eq: f_Y
        }
      ]
    ),
    
    samples,
    
    LRwinsObs = 0,
    winsObs = 0,
    recordObs = [],
    LRwinsExp = 0,
    winsExp = 0,
    recordExp = [],
    LRwinsEps = 0,
    winsEps = 0,
    recordEps = [],
    LRwinsEpsProp = 0,
    winsEpsProp = 0,
    recordEpsProp = [],
    LRwinsCom = 0,
    winsCom = 0,
    recordCombined = [],
    
    correctChoicesEps = 0,
    exploitEps = 0,
    correctChoicesEpsProp = 0,
    exploitEpsProp = 0,
    correctChoicesCom = 0,
    exploitCom = 0;
    
/*
 * =========================================================
 * BANDITS EXPERIMENT
 * =========================================================
 */

var FIXED_U = false,
    RAND_PARAM = false,
    N_obs = 1000,
    N_exp = 1000,
    EPSILON = 0.15,
    TOLERANCE = 0.015,
    T = 10000,
    TESTS = 100,
    
    // U, W, X
    rewardDist = [
      [ // U = 0
        [0.5, 0.1], // W = 0, p = 0
        [0.5, 0.1]  // W = 1, p = 1
      ],
      [ // U = 1
        [0.4, 0.2], // W = 0, p = 1
        [0.2, 0.4]  // W = 1, p = 0
      ]
    ];

for (var tests = 0; tests < TESTS; tests++) {
  if (RAND_PARAM) {
    // U, W, X
    rewardDist = [
      [ // U = 0
        [Math.random(), Math.random()], // W = 0
        [Math.random(), Math.random()]  // W = 1
      ],
      [ // U = 1
        [Math.random(), Math.random()], // W = 0
        [Math.random(), Math.random()]  // W = 1
      ]
    ];
  }
  
  obsDist_COND_COM = new Distribution(["X", "Y"]);
  obsDist_COND_EPS = new Distribution(["X", "Y"]);
  obsDist_COND_EPS_PROP = new Distribution(["Z", "X", "Y"]);
  expDist_COND_COM = new Distribution(["X", "Y"]);
  
  if (N_exp) {
    samples = expSim.generateSamples(N_exp);
    expDist_COND_COM.addItems(samples);
    obsDist_COND_EPS.addItems(samples);
  }
  
  if (N_obs) {
    samples = sim.generateSamples(N_obs);
    obsDist_COND_COM.addItems(samples);
  }
  
  for (var t = 0; t < T; t++) {
    var epsOutcome = epsSim.generateSamples(1)[0],
        obsOutcome = sim.generateSamples(1)[0],
        expOutcome = expSim.generateSamples(1)[0],
        epsPropOutcome = epsPropSim.generateSamples(1)[0],
        comOutcome = combinedSim.generateSamples(1)[0];
        
    recordObs.push(obsOutcome["Y"]);
    winsObs += obsOutcome["Y"];
    recordExp.push(expOutcome["Y"]);
    winsExp += expOutcome["Y"];
    recordEps.push(epsOutcome["Y"]);
    winsEps += epsOutcome["Y"];
    recordEpsProp.push(epsPropOutcome["Y"]);
    winsEpsProp += epsPropOutcome["Y"];
    recordCombined.push(comOutcome["Y"]);
    winsCom += comOutcome["Y"];
    
    obsDist_COND_OBS.addItems([obsOutcome]);
    obsDist_COND_EPS.addItems([epsOutcome]);
    obsDist_COND_EPS_PROP.addItems([epsPropOutcome]);
    
    expDist_COND_EXP.addItems([expOutcome]);
    expDist_COND_COM.addItems([comOutcome]);
    
    time++;
  }
  
  LRwinsObs += winsObs;
  winsObs = 0;
  LRwinsExp += winsExp;
  winsExp = 0;
  LRwinsEps += winsEps;
  winsEps = 0;
  LRwinsEpsProp += winsEpsProp;
  winsEpsProp = 0;
  LRwinsCom += winsCom;
  winsCom = 0;
  time = 1;
  
}

console.log("COND EPS PROP RESULTS =============");
console.log("Obs P(y | X = 0):");
console.log(obsDist_COND_EPS_PROP.query({"Y": 1}, {"X": 0, "Z": 0}));
console.log();
console.log("Obs P(y | X = 1):");
console.log(obsDist_COND_EPS_PROP.query({"Y": 1}, {"X": 1, "Z": 0}));
console.log();
console.log("Obs P(y | X = 0):");
console.log(obsDist_COND_EPS_PROP.query({"Y": 1}, {"X": 0, "Z": 1}));
console.log();
console.log("Obs P(y | X = 1):");
console.log(obsDist_COND_EPS_PROP.query({"Y": 1}, {"X": 1, "Z": 1}));
console.log();
  
console.log("RESULTS ===========================");
console.log("Obs P(y | X = 0):");
console.log(obsDist_COND_OBS.query({"Y": 1}, {"X": 0}));
console.log();
console.log("Obs P(y | X = 1):");
console.log(obsDist_COND_OBS.query({"Y": 1}, {"X": 1}));
console.log();
console.log("Exp P(y | do(X = 0)):");
console.log(expDist_COND_EXP.query({"Y": 1}, {"X": 0}));
console.log();
console.log("Exp P(y | do(X = 1)):");
console.log(expDist_COND_EXP.query({"Y": 1}, {"X": 1}));
console.log();

console.log("LR RES ============================");
console.log("OBSERVATIONAL:");
console.log(parseFloat(LRwinsObs) / (TESTS * T));
console.log();
console.log("EXPERIMENTAL:");
console.log(parseFloat(LRwinsExp) / (TESTS * T));
console.log();
console.log("EPSILON-GREEDY:");
console.log(parseFloat(LRwinsEps) / (TESTS * T));
console.log();
console.log("EPSILON-GREEDY-PROPENSITY:");
console.log(parseFloat(LRwinsEpsProp) / (TESTS * T));
console.log();
console.log("COMBINED:");
console.log(parseFloat(LRwinsCom) / (TESTS * T));
console.log();

console.log("CORRECT CHOICES ===================");
console.log("EPSILON-GREEDY:");
console.log(parseFloat(correctChoicesEps) / exploitEps);
console.log();
console.log("EPSILON-GREEDY-PROP:");
console.log(parseFloat(correctChoicesEpsProp) / exploitEps);
console.log();
console.log("COMBINED:");
console.log(parseFloat(correctChoicesCom) / exploitCom);
console.log();
