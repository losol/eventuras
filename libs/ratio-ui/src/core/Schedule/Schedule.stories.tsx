import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { Heading } from '../Heading/Heading';

import { Schedule, ScheduleItem } from './Schedule';

const meta: Meta<typeof Schedule> = {
  component: Schedule,
  tags: ['autodocs'],
};

export default meta;

export const SingleDay: StoryObj = {
  render: () => (
    <Schedule>
      <ScheduleItem time="09:00–09:30" title="Registration and coffee" />
      <ScheduleItem
        time="09:30–10:00"
        title="Welcome and introduction"
        speaker="Conference committee"
      />
      <ScheduleItem
        time="10:00–11:00"
        title="Opening keynote: Building resilient systems"
        speaker="Dr. Maria Chen, CTO, Acme Corp"
        description="An overview of architectural patterns for distributed systems that gracefully handle failure."
      />
      <ScheduleItem
        time="11:00–11:30"
        title="Q&A and discussion"
        speaker="All participants"
      />
      <ScheduleItem time="12:00" title="Lunch" />
    </Schedule>
  ),
};

export const MultiDay: StoryObj = {
  render: () => (
    <article className="max-w-2xl mx-auto">
      <Heading as="h1">Nordic Developer Conference</Heading>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        Tromsø, 10–12 June 2026 · Arctic Convention Centre
      </p>

      <Heading as="h2">Wednesday 10 June</Heading>
      <Schedule>
        <ScheduleItem time="09:00–09:30" title="Registration and coffee" />
        <ScheduleItem
          time="09:30–10:00"
          title="Welcome and introduction"
          speaker="Conference committee"
        />
        <ScheduleItem
          time="10:00–11:00"
          title="Keynote: The future of web standards"
          speaker="Dr. Maria Chen, browser engineering lead"
          description="A deep dive into upcoming web platform capabilities and what they mean for application architecture."
        />
        <ScheduleItem time="11:00–11:30" title="Break" />
        <ScheduleItem
          time="11:30–12:30"
          title="TypeScript patterns for large codebases"
          speaker="Erik Johansen, staff engineer"
          description="Practical type-level techniques for maintaining type safety across monorepo boundaries."
        />
        <ScheduleItem time="12:30" title="Dinner" />
      </Schedule>

      <Heading as="h2">Thursday 11 June</Heading>

      <Heading as="h3">Morning</Heading>
      <Schedule>
        <ScheduleItem time="08:30–09:00" title="Recap from day 1" speaker="Moderator" />
        <ScheduleItem
          time="09:00–10:00"
          title="Observability beyond logging"
          speaker="Kari Nordström, SRE, CloudScale"
          description="Structured tracing, metrics pipelines, and how to build dashboards that actually help during incidents."
        />
        <ScheduleItem
          time="10:00–11:00"
          title="Database design for event-driven systems"
          speaker="Anders Bakke, data architect"
        />
        <ScheduleItem time="11:00–11:30" title="Break" />
      </Schedule>

      <Heading as="h3">Outdoor activity</Heading>
      <Schedule>
        <ScheduleItem
          time="11:30–17:00"
          title="Hiking in the midnight sun"
          description="Optional group hike. Meet in the lobby at 11:15."
        />
      </Schedule>

      <Heading as="h3">Afternoon</Heading>
      <Schedule>
        <ScheduleItem
          time="17:00–18:00"
          title="Accessibility as a first-class requirement"
          speaker="Solveig Olsen, design systems lead"
        />
        <ScheduleItem
          time="18:00–18:30"
          title="Lightning talks"
          speaker="Community speakers"
        />
        <ScheduleItem time="19:30" title="Conference dinner" />
      </Schedule>

      <Heading as="h2">Friday 12 June</Heading>
      <Schedule>
        <ScheduleItem
          time="09:00–10:00"
          title="CI/CD pipelines that scale"
          speaker="Per Lindqvist, platform engineer"
          description="From monolith builds to parallel pipelines — lessons learned migrating a 200-service organisation."
        />
        <ScheduleItem
          time="10:00–11:00"
          title="Security by default"
          speaker="Marte Haugen, AppSec engineer"
          description="Integrating SAST, DAST and dependency scanning into your development workflow without slowing anyone down."
        />
        <ScheduleItem time="11:00–11:30" title="Break" />
        <ScheduleItem
          time="11:30–12:30"
          title="Workshop: Pair programming with AI"
          speaker="Lars Eriksen, developer advocate"
        />
        <ScheduleItem time="12:30–13:30" title="Lunch" />
        <ScheduleItem
          time="13:30–14:30"
          title="Panel: Open source sustainability"
          speaker="Panel with invited speakers"
        />
        <ScheduleItem
          time="14:30–15:00"
          title="Closing remarks and awards"
          speaker="Conference committee"
        />
      </Schedule>
    </article>
  ),
};
