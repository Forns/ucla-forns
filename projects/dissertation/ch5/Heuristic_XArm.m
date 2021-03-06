%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% Heuristic XArm
%
%     Returns weighted bandit arm successes and failures based on
%     computations made using the counterfactual ETT; uses inverse variance
%     to weight the samples in the computed term and also links arms by
%     their common priors
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
%       compVars: variances associated with the Xarm computed rewards
%
%     2017 by Andrew Forney
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function [E_comps, compVars] = Heuristic_XArm(s, f, K, pObs, pExp, I)
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
        % Use this to compute the inverse variance weighting of a computed
        % estimate
        if arm ~= I
            % We'll compute the across-arm weighting, so to estimate
            % the current E[Y_arm|intent], we'll use a special summation
            % and averaging:
            currentTerm = 1;
            terms = K - 1;
            acrossArmEst = zeros(1, terms);
            acrossArmVar = zeros(1, terms);
            
            for armPrime = 1:K
                if armPrime == arm
                    continue;
                end
                currVar = 0;
                
                % Compute the numerator
                numSum = 0;
                for intentPrime = 1:K
                    if intentPrime == I
                        continue;
                    end
                    numSum = numSum + pSucc(arm, intentPrime) * pObsX(intentPrime);
                    currVar = currVar + variances(arm, intentPrime);
                end
                numerator = (pExpProb(arm) - numSum) * pSucc(armPrime, I);
                currVar = currVar + variances(armPrime, I);

                % Compute the denominator
                denSum = 0;
                for intentPrime = 1:K
                    if intentPrime == I
                        continue;
                    end
                    denSum = denSum + pSucc(armPrime, intentPrime) * pObsX(intentPrime);
                    currVar = currVar + variances(armPrime, intentPrime);
                end
                denominator = pExpProb(armPrime) - denSum;
                quotient = numerator / denominator;
                
                % Due to sampling error, possible to get division by 0
                if denominator == 0 || quotient > 1 || quotient < 0
                    terms = terms - 1;
                    acrossArmEst = acrossArmEst(1 : (length(acrossArmEst) - 1));
                    acrossArmVar = acrossArmVar(1 : (length(acrossArmVar) - 1));
                    continue;
                end
                acrossArmEst(currentTerm) = quotient;
                acrossArmVar(currentTerm) = currVar;
                currentTerm = currentTerm + 1;
            end

            % We divide the acrossArmVar by 2*(K-1)+1 because we sum the
            % variances used in both the numerator and denominator of
            % the XArm computed reward, which we average here
            acrossArmVar = acrossArmVar / ((2 * terms)+1);
            compVar = mean(acrossArmVar);
            [E_comp, err] = InverseVarianceWeighting([acrossArmEst', acrossArmVar']);
            if E_comp > 1 || E_comp < 0 || err
                E_comp = pSucc(arm, I);
                compVar = variances(arm, I);
            end
        else
            % Still need some estimate for when arm == I, we'll use the obs
            E_comp = pSucc(arm, I);
            compVar = variances(arm, I);
        end

        E_comps(arm) = E_comp;
        compVars(arm) = compVar;
    end
end

