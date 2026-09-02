import { useState } from 'react';
import {
  Truck,
  PhoneCall,
  CheckCircle2,
  X,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';

interface TransportHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  centerName?: string;
  appointmentTime?: string;
}

export function TransportHubModal({
  isOpen,
  onClose,
  centerName = 'Vijayawada Center',
  appointmentTime = '10:30 AM',
}: TransportHubModalProps) {
  const { lang } = useApp();
  const [bookedDriverId, setBookedDriverId] = useState<string | null>(null);

  if (!isOpen) return null;

  const drivers =
    lang === 'te'
      ? [
          {
            id: 'd1',
            name: 'సురేష్ ట్రాక్టర్ సర్వీసెస్',
            vehicle: 'మహీంద్రా 575 DI (ట్రాక్టర్ ట్రైలర్)',
            capacity: '50 క్వింటాళ్లు',
            phone: '+91 98480 12345',
            ratePerKm: 45,
            rating: 4.9,
            trips: 142,
            availableTime: 'ఉదయం 9:00 నుండి',
          },
          {
            id: 'd2',
            name: 'రెడ్డి ఎక్స్‌ప్రెస్ లారీ సర్వీస్',
            vehicle: 'టాటా 1109 6-వీలర్ లారీ',
            capacity: '120 క్వింటాళ్లు',
            phone: '+91 98480 67890',
            ratePerKm: 75,
            rating: 4.8,
            trips: 210,
            availableTime: 'ఉదయం 8:30 నుండి',
          },
          {
            id: 'd3',
            name: 'గోదావరి రైతు రవాణా సహకార సంఘం',
            vehicle: 'ఐచర్ ప్రో మినీ ట్రక్',
            capacity: '40 క్వింటాళ్లు',
            phone: '+91 98480 55443',
            ratePerKm: 38,
            rating: 4.95,
            trips: 88,
            availableTime: 'తక్షణమే అందుబాటులో ఉంది',
          },
        ]
      : lang === 'hi'
      ? [
          {
            id: 'd1',
            name: 'सुरेश ट्रैक्टर सर्विस',
            vehicle: 'महिंद्रा 575 DI (ट्रैक्टर ट्रॉली)',
            capacity: '50 क्विंटल',
            phone: '+91 98480 12345',
            ratePerKm: 45,
            rating: 4.9,
            trips: 142,
            availableTime: 'सुबह 9:00 बजे से',
          },
          {
            id: 'd2',
            name: 'रेड्डी एक्सप्रेस ट्रक सर्विस',
            vehicle: 'टाटा 1109 6-व्हीलर ट्रक',
            capacity: '120 क्विंटल',
            phone: '+91 98480 67890',
            ratePerKm: 75,
            rating: 4.8,
            trips: 210,
            availableTime: 'सुबह 8:30 बजे से',
          },
          {
            id: 'd3',
            name: 'गोदावरी किसान परिवहन सहकारी',
            vehicle: 'आयशर प्रो मिनी ट्रक',
            capacity: '40 क्विंटल',
            phone: '+91 98480 55443',
            ratePerKm: 38,
            rating: 4.95,
            trips: 88,
            availableTime: 'तुरंत उपलब्ध',
          },
        ]
      : [
          {
            id: 'd1',
            name: 'Suresh Tractor Services',
            vehicle: 'Mahindra 575 DI (Tractor Trailer)',
            capacity: '50 Quintals',
            phone: '+91 98480 12345',
            ratePerKm: 45,
            rating: 4.9,
            trips: 142,
            availableTime: '9:00 AM onwards',
          },
          {
            id: 'd2',
            name: 'Reddy Express Lorry',
            vehicle: 'Tata 1109 6-Wheeler Lorry',
            capacity: '120 Quintals',
            phone: '+91 98480 67890',
            ratePerKm: 75,
            rating: 4.8,
            trips: 210,
            availableTime: '8:30 AM onwards',
          },
          {
            id: 'd3',
            name: 'Godavari Farmer Transport Co-Op',
            vehicle: 'Eicher Pro Mini Truck',
            capacity: '40 Quintals',
            phone: '+91 98480 55443',
            ratePerKm: 38,
            rating: 4.95,
            trips: 88,
            availableTime: 'Immediate',
          },
        ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-900/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-5xl glass p-6 sm:p-8 shadow-glass-lg animate-scale-in">
        <div className="flex items-start justify-between border-b border-forest-100 pb-4">
          <div>
            <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-leaf-600">
              <Truck className="h-4 w-4" />{' '}
              {lang === 'te' ? 'కిసాన్ లాజిస్టిక్స్ రవాణా కేంద్రం' : lang === 'hi' ? 'किसान लॉजिस्टिक्स परिवहन केंद्र' : 'Kisan Logistics Hub'}
            </span>
            <h2 className="mt-1 font-display text-2xl font-extrabold text-forest-900">
              {lang === 'te' ? `${centerName} కోసం వాహనం బుక్ చేయండి` : lang === 'hi' ? `${centerName} के लिए वाहन बुक करें` : `Book Transport to ${centerName}`}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="grid h-9 w-9 place-items-center rounded-2xl bg-forest-100 text-forest-700 hover:bg-forest-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Sync Banner */}
        <div className="mt-4 flex items-center justify-between rounded-2xl border border-leaf-300 bg-leaf-50 px-4 py-3 text-xs font-bold text-leaf-800">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-leaf-600" />
            <span>
              {lang === 'te'
                ? `టోకెన్ సమయం ${appointmentTime} కి అనుసంధానించబడింది`
                : lang === 'hi'
                ? `टोकन समय ${appointmentTime} से लिंक है`
                : `Synced with Token #${appointmentTime} Appointment`}
            </span>
          </div>
          <span>
            {lang === 'te' ? 'పికప్ సమయం: 8:45 AM - 9:30 AM' : lang === 'hi' ? 'पिकअप समय: 8:45 AM - 9:30 AM' : 'Pickup window: 8:45 AM - 9:30 AM'}
          </span>
        </div>

        <div className="mt-5 space-y-3">
          {drivers.map((driver) => {
            const isBooked = bookedDriverId === driver.id;
            return (
              <div
                key={driver.id}
                className={`rounded-3xl border p-5 transition-all ${
                  isBooked
                    ? 'border-leaf-500 bg-leaf-50/90 shadow-glass'
                    : 'border-forest-100 bg-white hover:border-forest-200 shadow-sm'
                }`}
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-display text-lg font-bold text-forest-900">
                        {driver.name}
                      </h3>
                      <span className="rounded-full bg-gold-100 px-2 py-0.5 text-[11px] font-extrabold text-gold-700">
                        ★ {driver.rating} ({driver.trips} {lang === 'te' ? 'ట్రిప్పులు' : lang === 'hi' ? 'ट्रिप' : 'trips'})
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-forest-600 mt-0.5">
                      {driver.vehicle} • {lang === 'te' ? 'గరిష్ట సామర్థ్యం' : lang === 'hi' ? 'अधिकतम क्षमता' : 'Max Capacity'}: {driver.capacity}
                    </p>
                    <p className="text-xs text-forest-400 mt-1">
                      {lang === 'te' ? 'చార్జ్' : lang === 'hi' ? 'दर' : 'Rate'}: ₹{driver.ratePerKm}/km • {lang === 'te' ? 'అందుబాటు' : lang === 'hi' ? 'उपलब्धता' : 'Available'}: {driver.availableTime}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={`tel:${driver.phone}`}
                      className="grid h-10 w-10 place-items-center rounded-2xl border border-forest-200 bg-cream-50 text-forest-700 hover:bg-cream-100"
                      title="Call Driver"
                    >
                      <PhoneCall className="h-4.5 w-4.5 text-leaf-600" />
                    </a>

                    <button
                      onClick={() => setBookedDriverId(driver.id)}
                      className={`rounded-2xl px-5 py-2.5 text-sm font-bold transition ${
                        isBooked
                          ? 'bg-leaf-600 text-white'
                          : 'bg-leaf-500 text-white hover:bg-leaf-600'
                      }`}
                    >
                      {isBooked
                        ? (lang === 'te' ? '✓ రవాణా బుక్ అయింది' : lang === 'hi' ? '✓ वाहन बुक हो गया' : '✓ Transport Booked')
                        : (lang === 'te' ? 'రవాణా బుక్ చేయండి' : lang === 'hi' ? 'वाहन बुक करें' : 'Book Transport')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {bookedDriverId && (
          <div className="mt-5 rounded-3xl bg-forest-900 p-5 text-white animate-fade-up">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-6 w-6 text-leaf-400 shrink-0" />
              <div>
                <p className="font-display text-base font-bold text-white">
                  {lang === 'te'
                    ? 'రవాణా వాహనం విజయవంతంగా రిజర్వు చేయబడింది!'
                    : lang === 'hi'
                    ? 'परिवहन वाहन सफलतापूर्वक बुक हो गया है!'
                    : 'Transport Successfully Reserved!'}
                </p>
                <p className="text-xs text-forest-200 mt-0.5">
                  {lang === 'te'
                    ? 'డ్రైవర్ పికప్‌కు 30 నిమిషాల ముందు మీకు కాల్ చేస్తారు. ధర్మకాంటా బరువు ఆధారంగా చార్జీలు చెల్లించబడతాయి.'
                    : lang === 'hi'
                    ? 'ड्राइवर पिकअप से 30 मिनट पहले आपको कॉल करेगा। धर्मकांटा वजन के अनुसार भाड़ा तय होगा।'
                    : 'The driver will contact you 30 mins before pickup. Payment is settled directly at the procurement weighing bridge.'}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-2xl border border-forest-200 bg-white px-6 py-2.5 text-sm font-semibold text-forest-700 hover:bg-cream-50"
          >
            {lang === 'te' ? 'మూసివేయి' : lang === 'hi' ? 'बंद करें' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}

