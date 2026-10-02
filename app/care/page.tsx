import type { Metadata } from 'next';
import {
  PolicyBlock,
  PolicyContactStrip,
  PolicyHeader,
} from '@/components/policy/PolicyChrome';

export const metadata: Metadata = {
  title: 'Saree Care Guide · Thridha Varnam',
  description:
    'How to wash, dry, iron and store your Thridha Varnam saree — silk, cotton, linen, organza, Banarasi, Kanjivaram, zari and embroidery care instructions.',
};

export default function CarePage() {
  return (
    <main className="bg-white text-gray-900">
      <PolicyHeader
        title="Saree Care Guide"
        breadcrumb="Help / Care Guide"
        updated="29 June 2026"
      />

      <section className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10">
        <div className="max-w-3xl">
          <h2 className="text-base font-bold text-gray-900 uppercase tracking-wide mb-2">
            Preserve the Beauty of Your Saree
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            Every <strong>THRIDHA VARNAM</strong> saree is crafted with
            care. Following these care instructions will help maintain its
            beauty, colour, and longevity.
          </p>
        </div>

        <PolicyBlock title="General Care Instructions">
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>Always read the care label before washing.</li>
            <li>Fold and store your saree neatly after every use.</li>
            <li>
              Keep sarees away from direct sunlight for long periods to
              prevent colour fading.
            </li>
            <li>
              Avoid contact with perfumes, deodorants, hairsprays, bleach,
              and harsh chemicals.
            </li>
            <li>
              Handle delicate fabrics and embellishments with care.
            </li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="Washing Instructions">
          <CareSubsection title="Silk Sarees">
            <li>Dry Clean Only.</li>
            <li>Do not machine wash.</li>
            <li>Do not soak in water.</li>
            <li>Avoid wringing or twisting the fabric.</li>
          </CareSubsection>

          <CareSubsection title="Cotton Sarees">
            <li>Hand wash separately in cold water.</li>
            <li>Use a mild liquid detergent.</li>
            <li>Do not bleach.</li>
            <li>Do not soak for long periods.</li>
          </CareSubsection>

          <CareSubsection title="Linen Sarees">
            <li>Gentle hand wash in cold water.</li>
            <li>Mild detergent only.</li>
            <li>Wash separately.</li>
            <li>Dry in shade.</li>
          </CareSubsection>

          <CareSubsection title="Organza, Tissue & Chiffon Sarees">
            <li>Dry Clean Recommended.</li>
            <li>Handle gently.</li>
            <li>Avoid machine washing.</li>
          </CareSubsection>

          <CareSubsection title="Banarasi, Kanjivaram & Designer Sarees">
            <li>Professional Dry Clean Only.</li>
            <li>Do not wash at home.</li>
          </CareSubsection>
        </PolicyBlock>

        <PolicyBlock title="Drying Instructions">
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>Dry in the shade.</li>
            <li>Avoid direct sunlight.</li>
            <li>Do not tumble dry.</li>
            <li>Do not twist the saree to remove water.</li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="Ironing Instructions">
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>Use a low to medium heat setting.</li>
            <li>Iron on the reverse side whenever possible.</li>
            <li>
              Place a cotton cloth over delicate fabrics while ironing.
            </li>
            <li>
              Avoid direct heat on embroidery, sequins, zari, stones, beads,
              and embellishments.
            </li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="Storage Tips">
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>Store sarees in a cool, dry place.</li>
            <li>
              Fold and refold occasionally to prevent permanent creases.
            </li>
            <li>
              Use breathable cotton or muslin bags instead of plastic covers.
            </li>
            <li>
              Keep heavy embroidered sarees flat or loosely folded.
            </li>
            <li>
              Place silica gel packets or natural moisture absorbers in your
              wardrobe to reduce humidity.
            </li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="Silk Saree Care">
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>Refold every 3–6 months to prevent crease damage.</li>
            <li>Wrap in a muslin cloth.</li>
            <li>Keep away from moisture.</li>
            <li>
              Do not hang heavy silk sarees for extended periods.
            </li>
            <li>Air the saree occasionally.</li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="Zari Care">
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>Avoid direct contact with perfumes or chemicals.</li>
            <li>Always dry clean.</li>
            <li>Store separately from dark-coloured fabrics.</li>
            <li>Do not iron directly on zari work.</li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="Embroidery & Stone Work">
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>Avoid rubbing or scrubbing embellished areas.</li>
            <li>Handle with care to prevent snagging.</li>
            <li>
              Store separately to avoid damage from hooks or zippers.
            </li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="During Wearing">
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>Wear jewellery carefully to avoid pulling threads.</li>
            <li>Avoid rough surfaces that may damage the fabric.</li>
            <li>
              Be cautious with handbags and accessories that may catch on
              delicate weaves.
            </li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="Long-Term Storage">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            If storing for several months:
          </p>
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>Clean the saree before storing.</li>
            <li>Wrap it in a soft cotton or muslin cloth.</li>
            <li>Avoid vacuum-sealed storage bags.</li>
            <li>
              Keep in a cool, dry wardrobe away from direct sunlight and
              dampness.
            </li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="Disclaimer">
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>
              Slight colour variations may occur due to lighting,
              photography, or screen settings.
            </li>
            <li>
              Minor irregularities in handloom, handwoven, or handcrafted
              sarees are natural characteristics that enhance their
              uniqueness and are not considered defects.
            </li>
          </ul>
        </PolicyBlock>

        <PolicyContactStrip
          title="Need Assistance?"
          subtitle="If you have any questions about caring for your THRIDHA VARNAM saree, please contact us:"
        />
      </section>
    </main>
  );
}

function CareSubsection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4 first:mt-0">
      <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
        {title}
      </h3>
      <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
        {children}
      </ul>
    </div>
  );
}
