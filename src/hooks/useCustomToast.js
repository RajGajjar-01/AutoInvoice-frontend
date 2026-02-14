import { toast } from "sonner";
const useCustomToast = () => {
    const showSuccessToast = (description) => {
        toast.success("Success!", {
            description,
        });
    };
    const showErrorToast = (description) => {
        toast.error("Something went wrong!", {
            description,
        });
    };
    return { showSuccessToast, showErrorToast };
};
export default useCustomToast;
