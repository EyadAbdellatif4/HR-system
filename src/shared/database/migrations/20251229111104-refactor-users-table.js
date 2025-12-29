'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Check if title column exists, if not add it
    const tableDescription = await queryInterface.describeTable('users');
    
    // Step 1: Add title column (VARCHAR) to users table if it doesn't exist
    if (!tableDescription.title) {
      await queryInterface.addColumn('users', 'title', {
        type: Sequelize.STRING(255),
        allowNull: true,
      });
    }

    // Step 2: Migrate data from titles table to users.title (only if titles table exists and title_id exists)
    const tables = await queryInterface.sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'titles';
    `, { type: Sequelize.QueryTypes.SELECT });

    if (tables.length > 0 && tableDescription.title_id) {
      await queryInterface.sequelize.query(`
        UPDATE users 
        SET title = titles.name 
        FROM titles 
        WHERE users.title_id = titles.id AND users.title_id IS NOT NULL AND users.title IS NULL;
      `);
    }

    // Step 3: Add personal_phone JSON column to users table if it doesn't exist
    if (!tableDescription.personal_phone) {
      await queryInterface.addColumn('users', 'personal_phone', {
        type: Sequelize.JSONB,
        allowNull: true,
      });
    }

    // Step 4: Migrate phone numbers from phones table to users.personal_phone as JSON array
    // Check if phones table exists
    const phonesTable = await queryInterface.sequelize.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'phones';
    `, { type: Sequelize.QueryTypes.SELECT });

    if (phonesTable.length > 0) {
      // Check what the deletedAt column is actually named
      const phoneColumns = await queryInterface.sequelize.query(`
        SELECT column_name FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'phones' 
        AND (column_name = 'deletedAt' OR column_name = 'deletedat' OR column_name = 'deleted_at');
      `, { type: Sequelize.QueryTypes.SELECT });

      let deletedAtColumn = 'deletedat'; // default
      if (phoneColumns.length > 0) {
        deletedAtColumn = phoneColumns[0].column_name;
      }

      // Migrate phone numbers, checking for the correct deletedAt column name
      await queryInterface.sequelize.query(`
        UPDATE users 
        SET personal_phone = (
          SELECT COALESCE(json_agg(phones.number), '[]'::json)
          FROM phones 
          WHERE phones.user_id = users.id 
          AND (phones."${deletedAtColumn}" IS NULL OR phones."${deletedAtColumn}" IS NULL)
        )
        WHERE EXISTS (
          SELECT 1 FROM phones 
          WHERE phones.user_id = users.id 
          AND (phones."${deletedAtColumn}" IS NULL OR phones."${deletedAtColumn}" IS NULL)
        )
        AND (users.personal_phone IS NULL OR users.personal_phone::text = '[]');
      `).catch(async () => {
        // Fallback: try without deletedAt check (migrate all phones)
        await queryInterface.sequelize.query(`
          UPDATE users 
          SET personal_phone = (
            SELECT COALESCE(json_agg(phones.number), '[]'::json)
            FROM phones 
            WHERE phones.user_id = users.id
          )
          WHERE EXISTS (SELECT 1 FROM phones WHERE phones.user_id = users.id)
          AND (users.personal_phone IS NULL OR users.personal_phone::text = '[]');
        `);
      });
    }

    // Step 5: Remove title_id foreign key constraint
    await queryInterface.removeConstraint('users', 'users_title_id_fkey').catch(() => {
      // Constraint might not exist or have different name, try alternative
      return queryInterface.sequelize.query(`
        ALTER TABLE users DROP CONSTRAINT IF EXISTS users_title_id_fkey;
      `);
    });

    // Step 6: Remove title_id column
    await queryInterface.removeColumn('users', 'title_id');

    // Step 7: Drop phones table
    await queryInterface.dropTable('phones');

    // Step 8: Drop titles table
    await queryInterface.dropTable('titles');
  },

  async down (queryInterface, Sequelize) {
    // Recreate titles table
    await queryInterface.createTable('titles', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      name: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Recreate phones table
    await queryInterface.createTable('phones', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.UUID,
        defaultValue: Sequelize.literal('gen_random_uuid()'),
      },
      number: {
        type: Sequelize.STRING(50),
        allowNull: false
      },
      company: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      current_plan: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      legal_owner: {
        type: Sequelize.STRING(255),
        allowNull: true
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });

    // Add title_id column back
    await queryInterface.addColumn('users', 'title_id', {
      type: Sequelize.UUID,
      allowNull: true,
      references: {
        model: 'titles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Remove personal_phone column
    await queryInterface.removeColumn('users', 'personal_phone');

    // Remove title column
    await queryInterface.removeColumn('users', 'title');
  }
};
