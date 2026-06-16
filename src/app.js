const cors = require('cors');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const env = require('./config/env');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'resolvio-api' });
});

app.use('/api', routes);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
