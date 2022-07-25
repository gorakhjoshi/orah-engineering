import React, { useState } from "react"
import { Person } from "shared/models/person"
import { RolllStateType } from "shared/models/roll"
import { RollStateIcon } from "staff-app/components/roll-state/roll-state-icon.component"

interface Props {
  initialState?: RolllStateType
  size?: number
  onStateChange?: (newState: RolllStateType) => void
  getAttedence: (id: number, rollState: RolllStateType) => void
  student: Person
}
export const RollStateSwitcher: React.FC<Props> = ({ initialState = "unmark", size = 40, onStateChange, getAttedence, student }) => {
  const [currentRollState, setCurrentRollState] = useState(initialState)

  const nextState = () => {
    const states: RolllStateType[] = ["present", "late", "absent"]
    if (currentRollState === "unmark" || currentRollState === "absent") return states[0]
    const matchingIndex = states.findIndex((s) => s === currentRollState)
    return matchingIndex > -1 ? states[matchingIndex + 1] : states[0]
  }

  const onClick = () => {
    currentRollState === "unmark" && getAttedence(student.id, "present")
    currentRollState === "present" && getAttedence(student.id, "late")
    currentRollState === "late" && getAttedence(student.id, "absent")
    currentRollState === "absent" && getAttedence(student.id, "present")
    const next = nextState()
    setCurrentRollState(next)
    if (onStateChange) {
      onStateChange(next)
    }
  }

  return <RollStateIcon type={currentRollState} size={size} onClick={onClick} />
}
