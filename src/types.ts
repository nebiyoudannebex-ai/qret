export interface Merchant {
  id: string;
  companyName: string;
  username: string;
  billingType: "permanent" | "temporary";
  accountType?: "normal" | "menu";
  requiresPaymentAuthenticator?: boolean;
  staffAccountModel?: "single" | "multi_waiters";
  serviceStatus?: "active" | "paused";
  logoBase64?: string;
  appInstallEnabled?: boolean;
  createdAt: string;
  profileCount?: number;
  menuCount?: number;
}

export interface PaymentProfile {
  id: string;
  platform: string;
  accountNumber?: string;
  maskedAccountNumber: string;
  deepLink: string;
  isActive: boolean;
  createdAt?: string;
}

export interface MenuItem {
  id: string;
  merchantId?: string;
  name: string;
  title_en?: string;
  title_local?: string;
  category: string;
  price: number;
  description?: string;
  is_vegan?: boolean;
  imageUrl?: string;
  imageSource?: "cropped_photo" | "fallback_search" | "custom";
  cropBoundingBox?: {
    ymin: number;
    xmin: number;
    ymax: number;
    xmax: number;
  };
  fallbackSearchQuery?: string;
  isAvailable: boolean;
  createdAt?: string;
}

export interface TableCopyEvent {
  id: string;
  merchantId: string;
  tableNumber: string;
  bankName: string;
  accountNumber: string;
  timestamp: string;
}

export interface StaffAccount {
  id: string;
  merchantId: string;
  name: string;
  username: string;
  password?: string;
  assignedTable?: string;
  assignedTables?: string[];
  createdAt: string;
}

export interface ReceiptScan {
  id: string;
  merchantId: string;
  merchantName?: string;
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

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userDisplay: string;
  action: "login_success" | "login_failed" | "merchant_create" | "merchant_delete" | "profile_create" | "profile_update" | "profile_delete" | "password_change" | "logout" | "system_init" | "menu_update";
  details: string;
  payload?: {
    before?: string;
    after?: string;
    [key: string]: any;
  };
}

export interface AuthState {
  token: string | null;
  user: {
    id: string;
    username: string;
    companyName: string;
    role: "admin" | "merchant" | "waiter";
    merchantId?: string;
    assignedTable?: string;
    billingType?: "permanent" | "temporary";
    accountType?: "normal" | "menu";
    requiresPaymentAuthenticator?: boolean;
    staffAccountModel?: "single" | "multi_waiters";
    serviceStatus?: "active" | "paused";
    logoBase64?: string;
    appInstallEnabled?: boolean;
  } | null;
}

