%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% Sample Experimental Dist
%   Samples the observational distribution N_obs times and returns a matrix
%   of arm-payout counts
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function pObs = SampleObservationalDist(K, confounders, N_obs, theta, covariateIndexEqn, intentEqn, noisy)
pObs = ones(K, 2);

% Data is sampled rather than computed
if noisy
    % Set up covariate configuration for this sample
    for t=1:N_obs
        currentFactors = zeros(confounders, N_obs);
        for i = 1:confounders
            currentFactors(i, t) = rand <= 0.5;
        end

        U = currentFactors(:,t);
        I = eval(intentEqn);
        covariateIndex = eval(covariateIndexEqn);

        % Choose action.
        action = I;
        currentTheta = theta(action, covariateIndex);

        % Pull lever. We'll find the index of theta through some clever maths
        % with the value of B and D (see covariate index)
        reward = rand <= currentTheta;

        % Update.
        pObs(action, 2) = pObs(action, 2) + reward;
        pObs(action, 1) = pObs(action, 1) + 1 - reward;
    end
    
% Data is computed rather than sampled
else
    for arm = 1:K
        pObs(arm, :) = [(1-theta(arm, arm)) * N_obs / K, (theta(arm, arm)) * N_obs / K];
    end
end

