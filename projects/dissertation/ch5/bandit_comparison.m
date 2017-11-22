%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%
%
% Bandit Comparison
%
% Estimate the probability of pulling the optimal lever and the regret
% as a function of the number of trials for different bandit algorithms.
%
%     2016 by Andrew Forney
%
%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%%

%% Get ready.
close all;
clear all;
clc;

%% Script configuration.

sim_name = 'bandits_4arm_side_info';
sim_desc = 'Greedier_Casino';

T = 300; % Number of timesteps
N = 100; % Number of Monte Carlo samples
K = 4;    % Number of arms
U = log2(K); % Number of unobserved confounders
uConds = K;  % Number of unique confounder instantiations
N_obs = K * 10000; % Number of observational samples, per arm
N_exp = K * 10000; % Number of experimental samples, per arm
randomize = false; % Randomizes payout parameters if true
noisy_data = true; % Samples, rather than computes, pExp and pObs if true

% algorithms
algorithms = {'tsRDTCombo', 'tsIntentObs', 'tsIntent', 'tsVanilla'};
names  = {'TS^{RDT*}', 'TS^{RDT+}', 'TS^{RDT}', 'TS'};

colors = {[1 0 0], [0 1 0], [0 0 1], [0.3 0 0.7], [0.5 0.5 0], [1 0.5 0], [1, 0.5, 1], [0.5, 1, 1], [1, 1, 0.5], [0 0.5 0.5]};


% Bandit parameters.

% Un-comment to manually configure parameters, otherwise, let
% ConstructTheta do the parameter configurations for you above
% From our NIPS paper, we have B = U(1), and D = U(2)
intentEqn = 'U(1)+2*U(2)+1';
covariateIndexEqn = intentEqn;
% theta := P(y | do(X), B, D)
    % D =    0    0    1    1
    % B =    0    1    0    1
theta   = [[0.6, 0.2, 0.5, 0.3]     
           [0.3, 0.2, 0.6, 0.5]       
           [0.5, 0.6, 0.3, 0.2]     
           [0.2, 0.5, 0.3, 0.6]];

% pExp := P(Y | do(X))
pExp = SampleExperimentalDist(K, U, N_exp, theta, covariateIndexEqn, intentEqn, noisy_data);

% pObs := P(Y | X)
pObs = SampleObservationalDist(K, U, N_obs, theta, covariateIndexEqn, intentEqn, noisy_data);

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

pActionToPlot = zeros(nAlgs, T);
regretToPlot = zeros(nAlgs, T);

% Open figure.
h = figure();
set(h, 'Position', [100, 100, 1400, 500]);
    
for alg=1:nAlgs
    tic;
    % Get handle of algorithm to run.
    fprintf('Running algorithm: %s\n', algorithms{alg});
    fhandle = str2func(algorithms{alg});
    currentFactors = zeros(U, T);

    %% Generate Monte Carlo simulations.
    for n=1:N
        % Determine covariates for this run
        for t=1:T
            for i = 1:U
                currentFactors(i, t) = rand <= 0.5;
            end
        end
        
        % Generate one run.
        [Action, Reward, Prob, Conds] = fhandle(theta, K, uConds, T, currentFactors, intentEqn, covariateIndexEqn, pObs, pExp);

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
    
    drawnow;
end

%% Finish Plot.
% Place legend.
subplot(1,N_PLOTS,1);
legend(names, 'Location', 'SouthEast');
subplot(1,N_PLOTS,2);
legend(names, 'Location', 'SouthEast');

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