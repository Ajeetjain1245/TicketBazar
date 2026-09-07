import { CheckCircle2, Clock, ShieldCheck, AlertCircle } from 'lucide-react';

const EscrowStepper = ({ orderStatus, escrowStatus }) => {
  // Determine step states
  // Step 1: Payment Held in Escrow
  // Step 2: Ticket Transferred & Verified
  // Step 3: Escrow Funds Released to Seller

  const isCancelled = orderStatus === 'cancelled' || escrowStatus === 'refunded';
  
  const getStep1Status = () => {
    if (isCancelled) return 'cancelled';
    if (escrowStatus === 'pending' && orderStatus === 'pending') return 'current';
    return 'completed'; // held, released
  };

  const getStep2Status = () => {
    if (isCancelled) return 'cancelled';
    if (escrowStatus === 'released' || orderStatus === 'completed') return 'completed';
    if (escrowStatus === 'held' || orderStatus === 'confirmed') return 'current';
    return 'upcoming';
  };

  const getStep3Status = () => {
    if (isCancelled) return 'cancelled';
    if (escrowStatus === 'released' || orderStatus === 'completed') return 'completed';
    return 'upcoming';
  };

  const steps = [
    {
      title: '1. Payment in Escrow',
      description: 'Buyer funds held safely',
      state: getStep1Status(),
    },
    {
      title: '2. Ticket Transfer',
      description: 'Seller delivers ticket',
      state: getStep2Status(),
    },
    {
      title: '3. Funds Released',
      description: 'Seller paid & complete',
      state: getStep3Status(),
    },
  ];

  if (isCancelled) {
    return (
      <div className="card p-5 bg-rose-500/5 border border-rose-500/20 rounded-2xl">
        <div className="flex items-center space-x-3 text-rose-400">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Order Cancelled / Refunded</h4>
            <p className="text-xs text-slate-400 mt-0.5">Escrow funds have been refunded back to the buyer account.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="card p-6 bg-slate-900/60 border border-slate-800 backdrop-blur-md rounded-2xl">
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="w-8 h-8 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-slate-100 font-display">Escrow Protection Timeline</h4>
            <p className="text-xs text-slate-400">Funds remain 100% protected until ticket verification</p>
          </div>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 uppercase tracking-wider">
          Escrow: {escrowStatus || 'Active'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
        {steps.map((step, idx) => {
          const isCompleted = step.state === 'completed';
          const isCurrent = step.state === 'current';

          return (
            <div
              key={idx}
              className={`relative p-4 rounded-xl border transition-all duration-300 ${
                isCompleted
                  ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400'
                  : isCurrent
                  ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 shadow-lg shadow-indigo-500/5 ring-1 ring-indigo-500/30'
                  : 'bg-slate-800/30 border-slate-800 text-slate-500'
              }`}
            >
              <div className="flex items-center space-x-3">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 ${
                    isCompleted
                      ? 'bg-emerald-500/20 text-emerald-400'
                      : isCurrent
                      ? 'bg-indigo-500 text-slate-950 animate-pulse'
                      : 'bg-slate-800 text-slate-500'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4" />
                  ) : (
                    idx + 1
                  )}
                </div>
                <div>
                  <div
                    className={`text-sm font-semibold ${
                      isCompleted
                        ? 'text-emerald-300'
                        : isCurrent
                        ? 'text-indigo-300'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.title}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{step.description}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default EscrowStepper;
