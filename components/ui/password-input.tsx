import React, { forwardRef, useState } from "react";
import { LucideIcon, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  icon?: LucideIcon;
  error?: string;
  helperText?: string;
  containerClassName?: string;
  labelClassName?: string;
  inputClassName?: string;
  showToggle?: boolean;
}

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  (
    {
      label,
      icon: Icon,
      error,
      helperText,
      containerClassName = "",
      labelClassName = "",
      inputClassName = "",
      className = "",
      disabled,
      showToggle = true,
      ...props
    },
    ref
  ) => {
    const [showPassword, setShowPassword] = useState(false);

    const baseInputClasses =
      "w-full px-4 py-3 border rounded-lg transition-all duration-200 focus:outline-none";
    const defaultInputClasses =
      "border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent";
    const disabledInputClasses =
      "border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed";
    const errorInputClasses =
      "border-red-300 focus:ring-red-500 focus:border-red-300";

    const inputClasses = [
      baseInputClasses,
      showToggle ? "pr-12" : "",
      disabled
        ? disabledInputClasses
        : error
        ? errorInputClasses
        : defaultInputClasses,
      inputClassName,
      className,
    ].join(" ");

    const baseLabelClasses = "flex items-center gap-2 text-sm font-medium";
    const defaultLabelClasses = "text-gray-700";
    const disabledLabelClasses = "text-gray-500";
    const errorLabelClasses = "text-red-700";

    const labelClasses = [
      baseLabelClasses,
      disabled
        ? disabledLabelClasses
        : error
        ? errorLabelClasses
        : defaultLabelClasses,
      labelClassName,
    ].join(" ");

    const baseIconClasses = "text-blue-600";
    const disabledIconClasses = "text-gray-400";
    const errorIconClasses = "text-red-600";

    const iconClasses = [
      disabled
        ? disabledIconClasses
        : error
        ? errorIconClasses
        : baseIconClasses,
    ].join(" ");

    return (
      <div className={`space-y-2 ${containerClassName}`}>
        {label && (
          <label className={labelClasses}>
            {Icon && <Icon size={16} className={iconClasses} />}
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            type={showPassword ? "text" : "password"}
            className={inputClasses}
            disabled={disabled}
            {...props}
          />

          {showToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
              disabled={disabled}
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          )}

          {error && <p className="mt-1 text-sm text-red-600">{error}</p>}

          {helperText && !error && (
            <p className="mt-1 text-sm text-gray-500">{helperText}</p>
          )}
        </div>
      </div>
    );
  }
);

PasswordInput.displayName = "PasswordInput";

export default PasswordInput;
