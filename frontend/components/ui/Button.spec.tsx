import React from "react";
import { render, screen } from "@testing-library/react";
import '@testing-library/jest-dom';
import { Button } from "@/components/ui/Button";

describe("Button component", () => {
    test("renders the button with default styles", () => {
        render(<Button>Click me</Button>);
        const button = screen.getByRole("button", { name: "Click me" });
        expect(button).toBeInTheDocument();
        expect(button).toHaveClass("bg-primary text-primary-foreground h-10 px-4 py-2");
    });

    test("renders button with 'destructive' variant style", () => {
        render(<Button variant="destructive">Delete</Button>);
        const button = screen.getByRole("button", { name: "Delete" });
        expect(button).toHaveClass("bg-destructive text-destructive-foreground hover:bg-destructive/90");
    });

    test("renders button with 'outline' variant style", () => {
        render(<Button variant="outline">Outline</Button>);
        const button = screen.getByRole("button", { name: "Outline" });
        expect(button).toHaveClass("border border-input bg-background hover:bg-accent hover:text-accent-foreground");
    });

    test("renders button with 'ghost' variant style", () => {
        render(<Button variant="ghost">Ghost</Button>);
        const button = screen.getByRole("button", { name: "Ghost" });
        expect(button).toHaveClass("hover:bg-accent hover:text-accent-foreground");
    });

    test("renders button with 'link' variant style", () => {
        render(<Button variant="link">Link</Button>);
        const button = screen.getByRole("button", { name: "Link" });
        expect(button).toHaveClass("text-primary underline-offset-4 hover:underline");
    });

    test("renders button with 'board' variant style", () => {
        render(<Button variant="board">Board</Button>);
        const button = screen.getByRole("button", { name: "Board" });
        expect(button).toHaveClass("hover:bg-blue-500/20 hover:text-blue-800");
    });

    test("renders button with 'boardActive' variant style", () => {
        render(<Button variant="boardActive">Board Active</Button>);
        const button = screen.getByRole("button", { name: "Board Active" });
        expect(button).toHaveClass("bg-blue-500/20 text-blue-800");
    });

    test("renders button with 'sm' size style", () => {
        render(<Button size="sm">Small</Button>);
        const button = screen.getByRole("button", { name: "Small" });
        expect(button).toHaveClass("h-9 rounded-md px-3");
    });

    test("renders button with 'lg' size style", () => {
        render(<Button size="lg">Large</Button>);
        const button = screen.getByRole("button", { name: "Large" });
        expect(button).toHaveClass("h-11 rounded-md px-8");
    });

    test("renders button with 'icon' size style", () => {
        render(<Button size="icon">Icon</Button>);
        const button = screen.getByRole("button", { name: "Icon" });
        expect(button).toHaveClass("h-10 w-10");
    });

    test("renders button with 'smallerIcon' size style", () => {
        render(<Button size="smallerIcon">Smaller Icon</Button>);
        const button = screen.getByRole("button", { name: "Smaller Icon" });
        expect(button).toHaveClass("h-8 w-8");
    });

    test("applies custom class names", () => {
        render(<Button className="custom-class">Custom</Button>);
        const button = screen.getByRole("button", { name: "Custom" });
        expect(button).toHaveClass("custom-class");
    });

    test("renders button as child component when 'asChild' prop is true", () => {
        render(
            <Button asChild>
                <a href="/custom-link">Custom Link</a>
            </Button>
        );
        const link = screen.getByRole("link", { name: "Custom Link" });
        expect(link).toHaveAttribute("href", "/custom-link");
    });

    test("renders disabled button", () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole("button", { name: "Disabled" });
        expect(button).toBeDisabled();
    });
});