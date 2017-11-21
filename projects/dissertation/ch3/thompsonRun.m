function [Action, Reward, Prob, Conds] = thompsonRun(theta, T, allFactors)

%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%% Initialize.
s = [1, 1];
f = [1, 1];

Action = zeros(1, T);
Reward = zeros(1, T);
Prob   = zeros(1, T);
Conds  = zeros(1, 4); % B, D binary

%% Execute one run.
for t=1:T
    roundFactors = allFactors(:,t);
    B = roundFactors(1);
    D = roundFactors(2);
    Z = roundFactors(3);
    covariateIndex = B + D * 2 + 1;
    Conds(covariateIndex) = Conds(covariateIndex) + 1;
    
    % Choose action.
    theta_hat = [betarnd(s(1), f(1)), betarnd(s(2), f(2))];
    
    [maxVal, action] = max(theta_hat);
    currentTheta = theta(action, covariateIndex);

    % Pull lever. We'll find the index of theta through some clever maths
    % with the value of B and D (see covariate index)
    reward = rand <= currentTheta;

    % Update.
    s(action) = s(action) + reward;
    f(action) = f(action) + 1 - reward;

    % Record.
    Action(t) = (action == 1);
    Reward(t) = reward;
    [bestVal, bestAction] = max([theta(1, covariateIndex), theta(2, covariateIndex)]);
    Prob(t) = action == bestAction;
end

