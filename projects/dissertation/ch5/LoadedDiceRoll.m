%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% Loaded Dice Role
%   Takes in the probabilities of an N sided die with weights 
%   corresponding to each side, and then rolls it, returning the side that
%   came up
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

function side = LoadedDiceRoll(p)
N = length(p);

% Normalize p
p = p / sum(p);

% Create striatum vector such that if:
% p = [p1 p2 p3 p4 ... pn]
% Then the "cutoffs" for each side roll will be:
% cutoffs = [p1 p1+p2 p1+p2+p3 ...]
cutoffs = cumsum(p);
roll = rand;

for side = N:-1:2
    if roll >= cutoffs(side - 1)
        break;
    end
end