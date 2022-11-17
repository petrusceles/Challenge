const express = require('express');
const path = require('path');
const logger = require('morgan');

const indexRouter = require('./routes/index');

const app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/api/v1', indexRouter);

app.listen(3000, () => {
  console.log("Server running at http://127.0.0.1:3000")
  })