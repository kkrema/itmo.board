import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './Tooltip';
import '@testing-library/jest-dom';
describe('Tooltip Component', () => {


    it('should apply custom class names to TooltipContent', async () => {
        render(
            <TooltipProvider delayDuration={0} skipDelayDuration={0}>
                <Tooltip>
                    <TooltipTrigger>
                        <span>Hover me</span>
                    </TooltipTrigger>
                    <TooltipContent className="custom-tooltip-class" data-testid="tooltip-content">
                        <span>Tooltip content</span>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );


        expect(screen.queryByTestId('tooltip-content')).toBeNull();


        fireEvent.focus(screen.getByText('Hover me'));


        const visibleTooltipContent = await waitFor(() => {
            const content = screen.getByTestId('tooltip-content');
            expect(content).toBeVisible();
            return content;
        });


        expect(visibleTooltipContent).toHaveClass('custom-tooltip-class');
    });


    it('should trigger the Tooltip on hover', () => {
        render(
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <button>Hover me</button>
                    </TooltipTrigger>
                    <TooltipContent>
                        <span>Tooltip content</span>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );


        expect(screen.queryByText('Tooltip content')).toBeNull();


        fireEvent.mouseEnter(screen.getByText('Hover me'));


        waitFor(() => expect(screen.getByText('Tooltip content')).toBeInTheDocument());
    });


    it('should not render content when Tooltip is closed', () => {
        render(
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger>
                        <span>Hover me</span>
                    </TooltipTrigger>
                    <TooltipContent>
                        <span>Tooltip content</span>
                    </TooltipContent>
                </Tooltip>
            </TooltipProvider>
        );
        expect(screen.queryByText('Tooltip content')).toBeNull();
    });
});
