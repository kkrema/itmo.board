import React from 'react';
import { SearchInput } from "./SearchInput";
import { InviteButton } from "./InviteButton";

export const Navbar = () => {
    return (
        <nav className="navbar flex items-center justify-between">
            <SearchInput />
            <InviteButton />
        </nav>
    );
};
