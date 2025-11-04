'use client';
import { useMemo, useState } from 'react';

import { EventDto, EventStatisticsDto, ProductDto, RegistrationDto } from '@/lib/eventuras-sdk';
import { ParticipationTypes, ParticipationTypesKey } from '@/types';

import EventParticipantList from '../EventParticipantList';

export type ParticipantsSectionProps = {
  statistics: EventStatisticsDto;
  participants: RegistrationDto[];
  eventInfo: EventDto;
  eventProducts: ProductDto[];
};
const initialSelectedStatistics = {
  [ParticipationTypes.active]: true,
  [ParticipationTypes.waitingList]: false,
  [ParticipationTypes.cancelled]: false,
};
export type StatisticsSelection = typeof initialSelectedStatistics;
const ParticipantsSection: React.FC<ParticipantsSectionProps> = props => {
  const [selectedStatistic, setSelectedStatistic] =
    useState<StatisticsSelection>(initialSelectedStatistics);
  const highlightedSelection = useMemo(
    () =>
      Object.keys(initialSelectedStatistics).find(k => {
        const tK = k as ParticipationTypesKey;
        return selectedStatistic[tK] === true;
      }),
    [selectedStatistic]
  );
  return (
    <div className="space-y-8 py-8">
      {/* Participants List with integrated filters and Add User button */}
      <div>
        {props.participants && (
          <EventParticipantList
            participants={props.participants ?? []}
            event={props.eventInfo}
            eventProducts={props.eventProducts ?? []}
            statistics={props.statistics}
            filteredStatus={highlightedSelection}
            onStatusFilterChange={(selection: string) => {
              const s = selection as ParticipationTypesKey;
              setSelectedStatistic({
                [ParticipationTypes.active]: false,
                [ParticipationTypes.waitingList]: false,
                [ParticipationTypes.cancelled]: false,
                [selection]: !selectedStatistic[s],
              });
            }}
            showAddUser={true}
          />
        )}
      </div>
    </div>
  );
};
export default ParticipantsSection;
