# Contains the regret-learning simulation module elements

from bayesian import *

# Runs a simulation learning task for given manipulation
# and outcome variables (others treated as concomitants)
# Parameters sent in the options map:
#  - options.bn = the bn on which to run the simulation
#  - options.trials = the number of online learning trials
#                     to perform
#  - options.exposure = the manipulable variable name
#  - options.outcome = the dependent measure name
#  - options.observed = variables apart from the exposure
#                       and outcome that are observed per
#                       trial
def runSimulation (options):
    # Extract the options passed in
    originalNetwork = copy.deepcopy(options["bn"])
    reinforcementNet = copy.deepcopy(options["bn"])
    regretNet = copy.deepcopy(options["bn"])
    trials = options["trials"]
    exposure = options["exposure"]
    outcome = options["outcome"]
    observed = options["observed"]
    
    # We assume that, for each trial, a success will
    # be indicated by the outcome variable == "true"
    
    # With every iteration, we'll record the successes
    # and failures of the regret learning vs the 
    # reinforcement learning for each outcome given the
    # circumstances
    reinforcementRecord = {}
    regretRecord = {}
    
    # Begin the trials!
    for trial in range(0, trials):
        # -----------------------------------------------------
        # REGRET SAMPLING
        # -----------------------------------------------------
        regretSample = regretNet.randomsample(1)[0]
        sampleEvidenceVars = [exposure, outcome] + observed
        
        getRegretOutcome(regretNet, exposure, outcome, sampleEvidenceVars)
        
        
        # -----------------------------------------------------
        # REINFORCEMENT SAMPLING
        # -----------------------------------------------------
        
        reinforcementSample = reinforcementNet.randomsample(1)[0]