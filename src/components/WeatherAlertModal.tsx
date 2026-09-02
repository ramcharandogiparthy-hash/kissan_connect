import React, { useState } from 'react';
import {
  X,
  CloudRain,
  Droplets,
  Wind,
  MapPin,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useApp } from '@/lib/app-context';

interface WeatherAlertModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function WeatherAlertModal({ isOpen, onClose }: WeatherAlertModalProps) {
  const { lang, setView } = useApp();
  const [selectedDistrict, setSelectedDistrict] = useState('guntur');

  if (!isOpen) return null;

  const weatherData = [
    {
      id: 'guntur',
      district: 'Guntur District',
      temp: '30°C',
      condition: 'Heavy Unseasonal Rain Warning',
      rainRisk: 85,
      humidity: '88%',
      windSpeed: '18 km/h',
      severity: 'high',
      cropsAffected: ['Cotton', 'Paddy'],
      advisory: lang === 'te'
        ? 'వచ్చే 18 గంటల్లో భారీ వర్ష సూచన. పత్తి మరియు ధాన్యాన్ని తడిసిపోకుండా తార్పాలిన్ కవర్లతో కప్పండి. ఈరోజే వేగవంతమైన స్లాట్ బుక్ చేసుకోండి.'
        : lang === 'hi'
        ? 'अगले 18 घंटों में भारी बारिश की चेतावनी। कपास और धान को तिरपाल से ढकें। आज ही जल्दी स्लॉट बुक करें।'
        : 'Heavy unseasonal rainfall expected in next 18 hours. Cover stored Paddy & Cotton with waterproof tarpaulins. Book an early procurement slot today to prevent moisture penalties.',
    },
    {
      id: 'vijayawada',
      district: 'Krishna District (Vijayawada)',
      temp: '32°C',
      condition: 'Moderate Rain & Thunderstorms',
      rainRisk: 65,
      humidity: '82%',
      windSpeed: '14 km/h',
      severity: 'moderate',
      cropsAffected: ['Paddy (Grade A)', 'Maize'],
      advisory: lang === 'te'
        ? 'రేపు మధ్యాహ్నం ఉరుములతో కూడిన వర్షం పడే అవకాశం ఉంది. ఉదయం 10:30 AM స్లాట్ ఎంచుకోవడం ఉత్తమం.'
        : lang === 'hi'
        ? 'कल दोपहर गरज के साथ बारिश की संभावना। सुबह 10:30 बजे का स्लॉट चुनें।'
        : 'Afternoon thunderstorms expected tomorrow. Recommend booking morning slots before 11:30 AM to complete moisture verification before rain.',
    },
    {
      id: 'tenali',
      district: 'Tenali Region',
      temp: '31°C',
      condition: 'Optimal Sun Drying Window',
      rainRisk: 25,
      humidity: '74%',
      windSpeed: '10 km/h',
      severity: 'low',
      cropsAffected: ['Maize (Yellow)'],
      advisory: lang === 'te'
        ? 'మొక్కజొన్న ఆరబెట్టడానికి ఉదయం 10 AM నుండి 3 PM వరకు అనుకూలమైన ఎండ ఉంది. గరిష్ట MSP పొందేందుకు తేమ 13.5% లోపు ఉంచండి.'
        : lang === 'hi'
        ? 'मक्का सुखाने के लिए सुबह 10 से दोपहर 3 बजे तक धूप अनुकूल है। 13.5% से कम नमी रखें।'
        : 'Excellent solar drying conditions between 10:00 AM – 3:00 PM. Maintain grain moisture below 13.5% for 100% full MSP payout.',
    },
  ];

