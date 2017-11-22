%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% Thompson Sampling Bandit Player.
%
%     2017 by Andrew Forney
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function [Action, Reward, Prob, Conds] = tsRDTCombo(theta, K, uCount, T, allFactors, intentEqn, covariateIndexEqn, pObs, pExp)

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%% Initialize.
s = ones(K);
f = ones(K);

Action = zeros(1, T);
Reward = zeros(1, T);
Prob   = zeros(1, T);
Conds  = zeros(1, uCount);

%% Execute one run.
for t=1:T
    U = allFactors(:,t);
    I = eval(intentEqn);
    covariateIndex = eval(covariateIndexEqn);
    Conds(covariateIndex) = Conds(covariateIndex) + 1;
    
    % We'll compute the weighted factors with aid from other intent
    % conditions
    [sETT, fETT, wETT] = ETTWeightingCombo(s, f, K, pObs, pExp, I);
    
    % Get the XArm heuristic's weighted values
    currentWeights = wETT;
    
    % Choose action.
    choices = times(betarnd(s(:, I), f(:, I)), currentWeights);
    
    [maxVal, action] = max(choices);
    currentTheta = theta(action, covariateIndex);

    % Pull lever. We'll find the index of theta through some clever maths
    % with the value of B and D (see covariate index)
    reward = rand <= currentTheta;

    % Update.
    s(action, I) = s(action, I) + reward;
    f(action, I) = f(action, I) + 1 - reward;

    % Record.
    Action(t) = action;
    Reward(t) = reward;
    [bestVal, bestAction] = max(theta(:, covariateIndex));
    Prob(t) = action == bestAction;
end


