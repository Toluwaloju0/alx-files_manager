import express from 'express';
import router from './routes/index';

const app = express();
const port = parseInt(process.env.PORT, 10) || 5000;

app.use('/', router);
app.listen(port);
