import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Shield,
  Lock,
  User,
  Building,
  QrCode,
  LogOut,
  Plus,
  Search,
  Copy,
  Check,
  Trash2,
  Settings,
  Key,
  FileText,
  ChevronRight,
  ArrowLeft,
  AlertCircle,
  Eye,
  RefreshCw,
  Download,
  ExternalLink,
  Activity,
  X,
  CreditCard,
  Utensils,
  ChefHat,
  Sparkles,
  PlusCircle,
  MinusCircle,
  ShieldCheck,
  Camera,
  Upload,
  Info,
  Image as ImageIcon
} from "lucide-react";
import { AuditLog, Merchant, PaymentProfile, AuthState, MenuItem, ReceiptScan } from "./types";
import { sanitizeInput, fixMojibake } from "./lib/sanitize";
import { copyToClipboard } from "./lib/clipboard";
import { Footer } from "./components/Footer";
import { ContactInfo } from "./components/ContactInfo";
import { LanguageMenu } from "./components/LanguageMenu";
import { LegalModals } from "./components/LegalModals";
import { DigitalMenuManager } from "./components/DigitalMenuManager";
import { CustomerDigitalMenu } from "./components/CustomerDigitalMenu";
import { CameraUploader } from "./components/CameraUploader";
import { PortalModal } from "./components/PortalModal";
import { TableQRManager } from "./components/TableQRManager";
import { WaiterManager } from "./components/WaiterManager";
import { WaiterPortal } from "./components/WaiterPortal";

