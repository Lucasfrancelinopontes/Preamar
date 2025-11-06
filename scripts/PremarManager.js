const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');

class PremarManager {
  constructor() {
    this.backendProcess = null;
    this.frontendProcess = null;
    this.pidFile = path.join(__dirname, '..', 'preamar.pid');
  }

  async checkDependencies() {
    console.log('🔍 Verificando dependências...');
    
    // Verificar Node.js
    try {
      await this.execCommand('node --version');
      console.log('✅ Node.js detectado');
    } catch (error) {
      throw new Error('❌ Node.js não encontrado. Instale o Node.js primeiro.');
    }

    // Verificar npm no backend
    const backendPath = path.join(__dirname, '..', 'backend');
    if (!fs.existsSync(path.join(backendPath, 'node_modules'))) {
      console.log('📦 Instalando dependências do backend...');
      await this.execCommand('npm install', { cwd: backendPath });
    }

    // Verificar npm no frontend
    const frontendPath = path.join(__dirname, '..', 'form');
    if (!fs.existsSync(path.join(frontendPath, 'node_modules'))) {
      console.log('📦 Instalando dependências do frontend...');
      await this.execCommand('npm install', { cwd: frontendPath });
    }

    console.log('✅ Todas as dependências verificadas');
  }

  async checkPorts() {
    console.log('🔍 Verificando portas...');
    
    try {
      await this.execCommand('netstat -ano | findstr :3001');
      throw new Error('❌ Porta 3001 já está em uso');
    } catch (error) {
      if (error.message.includes('já está em uso')) throw error;
      console.log('✅ Porta 3001 disponível');
    }

    try {
      await this.execCommand('netstat -ano | findstr :3000');
      throw new Error('❌ Porta 3000 já está em uso');
    } catch (error) {
      if (error.message.includes('já está em uso')) throw error;
      console.log('✅ Porta 3000 disponível');
    }
  }

  async startBackend() {
    console.log('🚀 Iniciando backend...');
    
    const backendPath = path.join(__dirname, '..', 'backend');
    
    return new Promise((resolve, reject) => {
      this.backendProcess = spawn('npm', ['run', 'dev'], {
        cwd: backendPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let started = false;

      this.backendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[BACKEND] ${output.trim()}`);
        
        if (output.includes('listening on port 3001') || output.includes('Server running')) {
          if (!started) {
            started = true;
            console.log('✅ Backend iniciado com sucesso na porta 3001');
            resolve();
          }
        }
      });

      this.backendProcess.stderr.on('data', (data) => {
        console.error(`[BACKEND ERROR] ${data.toString().trim()}`);
      });

      this.backendProcess.on('error', (error) => {
        console.error('❌ Erro ao iniciar backend:', error);
        reject(error);
      });

      // Timeout de 30 segundos
      setTimeout(() => {
        if (!started) {
          reject(new Error('Timeout: Backend não iniciou em 30 segundos'));
        }
      }, 30000);
    });
  }

  async startFrontend() {
    console.log('🚀 Iniciando frontend...');
    
    const frontendPath = path.join(__dirname, '..', 'form');
    
    return new Promise((resolve, reject) => {
      this.frontendProcess = spawn('npm', ['run', 'dev'], {
        cwd: frontendPath,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let started = false;

      this.frontendProcess.stdout.on('data', (data) => {
        const output = data.toString();
        console.log(`[FRONTEND] ${output.trim()}`);
        
        if (output.includes('localhost:3000') || output.includes('ready')) {
          if (!started) {
            started = true;
            console.log('✅ Frontend iniciado com sucesso na porta 3000');
            resolve();
          }
        }
      });

      this.frontendProcess.stderr.on('data', (data) => {
        console.error(`[FRONTEND ERROR] ${data.toString().trim()}`);
      });

      this.frontendProcess.on('error', (error) => {
        console.error('❌ Erro ao iniciar frontend:', error);
        reject(error);
      });

      // Timeout de 45 segundos
      setTimeout(() => {
        if (!started) {
          reject(new Error('Timeout: Frontend não iniciou em 45 segundos'));
        }
      }, 45000);
    });
  }

  async savePids() {
    const pids = {
      backend: this.backendProcess?.pid,
      frontend: this.frontendProcess?.pid,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(this.pidFile, JSON.stringify(pids, null, 2));
    console.log('💾 PIDs salvos em preamar.pid');
  }

  async openBrowser() {
    console.log('🌐 Abrindo navegador...');
    
    setTimeout(() => {
      exec('start http://localhost:3000', (error) => {
        if (error) {
          console.log('⚠️  Não foi possível abrir o navegador automaticamente');
          console.log('📍 Acesse manualmente: http://localhost:3000');
        } else {
          console.log('✅ Navegador aberto com sucesso');
        }
      });
    }, 3000);
  }

  async start() {
    try {
      console.log('🏁 Iniciando Sistema Preamar...\n');
      
      await this.checkDependencies();
      await this.checkPorts();
      
      console.log('\n🚀 Iniciando serviços...');
      await this.startBackend();
      await this.startFrontend();
      await this.savePids();
      
      console.log('\n✅ Sistema Preamar iniciado com sucesso!');
      console.log('📍 Frontend: http://localhost:3000');
      console.log('📍 Backend API: http://localhost:3001');
      console.log('\n💡 Para parar o sistema, execute: npm run stop');
      
      await this.openBrowser();
      
      // Manter o processo ativo
      process.on('SIGINT', async () => {
        console.log('\n🛑 Parando sistema...');
        await this.stop();
        process.exit(0);
      });
      
      // Aguardar indefinidamente
      await new Promise(() => {});
      
    } catch (error) {
      console.error('❌ Erro ao iniciar sistema:', error.message);
      await this.stop();
      process.exit(1);
    }
  }

  async stop() {
    console.log('🛑 Parando Sistema Preamar...');
    
    if (this.backendProcess) {
      this.backendProcess.kill('SIGTERM');
      console.log('✅ Backend parado');
    }
    
    if (this.frontendProcess) {
      this.frontendProcess.kill('SIGTERM');
      console.log('✅ Frontend parado');
    }
    
    if (fs.existsSync(this.pidFile)) {
      fs.unlinkSync(this.pidFile);
      console.log('✅ Arquivo PID removido');
    }
  }

  execCommand(command, options = {}) {
    return new Promise((resolve, reject) => {
      exec(command, options, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve(stdout);
        }
      });
    });
  }
}

module.exports = PremarManager;