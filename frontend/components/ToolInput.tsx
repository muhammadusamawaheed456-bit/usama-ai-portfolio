import { Search } from "lucide-react";

interface ToolInputProps {
  question: string;
}

export default function ToolInput({ question }: ToolInputProps) {
  return (
    <div className="my-3 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-amber-500/10 p-2">
          <Search className="h-5 w-5 text-amber-400" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold">
            Tool Input
          </h3>

          <p className="mt-2 rounded-lg bg-background/60 p-2 text-sm">
            {question}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            The AI is using this question to search Usama's knowledge base.
          </p>
        </div>
      </div>
    </div>
  );
}