const TRANSLATIONS: Record<string, { en: string; am: string }> = {
  "Mobile Banking Directory": {
    en: "Mobile Banking Directory",
    am: "የሞባይል ባንክ ማውጫ"
  },
  "Digital Menu": {
    en: "Digital Menu",
    am: "ዲጂታል ሜኑ"
  },
  "Restaurant Menu": {
    en: "Restaurant Menu",
    am: "የሬስቶራንት ሜኑ"
  },
  "Dishes & Drinks": {
    en: "Dishes & Drinks",
    am: "ምግቦች እና መጠጦች"
  },
  "Account Type": {
    en: "Account Type",
    am: "የመለያ አይነት"
  },
  "Normal Directory": {
    en: "Normal Directory",
    am: "መደበኛ ማውጫ"
  },
  "Menu / Restaurant": {
    en: "Menu / Restaurant",
    am: "ሜኑ / ሬስቶራንት"
  },
  "Scan Menu Image (AI)": {
    en: "Scan Menu Image (AI)",
    am: "የሜኑ ምስል በ AI ይቃኙ"
  },
  "Add Item": {
    en: "Add Item",
    am: "አዲስ ዕቃ ያክሉ"
  },
  "Dish / Drink Name": {
    en: "Dish / Drink Name",
    am: "የምግብ/መጠጥ ስም"
  },
  "Category": {
    en: "Category",
    am: "ምድብ"
  },
  "Price (ETB)": {
    en: "Price (ETB)",
    am: "ዋጋ (በብር)"
  },
  "Description": {
    en: "Description",
    am: "መግለጫ"
  },
  "Available": {
    en: "Available",
    am: "አለ"
  },
  "Sold Out": {
    en: "Sold Out",
    am: "ተናቋል"
  },
  "Terms & Conditions": {
    en: "Terms & Conditions",
    am: "አጠቃቀም ደንቦች እና ግዴታዎች"
  },
  "Privacy Policy": {
    en: "Privacy Policy",
    am: "የግል መረጃ ጥበቃ ፖሊሲ"
  },
  "Built by Nebiyou Daniel": {
    en: "Built by Nebiyou Daniel",
    am: "በነቢዩ ዳንኤል የተሰራ"
  },
  "Developer & Creator Contact": {
    en: "Developer & Creator Contact",
    am: "የሶፍትዌር አዘጋጅ አድራሻ"
  },
  "Calculate Total Bill": {
    en: "Calculate Total Bill",
    am: "ጠቅላላ ሂሳብ አስላ"
  },
  "Proceed to Payment": {
    en: "Proceed to Payment",
    am: "ወደ ክፍያ ይለፉ"
  },
  "Customer Gateway": {
    en: "Customer Gateway",
    am: "የደንበኞች መግቢያ"
  },
  "Staff Portal": {
    en: "Staff Portal",
    am: "የሰራተኞች መግቢያ"
  },
  "Super Admin": {
    en: "Super Admin",
    am: "ልዩ አስተዳዳሪ"
  },
  "Sign Out": {
    en: "Sign Out",
    am: "ውጣ"
  },
  "Tired of display boards filled with 5 different bank accounts? Give customers a unified, modern checkout. Scan a single QR to view and copy your active CBE, Telebirr, or Dashen accounts instantly.": {
    en: "Tired of display boards filled with 5 different bank accounts? Give customers a unified, modern checkout. Scan a single QR to view and copy your active CBE, Telebirr, or Dashen accounts instantly.",
    am: "በየሱቁ የተለያዩ 5 የባንክ ሂሳቦችን በሰሌዳ ላይ መመልከት ሰልችቶታል? ለደንበኞችዎ የተደራጀና ዘመናዊ የክፍያ አማራጭ ያቅርቡ። ደንበኞች አንድ QR ኮድ ብቻ በመቃኘት የእርስዎን CBE፣ ቴሌብር ወይም ዳሸን ሂሳብ በቀላሉ መርጠው መክፈል ይችላሉ።"
  },
  "Get Started": {
    en: "Get Started",
    am: "ለመጀመር"
  },
  "Interactive Preview": {
    en: "Interactive Preview",
    am: "በይነተገናኝ ቅድመ-እይታ"
  },
  "Golden Spice Restaurant": {
    en: "Golden Spice Restaurant",
    am: "ጎልደን ስፓይስ ሬስቶራንት"
  },
  "Tap a bank to pay instantly via your mobile app": {
    en: "Tap a bank to pay instantly via your mobile app",
    am: "ለመክፈል የመረጡትን ባንክ ይጫኑ"
  },
  "Test Demo Directory": {
    en: "Test Demo Directory",
    am: "የሙከራ ማውጫን ይሞክሩ"
  },
  "Tap a bank to pay instantly via your mobile banking app.": {
    en: "Tap a bank to pay instantly via your mobile banking app.",
    am: "በሞባይል ባንክ መተግበሪያዎ በኩል ወዲያውኑ ለመክፈል ባንክን ይጫኑ።"
  },
  "Pay Now": {
    en: "Pay Now",
    am: "አሁን ይክፈሉ"
  },
  "No active bank options configured for this merchant yet.": {
    en: "No active bank options configured for this merchant yet.",
    am: "ለዚህ ነጋዴ እስካሁን ምንም የነቃ የባንክ አማራጭ አልተዋቀረም።"
  },
  "Fetching mobile banking directory...": {
    en: "Fetching mobile banking directory...",
    am: "የሞባይል ባንክ ማውጫን በማምጣት ላይ..."
  },
  "Directory Not Found": {
    en: "Directory Not Found",
    am: "ማውጫው አልተገኘም"
  },
  "The requested merchant ID does not exist or has been paused. Please contact support.": {
    en: "The requested merchant ID does not exist or has been paused. Please contact support.",
    am: "የጠየቁት የነጋዴ መለያ የለም ወይም ታግዷል። እባክዎ የደንበኛ አገልግሎትን ያግኙ።"
  },
  "Payment Details": {
    en: "Payment Details",
    am: "የክፍያ ዝርዝሮች"
  },
  "ACCOUNT NUMBER": {
    en: "ACCOUNT NUMBER",
    am: "የሂሳብ ቁጥር"
  },
  "Tap the number or button to copy": {
    en: "Tap the number or button to copy",
    am: "ቁጥሩን ወይም ቁልፉን በመጫን ይቅዱ"
  },
  "Copy Account Number": {
    en: "Copy Account Number",
    am: "የሂሳብ ቁጥር ቅዳ"
  },
  "Open Pay Link / App": {
    en: "Open Pay Link / App",
    am: "የክፍያ መተግበሪያ/ሊንክ ክፈት"
  },
  "Copied!": {
    en: "Copied!",
    am: "ተገልብጧል!"
  },
  "Copy blocked - number selected, use the copy menu": {
    en: "Copy blocked - number selected, use the copy menu",
    am: "ቅዳ ተከልክሏል - ቁጥሩ ተመርጧል፣ ከኮፒ ሜኑ ይቅዱ"
  },
  "Account number not loaded yet - try again": {
    en: "Account number not loaded yet - try again",
    am: "የመለያ ቁጥሩ ገና አልተጫነም - እንደገና ይሞክሩ"
  },
  "Close": {
    en: "Close",
    am: "ዝጋ"
  },
  "Securely access Merchant Dashboard": {
    en: "Securely access Merchant Dashboard",
    am: "ወደ ነጋዴ ዳሽቦርድ በደህንነት ይግቡ"
  },
  "Username": {
    en: "Username",
    am: "የተጠቃሚ ስም"
  },
  "Password": {
    en: "Password",
    am: "የይለፍ ቃል"
  },
  "Sign In to Portal": {
    en: "Sign In to Portal",
    am: "ወደ መግቢያ ፖርታል ይግቡ"
  },
  "Super Admin Portal": {
    en: "Super Admin Portal",
    am: "ልዩ አስተዳዳሪ ፖርታል"
  },
  "Securely access Super Admin Panel": {
    en: "Securely access Super Admin Panel",
    am: "ወደ ልዩ አስተዳዳሪ ፓነል በደህንነት ይግቡ"
  },
  "Admin Username": {
    en: "Admin Username",
    am: "የአስተዳዳሪ ተጠቃሚ ስም"
  },
  "Sign In to Admin Portal": {
    en: "Sign In to Admin Portal",
    am: "ወደ አስተዳዳሪ ፓነል ይግቡ"
  },
  "Permanent Billing": {
    en: "Permanent Billing",
    am: "ቋሚ ክፍያ"
  },
  "Payment Directory": {
    en: "Payment Directory",
    am: "የክፍያ ማውጫ"
  },
  "QR Code Gateway": {
    en: "QR Code Gateway",
    am: "የQR ኮድ መግቢያ"
  },
  "Account Settings": {
    en: "Account Settings",
    am: "የመለያ ቅንብሮች"
  },
  "Banking Options": {
    en: "Banking Options",
    am: "የባንክ አማራጮች"
  },
  "Add New Bank Option": {
    en: "Add New Bank Option",
    am: "አዲስ የባንክ አማራጭ ያክሉ"
  },
  "Active Banking Options": {
    en: "Active Banking Options",
    am: "የነቁ የባንክ አማራጮች"
  },
  "Platform": {
    en: "Platform",
    am: "ፕላትፎርም"
  },
  "Account Number": {
    en: "Account Number",
    am: "የሂሳብ ቁጥር"
  },
  "Deep Link / Payment Link": {
    en: "Deep Link / Payment Link",
    am: "የክፍያ ሊንክ"
  },
  "Status": {
    en: "Status",
    am: "ሁኔታ"
  },
  "Actions": {
    en: "Actions",
    am: "እርምጃዎች"
  },
  "Active": {
    en: "Active",
    am: "ንቁ"
  },
  "Inactive": {
    en: "Inactive",
    am: "ያልነቃ"
  },
  "Delete": {
    en: "Delete",
    am: "ሰርዝ"
  },
  "Merchant Directory Link": {
    en: "Merchant Directory Link",
    am: "የነጋዴ ማውጫ ሊንክ"
  },
  "Copy Link": {
    en: "Copy Link",
    am: "ሊንክ ቅዳ"
  },
  "Your Unified QR Code": {
    en: "Your Unified QR Code",
    am: "የእርስዎ የተዋሃደ QR ኮድ"
  },
  "Download QR Code": {
    en: "Download QR Code",
    am: "QR ኮድ ያውርዱ"
  },
  "Scan this QR code with any smartphone to instantly access your mobile banking directory in standard compliant browsers.": {
    en: "Scan this QR code with any smartphone to instantly access your mobile banking directory in standard compliant browsers.",
    am: "ደንበኞች ይህንን QR ኮድ በስማርትፎን በመቃኘት የእርስዎን የባንክ ሂሳቦች ዝርዝር በቀጥታ ማግኘት ይችላሉ።"
  },
  "Account Management": {
    en: "Account Management",
    am: "የመለያ አስተዳደር"
  },
  "Business Name": {
    en: "Business Name",
    am: "የንግድ ድርጅት ስም"
  },
  "Save Profile Changes": {
    en: "Save Profile Changes",
    am: "የመለያ ለውጦችን አስቀምጥ"
  },
  "Update Security Password": {
    en: "Update Security Password",
    am: "የደህንነት የይለፍ ቃል ያድሱ"
  },
  "Current Password": {
    en: "Current Password",
    am: "የአሁኑ የይለፍ ቃል"
  },
  "New Secure Password": {
    en: "New Secure Password",
    am: "አዲስ የደህንነት የይለፍ ቃል"
  },
  "Change Password": {
    en: "Change Password",
    am: "የይለፍ ቃል ቀይር"
  },
  "Add Banking Detail": {
    en: "Add Banking Detail",
    am: "የባንክ ዝርዝር ያክሉ"
  },
  "Select Mobile Banking Platform": {
    en: "Select Mobile Banking Platform",
    am: "የሞባይል ባንክ ፕላትፎርም ይምረጡ"
  },
  "Account Number / Phone Number": {
    en: "Account Number / Phone Number",
    am: "የሂሳብ ቁጥር / የስልክ ቁጥር"
  },
  "Deep Link / Payment URL (Optional)": {
    en: "Deep Link / Payment URL (Optional)",
    am: "የክፍያ ሊንክ (አማራጭ)"
  },
  "Add Option": {
    en: "Add Option",
    am: "አማራጭ ያክሉ"
  },
  "Super Admin Panel": {
    en: "Super Admin Panel",
    am: "ልዩ የአስተዳዳሪ ፓነል"
  },
  "Merchant Accounts": {
    en: "Merchant Accounts",
    am: "የነጋዴ መለያዎች"
  },
  "Platform Audit Logs": {
    en: "Platform Audit Logs",
    am: "የፕላትፎርም ኦዲት መዝገቦች"
  },
  "Admin Credentials": {
    en: "Admin Credentials",
    am: "የአስተዳዳሪ ምስክር ወረቀቶች"
  },
  "Merchant Directories": {
    en: "Merchant Directories",
    am: "የነጋዴ ማውጫዎች"
  },
  "Provision New Merchant Account": {
    en: "Provision New Merchant Account",
    am: "አዲስ የነጋዴ መለያ ፍጠር"
  },
  "Search merchants...": {
    en: "Search merchants...",
    am: "ነጋዴዎችን ፈልግ..."
  },
  "Company Name": {
    en: "Company Name",
    am: "የድርጅት ስም"
  },
  "Billing Type": {
    en: "Billing Type",
    am: "የክፍያ ዓይነት"
  },
  "Created": {
    en: "Created",
    am: "የተፈጠረበት"
  },
  "Provision Account": {
    en: "Provision Account",
    am: "መለያ ፍጠር"
  },
  "Update Admin Username": {
    en: "Update Admin Username",
    am: "የአስተዳዳሪ ተጠቃሚ ስም ያድሱ"
  },
  "Super Admin Username": {
    en: "Super Admin Username",
    am: "የልዩ አስተዳዳሪ ተጠቃሚ ስም"
  },
  "Protected by cryptographic password hashing & secure session management.": {
    en: "Protected by cryptographic password hashing & secure session management.",
    am: "በምስጠራ የይለፍ ቃል ሃሽ እና ደህንነቱ በተጠበቀ የክፍለ-ጊዜ አስተዳደር የተጠበቀ።"
  },
  "Built with React, Express, and Secure Node Cryptography.": {
    en: "Built with React, Express, and Secure Node Cryptography.",
    am: "በReact፣ Express እና በደህንነቱ በተጠበቀ Node Cryptography የተገነባ።"
  },
  "All rights reserved.": {
    en: "All rights reserved.",
    am: "መብቱ በህግ የተጠበቀ ነው።"
  },
  /* ---- Menu / Waitstaff / QR management translations ---- */
  "Directory": { en: "Directory", am: "ማውጫ" },
  "QR Code": { en: "QR Code", am: "QR ኮድ" },
  "Tables": { en: "Tables", am: "ጠረጴዛዎች" },
  "Waitstaff": { en: "Waitstaff", am: "አስተናጋጆች" },
  "Settings": { en: "Settings", am: "ቅንብሮች" },
  "Tables & Live Scans": { en: "Tables & Live Scans", am: "ጠረጴዛዎች እና የቀጥታ ቃኞች" },
  "Waitstaff & Scanned Bills": { en: "Waitstaff & Scanned Bills", am: "አስተናጋጆች እና የተቃኙ ሂሳቦች" },
  "Mobile Banking Profiles": { en: "Mobile Banking Profiles", am: "የሞባይል ባንክ መገለጫዎች" },
  "Manage active payment options customers see when they scan your QR": { en: "Manage active payment options customers see when they scan your QR", am: "ደንበኞች QR ኮድዎን ሲቃኙ የሚያዩዋቸውን ንቁ የክፍያ አማራጮች ያስተዳድሩ" },
  "Loading payment details...": { en: "Loading payment details...", am: "የክፍያ ዝርዝሮች በመጫን ላይ..." },
  "No payment options yet": { en: "No payment options yet", am: "እስካሁን የክፍያ አማራጮች የሉም" },
  "Min 5 characters": { en: "Min 5 characters", am: "ቢያንስ 5 ቁምፊዎች" },
  "GLOBAL PLATFORM CONTROLS": { en: "GLOBAL PLATFORM CONTROLS", am: "የአለም አቀፍ ፕላትፎርም መቆጣጠሪያ" },
  "Merchants": { en: "Merchants", am: "ነጋዴዎች" },
  "Scans": { en: "Scans", am: "ቃኞች" },
  "Credentials": { en: "Credentials", am: "ምስክርነቶች" },
  "Merchant Registry": { en: "Merchant Registry", am: "የነጋዴ መዝገብ" },
  "View active directory profiles and provision secure new merchant accounts": { en: "View active directory profiles and provision secure new merchant accounts", am: "ንቁ የማውጫ መገለጫዎችን ይመልከቱ እና ደህንነቱ የተጠበቀ አዲስ የነጋዴ መለያዎች ይፍጠሩ" },
  "Search by Business Name, Username, or ID...": { en: "Search by Business Name, Username, or ID...", am: "በንግድ ስም፣ በተጠቃሚ ስም ወይም በመለያ ይፈልጉ..." },
  "Fetching merchants...": { en: "Fetching merchants...", am: "ነጋዴዎችን በማምጣት ላይ..." },
  "Filter by merchant name, waiter, table, or reference #...": { en: "Filter by merchant name, waiter, table, or reference #...", am: "በነጋዴ ስም፣ በአስተናጋጅ፣ በጠረጴዛ ወይም በማመሳከሪያ ቁጥር ያጣሩ..." },
  "Loading global receipt scans...": { en: "Loading global receipt scans...", am: "የአለም አቀፍ የተቃኙ ሂሳቦች በመጫን ላይ..." },
  "No scanned bills logged yet across merchants.": { en: "No scanned bills logged yet across merchants.", am: "በነጋዴዎች መካከል እስካሁን ምንም የተቃኘ ሂሳብ አልተመዘገበም።" },
  "By Waiter: ": { en: "By Waiter: ", am: "በአስተናጋጅ፡ " },
  "Transferred Amount:": { en: "Transferred Amount:", am: "የተላለፈ መጠን፡" },
  "Bank / Wallet:": { en: "Bank / Wallet:", am: "ባንክ / ዋሌት፡" },
  "Platform Security Audit Logs": { en: "Platform Security Audit Logs", am: "የፕላትፎርም ደህንነት ኦዲት መዝገቦች" },
  "Live system monitor logging database changes, profile updates, and login attempts": { en: "Live system monitor logging database changes, profile updates, and login attempts", am: "የዳታቤዝ ለውጦችን፣ የመገለጫ ዝመናዎችን እና የመግቢያ ሙከራዎችን የሚመዘግብ የቀጥታ ስርዓት መቆጣጠሪያ" },
  "Search logs by keyword, user, or details...": { en: "Search logs by keyword, user, or details...", am: "በቁልፍ ቃል፣ በተጠቃሚ ወይም በዝርዝር ይፈልጉ..." },
  "All Operations": { en: "All Operations", am: "ሁሉም ስራዎች" },
  "Logins / Logouts": { en: "Logins / Logouts", am: "መግቢያ / መውጫ" },
  "Merchant Provisioning": { en: "Merchant Provisioning", am: "የነጋዴ መፍጠር" },
  "Password Updates": { en: "Password Updates", am: "የይለፍ ቃል ዝመናዎች" },
  "Mobile Banking Changes": { en: "Mobile Banking Changes", am: "የሞባይል ባንክ ለውጦች" },
  "Loading audit logs...": { en: "Loading audit logs...", am: "የኦዲት መዝገቦች በመጫን ላይ..." },
  "Timestamp": { en: "Timestamp", am: "ጊዜ" },
  "Enter your username": { en: "Enter your username", am: "የተጠቃሚ ስምዎን ያስገቡ" },
  "Enter admin username": { en: "Enter admin username", am: "የአስተዳዳሪ ተጠቃሚ ስም ያስገቡ" },
  "MERCHANT DASHBOARD": { en: "MERCHANT DASHBOARD", am: "የነጋዴ ዳሽቦርድ" },
  "Dishes": { en: "Dishes", am: "ምግቦች" },
  "Drinks": { en: "Drinks", am: "መጠጦች" },
  "Appetizers": { en: "Appetizers", am: "ቀዳሚ ምግቦች" },
  "Desserts": { en: "Desserts", am: "ጣፋጮች" },
  "Hot Beverages": { en: "Hot Beverages", am: "ሙቅ መጠጦች" },
  "Specialties": { en: "Specialties", am: "ልዩ ምግቦች" },
  "All": { en: "All", am: "ሁሉም" },
  "Vegan": { en: "Vegan", am: "ቬጋን" },
  "In Stock": { en: "In Stock", am: "በክምችት ውስጥ" },
  "Loading digital menu...": { en: "Loading digital menu...", am: "የዲጂታል ሜኑ በመጫን ላይ..." },
  "No items available in this category.": { en: "No items available in this category.", am: "በዚህ ምድብ ውስጥ ምንም ዕቃ የለም።" },
  "Search dish, drink, coffee...": { en: "Search dish, drink, coffee...", am: "ምግብ፣ መጠጥ፣ ቡና ይፈልጉ..." },
  "Loading digital menu items...": { en: "Loading digital menu items...", am: "የዲጂታል ሜኑ ዕቃዎች በመጫን ላይ..." },
  "No menu items found": { en: "No menu items found", am: "ምንም የሜኑ ዕቃዎች አልተገኙም" },
  "Scan Menu Photo": { en: "Scan Menu Photo", am: "የሜኑ ፎቶ ቃኝ" },
  "Add Dish Manually": { en: "Add Dish Manually", am: "ምግብ በእጅ ያክሉ" },
  "Price": { en: "Price", am: "ዋጋ" },
  "Dish / Drink Name *": { en: "Dish / Drink Name *", am: "የምግብ/መጠጥ ስም *" },
  "e.g. Special Kitfo, Cappuccino, Doro Wat": { en: "e.g. Special Kitfo, Cappuccino, Doro Wat", am: "ለምሳሌ፡ ስፔሻል ክትፎ፣ ካፑቺኖ፣ ዶሮ ወጥ" },
  "Price (ETB) *": { en: "Price (ETB) *", am: "ዋጋ (በብር) *" },
  "e.g. 250": { en: "e.g. 250", am: "ለምሳሌ፡ 250" },
  "Description (Optional)": { en: "Description (Optional)", am: "መግለጫ (አማራጭ)" },
  "Short summary of ingredients, spices, or preparation...": { en: "Short summary of ingredients, spices, or preparation...", am: "የንጥረ ነገሮች፣ ቅመሞች ወይም ዝግጅት አጭር ማጠቃለያ..." },
  "Search Food & Web": { en: "Search Food & Web", am: "ምግብ እና ድር ይፈልጉ" },
  "Filter local menu (e.g., Kitfo, Beyaynetu)...": { en: "Filter local menu (e.g., Kitfo, Beyaynetu)...", am: "የአካባቢ ሜኑን ያጣሩ (ለምሳሌ፡ ክትፎ፣ በያይነቱ)..." },
  "No matching dishes in local menu.": { en: "No matching dishes in local menu.", am: "በአካባቢ ሜኑ ውስጥ ተዛማጅ ምግቦች የሉም።" },
  "Picked": { en: "Picked", am: "ተመርጧል" },
  "Type dish or drink (e.g. Special Tibs, Doro Wat)...": { en: "Type dish or drink (e.g. Special Tibs, Doro Wat)...", am: "ምግብ ወይም መጠጥ ይተይቡ (ለምሳሌ፡ ስፔሻል ጥብስ፣ ዶሮ ወጥ)..." },
  "Search": { en: "Search", am: "ፈልግ" },
  "Quick Try:": { en: "Quick Try:", am: "ፈጣን ሙከራ፡" },
  "Searching web & culinary database in real-time...": { en: "Searching web & culinary database in real-time...", am: "ድር እና የምግብ ዳታቤዝን በቀጥታ በመፈለግ ላይ..." },
  "Matching exact dishes and ingredient-similar options...": { en: "Matching exact dishes and ingredient-similar options...", am: "ትክክለኛ ምግቦችን እና ተመሳሳይ ንጥረ-ነገሮችን በማዛመድ ላይ..." },
  "Search any food or beverage item": { en: "Search any food or beverage item", am: "ማንኛውንም የምግብ ወይም መጠጥ ዕቃ ይፈልጉ" },
  "Why Similar: ": { en: "Why Similar: ", am: "ለምን ተመሳሳይ፡ " },
  "Ingredients:": { en: "Ingredients:", am: "ንጥረ ነገሮች፡" },
  "Pick photo look for this item:": { en: "Pick photo look for this item:", am: "ለዚህ ዕቃ የሚመጥን ፎቶ ይምረጡ፡" },
  "Added": { en: "Added", am: "ተጨምሯል" },
  "Snap / Upload Another Photo": { en: "Snap / Upload Another Photo", am: "ሌላ ፎቶ ተኩስ / ሰቅል" },
  "Analyzing Photo with Gemini...": { en: "Analyzing Photo with Gemini...", am: "ፎቶውን ከGemini ጋር በመተንተን ላይ..." },
  "Analyze with Gemini AI": { en: "Analyze with Gemini AI", am: "በGemini AI ተንትን" },
  "Scan Menu Photo & Add Items": { en: "Scan Menu Photo & Add Items", am: "የሜኑ ፎቶ ቃኝ እና ዕቃዎች ያክሉ" },
  "Image Ready": { en: "Image Ready", am: "ምስል ዝግጁ" },
  "Focus": { en: "Focus", am: "ትኩረት" },
  "Auto": { en: "Auto", am: "ራስ-ሰር" },
  "Add": { en: "Add", am: "ያክሉ" },
  "Item": { en: "Item", am: "ዕቃ" },
  "Items Selected": { en: "Items Selected", am: "የተመረጡ ዕቃዎች" },
  "Loading": { en: "Loading", am: "በመጫን ላይ" },
  /* ---- Waitstaff manager & portal ---- */
  "Total Bills Scanned": { en: "Total Bills Scanned", am: "የተቃኙ ጠቅላላ ሂሳቦች" },
  "Verified Volume (ETB)": { en: "Verified Volume (ETB)", am: "የተረጋገጠ መጠን (ETB)" },
  "Suspicious / Flagged": { en: "Suspicious / Flagged", am: "አጠራጣሪ / የተጠቆሙ" },
  "Create Waiter Account": { en: "Create Waiter Account", am: "የአስተናጋጅ መለያ ይፍጠሩ" },
  "Loading waitstaff accounts...": { en: "Loading waitstaff accounts...", am: "የአስተናጋጅ መለያዎች በመጫን ላይ..." },
  "No Waiter Scanning Accounts Created Yet": { en: "No Waiter Scanning Accounts Created Yet", am: "እስካሁን የአስተናጋጅ ቃኝ መለያዎች አልተፈጠሩም" },
  "Role: Waiter Scanner": { en: "Role: Waiter Scanner", am: "ሚና፡ የአስተናጋጅ ቃኚ" },
  "Search waiter, bank, ref #, or table...": { en: "Search waiter, bank, ref #, or table...", am: "አስተናጋጅን፣ ባንክን፣ የማመሳከሪያ ቁጥር ወይም ጠረጴዛ ይፈልጉ..." },
  "Loading scanned bills...": { en: "Loading scanned bills...", am: "የተቃኙ ሂሳቦች በመጫን ላይ..." },
  "No Scanned Bills Found": { en: "No Scanned Bills Found", am: "ምንም የተቃኘ ሂሳብ አልተገኘም" },
  "VERIFIED LEGIT": { en: "VERIFIED LEGIT", am: "የተረጋገጠ ሕጋዊ" },
  "SUSPICIOUS": { en: "SUSPICIOUS", am: "አጠራጣሪ" },
  "Amount Paid": { en: "Amount Paid", am: "የተከፈለው መጠን" },
  "Platform:": { en: "Platform:", am: "ፕላትፎርም፡" },
  "Ref #:": { en: "Ref #:", am: "ማመሳከሪያ፡" },
  "Payer:": { en: "Payer:", am: "ከፋይ፡" },
  "Waiter:": { en: "Waiter:", am: "አስተናጋጅ፡" },
  "View Photo": { en: "View Photo", am: "ፎቶ ይመልከቱ" },
  "e.g. Abebe Bekele": { en: "e.g. Abebe Bekele", am: "ለምሳሌ፡ አበበ በቀለ" },
  "e.g. waiter9": { en: "e.g. waiter9", am: "ለምሳሌ፡ waiter9" },
  "e.g. 12345": { en: "e.g. 12345", am: "ለምሳሌ፡ 12345" },
  "e.g. Table 9 or Section A": { en: "e.g. Table 9 or Section A", am: "ለምሳሌ፡ ጠረጴዛ 9 ወይም ክፍል A" },
  "Status:": { en: "Status:", am: "ሁኔታ፡" },
  "Bank:": { en: "Bank:", am: "ባንክ፡" },
  "Amount:": { en: "Amount:", am: "መጠን፡" },
  "Notes:": { en: "Notes:", am: "ማስታወሻ፡" },
  "Delete Waiter Account?": { en: "Delete Waiter Account?", am: "የአስተናጋጅ መለያን ይሰርዙ?" },
  "Remove Staff Access": { en: "Remove Staff Access", am: "የሰራተኛ መዳረሻን ያስወግዱ" },
  "Delete Receipt Record?": { en: "Delete Receipt Record?", am: "የሂሳብ መዝገብ ይሰርዙ?" },
  "Audit History Removal": { en: "Audit History Removal", am: "የኦዲት ታሪክ መሰረዝ" },
  "Waitstaff Accounts & Paid Bill Verification": { en: "Waitstaff Accounts & Paid Bill Verification", am: "የአስተናጋጅ መለያዎች እና የክፍያ ሂሳብ ማረጋገጫ" },
  "Create waiter scanning accounts. Waiters scan customer payment receipts on their phone, and Gemini AI automatically verifies if the bill is legit!": { en: "Create waiter scanning accounts. Waiters scan customer payment receipts on their phone, and Gemini AI automatically verifies if the bill is legit!", am: "የአስተናጋጅ ቃኝ መለያዎች ይፍጠሩ። አስተናጋጆች የደንበኛውን የክፍያ ደረሰኝ በስልካቸው ይቃኛሉ፣ እና Gemini AI ሂሳቡ ሕጋዊ መሆኑን በራስ-ሰር ያረጋግጣል!" },
  "Staff": { en: "Staff", am: "ሰራተኞች" },
  "Bills": { en: "Bills", am: "ሂሳቦች" },
  "Scanned Bills": { en: "Scanned Bills", am: "የተቃኙ ሂሳቦች" },
  "Full Name": { en: "Full Name", am: "ሙሉ ስም" },
  "Assigned Table": { en: "Assigned Table", am: "የተመደበ ጠረጴዛ" },
  "Create Account": { en: "Create Account", am: "መለያ ፍጠር" },
  "Live Cam": { en: "Live Cam", am: "የቀጥታ ካሜራ" },
  "Upload": { en: "Upload", am: "ሰቅል" },
  "Multi-Table Manager": { en: "Multi-Table Manager", am: "የባለብዙ ጠረጴዛ አስተዳዳሪ" },
  "Tap table to active scan": { en: "Tap table to active scan", am: "ለማግበር ጠረጴዛን ይንኩ" },
  "Custom:": { en: "Custom:", am: "ብጁ፡" },
  "e.g. T-12": { en: "e.g. T-12", am: "ለምሳሌ፡ T-12" },
  "FULL SCREEN": { en: "FULL SCREEN", am: "ሙሉ ስክሪን" },
  "LIVE SCANNER ACTIVE": { en: "LIVE SCANNER ACTIVE", am: "የቀጥታ ቃኝ ንቁ" },
  "Auto Enhance": { en: "Auto Enhance", am: "ራስ-ማሻሻል" },
  "Camera Access Restricted": { en: "Camera Access Restricted", am: "የካሜራ መዳረሻ ተገድቧል" },
  "Upload Image Instead": { en: "Upload Image Instead", am: "በምትኩ ምስል ሰቅል" },
  "e.g. Table 9 Customer paid via Telebirr": { en: "e.g. Table 9 Customer paid via Telebirr", am: "ለምሳሌ፡ ጠረጴዛ 9 ደንበኛ በቴሌብር ከፍሏል" },
  "Gemini AI Checking Typography, Time & Reference ID...": { en: "Gemini AI Checking Typography, Time & Reference ID...", am: "Gemini AI የቃላት አፃፃፍ፣ ጊዜ እና የማመሳከሪያ መለያ እየፈተሸ ነው..." },
  "Scan Frame & Verify Legitimacy": { en: "Scan Frame & Verify Legitimacy", am: "ፍሬም ቃኝ እና ሕጋዊነት አረጋግጥ" },
  "Scanned images and fraud logs auto-save directly to merchant account": { en: "Scanned images and fraud logs auto-save directly to merchant account", am: "የተቃኙ ምስሎች እና የማጭበርበር መዝገቦች በቀጥታ ወደ ነጋዴ መለያ ይቀመጣሉ" },
  "AI Fraud Audit Report": { en: "AI Fraud Audit Report", am: "የ AI ማጭበርበር ኦዲት ሪፖርት" },
  "Ready for Live Scan": { en: "Ready for Live Scan", am: "ለቀጥታ ቃኝ ዝግጁ" },
  "LEGIT - VERIFIED": { en: "LEGIT - VERIFIED", am: "ሕጋዊ - የተረጋገጠ" },
  "SUSPICIOUS / CHECK": { en: "SUSPICIOUS / CHECK", am: "አጠራጣሪ / ፈትሽ" },
  "Extracted Payment": { en: "Extracted Payment", am: "የተወጣ ክፍያ" },
  "Reference ID:": { en: "Reference ID:", am: "የማመሳከሪያ መለያ፡" },
  "Sender:": { en: "Sender:", am: "ላኪ፡" },
  "Recipient Acc:": { en: "Recipient Acc:", am: "የተቀባይ ሂሳብ፡" },
  "AI Score:": { en: "AI Score:", am: "የ AI ውጤት፡" },
  "Merchant Account Match:": { en: "Merchant Account Match:", am: "የነጋዴ ሂሳብ ተዛማጅ፡" },
  "ACCOUNT MISMATCH": { en: "ACCOUNT MISMATCH", am: "የሂሳብ አለመመሳሰል" },
  "VERIFIED MATCH": { en: "VERIFIED MATCH", am: "የተረጋገጠ ተዛማጅ" },
  "Typography & Font Alignment:": { en: "Typography & Font Alignment:", am: "የቃላት እና የፊደል አሰላለፍ፡" },
  "Checked": { en: "Checked", am: "ተፈትሸዋል" },
  "Time Window Validity:": { en: "Time Window Validity:", am: "የጊዜ ክፍተት ትክክለኛነት፡" },
  "Duplicate Scan Check:": { en: "Duplicate Scan Check:", am: "የተደጋጋሚ ቃኝ ምርመራ፡" },
  "Gemini AI Audit Findings:": { en: "Gemini AI Audit Findings:", am: "የ Gemini AI የኦዲት ግኝቶች፡" },
  "All scans are permanently logged to the restaurant account": { en: "All scans are permanently logged to the restaurant account", am: "ሁሉም ቃኞች በቋሚነት በሬስቶራንት መለያ ይመዘገባሉ" },
  "Refresh": { en: "Refresh", am: "አድስ" },
  "No saved scanned bills yet.": { en: "No saved scanned bills yet.", am: "እስካሁን የተቀመጡ የተቃኙ ሂሳቦች የሉም።" },
  "High-Res Camera & Continuous Focus": { en: "High-Res Camera & Continuous Focus", am: "ከፍተኛ ጥራት ካሜራ እና ቀጣይ ትኩረት" },
  "Exit Fullscreen": { en: "Exit Fullscreen", am: "ከሙሉ ስክሪን ውጣ" },
  "ACTIVE TABLE:": { en: "ACTIVE TABLE:", am: "ንቁ ጠረጴዛ፡" },
  "Optional note: Customer paid via Telebirr / CBE Birr...": { en: "Optional note: Customer paid via Telebirr / CBE Birr...", am: "አማራጭ ማስታወሻ፡ ደንበኛ በቴሌብር / በCBE ብር ከፍሏል..." },
  "GEMINI AI DETECTING ALL RECEIPT DETAILS...": { en: "GEMINI AI DETECTING ALL RECEIPT DETAILS...", am: "Gemini AI ሁሉንም የሂሳብ ዝርዝሮች እያወቀ ነው..." },
  "SNAP & DETECT WITH AI": { en: "SNAP & DETECT WITH AI", am: "ተኩስ እና በAI አውቅ" },
  "Real-Time Waiter Scanner": { en: "Real-Time Waiter Scanner", am: "የቀጥታ የአስተናጋጅ ቃኝ" },
  "Assigned Table:": { en: "Assigned Table:", am: "የተመደበ ጠረጴዛ፡" },
  "Live Bill Verification": { en: "Live Bill Verification", am: "የቀጥታ የሂሳብ ማረጋገጫ" },
  /* ---- Table QR manager ---- */
  "Print Table Stand Card": { en: "Print Table Stand Card", am: "የጠረጴዛ ካርድ አትም" },
  "Table QR Code & Design Studio": { en: "Table QR Code & Design Studio", am: "የጠረጴዛ QR ኮድ እና ዲዛይን ስቱዲዮ" },
  "e.g. Table 9, Bar, Room 102": { en: "e.g. Table 9, Bar, Room 102", am: "ለምሳሌ፡ ጠረጴዛ 9፣ ባር፣ ክፍል 102" },
  "DESIGN STUDIO": { en: "DESIGN STUDIO", am: "የዲዛይን ስቱዲዮ" },
  "Theme & Emblem": { en: "Theme & Emblem", am: "ገጽታ እና አርማ" },
  "Theme & Color": { en: "Theme & Color", am: "ገጽታ እና ቀለም" },
  "Logo Emblem": { en: "Logo Emblem", am: "የሎጎ አርማ" },
  "Neon Emerald Luxe": { en: "Neon Emerald Luxe", am: "ኒዮን ኤመራልድ" },
  "Gold & Velvet Regal": { en: "Gold & Velvet Regal", am: "ወርቅ እና ቬልቬት" },
  "Cyber Dark Mode": { en: "Cyber Dark Mode", am: "ሳይበር ጨለማ ሁነታ" },
  "Printable Table Tent": { en: "Printable Table Tent", am: "የሚታተም የጠረጴዛ ቴንት" },
  "e.g. SCAN TO VIEW MENU & PAY VIA MOBILE BANKING": { en: "e.g. SCAN TO VIEW MENU & PAY VIA MOBILE BANKING", am: "ለምሳሌ፡ ለማየት እና ለመክፈል ቃኝ" },
  "Generating custom table code...": { en: "Generating custom table code...", am: "ብጁ የጠረጴዛ ኮድ በመፍጠር ላይ..." },
  "Print / Preview Stand": { en: "Print / Preview Stand", am: "አትም / ቅድመ-እይታ" },
  "Download Aesthetic QR": { en: "Download Aesthetic QR", am: "ውብ QR አውርድ" },
  "No recent table scan or copy events yet": { en: "No recent table scan or copy events yet", am: "እስካሁን የቅርብ የጠረጴዛ ቃኝ ወይም የቅጂ ክስተቶች የሉም" },
  "Attractive Table QR Codes & Live Scans": { en: "Attractive Table QR Codes & Live Scans", am: "ማራኪ የጠረጴዛ QR ኮዶች እና የቀጥታ ቃኞች" },
  "Customize attractive, unique table QR stands with custom themes, logo emblems, and printable table tent cards. Get real-time alerts when customers scan and copy accounts!": { en: "Customize attractive, unique table QR stands with custom themes, logo emblems, and printable table tent cards. Get real-time alerts when customers scan and copy accounts!", am: "ማራኪ፣ ልዩ የጠረጴዛ QR ቆሞችን በብጁ ገጽታዎች፣ በሎጎ አርማዎች እና በሚታተሙ የጠረጴዛ ካርዶች ያብጁ። ደንበኞች ሂሳቦችን ሲቃኙ እና ሲቀዱ የቀጥታ ማሳወቂያ ያግኙ!" },
  "Customer on": { en: "Customer on", am: "ደንበኛ በ" },
  "copied account number to make mobile banking payment.": { en: "copied account number to make mobile banking payment.", am: "የሞባይል ባንክ ክፍያ ለማድረግ የሂሳብ ቁጥሩን ቀድቷል።" },
  "Live Scan Events": { en: "Live Scan Events", am: "የቀጥታ ቃኝ ክስተቶች" },
  "Table": { en: "Table", am: "ጠረጴዛ" },
  "Copied": { en: "Copied", am: "ተቀድቷል" },
  /* ---- Form labels & toast messages ---- */
  "Waiter Full Name *": { en: "Waiter Full Name *", am: "የአስተናጋጅ ሙሉ ስም *" },
  "Username *": { en: "Username *", am: "የተጠቃሚ ስም *" },
  "Password *": { en: "Password *", am: "የይለፍ ቃል *" },
  "Assigned Table / Section": { en: "Assigned Table / Section", am: "የተመደበ ጠረጴዛ / ክፍል" },
  "Failed to fetch staff accounts": { en: "Failed to fetch staff accounts", am: "የሰራተኛ መለያዎችን ማምጣት አልተሳካም" },
  "Failed to fetch scanned bill receipts": { en: "Failed to fetch scanned bill receipts", am: "የተቃኙ ሂሳቦችን ማምጣት አልተሳካም" },
  "Name, username, and password are required": { en: "Name, username, and password are required", am: "ስም፣ የተጠቃሚ ስም እና የይለፍ ቃል ያስፈልጋሉ" },
  "Failed to delete waiter account": { en: "Failed to delete waiter account", am: "የአስተናጋጅ መለያን መሰረዝ አልተሳካም" },
  "Deleted scanned bill record": { en: "Deleted scanned bill record", am: "የተቃኘ ሂሳብ መዝገብ ተሰርዟል" },
  "Failed to delete receipt scan": { en: "Failed to delete receipt scan", am: "የሂሳብ ቃኝን መሰረዝ አልተሳካም" },
  "Could not generate QR code for this table": { en: "Could not generate QR code for this table", am: "ለዚህ ጠረጴዛ QR ኮድ ማመንጨት አልተቻለም" },
  "Activity history cleared": { en: "Activity history cleared", am: "የእንቅስቃሴ ታሪክ ተጸድዷል" },
  "Failed to clear history": { en: "Failed to clear history", am: "ታሪኩን ማጽዳት አልተሳካም" },
  "QR code not ready yet": { en: "QR code not ready yet", am: "QR ኮድ እስካሁን ዝግጁ አይደለም" },
  "Downloaded aesthetic & luxurious QR card!": { en: "Downloaded aesthetic & luxurious QR card!", am: "ውብ እና የቅንጦት QR ካርድ ተወርዷል!" },
  "File size too large. Maximum 8MB allowed.": { en: "File size too large. Maximum 8MB allowed.", am: "የፋይል መጠን በጣም ትልቅ ነው። ከፍተኛው 8MB ይፈቀዳል።" },
  "SUSPICIOUS RECEIPT DETECTED: Review the AI fraud report": { en: "SUSPICIOUS RECEIPT DETECTED: Review the AI fraud report", am: "አጠራጣሪ ሂሳብ ተገኝቷል፡ የ AI ማጭበርበር ሪፖርቱን ይመልከቱ" },
  "Unable to capture video frame. Make sure camera is active.": { en: "Unable to capture video frame. Make sure camera is active.", am: "የቪዲዮ ፍሬም መያዝ አልተቻለም። ካሜራ ንቁ መሆኑን ያረጋግጡ።" },
  "Please upload or take a photo of the receipt first.": { en: "Please upload or take a photo of the receipt first.", am: "እባክዎ በመጀመሪያ የሂሳቡን ፎቶ ይስቀሉ ወይም ያንሱ።" },
  "Please enter a food name to search for images": { en: "Please enter a food name to search for images", am: "እባክዎ ምስል ለማግኘት የምግብ ስም ያስገቡ" },
  "Dish or Drink name is required": { en: "Dish or Drink name is required", am: "የምግብ ወይም መጠጥ ስም ያስፈልጋል" },
  "Please enter a valid price": { en: "Please enter a valid price", am: "እባክዎ ትክክለኛ ዋጋ ያስገቡ" },
  "Menu item updated successfully": { en: "Menu item updated successfully", am: "የሜኑ ዕቃ በተሳካ ሁኔታ ተዘምኗል" },
  "New dish/drink added to menu": { en: "New dish/drink added to menu", am: "አዲስ ምግብ/መጠጥ ወደ ሜኑ ተጨምሯል" },
  "Failed to adjust price": { en: "Failed to adjust price", am: "ዋጋውን ማስተካከል አልተሳካም" },
  "Please select or capture a menu photo first": { en: "Please select or capture a menu photo first", am: "እባክዎ በመጀመሪያ የሜኑ ፎቶ ይምረጡ ወይም ይነሱ" },
  "No menu items recognized. Please try another image.": { en: "No menu items recognized. Please try another image.", am: "ምንም የሜኑ ዕቃዎች አልታወቁም። እባክዎ ሌላ ምስል ይሞክሩ።" },
  "Please enter a food or drink item name to search": { en: "Please enter a food or drink item name to search", am: "ለመፈለግ እባክዎ የምግብ ወይም መጠጥ ዕቃ ስም ያስገቡ" },
  "Please select at least one dish or drink to save": { en: "Please select at least one dish or drink to save", am: "ለማስቀመጥ እባክዎ ቢያንስ አንድ ምግብ ወይም መጠጥ ይምረጡ" },
  "Failed to save menu items": { en: "Failed to save menu items", am: "የሜኑ ዕቃዎችን ማስቀመጥ አልተሳካም" },
  "Error deleting item": { en: "Error deleting item", am: "ዕቃን በመሰረዝ ላይ ስህተት" },
  /* ---- Final sweep chunk 4 ---- */
  "Active Waiter Scanning Accounts": { en: "Active Waiter Scanning Accounts", am: "ንቁ የአስተናጋጅ ቃኝ መለያዎች" },
  "Create accounts for your waiters (e.g. Table 9 waiter). Waiters use these login credentials to sign into the Staff Portal and scan customer payment bills.": { en: "Create accounts for your waiters (e.g. Table 9 waiter). Waiters use these login credentials to sign into the Staff Portal and scan customer payment bills.", am: "ለአስተናጋጆችዎ መለያዎች ይፍጠሩ (ለምሳሌ፡ የጠረጴዛ 9 አስተናጋጅ)። አስተናጋጆች ወደ ሰራተኛ ፖርታል ለመግባት እና የደንበኛ የክፍያ ሂሳቦችን ለመቃኘት እነዚህን የመግቢያ ማረጋገጫዎች ይጠቀማሉ።" },
  "Waitstaff Accounts": { en: "Waitstaff Accounts", am: "የአስተናጋጅ መለያዎች" },
  "Creating...": { en: "Creating...", am: "በመፍጠር ላይ..." },
  "Cancel": { en: "Cancel", am: "ይቅር" },
  "All Tables": { en: "All Tables", am: "ሁሉም ጠረጴዛዎች" },
  "Created:": { en: "Created:", am: "የተፈጠረ፡" },
  "Delete waiter account": { en: "Delete waiter account", am: "የአስተናጋጅ መለያ ሰርዝ" },
  "Delete receipt record": { en: "Delete receipt record", am: "የሂሳብ መዝገብ ሰርዝ" },
  "Switch Camera": { en: "Switch Camera", am: "ካሜራ ቀይር" },
  "Reset camera settings": { en: "Reset camera settings", am: "የካሜራ ቅንብሮችን ዳግም አስጀምር" },
  "ETB": { en: "ETB", am: "ETB" },
  "Decrease Price -10 ETB": { en: "Decrease Price -10 ETB", am: "ዋጋ ቀንስ -10 ETB" },
  "Increase Price +10 ETB": { en: "Increase Price +10 ETB", am: "ዋጋ ጨምር +10 ETB" },
  "Edit Item": { en: "Edit Item", am: "ዕቃ አስተካክል" },
  "Delete Item": { en: "Delete Item", am: "ዕቃ ሰርዝ" },
  "Add items manually or scan a physical menu photo using Gemini AI to automatically import dish items and food photos.": { en: "Add items manually or scan a physical menu photo using Gemini AI to automatically import dish items and food photos.", am: "ዕቃዎችን በእጅ ያክሉ ወይም የምግብ ዕቃዎችን እና ፎቶዎችን በራስ-ሰር ለማስገባት የገሃዱን የሜኑ ፎቶ በGemini AI ይቃኙ።" },
  "Pick": { en: "Pick", am: "ምረጥ" },
  "Camera Scan & Upload": { en: "Camera Scan & Upload", am: "የካሜራ ቃኝ እና ስቀል" },
  "Use live camera stream or upload menu photo to extract items automatically.": { en: "Use live camera stream or upload menu photo to extract items automatically.", am: "ዕቃዎችን በራስ-ሰር ለማውጣት የቀጥታ ካሜራ ወይም የሜኑ ፎቶ ስቀል ይጠቀሙ።" },
  "Remove from draft list": { en: "Remove from draft list", am: "ከረቂቅ ዝርዝር አስወግድ" },
  "Saving...": { en: "Saving...", am: "በማስቀመጥ ላይ..." },
  "Save Changes": { en: "Save Changes", am: "ለውጦችን አስቀምጥ" },
  "Add Dish": { en: "Add Dish", am: "ምግብ አክል" },
  "Selected Draft Items": { en: "Selected Draft Items", am: "የተመረጡ ረቂቅ ዕቃዎች" },
  "Save": { en: "Save", am: "አስቀምጥ" },
  "Items to Live Menu": { en: "Items to Live Menu", am: "ዕቃዎች ወደ ቀጥታ ሜኑ" },
  "Gemini AI successfully extracted": { en: "Gemini AI successfully extracted", am: "Gemini AI በተሳካ ሁኔታ አውጥቷል" },
  "menu items!": { en: "menu items!", am: "የሜኑ ዕቃዎች!" },
  "Successfully saved": { en: "Successfully saved", am: "በተሳካ ሁኔታ ተቀምጠዋል" },
  "items to menu_items database!": { en: "items to menu_items database!", am: "ዕቃዎች ወደ menu_items ዳታቤዝ!" },
  "Saved": { en: "Saved", am: "ተቀምጠዋል" },
  "items to live menu!": { en: "items to live menu!", am: "ዕቃዎች ወደ ቀጥታ ሜኑ!" },
  "Total Bill:": { en: "Total Bill:", am: "ጠቅላላ ሒሳብ፡" },
  "Select your payment bank below to complete transfer!": { en: "Select your payment bank below to complete transfer!", am: "ክፍያውን ለማጠናቀቅ ከታች ያለውን የክፍያ ባንክ ይምረጡ!" },
  "Instagram": { en: "Instagram", am: "Instagram" },
  "Telegram": { en: "Telegram", am: "ቴሌግራም" },
  "Phone": { en: "Phone", am: "ስልክ" },
  "Merchant Dashboard": { en: "Merchant Dashboard", am: "የነጋዴ ዳሽቦርድ" },
  "Menu": { en: "Menu", am: "ሜኑ" },
  "Menu Acc": { en: "Menu Acc", am: "የሜኑ መለያ" },
  "Scan Card / QR (Camera)": { en: "Scan Card / QR (Camera)", am: "ካርድ / QR ቃኝ (ካሜራ)" },
  "Add Bank Option": { en: "Add Bank Option", am: "የባንክ አማራጭ አክል" },
  "Logs": { en: "Logs", am: "ምዝግብ ማስታወሻዎች" },
  "Merchant Restaurant": { en: "Merchant Restaurant", am: "የነጋዴ ሬስቶራንት" },
  "Why AI Is Not 100% Certain": { en: "Why AI Is Not 100% Certain", am: "AI 100% እንዳልሆነ የሚያሳይ ምክንያት" },
  "DUPLICATE FOUND": { en: "DUPLICATE FOUND", am: "ቅጂ ተገኝቷል" },
  "Passed": { en: "Passed", am: "አልፏል" },
  "Legitimacy": { en: "Legitimacy", am: "ህጋዊነት" },
  "AI Scan Failed": { en: "AI Scan Failed", am: "AI ቃኝ አልተሳካም" },
  "Dismiss": { en: "Dismiss", am: "ዝጋ" },
  "No registered payment accounts": { en: "No registered payment accounts", am: "የተመዘገበ የክፍያ ሂሳብ የለም" },
  "This merchant has no active bank accounts registered, so the AI cannot confirm the recipient matches. Add bank options in the merchant Payment Directory tab, then rescan.": { en: "This merchant has no active bank accounts registered, so the AI cannot confirm the recipient matches. Add bank options in the merchant Payment Directory tab, then rescan.", am: "ይህ ነጋዴ ምንም ንቁ የባንክ ሂሳብ አልመዘገበም፣ ስለዚህ AI የተቀባዩን ሂሳብ ማረጋገጥ አይችልም። እባክዎ በነጋዴው 'የክፍያ ማውጫ' ትር ውስጥ የባንክ አማራጮችን ያክሉ እና እንደገና ይቃኙ።" },
  "Check your internet connection and API key, then try scanning the receipt again.": { en: "Check your internet connection and API key, then try scanning the receipt again.", am: "የበይነመረብ ግንኙነትዎን እና የ API ቁልፍዎን ያረጋግጡ፣ ከዚያም ደረሰኙን እንደገና ይቃኙ።" },
  "Lower score means higher chance the receipt was edited, reused, or paid to a wrong account": { en: "Lower score means higher chance the receipt was edited, reused, or paid to a wrong account", am: "ዝቅተኛ ውጤት ማለት ደረሰኙ ተቀይሮ፣ እንደገና ጥቅም ላይ የዋለ፣ ወይም ለተሳሳተ ሂሳብ የተከፈለ የመሆን እድሉ ከፍተኛ ነው" },
  "Provision Merchant": { en: "Provision Merchant", am: "ነጋዴ ይመዝገቡ" },
  "Protected by cryptographic password hashing & secure session management": { en: "Protected by cryptographic password hashing & secure session management", am: "በክሪፕቶግራፊክ የይለፍ ቃል ሃሽ እና ደህንነቱ በተጠበቀ የክፍለ-ጊዜ አስተዳደር የተጠበቀ" },
  /* ---- Waiter Portal scanner strings ---- */
  "Upload Photo": { en: "Upload Photo", am: "ፎቶ ስቀል" },
  "Retry Camera": { en: "Retry Camera", am: "ካሜራ እንደገና ሞክር" },
  "Remove & Choose Another": { en: "Remove & Choose Another", am: "አስወግድ እና ሌላ ምረጥ" },
  "Upload Payment Receipt Screenshot": { en: "Upload Payment Receipt Screenshot", am: "የክፍያ ደረሰኝ ስክሪንሾት ስቀል" },
  "Supports Telebirr, CBE Birr, CBE Mobile, Dashen, Awash, Abyssinia, Coop Bank": { en: "Supports Telebirr, CBE Birr, CBE Mobile, Dashen, Awash, Abyssinia, Coop Bank", am: "ቴሌብር፣ CBE ብር፣ CBE ሞባይል፣ ዳሸን፣ አዋሽ፣ አቢሲኒያ፣ ኮፕ ባንክ ይደግፋል" },
  "Waiter Note (Optional):": { en: "Waiter Note (Optional):", am: "የአስተናጋጅ ማስታወሻ (አማራጭ)፡" },
  "Auto-Saved": { en: "Auto-Saved", am: "በራስ-ሰር ተቀምጧል" },
  "View AI Report": { en: "View AI Report", am: "የ AI ሪፖርት ይመልከቱ" },
  "Merchant Saved Scans History": { en: "Merchant Saved Scans History", am: "የነጋዴ የተቀመጡ ቃኞች ታሪክ" },
  "Unknown Amount": { en: "Unknown Amount", am: "የማይታወቅ መጠን" },
  "Ref:": { en: "Ref:", am: "ማጣቀሻ፡" },
  "Staff:": { en: "Staff:", am: "ሰራተኛ፡" },
  "FULL SCREEN AI SCANNER": { en: "FULL SCREEN AI SCANNER", am: "ሙሉ ስክሪን AI ቃኝ" },
  "ALIGN BILL RECEIPT HERE": { en: "ALIGN BILL RECEIPT HERE", am: "የክፍያ ደረሰኙን እዚህ አሰልፍ" },
  "Camera requires a secure (HTTPS) connection. Open this site via HTTPS or use the file upload mode below instead.": { en: "Camera requires a secure (HTTPS) connection. Open this site via HTTPS or use the file upload mode below instead.", am: "ካሜራ ደህንነቱ የተጠበቀ (HTTPS) ግንኙነት ይፈልጋል። ይህንን ጣቢያ በHTTPS ይክፈቱ ወይም በምትኩ ከታች ያለውን የፋይል ስቀል ሁነታ ይጠቀሙ።" },
  "Camera permission was denied. Please allow camera access in your browser settings, or use the file upload mode below instead.": { en: "Camera permission was denied. Please allow camera access in your browser settings, or use the file upload mode below instead.", am: "የካሜራ ፍቃድ ተከልክሏል። እባክዎ በአሳሽዎ ቅንብሮች ውስጥ የካሜራ መዳረሻ ይፍቀዱ፣ ወይም በምትኩ ከታች ያለውን የፋይል ስቀል ሁነታ ይጠቀሙ።" },
  "No camera was found on this device. You can upload a receipt photo instead.": { en: "No camera was found on this device. You can upload a receipt photo instead.", am: "በዚህ መሳሪያ ላይ ምንም ካሜራ አልተገኘም። በምትኩ የደረሰኝ ፎቶ መስቀል ይችላሉ።" },
  "Camera access denied or restricted by permissions. You can upload a receipt photo instead.": { en: "Camera access denied or restricted by permissions. You can upload a receipt photo instead.", am: "የካሜራ መዳረሻ ተከልክሏል ወይም በፍቃዶች ተገድቧል። በምትኩ የደረሰኝ ፎቶ መስቀል ይችላሉ።" },
  "VERIFIED: Legitimate payment of __AMOUNT__ ETB auto-saved to merchant records!": { en: "VERIFIED: Legitimate payment of __AMOUNT__ ETB auto-saved to merchant records!", am: "የተረጋገጠ፡ የ __AMOUNT__ ETB ህጋዊ ክፍያ በራስ-ሰር ወደ ነጋዴ መዝገቦች ተቀምጧል!" },
  "Error analyzing bill receipt": { en: "Error analyzing bill receipt", am: "የሂሳብ ደረሰኙን በመተንተን ላይ ስህተት" },
  "Align the customer's phone receipt inside the camera view and click \"Scan Frame\". Gemini AI will check typography, timestamps, reference structure, and duplicate uses.": { en: "Align the customer's phone receipt inside the camera view and click \"Scan Frame\". Gemini AI will check typography, timestamps, reference structure, and duplicate uses.", am: "የደንበኛውን ስልክ ደረሰኝ በካሜራ እይታ ውስጥ አሰልፉ እና \"Scan Frame\" ን ይጫኑ። Gemini AI የፊደል አጻጻፍን፣ የጊዜ ማህተሞችን፣ የማጣቀሻ አወቃቀርን እና የቅጂ አጠቃቀሞችን ይፈትሻል።" }
};

