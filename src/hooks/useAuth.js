import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import axios from "axios";
import { LoginService, UsersService } from "@/client";
import { handleError } from "@/utils";
import useCustomToast from "./useCustomToast";

const useAuth = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { showErrorToast } = useCustomToast();

    const { data: user, isLoading } = useQuery({
        queryKey: ["currentUser"],
        queryFn: UsersService.readUserMe,
        retry: false,
    });

    const signUpMutation = useMutation({
        mutationFn: (data) => UsersService.registerUser({ requestBody: data }),
        onSuccess: () => {
            navigate({ to: "/login" });
        },
        onError: handleError.bind(showErrorToast),
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });

    const login = async (data) => {
        await LoginService.loginAccessToken({ formData: data });
    };

    const loginMutation = useMutation({
        mutationFn: login,
        onSuccess: () => {
            navigate({ to: "/dashboard" });
        },
        onError: handleError.bind(showErrorToast),
    });

    const logout = () => {
        axios
            .post(
                `${import.meta.env.VITE_API_URL}/api/v1/login/logout`,
                {},
                { withCredentials: true }
            )
            .then(() => {
                queryClient.clear();
                navigate({ to: "/login" });
            });
    };

    return {
        signUpMutation,
        loginMutation,
        logout,
        user,
        isLoading,
    };
};

export default useAuth;
