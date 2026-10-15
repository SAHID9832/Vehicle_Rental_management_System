import React from 'react';
import { Link } from 'react-router-dom';
import { Car, MapPin, Phone, Mail, ShieldCheck, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-teal-500 flex items-center justify-center text-white">
                <Car className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-black tracking-tight text-white">VEKTOR</span>
                <span className="text-xl font-light tracking-tight text-teal-400">RENTALS</span>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed">
              Vektor Rentals is a modern vehicle rental management platform engineered with
              Data Structures and Algorithms for optimal fleet allocation, search, and booking
              integrity.
            </p>
            <div className="flex items-center gap-2 text-xs text-teal-400 font-semibold bg-teal-950/60 border border-teal-800/60 px-3 py-1.5 rounded-lg w-fit">
              <Cpu className="w-4 h-4" />
              <span>MCA Academic Capstone • DSA Engineered</span>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/vehicles" className="hover:text-teal-400 transition-colors">
                  Browse Fleet
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-teal-400 transition-colors">
                  Pricing & Policies
                </Link>
              </li>
              <li>
                <Link to="/help" className="hover:text-teal-400 transition-colors">
                  FAQs & Support
                </Link>
              </li>
              <li>
                <Link to="/auth" className="hover:text-teal-400 transition-colors">
                  Customer Sign In
                </Link>
              </li>
            </ul>
          </div>

          {/* DSA Implementations */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">DSA Core</h4>
            <ul className="space-y-2.5 text-sm text-slate-400">
              <li>• Singly Linked List</li>
              <li>• Stack (Rental Cost Eval)</li>
              <li>• Queue (Waiting List)</li>
              <li>• Binary Search Tree</li>
              <li>• Graph & BFS Traversal</li>
              <li>• Merge Sort & Binary Search</li>
              <li>• Greedy Fleet Allocator</li>
            </ul>
          </div>

          {/* Contact Bengaluru */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Hub Office</h4>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
                <span>MG Road Metro Station Complex, Bengaluru, KA 560001</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                <span>+91 80 4968 2000</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-teal-400 shrink-0" />
                <span>support@vektor.in</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Vektor Rentals Management System. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-teal-400">
              <ShieldCheck className="w-4 h-4" /> 100% Parameterized & Protected
            </span>
            <span>Bengaluru, India</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
