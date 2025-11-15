import QRCode from "qrcode.react"; // <-- Make sure this is installed!
import { useState } from "react";
import { useAuth } from '../../../context/AuthContext';

export default function UpiPayment({ jobId, freelancerId, amount, token }) {
  const { userId } = useAuth(); // <-- correct: use inside the component!

  const [upiLink, setUpiLink] = useState("");
  const [paymentId, setPaymentId] = useState("");
  const [txnId, setTxnId] = useState("");
  const [statusMsg, setStatusMsg] = useState("");
  const [loading, setLoading] = useState(false);

  const initiatePayment = async () => {
    setLoading(true);
    try {
      console.log("Sending payment payload:", { 
        job_id: jobId, 
        sender_id: userId,
        receiver_id: freelancerId, 
        amount, 
        payment_method: "upi",
        status: "pending"
      });
      const res = await fetch("http://localhost:8000/payments/initiate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          job_id: jobId,
          sender_id: userId,
          receiver_id: freelancerId,
          amount: amount,
          payment_method: "upi",
          status: "pending"
        })
      });
      const data = await res.json();
      setUpiLink(data.upi_link);
      setPaymentId(data.id);
    } catch (_err) {
      setStatusMsg("Could not initiate payment.");
    } finally {
      setLoading(false);
    }
  };

  const submitTxnId = async () => {
    if (!txnId || !paymentId) return;
    try {
      const res = await fetch(`http://localhost:8000/payments/verify/${paymentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ txn_id: txnId })
      });
      const data = await res.json();
      setStatusMsg(data.status === "completed" ? "Payment verified!" : "Verification pending.");
    } catch (_err) {
      setStatusMsg("Could not verify payment.");
    }
  };

  return (
    <div style={{ padding: 32 }}>
      <button onClick={initiatePayment} disabled={loading}>
        {loading ? "Generating QR..." : "Pay via UPI"}
      </button>
      {upiLink && (
        <div style={{ marginTop: 24 }}>
          <h3>Scan (UPI QR) or tap to pay:</h3>
          <QRCode value={upiLink} size={200} />
          <div style={{ marginTop: 10 }}>
            <a href={upiLink} target="_blank" rel="noopener noreferrer">{upiLink}</a>
          </div>
          <div style={{ marginTop: 24 }}>
            <input
              type="text"
              placeholder="Enter UPI transaction ref ID"
              value={txnId}
              onChange={e => setTxnId(e.target.value)}
              style={{ marginRight: 8, padding: 8 }}
            />
            <button onClick={submitTxnId}>Submit Ref ID</button>
            {statusMsg && <div style={{ marginTop: 10, color: "green" }}>{statusMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
}
