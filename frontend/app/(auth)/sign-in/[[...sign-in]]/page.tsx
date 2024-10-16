import { SignIn } from "@clerk/nextjs";
import { Home } from "lucide-react";
import Image from "next/legacy/image";
import Link from "next/link";

export default function Page (){
    return (
        <div className="relative w-full md:grid md:grid-cols-2 h-full md:px-28 px-0 flex justify-between items-center flex-row gap-x-5 bg-[#FEEDF2]">
            <div className="px-3 w-full h-full md:pr-4 flex items-center justify-center">
                <div className="relative z-20">
                    <div className=" rounded-2xl h-fit w-fit border border-black">
                        <SignIn />
                    </div>
                    <div className="w-full  rounded-2xl bg-blue-500 border-black border shadow-xl absolute h-full -z-20 top-7 left-7"/>
                    <div className="w-full  rounded-2xl border border-black bg-blue-300 absolute h-full -z-10 top-3.5 left-3.5"/>
                </div>
            </div>
        </div>
    )
}
