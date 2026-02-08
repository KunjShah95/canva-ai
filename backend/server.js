import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { signupSchema, loginSchema, projectSchema, projectUpdateSchema, paramsSchema } from './schemas/auth.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const SECRET_KEY = process.env.JWT_SECRET || 'supersecret';

async function checkDbConnection() {
    try {
        await prisma.$connect();
        console.log('Database connected successfully');
    } catch (error) {
        console.error('Database connection failed:', error);
        process.exit(1);
    }
}
checkDbConnection();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Unauthorized' });
        req.userId = decoded.id;
        next();
    });
};

app.post('/api/auth/signup', async (req, res) => {
    const result = signupSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: result.error.flatten().fieldErrors 
        });
    }

    const { email, password, name } = result.data;
    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) return res.status(400).json({ message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await prisma.user.create({
            data: { email, password: hashedPassword, name },
        });

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '7d' });
        res.status(201).json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: 'Error creating user' });
    }
});

app.post('/api/auth/login', async (req, res) => {
    const result = loginSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: result.error.flatten().fieldErrors 
        });
    }

    const { email, password } = result.data;
    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return res.status(404).json({ message: 'User not found' });

        const passwordValid = await bcrypt.compare(password, user.password);
        if (!passwordValid) return res.status(401).json({ message: 'Invalid password' });

        const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: '7d' });
        res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ id: user.id, email: user.email, name: user.name });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

app.get('/api/projects', verifyToken, async (req, res) => {
    try {
        const projects = await prisma.project.findMany({ 
            where: { userId: req.userId },
            orderBy: { updatedAt: 'desc' }
        });
        res.json(projects);
    } catch (error) {
        console.error('Get projects error:', error);
        res.status(500).json({ message: 'Error fetching projects' });
    }
});

app.post('/api/projects', verifyToken, async (req, res) => {
    const result = projectSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: result.error.flatten().fieldErrors 
        });
    }

    const { name, data, thumbnail, width, height } = result.data;
    try {
        const project = await prisma.project.create({
            data: { 
                name, 
                data, 
                thumbnail: thumbnail || null, 
                width: width || 800, 
                height: height || 600, 
                userId: req.userId 
            },
        });
        res.status(201).json(project);
    } catch (error) {
        console.error('Create project error:', error);
        res.status(500).json({ message: 'Error creating project' });
    }
});

app.get('/api/projects/:id', verifyToken, async (req, res) => {
    const result = paramsSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({ message: 'Invalid project ID' });
    }

    const { id } = result.data;
    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project || project.userId !== req.userId) {
            return res.status(404).json({ message: 'Project not found' });
        }
        res.json(project);
    } catch (error) {
        console.error('Get project error:', error);
        res.status(500).json({ message: 'Error fetching project' });
    }
});

app.put('/api/projects/:id', verifyToken, async (req, res) => {
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
        return res.status(400).json({ message: 'Invalid project ID' });
    }

    const bodyResult = projectUpdateSchema.safeParse(req.body);
    if (!bodyResult.success) {
        return res.status(400).json({ 
            message: 'Validation failed', 
            errors: bodyResult.error.flatten().fieldErrors 
        });
    }

    const { id } = paramsResult.data;
    const { name, data, thumbnail, width, height } = bodyResult.data;
    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project || project.userId !== req.userId) {
            return res.status(404).json({ message: 'Project not found' });
        }
        const updatedProject = await prisma.project.update({
            where: { id },
            data: { 
                name, 
                data, 
                thumbnail, 
                width, 
                height 
            },
        });
        res.json(updatedProject);
    } catch (error) {
        console.error('Update project error:', error);
        res.status(500).json({ message: 'Error updating project' });
    }
});

app.delete('/api/projects/:id', verifyToken, async (req, res) => {
    const result = paramsSchema.safeParse(req.params);
    if (!result.success) {
        return res.status(400).json({ message: 'Invalid project ID' });
    }

    const { id } = result.data;
    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project || project.userId !== req.userId) {
            return res.status(404).json({ message: 'Project not found' });
        }
        await prisma.project.delete({ where: { id } });
        res.json({ message: 'Project deleted' });
    } catch (error) {
        console.error('Delete project error:', error);
        res.status(500).json({ message: 'Error deleting project' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
