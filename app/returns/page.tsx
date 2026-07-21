import type { Metadata } from 'next';
import {
  PolicyBlock,
  PolicyContactStrip,
  PolicyHeader,
} from '@/components/policy/PolicyChrome';

export const metadata: Metadata = {
  title: 'Return, Replacement & Refund Policy · Thridha Varnam',
  description:
    'Thridha Varnam return, replacement and refund policy — eligibility, 48-hour window, mandatory unboxing video, refund timelines and contact information.',
};

export default function ReturnsPage() {
  return (
    <main className="bg-white text-gray-900">
      <PolicyHeader
        title="Return, Replacement & Refund Policy"
        breadcrumb="Help / Returns"
        updated="29 June 2026"
      />

      <section className="max-w-[1100px] mx-auto px-6 lg:px-10 py-10">
        <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">
          At <strong>THRIDHA VARNAM</strong>, every product is carefully
          inspected and securely packed before dispatch. Please read our
          Return, Replacement &amp; Refund Policy carefully before placing
          your order.
        </p>

        <PolicyBlock title="1. Return Eligibility">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Returns or replacements are accepted only if:
          </p>
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>You receive a damaged product.</li>
            <li>You receive the wrong product.</li>
            <li>The product has a manufacturing defect.</li>
            <li>You receive an incomplete order (missing item).</li>
            <li>The product delivered is different from what you ordered.</li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="2. Return Request Time">
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>
              Return requests must be raised within{' '}
              <strong>48 hours of delivery</strong>.
            </li>
            <li>Requests made after 48 hours may not be accepted.</li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="3. Mandatory Unboxing Video (Compulsory)">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            To process any return, replacement, or refund request, a{' '}
            <strong>clear, continuous, unedited unboxing video is
            mandatory</strong>.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            The video must:
          </p>
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5 mb-4">
            <li>Start before opening the sealed parcel.</li>
            <li>Clearly show the courier package.</li>
            <li>Clearly show the shipping label.</li>
            <li>Show the parcel being opened.</li>
            <li>Show every product received.</li>
            <li>
              Clearly capture the issue (damage, wrong item, missing item, or
              defect).
            </li>
            <li>Be recorded without any cuts, edits, or pauses.</li>
          </ul>
          <div className="border-l-4 border-[#75001F] bg-gray-50 px-4 py-3 text-sm text-gray-800">
            <strong>Important:</strong> Return, replacement, or refund
            requests without a valid unboxing video may not be accepted,
            except where required by applicable consumer protection laws.
          </div>
        </PolicyBlock>

        <PolicyBlock title="4. How to Submit a Return Request">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Within 48 hours of delivery, send the following:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5 mb-4">
            <li>Order Number</li>
            <li>Full Name</li>
            <li>Mobile Number</li>
            <li>Unboxing Video</li>
            <li>Product Photos</li>
            <li>Reason for Return</li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed mb-2">
            Send your request via:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-none pl-0">
            <li>
              <strong>Email:</strong>{' '}
              <a
                href="mailto:support@thridhavarnam.com"
                className="text-[#75001F] underline underline-offset-2 font-semibold"
              >
                support@thridhavarnam.com
              </a>
            </li>
            <li>
              <strong>WhatsApp:</strong>{' '}
              <a
                href="tel:+919949528787"
                className="text-[#75001F] underline underline-offset-2 font-semibold"
              >
                +91 99495 28787
              </a>
            </li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="5. Product Condition for Returns">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Returned products must:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5 mb-3">
            <li>Be unused.</li>
            <li>Be unwashed.</li>
            <li>Be unworn.</li>
            <li>Have all original tags attached.</li>
            <li>Be in original packaging.</li>
            <li>Include the original invoice.</li>
            <li>Be returned with all accessories (if applicable).</li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed">
            Products failing these conditions may not be eligible for return.
          </p>
        </PolicyBlock>

        <PolicyBlock title="6. Products Not Eligible for Return">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Returns will not be accepted for:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
            <li>Change of mind.</li>
            <li>
              Incorrect colour selection due to screen / display variations.
            </li>
            <li>Wrong size or design selected by the customer.</li>
            <li>Products that have been used, washed, or altered.</li>
            <li>Products without original tags or packaging.</li>
            <li>Customised or personalised products.</li>
            <li>Gift cards or promotional vouchers.</li>
            <li>
              Products marked as &ldquo;Final Sale&rdquo; or
              &ldquo;Non-Returnable&rdquo;.
            </li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="7. Replacement Policy">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Replacement is available only for:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5 mb-3">
            <li>Damaged products.</li>
            <li>Wrong products received.</li>
            <li>Manufacturing defects.</li>
            <li>Missing items.</li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed">
            Replacement depends on stock availability. If the product is
            unavailable, a refund will be processed.
          </p>
        </PolicyBlock>

        <PolicyBlock title="8. Return Shipping">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            If the return is approved because of:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5 mb-3">
            <li>Damaged product</li>
            <li>Wrong product</li>
            <li>Manufacturing defect</li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            THRIDHA VARNAM will arrange pickup where available or reimburse
            reasonable return shipping charges.
          </p>
          <p className="text-sm text-gray-700 leading-relaxed">
            For returns not covered under this policy, the customer is
            responsible for return shipping costs.
          </p>
        </PolicyBlock>

        <PolicyBlock title="9. Refund Policy">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            Once the returned product is received and passes inspection:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
            <li>
              Refunds will be processed within{' '}
              <strong>7–10 business days</strong>.
            </li>
            <li>Refunds will be made to the original payment method.</li>
            <li>
              Original shipping charges (if any) are non-refundable unless
              the error was on our part.
            </li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="10. Order Cancellation">
          <ul className="text-sm text-gray-700 space-y-2 list-disc pl-5">
            <li>Orders can be cancelled only before dispatch.</li>
            <li>Once shipped, orders cannot be cancelled.</li>
          </ul>
        </PolicyBlock>

        <PolicyBlock title="11. International Orders">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            International orders are generally not eligible for return or
            exchange, except in cases of:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5 mb-3">
            <li>Wrong product delivered.</li>
            <li>Product damaged during transit.</li>
            <li>Manufacturing defect.</li>
          </ul>
          <p className="text-sm text-gray-700 leading-relaxed">
            Customers are responsible for any customs duties, import taxes,
            or local charges, which are non-refundable.
          </p>
        </PolicyBlock>

        <PolicyBlock title="12. Quality Inspection">
          <p className="text-sm text-gray-700 leading-relaxed">
            Every product undergoes a strict quality inspection before
            dispatch. We maintain packaging records to ensure product quality
            and dispatch accuracy.
          </p>
        </PolicyBlock>

        <PolicyBlock title="13. False or Fraudulent Claims">
          <p className="text-sm text-gray-700 leading-relaxed mb-3">
            THRIDHA VARNAM reserves the right to reject any return,
            replacement, or refund request if:
          </p>
          <ul className="text-sm text-gray-700 space-y-1.5 list-disc pl-5">
            <li>Required proof is not provided.</li>
            <li>The unboxing video is edited, incomplete, or unclear.</li>
            <li>The claim is found to be false or fraudulent.</li>
            <li>
              The returned product does not match the originally shipped item.
            </li>
          </ul>
        </PolicyBlock>

        <PolicyContactStrip
          title="Contact Us"
          subtitle="For any return, replacement, or refund assistance:"
        />
      </section>
    </main>
  );
}
