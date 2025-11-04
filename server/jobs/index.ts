import { initializeDailyTasks } from './daily-tasks';
import { initializeProtectionScoreJobs } from './lifescore-jobs';
import { scheduleAdaptiveLearning } from './adaptive-learning';
import { scheduler } from './scheduler';
import { log } from '../vite';

/**
 * Initialize all background jobs
 * Call this when the server starts
 */
export function initializeJobs() {
  log('[Jobs] Initializing background jobs...');

  // Daily maintenance tasks (midnight UTC)
  initializeDailyTasks();

  // Protection Score updates (every 6 hours)
  initializeProtectionScoreJobs();

  // Adaptive learning analysis (every 2 days)
  scheduleAdaptiveLearning();

  log(`[Jobs] ${scheduler.listJobs().length} jobs scheduled`);
}

/**
 * Shutdown all jobs gracefully
 */
export function shutdownJobs() {
  log('[Jobs] Shutting down all jobs...');
  scheduler.stopAll();
}

// Export scheduler for manual job management
export { scheduler };

// Export milestone checker for on-demand use
export { checkMilestones } from './achievement-checker';

// Export adaptive learning for on-demand use
export { analyzeUserOnDemand, runAdaptiveLearning } from './adaptive-learning';
