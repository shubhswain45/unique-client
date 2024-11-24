import { Frown } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-2">
      <Frown className="w-10 text-gray-400 mt-10"/> {/* Added mt-4 here for spacing */}
      <h2 className="text-xl font-semibold">404 Not Found</h2> {/* Added mt-4 here */}
      <p className="mt-2">Sorry, User Doesnt exist</p> {/* Added mt-2 here */}
    </div>
  );
}
