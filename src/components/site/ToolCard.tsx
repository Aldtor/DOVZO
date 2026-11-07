import { Link } from "@tanstack/react-router";
import { ArrowUpRight, TrendingUp } from "lucide-react";
import { getCategory, toneClass, type Tool } from "@/lib/tools";

export function ToolCard({ tool, compact = false }: { tool: Tool; compact?: boolean }) {
  const cat = getCategory(tool.category);
  if (!cat) return null;
  const Icon = tool.icon;
  return (
    <Link
      to="/tools/$slug"
      params={{ slug: tool.slug }}
      className={`bento bento-hover group relative flex h-full flex-col gap-4 p-5 ${compact ? "min-h-40" : "min-h-56"}`}
    >
      <div className="flex items-start justify-between">
        <span className={`grid h-10 w-10 place-items-center rounded-lg ${toneClass[cat.tone]}`}>
          <Icon className="h-5 w-5" />
        </span>
        <ArrowUpRight className="h-4 w-4 text-muted-foreground/60 transition group-hover:text-primary" />
      </div>
      <div>
        <h3 className="text-[15px] font-semibold leading-6">{tool.name}</h3>
        {!compact && <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{tool.description}</p>}
      </div>
      <div className="mt-auto flex flex-wrap items-center gap-3 pt-1 text-xs text-muted-foreground">
        <span>{cat.short}</span>
        {tool.popular && (
          <span className="flex items-center gap-1 text-primary">
            <TrendingUp className="h-3 w-3" /> Popular
          </span>
        )}
      </div>
    </Link>
  );
}
