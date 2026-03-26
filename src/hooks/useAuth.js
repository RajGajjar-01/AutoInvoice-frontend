import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { AuthService } from "@/client/sdk.gen"
import useCustomToast from "./useCustomToast"

const useAuth = () => {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { showErrorToast } = useCustomToast()

  const {
    data: user,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["currentUser"],
    queryFn: async () => {
      try {
        const response = await AuthService.getCurrentUserInfo({})
        return response
      } catch (error) {
        if (error?.status === 401 || error?.response?.status === 401) {
          return null
        }
        throw error
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  const signUpMutation = useMutation({
    mutationFn: async (data) => {
      const response = await AuthService.signup({
        requestBody: {
          email: data.email,
          password: data.password,
          full_name: data.full_name,
        },
      })
      return response
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      await queryClient.refetchQueries({ queryKey: ["currentUser"] })
      navigate({ to: "/dashboard" })
    },
    onError: (error) => {
      const message = error?.body?.detail || error?.message || "Signup failed"
      showErrorToast(message)
    },
  })

  const loginMutation = useMutation({
    mutationFn: async (data) => {
      const response = await AuthService.login({
        requestBody: {
          email: data.email,
          password: data.password,
        },
      })
      return response
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["currentUser"] })
      await queryClient.refetchQueries({ queryKey: ["currentUser"] })
      navigate({ to: "/dashboard" })
    },
    onError: (error) => {
      const message = error?.body?.detail || error?.message || "Login failed"
      showErrorToast(message)
    },
  })

  const logout = async () => {
    try {
      await AuthService.logout({})
    } catch (e) {
      console.error("Logout error:", e)
    }
    queryClient.clear()
    navigate({ to: "/login" })
  }

  return {
    signUpMutation,
    loginMutation,
    logout,
    user,
    isLoading,
    isError,
  }
}

export default useAuth
