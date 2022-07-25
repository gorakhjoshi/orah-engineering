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

export const HomeBoardPage: React.FC = () => {
  const [isRollMode, setIsRollMode] = useState(false)
  const [getStudents, data, loadState] = useApi<{ students: Person[] }>({
    url: "get-homeboard-students",
  })
  const [students, setStudents] = useState<Person[]>([])
  const [searchStudents, setSearchStudents] = useState<Person[]>([])

  useEffect(() => {
    void getStudents()
  }, [getStudents])

  useEffect(() => {
    if (loadState === "loaded") {
      setStudents(data!.students)
      setSearchStudents(data!.students)
    }
  }, [loadState])

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
      const searchData = students.filter((item) => (item.first_name + " " + item.last_name).toLowerCase().includes(e.target.value.toLowerCase()))
      setSearchStudents(() => [...searchData])
    } else {
      setSearchStudents(() => [...students])
    }
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
            {searchStudents.map((s) => (
              <StudentListTile key={s.id} isRollMode={isRollMode} student={s} />
            ))}
          </>
        )}

        {loadState === "error" && (
          <CenteredContainer>
            <div>Failed to load</div>
          </CenteredContainer>
        )}
      </S.PageContainer>
      <ActiveRollOverlay isActive={isRollMode} onItemClick={onActiveRollAction} />
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
        <div
          className="toogle"
          onClick={() => {
            setToggle(!toggle)
            onItemClick("sortFirst", toggle ? "asc" : "dec")
          }}
        >
          First
          <FontAwesomeIcon icon={faSort} title="Ascending " />
        </div>
        <div
          className="toogle"
          onClick={() => {
            setToggle(!toggle)
            onItemClick("sortLast", toggle ? "asc" : "dec")
          }}
        >
          Last
          <FontAwesomeIcon icon={faSort} title="Ascending " />
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

    .toogle {
      background-color: white;
      color: black;
      padding: ${Spacing.u2};
      border-radius: ${BorderRadius.default};
      cursor: pointer;
    }
    .toggleName {
      display: flex;
      width: 120px;
      justify-content: space-between;
    }

    input {
      padding: 8px;
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
