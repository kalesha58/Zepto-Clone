import 'dotenv/config';
import { connectDB } from './src/config/connect.js';
import fastify from 'fastify';
import { PORT } from './src/config/config.js';
import fastifySocketIO from 'fastify-socket.io';
import { registerRoutes } from './src/routes/index.js';
import { adminJs, buildAdminRouter } from './src/config/setup.js';

const start = async () => {
    try {
        await connectDB(process.env.MONGO_URL);

        const app = fastify();

        // Register Socket.IO with CORS
        app.register(fastifySocketIO, {
            cors: {
                origin: '*',
            },
            pingInterval: 10000,
            pingTimeout: 5000,
            transports: ['websocket'], // fixed typo: tranPorts ➝ transports
        });

        // Register all application routes
        await registerRoutes(app);
        await buildAdminRouter(app);

        // Start server
        app.listen({ port: PORT, host: '0.0.0.0' }, (err, address) => {
            if (err) {
                console.error('❌ Server failed to start:', err);
            } else {
                console.log(`✅ Server is running on PORT: ❤️ 🤞 http://localhost:${PORT}${adminJs.options.rootPath}`);
            }
        });

        // WebSocket setup
        app.ready().then(() => {
            app.io.on('connection', (socket) => {
                console.log('⚡ New client connected:', socket.id);

                socket.on('joinRoom', (orderId) => {
                    console.log('📦 Client joined room:', orderId);
                    socket.join(orderId);
                });

                socket.on('disconnect', () => {
                    console.log('👋 Client disconnected:', socket.id);
                });
            });
        });
    } catch (error) {
        console.error('❌ Startup error:', error);
    }
};

start();