import { Mail, Phone, MapPin } from 'lucide-react';
import { BrandMark } from '../BrandMark';

export const Footer = () => {
  const footerLinks = {
    produit: [
      { name: "Fonctionnalites", href: "#fonctionnalites" },
      { name: "Tarifs", href: "#" },
      { name: "Securite", href: "#" },
    ],
    entreprise: [
      { name: "A propos", href: "#" },
      { name: "Blog", href: "#" },
      { name: "Carrieres", href: "#" },
    ],
    support: [
      { name: "Centre d'aide", href: "#" },
      { name: "Documentation", href: "#" },
      { name: "Contact", href: "#" },
    ],
    legal: [
      { name: "Confidentialite", href: "#" },
      { name: "Conditions", href: "#" },
      { name: "Cookies", href: "#" },
    ]
  };

  return (
    <footer className="bg-slate-900 text-slate-300 pt-20 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12 mb-12">
          <div className="lg:col-span-2">
            <div className="mb-6 text-white">
              <BrandMark subtitle={''} labelClassName="text-2xl text-white bg-none bg-clip-border text-white" />
            </div>
            <p className="text-slate-400 mb-6 leading-relaxed">
              La plateforme de gestion des ressources humaines nouvelle generation.
            </p>
            <div className="space-y-3">
              <div className="flex items-center space-x-3 text-sm">
                <Mail className="w-4 h-4 text-primary-400" />
                <span>contact@rhpro.com</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <Phone className="w-4 h-4 text-primary-400" />
                <span>+243 000 000 000</span>
              </div>
              <div className="flex items-center space-x-3 text-sm">
                <MapPin className="w-4 h-4 text-primary-400" />
                <span>Lubumbashi, RDC</span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Produit</h3>
            <ul className="space-y-3">
              {footerLinks.produit.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-slate-400 hover:text-primary-400 transition-colors text-sm">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Entreprise</h3>
            <ul className="space-y-3">
              {footerLinks.entreprise.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-slate-400 hover:text-primary-400 transition-colors text-sm">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-slate-400 hover:text-primary-400 transition-colors text-sm">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link, i) => (
                <li key={i}>
                  <a href={link.href} className="text-slate-400 hover:text-primary-400 transition-colors text-sm">{link.name}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-slate-400">
            © 2026 RH Manager. Tous droits reserves.
          </div>
          <div className="flex items-center space-x-4 text-sm text-slate-400">
            <a href="#" className="hover:text-primary-400">Facebook</a>
            <a href="#" className="hover:text-primary-400">Twitter</a>
            <a href="#" className="hover:text-primary-400">LinkedIn</a>
            <a href="#" className="hover:text-primary-400">Instagram</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
