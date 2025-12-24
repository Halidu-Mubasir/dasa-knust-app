import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-muted/40">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About Section */}
          <div>
            <h3 className="font-bold text-lg mb-4">DASA KNUST</h3>
            <p className="text-sm text-muted-foreground">
              Dagomba Student Association - Promoting unity, culture, and academic excellence at KNUST.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Quick Links</h3>
            <div className="grid grid-cols-2 gap-4">
              <ul className="space-y-2">
                <li><Link href="/about" className="text-sm text-muted-foreground hover:text-primary transition-colors">About Us</Link></li>
                <li><Link href="/events" className="text-sm text-muted-foreground hover:text-primary transition-colors">Events</Link></li>
                <li><Link href="/elections" className="text-sm text-muted-foreground hover:text-primary transition-colors">Elections</Link></li>
                <li><Link href="/constitution" className="text-sm text-muted-foreground hover:text-primary transition-colors">Constitution</Link></li>
              </ul>
              <ul className="space-y-2">
                <li><Link href="/career" className="text-sm text-muted-foreground hover:text-primary transition-colors">Career & Opps</Link></li>
                <li><Link href="/welfare" className="text-sm text-muted-foreground hover:text-primary transition-colors">Report Issue</Link></li>
                <li><Link href="/lost-and-found" className="text-sm text-muted-foreground hover:text-primary transition-colors">Lost & Found</Link></li>
                <li><Link href="/market" className="text-sm text-muted-foreground hover:text-primary transition-colors">Marketplace</Link></li>
              </ul>
            </div>
          </div>

          {/* Social Links */}
          <div>
            <h3 className="font-bold text-lg mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-4">
              <a
                href="https://facebook.com/dasaknust"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/DasaKnust"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="mailto:Dasaknust2020@gmail.com"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Email"
              >
                <Mail className="h-5 w-5" />
              </a>
            </div>
              <span> <strong>Phone: </strong> 233 (0) 554 481 495</span> <br></br>
              <span> <strong>Email: </strong>Dasaknust2020@gmail.com</span>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-8 border-t text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} DASA KNUST. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
