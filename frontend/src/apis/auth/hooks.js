import {
  useMutation,
} from '@tanstack/react-query'
import { getInfo } from './apis'

export const useGetInfo = () => {
  return useMutation({
    mutationFn : getInfo,
    mutationKey : ['getInfo']
  })
}
