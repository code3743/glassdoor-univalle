import { Rating, TeacherSubject, Teacher, Subject } from '../models';
import { Request, Response } from 'express';
import sequelize from '../config/db.config';

interface RatingsSummary  extends Rating { 
    total_ratings: number;
    average_rating: number;
}

interface TeacherSubjectWithRelations extends TeacherSubject {
    'Teacher.name': string | null;
    'Subject.name': String | null;
  }
  
export const getRatingsSummary = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        if (page < 1) {
            res.status(400).json({ message: 'Invalid page or limit' });
            return;
        }

        const ratingsSummary = await Rating.findAll({
            attributes: [
                'teacher_subject_id',
                [sequelize.fn('COUNT', sequelize.col('id')), 'total_ratings'],
                [sequelize.fn('AVG', sequelize.col('rating')), 'average_rating'],
            ],
            group: ['teacher_subject_id'],
            limit,
            offset,
            raw: true,
        }) as RatingsSummary[];


        const teacherSubjectIds = ratingsSummary.map((rs) => rs.teacher_subject_id);
        const teacherSubjects = await TeacherSubject.findAll({
            where: { id: teacherSubjectIds },
            include: [
                {
                    model: Teacher,
                    attributes: ['name'],
                    required: true,
                },
                {
                    model: Subject,
                    attributes: ['name'],
                    required: true,
                },
            ],
            raw: true,
        }) as TeacherSubjectWithRelations[];


        res.status(200).json({
            page,
            limit,
            data: teacherSubjects.map((ts) => {
                const summary = ratingsSummary.find((rs) => rs.teacher_subject_id === ts.id) as RatingsSummary;
                return {
                    id: ts.id,
                    teacher_name: ts['Teacher.name'],
                    total_ratings: summary.total_ratings,
                    average_rating: summary.average_rating,
                }
            })
        });
    } catch (error) {
        console.error('Error fetching teacher ratings summary:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


export const getRatingsByTeacherSubjectId = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = 10;
        const offset = (page - 1) * limit;

        if (page < 1) {
            res.status(400).json({ message: 'Page must be 1 or greater' });
            return;
        }

        const teacherSubjectId = parseInt(req.params.teacherSubjectId);
        if (isNaN(teacherSubjectId)) {
            res.status(400).json({ message: 'Invalid teacherSubjectId' });
            return;
        }

      
        const teacherSubject = await TeacherSubject.findOne({
            where: { id: teacherSubjectId },
            include: [
                {
                    model: Teacher,
                    attributes: ['name'],
                },
                {
                    model: Subject,
                    attributes: ['name'],
                },
            ],
            raw: true,
        }) as TeacherSubjectWithRelations;

        if (!teacherSubject) {
            res.status(404).json({ message: 'TeacherSubject not found' });
            return;
        }

        const ratings = await Rating.findAll({
            where: { teacher_subject_id: teacherSubjectId },
            limit,
            offset,
            raw: true,
        });

        res.status(200).json({
            teacher_name: teacherSubject['Teacher.name'],
            subject_name: teacherSubject['Subject.name'],
            ratings: ratings.map((r) => {
                return {
                    rating: r.rating,
                    comment: r.comment,
                }
            })
        });
    } catch (error) {
        console.error('Error fetching ratings by teacherSubjectId:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
