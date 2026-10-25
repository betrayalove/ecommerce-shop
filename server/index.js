const path = require('node:path');
const { createApp } = require('./app');
const port = Number(process.env.PORT || 3080);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be an integer from 1 to 65535');
const app = createApp({ dataFile: process.env.DATA_FILE || path.join(__dirname, 'data/users.json') });
const server = app.listen(port, () => console.log(`API: http://localhost:${port}`));
server.on('error', err => { console.error(err.message); process.exitCode = 1; });
for (const event of ['SIGTERM', 'SIGINT']) process.on(event, () => server.close(() => process.exit(0)));
