import { DataTypes } from 'sequelize';
import sequelize from '../db.js';
import { Especie } from './Especie.js';
import { Usuario } from './Usuario.js';
import { Municipio } from './Municipio.js';

export const Peixaria = sequelize.define('Peixaria', {
  ID_peixaria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ID_usuario: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'usuarios',
      key: 'ID_usuario'
    }
  },
  ID_municipio: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'municipios',
      key: 'ID_municipio'
    }
  },
  cod_peixaria: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true
  },
  tipo_estabelecimento: {
    type: DataTypes.STRING(30),
    allowNull: true
  },
  responsavel: {
    type: DataTypes.STRING(255)
  },
  contato: {
    type: DataTypes.STRING(100)
  },
  municipio: {
    type: DataTypes.STRING(100)
  },
  localidade: {
    type: DataTypes.STRING(100)
  },
  nome: {
    type: DataTypes.STRING(255)
  },
  apelido: {
    type: DataTypes.STRING(100)
  },
  naturalidade: {
    type: DataTypes.STRING(100)
  },
  sexo: {
    type: DataTypes.STRING(20)
  },
  idade: {
    type: DataTypes.INTEGER
  },
  atividade_principal: {
    type: DataTypes.STRING(255)
  },
  atividade_secundaria: {
    type: DataTypes.STRING(255)
  },
  total_peixarias: {
    type: DataTypes.INTEGER
  },
  quantos_possui: {
    type: DataTypes.INTEGER
  },
  estado_civil: {
    type: DataTypes.STRING(50)
  },
  numero_familiares: {
    type: DataTypes.INTEGER
  },
  escolaridade: {
    type: DataTypes.STRING(50)
  },
  local_moradia: {
    type: DataTypes.STRING(100)
  },
  possui_registro_inss: {
    type: DataTypes.BOOLEAN
  },
  filiado_colonia: {
    type: DataTypes.BOOLEAN
  },
  qual_colonia: {
    type: DataTypes.STRING(255)
  },
  participa_associacao: {
    type: DataTypes.BOOLEAN
  },
  qual_associacao: {
    type: DataTypes.STRING(255)
  },
  possui_carteira_pescador: {
    type: DataTypes.BOOLEAN
  },
  orgao_emissor_carteira: {
    type: DataTypes.STRING(100)
  },
  possui_plano_saude: {
    type: DataTypes.BOOLEAN
  },
  plano_saude_especificar: {
    type: DataTypes.TEXT
  },
  atividades_renda_familia: {
    type: DataTypes.TEXT
  },
  quem_trabalha_familia: {
    type: DataTypes.TEXT
  },
  tempo_atividade: {
    type: DataTypes.INTEGER
  },
  atividade_comercial: {
    type: DataTypes.STRING(255)
  },
  periodo_comercializacao: {
    type: DataTypes.STRING(100)
  },
  forma_venda: {
    type: DataTypes.STRING(100)
  },
  transporte: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'peixarias',
  timestamps: true
});

export const PeixariaDespesa = sequelize.define('PeixariaDespesa', {
  ID_despesa: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ID_peixaria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'peixarias',
      key: 'ID_peixaria'
    }
  },
  descricao: {
    type: DataTypes.STRING(255)
  },
  quantidade: {
    type: DataTypes.DECIMAL(10, 2)
  },
  custo: {
    type: DataTypes.DECIMAL(10, 2)
  },
  frequencia: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'peixaria_despesas',
  timestamps: true
});

export const PeixariaFornecedor = sequelize.define('PeixariaFornecedor', {
  ID_fornecedor: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ID_peixaria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'peixarias',
      key: 'ID_peixaria'
    }
  },
  nome: {
    type: DataTypes.STRING(255)
  },
  tipo: {
    type: DataTypes.STRING(100)
  },
  telefone: {
    type: DataTypes.STRING(50)
  }
}, {
  tableName: 'peixaria_fornecedores',
  timestamps: true
});