const getBankIcon = (platform: string) => {
  const p = platform.toLowerCase();
  if (p.includes("ethiopia") || p.includes("cbe")) {
    return (
      <div className="w-12 h-12 rounded-full bg-[#1b2a4a] border-2 border-[#f3a81c]/50 flex items-center justify-center relative shadow-md overflow-hidden shrink-0">
        <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center border border-yellow-500">
          <span className="text-yellow-400 font-extrabold text-[18px] leading-none">★</span>
        </div>
      </div>
    );
  }
  if (p.includes("telebirr")) {
    return (
      <div className="w-12 h-12 rounded-full bg-[#00a896] border border-white/20 flex items-center justify-center shadow-md shrink-0">
        <span className="text-white font-display font-extrabold text-sm tracking-tighter">tb</span>
      </div>
    );
  }
  if (p.includes("dashen") || p.includes("amole")) {
    return (
      <div className="w-12 h-12 rounded-full bg-[#ffcc00] border border-blue-900/35 flex items-center justify-center shadow-md shrink-0">
        <span className="text-blue-900 font-display font-bold text-sm">DA</span>
      </div>
    );
  }
  if (p.includes("awash")) {
    return (
      <div className="w-12 h-12 rounded-full bg-blue-950 border border-amber-500/30 flex items-center justify-center shadow-md shrink-0">
        <span className="text-amber-400 font-display font-bold text-sm">AW</span>
      </div>
    );
  }
  if (p.includes("abyssinia") || p.includes("boa")) {
    return (
      <div className="w-12 h-12 rounded-full bg-yellow-500 border border-gray-800 flex items-center justify-center shadow-md shrink-0">
        <span className="text-black font-display font-bold text-sm">BoA</span>
      </div>
    );
  }
  if (p.includes("oromia")) {
    return (
      <div className="w-12 h-12 rounded-full bg-red-600 border border-white/20 flex items-center justify-center shadow-md shrink-0">
        <span className="text-white font-display font-bold text-xs">COOP</span>
      </div>
    );
  }
  if (p.includes("hibret") || p.includes("hila")) {
    return (
      <div className="w-12 h-12 rounded-full bg-[#1c4076] border border-white/20 flex items-center justify-center shadow-md shrink-0">
        <span className="text-white font-display font-bold text-sm">HB</span>
      </div>
    );
  }
  return (
    <div className="w-12 h-12 rounded-full bg-neon-emerald/10 border border-neon-emerald/30 flex items-center justify-center shadow-md shrink-0">
      <Building className="w-6 h-6 text-neon-emerald" />
    </div>
  );
};

