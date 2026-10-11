import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  const verifyToken = process.env.META_VERIFY_TOKEN || process.env.NEXT_PUBLIC_META_VERIFY_TOKEN;

  if (mode === 'subscribe' && token === verifyToken) {
    console.log('Meta webhook verified');
    return new NextResponse(challenge, { status: 200 });
  }

  console.error('Meta webhook verification failed');
  return new NextResponse('Forbidden', { status: 403 });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Meta webhook received:', JSON.stringify(body, null, 2));

    const signature = request.headers.get('x-hub-signature-256');
    const appSecret = process.env.META_APP_SECRET;

    if (appSecret && signature) {
      const crypto = await import('crypto');
      const expectedSignature = 'sha256=' + crypto.createHmac('sha256', appSecret)
        .update(JSON.stringify(body))
        .digest('hex');

      if (signature !== expectedSignature) {
        console.error('Meta webhook signature mismatch');
        return new NextResponse('Unauthorized', { status: 401 });
      }
    }

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/webhook/meta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Backend webhook error:', response.status);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Meta webhook error:', error);
    return NextResponse.json({ status: 'ok' });
  }
}