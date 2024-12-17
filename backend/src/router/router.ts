import { Router } from "express";
import { Student } from "../models";


const router = Router();

router.get("/", async (req, res) => {
    const data = await Student.findAll()
    res.json(data);
});
router.post('/signin', (req, res) => {});
router.post('/signup', (req, res) => {});
router.get('/current-teachers', (req, res) => {});
router.post('/current-teachers/:id/evaluate', (req, res) => {});
router.get('/current-teachers/:id/evaluate', (req, res) => {});
router.get('/search', (req, res) => {});



export default router;