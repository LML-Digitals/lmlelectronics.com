export default function TermsOfRepair () {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-screen mt-20">
      <h1 className="text-3xl font-bold mb-6  underline underline-offset-1">
          Terms of Repair
      </h1>
      <p className="mb-4">
          These Terms of Repair (“Terms”) govern the repair services
          (“Services”) provided by LML Repair (“we,” “us,” or “our”) to you
          (“Customer,” “you,” or “your”). By submitting your device for repair,
          you agree to be bound by these Terms.
      </p>
      <h2 className="text-xl font-bold mt-8 mb-4">1. Device Acceptance</h2>
      <ul className="list-disc list-inside mb-4">
        <li>
            We reserve the right to refuse service for any reason, including but
            not limited to:
        </li>
        <ul className="list-disc list-inside pl-6">
          <li>Device damage exceeding our repair capabilities.</li>
          <li>Suspected stolen devices.</li>
          <li>Unrealistic repair expectations.</li>
        </ul>
        <li>
            We will diagnose the problem with your device and provide you with a
            free estimate before commencing repairs. This estimate will include
            the cost of parts and labor.
        </li>
      </ul>
      <h2 className="text-xl font-bold mt-8 mb-4">
          2. Repairs and Warranties
      </h2>
      <ul className="list-disc list-inside mb-4">
        <li>
            We will use commercially reasonable efforts to repair your device
            according to the agreed-upon estimate.
        </li>
        <li>
            All repairs are warranted for life from the date of service. This
            warranty covers defects in workmanship or parts used during the
            repair.
        </li>
        <li>
            The warranty does not cover:
          <ul className="list-disc list-inside pl-6">
            <li>
                Damage caused by misuse, liquid exposure, accidental drops, or
                unauthorized repairs.
            </li>
            <li>Normal wear and tear of the device.</li>
            <li>Issues not related to the original repair.</li>
          </ul>
        </li>
        <li>
            We will repair or replace defective parts covered by the warranty at
            our discretion.
        </li>
      </ul>
      <h2 className="text-xl font-bold mt-8 mb-4">3. Data Loss</h2>
      <p className="mb-4">
          Repairing your device may result in data loss. We are not responsible
          for any lost data during the repair process. We recommend backing up
          your data before submitting your device for repair.
      </p>
      <h2 className="text-xl font-bold mt-8 mb-4">
          4. Customer Responsibilities
      </h2>
      <ul className="list-disc list-inside mb-4">
        <li>
            You are responsible for backing up any data stored on your device
            before submitting it for repair.
        </li>
        <li>
            You are responsible for providing accurate contact information and
            notifying us of any changes during the repair process.
        </li>
        <li>
            You are responsible for picking up your device within [number] days
            after we complete the repair or notify you that your device is
            unrepairable. Unclaimed devices may be subject to storage fees.
        </li>
      </ul>
      <h2 className="text-xl font-bold mt-8 mb-4">5. Payment</h2>
      <p className="mb-4">
          Payment is due upon completion of the repair. We accept cash, debit,
          credit, Cash App, Venmo, Zelle, PayPal, Apple Pay, etc.
      </p>
      <h2 className="text-xl font-bold mt-8 mb-4">
          6. Limitation of Liability
      </h2>
      <p className="mb-4">
          LML Repair is not liable for any damages exceeding the cost of the
          repair service. We are not liable for any consequential, incidental,
          or indirect damages arising from the repair service, even if advised
          of the possibility of such damages.
      </p>
      <h2 className="text-xl font-bold mt-8 mb-4">7. Governing Law</h2>
      <p className="mb-4">
          These Terms will be governed by and construed in accordance with the
          laws of the State of Washington.
      </p>
      <h2 className="text-xl font-bold mt-8 mb-4">8. Entire Agreement</h2>
      <p className="mb-4">
          These Terms constitute the entire agreement between you and LML Repair
          regarding the repair service and supersede all prior or
          contemporaneous communications or proposals, whether oral or written.
      </p>
      <h2 className="text-xl font-bold mt-8 mb-4">9. Severability</h2>
      <p className="mb-4">
          If any provision of these Terms is held to be invalid or
          unenforceable, such provision shall be struck and the remaining
          provisions shall remain in full force and effect.
      </p>
      <h2 className="text-xl font-bold mt-8 mb-4">10. Contact Us</h2>
      <p className="mb-4">
          If you have any questions about these Terms, please contact us at{' '}
        <a
          href="mailto:lookmanlookrepair@gmail.com"
          className="text-blue-600 hover:underline"
        >
            lookmanlookrepair@gmail.com
        </a>
          .
      </p>
    </div>
  );
}
