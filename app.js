require('dotenv').config();
const bp = require('body-parser');
const express = require('express');
const cors = require('cors');
const initRoute = require('./route/api');
const app = express();

app.use(bp.json());
app.use(bp.urlencoded({ extended: true }));
app.use(cors());
initRoute(app);
app.listen(process.env.APP_PORT, () => {
    console.log(`Example app listening on port ${process.env.APP_PORT}`);
});
