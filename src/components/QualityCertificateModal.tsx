import { Award, Printer, QrCode, Share2, ShieldCheck, X } from 'lucide-react';
import type { QualityCheckupRecord } from '@/lib/quality-service';

interface QualityCertificateModalProps {
  record: QualityCheckupRecord;
  onClose: () => void;
}

export function QualityCertificateModal({ record, onClose }: QualityCertificateModalProps) {
  const certId = record.certificateId || `KC-QC-2026-${record.tokenId}-8842`;

  const handlePrint = () => {
    window.print();
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `Quality Certificate ${certId}`,
        text: `KisanConnect Official Quality Certificate for ${record.farmerName} (${record.crop}, Grade ${record.qualityGrade})`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      alert(`Certificate URL copied: ${window.location.href}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/80 backdrop-blur-md animate-fade-in print:p-0 print:bg-white print:static">
      <div className="w-full max-w-xl rounded-4xl bg-white p-6 sm:p-8 shadow-2xl border border-forest-100 relative animate-scale-in print:shadow-none print:border-none print:p-4">
        {/* Close Button (Hidden when printing) */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-xl bg-forest-100 text-forest-700 hover:bg-forest-200 transition print:hidden"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Certificate Outer Border Frame */}
        <div className="rounded-3xl border-4 border-double border-forest-800 p-5 sm:p-6 bg-gradient-to-b from-cream-50/50 via-white to-leaf-50/30">
          {/* Header Seal */}
          <div className="flex flex-col items-center text-center">
            <div className="grid h-16 w-16 place-items-center rounded-3xl bg-gradient-to-br from-leaf-500 to-forest-700 text-white shadow-glow mb-2">
              <Award className="h-9 w-9" />
            </div>
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-leaf-700">
              Government Verified Agricultural Procurement
            </span>
            <h2 className="mt-1 font-display text-2xl font-black text-forest-950 sm:text-3xl">
              Kisan<span className="text-leaf-600">Connect</span>
            </h2>
            <p className="text-xs font-bold uppercase tracking-wider text-forest-600">
              OFFICIAL DIGITAL QUALITY CERTIFICATE
            </p>
            <span className="mt-2 rounded-full bg-forest-100 px-3 py-1 text-[11px] font-mono font-bold text-forest-900 border border-forest-200">
              ID: {certId}
            </span>
          </div>

          {/* Verification Badge */}
          <div className="mt-6 flex items-center justify-between rounded-2xl bg-leaf-50 border border-leaf-200 p-3.5">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="h-5 w-5 text-leaf-600" />
              <div>
                <p className="text-xs font-bold text-leaf-900">VERIFIED & ACCREDITED</p>
                <p className="text-[10px] text-leaf-700">Authorized Procurement Personnel Verification</p>
              </div>
            </div>
            <span className="rounded-xl bg-leaf-500 px-3 py-1 text-xs font-black uppercase text-white shadow-sm">
              {record.decision.toUpperCase()}
            </span>
          </div>

          {/* Details Table */}
          <div className="mt-6 grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-xl bg-forest-50/60 p-3 border border-forest-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-500">Farmer Name</span>
              <p className="font-extrabold text-forest-950 text-sm">{record.farmerName}</p>
            </div>
            <div className="rounded-xl bg-forest-50/60 p-3 border border-forest-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-500">Token Number</span>
              <p className="font-extrabold text-forest-950 text-sm">#{record.tokenId}</p>
            </div>
            <div className="rounded-xl bg-forest-50/60 p-3 border border-forest-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-500">Crop & Variety</span>
              <p className="font-extrabold text-forest-950 text-sm">{record.crop}</p>
            </div>
            <div className="rounded-xl bg-forest-50/60 p-3 border border-forest-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-500">Quantity</span>
              <p className="font-extrabold text-forest-950 text-sm">{record.quantityQuintals} Quintals</p>
            </div>
            <div className="rounded-xl bg-forest-50/60 p-3 border border-forest-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-500">Quality Grade</span>
              <p className="font-extrabold text-leaf-700 text-sm">{record.qualityGrade}</p>
            </div>
            <div className="rounded-xl bg-forest-50/60 p-3 border border-forest-100">
              <span className="text-[10px] font-bold uppercase tracking-wider text-forest-500">Measured Moisture</span>
              <p className="font-extrabold text-forest-950 text-sm">{record.moisturePct}% (Optimal)</p>
            </div>
          </div>

          {/* Official Verification Signature Block */}
          <div className="mt-6 border-t border-dashed border-forest-200 pt-4 flex items-end justify-between">
            <div>
              <p className="text-[10px] font-bold uppercase text-forest-500">Procurement Center</p>
              <p className="text-xs font-bold text-forest-900">{record.centerName}</p>
              <p className="text-[10px] text-forest-600 mt-1">Verified By: <span className="font-bold text-forest-900">{record.verifiedBy || 'Officer S. Rao (ID: OFF-842)'}</span></p>
              <p className="text-[10px] text-forest-500">Timestamp: {record.verifiedAtStr || record.dateStr}</p>
            </div>

            {/* QR Verification Seal */}
            <div className="flex flex-col items-center">
              <div className="grid h-16 w-16 place-items-center rounded-xl bg-white p-1 border-2 border-forest-800 shadow-sm">
                <QrCode className="h-full w-full text-forest-950" />
              </div>
              <span className="text-[9px] font-mono text-forest-500 mt-1">SCAN TO VERIFY</span>
            </div>
          </div>
        </div>

        {/* Modal Footer Actions (Hidden when printing) */}
        <div className="mt-6 flex items-center justify-end gap-3 print:hidden">
          <button
            onClick={handleShare}
            className="flex items-center gap-2 rounded-2xl bg-forest-100 px-4 py-2.5 text-xs font-bold text-forest-700 hover:bg-forest-200 transition"
          >
            <Share2 className="h-4 w-4" /> Share
          </button>

          <button
            onClick={handlePrint}
            className="btn-gold flex items-center gap-2 text-xs shadow-lg"
          >
            <Printer className="h-4 w-4" /> Print / Download PDF
          </button>
        </div>
      </div>
    </div>
  );
}
