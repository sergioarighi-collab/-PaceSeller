import type { Severity } from '../../lib/types'

const dot: Record<string, string> = {
  risk: 'bg-risk',
  positive: 'bg-positive',
  info: 'bg-info',
  neutral: 'bg-border-strong',
}

export interface ListRowData {
  id: string
  tone: Severity
  label: string
  count: number
}

export function ListGroup({ rows, onRowClick }: { rows: ListRowData[]; onRowClick?: (id: string) => void }) {
  return (
    <div className="mt-3.5 bg-surface rounded-[4px] border border-border overflow-hidden md:hidden">
      {rows.map((r) => (
        <div
          key={r.id}
          onClick={() => onRowClick?.(r.id)}
          className="flex items-center justify-between px-3.5 py-3 border-b border-border-soft last:border-b-0 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${dot[r.tone]}`} />
            <span className="text-[13px] text-text-primary font-medium">{r.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-tertiary">{r.count}</span>
            <span className="text-text-tertiary text-sm">›</span>
          </div>
        </div>
      ))}
    </div>
  )
}

export function TileGrid({ rows, onTileClick }: { rows: ListRowData[]; onTileClick?: (id: string) => void }) {
  return (
    <div className="hidden md:grid grid-cols-2 gap-3.5 mt-3.5">
      {rows.map((r) => (
        <div
          key={r.id}
          onClick={() => onTileClick?.(r.id)}
          className="flex items-center justify-between bg-surface border border-border rounded-[4px] px-4 py-3.5 cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <span className={`w-2 h-2 rounded-full ${dot[r.tone]}`} />
            <span className="text-[13px] text-text-primary font-medium">{r.label}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-text-tertiary">{r.count}</span>
            <span className="text-text-tertiary text-sm">›</span>
          </div>
        </div>
      ))}
    </div>
  )
}
