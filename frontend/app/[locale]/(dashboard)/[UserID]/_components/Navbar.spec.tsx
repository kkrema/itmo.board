import { render, screen } from '@testing-library/react';
import { Navbar } from '@/app/[locale]/(dashboard)/[UserID]/_components/Navbar';
import { useOrganization } from '@clerk/nextjs';
import '@testing-library/jest-dom';
import { useLocale, useTranslations } from 'next-intl';
import { NextIntlClientProvider } from 'next-intl';

jest.mock('@clerk/nextjs', () => ({
    UserButton: () => <div data-testid="user-button">UserButton</div>,
    OrganizationSwitcher: () => (
        <div data-testid="org-switcher">OrganizationSwitcher</div>
    ),
    useOrganization: jest.fn(),
}));

jest.mock('./SearchInput', () => ({
    SearchInput: () => <div data-testid="search-input">SearchInput</div>,
}));

jest.mock('./InviteButton', () => ({
    InviteButton: () => <div data-testid="invite-button">InviteButton</div>,
}));

jest.mock('next-intl', () => {
    const actual = jest.requireActual('next-intl');
    return {
        ...actual,
        useTranslations: jest.fn(),
        useLocale: jest.fn(),
        NextIntlClientProvider: ({
            children,
            messages,
        }: {
            children: React.ReactNode;
            messages: Record<string, string>;
        }) => (
            <actual.NextIntlClientProvider messages={messages} locale="en">
                {children}
            </actual.NextIntlClientProvider>
        ),
    };
});

jest.mock(
    '@/app/[locale]/(dashboard)/[UserID]/_components/LanguageSwitchButton',
    () => ({
        LanguageSwitchButton: () => (
            <div data-testid="language-switch-button">LanguageSwitchButton</div>
        ),
    }),
);

describe('Navbar Component', () => {
    const mockUseTranslations = useTranslations as jest.Mock;
    const mockUseLocale = useLocale as jest.Mock;
    mockUseTranslations.mockImplementation(() => (key: string) => key);
    mockUseLocale.mockReturnValue('en');

    beforeEach(() => {
        jest.clearAllMocks();
    });

    const renderWithIntl = (component: React.ReactNode) => {
        return render(
            <NextIntlClientProvider messages={{ itmoBoard: 'itmo.board' }}>
                {component}
            </NextIntlClientProvider>,
        );
    };

    test('renders Navbar with organization active', () => {
        (useOrganization as jest.Mock).mockReturnValue({
            organization: { id: 'org1' },
        });

        renderWithIntl(<Navbar />);

        expect(screen.getByText('itmo.board')).toBeInTheDocument();
        expect(screen.getByTestId('org-switcher')).toBeInTheDocument();
        expect(screen.getByTestId('search-input')).toBeInTheDocument();
        expect(screen.getByTestId('user-button')).toBeInTheDocument();
        expect(screen.getByTestId('invite-button')).toBeInTheDocument();
    });

    test('does not render InviteButton if no organization is active', () => {
        (useOrganization as jest.Mock).mockReturnValue({ organization: null });

        renderWithIntl(<Navbar />);

        expect(screen.queryByTestId('invite-button')).not.toBeInTheDocument();

        expect(screen.getByTestId('org-switcher')).toBeInTheDocument();
        expect(screen.getByTestId('user-button')).toBeInTheDocument();
    });

    test('renders SearchInput only on large screens', () => {
        renderWithIntl(<Navbar />);

        expect(screen.getByTestId('search-input')).toBeInTheDocument();
    });

    test('renders UserButton', () => {
        renderWithIntl(<Navbar />);

        expect(screen.getByTestId('user-button')).toBeInTheDocument();
    });
});
