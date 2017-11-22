%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% Heuristic XIntent
%
%     Returns weighted bandit arm successes and failures based on
%     computations made using the counterfactual ETT; uses inverse variance
%     to weight the samples in the computed term and also links
%     different-arm, same-same intent conditions
%
%     Inputs:
%       s, f: successes and failures for each arm under each intent cond
%       K: number of bandit arms
%       pObs, pExp: observational and experimental data sets from start
%       I: witnessed intent to compute
%
%     Outputs:
%       E_comp: vector of Xarm computed reward estimates for each arm under
%       intent I
%       compVars: variances associated with the XIntent computed rewards
%
%     2017 by Andrew Forney
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function [E_comps, compVars] = Heuristic_XIntent(s, f, K, pObs, pExp, I)
    pSucc = ones(K);
    totals = ones(K);
    pObsProb = ones(1, K); % P(Y | X)
    pExpProb = ones(1, K); % P(Y | do(X))
    pObsX = ones(1, K);    % P(X)
    E_comps = zeros(1, K);
    compVars = zeros(1, K);
    variances = zeros(K);
    
    % Begin by computing the proportion of successes for each arm under
    % each intent condition; for each cell of pSucc(arm, intent), we have:
    % E[Y_{arm} | intent]
    for arm = 1:K
        % We'll also, for convenience, compute P(Y | X), P(X), and P(Y | do(X))
        pObsProb(arm) = pObs(arm, 2) / (pObs(arm, 2) + pObs(arm, 1));
        pExpProb(arm) = pExp(arm, 2) / (pExp(arm, 2) + pExp(arm, 1));
        pObsX(arm) = sum(pObs(arm,:)) / sum(sum(pObs(:,:)));
        for intent = 1:K
            totals(arm, intent) = s(arm, intent) + f(arm, intent);
            pSucc(arm, intent) = s(arm, intent) / (totals(arm, intent));
        end
    end
    
    % Furthermore, we know that each cell of pSucc(arm, intent) where arm
    % is equal to intent will be equivalent to the observational quantity
    for arm = 1:K
        pSucc(arm, arm) = pObsProb(arm);
        pWeightedSucc(arm, arm) = pObsProb(arm);
        % Re-adjust totals based on samples from observations
        totals(arm, arm) = pObs(arm, 1) + pObs(arm, 2);
        for intent = 1:K
            [m, var] = betastat(s(arm, intent), f(arm, intent));
            variances(arm, intent) = var;
        end
    end
    
    % Now, for each cell of pSucc(arm, intent) where arm is NOT equal to
    % intent, we will compute a weighted probability based on the ETT s.t.:
    % E[Y_{arm} | intent] = (P(Y | arm) + P(y | do(arm)) + otherTerms) /
    % P(intent)
    % where otherTerms is a sum over all E[Y_{arm} | intent']P(intent') where
    % intent' != arm and intent' != intent
    for arm = 1:K
        % We'll incrementally develop the new weighted arm parameter, as
        % described above
        E_comp = pExpProb(arm);

        for intentPrime = 1:K
            % Continue if arm and intent are the same, by consistency, or 
            % if intentPrime and intent are the same
            if I == intentPrime
                continue;
            end

            E_comp = E_comp - pSucc(arm, intentPrime) * pObsX(intentPrime);
            compVars(arm) = compVars(arm) + variances(arm, intentPrime);
        end
        
        % Average the variances encountered in the above computation
        compVars(arm) = compVars(arm) / (K - 1);
        E_comp = E_comp / pObsX(I);

        % Finally, complete computation of the new parameter by
        % dividing by the probability of intent
        if E_comp > 1 || E_comp < 0
            E_comps(arm) = pSucc(arm, I);
            compVars(arm) = variances(arm, I);
        else
            E_comps(arm) = E_comp;
        end
    end
end

