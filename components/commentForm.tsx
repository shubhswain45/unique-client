"use client";
import { useCurrentUser } from "@/hooks/auth";
import { useCommentPost } from "@/hooks/post";
import React, { useEffect, useCallback, useMemo, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { toast } from "sonner";

interface CommentFormInputs {
  comment: string;
}

function CommentForm({ postId }: { postId: string }) {
  // Array of available emojis (memoized outside the component re-renders)
  const emojis = useMemo(
    () => [
      "😊", "👍", "❤️", "😂", "😭", "🥰", "😎", "😢", "😍", "😄",
      "💯", "🙌", "👏", "🔥", "💥", "✨", "🤩", "🥳", "😜", "😇",
    ],
    []
  );

  // State for randomly selected emojis
  const [selectedEmojis, setSelectedEmojis] = useState<string[]>([]);

  // React Hook Form setup
  const { register, handleSubmit, setValue, watch, reset } = useForm<CommentFormInputs>();
  const comment = watch("comment", ""); // Watch comment field for live updates

  const { mutate: commentPost, isPending } = useCommentPost(true);
  const {data: user, isLoading} = useCurrentUser()

  // Function to pick 5 random emojis
  const getRandomEmojis = useCallback(() => {
    const randomEmojis: string[] = [];
    const emojisCopy = [...emojis];
    for (let i = 0; i < 5; i++) {
      const randomIndex = Math.floor(Math.random() * emojisCopy.length);
      randomEmojis.push(emojisCopy.splice(randomIndex, 1)[0]);
    }
    setSelectedEmojis(randomEmojis);
  }, [emojis]);

  // Handle emoji click to insert it into the comment input
  const handleEmojiClick = (emoji: string) => {
    setValue("comment", comment + emoji, { shouldValidate: true });
  };

  // On component mount, pick 5 random emojis
  useEffect(() => {
    getRandomEmojis();
  }, [getRandomEmojis]);

  // Handle form submission
  const onSubmit: SubmitHandler<CommentFormInputs> = (data) => {
    if(!isLoading && !user?.getCurrentUser) {
      return toast.error("Please Login/Signup first")
    }
    commentPost({ postId, content: data.comment });
    reset()
  };

  return (
    <div className="mt-4 flex flex-col items-center border-t pt-4">
      {/* Emoji buttons */}
      <div className="w-full flex justify-center flex-wrap space-x-2 mb-4">
        {selectedEmojis.map((emoji, index) => (
          <button
            key={index}
            onClick={() => handleEmojiClick(emoji)}
            className="text-2xl hover:text-blue-500"
          >
            {emoji}
          </button>
        ))}
      </div>

      {/* Form container */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex w-full items-center"
      >
        <input
          {...register("comment", { required: true })}
          type="text"
          placeholder="Add a comment..."
          className="w-full px-4 py-2 bg-[#222222] text-white rounded-md border border-neutral-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isPending}
          className={`ml-4 px-4 py-2 rounded-md text-white ${isPending ? "bg-blue-300 cursor-not-allowed" : "bg-blue-500 hover:bg-blue-600"
            } focus:outline-none`}
        >
          {isPending ? "Posting..." : "Post"}
        </button>
      </form>
    </div>
  );
}

export default CommentForm;
