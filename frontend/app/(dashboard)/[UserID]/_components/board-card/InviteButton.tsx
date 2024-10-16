import React from 'react';
import { UserPlus } from "lucide-react";

export const InviteButton = () => {
    return (
        <button className="invite-button flex items-center">
            <UserPlus className="icon mr-2" />
            Пригласить участников
        </button>
    );
};