export const PeixariaPescadorFornecedor = sequelize.define('PeixariaPescadorFornecedor', {
  ID_pescador_fornecedor: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ID_peixaria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'peixarias',
      key: 'ID_peixaria'
    }
  },
  tipo: {
    type: DataTypes.ENUM('LOCAL', 'ENTREGA')
  },
  nome: {
    type: DataTypes.STRING(255)
  },
  apelido: {
    type: DataTypes.STRING(100)
  },
  comunidade: {
    type: DataTypes.STRING(100)
  },
  tipo_barco: {
    type: DataTypes.STRING(100)
  },
  numero_pescadores: {
    type: DataTypes.INTEGER
  },
  volume: {
    type: DataTypes.DECIMAL(10, 2)
  },
  volume_medio: {
    type: DataTypes.DECIMAL(10, 2)
  },
  regularidade: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'peixaria_pescador_fornecedores',
  timestamps: true
});

export const PeixariaEspecieComercial = sequelize.define('PeixariaEspecieComercial', {
  ID_especie_comercial: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ID_peixaria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'peixarias',
      key: 'ID_peixaria'
    }
  },
  ID_especie: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'especies',
      key: 'ID_especie'
    }
  },
  especie: {
    type: DataTypes.STRING(255)
  },
  quantidade_fresco: {
    type: DataTypes.DECIMAL(10, 2)
  },
  quantidade_congelado: {
    type: DataTypes.DECIMAL(10, 2)
  },
  preco_compra: {
    type: DataTypes.DECIMAL(10, 2)
  },
  preco_venda: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  tableName: 'peixaria_especies_comerciais',
  timestamps: true
});

export const PeixariaPerda = sequelize.define('PeixariaPerda', {
  ID_perda: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ID_peixaria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'peixarias',
      key: 'ID_peixaria'
    }
  },
  descricao: {
    type: DataTypes.TEXT
  },
  quantidade: {
    type: DataTypes.DECIMAL(10, 2)
  },
  causa: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'peixaria_perdas',
  timestamps: true
});

export const PeixariaPerdaPorEspecie = sequelize.define('PeixariaPerdaPorEspecie', {
  ID_perda_por_especie: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ID_peixaria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'peixarias',
      key: 'ID_peixaria'
    }
  },
  titulo: {
    type: DataTypes.STRING(255)
  },
  causa: {
    type: DataTypes.STRING(255)
  },
  estimativa: {
    type: DataTypes.INTEGER
  },
  destino: {
    type: DataTypes.STRING(255)
  }
}, {
  tableName: 'peixaria_perdas_por_especie',
  timestamps: true
});

export const PeixariaOrigemPescado = sequelize.define('PeixariaOrigemPescado', {
  ID_origem_pescado: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ID_peixaria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'peixarias',
      key: 'ID_peixaria'
    }
  },
  tipo: {
    type: DataTypes.STRING(100)
  },
  pescadores_locais: {
    type: DataTypes.STRING(100)
  },
  outras_localidades_pb: {
    type: DataTypes.STRING(100)
  },
  outros_estados: {
    type: DataTypes.STRING(100)
  },
  outro: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'peixaria_origem_pescado',
  timestamps: true
});

export const PeixariaMercado = sequelize.define('PeixariaMercado', {
  ID_mercado: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ID_peixaria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'peixarias',
      key: 'ID_peixaria'
    }
  },
  tipo_mercado: {
    type: DataTypes.ENUM('LOCAL', 'ESTADUAL', 'NACIONAL', 'INTERNACIONAL')
  },
  volume: {
    type: DataTypes.DECIMAL(10, 2)
  },
  valor: {
    type: DataTypes.DECIMAL(10, 2)
  },
  observacoes: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'peixaria_mercados',
  timestamps: true
});

export const PeixariaMercadoLinha = sequelize.define('PeixariaMercadoLinha', {
  ID_mercado_linha: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ID_mercado: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'peixaria_mercados',
      key: 'ID_mercado'
    }
  },
  especie: {
    type: DataTypes.STRING(255)
  },
  forma_comercializacao: {
    type: DataTypes.STRING(100)
  },
  destino: {
    type: DataTypes.STRING(255)
  },
  volume_medio: {
    type: DataTypes.DECIMAL(10, 2)
  },
  preco_venda: {
    type: DataTypes.DECIMAL(10, 2)
  }
}, {
  tableName: 'peixaria_mercado_linhas',
  timestamps: true
});

