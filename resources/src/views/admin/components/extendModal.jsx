import React, { useState, useEffect } from 'react';
import { Users, Activity, ChevronRight, X, Check, Zap } from 'lucide-react';

// Subscription Modal Component
export const ExtendModal = ({ isOpen, onClose, hospitalName, onSubscribe }) => {
  const [selectedPlan, setSelectedPlan] = useState('monthly');
  
  const plans = [
    {
      id: 'monthly',
      name: 'A Month',
      price: '75 ICP',
      period: '+ 1 month',
      description: 'Perfect for short-term needs',
      popular: false
    },
    {
      id: 'yearly',
      name: 'A Year',
      price: '475 ICP',
      period: '+ 1 year',
      description: 'Best value - Most popular!',
      popular: true
    },
    {
      id: 'lifetime',
      name: 'Lifetime',
      price: '975 ICP',
      period: 'one-time',
      description: 'Pay once, access forever',
      popular: false
    }
  ];

  const handleExtend = () => {
    onSubscribe(selectedPlan);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full h-[90vh] sm:h-auto sm:max-h-[75vh] overflow-hidden mx-2 sm:mx-0 flex flex-col">
        <div className="p-3 sm:p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0 pr-2">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 truncate">Extend Your Hospital Access</h2>
              <p className="text-gray-600 text-xs sm:text-sm mt-1 truncate">Choose a plan for {hospitalName}</p>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <div className="p-3 sm:p-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 sm:mb-6">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative rounded-xl border-2 p-3 cursor-pointer transition-all duration-300 ${
                  selectedPlan === plan.id
                    ? 'border-blue-500 bg-blue-50 shadow-lg scale-102'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md hover:scale-101'
                } ${plan.popular ? 'ring-1 ring-blue-500 ring-opacity-30' : ''}`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                {plan.popular && (
                  <div className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-semibold">
                      Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-3">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{plan.name}</h3>
                  <div className="flex items-baseline justify-center">
                    <span className="text-2xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-500 text-xs ml-1">{plan.period}</span>
                  </div>
                </div>
                
                {/* Show description only for selected plan */}
                {selectedPlan === plan.id && (
                  <div className="mb-3 transition-all duration-300 ease-in-out">
                    <p className="text-xs text-gray-600 text-center mb-2">{plan.description}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0">
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-600 hover:text-gray-800 font-semibold transition-colors order-2 sm:order-1"
            >
              Cancel
            </button>
            <button
              onClick={handleExtend}
              className="w-full sm:w-auto px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold rounded-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center space-x-2 order-1 sm:order-2"
            >
              <Zap className="w-4 h-4" />
              <span>Extend {plans.find(p => p.id === selectedPlan)?.name}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};