import { Heart } from "lucide-react";
import { useLikePost } from "@/hooks/post";
import { useCurrentUser } from "@/hooks/auth";
import { toast } from "sonner";
import { useState } from "react";
import ActionIcon from "./ActionIcon";

interface LikeButtonProps {
  totalLikes: number;
  postId: string;
  hasLiked: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({ totalLikes, postId, hasLiked }) => {
  const [TotalLikes, setTotalLikes] = useState<number>(totalLikes);
  const [HasLiked, setHasLiked] = useState<boolean>(hasLiked);
  const { data, isLoading } = useCurrentUser();
  const { mutate: likePost, isPending } = useLikePost(true, setTotalLikes, setHasLiked);

  return (
    <div className="flex flex-col">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!isLoading && !data?.getCurrentUser) {
            return toast.error("Please Login/Signup first");
          }
          likePost(postId); // Call the likePost function
        }}
      >
        <input type="hidden" name="postId" value="post_id_placeholder" />
        <ActionIcon>
          {isPending ? (
            <div className="spinner" />
          ) : HasLiked ? (
            <Heart className="h-6 w-6 text-red-500 fill-red-500" /> // Filled heart when user has liked
          ) : (
            <Heart className="h-6 w-6 text-gray-500" /> // Unfilled heart when user hasn't liked
          )}
        </ActionIcon>
      </form>
      <p className="text-sm font-bold dark:text-white">{TotalLikes} likes</p>
    </div>
  );
};

export default LikeButton;
