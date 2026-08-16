import "dotenv/config";
import express from "express";
import path from "path";
import fs from "fs";
import https from "https";
import crypto from "crypto";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import QRCode from "qrcode";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import { getLanIp, startDnsServer, dnsServerState } from "./dns-server";
import {
  loginSchema,
  paymentProfileSchema,
  menuItemSchema,
  menuItemUpdateSchema,
  menuBatchSchema,
  staffSchema,
  adminMerchantSchema,
  adminMerchantUpdateSchema,
  imagePayloadSchema,
  itemLookupSchema,
  assistantSchema,
  translateSchema,
  changePasswordSchema,
  updateProfileSchema,
  parseOrFail,
} from "./validation";

const PORT = Number(process.env.PORT) || 3000;
const SKIP_LOCAL_HOST = process.env.SKIP_LOCAL_HOST === "1" || false;
const DB_FILE = path.join(process.cwd(), "db.json");
const JWT_SECRET = process.env.JWT_SECRET || "super_secure_zero_trust_jwt_secret_key_1337";

// Supabase client initialization (Syncs with menu_items Supabase table)
const SUPABASE_URL = process.env.SUPABASE_URL || "https://znlxomizgdzygedsdqer.supabase.co";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_HkWBISrG6Fpzlgwaf0-4-Q_dIo_GRpP";
const supabase = (SUPABASE_URL && SUPABASE_ANON_KEY) ? createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Fallback image search matching helper for food items
function getFallbackFoodImageUrl(query: string, titleEn: string, category: string): string {
  const clean = (query || titleEn || "").toLowerCase();
  
  if (clean.includes("doro") || clean.includes("chicken stew")) {
    return "https://images.unsplash.com/photo-1541518763669-27fef04b14e8?auto=format&fit=crop&w=600&q=80";
  }
  if (clean.includes("rice") || clean.includes("ሩዝ")) {
    return "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80";
  }
  if (clean.includes("tibs") || clean.includes("beef") || clean.includes("ጥብስ")) {
    return "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80";
  }
  if (clean.includes("kitfo") || clean.includes("ክትፎ")) {
    return "https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?auto=format&fit=crop&w=600&q=80";
  }
  if (clean.includes("shiro") || clean.includes("ሽሮ")) {
    return "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80";
  }
  if (clean.includes("beyaynetu") || clean.includes("በያይነቱ") || clean.includes("fasting") || clean.includes("vegan")) {
    return "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80";
  }
  if (clean.includes("coffee") || clean.includes("cappuccino") || clean.includes("ቡና") || clean.includes("latte")) {
    return "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80";
  }
  if (clean.includes("juice") || clean.includes("spris") || clean.includes("smoothie") || clean.includes("avocado")) {
    return "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80";
  }
  if (clean.includes("burger")) {
    return "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80";
  }
  if (clean.includes("pizza")) {
    return "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80";
  }
  
  if (category === "Drinks" || category === "Hot Beverages") {
    return "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=600&q=80";
  }
  if (category === "Desserts") {
    return "https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=600&q=80";
  }
  if (category === "Appetizers") {
    return "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80";
  }
  
  return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80";
}

