"use client";

import { Bookmark } from "lucide-react";
import { Button } from "./ui/button";
import { useBookMarkPost } from "@/hooks/post";
import { useCurrentUser } from "@/hooks/auth";
import { toast } from "sonner";

function BookmarkButton({ postId, bookmarked }: { postId: string, bookmarked: boolean | null | undefined }) {
  const { mutate: bookMarkPost } = useBookMarkPost()
  const {data, isLoading} = useCurrentUser()

  return (
    <div className="ml-auto">
      <input type="hidden" name="postId" value="post_id_placeholder" />
      <Button
        onClick={() => {
          if(!isLoading && !data?.getCurrentUser){
            return toast.error("Please Login/Signup first")
          }
          bookMarkPost(postId)
        }}
        variant={"ghost"}
        size={"icon"}
        className="h-9 w-9"
      >
        <Bookmark
          className={`h-6 w-6 ${!bookmarked ? 'fill-none' : 'fill-black dark:fill-white'}`}
        />
      </Button>
    </div>
  );
}

export default BookmarkButton;
