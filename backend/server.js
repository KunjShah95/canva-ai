import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import dotenv from 'dotenv';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import client from 'prom-client';
import {
    signupSchema,
    loginSchema,
    forgotPasswordSchema,
    resetPasswordSchema,
    verifyEmailSchema,
    aiImageGenerationSchema,
    projectSchema,
    projectUpdateSchema,
    paramsSchema,
    projectVersionParamsSchema,
    shareParamsSchema,
    paginationQuerySchema,
    shareCreateSchema,
    projectVersionCreateSchema,
    templateCreateSchema
} from './schemas/auth.js';
import rateLimit from 'express-rate-limit';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const IS_PROD = NODE_ENV === 'production';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const JWT_SECRET = process.env.JWT_SECRET || (NODE_ENV === 'test' ? 'test-secret' : undefined);
if (!JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is not set. Please add JWT_SECRET to your .env file.');
    process.exit(1);
}

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || FRONTEND_URL)
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

const ACCESS_TOKEN_COOKIE = 'canvas_ai_access_token';

const getCookieOptions = () => ({
    httpOnly: true,
    secure: IS_PROD,
    sameSite: IS_PROD ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: '/'
});

const setAuthCookie = (res, token) => {
    res.cookie(ACCESS_TOKEN_COOKIE, token, getCookieOptions());
};

const clearAuthCookie = (res) => {
    res.clearCookie(ACCESS_TOKEN_COOKIE, {
        ...getCookieOptions(),
        maxAge: undefined
    });
};

const register = new client.Registry();
client.collectDefaultMetrics({ register });

const httpRequestDurationMs = new client.Histogram({
    name: 'http_request_duration_ms',
    help: 'Duration of HTTP requests in ms',
    labelNames: ['method', 'route', 'status_code']
});

const httpRequestsTotal = new client.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status_code']
});

register.registerMetric(httpRequestDurationMs);
register.registerMetric(httpRequestsTotal);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
};

app.set('trust proxy', 1);

app.use(cors(corsOptions));
app.use(helmet());
app.use(compression());
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));

app.use((req, res, next) => {
    const requestId = req.headers['x-request-id'] || crypto.randomUUID();
    req.requestId = requestId;
    res.setHeader('x-request-id', requestId);

    const end = httpRequestDurationMs.startTimer();
    res.on('finish', () => {
        const labels = {
            method: req.method,
            route: req.route?.path || req.path,
            status_code: String(res.statusCode)
        };

        httpRequestsTotal.inc(labels);
        end(labels);
    });

    next();
});

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
            requestId: req.requestId,
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

app.get('/api/metrics', async (req, res) => {
    try {
        res.set('Content-Type', register.contentType);
        res.end(await register.metrics());
    } catch (error) {
        res.status(500).end(error.message);
    }
});

const verifyToken = (req, res, next) => {
    const bearerToken = req.headers['authorization']?.split(' ')[1];
    const cookieToken = req.cookies?.[ACCESS_TOKEN_COOKIE];
    const token = bearerToken || cookieToken;
    if (!token) return res.status(401).json({ message: 'No token provided' });

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
        const emailVerificationToken = crypto.randomBytes(32).toString('hex');
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                emailVerificationToken,
                emailVerificationSentAt: new Date()
            },
        });

        const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '7d' });
        setAuthCookie(res, token);
        const verificationUrl = `${FRONTEND_URL}/verify-email?token=${emailVerificationToken}`;
        res.status(201).json({
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                emailVerified: user.emailVerified
            },
            verificationRequired: !user.emailVerified,
            verificationUrl: IS_PROD ? undefined : verificationUrl
        });
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
        setAuthCookie(res, token);
        res.json({ user: { id: user.id, email: user.email, name: user.name, emailVerified: user.emailVerified } });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Error logging in' });
    }
});

app.post('/api/auth/logout', (req, res) => {
    clearAuthCookie(res);
    res.json({ message: 'Logged out successfully' });
});

app.post('/api/auth/forgot-password', async (req, res) => {
    const result = forgotPasswordSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: result.error.flatten().fieldErrors
        });
    }

    const { email } = result.data;

    try {
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            return res.json({ message: 'If that email exists, a reset link has been generated.' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        const passwordResetExpiresAt = new Date(Date.now() + 60 * 60 * 1000);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordResetToken: token,
                passwordResetExpiresAt,
                passwordResetSentAt: new Date()
            }
        });

        const resetUrl = `${FRONTEND_URL}/reset-password?token=${token}`;
        return res.json({
            message: 'If that email exists, a reset link has been generated.',
            resetUrl: IS_PROD ? undefined : resetUrl
        });
    } catch (error) {
        console.error('Forgot password error:', error);
        return res.status(500).json({ message: 'Failed to process forgot password request' });
    }
});

