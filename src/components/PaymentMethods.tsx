import Image from 'next/image';

const paymentMethods = [
  { name: 'Cash App', src: '/images/payment/cashapp.svg' },
  { name: 'Apple Pay', src: '/images/payment/applepay.svg' },
  { name: 'Google Pay', src: '/images/payment/googlepay.svg' },
  { name: 'Visa', src: '/images/payment/visa.svg' },
  { name: 'Mastercard', src: '/images/payment/mastercard.svg' },
  { name: 'Amex', src: '/images/payment/americanexpress.svg' },
  { name: 'Discover', src: '/images/payment/discover.svg' },
  { name: 'JCB', src: '/images/payment/jcb.svg' },
];

export default function PaymentMethods () {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 py-4">
      {paymentMethods.map((method) => (
        <div
          key={method.name}
          className="bg-white rounded-md shadow border border-gray-100 flex items-center justify-center p-2"
          style={{ minWidth: 48, minHeight: 32 }}
        >
          <Image
            src={method.src}
            alt={method.name}
            width={40}
            height={24}
            style={{ objectFit: 'contain' }}
          />
        </div>
      ))}
    </div>
  );
}
