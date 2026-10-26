// src/server.js
// HTTP server entry point.
// Starts the Express app and handles graceful shutdown on SIGTERM.

const app = require('./app');
const env = require('./config/env');
const prisma = require('./config/db');

const PORT = env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`\n🚀  InterviewPilot AI server started`);
  console.log(`   Environment : ${env.NODE_ENV}`);
  console.log(`   Port        : ${PORT}`);
  console.log(`   Health      : http://localhost:${PORT}/api/health\n`);
});

// Graceful shutdown — close DB connection before exiting
const shutdown = async (signal) => {
  console.log(`\n${signal} received — shutting down gracefully...`);
  server.close(async () => {
    await prisma.$disconnect();
    console.log('DB connection closed. Server stopped.\n');
    process.exit(0);
  });
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

// Catch unhandled promise rejections — log and exit so the process doesn't hang
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  server.close(() => process.exit(1));
});
