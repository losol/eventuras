/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CalendarSystem } from './CalendarSystem';
import type { Era } from './Era';
import type { IsoDayOfWeek } from './IsoDayOfWeek';
export type LocalDate = {
    calendar?: CalendarSystem;
    year?: number;
    month?: number;
    day?: number;
    dayOfWeek?: IsoDayOfWeek;
    readonly yearOfEra?: number;
    era?: Era;
    readonly dayOfYear?: number;
};

