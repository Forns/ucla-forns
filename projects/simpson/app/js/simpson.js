/**
 * simpson.js
 * Includes Daggity-mediated functionality for Simpson's Paradox operations
 */

var simpsonInit = function () {
  console.log(Model.dag);
  
  console.log(Model.dag.causalFlowGraph());
  
  
  // List of outcome variables Y
  //console.log(Model.dag.getTargets());
  
  // List of exposure variables X
  // console.log(Model.dag.getSources());
  
  // Returns all nodes from X -> ... -> Y
  // console.log(Model.dag.nodesOnCausalPaths());
  
  // The graph with backdoor from exposure to effect alone; no causal path from X -> Y
  // console.log(Model.dag.backDoorGraph().toString());
  
  // Ordering from top node (fewest parents) to exposure and effect
  // console.log(Model.dag.topologicalOrdering());
};
