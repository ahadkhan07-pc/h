import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ThemeMode } from '../types/hisab';

interface SplashViewProps {
  onDismiss: () => void;
  lang?: 'en' | 'bn';
  themeMode?: ThemeMode;
}

export const SplashView: React.FC<SplashViewProps> = ({
  onDismiss,
  lang = 'bn',
  themeMode = 'light',
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const isLight = themeMode === 'light';

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onDismiss, 350);
    }, 1600);

    return () => clearTimeout(timer);
  }, [onDismiss]);

  const handleManualSkip = () => {
    setIsVisible(false);
    setTimeout(onDismiss, 250);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.3 }}
          onClick={handleManualSkip}
          className={`fixed inset-0 z-50 flex flex-col items-center justify-between p-8 select-none cursor-pointer transition-colors ${
            isLight ? 'bg-[#F8F5FC] text-[#160F24]' : 'bg-[#08060B] text-white'
          }`}
        >
          {/* Top Status (Swapped: Indicator dot is now Purple) */}
          <div
            className={`w-full flex items-center justify-between text-xs font-mono tracking-wider pt-2 ${
              isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
            }`}
          >
            <span className="flex items-center gap-1.5 font-bold">
              <span className="w-2 h-2 rounded-full bg-[#8B5CF6]" />
              JETPACK COMPOSE
            </span>
            <span>DATASTORE + ROOM</span>
          </div>

          {/* Central Luxury Logo Emblem */}
          <div className="flex flex-col items-center text-center my-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.12, duration: 0.45, ease: 'easeOut' }}
              className={`relative w-24 h-24 mb-6 flex items-center justify-center rounded-3xl border-2 shadow-2xl transition-colors ${
                isLight
                  ? 'bg-[#FFFFFF] border-[#DECFF0]'
                  : 'bg-[#130E1D] border-[#2D2045]'
              }`}
            >
              {/* Inner geometric luxury mark */}
              <div
                className={`absolute inset-2 rounded-2xl border flex items-center justify-center ${
                  isLight
                    ? 'border-[#EDE2F7] bg-[#FAF6FE]'
                    : 'border-[#3C2A5C] bg-[#171124]'
                }`}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-xl ${
                    isLight ? 'bg-[#F0E6FC]' : 'bg-[#21163A]'
                  }`}
                >
                  <span className="text-2xl font-bold font-mono tracking-tighter text-[#7C3AED] dark:text-[#8B5CF6]">
                    হিসাব
                  </span>
                </div>
              </div>

              {/* Accent corner dots - Swapped: Top-Right is Purple, Top-Left is Pink */}
              <span
                className={`absolute -top-1 -right-1 w-3 h-3 rounded-full bg-[#8B5CF6] border-2 ${
                  isLight ? 'border-[#F8F5FC]' : 'border-[#08060B]'
                }`}
              />
              <span
                className={`absolute -bottom-1 -left-1 w-3 h-3 rounded-full bg-[#F97316] border-2 ${
                  isLight ? 'border-[#F8F5FC]' : 'border-[#08060B]'
                }`}
              />
              <span
                className={`absolute -top-1 -left-1 w-2.5 h-2.5 rounded-full bg-[#D946EF] border-2 ${
                  isLight ? 'border-[#F8F5FC]' : 'border-[#08060B]'
                }`}
              />
            </motion.div>

            <motion.h1
              initial={{ y: 12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.22, duration: 0.35 }}
              className={`text-2xl sm:text-3xl font-extrabold tracking-tight mb-1.5 ${
                isLight ? 'text-[#160F24]' : 'text-white'
              }`}
            >
              My Daily Hisab
            </motion.h1>

            <motion.p
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.32, duration: 0.35 }}
              className="text-base text-[#7C3AED] dark:text-[#8B5CF6] font-bold tracking-wide mb-4"
            >
              আমার দৈনিক হিসাব
            </motion.p>

            {/* Sub-label badges */}
            <div
              className={`flex items-center gap-2 text-xs font-mono ${
                isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
              }`}
            >
              <span
                className={`px-2.5 py-1 rounded border font-semibold ${
                  isLight
                    ? 'bg-[#FFFFFF] border-[#E5DBF0] text-[#7C3AED]'
                    : 'bg-[#161022] border-[#2B1F42] text-[#8B5CF6]'
                }`}
              >
                Android 10 - 16
              </span>
              <span>·</span>
              <span
                className={`px-2.5 py-1 rounded border font-semibold ${
                  isLight
                    ? 'bg-[#FFFFFF] border-[#E5DBF0] text-[#EA580C]'
                    : 'bg-[#161022] border-[#2B1F42] text-[#FB923C]'
                }`}
              >
                Offline Room DB
              </span>
            </div>
          </div>

          {/* Bottom Luxury Footer */}
          <div className="w-full text-center pb-4">
            <p
              className={`text-xs font-mono ${
                isLight ? 'text-[#87789E]' : 'text-[#665A7C]'
              }`}
            >
              Tasteful Luxury UI · Zero Green · Pure Solid Accents
            </p>
            <p
              className={`text-[11px] mt-1 ${
                isLight ? 'text-[#9E8FB5]' : 'text-[#473766]'
              }`}
            >
              Tap anywhere to launch
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