export default function App() {
  // Router State: 'home' | 'staff-login' | 'admin-login' | 'merchant-dashboard' | 'admin-dashboard' | 'customer-gateway' | 'waiter-portal'
  const [view, setView] = useState<{
    type: "home" | "staff-login" | "admin-login" | "merchant-dashboard" | "admin-dashboard" | "customer-gateway" | "waiter-portal";
    merchantId?: string;
  }>({ type: "home" });

  // Auth State
  const [auth, setAuth] = useState<AuthState>(() => {
    const savedUser = localStorage.getItem("mbd_user");
    return {
      token: null,
      user: savedUser ? JSON.parse(savedUser) : null,
    };
  });

  // Global notifications
  const [notification, setNotification] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);

  // Home Screen States
  const [homeMerchantSearch, setHomeMerchantSearch] = useState("");
  const [homeMerchants, setHomeMerchants] = useState<Merchant[]>([]);

  // Auth Forms States
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  // Merchant Dashboard States
  const [merchantTab, setMerchantTab] = useState<"directory" | "menu" | "qrcode" | "tables" | "waitstaff" | "settings">("directory");
  const [paymentProfiles, setPaymentProfiles] = useState<PaymentProfile[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loadingMenuItems, setLoadingMenuItems] = useState(false);
  const [isAddBankModalOpen, setIsAddBankModalOpen] = useState(false);
  const [isBankCameraOpen, setIsBankCameraOpen] = useState(false);
  const [isScanningBankCard, setIsScanningBankCard] = useState(false);
  const [newBankPlatform, setNewBankPlatform] = useState("Commercial Bank of Ethiopia (CBE)");
  const [newBankAccount, setNewBankAccount] = useState("");
  const [newBankDeepLink, setNewBankDeepLink] = useState("");
  const [newBankIsActive, setNewBankIsActive] = useState(true);
  const [newBankLogoBase64, setNewBankLogoBase64] = useState("");
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string | null>(null);
  const [loadingQr, setLoadingQr] = useState(false);

  // Merchant Settings Password States
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Merchant brand logo (Settings tab + Add Banking modal)
  const [merchantLogoBase64, setMerchantLogoBase64] = useState("");
  const [savingMerchantLogo, setSavingMerchantLogo] = useState(false);

  // Super Admin Dashboard States
  const [adminTab, setAdminTab] = useState<"merchants" | "logs" | "receipts" | "credentials">("merchants");
  const [merchantsList, setMerchantsList] = useState<Merchant[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);
  const [searchMerchantQuery, setSearchMerchantQuery] = useState("");
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);
  const [newMerchantCompany, setNewMerchantCompany] = useState("");
  const [newMerchantUsername, setNewMerchantUsername] = useState("");
  const [newMerchantPassword, setNewMerchantPassword] = useState("");
  const [newMerchantBilling, setNewMerchantBilling] = useState<"permanent" | "temporary">("permanent");
  const [newMerchantAccountType, setNewMerchantAccountType] = useState<"normal" | "menu">("normal");
  const [newMerchantRequiresAuth, setNewMerchantRequiresAuth] = useState(true);
  const [newMerchantStaffModel, setNewMerchantStaffModel] = useState<"single" | "multi_waiters">("multi_waiters");
  const [newMerchantServiceStatus, setNewMerchantServiceStatus] = useState<"active" | "paused">("active");
  const [newMerchantLogoBase64, setNewMerchantLogoBase64] = useState<string>("");
  const [newMerchantAppInstall, setNewMerchantAppInstall] = useState(true);

  // Edit Merchant Modal State
  const [editingMerchant, setEditingMerchant] = useState<Merchant | null>(null);
  const [editCompany, setEditCompany] = useState("");
  const [editUsername, setEditUsername] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [editBilling, setEditBilling] = useState<"permanent" | "temporary">("permanent");
  const [editAccountType, setEditAccountType] = useState<"normal" | "menu">("normal");
  const [editRequiresAuth, setEditRequiresAuth] = useState(true);
  const [editStaffModel, setEditStaffModel] = useState<"single" | "multi_waiters">("multi_waiters");
  const [editServiceStatus, setEditServiceStatus] = useState<"active" | "paused">("active");
  const [editLogoBase64, setEditLogoBase64] = useState<string>("");
  const [editAppInstall, setEditAppInstall] = useState(true);

  // Delete Confirmation Modal States
  const [deletingMerchantConfirm, setDeletingMerchantConfirm] = useState<{ id: string; companyName: string } | null>(null);
  const [deletingProfileConfirm, setDeletingProfileConfirm] = useState<{ id: string; platform: string } | null>(null);

  // Admin Scanned Bills Audit State
  const [adminReceiptScans, setAdminReceiptScans] = useState<ReceiptScan[]>([]);
  const [loadingAdminScans, setLoadingAdminScans] = useState(false);
  const [searchAdminScanQuery, setSearchAdminScanQuery] = useState("");
  const [adminScanFilter, setAdminScanFilter] = useState<"all" | "verified" | "suspicious">("all");
  const [selectedAdminScan, setSelectedAdminScan] = useState<ReceiptScan | null>(null);

  // First Time Sign-In Terms & Privacy Agreement Modal State
  const [termsAcceptedModalOpen, setTermsAcceptedModalOpen] = useState(false);
  const [termsCheck1, setTermsCheck1] = useState(false);
  const [termsCheck2, setTermsCheck2] = useState(false);

  // Legal & Creator Modals State
  const [aboutModalOpen, setAboutModalOpen] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);
  const [privacyModalOpen, setPrivacyModalOpen] = useState(false);
  const [developerModalOpen, setDeveloperModalOpen] = useState(false);
  
  // Admin Security Audit Logs States
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logsSearch, setLogsSearch] = useState("");
  const [logsFilter, setLogsFilter] = useState<string>("All Operations");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Admin Change Password States
  const [adminCurrentPassword, setAdminCurrentPassword] = useState("");
  const [adminNewPassword, setAdminNewPassword] = useState("");

  // Profile settings states (new features)
  const [merchantBusinessName, setMerchantBusinessName] = useState("");
  const [merchantUsername, setMerchantUsername] = useState("");
  const [adminUsername, setAdminUsername] = useState("admin");

  useEffect(() => {
    if (auth.user) {
      if (auth.user.role === "merchant") {
        setMerchantBusinessName(auth.user.companyName || "");
        setMerchantUsername(auth.user.username || "");
      } else if (auth.user.role === "admin") {
        setAdminUsername(auth.user.username || "admin");
      }

      // Check if user accepted terms on first login
      const agreed = localStorage.getItem(`mbd_terms_accepted_${auth.user.id}`);
      if (!agreed) {
        setTermsAcceptedModalOpen(true);
      }
    }
  }, [auth.user]);

  // Language switcher and helper states
  const [lang, setLang] = useState<"en" | "am">(() => {
    return (localStorage.getItem("mbd_lang") as "en" | "am") || "en";
  });

  const t = (key: string): string => {
    const item = TRANSLATIONS[key];
    if (!item) return key;
    return item[lang] || key;
  };



  // Payment Details Modal States
  const [paymentDetailModalOpen, setPaymentDetailModalOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<PaymentProfile | null>(null);
  const [unmaskedAccount, setUnmaskedAccount] = useState("");
  const [isFetchingUnmaskedAccount, setIsFetchingUnmaskedAccount] = useState(false);

  // Customer Gateway View States
  const [customerMerchant, setCustomerMerchant] = useState<{ id: string; companyName: string; billingType: string; accountType?: "normal" | "menu"; logoUrl?: string | null; profiles: PaymentProfile[] } | null>(null);
  const [customerLoading, setCustomerLoading] = useState(false);
  const [customerTab, setCustomerTab] = useState<"banking" | "menu">("banking");
  const [customerMenuItems, setCustomerMenuItems] = useState<MenuItem[]>([]);
  const [loadingCustomerMenu, setLoadingCustomerMenu] = useState(false);

  // Show Toast helper
  const showToast = (message: string, type: "success" | "error" | "info" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((prev) => (prev?.message === message ? null : prev));
    }, 4500);
  };

  // Diagnostic: detect if the page was fully reloaded mid-scan
  useEffect(() => {
    try {
      const marker = localStorage.getItem("mbd_scan_marker");
      if (marker) {
        const elapsedMs = Date.now() - Number(marker);
        const navType = (performance.getEntriesByType("navigation")[0] as any)?.type || "unknown";
        console.warn("[DIAG] Page reloaded " + Math.round(elapsedMs / 1000) + "s after scan started. navigationType=" + navType + " url=" + window.location.href);
        if (elapsedMs < 5 * 60 * 1000) {
          showToast("Diagnostic: page reloaded during a scan (navType=" + navType + ")", "info");
        }
        localStorage.removeItem("mbd_scan_marker");
      }
    } catch (e) {
      console.warn("[DIAG] marker check failed", e);
    }
  }, []);

  // Synchronize path on mount & popstate
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      const searchParams = new URLSearchParams(window.location.search);
      const searchMerchantId = searchParams.get("m") || searchParams.get("merchant") || searchParams.get("u");

      const match = path.match(/^\/u\/([^/]+)/);
      const merchantId = match ? match[1] : searchMerchantId;

      if (merchantId) {
        setView({ type: "customer-gateway", merchantId });
        loadCustomerGateway(merchantId);
      } else if (path === "/staff" || path === "/staff-portal" || path === "/staff/login") {
        if (auth.user?.role === "waiter") {
          setView({ type: "waiter-portal" });
        } else if (auth.user?.role === "merchant") {
          setView({ type: "merchant-dashboard" });
          loadMerchantProfiles(auth.token);
        } else {
          setView({ type: "staff-login" });
        }
      } else if (path === "/admin" || path === "/super-admin" || path === "/admin/login") {
        setView({ type: "admin-login" });
      } else {
        if (view.type !== "merchant-dashboard" && view.type !== "admin-dashboard") {
          setView({ type: "home" });
          fetchDemoMerchants();
        }
      }
    };

    handleUrlRoute();
    window.addEventListener("popstate", handleUrlRoute);
    return () => window.removeEventListener("popstate", handleUrlRoute);
  }, []);

  // Fetch demo merchants for landing list
  const fetchDemoMerchants = async () => {
    try {
      const res = await fetch("/api/admin/merchants", {
        headers: auth.token ? { Authorization: `Bearer ${auth.token}` } : {},
      });
      if (res.ok && res.headers.get("content-type")?.includes("json")) {
        const data = await res.json();
        setHomeMerchants(data);
      } else {
        // Mock fallback if offline or guest (we seed from backend anyway)
        setHomeMerchants([
          { id: "m-demo", companyName: "Golden Spice Restaurant", username: "demomerchant", billingType: "permanent", createdAt: "" },
          { id: "m-e1566efe1b4a", companyName: "you", username: "you", billingType: "permanent", createdAt: "" }
        ]);
      }
    } catch (e) {
      setHomeMerchants([
        { id: "m-demo", companyName: "Golden Spice Restaurant", username: "demomerchant", billingType: "permanent", createdAt: "" },
        { id: "m-e1566efe1b4a", companyName: "you", username: "you", billingType: "permanent", createdAt: "" }
      ]);
    }
  };

  // Safe client-side routing & URL synchronization
  const navigate = (type: typeof view.type, merchantId?: string) => {
    setView({ type, merchantId });
    setLoginUsername("");
    setLoginPassword("");
    
    if (type === "customer-gateway" && merchantId) {
      window.history.pushState({}, "", `/u/${merchantId}`);
      loadCustomerGateway(merchantId);
    } else if (type === "staff-login") {
      window.history.pushState({}, "", `/staff`);
    } else if (type === "admin-login") {
      window.history.pushState({}, "", `/admin`);
    } else if (type === "home") {
      window.history.pushState({}, "", `/`);
      fetchDemoMerchants();
    } else {
      window.history.pushState({}, "", `/`);
    }
  };

  // Core Login
  const handleLogin = async (e: React.FormEvent, portalType: "staff" | "admin") => {
    e.preventDefault();
    if (!loginUsername || !loginPassword) {
      showToast("Username and password are required", "error");
      return;
    }

    setLoginLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: loginUsername,
          password: loginPassword,
          portalType,
        }),
      });

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON login response:", response.status, text.slice(0, 300));
        throw new Error(`Server connection error (${response.status}). Please try again.`);
      }

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      // Save Auth State — token lives in an HTTP-only cookie (XSS-safe); only display data in localStorage
      localStorage.setItem("mbd_user", JSON.stringify(data.user));
      setAuth({ token: data.token, user: data.user });

      showToast(`Welcome back, ${data.user.username}!`, "success");

      // Redirect based on role & set URL
      if (data.user.role === "admin") {
        setView({ type: "admin-dashboard" });
        loadAdminMerchants(data.token);
        window.history.pushState({}, "", "/admin");
      } else if (data.user.role === "waiter") {
        setView({ type: "waiter-portal" });
        window.history.pushState({}, "", "/staff");
      } else {
        setView({ type: "merchant-dashboard" });
        loadMerchantProfiles(data.token);
        window.history.pushState({}, "", "/staff");
      }
    } catch (err: any) {
      showToast(err.message || "Invalid credentials", "error");
    } finally {
      setLoginLoading(false);
    }
  };

  // Core Logout
  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
    } catch (e) {
      // silent
    }
    localStorage.removeItem("mbd_user");
    setAuth({ token: null, user: null });
    showToast("Signed out securely", "info");
    navigate("home");
  };

  // --- MERCHANT WORKFLOWS ---

  const loadMerchantProfiles = async (token = auth.token) => {
    if (!token) return;
    setLoadingProfiles(true);
    try {
      const res = await fetch("/api/merchant/profiles", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setPaymentProfiles(data);
      } else {
        showToast(data.error || "Failed to load profiles", "error");
      }
    } catch (e) {
      showToast("Network error loading profiles", "error");
    } finally {
      setLoadingProfiles(false);
    }
  };

  const loadMerchantMenuItems = async (token = auth.token) => {
    if (!token) return;
    setLoadingMenuItems(true);
    try {
      const res = await fetch("/api/merchant/menu", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMenuItems(data);
      } else {
        showToast(data.error || "Failed to load menu items", "error");
      }
    } catch (e) {
      showToast("Network error loading digital menu", "error");
    } finally {
      setLoadingMenuItems(false);
    }
  };

  const handleAddMenuItem = async (itemData: { name: string; category: string; price: number; description?: string; imageUrl?: string; isAvailable: boolean }) => {
    const res = await fetch("/api/merchant/menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(itemData),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to create menu item");
    }
    loadMerchantMenuItems();
  };

  const handleUpdateMenuItem = async (id: string, updates: Partial<MenuItem>) => {
    const res = await fetch(`/api/merchant/menu/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify(updates),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Failed to update menu item");
    }
    loadMerchantMenuItems();
  };

  const handleDeleteMenuItem = async (id: string) => {
    const res = await fetch(`/api/merchant/menu/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${auth.token}` },
    });
    const data = await res.json();
    if (res.ok) {
      showToast("Menu item deleted", "info");
      loadMerchantMenuItems();
    } else {
      showToast(data.error || "Failed to delete item", "error");
    }
  };

  const handleAiScanParse = async (imageBase64: string, mimeType: string) => {
    const res = await fetch("/api/merchant/menu/ai-parse", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ imageBase64, mimeType }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "AI menu scanning failed");
    }
    return data.items || [];
  };

  const handleItemLookup = async (query: string) => {
    const res = await fetch("/api/merchant/menu/item-lookup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${auth.token}`,
      },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Web item lookup failed");
    }
    return data;
  };

  // Add banking option
  const handleAddBankingOption = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBankAccount) {
      showToast("Account Number is required", "error");
      return;
    }

    try {
      const res = await fetch("/api/merchant/profiles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          platform: newBankPlatform,
          accountNumber: newBankAccount,
          deepLink: newBankDeepLink,
          isActive: newBankIsActive,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        if (newBankLogoBase64) {
          await saveMerchantBrandLogo(newBankLogoBase64);
        }
        showToast("Payment option added successfully", "success");
        setIsAddBankModalOpen(false);
        setNewBankAccount("");
        setNewBankDeepLink("");
        setNewBankIsActive(true);
        setNewBankLogoBase64("");
        loadMerchantProfiles();
      } else {
        showToast(data.error || "Failed to add payment option", "error");
      }
    } catch (e) {
      showToast("Network error adding payment profile", "error");
    }
  };

  // AI Bank Card / QR scan handler
  const handleBankAiScan = async (imageBase64: string, mimeType: string) => {
    setIsScanningBankCard(true);
    try {
      const res = await fetch("/api/merchant/bank/ai-parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ imageBase64, mimeType }),
      });
      const data = await res.json();
      if (res.ok && data) {
        if (data.platform) setNewBankPlatform(data.platform);
        if (data.accountNumber) setNewBankAccount(data.accountNumber);
        showToast("Bank details extracted from photo!", "success");
        setIsBankCameraOpen(false);
        setIsAddBankModalOpen(true);
      } else {
        showToast(data.error || "Could not read bank details from photo", "error");
      }
    } catch (e) {
      showToast("Error processing bank scan photo", "error");
    } finally {
      setIsScanningBankCard(false);
    }
  };

  // Toggle active status
  const handleToggleProfileActive = async (profile: PaymentProfile) => {
    try {
      const res = await fetch(`/api/merchant/profiles/${profile.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          isActive: !profile.isActive,
        }),
      });
      if (res.ok) {
        showToast(`Profile status updated`, "success");
        loadMerchantProfiles();
      } else {
        showToast("Failed to update status", "error");
      }
    } catch (e) {
      showToast("Network error", "error");
    }
  };

  // Delete payment profile
  const handleDeleteProfile = async (profileId: string) => {
    try {
      const res = await fetch(`/api/merchant/profiles/${profileId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        showToast("Payment option deleted successfully", "info");
        setDeletingProfileConfirm(null);
        loadMerchantProfiles();
      } else {
        showToast("Failed to delete option", "error");
      }
    } catch (e) {
      showToast("Network error deleting option", "error");
    }
  };

  // Load QR code Data URL from backend
  const loadQrCode = async () => {
    if (!auth.user?.id) return;
    setLoadingQr(true);
    try {
      // Dynamic routing URL
      const publicUrl = `${window.location.origin}/u/${auth.user.id}`;
      const res = await fetch(`/api/public/qrcode?text=${encodeURIComponent(publicUrl)}`);
      const data = await res.json();
      if (res.ok) {
        setQrCodeDataUrl(data.dataUrl);
      } else {
        showToast("Failed to generate QR Code from backend", "error");
      }
    } catch (e) {
      showToast("Network error loading QR code", "error");
    } finally {
      setLoadingQr(false);
    }
  };

  // Change password for merchant
  const handleMerchantPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      showToast("All password fields are required", "error");
      return;
    }
    if (newPassword.length < 5) {
      showToast("New password must be at least 5 characters long", "error");
      return;
    }

    try {
      const res = await fetch("/api/merchant/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Password updated successfully. Cryptographic log logged.", "success");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        showToast(data.error || "Failed to update password", "error");
      }
    } catch (e) {
      showToast("Network error changing password", "error");
    }
  };

  // Save merchant profile changes (Business Name and Username)
  const handleSaveProfileChanges = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!merchantBusinessName.trim() || !merchantUsername.trim()) {
      showToast("Business name and username are required", "error");
      return;
    }
    if (!auth.user) {
      showToast("No authenticated user available", "error");
      return;
    }

    try {
      const res = await fetch("/api/merchant/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          companyName: merchantBusinessName,
          username: merchantUsername,
          logoBase64: merchantLogoBase64 || undefined,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Profile changes saved successfully", "success");
        // Update user state so the sidebar and headers update
        const updatedUser = { ...auth.user, companyName: merchantBusinessName, username: merchantUsername, logoBase64: merchantLogoBase64 || undefined };
        localStorage.setItem("mbd_user", JSON.stringify(updatedUser));
        setAuth({ ...auth, user: updatedUser });
      } else {
        showToast(data.error || "Failed to update profile", "error");
      }
    } catch (e) {
      showToast("Network error updating profile", "error");
    }
  };

  // Save just the brand logo (used by the Add Banking Detail modal and Brand card)
  const saveMerchantBrandLogo = async (logoBase64: string) => {
    if (!auth.user) return;
    try {
      const res = await fetch("/api/merchant/update-profile", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          companyName: auth.user.companyName || auth.user.username || "Merchant",
          username: auth.user.username,
          logoBase64: logoBase64 || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        const updatedUser = { ...auth.user, logoBase64: logoBase64 || undefined };
        localStorage.setItem("mbd_user", JSON.stringify(updatedUser));
        setAuth({ ...auth, user: updatedUser });
        if (logoBase64) showToast("Business logo saved — favicon & brand logo updated", "success");
      } else {
        showToast(data.error || "Failed to save business logo", "error");
      }
    } catch (e) {
      showToast("Network error saving business logo", "error");
    }
  };

  // Load merchant profile (for brand logo on the Settings tab)
  useEffect(() => {
    if (view.type === "merchant-dashboard" && auth.user) {
      fetch("/api/merchant/profile", {
        headers: { Authorization: `Bearer ${auth.token}` },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data && data.logoBase64) setMerchantLogoBase64(data.logoBase64);
        })
        .catch(() => {});
    }
  }, [view.type]);

  // Handle brand logo upload for the Add Banking Detail modal
  const handleBankLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, SVG)", "error");
      e.target.value = "";
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast("Logo image must be under 4MB", "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setNewBankLogoBase64(String(reader.result || ""));
    reader.onerror = () => showToast("Failed to read the logo image", "error");
    reader.readAsDataURL(file);
  };

  // Handle brand logo upload for the Settings tab
  const handleSettingsLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, SVG)", "error");
      e.target.value = "";
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast("Logo image must be under 4MB", "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setMerchantLogoBase64(String(reader.result || ""));
    reader.onerror = () => showToast("Failed to read the logo image", "error");
    reader.readAsDataURL(file);
  };

  // Update admin username
  const handleUpdateAdminUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminUsername.trim() || adminUsername.trim().length < 3) {
      showToast("Admin username must be at least 3 characters", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/update-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          username: adminUsername,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast("Admin username updated successfully", "success");
        const updatedUser = { ...auth.user, username: adminUsername };
        localStorage.setItem("mbd_user", JSON.stringify(updatedUser));
        setAuth({ ...auth, user: updatedUser });
      } else {
        showToast(data.error || "Failed to update admin username", "error");
      }
    } catch (e) {
      showToast("Network error updating admin username", "error");
    }
  };


  // --- SUPER ADMIN WORKFLOWS ---

  const loadAdminMerchants = async (token = auth.token) => {
    if (!token) return;
    setLoadingMerchants(true);
    try {
      const res = await fetch("/api/admin/merchants", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setMerchantsList(data);
      } else {
        showToast(data.error || "Failed to fetch merchants", "error");
      }
    } catch (e) {
      showToast("Network error fetching merchants", "error");
    } finally {
      setLoadingMerchants(false);
    }
  };

  const loadAdminLogs = async () => {
    setLoadingLogs(true);
    try {
      const res = await fetch("/api/admin/audit-logs", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAuditLogs(data);
      } else {
        showToast(data.error || "Failed to load logs", "error");
      }
    } catch (e) {
      showToast("Network error loading logs", "error");
    } finally {
      setLoadingLogs(false);
    }
  };

  const loadAdminReceiptScans = async () => {
    setLoadingAdminScans(true);
    try {
      const res = await fetch("/api/admin/receipt-scans", {
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAdminReceiptScans(data);
      } else {
        showToast(data.error || "Failed to load global receipt scans", "error");
      }
    } catch (e) {
      showToast("Network error loading global receipt scans", "error");
    } finally {
      setLoadingAdminScans(false);
    }
  };

  // Provision merchant account
  const handleProvisionMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMerchantCompany || !newMerchantUsername || !newMerchantPassword) {
      showToast("All fields are required", "error");
      return;
    }
    if (newMerchantPassword.length < 5) {
      showToast("Password must be at least 5 characters long", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/merchants", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          companyName: newMerchantCompany,
          username: newMerchantUsername,
          password: newMerchantPassword,
          billingType: newMerchantBilling,
          accountType: newMerchantAccountType,
          requiresPaymentAuthenticator: newMerchantRequiresAuth,
          staffAccountModel: newMerchantStaffModel,
          serviceStatus: newMerchantServiceStatus
          ,
          logoBase64: newMerchantLogoBase64 || undefined,
          appInstallEnabled: newMerchantAppInstall
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Merchant account provisioned for "${newMerchantCompany}"!`, "success");
        setIsProvisionModalOpen(false);
        setNewMerchantCompany("");
        setNewMerchantUsername("");
        setNewMerchantPassword("");
        setNewMerchantBilling("permanent");
        setNewMerchantAccountType("normal");
        setNewMerchantRequiresAuth(true);
        setNewMerchantStaffModel("multi_waiters");
        setNewMerchantServiceStatus("active");
        setNewMerchantLogoBase64("");
        setNewMerchantAppInstall(true);
        loadAdminMerchants();
      } else {
        showToast(data.error || "Failed to provision merchant", "error");
      }
    } catch (e) {
      showToast("Network error provisioning merchant", "error");
    }
  };

  // Toggle Merchant Service Status (Pause / Resume Service)
  const handleToggleService = async (merchantId: string, currentCompany: string) => {
    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}/toggle-service`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${auth.token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || `Service status updated for ${currentCompany}`, "info");
        loadAdminMerchants();
      } else {
        showToast(data.error || "Failed to toggle service status", "error");
      }
    } catch (e) {
      showToast("Network error toggling service status", "error");
    }
  };

  // Toggle Merchant App Download Permission (allows merchant to download the Android app)
  const handleToggleAppInstall = async (m: Merchant) => {
    try {
      const res = await fetch(`/api/admin/merchants/${m.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          appInstallEnabled: m.appInstallEnabled === false,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast(`App install ${m.appInstallEnabled === false ? "allowed" : "denied"} for "${m.companyName}"`, "success");
        loadAdminMerchants();
      } else {
        showToast(data.error || "Failed to toggle app install permission", "error");
      }
    } catch (e) {
      showToast("Network error toggling app install permission", "error");
    }
  };

  // Open Edit Merchant Configuration Modal
  const handleOpenEditMerchant = (m: Merchant) => {
    setEditingMerchant(m);
    setEditCompany(m.companyName || "");
    setEditUsername(m.username || "");
    setEditPassword("");
    setEditBilling(m.billingType === "temporary" ? "temporary" : "permanent");
    setEditAccountType(m.accountType === "menu" ? "menu" : "normal");
    setEditRequiresAuth(m.requiresPaymentAuthenticator !== false);
    setEditStaffModel(m.staffAccountModel || (m.accountType === "menu" ? "multi_waiters" : "single"));
    setEditServiceStatus(m.serviceStatus || "active");
    setEditLogoBase64(m.logoBase64 || "");
    setEditAppInstall(m.appInstallEnabled !== false);
  };

  // Handle brand logo upload (base64 data URL) for merchant
  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, SVG)", "error");
      e.target.value = "";
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast("Logo image must be under 4MB", "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setEditLogoBase64(String(reader.result || ""));
    reader.onerror = () => showToast("Failed to read the logo image", "error");
    reader.readAsDataURL(file);
  };

  // Handle brand logo upload for new/provisioned merchant
  const handleNewLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showToast("Please select a valid image file (PNG, JPG, SVG)", "error");
      e.target.value = "";
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      showToast("Logo image must be under 4MB", "error");
      e.target.value = "";
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setNewMerchantLogoBase64(String(reader.result || ""));
    reader.onerror = () => showToast("Failed to read the logo image", "error");
    reader.readAsDataURL(file);
  };

  // Save Edit Merchant Configuration
  const handleSaveEditedMerchant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMerchant) return;

    try {
      const res = await fetch(`/api/admin/merchants/${editingMerchant.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          companyName: editCompany,
          username: editUsername,
          password: editPassword || undefined,
          billingType: editBilling,
          accountType: editAccountType,
          requiresPaymentAuthenticator: editRequiresAuth,
          staffAccountModel: editStaffModel,
          serviceStatus: editServiceStatus,
          logoBase64: editLogoBase64 || undefined,
          appInstallEnabled: editAppInstall
        }),
      });

      const data = await res.json();
      if (res.ok) {
        showToast(`Merchant configuration updated for "${editCompany}"`, "success");
        setEditingMerchant(null);
        loadAdminMerchants();
      } else {
        showToast(data.error || "Failed to update merchant configuration", "error");
      }
    } catch (e) {
      showToast("Network error updating merchant configuration", "error");
    }
  };

  // Delete merchant account
  const handleDeleteMerchant = async (merchantId: string, companyName: string) => {
    try {
      const res = await fetch(`/api/admin/merchants/${merchantId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${auth.token}` },
      });
      if (res.ok) {
        showToast(`Merchant "${companyName}" and all linked profiles deleted.`, "info");
        setDeletingMerchantConfirm(null);
        if (editingMerchant?.id === merchantId) setEditingMerchant(null);
        loadAdminMerchants();
      } else {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || "Failed to delete merchant account", "error");
      }
    } catch (e) {
      showToast("Network error deleting merchant", "error");
    }
  };

  // Admin Change Password
  const handleAdminPasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminCurrentPassword || !adminNewPassword) {
      showToast("All password fields are required", "error");
      return;
    }
    if (adminNewPassword.length < 5) {
      showToast("New password must be at least 5 characters long", "error");
      return;
    }

    try {
      const res = await fetch("/api/admin/update-credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.token}`,
        },
        body: JSON.stringify({
          currentPassword: adminCurrentPassword,
          newPassword: adminNewPassword,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        showToast("Admin credentials updated securely.", "success");
        setAdminCurrentPassword("");
        setAdminNewPassword("");
      } else {
        showToast(data.error || "Failed to update admin password", "error");
      }
    } catch (e) {
      showToast("Network error changing credentials", "error");
    }
  };


  // --- CUSTOMER GATEWAY WORKFLOW ---

  const loadCustomerMenu = async (id: string) => {
    setLoadingCustomerMenu(true);
    try {
      const res = await fetch(`/api/public/merchant/${id}/menu`);
      if (res.ok) {
        const data = await res.json();
        setCustomerMenuItems(data.items || []);
      }
    } catch (e) {
      console.error("Failed to load customer menu", e);
    } finally {
      setLoadingCustomerMenu(false);
    }
  };

  // Dynamic per-merchant favicon & document title on the customer gateway
  useEffect(() => {
    // Robust favicon update — recreate link element so browsers reload it reliably
    const setFavicon = (url: string | null) => {
      // remove any existing icon links
      const existing = Array.from(document.querySelectorAll('link[rel*="icon"]')) as HTMLLinkElement[];
      existing.forEach((n) => n.parentNode?.removeChild(n));

      const link = document.createElement("link");
      link.rel = "icon";
      if (!url) {
        link.href = "/favicon.svg";
        link.type = "image/svg+xml";
      } else {
        link.href = url;
        link.type = url.startsWith("data:image/svg") ? "image/svg+xml" : "image/png";
      }
      document.head.appendChild(link);
    };

    // Update favicon for customer gateway or when a merchant user is logged in
    const isMerchantContext = view.type === "customer-gateway" || auth.user?.role === "merchant";
    if (isMerchantContext && customerMerchant?.logoUrl) {
      document.title = `${customerMerchant.companyName} | Mobile Banking Directory`;
      setFavicon(customerMerchant.logoUrl);
    } else {
      document.title = "Remix Mobile Banking Directory | Zero-Trust Verification";
      setFavicon(null);
    }
  }, [view.type, customerMerchant]);

  // Ensure merchant users also get their brand loaded so favicon updates in merchant dashboard
  useEffect(() => {
    if (auth.user?.role === "merchant" && auth.user.id) {
      (async () => {
        try {
          const res = await fetch(`/api/public/merchant/${auth.user.id}`);
          const data = await res.json();
          if (res.ok) setCustomerMerchant(data);
        } catch (e) {
          // ignore
        }
      })();
    }
  }, [auth.user]);

  const loadCustomerGateway = async (id: string) => {
    setCustomerLoading(true);
    setCustomerMerchant(null);
    try {
      const res = await fetch(`/api/public/merchant/${id}`);
      const data = await res.json();
      if (res.ok) {
        setCustomerMerchant(data);
        loadCustomerMenu(id);
        if (data.accountType === "menu") {
          setCustomerTab("menu");
        } else {
          setCustomerTab("banking");
        }
      } else {
        showToast(data.error || "Merchant directory not found", "error");
      }
    } catch (e) {
      showToast("Network error loading customer gateway", "error");
    } finally {
      setCustomerLoading(false);
    }
  };

  // Handle Pay Now copy & app launching action
  const handlePayNow = async (profile: PaymentProfile) => {
    if (!view.merchantId && !customerMerchant?.id && view.type !== "home") return;
    const mId = view.merchantId || customerMerchant?.id || "m-demo";
    setSelectedProfile(profile);
    setPaymentDetailModalOpen(true);
    setUnmaskedAccount("");
    setIsFetchingUnmaskedAccount(true);

    // Extract table parameter if present in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tableNum = urlParams.get("table") || urlParams.get("tableNumber") || "Main";

    try {
      // Securely fetch unmasked account number and record Table Copy Event
      const res = await fetch(`/api/public/merchant/${mId}/profile/${profile.id}/copy?table=${encodeURIComponent(tableNum)}`);
      const data = await res.json();
      if (res.ok && data.accountNumber) {
        setUnmaskedAccount(data.accountNumber);
      } else {
        // Fallback for demo / local testing
        setUnmaskedAccount(profile.maskedAccountNumber || "1000349581948");
      }
    } catch (e) {
      setUnmaskedAccount(profile.maskedAccountNumber || "1000349581948");
    } finally {
      setIsFetchingUnmaskedAccount(false);
    }
  };

  // Load appropriate lists when tabs change
  useEffect(() => {
    if (view.type === "merchant-dashboard") {
      if (merchantTab === "directory") {
        loadMerchantProfiles();
      } else if (merchantTab === "qrcode") {
        loadQrCode();
      }
    } else if (view.type === "admin-dashboard") {
      if (adminTab === "merchants") {
        loadAdminMerchants();
      } else if (adminTab === "logs") {
        loadAdminLogs();
      }
    }
  }, [merchantTab, adminTab, view.type]);

  // Filters for Audit Logs
  const filteredAuditLogs = auditLogs.filter((log) => {
    // Dropdown match
    if (logsFilter !== "All Operations") {
      if (logsFilter === "Logins / Logouts" && !log.action.includes("login") && !log.action.includes("logout")) return false;
      if (logsFilter === "Merchant Provisioning" && !log.action.includes("merchant")) return false;
      if (logsFilter === "Password Updates" && !log.action.includes("password")) return false;
      if (logsFilter === "Mobile Banking Changes" && !log.action.includes("profile")) return false;
    }

    // Text query match
    if (logsSearch.trim()) {
      const q = logsSearch.toLowerCase();
      return (
        log.details.toLowerCase().includes(q) ||
        log.userId.toLowerCase().includes(q) ||
        log.userDisplay.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q)
      );
    }
    return true;
  });

    return (
    <div className="min-h-screen flex flex-col justify-between bg-[#0D0E11] text-gray-100 font-sans relative overflow-x-hidden selection:bg-champagne/30 selection:text-parchment sm:pb-36">
      {/* Background ambient warm glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-champagne/[0.06] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-neon-emerald/[0.06] rounded-full blur-[150px] pointer-events-none" />

      {/* Global Notifications Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 max-w-md w-full px-4"
          >
            <div className="bg-luxury-card border border-emerald-500/30 neon-glow rounded-xl p-4 flex items-start gap-3 backdrop-blur-md">
              <AlertCircle className="w-5 h-5 text-neon-emerald shrink-0 mt-0.5" />
              <div className="flex-1 text-sm text-gray-200">
                {notification.message}
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-gray-400 hover:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      {view.type === "home" && (
        <header className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex justify-between items-center gap-3 z-40 border-b border-gray-800/40">
          <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer min-w-0" onClick={() => navigate("home")}>
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-neon-emerald rounded-lg flex items-center justify-center font-display font-bold text-luxury-bg text-lg sm:text-xl shrink-0">
              M
            </div>
            <span className="font-display font-bold tracking-tight text-base sm:text-lg text-white truncate">
              {t("Mobile Banking Directory")}
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setAboutModalOpen(true)}
              className="px-3 py-1.5 sm:px-3.5 rounded-full text-xs font-semibold tracking-wide text-neon-emerald hover:text-white bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t("About")}</span>
            </button>
            <LanguageMenu lang={lang} onSelect={(l) => { setLang(l); localStorage.setItem("mbd_lang", l); }} />
            <button
              onClick={() => setTermsModalOpen(true)}
              className="hidden sm:flex px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-800 border border-gray-700/60 transition cursor-pointer"
            >
              {t("Terms & Conditions")}
            </button>
            <button
              onClick={() => setPrivacyModalOpen(true)}
              className="hidden sm:flex px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-800 border border-gray-700/60 transition cursor-pointer"
            >
              {t("Privacy Policy")}
            </button>
          </div>
        </header>
      )}

      {/* Main Container (center area) */}
      <main className="flex-1 flex flex-col justify-center items-center px-4 py-12 z-10 mb-6">
        <AnimatePresence mode="wait">

          {/* 1. LANDING PAGE VIEW */}
          {view.type === "home" && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-md w-full mx-auto flex flex-col items-center justify-center px-3"
            >
              {/* Interactive Directory Card */}
              <div className="w-full bg-luxury-card border border-champagne/15 rounded-3xl p-6 relative shadow-2xl overflow-hidden">
                <div className="absolute top-0 left-0 w-24 h-24 bg-champagne/[0.05] rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-4 right-4 flex items-center gap-1.5 text-[10px] uppercase font-mono tracking-wider text-champagne/70">
                  {t("Interactive Preview")}
                  <span className="w-2 h-2 rounded-full bg-neon-emerald pulse-dot animate-pulse" />
                </div>

                <div className="flex flex-col items-center mt-3 mb-3 text-center">
                  <div className="w-12 h-12 bg-champagne/10 border border-champagne/35 rounded-2xl flex items-center justify-center mb-2">
                    <Building className="w-7 h-7 text-champagne" />
                  </div>
                  <h3 className="font-display font-bold text-xl text-white">{t("Golden Spice Restaurant")}</h3>
                  <p className="text-xs gold-subtext mt-1 italic">{t("Tap a bank to pay instantly via your mobile app")}</p>
                </div>

                <div className="space-y-2">
                  <div className="p-4 bg-luxury-bg border border-gray-800/80 hover:border-champagne/50 rounded-2xl flex items-center justify-between transition warm-lift group cursor-pointer" onClick={() => navigate("customer-gateway", "m-demo")}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center font-display font-bold text-neon-emerald text-xs">
                        C
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-semibold text-gray-200">Commercial Bank of Ethiopia</h4>
                        <span className="font-mono text-[10px] text-gray-500">1000••••8194</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-champagne transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-luxury-bg border border-gray-800/80 hover:border-champagne/50 rounded-2xl flex items-center justify-between transition warm-lift group cursor-pointer" onClick={() => navigate("customer-gateway", "m-demo")}>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-emerald-950/40 border border-emerald-500/20 flex items-center justify-center font-display font-bold text-neon-emerald text-xs">
                        T
                      </div>
                      <div className="text-left">
                        <h4 className="text-xs font-semibold text-gray-200">Telebirr Mobile Wallet</h4>
                        <span className="font-mono text-[10px] text-gray-500">0911••••3344</span>
                    <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-champagne transition-transform group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => navigate("customer-gateway", "m-demo")}
                    className="py-2.5 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/20 hover:border-neon-emerald/55 transition text-xs font-semibold tracking-wide text-neon-emerald flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {t("Test Demo")}
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => navigate("staff-login")}
                    className="py-2.5 rounded-xl bg-champagne text-luxury-bg font-sans font-bold transition text-xs tracking-wide flex items-center justify-center gap-1.5 cursor-pointer hover:opacity-90 shadow-md"
                  >
                    <Building className="w-3.5 h-3.5" />
                    {t("Staff Portal")}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* 2. STAFF LOGIN VIEW */}
          {view.type === "staff-login" && (
            <motion.div
              key="staff-login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6 max-w-sm mx-auto">
                <button
                  onClick={() => navigate("home")}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white bg-gray-900/60 px-4 py-1.5 rounded-full border border-gray-800 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t("Customer Gateway")}
                </button>
                <LanguageMenu lang={lang} onSelect={(l) => { setLang(l); localStorage.setItem("mbd_lang", l); }} />
              </div>

              <div className="bg-luxury-card border border-champagne/15 rounded-3xl p-8 relative shadow-2xl text-center overflow-hidden">
                <div className="absolute -top-16 -right-16 w-40 h-40 bg-champagne/[0.06] rounded-full blur-3xl pointer-events-none" />
                <div className="absolute -bottom-20 -left-16 w-44 h-44 bg-neon-emerald/[0.05] rounded-full blur-3xl pointer-events-none" />
                <h2 className="font-display font-bold text-3xl text-white">{t("Staff Portal")}</h2>
                <p className="text-xs gold-subtext mt-2 mb-8 italic">{t("Securely access Merchant Dashboard")}</p>

                <form onSubmit={(e) => handleLogin(e, "staff")} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">{t("Username")}</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-500" />
                      <input
                        type="text"
                        placeholder={t("Enter your username")}
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full bg-luxury-bg/60 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-emerald/30 transition font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">{t("Password")}</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-500" />
                      <input
                        type="password"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-luxury-bg/60 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-emerald/30 transition font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full mt-6 py-3 rounded-xl bg-neon-emerald hover:opacity-90 text-luxury-bg font-display font-bold text-sm tracking-wide flex items-center justify-center gap-2 neon-glow transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loginLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Building className="w-4 h-4" />
                        {t("Sign In to Portal")}
                      </>
                    )}
                  </button>
                </form>

                <div className="text-[10px] text-gray-500 mt-8 leading-normal max-w-xs mx-auto">
                  {t("Protected by cryptographic password hashing & secure session management")}
                </div>
              </div>
            </motion.div>
          )}

          {/* 3. SUPER ADMIN LOGIN VIEW */}
          {view.type === "admin-login" && (
            <motion.div
              key="admin-login"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6 max-w-sm mx-auto">
                <button
                  onClick={() => navigate("home")}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white bg-gray-900/60 px-4 py-1.5 rounded-full border border-gray-800 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t("Customer Gateway")}
                </button>
                <LanguageMenu lang={lang} onSelect={(l) => { setLang(l); localStorage.setItem("mbd_lang", l); }} />
              </div>

              <div className="bg-luxury-card border border-gray-800 rounded-3xl p-8 relative shadow-2xl text-center">
                <div className="w-12 h-12 bg-neon-emerald/10 border border-neon-emerald/35 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Shield className="w-6 h-6 text-neon-emerald" />
                </div>
                <h2 className="font-display font-bold text-2xl text-white">{t("Super Admin Portal")}</h2>
                <p className="text-xs text-gray-400 mt-1 mb-8">{t("Securely access Super Admin Panel")}</p>

                <form onSubmit={(e) => handleLogin(e, "admin")} className="space-y-4 text-left">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">{t("Admin Username")}</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-500" />
                      <input
                        type="text"
                        placeholder={t("Enter admin username")}
                        value={loginUsername}
                        onChange={(e) => setLoginUsername(e.target.value)}
                        className="w-full bg-luxury-bg/60 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-emerald/30 transition font-sans"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">{t("Password")}</label>
                    <div className="relative">
                      <Lock className="absolute left-3.5 top-3.5 w-4.5 h-4.5 text-gray-500" />
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                        className="w-full bg-luxury-bg/60 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-3 pl-11 pr-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-neon-emerald/30 transition font-sans"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loginLoading}
                    className="w-full mt-6 py-3 rounded-xl bg-neon-emerald hover:opacity-90 text-luxury-bg font-display font-bold text-sm tracking-wide flex items-center justify-center gap-2 neon-glow transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {loginLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        {t("Sign In to Admin Portal")}
                      </>
                    )}
                  </button>
                </form>

                <div className="text-[10px] text-gray-500 mt-8 leading-normal max-w-xs mx-auto">
                  {t("Protected by cryptographic password hashing & secure session management")}
                </div>
              </div>
            </motion.div>
          )}

          {/* 4. MERCHANT DASHBOARD VIEW */}
          {view.type === "waiter-portal" && auth.user?.role === "waiter" && (
            <motion.div
              key="waiter-portal"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-4xl w-full mx-auto px-4 flex flex-col"
            >
              <WaiterPortal
                user={auth.user}
                onLogout={handleLogout}
                showToast={showToast}
                t={t}
                lang={lang}
                setLang={setLang}
              />
            </motion.div>
          )}

          {view.type === "merchant-dashboard" && (
            <motion.div
              key="merchant-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl w-full mx-auto px-4 flex flex-col main-content-safe"
            >
              {/* Dashboard Subheader */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-800/60 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    {auth.user?.logoBase64 ? (
                      <div className="w-8 h-8 rounded-full bg-luxury-card border border-gray-800 overflow-hidden flex items-center justify-center">
                        <img src={auth.user.logoBase64} alt="Business logo" className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-champagne text-luxury-bg font-display font-extrabold text-sm flex items-center justify-center">
                        {auth.user?.username.slice(0, 1).toUpperCase()}
                      </div>
                    )}
                    <h2 className="font-display font-bold text-xl text-white">
                      {fixMojibake(auth.user?.companyName || auth.user?.username || "")}
                    </h2>
                  </div>
                  <p className="text-xs font-mono text-gray-500 mt-1">
                    {t("Merchant Dashboard")} (ID: {auth.user?.id?.toUpperCase()})
                  </p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  {auth.user?.appInstallEnabled !== false && (
                    <a
                      href="/app/qret.apk"
                      download="Qret.apk"
                      title="Download the Qret Android app (APK)"
                      className="flex items-center gap-1.5 text-xs text-neon-emerald hover:text-white bg-emerald-950/30 hover:bg-emerald-900/50 border border-emerald-500/30 hover:border-emerald-400/60 rounded-full px-2.5 py-1 transition cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download App
                    </a>
                  )}
                  <LanguageMenu lang={lang} onSelect={(l) => { setLang(l); localStorage.setItem("mbd_lang", l); }} />
                  <span className="px-2.5 sm:px-3 py-1 bg-emerald-950/30 text-neon-emerald border border-emerald-500/20 rounded-full text-[10px] font-semibold uppercase tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neon-emerald animate-pulse" />
                    {t("Permanent Billing")}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-white bg-red-950/10 hover:bg-red-950/20 px-3 py-1.5 rounded-full border border-red-500/20 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t("Sign Out")}
                  </button>
                </div>
              </div>

              {/* Sidebar + Tab Content Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Left sidebar navigation (Responsive: Mobile Icon Bar + Desktop Sidebar) */}
                <div className="md:col-span-3 flex flex-col gap-2">
                  {/* Mobile-First Sticky Bottom Icon Navigation Tap Bar */}
                  <div className="flex md:hidden fixed bottom-3 left-3 right-3 z-50 bg-luxury-card/95 backdrop-blur-xl border border-neon-emerald/40 rounded-2xl p-1.5 justify-around items-center gap-1 shadow-2xl overflow-x-auto">
                    <button
                      onClick={() => setMerchantTab("directory")}
                      title={t("Payment Directory")}
                      className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition cursor-pointer shrink-0 min-w-[50px] ${
                        merchantTab === "directory"
                          ? "bg-champagne text-luxury-bg font-bold shadow-md scale-105"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                      }`}
                    >
                      <Building className="w-4 h-4" />
                      <span className="text-[9px] font-semibold">{t("Payment Directory")}</span>
                    </button>

                    {auth.user?.accountType === "menu" && (
                      <button
                        onClick={() => {
                          setMerchantTab("menu");
                          loadMerchantMenuItems();
                        }}
                        title={t("Digital Menu")}
                        className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition cursor-pointer shrink-0 min-w-[50px] ${
                          merchantTab === "menu"
                            ? "bg-champagne text-luxury-bg font-bold shadow-md scale-105"
                            : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                        }`}
                      >
                        <Utensils className="w-4 h-4" />
                        <span className="text-[9px] font-semibold">{t("Digital Menu")}</span>
                      </button>
                    )}

                    <button
                      onClick={() => setMerchantTab("qrcode")}
                      title={t("QR Code Gateway")}
                      className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition cursor-pointer shrink-0 min-w-[50px] ${
                        merchantTab === "qrcode"
                          ? "bg-champagne text-luxury-bg font-bold shadow-md scale-105"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                      }`}
                    >
                      <QrCode className="w-4 h-4" />
                      <span className="text-[9px] font-semibold">{t("QR Code Gateway")}</span>
                    </button>

                    <button
                      onClick={() => setMerchantTab("tables")}
                      title={t("Tables & Live Scans")}
                      className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition cursor-pointer shrink-0 min-w-[50px] ${
                        merchantTab === "tables"
                          ? "bg-champagne text-luxury-bg font-bold shadow-md scale-105"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                      }`}
                    >
                      <Activity className="w-4 h-4 text-amber-400" />
                      <span className="text-[9px] font-semibold">{t("Tables & Live Scans")}</span>
                    </button>

                    <button
                      onClick={() => setMerchantTab("waitstaff")}
                      title={t("Waitstaff & Scanned Bills")}
                      className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition cursor-pointer shrink-0 min-w-[50px] ${
                        merchantTab === "waitstaff"
                          ? "bg-champagne text-luxury-bg font-bold shadow-md scale-105"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                      }`}
                    >
                      <User className="w-4 h-4" />
                      <span className="text-[9px] font-semibold">{t("Waitstaff & Scanned Bills")}</span>
                    </button>

                    <button
                      onClick={() => setMerchantTab("settings")}
                      title={t("Account Settings")}
                      className={`p-2 rounded-xl flex flex-col items-center gap-0.5 transition cursor-pointer shrink-0 min-w-[50px] ${
                        merchantTab === "settings"
                          ? "bg-champagne text-luxury-bg font-bold shadow-md scale-105"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                      }`}
                    >
                      <Settings className="w-4 h-4" />
                      <span className="text-[9px] font-semibold">{t("Account Settings")}</span>
                    </button>
                  </div>

                  {/* Desktop Full Sidebar */}
                  <div className="hidden md:flex flex-col gap-2">
                    <button
                      onClick={() => setMerchantTab("directory")}
                      className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition text-left cursor-pointer ${
                        merchantTab === "directory"
                          ? "bg-champagne text-luxury-bg font-bold neon-glow"
                          : "bg-luxury-card hover:bg-gray-800 text-gray-300"
                      }`}
                    >
                      <Building className="w-4.5 h-4.5" />
                      <span>{t("Payment Directory")}</span>
                    </button>

                    {auth.user?.accountType === "menu" && (
                      <button
                        onClick={() => {
                          setMerchantTab("menu");
                          loadMerchantMenuItems();
                        }}
                        className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center justify-between transition text-left cursor-pointer ${
                          merchantTab === "menu"
                            ? "bg-champagne text-luxury-bg font-bold neon-glow"
                            : "bg-luxury-card hover:bg-gray-800 text-gray-300"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Utensils className="w-4.5 h-4.5" />
                          <span>{t("Digital Menu")}</span>
                        </div>
                        {auth.user?.accountType === "menu" && (
                          <span className="text-[9px] bg-emerald-950/80 text-neon-emerald px-1.5 py-0.5 rounded border border-neon-emerald/30 font-bold uppercase">
                            {t("Menu Acc")}
                          </span>
                        )}
                      </button>
                    )}

                    <button
                      onClick={() => setMerchantTab("qrcode")}
                      className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition text-left cursor-pointer ${
                        merchantTab === "qrcode"
                          ? "bg-champagne text-luxury-bg font-bold neon-glow"
                          : "bg-luxury-card hover:bg-gray-800 text-gray-300"
                      }`}
                    >
                      <QrCode className="w-4.5 h-4.5" />
                      <span>{t("QR Code Gateway")}</span>
                    </button>

                    <button
                      onClick={() => setMerchantTab("tables")}
                      className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition text-left cursor-pointer ${
                        merchantTab === "tables"
                          ? "bg-champagne text-luxury-bg font-bold neon-glow"
                          : "bg-luxury-card hover:bg-gray-800 text-gray-300"
                      }`}
                    >
                      <Activity className="w-4.5 h-4.5 text-amber-400" />
                      <span>{t("Tables & Live Scans")}</span>
                    </button>

                    <button
                      onClick={() => setMerchantTab("waitstaff")}
                      className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition text-left cursor-pointer ${
                        merchantTab === "waitstaff"
                          ? "bg-champagne text-luxury-bg font-bold neon-glow"
                          : "bg-luxury-card hover:bg-gray-800 text-gray-300"
                      }`}
                    >
                      <User className="w-4.5 h-4.5 text-gray-400" />
                      <span>{t("Waitstaff & Scanned Bills")}</span>
                    </button>

                    <button
                      onClick={() => setMerchantTab("settings")}
                      className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition text-left cursor-pointer ${
                        merchantTab === "settings"
                          ? "bg-champagne text-luxury-bg font-bold neon-glow"
                          : "bg-luxury-card hover:bg-gray-800 text-gray-300"
                      }`}
                    >
                      <Settings className="w-4.5 h-4.5" />
                      <span>{t("Account Settings")}</span>
                    </button>
                  </div>
                </div>

                {/* Right Tab Contents */}
                <div className="md:col-span-9 bg-luxury-card border border-gray-800/80 rounded-3xl p-6 min-h-[400px] pb-24 md:pb-6">
                  
                  {/* TAB: Table QR Codes & Live Copy Alerts */}
                  {merchantTab === "tables" && auth.user && (
                    <TableQRManager
                      merchantId={auth.user.id}
                      companyName={auth.user.companyName}
                      t={t}
                      showToast={showToast}
                    />
                  )}

                  {/* TAB: Waitstaff Accounts & Scanned Bills */}
                  {merchantTab === "waitstaff" && auth.user && (
                    <WaiterManager
                      merchantId={auth.user.id}
                      companyName={auth.user.companyName}
                      t={t}
                      showToast={showToast}
                    />
                  )}

                  {/* TAB: Digital Menu Manager */}
                  {merchantTab === "menu" && auth.user?.accountType === "menu" && (
                    <DigitalMenuManager
                      items={menuItems}
                      loading={loadingMenuItems}
                      onRefresh={loadMerchantMenuItems}
                      onAddItem={handleAddMenuItem}
                      onUpdateItem={handleUpdateMenuItem}
                      onDeleteItem={handleDeleteMenuItem}
                      onAiScanParse={handleAiScanParse}
                      onItemLookup={handleItemLookup}
                      t={t}
                      showToast={showToast}
                    />
                  )}
                  
                  {/* TAB 1: Payment Directory */}
                  {merchantTab === "directory" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-display font-bold text-lg text-white">{t("Mobile Banking Profiles")}</h3>
                          <p className="text-xs text-gray-400">{t("Manage active payment options customers see when they scan your QR")}</p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => setIsBankCameraOpen(true)}
                            className="px-3.5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 text-white font-display font-bold text-xs rounded-full flex items-center gap-1.5 hover:opacity-90 shadow-md transition cursor-pointer"
                          >
                            <Camera className="w-3.5 h-3.5" />
                            <span>{t("Scan Card / QR (Camera)")}</span>
                          </button>
                          <button
                            onClick={() => setIsAddBankModalOpen(true)}
                            className="px-4 py-2 bg-champagne text-luxury-bg font-display font-bold text-xs rounded-full flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer"
                          >
                            <Plus className="w-4 h-4" />
                            {t("Add Bank Option")}
                          </button>
                        </div>
                      </div>

                      {loadingProfiles ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-2">
                          <RefreshCw className="w-8 h-8 animate-spin text-neon-emerald" />
                          <span className="text-xs">{t("Loading payment details...")}</span>
                        </div>
                      ) : paymentProfiles.length === 0 ? (
                        <div className="border border-dashed border-gray-800 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center mb-4 text-gray-500">
                            <Building className="w-6 h-6" />
                          </div>
                          <h4 className="text-sm font-semibold text-gray-200">No payment options yet</h4>
                          <p className="text-xs text-gray-500 max-w-sm mt-1 mb-6">
                            Add your mobile banking details (CBE, Telebirr, Dashen, etc.) to start accepting payments.
                          </p>
                          <button
                            onClick={() => setIsAddBankModalOpen(true)}
                            className="px-4 py-2 bg-emerald-950/30 text-neon-emerald hover:border-neon-emerald/50 border border-emerald-500/20 text-xs font-semibold rounded-lg transition cursor-pointer"
                          >
                            Add your first bank
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {paymentProfiles.map((p) => (
                            <div
                              key={p.id}
                              className="p-4 bg-luxury-bg border border-gray-800 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-neon-emerald/5 border border-neon-emerald/20 flex items-center justify-center font-display font-extrabold text-neon-emerald text-sm">
                                  {p.platform.slice(0, 2).toUpperCase()}
                                </div>
                                <div className="text-left">
                                  <h4 className="text-sm font-bold text-white">{p.platform}</h4>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    <span className="font-mono text-xs text-gray-400 bg-gray-900 px-2 py-0.5 rounded border border-gray-800">{p.accountNumber}</span>
                                    {p.deepLink && (
                                      <span className="text-[10px] text-gray-500 font-mono flex items-center gap-0.5">
                                        <ExternalLink className="w-3 h-3" />
                                        {p.deepLink}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 self-end sm:self-center">
                                <button
                                  onClick={() => handleToggleProfileActive(p)}
                                  className={`px-3 py-1 rounded-full text-[10px] font-semibold tracking-wider uppercase border transition cursor-pointer ${
                                    p.isActive
                                      ? "bg-emerald-950/20 border-emerald-500/30 text-neon-emerald"
                                      : "bg-gray-950/40 border-gray-800 text-gray-500"
                                  }`}
                                >
                                  {p.isActive ? "Active" : "Paused"}
                                </button>
                                <button
                                  onClick={() => setDeletingProfileConfirm({ id: p.id, platform: p.platform })}
                                  className="p-2 text-gray-500 hover:text-red-400 bg-gray-900 border border-gray-800/60 rounded-xl hover:bg-gray-800 transition cursor-pointer"
                                  title="Delete Payment Option"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: QR Code Gateway */}
                  {merchantTab === "qrcode" && auth.user && (
                    <TableQRManager
                      merchantId={auth.user.id}
                      companyName={auth.user.companyName || auth.user.username || "Merchant"}
                      t={t}
                      showToast={showToast}
                    />
                  )}

                  {/* TAB 3: Account Settings */}
                  {merchantTab === "settings" && (
                    <div className="space-y-6">
                      {/* Business Brand Logo Card */}
                      <div className="max-w-2xl border border-gray-800/80 rounded-2xl p-6 bg-luxury-bg/40 text-left">
                        <h4 className="font-display font-semibold text-sm text-white mb-4">
                          Business Brand Logo
                        </h4>
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 bg-luxury-bg border border-gray-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                            {merchantLogoBase64 ? (
                              <img src={merchantLogoBase64} alt="Business Logo" className="w-full h-full object-contain" />
                            ) : (
                              <ImageIcon className="w-6 h-6 text-gray-600" />
                            )}
                          </div>
                          <div className="flex flex-col gap-2">
                            <div className="flex items-center gap-2">
                              <label className="px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-neon-emerald/50 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                                <Upload className="w-3.5 h-3.5" />
                                {merchantLogoBase64 ? "Replace Logo" : "Upload Logo"}
                                <input
                                  type="file"
                                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                                  onChange={handleSettingsLogoFileChange}
                                  className="hidden"
                                />
                              </label>
                              {merchantLogoBase64 && (
                                <button
                                  type="button"
                                  onClick={() => setMerchantLogoBase64("")}
                                  className="px-3.5 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-950/40 transition text-xs font-semibold cursor-pointer"
                                >
                                  Remove
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={async () => {
                                  setSavingMerchantLogo(true);
                                  await saveMerchantBrandLogo(merchantLogoBase64);
                                  setSavingMerchantLogo(false);
                                }}
                                disabled={savingMerchantLogo}
                                className="px-3.5 py-2 rounded-xl bg-champagne text-luxury-bg font-display font-bold text-xs tracking-wide hover:opacity-90 transition cursor-pointer disabled:opacity-60"
                              >
                                {savingMerchantLogo ? "Saving..." : "Save Logo"}
                              </button>
                            </div>
                            <span className="text-[9px] text-gray-500">
                              PNG, JPG, WEBP or SVG. Max 4MB. Used as the site favicon and brand logo on the customer page.
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Account Management Card */}
                      <div className="max-w-2xl border border-gray-800/80 rounded-2xl p-6 bg-luxury-bg/40 text-left">
                        <h4 className="font-display font-semibold text-sm text-white mb-4">
                          Account Management
                        </h4>

                        <form onSubmit={handleSaveProfileChanges} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Business Name</label>
                              <input
                                type="text"
                                required
                                value={merchantBusinessName}
                                onChange={(e) => setMerchantBusinessName(e.target.value)}
                                className="w-full bg-luxury-bg/85 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Username</label>
                              <input
                                type="text"
                                required
                                value={merchantUsername}
                                onChange={(e) => setMerchantUsername(e.target.value)}
                                className="w-full bg-luxury-bg/85 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="py-2.5 px-4 rounded-xl bg-champagne text-luxury-bg font-display font-bold text-xs tracking-wide hover:opacity-90 transition cursor-pointer"
                          >
                            Save Profile Changes
                          </button>
                        </form>
                      </div>

                      {/* Update Security Password Card */}
                      <div className="max-w-2xl border border-gray-800/80 rounded-2xl p-6 bg-luxury-bg/40 text-left">
                        <h4 className="font-display font-semibold text-sm text-white mb-4">
                          Update Security Password
                        </h4>

                        <form onSubmit={handleMerchantPasswordChange} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Current Password</label>
                              <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="w-full bg-luxury-bg/85 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">New Secure Password</label>
                              <input
                                type="password"
                                required
                                placeholder="Min 5 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="w-full bg-luxury-bg/85 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="py-2.5 px-4 rounded-xl bg-champagne text-luxury-bg font-display font-bold text-xs tracking-wide hover:opacity-90 transition cursor-pointer"
                          >
                            Change Password
                          </button>
                        </form>
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          )}

          {/* 5. SUPER ADMIN DASHBOARD VIEW */}
          {view.type === "admin-dashboard" && (
            <motion.div
              key="admin-dashboard"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-7xl w-full mx-auto px-4 flex flex-col"
            >
              {/* Header section */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 border-b border-gray-800/60 pb-6">
                <div>
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-champagne text-luxury-bg font-display font-extrabold text-sm flex items-center justify-center">
                      A
                    </div>
                    <h2 className="font-display font-bold text-xl text-white">{t("Super Admin Panel")}</h2>
                    <Shield className="w-4 h-4 text-neon-emerald shrink-0" />
                  </div>
                  <p className="text-xs font-mono text-gray-500 mt-1">{t("GLOBAL PLATFORM CONTROLS")}</p>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                  <LanguageMenu lang={lang} onSelect={(l) => { setLang(l); localStorage.setItem("mbd_lang", l); }} />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-1.5 text-xs text-red-400 hover:text-white bg-red-950/10 hover:bg-red-950/20 px-3 py-1.5 rounded-full border border-red-500/20 transition cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    {t("Sign Out")}
                  </button>
                </div>
              </div>

              {/* Sidebar + Admin Tab Content Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
                
                {/* Left Sidebar Admin Navigation (Responsive: Mobile Icon Bar + Desktop Sidebar) */}
                <div className="md:col-span-3 flex flex-col gap-2">
                  {/* Mobile Mobile-First Icon Strip */}
                  <div className="flex md:hidden bg-luxury-card border border-gray-800 rounded-2xl p-1.5 justify-around items-center gap-1 shadow-lg overflow-x-auto">
                    <button
                      onClick={() => setAdminTab("merchants")}
                      title="Merchant Accounts"
                      className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer shrink-0 ${
                        adminTab === "merchants"
                          ? "bg-champagne text-luxury-bg font-bold shadow-md scale-105"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                      }`}
                    >
                      <Building className="w-5 h-5" />
                      <span className="text-[9px] font-semibold">{t("Merchants")}</span>
                    </button>

                    <button
                      onClick={() => {
                        setAdminTab("receipts");
                        loadAdminReceiptScans();
                      }}
                      title="Global Scanned Bills"
                      className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer shrink-0 ${
                        adminTab === "receipts"
                          ? "bg-champagne text-luxury-bg font-bold shadow-md scale-105"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                      }`}
                    >
                      <ShieldCheck className="w-5 h-5" />
                      <span className="text-[9px] font-semibold">{t("Scans")}</span>
                    </button>

                    <button
                      onClick={() => {
                        setAdminTab("logs");
                        loadAdminLogs();
                      }}
                      title="Platform Audit Logs"
                      className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer shrink-0 ${
                        adminTab === "logs"
                          ? "bg-champagne text-luxury-bg font-bold shadow-md scale-105"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                      }`}
                    >
                      <Activity className="w-5 h-5" />
                      <span className="text-[9px] font-semibold">{t("Logs")}</span>
                    </button>

                    <button
                      onClick={() => setAdminTab("credentials")}
                      title="Admin Credentials"
                      className={`p-2.5 rounded-xl flex flex-col items-center gap-1 transition cursor-pointer shrink-0 ${
                        adminTab === "credentials"
                          ? "bg-champagne text-luxury-bg font-bold shadow-md scale-105"
                          : "text-gray-400 hover:text-white hover:bg-gray-800/60"
                      }`}
                    >
                      <Lock className="w-5 h-5" />
                      <span className="text-[9px] font-semibold">{t("Credentials")}</span>
                    </button>
                  </div>

                  {/* Desktop Full Sidebar */}
                  <div className="hidden md:flex flex-col gap-2">
                    <button
                      onClick={() => setAdminTab("merchants")}
                      className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition text-left cursor-pointer ${
                        adminTab === "merchants"
                          ? "bg-champagne text-luxury-bg font-bold neon-glow"
                          : "bg-luxury-card hover:bg-gray-800 text-gray-300"
                      }`}
                    >
                      <Building className="w-4.5 h-4.5" />
                      {t("Merchant Accounts")}
                    </button>

                    <button
                      onClick={() => {
                        setAdminTab("receipts");
                        loadAdminReceiptScans();
                      }}
                      className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition text-left cursor-pointer ${
                        adminTab === "receipts"
                          ? "bg-champagne text-luxury-bg font-bold neon-glow"
                          : "bg-luxury-card hover:bg-gray-800 text-gray-300"
                      }`}
                    >
                      <ShieldCheck className="w-4.5 h-4.5 text-neon-emerald" />
                      {t("Global Scanned Bills")}
                    </button>

                    <button
                      onClick={() => {
                        setAdminTab("logs");
                        loadAdminLogs();
                      }}
                      className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition text-left cursor-pointer ${
                        adminTab === "logs"
                          ? "bg-champagne text-luxury-bg font-bold neon-glow"
                          : "bg-luxury-card hover:bg-gray-800 text-gray-300"
                      }`}
                    >
                      <Activity className="w-4.5 h-4.5" />
                      {t("Platform Audit Logs")}
                    </button>

                    <button
                      onClick={() => setAdminTab("credentials")}
                      className={`px-4 py-3 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition text-left cursor-pointer ${
                        adminTab === "credentials"
                          ? "bg-champagne text-luxury-bg font-bold neon-glow"
                          : "bg-luxury-card hover:bg-gray-800 text-gray-300"
                      }`}
                    >
                      <Lock className="w-4.5 h-4.5" />
                      {t("Admin Credentials")}
                    </button>
                  </div>
                </div>

                {/* Right Area content */}
                <div className="md:col-span-9 bg-luxury-card border border-gray-800/80 rounded-3xl p-6 min-h-[400px]">
                  
                  {/* TAB 1: Merchant Accounts registry */}
                  {adminTab === "merchants" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-display font-bold text-lg text-white">{t("Merchant Registry")}</h3>
                          <p className="text-xs text-gray-400">{t("View active directory profiles and provision secure new merchant accounts")}</p>
                        </div>
                        <button
                          onClick={() => setIsProvisionModalOpen(true)}
                          className="px-4 py-2 bg-champagne text-luxury-bg font-display font-bold text-xs rounded-full flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                          {t("Provision Merchant")}
                        </button>
                      </div>

                      {/* Search merchants query */}
                      <div className="relative">
                        <Search className="absolute left-3.5 top-3 w-4 h-4 text-gray-500" />
                        <input
                          type="text"
                          placeholder={t("Search by Business Name, Username, or ID...")}
                          value={searchMerchantQuery}
                          onChange={(e) => setSearchMerchantQuery(e.target.value)}
                          className="w-full bg-luxury-bg/80 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-2 pl-11 pr-4 text-xs text-white focus:outline-none transition"
                        />
                      </div>

                      {loadingMerchants ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                          <RefreshCw className="w-8 h-8 animate-spin text-neon-emerald mb-2" />
                          <span className="text-xs">Fetching merchants...</span>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {merchantsList
                            .filter((m) => {
                              const q = searchMerchantQuery.toLowerCase();
                              return (
                                m.companyName.toLowerCase().includes(q) ||
                                m.username.toLowerCase().includes(q) ||
                                m.id.toLowerCase().includes(q)
                              );
                            })
                            .map((m) => (
                              <div
                                key={m.id}
                                className={`p-4 bg-luxury-bg border rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition ${
                                  m.serviceStatus === "paused"
                                    ? "border-red-900/40 bg-red-950/10 opacity-80"
                                    : "border-gray-800 hover:border-gray-700"
                                }`}
                              >
                                <div className="text-left space-y-1.5 flex-1 min-w-0">
                                  <div className="flex flex-wrap items-center gap-2">
                                    {m.logoBase64 ? (
                                      <img
                                        src={m.logoBase64}
                                        alt=""
                                        className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 object-contain shrink-0"
                                      />
                                    ) : null}
                                    <h4 className="text-sm font-bold text-white">{fixMojibake(m.companyName)}</h4>
                                    <span className="font-mono text-[9px] text-gray-400 bg-gray-900 border border-gray-800 px-1.5 py-0.5 rounded">
                                      ID: {m.id}
                                    </span>
                                    
                                    {/* Account Type Badge */}
                                    <span className={`text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase border ${
                                      m.accountType === "menu"
                                        ? "bg-champagne/10 text-champagne border-champagne/30"
                                        : "bg-gray-800 text-gray-300 border-gray-700"
                                    }`}>
                                      {m.accountType === "menu" ? "Menu / Restaurant" : "Normal Account"}
                                    </span>

                                    {/* Service Status Badge */}
                                    <span className={`text-[8px] font-extrabold tracking-wider px-2 py-0.5 rounded-full uppercase border ${
                                      m.serviceStatus === "paused"
                                        ? "bg-red-950/80 text-red-400 border-red-500/50"
                                        : "bg-emerald-950/80 text-neon-emerald border-emerald-500/50"
                                    }`}>
                                      {m.serviceStatus === "paused" ? "Service Paused" : "Service Active"}
                                    </span>

                                    {/* Billing Type Badge */}
                                    <span className={`text-[8px] font-semibold tracking-wider px-1.5 py-0.5 rounded uppercase ${
                                      m.billingType === "permanent"
                                        ? "bg-emerald-950/20 text-neon-emerald border border-emerald-500/20"
                                        : "bg-orange-950/20 text-orange-400 border border-orange-500/20"
                                    }`}>
                                      {m.billingType === "permanent" ? "Permanent" : "Temporary Trial"}
                                    </span>

                                    {/* App Download Badge */}
                                    <span className={`text-[8px] font-bold tracking-wider px-2 py-0.5 rounded-full uppercase border ${
                                      m.appInstallEnabled !== false
                                        ? "bg-neon-emerald/10 text-neon-emerald border-neon-emerald/30"
                                        : "bg-gray-800 text-gray-500 border-gray-700"
                                    }`}>
                                      App Download: {m.appInstallEnabled !== false ? "On" : "Off"}
                                    </span>
                                  </div>

                                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-400 font-sans">
                                    <span className="flex items-center gap-1">
                                      <User className="w-3 h-3 text-gray-500" />
                                      User: <strong className="text-gray-200">{m.username}</strong>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <CreditCard className="w-3 h-3 text-gray-500" />
                                      Bank Profiles: <strong className="text-gray-200">{m.profileCount || 0}</strong>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Shield className="w-3 h-3 text-gray-500" />
                                      Payment Auth: <strong className={m.requiresPaymentAuthenticator !== false ? "text-emerald-400" : "text-gray-400"}>
                                        {m.requiresPaymentAuthenticator !== false ? "Enabled" : "Disabled"}
                                      </strong>
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <Utensils className="w-3 h-3 text-gray-500" />
                                      Staff Accounts: <strong className="text-gray-200">
                                        {m.staffAccountModel === "multi_waiters" ? "Multi-Waiters Sub-Accounts" : "Single Account"}
                                      </strong>
                                    </span>
                                  </div>
                                </div>

                                <div className="flex flex-wrap items-center gap-2 self-start lg:self-center shrink-0">
                                  {/* Service Pause / Resume Toggle Button */}
                                  <button
                                    onClick={() => handleToggleService(m.id, m.companyName)}
                                    title={m.serviceStatus === "paused" ? "Resume Service" : "Pause Service"}
                                    className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                                      m.serviceStatus === "paused"
                                        ? "bg-emerald-950/40 hover:bg-emerald-900/60 text-neon-emerald border border-emerald-500/40"
                                        : "bg-red-950/40 hover:bg-red-900/60 text-red-400 border border-red-500/40"
                                    }`}
                                  >
                                    <Activity className="w-3.5 h-3.5" />
                                    <span>{m.serviceStatus === "paused" ? "Resume Service" : "Pause Service"}</span>
                                  </button>

                                  {/* App Download Toggle Button */}
                                  <button
                                    onClick={() => handleToggleAppInstall(m)}
                                    title={m.appInstallEnabled !== false ? "Deny App Download" : "Allow App Download"}
                                    className={`px-3 py-1.5 rounded-xl font-display font-bold text-xs transition flex items-center gap-1.5 cursor-pointer ${
                                      m.appInstallEnabled !== false
                                        ? "bg-gray-900 hover:bg-red-950/40 text-neon-emerald border border-gray-800 hover:border-red-500/40"
                                        : "bg-emerald-950/40 hover:bg-emerald-900/60 text-gray-400 border border-emerald-500/40 hover:text-neon-emerald"
                                    }`}
                                  >
                                    <Download className="w-3.5 h-3.5" />
                                    <span>{m.appInstallEnabled !== false ? "Deny App" : "Allow App"}</span>
                                  </button>

                                  {/* Edit Merchant Configuration */}
                                  <button
                                    onClick={() => handleOpenEditMerchant(m)}
                                    title="Edit Merchant Configuration"
                                    className="p-2 text-gray-300 hover:text-white bg-gray-900 border border-gray-800 rounded-xl hover:bg-gray-800 transition cursor-pointer"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </button>

                                  <button
                                    onClick={() => navigate("customer-gateway", m.id)}
                                    className="px-3 py-1.5 rounded-xl border border-emerald-500/20 hover:border-neon-emerald/50 hover:bg-emerald-950/10 text-xs font-semibold text-neon-emerald transition flex items-center gap-1 cursor-pointer"
                                  >
                                    Launch Gateway →
                                  </button>

                                  <button
                                    onClick={() => setDeletingMerchantConfirm({ id: m.id, companyName: m.companyName })}
                                    className="p-2 text-gray-500 hover:text-red-400 bg-gray-900 border border-gray-800/60 rounded-xl hover:bg-gray-800 transition cursor-pointer"
                                    title="Delete Merchant"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB: Global Scanned Bills & Gemini Fraud Audits */}
                  {adminTab === "receipts" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-display font-bold text-lg text-white flex items-center gap-2">
                            <ShieldCheck className="w-5 h-5 text-neon-emerald" />
                            Global Scanned Bills & AI Fraud Audits
                          </h3>
                          <p className="text-xs text-gray-400">
                            Super admin cross-merchant audit of all scanned receipts captured by waitstaff
                          </p>
                        </div>
                        <button
                          onClick={loadAdminReceiptScans}
                          className="px-3.5 py-2 bg-emerald-950/30 text-neon-emerald border border-emerald-500/20 hover:border-neon-emerald rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${loadingAdminScans ? "animate-spin" : ""}`} />
                          Refresh Scans
                        </button>
                      </div>

                      {/* Filters */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-8 relative">
                          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Filter by merchant name, waiter, table, or reference #..."
                            value={searchAdminScanQuery}
                            onChange={(e) => setSearchAdminScanQuery(e.target.value)}
                            className="w-full bg-luxury-bg/80 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-2 pl-11 pr-4 text-xs text-white focus:outline-none transition"
                          />
                        </div>
                        <div className="sm:col-span-4 flex bg-luxury-bg border border-gray-800 p-1 rounded-xl">
                          <button
                            onClick={() => setAdminScanFilter("all")}
                            className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                              adminScanFilter === "all" ? "bg-champagne text-luxury-bg" : "text-gray-400"
                            }`}
                          >
                            All ({adminReceiptScans.length})
                          </button>
                          <button
                            onClick={() => setAdminScanFilter("verified")}
                            className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                              adminScanFilter === "verified" ? "bg-emerald-500 text-luxury-bg" : "text-gray-400"
                            }`}
                          >
                            Verified
                          </button>
                          <button
                            onClick={() => setAdminScanFilter("suspicious")}
                            className={`flex-1 py-1 text-xs font-bold rounded-lg transition ${
                              adminScanFilter === "suspicious" ? "bg-red-500 text-white" : "text-gray-400"
                            }`}
                          >
                            Suspicious
                          </button>
                        </div>
                      </div>

                      {/* Receipt List */}
                      {loadingAdminScans ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                          <RefreshCw className="w-8 h-8 animate-spin text-neon-emerald mb-2" />
                          <span className="text-xs">Loading global receipt scans...</span>
                        </div>
                      ) : adminReceiptScans.length === 0 ? (
                        <div className="text-center py-16 bg-luxury-bg border border-gray-800 rounded-2xl text-gray-500 space-y-2">
                          <ShieldCheck className="w-10 h-10 mx-auto text-gray-600" />
                          <p className="text-xs font-semibold">No scanned bills logged yet across merchants.</p>
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {adminReceiptScans
                            .filter((scan) => {
                              if (adminScanFilter !== "all" && scan.status !== adminScanFilter) return false;
                              const q = searchAdminScanQuery.toLowerCase();
                              return (
                                (scan.merchantName || "").toLowerCase().includes(q) ||
                                (scan.staffName || "").toLowerCase().includes(q) ||
                                (scan.tableNumber || "").toLowerCase().includes(q) ||
                                (scan.referenceNumber || "").toLowerCase().includes(q) ||
                                (scan.bankName || "").toLowerCase().includes(q)
                              );
                            })
                            .map((scan) => (
                              <div
                                key={scan.id}
                                className={`p-4 bg-luxury-bg border rounded-2xl space-y-3 transition ${
                                  scan.status === "verified"
                                    ? "border-emerald-500/30 hover:border-emerald-500/60"
                                    : "border-red-500/40 hover:border-red-500/70"
                                }`}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <span className="font-bold text-sm text-white">{scan.merchantName}</span>
                                      <span className="text-[10px] font-mono bg-gray-900 text-gray-400 px-1.5 py-0.5 rounded border border-gray-800">
                                        {scan.tableNumber || "Table 9"}
                                      </span>
                                    </div>
                                    <span className="text-[11px] text-gray-400">By Waiter: {scan.staffName}</span>
                                  </div>

                                  <span
                                    className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                      scan.status === "verified"
                                        ? "bg-emerald-950/80 text-neon-emerald border border-emerald-500/40"
                                        : "bg-red-950/80 text-red-400 border border-red-500/40"
                                    }`}
                                  >
                                    {scan.status} ({scan.confidenceScore || 90}%)
                                  </span>
                                </div>

                                <div className="grid grid-cols-2 gap-2 bg-luxury-card p-2.5 rounded-xl text-xs border border-gray-800">
                                  <div>
                                    <span className="text-gray-500 text-[10px] block">Transferred Amount:</span>
                                    <span className="font-mono font-bold text-champagne">
                                      {scan.amount ? `${scan.amount} ETB` : "N/A"}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500 text-[10px] block">Bank / Wallet:</span>
                                    <span className="font-semibold text-white">{scan.bankName || "CBE"}</span>
                                  </div>
                                  <div className="col-span-2">
                                    <span className="text-gray-500 text-[10px] block">Ref # / Txn ID:</span>
                                    <span className="font-mono text-gray-300 select-all">{scan.referenceNumber || "FT2408192837"}</span>
                                  </div>
                                </div>

                                {scan.notes && (
                                  <p className="text-[11px] text-gray-400 italic bg-black/40 p-2 rounded-xl border border-gray-800/60">
                                    "{sanitizeInput(scan.notes)}"
                                  </p>
                                )}

                                {scan.imageUrl && (
                                  <button
                                    onClick={() => setSelectedAdminScan(scan)}
                                    className="w-full py-1.5 bg-gray-900 hover:bg-gray-800 text-gray-300 text-xs font-semibold rounded-xl border border-gray-800 transition cursor-pointer flex items-center justify-center gap-1.5"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5 text-neon-emerald" />
                                    View Full Scanned Image
                                  </button>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 2: Platform Audit Logs */}
                  {adminTab === "logs" && (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <h3 className="font-display font-bold text-lg text-white">Platform Security Audit Logs</h3>
                          <p className="text-xs text-gray-400">Live system monitor logging database changes, profile updates, and login attempts</p>
                        </div>
                        <button
                          onClick={loadAdminLogs}
                          className="p-2 text-neon-emerald hover:text-white bg-emerald-950/20 border border-emerald-500/20 hover:border-neon-emerald rounded-full transition flex items-center justify-center shrink-0 w-9 h-9 cursor-pointer"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Filter Area */}
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-8 relative">
                          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-gray-500" />
                          <input
                            type="text"
                            placeholder="Search logs by keyword, user, or details..."
                            value={logsSearch}
                            onChange={(e) => setLogsSearch(e.target.value)}
                            className="w-full bg-luxury-bg/80 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-2 pl-11 pr-4 text-xs text-white focus:outline-none transition"
                          />
                        </div>
                        <div className="sm:col-span-4">
                          <select
                            value={logsFilter}
                            onChange={(e) => setLogsFilter(e.target.value)}
                            className="w-full bg-luxury-bg border border-gray-800 focus:border-neon-emerald rounded-xl py-2 px-3 text-xs text-gray-300 focus:outline-none transition"
                          >
                            <option>All Operations</option>
                            <option>Logins / Logouts</option>
                            <option>Merchant Provisioning</option>
                            <option>Password Updates</option>
                            <option>Mobile Banking Changes</option>
                          </select>
                        </div>
                      </div>

                      {/* Logs Table / Listing */}
                      {loadingLogs ? (
                        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                          <RefreshCw className="w-8 h-8 animate-spin text-neon-emerald mb-2" />
                          <span className="text-xs">Loading audit logs...</span>
                        </div>
                      ) : (
                        <div className="border border-gray-800 rounded-2xl overflow-hidden overflow-x-auto">
                          <table className="w-full text-left text-xs min-w-[600px]">
                            <thead className="bg-luxury-bg border-b border-gray-800 uppercase font-mono text-[9px] tracking-wider text-gray-400">
                              <tr>
                                <th className="p-4">Timestamp</th>
                                <th className="p-4">User</th>
                                <th className="p-4">Action</th>
                                <th className="p-4">Details Summary</th>
                                <th className="p-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/60 bg-luxury-bg/20 font-sans">
                              {filteredAuditLogs.map((log) => (
                                <tr key={log.id} className="hover:bg-gray-800/15 transition">
                                  <td className="p-4 text-gray-400 whitespace-nowrap">
                                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                                  </td>
                                  <td className="p-4 font-bold text-gray-200">
                                    {log.userDisplay}
                                  </td>
                                  <td className="p-4">
                                    <span className={`px-2 py-0.5 text-[9px] rounded font-bold tracking-tight uppercase ${
                                      log.action.includes("failed")
                                        ? "bg-red-950/40 text-red-400 border border-red-500/20"
                                        : log.action.includes("success")
                                        ? "bg-emerald-950/40 text-neon-emerald border border-emerald-500/20"
                                        : "bg-gray-800 text-gray-300 border border-gray-700"
                                    }`}>
                                      {log.action}
                                    </span>
                                  </td>
                                  <td className="p-4 text-gray-300 max-w-xs truncate">
                                    {log.details}
                                  </td>
                                  <td className="p-4 text-right">
                                    <button
                                      onClick={() => setSelectedLog(log)}
                                      className="px-2 py-1 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded text-[10px] font-bold text-gray-300 transition cursor-pointer"
                                    >
                                      DETAILS
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}

                  {/* TAB 3: Admin Credentials */}
                  {adminTab === "credentials" && (
                    <div className="space-y-6">
                      {/* Account Management Card */}
                      <div className="max-w-2xl border border-gray-800/80 rounded-2xl p-6 bg-luxury-bg/40 text-left">
                        <h4 className="font-display font-semibold text-sm text-white mb-4">
                          Account Management
                        </h4>

                        <form onSubmit={handleUpdateAdminUsername} className="space-y-4">
                          <div className="max-w-md">
                            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Super Admin Username</label>
                            <input
                              type="text"
                              required
                              value={adminUsername}
                              onChange={(e) => setAdminUsername(e.target.value)}
                              className="w-full bg-luxury-bg/85 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                            />
                          </div>

                          <button
                            type="submit"
                            className="py-2.5 px-4 rounded-xl bg-champagne text-luxury-bg font-display font-bold text-xs tracking-wide hover:opacity-90 transition cursor-pointer"
                          >
                            Update Admin Username
                          </button>
                        </form>
                      </div>

                      {/* Update Security Password Card */}
                      <div className="max-w-2xl border border-gray-800/80 rounded-2xl p-6 bg-luxury-bg/40 text-left">
                        <h4 className="font-display font-semibold text-sm text-white mb-4">
                          Update Security Password
                        </h4>

                        <form onSubmit={handleAdminPasswordChange} className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Current Password</label>
                              <input
                                type="password"
                                required
                                placeholder="••••••••"
                                value={adminCurrentPassword}
                                onChange={(e) => setAdminCurrentPassword(e.target.value)}
                                className="w-full bg-luxury-bg/85 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">New Password</label>
                              <input
                                type="password"
                                required
                                placeholder="•••••••• (min 5 chars)"
                                value={adminNewPassword}
                                onChange={(e) => setAdminNewPassword(e.target.value)}
                                className="w-full bg-luxury-bg/85 border border-gray-800 focus:border-neon-emerald/80 rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                              />
                            </div>
                          </div>

                          <button
                            type="submit"
                            className="py-2.5 px-4 rounded-xl bg-champagne text-luxury-bg font-display font-bold text-xs tracking-wide hover:opacity-90 transition cursor-pointer"
                          >
                            Change Password
                          </button>
                        </form>
                      </div>

                    </div>
                  )}

                </div>
              </div>
            </motion.div>
          )}

                    {/* 6. CUSTOMER GATEWAY VIEW (PUBLIC DIRECTORY) */}
          {view.type === "customer-gateway" && (
            <motion.div
              key="customer-gateway"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="max-w-md w-full"
            >
              <div className="flex justify-between items-center mb-6 max-w-sm mx-auto">
                <button
                  onClick={() => navigate("home")}
                  className="flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white bg-gray-900/60 px-4 py-1.5 rounded-full border border-gray-800 transition cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  {t("Customer Gateway")}
                </button>

                <LanguageMenu lang={lang} onSelect={(l) => { setLang(l); localStorage.setItem("mbd_lang", l); }} />
              </div>

              {customerLoading ? (
                <div className="bg-luxury-card border border-gray-800 rounded-3xl p-12 text-center shadow-2xl flex flex-col items-center justify-center gap-3">
                  <RefreshCw className="w-8 h-8 animate-spin text-neon-emerald" />
                  <span className="text-xs text-gray-400">{t("Fetching mobile banking directory...")}</span>
                </div>
              ) : !customerMerchant ? (
                <div className="bg-luxury-card border border-gray-800 rounded-3xl p-8 text-center shadow-2xl">
                  <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-4" />
                  <h3 className="font-display font-bold text-lg text-white">{t("Directory Not Found")}</h3>
                  <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                    {t("The requested merchant ID does not exist or has been paused. Please contact support.")}
                  </p>
                </div>
              ) : (
                <div className="bg-luxury-card card-hairline rounded-3xl p-6 shadow-2xl relative pb-20 sm:pb-6 overflow-hidden">
                  <div className="absolute -top-16 -right-16 w-44 h-44 bg-champagne/[0.06] rounded-full blur-3xl pointer-events-none" />
                  <div className="flex flex-col items-center mt-2 mb-6 text-center">
                    {customerMerchant.logoUrl ? (
                      <img
                        src={customerMerchant.logoUrl}
                        alt={`${customerMerchant.companyName} logo`}
                        className="w-20 h-20 object-contain mb-3 rounded-2xl bg-luxury-bg/60 border border-gray-800 p-2"
                      />
                    ) : (
                      <div className="w-14 h-14 bg-champagne/10 border border-champagne/30 rounded-2xl flex items-center justify-center mb-3">
                        {customerMerchant.accountType === "menu" ? (
                          <Utensils className="w-7 h-7 text-champagne" />
                        ) : (
                          <Building className="w-7 h-7 text-champagne" />
                        )}
                      </div>
                    )}
                    <h2 className="font-display font-extrabold text-3xl text-white tracking-tight">
                      {fixMojibake(customerMerchant.companyName)}
                    </h2>
                    <p className="text-xs gold-subtext italic mt-1 max-w-xs">
                      {customerTab === "menu"
                        ? t("Browse dishes, drinks, and calculate your meal bill")
                        : t("Tap a bank to pay instantly via your mobile banking app.")}
                    </p>
                  </div>

                  {/* Gateway Navigation Tabs */}
                  <div className={`grid gap-2 p-1 bg-luxury-bg border border-gray-800 rounded-2xl mb-6 ${customerMerchant.accountType === "menu" ? "grid-cols-2" : "grid-cols-1"}`}>
                    <button
                      onClick={() => setCustomerTab("banking")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        customerTab === "banking"
                          ? "bg-champagne text-luxury-bg font-extrabold shadow-md"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>{t("Payment Directory")}</span>
                    </button>

                    {customerMerchant.accountType === "menu" && (
                    <button
                      onClick={() => setCustomerTab("menu")}
                      className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                        customerTab === "menu"
                          ? "bg-champagne text-luxury-bg font-extrabold shadow-md"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <Utensils className="w-3.5 h-3.5" />
                      <span>{t("Digital Menu")}</span>
                      {customerMenuItems.length > 0 && (
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      )}
                    </button>
                    )}
                  </div>

                  {/* mobile nav removed — centralized to home view */}

                  {/* TAB 1: Banking Options */}
                  {customerTab === "banking" && (
                    <div className="space-y-3">
                      {customerMerchant.profiles.length === 0 ? (
                        <div className="border border-dashed border-gray-800 rounded-2xl p-8 text-center text-gray-500 text-xs">
                          {t("No active bank options configured for this merchant yet.")}
                        </div>
                      ) : (
                        customerMerchant.profiles.map((p) => (
                          <div
                            key={p.id}
                            className="p-4 bg-luxury-bg border border-gray-800/80 hover:border-champagne/50 rounded-2xl flex items-center justify-between gap-4 transition warm-lift group"
                          >
                            <div className="flex items-center gap-3.5 text-left min-w-0">
                              {getBankIcon(p.platform)}
                              <div className="min-w-0">
                                <h4 className="text-xs font-bold text-gray-200 truncate">{p.platform}</h4>
                                <span className="font-mono text-[10px] text-gray-500 mt-0.5 block truncate">{p.maskedAccountNumber}</span>
                              </div>
                            </div>

                            <button
                              onClick={() => handlePayNow(p)}
                              className="px-3.5 py-1.5 bg-champagne/5 border border-champagne/25 hover:border-champagne hover:bg-champagne hover:text-luxury-bg font-sans font-bold text-xs rounded-xl text-champagne flex items-center gap-1 transition cursor-pointer shrink-0"
                            >
                              {t("Pay Now")}
                              <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {/* TAB 2: Digital Menu Display */}
                  {customerTab === "menu" && customerMerchant.accountType === "menu" && (
                    <CustomerDigitalMenu
                      companyName={customerMerchant.companyName}
                      items={customerMenuItems}
                      loading={loadingCustomerMenu}
                      onProceedToPayment={(total) => {
                        setCustomerTab("banking");
                        showToast(`Total Bill: ${total.toLocaleString()} ETB. Select your payment bank below to complete transfer!`, "info");
                      }}
                      t={t}
                    />
                  )}
                </div>
              )}
            </motion.div>
          )}
</AnimatePresence>
      </main>

      {/* Bottom navigation bar — static flex child below the main content card */}
      {view.type === "home" && (
        <nav className="w-full py-4 bg-[#0D0E11] sm:hidden">
          <div className="max-w-md mx-auto px-4 grid grid-cols-2 gap-3">
            <button
              onClick={() => navigate("home")}
              className={`w-full py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                view.type === "home" ? "bg-champagne text-luxury-bg font-extrabold shadow-md" : "text-gray-400 hover:text-white bg-luxury-bg/80"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{t("Payment Directory")}</span>
            </button>

            <button
              onClick={() => navigate("home")}
              className={`w-full py-3 rounded-xl text-sm font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                view.type === "home" ? "bg-champagne text-luxury-bg font-extrabold shadow-md" : "text-gray-400 hover:text-white bg-luxury-bg/80"
              }`}
            >
              <Utensils className="w-4 h-4" />
              <span>{t("Digital Menu")}</span>
            </button>
          </div>
        </nav>
      )}

      {/* FOOTER & CREATOR CREDITS */}
      <Footer
        onOpenTerms={() => setTermsModalOpen(true)}
        onOpenPrivacy={() => setPrivacyModalOpen(true)}
        onOpenDeveloper={() => setDeveloperModalOpen(true)}
        onOpenAbout={() => setAboutModalOpen(true)}
        t={t}
      />

      {/* LEGAL & DEVELOPER LICENCE MODALS */}
      <LegalModals
        termsOpen={termsModalOpen}
        privacyOpen={privacyModalOpen}
        developerOpen={developerModalOpen}
        onCloseTerms={() => setTermsModalOpen(false)}
        onClosePrivacy={() => setPrivacyModalOpen(false)}
        onCloseDeveloper={() => setDeveloperModalOpen(false)}
        t={t}
      />

      {/* Modal: About Section */}
      <AnimatePresence>
        {aboutModalOpen && (
          <PortalModal
            open
            onClose={() => setAboutModalOpen(false)}
            overlayClassName="bg-black/80 backdrop-blur-md"
            cardClassName="max-w-2xl p-6 sm:p-8 max-h-[85vh] overflow-y-auto"
          >
              <button
                onClick={() => setAboutModalOpen(false)}
                className="absolute top-5 right-5 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-2xl bg-neon-emerald/10 border border-neon-emerald/30 flex items-center justify-center text-neon-emerald font-display font-extrabold text-xl">
                  M
                </div>
                <div>
                  <h2 className="font-display font-extrabold text-2xl text-white">
                    {t("Mobile Banking Directory")}
                  </h2>
                  <span className="text-xs text-neon-emerald font-medium">Unified Checkout & Staff Management</span>
                </div>
              </div>

              <div className="space-y-6 text-xs text-gray-300 font-sans leading-relaxed border-t border-gray-800/80 pt-4">
                <p className="text-sm text-gray-200">
                  {t("Tired of display boards filled with 5 different bank accounts? Give customers a unified, modern checkout. Scan a single QR to view and copy your active CBE, Telebirr, or Dashen accounts instantly.")}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-4 bg-luxury-bg border border-gray-800 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-neon-emerald font-bold">
                      <Camera className="w-4 h-4" />
                      <span>AI Camera & Photo Scanning</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Staff can use live camera streams or upload images of bank cards, passbooks, and QR codes to auto-extract details using Gemini AI.
                    </p>
                  </div>

                  <div className="p-4 bg-luxury-bg border border-gray-800 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-neon-emerald font-bold">
                      <QrCode className="w-4 h-4" />
                      <span>Unified Merchant QR Codes</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Generate a single merchant QR code that routes customers to your personalized mobile banking directory.
                    </p>
                  </div>

                  <div className="p-4 bg-luxury-bg border border-gray-800 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-neon-emerald font-bold">
                      <Building className="w-4 h-4" />
                      <span>Staff Portal & Digital Menu</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Staff can log in securely to manage active bank profiles, scan menus, and customize customer options.
                    </p>
                  </div>

                  <div className="p-4 bg-luxury-bg border border-gray-800 rounded-2xl space-y-2">
                    <div className="flex items-center gap-2 text-neon-emerald font-bold">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Security Audit Logging</span>
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Super Admins can audit all merchant provisioning, password updates, and login attempts with immutable event logs.
                    </p>
                  </div>
                </div>

                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <span className="font-bold text-white block text-xs">Ready to try the Staff Portal?</span>
                    <span className="text-[11px] text-gray-400">Log in to manage your merchant banking options and digital menu.</span>
                  </div>
                  <button
                    onClick={() => {
                      setAboutModalOpen(false);
                      navigate("staff-login");
                    }}
                    className="px-4 py-2 bg-champagne text-luxury-bg font-display font-bold rounded-xl hover:opacity-90 transition text-xs shrink-0 cursor-pointer"
                  >
                    Go to Staff Portal
                  </button>
                </div>

                <div className="p-4 bg-luxury-bg border border-gray-800 rounded-2xl space-y-3">
                  <span className="text-xs text-champagne font-bold uppercase tracking-widest">Get in touch</span>
                  <ContactInfo t={t} />
                </div>
              </div>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* --- MODALS --- */}

      {/* Modal: Camera Scan / Image Upload for Bank Details */}
      <AnimatePresence>
        {isBankCameraOpen && (
          <PortalModal
            open
            onClose={() => setIsBankCameraOpen(false)}
            overlayClassName="bg-black/80 backdrop-blur-md"
            cardClassName="max-w-lg"
          >
              {isScanningBankCard ? (
                <div className="py-16 text-center space-y-4">
                  <RefreshCw className="w-10 h-10 animate-spin text-neon-emerald mx-auto" />
                  <p className="text-sm font-bold text-white">Analyzing bank photo with Gemini AI...</p>
                  <p className="text-xs text-gray-400">Extracting platform name and account details automatically.</p>
                </div>
              ) : (
                <CameraUploader
                  onCapture={handleBankAiScan}
                  onClose={() => setIsBankCameraOpen(false)}
                  title="Scan Bank Card, Passbook or QR Code"
                  subtitle="Use live camera stream or upload a screenshot/photo to auto-fill bank option."
                  t={t}
                />
              )}
            </PortalModal>
        )}
      </AnimatePresence>

      {/* Modal: Add Banking Option */}
      <AnimatePresence>
        {isAddBankModalOpen && (
          <PortalModal
            open
            onClose={() => setIsAddBankModalOpen(false)}
            overlayClassName="bg-black/70 backdrop-blur-sm"
            cardClassName="max-w-md"
          >
              <button
                onClick={() => setIsAddBankModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-display font-bold text-lg text-white mb-4">Add Banking Detail</h3>

              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsAddBankModalOpen(false);
                    setIsBankCameraOpen(true);
                  }}
                  className="w-full py-2.5 px-3 bg-emerald-950/30 hover:bg-emerald-900/40 border border-emerald-500/30 text-neon-emerald rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Camera className="w-4 h-4 text-neon-emerald" />
                  <span>Scan Card or QR with Camera / File Upload</span>
                </button>
              </div>

              <form onSubmit={handleAddBankingOption} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Select Mobile Banking Platform</label>
                  <select
                    value={newBankPlatform}
                    onChange={(e) => setNewBankPlatform(e.target.value)}
                    className="w-full bg-luxury-bg border border-gray-800 focus:border-neon-emerald rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition"
                  >
                    <option>Commercial Bank of Ethiopia (CBE)</option>
                    <option>Telebirr Mobile Wallet</option>
                    <option>Dashen Bank (Amole)</option>
                    <option>Awash Bank (Awash Birr)</option>
                    <option>Bank of Abyssinia (BoA)</option>
                    <option>Cooperative Bank of Oromia (Coopay)</option>
                    <option>Hibret Bank (Hila)</option>
                    <option>Wegagen Bank (Efoy)</option>
                    <option>Nib International Bank (Nib Birr)</option>
                    <option>Bunna Bank (Bunna)</option>
                    <option>Zemen Bank (Zemen)</option>
                    <option>Oromia Bank (Oromia)</option>
                    <option>Berhan Bank (Berhan)</option>
                    <option>Abay Bank (Abay)</option>
                    <option>Lion International Bank (Anbesa)</option>
                    <option>Global Bank Ethiopia (Global)</option>
                    <option>Enat Bank (Enat)</option>
                    <option>Other / Custom Platform</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Account Number / Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., 1000231948574, 0911002233"
                    value={newBankAccount}
                    onChange={(e) => setNewBankAccount(e.target.value)}
                    className="w-full bg-luxury-bg border border-gray-800 focus:border-neon-emerald rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Deep Payment Link / App Launch URL (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., telebirr:// or quickpay.com/pay"
                    value={newBankDeepLink}
                    onChange={(e) => setNewBankDeepLink(e.target.value)}
                    className="w-full bg-luxury-bg border border-gray-800 focus:border-neon-emerald rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                  />
                  <span className="text-[9px] text-gray-500 mt-1 block leading-normal">
                    Allows customers to launch mobile app or load transaction automatically if supported.
                  </span>
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="makeActive"
                    checked={newBankIsActive}
                    onChange={(e) => setNewBankIsActive(e.target.checked)}
                    className="w-4 h-4 accent-neon-emerald border-gray-800 rounded bg-luxury-bg"
                  />
                  <label htmlFor="makeActive" className="text-xs text-gray-300">
                    Make this payment profile active and visible immediately
                  </label>
                </div>

                <div className="border-t border-gray-800/80 pt-4">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Business Logo (Optional)</label>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-luxury-bg border border-gray-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                      {newBankLogoBase64 ? (
                        <img src={newBankLogoBase64} alt="Business Logo" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <div className="flex items-center gap-2">
                        <label className="px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-neon-emerald/50 transition text-[10px] font-semibold flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-3 h-3" />
                          {newBankLogoBase64 ? "Replace Logo" : "Upload Logo"}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={handleBankLogoFileChange}
                            className="hidden"
                          />
                        </label>
                        {newBankLogoBase64 && (
                          <button
                            type="button"
                            onClick={() => setNewBankLogoBase64("")}
                            className="px-3 py-1.5 rounded-lg border border-red-500/40 text-red-400 hover:bg-red-950/40 transition text-[10px] font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-500">
                        Becomes your site favicon & brand logo on the customer page.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-6">
                  <button
                    type="button"
                    onClick={() => setIsAddBankModalOpen(false)}
                    className="py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition text-xs font-semibold tracking-wide cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 rounded-xl bg-champagne text-luxury-bg font-display font-bold text-xs tracking-wide hover:opacity-90 neon-glow transition-all cursor-pointer"
                  >
                    Save Details
                  </button>
                </div>
              </form>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* Modal: Provision Merchant Account */}
      <AnimatePresence>
        {isProvisionModalOpen && (
          <PortalModal
            open
            onClose={() => setIsProvisionModalOpen(false)}
            overlayClassName="bg-black/70 backdrop-blur-sm overflow-y-auto py-8"
            cardClassName="max-w-lg p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto"
          >
              <button
                onClick={() => setIsProvisionModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-display font-bold text-lg text-white mb-2">Provision Merchant Account</h3>
              <p className="text-xs text-gray-400 mb-6">Configure business profile, security settings, and staff delegation model.</p>

              <form onSubmit={handleProvisionMerchant} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Business / Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Elegance Café Ltd"
                    value={newMerchantCompany}
                    onChange={(e) => setNewMerchantCompany(e.target.value)}
                    className="w-full bg-luxury-bg border border-gray-800 focus:border-neon-emerald rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Portal Username</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., elegance_admin"
                      value={newMerchantUsername}
                      onChange={(e) => setNewMerchantUsername(e.target.value)}
                      className="w-full bg-luxury-bg border border-gray-800 focus:border-neon-emerald rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Login Password</label>
                    <input
                      type="text"
                      required
                      placeholder="Min 5 characters"
                      value={newMerchantPassword}
                      onChange={(e) => setNewMerchantPassword(e.target.value)}
                      className="w-full bg-luxury-bg border border-gray-800 focus:border-neon-emerald rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                    />
                  </div>
                </div>

                {/* Question 1: Account Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    1. Merchant Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewMerchantAccountType("normal")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        newMerchantAccountType === "normal"
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5" />
                        Normal Account
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Banking directory only</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMerchantAccountType("menu")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        newMerchantAccountType === "menu"
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5" />
                        Menu / Restaurant
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Dishes, tables & QR menu</span>
                    </button>
                  </div>
                </div>

                {/* Question 2: Payment Authenticator Requirement */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    2. Payment Authenticator Requirement
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewMerchantRequiresAuth(true)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        newMerchantRequiresAuth
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Authenticator Required
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Verify transfer proofs with AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMerchantRequiresAuth(false)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        !newMerchantRequiresAuth
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        Authenticator Optional
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Direct copy without scan</span>
                    </button>
                  </div>
                </div>

                {/* Question 3: Staff Sub-Accounts Model */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    3. Staff Account Delegation Model
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewMerchantStaffModel("multi_waiters")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        newMerchantStaffModel === "multi_waiters"
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Multi-Waiters Accounts
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Create separate waiter PIN logins</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMerchantStaffModel("single")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        newMerchantStaffModel === "single"
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Single Main Account
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Only main login used by team</span>
                    </button>
                  </div>
                </div>

                {/* Question 4: Billing Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    4. Account Billing Terms
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewMerchantBilling("permanent")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        newMerchantBilling === "permanent"
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold">Permanent Account</span>
                      <span className="text-[9px] opacity-75 mt-0.5">Active Subscription</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMerchantBilling("temporary")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        newMerchantBilling === "temporary"
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold">Temporary Trial</span>
                      <span className="text-[9px] opacity-75 mt-0.5">Auto-pauses after trial</span>
                    </button>
                  </div>
                </div>

                {/* Question 5: Initial Service Status */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    5. Initial Service Status
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewMerchantServiceStatus("active")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        newMerchantServiceStatus === "active"
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-400">Active Service</span>
                      <span className="text-[9px] opacity-75 mt-0.5">Online immediately</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMerchantServiceStatus("paused")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        newMerchantServiceStatus === "paused"
                          ? "bg-red-950/30 border-red-500 text-red-400"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold text-red-400">Paused Service</span>
                      <span className="text-[9px] opacity-75 mt-0.5">Blocks portal login & public directory</span>
                    </button>
                  </div>
                </div>

                {/* Question 6: App Install Permission */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    6. Allow this merchant to download the platform as a real Android app
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setNewMerchantAppInstall(true)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        newMerchantAppInstall
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        Allowed
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Merchant sees the Download App button</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setNewMerchantAppInstall(false)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        !newMerchantAppInstall
                          ? "bg-red-950/30 border-red-500 text-red-400"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold text-red-400">Denied</span>
                      <span className="text-[9px] opacity-75 mt-0.5">No install option for this merchant</span>
                    </button>
                  </div>
                </div>

                {/* Brand Logo (optional on provisioning) */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Brand Logo (Favicon & Website Brand)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-luxury-bg border border-gray-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                      {newMerchantLogoBase64 ? (
                        <img src={newMerchantLogoBase64} alt="Brand Logo" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-neon-emerald/50 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          {newMerchantLogoBase64 ? "Replace Logo" : "Upload Logo"}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={handleNewLogoFileChange}
                            className="hidden"
                          />
                        </label>
                        {newMerchantLogoBase64 && (
                          <button
                            type="button"
                            onClick={() => setNewMerchantLogoBase64("")}
                            className="px-3 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-950/40 transition text-xs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-500">
                        PNG, JPG, WEBP or SVG. Max 4MB. Used as the site favicon and brand logo on the customer page.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsProvisionModalOpen(false)}
                    className="py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition text-xs font-semibold tracking-wide cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="py-2.5 rounded-xl bg-champagne text-luxury-bg font-display font-bold text-xs tracking-wide hover:opacity-90 neon-glow transition-all cursor-pointer"
                  >
                    Provision Account
                  </button>
                </div>
              </form>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* Modal: Edit Merchant Configuration */}
      <AnimatePresence>
        {editingMerchant && (
          <PortalModal
            open
            onClose={() => setEditingMerchant(null)}
            overlayClassName="bg-black/70 backdrop-blur-sm overflow-y-auto py-8"
            cardClassName="max-w-lg p-6 sm:p-8 my-auto max-h-[90vh] overflow-y-auto"
          >
              <button
                onClick={() => setEditingMerchant(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="font-display font-bold text-lg text-white mb-2">Edit Merchant Configuration</h3>
              <p className="text-xs text-gray-400 mb-6">Update settings for <strong className="text-white">{editingMerchant.companyName}</strong> (ID: {editingMerchant.id})</p>

              <form onSubmit={handleSaveEditedMerchant} className="space-y-4 text-left">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Business / Company Name</label>
                  <input
                    type="text"
                    required
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                    className="w-full bg-luxury-bg border border-gray-800 focus:border-neon-emerald rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">Portal Username</label>
                    <input
                      type="text"
                      required
                      value={editUsername}
                      onChange={(e) => setEditUsername(e.target.value)}
                      className="w-full bg-luxury-bg border border-gray-800 focus:border-neon-emerald rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">New Password (Optional)</label>
                    <input
                      type="text"
                      placeholder="Leave blank to keep unchanged"
                      value={editPassword}
                      onChange={(e) => setEditPassword(e.target.value)}
                      className="w-full bg-luxury-bg border border-gray-800 focus:border-neon-emerald rounded-xl py-2.5 px-3.5 text-xs text-white focus:outline-none transition font-sans"
                    />
                  </div>
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Merchant Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditAccountType("normal")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        editAccountType === "normal"
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Building className="w-3.5 h-3.5" />
                        Normal Account
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Banking directory only</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditAccountType("menu")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        editAccountType === "menu"
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Utensils className="w-3.5 h-3.5" />
                        Menu / Restaurant
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Dishes, tables & QR menu</span>
                    </button>
                  </div>
                </div>

                {/* Payment Authenticator */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Payment Authenticator Verification Requirement
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditRequiresAuth(true)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        editRequiresAuth
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        Authenticator Required
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Verify transfer proofs with AI</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditRequiresAuth(false)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        !editRequiresAuth
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Info className="w-3.5 h-3.5" />
                        Authenticator Optional
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Direct copy without scan</span>
                    </button>
                  </div>
                </div>

                {/* Staff Sub-Accounts Model */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Staff Delegation Model
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditStaffModel("multi_waiters")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        editStaffModel === "multi_waiters"
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5" />
                        Multi-Waiters Sub-Accounts
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Multiple waiter PIN logins</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditStaffModel("single")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        editStaffModel === "single"
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        Single Account Only
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Single shared login</span>
                    </button>
                  </div>
                </div>

                {/* Service Status */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Service Status (Pause or Resume Service)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditServiceStatus("active")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        editServiceStatus === "active"
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-400">Active Service</span>
                      <span className="text-[9px] opacity-75 mt-0.5">Online & functional</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditServiceStatus("paused")}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        editServiceStatus === "paused"
                          ? "bg-red-950/30 border-red-500 text-red-400"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold text-red-400">Paused Service</span>
                      <span className="text-[9px] opacity-75 mt-0.5">Blocks access to account</span>
                    </button>
                  </div>
                </div>

                {/* App Download Permission */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    App Download Permission
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setEditAppInstall(true)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        editAppInstall
                          ? "bg-emerald-950/20 border-neon-emerald text-neon-emerald"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <Download className="w-3.5 h-3.5" />
                        Allowed
                      </span>
                      <span className="text-[9px] opacity-75 mt-0.5">Merchant sees the Download App button</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditAppInstall(false)}
                      className={`p-3 rounded-xl border text-left transition flex flex-col cursor-pointer ${
                        !editAppInstall
                          ? "bg-red-950/30 border-red-500 text-red-400"
                          : "bg-luxury-bg border-gray-800 text-gray-400 hover:bg-gray-800"
                      }`}
                    >
                      <span className="text-xs font-bold text-red-400">Denied</span>
                      <span className="text-[9px] opacity-75 mt-0.5">No install option for this merchant</span>
                    </button>
                  </div>
                </div>

                {/* Brand Logo */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                    Brand Logo (Favicon & Website Brand)
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-luxury-bg border border-gray-800 rounded-xl flex items-center justify-center overflow-hidden shrink-0">
                      {editLogoBase64 ? (
                        <img src={editLogoBase64} alt="Brand Logo" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-6 h-6 text-gray-600" />
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center gap-2">
                        <label className="px-3.5 py-2 rounded-xl bg-gray-900 border border-gray-700 text-gray-200 hover:bg-gray-800 hover:border-neon-emerald/50 transition text-xs font-semibold flex items-center gap-1.5 cursor-pointer">
                          <Upload className="w-3.5 h-3.5" />
                          {editLogoBase64 ? "Replace Logo" : "Upload Logo"}
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp,image/svg+xml"
                            onChange={handleLogoFileChange}
                            className="hidden"
                          />
                        </label>
                        {editLogoBase64 && (
                          <button
                            type="button"
                            onClick={() => setEditLogoBase64("")}
                            className="px-3 py-2 rounded-xl border border-red-500/40 text-red-400 hover:bg-red-950/40 transition text-xs font-semibold cursor-pointer"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-500">
                        PNG, JPG, WEBP or SVG. Max 4MB. Used as the site favicon and brand logo on the customer page.
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-800/80 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      if (editingMerchant) {
                        const m = editingMerchant;
                        setEditingMerchant(null);
                        setDeletingMerchantConfirm({ id: m.id, companyName: m.companyName });
                      }
                    }}
                    className="px-3.5 py-2.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-400 hover:bg-red-900/60 transition text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Account</span>
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingMerchant(null)}
                      className="px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 transition text-xs font-semibold tracking-wide cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-champagne text-luxury-bg font-display font-bold text-xs tracking-wide hover:opacity-90 neon-glow transition-all cursor-pointer"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </form>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* Modal: Delete Merchant Confirmation */}
      <AnimatePresence>
        {deletingMerchantConfirm && (
          <PortalModal
            open
            onClose={() => setDeletingMerchantConfirm(null)}
            overlayClassName="bg-black/80 backdrop-blur-md"
            cardClassName="max-w-md border-red-500/30"
          >
              <button
                onClick={() => setDeletingMerchantConfirm(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-2xl text-red-400">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Delete Merchant Account?</h3>
                  <p className="text-xs text-red-400 font-semibold">Irreversible Platform Action</p>
                </div>
              </div>

              <div className="bg-luxury-bg/80 border border-gray-800 rounded-2xl p-4 text-xs text-gray-300 space-y-2 mb-6">
                <p>
                  Are you sure you want to permanently delete <strong className="text-white">{deletingMerchantConfirm.companyName}</strong> (ID: <code className="text-neon-emerald">{deletingMerchantConfirm.id}</code>)?
                </p>
                <p className="text-gray-400 text-[11px] leading-relaxed">
                  This will cascade-delete all associated payment profiles, waitstaff sub-accounts, digital menu items, and scan logs.
                </p>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingMerchantConfirm(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteMerchant(deletingMerchantConfirm.id, deletingMerchantConfirm.companyName)}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs shadow-lg transition cursor-pointer"
                >
                  Delete Account
                </button>
              </div>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* Modal: Delete Payment Profile Confirmation */}
      <AnimatePresence>
        {deletingProfileConfirm && (
          <PortalModal
            open
            onClose={() => setDeletingProfileConfirm(null)}
            overlayClassName="bg-black/80 backdrop-blur-md"
            cardClassName="max-w-md border-red-500/30"
          >
              <button
                onClick={() => setDeletingProfileConfirm(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="p-3 bg-red-950/40 border border-red-500/40 rounded-2xl text-red-400">
                  <Trash2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-lg text-white">Delete Payment Option?</h3>
                  <p className="text-xs text-red-400 font-semibold">Remove Bank / Wallet Option</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 mb-6 bg-luxury-bg/80 border border-gray-800 rounded-2xl p-4">
                Are you sure you want to delete <strong className="text-white">{deletingProfileConfirm.platform}</strong>? Customers will no longer see this account when scanning your QR code.
              </p>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setDeletingProfileConfirm(null)}
                  className="px-4 py-2.5 rounded-xl border border-gray-800 text-gray-400 hover:text-white hover:bg-gray-800 text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteProfile(deletingProfileConfirm.id)}
                  className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-display font-bold text-xs shadow-lg transition cursor-pointer"
                >
                  Delete Payment Option
                </button>
              </div>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* Modal: Audit Log Details with Cryptographic Password Differences */}
      <AnimatePresence>
        {selectedLog && (
          <PortalModal
            open
            onClose={() => setSelectedLog(null)}
            overlayClassName="bg-black/70 backdrop-blur-sm"
            cardClassName="max-w-lg"
          >
              <button
                onClick={() => setSelectedLog(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-2 bg-neon-emerald/10 border border-neon-emerald/20 rounded-xl">
                  <Activity className="w-5 h-5 text-neon-emerald" />
                </div>
                <h3 className="font-display font-bold text-lg text-white">Security Audit Log Details</h3>
              </div>

              <div className="space-y-4 text-sm font-sans">
                <div className="grid grid-cols-3 border-b border-gray-800/60 pb-3">
                  <span className="text-gray-400 font-medium">Timestamp</span>
                  <span className="col-span-2 text-gray-200">
                    {new Date(selectedLog.timestamp).toLocaleDateString()}, {new Date(selectedLog.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div className="grid grid-cols-3 border-b border-gray-800/60 pb-3">
                  <span className="text-gray-400 font-medium">Actor Username</span>
                  <span className="col-span-2 text-gray-200 font-bold">
                    {selectedLog.userId}
                  </span>
                </div>

                <div className="grid grid-cols-3 border-b border-gray-800/60 pb-3">
                  <span className="text-gray-400 font-medium">Actor User ID</span>
                  <span className="col-span-2 text-gray-200 font-mono text-xs">
                    {selectedLog.userDisplay}
                  </span>
                </div>

                <div className="grid grid-cols-3 border-b border-gray-800/60 pb-3">
                  <span className="text-gray-400 font-medium">Action Type</span>
                  <span className="col-span-2">
                    <span className="px-2 py-0.5 bg-champagne/10 text-champagne border border-champagne/25 text-[10px] font-bold rounded uppercase">
                                          {selectedLog.action}
                    </span>
                  </span>
                </div>

                <div className="space-y-2 pt-1">
                  <span className="text-gray-400 font-medium block">Event Description / Payload Details</span>
                  <div className="p-4 bg-luxury-bg border border-gray-800 rounded-2xl text-xs font-mono text-gray-300 leading-relaxed overflow-x-auto">
                    {selectedLog.details}
                  </div>
                </div>

                {/* Password Diff UI if available in payload */}
                {selectedLog.payload && selectedLog.payload.before && (
                  <div className="space-y-2 pt-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">Visual State Difference</span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-red-950/20 border border-red-500/20 rounded-xl">
                        <span className="text-[9px] uppercase font-bold text-red-400 block mb-1">Previous Password</span>
                        <span className="text-xs font-mono text-red-300">{selectedLog.payload.before}</span>
                      </div>
                      <div className="p-3 bg-emerald-950/20 border border-emerald-500/20 rounded-xl">
                        <span className="text-[9px] uppercase font-bold text-neon-emerald block mb-1">New Password</span>
                        <span className="text-xs font-mono text-neon-emerald">{selectedLog.payload.after}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end pt-6 mt-4">
                <button
                  onClick={() => setSelectedLog(null)}
                  className="px-5 py-2.5 bg-champagne text-luxury-bg font-display font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer"
                >
                  Close Details
                </button>
              </div>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* Modal: Payment Profile Details (Copy and App Launch) */}
      <AnimatePresence>
        {paymentDetailModalOpen && selectedProfile && (
          <PortalModal
            open
            onClose={() => setPaymentDetailModalOpen(false)}
            overlayClassName="bg-black/75 backdrop-blur-md"
            cardClassName="max-w-sm"
          >
              <button
                onClick={() => setPaymentDetailModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex flex-col items-center text-center mt-2 mb-6">
                {getBankIcon(selectedProfile.platform)}
                <h3 className="font-display font-extrabold text-xl text-white mt-3">
                  {selectedProfile.platform}
                </h3>
                <p className="text-xs text-gray-400 mt-1">
                  {t("Payment Details")}
                </p>
              </div>

              <div className="space-y-4 font-sans">
                <div className="bg-luxury-bg border border-champagne/15 rounded-2xl p-4 flex flex-col items-center justify-center relative overflow-hidden group">
                                  <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 mb-1.5 block">
                    {t("ACCOUNT NUMBER")}
                  </span>
                  
                  {isFetchingUnmaskedAccount ? (
                    <div className="flex items-center gap-2 py-2">
                      <RefreshCw className="w-4 h-4 text-neon-emerald animate-spin" />
                      <span className="text-xs font-mono text-gray-400">Decrypting secure token...</span>
                    </div>
                  ) : (
                    <div 
                      onClick={async () => {
                        if (!unmaskedAccount) {
                          showToast(t("Account number not loaded yet - try again"), "error");
                          return;
                        }
                        const ok = await copyToClipboard(unmaskedAccount);
                        if (ok) {
                          showToast(t("Copied!"), "success");
                        } else {
                          const el = document.getElementById("payment-account-number");
                          if (el) {
                            const range = document.createRange();
                            range.selectNodeContents(el);
                            const sel = window.getSelection();
                            sel?.removeAllRanges();
                            sel?.addRange(range);
                          }
                          showToast(t("Copy blocked - number selected, use the copy menu"), "error");
                        }
                      }}
                      className="cursor-pointer group-hover:scale-105 transition-all text-center"
                    >
                      <span id="payment-account-number" className="text-xl font-mono font-bold text-white tracking-wider block break-all">
                          {unmaskedAccount}
                        </span>
                        <span className="text-[10px] text-champagne/80 font-medium mt-1.5 flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Copy className="w-3 h-3" />
                        {t("Tap the number or button to copy")}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={async () => {
                      if (!unmaskedAccount) {
                        showToast(t("Account number not loaded yet - try again"), "error");
                        return;
                      }
                      const ok = await copyToClipboard(unmaskedAccount);
                      if (ok) {
                        showToast(`${selectedProfile.platform} ${t("Copied!")}`, "success");
                      } else {
                        const el = document.getElementById("payment-account-number");
                        if (el) {
                          const range = document.createRange();
                          range.selectNodeContents(el);
                          const sel = window.getSelection();
                          sel?.removeAllRanges();
                          sel?.addRange(range);
                        }
                        showToast(t("Copy blocked - number selected, use the copy menu"), "error");
                      }
                    }}
                    disabled={isFetchingUnmaskedAccount}
                    className="w-full py-3 bg-champagne text-luxury-bg font-display font-bold text-xs rounded-xl flex items-center justify-center gap-2 hover:opacity-95 transition cursor-pointer disabled:opacity-50"
                  >
                    <Copy className="w-4 h-4" />
                    {t("Copy Account Number")}
                  </button>

                  {selectedProfile.deepLink && (
                    <button
                      type="button"
                      onClick={() => {
                        showToast(`Launching ${selectedProfile.platform}...`, "info");
                        window.location.href = selectedProfile.deepLink!;
                      }}
                      className="w-full py-3 bg-luxury-bg hover:bg-gray-800/80 border border-gray-800 text-white font-display font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t("Open Pay Link / App")}
                    </button>
                  )}

                  <button
                    onClick={() => setPaymentDetailModalOpen(false)}
                    className="w-full py-2 text-xs text-gray-400 hover:text-white transition mt-1 cursor-pointer"
                  >
                    {t("Close")}
                  </button>
                </div>
              </div>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* First-Time Sign In Terms & Privacy Agreement Modal */}
      {termsAcceptedModalOpen && (
        <PortalModal
          open
          onClose={() => setTermsAcceptedModalOpen(false)}
          overlayClassName="bg-black/85 backdrop-blur-md"
          cardClassName="max-w-lg p-6 sm:p-8 border-neon-emerald/40"
        >
          <div className="space-y-6">
            <div className="flex items-center gap-3 border-b border-gray-800 pb-4">
              <div className="p-3 bg-neon-emerald/10 border border-neon-emerald/30 rounded-2xl text-neon-emerald">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-lg text-white">Merchant Terms & Privacy Agreement</h3>
                <p className="text-xs text-gray-400">Required before accessing your directory & restaurant portal</p>
              </div>
            </div>

            <div className="space-y-4 text-xs text-gray-300 max-h-60 overflow-y-auto pr-2 custom-scrollbar bg-luxury-bg p-4 rounded-2xl border border-gray-800">
              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-xs">1. Payment Directory & Account Accuracy</h4>
                <p className="text-gray-400">
                  By operating on the Ethiopian Mobile Banking Directory, you affirm that all registered bank accounts, mobile wallets (CBE, Telebirr, Dashen, Awash, Bank of Abyssinia, Coop), and payment profiles strictly belong to your authorized business entity.
                </p>
              </div>

              <div className="space-y-1.5">
                <h4 className="font-bold text-white text-xs">2. Automated AI Fraud Scans & Data Privacy</h4>
                <p className="text-gray-400">
                  You consent to real-time image scanning and Gemini AI verification for customer bill payments. Scanned receipt images, timestamps, and waiter verification logs are stored securely for merchant fraud protection and super admin compliance.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsCheck1}
                  onChange={(e) => setTermsCheck1(e.target.checked)}
                  className="mt-0.5 accent-emerald-500 w-4 h-4 rounded"
                />
                <span className="text-xs text-gray-300 font-semibold">
                  I agree to the <strong className="text-neon-emerald">Merchant Terms & Conditions</strong> and guarantee account authenticity.
                </span>
              </label>

              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsCheck2}
                  onChange={(e) => setTermsCheck2(e.target.checked)}
                  className="mt-0.5 accent-emerald-500 w-4 h-4 rounded"
                />
                <span className="text-xs text-gray-300 font-semibold">
                  I consent to the <strong className="text-neon-emerald">Privacy Policy</strong> and AI security transaction auditing.
                </span>
              </label>
            </div>

            <button
              onClick={() => {
                if (!termsCheck1 || !termsCheck2) {
                  showToast("Please accept both agreements to proceed", "error");
                  return;
                }
                if (auth.user) {
                  localStorage.setItem(`mbd_terms_accepted_${auth.user.id}`, "true");
                }
                setTermsAcceptedModalOpen(false);
                showToast("Terms of Service & Privacy Policy accepted!", "success");
              }}
              className={`w-full py-3.5 rounded-2xl font-display font-bold text-xs uppercase tracking-wider transition cursor-pointer ${
                termsCheck1 && termsCheck2
                  ? "bg-champagne text-luxury-bg hover:opacity-90 shadow-lg"
                  : "bg-gray-800 text-gray-500 cursor-not-allowed"
              }`}
            >
              Agree & Continue to Dashboard
            </button>
          </div>
        </PortalModal>
      )}

      {/* Admin Full Scan Image Viewer Modal */}
      {selectedAdminScan && (
        <PortalModal
          open
          onClose={() => setSelectedAdminScan(null)}
          overlayClassName="bg-black/90 backdrop-blur-md"
          cardClassName="max-w-xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <h3 className="font-bold text-sm text-white">
                Scanned Bill Receipt — {selectedAdminScan.merchantName}
              </h3>
              <button
                onClick={() => setSelectedAdminScan(null)}
                className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-gray-800 transition cursor-pointer"
                              >
                ✕
              </button>
            </div>
            {selectedAdminScan.imageUrl && (
              <img
                src={selectedAdminScan.imageUrl}
                alt="Scanned Bill"
                className="w-full max-h-[70vh] object-contain rounded-2xl border border-gray-800"
              />
            )}
            <div className="text-xs text-gray-400 space-y-1">
              <p><strong>Waiter:</strong> {selectedAdminScan.staffName} ({selectedAdminScan.tableNumber || "Table 9"})</p>
              <p><strong>AI Verdict:</strong> {sanitizeInput(selectedAdminScan.notes)}</p>
            </div>
            {selectedAdminScan.verificationCaveat && (
              <div className="text-xs text-amber-300 bg-amber-950/20 border border-amber-500/25 rounded-xl p-3 leading-relaxed">
                <strong className="block mb-1">⚠️ Why AI Is Not 100% Certain</strong>
                {selectedAdminScan.verificationCaveat}
              </div>
            )}
          </div>
        </PortalModal>
      )}

    </div>
  );
}

