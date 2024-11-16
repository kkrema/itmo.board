import { cn, colorToCss, getSvgPathFromStroke } from './utils';
import { Color } from '@/types/canvas';
import { twMerge } from 'tailwind-merge';

jest.mock('clsx', () => ({
    __esModule: true,
    clsx: (...args: string[]) => args.flat().filter(Boolean).join(' '),
}));

jest.mock('tailwind-merge', () => ({
    __esModule: true,
    twMerge: jest.fn((classes: string) => classes),
}));

describe('Utility Functions', () => {
    describe('cn', () => {
        it('should merge class names correctly', () => {
            const result = cn('class1', 'class2', 'class3');
            expect(result).toBe('class1 class2 class3');
        });

        it('should handle conditional class names', () => {
            const isActive = true;
            const isDisabled = false;
            const result = cn('base', isActive && 'active', isDisabled && 'disabled');
            expect(result).toBe('base active');
        });

        it('should remove duplicate class names using twMerge', () => {
            (twMerge as jest.Mock).mockImplementationOnce((classes: string) => {
                return Array.from(new Set(classes.split(' '))).join(' ');
            });

            const result = cn('class1', 'class2', 'class1');
            expect(result).toBe('class1 class2');
        });
    });

    describe('getSvgPathFromStroke', () => {
        it('should return an empty string for empty stroke', () => {
            const result = getSvgPathFromStroke([]);
            expect(result).toBe('');
        });

        it('should handle a single point', () => {
            const stroke = [[10, 20]];
            const result = getSvgPathFromStroke(stroke);
            expect(result).toBe('M 10 20 Q 10 20 10 20 Z');
        });

        it('should handle multiple points in line', () => {
            const stroke = [
                [10, 20],
                [30, 40],
                [50, 60],
            ];
            const result = getSvgPathFromStroke(stroke);
            expect(result).toBe('M 10 20 Q 10 20 20 30 30 40 40 50 50 60 30 40 Z');
        });

        it('should correctly handle closed paths', () => {
            const stroke = [
                [0, 0],
                [100, 0],
                [100, 100],
                [0, 100],
            ];
            const result = getSvgPathFromStroke(stroke);
            expect(result).toBe('M 0 0 Q 0 0 50 0 100 0 100 50 100 100 50 100 0 100 0 50 Z');
        });

        it('should handle a curve with multiple points', () => {
            const stroke = [
                [10, 20],
                [5, 40],
                [50, 60],
                [70, 80],
            ];
            const result = getSvgPathFromStroke(stroke);
            expect(result).toBe('M 10 20 Q 10 20 7.5 30 5 40 27.5 50 50 60 60 70 70 80 40 50 Z');
        });
    });

    describe('colorToCss', () => {
        it('should convert color to hex string correctly', () => {
            const color: Color = { r: 255, g: 165, b: 0 }; // Orange
            const result = colorToCss(color);
            expect(result).toBe('#ffa500');
        });

        it('should pad single digit hex values with zero', () => {
            const color: Color = { r: 5, g: 15, b: 25 };
            const result = colorToCss(color);
            expect(result).toBe('#050f19');
        });

        it('should handle zero values correctly', () => {
            const color: Color = { r: 0, g: 0, b: 0 };
            const result = colorToCss(color);
            expect(result).toBe('#000000');
        });

        it('should handle maximum values correctly', () => {
            const color: Color = { r: 255, g: 255, b: 255 };
            const result = colorToCss(color);
            expect(result).toBe('#ffffff');
        });
    });
});
