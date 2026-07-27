module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('peixarias', 'observacoes_especies', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('peixarias', 'descricao_processo_comercio', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    await queryInterface.addColumn('peixaria_despesas', 'nome_outros', {
      type: Sequelize.STRING(255),
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('peixaria_despesas', 'nome_outros');
    await queryInterface.removeColumn('peixarias', 'descricao_processo_comercio');
    await queryInterface.removeColumn('peixarias', 'observacoes_especies');
  }
};
