export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('socio_pescadores', 'motivo_parou_estudar', {
    type: Sequelize.STRING(255),
    allowNull: true
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('socio_pescadores', 'motivo_parou_estudar');
}
