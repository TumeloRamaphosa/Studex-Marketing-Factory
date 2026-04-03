import dotenv from 'dotenv';
dotenv.config();

class QueueManager {
  constructor() {
    this.queue = [];
    this.processing = false;
  }

  add(item) {
    this.queue.push({ ...item, addedAt: new Date(), status: 'pending', retries: 0 });
  }

  getNext() {
    return this.queue.find(item => item.status === 'pending');
  }

  updateStatus(id, status, error = null) {
    const item = this.queue.find(item => item.id === id);
    if (item) {
      item.status = status;
      item.updatedAt = new Date();
      if (error) item.error = error;
    }
  }

  incrementRetry(id) {
    const item = this.queue.find(item => item.id === id);
    if (item) {
      item.retries++;
      item.lastRetryAt = new Date();
    }
  }

  getAll() {
    return this.queue;
  }

  getStats() {
    return {
      total: this.queue.length,
      pending: this.queue.filter(i => i.status === 'pending').length,
      processing: this.queue.filter(i => i.status === 'processing').length,
      completed: this.queue.filter(i => i.status === 'completed').length,
      failed: this.queue.filter(i => i.status === 'failed').length
    };
  }
}

class RalphLoop {
  constructor(maxRetries = 3) {
    this.maxRetries = maxRetries;
    this.isRunning = false;
    this.currentIteration = 0;
  }

  async execute(task, context = {}) {
    this.isRunning = true;
    this.currentIteration++;
    
    const iteration = this.currentIteration;
    console.log(`[Ralph Loop] Starting iteration ${iteration}`);

    try {
      const result = await task(context);
      console.log(`[Ralph Loop] Iteration ${iteration} completed successfully`);
      this.isRunning = false;
      return result;
    } catch (error) {
      console.error(`[Ralph Loop] Iteration ${iteration} failed:`, error.message);
      
      if (context.retryCount < this.maxRetries) {
        console.log(`[Ralph Loop] Retrying... (${context.retryCount + 1}/${this.maxRetries})`);
        context.retryCount = (context.retryCount || 0) + 1;
        return this.execute(task, context);
      }
      
      console.error(`[Ralph Loop] Max retries reached. Task failed.`);
      this.isRunning = false;
      throw error;
    }
  }

  stop() {
    this.isRunning = false;
    console.log('[Ralph Loop] Stopped');
  }
}

class GSDController {
  constructor() {
    this.queue = new QueueManager();
    this.ralph = new RalphLoop();
    this.isRunning = false;
    this.scheduleInterval = null;
  }

  createContentJob(influencerProfile,场景, platforms) {
    const job = {
      id: `job_${Date.now()}`,
      type: 'create_and_post',
      influencerProfile,
      scenario:场景,
      platforms,
      createdAt: new Date()
    };
    this.queue.add(job);
    console.log(`[GSD] Added job ${job.id} to queue`);
    return job.id;
  }

  async processJob(job) {
    const HiggsfieldClient = (await import('./clients/higgsfield.js')).default;
    const BlotatoClient = (await import('./clients/blotato.js')).default;

    const higgsfield = new HiggsfieldClient();
    const blotato = new BlotatoClient();

    try {
      console.log(`[GSD] Processing job ${job.id}`);
      
      const imageResult = await higgsfield.generateInfluencerImage(
        job.influencerProfile,
        job.scenario
      );
      
      if (imageResult.images && imageResult.images.length > 0) {
        const imageUrl = imageResult.images[0].url;
        
        const content = {
          text: `Check out this amazing creation! #AI #Influencer #Marketing`,
          mediaUrls: [imageUrl]
        };

        await blotato.postToMultiplePlatforms(content, job.platforms);
      }

      this.queue.updateStatus(job.id, 'completed');
      console.log(`[GSD] Job ${job.id} completed`);
      return { success: true, jobId: job.id };
    } catch (error) {
      this.queue.updateStatus(job.id, 'failed', error.message);
      this.queue.incrementRetry(job.id);
      throw error;
    }
  }

  async runCycle() {
    console.log(`[GSD] Running cycle... Queue: ${JSON.stringify(this.queue.getStats())}`);
    
    const job = this.queue.getNext();
    if (!job) {
      console.log('[GSD] No pending jobs');
      return;
    }

    this.queue.updateStatus(job.id, 'processing');

    await this.ralph.execute(
      async (context) => this.processJob(job),
      { retryCount: 0 }
    );
  }

  async start(autoRun = false, intervalMs = 3600000) {
    this.isRunning = true;
    console.log('[GSD] Controller started');
    
    await this.runCycle();

    if (autoRun) {
      this.scheduleInterval = setInterval(() => {
        this.runCycle();
      }, intervalMs);
      console.log(`[GSD] Auto-run enabled: every ${intervalMs / 1000}s`);
    }
  }

  stop() {
    this.isRunning = false;
    if (this.scheduleInterval) {
      clearInterval(this.scheduleInterval);
    }
    this.ralph.stop();
    console.log('[GSD] Controller stopped');
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      queueStats: this.queue.getStats(),
      ralphActive: this.ralph.isRunning
    };
  }
}

export { QueueManager, RalphLoop, GSDController };
export default GSDController;