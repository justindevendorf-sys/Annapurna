import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { config } from './config.js';
import entriesRouter from './routes/entries.js';
import { startScheduler } from './scheduler.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, '..', '..', 'public');

const app = express();
app.use(express.json());
app.use('/api/entries', entriesRouter);
app.use(express.static(publicDir));

app.listen(config.port, () => {
  console.log(`Annapurna server running on http://localhost:${config.port}`);
  startScheduler();
});
