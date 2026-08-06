import { FileText, Database, BadgeCheck } from "lucide-react";

interface Source {
  source: string;
  title?: string;
  score?: number;
}

interface KnowledgeSummaryCardProps {
  summary: string;
  sources: Source[];
}

export default function KnowledgeSummaryCard({
  summary,
  sources,
}: KnowledgeSummaryCardProps) {
  return (
    <div className="my-3 rounded-xl border border-green-500/20 bg-green-500/5 p-4">
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-green-400" />
        <h3 className="font-semibold text-sm">
          Knowledge Summary
        </h3>
      </div>

      <p className="mt-3 text-sm leading-6">
        {summary}
      </p>

      <div className="mt-4 flex items-center gap-2">
        <Database className="h-4 w-4 text-blue-400" />

        <span className="text-xs font-medium">
          Sources Used
        </span>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {sources.length > 0 ? (
          sources.map((item, index) => (
            <span
              key={index}
              className="rounded-full bg-background px-3 py-1 text-xs border"
            >
              {item.source}
            </span>
          ))
        ) : (
          <span className="text-xs text-muted-foreground">
            No sources available
          </span>
        )}
      </div>

      <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-500/10 px-3 py-2">
        <BadgeCheck className="h-4 w-4 text-green-500" />

        <span className="text-xs">
          Verified from Usama's knowledge base
        </span>
      </div>
    </div>
  );
}