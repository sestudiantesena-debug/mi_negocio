import { forwardRef, InputHTMLAttributes, LabelHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <input
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 transition-colors',
          'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          'disabled:bg-gray-50 disabled:cursor-not-allowed',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${props.id}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
);

Input.displayName = 'Input';

export const Label = forwardRef<HTMLLabelElement, LabelHTMLAttributes<HTMLLabelElement>>(
  ({ className, children, ...props }, ref) => (
    <label ref={ref} className={cn('block text-sm font-medium text-gray-700 mb-1.5', className)} {...props}>
      {children}
    </label>
  )
);

Label.displayName = 'Label';

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, error, ...props }, ref) => (
    <div className="w-full">
      <textarea
        ref={ref}
        className={cn(
          'w-full rounded-lg border bg-white px-4 py-2.5 text-sm placeholder:text-gray-400 transition-colors resize-y min-h-[100px]',
          'focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          'disabled:bg-gray-50 disabled:cursor-not-allowed',
          error ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-300',
          className
        )}
        aria-invalid={error ? 'true' : 'false'}
        aria-describedby={error ? `${props.id}-error` : undefined}
        {...props}
      />
      {error && (
        <p id={`${props.id}-error`} className="mt-1.5 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  )
);

Textarea.displayName = 'Textarea';