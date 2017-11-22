%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% Data Augmentation Intent sampler
%   Completes a set of experimental data with imputed intent through DA
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function [newS, newF, newIntents] = DA_IStep(s, f, intents, p, m, K, pExp)
% Holder for P(I | X, Y) indexed by:
% arm, intent, payout
pIntent = ones(K, K, 2);

% For each arm-payout pair in the experimental data, we'll sample
% its expected intent:
for arm = 1:K
    for intent = 1:K
        for payout = 0:1
            numerator = m(intent) * (p(arm, intent) ^ payout) * ((1 - p(arm, intent)) ^ (1 - payout));
            denominator = 0;
            for intentPrime = 1:K
                denominator = denominator + m(intentPrime) * (p(arm, intentPrime) ^ payout) * ((1 - p(arm, intentPrime)) ^ (1 - payout));
            end
            pIntent(arm, intent, payout + 1) = numerator / denominator;
        end
    end
end

% Emulate the newly sampled intent probability values across each
% experimental data point; we'll add these imputed arm-intent-payout
% triplets to the newS, newF, and newIntents output
newS = s;
newF = f;
newIntents = intents;
for arm = 1:K
    for payout = 0:1
        samples = pExp(arm, payout + 1);
        currentTarget = pIntent(arm, :, payout + 1);
        % Normalize so that our probs sum to 1
        currentTarget = currentTarget / sum(currentTarget);
        currentTarget = currentTarget * samples;

        if payout == 0
            newF(arm, :) = newF(arm, :) + currentTarget;
        else
            newS(arm, :) = newS(arm, :) + currentTarget;
        end
        newIntents = newIntents + currentTarget;

    end
end