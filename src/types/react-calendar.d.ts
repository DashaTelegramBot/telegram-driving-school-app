declare module 'react-calendar' {
  import { ComponentType } from 'react';
  
  export interface CalendarProps {
    onChange?: (value: Date | Date[] | null) => void;
    value?: Date | Date[] | null;
    minDate?: Date;
    maxDate?: Date;
    locale?: string;
    className?: string;
    tileDisabled?: ({ date }: { date: Date }) => boolean;
    tileContent?: ({ date }: { date: Date }) => JSX.Element | null;
  }
  
  export const Calendar: ComponentType<CalendarProps>;
}

declare module 'react-calendar/dist/Calendar.css';