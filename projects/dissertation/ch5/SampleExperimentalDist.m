%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% Sample Experimental Dist
%   Samples the experimental distribution N_exp times and returns a matrix
%   of arm-payout counts
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function pExp = SampleExperimentalDist(K, confounders, N_exp, theta, covariateIndexEqn, intentEqn, noisy)
pExp = ones(K, 2);

% Data is sampled rather than computed
if noisy
    % Set up covariate configuration for this sample
    for t=1:N_exp
        currentFactors = zeros(confounders, N_exp);
        for i = 1:confounders
            currentFactors(i, t) = rand <= 0.5;
        end

        U = currentFactors(:,t);
        I = eval(intentEqn);
        covariateIndex = eval(covariateIndexEqn);

        % Choose action.
        action = ceil(rand * K);
        currentTheta = theta(action, covariateIndex);

        % Pull lever. We'll find the index of theta through some clever maths
        % with the value of B and D (see covariate index)
        reward = rand <= currentTheta;

        % Update.
        pExp(action, 2) = pExp(action, 2) + reward;
        pExp(action, 1) = pExp(action, 1) + 1 - reward;
    end
    
% Data is computed rather than sampled
else
    for arm = 1:K
        pExp(arm, :) = [(1-mean(theta(arm,:))) * N_exp / K, mean(theta(arm,:)) * N_exp / K];
    end
end