app.post('/api/auth/reset-password', async (req, res) => {
    const result = resetPasswordSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: result.error.flatten().fieldErrors
        });
    }

    const { token, password } = result.data;

    try {
        const user = await prisma.user.findFirst({
            where: {
                passwordResetToken: token,
                passwordResetExpiresAt: { gt: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                passwordResetToken: null,
                passwordResetExpiresAt: null,
                passwordResetSentAt: null
            }
        });

        return res.json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Reset password error:', error);
        return res.status(500).json({ message: 'Failed to reset password' });
    }
});

app.get('/api/auth/verify-email', async (req, res) => {
    const result = verifyEmailSchema.safeParse(req.query);
    if (!result.success) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: result.error.flatten().fieldErrors
        });
    }

    const { token } = result.data;

    try {
        const user = await prisma.user.findFirst({
            where: { emailVerificationToken: token }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid verification token' });
        }

        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerified: true,
                emailVerificationToken: null,
                emailVerificationSentAt: null,
                emailVerifiedAt: new Date()
            }
        });

        return res.json({ message: 'Email verified successfully' });
    } catch (error) {
        console.error('Verify email error:', error);
        return res.status(500).json({ message: 'Failed to verify email' });
    }
});

app.post('/api/auth/send-verification', verifyToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user.emailVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        const token = crypto.randomBytes(32).toString('hex');
        await prisma.user.update({
            where: { id: user.id },
            data: {
                emailVerificationToken: token,
                emailVerificationSentAt: new Date()
            }
        });

        const verificationUrl = `${FRONTEND_URL}/verify-email?token=${token}`;
        return res.json({
            message: 'Verification link generated',
            verificationUrl: IS_PROD ? undefined : verificationUrl
        });
    } catch (error) {
        console.error('Send verification error:', error);
        return res.status(500).json({ message: 'Failed to create verification link' });
    }
});

app.get('/api/auth/me', verifyToken, async (req, res) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.userId } });
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ id: user.id, email: user.email, name: user.name, emailVerified: user.emailVerified });
    } catch (error) {
        console.error('Get user error:', error);
        res.status(500).json({ message: 'Error fetching user' });
    }
});

app.post('/api/ai/generate-image', verifyToken, async (req, res) => {
    if (!OPENAI_API_KEY) {
        return res.status(503).json({ message: 'AI generation is not configured on the server' });
    }

    const result = aiImageGenerationSchema.safeParse(req.body);
    if (!result.success) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: result.error.flatten().fieldErrors
        });
    }

    const { prompt, model, size, style, n } = result.data;

    try {
        const response = await fetch('https://api.openai.com/v1/images/generations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: model === 'dalle3' ? 'dall-e-3' : 'dall-e-2',
                prompt: style ? `${prompt}, ${style} style` : prompt,
                n,
                size
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                message: data?.error?.message || 'Image generation failed'
            });
        }

        return res.json({ images: data?.data || [] });
    } catch (error) {
        console.error('AI generation error:', error);
        return res.status(500).json({ message: 'Failed to generate image' });
    }
});

app.get('/api/projects', verifyToken, async (req, res) => {
    const queryResult = paginationQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
        return res.status(400).json({
            message: 'Invalid query parameters',
            errors: queryResult.error.flatten().fieldErrors
        });
    }

    try {
        const { page, limit } = queryResult.data;
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

    const bodyResult = projectVersionCreateSchema.safeParse(req.body);
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
    const paramsResult = projectVersionParamsSchema.safeParse(req.params);
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

    const bodyResult = shareCreateSchema.safeParse(req.body || {});
    if (!bodyResult.success) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: bodyResult.error.flatten().fieldErrors
        });
    }

    const { id } = paramsResult.data;
    const { canEdit, expiresIn } = bodyResult.data;

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
    const paramsResult = shareParamsSchema.safeParse(req.params);
    if (!paramsResult.success) {
        return res.status(400).json({ message: 'Invalid parameters' });
    }

    const { id, shareId } = paramsResult.data;

    try {
        const project = await prisma.project.findUnique({ where: { id } });
        if (!project || project.userId !== req.userId) {
            return res.status(404).json({ message: 'Project not found' });
        }

        const share = await prisma.projectShare.findFirst({
            where: { id: shareId, projectId: id }
        });

        if (!share) {
            return res.status(404).json({ message: 'Share not found' });
        }

        await prisma.projectShare.delete({ where: { id: shareId } });

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
    const bodyResult = templateCreateSchema.safeParse(req.body);
    if (!bodyResult.success) {
        return res.status(400).json({
            message: 'Validation failed',
            errors: bodyResult.error.flatten().fieldErrors
        });
    }

    const { name, category, thumbnail, data, width, height, backgroundColor, isPublic } = bodyResult.data;

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

const startServer = () => app.listen(PORT, () => {
    console.log(`Server running on port ${PORT} (${NODE_ENV})`);
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

if (process.env.NODE_ENV !== 'test') {
    startServer();
}

export { app, startServer };
