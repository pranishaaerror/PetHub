
import { getAllUsers } from './apis'
import {
  useQuery,
} from '@tanstack/react-query'

export const useUsers = () => {
   return useQuery({
    queryFn: ()=> getAllUsers(),
    queryKey:["get-users"]
  })
}