import * as React from "react";
import { Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

export function CopyField({
  label,
  value,
  monospace = false,
  className,
}: {
  label: string;
  value: string;
  monospace?: boolean;
  className?: string;
}) {
  const { toast } = useToast();
  const [copied, setCopied] = React.useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      toast({ title: "Copied", description: `${label} copied to clipboard.` });
      window.setTimeout(() => setCopied(false), 900);
    } catch (e) {
      toast({
        title: "Copy failed",
        description: "Clipboard permission blocked by browser.",
        variant: "destructive",
      });
    }
  }

  return (
    <div className={cn("rounded-2xl glass-subtle p-4", className)}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{label}</p>
          <p
            className={cn(
              "mt-1 break-all text-sm text-foreground/95",
              monospace && "font-mono text-[13px]",
            )}
          >
            {value || "—"}
          </p>
        </div>
        <Button onClick={onCopy} variant="secondary" size="icon" aria-label={`Copy ${label}`}>
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
