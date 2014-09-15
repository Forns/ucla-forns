# Contains functions relevant to Bayesian network inference
# and structural manipulations

import json
import copy

from libpgm.nodedata import NodeData
from libpgm.graphskeleton import GraphSkeleton
from libpgm.discretebayesiannetwork import DiscreteBayesianNetwork
from libpgm.tablecpdfactorization import TableCPDFactorization

# Performs inference on the given bn
def inference (bn, query, evidence):
    for var in evidence:
        if var in query:
            del query[var]
    
    obn = copy.deepcopy(bn)
    fn = TableCPDFactorization(obn)
    return fn.specificquery(query, evidence)
    # return fn.condprobve(query, evidence)


# Returns a boolean of whether or not regret was experienced
# for the chosen exposure based on the input bn and evidence
def getRegretOutcome (bn, exposure, outcome, evidence):
    # 1) Abduction: Update P(u) by the evidence to obtain
    #    P(u | e)
    abductionNet = copy.deepcopy(bn)
    
    print inference(abductionNet, {"Y": ["true"]}, {"Z1": ["true"]}).vals
    
    for var in bn.Vdata:
        print var
