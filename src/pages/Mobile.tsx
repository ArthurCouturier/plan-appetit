import { Button } from "@material-tailwind/react";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
export default function Mobile() {
  return (
    <div className="">
      <header className="absolute inset-x-0 top-0 border-0 rounded-b-3xl bg-blue-600 shadow-md flex justify-between items-center">
        <Button className="bg bg-blue-900 py-2 px-4"> 
          <ArrowLeftIcon className="w-6 h-6 text-black" />
        </Button>
          <h1 className="text-xl font-bold">Plan'Appetit</h1>
        <Button className="bg bg-blue-900 py-2 px-4"> 
          <svg xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" className="size-6" viewBox="0 0 48 48">
            <path d="M 24 4 L 1.0371094 18.029297 L 1.9296875 19.488281 C 3.0816875 21.372281 5.5427344 21.965453 7.4277344 20.814453 L 24 10.689453 L 40.572266 20.814453 C 42.456266 21.965453 44.917313 21.372281 46.070312 19.488281 L 46.962891 18.029297 L 39 13.164062 L 39 4 L 35 4 C 33.9 4 33 4.9 33 6 L 33 9.4980469 L 24 4 z M 24 14.210938 L 8.9902344 23.380859 C 8.0802344 23.940859 7.05 24.269375 6 24.359375 L 6 43 L 18 43 L 18 29 C 18 27.34 19.34 26 21 26 L 30 26 L 30 43 L 36 43 C 39.31 43 42 40.31 42 37 L 42 24.359375 C 40.95 24.269375 39.919766 23.940859 39.009766 23.380859 L 24 14.210938 z"></path>
          </svg>
        </Button>
      </header>
    </div>
  )
}