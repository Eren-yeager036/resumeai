/**
 * Real-Time Notification & SSE Event Listener Simulator
 */

class RealtimeNotificationManager {
  constructor() {
    this.listeners = [];
    this.intervalId = null;
  }

  /**
   * Subscribe to real-time events. Returns unsubscribe function.
   */
  subscribe(callback) {
    this.listeners.push(callback);
    if (!this.intervalId) {
      this.startSimulation();
    }
    return () => {
      this.listeners = this.listeners.filter(cb => cb !== callback);
      if (this.listeners.length === 0 && this.intervalId) {
        clearInterval(this.intervalId);
        this.intervalId = null;
      }
    };
  }

  notify(eventData) {
    this.listeners.forEach(cb => cb(eventData));
  }

  startSimulation() {
    const mockEvents = [
      {
        id: 'evt-1',
        type: 'JOB_MATCH',
        title: 'New High-Match Job Found!',
        message: 'Vercel posted Frontend Developer (94% Match)',
        timestamp: 'Just now',
        badge: '94% Match'
      },
      {
        id: 'evt-2',
        type: 'STATUS_UPDATE',
        title: 'Application Status Update',
        message: 'Stripe moved your application to Under Review',
        timestamp: '2 min ago',
        badge: 'Pending'
      },
      {
        id: 'evt-3',
        type: 'JOB_MATCH',
        title: 'New High-Match Job Found!',
        message: 'Anthropic posted AI Machine Learning Engineer (91% Match)',
        timestamp: '5 min ago',
        badge: '91% Match'
      }
    ];

    let index = 0;
    // Emit periodic background events every 25 seconds
    this.intervalId = setInterval(() => {
      if (this.listeners.length > 0) {
        const evt = mockEvents[index % mockEvents.length];
        this.notify({
          ...evt,
          id: `evt-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
        index++;
      }
    }, 25000);
  }
}

export const realtimeNotifier = new RealtimeNotificationManager();
