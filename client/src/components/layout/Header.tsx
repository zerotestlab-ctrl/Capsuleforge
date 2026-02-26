import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Link } from 'wouter';
import { Hexagon } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-background/50 backdrop-blur-xl">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute inset-0 bg-primary/50 blur-md rounded-full scale-110 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Hexagon className="w-8 h-8 text-primary relative z-10" strokeWidth={1.5} />
          </div>
          <span className="font-display font-bold text-2xl tracking-wider text-foreground">
            Capsule<span className="text-primary">Forge</span>
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <ConnectButton 
            chainStatus="icon" 
            showBalance={false}
          />
        </div>
      </div>
    </header>
  );
}
