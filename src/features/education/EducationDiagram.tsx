import type { DragEvent, KeyboardEvent, MouseEvent } from 'react'
import type { MatchTargetState } from '../matching/types'
import type { EducationLevel } from './educationLevels'

interface EducationDiagramProps {
  ariaLabel: string
  completed: ReadonlySet<EducationLevel>
  getTargetState: (level: EducationLevel) => MatchTargetState
  targetLabel: (level: EducationLevel) => string
  onClick: (event: MouseEvent<SVGSVGElement>) => void
  onKeyDown: (event: KeyboardEvent<SVGSVGElement>) => void
  onDragOver: (event: DragEvent<SVGSVGElement>) => void
  onDrop: (event: DragEvent<SVGSVGElement>) => void
  onDragLeave: (event: DragEvent<SVGSVGElement>) => void
}

export default function EducationDiagram({
  ariaLabel,
  completed,
  getTargetState,
  targetLabel,
  onClick,
  onKeyDown,
  onDragOver,
  onDrop,
  onDragLeave,
}: EducationDiagramProps) {
  function targetProps(level: EducationLevel, baseClass = '') {
    const state = getTargetState(level)
    const stateClass = state === 'selected' ? ' is-target-selected' : state ? ` is-${state}` : ''
    return {
      'data-education-target': level,
      'aria-label': targetLabel(level),
      'aria-pressed': state === 'selected',
      'aria-disabled': state === 'correct',
      className: `${baseClass} education-target${stateClass}`.trim(),
      role: 'button' as const,
      tabIndex: state === 'correct' ? -1 : 0,
    }
  }

  return (
    <svg aria-label={ariaLabel} className="education-diagram" onClick={onClick}
      onKeyDown={onKeyDown} onDragOver={onDragOver} onDrop={onDrop}
      onDragLeave={onDragLeave} role="group" viewBox="0 0 1400 1100">
      <defs>
        <marker id="education-arrow" markerHeight="8" markerWidth="8" orient="auto" refX="6" refY="4">
          <path d="M0,0 L8,4 L0,8 z" fill="#0878b5" />
        </marker>
      </defs>
      <rect className="education-bg" height="1060" width="1360" x="20" y="20" />
      <text className="education-age" x="130" y="92">22</text>
      <text className="education-age" x="130" y="130">21</text>
      <text className="education-age" x="130" y="168">20</text>
      <text className="education-age" x="130" y="382">18</text>
      <text className="education-age" x="130" y="420">17</text>
      <text className="education-age" x="130" y="458">16</text>
      <text className="education-age" x="130" y="790">12</text>
      <text className="education-age" x="130" y="934">4</text>
      <text className="education-age" x="130" y="1022">2</text>
      <text className="education-side-label" transform="rotate(-90 68 610)" x="68" y="610">leeftijd</text>

      <rect height="250" width="220" x="170" y="70" {...targetProps('wo', 'education-higher-box education-dropzone')} />
      {completed.has('wo') && <text className="education-match-label" x="280" y="211">wo</text>}
      <rect height="220" width="230" x="410" y="130" {...targetProps('hbo', 'education-higher-box education-dropzone')} />
      {completed.has('hbo') && <text className="education-match-label" x="525" y="253">hbo</text>}

      <rect className="education-mbo-frame" height="230" width="650" x="690" y="190" />
      <rect className="education-mbo-column" height="162" width="150" x="705" y="243" />
      <rect className="education-mbo-column" height="132" width="130" x="865" y="273" />
      <rect className="education-mbo-column" height="102" width="130" x="1005" y="303" />
      <rect className="education-mbo-column" height="72" width="120" x="1145" y="333" />
      <rect height="230" width="650" x="690" y="190" {...targetProps('mbo', 'education-mbo-target')} />
      {completed.has('mbo') && <text className="education-match-label" x="1015" y="224">mbo</text>}

      <rect height="375" width="220" x="170" y="365" {...targetProps('vwo', 'education-secondary-target education-vwo-target')} />
      {completed.has('vwo') && <text className="education-match-label" x="280" y="565">vwo</text>}
      <rect height="345" width="230" x="410" y="405" {...targetProps('havo', 'education-secondary-target education-havo-target')} />
      {completed.has('havo') && <text className="education-match-label" x="525" y="589">havo</text>}
      <rect height="320" width="650" x="690" y="430" className="education-secondary-block education-vmbo-block" />
      <rect height="80" width="650" x="690" y="430" {...targetProps('vmbo', 'education-vmbo-target')} />
      {completed.has('vmbo') && <text className="education-match-label" x="1015" y="482">vmbo</text>}

      <path className="education-arrow" d="M410 110 H392" markerEnd="url(#education-arrow)" />
      <path className="education-arrow" d="M705 250 V165 H650" markerEnd="url(#education-arrow)" />
      <path className="education-arrow" d="M280 365 V332" markerEnd="url(#education-arrow)" />
      <path className="education-arrow" d="M525 405 V356" markerEnd="url(#education-arrow)" />
      <path className="education-arrow" d="M1035 430 V405" markerEnd="url(#education-arrow)" />
      <path className="education-arrow education-arrow-horizontal" d="M782 530 V505 H650" markerEnd="url(#education-arrow)" />

      <rect className="education-pathway-card" height="220" width="145" x="710" y="530" />
      <rect className="education-pathway-card" height="220" width="145" x="870" y="530" />
      <rect className="education-pathway-card" height="220" width="145" x="1030" y="530" />
      <rect className="education-pathway-card" height="220" width="145" x="1190" y="530" />
      <text className="education-pathway-label" x="782" y="568"><tspan x="782">theore-</tspan><tspan x="782" dy="27">tische</tspan><tspan x="782" dy="27">leerweg</tspan><tspan x="782" dy="27">(tl)</tspan></text>
      <text className="education-pathway-label" x="942" y="568"><tspan x="942">gemengde</tspan><tspan x="942" dy="27">leerweg</tspan></text>
      <text className="education-pathway-label" x="1102" y="552"><tspan x="1102">kader</tspan><tspan x="1102" dy="27">beroeps-</tspan><tspan x="1102" dy="27">gerichte</tspan><tspan x="1102" dy="27">leerweg</tspan></text>
      <text className="education-pathway-label" x="1262" y="552"><tspan x="1262">basis</tspan><tspan x="1262" dy="27">beroeps-</tspan><tspan x="1262" dy="27">gerichte</tspan><tspan x="1262" dy="27">leerweg</tspan></text>

      <rect className="education-primary-block" height="125" width="1170" x="170" y="790" />
      <text className="education-primary-label" x="755" y="865">basisschool</text>
      <rect className="education-primary-block" height="85" width="1170" x="170" y="945" />
      <text className="education-primary-label" x="755" y="998">voorschool of peuteropvang</text>
    </svg>
  )
}
