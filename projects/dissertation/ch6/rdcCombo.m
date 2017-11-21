%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% Thompson Sampling Bandit Player.
%
% (c) 2014 Pedro A. Ortega <pedro.ortega@gmail.com>
%     2015 Modified by Andrew Forney
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function [Action, Reward, Prob, Conds] = rdcCombo(theta, K, uConds, T, currentFactors, intentEqns, covariateIndexEqn)

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%% Initialize.
s = ones(K, K^3);
f = ones(K, K^3);

Action = zeros(1, T);
Reward = zeros(1, T);
Prob   = zeros(1, T);
Conds  = zeros(1, uConds);

%% Execute one run.
for t=1:T
    U = currentFactors{t};
    I1 = eval(intentEqns{1});
    I2 = eval(intentEqns{2});
    I3 = eval(intentEqns{3});
    intentIndex = (I1 - 1) + 2*(I2 - 1) + 4*(I3 - 1) + 1;
    covariateIndex = eval(covariateIndexEqn);
    Conds(covariateIndex) = Conds(covariateIndex) + 1;
    
    % Choose action.
    choices = betarnd(s(:, intentIndex), f(:, intentIndex));
    
    [maxVal, action] = max(choices);
    currentTheta = theta(action, covariateIndex);

    % Pull lever. We'll find the index of theta through some clever maths
    % with the value of B and D (see covariate index)
    reward = rand <= currentTheta;

    % Update.
    s(action, intentIndex) = s(action, intentIndex) + reward;
    f(action, intentIndex) = f(action, intentIndex) + 1 - reward;

    % Record.
    Action(t) = action;
    Reward(t) = reward;
    [bestVal, bestAction] = max(theta(:, covariateIndex));
    Prob(t) = action == bestAction;
end

