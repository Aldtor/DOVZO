import { Link } from "@tanstack/react-router";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { getCategory, toneClass, type Tool } from "@/lib/tools";

export function ToolCard({ tool, compact = false }: { tool: Tool; compact?: boolean }) {
  const cat = getCategory(tool.category)!;
  const Icon = tool.icon;
  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug }}
      className="bento bento-hover group relative flex flex-col gap-3 p-5"
    >
      <div className="flex items-start justify-between">
        <span className={`grid h-11 w-11 place-items-center rounded-xl ${toneClass[cat.tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition group-hover:opacity-100" />
      </div>
      <div>
        <h3 className="font-semibold">{tool.name}</h3>
        {!compact && <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>}
      </div>
      <div className="mt-auto flex items-center gap-2 text-xs text-muted-foreground">
        <span className="rounded-md bg-secondary px-2 py-0.5">{cat.short}</span>
        {tool.popular && (
          <span className="flex items-center gap-1 text-primary">
            <TrendingUp className="h-3 w-3" /> Popular
          </span>
        )}
      </div>
    </Link>
  );
}
