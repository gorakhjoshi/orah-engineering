import React, { useEffect } from "react"
import styled from "styled-components"
import { Spacing } from "shared/styles/styles"
import { useApi } from "shared/hooks/use-api"
import { Activity } from "shared/models/activity"
import { Card, CardContent, Chip, Typography } from "@material-ui/core"

export const ActivityPage: React.FC = () => {
  const [getRoll, activityData, loadState] = useApi<{ activity: Activity[] }>({ url: "get-activities" })
  useEffect(() => {
    void getRoll()
  }, [])

  return (
    <S.Container>
      {loadState === "loading" ? (
        "loading..."
      ) : (
        <>
          {activityData?.activity.map((activity) => {
            return (
              <div key={activity.entity.id}>
                <S.RollStatus>
                  <Card style={{ backgroundColor: "rgba(34, 43, 74, 0.92)", color: "white" }}>
                    <CardContent>{activity.entity.name}</CardContent>
                  </Card>
                  <Card>
                    <CardContent>{new Date(activity.date).toString()}</CardContent>
                  </Card>
                  <Card style={{ backgroundColor: "rgba(213, 216, 225, 0.92)" }}>
                    <CardContent>{activity.type}</CardContent>
                  </Card>
                </S.RollStatus>
              </div>
            )
          })}
        </>
      )}
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    display: flex;
    flex-direction: column;
    width: 75%;
    margin: ${Spacing.u4} auto 0;
  `,
  RollStatus: styled.div`
    display: flex;
    border: 1px solid #c0bdbd36;
    justify-content: space-between;
    margin: 10px;
    padding: ${Spacing.u4};
  `,
}
