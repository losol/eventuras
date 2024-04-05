'use client';
import { EventDto, EventStatisticsDto, ProductDto, RegistrationDto } from '@eventuras/sdk';
import { Container, Section } from '@eventuras/ui';
import { useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';

import { ParticipationTypes, ParticipationTypesKey } from '@/types';

import EventParticipantList from '../EventParticipantList';
import EventStatistics from '../EventStatistics';

export type ParticipantsSectionProps = {
  statistics: EventStatisticsDto;
  participants: RegistrationDto[];
  eventInfo: EventDto;
  eventProducts: ProductDto[];
};

const initialSelectedStatistics = {
  [ParticipationTypes.active]: false,
  [ParticipationTypes.waitingList]: false,
  [ParticipationTypes.cancelled]: false,
};

export type StatisticsSelection = typeof initialSelectedStatistics;

const ParticipantsSection: React.FC<ParticipantsSectionProps> = props => {
  const router = useRouter();
  const [selectedStatistic, setSelectedStatistic] =
    useState<StatisticsSelection>(initialSelectedStatistics);
  const highlightedSelection = useMemo(
    () =>
      Object.keys(initialSelectedStatistics).filter(k => {
        const tK = k as ParticipationTypesKey;
        return selectedStatistic[tK] === true;
      })[0],
    [selectedStatistic]
  );
  return (
    <>
      <Section className="py-12">
        <Container>
          <EventStatistics
            highlightedSelection={highlightedSelection}
            statistics={props.statistics}
            onSelectionChanged={(selection: string) => {
              const s = selection as ParticipationTypesKey;
              setSelectedStatistic({
                ...initialSelectedStatistics,
                [selection]: !selectedStatistic[s],
              });
            }}
          />
        </Container>
      </Section>
      <Section className="py-12">
        <Container>
          {props.participants && (
            <EventParticipantList
              participants={props.participants ?? []}
              event={props.eventInfo}
              eventProducts={props.eventProducts ?? []}
              filteredStatus={highlightedSelection}
            />
          )}
        </Container>
      </Section>
    </>
  );
};

export default ParticipantsSection;
