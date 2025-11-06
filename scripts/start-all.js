const PremarManager = require('./PremarManager');

const manager = new PremarManager();
manager.start().catch(error => {
  console.error('❌ Falha ao iniciar:', error.message);
  process.exit(1);
});