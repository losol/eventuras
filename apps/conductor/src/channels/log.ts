/**
 * Log channel adapter
 * Outputs notifications to server console
 */
export async function sendLogNotification(
  message: string,
  priority: string,
  tenantId: string,
  notificationId: string
): Promise<void> {
  const timestamp = new Date().toISOString();
  const priorityPrefix = priority === 'high' ? '[HIGH]' : '[NORMAL]';
  
  console.log(`📢 ${timestamp} ${priorityPrefix} [${tenantId}] [${notificationId}] ${message}`);
}
