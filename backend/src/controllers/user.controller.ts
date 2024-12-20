import jwt from 'jsonwebtoken';
import {Student} from '../models';
import { Request, Response } from 'express';
import SiraServiceException, { authSira} from '../services/sira';


export const signinController = async (req: Request, res: Response) => {
    try {
        const { code, password } = req.body;

        if (!code || !password) {
            res.status(400).json({ message: 'Code and password are required' });
            return;
        }
        const session = await authSira(code, password);
        const token = jwt.sign({ user: code, session }, process.env.JWT_SECRET!, { expiresIn: '1h' });
        res.cookie('token', token, { httpOnly: true });
        res.json({ token });
    } catch (error) {
        if (error instanceof SiraServiceException) {
            res.status(400).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}

export const signoutController = async (req: Request & {user?:string, session?:string}, res: Response) => {
    try {
        if (!req.user || !req.session) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        res.clearCookie('token');
        res.json({ message: 'Logged out' });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
}


export const getUserController = async (req: Request & {user?:string, session?:string}, res: Response) => {
    try {
        if (!req.user || !req.session) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        let user = await Student.findOne({ where: { id: req.user }, raw: true });
        if (!user) {
          user =  await Student.create({ id: req.user });
        }
        res.json({ id: user.id, name: user.name});
    } catch (error) {
        console.error('Error getting user:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}



export const updateUserController = async (req: Request & {user?:string, session?:string}, res: Response) => {
    try {
        if (!req.user || !req.session) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }
        const { name } = req.body;
        if (!name) {
            res.status(400).json({ message: 'Name is required' });
            return;
        }
        let user = await Student.findOne({ where: { id : req.user } });
        if (!user) {
            user = await Student.create({ id: req.user, name });
        } else {
            await user.update({ name });
        }
        res.json({ message: 'User updated', user });
    } catch (error) {
        if (error instanceof SiraServiceException) {
            res.status(400).json({ message: error.message });
            return;
        }
        res.status(500).json({ message: 'Internal server error' });
    }
}


