import {
  useMutation,
  useQuery
} from '@tanstack/react-query'
import { createAppointment, listAppointment, updateAppointmentStatus } from './apis'

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

export const useUpdateAppointmentStatus = () => {
  return useMutation({
    mutationFn: updateAppointmentStatus,
    mutationKey: ["update-appointment-status"],
  })
}
