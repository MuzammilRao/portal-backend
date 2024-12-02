const { connectDB } = require('./db/db');
const express = require('express');
const routes = require('./routes');
const cors = require('cors');
const AppError = require('./utils/appError');
const GlobalErrorMiddleware = require('./middleware/globalError');

const app = express();
const path = require('path');
connectDB();

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
app.use(express.static(path.join(__dirname, 'public')));
app.set('trust proxy', true);
app.use(
  cors({
    // origin: 'https://billing.inventixcrew.com',
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    credentials: true,
  }),
);

app.use('/api/v1', routes);

app.get('/', (req, res) => {
  return res.status(200).json({ message: 'Hello From Express App ***' });
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find route with ${req.originalUrl} this Url!`, 404));
});

app.use(GlobalErrorMiddleware);

module.exports = app;
