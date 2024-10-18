import { render, screen } from "@testing-library/react";
import { Navbar } from "@/app/(dashboard)/[UserID]/_components/Navbar";
import { useOrganization } from "@clerk/nextjs";
import "@testing-library/jest-dom";

jest.mock("@clerk/nextjs", () => ({
    UserButton: () => <div data-testid="user-button">UserButton</div>,
    OrganizationSwitcher: () => <div data-testid="org-switcher">OrganizationSwitcher</div>,
    useOrganization: jest.fn(),
}));

jest.mock("./SearchInput", () => ({
    SearchInput: () => <div data-testid="search-input">SearchInput</div>,
}));

jest.mock("./InviteButton", () => ({
    InviteButton: () => <div data-testid="invite-button">InviteButton</div>,
}));

describe("Navbar Component", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test("renders Navbar with organization active", () => {
        (useOrganization as jest.Mock).mockReturnValue({ organization: { id: "org1" } });

        render(<Navbar />);

        expect(screen.getByText("itmo.board")).toBeInTheDocument();
        expect(screen.getByTestId("org-switcher")).toBeInTheDocument();
        expect(screen.getByTestId("search-input")).toBeInTheDocument();
        expect(screen.getByTestId("user-button")).toBeInTheDocument();
        expect(screen.getByTestId("invite-button")).toBeInTheDocument();
    });

    test("does not render InviteButton if no organization is active", () => {
        (useOrganization as jest.Mock).mockReturnValue({ organization: null });

        render(<Navbar />);

        expect(screen.queryByTestId("invite-button")).not.toBeInTheDocument();

        expect(screen.getByTestId("org-switcher")).toBeInTheDocument();
        expect(screen.getByTestId("user-button")).toBeInTheDocument();
    });

    test("renders SearchInput only on large screens", () => {
        render(<Navbar />);

        expect(screen.getByTestId("search-input")).toBeInTheDocument();
    });

    test("renders UserButton", () => {
        render(<Navbar />);

        expect(screen.getByTestId("user-button")).toBeInTheDocument();
    });
});
