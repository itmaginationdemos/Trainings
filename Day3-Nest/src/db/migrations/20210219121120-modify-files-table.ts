import { QueryInterface } from 'sequelize';
import { NotImplementedException } from '@nestjs/common';

export default {
  up: async (queryInterface: QueryInterface, Sequelize: any) => {
    const tablesInDb = await queryInterface.showAllTables();
    const tableName = 'files';

    if (tablesInDb.indexOf(tableName) !== -1) {
      // gdy tabela już istnieje
      const tableData = await queryInterface.describeTable(tableName);
      const tableColumns = Object.keys(tableData);

      if (tableColumns.indexOf('path') !== -1) {
        // istnieje kolumna
        await queryInterface.changeColumn(tableName, 'path', {
          type: Sequelize.STRING(35),
          allowNull: false,
        });
      }

      if (tableColumns.indexOf('extension') !== -1) {
        // istnieje kolumna
        await queryInterface.changeColumn(tableName, 'extension', {
          type: Sequelize.STRING(20),
          allowNull: false,
        });
      }

      if (tableColumns.indexOf('mimetype') !== -1) {
        // istnieje kolumna
        await queryInterface.changeColumn(tableName, 'mimetype', {
          type: Sequelize.STRING(35),
          allowNull: false,
        });
      }

      if (tableColumns.indexOf('pass') !== -1) {
        // istnieje kolumna
        await queryInterface.changeColumn(tableName, 'pass', {
          type: Sequelize.STRING(50),
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
