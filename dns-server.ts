import dgram from "dgram";
import os from "os";
import { execFile } from "child_process";

// LAN accessibility helpers:
//  1) DNS server (UDP 53) — answers qret.et (and *.qret.et) with the PC's LAN IP
//     so phones on the same Wi-Fi can open http(s)://qret.et with their Wi-Fi
//     DNS set to this PC. All other queries are forwarded upstream.
//  2) mDNS responder (UDP 5353) — announces qret.local, zero-config fallback:
//     no phone settings needed, just open http://qret.local:PORT.

export const QRET_DOMAIN = "qret.et";
export const QRET_MDNS = "qret.local";
const UPSTREAM_DNS = process.env.UPSTREAM_DNS || "8.8.8.8";

export const dnsServerState: { running: boolean; error?: string; lanIp: string } = {
  running: false,
  lanIp: getLanIp(),
};

export function getLanIp(): string {
  const env = process.env.LAN_IP;
  if (env) return env;

  const ifaces = os.networkInterfaces();
  const addrs: string[] = [];
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name] || []) {
      if (iface && iface.family === "IPv4" && !iface.internal) {
        addrs.push(iface.address);
      }
    }
  }

  // Prefer a normal private LAN address (skip VPN/CGNAT like Tailscale 100.x)
  const priv = addrs.find((ip) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip));
  return priv || addrs[0] || "127.0.0.1";
}

interface ParsedName {
  name: string;
  next: number;
}

export function parseDnsName(buf: Buffer, offset: number): ParsedName {
  const labels: string[] = [];
  let o = offset;
  let jumped = false;
  let nextOffset = -1;

  while (o < buf.length) {
    const len = buf[o];
    if (len === 0) {
      if (!jumped) nextOffset = o + 1;
      break;
    }
    if ((len & 0xc0) === 0xc0) {
      const ptr = ((len & 0x3f) << 8) | buf[o + 1];
      if (!jumped) nextOffset = o + 2;
      jumped = true;
      o = ptr;
      continue;
    }
    labels.push(buf.subarray(o + 1, o + 1 + len).toString("ascii"));
    o += 1 + len;
  }

  if (nextOffset === -1) throw new Error("Malformed DNS name");
  return { name: labels.join(".").toLowerCase(), next: nextOffset };
}

function buildAResponse(query: Buffer, ip: string): Buffer {
  const { next } = parseDnsName(query, 12);
  const questionEnd = next + 4; // skip qtype (2) + qclass (2)
  const question = query.subarray(12, questionEnd);

  const answer = Buffer.alloc(16);
  answer.writeUInt16BE(0xc00c, 0); // pointer back to question name
  answer.writeUInt16BE(1, 2);      // type A
  answer.writeUInt16BE(1, 4);      // class IN
  answer.writeUInt32BE(300, 6);    // TTL
  answer.writeUInt16BE(4, 10);     // RDATA length
  ip.split(".").forEach((seg, i) => {
    answer[12 + i] = parseInt(seg, 10) & 0xff;
  });

  const resp = Buffer.alloc(12 + question.length + answer.length);
  query.copy(resp, 0, 0, 2); // transaction ID
  resp.writeUInt16BE(0x8180, 2); // response, RD+RA
  resp.writeUInt16BE(query.readUInt16BE(4), 4); // QDCOUNT
  resp.writeUInt16BE(1, 6); // ANCOUNT
  resp.writeUInt16BE(0, 8); // NSCOUNT
  resp.writeUInt16BE(0, 10); // ARCOUNT
  question.copy(resp, 12);
  answer.copy(resp, 12 + question.length);
  return resp;
}

function forwardQuery(query: Buffer, onResponse: (resp: Buffer | null) => void) {
  const sock = dgram.createSocket("udp4");
  let done = false;
  const finish = (resp: Buffer | null) => {
    if (done) return;
    done = true;
    try {
      sock.close();
    } catch {
      /* already closed */
    }
    onResponse(resp);
  };

  sock.on("error", () => finish(null));
  sock.on("message", (msg) => finish(msg));
  sock.send(query, 53, UPSTREAM_DNS, (err) => {
    if (err) finish(null);
  });
  setTimeout(() => finish(null), 4000);
}

