import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { LanguageSwitchButton } from './LanguageSwitchButton';
import { usePathname, useRouter } from '@/i18n/routing';
import { useLocale } from 'next-intl';
import { useParams } from 'next/navigation';

jest.mock('next-intl', () => ({
    useLocale: jest.fn(),
}));

jest.mock('@/i18n/routing', () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn(),
}));

jest.mock('next/navigation', () => ({
    useParams: jest.fn(),
}));

describe('LanguageSwitchButton', () => {
    let mockRouterReplace: jest.Mock;

    beforeEach(() => {
        mockRouterReplace = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({
            replace: mockRouterReplace,
        });
        (useLocale as jest.Mock).mockReturnValue('en');
        (usePathname as jest.Mock).mockReturnValue('/current-path');
        (useParams as jest.Mock).mockReturnValue({});
    });

    it('renders correctly with initial locale', () => {
        render(<LanguageSwitchButton />);
        expect(screen.getByAltText('Language Switch')).toHaveAttribute(
            'src',
            '/language-uk-fill-colored.svg',
        );
    });

    it('switches language on button click', async () => {
        render(<LanguageSwitchButton />);
        const button = screen.getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(mockRouterReplace).toHaveBeenCalledWith(
                { pathname: '/current-path', query: {} },
                { locale: 'ru' },
            );
        });
    });

    it('shows the correct flag for Russian locale', () => {
        (useLocale as jest.Mock).mockReturnValue('ru');
        render(<LanguageSwitchButton />);
        expect(screen.getByAltText('Language Switch')).toHaveAttribute(
            'src',
            '/language-russia-fill-colored.svg',
        );
    });
});
