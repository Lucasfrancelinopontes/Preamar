const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class StatusChecker {
  constructor() {
    this.pidFile = path.join(__dirname, '..', 'preamar.pid');
  }

  async checkStatus() {
    console.log('🔍 Verificando status do Sistema Preamar...\n');

    // Verificar arquivo PID
    if (!fs.existsSync(this.pidFile)) {
      console.log('❌ Sistema não está rodando (arquivo PID não encontrado)');
      await this.checkPorts();
      return;
    }

    try {
      const pidsData = JSON.parse(fs.readFileSync(this.pidFile, 'utf8'));
      console.log('📖 Informações do sistema:');
      console.log(`   Iniciado em: ${new Date(pidsData.timestamp).toLocaleString()}`);
      console.log(`   PID Backend: ${pidsData.backend || 'N/A'}`);
      console.log(`   PID Frontend: ${pidsData.frontend || 'N/A'}\n`);

      // Verificar se os processos ainda estão rodando
      let backendRunning = false;
      let frontendRunning = false;

      if (pidsData.backend) {
        backendRunning = await this.isProcessRunning(pidsData.backend);
      }

      if (pidsData.frontend) {
        frontendRunning = await this.isProcessRunning(pidsData.frontend);
      }

      console.log('📊 Status dos serviços:');
      console.log(`   Backend (3001): ${backendRunning ? '✅ Rodando' : '❌ Parado'}`);
      console.log(`   Frontend (3000): ${frontendRunning ? '✅ Rodando' : '❌ Parado'}\n`);

      // Verificar portas
      await this.checkPorts();

      if (backendRunning && frontendRunning) {
        console.log('✅ Sistema Preamar está funcionando corretamente!');
        console.log('📍 Acesse: http://localhost:3000');
      } else {
        console.log('⚠️  Sistema está parcialmente ou totalmente parado');
        console.log('💡 Execute "npm start" para iniciar o sistema');
      }

    } catch (error) {
      console.error('❌ Erro ao verificar status:', error.message);
    }
  }

  async isProcessRunning(pid) {
    try {
      await this.execCommand(`tasklist /FI "PID eq ${pid}"`);
      return true;
    } catch (error) {
      return false;
    }
  }

  async checkPorts() {
    console.log('🔍 Status das portas:');

    // Verificar porta 3001
    try {
      const result3001 = await this.execCommand('netstat -ano | findstr :3001');
      if (result3001.trim()) {
        console.log('   Porta 3001: ✅ Em uso');
      } else {
        console.log('   Porta 3001: ❌ Livre');
      }
    } catch (error) {
      console.log('   Porta 3001: ❌ Livre');
    }

    // Verificar porta 3000
    try {
      const result3000 = await this.execCommand('netstat -ano | findstr :3000');
      if (result3000.trim()) {
        console.log('   Porta 3000: ✅ Em uso');
      } else {
        console.log('   Porta 3000: ❌ Livre');
      }
    } catch (error) {
      console.log('   Porta 3000: ❌ Livre');
    }

    console.log('');
  }

  execCommand(command) {
    return new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }
}

const checker = new StatusChecker();
checker.checkStatus().catch(error => {
  console.error('❌ Falha ao verificar status:', error.message);
  process.exit(1);
});