// Best-effort Windows Firewall rules so phones on the LAN can reach
// UDP 53 (DNS), TCP 80/443 (qret.et) and the main app port.
let firewallWarned = false;
function attemptFirewallRules(port: number) {
  if (process.platform !== "win32") return;
  const rules: Array<[string, string, string]> = [
    ["MBALAN DNS 53 (udp)", "UDP", "53"],
    ["MBALAN App TCP", "TCP", String(port)],
    ["MBALAN HTTP 80", "TCP", "80"],
    ["MBALAN HTTPS 443", "TCP", "443"],
  ];
  for (const [name, proto, localPort] of rules) {
    execFile(
      "netsh",
      ["advfirewall", "firewall", "add", "rule", `name=${name}`, "dir=in", "action=allow", `protocol=${proto}`, `localport=${localPort}`, "profile=private,domain"],
      (err) => {
        if (err && !firewallWarned) {
          firewallWarned = true;
          console.warn(`[DNS] Could not add Windows Firewall rules (run the app once as Administrator so phones can reach the server): ${err.message}`);
        }
      }
    );
  }
}

function encodeName(name: string): Buffer {
  const bufs: Buffer[] = [];
  for (const part of name.split(".")) {
    bufs.push(Buffer.from([part.length]), Buffer.from(part, "ascii"));
  }
  bufs.push(Buffer.from([0]));
  return Buffer.concat(bufs);
}

// Builds an mDNS response for qret.local (A + SRV + PTR for _http._tcp.local)
function buildMdnsResponse(query: Buffer, lanIp: string, port: number): Buffer | null {
  const parsed = parseDnsName(query, 12);
  const qtype = query.readUInt16BE(parsed.next);
  const qname = parsed.name;
  const questionEnd = parsed.next + 4;
  const question = query.subarray(12, questionEnd);

  const answers: Buffer[] = [];
  const additional: Buffer[] = [];

  if (qname === QRET_MDNS && qtype === 1) {
    const a = Buffer.alloc(16);
    a.writeUInt16BE(0xc00c, 0);
    a.writeUInt16BE(1, 2);
    a.writeUInt16BE(0x8001, 4); // cache-flush IN
    a.writeUInt32BE(120, 6);
    a.writeUInt16BE(4, 10);
    lanIp.split(".").forEach((seg, i) => {
      a[12 + i] = parseInt(seg, 10) & 0xff;
    });
    answers.push(a);
  }

  if (qname === "_http._tcp.local" && qtype === 12) {
    const target = encodeName(QRET_MDNS);
    const ptr = Buffer.concat([
      Buffer.from([0xc0, 0x0c]),
      Buffer.from([0, 12]),
      Buffer.from([0, 1]),
      Buffer.alloc(4),
      Buffer.alloc(2),
      target,
    ]);
    ptr.writeUInt32BE(120, 6);
    ptr.writeUInt16BE(target.length, 10);
    answers.push(ptr);

    const srv = Buffer.concat([
      Buffer.from([0xc0, 0x0c]),
      Buffer.from([0, 33]),
      Buffer.from([0x80, 0x01]),
      Buffer.alloc(4),
      Buffer.alloc(2),
      Buffer.from([0, 0, 0, 0]),
      Buffer.from([(port >> 8) & 0xff, port & 0xff]),
      target,
    ]);
    srv.writeUInt32BE(120, 6);
    srv.writeUInt16BE(6 + target.length, 10);
    answers.push(srv);

    const a = Buffer.alloc(16);
    a.writeUInt16BE(0xc00c, 0);
    a.writeUInt16BE(1, 2);
    a.writeUInt16BE(0x8001, 4);
    a.writeUInt32BE(120, 6);
    a.writeUInt16BE(4, 10);
    lanIp.split(".").forEach((seg, i) => {
      a[12 + i] = parseInt(seg, 10) & 0xff;
    });
    additional.push(a);
  }

  if (answers.length === 0) return null;

  const resp = Buffer.alloc(12 + question.length + answers.reduce((n, a) => n + a.length, 0) + additional.reduce((n, a) => n + a.length, 0));
  query.copy(resp, 0, 0, 2); // transaction ID
  resp.writeUInt16BE(0x8400, 2); // response, authoritative
  resp.writeUInt16BE(query.readUInt16BE(4), 4); // QDCOUNT
  resp.writeUInt16BE(answers.length, 6); // ANCOUNT
  resp.writeUInt16BE(0, 8); // NSCOUNT
  resp.writeUInt16BE(additional.length, 10); // ARCOUNT
  question.copy(resp, 12);
  let off = 12 + question.length;
  for (const a of answers) {
    a.copy(resp, off);
    off += a.length;
  }
  for (const a of additional) {
    a.copy(resp, off);
    off += a.length;
  }
  return resp;
}

