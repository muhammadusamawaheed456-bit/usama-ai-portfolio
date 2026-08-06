import { CheckCircle2, Sparkles } from "lucide-react";

interface ToolOutputProps {
  message: string;
}

export default function ToolOutput({ message }: ToolOutputProps) {
  return (
    <div className="my-3 rounded-xl border border-purple-500/20 bg-purple-500/5 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-purple-500/10 p-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
        </div>

        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold">
              Tool Output
            </h3>

            <CheckCircle2 className="h-4 w-4 text-green-400" />
          </div>

          <p className="mt-2 text-sm leading-6">
            {message}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Tool execution completed successfully.
          </p>
        </div>
      </div>
    </div>
  );
}