import React, { useState } from 'react';
import {
  X,
  MessageSquareWarning,
  CheckCircle2,
  Clock,
  Send,
  Building2,
  FileText,
  Ticket,
  Phone,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Droplets,
  Scale,
  DollarSign,
  UserX,
  Truck,
  HelpCircle,
  AlertCircle,
  PlusCircle,
} from 'lucide-react';
import { useApp, type ComplaintItem } from '@/lib/app-context';
import { getCentersData } from '@/lib/data';

interface ComplaintModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultCategory?: string;
}

export function ComplaintModal({ isOpen, onClose, defaultCategory }: ComplaintModalProps) {
  const { lang, t, tokensList, complaintsList, addComplaint } = useApp();
  const [activeTab, setActiveTab] = useState<'file' | 'track'>('file');

  // Form states
  const [category, setCategory] = useState<ComplaintItem['category']>(
    (defaultCategory as ComplaintItem['category']) || 'Center Delays'
  );
  const [center, setCenter] = useState('Vijayawada Procurement Center');
  const [tokenId, setTokenId] = useState<string>('A127');
  const [farmerName, setFarmerName] = useState('Ravi Kumar');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState<'Normal' | 'High' | 'Urgent'>('Normal');
  const [submittedTicket, setSubmittedTicket] = useState<ComplaintItem | null>(null);
  const [expandedComplaintId, setExpandedComplaintId] = useState<string | null>(null);

  if (!isOpen) return null;

  const centers = getCentersData(lang);

  const categories = [
    {
      id: 'Center Delays',
      icon: Clock,
      label: lang === 'te' ? 'కేంద్రంలో ఆలస్యం' : lang === 'hi' ? 'केंद्र पर देरी' : 'Center Delays',
      desc: lang === 'te' ? 'క్యూ ఆలస్యం & రద్దీ' : lang === 'hi' ? 'कतार में अत्यधिक समय' : 'Long queue waiting time',
      color: 'bg-amber-500',
    },
    {
      id: 'Moisture Dispute',
      icon: Droplets,
      label: lang === 'te' ? 'తేమ పరిశీలన వివాదం' : lang === 'hi' ? 'नमी जांच विवाद' : 'Moisture Dispute',
      desc: lang === 'te' ? 'తేమ శాతంలో తేడాలు' : lang === 'hi' ? 'लैब रीडिंग में अंतर' : 'Grain moisture meter variance',
      color: 'bg-blue-500',
    },
    {
      id: 'Payment Delay',
      icon: DollarSign,
      label: lang === 'te' ? 'చెల్లింపుల ఆలస్యం' : lang === 'hi' ? 'भुगतान में देरी' : 'Payment Delay',
      desc: lang === 'te' ? 'DBT ఖాతా జమ ఆలస్యం' : lang === 'hi' ? 'DBT ट्रांसफर में समय' : 'DBT account credit delay',
      color: 'bg-emerald-500',
    },
    {
      id: 'Weighbridge Discrepancy',
      icon: Scale,
      label: lang === 'te' ? 'తూకం పరిమాణం తేడా' : lang === 'hi' ? 'तोल में गड़बड़ी' : 'Weighbridge Issue',
      desc: lang === 'te' ? 'కాటా తూకం లోపాలు' : lang === 'hi' ? 'वजन माप असंतुलन' : 'Quantity / weight discrepancy',
      color: 'bg-purple-500',
    },
    {
      id: 'Staff Misconduct',
      icon: UserX,
      label: lang === 'te' ? 'సిబ్బంది ప్రవర్తన' : lang === 'hi' ? 'कर्मचारी व्यवहार' : 'Staff Misconduct',
      desc: lang === 'te' ? 'అధికారుల ప్రవర్తన సమస్య' : lang === 'hi' ? 'अधिकारियों का अनुचित व्यवहार' : 'Unfair staff/officer behavior',
      color: 'bg-rose-500',
    },
    {
      id: 'Transport Issue',
      icon: Truck,
      label: lang === 'te' ? 'రవాణా వాహన సమస్య' : lang === 'hi' ? 'परिवहन समस्या' : 'Transport Issue',
      desc: lang === 'te' ? 'లారీ / ట్రాక్టర్ ఆలస్యం' : lang === 'hi' ? 'वाहन उपलब्धता समस्या' : 'Vehicle allocation delay',
      color: 'bg-orange-500',
    },
    {
      id: 'Other',
      icon: HelpCircle,
      label: lang === 'te' ? 'ఇతర సమస్యలు' : lang === 'hi' ? 'अन्य शिकायत' : 'Other Grievances',
      desc: lang === 'te' ? 'ఇతర సాధారణ ఫిర్యాదులు' : lang === 'hi' ? 'सामान्य प्रश्न' : 'General inquiries & support',
      color: 'bg-gray-500',
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newDoc = addComplaint({
      category,
      center,
      tokenId: tokenId === 'none' ? undefined : tokenId,
      farmerName,
      phone,
      description,
      urgency,
    });
    setSubmittedTicket(newDoc);
  };

  const handleResetForm = () => {
    setSubmittedTicket(null);
    setDescription('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-5xl bg-white shadow-glass-lg border border-forest-100 flex flex-col animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-forest-900 via-emerald-950 to-forest-900 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-glow">
              <MessageSquareWarning className="h-6 w-6" />
            </span>
            <div>
              <span className="chip bg-red-400/20 text-rose-200 border border-rose-300/30 text-[11px] font-bold">
                Official Grievance Redressal Portal
              </span>
              <h2 className="font-display text-2xl font-extrabold text-white mt-0.5">
                {t('complaint_box_title')}
              </h2>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-5 flex rounded-2xl bg-white/10 p-1 border border-white/15">
            <button
              onClick={() => setActiveTab('file')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
                activeTab === 'file'
                  ? 'bg-white text-forest-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <PlusCircle className="h-4 w-4" />
              {t('tab_file_complaint')}
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 relative ${
                activeTab === 'track'
                  ? 'bg-white text-forest-900 shadow-sm'
                  : 'text-white/80 hover:text-white hover:bg-white/5'
              }`}
            >
              <FileText className="h-4 w-4" />
              {t('tab_track_complaints')}
              {complaintsList.length > 0 && (
                <span className="chip bg-leaf-400 text-forest-950 font-extrabold text-[10px] px-1.5 py-0.5">
                  {complaintsList.length}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {activeTab === 'file' ? (
            submittedTicket ? (
              /* Success Confirmation Screen */
              <div className="text-center py-6 space-y-4 animate-scale-in">
                <div className="mx-auto grid h-20 w-20 place-items-center rounded-4xl bg-gradient-to-br from-leaf-500 to-forest-600 text-white shadow-glow">
                  <CheckCircle2 className="h-10 w-10" />
                </div>
                <div>
                  <span className="chip bg-leaf-100 text-leaf-800 text-xs font-bold">
                    Official Ticket Generated
                  </span>
                  <h3 className="font-display text-3xl font-extrabold text-forest-900 mt-2">
                    Ticket #{submittedTicket.id}
                  </h3>
                  <p className="text-sm font-semibold text-forest-600 mt-1">
                    {t('complaint_success_title')}
                  </p>
                </div>

                <div className="rounded-3xl border border-leaf-200 bg-leaf-50/70 p-4 text-left text-xs text-leaf-900 space-y-2 max-w-md mx-auto">
                  <div className="flex justify-between border-b border-leaf-200/60 pb-2">
                    <span className="text-forest-600 font-semibold">Category:</span>
                    <span className="font-bold">{submittedTicket.category}</span>
                  </div>
                  <div className="flex justify-between border-b border-leaf-200/60 pb-2">
                    <span className="text-forest-600 font-semibold">Center:</span>
                    <span className="font-bold">{submittedTicket.center}</span>
                  </div>
                  <div className="flex justify-between border-b border-leaf-200/60 pb-2">
                    <span className="text-forest-600 font-semibold">Urgency SLA:</span>
                    <span className="font-bold text-amber-700">{submittedTicket.urgency} (Assigned Officer Review)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-forest-600 font-semibold">SMS Alert:</span>
                    <span className="font-bold text-leaf-700">Sent to {submittedTicket.phone}</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-3 max-w-md mx-auto">
                  <button
                    onClick={() => setActiveTab('track')}
                    className="btn-primary flex-1 text-xs py-3"
                  >
                    Track Complaint Status
                  </button>
                  <button
                    onClick={handleResetForm}
                    className="w-full sm:w-auto rounded-2xl border border-forest-200 bg-white px-4 py-3 text-xs font-bold text-forest-700 hover:bg-cream-50"
                  >
                    File Another Complaint
                  </button>
                </div>
              </div>
            ) : (
              /* Complaint Form */
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Category Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest-700 mb-2">
                    {lang === 'te' ? 'సమస్య వర్గాన్ని ఎంచుకోండి' : lang === 'hi' ? 'समस्या का प्रकार चुनें' : 'Select Grievance Category'}
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-48 overflow-y-auto pr-1">
                    {categories.map((cat) => {
                      const Icon = cat.icon;
                      const isSelected = category === cat.id;
                      return (
                        <button
                          type="button"
                          key={cat.id}
                          onClick={() => setCategory(cat.id as ComplaintItem['category'])}
                          className={`flex flex-col items-start p-3 rounded-2xl border text-left transition ${
                            isSelected
                              ? 'border-red-500 bg-red-50/60 text-red-950 shadow-sm font-semibold'
                              : 'border-forest-100 bg-white text-forest-800 hover:bg-cream-50'
                          }`}
                        >
                          <span className={`grid h-8 w-8 place-items-center rounded-xl text-white mb-2 ${cat.color}`}>
                            <Icon className="h-4 w-4" />
                          </span>
                          <span className="text-xs font-bold leading-tight">{cat.label}</span>
                          <span className="text-[10px] text-forest-500 mt-0.5 line-clamp-1">{cat.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Center Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-forest-700 mb-1">
                      <Building2 className="h-3.5 w-3.5 inline mr-1 text-forest-500" />
                      {lang === 'te' ? 'సంబంధిత కొనుగోలు కేంద్రం' : lang === 'hi' ? 'संबंधित खरीद केंद्र' : 'Procurement Center'}
                    </label>
                    <select
                      value={center}
                      onChange={(e) => setCenter(e.target.value)}
                      className="w-full rounded-2xl border border-forest-200 bg-white px-3.5 py-2.5 text-xs font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
                    >
                      {centers.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name} ({c.district})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Token Reference Selector */}
                  <div>
                    <label className="block text-xs font-semibold text-forest-700 mb-1">
                      <Ticket className="h-3.5 w-3.5 inline mr-1 text-forest-500" />
                      {lang === 'te' ? 'టోకెన్ పాస్ (ఐచ్ఛికం)' : lang === 'hi' ? 'टोकन नंबर (ऐच्छिक)' : 'Linked Token Pass (Optional)'}
                    </label>
                    <select
                      value={tokenId}
                      onChange={(e) => setTokenId(e.target.value)}
                      className="w-full rounded-2xl border border-forest-200 bg-white px-3.5 py-2.5 text-xs font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
                    >
                      {tokensList.map((t) => (
                        <option key={t.id} value={t.token}>
                          Token #{t.token} - {t.crop} ({t.status})
                        </option>
                      ))}
                      <option value="none">No Specific Token Pass</option>
                    </select>
                  </div>
                </div>

                {/* Farmer Contact Info */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-forest-700 mb-1">Farmer Name</label>
                    <input
                      type="text"
                      required
                      value={farmerName}
                      onChange={(e) => setFarmerName(e.target.value)}
                      className="w-full rounded-2xl border border-forest-200 bg-white px-3.5 py-2.5 text-xs font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-forest-700 mb-1">Phone Number (for SMS updates)</label>
                    <input
                      type="text"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-2xl border border-forest-200 bg-white px-3.5 py-2.5 text-xs font-bold text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
                    />
                  </div>
                </div>

                {/* Description Narrative */}
                <div>
                  <label className="block text-xs font-semibold text-forest-700 mb-1">
                    {lang === 'te' ? 'సమస్య వివరాలు' : lang === 'hi' ? 'शिकायत का विवरण' : 'Detailed Complaint Narrative'}
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder={
                      lang === 'te'
                        ? 'దయచేసి ఏమి జరిగింది మరియు ఎప్పుడు జరిగిందో వివరంగా రాయండి...'
                        : lang === 'hi'
                        ? 'कृपया क्या हुआ और किस समय हुआ इसका विवरण दें...'
                        : 'Describe what occurred, date/time, and desired resolution...'
                    }
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-2xl border border-forest-200 bg-white p-3.5 text-xs font-medium text-forest-900 outline-none focus:ring-2 focus:ring-leaf-400"
                  />
                </div>

                {/* Urgency Level Selector */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-forest-700 mb-2">
                    {t('urgency_level')}
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {[
                      { id: 'Normal', label: 'Normal (48h SLA)', badge: 'bg-blue-100 text-blue-800' },
                      { id: 'High', label: 'High (24h Review)', badge: 'bg-amber-100 text-amber-800' },
                      { id: 'Urgent', label: 'Urgent (Immediate)', badge: 'bg-rose-100 text-rose-800 font-bold' },
                    ].map((u) => (
                      <button
                        type="button"
                        key={u.id}
                        onClick={() => setUrgency(u.id as 'Normal' | 'High' | 'Urgent')}
                        className={`py-2.5 px-3 rounded-2xl border text-xs font-semibold transition ${
                          urgency === u.id
                            ? 'border-forest-900 bg-forest-900 text-white shadow-sm'
                            : 'border-forest-100 bg-cream-50 text-forest-700 hover:bg-forest-100'
                        }`}
                      >
                        {u.label}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-gradient-to-r from-red-600 to-rose-700 py-3.5 text-sm font-bold text-white shadow-glow hover:opacity-95 transition flex items-center justify-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  {t('submit_complaint_btn')}
                </button>
              </form>
            )
          ) : (
            /* Track Complaints List Tab */
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-display text-lg font-extrabold text-forest-900">
                  {lang === 'te' ? 'మీరు దాఖలు చేసిన ఫిర్యాదులు' : lang === 'hi' ? 'आपकी दर्ज शिकायतें' : 'Registered Complaints'} ({complaintsList.length})
                </h4>
                <span className="chip bg-forest-100 text-forest-800 text-xs font-bold">
                  Official Tracking Portal
                </span>
              </div>

              {complaintsList.length === 0 ? (
                <div className="rounded-3xl bg-cream-50 p-8 text-center text-forest-500">
                  <AlertCircle className="h-10 w-10 mx-auto text-forest-300 mb-2" />
                  <p className="font-bold text-forest-800 text-sm">No complaints recorded yet</p>
                  <p className="text-xs mt-1">If you experience any issues at procurement centers, file a complaint to get official assistance.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {complaintsList.map((item) => {
                    const isExpanded = expandedComplaintId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="rounded-3xl border border-forest-100 bg-white p-4 shadow-sm transition hover:border-forest-200"
                      >
                        <div
                          onClick={() => setExpandedComplaintId(isExpanded ? null : item.id)}
                          className="flex items-start justify-between cursor-pointer"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-extrabold text-forest-900 bg-forest-50 px-2.5 py-1 rounded-xl">
                                #{item.id}
                              </span>
                              <span className="text-xs font-bold text-forest-800">
                                {item.category}
                              </span>
                              {item.tokenId && (
                                <span className="chip bg-cream-100 text-forest-700 text-[10px]">
                                  Token #{item.tokenId}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-forest-500">{item.center} • {new Date(item.createdAt).toLocaleDateString()}</p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span
                              className={`chip text-xs px-3 py-1 font-bold ${
                                item.status === 'Resolved'
                                  ? 'bg-leaf-100 text-leaf-800 border border-leaf-300'
                                  : item.status === 'Under Review'
                                  ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                  : 'bg-blue-100 text-blue-800 border border-blue-300'
                              }`}
                            >
                              {item.status}
                            </span>
                            <button className="text-forest-400 hover:text-forest-700">
                              {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Expanded details */}
                        {isExpanded && (
                          <div className="mt-4 border-t border-forest-100 pt-4 space-y-3 animate-fade-down text-xs">
                            <div>
                              <p className="font-bold text-forest-700 uppercase tracking-wider text-[10px]">Farmer Statement:</p>
                              <p className="text-forest-800 bg-forest-50/70 p-3 rounded-2xl mt-1 leading-relaxed">{item.description}</p>
                            </div>

                            {/* Resolution Progress Stepper */}
                            <div>
                              <p className="font-bold text-forest-700 uppercase tracking-wider text-[10px] mb-2">Ticket Progress:</p>
                              <div className="flex items-center justify-between bg-cream-50 p-3 rounded-2xl">
                                <div className="flex items-center gap-1.5">
                                  <CheckCircle2 className="h-4 w-4 text-leaf-600" />
                                  <span className="font-bold text-forest-900">Submitted</span>
                                </div>
                                <div className={`h-0.5 flex-1 mx-2 rounded ${item.status !== 'Submitted' ? 'bg-leaf-500' : 'bg-forest-200'}`} />
                                <div className="flex items-center gap-1.5">
                                  <span className={`h-2.5 w-2.5 rounded-full ${item.status !== 'Submitted' ? 'bg-leaf-600' : 'bg-forest-300'}`} />
                                  <span className={item.status !== 'Submitted' ? 'font-bold text-forest-900' : 'text-forest-400'}>Under Review</span>
                                </div>
                                <div className={`h-0.5 flex-1 mx-2 rounded ${item.status === 'Resolved' ? 'bg-leaf-500' : 'bg-forest-200'}`} />
                                <div className="flex items-center gap-1.5">
                                  <span className={`h-2.5 w-2.5 rounded-full ${item.status === 'Resolved' ? 'bg-leaf-600' : 'bg-forest-300'}`} />
                                  <span className={item.status === 'Resolved' ? 'font-bold text-forest-900' : 'text-forest-400'}>Resolved</span>
                                </div>
                              </div>
                            </div>

                            {item.resolutionNote && (
                              <div className="rounded-2xl border border-leaf-300 bg-leaf-50 p-3.5 text-leaf-900">
                                <p className="font-bold flex items-center gap-1 text-leaf-800">
                                  <ShieldCheck className="h-4 w-4 text-leaf-600" /> Official Resolution Action:
                                </p>
                                <p className="mt-1 font-medium">{item.resolutionNote}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Helpline info */}
              <div className="rounded-3xl bg-gradient-to-r from-forest-900 to-forest-800 p-4 text-white flex items-center justify-between mt-4">
                <div className="flex items-center gap-3">
                  <span className="grid h-10 w-10 place-items-center rounded-2xl bg-white/15">
                    <Phone className="h-5 w-5 text-gold-300" />
                  </span>
                  <div>
                    <p className="text-xs font-bold uppercase tracking-wider text-leaf-200">Grievance Toll-Free Helpline</p>
                    <p className="font-display text-lg font-extrabold text-gold-300">1800-425-KISSAN (54772)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
