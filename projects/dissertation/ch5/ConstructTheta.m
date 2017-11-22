%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% Automatic Parameter Constructor
%
%     Returns distribution over P(Y | do(X), U) for some number of U that
%     are generated so as to evenly spread the probability mass across
%     arms, yielding a uniquely best arm for each intent condition
%
%     Inputs:
%       pMin, pMax: min and max of payout percentages for each arm
%       K: number of arms
%
%     Constraints: for simplicity, we assume that K is an even power of 2
%     that is greater than or equal to 2
%
%     Outputs:
%       [theta, covariateIndexEqn]:
%         - theta: a matrix of payout percentages for each arm and U
%         condition
%         - covariateIndexEqn: an equation that can be evaluated in terms
%         of U to determine a uniquely identifying covariate instantiation
%
%
%     2016 by Andrew Forney
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function [theta, covariateIndexEqn] = ConstructTheta(pMin, pMax, K, randomize)
    theta = ones(K, K);
    step = (pMax - pMin) / (K - 1);
    iter = 0;
    covariateIndexEqn = '';
    
    % Construct the payout parameter matrix
    for intent = 1:K
        for arm = 1:K
            if iter >= K
                iter = 0;
            end
            if randomize
                theta(arm, intent) = pMin + (pMax - pMin) * rand;
            else
                theta(arm, intent) = pMin + (iter * step);
            end
            iter = iter + 1;
        end
        iter = iter - 1;
    end
    
    % Construct the covariate index equation
    for i = 1:log2(K)
        covariateIndexEqn = strcat(covariateIndexEqn, '+', num2str(2^(i-1)), '*U(', num2str(i), ')');
    end
    covariateIndexEqn = strcat(covariateIndexEqn, '+1');
end

