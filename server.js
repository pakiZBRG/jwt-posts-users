const express = require('express');
const postRoute = require('./routes/posts');
const userRoute = require('./routes/users');
const mongoose = require('mongoose');
require('dotenv/config');
const app = express();

//Body Parser
app.use(express.urlencoded({extended: false}));
app.use(express.json());

//Routes
app.use('/posts', postRoute);
app.use('/users', userRoute);

mongoose.connect(process.env.DB_CONNECT, {useNewUrlParser: true, useUnifiedTopology: true});

const PORT = process.env.PORT || 5000;
app.listen(PORT);