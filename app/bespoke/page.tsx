import type { Metadata } from 'next';
import BespokeView from '@/components/bespoke/BespokeView';

export const metadata: Metadata = {
  title: 'Bespoke Sarees · Custom Commission · Thridha Varnam',
  description:
    'Commission a custom hand-woven saree. Choose your weave, colour palette, motifs and zari. 12–16 week lead time. Insured worldwide delivery.',
};

export default function BespokePage() {
  return <BespokeView />;
}
