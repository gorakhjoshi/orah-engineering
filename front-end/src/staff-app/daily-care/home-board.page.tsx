import { faSort } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import Button from "@material-ui/core/ButtonBase"
import React, { useEffect, useState } from "react"
import { CenteredContainer } from "shared/components/centered-container/centered-container.component"
import { useApi } from "shared/hooks/use-api"
import { Person } from "shared/models/person"
import { Colors } from "shared/styles/colors"
import { BorderRadius, FontWeight, Spacing } from "shared/styles/styles"
import { ActiveRollAction, ActiveRollOverlay } from "staff-app/components/active-roll-overlay/active-roll-overlay.component"
import { StudentListTile } from "staff-app/components/student-list-tile/student-list-tile.component"
import styled from "styled-components"
import { RolllStateType } from "shared/models/roll"

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({
    url: "get-homeboard-students",
  })
  const [students, setStudents] = useState<Person[]>([])

  const [searchStudents, setSearchStudents] = useState<Person[]>([])
  const [attedence, setAttedence] = useState({
    present: 0,
    late: 0,
    absent: 0,
  })

  const [searchFilter, setSearchFilter] = useState("all")

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    if (loadState === "loaded") {
      if (isRollMode) {
        data!.students.forEach((s) => {
          s.rollState = "unmark"
        })
      }
      setStudents(data!.students)
      setSearchStudents(data!.students)
    }
  }, [loadState, isRollMode])

  const onToolbarAction = (action: ToolbarAction, value?: string) => {
    if (action === "roll") {
      setIsRollMode(true)
    }

    if (loadState === "loaded" && action === "sortFirst") {
      if (value === "asc") {
        setSearchStudents(() => [...searchStudents.sort((a, b) => (a.first_name.toLowerCase() > b.first_name.toLowerCase() ? 1 : -1))])
      }

      if (value === "dec") {
        setSearchStudents(() => [...searchStudents.sort((a, b) => (a.first_name.toLowerCase() < b.first_name.toLowerCase() ? 1 : -1))])
      }
    }

    if (loadState === "loaded" && action === "sortLast") {
      if (value === "asc") {
        setSearchStudents(() => [...searchStudents.sort((a, b) => (a.last_name.toLowerCase() > b.last_name.toLowerCase() ? 1 : -1))])
      }
      if (value === "dec") {
        setSearchStudents(() => [...searchStudents.sort((a, b) => (a.last_name.toLowerCase() < b.last_name.toLowerCase() ? 1 : -1))])
      }
    }
  }

  const onActiveRollAction = (action: ActiveRollAction) => {
    if (action === "exit") {
      setIsRollMode(false)
    }
  }

  const onSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value.trim()) {
      const searchData = students.filter((item) => {
        if ((item.first_name + " " + item.last_name).toLowerCase().includes(e.target.value.toLowerCase())) return item
      })
      setSearchStudents(() => [...searchData])
    } else {
      setSearchStudents(() => [...students])
    }
  }

  function getAttedence(id: number, rollState: RolllStateType) {
    searchStudents?.forEach((s) => s.id === id && (s.rollState = rollState))

    let presentCount = 0
    let lateCount = 0
    let absentCount = 0

    searchStudents.forEach((s) => {
      if (s.rollState === "present") presentCount++
      if (s.rollState === "late") lateCount++
      if (s.rollState === "absent") absentCount++
    })

    setAttedence((prev) => {
      return { ...prev, present: presentCount, late: lateCount, absent: absentCount }
    })
  }

  return (
    <>
      <S.PageContainer>
        <Toolbar onItemClick={onToolbarAction} onSearch={onSearch} />

        {loadState === "loading" && (
          <CenteredContainer>
            <FontAwesomeIcon icon="spinner" size="2x" spin />
          </CenteredContainer>
        )}

        {loadState === "loaded" && data?.students && (
          <>
            {searchStudents
              .filter((item) => {
                if (searchFilter === "all") return item
                else if (item.rollState === searchFilter) return item
              })
              .map((s) => (
                <StudentListTile key={s.id} isRollMode={isRollMode} student={s} getAttedence={getAttedence} />
              ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay sortStatus={setSearchFilter} isActive={isRollMode} onItemClick={onActiveRollAction} attedence={attedence} totalStudents={students?.length} />
    </>
  )
}

type ToolbarAction = "roll" | "sortFirst" | "sortLast"
interface ToolbarProps {
  onItemClick: (action: ToolbarAction, value?: string) => void
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void
}
const Toolbar: React.FC<ToolbarProps> = (props) => {
  const [toggle, setToggle] = useState(true)
  const { onItemClick, onSearch } = props
  return (
    <S.ToolbarContainer>
      <div className="toggleName">
        <div className="toggle">
          <div>First</div>
          <FontAwesomeIcon
            icon={faSort}
            title="Ascending "
            className="icon"
            inverse
            onClick={() => {
              setToggle(!toggle)
              onItemClick("sortFirst", toggle ? "asc" : "dec")
            }}
          />
        </div>
        <div className="toggle">
          <div>Last</div>
          <FontAwesomeIcon
            icon={faSort}
            title="Ascending "
            className="icon"
            inverse
            onClick={() => {
              setToggle(!toggle)
              onItemClick("sortLast", toggle ? "asc" : "dec")
            }}
          />
        </div>
      </div>

      <input type="search" placeholder="Search Student" onChange={onSearch} />
      <S.Button onClick={() => onItemClick("roll")}>Start Roll</S.Button>
    </S.ToolbarContainer>
  )
}

const S = {
  PageContainer: styled.div`
    display: flex;
    flex-direction: column;
    width: 50%;
    margin: ${Spacing.u4} auto 140px;
  `,
  ToolbarContainer: styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    background-color: ${Colors.blue.base};
    padding: 6px 14px;
    font-weight: ${FontWeight.strong};
    border-radius: ${BorderRadius.default};

    .toggle {
      display: flex;
      align-items: center;
      background-color: white;
      color: black;
      padding: ${Spacing.u2};
      border-radius: ${BorderRadius.default};
    }
    .toggleName {
      display: flex;
      width: 140px;
      justify-content: space-between;
    }
    input {
      padding: 8px;
    }

    .icon {
      margin-left: 4px;
      border-radius: 50%;
      padding: 5px;
      background-color: ${Colors.blue.base};
      cursor: pointer;
    }
  `,
  Button: styled(Button)`
    && {
      padding: ${Spacing.u2};
      font-weight: ${FontWeight.strong};
      border-radius: ${BorderRadius.default};
    }
  `,
}