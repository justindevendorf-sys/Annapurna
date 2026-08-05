import cron from 'node-cron';
import { config } from './config.js';
import { sendWeeklyReport } from './weeklyReport.js';

export function startScheduler() {
  cron.schedule(
    config.reportCron,
    async () => {
      try {
        await sendWeeklyReport();
      } catch (err) {
        console.error('Weekly report failed:', err.message);
      }
    },
    { timezone: config.reportTimezone }
  );

  console.log(
    `Weekly report scheduled: "${config.reportCron}" (${config.reportTimezone})`
  );
}
