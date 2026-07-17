module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('peixarias', {
      ID_peixaria: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ID_usuario: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'usuarios',
          key: 'ID_usuario'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      ID_municipio: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'municipios',
          key: 'ID_municipio'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      responsavel: {
        type: Sequelize.STRING(255)
      },
      contato: {
        type: Sequelize.STRING(100)
      },
      municipio: {
        type: Sequelize.STRING(100)
      },
      localidade: {
        type: Sequelize.STRING(100)
      },
      nome: {
        type: Sequelize.STRING(255)
      },
      apelido: {
        type: Sequelize.STRING(100)
      },
      naturalidade: {
        type: Sequelize.STRING(100)
      },
      sexo: {
        type: Sequelize.STRING(20)
      },
      idade: {
        type: Sequelize.INTEGER
      },
      atividade_principal: {
        type: Sequelize.STRING(255)
      },
      atividade_secundaria: {
        type: Sequelize.STRING(255)
      },
      total_peixarias: {
        type: Sequelize.INTEGER
      },
      quantos_possui: {
        type: Sequelize.INTEGER
      },
      estado_civil: {
        type: Sequelize.STRING(50)
      },
      numero_familiares: {
        type: Sequelize.INTEGER
      },
      escolaridade: {
        type: Sequelize.STRING(50)
      },
      local_moradia: {
        type: Sequelize.STRING(100)
      },
      possui_registro_inss: {
        type: Sequelize.BOOLEAN
      },
      filiado_colonia: {
        type: Sequelize.BOOLEAN
      },
      qual_colonia: {
        type: Sequelize.STRING(255)
      },
      participa_associacao: {
        type: Sequelize.BOOLEAN
      },
      qual_associacao: {
        type: Sequelize.STRING(255)
      },
      possui_carteira_pescador: {
        type: Sequelize.BOOLEAN
      },
      orgao_emissor_carteira: {
        type: Sequelize.STRING(100)
      },
      possui_plano_saude: {
        type: Sequelize.BOOLEAN
      },
      plano_saude_especificar: {
        type: Sequelize.TEXT
      },
      atividades_renda_familia: {
        type: Sequelize.TEXT
      },
      quem_trabalha_familia: {
        type: Sequelize.TEXT
      },
      tempo_atividade: {
        type: Sequelize.INTEGER
      },
      atividade_comercial: {
        type: Sequelize.STRING(255)
      },
      periodo_comercializacao: {
        type: Sequelize.STRING(100)
      },
      forma_venda: {
        type: Sequelize.STRING(100)
      },
      transporte: {
        type: Sequelize.STRING(100)
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('peixarias', ['ID_usuario']);
    await queryInterface.addIndex('peixarias', ['ID_municipio']);

    await queryInterface.createTable('peixaria_despesas', {
      ID_despesa: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ID_peixaria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'peixarias',
          key: 'ID_peixaria'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      descricao: {
        type: Sequelize.STRING(255)
      },
      quantidade: {
        type: Sequelize.DECIMAL(10, 2)
      },
      custo: {
        type: Sequelize.DECIMAL(10, 2)
      },
      frequencia: {
        type: Sequelize.STRING(50)
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('peixaria_despesas', ['ID_peixaria']);

    await queryInterface.createTable('peixaria_fornecedores', {
      ID_fornecedor: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ID_peixaria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'peixarias',
          key: 'ID_peixaria'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      nome: {
        type: Sequelize.STRING(255)
      },
      tipo: {
        type: Sequelize.STRING(100)
      },
      telefone: {
        type: Sequelize.STRING(50)
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('peixaria_fornecedores', ['ID_peixaria']);

    await queryInterface.createTable('peixaria_pescador_fornecedores', {
      ID_pescador_fornecedor: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ID_peixaria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'peixarias',
          key: 'ID_peixaria'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      tipo: {
        type: Sequelize.ENUM('LOCAL', 'ENTREGA')
      },
      nome: {
        type: Sequelize.STRING(255)
      },
      apelido: {
        type: Sequelize.STRING(100)
      },
      comunidade: {
        type: Sequelize.STRING(100)
      },
      tipo_barco: {
        type: Sequelize.STRING(100)
      },
      numero_pescadores: {
        type: Sequelize.INTEGER
      },
      volume: {
        type: Sequelize.DECIMAL(10, 2)
      },
      volume_medio: {
        type: Sequelize.DECIMAL(10, 2)
      },
      regularidade: {
        type: Sequelize.STRING(100)
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('peixaria_pescador_fornecedores', ['ID_peixaria']);

    await queryInterface.createTable('peixaria_especies_comerciais', {
      ID_especie_comercial: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ID_peixaria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'peixarias',
          key: 'ID_peixaria'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      ID_especie: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'especies',
          key: 'ID_especie'
        },
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE'
      },
      especie: {
        type: Sequelize.STRING(255)
      },
      quantidade_fresco: {
        type: Sequelize.DECIMAL(10, 2)
      },
      quantidade_congelado: {
        type: Sequelize.DECIMAL(10, 2)
      },
      preco_compra: {
        type: Sequelize.DECIMAL(10, 2)
      },
      preco_venda: {
        type: Sequelize.DECIMAL(10, 2)
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('peixaria_especies_comerciais', ['ID_peixaria']);
    await queryInterface.addIndex('peixaria_especies_comerciais', ['ID_especie']);

    await queryInterface.createTable('peixaria_perdas', {
      ID_perda: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ID_peixaria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'peixarias',
          key: 'ID_peixaria'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      descricao: {
        type: Sequelize.TEXT
      },
      quantidade: {
        type: Sequelize.DECIMAL(10, 2)
      },
      causa: {
        type: Sequelize.STRING(255)
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('peixaria_perdas', ['ID_peixaria']);

    await queryInterface.createTable('peixaria_perdas_por_especie', {
      ID_perda_por_especie: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ID_peixaria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'peixarias',
          key: 'ID_peixaria'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      titulo: {
        type: Sequelize.STRING(255)
      },
      causa: {
        type: Sequelize.STRING(255)
      },
      estimativa: {
        type: Sequelize.INTEGER
      },
      destino: {
        type: Sequelize.STRING(255)
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('peixaria_perdas_por_especie', ['ID_peixaria']);

    await queryInterface.createTable('peixaria_origem_pescado', {
      ID_origem_pescado: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ID_peixaria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'peixarias',
          key: 'ID_peixaria'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      tipo: {
        type: Sequelize.STRING(100)
      },
      pescadores_locais: {
        type: Sequelize.STRING(100)
      },
      outras_localidades_pb: {
        type: Sequelize.STRING(100)
      },
      outros_estados: {
        type: Sequelize.STRING(100)
      },
      outro: {
        type: Sequelize.STRING(100)
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('peixaria_origem_pescado', ['ID_peixaria']);

    await queryInterface.createTable('peixaria_mercados', {
      ID_mercado: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ID_peixaria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'peixarias',
          key: 'ID_peixaria'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      tipo_mercado: {
        type: Sequelize.ENUM('LOCAL', 'ESTADUAL', 'NACIONAL', 'INTERNACIONAL')
      },
      volume: {
        type: Sequelize.DECIMAL(10, 2)
      },
      valor: {
        type: Sequelize.DECIMAL(10, 2)
      },
      observacoes: {
        type: Sequelize.TEXT
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('peixaria_mercados', ['ID_peixaria']);
    await queryInterface.addIndex('peixaria_mercados', ['tipo_mercado']);

    await queryInterface.createTable('peixaria_mercado_linhas', {
      ID_mercado_linha: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ID_mercado: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'peixaria_mercados',
          key: 'ID_mercado'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      especie: {
        type: Sequelize.STRING(255)
      },
      forma_comercializacao: {
        type: Sequelize.STRING(100)
      },
      destino: {
        type: Sequelize.STRING(255)
      },
      volume_medio: {
        type: Sequelize.DECIMAL(10, 2)
      },
      preco_venda: {
        type: Sequelize.DECIMAL(10, 2)
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('peixaria_mercado_linhas', ['ID_mercado']);

    await queryInterface.createTable('peixaria_relacoes_trabalho', {
      ID_relacao_trabalho: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      ID_peixaria: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'peixarias',
          key: 'ID_peixaria'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      tipo: {
        type: Sequelize.STRING(100)
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false
      }
    });

    await queryInterface.addIndex('peixaria_relacoes_trabalho', ['ID_peixaria']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('peixaria_relacoes_trabalho');
    await queryInterface.dropTable('peixaria_mercado_linhas');
    await queryInterface.dropTable('peixaria_mercados');
    await queryInterface.dropTable('peixaria_origem_pescado');
    await queryInterface.dropTable('peixaria_perdas_por_especie');
    await queryInterface.dropTable('peixaria_perdas');
    await queryInterface.dropTable('peixaria_especies_comerciais');
    await queryInterface.dropTable('peixaria_pescador_fornecedores');
    await queryInterface.dropTable('peixaria_fornecedores');
    await queryInterface.dropTable('peixaria_despesas');
    await queryInterface.dropTable('peixarias');
  }
};
