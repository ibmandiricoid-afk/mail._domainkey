import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, KeyRound, AlertCircle, CheckCircle, ShieldCheck } from "lucide-react";

interface PasscodeModalProps {
  showPasscodeModal: boolean;
  setShowPasscodeModal: (show: boolean) => void;
  handleChangePasscode: (e: React.FormEvent) => void;
  passcodeChangeError: string | null;
  passcodeChangeSuccess: string | null;
  currentPasscodeForm: string;
  setCurrentPasscodeForm: (val: string) => void;
  newPasscodeForm: string;
  setNewPasscodeForm: (val: string) => void;
  confirmPasscodeForm: string;
  setConfirmPasscodeForm: (val: string) => void;
  autoLockTimeout?: "1min" | "5min" | "15min" | "30min" | "never";
  setAutoLockTimeout?: (val: "1min" | "5min" | "15min" | "30min" | "never") => void;
}

export const PasscodeModal: React.FC<PasscodeModalProps> = ({
  showPasscodeModal,
  setShowPasscodeModal,
  handleChangePasscode,
  passcodeChangeError,
  passcodeChangeSuccess,
  currentPasscodeForm,
  setCurrentPasscodeForm,
  newPasscodeForm,
  setNewPasscodeForm,
  confirmPasscodeForm,
  setConfirmPasscodeForm,
  autoLockTimeout = "5min",
  setAutoLockTimeout
}) => {
  return (
    <AnimatePresence>
      {showPasscodeModal && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowPasscodeModal(false)}
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
          />

          {/* Modal Box */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative bg-white/95 backdrop-blur-md w-[95%] sm:w-full max-w-md mx-auto rounded-3xl p-6 border border-slate-200 shadow-2xl z-[1000] overflow-hidden text-slate-800"
          >
            {/* Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-jago-light via-jago to-jago-light" />

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700 border border-slate-200 shadow-sm shrink-0">
                  <KeyRound className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Ganti PIN &amp; Keamanan
                  </h3>
                </div>
              </div>
              <button 
                onClick={() => setShowPasscodeModal(false)}
                className="p-1.5 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-700 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <hr className="border-slate-200 mb-3" />

            {/* Auto-Lock & Protection Notice */}
            <div className="mb-4 p-3 bg-sky-50/80 border border-sky-200/80 rounded-2xl text-[11px] font-medium text-slate-700 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <span className="font-extrabold text-sky-900 block">Perlindungan Draf &amp; Auto-Lock</span>
                <p>
                  1. <strong>Teks draf otomatis tersimpan</strong> di perangkat Anda, sehingga tulisan tidak akan hilang saat berpindah aplikasi.
                </p>
                <p>
                  2. Atur durasi jeda di bawah ini agar aplikasi tidak langsung mengunci ketika Anda cuma berpindah aplikasi sebentar.
                </p>
              </div>
            </div>

            {/* Auto-Lock Timeout Config Select */}
            {setAutoLockTimeout && (
              <div className="mb-4 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1.5">
                <label className="text-[10.5px] font-extrabold text-slate-700 uppercase tracking-wider flex items-center justify-between">
                  <span>Batas Waktu Auto-Lock Saat Pindah Aplikasi</span>
                </label>
                <select
                  value={autoLockTimeout}
                  onChange={(e) => setAutoLockTimeout(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-jago shadow-2xs"
                >
                  <option value="1min">1 Menit Tidak Aktif</option>
                  <option value="5min">5 Menit (Standar Disarankan)</option>
                  <option value="15min">15 Menit</option>
                  <option value="30min">30 Menit</option>
                  <option value="never">Jangan Pernah Kunci Otomatis (Kunci Manual)</option>
                </select>
              </div>
            )}

            <form onSubmit={handleChangePasscode} className="space-y-4">
              {passcodeChangeError && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-2xl text-[11px] font-bold flex items-center gap-2"
                >
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                  <span>{passcodeChangeError}</span>
                </motion.div>
              )}

              {passcodeChangeSuccess && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl text-[11px] font-bold flex items-center gap-2"
                >
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                  <span>{passcodeChangeSuccess}</span>
                </motion.div>
              )}

              <div className="space-y-3.5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-600 px-1 uppercase tracking-wider">
                    PIN Saat Ini
                  </label>
                  <input 
                    type="password" 
                    required
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={6}
                    value={currentPasscodeForm}
                    onChange={(e) => setCurrentPasscodeForm(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-mono font-semibold focus:border-jago focus:ring-1 focus:ring-jago/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-600 px-1 uppercase tracking-wider">
                    PIN Baru
                  </label>
                  <input 
                    type="password" 
                    required
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={6}
                    value={newPasscodeForm}
                    onChange={(e) => setNewPasscodeForm(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-mono font-semibold focus:border-jago focus:ring-1 focus:ring-jago/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-extrabold text-slate-600 px-1 uppercase tracking-wider">
                    Ulangi PIN Baru
                  </label>
                  <input 
                    type="password" 
                    required
                    pattern="[0-9]*"
                    inputMode="numeric"
                    maxLength={6}
                    value={confirmPasscodeForm}
                    onChange={(e) => setConfirmPasscodeForm(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-2xl text-xs font-mono font-semibold focus:border-jago focus:ring-1 focus:ring-jago/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2 gap-2">
                <button 
                  type="button"
                  onClick={() => setShowPasscodeModal(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider border border-slate-200"
                >
                  Batal
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2.5 bg-jago hover:bg-jago-hover text-white text-[10px] font-black rounded-xl border border-jago-dark transition-all shadow-md flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  Perbarui
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
