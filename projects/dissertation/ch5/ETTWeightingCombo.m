%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% ETT Combined XArm + XIntent Weighting
%
%     Returns weighted bandit arm successes and failures based on
%     computations made using the counterfactual ETT; uses inverse variance
%     to weight the samples in the computed term and also links
%     different-arm, same-same intent conditions as well as prior
%     connections on intents between arms
%
%     Inputs:
%       s, f: successes and failures for each arm under each intent cond
%       K: number of bandit arms
%       pObs, pExp: observational and experimental data sets from start
%       I: witnessed intent to compute
%
%     Outputs:
%       weightedS, weightedF: ETT weighted successes and failures
%       pWeightedSucc: expected reward vector conditioned on intent I that
%       is the inverse-variance-weighted combination of samples and the
%       XIntent heuristic
%
%     2017 by Andrew Forney
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function [weightedS, weightedF, pWeightedSucc] = ETTWeightingCombo(s, f, K, pObs, pExp, I)
    pWeightedSucc = zeros(K, 1);
    currS = s(:, I);
    currF = f(:, I);
    totals = currS + currF;
    
    % First, get the sample reward estimates and variances
    E_samps = currS ./ totals;
    sampVars = zeros(1, K);
    
    for arm = 1:K
        [m, var] = betastat(s(arm, I), f(arm, I));
        sampVars(arm) = var;
    end
    
    % Next, get the XInt + XArm computed estimates for E[Y_x|i] as well as the
    % variances associated with each arm's computation
    [E_xint, xintVars] = Heuristic_XIntent(s, f, K, pObs, pExp, I);
    [E_xarm, xarmVars] = Heuristic_XArm(s, f, K, pObs, pExp, I);
    
    % Finally, combine E_samps and E_comps by an inverse-variance weighting
    for arm = 1:K
        pWeightedSucc(arm) = InverseVarianceWeighting([E_samps(arm), sampVars(arm); E_xint(arm), xintVars(arm); E_xarm(arm), xarmVars(arm)]);
    end
    
    % Compute weighted s and f values based on above
    weightedS = times(totals, pWeightedSucc);
    weightedF = times(totals, (1 - pWeightedSucc));
end