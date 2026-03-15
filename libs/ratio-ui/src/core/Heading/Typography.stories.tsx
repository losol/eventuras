import { Meta, StoryObj } from '@storybook/react-vite';
import React from 'react';

import { Blockquote } from '../Blockquote/Blockquote';
import { Lead } from '../Lead/Lead';
import { List, ListItem } from '../List/List';

import Heading from './Heading';

/**
 * Shows all heading levels and body text elements together to verify
 * visual hierarchy, spacing, and font pairing.
 */
const meta: Meta = {
  title: 'core/Typography',
  tags: ['autodocs'],
};

export default meta;

/** Every heading level with body text to show relative sizing and spacing. */
export const HeadingScale: StoryObj = {
  render: () => (
    <article className="max-w-2xl mx-auto">
      <Heading as="h1">Heading 1 — Source Serif, 6xl</Heading>
      <p>
        Body text following an h1. The display font (Source Serif 4) gives warmth to large headings
        while the body font (Source Sans 3) keeps running text crisp and readable.
      </p>

      <Heading as="h2">Heading 2 — Source Serif, 4xl</Heading>
      <p>
        Body text following an h2. Section-level headings use the same serif display font with
        slightly tighter tracking to maintain hierarchy without overwhelming the content.
      </p>

      <Heading as="h3">Heading 3 — Source Serif, 2xl</Heading>
      <p>
        Body text following an h3. Sub-section headings still use the display font but at a
        noticeably smaller size, creating clear visual steps down from h2.
      </p>

      <Heading as="h4">Heading 4 — Source Sans, base, 650</Heading>
      <p>
        Body text following an h4. From this level down the sans-serif body font takes over,
        keeping smaller headings clean and distinct from body text through weight alone.
      </p>

      <Heading as="h5">Heading 5 — Source Sans, base</Heading>
      <p>
        Body text following an h5. At base size with semi-bold weight, h5 reads almost like
        emphasised body text — useful for label-style headings within dense content.
      </p>

      <Heading as="h6">Heading 6 — Source Sans, base</Heading>
      <p>
        Body text following an h6. The smallest heading level — same size as body text but
        distinguished by weight. Use sparingly; if you need this level, consider restructuring.
      </p>
    </article>
  ),
};

/** A realistic article layout showing headings, lead, lists, and blockquote together. */
export const ArticleLayout: StoryObj = {
  render: () => (
    <article className="max-w-2xl mx-auto">
      <Heading as="h1">Kursbasert etterutdanning i nordnorsk allmennmedisin</Heading>
      <Lead>
        Etterutdanning bør være faglig oppdatert, praktisk relevant og tilgjengelig for
        allmennleger i hele landsdelen. Kurs i Nord arbeider for å gjøre nettopp dette mulig.
      </Lead>

      <Heading as="h2">Bakgrunn</Heading>
      <p>
        Allmennleger i Nord-Norge møter unike utfordringer knyttet til geografi, avstand til
        spesialisthelsetjeneste og rekruttering. Systematisk etterutdanning med lokale
        kursarrangement bidrar til å styrke kompetansen der den trengs mest.
      </p>
      <p>
        Siden oppstarten har over 400 allmennleger deltatt på kurs arrangert i samarbeid med
        universitetssykehuset og kommunehelsetjenesten.
      </p>

      <Heading as="h2">Kursformat</Heading>

      <Heading as="h3">Samlingsbaserte helgekurs</Heading>
      <p>
        De fleste kursene arrangeres som helgesamlinger over 2–3 dager. Programmet kombinerer
        forelesninger med kasuistikkgjennomgang og praktiske øvelser.
      </p>

      <Heading as="h3">Nettbasert oppfølging</Heading>
      <p>
        Etter samlingene tilbys deltakerne nettbaserte refleksjonsoppgaver og faglige
        diskusjonsforum. Dette sikrer at læringen forankres i klinisk praksis.
      </p>

      <Heading as="h2">Faglige temaer</Heading>
      <p>Kursene dekker et bredt spekter av allmennmedisinske problemstillinger:</p>
      <List as="ul" variant="markdown">
        <ListItem>Hudsykdommer og dermatoskopi</ListItem>
        <ListItem>Muskel- og skjelettplager</ListItem>
        <ListItem>Psykisk helse i allmennpraksis</ListItem>
        <ListItem>Akuttmedisin og prosedyrer</ListItem>
        <ListItem>Kroniske sykdommer og oppfølging</ListItem>
      </List>

      <Heading as="h4">Spesialemner</Heading>
      <p>
        Enkelte kurs går i dybden på smalere fagfelt som barneortopedi, arbeids- og
        trygdemedisin eller palliativ behandling i hjemmet.
      </p>

      <Heading as="h4">Tverrfaglige sesjoner</Heading>
      <p>
        Kurs med tverrfaglig vinkling inkluderer bidrag fra sykepleiere, fysioterapeuter
        og psykologer for å belyse sammensatte problemstillinger fra ulike perspektiver.
      </p>

      <Blockquote>
        <p>
          «Kursene gir en unik mulighet til å oppdatere seg faglig og samtidig bygge
          nettverk med kolleger i regionen. Det er verdifullt å møte andre som jobber
          under lignende forhold.»
        </p>
        <footer className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          — Allmennlege, Troms
        </footer>
      </Blockquote>

      <Heading as="h2">Praktisk informasjon</Heading>
      <p>
        Kursene er godkjent som tellende timer for spesialistutdanning og videre- og
        etterutdanning i allmennmedisin. Deltakeravgift inkluderer kursmateriell og lunsj.
      </p>

      <Heading as="h5">Påmelding</Heading>
      <p>
        Registrering skjer via Eventuras. Plassene er begrenset og tildeles etter
        først-til-mølla-prinsippet.
      </p>

      <Heading as="h5">Avbestilling</Heading>
      <p>
        Avbestilling kan gjøres kostnadsfritt inntil fire uker før kursstart. Ved senere
        avbestilling faktureres full deltakeravgift.
      </p>
    </article>
  ),
};

/** Side-by-side comparison of all heading levels for quick visual reference. */
export const HeadingComparison: StoryObj = {
  render: () => (
    <div className="max-w-3xl mx-auto space-y-6">
      {([1, 2, 3, 4, 5, 6] as const).map(level => (
        <div key={level} className="flex items-baseline gap-6 border-b border-gray-200 dark:border-gray-700 pb-4">
          <span className="text-xs font-mono text-gray-400 w-6 shrink-0">h{level}</span>
          <Heading as={`h${level}`} className="mt-0 mb-0">
            Overskrift nivå {level}
          </Heading>
        </div>
      ))}
    </div>
  ),
};
