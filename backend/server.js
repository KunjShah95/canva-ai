import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { signupSchema, loginSchema, projectSchema, projectUpdateSchema, paramsSchema } from './schemas/auth.js';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set. Please add JWT_SECRET to your .env file.');
    process.exit(1);
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

const corsOptions = {
    origin: FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: { message: 'Too many attempts, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: { message: 'Too many requests, please try again later' },
    standardHeaders: true,
    legacyHeaders: false
});

app.use('/api/auth', authLimiter);
app.use('/api/', apiLimiter);

const requestLogger = (req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(JSON.stringify({
            timestamp: new Date().toISOString(),
            method: req.method,
            path: req.path,
            status: res.statusCode,
            duration: `${duration}ms`,
            ip: req.ip
        }));
    });
    next();
};
app.use(requestLogger);

app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) return res.status(403).json({ message: 'No token provided' });

    jwt.verify(token, JWT_SECRET, (err, decoded) => {
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

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
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

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
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
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const [projects, total] = await Promise.all([
            prisma.project.findMany({
                where: { userId: req.userId },
                orderBy: { updatedAt: 'desc' },
                skip,
                take: limit
            }),
            prisma.project.count({ where: { userId: req.userId } })
        ]);

        res.json({
            projects,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
                hasMore: skip + projects.length < total
            }
        });
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

app.post('/api/projects/:id/versions', verifyToken, async (req, res) => {
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
        return res.status(400).json({ message: 'Invalid project ID' });
    }

    const { id } = paramsResult.data;
    const { name, data, thumbnail, width, height } = req.body;

    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project || project.userId !== req.userId) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const version = await prisma.projectVersion.create({
            data: {
                projectId: project.id,
                name: name || `Version ${new Date().toLocaleString()}`,
                data,
                thumbnail,
                width,
                height
            }
        });

        res.status(201).json(version);
    } catch (error) {
        console.error('Create version error:', error);
        res.status(500).json({ message: 'Error creating version' });
    }
});

app.get('/api/projects/:id/versions', verifyToken, async (req, res) => {
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
        return res.status(400).json({ message: 'Invalid project ID' });
    }

    const { id } = paramsResult.data;

    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project || project.userId !== req.userId) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const versions = await prisma.projectVersion.findMany({
            where: { projectId: project.id },
            orderBy: { createdAt: 'desc' },
            select: {
                id: true,
                name: true,
                thumbnail: true,
                createdAt: true
            }
        });

        res.json(versions);
    } catch (error) {
        console.error('Get versions error:', error);
        res.status(500).json({ message: 'Error fetching versions' });
    }
});

app.get('/api/projects/:id/versions/:versionId', verifyToken, async (req, res) => {
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
        return res.status(400).json({ message: 'Invalid parameters' });
    }

    const { id, versionId } = paramsResult.data;

    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project || project.userId !== req.userId) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const version = await prisma.projectVersion.findFirst({
            where: { id: versionId, projectId: project.id }
        });

        if (!version) {
            return res.status(404).json({ message: 'Version not found' });
        }

        res.json(version);
    } catch (error) {
        console.error('Get version error:', error);
        res.status(500).json({ message: 'Error fetching version' });
    }
});

app.post('/api/projects/:id/share', verifyToken, async (req, res) => {
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
        return res.status(400).json({ message: 'Invalid project ID' });
    }

    const { id } = paramsResult.data;
    const { canEdit, expiresIn } = req.body;

    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project || project.userId !== req.userId) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const shareToken = crypto.randomBytes(32).toString('hex');
        const expiresAt = expiresIn ? new Date(Date.now() + expiresIn * 1000) : null;

        const share = await prisma.projectShare.create({
            data: {
                projectId: project.id,
                shareToken,
                canEdit: canEdit || false,
                expiresAt
            }
        });

        const shareUrl = `${FRONTEND_URL}/share/${shareToken}`;
        res.json({ shareToken, shareUrl, expiresAt: share.expiresAt });
    } catch (error) {
        console.error('Create share error:', error);
        res.status(500).json({ message: 'Error creating share' });
    }
});

