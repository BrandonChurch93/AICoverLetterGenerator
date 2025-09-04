import * as React from "react";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

/* Glass Card Component */
export const GlassCard = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "glass rounded-2xl p-6 transition-all duration-500",
        "hover:shadow-2xl hover:scale-[1.02]",
        "border border-white/20",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});
GlassCard.displayName = "GlassCard";

/* Futuristic Button Component */
interface FuturisticButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
  icon?: LucideIcon;
  iconPosition?: "left" | "right";
  isLoading?: boolean;
}

export const FuturisticButton = React.forwardRef<
  HTMLButtonElement,
  FuturisticButtonProps
>(
  (
    {
      className,
      children,
      variant = "primary",
      size = "md",
      icon: Icon,
      iconPosition = "left",
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    const [isHovering, setIsHovering] = React.useState(false);
    const [mousePos, setMousePos] = React.useState({ x: 0, y: 0 });

    const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
      setMousePos({ x, y });
    };

    const variants = {
      primary:
        "bg-gradient-to-r from-sky-500 to-sky-600 text-white shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40",
      secondary:
        "bg-gradient-to-r from-lime-500 to-lime-600 text-white shadow-lg shadow-lime-500/25 hover:shadow-lime-500/40",
      ghost:
        "bg-white/10 backdrop-blur-md text-gray-700 hover:bg-white/20 border border-white/20",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm",
      md: "px-6 py-3 text-base",
      lg: "px-8 py-4 text-lg",
    };

    return (
      <button
        ref={ref}
        className={cn(
          "relative overflow-hidden rounded-xl font-medium transition-all duration-300",
          "transform-gpu perspective-1000",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-95",
          variants[variant],
          sizes[size],
          isHovering && "scale-105",
          className
        )}
        style={{
          transform: isHovering
            ? `translate(${mousePos.x}px, ${mousePos.y}px) scale(1.05)`
            : "translate(0, 0) scale(1)",
        }}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => {
          setIsHovering(false);
          setMousePos({ x: 0, y: 0 });
        }}
        onMouseMove={handleMouseMove}
        disabled={disabled || isLoading}
        {...props}
      >
        {/* Shimmer effect */}
        <div
          className="absolute inset-0 -top-1/2 h-[200%] w-[200%] rotate-45 bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000"
          style={{
            transform: isHovering ? "translateX(100%)" : "translateX(-100%)",
          }}
        />

        {/* Content */}
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isLoading ? (
            <LoadingSpinner size="sm" />
          ) : (
            <>
              {Icon && iconPosition === "left" && <Icon className="w-4 h-4" />}
              {children}
              {Icon && iconPosition === "right" && <Icon className="w-4 h-4" />}
            </>
          )}
        </span>
      </button>
    );
  }
);
FuturisticButton.displayName = "FuturisticButton";

/* Floating Input Component - FIXED CHARACTER COUNTER */
interface FloatingInputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  showCount?: boolean;
}

export const FloatingInput = React.forwardRef<
  HTMLInputElement,
  FloatingInputProps
>(
  (
    {
      className,
      label,
      error,
      placeholder,
      maxLength,
      showCount = false,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState("");

    // Use controlled value if provided, otherwise use internal state
    const currentValue = value !== undefined ? String(value) : internalValue;
    const hasValue = currentValue.length > 0;
    const charCount = currentValue.length;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) {
        // Uncontrolled mode
        setInternalValue(e.target.value);
      }
      onChange?.(e);
    };

    return (
      <div className="relative">
        <input
          ref={ref}
          placeholder={placeholder || " "}
          value={currentValue}
          className={cn(
            "peer w-full px-4 pb-3 pt-10 text-base h-[72px]",
            "bg-white/50 backdrop-blur-md",
            "border-2 border-gray-200/50 rounded-xl",
            "transition-all duration-300",
            "placeholder:text-gray-400 placeholder:translate-y-1",
            "focus:outline-none focus:border-sky-500 focus:bg-white/70",
            "hover:border-gray-300/50",
            showCount && maxLength && "pr-16",
            error && "border-red-500 focus:border-red-500",
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          maxLength={maxLength}
          {...props}
        />
        <span
          className={cn(
            "absolute left-3 px-1 pointer-events-none z-10",
            "transition-all duration-300 origin-left",
            "before:absolute before:inset-0 before:z-[-1] before:bg-white/80 before:rounded",
            isFocused || hasValue
              ? [
                  "top-2 text-xs font-semibold text-gray-700",
                  isFocused && "text-sky-600",
                ]
              : "top-3 text-base font-medium text-gray-600"
          )}
        >
          {label}
        </span>

        {/* Character counter - FIXED */}
        {showCount && maxLength && (
          <span
            className={cn(
              "absolute bottom-3 right-3 text-xs transition-colors duration-300",
              charCount > maxLength * 0.9 ? "text-red-500" : "text-gray-400"
            )}
          >
            {charCount}/{maxLength}
          </span>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-500 animate-fade-up">{error}</p>
        )}
      </div>
    );
  }
);
FloatingInput.displayName = "FloatingInput";

/* Animated Textarea Component - FIXED CHARACTER COUNTER */
interface AnimatedTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  maxLength?: number;
  showCount?: boolean;
}

