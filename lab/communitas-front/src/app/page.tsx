import React from 'react';
import MunicipalityDoctorsTable from './components/municipality-doctors.ts/MunicipalityDoctorsTable';
import { MunicipalityDoctors } from './components/municipality-doctors.ts/MunicipalityDoctorsTable';

export const revalidate = 5; // later 60 * 60 * 24;

async function getData(municipalityId: string): Promise<MunicipalityDoctors> {
  const base = process.env.COMMUNITAS_DATA_SERVER_URL!;
  const res = await fetch(`${base}/api/municipality-doctors/${municipalityId}`);

  if (!res.ok) throw new Error(`Fetch error ${res.status}`);
  return res.json();
}

export default async function Page() {
  const municipalityId = '1804';
  let doctors: MunicipalityDoctors;

  try {
    doctors = await getData(municipalityId);
  } catch (e: any) {
    return (
      <main>
        <h1>Error loading practitioners</h1>
        <p>{e.message}</p>
      </main>
    );
  }

  return (
    <main>
      <h1>
        General Practitioners in Municipality {municipalityId} (
        {doctors.count} last updated{' '}
        {new Date(doctors.lastUpdated).toLocaleString()})
      </h1>

      <MunicipalityDoctorsTable data={doctors.data} />
    </main>
  );
}
