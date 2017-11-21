%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% Bandit Comparison
%
% Estimate the probability of pulling the optimal lever and the regret
% as a function of the number of trials for different bandit algorithms.
% The rewards follow a Bernoulli distribution with unknown biases.
%
%     2016 by Andrew Forney
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%% Get ready.
close all;
clc;

%% Script configuration.

sim_name = 'bandits_2arm_mamabuc';
sim_desc = 'Invisible Confounding';

T = 2000; % Number of timesteps
N = 1000; % Number of Monte Carlo samples
K = 2;    % Number of arms
U = 2; % Number of unobserved confounders
uConds = 4;  % Number of unique confounder instantiations

% algorithms
algorithms = {'rdcPi1', 'rdcPi2', 'rdcCombo'};
names  = {'RDC^{P_1}', 'RDC^{P_2}', 'HIRDC^{P_1, P_2}'};
%algorithms = {'rdcPi1', 'rdcPi2'};
%names  = {'RDC^{\pi 1}', 'RDC^{\pi 2}'};
%algorithms = {'rdcCombo'};
%names  = {'RDC^{\pi 1}'};

colors = {[1 0 0], [0 1 0], [0 0 1], [0.3 0 0.7], [0.5 0.5 0], [1 0.5 0], [1, 0.5, 1], [0.5, 1, 1], [1, 1, 0.5], [0 0.5 0.5]};


% Bandit parameters.

% We'll configure our intent equations and payout parameters first
% There will be 1 intent equation for each of A agent-types
intentEqns = {'U(2)+1', 'xor(U(1), U(2))+1', 'U(2)+1'};

% Manually configure payout parameters
% From our paper, we have B = U(1), and D = U(2)
covariateIndexEqn = 'U(1)+2*U(2)+1';
% theta := P(y | do(X), S, R)
    % S =    0    0    1    1
    % R =    0    1    0    1
theta   = [[0.7, 0.8, 0.6, 0.7]     
           [0.9, 0.7, 0.7, 0.5]];


%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%% Initialize.
% Total number of algorithms.
nAlgs = length(algorithms);

% Sums of actions, rewards, and times best action chosen.
ActionSum = zeros(nAlgs, T);
RewardSum = zeros(nAlgs, T);
ProbSum   = zeros(nAlgs, T);
CondSum   = zeros(nAlgs, uConds);

RoundRewards = zeros(nAlgs, N);
RoundRegrets = zeros(nAlgs, N);
currentFactors = cell(N, T);

pActionToPlot = zeros(nAlgs, T);
regretToPlot = zeros(nAlgs, T);

% Open figure.
h = figure();
set(h, 'Position', [100, 100, 1400, 500]);

% Determine covariates for this run
for n=1:N
    for t=1:T
        for i = 1:U
            currentFactors{n, t}(i) = rand <= 0.5;
        end
    end
end

for alg=1:nAlgs
    tic;
    % Get handle of algorithm to run.
    fprintf('Running algorithm: %s\n', algorithms{alg});
    fhandle = str2func(algorithms{alg});

    %% Generate Monte Carlo simulations.
    for n=1:N
        % Generate one run.
        [Action, Reward, Prob, Conds] = fhandle(theta, K, uConds, T, currentFactors(n, :), intentEqns, covariateIndexEqn);

        % Collect stats.
        RewardSum(alg, :) = RewardSum(alg, :) + Reward;
        ActionSum(alg, :) = ActionSum(alg, :) + Action;
        ProbSum(alg, :)   = ProbSum(alg, :) + Prob;
        CondSum(alg, :)   = CondSum(alg, :) + Conds;
        
        RoundRewards(alg, n) = sum(Reward);
        optRegret = 0;
        for r=1:uConds
            optRegret = optRegret + max(theta(:, r))*Conds(r);
        end
        RoundRegrets(alg, n) = optRegret - sum(Reward);
        
        % Report progress.
        if (mod(n,100) == 0)
            time = toc;
            fprintf('Samples: %5d in %8.2f seconds\n', n, time);
        end
        time = toc;
        fprintf('Sim: %5d in %8.2f seconds\n', n, time);
    end
    
    %% Monte Carlo estimates.
    PAction = ProbSum(alg, :)/N;
    pActionToPlot(alg, :) = PAction;
    optRegret = 0;
    for r=1:uConds
        optRegret = optRegret + max(theta(:,r))*(CondSum(alg,r)/(N));
    end
    Regret  = optRegret * [1:T]/T - cumsum(RewardSum(alg, :)/N);
    regretToPlot(alg, :) = Regret;
    
    %% Plot.
    
    % axes for plots
    probAxis   = [0, T, 0.2, 1.0];
    regretAxis = [0, T, 0, 300];
    N_PLOTS = 2;
    
    if N_PLOTS < 3
        % Plot probability of pulling the best action.
        subplot(1,N_PLOTS,1);
        plot(PAction, 'Color', colors{alg});
        hold on;
        title('Probability of Optimal Action');
        xlabel('Trial');
        ylabel('Probability');
        axis square;
        axis(probAxis);

        % Plot regret.
        subplot(1,N_PLOTS,2);
        plot(Regret, 'Color', colors{alg});
        hold on;
        title('Regret');
        xlabel('Trial');
        ylabel('Cum. Regret');
        axis square;
        axis(regretAxis);
    end
    
    % Plot internals.
    %{
    if INTERNALS_REP
        subplot(1,1,1);
        plot(InternalQ1Sum(alg, :), 'Color', colors{1});
        hold on;
        plot(InternalQ2Sum(alg, :), 'Color', colors{2});
        plot(InternalQ3Sum(alg, :), 'Color', colors{3});
        plot(InternalQ4Sum(alg, :), 'Color', colors{4});
        title('Parametric Convergence');
        xlabel('Trial');
        ylabel('Difference from True Param');
        axis square;
        axis([0, T, 0, 0.2]);
    end
    %}
    
    drawnow;
end

%% Finish Plot.
% Place legend.
if N_PLOTS < 3
    subplot(1,N_PLOTS,1);
    legend(names, 'Location', 'SouthEast');
    subplot(1,N_PLOTS,2);
    legend(names, 'Location', 'SouthEast');
end

%{
if INTERNALS_REP
    subplot(1,1,1);
    legend({'do(X=0), Z=0', 'do(X=1), Z=0', 'do(X=0), Z=1', 'do(X=1), Z=1'}, 'Location', 'SouthEast');
end
%}

%% Finish Analysis.
% Compare performance of each algorithm
statsFile = fopen(strcat('stats_', sim_name, '.txt'), 'w');
fprintf(statsFile, '%s: %s\n', sim_name, sim_desc);
theta
for alg1 = 1:nAlgs
    for alg2 = alg1:nAlgs
        if alg1 == alg2
            continue;
        end
        [h,p,ci,stats] = ttest2(RoundRegrets(alg1, :), RoundRegrets(alg2, :));
        fprintf(statsFile, '-----------------------------------------\n');
        fprintf(statsFile, '%s vs. %s\n', names{alg1}, names{alg2});
        fprintf(statsFile, 'Significant? %8.1f;  p = %8.4f\n', h, p);
        fprintf(statsFile, 't = %8.4f;  df = %8.4f;  sd = %8.4f\n', stats.tstat, stats.df, stats.sd);
    end
end

csvwrite(strcat('regrets_', sim_name, '.csv'), regretToPlot);
csvwrite(strcat('pAction_', sim_name, '.csv'), pActionToPlot);

% END OF SCRIPT