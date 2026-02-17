'use client';

import { cn } from '@/lib/utils';

interface SettingsSectionProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  description,
  children,
  className,
}: SettingsSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div>
        <h3 className="text-lg font-semibold text-charcoal">{title}</h3>
        {description && (
          <p className="text-sm text-charcoal-light mt-1">{description}</p>
        )}
      </div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

interface SettingsItemProps {
  label: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function SettingsItem({
  label,
  description,
  children,
  className,
}: SettingsItemProps) {
  return (
    <div
      className={cn(
        'flex items-center justify-between py-3 border-b border-cream-200 last:border-0',
        className
      )}
    >
      <div className="flex-1">
        <p className="font-medium text-charcoal">{label}</p>
        {description && (
          <p className="text-sm text-charcoal-light mt-0.5">{description}</p>
        )}
      </div>
      <div className="ml-4">{children}</div>
    </div>
  );
}
