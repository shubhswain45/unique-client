import { Comment, CommentPostData, CreatePostData, PaginationPayload, Post } from "@/gql/graphql";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { bookMarkPostMutation, commentPostMutation, createPostMutation, deleteCommentPostMutation, deletePostMutation, likePostMutation } from "@/graphql/mutation/post";
import { createGraphqlClient } from "@/clients/api";
import { getFeedPostsQuery, getPostCommentsQuery } from "@/graphql/query/post";

export const useCreatePost = () => {
    const router = useRouter()

    return useMutation({
        mutationFn: async (postData: CreatePostData) => {
            try {
                const graphqlClient = createGraphqlClient()
                const { createPost } = await graphqlClient.request(createPostMutation, { payload: postData });
                return createPost;
            } catch (error: any) {
                throw new Error(error?.response?.errors?.[0]?.message || "Something went wrong");
            }
        },

        onSuccess: (data) => {
            toast.success("Post created successfully");
            router.back()
        },

        onError: (error: any) => {
            const errorMessage = error.message.split(':').pop()?.trim() || "Something went wrong";
            toast.error(errorMessage);
        }
    });
}

export const useDeletePost = () => {
    return useMutation({
        mutationFn: async (postId: string) => {
            try {
                const graphqlClient = createGraphqlClient()
                const { deletePost } = await graphqlClient.request(deletePostMutation, { postId });
                return deletePost;
            } catch (error: any) {
                throw new Error(error?.response?.errors?.[0]?.message || "Something went wrong");
            }
        },

        onSuccess: (data) => {
            toast.success("Post Deleted successfully");
        },

        onError: (error: any) => {
            const errorMessage = error.message.split(':').pop()?.trim() || "Something went wrong";
            toast.error(errorMessage);
        }
    });
}

export const useGetFeedPosts = (paginationPayload: PaginationPayload) => {
    return useQuery({
        queryKey: ["feedPosts", paginationPayload.cursor],
        queryFn: async () => {
            const graphqlClient = createGraphqlClient()
            const { getFeedPosts } = await graphqlClient.request(getFeedPostsQuery, { payload: paginationPayload });
            return getFeedPosts;
        }
    })
};




export const useFetchComments = (postId: string) => {
    return useQuery({
        queryKey: ['commentPost', postId],
        queryFn: async () => {
            const graphqlClient = createGraphqlClient()
            const { getPostComments } = await graphqlClient.request(getPostCommentsQuery, { postId })
            return getPostComments
        }
    })
}


export const useLikePost = (
    isSinglePostPage: boolean,
    setTotalLikesState: React.Dispatch<React.SetStateAction<number>>, // The type of `setTotalLikesState`
    setHasLiked: React.Dispatch<React.SetStateAction<boolean>> // The type of `setTotalLikesState`
) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async (postId: string) => {
            try {
                const graphqlClient = createGraphqlClient();
                const { likePost } = await graphqlClient.request(likePostMutation, { postId });
                return { likePost, postId };
            } catch (error: any) {
                throw new Error(error?.response?.errors?.[0]?.message || 'Something went wrong');
            }
        },
        onSuccess: (data) => {
            const { likePost, postId } = data;

            if (likePost) {
                if (isSinglePostPage) {
                    setTotalLikesState((prev: number) => prev + 1);
                    setHasLiked(true)
                } else {
                    queryClient.setQueryData(['feedPosts'], (oldData: Post[] | undefined) => {
                        return (
                            oldData?.map((post) =>
                                post.id === postId
                                    ? {
                                        ...post,
                                        userHasLiked: true,
                                        totalLikeCount: (post.totalLikeCount || 0) + 1,
                                    }
                                    : post
                            ) || []
                        );
                    });
                }
                toast.success('Liked successfully');
            } else {
                if (isSinglePostPage) {
                    setTotalLikesState((prev) => (prev > 0 ? prev - 1 : 0));
                    setHasLiked(false)
                } else {
                    queryClient.setQueryData(['feedPosts'], (oldData: Post[] | undefined) => {
                        return (
                            oldData?.map((post) =>
                                post.id === postId
                                    ? {
                                        ...post,
                                        userHasLiked: false,
                                        totalLikeCount: Math.max((post.totalLikeCount || 0) - 1, 0),
                                    }
                                    : post
                            ) || []
                        );
                    });
                }
                toast.success('Unliked successfully');
            }
        },
        onError: (error: any) => {
            const errorMessage = error.message.split(':').pop()?.trim() || 'Something went wrong';
            toast.error(errorMessage);
        },
    });
};


