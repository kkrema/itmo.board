import React from "react";
import { render, screen } from "@testing-library/react";
import { SelectionTools } from "./SelectionTools";
import { fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

jest.mock("./ColorPicker", () => ({
    ColorPicker: jest.fn(({ onChange }) => (
        <button
            data-testid="color-picker-button"
            onClick={() =>
                onChange({ r: 255, g: 0, b: 0 })
            }
        >
            MockColorPicker
        </button>
    )),
}));

describe("SelectionTools", () => {

    it("calls setLastUsedColor when a color is selected", () => {
        const mockSetLastUsedColor = jest.fn();

        render(<SelectionTools setLastUsedColor={mockSetLastUsedColor} />);

        const colorPicker = screen.getByTestId("color-picker-button");

        fireEvent.click(colorPicker);

        expect(mockSetLastUsedColor).toHaveBeenCalledTimes(1);
        expect(mockSetLastUsedColor).toHaveBeenCalledWith({
            r: 255,
            g: 0,
            b: 0,
        });
    });
});