export const PeixariaRelacaoTrabalho = sequelize.define('PeixariaRelacaoTrabalho', {
  ID_relacao_trabalho: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  ID_peixaria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'peixarias',
      key: 'ID_peixaria'
    }
  },
  tipo: {
    type: DataTypes.STRING(100)
  }
}, {
  tableName: 'peixaria_relacoes_trabalho',
  timestamps: true
});

export const definePeixariaAssociations = () => {
  Peixaria.belongsTo(Usuario, {
    foreignKey: 'ID_usuario',
    as: 'usuario',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    constraints: true
  });
  Usuario.hasMany(Peixaria, {
    foreignKey: 'ID_usuario',
    as: 'peixarias',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    constraints: true
  });

  Peixaria.belongsTo(Municipio, {
    foreignKey: 'ID_municipio',
    as: 'municipioInfo',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    constraints: true
  });
  Municipio.hasMany(Peixaria, {
    foreignKey: 'ID_municipio',
    as: 'peixarias',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    constraints: true
  });

  Peixaria.hasMany(PeixariaDespesa, {
    foreignKey: 'ID_peixaria',
    as: 'despesas',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });
  PeixariaDespesa.belongsTo(Peixaria, {
    foreignKey: 'ID_peixaria',
    as: 'peixaria',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });

  Peixaria.hasMany(PeixariaFornecedor, {
    foreignKey: 'ID_peixaria',
    as: 'fornecedores',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });
  PeixariaFornecedor.belongsTo(Peixaria, {
    foreignKey: 'ID_peixaria',
    as: 'peixaria',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });

  Peixaria.hasMany(PeixariaPescadorFornecedor, {
    foreignKey: 'ID_peixaria',
    as: 'pescadores_fornecedores',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });
  PeixariaPescadorFornecedor.belongsTo(Peixaria, {
    foreignKey: 'ID_peixaria',
    as: 'peixaria',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });

  Peixaria.hasMany(PeixariaEspecieComercial, {
    foreignKey: 'ID_peixaria',
    as: 'especies_comerciais',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });
  PeixariaEspecieComercial.belongsTo(Peixaria, {
    foreignKey: 'ID_peixaria',
    as: 'peixaria',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });
  PeixariaEspecieComercial.belongsTo(Especie, {
    foreignKey: 'ID_especie',
    as: 'especieInfo',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    constraints: true
  });
  Especie.hasMany(PeixariaEspecieComercial, {
    foreignKey: 'ID_especie',
    as: 'peixarias_comerciais',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE',
    constraints: true
  });

  Peixaria.hasMany(PeixariaPerda, {
    foreignKey: 'ID_peixaria',
    as: 'perdas',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });
  PeixariaPerda.belongsTo(Peixaria, {
    foreignKey: 'ID_peixaria',
    as: 'peixaria',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });

  Peixaria.hasMany(PeixariaPerdaPorEspecie, {
    foreignKey: 'ID_peixaria',
    as: 'perdas_por_especie',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });
  PeixariaPerdaPorEspecie.belongsTo(Peixaria, {
    foreignKey: 'ID_peixaria',
    as: 'peixaria',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });

  Peixaria.hasMany(PeixariaOrigemPescado, {
    foreignKey: 'ID_peixaria',
    as: 'origens_pescado',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });
  PeixariaOrigemPescado.belongsTo(Peixaria, {
    foreignKey: 'ID_peixaria',
    as: 'peixaria',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });

  Peixaria.hasMany(PeixariaMercado, {
    foreignKey: 'ID_peixaria',
    as: 'mercados',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });
  PeixariaMercado.belongsTo(Peixaria, {
    foreignKey: 'ID_peixaria',
    as: 'peixaria',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });

  PeixariaMercado.hasMany(PeixariaMercadoLinha, {
    foreignKey: 'ID_mercado',
    as: 'linhas',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });
  PeixariaMercadoLinha.belongsTo(PeixariaMercado, {
    foreignKey: 'ID_mercado',
    as: 'mercado',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });

  Peixaria.hasMany(PeixariaRelacaoTrabalho, {
    foreignKey: 'ID_peixaria',
    as: 'relacoes_trabalho',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });
  PeixariaRelacaoTrabalho.belongsTo(Peixaria, {
    foreignKey: 'ID_peixaria',
    as: 'peixaria',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
    constraints: true
  });
};