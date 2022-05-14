const express = require('express');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');
const pick = require('lodash/pick');

const app = express();
const server = require('http').Server(app);
const dotenv = require('dotenv');
const cors = require('cors');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const { postgres } = require('./helper/postgres');
const errorHandler = require('./middlewares/error-handler');
const jwt = require('./middlewares/jwt');

// Import Routes
const authRoute = require('./routes/auth');
const userRoute = require('./routes/user');
const firebaseRoute = require('./routes/firebase');
const requestRoute = require('./routes/request');
const timesheetRoute = require('./routes/timesheet');
const adminRoute = require('./routes/admin');
const engineRoute = require('./routes/engine');
const userLeaveRoute = require('./routes/userLeave');

dotenv.config();

const config = require('../config.json');
const safeConfigKeys = require('./configWhitelist.json');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const corsOption = {
  origin: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  credentials: true
};
app.use(cors(corsOption));
app.use(cookieParser());

app.use((req, _, next) => {
  req.postgres = postgres;
  next();
});

let indexHtml;
try {
  indexHtml = fs.readFileSync(path.join(__dirname, '../build/index.html'), 'utf8');
  const safeConfig = pick(config, safeConfigKeys);
  const $indexHtml = cheerio.load(indexHtml);
  const newConfig = `<script id="injected-config">
        window['config'] = ${JSON.stringify(safeConfig)}
    </script>`;

  if ($indexHtml('#injected-config').length) {
    $indexHtml('#injected-config').replaceWith(newConfig);
  }
  indexHtml = $indexHtml.html();
  fs.writeFile(path.join(__dirname, '../build/index.html'), indexHtml, (err) => {
    if (err) {
      console.log(err);
    }
    console.log('writed html file');
  });
} catch (e) {
  indexHtml = 'Your client build is missing index.html ( ; __ ; ) ';
  console.log('Client or config error', e);
}

// server
app.use(express.static(path.join(__dirname, '../build')));
app.get(/^(?!\/api\/)/, (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// use JWT auth to secure the api
app.use(jwt());

// Routes
app.use('/', authRoute);
app.use('/', userRoute);
app.use('/', firebaseRoute);
app.use('/', requestRoute);
app.use('/', timesheetRoute);
app.use('/', engineRoute);
app.use('/', adminRoute);
app.use('/', userLeaveRoute);

// send back a 404 error for any unknown api request
app.use((req, res, next) => {
  next(res.status(404).send({ error: 'Api not found' }));
});

app.use(errorHandler);

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log('App is listening on port ', port);
});
