import {
  useMutation,
} from '@tanstack/react-query'
import { login, signup } from './apis'

export const useLogin = () => {
   return useMutation({
    mutationFn: login,
    mutationKey:["login"]
  })
}
export const useSignup = () => {
  return useMutation({
    mutationFn : signup,
    mutationKey : ['Signup']
  })
}