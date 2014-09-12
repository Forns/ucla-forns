import json
import copy

from libpgm.nodedata import NodeData
from libpgm.graphskeleton import GraphSkeleton
from libpgm.discretebayesiannetwork import DiscreteBayesianNetwork
from libpgm.tablecpdfactorization import TableCPDFactorization

# Performs inference on the given bn
def inference (bn, query, evidence):
    obn = copy.deepcopy(bn)
    fn = TableCPDFactorization(obn)
    return fn.condprobve(query, evidence)

# load nodedata and graphskeleton
nd = NodeData()
skel = GraphSkeleton()
nd.load("./data/graph-1.txt")    # any input file
skel.load("./data/graph-1.txt")

# topologically order graphskeleton
skel.toporder()

# load bayesian network
bn = DiscreteBayesianNetwork(skel, nd)

result = inference(bn, {"Y": "true"}, {"X": "false", "Z": "false"}).vals

print result

bn.Vdata["Y"]["cprob"]["['false', 'false']"] = [0.3, 0.7]

result = inference(bn, {"Y": "true"}, {"X": "false", "Z": "false"}).vals

print result


