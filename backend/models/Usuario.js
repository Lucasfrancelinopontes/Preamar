import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import bcrypt from 'bcryptjs';

export const Usuario = sequelize.define('Usuario', {
  ID_usuario: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nome: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Nome é obrigatório'
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: {
      msg: 'Este email já está cadastrado'
    },
    validate: {
      isEmail: {
        msg: 'Email inválido'
      },
      notEmpty: {
        msg: 'Email é obrigatório'
      }
    }
  },
  senha: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'Senha é obrigatória'
      },
      len: {
        args: [6, 255],
        msg: 'Senha deve ter no mínimo 6 caracteres'
      }
    }
  },
  funcao: {
    type: DataTypes.ENUM('Administrador', 'Coletor', 'Revisor', 'Digitador'),
    allowNull: false,
    defaultValue: 'Coletor',
    validate: {
      isIn: {
        args: [['Administrador', 'Coletor', 'Revisor', 'Digitador']],
        msg: 'Função inválida'
      }
    }
  },
  ativo: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ultimo_login: {
    type: DataTypes.DATE,
    allowNull: true
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  hooks: {
    // Hash da senha antes de salvar
    beforeCreate: async (usuario) => {
      if (usuario.senha) {
        const salt = await bcrypt.genSalt(10);
        usuario.senha = await bcrypt.hash(usuario.senha, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('senha')) {
        const salt = await bcrypt.genSalt(10);
        usuario.senha = await bcrypt.hash(usuario.senha, salt);
      }
    }
  }
});

// Método para comparar senha
Usuario.prototype.compararSenha = async function(senhaFornecida) {
  return await bcrypt.compare(senhaFornecida, this.senha);
};

// Método para retornar dados seguros do usuário (sem senha)
Usuario.prototype.toSafeObject = function() {
  return {
    ID_usuario: this.ID_usuario,
    nome: this.nome,
    email: this.email,
    funcao: this.funcao,
    ativo: this.ativo,
    ultimo_login: this.ultimo_login,
    createdAt: this.createdAt
  };
};