// Helper: Generate multiple realistic food photo options matching search query (e.g., Kitfo, Doro Wat, Tibs, Burger, etc.)
function getFoodImageOptionsForQuery(query: string, category: string = "Dishes") {
  const clean = (query || "").toLowerCase().trim();

  if (clean.includes("kitfo") || clean.includes("ክትፎ")) {
    return [
      { id: "1", title: "Traditional Spiced Kitfo Platter", label: "Kitfo Special", url: "https://images.unsplash.com/photo-1514944288352-fffac99f0bdf?auto=format&fit=crop&w=600&q=80" },
      { id: "2", title: "Sizzling Clay Pot Kitfo", label: "Sizzling Kitfo", url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80" },
      { id: "3", title: "Kitfo with Cottage Cheese (Ayib) & Greens", label: "Kitfo + Ayib + Gomen", url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" },
      { id: "4", title: "Pan-Seared Seasoned Kitfo", label: "Leb Leb (Lightly Cooked)", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80" },
      { id: "5", title: "Spiced Beef Cubes & Butter", label: "Mitmita Butter Platter", url: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80" },
      { id: "6", title: "Ethiopian Gourmet Meat Selection", label: "Gourmet Kitfo", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80" }
    ];
  }

  if (clean.includes("doro") || clean.includes("chicken stew")) {
    return [
      { id: "1", title: "Traditional Doro Wat Chicken Stew", label: "Doro Wat Stew", url: "https://images.unsplash.com/photo-1541518763669-27fef04b14e8?auto=format&fit=crop&w=600&q=80" },
      { id: "2", title: "Rich Spiced Chicken & Egg Bowl", label: "Chicken & Boiled Egg", url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80" },
      { id: "3", title: "Red Pepper Braised Chicken", label: "Berbere Chicken", url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80" },
      { id: "4", title: "Roasted Spiced Chicken Drumsticks", label: "Roast Chicken", url: "https://images.unsplash.com/photo-1532550907401-a500c9a57435?auto=format&fit=crop&w=600&q=80" }
    ];
  }

  if (clean.includes("tibs") || clean.includes("ጥብስ") || clean.includes("beef")) {
    return [
      { id: "1", title: "Shekla Tibs Sizzling Clay Pot", label: "Shekla Tibs", url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80" },
      { id: "2", title: "Pan-Fried Beef Tibs with Rosemary & Peppers", label: "Special Tibs", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80" },
      { id: "3", title: "Spiced Sautéed Beef Strips & Onions", label: "Beef & Onions", url: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?auto=format&fit=crop&w=600&q=80" },
      { id: "4", title: "Injera Platter with Sautéed Meat", label: "Tibs Platter", url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" }
    ];
  }

  if (clean.includes("shiro") || clean.includes("ሽሮ")) {
    return [
      { id: "1", title: "Bubbling Shiro Tegabeno in Clay Dish", label: "Shiro Tegabeno", url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80" },
      { id: "2", title: "Spiced Creamy Chickpea Stew", label: "Creamy Shiro", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80" },
      { id: "3", title: "Savory Vegetarian Stew Bowl", label: "Vegetarian Shiro", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80" },
      { id: "4", title: "Golden Lentil Chickpea Puree", label: "Shiro Wot", url: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80" }
    ];
  }

  if (clean.includes("beyaynetu") || clean.includes("በያይነቱ") || clean.includes("fasting") || clean.includes("vegan")) {
    return [
      { id: "1", title: "Beyaynetu Ethiopian Fasting Veggie Platter", label: "Beyaynetu Platter", url: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80" },
      { id: "2", title: "Assorted Veggie & Lentil Salad Sampler", label: "Lentil Sampler", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80" },
      { id: "3", title: "Warm Chickpea & Vegetable Stews", label: "Veggie Combo", url: "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=600&q=80" },
      { id: "4", title: "Fresh Plant-Based Platter", label: "Vegan Fasting", url: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80" }
    ];
  }

  if (clean.includes("burger")) {
    return [
      { id: "1", title: "Classic Cheeseburger with Lettuce & Tomato", label: "Classic Cheeseburger", url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80" },
      { id: "2", title: "Double Patty Gourmet Burger", label: "Double Burger", url: "https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80" },
      { id: "3", title: "Crispy Chicken Patty Burger", label: "Chicken Burger", url: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80" },
      { id: "4", title: "Smoky BBQ Bacon Burger", label: "BBQ Burger", url: "https://images.unsplash.com/photo-1571091718767-18b5b1457add?auto=format&fit=crop&w=600&q=80" }
    ];
  }

  if (clean.includes("pizza")) {
    return [
      { id: "1", title: "Wood-Fired Margherita Pizza", label: "Margherita", url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=600&q=80" },
      { id: "2", title: "Pepperoni & Cheese Loaded Pizza", label: "Pepperoni", url: "https://images.unsplash.com/photo-1534308983496-4fabb1a015ee?auto=format&fit=crop&w=600&q=80" },
      { id: "3", title: "Cheesy Pizza Slice with Herbs", label: "Cheesy Slice", url: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=600&q=80" },
      { id: "4", title: "Supreme Veggie & Mushroom Pizza", label: "Veggie Supreme", url: "https://images.unsplash.com/photo-1593560708920-61dd98c46a4e?auto=format&fit=crop&w=600&q=80" }
    ];
  }

  if (clean.includes("coffee") || clean.includes("cappuccino") || clean.includes("latte") || clean.includes("macchiato") || clean.includes("ቡና")) {
    return [
      { id: "1", title: "Foamy Cappuccino Cup with Latte Art", label: "Cappuccino Art", url: "https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=600&q=80" },
      { id: "2", title: "Traditional Ethiopian Black Coffee Ceremony", label: "Black Coffee", url: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80" },
      { id: "3", title: "Layered Espresso Macchiato Glass", label: "Layered Macchiato", url: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=600&q=80" },
      { id: "4", title: "Rich Dark Espresso Shot", label: "Double Espresso", url: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=600&q=80" }
    ];
  }

  if (clean.includes("juice") || clean.includes("spris") || clean.includes("smoothie") || clean.includes("avocado")) {
    return [
      { id: "1", title: "Layered Avocado & Mango Spris Juice", label: "Spris Juice", url: "https://images.unsplash.com/photo-1613478223719-2ab802602423?auto=format&fit=crop&w=600&q=80" },
      { id: "2", title: "Fresh Tropical Fruit Smoothie Glass", label: "Tropical Smoothie", url: "https://images.unsplash.com/photo-1553530666-ba11a7da3888?auto=format&fit=crop&w=600&q=80" },
      { id: "3", title: "Chilled Fresh Orange Juice", label: "Orange Juice", url: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80" },
      { id: "4", title: "Iced Berry Fruit Drink", label: "Berry Drink", url: "https://images.unsplash.com/photo-1546173159-315724a31696?auto=format&fit=crop&w=600&q=80" }
    ];
  }

  return [
    { id: "1", title: "Chef Gourmet Plated Meal", label: "Gourmet Meal", url: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=600&q=80" },
    { id: "2", title: "Fresh Culinary Dish Presentation", label: "Culinary Dish", url: "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80" },
    { id: "3", title: "Pan-Sautéed Hot Meal", label: "Hot Meal", url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80" },
    { id: "4", title: "Artisanal Bistro Selection", label: "Bistro Selection", url: "https://images.unsplash.com/photo-1541529086526-db283c563270?auto=format&fit=crop&w=600&q=80" }
  ];
}

// AES-256-CBC Encryption key (32 bytes) and IV Length (16 bytes)
const ENCRYPTION_KEY = Buffer.alloc(32, "secure_mobile_banking_directory_aes_key_at_rest_32");
const IV_LENGTH = 16;

// Helper: Encrypt banking account numbers at rest
function encrypt(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString("hex") + ":" + encrypted.toString("hex");
}

// Helper: Decrypt banking account numbers
function decrypt(text: string): string {
  try {
    const textParts = text.split(":");
    const ivHex = textParts.shift();
    if (!ivHex) return "";
    const iv = Buffer.from(ivHex, "hex");
    const encryptedText = Buffer.from(textParts.join(":"), "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString("utf8");
  } catch (err) {
    console.error("Decryption error:", err);
    return "DECRYPTION_ERROR";
  }
}

// Helper: Verify password (supports plain-text non-encrypted passwords, plus fallback for legacy bcrypt hashes)
function checkPassword(input: string, stored: string): boolean {
  if (!input || !stored) return false;
  if (input === stored) return true;
  try {
    if (stored.startsWith("$2") && bcrypt.compareSync(input, stored)) {
      return true;
    }
  } catch (e) {
    // Ignore error
  }
  return false;
}

// Helper: Execute Gemini AI calls with retry & model fallback for maximum resilience
async function generateContentWithRetry(ai: GoogleGenAI, params: any) {
  const modelsToTry = ["gemini-3.6-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
  let lastError: any = null;

  for (const model of modelsToTry) {
    try {
      return await ai.models.generateContent({
        ...params,
        model
      });
    } catch (err: any) {
      console.warn(`Gemini API call failed with model ${model}:`, err?.message || err);
      lastError = err;
      // Brief delay before retrying with fallback model
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  }
  throw lastError;
}

// Interfaces
interface Merchant {
  id: string;
  companyName: string;
  username: string;
  passwordHash: string;
  billingType: "permanent" | "temporary";
  accountType?: "normal" | "menu";
  requiresPaymentAuthenticator?: boolean;
  staffAccountModel?: "single" | "multi_waiters";
  serviceStatus?: "active" | "paused";
  logoBase64?: string;
  appInstallEnabled?: boolean;
  createdAt: string;
}

interface PaymentProfile {
  id: string;
  merchantId: string;
  platform: string;
  accountNumberEncrypted: string;
  deepLink?: string;
  isActive: boolean;
  createdAt: string;
}

interface MenuItem {
  id: string;
  merchantId: string;
  name: string;
  title_en?: string;
  title_local?: string;
  category: string;
  price: number;
  description?: string;
  is_vegan?: boolean;
  imageUrl?: string;
  imageSource?: "cropped_photo" | "fallback_search" | "custom";
  isAvailable: boolean;
  createdAt: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userDisplay: string;
  action: "login_success" | "login_failed" | "merchant_create" | "merchant_delete" | "profile_create" | "profile_update" | "profile_delete" | "password_change" | "logout" | "system_init" | "menu_update" | "staff_create" | "staff_delete";
  details: string;
  payload?: any;
}

interface TableCopyEvent {
  id: string;
  merchantId: string;
  tableNumber: string;
  bankName: string;
  accountNumber: string;
  timestamp: string;
}

interface StaffAccount {
  id: string;
  merchantId: string;
  name: string;
  username: string;
  passwordHash: string;
  assignedTable?: string;
  createdAt: string;
}

interface ReceiptScan {
  id: string;
  merchantId: string;
  staffId?: string;
  staffName: string;
  tableNumber?: string;
  amount?: number;
  senderName?: string;
  recipientAccount?: string;
  referenceNumber?: string;
  bankName?: string;
  status: "verified" | "suspicious" | "failed" | "pending";
  confidenceScore?: number;
  notes?: string;
  verificationCaveat?: string;
  spellingAndFontCheck?: string;
  timePeriodCheck?: string;
  profilesCount?: number;
  imageUrl?: string;
  timestamp: string;
}

interface Database {
  adminPasswordHash: string;
  adminUsername?: string;
  merchants: Merchant[];
  paymentProfiles: PaymentProfile[];
  menuItems: MenuItem[];
  auditLogs: AuditLog[];
  tableCopyEvents?: TableCopyEvent[];
  staffAccounts?: StaffAccount[];
  receiptScans?: ReceiptScan[];
}

// Default seeded menu items for demo merchant
const DEFAULT_DEMO_MENU: MenuItem[] = [
  {
    id: "m-item-1",
    merchantId: "m-demo",
    name: "Special Kitfo",
    category: "Dishes",
    price: 450,
    description: "Freshly prepared seasoned minced beef with spiced butter, mitmita, and cottage cheese.",
    imageUrl: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    createdAt: "2026-07-05T22:47:49.000Z"
  },
  {
    id: "m-item-2",
    merchantId: "m-demo",
    name: "Beyaynetu (Fasting Platter)",
    category: "Dishes",
    price: 250,
    description: "Assorted lentil, chickpea, and organic vegetable stews served on fresh rolled Injera.",
    imageUrl: "https://images.unsplash.com/photo-1541518763669-27fef04b14e8?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    createdAt: "2026-07-05T22:47:49.000Z"
  },
  {
    id: "m-item-3",
    merchantId: "m-demo",
    name: "Spicy Doro Wat",
    category: "Dishes",
    price: 550,
    description: "Traditional celebration chicken stew cooked with berbere, served with hard-boiled egg.",
    imageUrl: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    createdAt: "2026-07-05T22:47:49.000Z"
  },
  {
    id: "m-item-4",
    merchantId: "m-demo",
    name: "Traditional Ethiopian Coffee (Bunna)",
    category: "Drinks",
    price: 50,
    description: "Freshly roasted and clay-pot brewed aromatic Ethiopian highlands coffee.",
    imageUrl: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    createdAt: "2026-07-05T22:47:49.000Z"
  },
  {
    id: "m-item-5",
    merchantId: "m-demo",
    name: "Fresh Layered Spris Juice",
    category: "Drinks",
    price: 120,
    description: "Freshly blended natural mango, avocado, and guava multi-layered fruit juice.",
    imageUrl: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    createdAt: "2026-07-05T22:47:49.000Z"
  },
  {
    id: "m-item-6",
    merchantId: "m-demo",
    name: "Ambo Mineral Water (500ml)",
    category: "Drinks",
    price: 40,
    description: "Naturally sparkling Ethiopian highland mineral water.",
    imageUrl: "https://images.unsplash.com/photo-1548839140-29a749e1bc4e?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
    createdAt: "2026-07-05T22:47:49.000Z"
  }
];

// Load / Seed database
function loadDatabase(): Database {
  if (fs.existsSync(DB_FILE)) {
    try {
      const data = fs.readFileSync(DB_FILE, "utf8");
      const parsed = JSON.parse(data);
      let updated = false;
      if (!parsed.adminUsername) {
        parsed.adminUsername = "admin";
        updated = true;
      }
      if (!parsed.menuItems) {
        parsed.menuItems = DEFAULT_DEMO_MENU;
        updated = true;
      } else {
        // Do not assign or seed any default images for menu items.
        // Images are intentionally disabled per user preference.
        parsed.menuItems.forEach((item: any) => {
          if (item.imageUrl) {
            // Strip any pre-existing image references
            item.imageUrl = undefined;
            updated = true;
          }
        });
      }
      if (!parsed.tableCopyEvents) {
        parsed.tableCopyEvents = [];
        updated = true;
      }
      if (!parsed.staffAccounts) {
        parsed.staffAccounts = [
          {
            id: "staff-demo-1",
            merchantId: "m-demo",
            name: "Abebe Bekele (Waiter Table 9)",
            username: "waiter9",
            passwordHash: "waiter123",
            assignedTable: "Table 9",
            createdAt: "2026-07-05T22:47:49.000Z"
          }
        ];
        updated = true;
      }
      if (!parsed.receiptScans) {
        parsed.receiptScans = [];
        updated = true;
      }
      if (parsed.merchants) {
        parsed.merchants.forEach((m: Merchant) => {
          if (!m.accountType) {
            m.accountType = m.id === "m-demo" ? "menu" : "normal";
            updated = true;
          }
          if (m.requiresPaymentAuthenticator === undefined) {
            m.requiresPaymentAuthenticator = true;
            updated = true;
          }
          if (!m.staffAccountModel) {
            m.staffAccountModel = m.accountType === "menu" ? "multi_waiters" : "single";
            updated = true;
          }
          if (!m.serviceStatus) {
            m.serviceStatus = "active";
            updated = true;
          }
        });
      }
      if (updated) {
        saveDatabase(parsed);
      }
      return parsed;
    } catch (e) {
      console.error("Failed to parse db.json, returning empty database", e);
    }
  }

  // Plain text non-encrypted passwords
  const adminPasswordHash = "admin123";
  const merchantYouHash = "you12";
  const merchantDemoHash = "merchant123";

  const initialDb: Database = {
    adminPasswordHash,
    adminUsername: "admin",
    merchants: [
      {
        id: "m-e1566efe1b4a",
        companyName: "you",
        username: "you",
        passwordHash: merchantYouHash,
        billingType: "permanent",
        accountType: "normal",
        requiresPaymentAuthenticator: true,
        staffAccountModel: "single",
        serviceStatus: "active",
        createdAt: "2026-07-05T22:47:49.000Z"
      },
      {
        id: "m-demo",
        companyName: "Elegance Boutique & Café",
        username: "demomerchant",
        passwordHash: merchantDemoHash,
        billingType: "permanent",
        accountType: "menu",
        requiresPaymentAuthenticator: true,
        staffAccountModel: "multi_waiters",
        serviceStatus: "active",
        createdAt: "2026-07-05T22:47:49.000Z"
      }
    ],
    paymentProfiles: [
      {
        id: "p-1",
        merchantId: "m-demo",
        platform: "Commercial Bank of Ethiopia (CBE)",
        accountNumberEncrypted: encrypt("100034958194"),
        deepLink: "cbe://pay",
        isActive: true,
        createdAt: "2026-07-05T22:47:49.000Z"
      },
      {
        id: "p-2",
        merchantId: "m-demo",
        platform: "Telebirr Mobile Wallet",
        accountNumberEncrypted: encrypt("0911223344"),
        deepLink: "telebirr://",
        isActive: true,
        createdAt: "2026-07-05T22:47:49.000Z"
      },
      {
        id: "p-3",
        merchantId: "m-demo",
        platform: "Dashen Bank A.S.",
        accountNumberEncrypted: encrypt("509384729103"),
        deepLink: "dashpay://",
        isActive: true,
        createdAt: "2026-07-05T22:47:49.000Z"
      }
    ],
    menuItems: DEFAULT_DEMO_MENU,
    auditLogs: [
      {
        id: "l-1",
        timestamp: "2026-07-05T22:47:49.000Z",
        userId: "system",
        userDisplay: "system (system)",
        action: "system_init",
        details: "Database initialized. Default admin account created."
      },
      {
        id: "l-2",
        timestamp: "2026-07-05T22:47:49.000Z",
        userId: "system",
        userDisplay: "system (system)",
        action: "system_init",
        details: "Demo merchant account (demomerchant) seeded with CBE, Telebirr and Dashen payment directory profiles."
      },
      {
        id: "l-3",
        timestamp: "2026-07-05T22:48:57.000Z",
        userId: "admin-id",
        userDisplay: "admin (admin-id)",
        action: "login_success",
        details: "User successfully logged in. Role: admin"
      },
      {
        id: "l-4",
        timestamp: "2026-07-05T22:49:09.000Z",
        userId: "admin",
        userDisplay: "admin (admin)",
        action: "merchant_create",
        details: 'Created permanent merchant account for business "Elegance Boutique Ltd"'
      },
      {
        id: "l-5",
        timestamp: "2026-07-05T22:49:13.000Z",
        userId: "admin-id",
        userDisplay: "admin (admin-id)",
        action: "logout",
        details: "User logged out."
      },
      {
        id: "l-6",
        timestamp: "2026-07-05T22:49:23.000Z",
        userId: "you",
        userDisplay: "you",
        action: "login_failed",
        details: "Attempted login with incorrect credentials."
      },
      {
        id: "l-7",
        timestamp: "2026-07-05T22:49:26.000Z",
        userId: "m-e1566efe1b4a",
        userDisplay: "you (m-e1566efe1b4a)",
        action: "login_success",
        details: "User successfully logged in. Role: merchant"
      },
      {
        id: "l-8",
        timestamp: "2026-07-05T22:50:08.000Z",
        userId: "m-e1566efe1b4a",
        userDisplay: "you (m-e1566efe1b4a)",
        action: "logout",
        details: "User logged out."
      },
      {
        id: "l-9",
        timestamp: "2026-07-05T22:50:24.000Z",
        userId: "admin-id",
        userDisplay: "admin (admin-id)",
        action: "login_success",
        details: "User successfully logged in. Role: admin"
      },
      {
        id: "l-10",
        timestamp: "2026-07-05T23:12:43.000Z",
        userId: "m-e1566efe1b4a",
        userDisplay: "you (m-e1566efe1b4a)",
        action: "password_change",
        details: 'Successfully changed password for user you. Before password: "you12" New password: "12345"',
        payload: { before: "you12", after: "12345" }
      }
    ]
  };

  saveDatabase(initialDb);
  return initialDb;
}

function saveDatabase(db: Database) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), "utf8");
  } catch (e) {
    console.error("Failed to write to db.json", e);
  }
}

// Log security event
function logSecurityEvent(
  db: Database,
  userId: string,
  userDisplay: string,
  action: AuditLog["action"],
  details: string,
  payload?: any
) {
  const newLog: AuditLog = {
    id: "l-" + crypto.randomUUID(),
    timestamp: new Date().toISOString(),
    userId,
    userDisplay,
    action,
    details,
    payload
  };
  db.auditLogs.unshift(newLog); // prepend to see latest first
  saveDatabase(db);
}

// Masking Account helper for UI preview or standard listing
function maskAccount(accNum: string): string {
  if (accNum.length <= 4) return "****";
  const first4 = accNum.slice(0, 4);
  const last4 = accNum.slice(-4);
  return `${first4}••••${last4}`;
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  app.use(cookieParser());

  // UTF-8 charset safeguard for all API responses (prevents mojibake on Amharic names)
  app.use("/api", (req, res, next) => {
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    next();
  });

  // Rate limiting — brute-force / abuse guards (spec: backend rate limiting)
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Too many login attempts. Please wait a few minutes." },
  });
  const aiLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "AI scanning rate limit reached. Please wait a moment." },
  });
  const scanLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 8,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Receipt scanning rate limit reached. Please wait a moment." },
  });
  const copyLimiter = rateLimit({
    windowMs: 60 * 1000,
    limit: 30,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: "Copy rate limit reached. Please wait a moment." },
  });

  // Memory cache database
  let db = loadDatabase();

  // Session cookie helpers — HTTP-only + SameSite=Strict (blocks XSS token theft + CSRF)
  const SESSION_COOKIE = "mbd_token";
  const cookieIsSecure = (req: any) => process.env.NODE_ENV === "production" || req.secure === true;
  const setSessionCookie = (res: any, token: string, maxAgeMs: number) => {
    res.cookie(SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "strict",
      secure: cookieIsSecure(res.req),
      maxAge: maxAgeMs,
      path: "/",
    });
  };

  // Middleware: Authenticate Request (Bearer header OR HTTP-only session cookie)
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers["authorization"];
    let token = authHeader && authHeader.split(" ")[1];
    if (!token || token === "null" || token === "undefined") {
      token = req.cookies && req.cookies[SESSION_COOKIE];
    }

    if (!token) {
      return res.status(401).json({ error: "Access token missing" });
    }

    jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
      if (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
      }
      req.user = user; // { id, username, role }
      next();
    });
  };

  // --- API ROUTES ---

  // Auth: Login (rate-limited + Zod-guarded; issues HTTP-only session cookie)
  app.post("/api/auth/login", loginLimiter, (req: any, res) => {
    try {
      const input = parseOrFail(loginSchema, req.body);
      if ("error" in input) {
        return res.status(400).json({ error: `Invalid login input — ${input.error}` });
      }
      const { username, password, portalType } = input.data;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password are required" });
      }

      // Double check DB state
      db = loadDatabase();

      const currentAdminUsername = (db.adminUsername || "admin").toLowerCase();
      if (portalType === "admin" || username.toLowerCase() === currentAdminUsername) {
        // Check admin credentials
        const isMatch = checkPassword(password, db.adminPasswordHash);
        if (isMatch) {
          const token = jwt.sign(
            { id: "admin-id", username: db.adminUsername || "admin", role: "admin" },
            JWT_SECRET,
            { expiresIn: "1h" }
          );
          setSessionCookie(res, token, 60 * 60 * 1000);
          logSecurityEvent(db, "admin-id", `${db.adminUsername || "admin"} (admin-id)`, "login_success", "User successfully logged in. Role: admin");
          return res.json({
            token,
            user: {
              id: "admin-id",
              username: db.adminUsername || "admin",
              companyName: "Super Admin",
              role: "admin"
            }
          });
        } else {
          logSecurityEvent(db, username || "unknown", username || "unknown", "login_failed", "Attempted login with incorrect credentials (Admin Portal).");
          return res.status(401).json({ error: "Invalid admin credentials" });
        }
      } else {
        // Check merchant credentials
        const merchant = db.merchants.find(
          (m) => m.username.toLowerCase() === username.toLowerCase()
        );

        if (merchant && checkPassword(password, merchant.passwordHash)) {
          if (merchant.serviceStatus === "paused") {
            logSecurityEvent(db, merchant.id, `${merchant.username} (${merchant.id})`, "login_failed", "Blocked login attempt for paused merchant service.");
            return res.status(403).json({ error: "Account service is currently paused by administrator. Please contact support." });
          }

          const token = jwt.sign(
            { id: merchant.id, username: merchant.username, role: "merchant" },
            JWT_SECRET,
            { expiresIn: "1h" }
          );
          setSessionCookie(res, token, 60 * 60 * 1000);
          logSecurityEvent(
            db,
            merchant.id,
            `${merchant.username} (${merchant.id})`,
            "login_success",
            "User successfully logged in. Role: merchant"
          );
          return res.json({
            token,
            user: {
              id: merchant.id,
              username: merchant.username,
              companyName: merchant.companyName,
              role: "merchant",
              billingType: merchant.billingType,
              accountType: merchant.accountType || "normal",
              requiresPaymentAuthenticator: merchant.requiresPaymentAuthenticator !== false,
              staffAccountModel: merchant.staffAccountModel || (merchant.accountType === "menu" ? "multi_waiters" : "single"),
              serviceStatus: merchant.serviceStatus || "active",
              appInstallEnabled: merchant.appInstallEnabled !== false,
              logoBase64: merchant.logoBase64 || null
            }
          });
        }

        // Check staff / waiter credentials
        const staff = (db.staffAccounts || []).find(
          (s) => s.username.toLowerCase() === username.toLowerCase()
        );

        if (staff && checkPassword(password, staff.passwordHash)) {
          const m = db.merchants.find((m) => m.id === staff.merchantId);
          if (m && m.serviceStatus === "paused") {
            logSecurityEvent(db, staff.id, `${staff.name} (${staff.username})`, "login_failed", "Blocked staff login attempt because parent merchant service is paused.");
            return res.status(403).json({ error: "Merchant service is currently paused by administrator." });
          }

          const token = jwt.sign(
            {
              id: staff.id,
              username: staff.username,
              role: "waiter",
              merchantId: staff.merchantId,
              name: staff.name,
              assignedTable: staff.assignedTable
            },
            JWT_SECRET,
            { expiresIn: "12h" }
          );
          setSessionCookie(res, token, 12 * 60 * 60 * 1000);

          logSecurityEvent(
            db,
            staff.id,
            `${staff.name} (${staff.username})`,
            "login_success",
            `Waiter logged into Staff Portal for merchant "${m ? m.companyName : staff.merchantId}"`
          );

          return res.json({
            token,
            user: {
              id: staff.id,
              username: staff.username,
              name: staff.name,
              companyName: m ? m.companyName : "Restaurant",
              role: "waiter",
              merchantId: staff.merchantId,
              assignedTable: staff.assignedTable || "All Tables"
            }
          });
        }

        logSecurityEvent(db, username || "unknown", username || "unknown", "login_failed", "Attempted login with incorrect credentials (Staff Portal).");
        return res.status(401).json({ error: "Invalid staff or merchant credentials" });
      }
    } catch (err: any) {
      console.error("Critical: Error handling login:", err);
      return res.status(500).json({ error: "Authentication server error: " + (err.message || "Unknown error") });
    }
  });

  // Auth: Logout (clears HTTP-only session cookie)
  app.post("/api/auth/logout", authenticateToken, (req: any, res) => {
    db = loadDatabase();
    res.clearCookie(SESSION_COOKIE, { httpOnly: true, sameSite: "strict", path: "/" });
    const userDisplay = req.user.role === "admin" ? "admin (admin-id)" : `${req.user.username} (${req.user.id})`;
    logSecurityEvent(db, req.user.id, userDisplay, "logout", "User logged out.");
    res.json({ success: true });
  });

  // Public: Get merchant directory details (no auth required)
  app.get("/api/public/merchant/:id", (req, res) => {
    const { id } = req.params;
    db = loadDatabase();
    const merchant = db.merchants.find((m) => m.id === id);
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    // Get active profiles linked strictly to this merchant ID
    const profiles = db.paymentProfiles
      .filter((p) => p.merchantId === id && p.isActive)
      .map((p) => {
        // Decrypt the raw number to mask it on the frontend properly
        const rawAccount = decrypt(p.accountNumberEncrypted);
        return {
          id: p.id,
          platform: p.platform,
          maskedAccountNumber: maskAccount(rawAccount),
          deepLink: p.deepLink || "",
          isActive: p.isActive
        };
      });

    res.json({
      id: merchant.id,
      companyName: merchant.companyName,
      billingType: merchant.billingType,
      accountType: merchant.accountType || "normal",
      requiresPaymentAuthenticator: merchant.requiresPaymentAuthenticator !== false,
      staffAccountModel: merchant.staffAccountModel || (merchant.accountType === "menu" ? "multi_waiters" : "single"),
      serviceStatus: merchant.serviceStatus || "active",
      logoUrl: merchant.logoBase64 || null,
      profiles: merchant.serviceStatus === "paused" ? [] : profiles
    });
  });

  // Public: Get merchant digital menu (no auth required)
  app.get("/api/public/merchant/:id/menu", (req, res) => {
    const { id } = req.params;
    db = loadDatabase();
    const merchant = db.merchants.find((m) => m.id === id);
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    const items = (db.menuItems || []).filter(
      (item) => item.merchantId === id && item.isAvailable
    );
    res.json({
      merchantId: merchant.id,
      companyName: merchant.companyName,
      accountType: merchant.accountType || "normal",
      items
    });
  });

  // Public: Secure Copy / Unmasked banking info (triggers Clipboard action & records Table Copy Event)
  app.get("/api/public/merchant/:id/profile/:profileId/copy", copyLimiter, (req, res) => {
    const { id, profileId } = req.params;
    const tableNumber = req.query.table || req.query.tableNumber || "Main";
    db = loadDatabase();
    
    const profile = db.paymentProfiles.find(
      (p) => p.id === profileId && p.merchantId === id && p.isActive
    );

    if (!profile) {
      return res.status(404).json({ error: "Payment option not found or inactive" });
    }

    const decryptedAccount = decrypt(profile.accountNumberEncrypted);

    // Record Table Scan / Copy Event for real-time owner notifications
    const event: TableCopyEvent = {
      id: "tce-" + crypto.randomUUID(),
      merchantId: id,
      tableNumber: String(tableNumber),
      bankName: profile.platform,
      accountNumber: maskAccount(decryptedAccount),
      timestamp: new Date().toISOString()
    };

    if (!db.tableCopyEvents) db.tableCopyEvents = [];
    db.tableCopyEvents.unshift(event);
    if (db.tableCopyEvents.length > 200) db.tableCopyEvents = db.tableCopyEvents.slice(0, 200);
    saveDatabase(db);

    res.json({
      accountNumber: decryptedAccount,
      tableNumber: String(tableNumber)
    });
  });

  // Public: Record table scan / view event explicitly
  app.post("/api/public/merchant/:id/table-activity", copyLimiter, (req, res) => {
    const { id } = req.params;
    const { tableNumber, bankName, accountNumber } = req.body || {};
    db = loadDatabase();

    const event: TableCopyEvent = {
      id: "tce-" + crypto.randomUUID(),
      merchantId: id,
      tableNumber: tableNumber ? String(tableNumber) : "Main",
      bankName: bankName || "QR Menu View",
      accountNumber: accountNumber || "Direct View",
      timestamp: new Date().toISOString()
    };

    if (!db.tableCopyEvents) db.tableCopyEvents = [];
    db.tableCopyEvents.unshift(event);
    if (db.tableCopyEvents.length > 200) db.tableCopyEvents = db.tableCopyEvents.slice(0, 200);
    saveDatabase(db);

    res.json({ success: true, event });
  });

  // Public: QR Code Generator
  app.get("/api/public/qrcode", async (req, res) => {
    const { text } = req.query;
    if (!text) {
      return res.status(400).json({ error: "Text query parameter is required" });
    }
    try {
      const dataUrl = await QRCode.toDataURL(String(text), {
        margin: 2,
        width: 320,
        color: {
          dark: "#000000",
          light: "#ffffff"
        }
      });
      res.json({ dataUrl });
    } catch (err) {
      console.error("QR generation failed", err);
      res.status(500).json({ error: "Failed to generate QR Code" });
    }
  });

  // Public: QR Tiger Style Short URL Redirect Handler (e.g. /qr1.be/:code or /r/:code)
  app.get(["/qr1.be/:code", "/r/:code"], (req, res) => {
    const db = loadDatabase();
    const activeMerchant = db.merchants && db.merchants[0] ? db.merchants[0] : null;
    if (activeMerchant) {
      return res.redirect(`/u/${activeMerchant.id}`);
    }
    res.redirect("/");
  });

  // --- MERCHANT PROTECTED ROUTES ---

  // Get active merchant profiles (strictly scoped to their logged-in ID)
  app.get("/api/merchant/profiles", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Merchant access only" });
    }
    db = loadDatabase();
    const profiles = db.paymentProfiles
      .filter((p) => p.merchantId === req.user.id)
      .map((p) => {
        const rawAccount = decrypt(p.accountNumberEncrypted);
        return {
          id: p.id,
          platform: p.platform,
          accountNumber: rawAccount, // Unmasked for merchant's dashboard view
          maskedAccountNumber: maskAccount(rawAccount),
          deepLink: p.deepLink || "",
          isActive: p.isActive,
          createdAt: p.createdAt
        };
      });
    res.json(profiles);
  });

  // Create payment profile
  app.post("/api/merchant/profiles", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Merchant access only" });
    }
    const input = parseOrFail(paymentProfileSchema, req.body);
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid payment profile — ${input.error}` });
    }
    const { platform, accountNumber, deepLink, isActive } = input.data;
    if (!platform || !accountNumber) {
      return res.status(400).json({ error: "Platform and Account Number are required" });
    }

    db = loadDatabase();
    const newProfile: PaymentProfile = {
      id: "p-" + crypto.randomUUID(),
      merchantId: req.user.id,
      platform,
      accountNumberEncrypted: encrypt(accountNumber),
      deepLink: deepLink || "",
      isActive: isActive !== undefined ? isActive : true,
      createdAt: new Date().toISOString()
    };

    db.paymentProfiles.push(newProfile);
    
    // Log Security Audit
    const userDisplay = `${req.user.username} (${req.user.id})`;
    logSecurityEvent(
      db,
      req.user.id,
      userDisplay,
      "profile_create",
      `Added payment profile "${platform}" with account ending in ${accountNumber.slice(-4)}`
    );

    res.status(201).json({
      id: newProfile.id,
      platform: newProfile.platform,
      maskedAccountNumber: maskAccount(accountNumber),
      deepLink: newProfile.deepLink,
      isActive: newProfile.isActive
    });
  });

  // Update payment profile
  app.put("/api/merchant/profiles/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;
    const input = parseOrFail(paymentProfileSchema.partial(), req.body);
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid payment profile — ${input.error}` });
    }
    const { platform, accountNumber, deepLink, isActive } = input.data;

    db = loadDatabase();
    const index = db.paymentProfiles.findIndex(
      (p) => p.id === id && p.merchantId === req.user.id
    );

    if (index === -1) {
      return res.status(404).json({ error: "Payment option not found or access denied" });
    }

    const currentProfile = db.paymentProfiles[index];
    if (platform) currentProfile.platform = platform;
    if (accountNumber) currentProfile.accountNumberEncrypted = encrypt(accountNumber);
    if (deepLink !== undefined) currentProfile.deepLink = deepLink;
    if (isActive !== undefined) currentProfile.isActive = isActive;

    db.paymentProfiles[index] = currentProfile;

    // Log Security Audit
    const userDisplay = `${req.user.username} (${req.user.id})`;
    logSecurityEvent(
      db,
      req.user.id,
      userDisplay,
      "profile_update",
      `Updated mobile banking profile "${currentProfile.platform}"`
    );

    res.json({ success: true });
  });

  // Delete payment profile
  app.delete("/api/merchant/profiles/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;

    db = loadDatabase();
    const index = db.paymentProfiles.findIndex(
      (p) => p.id === id && p.merchantId === req.user.id
    );

    if (index === -1) {
      return res.status(404).json({ error: "Payment option not found or access denied" });
    }

    const deleted = db.paymentProfiles.splice(index, 1)[0];
    
    // Log Security Audit
    const userDisplay = `${req.user.username} (${req.user.id})`;
    logSecurityEvent(
      db,
      req.user.id,
      userDisplay,
      "profile_delete",
      `Deleted payment profile "${deleted.platform}"`
    );

    res.json({ success: true });
  });

  // Update merchant profile info (companyName and username)
  app.post("/api/merchant/update-profile", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Merchant access only" });
    }
    const input = parseOrFail(updateProfileSchema, req.body);
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid profile — ${input.error}` });
    }
    const { companyName, username, logoBase64 } = input.data;
    if (!companyName || !username) {
      return res.status(400).json({ error: "Company name and username are required" });
    }

    db = loadDatabase();
    const merchant = db.merchants.find((m) => m.id === req.user.id);
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    // Check if new username is taken by another merchant (case insensitive)
    const taken = db.merchants.some(
      (m) => m.id !== req.user.id && (m.username.toLowerCase() === username.toLowerCase() || username.toLowerCase() === "admin")
    );
    if (taken) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const oldCompanyName = merchant.companyName;
    const oldUsername = merchant.username;

    merchant.companyName = companyName;
    merchant.username = username;
    if (logoBase64 !== undefined) merchant.logoBase64 = logoBase64 ? String(logoBase64) : undefined;
    saveDatabase(db);

    // Log security event
    logSecurityEvent(
      db,
      req.user.id,
      `${username} (${req.user.id})`,
      "profile_update",
      `Updated profile info: companyName from "${oldCompanyName}" to "${companyName}", username from "${oldUsername}" to "${username}"`
    );

    res.json({
      success: true,
      user: {
        id: merchant.id,
        username: merchant.username,
        companyName: merchant.companyName,
        role: "merchant",
        billingType: merchant.billingType,
        logoBase64: merchant.logoBase64 || null
      }
    });
  });

  // Get authenticated merchant's own profile (including brand logo)
  app.get("/api/merchant/profile", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Merchant access only" });
    }
    db = loadDatabase();
    const merchant = db.merchants.find((m) => m.id === req.user.id);
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }
    res.json({
      id: merchant.id,
      companyName: merchant.companyName,
      username: merchant.username,
      logoBase64: merchant.logoBase64 || null
    });
  });

  // Change merchant password
  app.post("/api/merchant/change-password", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const input = parseOrFail(changePasswordSchema, req.body);
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid password change — ${input.error}` });
    }
    const { currentPassword, newPassword } = input.data;
    if (!currentPassword || !newPassword || newPassword.length < 5) {
      return res.status(400).json({ error: "Invalid current or new password (minimum 5 chars)" });
    }

    db = loadDatabase();
    const merchant = db.merchants.find((m) => m.id === req.user.id);
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    if (!checkPassword(currentPassword, merchant.passwordHash)) {
      return res.status(400).json({ error: "Incorrect current password" });
    }

    merchant.passwordHash = newPassword;
    saveDatabase(db);

    // Log detailed audit log (showing cryptographic differences or simple diff representation)
    const userDisplay = `${req.user.username} (${req.user.id})`;
    logSecurityEvent(
      db,
      req.user.id,
      userDisplay,
      "password_change",
      `Successfully changed password for user ${merchant.username}. Before password: "${currentPassword}" New password: "${newPassword}"`,
      { before: currentPassword, after: newPassword }
    );

    res.json({ success: true });
  });

  // --- MERCHANT DIGITAL MENU ROUTES ---

  // Get merchant menu items
  app.get("/api/merchant/menu", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Merchant access only" });
    }
    db = loadDatabase();
    const items = (db.menuItems || []).filter((item) => item.merchantId === req.user.id);
    res.json(items);
  });

  // Add manual menu item
  app.post("/api/merchant/menu", authenticateToken, async (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const input = parseOrFail(menuItemSchema, req.body);
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid menu item — ${input.error}` });
    }
    const { name, title_en, title_local, category, price, description, is_vegan, isAvailable } = input.data;
    const itemName = name || title_en || "Menu Item";
    if (!itemName || price === undefined || Number(price) < 0) {
      return res.status(400).json({ error: "Valid item name and non-negative price are required" });
    }

    db = loadDatabase();
    if (!db.menuItems) db.menuItems = [];

    const newItem: MenuItem = {
      id: "m-item-" + crypto.randomUUID(),
      merchantId: req.user.id,
      name: String(itemName).trim(),
      title_en: title_en ? String(title_en).trim() : String(itemName).trim(),
      title_local: title_local ? String(title_local).trim() : "",
      category: category ? String(category).trim() : "Dishes",
      price: Number(price),
      description: description ? String(description).trim() : "",
      is_vegan: Boolean(is_vegan),
      // Images are disabled — do not store image URLs or sources
      imageUrl: undefined,
      imageSource: undefined,
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
      createdAt: new Date().toISOString()
    };

    db.menuItems.push(newItem);
    saveDatabase(db);

    // Save directly to Supabase menu_items table if connected
    if (supabase) {
      try {
        await supabase.from("menu_items").insert({
          id: newItem.id,
          merchant_id: newItem.merchantId,
          title_en: newItem.title_en || newItem.name,
          title_local: newItem.title_local || "",
          description: newItem.description || "",
          is_vegan: newItem.is_vegan,
          category: newItem.category,
          price: newItem.price,
          image_url: newItem.imageUrl || "",
          image_source: newItem.imageSource || "fallback_search",
          is_available: newItem.isAvailable
        });
      } catch (spErr) {
        console.log("Notice: Supabase direct insert sync fallback:", spErr);
      }
    }

    logSecurityEvent(
      db,
      req.user.id,
      `${req.user.username} (${req.user.id})`,
      "menu_update",
      `Added menu item "${newItem.name}" (${newItem.price} ETB)`
    );

    res.status(201).json(newItem);
  });

  // Batch insert items directly into menu_items database
  app.post("/api/merchant/menu/batch", authenticateToken, async (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const input = parseOrFail(menuBatchSchema, req.body);
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid batch — ${input.error}` });
    }
    const { items: batchItems } = input.data;
    if (!Array.isArray(batchItems) || batchItems.length === 0) {
      return res.status(400).json({ error: "Non-empty items array is required" });
    }

    db = loadDatabase();
    if (!db.menuItems) db.menuItems = [];

    const createdItems: MenuItem[] = [];
    const supabasePayloads: any[] = [];

    for (const raw of batchItems) {
      const titleEn = raw.title_en || raw.name || "Menu Item";
      const titleLocal = raw.title_local || "";
      const itemName = raw.name || (titleLocal ? `${titleEn} (${titleLocal})` : titleEn);

      const newItem: MenuItem = {
        id: "m-item-" + crypto.randomUUID(),
        merchantId: req.user.id,
        name: itemName,
        title_en: titleEn,
        title_local: titleLocal,
        category: raw.category || "Dishes",
        price: Number(raw.price) || 0,
        description: raw.description || "",
        is_vegan: Boolean(raw.is_vegan),
        // Images are disabled — do not include image URLs or sources
        imageUrl: undefined,
        imageSource: undefined,
        isAvailable: raw.isAvailable !== undefined ? Boolean(raw.isAvailable) : true,
        createdAt: new Date().toISOString()
      };

      db.menuItems.push(newItem);
      createdItems.push(newItem);

      supabasePayloads.push({
        id: newItem.id,
        merchant_id: newItem.merchantId,
        title_en: newItem.title_en,
        title_local: newItem.title_local,
        description: newItem.description,
        is_vegan: newItem.is_vegan,
        category: newItem.category,
        price: newItem.price,
        image_url: newItem.imageUrl || "",
        image_source: newItem.imageSource,
        is_available: newItem.isAvailable
      });
    }

    saveDatabase(db);

    if (supabase && supabasePayloads.length > 0) {
      try {
        await supabase.from("menu_items").insert(supabasePayloads);
      } catch (spErr) {
        console.log("Notice: Supabase batch insert sync fallback:", spErr);
      }
    }

    logSecurityEvent(
      db,
      req.user.id,
      `${req.user.username} (${req.user.id})`,
      "menu_update",
      `Batch saved ${createdItems.length} parsed menu items to menu_items database`
    );

    res.status(201).json({ success: true, count: createdItems.length, items: createdItems });
  });

  // Update menu item (edit name, category, price increase/decrease, description, availability, image)
  app.put("/api/merchant/menu/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;
    const input = parseOrFail(menuItemUpdateSchema, req.body);
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid menu item — ${input.error}` });
    }
    const { name, category, price, description, isAvailable } = input.data;

    db = loadDatabase();
    if (!db.menuItems) db.menuItems = [];

    const index = db.menuItems.findIndex((item) => item.id === id && item.merchantId === req.user.id);
    if (index === -1) {
      return res.status(404).json({ error: "Menu item not found or access denied" });
    }

    const current = db.menuItems[index];
    const oldPrice = current.price;
    if (name !== undefined) current.name = String(name).trim();
    if (category !== undefined) current.category = String(category).trim();
    if (price !== undefined) current.price = Number(price);
    if (description !== undefined) current.description = String(description).trim();
    // Do not accept or update image URLs — images are disabled
    if (isAvailable !== undefined) current.isAvailable = Boolean(isAvailable);

    db.menuItems[index] = current;
    saveDatabase(db);

    logSecurityEvent(
      db,
      req.user.id,
      `${req.user.username} (${req.user.id})`,
      "menu_update",
      `Updated menu item "${current.name}" price from ${oldPrice} ETB to ${current.price} ETB`
    );

    res.json(current);
  });

  // Delete menu item
  app.delete("/api/merchant/menu/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;

    db = loadDatabase();
    if (!db.menuItems) db.menuItems = [];

    const index = db.menuItems.findIndex((item) => item.id === id && item.merchantId === req.user.id);
    if (index === -1) {
      return res.status(404).json({ error: "Menu item not found or access denied" });
    }

    const [deleted] = db.menuItems.splice(index, 1);
    saveDatabase(db);

    logSecurityEvent(
      db,
      req.user.id,
      `${req.user.username} (${req.user.id})`,
      "menu_update",
      `Deleted menu item "${deleted.name}"`
    );

    res.json({ success: true });
  });

  // AI Automated Vision-Parsing Pipeline for Menu Images with Fallback Image Matching
  app.post("/api/merchant/menu/ai-parse", aiLimiter, authenticateToken, async (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Merchant access required" });
    }
    const input = parseOrFail(imagePayloadSchema, req.body);
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid image payload — ${input.error}` });
    }
    const { imageBase64, mimeType } = input.data;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data in base64 format is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const cleanBase64 = String(imageBase64).replace(/^data:image\/\w+;base64,/, "");

      const visionPrompt = `Analyze this uploaded menu image (e.g., Ethiopian Dinner Menu or restaurant menu card).
Extract EVERY distinct food package or dish item into a structured JSON array.
For each dish/item, extract:
1. "title_en": Main English name (e.g., 'Doro Wat', 'Steamed Rice', 'Special Tibs', 'Beyaynetu', 'Iced Cappuccino').
2. "title_local": Amharic script name ONLY if explicitly printed on the menu or if it is a standard Ethiopian dish (e.g., 'የዶሮ ወጥ', 'ሩዝ', 'ልዩ ጥብስ'). If no native text is printed or if it is an international dish, leave blank (""). NEVER include Chinese characters, Asian scripts, or repeating unicode loops.
3. "description": Subtext, ingredients, or English explanation (e.g., 'Spicy Chicken Stew with boiled egg & injera', 'Gingered Vegetable Stew with carrots and potatoes').
4. "is_vegan": Set to true IF a vegan leaf indicator 🌱 is visible near the item OR if it is a known plant-based/fasting dish (e.g., Beyaynetu, Misir Wat, Shiro, Salads, Fruit Juices, Black Coffee, Steamed Rice).
5. "category": Categorize as 'Dishes', 'Drinks', 'Appetizers', 'Desserts', 'Hot Beverages', or 'Specialties'.
6. "price": Extracted price number in Ethiopian Birr (ETB).
7. "hasItemPhoto": Set to true IF a distinct cropped food picture or box for this dish is visible in the uploaded menu image.
8. "cropBoundingBox": If "hasItemPhoto" is true, provide normalized coordinates { "ymin": number, "xmin": number, "ymax": number, "xmax": number } (scale 0 to 100) representing the crop region of the food picture on the menu page. If no photo, set to null.
9. "fallbackSearchQuery": Concise English search query for web food image search if crop photo is low quality or missing (e.g., "Ethiopian Doro Wat chicken stew bowl", "Steamed white rice bowl").`;

      const response = await generateContentWithRetry(ai, {
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: cleanBase64
              }
            },
            { text: visionPrompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            description: "List of parsed menu items with vision parameters",
            items: {
              type: Type.OBJECT,
              properties: {
                title_en: { type: Type.STRING, description: "Main English name" },
                title_local: { type: Type.STRING, description: "Amharic or native script name" },
                description: { type: Type.STRING, description: "Subtext or English explanation" },
                is_vegan: { type: Type.BOOLEAN, description: "True if vegan leaf indicator 🌱 or plant-based fasting item" },
                category: { type: Type.STRING, enum: ["Dishes", "Drinks", "Appetizers", "Desserts", "Hot Beverages", "Specialties"] },
                price: { type: Type.NUMBER, description: "Price in ETB" },
                hasItemPhoto: { type: Type.BOOLEAN, description: "True if item photo box exists in uploaded image" },
                cropBoundingBox: {
                  type: Type.OBJECT,
                  properties: {
                    ymin: { type: Type.NUMBER },
                    xmin: { type: Type.NUMBER },
                    ymax: { type: Type.NUMBER },
                    xmax: { type: Type.NUMBER }
                  }
                },
                fallbackSearchQuery: { type: Type.STRING, description: "Search phrase for fallback food photo search" }
              },
              required: ["title_en", "category", "price", "is_vegan"]
            }
          }
        }
      });

      const text = response.text || "[]";
      let parsedItems: any[] = [];
      try {
        parsedItems = JSON.parse(text);
      } catch (parseErr) {
        console.error("Failed to parse Gemini output:", text);
        return res.status(500).json({ error: "Could not format AI response. Please upload a clearer photo." });
      }

      const cleanTitleLocal = (raw: any): string => {
        if (!raw || typeof raw !== "string") return "";
        let str = raw.trim();
        // Remove CJK / Chinese unicode ranges that AI sometimes hallucinates on non-Asian menus
        str = str.replace(/[\u4e00-\u9fff\u3000-\u303f\u2e80-\u2eff\u31c0-\u31ef]/g, "");
        // Collapse repeating string patterns (e.g. ወጥወጥወጥ...)
        str = str.replace(/(.{2,8})\1{2,}/g, "$1");
        str = str.trim();
        return str.length > 35 ? str.substring(0, 35).trim() : str;
      };

      // Process parsed items and enrich with names and fallback search photos
      const formatted = parsedItems.map((item: any) => {
        const titleEn = item.title_en || item.name || "Menu Item";
        const titleLocal = cleanTitleLocal(item.title_local);
        return {
          name: titleLocal ? `${titleEn} (${titleLocal})` : titleEn,
          title_en: titleEn,
          title_local: titleLocal,
          description: item.description || "",
          is_vegan: Boolean(item.is_vegan),
          category: item.category || "Dishes",
          price: Number(item.price) || 0,
          hasItemPhoto: Boolean(item.hasItemPhoto),
          cropBoundingBox: item.cropBoundingBox || null,
          fallbackSearchQuery: item.fallbackSearchQuery || titleEn,
          // Images are disabled — do not return image URLs or sources
          imageUrl: undefined,
          imageSource: undefined
        };
      });

      res.json({ items: formatted });
    } catch (err: any) {
      console.error("Gemini AI menu scanning error:", err);
      res.status(500).json({ error: err.message || "Failed to parse menu image using Gemini AI" });
    }
  });

  // AI Dual Lookup Endpoint: Web Search & Fallback for Menu Items
  app.post("/api/merchant/menu/item-lookup", aiLimiter, authenticateToken, async (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Merchant access required" });
    }
    const input = parseOrFail(itemLookupSchema, req.body || {});
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid lookup — ${input.error}` });
    }
    const { query } = input.data;
    if (!query || typeof query !== "string" || !query.trim()) {
      return res.status(400).json({ error: "Search query string is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const prompt = `Search web and culinary database for food or beverage query: "${query.trim()}".
Perform dual lookup:
1. Search for an exact match for "${query.trim()}". If found, provide details (name, category, estimated price in ETB, realistic description, key ingredients).
2. IF an exact match is unavailable OR to provide helpful culinary context/alternatives, generate 2-4 visually or ingredient-similar food/drink options.
For each item in 'results', specify 'matchType' as either 'exact' or 'similar'.
If 'similar', provide 'similarityReason' explaining why it is similar (e.g., 'Shares key ingredients: minced beef, mitmita spice, and butter' or 'Visually similar iced coffee beverage with espresso foam').

Valid categories: 'Dishes', 'Drinks', 'Appetizers', 'Desserts', 'Hot Beverages', 'Specialties'.`;

      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              exactMatchFound: { type: Type.BOOLEAN, description: "True if exact dish/drink match exists" },
              query: { type: Type.STRING },
              results: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ["Dishes", "Drinks", "Appetizers", "Desserts", "Hot Beverages", "Specialties"] },
                    estimatedPrice: { type: Type.NUMBER, description: "Estimated price in ETB" },
                    description: { type: Type.STRING },
                    matchType: { type: Type.STRING, enum: ["exact", "similar"] },
                    similarityReason: { type: Type.STRING, description: "Explanation of ingredient or visual similarity" },
                    keyIngredients: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["name", "category", "estimatedPrice", "description", "matchType"]
                }
              }
            },
            required: ["exactMatchFound", "results"]
          }
        }
      });

      const text = response.text || "{}";
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(text);
        // Remove any image URLs/options — images are disabled
        if (parsedData.results && Array.isArray(parsedData.results)) {
          parsedData.results = parsedData.results.map((item: any) => ({
            ...item,
            imageUrl: undefined,
            imageOptions: []
          }));
        }
      } catch (parseErr) {
        console.error("Failed to parse Gemini output for item lookup:", text);
        return res.status(500).json({ error: "Could not parse AI food lookup results." });
      }

      res.json(parsedData);
    } catch (err: any) {
      console.error("Gemini AI item lookup error:", err);
      res.status(500).json({ error: err.message || "Failed to search food item details" });
    }
  });

  // Public Endpoint: Search Food Image Options by Query (e.g., Kitfo, Doro Wat, Tibs, Burger, Coffee, etc.)
  app.get("/api/public/search-food-images", (req: any, res: any) => {
    // Image search disabled — return empty set
    const query = String(req.query.q || req.query.query || "").trim();
    const category = String(req.query.category || "Dishes").trim();
    res.json({ query, category, images: [] });
  });

  // AI Scan Bank Card / QR Code / Bank Document via Gemini API
  app.post("/api/merchant/bank/ai-parse", aiLimiter, authenticateToken, async (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Merchant access required" });
    }
    const input = parseOrFail(imagePayloadSchema, req.body);
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid image payload — ${input.error}` });
    }
    const { imageBase64, mimeType } = input.data;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image data in base64 format is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const cleanBase64 = imageBase64.includes("base64,")
        ? imageBase64.split("base64,")[1]
        : imageBase64;

      const imagePart = {
        inlineData: {
          data: cleanBase64,
          mimeType: mimeType || "image/jpeg"
        }
      };

      const prompt = `Analyze this image of a bank account passbook, payment card, QR code banner, or mobile banking screenshot.
Extract:
1. "platform": The bank or mobile wallet name (e.g. Commercial Bank of Ethiopia (CBE), Telebirr Mobile Wallet, Dashen Bank (Amole), Awash Bank, Bank of Abyssinia, etc.).
2. "accountNumber": The account number or mobile phone number displayed.`;

      const response = await generateContentWithRetry(ai, {
        contents: [prompt, imagePart],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              platform: { type: Type.STRING, description: "Bank or mobile wallet platform name" },
              accountNumber: { type: Type.STRING, description: "Account number or mobile phone number" }
            },
            required: ["platform", "accountNumber"]
          }
        }
      });

      const text = response.text || "{}";
      let parsedData: any = {};
      try {
        parsedData = JSON.parse(text);
      } catch (e) {
        parsedData = {};
      }

      res.json(parsedData);
    } catch (err: any) {
      console.error("Gemini AI bank scanning error:", err);
      res.status(500).json({ error: err.message || "Failed to parse bank details using Gemini AI" });
    }
  });

  // --- REAL-TIME TABLE COPY MONITORING & ALERTS ---

  // Get Table Copy Activity for Merchant
  app.get("/api/merchant/table-activity", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Merchant access required" });
    }
    db = loadDatabase();
    const events = (db.tableCopyEvents || []).filter((e) => e.merchantId === req.user.id);
    res.json(events);
  });

  // Clear Table Copy Activity for Merchant
  app.delete("/api/merchant/table-activity", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Merchant access required" });
    }
    db = loadDatabase();
    db.tableCopyEvents = (db.tableCopyEvents || []).filter((e) => e.merchantId !== req.user.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // --- WAITER / STAFF SCANNING ACCOUNTS ---

  // Get Waiter Accounts for Merchant
  app.get("/api/merchant/staff", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Merchant access required" });
    }
    db = loadDatabase();
    const staff = (db.staffAccounts || [])
      .filter((s) => s.merchantId === req.user.id)
      .map(({ passwordHash, ...rest }) => rest);
    res.json(staff);
  });

  // Create Waiter Scanning Account
  app.post("/api/merchant/staff", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Merchant access required" });
    }
    const input = parseOrFail(staffSchema, req.body || {});
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid staff account — ${input.error}` });
    }
    const { name, username, password, assignedTable } = input.data;
    if (!name || !username || !password || password.length < 4) {
      return res.status(400).json({ error: "Name, Username, and Password (min 4 chars) are required" });
    }

    db = loadDatabase();
    if (!db.staffAccounts) db.staffAccounts = [];

    // Check if username taken
    const exists = db.staffAccounts.some((s) => s.username.toLowerCase() === String(username).toLowerCase()) ||
                   db.merchants.some((m) => m.username.toLowerCase() === String(username).toLowerCase());
    if (exists) {
      return res.status(400).json({ error: "Username is already taken" });
    }

    const newStaff: StaffAccount = {
      id: "staff-" + crypto.randomUUID(),
      merchantId: req.user.id,
      name: String(name).trim(),
      username: String(username).trim().toLowerCase(),
      passwordHash: String(password),
      assignedTable: assignedTable ? String(assignedTable).trim() : "All Tables",
      createdAt: new Date().toISOString()
    };

    db.staffAccounts.push(newStaff);
    saveDatabase(db);

    logSecurityEvent(
      db,
      req.user.id,
      `${req.user.username} (${req.user.id})`,
      "staff_create",
      `Created waiter scanning account "${newStaff.name}" (@${newStaff.username}) for table ${newStaff.assignedTable}`
    );

    const { passwordHash, ...safeStaff } = newStaff;
    res.status(201).json(safeStaff);
  });

  // Delete Waiter Scanning Account
  app.delete("/api/merchant/staff/:staffId", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { staffId } = req.params;
    db = loadDatabase();

    if (!db.staffAccounts) db.staffAccounts = [];
    const index = db.staffAccounts.findIndex((s) => s.id === staffId && s.merchantId === req.user.id);
    if (index === -1) {
      return res.status(404).json({ error: "Staff account not found" });
    }

    const [deleted] = db.staffAccounts.splice(index, 1);
    saveDatabase(db);

    logSecurityEvent(
      db,
      req.user.id,
      `${req.user.username} (${req.user.id})`,
      "staff_delete",
      `Deleted waiter scanning account "${deleted.name}" (@${deleted.username})`
    );

    res.json({ success: true });
  });

  // --- GEMINI AI BILL SCANNING & LEGITIMACY VERIFICATION ---

  // Scan Bill & Verify Legitimacy using Gemini AI
  app.post("/api/staff/scan-bill", scanLimiter, authenticateToken, async (req: any, res) => {
    if (req.user.role !== "waiter" && req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Waiter or Merchant access required" });
    }

    const input = parseOrFail(imagePayloadSchema, req.body || {});
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid receipt payload — ${input.error}` });
    }
    const { imageBase64, mimeType, tableNumber, notes, lang } = input.data;
    if (!imageBase64) {
      return res.status(400).json({ error: "Receipt image in base64 format is required" });
    }

    const verdictLang = lang === "am" ? "am" : "en";

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    const merchantId = req.user.merchantId || req.user.id;
    const staffName = req.user.role === "waiter" ? (req.user.name || req.user.username) : "Merchant Admin";
    const staffId = req.user.id;

    db = loadDatabase();
    const merchantObj = db.merchants.find((m) => m.id === merchantId);
    const merchantCompanyName = merchantObj ? merchantObj.companyName : "Merchant";

    // Decrypt merchant's active payment profiles
    const merchantProfiles = (db.paymentProfiles || [])
      .filter((p) => p.merchantId === merchantId && p.isActive)
      .map((p) => {
        const rawAccount = decrypt(p.accountNumberEncrypted);
        return {
          platform: p.platform,
          accountNumber: rawAccount,
          masked: maskAccount(rawAccount)
        };
      });

    const accountsInfoText = merchantProfiles.length > 0
      ? merchantProfiles.map((p) => `- ${p.platform}: Account/Phone ${p.accountNumber}`).join("\n")
      : "No active payment accounts registered for this merchant.";

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });

      const cleanBase64 = String(imageBase64).replace(/^data:image\/\w+;base64,/, "");
      const currentTimeString = new Date().toISOString();

      const prompt = `Analyze this image of an Ethiopian bank payment receipt, mobile transfer confirmation, or printed bill screenshot (e.g., Commercial Bank of Ethiopia CBE Birr, CBE Mobile, Telebirr, Dashen Bank Amole, Awash, Bank of Abyssinia, Coop Bank, etc.).
The current system time is: ${currentTimeString}.

OFFICIAL MERCHANT PAYMENT ACCOUNTS FOR ${merchantCompanyName.toUpperCase()}:
${accountsInfoText}

CRITICAL ACCOUNT MATCH REQUIREMENT:
The receipt MUST show payment sent to one of the official merchant bank accounts or phone numbers listed above!

Perform a strict fraud & authenticity check:
1. "bankName": Identify platform or bank name (e.g. Telebirr, CBE Mobile, CBE Birr, Dashen, Awash).
2. "amount": Transferred numeric amount in ETB.
3. "senderName": Sender/payer name or account/mobile number if visible.
4. "recipientAccount": Recipient / Receiver account number, phone number, or account holder name shown on the receipt.
5. "recipientMatched": Boolean true if the recipient account/phone on the receipt matches one of the official merchant accounts above; false if paid to a DIFFERENT account or unknown recipient.
6. "referenceNumber": Transaction ID / FT reference number / SMS Ref ID.
7. "transactionDate": Date/time shown on the receipt if visible.
8. "spellingAndFontCheck": Verify if text fonts, digit alignments, spacing, and spellings are consistent with authentic mobile bank apps or if they show signs of photo editing/Photoshop manipulation. Report SPECIFIC observations: e.g. "Fonts look genuine, consistent with Telebirr template" or "Numbers appear pixelated/overlaid, suspicious shadowing around the amount".
9. "timePeriodCheck": Check if the transaction timestamp on the receipt is recent (within today/recent hours) vs an old recycled receipt. Report the actual date/time seen and how old it is relative to the current system time.
10. "status": Must be 'verified' ONLY IF recipientMatched is TRUE, authentic with valid spellings, proper fonts, and recent timestamp; otherwise 'suspicious' if recipient account does NOT match merchant's account, edited, font-mismatched, old receipt, fake, or unreadable; 'failed' if not a receipt.
11. "confidenceScore": Integer 0-100 score = the receipt's LEGITIMACY PERCENTAGE. In "notes", ALWAYS explicitly state the percentage and explain step by step exactly what keeps it from being 100% (e.g. 'Legitimacy 85% — verified merchant account and recent timestamp, but fonts show slight misalignment so cannot fully rule out editing'; or 'Legitimacy 30% — recipient does not match merchant account').
12. "notes": Write a DETAILED verdict (at least 4-6 sentences) in ${verdictLang === "am" ? "Amharic (አማርኛ script)" : "English"} explaining step by step: (a) the legitimacy percentage and what it means, (b) what the receipt actually shows (bank, amount, sender, recipient, reference, time), (c) whether the recipient matches the official merchant account and the exact match/mismatch detail, (d) the font/spelling findings and the time-period finding, (e) any red flags such as edited digits, mismatched account, reused/old receipt, unreadable fields, and (f) the final ruling. Use clear evidence-based reasoning, never claim certainty. Keep only the JSON keys in English; write all explanation TEXT in ${verdictLang === "am" ? "Amharic" : "English"}.
13. "verificationCaveat": Write 2-4 sentences in ${verdictLang === "am" ? "Amharic (አማርኛ script)" : "English"} explaining WHY THIS VERDICT IS NOT 100% CERTAIN. Cover honest limitations: this is an AI visual analysis of a single screenshot, not a live bank-API verification; skilled photo editing or deepfake-style fake receipts may look authentic and bypass visual checks; poor photo quality, glare, or cropping can hide the real recipient or reference; customers can legitimately pay from a different phone number or to a different store branch of the same business; and the reference number is only checked against receipts previously scanned by this merchant, so a genuinely unique old receipt could go undetected. Always recommend a final human confirmation (ask the customer to show the live transaction in their bank app) before releasing payment. Write this text in ${verdictLang === "am" ? "Amharic" : "English"}.
14. "spellingAndFontCheck" and "timePeriodCheck" texts must also be written in ${verdictLang === "am" ? "Amharic" : "English"}.`;

      const response = await generateContentWithRetry(ai, {
        contents: {
          parts: [
            {
              inlineData: {
                mimeType: mimeType || "image/jpeg",
                data: cleanBase64
              }
            },
            { text: prompt }
          ]
        },
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              bankName: { type: Type.STRING },
              amount: { type: Type.NUMBER },
              senderName: { type: Type.STRING },
              recipientAccount: { type: Type.STRING },
              recipientMatched: { type: Type.BOOLEAN },
              referenceNumber: { type: Type.STRING },
              transactionDate: { type: Type.STRING },
              spellingAndFontCheck: { type: Type.STRING },
              timePeriodCheck: { type: Type.STRING },
              status: { type: Type.STRING, enum: ["verified", "suspicious", "failed"] },
              confidenceScore: { type: Type.NUMBER },
              notes: { type: Type.STRING },
              verificationCaveat: { type: Type.STRING }
            },
            required: ["status", "bankName", "amount", "notes", "verificationCaveat"]
          }
        }
      });

      const text = response.text || "{}";
      let parsed: any = {};
      try {
        // Harden parsing: strip possible markdown code fences or surrounding text
        const cleaned = String(text)
          .trim()
          .replace(/^```(?:json)?\s*/i, "")
          .replace(/\s*```\s*$/, "")
          .trim();
        const jsonStart = cleaned.indexOf("{");
        const jsonEnd = cleaned.lastIndexOf("}");
        parsed = JSON.parse(jsonStart >= 0 && jsonEnd > jsonStart ? cleaned.slice(jsonStart, jsonEnd + 1) : cleaned);
      } catch (e) {
        console.warn("Could not parse AI response JSON:", text.slice(0, 300));
        parsed = { status: "suspicious", notes: "Could not parse AI response", bankName: "Unknown", amount: 0 };
      }

      db = loadDatabase();
      if (!db.receiptScans) db.receiptScans = [];

      // Account Consistency Verification against merchant's active profiles
      const extractedRecipient = parsed.recipientAccount ? String(parsed.recipientAccount).replace(/\s+/g, "") : "";
      if (merchantProfiles.length > 0 && extractedRecipient && extractedRecipient.length >= 3) {
        const matchedProfile = merchantProfiles.find((p) => {
          const rawClean = p.accountNumber.replace(/\s+/g, "");
          return rawClean && (extractedRecipient.includes(rawClean) || rawClean.includes(extractedRecipient) || (rawClean.length >= 5 && extractedRecipient.endsWith(rawClean.slice(-5))));
        });

        if (!matchedProfile && !parsed.recipientMatched) {
          parsed.status = "suspicious";
          parsed.verificationCaveat = (verdictLang === "am"
            ? "⚠️ ይህ 100% እርግጠኛ ያልሆነበት ምክንያት፡ በስክሪንሾቱ ላይ የታየው የተቀባይ ሂሳብ ቁጥር ተቆርጦ/ጥራቱ ዝቅተኛ ሊሆን ይችላል፣ ደንበኛው ለተለየ ህጋዊ የንግድ ቅርንጫፍ/ሂሳብ ከፍሎ ሊሆን ይችላል፣ ወይም ፎቶው ሌላ ግብይት የሚያሳይ ሊሆን ይችላል። እባክዎ ደንበኛው በባንክ አፕ ውስጥ ያለውን የቀጥታ ግብይት እንዲያሳይዎት ጠይቀው የተቀባዩን ሂሳብ አሃዞች በማጣራት ክፍያውን ይቀበሉ።"
            : "⚠️ Why this is not 100% certain: the account printed on the screenshot may be cut off, low quality, or misread by OCR; the customer may have paid to a different legitimate branch/account of the same business; or the receipt photo may show a different transaction entirely. Please confirm with the customer by opening the LIVE transaction in their bank app and double-checking the recipient account digits before accepting this payment.");
          parsed.notes = (verdictLang === "am"
            ? `🚨 የተቀባይ ሂሳብ አልተጣመረም፡ ደረሰኙ ክፍያ የተላከበት ሂሳብ "${parsed.recipientAccount}" ከ${merchantCompanyName} ከተመዘገቡት የክፍያ ሂሳቦች (${merchantProfiles.map(p => p.platform + ': ' + p.masked).join(', ')}) ጋር አይዛመድም! `
            : `🚨 UNMATCHED RECIPIENT ACCOUNT: Receipt shows payment sent to account "${parsed.recipientAccount}", which DOES NOT match any of ${merchantCompanyName}'s registered payment accounts (${merchantProfiles.map(p => p.platform + ': ' + p.masked).join(', ')})! `) + (parsed.notes || "");
        }
      }

      // Duplicate Reference Check against existing merchant scans
      const refNum = parsed.referenceNumber ? String(parsed.referenceNumber).trim() : "";
      let isDuplicate = false;
      if (refNum && refNum !== "N/A" && refNum.length > 3) {
        const existingScan = db.receiptScans.find(
          (s) => s.merchantId === merchantId && s.referenceNumber && s.referenceNumber.toLowerCase() === refNum.toLowerCase()
        );
        if (existingScan) {
          isDuplicate = true;
          parsed.status = "suspicious";
          parsed.verificationCaveat = (verdictLang === "am"
            ? "⚠️ ይህ 100% እርግጠኛ ያልሆነበት ምክንያት፡ ደንበኛው ተመሳሳይ የመለያ ቅድመ-ቅጥያ ያላቸውን ሁለት የተለያዩ ግብይቶች በህጋዊ መንገድ ከፍሎ ሊሆን ይችላል፣ አስተናጋጁ ተመሳሳዩን ደረሰኝ በስህተት ሁለት ጊዜ ቃኝቶ ሊሆን ይችላል፣ ወይም የማመሳከሪያ ቁጥሩ በተሳሳተ መንገድ ተነቧል። ደንበኛው በባንክ አፕ ውስጥ ያለውን የቀጥታ ግብይት በማሳየት አዲስ ክፍያ መሆኑን ወይም የተደገመ መሆኑን እንዲያረጋግጡ ይጠይቁ።"
            : "⚠️ Why this is not 100% certain: the customer may have genuinely paid twice with two separate transactions that share the same reference prefix, the waiter may have scanned the same receipt twice by mistake, or the reference was typed/read with an OCR error. Ask the customer to show the live transaction on their bank app to confirm whether this is a new or reused payment.");
          parsed.notes = (verdictLang === "am"
            ? `🚨 የተደጋጋሚ ደረሰኝ ማስጠንቀቂያ፡ የማመሳከሪያ #${refNum} ቀደም ሲል በ${existingScan.tableNumber || "Table"} ላይ በ${new Date(existingScan.timestamp).toLocaleString()} ተቃኝቷል! የቆየ ደረሰኝ እንደገና መጠቀም ሊሆን ይችላል። `
            : `🚨 DUPLICATE RECEIPT WARNING: Reference #${refNum} was ALREADY scanned previously on ${existingScan.tableNumber || "Table"} at ${new Date(existingScan.timestamp).toLocaleString()}! Possible reuse of old receipt. `) + (parsed.notes || "");
        }
      }

      // Save scanned bill to merchant's account automatically
      const newScan: ReceiptScan = {
        id: "scan-" + crypto.randomUUID(),
        merchantId,
        staffId,
        staffName,
        tableNumber: tableNumber ? String(tableNumber) : (req.user.assignedTable || "Main"),
        amount: Number(parsed.amount) || 0,
        senderName: parsed.senderName || "Unknown Payer",
        recipientAccount: parsed.recipientAccount || undefined,
        referenceNumber: refNum || "N/A",
        bankName: parsed.bankName || "Mobile Bank",
        status: (parsed.status === "verified" || parsed.status === "suspicious") ? parsed.status : "suspicious",
        confidenceScore: parsed.confidenceScore || (isDuplicate ? 20 : 85),
        notes: parsed.notes || (notes ? String(notes) : "Scanned by waiter"),
        verificationCaveat: parsed.verificationCaveat || undefined,
        spellingAndFontCheck: parsed.spellingAndFontCheck || undefined,
        timePeriodCheck: parsed.timePeriodCheck || undefined,
        // Do not store receipt images — images disabled
        imageUrl: undefined,
        timestamp: new Date().toISOString()
      };

      db.receiptScans.unshift(newScan);
      if (db.receiptScans.length > 300) db.receiptScans = db.receiptScans.slice(0, 300);
      saveDatabase(db);

      res.status(201).json({ ...newScan, profilesCount: merchantProfiles.length });
    } catch (err: any) {
      console.error("Gemini AI bill verification error:", err);
      res.status(500).json({ error: err.message || "Failed to analyze paid bill receipt using Gemini AI" });
    }
  });

  // Translate AI verdict fields into the target UI language (Amharic/English)
  app.post("/api/staff/translate", aiLimiter, authenticateToken, async (req: any, res) => {
    if (req.user.role !== "waiter" && req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Waiter or Merchant access required" });
    }

    const input = parseOrFail(translateSchema, req.body || {});
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid translation request — ${input.error}` });
    }
    const { texts, targetLang } = input.data;
    const lang = targetLang === "am" ? "am" : "en";
    if (!Array.isArray(texts) || texts.length === 0 || texts.length > 8) {
      return res.status(400).json({ error: "texts must be a non-empty array (max 8)" });
    }
    const cleanTexts = texts.map((t: any) => String(t ?? "").slice(0, 6000));
    if (cleanTexts.every((t: string) => !t.trim())) {
      return res.status(400).json({ error: "texts contains no content" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { "User-Agent": "aistudio-build" }
        }
      });

      const prompt = `Translate the following receipt fraud-verification verdict texts into ${lang === "am" ? "natural professional Amharic (አማርኛ)" : "clear English"} for restaurant staff.
Rules:
- Keep ALL numbers, amounts, dates, times, reference IDs, account digits, bank names, and platform names (Telebirr, CBE Birr, ETB, etc.) EXACTLY unchanged.
- Preserve emojis and each message's structure.
- Do not add explanations, markdown, or comments.
- Respond with ONLY a JSON array of translated strings, one per input text, in the exact same order.
Input JSON array:
${JSON.stringify(cleanTexts)}`;

      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: { responseMimeType: "application/json" }
      });

      const raw = String(response.text || "[]")
        .trim()
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```\s*$/, "")
        .trim();
      let translated: any = null;
      try {
        translated = JSON.parse(raw);
      } catch (e) {
        const start = raw.indexOf("[");
        const end = raw.lastIndexOf("]");
        if (start >= 0 && end > start) {
          try {
            translated = JSON.parse(raw.slice(start, end + 1));
          } catch (e2) {
            translated = null;
          }
        }
      }
      if (!Array.isArray(translated)) translated = [];
      const result = cleanTexts.map((t: string, i: number) =>
        typeof translated[i] === "string" && translated[i].trim() ? translated[i] : t
      );
      res.json({ translated: result });
    } catch (err: any) {
      console.error("Verdict translation error:", err);
      res.status(500).json({ error: err.message || "Translation failed" });
    }
  });

  // Get Scanned Bills for Merchant Account
  app.get("/api/merchant/receipt-scans", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant" && req.user.role !== "waiter") {
      return res.status(403).json({ error: "Forbidden" });
    }
    db = loadDatabase();
    const merchantId = req.user.merchantId || req.user.id;
    const scans = (db.receiptScans || []).filter((s) => s.merchantId === merchantId);
    res.json(scans);
  });

  // Delete Scanned Bill Record
  app.delete("/api/merchant/receipt-scans/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== "merchant") {
      return res.status(403).json({ error: "Forbidden: Merchant access required" });
    }
    const { id } = req.params;
    db = loadDatabase();
    if (!db.receiptScans) db.receiptScans = [];
    db.receiptScans = db.receiptScans.filter((s) => s.id !== id || s.merchantId !== req.user.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Gemini AI Assistant Endpoint for Merchants & Waiters
  app.post("/api/gemini/assistant", aiLimiter, authenticateToken, async (req: any, res) => {
    const input = parseOrFail(assistantSchema, req.body);
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid prompt — ${input.error}` });
    }
    const { prompt } = input.data;
    if (!prompt) {
      return res.status(400).json({ error: "Prompt is required" });
    }

    const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || "";
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    try {
      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: { "User-Agent": "aistudio-build" }
        }
      });

      const response = await generateContentWithRetry(ai, {
        contents: prompt,
        config: {
          systemInstruction: "You are the AI Banking & Verification Assistant for Remix Mobile Banking Directory in Ethiopia. You help restaurant owners, waiters, and merchants with mobile payment verification (Telebirr, CBE Birr, CBE Mobile, Awash, Dashen, Bank of Abyssinia), detecting fake transaction receipts, menu translations, and platform operation. Keep answers clear, accurate, and structured.",
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (err: any) {
      console.error("Gemini AI Assistant Error:", err);
      res.status(500).json({ error: err.message || "Failed to generate AI response" });
    }
  });


  // --- ADMIN PROTECTED ROUTES ---

  // Get all scanned bills across all merchants for Super Admin audit
  app.get("/api/admin/receipt-scans", authenticateToken, (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    db = loadDatabase();
    const scans = (db.receiptScans || []).map((s) => {
      const merchant = db.merchants.find((m) => m.id === s.merchantId);
      return {
        ...s,
        merchantName: merchant ? merchant.companyName : "Unknown Merchant"
      };
    });
    res.json(scans);
  });

  // List all merchants
  app.get("/api/admin/merchants", authenticateToken, (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access only" });
    }
    db = loadDatabase();
    
    // Format list for admin
    const merchantsWithDetails = db.merchants.map((m) => {
      const profiles = db.paymentProfiles.filter((p) => p.merchantId === m.id);
      const menuCount = (db.menuItems || []).filter((item) => item.merchantId === m.id).length;
      return {
        id: m.id,
        companyName: m.companyName,
        username: m.username,
        billingType: m.billingType,
        accountType: m.accountType || "normal",
        requiresPaymentAuthenticator: m.requiresPaymentAuthenticator !== false,
        staffAccountModel: m.staffAccountModel || (m.accountType === "menu" ? "multi_waiters" : "single"),
        serviceStatus: m.serviceStatus || "active",
        logoBase64: m.logoBase64 || null,
        appInstallEnabled: m.appInstallEnabled !== false,
        createdAt: m.createdAt,
        profileCount: profiles.length,
        menuCount
      };
    });

    res.json(merchantsWithDetails);
  });

  // Provision a new merchant
  app.post("/api/admin/merchants", authenticateToken, (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const input = parseOrFail(adminMerchantSchema, req.body);
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid merchant — ${input.error}` });
    }
    const {
      companyName,
      username,
      password,
      billingType,
      accountType,
      requiresPaymentAuthenticator,
      staffAccountModel,
      serviceStatus,
      logoBase64,
      appInstallEnabled
    } = input.data;

    if (!companyName || !username || !password || password.length < 5) {
      return res.status(400).json({ error: "Company Name, Username, and Password (min 5 chars) are required" });
    }

    db = loadDatabase();

    // Check if username is taken
    const exists = db.merchants.some(
      (m) => m.username.toLowerCase() === username.toLowerCase() || username.toLowerCase() === "admin"
    );
    if (exists) {
      return res.status(400).json({ error: "Username already taken" });
    }

    const randomHex = crypto.randomBytes(6).toString("hex");
    const merchantId = `m-${randomHex}`;

    const newMerchant: Merchant = {
      id: merchantId,
      companyName,
      username,
      passwordHash: password,
      billingType: billingType === "temporary" ? "temporary" : "permanent",
      accountType: accountType === "menu" ? "menu" : "normal",
      requiresPaymentAuthenticator: requiresPaymentAuthenticator !== undefined ? Boolean(requiresPaymentAuthenticator) : true,
      staffAccountModel: staffAccountModel === "single" ? "single" : "multi_waiters",
      serviceStatus: serviceStatus === "paused" ? "paused" : "active",
      logoBase64: logoBase64 ? String(logoBase64) : undefined,
      appInstallEnabled: appInstallEnabled === undefined ? true : Boolean(appInstallEnabled),
      createdAt: new Date().toISOString()
    };

    db.merchants.push(newMerchant);
    saveDatabase(db);
    console.log(`Admin created merchant ${newMerchant.id} logoBase64 present=${Boolean(newMerchant.logoBase64)} length=${newMerchant.logoBase64 ? String(newMerchant.logoBase64).length : 0}`);
    
    // Log platform security audit log
    logSecurityEvent(
      db,
      "admin",
      "admin (admin)",
      "merchant_create",
      `Created ${newMerchant.billingType} merchant account (${newMerchant.accountType} account, staff model: ${newMerchant.staffAccountModel}) for business "${companyName}" (ID: ${merchantId})`
    );

    res.status(201).json({
      id: newMerchant.id,
      companyName: newMerchant.companyName,
      username: newMerchant.username,
      billingType: newMerchant.billingType,
      accountType: newMerchant.accountType,
      requiresPaymentAuthenticator: newMerchant.requiresPaymentAuthenticator,
      staffAccountModel: newMerchant.staffAccountModel,
      serviceStatus: newMerchant.serviceStatus,
      createdAt: newMerchant.createdAt
    });
  });

  // Toggle Merchant Service Status (Pause / Resume)
  app.post("/api/admin/merchants/:id/toggle-service", authenticateToken, (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    const { id } = req.params;
    db = loadDatabase();

    const merchant = db.merchants.find((m) => m.id === id);
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    const newStatus = merchant.serviceStatus === "paused" ? "active" : "paused";
    merchant.serviceStatus = newStatus;
    saveDatabase(db);

    logSecurityEvent(
      db,
      "admin",
      "admin (admin)",
      "profile_update",
      `Admin ${newStatus === "paused" ? "PAUSED" : "RESUMED"} service for merchant "${merchant.companyName}" (ID: ${merchant.id})`
    );

    res.json({
      success: true,
      serviceStatus: newStatus,
      message: `Merchant service successfully ${newStatus === "paused" ? "paused" : "resumed"}`
    });
  });

  // Update Merchant Configuration by Admin
  app.put("/api/admin/merchants/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }
    const { id } = req.params;
    const input = parseOrFail(adminMerchantUpdateSchema, req.body);
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid merchant — ${input.error}` });
    }
    const {
      companyName,
      username,
      password,
      billingType,
      accountType,
      requiresPaymentAuthenticator,
      staffAccountModel,
      serviceStatus,
      logoBase64,
      appInstallEnabled
    } = input.data;

    db = loadDatabase();
    const merchant = db.merchants.find((m) => m.id === id);
    if (!merchant) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    if (username && username.toLowerCase() !== merchant.username.toLowerCase()) {
      const taken = db.merchants.some(
        (m) => m.id !== id && (m.username.toLowerCase() === username.toLowerCase() || username.toLowerCase() === "admin")
      );
      if (taken) {
        return res.status(400).json({ error: "Username is already taken" });
      }
      merchant.username = username;
    }

    if (companyName) merchant.companyName = companyName;
    if (password && password.length >= 5) merchant.passwordHash = password;
    if (billingType) merchant.billingType = billingType === "temporary" ? "temporary" : "permanent";
    if (accountType) merchant.accountType = accountType === "menu" ? "menu" : "normal";
    if (requiresPaymentAuthenticator !== undefined) merchant.requiresPaymentAuthenticator = Boolean(requiresPaymentAuthenticator);
    if (staffAccountModel) merchant.staffAccountModel = staffAccountModel === "single" ? "single" : "multi_waiters";
    if (serviceStatus) merchant.serviceStatus = serviceStatus === "paused" ? "paused" : "active";
    if (logoBase64 !== undefined) merchant.logoBase64 = logoBase64 ? String(logoBase64) : undefined;
    if (appInstallEnabled !== undefined) merchant.appInstallEnabled = Boolean(appInstallEnabled);

    saveDatabase(db);
    console.log(`Admin updated merchant ${merchant.id} logoBase64 present=${Boolean(merchant.logoBase64)} length=${merchant.logoBase64 ? String(merchant.logoBase64).length : 0}`);

    logSecurityEvent(
      db,
      "admin",
      "admin (admin)",
      "profile_update",
      `Admin updated configuration for merchant "${merchant.companyName}" (ID: ${merchant.id})`
    );

    res.json({
      success: true,
      merchant: {
        id: merchant.id,
        companyName: merchant.companyName,
        username: merchant.username,
        billingType: merchant.billingType,
        accountType: merchant.accountType,
        requiresPaymentAuthenticator: merchant.requiresPaymentAuthenticator,
        staffAccountModel: merchant.staffAccountModel,
        serviceStatus: merchant.serviceStatus,
        logoBase64: merchant.logoBase64 || null,
        appInstallEnabled: merchant.appInstallEnabled !== false
      }
    });
  });

  // Delete merchant (Strictly cascade-deletes payment profiles to ensure strict data isolation and no leaking)
  app.delete("/api/admin/merchants/:id", authenticateToken, (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { id } = req.params;

    db = loadDatabase();
    const merchantIndex = db.merchants.findIndex((m) => m.id === id);
    if (merchantIndex === -1) {
      return res.status(404).json({ error: "Merchant not found" });
    }

    const merchant = db.merchants[merchantIndex];

    // Remove the merchant
    db.merchants.splice(merchantIndex, 1);

    // Cascade delete all merchant linked records (profiles, staff, menu items, scans, events)
    const profilesBefore = (db.paymentProfiles || []).length;
    db.paymentProfiles = (db.paymentProfiles || []).filter((p) => p.merchantId !== id);
    const profilesDeleted = profilesBefore - db.paymentProfiles.length;

    db.staffAccounts = (db.staffAccounts || []).filter((s) => s.merchantId !== id);
    db.menuItems = (db.menuItems || []).filter((m) => m.merchantId !== id);
    db.receiptScans = (db.receiptScans || []).filter((r) => r.merchantId !== id);
    db.tableCopyEvents = (db.tableCopyEvents || []).filter((e) => e.merchantId !== id);

    saveDatabase(db);

    // Log platform security audit log
    logSecurityEvent(
      db,
      "admin",
      "admin (admin)",
      "merchant_delete",
      `Deleted merchant "${merchant.companyName}" (ID: ${id}) and cascade-deleted ${profilesDeleted} linked banking profiles.`
    );

    res.json({ success: true });
  });

  // Get platform security audit logs
  app.get("/api/admin/audit-logs", authenticateToken, (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    db = loadDatabase();
    res.json(db.auditLogs);
  });

  // Update admin username
  app.post("/api/admin/update-username", authenticateToken, (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const { username } = req.body;
    if (!username || username.trim().length < 3) {
      return res.status(400).json({ error: "Username must be at least 3 characters long" });
    }

    db = loadDatabase();
    const oldUsername = db.adminUsername || "admin";
    db.adminUsername = username.trim();
    saveDatabase(db);

    logSecurityEvent(
      db,
      "admin-id",
      `${db.adminUsername} (admin-id)`,
      "profile_update",
      `Admin changed portal username from "${oldUsername}" to "${db.adminUsername}"`
    );

    res.json({
      success: true,
      username: db.adminUsername
    });
  });

  // Update admin credentials
  app.post("/api/admin/update-credentials", authenticateToken, (req: any, res) => {
    if (req.user.role !== "admin") {
      return res.status(403).json({ error: "Forbidden" });
    }
    const input = parseOrFail(changePasswordSchema, req.body);
    if ("error" in input) {
      return res.status(400).json({ error: `Invalid password fields — ${input.error}` });
    }
    const { currentPassword, newPassword } = input.data;
    if (!currentPassword || !newPassword || newPassword.length < 5) {
      return res.status(400).json({ error: "Invalid password fields" });
    }

    db = loadDatabase();
    const isMatch = checkPassword(currentPassword, db.adminPasswordHash);
    if (!isMatch) {
      return res.status(400).json({ error: "Incorrect current admin password" });
    }

    db.adminPasswordHash = newPassword;
    saveDatabase(db);

    logSecurityEvent(
      db,
      "admin-id",
      "admin (admin-id)",
      "password_change",
      `Admin changed portal password securely.`,
      { before: currentPassword, after: newPassword }
    );

    res.json({ success: true });
  });

  // Catch-all 404 for unhandled API routes (ensures JSON response, never HTML)
  app.all("/api/*", (req, res) => {
    res.status(404).json({ error: `API route ${req.method} ${req.path} not found` });
  });

  // Global error handler for API routes
  app.use((err: any, req: any, res: any, next: any) => {
    console.error("API Error caught:", err);
    if (res.headersSent) {
      return next(err);
    }
    if (req.path.startsWith("/api") || req.url.startsWith("/api")) {
      return res.status(500).json({ error: err?.message || "Internal server error" });
    }
    next(err);
  });

  // --- PHONE / LAN ACCESS SETUP HELP ---
  // Serve the local CA certificate so phones can install it for https://qret.et
  app.get("/ca.crt", (req, res) => {
    const caFile = path.join(process.cwd(), "certs", "ca.crt");
    if (!fs.existsSync(caFile)) {
      return res.status(404).send("CA certificate not found on this server.");
    }
    res.setHeader("Content-Type", "application/x-x509-ca-cert");
    res.setHeader("Content-Disposition", "attachment; filename=qret-et-ca.crt");
    res.sendFile(caFile);
  });

  // Step-by-step phone setup page (open it from the PC, scan the QR with the phone)
  app.get("/setup", async (req, res) => {
    const lanIp = getLanIp();
    const siteUrl = `http://${lanIp}:${PORT}`;
    const dnsStatus = dnsServerState.running
      ? `<span style="color:#10B981">RUNNING ✓ — qret.et is being answered on UDP 53</span>`
      : `<span style="color:#E05A47">NOT RUNNING ✗ — ${dnsServerState.error ? dnsServerState.error + " — " : ""}restart the app or check if UDP port 53 is free</span>`;
    let qrSetup = "";
    let qrSite = "";
    try {
      qrSetup = await QRCode.toDataURL(`${siteUrl}/setup`, { width: 200, margin: 1, color: { dark: "#10B981", light: "#0D0E11" } });
      qrSite = await QRCode.toDataURL(siteUrl, { width: 200, margin: 1, color: { dark: "#E2B968", light: "#0D0E11" } });
    } catch (e) {
      /* QR generation failed — page still works without them */
    }

    res.send(`<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Phone Setup — qret.et</title>
<style>
  body { margin:0; background:#0D0E11; color:#F3F4F6; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; -webkit-font-smoothing: antialiased; }
  .wrap { max-width: 560px; margin: 0 auto; padding: 32px 20px 60px; }
  h1 { font-size: 24px; margin: 0 0 6px; }
  h2 { font-size: 15px; margin: 26px 0 10px; color:#E2B968; }
  .sub { color:#A8A49A; font-size: 13px; margin-bottom: 22px; }
  .card { background:#16181D; border:1px solid #2B2823; border-radius:16px; padding:18px; margin-bottom:14px; }
  .ip { background:#0A0C0F; border:1px solid #2B2823; border-radius:12px; padding:14px; font-family:"JetBrains Mono", ui-monospace, monospace; font-size:15px; color:#10B981; text-align:center; }
  .step { display:flex; gap:12px; align-items:flex-start; }
  .num { width:26px; height:26px; border-radius:50%; background:#10B981; color:#0D0E11; font-weight:800; font-size:13px; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
  p, li { font-size: 13px; line-height: 1.6; color:#D1CEC6; }
  li { margin-bottom: 6px; }
  ul { padding-left: 20px; margin: 8px 0 0; }
  code { background:#0A0C0F; border:1px solid #2B2823; border-radius:6px; padding:2px 7px; font-size:12px; color:#E2B968; font-family:"JetBrains Mono", ui-monospace, monospace; }
  .qrs { display:flex; flex-wrap:wrap; gap:14px; justify-content:center; margin-top:6px; }
  .qr { text-align:center; }
  .qr img { width:170px; height:170px; border-radius:14px; border:1px solid #2B2823; }
  .qr span { display:block; margin-top:8px; font-size:11px; color:#A8A49A; }
  a.btn { display:inline-block; margin-top:8px; background:#E2B968; color:#0D0E11; font-weight:800; font-size:13px; text-decoration:none; border-radius:12px; padding:11px 18px; }
  .note { font-size:12px; color:#7E7A70; margin-top:18px; line-height:1.6; }
</style>
</head>
<body>
<div class="wrap">
  <h1>Open qret.et on your phone</h1>
  <p class="sub">qret.et only lives on this PC's hosts file — your phone does not know it. Follow the steps below once and it will work every time the PC is running and your phone is on the same Wi-Fi.</p>

  <div class="card">
    <h2>Server status (from this PC)</h2>
    <p style="margin-top:0">LAN DNS server: ${dnsStatus}<br/><span class="note" style="margin-top:4px;display:inline-block">mDNS (qret.local, zero-config) is also announced — no phone settings needed for that one.</span></p>
  </div>

  <div class="card">
    <h2>This PC's address</h2>
    <div class="ip">${siteUrl}</div>
    <p style="margin-top:10px;margin-bottom:0">Your PC is <code>${lanIp}</code> on the network. The phone must be on the same Wi-Fi as this PC.</p>
  </div>

  <div class="card">
    <h2>Quickest option — qret.local (no settings needed)</h2>
    <p style="margin-top:0">The app also announces itself on the network. On your phone browser simply open:</p>
    <div class="ip">http://qret.local:${PORT}</div>
    <p style="margin-bottom:0">No DNS configuration required — works on iPhone (Safari) out of the box; Android support varies by browser.</p>
  </div>

  <div class="card">
    <h2>Real Android app (APK)</h2>
    <p style="margin-top:0">The platform is also packaged as a native Android app. On the phone browser (after DNS is set) open:</p>
    <div class="ip">http://qret.et/app/qret.apk</div>
    <p style="margin-bottom:0">Download the APK and open it to install — the app is a full-screen WebView that connects automatically (try qret.et, then qret.local, then the LAN IP, or type a custom address if the server moves). Merchants with download permission see a <strong>Download App</strong> button in their dashboard.</p>
  </div>

  <div class="card">
    <h2>Option A — Point the phone's DNS to this PC (for qret.et)</h2>
    <div class="step">
      <div class="num">1</div>
      <div>
        <p style="margin-top:0"><strong>iPhone / iPad:</strong></p>
        <ul>
          <li>Settings → Wi-Fi → tap <strong>(i)</strong> next to your network</li>
          <li>Configure DNS → <strong>Manual</strong></li>
          <li>Delete existing servers, add <code>${lanIp}</code> → Save</li>
        </ul>
      </div>
    </div>
    <div class="step" style="margin-top:14px">
      <div class="num">2</div>
      <div>
        <p style="margin-top:0"><strong>Android:</strong></p>
        <ul>
          <li>Settings → Wi-Fi → long-press your network → Modify network</li>
          <li>Advanced → IP settings → <strong>Static</strong></li>
          <li>Set DNS 1 to <code>${lanIp}</code> → Save</li>
        </ul>
      </div>
    </div>
  </div>

  <div class="card">
    <h2>Step 2 — Open the site</h2>
    <p style="margin-top:0">Now browse to:</p>
    <div class="ip">http://qret.et</div>
    <p style="margin-bottom:0">The built-in LAN DNS server answers <code>qret.et</code> with <code>${lanIp}</code>, so no port numbers are needed. If you still get "DNS couldn't be found", make sure the app is running (check the status card above) and that Windows Firewall allows UDP 53 — run the app once as Administrator and the firewall rules are added automatically.</p>
  </div>

  <div class="card">
    <h2>Step 3 — (Optional) HTTPS without warnings</h2>
    <p style="margin-top:0">For <code>https://qret.et</code> (needed to install the app from your phone) install this PC's security certificate once:</p>
    <ul>
      <li><strong>iPhone:</strong> download the cert below, Settings → Profile Downloaded → Install, then Settings → General → About → Certificate Trust Settings → enable full trust.</li>
      <li><strong>Android:</strong> download the cert below, open it and install as a <em>CA certificate</em> (Settings → Security → Install a certificate → CA certificate).</li>
    </ul>
    <a class="btn" href="/ca.crt">⬇ Download CA certificate</a>
  </div>

  <div class="card">
    <h2>Scan instead of typing</h2>
    <div class="qrs">
      <div class="qr"><img src="${qrSetup}" alt="QR to this setup page" /><span>This page on your phone</span></div>
      <div class="qr"><img src="${qrSite}" alt="QR to the site" /><span>Open the site directly</span></div>
    </div>
  </div>

  <p class="note">The LAN DNS server runs inside the app (UDP port 53). If it could not start (e.g. port 53 is blocked by Windows), set <code>LAN_IP=${lanIp}</code> and <code>SKIP_DNS_SERVER=0</code> and run as administrator, or use the phone setup page from <code>${siteUrl}/setup</code> on any browser.</p>
</div>
</body>
</html>`);
  });

  // --- FRONTEND VITE ROUTING ---

  // Real Android app download (built from android-app/ → public/app/qret.apk)
  app.get("/app/qret.apk", (req, res) => {
    const apkFile = path.join(process.cwd(), "public", "app", "qret.apk");
    if (fs.existsSync(apkFile)) {
      res.setHeader("Content-Disposition", 'attachment; filename="Qret.apk"');
      res.setHeader("Content-Type", "application/vnd.android.package-archive");
      res.sendFile(apkFile);
    } else {
      res.status(404).send("APK not found — run the Android build first");
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: ["qret.et"] },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running locally on http://0.0.0.0:${PORT}`);
    console.log(`Phone access: http://${getLanIp()}:${PORT} — full setup guide: http://${getLanIp()}:${PORT}/setup`);
  });

  // Local qret.et support: http://qret.et (port 80) and https://qret.et (port 443)
  // Can be skipped in development by setting SKIP_LOCAL_HOST=1
  if (!SKIP_LOCAL_HOST) {
    const CERT_DIR = path.join(process.cwd(), "certs");
    const CERT_FILE = path.join(CERT_DIR, "qret.et-cert.pem");
    const KEY_FILE = path.join(CERT_DIR, "qret.et-key.pem");

    if (PORT !== 80) {
      app.listen(80, "0.0.0.0", () => {
        console.log("qret.et served on http://qret.et (port 80)");
      });
    }

    if (fs.existsSync(CERT_FILE) && fs.existsSync(KEY_FILE)) {
      https.createServer(
        {
          key: fs.readFileSync(KEY_FILE),
          cert: fs.readFileSync(CERT_FILE)
        },
        app
      ).listen(443, "0.0.0.0", () => {
        console.log("qret.et served on https://qret.et (port 443)");
      });
    }

    // LAN DNS server: lets phones resolve qret.et without a hosts file entry.
    if (process.env.SKIP_DNS_SERVER !== "1") {
      startDnsServer(PORT);
    }
  }
}

startServer().catch((err) => {
  console.error("Critical: Failed to start secure applet server:", err);
});
