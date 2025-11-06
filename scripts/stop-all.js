const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

class PremarStopper {
  constructor() {
    this.pidFile = path.join(__dirname, '..', 'preamar.pid');
  }

  async stop() {
    console.log('🛑 Parando Sistema Preamar...');
    
    try {
      // Verificar se existe arquivo PID
      if (!fs.existsSync(this.pidFile)) {
        console.log('⚠️  Arquivo PID não encontrado. Sistema pode não estar rodando.');
        await this.forceKillPorts();
        return;
      }

      // Ler PIDs salvos
      const pidsData = JSON.parse(fs.readFileSync(this.pidFile, 'utf8'));
      console.log('📖 PIDs encontrados:', pidsData);

      // Parar processos
      if (pidsData.backend) {
        await this.killProcess(pidsData.backend, 'Backend');
      }

      if (pidsData.frontend) {
        await this.killProcess(pidsData.frontend, 'Frontend');
      }

      // Forçar parada nas portas
      await this.forceKillPorts();

      // Remover arquivo PID
      fs.unlinkSync(this.pidFile);
      console.log('✅ Arquivo PID removido');

      console.log('✅ Sistema Preamar parado com sucesso!');

    } catch (error) {
      console.error('❌ Erro ao parar sistema:', error.message);
      console.log('🔧 Tentando parada forçada...');
      await this.forceKillPorts();
    }
  }

  async killProcess(pid, name) {
    try {
      await this.execCommand(`taskkill /F /PID ${pid}`);
      console.log(`✅ ${name} parado (PID: ${pid})`);
    } catch (error) {
      console.log(`⚠️  Não foi possível parar ${name} (PID: ${pid})`);
    }
  }

  async forceKillPorts() {
    console.log('🔧 Liberando portas 3000 e 3001...');

    // Porta 3001 (Backend)
    try {
      const result3001 = await this.execCommand('netstat -ano | findstr :3001');
      const pid3001 = this.extractPidFromNetstat(result3001);
      if (pid3001) {
        await this.execCommand(`taskkill /F /PID ${pid3001}`);
        console.log('✅ Porta 3001 liberada');
      }
    } catch (error) {
      console.log('✅ Porta 3001 já está livre');
    }

    // Porta 3000 (Frontend)
    try {
      const result3000 = await this.execCommand('netstat -ano | findstr :3000');
      const pid3000 = this.extractPidFromNetstat(result3000);
      if (pid3000) {
        await this.execCommand(`taskkill /F /PID ${pid3000}`);
        console.log('✅ Porta 3000 liberada');
      }
    } catch (error) {
      console.log('✅ Porta 3000 já está livre');
    }
  }

  extractPidFromNetstat(netstatOutput) {
    const lines = netstatOutput.split('\n');
    for (const line of lines) {
      const match = line.trim().match(/\s+(\d+)$/);
      if (match) {
        return match[1];
      }
    }
    return null;
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

const stopper = new PremarStopper();
stopper.stop().catch(error => {
  console.error('❌ Falha ao parar:', error.message);
  process.exit(1);
});