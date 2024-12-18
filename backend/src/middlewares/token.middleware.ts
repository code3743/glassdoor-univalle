import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";


interface CustomJwtPayload extends JwtPayload {
    user: string;
    session: string;
}


export const tokenMiddleware = (req: Request & {user?:string, session?:string}, res: Response, next: NextFunction) => {
   
    const authHeader = req.headers["authorization"];
    if (!authHeader || !authHeader.startsWith("Bearer ")) {  
        return  next();
    }
    const token = authHeader.split(" ")[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as CustomJwtPayload;
        req.user = decoded.user;
        req.session = decoded.session
        return next(); 
    } catch (error) {
        console.error("Error verifying token:", error);
        res.status(401).json({ message: "Token is invalid or expired" });
    }
};
