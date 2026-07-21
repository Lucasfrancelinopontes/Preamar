module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable('socio_pescadores');
    if (!table.motivo_parou_estudar) {
      await queryInterface.addColumn('socio_pescadores', 'motivo_parou_estudar', {
        type: Sequelize.STRING(255),
        allowNull: true
      });
    }
  },

  async down(queryInterface) {
    const table = await queryInterface.describeTable('socio_pescadores');
    if (table.motivo_parou_estudar) {
      await queryInterface.removeColumn('socio_pescadores', 'motivo_parou_estudar');
    }
  }
};
