import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config';
import Teacher from './teacher.model';
import Student from './student.model';

class Rating extends Model {
  public id!: string;
  public teacher_id!: string;
  public student_id!: string;
  public rating!: number;
  public comment!: string;
  public created_at!: Date;
}

Rating.init(
  {
    id: {
      type: DataTypes.STRING(14),
      primaryKey: true,
    },
    teacher_id: {
      type: DataTypes.STRING(14),
      references: {
        model: Teacher,
        key: 'id',
      },
      allowNull: false,
    },
    student_id: {
      type: DataTypes.STRING(14),
      references: {
        model: Student,
        key: 'id',
      },
      allowNull: false,
    },
    rating: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 5,
      },
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Rating',
    tableName: 'ratings',
    timestamps: false,
  }
);

export default Rating;
