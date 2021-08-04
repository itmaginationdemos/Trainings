import { QueryInterface } from 'sequelize';
import { NotImplementedException } from '@nestjs/common';

export default {
  up: async (queryInterface: QueryInterface, Sequelize: any) => {
    const tablesInDb = await queryInterface.showAllTables();
    const tableName = 'files';

    if (tablesInDb.indexOf(tableName) === -1) {
      // tylko jak nie ma tabeli
      await queryInterface.createTable(tableName, {
        id: {
          // kolumna ,,tajna'' bo sequelize dodaje ją samemu - chyba ze mu powiemy by tego nie robił
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        createdAt: {
          // kolumna ,,tajna'' bo sequelize dodaje ją samemu - chyba ze mu powiemy by tego nie robił
          type: Sequelize.DATE,
          allowNull: true,
        },
        updatedAt: {
          // kolumna ,,tajna'' bo sequelize dodaje ją samemu - chyba ze mu powiemy by tego nie robił
          type: Sequelize.DATE,
          allowNull: true,
        },
        deletedAt: {
          // kolumna ,,tajna'' bo sequelize dodaje ją samemu - chyba ze mu powiemy by tego nie robił
          type: Sequelize.DATE,
          allowNull: true,
        },

        name: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        path: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        ext: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        mimetype: {
          type: Sequelize.STRING(100),
          allowNull: false,
        },
        size: {
          type: Sequelize.INTEGER,
          allowNull: false,
        },
        pass: {
          type: Sequelize.STRING(100),
          allowNull: true,
        },
      });
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
