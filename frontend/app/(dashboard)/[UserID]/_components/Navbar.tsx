"use client"

import {
    UserButton,
    OrganizationSwitcher,
    useOrganization
} from "@clerk/nextjs"

import { SearchInput } from "./search-input"
import { InviteButton } from "./invite-button";
import Link from "next/link";
import {cn} from "@/lib/utils";
import {Poppins} from "next/font/google";

const font = Poppins({
    subsets: ["latin"],
    weight: ["600"],
});

export const Navbar = () => {
    const {organization} = useOrganization();

    return (
        <div className="flex items-center gap-x-4 p-5">
            <Link href="/">
                <div className="flex items-center gap-x-2">
                    <span className={cn(
                        "font-semibold text-2xl",
                        font.className,
                    )}>
                        itmo.board
                    </span>
                </div>
            </Link>

            <div className=" flex-2">
                <OrganizationSwitcher
                    hidePersonal
                    appearance={{
                        elements: {
                            rootBox: {
                                display: "flex",
                                justifyContent: "center",
                                alignItems: "center",
                                width: "100%"
                            },
                            organizationSwitcherTrigger: {
                                padding: "6px",
                                width: "100%",
                                borderRadius: "8px",
                                border: "1px solid #E5E7EB",
                                justifyContent: "space-between",
                                backgroundColor: "white"
                            }
                        }
                    }}
                />
            </div>

            <div className="hidden lg:flex lg:flex-1 ">
                <SearchInput/>
            </div>


            {organization && (<InviteButton/>)}
            <UserButton/>
        </div>
    );
};