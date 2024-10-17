import React from "react";
import { Navbar } from "./_components/Navbar";
interface DashboardLayoutProps {
    children: React.ReactNode;
};

const DashboardLayout = ({
    children,
}: DashboardLayoutProps) => {
    return (
        <div className="h-full">
            <div className="flex h-full">
                <div className="h-full flex-1">
                    <Navbar/>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default DashboardLayout;