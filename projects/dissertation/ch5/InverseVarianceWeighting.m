%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% Inverse Variance Weighting
%   Takes in a 2xN matrix of rows formatted as:
%     [score, variance]
%   ...and returns the inverse-variance weighted average of scores
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function [weightedAvg, err] = InverseVarianceWeighting(M)
    err = false;
    [rows, cols] = size(M);
    if rows == 0
        weightedAvg = 0;
        err = true;
        return;
    end
    
    numerator = 0;
    denominator = 0;
    
    for i = 1:rows
        numerator = numerator + (M(i, 1) / M(i, 2));
        denominator = denominator + (1 / M(i, 2));
    end
    weightedAvg = numerator / denominator;
end