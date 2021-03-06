%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% Thompson Sampling Bandit Player.
%
% (c) 2014 Pedro A. Ortega <pedro.ortega@gmail.com>
%     2015 Modified by Andrew Forney
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function [Action, Reward, Prob, Conds] = rdcPi2(theta, K, uConds, T, currentFactors, intentEqns, covariateIndexEqn)

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%% Initialize.
s = ones(K, K);
f = ones(K, K);

Action = zeros(1, T);
Reward = zeros(1, T);
Prob   = zeros(1, T);
Conds  = zeros(1, uConds);

%% Execute one run.
for t=1:T
    U = currentFactors{t};
    I = eval(intentEqns{2});
    covariateIndex = eval(covariateIndexEqn);
    Conds(covariateIndex) = Conds(covariateIndex) + 1;
    
    % Choose action.
    choices = betarnd(s(:, I), f(:, I));
    
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

