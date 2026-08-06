import { Loader2, Wrench } from "lucide-react";

export default function ToolLoading() {
  return (
    <div className="my-3 rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-blue-500/10 p-2">
          <Wrench className="h-5 w-5 text-blue-400" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold">
            Searching Knowledge Base
          </h3>

          <p className="text-xs text-muted-foreground">
            Finding relevant information...
          </p>
        </div>

        <Loader2 className="h-5 w-5 animate-spin text-blue-400" />
      </div>
    </div>
  );
}