  const current = weatherData.find((w) => w.id === selectedDistrict) || weatherData[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl max-h-[90vh] overflow-hidden rounded-5xl bg-white shadow-glass-lg border border-forest-100 flex flex-col animate-scale-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-forest-900 p-6 text-white relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-glow">
              <CloudRain className="h-6 w-6" />
            </span>
            <div>
              <span className="chip bg-blue-400/20 text-blue-200 border border-blue-300/30 text-[11px] font-bold">
                AI Crop & Harvest Weather Radar
              </span>
              <h2 className="font-display text-2xl font-extrabold text-white mt-0.5">
                {lang === 'te' ? 'పంట వాతావరణ హెచ్చరికలు' : lang === 'hi' ? 'फसल मौसम चेतावनियां' : 'Crop Weather Alert System'}
              </h2>
            </div>
          </div>

          {/* District Selector Tabs */}
          <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
            {weatherData.map((item) => (
              <button
                key={item.id}
                onClick={() => setSelectedDistrict(item.id)}
                className={`px-3.5 py-2 text-xs font-bold rounded-xl shrink-0 transition flex items-center gap-1.5 ${
                  selectedDistrict === item.id
                    ? 'bg-white text-forest-950 shadow-sm'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                <MapPin className="h-3.5 w-3.5 text-blue-400" />
                {item.district}
                {item.severity === 'high' && (
                  <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Main Weather Card */}
          <div className={`rounded-4xl p-5 border text-white ${
            current.severity === 'high'
              ? 'bg-gradient-to-br from-rose-900 via-red-900 to-forest-900 border-rose-400/40 shadow-glass'
              : current.severity === 'moderate'
              ? 'bg-gradient-to-br from-amber-900 via-orange-950 to-forest-900 border-amber-400/40 shadow-glass'
              : 'bg-gradient-to-br from-emerald-900 via-forest-900 to-teal-950 border-leaf-400/40 shadow-glass'
          }`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-wider">{current.district}</p>
                <h3 className="font-display text-3xl font-extrabold mt-1">{current.condition}</h3>
              </div>
              <div className="text-right">
                <p className="font-display text-4xl font-extrabold text-gold-300">{current.temp}</p>
                <span className="chip bg-white/10 text-white text-[11px] mt-1 font-semibold">
                  Rain Risk: {current.rainRisk}%
                </span>
              </div>
            </div>

            {/* Metrics */}
            <div className="mt-5 grid grid-cols-3 gap-2 bg-white/10 rounded-2xl p-3 backdrop-blur text-center text-xs">
              <div>
                <p className="text-white/70 flex items-center justify-center gap-1">
                  <CloudRain className="h-3.5 w-3.5 text-blue-300" /> Rain Probability
                </p>
                <p className="font-bold text-sm mt-0.5">{current.rainRisk}%</p>
              </div>
              <div>
                <p className="text-white/70 flex items-center justify-center gap-1">
                  <Droplets className="h-3.5 w-3.5 text-leaf-300" /> Humidity
                </p>
                <p className="font-bold text-sm mt-0.5">{current.humidity}</p>
              </div>
              <div>
                <p className="text-white/70 flex items-center justify-center gap-1">
                  <Wind className="h-3.5 w-3.5 text-gold-300" /> Wind Speed
                </p>
                <p className="font-bold text-sm mt-0.5">{current.windSpeed}</p>
              </div>
            </div>
          </div>

          {/* AI Advisory Card */}
          <div className="rounded-3xl border border-leaf-200 bg-leaf-50/70 p-4 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-leaf-600 shrink-0" />
              <h4 className="font-display text-base font-extrabold text-forest-900">
                {lang === 'te' ? 'AI పంట సంరక్షణ సలహా' : lang === 'hi' ? 'AI फसल सुरक्षा सलाह' : 'AI Harvest Advisory & Moisture Protection'}
              </h4>
            </div>
            <p className="text-xs text-forest-800 leading-relaxed font-medium">
              {current.advisory}
            </p>
            <div className="flex items-center gap-2 pt-1">
              <span className="chip bg-leaf-200 text-leaf-900 text-[11px] font-bold">
                Affected Crops: {current.cropsAffected.join(', ')}
              </span>
            </div>
          </div>

          {/* Moisture Threshold Reference */}
          <div className="rounded-3xl border border-forest-100 bg-cream-50 p-4 space-y-3">
            <h5 className="font-display text-xs font-bold text-forest-700 uppercase tracking-wider">
              Optimal Moisture Standards for MSP Payout
            </h5>
            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="bg-white p-2.5 rounded-2xl border border-forest-100">
                <p className="font-bold text-forest-900">Paddy</p>
                <p className="text-leaf-700 font-extrabold mt-0.5">≤ 14.0%</p>
                <p className="text-[10px] text-forest-500">Max MSP Grade A</p>
              </div>
              <div className="bg-white p-2.5 rounded-2xl border border-forest-100">
                <p className="font-bold text-forest-900">Cotton</p>
                <p className="text-amber-700 font-extrabold mt-0.5">8.0% - 10%</p>
                <p className="text-[10px] text-forest-500">Medium Staple</p>
              </div>
              <div className="bg-white p-2.5 rounded-2xl border border-forest-100">
                <p className="font-bold text-forest-900">Maize</p>
                <p className="text-leaf-700 font-extrabold mt-0.5">≤ 13.5%</p>
                <p className="text-[10px] text-forest-500">Standard Payout</p>
              </div>
            </div>
          </div>

          {/* Action button */}
          <button
            onClick={() => {
              onClose();
              setView('dashboard');
            }}
            className="w-full btn-primary text-sm py-3.5 flex items-center justify-center gap-2"
          >
            {lang === 'te' ? 'వర్షం పడకముందే స్లాట్ బుక్ చేయండి' : lang === 'hi' ? 'बारिश से पहले स्लॉट बुक करें' : 'Book Procurement Slot Before Rain'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
