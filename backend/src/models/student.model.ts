import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config';

class Student extends Model {
  public id!: string;
  public name!: string;
}

Student.init(
  {
    id: {
      type: DataTypes.STRING(14),
      primaryKey: true,
    },
    name: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Student',
    tableName: 'students',
    timestamps: false,
  }
);

export default Student;
