import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  id,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedBy,
  ...props
}, ref) => {
  // Generate unique ID if not provided
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const errorId = `${inputId}-error`;
  const helperId = `${inputId}-helper`;
  
  // Build aria-describedby attribute
  const describedBy = [
    error && errorId,
    helperText && !error && helperId,
    ariaDescribedBy
  ].filter(Boolean).join(' ') || undefined;

  const inputClasses = `
    input
    ${error ? 'input-error' : ''}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${className}
  `.trim();

  return (
    <div className={`space-y-1 ${containerClassName}`}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div 
            className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"
            aria-hidden="true"
          >
            <span className="text-gray-400 dark:text-gray-500">
              {leftIcon}
            </span>
          </div>
        )}
        
        <motion.input
          ref={ref}
          id={inputId}
          className={inputClasses}
          whileFocus={{ scale: 1.01 }}
          transition={{ duration: 0.1 }}
          aria-label={ariaLabel || (!label ? props.placeholder : undefined)}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={describedBy}
          aria-errormessage={error ? errorId : undefined}
          {...props}
        />
        
        {rightIcon && (
          <div 
            className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none"
            aria-hidden="true"
          >
            <span className="text-gray-400 dark:text-gray-500">
              {rightIcon}
            </span>
          </div>
        )}
      </div>
      
      {error && (
        <motion.p
          id={errorId}
          role="alert"
          className="text-sm text-danger-600 dark:text-danger-400"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          aria-live="polite"
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p 
          id={helperId}
          className="text-sm text-gray-500 dark:text-gray-400"
        >
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
