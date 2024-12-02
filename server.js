const dotenv = require('dotenv');
const http = require('http');
const logger = require('morgan');

process.on('uncaughtException', (err) => {
  console.log('UNCAUGHT EXCEPTION! SERVER IS SHUTTING DOWN');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');
const { config } = require('./config');

const server = http.createServer(app);

const runningEnvironment = config.NODE_ENV;

// if (runningEnvironment === 'development') {
console.log(runningEnvironment);
app.use(logger('dev'));
// }

const PORT = Number(config.PORT);

const appServer = server.listen(PORT, () =>
  console.log(`Server running in ${runningEnvironment} mode on port ${PORT}`),
);

process.on('unhandledRejection', (err) => {
  console.log(err.name, err.message);
  console.log('UNHANDLED REJECTION! SERVER IS SHUTTING DOWN');
  appServer.close(() => {
    process.exit(1);
  });
});
