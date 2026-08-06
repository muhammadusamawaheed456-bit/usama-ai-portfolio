import { AlertCircle } from "lucide-react";

interface ToolErrorProps {
  message: string;
}

export default function ToolError({ message }: ToolErrorProps) {
  return (
    <div className="my-3 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-full bg-red-500/10 p-2">
          <AlertCircle className="h-5 w-5 text-red-400" />
        </div>

        <div className="flex-1">
          <h3 className="text-sm font-semibold">
            Tool Error
          </h3>

          <p className="mt-2 text-sm leading-6">
            {message}
          </p>

          <p className="mt-2 text-xs text-muted-foreground">
            Something went wrong while searching the knowledge base.
          </p>
        </div>
      </div>
    </div>
  );
}