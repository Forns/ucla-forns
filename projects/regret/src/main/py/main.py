from simulation import *
from bayesian import *

# load nodedata and graphskeleton interfaces
nd = NodeData()
skel = GraphSkeleton()

# Load the Bayesian network of choice by the given
# path
nd.load("./data/graph-1.txt")
skel.load("./data/graph-1.txt")

# Topologically order graphskeleton
skel.toporder()

# load Bayesian network interface
bn = DiscreteBayesianNetwork(skel, nd)

runSimulation({
  "bn": bn,
  "trials": 1,
  "exposure": "X",
  "outcome": "Y",
  "observed": ["Z1"]
})

# result = inference(bn, {"Y": "true"}, {"X": "false", "Z": "false"}).vals
# print result
# bn.Vdata["Y"]["cprob"]["['false', 'false']"] = [0.3, 0.7]
