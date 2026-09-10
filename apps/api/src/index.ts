import app from './app.js';

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
  console.log(`======================================================`);
  console.log(`   DESIGNFORGE API SERVER STARTED ON PORT ${PORT}`);
  console.log(`   DEMO_MODE: ${process.env.DEMO_MODE === 'true' ? 'ACTIVE (Offline Deterministic Evaluator)' : 'AI Mode'}`);
  console.log(`   DESIGN. DEFEND. IMPROVE.`);
  console.log(`======================================================`);
});

// Graceful shutdown handling
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received. Closing HTTP server gracefully.');
  server.close(() => {
    console.log('HTTP server closed.');
  });
});
