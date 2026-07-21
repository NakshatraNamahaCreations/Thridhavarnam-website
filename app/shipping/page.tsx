import type { Metadata } from 'next';
import {
  PolicyBlock,
  PolicyContactStrip,
  PolicyHeader,
  PolicyTable,
} from '@/components/policy/PolicyChrome';

export const metadata: Metadata = {
  title: 'Shipping Policy · Thridha Varnam',
  description:
    'Thridha Varnam shipping policy — order processing, domestic and international delivery timelines, tracking, customs, and contact information for hand-woven sarees.',
};

// Estimated delivery times within India.
const domesticRows: [string, string][] = [
  ['Metro Cities', '2–4 Business Days'],
  ['Other Cities', '3–7 Business Days'],
  ['Remote Areas', '5–10 Business Days'],
];

export default function ShippingPage() {
  return (
    <main className="bg-white text-gray-900">
      <PolicyHeader
        title="Shipping Policy"
        breadcrumb="Help / Shipping"
        updated="29 June 2026"
      />

      <section className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10">
        <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">
          Welcome to <strong>THRIDHA VARNAM</strong>. We are committed to
          delivering your orders safely, securely, and on time. Please read
          our shipping policy carefully before placing your order.
        </p>

        <PolicyBlock title="1. Order Processing">
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>
              All orders are processed within{' '}
              <strong>1–2 business days</strong> after successful payment
              confirmation.
            </li>
            <li>
              Orders placed on Sundays or public holidays will be processed
              on the next working day.
            </li>
            <li>
              During festivals, sales, or promotional events, processing may
              take an additional <strong>1–3 business days</strong>.
            </li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="2. Shipping Coverage">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            We currently ship across:
          </p>
          <ul className="text-sm text-gray-700 space-y-2 list-none pl-0">
            <li>
              <span className="text-green-700">✓</span> All States &amp;
              Union Territories in India
            </li>
            <li>
              <span className="text-green-700">✓</span> International
              destinations where courier services are available
            </li>
          </ul>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">
            If your location is not serviceable, we will contact you before
            processing your order.
          </p>
        </PolicyBlock>

        <PolicyBlock title="3. Shipping Charges">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-2">
            India
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            <strong>FREE Shipping</strong> on all orders across India. There
            are no shipping charges for deliveries within India.
          </p>

          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mt-5 mb-2">
            International Orders
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Shipping charges are calculated automatically during checkout
            based on:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5 mb-3">
            <li>Destination Country</li>
            <li>Postal / ZIP Code</li>
            <li>Package Weight</li>
            <li>Package Dimensions</li>
            <li>Courier Service Availability</li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed mb-2">
            International customers are responsible for:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5 mb-3">
            <li>Import Duty</li>
            <li>Customs Charges</li>
            <li>VAT / GST (if applicable)</li>
            <li>Local Taxes</li>
          </ul>
          <p className="text-xs text-gray-600">
            These charges are determined by your country&rsquo;s customs
            authority.
          </p>
        </PolicyBlock>

        <PolicyBlock title="4. Estimated Delivery Time">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-3">
            India
          </h3>
          <PolicyTable head={['Destination', 'Delivery time']} rows={domesticRows} />

          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wide mt-5 mb-2">
            International
          </h3>
          <p className="text-sm text-gray-700 leading-relaxed">
            Estimated delivery: <strong>7–15 Business Days</strong>. Delivery
            may vary depending on customs clearance and local courier
            services.
          </p>
        </PolicyBlock>

        <PolicyBlock title="5. Order Tracking">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Once your order is dispatched, you will receive:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
            <li>Order Confirmation</li>
            <li>Shipping Confirmation</li>
            <li>Tracking Number</li>
            <li>Courier Partner Details</li>
          </ul>
          <p className="mt-3 text-sm text-gray-700 leading-relaxed">
            You can track your shipment using the tracking link provided.
          </p>
        </PolicyBlock>

        <PolicyBlock title="6. Packaging">
          <p className="text-sm text-gray-700 leading-relaxed">
            Every THRIDHA VARNAM order is packed carefully using
            premium-quality packaging to ensure products reach you safely.
            Gift packaging may be available for selected orders.
          </p>
        </PolicyBlock>

        <PolicyBlock title="7. Delivery Attempts">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Our courier partners will make up to <strong>three delivery
            attempts</strong>. If delivery is unsuccessful due to:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5 mb-3">
            <li>Customer unavailable</li>
            <li>Incorrect address</li>
            <li>Incorrect contact number</li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed">
            the shipment may be returned to us. Additional shipping charges
            may apply for re-dispatch.
          </p>
        </PolicyBlock>

        <PolicyBlock title="8. Incorrect Address">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Customers are responsible for providing the correct:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5 mb-3">
            <li>Name</li>
            <li>Mobile Number</li>
            <li>Shipping Address</li>
            <li>PIN Code</li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed">
            THRIDHA VARNAM is not responsible for delays caused by incorrect
            shipping information.
          </p>
        </PolicyBlock>

        <PolicyBlock title="9. Delayed Deliveries">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Delivery may be delayed due to:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5 mb-3">
            <li>Weather Conditions</li>
            <li>Natural Disasters</li>
            <li>Government Restrictions</li>
            <li>Public Holidays</li>
            <li>Courier Delays</li>
            <li>Customs Clearance</li>
            <li>High Order Volume</li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed">
            Such delays are beyond our control.
          </p>
        </PolicyBlock>

        <PolicyBlock title="10. Damaged Package">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            If your package appears damaged:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5 mb-3">
            <li>
              Please <strong>do not accept</strong> the parcel if it is
              visibly tampered with.
            </li>
            <li>
              Contact us within <strong>24 hours</strong> of delivery.
            </li>
            <li>
              Share clear photos or videos of:
              <ul className="mt-1.5 space-y-1 list-disc pl-5">
                <li>Outer Package</li>
                <li>Shipping Label</li>
                <li>Product</li>
              </ul>
            </li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed">
            We will investigate and provide an appropriate resolution.
          </p>
        </PolicyBlock>

        <PolicyBlock title="11. Lost Shipment">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            If your shipment is confirmed lost during transit by the courier
            partner, we will either:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
            <li>Ship a replacement (subject to availability), or</li>
            <li>Issue a full refund.</li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="12. International Customs">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            International shipments may be inspected by customs authorities.
            Customers are responsible for:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5 mb-3">
            <li>Customs Duties</li>
            <li>Import Taxes</li>
            <li>Local Clearance Charges</li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed">
            THRIDHA VARNAM has no control over customs procedures or charges.
          </p>
        </PolicyBlock>

        <PolicyBlock title="13. Cash on Delivery (COD)">
          <p className="text-sm text-gray-700 leading-relaxed">
            Cash on Delivery may be available only in selected serviceable
            locations within India. Availability depends on the courier
            partner.
          </p>
        </PolicyBlock>

        <PolicyBlock title="14. Shipping Restrictions">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            We do not ship to:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
            <li>P.O. Box addresses</li>
            <li>Military addresses (where courier service is unavailable)</li>
            <li>Restricted countries or regions prohibited by law</li>
          </ul>
        </PolicyBlock>

        <PolicyContactStrip
          title="Contact Us"
          subtitle="For any shipping-related queries, please contact us:"
        />
      </section>
    </main>
  );
}
