import app from './app.js';
import {config, validateConfig} from './config.js';

validateConfig();
app.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`);
});