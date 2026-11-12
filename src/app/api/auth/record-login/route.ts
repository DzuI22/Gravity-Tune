import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const SPREADSHEET_ID = '1lzV20IjHlxJCW76reGVO9Nwibw0CRXt1K2jif2iyF2M';

// Default Webhook URL configured by user
const DEFAULT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbwNSU3COrahsR9HRw8RSly6eekLQItKHWaH0d6t8M5B18xfpkLWA-8QPAf7V9Hz_7gKzw/exec';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, username, email } = body;

    if (!type || !username) {
      return NextResponse.json(
        { error: 'Missing required fields: type and username' },
        { status: 400 }
      );
    }

    const timestamp = new Date().toLocaleString('id-ID', {
      timeZone: 'Asia/Jakarta',
      dateStyle: 'medium',
      timeStyle: 'medium',
    });

    const payload = {
      spreadsheetId: SPREADSHEET_ID,
      timestamp,
      type: type === 'google' ? 'google' : 'guest',
      username: String(username).trim(),
      email: type === 'google' ? String(email || '').trim() : '',
      ip: request.headers.get('x-forwarded-for') || '127.0.0.1',
      userAgent: request.headers.get('user-agent') || 'GravityTune Client',
    };

    console.log('[Auth Record] New login recorded:', payload);

    // Use environment variable or fallback directly to user's deployed Apps Script Webhook
    const webhookUrl = process.env.GOOGLE_SHEET_WEBHOOK_URL || DEFAULT_WEBHOOK_URL;
    let sheetSynced = false;

    if (webhookUrl) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        const webhookRes = await fetch(webhookUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
          signal: controller.signal,
        });
        clearTimeout(timeout);
        sheetSynced = webhookRes.ok;
      } catch (err) {
        console.warn('[Auth Record] Webhook push failed:', err);
      }
    }

    return NextResponse.json({
      success: true,
      sheetSynced,
      spreadsheetId: SPREADSHEET_ID,
      data: payload,
      message: sheetSynced
        ? 'Login data successfully appended to Google Sheets'
        : 'Login recorded locally (Set GOOGLE_SHEET_WEBHOOK_URL to sync with Google Sheet)',
    });
  } catch (error: any) {
    console.error('[Auth Record] Error:', error);
    return NextResponse.json(
      { error: error?.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
