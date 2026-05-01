import React from 'react';
import './Schedule.css';

export interface ScheduleItemProps {
  /** Time range, e.g. "08:30–09:30" */
  time: string;
  /** Session title */
  title: string;
  /** Speaker name and credentials */
  speaker?: string;
  /** Optional description */
  description?: string;
  className?: string;
}

const ScheduleItem: React.FC<ScheduleItemProps> = ({
  time,
  title,
  speaker,
  description,
  className = '',
}) => (
  <li
    className={`schedule-item grid grid-cols-[6rem_1fr] gap-x-4 py-3 border-b border-border-1 last:border-b-0 ${className}`}
  >
    <time className="text-sm font-medium text-(--text-subtle) pt-0.5">{time}</time>
    <div>
      <h4>{title}</h4>
      {speaker && (
        <p className="text-sm text-(--text-muted) mt-0.5">{speaker}</p>
      )}
      {description && <p className="mt-1 text-sm">{description}</p>}
    </div>
  </li>
);

export interface ScheduleProps {
  children: React.ReactNode;
  className?: string;
}

const Schedule: React.FC<ScheduleProps> = ({ children, className = '' }) => (
  <ul className={`mb-8 list-none p-0 ${className}`} aria-label="Schedule">
    {children}
  </ul>
);

export { Schedule, ScheduleItem };
