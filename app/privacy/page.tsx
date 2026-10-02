import type { Metadata } from 'next';
import LegalShell, { type LegalSection } from '@/components/legal/LegalShell';

export const metadata: Metadata = {
  title: 'Privacy Policy · Thridha Varnam',
  description:
    'How Thridha Varnam collects, uses, stores and protects the personal information of customers shopping for heirloom sarees.',
};

const sections: LegalSection[] = [
  {
    id: 'information-we-collect',
    title: '1. Information We Collect',
    body: (
      <>
        <p>We may collect the following information:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Full Name</li>
          <li>Mobile Number</li>
          <li>Email Address</li>
          <li>Billing Address</li>
          <li>Shipping Address</li>
          <li>PIN / ZIP Code</li>
          <li>
            Payment Information (processed securely through our payment
            partners; we do not store your card details)
          </li>
          <li>Order History</li>
          <li>Device Information</li>
          <li>IP Address</li>
          <li>Browser Information</li>
          <li>Cookies and Website Usage Data</li>
        </ul>
      </>
    ),
  },
  {
    id: 'how-we-use',
    title: '2. How We Use Your Information',
    body: (
      <>
        <p>We use your information to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Process and deliver your orders.</li>
          <li>Provide customer support.</li>
          <li>Send order confirmations and shipping updates.</li>
          <li>Respond to your enquiries.</li>
          <li>Improve our website, products, and services.</li>
          <li>Prevent fraud and unauthorized transactions.</li>
          <li>Comply with legal and regulatory obligations.</li>
          <li>
            Send promotional offers and newsletters (only where permitted or
            if you have opted in).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'payment-security',
    title: '3. Payment Security',
    body: (
      <p>
        All online payments are processed through secure, trusted payment
        gateways. THRIDHA VARNAM does not store your debit card, credit
        card, UPI PIN, CVV, or internet banking credentials.
      </p>
    ),
  },
  {
    id: 'sharing',
    title: '4. Sharing of Information',
    body: (
      <>
        <p>
          <strong className="text-ink">
            We do not sell, rent, or trade your personal information.
          </strong>
        </p>
        <p>Your information may be shared only with:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Courier and logistics partners for order delivery.</li>
          <li>Payment service providers for payment processing.</li>
          <li>Technology service providers supporting our website.</li>
          <li>
            Government or law enforcement authorities where required by law.
          </li>
        </ul>
      </>
    ),
  },
  {
    id: 'cookies',
    title: '5. Cookies',
    body: (
      <>
        <p>Our website may use cookies to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Remember your preferences.</li>
          <li>Improve website performance.</li>
          <li>Enhance your shopping experience.</li>
          <li>Analyse website traffic and usage.</li>
        </ul>
        <p>
          You may disable cookies through your browser settings; however,
          some website features may not function properly.
        </p>
      </>
    ),
  },
  {
    id: 'data-security',
    title: '6. Data Security',
    body: (
      <p>
        We implement appropriate technical and organisational security
        measures to protect your personal information from unauthorized
        access, misuse, alteration, or disclosure. While we strive to
        protect your data, no method of internet transmission or electronic
        storage is completely secure.
      </p>
    ),
  },
  {
    id: 'data-retention',
    title: '7. Data Retention',
    body: (
      <>
        <p>
          We retain your personal information only for as long as necessary
          to:
        </p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Fulfil your orders.</li>
          <li>Provide customer support.</li>
          <li>
            Meet legal, tax, accounting, and regulatory requirements.
          </li>
          <li>Resolve disputes and enforce our policies.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'marketing',
    title: '8. Marketing Communications',
    body: (
      <p>
        If you subscribe to our newsletters or promotional communications,
        you may unsubscribe at any time by clicking the unsubscribe link in
        our emails or by contacting us.
      </p>
    ),
  },
  {
    id: 'your-rights',
    title: '9. Your Rights',
    body: (
      <>
        <p>Subject to applicable law, you may request to:</p>
        <ul className="list-disc pl-5 space-y-1.5">
          <li>Access your personal information.</li>
          <li>Correct inaccurate information.</li>
          <li>Update your information.</li>
          <li>
            Request deletion of your information where legally permissible.
          </li>
          <li>Withdraw marketing consent.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'third-party-links',
    title: '10. Third-Party Links',
    body: (
      <p>
        Our website may contain links to third-party websites. We are not
        responsible for the privacy practices, security, or content of
        those external websites.
      </p>
    ),
  },
  {
    id: 'childrens-privacy',
    title: "11. Children's Privacy",
    body: (
      <p>
        Our website is not intended for individuals under the age of 18.
        We do not knowingly collect personal information from children.
      </p>
    ),
  },
  {
    id: 'changes',
    title: '12. Changes to this Privacy Policy',
    body: (
      <p>
        We may update this Privacy Policy from time to time. Any changes
        will be posted on this page with the updated effective date.
      </p>
    ),
  },
];

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      lastUpdated="29 June 2026"
      intro={
        <p>
          At <strong className="text-ink">THRIDHA VARNAM</strong>, we value
          your privacy and are committed to protecting your personal
          information. This Privacy Policy explains how we collect, use,
          store, and protect your information when you visit our website or
          purchase our products.
        </p>
      }
      sections={sections}
    />
  );
}
