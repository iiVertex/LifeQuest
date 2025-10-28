import cron, { type ScheduledTask } from 'node-cron';
import { log } from '../vite';

/**
 * Background Jobs Scheduler
 * Manages all automated tasks for the AI Lifestyle Companion
 */

export class JobScheduler {
  private jobs: Map<string, ScheduledTask> = new Map();

  /**
   * Schedule a new job
   */
  schedule(name: string, cronExpression: string, task: () => void | Promise<void>): void {
    // Cancel existing job with same name if exists
    if (this.jobs.has(name)) {
      this.jobs.get(name)?.stop();
    }

    const job = cron.schedule(cronExpression, async () => {
      const startTime = Date.now();
      log(`[Job] Starting: ${name}`);
      
      try {
        await task();
        const duration = Date.now() - startTime;
        log(`[Job] Completed: ${name} (${duration}ms)`);
      } catch (error) {
        log(`[Job] Failed: ${name} - ${error}`);
        console.error(`Job ${name} error:`, error);
      }
    });

    this.jobs.set(name, job);
    log(`[Job] Scheduled: ${name} (${cronExpression})`);
  }

  /**
   * Run a job immediately (for testing)
   * Note: Manual job execution - you can also call the job's task function directly
   */
  async runNow(name: string): Promise<void> {
    log(`[Job] Manual execution requested: ${name}`);
    // Note: node-cron doesn't expose a way to trigger jobs manually
    // For testing, call the job's task function directly instead
  }

  /**
   * Stop a specific job
   */
  stop(name: string): void {
    const job = this.jobs.get(name);
    if (job) {
      job.stop();
      this.jobs.delete(name);
      log(`[Job] Stopped: ${name}`);
    }
  }

  /**
   * Stop all jobs
   */
  stopAll(): void {
    this.jobs.forEach((job, name) => {
      job.stop();
      log(`[Job] Stopped: ${name}`);
    });
    this.jobs.clear();
  }

  /**
   * Get list of all scheduled jobs
   */
  listJobs(): string[] {
    return Array.from(this.jobs.keys());
  }
}

// Singleton instance
export const scheduler = new JobScheduler();
