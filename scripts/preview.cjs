const express = require('../server/node_modules/express');
const path = require('node:path');
const { createApp } = require('../server/app');
const app = createApp({ dataFile: process.env.DATA_FILE });
app.use(express.static(path.join(__dirname, '../dist')));
app.get('/{*path}', (_req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')));
const server = app.listen(Number(process.env.WEB_PORT) || 4173, () => console.log('Production preview is ready'));
for (const sig of ['SIGINT', 'SIGTERM']) process.on(sig, () => server.close(() => process.exit(0)));
