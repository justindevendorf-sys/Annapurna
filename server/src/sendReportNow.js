import { sendWeeklyReport } from './weeklyReport.js';

sendWeeklyReport()
  .then((result) => {
    console.log('Done:', result);
    process.exit(0);
  })
  .catch((err) => {
    console.error('Failed to send report:', err.message);
    process.exit(1);
  });