// Zero-config mDNS responder for http://qret.local (no phone DNS settings needed)
function startMdnsResponder(lanIp: string, port: number): dgram.Socket | null {
  let sock: dgram.Socket;
  try {
    sock = dgram.createSocket({ type: "udp4", reuseAddr: true });
  } catch {
    return null;
  }

  sock.on("message", (msg, rinfo) => {
    try {
      if (msg.length < 12) return;
      const resp = buildMdnsResponse(msg, lanIp, port);
      if (!resp) return;
      // mDNS convention: queries from port 5353 are multicast — reply to the group
      const targetPort = rinfo.port === 5353 ? 5353 : rinfo.port;
      const targetAddr = rinfo.port === 5353 ? "224.0.0.251" : rinfo.address;
      sock.send(resp, targetPort, targetAddr);
    } catch {
      /* ignore malformed */
    }
  });

  sock.on("error", (err) => {
    console.warn(`[mDNS] responder error: ${err.message}`);
  });

  try {
    sock.bind(5353, "0.0.0.0", () => {
      try {
        sock.addMembership("224.0.0.251");
      } catch {
        /* multicast group join may fail on some networks */
      }
      console.log(`[mDNS] announcing http://${QRET_MDNS}:${port} — zero-config phone access`);
    });
  } catch (e) {
    console.warn(`[mDNS] could not start responder: ${(e as Error).message}`);
    return null;
  }

  return sock;
}

export function startDnsServer(port: number): dgram.Socket | null {
  const lanIp = getLanIp();
  dnsServerState.lanIp = lanIp;

  let server: dgram.Socket;
  try {
    server = dgram.createSocket("udp4");
  } catch (e) {
    dnsServerState.error = (e as Error).message;
    console.warn(`[DNS] Could not create DNS socket: ${dnsServerState.error}`);
    return null;
  }

  server.on("message", (msg, rinfo) => {
    try {
      if (msg.length < 12) return;
      const parsed = parseDnsName(msg, 12);
      const qtype = msg.readUInt16BE(parsed.next);
      const qclass = msg.readUInt16BE(parsed.next + 2);

      const isQret = parsed.name === QRET_DOMAIN || parsed.name.endsWith("." + QRET_DOMAIN);
      if (qclass === 1 && qtype === 1 && isQret) {
        server.send(buildAResponse(msg, lanIp), rinfo.port, rinfo.address);
        return;
      }
      forwardQuery(msg, (resp) => {
        if (resp) {
          try {
            server.send(resp, rinfo.port, rinfo.address);
          } catch {
            /* ignore */
          }
        }
      });
    } catch {
      /* ignore malformed packets */
    }
  });

  server.on("error", (err) => {
    dnsServerState.error = err.message;
    console.warn(`[DNS] LAN DNS server error: ${err.message}`);
  });

  server.bind(53, "0.0.0.0", () => {
    dnsServerState.running = true;
    dnsServerState.error = undefined;
    console.log(`[DNS] LAN DNS server on UDP 53 — qret.et -> ${lanIp}`);
    console.log(`[DNS] Set your phone's Wi-Fi DNS server to ${lanIp}, then open http://qret.et on the phone.`);
    attemptFirewallRules(port);
  });

  startMdnsResponder(lanIp, port);

  return server;
}