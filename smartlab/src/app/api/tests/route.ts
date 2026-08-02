import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { TestInputSchema } from '@/lib/validations';
import { TestEngine } from '@/lib/test-engine';
import { getTestTemplate } from '@/lib/test-templates';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const templateId = searchParams.get('templateId');
    const projectId = searchParams.get('projectId');
    const mode = searchParams.get('mode');
    const status = searchParams.get('status');
    const credibilityLevel = searchParams.get('credibilityLevel');
    const dateFrom = searchParams.get('dateFrom');
    const dateTo = searchParams.get('dateTo');

     const where: any = {
       userId: session.user.email,
     };

    if (templateId) where.templateId = templateId;
    if (projectId) where.projectId = projectId;
    if (mode) where.mode = mode;
    if (status) where.status = status;
    if (credibilityLevel) where.credibilityLevel = credibilityLevel;
    if (dateFrom || dateTo) {
      where.createdAt = {};
      if (dateFrom) where.createdAt.gte = new Date(dateFrom);
      if (dateTo) where.createdAt.lte = new Date(dateTo);
    }

    const [tests, total] = await Promise.all([
      prisma.test.findMany({
        where,
        include: {
          template: true,
          project: true,
          hardwareDevice: true,
          hardwareSession: true,
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.test.count({ where }),
    ]);

    return NextResponse.json({
      tests,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching tests:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validatedData = TestInputSchema.parse(body);

    const template = await prisma.testTemplate.findUnique({
      where: { id: validatedData.templateId },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 });
    }

    const testEngine = new TestEngine(template as any);
    const validation = testEngine.validate(validatedData.inputData);

    if (!validation.isValid) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }

    const calculatedResults = testEngine.calculate(validatedData.inputData);

    let hardwareSession = null;
    if (validatedData.mode === 'HARDWARE' && validatedData.hardwareSession) {
      hardwareSession = await prisma.hardwareSession.create({
        data: {
          sessionId: validatedData.hardwareSession.sessionId,
          deviceId: validatedData.hardwareSession.deviceId,
          connectionType: validatedData.hardwareSession.connectionType,
          ipAddress: validatedData.hardwareSession.ipAddress,
          gpsLatitude: validatedData.hardwareSession.gpsLatitude,
          gpsLongitude: validatedData.hardwareSession.gpsLongitude,
          gpsAccuracy: validatedData.hardwareSession.gpsAccuracy,
          vpnDetected: validatedData.hardwareSession.vpnDetected,
          startedAt: new Date(validatedData.hardwareSession.startedAt),
          endedAt: validatedData.hardwareSession.endedAt ? new Date(validatedData.hardwareSession.endedAt) : null,
          dataPoints: validatedData.hardwareSession.dataPoints,
          integrityHash: validatedData.hardwareSession.integrityHash,
          isValid: true,
        },
      });
    }

    const testNumber = `TST-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;

    const credibilityAssessment = testEngine.assessCredibility(
      validatedData.inputData,
      calculatedResults,
      validatedData.hardwareSession,
      validatedData.mode
    );

    const test = await prisma.test.create({
      data: {
        testNumber,
        templateId: validatedData.templateId,
        projectId: validatedData.projectId,
        userId: session.user.id,
        mode: validatedData.mode,
        status: 'COMPLETED',
        credibilityLevel: credibilityAssessment.level,
        inputData: validatedData.inputData,
        calculatedResults,
        rawHardwareData: validatedData.hardwareSession as any,
        hardwareDeviceId: validatedData.hardwareSession?.deviceId,
        hardwareSessionId: hardwareSession?.id,
        startedAt: new Date(),
        completedAt: new Date(),
        certifiedAt: credibilityAssessment.level === 'CERTIFIED' ? new Date() : null,
        certifiedBy: credibilityAssessment.level === 'CERTIFIED' ? session.user.id : null,
      },
      include: {
        template: true,
        project: true,
        hardwareDevice: true,
        hardwareSession: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        action: 'TEST_CREATED',
        entity: 'Test',
        entityId: test.id,
        newData: {
          testNumber: test.testNumber,
          mode: test.mode,
          credibilityLevel: test.credibilityLevel,
        },
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    });

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error('Error creating test:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ error: 'Validation failed', details: error.errors }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}