export const AnimatedTextarea = React.forwardRef<
  HTMLTextAreaElement,
  AnimatedTextareaProps
>(
  (
    {
      className,
      label,
      error,
      maxLength,
      showCount = true,
      placeholder,
      value,
      onChange,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState("");
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);

    React.useImperativeHandle(ref, () => textareaRef.current!);

    // Use controlled value if provided, otherwise use internal state
    const currentValue = value !== undefined ? String(value) : internalValue;
    const hasValue = currentValue.length > 0;
    const charCount = currentValue.length;

    // Auto-resize functionality
    const handleResize = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = "auto";
        textarea.style.height = `${Math.min(textarea.scrollHeight, 400)}px`;
      }
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (value === undefined) {
        // Uncontrolled mode
        setInternalValue(e.target.value);
      }
      handleResize();
      onChange?.(e);
    };

    // Resize when value changes externally
    React.useEffect(() => {
      handleResize();
    }, [currentValue, handleResize]);

    // Initial resize
    React.useEffect(() => {
      handleResize();
    }, [handleResize]);

    return (
      <div className="relative">
        <textarea
          ref={textareaRef}
          placeholder={placeholder || " "}
          value={currentValue}
          className={cn(
            "peer w-full px-4 pb-3 pt-10 text-base resize-none",
            "bg-white/50 backdrop-blur-md",
            "border-2 border-gray-200/50 rounded-xl",
            "transition-all duration-300",
            "placeholder:text-gray-400 placeholder:leading-relaxed placeholder:translate-y-1",
            "focus:outline-none focus:border-sky-500 focus:bg-white/70",
            "hover:border-gray-300/50",
            "min-h-[120px] max-h-[400px]",
            showCount && maxLength && "pb-10",
            error && "border-red-500 focus:border-red-500",
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          maxLength={maxLength}
          {...props}
        />
        <span
          className={cn(
            "absolute left-3 px-1 pointer-events-none z-10",
            "transition-all duration-300 origin-left",
            "before:absolute before:inset-0 before:z-[-1] before:bg-white/80 before:rounded",
            isFocused || hasValue
              ? ["top-2 text-xs text-gray-600", isFocused && "text-sky-500"]
              : "top-3 text-base text-gray-600"
          )}
        >
          {label}
        </span>

        {/* Character counter with background - FIXED */}
        {showCount && maxLength && (
          <span
            className={cn(
              "absolute bottom-3 right-3 text-xs transition-colors duration-300 z-10",
              "px-2 py-1 rounded-md",
              "before:absolute before:inset-0 before:z-[-1] before:bg-white/80 before:rounded",
              charCount > maxLength * 0.9 ? "text-red-500" : "text-gray-400"
            )}
          >
            {charCount}/{maxLength}
          </span>
        )}

        {error && (
          <p className="mt-1 text-sm text-red-500 animate-fade-up">{error}</p>
        )}
      </div>
    );
  }
);
AnimatedTextarea.displayName = "AnimatedTextarea";

