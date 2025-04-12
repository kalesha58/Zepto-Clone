import 'dotenv/config';

import { connectDB } from './src/config/connect.js';
import fastify from 'fastify';
import { PORT } from './src/config/config.js';

const start = async () => {
    await connectDB(process.env.MONGO_URL);
    const app = fastify()
    app.listen({ port: PORT, host: '0.0.0.0' }, (err, add) => {
        if (err) {
            console.log(error);

        } else {
            console.log('Server is Runnig on PORT:❤️  🤞', PORT);
        }
    })
};
start();

