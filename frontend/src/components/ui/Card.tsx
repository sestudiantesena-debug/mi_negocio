import { cn } from '@/lib/utils';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined' | 'elevated';
}

export const Card = ({ className, variant = 'default', children, ...props }: CardProps) => {
  const variants = {
    default: 'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden transition-shadow hover:shadow-md',
    outlined: 'bg-white rounded-xl border-2 border-gray-200 overflow-hidden',
    elevated: 'bg-white rounded-xl shadow-lg overflow-hidden',
  };

  return (
    <div className={cn(variants[variant], className)} {...props}>
      {children}
    </div>
  );
};

export const CardHeader = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-4 border-b border-gray-100', className)} {...props}>
    {children}
  </div>
);

export const CardTitle = ({ className, children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3 className={cn('text-lg font-semibold text-gray-900', className)} {...props}>
    {children}
  </h3>
);

export const CardDescription = ({ className, children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn('text-sm text-gray-500 mt-1', className)} {...props}>
    {children}
  </p>
);

export const CardContent = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-4', className)} {...props}>
    {children}
  </div>
);

export const CardFooter = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('px-6 py-4 border-t border-gray-100 bg-gray-50', className)} {...props}>
    {children}
  </div>
);