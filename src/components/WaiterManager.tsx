import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  UserCheck,
  Plus,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  RefreshCw,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  FileText,
  DollarSign,
  User,
  Key,
  X,
  Sparkles,
  Camera
} from "lucide-react";
import { StaffAccount, ReceiptScan } from "../types";
import { sanitizeInput } from "../lib/sanitize";
import { PortalModal } from "./PortalModal";

interface WaiterManagerProps {
  merchantId: string;
  companyName: string;
  t: (key: string) => string;
  showToast: (msg: string, type?: "success" | "error" | "info") => void;
}

export const WaiterManager: React.FC<WaiterManagerProps> = ({
  merchantId,
  companyName,
  t,
  showToast
}) => {
  const [activeTab, setActiveTab] = useState<"staff" | "receipts">("staff");

  // Staff accounts state
  const [staffList, setStaffList] = useState<StaffAccount[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(false);
  const [isAddStaffModalOpen, setIsAddStaffModalOpen] = useState(false);
  const [staffName, setStaffName] = useState("");
  const [staffUsername, setStaffUsername] = useState("");
  const [staffPassword, setStaffPassword] = useState("");
  const [staffAssignedTable, setStaffAssignedTable] = useState("Table 9");
  const [savingStaff, setSavingStaff] = useState(false);

  // Scanned receipts state
  const [receiptsList, setReceiptsList] = useState<ReceiptScan[]>([]);
  const [loadingReceipts, setLoadingReceipts] = useState(false);
  const [receiptFilter, setReceiptFilter] = useState<"all" | "verified" | "suspicious">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptScan | null>(null);

  // Delete confirm modal states
  const [deletingStaffConfirm, setDeletingStaffConfirm] = useState<{ id: string; name: string } | null>(null);
  const [deletingReceiptConfirm, setDeletingReceiptConfirm] = useState<string | null>(null);

  // Fetch waiter staff accounts
  const fetchStaffAccounts = async () => {
    setLoadingStaff(true);
    try {
      const res = await fetch("/api/merchant/staff");
      if (res.ok) {
        const data = await res.json();
        setStaffList(data);
      }
    } catch (err) {
      showToast("Failed to fetch staff accounts", "error");
    } finally {
      setLoadingStaff(false);
    }
  };

  // Fetch scanned receipts
  const fetchReceiptScans = async () => {
    setLoadingReceipts(true);
    try {
      const res = await fetch("/api/merchant/receipt-scans");
      if (res.ok) {
        const data = await res.json();
        setReceiptsList(data);
      }
    } catch (err) {
      showToast("Failed to fetch scanned bill receipts", "error");
    } finally {
      setLoadingReceipts(false);
    }
  };

  useEffect(() => {
    fetchStaffAccounts();
    fetchReceiptScans();
  }, []);

  // Submit new staff account
  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffUsername.trim() || !staffPassword.trim()) {
      showToast("Name, username, and password are required", "error");
      return;
    }

    setSavingStaff(true);
    try {
      const res = await fetch("/api/merchant/staff", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: staffName.trim(),
          username: staffUsername.trim().toLowerCase(),
          password: staffPassword,
          assignedTable: staffAssignedTable.trim() || "All Tables"
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to create waiter scanning account");
      }

      showToast(`Created scanning account for waiter "${data.name}"`, "success");
      setIsAddStaffModalOpen(false);
      setStaffName("");
      setStaffUsername("");
      setStaffPassword("");
      fetchStaffAccounts();
    } catch (err: any) {
      showToast(err.message || "Failed to create waiter account", "error");
    } finally {
      setSavingStaff(false);
    }
  };

  // Delete staff account
  const handleDeleteStaff = async (staffId: string, name: string) => {
    try {
      const res = await fetch(`/api/merchant/staff/${staffId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast(`Deleted waiter account "${name}"`, "info");
        setDeletingStaffConfirm(null);
        fetchStaffAccounts();
      }
    } catch (e) {
      showToast("Failed to delete waiter account", "error");
    }
  };

  // Delete scanned receipt record
  const handleDeleteReceipt = async (scanId: string) => {
    try {
      const res = await fetch(`/api/merchant/receipt-scans/${scanId}`, {
        method: "DELETE"
      });
      if (res.ok) {
        showToast("Deleted scanned bill record", "info");
        setDeletingReceiptConfirm(null);
        fetchReceiptScans();
        if (selectedReceipt?.id === scanId) setSelectedReceipt(null);
      }
    } catch (e) {
      showToast("Failed to delete receipt scan", "error");
    }
  };

  // Metrics
  const totalScanned = receiptsList.length;
  const verifiedList = receiptsList.filter((r) => r.status === "verified");
  const suspiciousList = receiptsList.filter((r) => r.status === "suspicious" || r.status === "failed");
  const verifiedTotalVolume = verifiedList.reduce((sum, r) => sum + (r.amount || 0), 0);

  // Filtered Receipts
  const filteredReceipts = receiptsList.filter((r) => {
    const matchesFilter = receiptFilter === "all" || r.status === receiptFilter;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      (r.staffName && r.staffName.toLowerCase().includes(q)) ||
      (r.bankName && r.bankName.toLowerCase().includes(q)) ||
      (r.referenceNumber && r.referenceNumber.toLowerCase().includes(q)) ||
      (r.tableNumber && r.tableNumber.toLowerCase().includes(q)) ||
      (r.senderName && r.senderName.toLowerCase().includes(q));
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="bg-luxury-card card-hairline rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute -top-14 -left-14 w-40 h-40 bg-champagne/[0.05] rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 bg-champagne/10 border border-champagne/30 rounded-xl">
                <UserCheck className="w-5 h-5 text-champagne" />
              </div>
              <h2 className="font-display font-extrabold text-2xl text-white">
                Waitstaff Accounts & Paid Bill Verification
              </h2>
            </div>
            <p className="text-xs text-gray-400 mt-1">
              Create waiter scanning accounts. Waiters scan customer payment receipts on their phone, and Gemini AI automatically verifies if the bill is legit!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab("staff")}
              className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition cursor-pointer ${
                activeTab === "staff"
                  ? "bg-champagne text-luxury-bg shadow-md"
                  : "bg-luxury-bg border border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Waitstaff Accounts ({staffList.length})
            </button>
            <button
              onClick={() => setActiveTab("receipts")}
              className={`px-4 py-2 rounded-xl text-xs font-display font-bold transition cursor-pointer ${
                activeTab === "receipts"
                  ? "bg-champagne text-luxury-bg shadow-md"
                  : "bg-luxury-bg border border-gray-800 text-gray-400 hover:text-white"
              }`}
            >
              Scanned Bills ({receiptsList.length})
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-luxury-card border border-gray-800 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-gray-400 uppercase block">Total Bills Scanned</span>
            <span className="text-2xl font-mono font-extrabold text-white mt-1 block">{totalScanned}</span>
          </div>
          <div className="p-3 bg-luxury-bg border border-gray-800 rounded-xl text-gray-400">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-luxury-card border border-emerald-500/20 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-emerald-400 uppercase block">Verified Volume (ETB)</span>
            <span className="text-2xl font-mono font-extrabold text-champagne mt-1 block">
              {verifiedTotalVolume.toLocaleString()} ETB
            </span>
          </div>
          <div className="p-3 bg-emerald-950/40 border border-neon-emerald/30 rounded-xl text-neon-emerald">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-luxury-card border border-terracotta/25 rounded-2xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-mono text-terracotta uppercase block">Suspicious / Flagged</span>
            <span className="text-2xl font-mono font-extrabold text-terracotta mt-1 block">
              {suspiciousList.length}
            </span>
          </div>
          <div className="p-3 bg-terracotta/10 border border-terracotta/30 rounded-xl text-terracotta">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* TAB 1: WAITSTAFF ACCOUNTS MANAGEMENT */}
      {activeTab === "staff" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display font-extrabold text-base text-white">
              Active Waiter Scanning Accounts
            </h3>
            <button
              onClick={() => setIsAddStaffModalOpen(true)}
              className="px-4 py-2 bg-champagne text-luxury-bg font-display font-bold text-xs rounded-xl flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Waiter Account</span>
            </button>
          </div>

          {loadingStaff ? (
            <div className="p-12 text-center text-gray-500 bg-luxury-card border border-gray-800 rounded-2xl">
              <RefreshCw className="w-6 h-6 text-neon-emerald animate-spin mx-auto mb-2" />
              <p className="text-xs">Loading waitstaff accounts...</p>
            </div>
          ) : staffList.length === 0 ? (
            <div className="p-12 text-center bg-luxury-card border border-gray-800 rounded-3xl space-y-3">
              <UserCheck className="w-10 h-10 text-gray-600 mx-auto" />
              <h4 className="text-sm font-bold text-gray-300">No Waiter Scanning Accounts Created Yet</h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto">
                Create accounts for your waiters (e.g. Table 9 waiter). Waiters use these login credentials to sign into the Staff Portal and scan customer payment bills.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {staffList.map((staff) => (
                <div
                  key={staff.id}
                  className="bg-luxury-card border border-gray-800 rounded-2xl p-5 space-y-3 relative hover:border-gray-700 transition"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="px-2 py-0.5 bg-emerald-950/50 border border-neon-emerald/30 text-neon-emerald text-[10px] font-mono rounded">
                        {staff.assignedTable || "All Tables"}
                      </span>
                      <h4 className="font-display font-bold text-base text-white mt-1.5">
                        {staff.name}
                      </h4>
                      <p className="text-xs font-mono text-gray-400">
                        @{staff.username}
                      </p>
                    </div>

                    <button
                      onClick={() => setDeletingStaffConfirm({ id: staff.id, name: staff.name })}
                      className="p-1.5 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition cursor-pointer"
                      title="Delete waiter account"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-gray-800/80 flex items-center justify-between text-[11px] text-gray-400">
                    <span>Role: Waiter Scanner</span>
                    <span className="text-[10px] text-gray-500">
                      Created: {new Date(staff.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: SCANNED BILLS & AI LEGITIMACY RECORDS */}
      {activeTab === "receipts" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search waiter, bank, ref #, or table..."
                className="w-full bg-luxury-card border border-gray-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-neon-emerald"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setReceiptFilter("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  receiptFilter === "all" ? "bg-champagne text-luxury-bg font-bold" : "bg-luxury-card border border-gray-800 text-gray-400"
                }`}
              >
                All ({receiptsList.length})
              </button>
              <button
                onClick={() => setReceiptFilter("verified")}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition cursor-pointer ${
                  receiptFilter === "verified" ? "bg-emerald-600 text-white font-bold" : "bg-luxury-card border border-gray-800 text-emerald-400"
                }`}
              >
                Verified ({verifiedList.length})
              </button>
              <button
                onClick={() => setReceiptFilter("suspicious")}
                className={`px-3.5 py-1.5 rounded-xl text-[10px] font-bold flex items-center gap-1.5 transition cursor-pointer whitespace-nowrap ${
                  receiptFilter === "suspicious" ? "bg-terracotta text-white font-bold" : "bg-luxury-card border border-gray-800 text-terracotta"
                }`}
              >
                Suspicious ({suspiciousList.length})
              </button>
            </div>
          </div>

          {loadingReceipts ? (
            <div className="p-12 text-center text-gray-500 bg-luxury-card border border-gray-800 rounded-2xl">
              <RefreshCw className="w-6 h-6 text-neon-emerald animate-spin mx-auto mb-2" />
              <p className="text-xs">Loading scanned bills...</p>
            </div>
          ) : filteredReceipts.length === 0 ? (
            <div className="p-12 text-center bg-luxury-card border border-gray-800 rounded-3xl space-y-3">
              <FileText className="w-10 h-10 text-gray-600 mx-auto" />
              <h4 className="text-sm font-bold text-gray-300">No Scanned Bills Found</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                When waiters scan paid bills using the Waiter Portal, all verified and flagged receipts save directly to your merchant account.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredReceipts.map((scan) => (
                <motion.div
                  layout
                  key={scan.id}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: "spring", stiffness: 520, damping: 30, mass: 0.6 }}
                  className={`bg-luxury-card border rounded-2xl p-5 space-y-3 relative flex flex-col justify-between transition ${
                    scan.status === "verified"
                      ? "border-emerald-500/30 hover:border-emerald-500/60"
                      : "border-terracotta/40 bg-terracotta/[0.05] hover:border-terracotta/80"
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <span className="px-2.5 py-0.5 bg-luxury-bg border border-gray-800 text-gray-300 font-mono font-bold text-[10px] rounded-md">
                        {scan.tableNumber || "Table"}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 font-bold text-[10px] rounded-md flex items-center gap-1 ${
                          scan.status === "verified"
                            ? "bg-emerald-950/60 border border-neon-emerald/40 text-neon-emerald"
                            : "bg-terracotta/10 border border-terracotta/40 text-terracotta"
                        }`}
                      >
                        {scan.status === "verified" ? (
                          <>
                            <CheckCircle2 className="w-3 h-3" />
                            <span>VERIFIED LEGIT</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3" />
                            <span>SUSPICIOUS</span>
                          </>
                        )}
                      </span>
                    </div>

                    <div className="mt-3">
                      <span className="text-[10px] font-mono text-gray-400 uppercase block">Amount Paid</span>
                      <span className="text-xl font-mono font-extrabold text-champagne">
                        {scan.amount ? `${scan.amount.toLocaleString()} ETB` : "Amount N/A"}
                      </span>
                    </div>

                    <div className="mt-2 space-y-1 text-xs text-gray-300">
                      <p><strong className="text-gray-400">Platform:</strong> {scan.bankName}</p>
                      <p><strong className="text-gray-400">Ref #:</strong> <span className="font-mono text-amber-300">{scan.referenceNumber}</span></p>
                      <p><strong className="text-gray-400">Payer:</strong> {scan.senderName}</p>
                      <p><strong className="text-gray-400">Waiter:</strong> {scan.staffName}</p>
                    </div>

                    {scan.notes && (
                      <p className="mt-2 text-[11px] text-gray-400 bg-luxury-bg/70 p-2 rounded-xl border border-gray-800 leading-snug">
                        {sanitizeInput(scan.notes)}
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-800/80 flex items-center justify-between text-[10px] text-gray-500">
                    <span>{new Date(scan.timestamp).toLocaleString()}</span>
                    <div className="flex items-center gap-2">
                      {scan.imageUrl && (
                        <button
                          onClick={() => setSelectedReceipt(scan)}
                          className="px-2.5 py-1 bg-luxury-bg hover:bg-gray-800 border border-gray-800 text-gray-300 hover:text-white rounded-lg transition cursor-pointer flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>View Photo</span>
                        </button>
                      )}
                      <button
                        onClick={() => setDeletingReceiptConfirm(scan.id)}
                        className="p-1 text-gray-500 hover:text-red-400 hover:bg-gray-800 rounded-lg transition cursor-pointer"
                        title="Delete receipt record"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal: Create Waiter Scanning Account */}
      <AnimatePresence>
        {isAddStaffModalOpen && (
          <PortalModal
            open
            onClose={() => setIsAddStaffModalOpen(false)}
            overlayClassName="bg-black/80 backdrop-blur-md"
            cardClassName="max-w-md"
          >
              <button
                onClick={() => setIsAddStaffModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2.5 mb-6">
                <div className="p-2 bg-neon-emerald/10 border border-neon-emerald/20 rounded-xl">
                  <UserCheck className="w-5 h-5 text-neon-emerald" />
                </div>
                <h3 className="font-display font-extrabold text-lg text-white">
                  Create Waiter Account
                </h3>
              </div>

              <form onSubmit={handleCreateStaff} className="space-y-4 text-xs font-sans">
                <div>
                  <label className="block text-gray-400 font-medium mb-1.5">
                    Waiter Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={staffName}
                    onChange={(e) => setStaffName(e.target.value)}
                    placeholder="e.g. Abebe Bekele"
                    className="w-full bg-luxury-bg border border-gray-800 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-emerald transition"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-400 font-medium mb-1.5">
                      Username *
                    </label>
                    <input
                      type="text"
                      required
                      value={staffUsername}
                      onChange={(e) => setStaffUsername(e.target.value)}
                      placeholder="e.g. waiter9"
                      className="w-full bg-luxury-bg border border-gray-800 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-emerald transition font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-gray-400 font-medium mb-1.5">
                      Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={staffPassword}
                      onChange={(e) => setStaffPassword(e.target.value)}
                      placeholder="e.g. 12345"
                      className="w-full bg-luxury-bg border border-gray-800 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-emerald transition font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-400 font-medium mb-1.5">
                    Assigned Table / Section
                  </label>
                  <input
                    type="text"
                    value={staffAssignedTable}
                    onChange={(e) => setStaffAssignedTable(e.target.value)}
                    placeholder="e.g. Table 9 or Section A"
                    className="w-full bg-luxury-bg border border-gray-800 rounded-xl p-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-emerald transition"
                  />
                </div>

                <div className="pt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddStaffModalOpen(false)}
                    className="px-4 py-2.5 text-gray-400 hover:text-white cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={savingStaff}
                    className="px-6 py-2.5 bg-champagne text-luxury-bg font-display font-bold text-xs rounded-xl hover:opacity-90 transition cursor-pointer disabled:opacity-50"
                  >
                    {savingStaff ? "Creating..." : "Create Account"}
                  </button>
                </div>
              </form>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* Modal: View Scanned Receipt Photo */}
      <AnimatePresence>
        {selectedReceipt && selectedReceipt.imageUrl && (
          <PortalModal
            open
            onClose={() => setSelectedReceipt(null)}
            overlayClassName="bg-black/80 backdrop-blur-md"
            cardClassName="max-w-lg space-y-4 max-h-[90vh] overflow-y-auto"
          >
              <button
                onClick={() => setSelectedReceipt(null)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-emerald-950/50 border border-neon-emerald/30 text-neon-emerald font-bold text-xs rounded-lg font-mono">
                  {selectedReceipt.tableNumber || "Table"}
                </span>
                <h3 className="font-display font-bold text-base text-white">
                  Scanned Bill Receipt Photo
                </h3>
              </div>

              <div className="bg-luxury-bg border border-gray-800 p-2 rounded-2xl">
                <img
                  src={selectedReceipt.imageUrl}
                  alt="Scanned Bill"
                  className="max-h-80 mx-auto rounded-xl object-contain border border-gray-800"
                />
              </div>

              <div className="p-3 bg-luxury-bg border border-gray-800 rounded-xl space-y-1 text-xs">
                <p><strong className="text-gray-400">Status:</strong> <span className={selectedReceipt.status === "verified" ? "text-neon-emerald font-bold" : "text-terracotta font-bold"}>{selectedReceipt.status.toUpperCase()}</span></p>
                <p><strong className="text-gray-400">Legitimacy:</strong> <span className="font-bold text-gray-200">{selectedReceipt.confidenceScore != null ? `${selectedReceipt.confidenceScore}%` : "N/A"}</span></p>
                <p><strong className="text-gray-400">Bank:</strong> {selectedReceipt.bankName}</p>
                <p><strong className="text-gray-400">Amount:</strong> {selectedReceipt.amount} ETB</p>
                <p><strong className="text-gray-400">Ref #:</strong> {selectedReceipt.referenceNumber}</p>
                <p><strong className="text-gray-400">Notes:</strong> {sanitizeInput(selectedReceipt.notes)}</p>
              </div>

              {selectedReceipt.verificationCaveat && (
                <div className="p-3 bg-amber-950/20 border border-amber-500/25 rounded-xl space-y-1 text-xs text-amber-200/90 leading-relaxed">
                  <strong className="flex items-center gap-1.5 text-amber-300">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    {t("Why AI Is Not 100% Certain")}
                  </strong>
                  <p>{selectedReceipt.verificationCaveat}</p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-5 py-2 bg-luxury-bg border border-gray-800 text-gray-300 hover:text-white rounded-xl text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* Modal: Delete Waiter Staff Confirmation */}
      <AnimatePresence>
        {deletingStaffConfirm && (
          <PortalModal
            open
            onClose={() => setDeletingStaffConfirm(null)}
            overlayClassName="bg-black/80 backdrop-blur-md"
            cardClassName="max-w-sm border-red-500/30"
          >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Delete Waiter Account?</h3>
                  <p className="text-[10px] text-red-400">Remove Staff Access</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 bg-luxury-bg p-3.5 rounded-2xl border border-gray-800">
                Are you sure you want to delete waiter <strong className="text-white">{deletingStaffConfirm.name}</strong>? They will no longer be able to sign in to scan bills.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeletingStaffConfirm(null)}
                  className="px-4 py-2 bg-luxury-bg border border-gray-800 text-gray-400 hover:text-white rounded-xl text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteStaff(deletingStaffConfirm.id, deletingStaffConfirm.name)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Delete Waiter
                </button>
              </div>
            </PortalModal>
        )}
      </AnimatePresence>

      {/* Modal: Delete Scanned Receipt Confirmation */}
      <AnimatePresence>
        {deletingReceiptConfirm && (
          <PortalModal
            open
            onClose={() => setDeletingReceiptConfirm(null)}
            overlayClassName="bg-black/80 backdrop-blur-md"
            cardClassName="max-w-sm border-red-500/30"
          >
              <div className="flex items-center gap-3">
                <div className="p-3 bg-red-950/40 border border-red-500/30 rounded-2xl text-red-400">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Delete Receipt Record?</h3>
                  <p className="text-[10px] text-red-400">Audit History Removal</p>
                </div>
              </div>

              <p className="text-xs text-gray-300 bg-luxury-bg p-3.5 rounded-2xl border border-gray-800">
                Are you sure you want to delete this scanned bill log? This action is permanent and cannot be undone.
              </p>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  onClick={() => setDeletingReceiptConfirm(null)}
                  className="px-4 py-2 bg-luxury-bg border border-gray-800 text-gray-400 hover:text-white rounded-xl text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteReceipt(deletingReceiptConfirm)}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Delete Record
                </button>
              </div>
            </PortalModal>
        )}
      </AnimatePresence>
    </div>
  );
};
