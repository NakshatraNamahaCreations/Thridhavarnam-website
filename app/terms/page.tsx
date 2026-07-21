import type { Metadata } from 'next';
import LegalShell, { type LegalSection } from '@/components/legal/LegalShell';

export const metadata: Metadata = {
  title: 'Terms & Conditions · Thridha Varnam',
  description:
    'Terms & Conditions for Thridha Varnam — orders, pricing, shipping, returns, mandatory unboxing video, intellectual property and dispute resolution.',
};

const sections: LegalSection[] = [
  {
    id: 'acceptance',
    title: '1. Acceptance of Terms',
    body: (
      <p>
        By using this website, you confirm that you are at least 18 years
        of age or are using the website under the supervision of a parent
        or legal guardian.
      </p>
    ),
  },
  {
    id: 'products',
    title: '2. Products',
    body: (
      <>
        <p>
          We strive to display our products as accurately as possible.
          However:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>
            Slight variations in colour may occur due to screen settings,
            lighting, and photography.
          </li>
          <li>
            Handwoven, handcrafted, printed, dyed, or embroidered products
            may have natural irregularities, which are not defects but
            characteristics of authentic craftsmanship.
          </li>
          <li>
            Product measurements are approximate and may have minor
            variations.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'pricing',
    title: '3. Pricing',
    body: (
      <ul className="list-disc pl-5 space-y-1.5">
        <li>
          All prices are displayed in Indian Rupees (INR) unless otherwise
          specified.
        </li>
        <li>Prices are subject to change without prior notice.</li>
        <li>Applicable taxes will be charged as required by law.</li>
        <li>
          International customers may be responsible for customs duties,
          import taxes, or local charges.
        </li>
      </ul>
    ),
  },
  {
    id: 'orders',
    title: '4. Orders',
    body: (
      <>
        <p>THRIDHA VARNAM reserves the right to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Accept or reject any order.</li>
          <li>Cancel suspected fraudulent or unauthorized transactions.</li>
          <li>Limit quantities purchased.</li>
          <li>Cancel orders due to pricing, stock, or technical errors.</li>
        </ul>
        <p>
          If your order is cancelled after payment, the amount paid will be
          refunded through the original payment method.
        </p>
      </>
    ),
  },
  {
    id: 'payments',
    title: '5. Payments',
    body: (
      <>
        <p>
          We accept payments through approved and secure payment gateways.
        </p>
        <p>
          Orders will be processed only after successful payment
          confirmation, except where Cash on Delivery (COD) is available.
        </p>
      </>
    ),
  },
  {
    id: 'shipping',
    title: '6. Shipping',
    body: (
      <>
        <p>
          Shipping is governed by our{' '}
          <a href="/shipping" className="underline underline-offset-2 hover:text-gray-900">
            Shipping Policy
          </a>
          .
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Free shipping is available across India.</li>
          <li>
            International shipping charges are calculated based on
            destination, postal / ZIP code, package weight, and courier
            availability.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'returns',
    title: '7. Returns & Refunds',
    body: (
      <>
        <p>
          Returns, replacements, and refunds are governed by our{' '}
          <a href="/returns" className="underline underline-offset-2 hover:text-gray-900">
            Return &amp; Refund Policy
          </a>
          .
        </p>
        <p>
          Customers must follow the stated return process, including
          submitting the required evidence within the specified time.
        </p>
      </>
    ),
  },
  {
    id: 'unboxing-video',
    title: '8. Mandatory Unboxing Video',
    body: (
      <>
        <p>For any claim relating to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Damaged products</li>
          <li>Wrong products</li>
          <li>Missing items</li>
          <li>Manufacturing defects</li>
        </ul>
        <p>
          A <strong className="text-gray-900">clear, continuous, unedited
          unboxing video</strong> recorded from the sealed package until
          the product is fully unpacked is mandatory.
        </p>
        <p>
          Failure to provide this evidence may result in rejection of the
          claim, except where applicable consumer protection laws require
          otherwise.
        </p>
      </>
    ),
  },
  {
    id: 'user-responsibilities',
    title: '9. User Responsibilities',
    body: (
      <>
        <p>You agree to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Provide accurate and complete information.</li>
          <li>Maintain the confidentiality of your account credentials.</li>
          <li>Use the website only for lawful purposes.</li>
          <li>
            Not interfere with the security or functionality of the website.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'intellectual-property',
    title: '10. Intellectual Property',
    body: (
      <>
        <p>
          All content on this website, including but not limited to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Logos</li>
          <li>Brand name</li>
          <li>Product images</li>
          <li>Photographs</li>
          <li>Videos</li>
          <li>Text</li>
          <li>Graphics</li>
          <li>Designs</li>
          <li>Icons</li>
        </ul>
        <p>
          is the intellectual property of THRIDHA VARNAM or its licensors
          and may not be copied, reproduced, modified, distributed, or
          used without prior written permission.
        </p>
      </>
    ),
  },
  {
    id: 'liability',
    title: '11. Limitation of Liability',
    body: (
      <>
        <p>
          To the maximum extent permitted by law, THRIDHA VARNAM shall not
          be liable for:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Indirect or consequential losses.</li>
          <li>Delays caused by courier partners or customs authorities.</li>
          <li>Losses resulting from incorrect customer information.</li>
          <li>
            Website interruptions, technical failures, or events beyond our
            reasonable control.
          </li>
        </ul>
        <p>
          Nothing in these Terms excludes liability that cannot legally be
          excluded.
        </p>
      </>
    ),
  },
  {
    id: 'third-party',
    title: '12. Third-Party Services',
    body: (
      <p>
        Our website may integrate with third-party payment gateways,
        courier partners, or external websites. We are not responsible for
        the content, privacy practices, or services of those third parties.
      </p>
    ),
  },
  {
    id: 'account-suspension',
    title: '13. Account Suspension',
    body: (
      <p>
        We reserve the right to suspend or terminate user accounts involved
        in fraudulent activity, abuse, misuse of the website, or violations
        of these Terms &amp; Conditions.
      </p>
    ),
  },
  {
    id: 'force-majeure',
    title: '14. Force Majeure',
    body: (
      <p>
        We shall not be responsible for delays or failures caused by
        circumstances beyond our reasonable control, including natural
        disasters, pandemics, strikes, war, government restrictions,
        transportation disruptions, or other force majeure events.
      </p>
    ),
  },
  {
    id: 'governing-law',
    title: '15. Governing Law',
    body: (
      <>
        <p>
          These Terms &amp; Conditions shall be governed by and interpreted
          in accordance with the laws of India.
        </p>
        <p>
          Subject to applicable law, disputes arising out of these Terms
          shall be subject to the exclusive jurisdiction of the competent
          courts where THRIDHA VARNAM is registered or carries on business.
        </p>
      </>
    ),
  },
  {
    id: 'changes',
    title: '16. Changes to These Terms',
    body: (
      <p>
        THRIDHA VARNAM may update these Terms &amp; Conditions from time to
        time. Updated versions will be published on this page with the
        revised effective date.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms & Conditions"
      lastUpdated="29 June 2026"
      intro={
        <p>
          Welcome to <strong className="text-gray-900">THRIDHA VARNAM</strong>.
          By accessing or using our website, placing an order, or purchasing
          our products, you agree to be bound by these Terms &amp;
          Conditions. If you do not agree with these Terms, please do not
          use our website.
        </p>
      }
      sections={sections}
    />
  );
}
