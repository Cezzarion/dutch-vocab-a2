import { useState } from 'react'
import { shuffleEntries } from '../../domain/vocabulary'
import type { MatchFeedback, MatchItemState, MatchTargetState, MatchableId } from './types'

export function useMatchingRound<Id extends MatchableId>(sourceIds: readonly Id[]) {
  const [order, setOrder] = useState<Id[]>(() => shuffleEntries([...sourceIds]))
  const [completed, setCompleted] = useState<Set<Id>>(() => new Set())
  const [activeItem, setActiveItem] = useState<Id | null>(null)
  const [activeTarget, setActiveTarget] = useState<Id | null>(null)
  const [dragTarget, setDragTarget] = useState<Id | null>(null)
  const [wrongItem, setWrongItem] = useState<Id | null>(null)
  const [wrongTarget, setWrongTarget] = useState<Id | null>(null)
  const [feedback, setFeedback] = useState<MatchFeedback>(null)

  const remaining = order.filter((id) => !completed.has(id))
  const isComplete = completed.size === sourceIds.length

  function clearFeedback() {
    setWrongItem(null)
    setWrongTarget(null)
    setFeedback(null)
  }

  function match(item: Id, target: Id) {
    setDragTarget(null)
    if (completed.has(item) || completed.has(target)) return
    if (item !== target) {
      setActiveItem(item)
      setActiveTarget(null)
      setWrongItem(item)
      setWrongTarget(target)
      setFeedback('incorrect')
      return
    }
    setCompleted((current) => new Set(current).add(item))
    setActiveItem(null)
    setActiveTarget(null)
    setWrongItem(null)
    setWrongTarget(null)
    setFeedback('correct')
  }

  function selectItem(item: Id) {
    if (completed.has(item)) return
    if (activeTarget) {
      match(item, activeTarget)
      return
    }
    clearFeedback()
    setActiveItem((current) => current === item ? null : item)
  }

  function selectTarget(target: Id) {
    if (completed.has(target)) return
    if (activeItem) {
      match(activeItem, target)
      return
    }
    clearFeedback()
    setActiveTarget((current) => current === target ? null : target)
  }

  function beginDrag(item: Id) {
    if (completed.has(item)) return
    clearFeedback()
    setActiveTarget(null)
    setActiveItem(item)
  }

  function dragOver(target: Id) {
    if (!completed.has(target)) setDragTarget(target)
  }

  function drop(item: Id, target: Id) {
    setDragTarget(null)
    if (!sourceIds.includes(item) || !sourceIds.includes(target)) return
    match(item, target)
  }

  function reset() {
    setOrder(shuffleEntries([...sourceIds]))
    setCompleted(new Set())
    setActiveItem(null)
    setActiveTarget(null)
    setDragTarget(null)
    setWrongItem(null)
    setWrongTarget(null)
    setFeedback(null)
  }

  function targetState(id: Id): MatchTargetState {
    if (completed.has(id)) return 'correct'
    if (wrongTarget === id) return 'incorrect'
    if (activeTarget === id) return 'selected'
    if (dragTarget === id) return 'drop-target'
    return ''
  }

  function itemState(id: Id): MatchItemState {
    if (wrongItem === id) return 'incorrect'
    if (activeItem === id) return 'selected'
    return ''
  }

  return {
    order,
    remaining,
    completed,
    activeItem,
    activeTarget,
    dragTarget,
    wrongItem,
    wrongTarget,
    feedback,
    isComplete,
    clearFeedback,
    selectItem,
    selectTarget,
    beginDrag,
    dragOver,
    setDragTarget,
    drop,
    reset,
    targetState,
    itemState,
  }
}
