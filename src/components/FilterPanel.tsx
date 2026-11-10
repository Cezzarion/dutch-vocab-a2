import type { LocalizedOption } from '../types/vocabulary'

interface FilterPanelProps {
  allSelected: boolean
  items: LocalizedOption[]
  onSelectAll: () => void
  onToggle: (id: string) => void
  selected: Set<string>
  title: string
  selectAllLabel: string
}

export default function FilterPanel({
  allSelected,
  items,
  onSelectAll,
  onToggle,
  selected,
  title,
  selectAllLabel,
}: FilterPanelProps) {
  return (
    <section aria-label={title} className="filter-panel">
      <div className="filter-heading">
        <h2>{title}</h2>
        <button aria-pressed={allSelected} className="select-all-button" onClick={onSelectAll} type="button">
          {selectAllLabel}
        </button>
      </div>
      <div className="toggle-list">
        {items.map((item) => {
          const isSelected = selected.has(item.id)
          return (
            <button
              aria-pressed={isSelected}
              className={isSelected ? 'filter-toggle is-selected' : 'filter-toggle'}
              key={item.id}
              onClick={() => onToggle(item.id)}
              type="button"
            >
              <span aria-hidden="true" className="toggle-indicator" />
              <span>{item.label}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}
