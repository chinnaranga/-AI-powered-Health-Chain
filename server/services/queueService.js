/**
 * Asynchronous Non-Blocking Background Job Worker Queue
 * Offloads audit logging, telemetry, and background notifications from main response threads.
 */
class BackgroundJobQueue {
    constructor() {
        this.queue = [];
        this.isProcessing = false;
        this.completedCount = 0;
        this.errorCount = 0;
    }

    enqueue(taskName, taskFn) {
        this.queue.push({ taskName, taskFn, enqueuedAt: Date.now() });
        this.processNext();
    }

    async processNext() {
        if (this.isProcessing || this.queue.length === 0) return;
        this.isProcessing = true;

        const { taskName, taskFn } = this.queue.shift();
        try {
            await taskFn();
            this.completedCount++;
        } catch (err) {
            this.errorCount++;
            console.warn(`[QueueWorker] Task '${taskName}' execution notice:`, err.message);
        } finally {
            this.isProcessing = false;
            if (this.queue.length > 0) {
                setImmediate(() => this.processNext());
            }
        }
    }

    getStats() {
        return {
            pendingTasks: this.queue.length,
            completedTasks: this.completedCount,
            errorTasks: this.errorCount,
            status: this.isProcessing ? 'processing' : 'idle'
        };
    }
}

export const queueService = new BackgroundJobQueue();
export default queueService;
