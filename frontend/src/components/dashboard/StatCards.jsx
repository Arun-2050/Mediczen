import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Bed, Stethoscope, Truck, ArrowRight } from 'lucide-react';

export default function StatCards({
  availableBeds = 86,
  availableDoctors = 126,
  availableAmbulances = 32
}) {
  const navigate = useNavigate();

  const handleArrowClick = (resourceType) => {
    navigate('/help', { state: { preselectResource: resourceType } });
  };

  const cards = [
    {
      id: 'beds',
      title: 'Beds',
      count: availableBeds,
      subtitle: 'Available hospital beds',
      icon: Bed,
      bars: [30, 45, 60, 40, 85, 95]
    },
    {
      id: 'doctors',
      title: 'Doctors',
      count: availableDoctors,
      subtitle: 'Available doctors',
      icon: Stethoscope,
      bars: [50, 70, 85, 45, 90, 100]
    },
    {
      id: 'ambulances',
      title: 'Ambulances',
      count: availableAmbulances,
      subtitle: 'Available ambulance',
      icon: Truck,
      bars: [25, 40, 95, 60, 80, 70]
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            key={card.id}
            className="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-100 dark:border-slate-700/80 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between"
          >
            {/* Header row */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-bold text-slate-800 dark:text-slate-100 text-base">{card.title}</span>
              </div>
              <button
                onClick={() => handleArrowClick(card.id)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-700 transition-colors"
                title={`Demand More ${card.title} in Help Center`}
              >
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Main content row with count and mini bars */}
            <div className="flex items-end justify-between mt-2">
              <div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {card.count}
                </div>
                <p className="text-xs text-slate-400 dark:text-slate-500 font-medium mt-1">
                  {card.subtitle}
                </p>
              </div>

              {/* Sparkline Bar Chart */}
              <div className="flex items-end gap-1.5 h-12">
                {card.bars.map((height, i) => (
                  <div
                    key={i}
                    style={{ height: `${height}%` }}
                    className={`w-2.5 rounded-sm transition-all duration-300 ${
                      i >= card.bars.length - 2
                        ? 'bg-blue-600 dark:bg-blue-500'
                        : 'bg-blue-100 dark:bg-slate-700'
                    }`}
                  ></div>
                ))}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
