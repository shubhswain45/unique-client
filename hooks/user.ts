import { createGraphqlClient } from "@/clients/api";
import { followUserMutation } from "@/graphql/mutation/user";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export const useFollowUser = () => {
    const router = useRouter();

    return useMutation({
        mutationFn: async (userId: string) => {
            try {
                const graphqlClient = createGraphqlClient();
                const { followUser } = await graphqlClient.request(followUserMutation, { userId });
                return followUser;
            } catch (error: any) {
                throw new Error(error?.response?.errors?.[0]?.message || "Something went wrong");
            }
        },

        onSuccess: (data) => {
            // Explicitly check for true/false or other expected values
            if (data === true) {
                toast.success("Followed!");
            } else if (data === false) {
                toast.success("Unfollowed!");
            } else {
                toast.success("Action completed!");
            }

            // Refresh the page
            router.refresh();
        },

        onError: (error: any) => {
            const errorMessage = error.message.split(':').pop()?.trim() || "Something went wrong";
            toast.error(errorMessage);
        }
    });
};
