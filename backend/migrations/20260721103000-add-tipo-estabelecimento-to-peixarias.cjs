module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('peixarias', 'tipo_estabelecimento', {
      type: Sequelize.STRING(30),
      allowNull: true
    });

    await queryInterface.addIndex('peixarias', ['tipo_estabelecimento']);
  },

  async down(queryInterface) {
    await queryInterface.removeIndex('peixarias', ['tipo_estabelecimento']);
    await queryInterface.removeColumn('peixarias', 'tipo_estabelecimento');
  }
};
