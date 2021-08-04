import { QueryInterface } from 'sequelize';
import { NotImplementedException } from '@nestjs/common';

export default {
  up: async (queryInterface: QueryInterface, Sequelize: any) => {
    const tablesInDb = await queryInterface.showAllTables();
    console.log(tablesInDb);

    if (tablesInDb.indexOf('SequelizeMeta') !== -1) {
      const tableColumns = Object.keys(
        await queryInterface.describeTable('SequelizeMeta'),
      );

      if (tableColumns.indexOf('createdAt') === -1) {
        queryInterface.addColumn('SequelizeMeta', 'createdAt', {
          type: Sequelize.DATE,
          defaultValue: Sequelize.fn('now'),
          allowNull: true,
        });
      }
    }
  },

  down: async (queryInterface: QueryInterface, Sequelize) => {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  },
};
