import { Sequelize } from 'sequelize';

const databaseUrl = process.env.DATABASE_URL || 'postgres://admin:admin_password@localhost:5432/glassdoor_db';

const sequelize = new Sequelize(databaseUrl, {
  dialect: 'postgres',
  logging: false,
});

export default sequelize;
