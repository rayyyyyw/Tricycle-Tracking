import { createServer } from 'http';
import { createHmac } from 'crypto';
import { Server } from 'socket.io';

const PORT = parseInt(process.env.PORT || process.env.SOCKET_PORT || '3001', 10);
const LARAVEL_URL = process.env.LARAVEL_URL || process.env.APP_URL || 'http://127.0.0.1:8000';
const INTERNAL_SECRET = process.env.CHAT_INTERNAL_SECRET || '';
const TOKEN_SECRET = String(process.env.CHAT_TOKEN_SECRET || process.env.APP_KEY || '');

const httpServer = createServer();
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN ?? true,
    methods: ['GET', 'POST'],
  },
});

function base64UrlDecode(str) {
  let s = String(str).replace(/-/g, '+').replace(/_/g, '/');
  const pad = s.length % 4;
  if (pad) s += '='.repeat(4 - pad);
  return Buffer.from(s, 'base64').toString('utf8');
}

function base64UrlEncode(data) {
  const b = Buffer.isBuffer(data) ? data : Buffer.from(data, 'utf8');
  return b.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function verifyToken(token) {
  if (!TOKEN_SECRET) return null;
  const parts = String(token).split('.');
  if (parts.length !== 2) return null;
  const [payloadB64, sigB64] = parts;
  const sig = createHmac('sha256', TOKEN_SECRET).update(payloadB64).digest();
  const expected = base64UrlEncode(sig);
  if (expected !== sigB64) return null;
  try {
    const raw = base64UrlDecode(payloadB64);
    const payload = JSON.parse(raw);
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    if (!payload.user_id || !payload.booking_id) return null;
    return { user_id: Number(payload.user_id), booking_id: Number(payload.booking_id) };
  } catch {
    return null;
  }
}

async function storeMessage(bookingId, userId, text) {
  const res = await fetch(`${LARAVEL_URL}/api/chat/store-internal`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Internal-Secret': INTERNAL_SECRET,
    },
    body: JSON.stringify({ booking_id: bookingId, user_id: userId, message: text }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `HTTP ${res.status}`);
  }
  return res.json();
}

io.on('connection', (socket) => {
  socket.on('join_booking', (data, cb) => {
    const { bookingId, token } = data || {};
    if (!bookingId || !token) {
      if (typeof cb === 'function') cb({ ok: false, error: 'bookingId and token required' });
      return;
    }
    const payload = verifyToken(token);
    if (!payload || payload.booking_id !== Number(bookingId)) {
      if (typeof cb === 'function') cb({ ok: false, error: 'Invalid or expired token' });
      return;
    }
    socket.bookingId = payload.booking_id;
    socket.userId = payload.user_id;
    socket.join(`booking:${payload.booking_id}`);
    if (typeof cb === 'function') cb({ ok: true });
  });

  socket.on('message', async (data, cb) => {
    const { bookingId, text, token } = data || {};
    if (!bookingId || typeof text !== 'string' || !token) {
      if (typeof cb === 'function') cb({ ok: false, error: 'bookingId, text, and token required' });
      return;
    }
    const payload = verifyToken(token);
    if (!payload || payload.booking_id !== Number(bookingId)) {
      if (typeof cb === 'function') cb({ ok: false, error: 'Invalid or expired token' });
      return;
    }
    try {
      const { message } = await storeMessage(payload.booking_id, payload.user_id, text.trim());
      io.to(`booking:${payload.booking_id}`).emit('message', message);
      if (typeof cb === 'function') cb({ ok: true, message });
    } catch (e) {
      if (typeof cb === 'function') cb({ ok: false, error: e.message || 'Failed to store message' });
    }
  });

  function emitMarkEvent(event, data, cb) {
    const { bookingId, message_ids: rawIds, token } = data || {};
    const messageIds = Array.isArray(rawIds) ? rawIds.map((id) => Number(id)).filter((n) => n > 0) : [];
    if (!bookingId || !token || messageIds.length === 0) {
      if (typeof cb === 'function') cb({ ok: false, error: 'bookingId, token, and message_ids required' });
      return;
    }
    const payload = verifyToken(token);
    if (!payload || payload.booking_id !== Number(bookingId)) {
      if (typeof cb === 'function') cb({ ok: false, error: 'Invalid or expired token' });
      return;
    }
    io.to(`booking:${payload.booking_id}`).emit(event, { message_ids: messageIds });
    if (typeof cb === 'function') cb({ ok: true });
  }

  socket.on('mark_delivered', (data, cb) => emitMarkEvent('message_delivered', data, cb));
  socket.on('mark_read', (data, cb) => emitMarkEvent('message_read', data, cb));

  function emitTypingEvent(event, data) {
    const { bookingId, token } = data || {};
    if (!bookingId || !token) return;
    const payload = verifyToken(token);
    if (!payload || payload.booking_id !== Number(bookingId)) return;
    socket.to(`booking:${payload.booking_id}`).emit(event, { user_id: payload.user_id });
  }

  socket.on('typing', (data) => emitTypingEvent('typing', data));
  socket.on('typing_stop', (data) => emitTypingEvent('typing_stop', data));
});

httpServer.listen(PORT, () => {
  console.log(`Socket.IO server listening on port ${PORT}`);
});
