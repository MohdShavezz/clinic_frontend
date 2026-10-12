import { useState } from "react";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import { updateIsEmailVerified } from "../app/features/userSlice";
import { sendEmailOtpApi, verifyEmailApi } from "../services/api";

export default function VerifyEmailPopup({ open, onClose, email }) {
  const dispatch = useDispatch();
  const [otp, setOtp] = useState("");
  const [sending, setSending] = useState(false);
  const [verifying, setVerifying] = useState(false);

  if (!open) return null;

  const sendCode = async () => {
    setSending(true);
    try {
      const response = await sendEmailOtpApi(email);
      toast.success(response.message || "Verification code sent.");
    } catch (error) {
      toast.error(error.message || "Could not send the verification code.");
    } finally {
      setSending(false);
    }
  };

  const verify = async (event) => {
    event.preventDefault();
    setVerifying(true);
    try {
      const response = await verifyEmailApi(email, otp);
      dispatch(updateIsEmailVerified(true));
      toast.success(response.message || "Email verified.");
      onClose();
    } catch (error) {
      toast.error(error.message || "That code could not be verified.");
    } finally {
      setVerifying(false);
    }
  };

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-900/50 p-4" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
    <section role="dialog" aria-modal="true" aria-labelledby="verify-email-title" className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
      <div className="mb-5"><span className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-teal-50 text-xl font-semibold text-teal-700">@</span><h2 id="verify-email-title" className="text-lg font-semibold text-slate-800">Verify your email</h2><p className="mt-1 text-sm text-slate-500">We’ll send a one-time code to {email}.</p></div>
      <form onSubmit={verify} className="space-y-4"><label className="block text-sm font-medium text-slate-600">4-digit verification code<input autoFocus inputMode="numeric" pattern="[0-9]{4}" maxLength={4} required value={otp} onChange={(event) => setOtp(event.target.value.replace(/\D/g, ""))} className="mt-2 w-full rounded-lg border border-slate-200 px-3 py-2.5 tracking-[.35em] outline-none focus:border-teal-600" placeholder="••••" /></label><button disabled={verifying} className="w-full rounded-lg bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800 disabled:opacity-60">{verifying ? "Verifying…" : "Verify email"}</button></form>
      <div className="mt-4 flex items-center justify-between text-xs"><button disabled={sending} onClick={sendCode} className="font-semibold text-teal-700 disabled:opacity-50">{sending ? "Sending…" : "Send a code"}</button><button onClick={onClose} className="text-slate-500 hover:text-slate-700">Cancel</button></div>
    </section>
  </div>;
}
