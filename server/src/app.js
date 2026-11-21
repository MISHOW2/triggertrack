import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {config} from './config.js';
import authRouter from './routes/auth.js';
import {errorHandler} from './middleware/errors.js';

const app = express();

app.use(helmet());
app.use(cors({
    origin: config.appOrigin,
}));
app.use(express.json({limit: '16kb'}));

app.use('/auth', authRouter);

app.get('/health', (req, res) => {
    res.status(200).json({status: 'ok'});
});

app.use(errorHandler);

export default app