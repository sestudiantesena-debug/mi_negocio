import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Evolution webhook received:', JSON.stringify(body, null, 2));

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const response = await fetch(`${apiUrl}/webhook/evolution`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': request.headers.get('apikey') || '',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Backend webhook error:', response.status);
    }

    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    console.error('Evolution webhook error:', error);
    return NextResponse.json({ status: 'ok' });
  }
}

export async function GET(request: NextRequest) {
  return NextResponse.json({ status: 'ok', message: 'Evolution webhook endpoint' });
}