import {
  useMutation,
  useQuery
} from '@tanstack/react-query'
import { 
  createAdoption, 
  listAdoption, 
  getAdoptionById, 
  updateAdoption, 
  deleteAdoption, 
  getAdoptionByStatus 
} from './apis'

// Create pet
export const useCreateAdoption = () => {
  return useMutation({
    mutationFn: createAdoption,
    mutationKey: ["adoption"]
  })
}

// Get all pets
export const useAdoption = () => {
  return useQuery({
    queryFn: () => listAdoption(),
    queryKey: ["get-adoption"]
  })
}

// Get pet by ID
export const useAdoptionById = (id) => {
  return useQuery({
    queryFn: () => getAdoptionById(id),
    queryKey: ["get-adoption", id],
    enabled: !!id
  })
}

// Update pet
export const useUpdateAdoption = () => {
  return useMutation({
    mutationFn: ({ id, data }) => updateAdoption(id, data),
    mutationKey: ["update-adoption"]
  })
}

// Delete pet
export const useDeleteAdoption = () => {
  return useMutation({
    mutationFn: (id) => deleteAdoption(id),
    mutationKey: ["delete-adoption"]
  })
}

// Get pets by status
export const useAdoptionByStatus = (status) => {
  return useQuery({
    queryFn: () => getAdoptionByStatus(status),
    queryKey: ["get-adoption-status", status],
    enabled: !!status
  })
}