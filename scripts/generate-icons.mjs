import { deflateSync } from "node:zlib";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "icons");
mkdirSync(outDir, { recursive: true });

const CRC_TABLE = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    t[n] = c >>> 0;
  }
  return t;
})();

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_TABLE[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])));
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function encodePng(size, pixelFn) {
  const stride = size * 4;
  const raw = Buffer.alloc(size * stride);
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const [r, g, b, a] = pixelFn(x, y);
      const o = y * stride + x * 4;
      raw[o] = r;
      raw[o + 1] = g;
      raw[o + 2] = b;
      raw[o + 3] = a;
    }
  }
  const scanlines = Buffer.alloc(size * (stride + 1));
  for (let y = 0; y < size; y++) {
    scanlines[y * (stride + 1)] = 0;
    raw.copy(scanlines, y * (stride + 1) + 1, y * stride, (y + 1) * stride);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk("IHDR", ihdr),
    chunk("IDAT", deflateSync(scanlines, { level: 9 })),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

const clamp01 = (v) => Math.min(1, Math.max(0, v));
const sdRoundRect = (px, py, cx, cy, hx, hy, r) => {
  const qx = Math.abs(px - cx) - (hx - r);
  const qy = Math.abs(py - cy) - (hy - r);
  const ax = Math.max(qx, 0);
  const ay = Math.max(qy, 0);
  return Math.hypot(ax, ay) + Math.min(Math.max(qx, qy), 0) - r;
};
const sdSegment = (px, py, ax, ay, bx, by) => {
  const abx = bx - ax, aby = by - ay;
  const apx = px - ax, apy = py - ay;
  const t = clamp01((apx * abx + apy * aby) / (abx * abx + aby * aby));
  return Math.hypot(apx - abx * t, apy - aby * t);
};

function makeIcon(size) {
  const s = size / 512;
  const bg = [13, 14, 17];
  const emerald = [16, 185, 129];
  const gold = [251, 191, 36];
  const ringInset = 26 * s;
  const ringStroke = 14 * s;
  const ringRadius = 96 * s;
  const bgRadius = 118 * s;

  return (x, y) => {
    let color = bg;
    let alpha = 255;
    const dOuter = sdRoundRect(x, y, size / 2, size / 2, size / 2, size / 2, bgRadius);
    if (dOuter > 0) alpha = 0;

    const dRing = Math.abs(sdRoundRect(x, y, size / 2, size / 2, size / 2 - ringInset, size / 2 - ringInset, ringRadius)) - ringStroke / 2;
    const inner = sdRoundRect(x, y, size / 2, size / 2, size / 2 - ringInset - ringStroke / 2, size / 2 - ringInset - ringStroke / 2, ringRadius - ringStroke / 2);
    if (dRing <= 0) {
      const t = clamp01(1 - dRing / (ringStroke / 2));
      color = emerald.map((c, i) => Math.round(c * t + bg[i] * (1 - t)));
    }
    const check = Math.min(
      sdSegment(x, y, 272 * s, 288 * s, 304 * s, 320 * s),
      sdSegment(x, y, 304 * s, 320 * s, 352 * s, 256 * s)
    ) - 17 * s;
    if (check <= 0 && inner <= 0) {
      const t = clamp01(1 - check / (17 * s));
      color = gold.map((c, i) => Math.round(c * t + color[i] * (1 - t)));
    }
    return [color[0], color[1], color[2], alpha];
  };
}

for (const size of [192, 512]) {
  writeFileSync(join(outDir, `icon-${size}.png`), encodePng(size, makeIcon(size)));
  console.log(`Generated public/icons/icon-${size}.png`);
}

const androidRes = join(root, "android-app", "app", "src", "main", "res");
const densities = [
  ["mdpi", 48],
  ["hdpi", 72],
  ["xhdpi", 96],
  ["xxhdpi", 144],
  ["xxxhdpi", 192],
];
for (const [density, size] of densities) {
  const dir = join(androidRes, `mipmap-${density}`);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "ic_launcher.png"), encodePng(size, makeIcon(size)));
  writeFileSync(join(dir, "ic_launcher_round.png"), encodePng(size, makeIcon(size)));
  console.log(`Generated android ${density} launcher icons`);
}