export const useCommentPost = (isSinglePostPage: boolean) => {
    const queryClient = useQueryClient();
    const router = useRouter()
    return useMutation({
        mutationFn: async (payload: CommentPostData) => {
            try {
                const graphqlClient = createGraphqlClient();
                const { commentPost } = await graphqlClient.request(commentPostMutation, { payload });
                return commentPost;
            } catch (error: any) {
                throw new Error(error?.response?.errors?.[0]?.message || "Something went wrong");
            }
        },

        onSuccess: (data) => {
            if (isSinglePostPage) {
                router.refresh()
            } else {
                queryClient.setQueryData(
                    ["commentPost", data.postId], // Ensure this query key matches the fetch query
                    (oldData: any) => {
                        return oldData ? [data, ...oldData] : [data]; // Append the new comment to the array
                    }
                );
            }
            toast.success("Commented!");
        },

        onError: (error: any) => {
            const errorMessage = error.message.split(':').pop()?.trim() || "Something went wrong";
            toast.error(errorMessage);
        }
    });
};


export const useDeleteCommentPost = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ postId, commentId }: { postId: string, commentId: string }) => {
            try {
                const graphqlClient = createGraphqlClient()
                const { deleteCommentPost } = await graphqlClient.request(deleteCommentPostMutation, { commentId });
                return { deleteCommentPost, postId, commentId };
            } catch (error: any) {
                throw new Error(error?.response?.errors?.[0]?.message || "Something went wrong");
            }
        },

        onSuccess: (data) => {
            queryClient.setQueryData(
                ["commentPost", data.postId], // Ensure this query key matches the fetch query
                (oldData: any) => {
                    return oldData.filter((comment: Comment) => comment.id != data.commentId)
                }
            );
            toast.success("comment Deleted successfully");
        },

        onError: (error: any) => {
            const errorMessage = error.message.split(':').pop()?.trim() || "Something went wrong";
            toast.error(errorMessage);
        }
    });
}


export const useBookMarkPost = () => {
    const queryClient = useQueryClient()
    return useMutation({
        mutationFn: async (postId: string) => {
            try {
                const graphqlClient = createGraphqlClient()
                const { bookMarkPost } = await graphqlClient.request(bookMarkPostMutation, { postId });
                return { bookMarkPost, postId };
            } catch (error: any) {
                throw new Error(error?.response?.errors?.[0]?.message || "Something went wrong");
            }
        },

        onSuccess: (data) => {
            if (data.bookMarkPost == true) {
                queryClient.setQueryData(
                    ["feedPosts"], // query key
                    (oldData: [Post] | undefined) => {
                        return oldData?.map((post) => {
                            // Check if post id matches the liked post's id
                            if (data.postId === post.id) {
                                return {
                                    ...post,
                                    bookmarked: true
                                };
                            } else {
                                return post; // Return unchanged post if id does not match
                            }
                        });
                    }
                );
            } else {
                queryClient.setQueryData(
                    ["feedPosts"], // query key
                    (oldData: [Post] | undefined) => {
                        return oldData?.map((post) => {
                            // Check if post id matches the unliked post's id
                            if (data.postId === post.id) {
                                return {
                                    ...post,
                                    bookmarked: false
                                };
                            } else {
                                return post; // Return unchanged post if id does not match
                            }
                        });
                    }
                );
            }
        },



        onError: (error: any) => {
            const errorMessage = error.message.split(':').pop()?.trim() || "Something went wrong";
            toast.error(errorMessage);
        }
    });
}