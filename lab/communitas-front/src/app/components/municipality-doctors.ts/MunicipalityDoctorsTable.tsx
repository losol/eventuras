'use client';

import React from 'react';
import { createColumnHelper, DataTable } from '@eventuras/datatable';


export interface Practitioner {
  id: string;

  totalSlots: number;
  openSlots: number;
  waitingListEnabled: boolean;
  waitingListSize: number;

  doctor: {
    label: string;              // e.g. "Mann (43)" or "Kvinne (50)"
    authorizedYear: number;
    isSami: boolean;
    age: number;
    gender: 'male' | 'female';
  } | null;

  clinic: {
    id: number;
    name: string;
    address: string;
    postalCode: string;
    city: string;
    phone: string;
    url: string | null;
    wheelchairAccessible: boolean;
    groupPractice: boolean;
  };

  agreementSince: string;
  agreementUntil: string;

  substitutes: Array<{
    label: string;              // e.g. "Mann (38)"
    fromDate: string;
    toDate: string;
    percentage: number;
    age: number;
    gender: 'male' | 'female';
  }>;

  selectable: boolean;
  sharedList: boolean;
}

export interface MunicipalityDoctors {
  municipalityId: string;
  count: number;
  lastUpdated: string;
  data: Practitioner[];
}

interface Props {
  data: Practitioner[];
}

const columnHelper = createColumnHelper<Practitioner>();

const columns = [
  columnHelper.accessor('doctor.label', {
    header: 'Doctor',
    cell: info => info.getValue(),      // e.g. "Mann (43)"
  }),
  columnHelper.accessor('clinic.name', { header: 'Clinic' }),
  columnHelper.accessor('totalSlots', { header: 'Capacity' }),
  columnHelper.accessor('openSlots', { header: 'Open Slots' }),
  columnHelper.accessor('waitingListSize', { header: 'Waiting List' }),
  columnHelper.accessor('doctor.authorizedYear', { header: 'Since Year' }),
  columnHelper.accessor('agreementSince', { header: 'Agreement Since' }),
  columnHelper.accessor('substitutes', {
    header: 'Substitutes',
    cell: row => {
      // render comma-separated labels
      return (row.getValue() as Practitioner['substitutes'])
        .map(s => (`${s.label} – ${s.percentage}%`))
        .join(', ');
    },
  }),
];

export default function MunicipalityDoctorsTable({ data }: Props) {
  console.log('MunicipalityDoctorsData', data);
  if (!data.length) {
    return <p>No practitioners to show.</p>;
  }

  return (
    <DataTable
      columns={columns}
      data={data}
      pageSize={100}
      clientsidePagination
    />
  );
}
