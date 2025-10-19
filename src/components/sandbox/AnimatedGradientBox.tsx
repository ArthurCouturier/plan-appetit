import { forwardRef, TextareaHTMLAttributes } from 'react';

interface AnimatedGradientBoxProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  animatedPlaceholder?: string;
}

const AnimatedGradientBox = forwardRef<HTMLTextAreaElement, AnimatedGradientBoxProps>(
  ({ animatedPlaceholder, className = '', ...props }, ref) => {
    return (
      <div className="relative w-full group">
        {/* Animated gradient border - only visible as border */}
        <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-r from-cout-base via-cout-purple to-cout-yellow opacity-75 group-focus-within:opacity-100 transition duration-300 animate-gradient-x">
          <div className="absolute inset-[2px] bg-primary rounded-2xl"></div>
        </div>

        {/* Input container */}
        <div className="relative">
          <textarea
            ref={ref}
            className={`
              w-full px-6 py-4
              bg-transparent text-text-primary
              rounded-2xl
              border-0
              focus:outline-none focus:ring-0
              transition-all duration-300
              placeholder:text-text-secondary placeholder:opacity-60
              resize-none
              relative z-10
              ${className}
            `}
            placeholder={animatedPlaceholder}
            rows={1}
            style={{
              minHeight: '60px',
              maxHeight: '200px',
            }}
            onInput={(e) => {
              const target = e.target as HTMLTextAreaElement;
              target.style.height = 'auto';
              target.style.height = `${Math.min(target.scrollHeight, 200)}px`;
            }}
            {...props}
          />
        </div>

        <style>{`
          @keyframes gradient-x {
            0%, 100% {
              background-position: 0% 50%;
            }
            50% {
              background-position: 100% 50%;
            }
          }

          .animate-gradient-x {
            background-size: 200% 200%;
            animation: gradient-x 3s ease infinite;
            will-change: background-position;
          }
        `}</style>
      </div>
    );
  }
);

AnimatedGradientBox.displayName = 'AnimatedGradientBox';

export default AnimatedGradientBox;
