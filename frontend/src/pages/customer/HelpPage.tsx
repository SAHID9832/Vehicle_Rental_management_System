import React from 'react';
import { HelpCircle, FileText, Shield, MapPin, Phone, Mail, Cpu, CheckCircle } from 'lucide-react';

export default function HelpPage() {
  const sections = [
    {
      title: 'Booking & Eligibility',
      faqs: [
        {
          q: 'Who can rent a vehicle from Vektor?',
          a: 'Any individual aged 21 years or older holding a valid unexpired Indian Driving License (or International Driving Permit for foreign nationals) and a government-issued photo ID (Aadhaar Card, Passport, or Voter ID).',
        },
        {
          q: 'Can I extend my active rental period?',
          a: 'Yes, provided the vehicle does not have an upcoming overlapping reservation by another customer. Contact customer support or your hub manager at least 4 hours before scheduled return.',
        },
      ],
    },
    {
      title: 'Pricing & Security Deposits',
      faqs: [
        {
          q: 'How does the stack-based pricing evaluation work?',
          a: 'We evaluate rental pricing via an arithmetic expression stack: (Rental Days × Daily Rate) − Applicable Discounts + Extra Hub Surcharges. Days are evaluated in 24-hour cycles.',
        },
        {
          q: 'When is the security deposit refunded?',
          a: 'Refundable security deposits are refunded within 2 hours of vehicle check-in after our hub staff conduct a swift vehicle condition inspection.',
        },
      ],
    },
    {
      title: 'Hubs & Multi-Branch Network',
      faqs: [
        {
          q: 'Can I pick up in Indiranagar and return at Kempegowda Airport?',
          a: 'Yes. Our 5 Bengaluru hubs are fully connected via our branch network graph. Simply select different pickup and return locations when booking.',
        },
        {
          q: 'What are the operating hours of Vektor hubs?',
          a: 'Airport hub operates 24/7. City hubs (MG Road, Indiranagar, Whitefield, Electronic City) operate from 6:00 AM to 11:00 PM daily.',
        },
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center mx-auto">
          <HelpCircle className="w-6 h-6 stroke-[2.2]" />
        </div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Help & Rental Policies</h1>
        <p className="text-sm text-gray-600">
          Find answers regarding booking rules, tariffs, multi-hub pickups, and documentation.
        </p>
      </div>

      {/* Policy Highlights Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-2">
          <Shield className="w-6 h-6 text-teal-600 mb-2" />
          <h3 className="font-bold text-gray-900 text-sm">Comprehensive Insurance</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            All vehicles carry valid bumper-to-bumper commercial insurance with maximum liability caps.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-2">
          <FileText className="w-6 h-6 text-indigo-600 mb-2" />
          <h3 className="font-bold text-gray-900 text-sm">Transparent Billing</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            GST-compliant invoices generated for all rentals. Downloadable directly from your portal.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-xs space-y-2">
          <Cpu className="w-6 h-6 text-emerald-600 mb-2" />
          <h3 className="font-bold text-gray-900 text-sm">DSA Engine Driven</h3>
          <p className="text-xs text-gray-600 leading-relaxed">
            Real-time BFS hub routing and Greedy cost optimization ensure the best vehicle match.
          </p>
        </div>
      </div>

      {/* FAQ Sections */}
      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-4">
            <h2 className="text-lg font-black text-gray-900 tracking-tight border-b border-gray-200 pb-2">
              {section.title}
            </h2>
            <div className="space-y-4">
              {section.faqs.map((faq, fIdx) => (
                <div key={fIdx} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-xs space-y-2">
                  <h3 className="font-bold text-gray-900 text-sm flex items-start gap-2">
                    <span className="text-teal-600 font-extrabold">•</span>
                    <span>{faq.q}</span>
                  </h3>
                  <p className="text-xs text-gray-600 pl-4 leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Hub Contact Section */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 space-y-6">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Need Immediate Assistance?</h2>
          <p className="text-xs text-slate-400 mt-1">
            Our Bengaluru fleet support desk is available to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-3">
            <Phone className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Helpline</span>
              <span>+91 80 4968 2000</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Mail className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Email Desk</span>
              <span>support@vektor.in</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <MapPin className="w-5 h-5 text-teal-400 shrink-0" />
            <div>
              <span className="text-[10px] text-slate-500 block uppercase font-bold">Central Hub</span>
              <span>MG Road Metro Complex, Bengaluru</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
