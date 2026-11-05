/**
 * Flower Knows — persistent storage layer.
 *
 * Two drivers, chosen automatically by environment variables:
 *
 *  1) Upstash Redis (REST)  — UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN
 *     (Vercel's Upstash / KV integration injects KV_REST_API_URL + KV_REST_API_TOKEN, also supported).
 *     Data lives in a real database, survives deploys, restarts and serverless cold starts.
 *
 *  2) JSON files on disk — folder `data/` (or FK_DATA_DIR). For your own server / VPS / local dev.
 *     On serverless hosts (Vercel, Netlify, AWS Lambda) the disk is read-only/ephemeral, so WRITES ARE
 *     REFUSED with a clear error instead of pretending to work (that was the "fake order" bug).
 *
 * Every collection is a set of records with a string `id`.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import seedProducts from "@/seed/products.json";
import seedCategories from "@/seed/categories.json";
import seedCollections from "@/seed/collections.json";
import seedOrders from "@/seed/orders.json";
import seedLookbook from "@/seed/lookbook.json";
import seedBanners from "@/seed/banners.json";

const SEEDS = {
  products: seedProducts,
  categories: seedCategories,
  collections: seedCollections,
  orders: seedOrders,
  lookbook: seedLookbook,
  banners: seedBanners,
};

const REDIS_URL = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const REDIS_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const USE_REDIS = Boolean(REDIS_URL && REDIS_TOKEN);

const DATA_DIR = process.env.FK_DATA_DIR
  ? path.resolve(process.env.FK_DATA_DIR)
  : path.join(process.cwd(), "data");

const IS_SERVERLESS = Boolean(
  process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.NETLIFY
);

export class StorageError extends Error {
  constructor(message, code = "STORAGE_ERROR") {
    super(message);
    this.name = "StorageError";
    this.code = code;
  }
}

const clone = (v) => JSON.parse(JSON.stringify(v));
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/* ------------------------------------------------------------------ */
/* File driver                                                          */
/* ------------------------------------------------------------------ */

const fileLocks = new Map();
function fileLock(name, fn) {
  const prev = fileLocks.get(name) || Promise.resolve();
  const run = prev.catch(() => {}).then(fn);
  fileLocks.set(name, run.catch(() => {}));
  return run;
}

function assertFileWritable() {
  if (IS_SERVERLESS) {
    throw new StorageError(
      "Хранилище не настроено: на этом хостинге файлы не сохраняются. Подключите Upstash Redis (UPSTASH_REDIS_REST_URL и UPSTASH_REDIS_REST_TOKEN) — см. README.",
      "NOT_PERSISTENT"
    );
  }
}

async function fileRead(col) {
  const fp = path.join(DATA_DIR, `${col}.json`);
  let text;
  try {
    text = await fs.promises.readFile(fp, "utf-8");
  } catch (err) {
    if (err.code === "ENOENT") {
      const seed = clone(SEEDS[col] || []);
      if (!IS_SERVERLESS) {
        try {
          await fileWrite(col, seed);
        } catch {
          /* read-only disk: keep serving the in-memory seed */
        }
      }
      return seed;
    }
    throw new StorageError(`Не удалось прочитать ${col}.json: ${err.message}`);
  }
  try {
    const data = JSON.parse(text);
    return Array.isArray(data) ? data : [];
  } catch {
    // never silently fall back to defaults — a later write would destroy the damaged file
    throw new StorageError(`Файл ${col}.json повреждён. Исправьте его или восстановите из резервной копии.`, "CORRUPT");
  }
}

async function fileWrite(col, arr) {
  assertFileWritable();
  try {
    await fs.promises.mkdir(DATA_DIR, { recursive: true });
    const fp = path.join(DATA_DIR, `${col}.json`);
    const tmp = `${fp}.${process.pid}.${Date.now()}.tmp`;
    await fs.promises.writeFile(tmp, JSON.stringify(arr, null, 2), "utf-8");
    await fs.promises.rename(tmp, fp);
  } catch (err) {
    if (err instanceof StorageError) throw err;
    throw new StorageError(`Не удалось сохранить ${col}.json: ${err.message}`, "WRITE_FAILED");
  }
}

const fileDriver = {
  name: "file",
  async all(col) {
    return fileRead(col);
  },
  async get(col, id) {
    const list = await fileRead(col);
    return list.find((r) => r.id === id) || null;
  },
  async put(col, record) {
    assertFileWritable();
    return fileLock(col, async () => {
      const list = await fileRead(col);
      const i = list.findIndex((r) => r.id === record.id);
      if (i === -1) list.push(record);
      else list[i] = record;
      await fileWrite(col, list);
      return record;
    });
  },
  async remove(col, id) {
    assertFileWritable();
    return fileLock(col, async () => {
      const list = await fileRead(col);
      const next = list.filter((r) => r.id !== id);
      if (next.length === list.length) return false;
      await fileWrite(col, next);
      return true;
    });
  },
  async nextSeq(name) {
    assertFileWritable();
    return fileLock("seq", async () => {
      const fp = path.join(DATA_DIR, "meta.json");
      let meta = {};
      try {
        meta = JSON.parse(await fs.promises.readFile(fp, "utf-8"));
      } catch {
        meta = {};
      }
      meta[name] = (Number(meta[name]) || 0) + 1;
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
      const tmp = `${fp}.${process.pid}.tmp`;
      await fs.promises.writeFile(tmp, JSON.stringify(meta, null, 2), "utf-8");
      await fs.promises.rename(tmp, fp);
      return meta[name];
    });
  },
  async withLock(name, fn) {
    assertFileWritable();
    return fileLock(`lock:${name}`, fn);
  },
  async info() {
    if (IS_SERVERLESS) return { driver: "file", writable: false, persistent: false };
    try {
      await fs.promises.mkdir(DATA_DIR, { recursive: true });
      await fs.promises.access(DATA_DIR, fs.constants.W_OK);
      return { driver: "file", writable: true, persistent: true };
    } catch {
      return { driver: "file", writable: false, persistent: false };
    }
  },
};

