import { Plus } from 'lucide-react';
import { OrganizationProfile } from '@clerk/nextjs';

import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';

import { Button } from '@/components/ui/Button';
import { useTranslations } from 'next-intl';

export const InviteButton = () => {
    const t = useTranslations('utils');

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('inviteMembers')}
                </Button>
            </DialogTrigger>
            <DialogContent className="p-0 bg-transparent border-none max-w-[880px]">
                <OrganizationProfile />
            </DialogContent>
        </Dialog>
    );
};