app.get('/api/projects/:id/shares', verifyToken, async (req, res) => {
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
        return res.status(400).json({ message: 'Invalid project ID' });
    }

    const { id } = paramsResult.data;

    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project || project.userId !== req.userId) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const shares = await prisma.projectShare.findMany({
            where: { projectId: project.id },
            select: {
                id: true,
                canEdit: true,
                expiresAt: true,
                createdAt: true
            }
        });

        res.json(shares);
    } catch (error) {
        console.error('Get shares error:', error);
        res.status(500).json({ message: 'Error fetching shares' });
    }
});

app.delete('/api/projects/:id/shares/:shareId', verifyToken, async (req, res) => {
    const paramsResult = paramsSchema.safeParse(req.params);
    if (!paramsResult.success) {
        return res.status(400).json({ message: 'Invalid parameters' });
    }

    const { id, shareId } = paramsResult.data;

    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project || project.userId !== req.userId) {
            return res.status(404).json({ message: 'Project not found' });
        }

        await prisma.projectShare.delete({
            where: { id: parseInt(shareId) }
        });

        res.json({ message: 'Share deleted' });
    } catch (error) {
        console.error('Delete share error:', error);
        res.status(500).json({ message: 'Error deleting share' });
    }
});

app.get('/api/share/:token', async (req, res) => {
    const { token } = req.params;

    try {
        const share = await prisma.projectShare.findUnique({
            where: { shareToken: token },
            include: { project: true }
        });

        if (!share) {
            return res.status(404).json({ message: 'Share not found' });
        }

        if (share.expiresAt && new Date() > share.expiresAt) {
            return res.status(410).json({ message: 'Share has expired' });
        }

        res.json({
            project: share.project,
            canEdit: share.canEdit
        });
    } catch (error) {
        console.error('Get shared project error:', error);
        res.status(500).json({ message: 'Error fetching shared project' });
    }
});

app.get('/api/templates', async (req, res) => {
    try {
        const { category, search } = req.query;
        
        const where = { isPublic: true };
        if (category && category !== 'all') {
            where.category = category;
        }
        if (search) {
            where.name = { contains: search, mode: 'insensitive' };
        }

        const templates = await prisma.template.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            take: 50
        });

        res.json(templates);
    } catch (error) {
        console.error('Get templates error:', error);
        res.status(500).json({ message: 'Error fetching templates' });
    }
});

app.get('/api/templates/categories', async (req, res) => {
    try {
        const categories = await prisma.template.groupBy({
            by: ['category'],
            where: { isPublic: true },
            _count: { category: true }
        });

        res.json(categories.map(c => ({ name: c.category, count: c._count.category })));
    } catch (error) {
        console.error('Get categories error:', error);
        res.status(500).json({ message: 'Error fetching categories' });
    }
});

app.post('/api/templates', verifyToken, async (req, res) => {
    const { name, category, thumbnail, data, width, height, backgroundColor, isPublic } = req.body;

    try {
        const template = await prisma.template.create({
            data: {
                name,
                category: category || 'Custom',
                thumbnail,
                data,
                width: width || 800,
                height: height || 600,
                backgroundColor: backgroundColor || '#ffffff',
                userId: req.userId,
                isPublic: isPublic || false
            }
        });

        res.status(201).json(template);
    } catch (error) {
        console.error('Create template error:', error);
        res.status(500).json({ message: 'Error creating template' });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

const gracefulShutdown = async (signal) => {
    console.log(`${signal} received, starting graceful shutdown...`);
    try {
        await prisma.$disconnect();
        console.log('Database connections closed');
        process.exit(0);
    } catch (error) {
        console.error('Error during shutdown:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
