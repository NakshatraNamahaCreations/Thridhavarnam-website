import type { Metadata } from 'next';
import ContactView from '@/components/contact/ContactView';

export const metadata: Metadata = {
  title: 'Contact Us · Thridha Varnam',
  description:
    'Get in touch with Thridha Varnam — email, phone, WhatsApp and the Bengaluru atelier address. Care team replies within one working day.',
};

export default function ContactPage() {
  return <ContactView />;
}
