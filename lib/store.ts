import { createHash } from 'node:crypto';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { Message } from '@/types/guestbook';

/**
 * Storage for the guestbook and the visit counter.
 *
 * With Upstash Redis configured (UPSTASH_REDIS_REST_URL/TOKEN, or Vercel's
 * KV_REST_API_URL/TOKEN) everything lives there, which is what serverless
 * hosts need. Otherwise it's a JSON file in DATA_DIR (default `.data`), which
 * suits `npm run dev` and a long-running server. If that file can't be written,
 * the store keeps working in memory so the page never breaks.
 *
 * Visitor IPs are only ever stored as salted SHA-256 hashes.
 */
export interface Store {
  listMessages(limit: number): Promise<Message[]>;
  addMessage(message: Message): Promise<void>;
  /** Returns the new like count, or null when the message doesn't exist. */
  likeMessage(id: string): Promise<number | null>;
  deleteMessage(id: string): Promise<boolean>;
  /** Milliseconds since this visitor last posted, or null if never. */
  getLastPost(visitor: string): Promise<number | null>;
  setLastPost(visitor: string, time: number, ttlMs: number): Promise<void>;
  /** Records a visitor and returns the number of unique visitors so far. */
  recordVisit(visitor: string): Promise<number>;
}

export function hashVisitor(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || 'unknown';
  const salt = process.env.HASH_SALT || 'hikemu';
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

// --- Upstash Redis (REST) --------------------------------------------------

const KEY = {
  messages: 'guestbook:messages', // hash: id -> JSON {author, content, timestamp}
  likes: 'guestbook:likes', // hash: id -> count
  order: 'guestbook:order', // sorted set: id scored by timestamp
  cooldown: (visitor: string) => `guestbook:cooldown:${visitor}`,
  visitors: 'visitors', // set of visitor hashes
};

function redisStore(url: string, token: string): Store {
  async function pipeline(commands: (string | number)[][]): Promise<unknown[]> {
    const response = await fetch(`${url.replace(/\/$/, '')}/pipeline`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(commands),
      cache: 'no-store',
    });
    if (!response.ok) throw new Error(`Upstash error: ${response.status}`);
    const results = (await response.json()) as { result?: unknown; error?: string }[];
    return results.map((r) => {
      if (r.error) throw new Error(`Upstash error: ${r.error}`);
      return r.result;
    });
  }

  return {
    async listMessages(limit) {
      const [ids] = (await pipeline([['ZRANGE', KEY.order, 0, limit - 1, 'REV']])) as [string[]];
      if (!ids.length) return [];
      const [bodies, likes] = (await pipeline([
        ['HMGET', KEY.messages, ...ids],
        ['HMGET', KEY.likes, ...ids],
      ])) as [(string | null)[], (string | null)[]];
      return ids.flatMap((id, i) => {
        if (!bodies[i]) return [];
        const body = JSON.parse(bodies[i]!) as Omit<Message, 'id' | 'likes'>;
        return [{ id, ...body, likes: Number(likes[i] || 0) }];
      });
    },
    async addMessage({ id, likes, ...body }) {
      await pipeline([
        ['HSET', KEY.messages, id, JSON.stringify(body)],
        ['HSET', KEY.likes, id, likes],
        ['ZADD', KEY.order, body.timestamp, id],
      ]);
    },
    async likeMessage(id) {
      const [exists] = (await pipeline([['HEXISTS', KEY.messages, id]])) as [number];
      if (!exists) return null;
      const [count] = (await pipeline([['HINCRBY', KEY.likes, id, 1]])) as [number];
      return count;
    },
    async deleteMessage(id) {
      const [removed] = (await pipeline([
        ['HDEL', KEY.messages, id],
        ['HDEL', KEY.likes, id],
        ['ZREM', KEY.order, id],
      ])) as [number];
      return removed > 0;
    },
    async getLastPost(visitor) {
      const [value] = (await pipeline([['GET', KEY.cooldown(visitor)]])) as [string | null];
      return value ? Number(value) : null;
    },
    async setLastPost(visitor, time, ttlMs) {
      await pipeline([['SET', KEY.cooldown(visitor), time, 'PX', ttlMs]]);
    },
    async recordVisit(visitor) {
      const [, count] = (await pipeline([
        ['SADD', KEY.visitors, visitor],
        ['SCARD', KEY.visitors],
      ])) as [number, number];
      return count;
    },
  };
}

// --- JSON file ---------------------------------------------------------------

interface FileData {
  messages: Message[];
  cooldowns: Record<string, number>;
  visitors: string[];
}

function fileStore(dir: string): Store {
  const file = path.join(dir, 'store.json');
  let data: FileData | null = null;
  let persist = true;
  // Serialises read-modify-write cycles within this process.
  let queue: Promise<unknown> = Promise.resolve();

  async function load(): Promise<FileData> {
    if (data) return data;
    try {
      data = JSON.parse(await readFile(file, 'utf8')) as FileData;
    } catch {
      data = { messages: [], cooldowns: {}, visitors: [] };
    }
    return data;
  }

  async function save() {
    if (!persist || !data) return;
    try {
      await mkdir(dir, { recursive: true });
      const tmp = `${file}.${process.pid}.tmp`;
      await writeFile(tmp, JSON.stringify(data));
      await rename(tmp, file);
    } catch (error) {
      persist = false;
      console.error(`Can't write ${file}; keeping guestbook data in memory only.`, error);
    }
  }

  function run<T>(fn: (d: FileData) => T | Promise<T>, write = false): Promise<T> {
    const next = queue.then(async () => {
      const result = await fn(await load());
      if (write) await save();
      return result;
    });
    queue = next.catch(() => undefined);
    return next;
  }

  return {
    listMessages: (limit) =>
      run((d) => [...d.messages].sort((a, b) => b.timestamp - a.timestamp).slice(0, limit)),
    addMessage: (message) => run((d) => void d.messages.push(message), true),
    likeMessage: (id) =>
      run((d) => {
        const message = d.messages.find((m) => m.id === id);
        if (!message) return null;
        message.likes += 1;
        return message.likes;
      }, true),
    deleteMessage: (id) =>
      run((d) => {
        const before = d.messages.length;
        d.messages = d.messages.filter((m) => m.id !== id);
        return d.messages.length < before;
      }, true),
    getLastPost: (visitor) => run((d) => d.cooldowns[visitor] ?? null),
    setLastPost: (visitor, time, ttlMs) =>
      run((d) => {
        // Drop expired entries so the file doesn't grow forever.
        for (const [key, value] of Object.entries(d.cooldowns)) {
          if (time - value > ttlMs) delete d.cooldowns[key];
        }
        d.cooldowns[visitor] = time;
      }, true),
    recordVisit: (visitor) =>
      run((d) => {
        if (!d.visitors.includes(visitor)) d.visitors.push(visitor);
        return d.visitors.length;
      }, true),
  };
}

// --- selection -----------------------------------------------------------------

const globalForStore = globalThis as unknown as { store: Store | undefined };

export function getStore(): Store {
  if (globalForStore.store) return globalForStore.store;
  const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
  globalForStore.store =
    url && token ? redisStore(url, token) : fileStore(process.env.DATA_DIR || path.join(process.cwd(), '.data'));
  return globalForStore.store;
}
