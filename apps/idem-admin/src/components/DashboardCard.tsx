import Link from 'next/link';
import { LucideIcon } from 'lucide-react';

import { Card } from '@eventuras/ratio-ui/core/Card';
import { Heading } from '@eventuras/ratio-ui/core/Heading';
import { Text } from '@eventuras/ratio-ui/core/Text';

type DashboardCardProps = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
  disabled?: boolean;
};

export function DashboardCard({
  title,
  description,
  href,
  icon: Icon,
  disabled = false,
}: DashboardCardProps) {
  const content = (
    <Card
      variant="outline"
      hoverEffect={!disabled}
      className={disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
    >
      <div className="flex items-start gap-4">
        <div className="p-3 bg-primary-100 dark:bg-primary-900 rounded-lg">
          <Icon className="h-6 w-6 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
          <Heading as="h3" className="text-lg font-semibold">
            {title}
          </Heading>
          <Text className="text-sm text-muted mt-1">{description}</Text>
        </div>
      </div>
    </Card>
  );

  if (disabled) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}
