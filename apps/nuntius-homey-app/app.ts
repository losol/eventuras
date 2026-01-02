'use strict';

import Homey from 'homey';

module.exports = class MyApp extends Homey.App {

  /**
   * onInit is called when the app is initialized.
   */
  async onInit() {
    this.log('Nuntius has been initialized');
    
    // Listen for settings changes
    this.homey.settings.on('set', (key: string) => {
      if (key === 'apiToken') {
        this.log('API Token has been updated');
      }
    });

    // Register Flow action card
    const sendNotificationAction = this.homey.flow.getActionCard('send_notification');
    sendNotificationAction.registerRunListener(async (args) => {
      return await this.sendNotification(args.message, args.channel, args.priority);
    });
  }

  /**
   * Get the API token from settings
   */
  getApiToken(): string {
    return this.homey.settings.get('apiToken') || '';
  }

  /**
   * Get the API URL from settings
   */
  getApiUrl(): string {
    return this.homey.settings.get('apiUrl') || '';
  }

  /**
   * Send a notification via Nuntius conductor
   */
  async sendNotification(message: string, channel: string, priority: string): Promise<void> {
    const apiUrl = this.getApiUrl();
    const apiToken = this.getApiToken();

    if (!apiUrl) {
      throw new Error('API URL is not configured. Please configure it in app settings.');
    }

    if (!apiToken) {
      throw new Error('API Token is not configured. Please configure it in app settings.');
    }

    const url = `${apiUrl}/notifications`;

    this.log(`Sending notification to ${url}`);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiToken}`,
      },
      body: JSON.stringify({
        channel,
        message,
        priority,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to send notification: ${response.status} ${errorText}`);
    }

    const result = await response.json();
    this.log('Notification sent successfully:', result);
  }

}
