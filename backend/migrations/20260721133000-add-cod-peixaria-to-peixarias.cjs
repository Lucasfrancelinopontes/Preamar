module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('peixarias');

    if (!table.cod_peixaria) {
      await queryInterface.addColumn('peixarias', 'cod_peixaria', {
        type: Sequelize.STRING(50),
        allowNull: true
      });

      await queryInterface.addIndex('peixarias', ['cod_peixaria'], {
        unique: true,
        name: 'ux_peixarias_cod_peixaria'
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('peixarias');

    if (table.cod_peixaria) {
      await queryInterface.removeIndex('peixarias', 'ux_peixarias_cod_peixaria');
      await queryInterface.removeColumn('peixarias', 'cod_peixaria');
    }
  }
};
