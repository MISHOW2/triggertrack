import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import {config} from './config.js';

const app = express();

app.use(helmet());
app.use(cors({
    origin: config.appOrigin,
}));
app.use(express.json());

app.get('/health', (req, res) => {
    res.status(200).json({status: 'ok'});
});

