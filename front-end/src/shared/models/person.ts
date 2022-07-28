import { RolllStateType } from "./roll"

export interface Person {
  entity: object
  id: number
  first_name: string
  last_name: string
  photo_url?: string
  rollState: RolllStateType
}

export const PersonHelper = {
  getFullName: (p: Person) => `${p.first_name} ${p.last_name}`,
}
