import { useRoute } from "wouter";
import { useCapsule } from "@/hooks/use-capsules";
import { Header } from "@/components/layout/Header";
import { GlassCard } from "@/components/ui/glass-card";
import { Loader2, Shield, Calendar, Wallet, ExternalLink, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function CapsuleView() {
  const [, params] = useRoute("/c/:id");
  const id = params?.id || "";
  
  const { data: capsule, isLoading, error } = useCapsule(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  if (error || !capsule) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <Shield className="w-16 h-16 text-destructive mb-4 opacity-50" />
          <h2 className="text-2xl font-bold mb-2">Capsule Not Found</h2>
          <p className="text-muted-foreground mb-6">The requested origin capsule could not be located or does not exist.</p>
          <Link href="/" className="px-6 py-3 bg-white/10 rounded-xl hover:bg-white/20 transition-colors">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(capsule.createdAt || Date.now());

  return (
    <div className="min-h-screen flex flex-col pb-20">
      <Header />
      
      <main className="container mx-auto px-4 mt-8 max-w-4xl">
        <Link href="/" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Forge
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold uppercase tracking-wider rounded-full border border-primary/30">
                Verified Origin
              </span>
              {capsule.xHandle && (
                <span className="text-sm text-white/50">{capsule.xHandle}</span>
              )}
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-glow mb-4">{capsule.projectName}</h1>
            <p className="text-lg text-white/70">{capsule.description}</p>
          </div>
          
          <div className="text-left md:text-right space-y-1">
            <p className="text-sm text-white/40 flex items-center md:justify-end gap-2">
              <Calendar className="w-4 h-4" /> Sealed on Base
            </p>
            <p className="font-mono text-white/90">
              {date.toLocaleDateString()} at {date.toLocaleTimeString()}
            </p>
          </div>
        </div>

        <div className="space-y-6">
          <GlassCard className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2 border-b border-white/10 pb-4">
              <Shield className="w-5 h-5 text-primary" /> Cryptographic Proof
            </h3>
            
            <div className="grid grid-cols-1 gap-6">
              <div>
                <p className="text-sm text-white/50 mb-1">Capsule ID</p>
                <div className="p-3 bg-black/40 rounded-xl font-mono text-sm border border-white/5 text-white/90 break-all">
                  {capsule.id}
                </div>
              </div>

              <div>
                <p className="text-sm text-white/50 mb-1">SHA-256 Hash</p>
                <div className="p-3 bg-black/40 rounded-xl font-mono text-sm border border-purple-500/30 text-purple-400 break-all">
                  {capsule.hash}
                </div>
              </div>

              <div>
                <p className="text-sm text-white/50 mb-1 flex items-center gap-2">
                  <Wallet className="w-4 h-4" /> Sealer Wallet Address
                </p>
                <div className="p-3 bg-black/40 rounded-xl font-mono text-sm border border-white/5 text-primary break-all">
                  {capsule.walletAddress}
                </div>
              </div>

              {capsule.ipfsCid && (
                <div>
                  <p className="text-sm text-white/50 mb-1 flex items-center gap-2">
                    IPFS Content Identifier
                  </p>
                  <a 
                    href={`https://ipfs.io/ipfs/${capsule.ipfsCid}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 bg-black/40 rounded-xl font-mono text-sm border border-white/5 hover:border-primary/50 text-white/90 transition-all group"
                  >
                    <span className="truncate mr-4">{capsule.ipfsCid}</span>
                    <ExternalLink className="w-4 h-4 text-white/30 group-hover:text-primary flex-shrink-0" />
                  </a>
                </div>
              )}
            </div>
          </GlassCard>

          <GlassCard variant="purple">
            <h3 className="text-xl font-bold border-b border-white/10 pb-4 mb-4">Sealed Transcript</h3>
            <pre className="p-6 bg-black/50 rounded-xl border border-white/10 overflow-x-auto text-sm font-mono text-white/80 whitespace-pre-wrap">
              {capsule.transcript}
            </pre>
          </GlassCard>
        </div>
      </main>
    </div>
  );
}
