import JourneyLongRead from '@/components/journey/JourneyLongRead';
import JourneyClose from '@/components/journey/JourneyClose';

/**
 * Journey page — the deep-archive long-read.
 *
 * The cinematic on the story page is a glimpse; this is the full chapter.
 * Six pinned chapters (one per weaving tradition) with origins, technique,
 * field-notes and a pull-quote, then a closing handoff to the catalogue.
 */
export default function JourneyPage() {
  return (
    <>
      <JourneyLongRead />
      <JourneyClose />
    </>
  );
}
