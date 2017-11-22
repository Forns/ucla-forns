function [Action, Reward, Prob, Conds] = tsVanilla(theta, K, uCount, T, allFactors, intentEqn, covariateIndexEqn, pObs, pExp)

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%% Initialize.
s = ones(1, K);
f = ones(1, K);

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
    
    % Choose action.
    choices = betarnd(s, f);
    
    [maxVal, action] = max(choices);
    currentTheta = theta(action, covariateIndex);

    % Pull lever. We'll find the index of theta through some clever maths
    % with the value of B and D (see covariate index)
    reward = rand <= currentTheta;

    % Update.
    s(action) = s(action) + reward;
    f(action) = f(action) + 1 - reward;

    % Record.
    Action(t) = action;
    Reward(t) = reward;
    [bestVal, bestAction] = max(theta(:, covariateIndex));
    Prob(t) = action == bestAction;
end

