import { useState } from "react";
import { useAccount } from "wagmi";
import { useToast } from "@/hooks/use-toast";
import { useCreateCapsule } from "@/hooks/use-capsules";
import { generateSHA256, uploadToIPFS } from "@/lib/crypto";
import { Header } from "@/components/layout/Header";
import { GlassCard } from "@/components/ui/glass-card";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "wouter";
import { 
  Bot, ShieldAlert, Radio, Rocket, ImageIcon, 
  UploadCloud, Key, FileText, CheckCircle2, Copy, 
  ExternalLink, ArrowRight, Loader2
} from "lucide-react";
import type { CapsuleResponse } from "@shared/routes";

const TEMPLATES = [
  {
    icon: <Bot className="w-4 h-4" />,
    name: "Discord Bot",
    projectName: "VibeBot Alpha",
    xHandle: "@vibebot_xyz",
    description: "Automated community manager and vibe checker for Discord servers.",
    transcript: "function checkVibe(msg) {\n  const vibes = ['good', 'bad', 'neutral'];\n  return vibes[Math.floor(Math.random() * vibes.length)];\n}\n\nclient.on('message', msg => {\n  if(msg.content === '!vibe') {\n    msg.reply(checkVibe(msg));\n  }\n});"
  },
  {
    icon: <ShieldAlert className="w-4 h-4" />,
    name: "Scam Detector",
    projectName: "RugSafe Pro",
    xHandle: "@rugsafe_web3",
    description: "Heuristic analysis tool to detect common smart contract vulnerabilities.",
    transcript: "contract RugSafe {\n  function analyze(address target) public view returns (uint riskScore) {\n    // Simulated logic\n    return 42;\n  }\n}"
  },
  {
    icon: <Radio className="w-4 h-4" />,
    name: "VibeSignal Radar",
    projectName: "Signal Tracker",
    xHandle: "@vibesignal_hq",
    description: "Tracks on-chain sentiment and social volume for new token launches.",
    transcript: "import { getSocialVolume } from 'api';\n\nasync function trackSignal(contract) {\n  const vol = await getSocialVolume(contract);\n  console.log(`Current signal strength: ${vol}`);\n}"
  },
  {
    icon: <Rocket className="w-4 h-4" />,
    name: "Token Launcher",
    projectName: "FairLaunch DAO",
    xHandle: "@fairlaunchdao",
    description: "A standard ERC20 implementation with anti-bot measures.",
    transcript: "pragma solidity ^0.8.20;\nimport '@openzeppelin/contracts/token/ERC20/ERC20.sol';\n\ncontract FairToken is ERC20 {\n  constructor() ERC20('Fair', 'FAIR') {\n    _mint(msg.sender, 1000000 * 10**decimals());\n  }\n}"
  },
  {
    icon: <ImageIcon className="w-4 h-4" />,
    name: "NFT Minter",
    projectName: "VibeDrops",
    xHandle: "@vibedrops_nft",
    description: "Gas-optimized ERC721A implementation for smooth minting experiences.",
    transcript: "pragma solidity ^0.8.4;\nimport 'erc721a/contracts/ERC721A.sol';\n\ncontract VibeDrops is ERC721A {\n  constructor() ERC721A('VibeDrops', 'VIBE') {}\n\n  function mint(uint256 quantity) external payable {\n    _mint(msg.sender, quantity);\n  }\n}"
  }
];

