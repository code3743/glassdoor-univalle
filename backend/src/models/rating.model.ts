import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/db.config';
import Student from './student.model';
import TeacherSubject from './teacherSubject.model';

class Rating extends Model {
  public id!: number;
  public student_id!: string;
  public teacher_subject_id!: number;
  public rating!: number;
  public comment!: string;
  public created_at!: Date;
}

Rating.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    student_id: {
      type: DataTypes.STRING(14),
      references: {
        model: Student,
        key: 'id',
      },
      allowNull: false,
    },
    teacher_subject_id: {
      type: DataTypes.INTEGER,
      references: {
        model: TeacherSubject,
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