/* ------------------------------------------------------------------ */
/* Upstash Redis (REST) driver                                          */
/* ------------------------------------------------------------------ */

async function redisCall(path_, body) {
  let res;
  try {
    res = await fetch(`${REDIS_URL}${path_}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${REDIS_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
  } catch (err) {
    throw new StorageError(`База данных недоступна: ${err.message}`, "REDIS_DOWN");
  }
  let json;
  try {
    json = await res.json();
  } catch {
    throw new StorageError(`База данных вернула некорректный ответ (${res.status})`, "REDIS_BAD");
  }
  if (!res.ok) {
    throw new StorageError(`Ошибка базы данных: ${json?.error || res.status}`, "REDIS_ERROR");
  }
  return json;
}

async function rcmd(args) {
  const json = await redisCall("", args);
  if (json.error) throw new StorageError(`Ошибка базы данных: ${json.error}`, "REDIS_ERROR");
  return json.result;
}

async function rpipe(commands) {
  const json = await redisCall("/pipeline", commands);
  if (!Array.isArray(json)) throw new StorageError("Некорректный ответ базы данных", "REDIS_BAD");
  return json.map((item) => {
    if (item?.error) throw new StorageError(`Ошибка базы данных: ${item.error}`, "REDIS_ERROR");
    return item?.result;
  });
}

const rkey = (col) => `fk:${col}`;
const rinit = (col) => `fk:init:${col}`;

async function redisSeed(col) {
  const seed = SEEDS[col] || [];
  if (seed.length) {
    // HSETNX: never overwrite anything that already exists
    await rpipe(seed.map((r) => ["HSETNX", rkey(col), String(r.id), JSON.stringify(r)]));
  }
  await rcmd(["SET", rinit(col), "1"]);
}

function parseHash(flat) {
  const out = [];
  if (!Array.isArray(flat)) return out;
  for (let i = 0; i < flat.length; i += 2) {
    try {
      out.push(JSON.parse(flat[i + 1]));
    } catch {
      /* skip damaged record */
    }
  }
  return out;
}

const redisDriver = {
  name: "redis",
  async all(col) {
    let [inited, flat] = await rpipe([["GET", rinit(col)], ["HGETALL", rkey(col)]]);
    if (!inited) {
      await redisSeed(col);
      flat = await rcmd(["HGETALL", rkey(col)]);
    }
    return parseHash(flat);
  },
  async get(col, id) {
    let [inited, raw] = await rpipe([["GET", rinit(col)], ["HGET", rkey(col), String(id)]]);
    if (!inited) {
      await redisSeed(col);
      raw = await rcmd(["HGET", rkey(col), String(id)]);
    }
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  async put(col, record) {
    // make sure the collection was seeded first, otherwise a later seed could race with this write
    const inited = await rcmd(["GET", rinit(col)]);
    if (!inited) await redisSeed(col);
    await rcmd(["HSET", rkey(col), String(record.id), JSON.stringify(record)]);
    return record;
  },
  async remove(col, id) {
    const inited = await rcmd(["GET", rinit(col)]);
    if (!inited) await redisSeed(col);
    const n = await rcmd(["HDEL", rkey(col), String(id)]);
    return Number(n) > 0;
  },
  async nextSeq(name) {
    return Number(await rcmd(["INCR", `fk:seq:${name}`]));
  },
  async withLock(name, fn) {
    const token = crypto.randomUUID();
    const key = `fk:lock:${name}`;
    const started = Date.now();
    for (;;) {
      const got = await rcmd(["SET", key, token, "NX", "PX", "15000"]);
      if (got === "OK") break;
      if (Date.now() - started > 9000) {
        throw new StorageError("Сервер занят, повторите попытку через секунду.", "BUSY");
      }
      await sleep(60 + Math.random() * 90);
    }
    try {
      return await fn();
    } finally {
      try {
        await rcmd([
          "EVAL",
          "if redis.call('get',KEYS[1])==ARGV[1] then return redis.call('del',KEYS[1]) else return 0 end",
          "1",
          key,
          token,
        ]);
      } catch {
        /* lock expires by itself after 15s */
      }
    }
  },
  async info() {
    try {
      await rcmd(["PING"]);
      return { driver: "redis", writable: true, persistent: true };
    } catch {
      return { driver: "redis", writable: false, persistent: true, error: true };
    }
  },
};

export const db = USE_REDIS ? redisDriver : fileDriver;
export const storageDriverName = db.name;
