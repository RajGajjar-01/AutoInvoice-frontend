import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "react-router"
import { AuthService } from "@/client/sdk.gen"
import useCustomToast from "./useCustomToast"

interface SignUpFormData {
  email: string
  password: string
  full_name: string
}

interface LoginFormData {
  email: string
  password: string
}

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
        if (
          (error as { status?: number; response?: { status?: number } })
            ?.status === 401 ||
          (error as { status?: number; response?: { status?: number } })
            ?.response?.status === 401
        ) {
          return null
        }
        throw error
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 5,
  })

  const signUpMutation = useMutation({
    mutationFn: async (data: SignUpFormData) => {
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
      navigate("/dashboard")
    },
    onError: (error) => {
      const message =
        (error as { body?: { detail?: string }; message?: string })?.body
          ?.detail ||
        (error as Error)?.message ||
        "Signup failed"
      showErrorToast(message)
    },
  })

  const loginMutation = useMutation({
    mutationFn: async (data: LoginFormData) => {
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
      navigate("/dashboard")
    },
    onError: (error) => {
      const message =
        (error as { body?: { detail?: string }; message?: string })?.body
          ?.detail ||
        (error as Error)?.message ||
        "Login failed"
      showErrorToast(message)
    },
  })

  const logout = async () => {
    try {
      await AuthService.logout()
    } catch (e) {
      console.error("Logout error:", e)
    }
    queryClient.clear()
    navigate("/login")
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
