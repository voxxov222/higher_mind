import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db/prisma'
import { getSession } from '@/lib/security/session'
import { logger } from '@/lib/logging/server'
import { updateSubjectNotesSchema, validateBody, formatValidationErrors } from '@/lib/validation/api'
import { checkRateLimit, rateLimitExceededResponse, rateLimitHeaders, RATE_LIMITS } from '@/lib/security/rate-limit'
import { CACHE_CONTROL, mergeCacheControlHeaders } from '@/lib/security/cache-control'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function GET(request: NextRequest, { params }: RouteParams) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting
  const rateLimitResult = checkRateLimit(session.userId, RATE_LIMITS.standard)
  if (!rateLimitResult.success) {
    return rateLimitExceededResponse(rateLimitResult, RATE_LIMITS.standard.limit)
  }

  const { id } = await params

  // Get the subject and verify ownership in one query
  const subject = await prisma.subject.findFirst({
    where: {
      id,
      ownerId: session.userId,
    },
    select: { notes: true },
  })

  if (!subject) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  return NextResponse.json(
    { notes: subject.notes || '' },
    {
      headers: mergeCacheControlHeaders(
        rateLimitHeaders(rateLimitResult, RATE_LIMITS.standard.limit),
        CACHE_CONTROL.userDataShort,
      ),
    },
  )
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limiting
  const rateLimitResult = checkRateLimit(session.userId, RATE_LIMITS.strict)
  if (!rateLimitResult.success) {
    return rateLimitExceededResponse(rateLimitResult, RATE_LIMITS.strict.limit)
  }

  const { id } = await params

  try {
    const body = await request.json()

    // Validate request body
    const validation = validateBody(body, updateSubjectNotesSchema)
    if (!validation.success) {
      return NextResponse.json(formatValidationErrors(validation.errors), { status: 400 })
    }

    const { notes } = validation.data

    // Update with ownership check in one query
    const result = await prisma.subject.updateMany({
      where: {
        id,
        ownerId: session.userId,
      },
      data: { notes },
    })

    if (result.count === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    logger.debug('Updated subject notes:', { id, userId: session.userId })

    // Mutations should never be cached
    return NextResponse.json(
      { notes },
      {
        headers: mergeCacheControlHeaders(
          rateLimitHeaders(rateLimitResult, RATE_LIMITS.strict.limit),
          CACHE_CONTROL.noStore,
        ),
      },
    )
  } catch (error) {
    logger.error('Error updating subject notes:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}
