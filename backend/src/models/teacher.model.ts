import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config';


class Teacher extends Model {
  public id!: string;
  public name!: string;
}

Teacher.init(
  {
    id: {
      type: DataTypes.STRING(14),
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: 'Teacher',
    tableName: 'teachers',
    timestamps: false,
  }
);

export default Teacher;


