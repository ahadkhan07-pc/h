import React from 'react';
import { Smartphone, Monitor } from 'lucide-react';
import { ThemeMode } from '../types/hisab';

interface RedmiFrameWrapperProps {
  isDeviceFrame: boolean;
  onToggleFrame: () => void;
  themeMode: ThemeMode;
  children: React.ReactNode;
}

export const RedmiFrameWrapper: React.FC<RedmiFrameWrapperProps> = ({
  isDeviceFrame,
  onToggleFrame,
  themeMode,
  children,
}) => {
  const isLight = themeMode === 'light';

  if (!isDeviceFrame) {
    return (
      <div
        className={`w-full max-w-xl mx-auto min-h-screen transition-colors ${
          isLight ? 'bg-[#F8F5FC]' : 'bg-[#08060B]'
        }`}
      >
        {children}
      </div>
    );
  }

  return (
    <div
      className={`min-h-screen py-4 sm:py-8 px-2 flex flex-col items-center justify-center transition-colors ${
        isLight ? 'bg-[#EDE7F5]' : 'bg-[#050308]'
      }`}
    >
      {/* Device frame header control */}
      <div
        className={`mb-3 flex items-center justify-between w-full max-w-[420px] px-2 text-xs font-mono ${
          isLight ? 'text-[#695B7E]' : 'text-[#948BA5]'
        }`}
      >
        <span
          className={`flex items-center gap-1.5 font-bold ${
            isLight ? 'text-[#160F24]' : 'text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5 text-[#7C3AED] dark:text-[#8B5CF6]" />
          Redmi Note 14 Pro · Android 16
        </span>
        <button
          onClick={onToggleFrame}
          className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer ${
            isLight
              ? 'bg-[#FFFFFF] hover:bg-[#F8F4FD] border-[#DECFF2] text-[#7C3AED]'
              : 'bg-[#140E20] hover:bg-[#1E1430] border-[#2B1D42] text-[#8B5CF6]'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Screen</span>
        </button>
      </div>

      {/* Flagship Redmi Phone Outer Frame */}
      <div
        className={`relative w-full max-w-[410px] rounded-[48px] p-3.5 border-4 shadow-2xl transition-colors ${
          isLight
            ? 'bg-[#E5DCEF] border-[#D1C3E2] shadow-purple-900/10'
            : 'bg-[#161122] border-[#2D2045] shadow-purple-950/40'
        }`}
      >
        {/* Hardware buttons on right */}
        <div
          className={`absolute -right-2 top-28 w-1.5 h-12 rounded-r-md ${
            isLight ? 'bg-[#C7B7DC]' : 'bg-[#2D2045]'
          }`}
        />
        <div
          className={`absolute -right-2 top-44 w-1.5 h-20 rounded-r-md ${
            isLight ? 'bg-[#C7B7DC]' : 'bg-[#2D2045]'
          }`}
        />

        {/* Inner Phone Screen */}
        <div
          className={`relative w-full rounded-[38px] overflow-hidden border flex flex-col max-h-[860px] min-h-[720px] transition-colors ${
            isLight
              ? 'bg-[#F8F5FC] border-[#E2D5F0]'
              : 'bg-[#08060B] border-[#25193B]'
          }`}
        >
          {/* Punch Hole Camera */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center pointer-events-none">
            <div className="w-3.5 h-3.5 rounded-full bg-black border border-[#201533] shadow-inner flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-[#181128]" />
            </div>
          </div>

          {/* Phone Screen App Content */}
          <div className="flex-1 overflow-y-auto flex flex-col relative">{children}</div>

          {/* Android 16 Home Navigation Gesture Pill */}
          <div
            className={`w-full py-1.5 flex items-center justify-center shrink-0 transition-colors ${
              isLight ? 'bg-[#F8F5FC]' : 'bg-[#08060B]'
            }`}
          >
            <div
              className={`w-28 h-1 rounded-full ${
                isLight ? 'bg-[#C5B7D8]' : 'bg-[#493966]'
              }`}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
