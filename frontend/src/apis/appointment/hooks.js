import {
  useMutation,
  useQuery
} from '@tanstack/react-query'
import { createAppointment, listAppointment} from './apis'

export const useCreateAppointment = () => {
   return useMutation({
    mutationFn: createAppointment,
    mutationKey:["appointment"]
  })
}
export const useAppointment = () => {
   return useQuery({
    queryFn: ()=> listAppointment(),
    queryKey:["get-appointment"]
  })
}