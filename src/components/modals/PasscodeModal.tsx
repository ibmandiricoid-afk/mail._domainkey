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
            className="relative bg-white/95 backdrop-blur-md w-[95%] sm:w-full max-w-md mx-auto rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xl z-[1000] text-slate-800 flex flex-col max-h-[88vh] sm:max-h-[85vh] overflow-hidden"
          >
            {/* Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-600 via-[#005291] to-sky-400" />

            {/* Modal Header */}
            <div className="flex items-center justify-between pb-2 shrink-0 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center text-[#003b6d] border border-sky-100 shadow-sm shrink-0">
                  <KeyRound className="w-4 h-4 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black text-slate-900 uppercase tracking-wider">
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

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto pt-3 pb-1 pr-1 space-y-3.5 no-scrollbar">
              {/* Auto-Lock & Protection Notice */}
              <div className="p-2.5 bg-sky-50/80 border border-sky-200/80 rounded-2xl text-[10.5px] font-medium text-slate-700 flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
                <div className="space-y-0.5 leading-snug">
                  <span className="font-extrabold text-sky-900 block text-[11px]">Perlindungan Draf &amp; Auto-Lock</span>
                  <p>
                    1. <strong>Teks draf tersimpan otomatis</strong> di perangkat Anda saat berpindah aplikasi.
                  </p>
                  <p>
                    2. Atur durasi auto-lock agar tidak mengunci saat berpindah aplikasi sebentar.
                  </p>
                </div>
              </div>

              {/* Auto-Lock Timeout Config Select */}
              {setAutoLockTimeout && (
                <div className="p-2.5 bg-slate-50 border border-slate-200/80 rounded-2xl space-y-1">
                  <label className="text-[10px] font-extrabold text-slate-700 uppercase tracking-wider block">
                    Batas Waktu Auto-Lock Saat Pindah Aplikasi
                  </label>
                  <select
                    value={autoLockTimeout}
                    onChange={(e) => setAutoLockTimeout(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:border-sky-600 shadow-2xs cursor-pointer"
                  >
                    <option value="1min">1 Menit Tidak Aktif</option>
                    <option value="5min">5 Menit (Standar Disarankan)</option>
                    <option value="15min">15 Menit</option>
                    <option value="30min">30 Menit</option>
                    <option value="never">Jangan Pernah Kunci Otomatis (Kunci Manual)</option>
                  </select>
                </div>
              )}

              <form onSubmit={handleChangePasscode} id="passcode-form" className="space-y-3">
                {passcodeChangeError && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-[11px] font-bold flex items-center gap-2"
                  >
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-500" />
                    <span>{passcodeChangeError}</span>
                  </motion.div>
                )}

                {passcodeChangeSuccess && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-[11px] font-bold flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4 shrink-0 text-emerald-500" />
                    <span>{passcodeChangeSuccess}</span>
                  </motion.div>
                )}

                <div className="space-y-2.5">
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-slate-600 px-1 uppercase tracking-wider">
                      PIN Saat Ini
                    </label>
                    <input 
                      type="password" 
                      required
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Masukkan PIN saat ini"
                      value={currentPasscodeForm}
                      onChange={(e) => setCurrentPasscodeForm(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-mono font-semibold focus:border-sky-600 focus:ring-1 focus:ring-sky-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-slate-600 px-1 uppercase tracking-wider">
                      PIN Baru (6 Digit)
                    </label>
                    <input 
                      type="password" 
                      required
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Masukkan PIN baru"
                      value={newPasscodeForm}
                      onChange={(e) => setNewPasscodeForm(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-mono font-semibold focus:border-sky-600 focus:ring-1 focus:ring-sky-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-extrabold text-slate-600 px-1 uppercase tracking-wider">
                      Ulangi PIN Baru
                    </label>
                    <input 
                      type="password" 
                      required
                      pattern="[0-9]*"
                      inputMode="numeric"
                      maxLength={6}
                      placeholder="Konfirmasi PIN baru"
                      value={confirmPasscodeForm}
                      onChange={(e) => setConfirmPasscodeForm(e.target.value.replace(/\D/g, ''))}
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-xs font-mono font-semibold focus:border-sky-600 focus:ring-1 focus:ring-sky-500/20 outline-none transition-all text-slate-800 placeholder:text-slate-400 shadow-sm"
                    />
                  </div>
                </div>
              </form>
            </div>

            {/* Modal Footer / Action Buttons */}
            <div className="flex items-center justify-end pt-3 mt-1 gap-2 shrink-0 border-t border-slate-100">
              <button 
                type="button"
                onClick={() => setShowPasscodeModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-bold rounded-xl transition-all cursor-pointer uppercase tracking-wider border border-slate-200"
              >
                Batal
              </button>
              <button 
                type="submit"
                form="passcode-form"
                className="px-5 py-2 bg-gradient-to-r from-[#003b6d] to-[#005291] hover:from-[#002d54] hover:to-[#004275] text-white text-[11px] font-black rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer uppercase tracking-wider border border-sky-400/30"
              >
                <KeyRound className="w-3.5 h-3.5 text-sky-200" />
                Perbarui
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