/* Loading Spinner Component */
interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  className,
}) => {
  const sizes = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <div className={cn("relative", sizes[size], className)}>
      <div className="absolute inset-0 rounded-full border-2 border-gray-200/30" />
      <div className="absolute inset-0 rounded-full border-2 border-sky-500 border-t-transparent animate-spin" />
    </div>
  );
};

/* Progress Indicator Component */
interface ProgressIndicatorProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  steps,
  currentStep,
  className,
}) => {
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {steps.map((step, index) => {
        const isActive = index === currentStep;
        const isCompleted = index < currentStep;

        return (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center",
                  "transition-all duration-500 font-medium",
                  isActive &&
                    "bg-sky-500 text-white scale-110 animate-pulse-glow",
                  isCompleted && "bg-sky-500 text-white",
                  !isActive && !isCompleted && "bg-gray-200 text-gray-400"
                )}
              >
                {isCompleted ? "✓" : index + 1}
              </div>
              <span
                className={cn(
                  "mt-2 text-xs transition-colors duration-300",
                  isActive ? "text-sky-500 font-semibold" : "text-gray-400"
                )}
              >
                {step}
              </span>
            </div>

            {index < steps.length - 1 && (
              <div className="flex-1 h-[2px] bg-gray-200 mx-4 relative overflow-hidden">
                <div
                  className={cn(
                    "absolute inset-0 bg-sky-500 transition-transform duration-500",
                    isCompleted ? "translate-x-0" : "-translate-x-full"
                  )}
                />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

/* Auto Save Indicator Component */
interface AutoSaveIndicatorProps {
  status: "idle" | "saving" | "saved" | "error";
  className?: string;
}

export const AutoSaveIndicator: React.FC<AutoSaveIndicatorProps> = ({
  status,
  className,
}) => {
  const statusConfig = {
    idle: { text: "", icon: null },
    saving: { text: "Saving...", icon: <LoadingSpinner size="sm" /> },
    saved: { text: "Saved", icon: "✓" },
    error: { text: "Error saving", icon: "✕" },
  };

  const config = statusConfig[status];

  if (status === "idle") return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm animate-fade-up",
        status === "saved" && "text-green-500",
        status === "error" && "text-red-500",
        status === "saving" && "text-gray-400",
        className
      )}
    >
      {config.icon}
      <span>{config.text}</span>
    </div>
  );
};

/* Skip to Main Content Component */
export function SkipToMain() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-sky-500 focus:text-white focus:rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
    >
      Skip to main content
    </a>
  );
}

/* Particle Effect Component for Easter Eggs */
export function ParticleEffect({ enabled }: { enabled: boolean }) {
  if (!enabled) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {[...Array(20)].map((_, i) => (
        <div
          key={i}
          className="absolute animate-float-particle"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 10}s`,
          }}
        >
          <span className="text-2xl">
            {
              ["✨", "🌟", "⭐", "🎉", "🎯", "🚀"][
                Math.floor(Math.random() * 6)
              ]
            }
          </span>
        </div>
      ))}
    </div>
  );
}

/* Easter Egg Notification Component */
export function EasterEggNotification({ message }: { message: string | null }) {
  if (!message) return null;

  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 animate-bounce-in">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-3 rounded-full shadow-2xl">
        <p className="text-sm font-medium">{message}</p>
      </div>
    </div>
  );
}

/* Achievement Display Component */
interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export function AchievementDisplay({
  achievements,
}: {
  achievements: Achievement[];
}) {
  const unlockedCount = achievements.filter((a) => a.unlocked).length;

  return (
    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl">
      <h3 className="text-lg font-bold mb-3 text-gray-800">
        Achievements ({unlockedCount}/{achievements.length})
      </h3>
      <div className="grid grid-cols-2 gap-3">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            className={cn(
              "p-3 rounded-lg border-2 transition-all",
              achievement.unlocked
                ? "border-green-400 bg-green-50"
                : "border-gray-200 bg-gray-50 opacity-50"
            )}
          >
            <div className="flex items-center gap-2">
              <span className="text-2xl">{achievement.icon}</span>
              <div>
                <p className="font-medium text-sm text-gray-800">
                  {achievement.title}
                </p>
                <p className="text-xs text-gray-600">
                  {achievement.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