export default function Home() {
  const { address, isConnected } = useAccount();
  const { toast } = useToast();
  const createMutation = useCreateCapsule();

  const [formData, setFormData] = useState({
    projectName: "",
    xHandle: "",
    description: "",
    transcript: "",
    apiKey: ""
  });
  
  const [file, setFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successData, setSuccessData] = useState<CapsuleResponse | null>(null);

  const handleTemplateClick = (template: typeof TEMPLATES[0]) => {
    setFormData({
      ...formData,
      projectName: template.projectName,
      xHandle: template.xHandle,
      description: template.description,
      transcript: template.transcript
    });
    toast({
      title: "Template Loaded",
      description: `Loaded ${template.name} preset data.`,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !address) {
      toast({
        title: "Wallet Required",
        description: "Please connect your wallet to seal a capsule.",
        variant: "destructive"
      });
      return;
    }

    if (!formData.projectName || !formData.description || !formData.transcript) {
      toast({
        title: "Missing Fields",
        description: "Project Name, Description, and Transcript are required.",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);

    try {
      // 1. Hash the content
      const contentToHash = `${formData.projectName}|${formData.description}|${formData.transcript}`;
      const hash = await generateSHA256(contentToHash);

      // 2. IPFS Upload (Optional)
      let ipfsCid = null;
      if (file && formData.apiKey) {
        try {
          ipfsCid = await uploadToIPFS(file, formData.apiKey);
          toast({ title: "IPFS Upload", description: "File successfully pinned to IPFS." });
        } catch (err) {
          toast({ 
            title: "IPFS Upload Failed", 
            description: err instanceof Error ? err.message : "Failed to upload to IPFS",
            variant: "destructive"
          });
          setIsProcessing(false);
          return;
        }
      }

      // 3. Save to Database
      const result = await createMutation.mutateAsync({
        projectName: formData.projectName,
        xHandle: formData.xHandle || null,
        description: formData.description,
        transcript: formData.transcript,
        walletAddress: address,
        ipfsCid: ipfsCid,
        hash: hash
      });

      setSuccessData(result);
      window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (err) {
      toast({
        title: "Sealing Failed",
        description: err instanceof Error ? err.message : "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-12 lg:py-20">
        <AnimatePresence mode="wait">
          {!successData ? (
            <motion.div 
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-4xl mx-auto space-y-12"
            >
              {/* Hero Section */}
              <div className="text-center space-y-6">
                <h1 className="text-5xl md:text-7xl font-bold text-glow">
                  Seal Your Build. <br/>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-primary">
                    Prove Your Vibe.
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Create a cryptographically verifiable origin capsule for your Vibestarter project on Base in under 60 seconds.
                </p>
              </div>

              {/* Templates */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-widest text-center">
                  Quick Start Templates
                </h3>
                <div className="flex flex-wrap justify-center gap-3">
                  {TEMPLATES.map((tpl) => (
                    <button
                      key={tpl.name}
                      onClick={() => handleTemplateClick(tpl)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-primary/50 transition-all duration-300 text-sm"
                    >
                      <span className="text-primary">{tpl.icon}</span>
                      {tpl.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Form Card */}
              <GlassCard>
                <form onSubmit={handleSubmit} className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">Project Name <span className="text-primary">*</span></label>
                      <input 
                        type="text" 
                        required
                        value={formData.projectName}
                        onChange={e => setFormData({...formData, projectName: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-white placeholder:text-white/30"
                        placeholder="e.g. VibeSignal Alpha"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white/80">X (Twitter) Handle</label>
                      <div className="relative">
                        <span className="absolute left-4 top-3 text-white/30">@</span>
                        <input 
                          type="text" 
                          value={formData.xHandle.replace('@', '')}
                          onChange={e => setFormData({...formData, xHandle: `@${e.target.value.replace('@','')}`})}
                          className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-white placeholder:text-white/30"
                          placeholder="vibestarter"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80">Short Description <span className="text-primary">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-white placeholder:text-white/30"
                      placeholder="What does your build do?"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white/80 flex items-center justify-between">
                      <span>Code Transcript / Details <span className="text-primary">*</span></span>
                      <span className="text-xs text-white/40 font-normal">Will be SHA-256 hashed</span>
                    </label>
                    <textarea 
                      required
                      rows={8}
                      value={formData.transcript}
                      onChange={e => setFormData({...formData, transcript: e.target.value})}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-white placeholder:text-white/30 font-mono text-sm"
                      placeholder="Paste your core contract code, API logic, or detailed specifications here..."
                    />
                  </div>

                  <div className="p-6 rounded-xl border border-dashed border-white/20 bg-white/[0.02] space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/20 rounded-lg text-primary">
                        <UploadCloud className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="font-medium text-white">IPFS Artifact Storage (Optional)</h4>
                        <p className="text-sm text-white/50">Pin your source files permanently to IPFS via nft.storage</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">nft.storage API Key</label>
                        <div className="relative">
                          <Key className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                          <input 
                            type="password" 
                            value={formData.apiKey}
                            onChange={e => setFormData({...formData, apiKey: e.target.value})}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-white placeholder:text-white/30"
                            placeholder="ey..."
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-white/80">Artifact File (.zip, .pdf)</label>
                        <div className="relative">
                          <FileText className="absolute left-3 top-3 w-5 h-5 text-white/30" />
                          <input 
                            type="file" 
                            onChange={handleFileChange}
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all text-white file:mr-4 file:py-1 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/20 file:text-primary hover:file:bg-primary/30 cursor-pointer"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing || !isConnected}
                    className="w-full relative group overflow-hidden rounded-xl p-[2px] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-70 group-hover:opacity-100 transition-opacity blur-md animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary via-purple-500 to-primary opacity-100"></div>
                    <div className="relative bg-background px-8 py-4 rounded-xl flex items-center justify-center gap-3 transition-all duration-300 group-hover:bg-opacity-0">
                      {isProcessing ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-white" />
                          <span className="font-bold text-white tracking-wide">SEALING CAPSULE...</span>
                        </>
                      ) : (
                        <>
                          <span className="font-bold text-white tracking-wide group-hover:text-white">
                            {isConnected ? "SEAL ORIGIN CAPSULE" : "CONNECT WALLET TO SEAL"}
                          </span>
                          <ArrowRight className="w-5 h-5 text-primary group-hover:text-white group-hover:translate-x-1 transition-all" />
                        </>
                      )}
                    </div>
                  </button>
                </form>
              </GlassCard>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-3xl mx-auto space-y-8"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/20 text-primary mb-4 box-glow">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-4xl font-bold text-glow">Capsule Sealed Successfully</h2>
                <p className="text-muted-foreground">Your project's origin timestamp and cryptographic proof are secure.</p>
              </div>

              <GlassCard variant="purple" className="space-y-6">
                <div className="space-y-4">
                  <div className="p-4 bg-black/50 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/50 mb-1">Capsule ID</p>
                      <p className="font-mono text-primary truncate max-w-[200px] sm:max-w-md">{successData.id}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(successData.id, "Capsule ID")}
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                    >
                      <Copy className="w-4 h-4" /> Copy ID
                    </button>
                  </div>

                  <div className="p-4 bg-black/50 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                      <p className="text-sm text-white/50 mb-1">SHA-256 Hash</p>
                      <p className="font-mono text-purple-400 truncate max-w-[200px] sm:max-w-md">{successData.hash}</p>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(successData.hash, "Hash")}
                      className="flex items-center gap-2 text-sm text-white/70 hover:text-white bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                    >
                      <Copy className="w-4 h-4" /> Copy Hash
                    </button>
                  </div>

                  {successData.ipfsCid && (
                    <div className="p-4 bg-black/50 rounded-xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <p className="text-sm text-white/50 mb-1">IPFS CID</p>
                        <p className="font-mono text-white/90 truncate max-w-[200px] sm:max-w-md">{successData.ipfsCid}</p>
                      </div>
                      <a 
                        href={`https://ipfs.io/ipfs/${successData.ipfsCid}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-sm text-white/70 hover:text-primary bg-white/5 px-3 py-1.5 rounded-lg border border-white/10 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" /> View IPFS
                      </a>
                    </div>
                  )}
                </div>

                <div className="pt-6 border-t border-white/10 space-y-4">
                  <div>
                    <h4 className="font-medium text-white mb-2 flex items-center justify-between">
                      <span>Vibestarter Verification Text</span>
                      <button 
                        onClick={() => copyToClipboard(`Sealed Capsule on Base: ${successData.id} - ${successData.projectName}.\nVerify: ${window.location.origin}/c/${successData.id}`, "Verification Text")}
                        className="text-xs text-primary hover:underline flex items-center gap-1"
                      >
                        <Copy className="w-3 h-3" /> Copy All
                      </button>
                    </h4>
                    <div className="p-4 bg-black/50 rounded-xl border border-white/10 font-mono text-sm text-white/70 whitespace-pre-wrap break-all">
                      Sealed Capsule on Base: {successData.id} - {successData.projectName}.
                      {'\n'}Verify: {window.location.origin}/c/{successData.id}
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Link 
                      href={`/c/${successData.id}`}
                      className="flex-1 text-center bg-primary text-primary-foreground font-semibold px-6 py-3 rounded-xl hover:bg-primary/90 transition-colors"
                    >
                      View Public Verification Page
                    </Link>
                    <button 
                      onClick={() => {
                        setSuccessData(null);
                        setFormData({ projectName: "", xHandle: "", description: "", transcript: "", apiKey: "" });
                        setFile(null);
                      }}
                      className="flex-1 text-center bg-white/5 text-white font-semibold px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 transition-colors"
                    >
                      Seal Another Build
                    </button>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
