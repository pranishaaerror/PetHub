import {
  useMutation,
  useQuery
} from '@tanstack/react-query'
import { createServices, listServices} from './apis'

export const useCreateServices = () => {
   return useMutation({
    mutationFn: createServices,
    mutationKey:["services"]
  })
}
export const useServices = () => {
   return useQuery({
    queryFn: ()=> listServices(),
    queryKey:["get-services"]
  })
}