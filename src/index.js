/**
 * OcrQueueManager Library
 * Part of CraftThingy Digital Innovation SDK
 * Licensed under Public-Source Corporate Royalty License (PSCRL)
 */

export class OcrQueueManager {
    constructor(config = {}) {
        this.getOcrClient = config.getOcrClient;
        this.onQueueUpdate = config.onQueueUpdate || (() => {});
        this.onItemReady = config.onItemReady || (() => {});
        this.onItemError = config.onItemError || (() => {});
        this.onItemProcessing = config.onItemProcessing || (() => {});

        this.queue = [];
        this.isProcessing = false;
        this.activeIndex = -1;
    }

    /**
     * Add new image to the queue and start background OCR runner
     * @param {Object} item { id, filename, url }
     */
    enqueue(item = {}) {
        const queueItem = {
            id: item.id || this._generateId(),
            filename: item.filename || `ocr_file_${Date.now()}.jpg`,
            url: item.url,
            status: 'pending',
            results: []
        };
        
        this.queue.push(queueItem);
        this.onQueueUpdate(this.queue);
        
        // Start consuming queue in the background
        this._processNext();
    }

    /**
     * Delete queue item by index
     * @param {Number} index 
     */
    dequeue(index) {
        if (index < 0 || index >= this.queue.length) return;
        
        this.queue.splice(index, 1);
        
        if (this.activeIndex === index) {
            this.activeIndex = this.queue.length > 0 ? 0 : -1;
        } else if (this.activeIndex > index) {
            this.activeIndex--;
        }
        
        this.onQueueUpdate(this.queue);
        this._processNext();
    }

    /**
     * Set active selected queue index
     * @param {Number} index 
     */
    selectItem(index) {
        if (index < 0 || index >= this.queue.length) return;
        this.activeIndex = index;
        this.onQueueUpdate(this.queue);
    }

    /**
     * Get all queue items
     */
    getItems() {
        return [...this.queue];
    }

    /**
     * Get active selected item
     */
    getActiveItem() {
        if (this.activeIndex === -1 || this.activeIndex >= this.queue.length) return null;
        return this.queue[this.activeIndex];
    }

    /**
     * Get active selected index
     */
    getActiveIndex() {
        return this.activeIndex;
    }

    /**
     * Clear queue state
     */
    clear() {
        this.queue = [];
        this.activeIndex = -1;
        this.isProcessing = false;
        this.onQueueUpdate(this.queue);
    }

    /**
     * Process next pending item in the queue sequentially
     */
    async _processNext() {
        if (this.isProcessing) return;
        
        const pendingIndex = this.queue.findIndex(item => item.status === 'pending');
        if (pendingIndex === -1) {
            this.isProcessing = false;
            return;
        }
        
        this.isProcessing = true;
        const item = this.queue[pendingIndex];
        item.status = 'processing';
        this.onQueueUpdate(this.queue);
        this.onItemProcessing(item);

        try {
            const client = await this.getOcrClient();
            if (!client) {
                throw new Error("OCR engine client not initialized");
            }

            const img = new Image();
            img.onload = async () => {
                try {
                    const result = await client.recognize(img);
                    let words = [];
                    if (result && result.lines) {
                        result.lines.forEach(line => {
                            if (line.words) {
                                words.push(...line.words);
                            }
                        });
                    }
                    
                    item.results = words;
                    item.status = 'ready';
                    
                    // Auto-select first loaded item
                    if (this.activeIndex === -1) {
                        this.activeIndex = pendingIndex;
                    }
                    
                    this.onItemReady(item, pendingIndex);
                } catch (err) {
                    item.status = 'error';
                    this.onItemError(item, err);
                } finally {
                    this.isProcessing = false;
                    this.onQueueUpdate(this.queue);
                    this._processNext();
                }
            };
            
            img.onerror = (err) => {
                item.status = 'error';
                this.isProcessing = false;
                this.onQueueUpdate(this.queue);
                this.onItemError(item, new Error("Failed to load image element source"));
                this._processNext();
            };

            img.src = item.url;
        } catch (err) {
            item.status = 'error';
            this.isProcessing = false;
            this.onQueueUpdate(this.queue);
            this.onItemError(item, err);
            this._processNext();
        }
    }

    _generateId() {
        return Math.random().toString(36).substring(2, 9);
    }
}
