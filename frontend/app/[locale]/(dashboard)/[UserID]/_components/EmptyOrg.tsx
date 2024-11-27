import { CreateOrganization } from '@clerk/nextjs';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/Dialog';
import { useTranslations } from 'next-intl';

export const EmptyOrg = () => {
    const t = useTranslations('utils');

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold mt-6">{t('welcome')}</h2>
            <p className="text-muted-foreground text-sm mt-2">
                {t('createOrganization')}
            </p>

            <div className="mt-6 ">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button size="lg">
                            {t('createOrganizationButton')}
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="p-0 bg-transparent border-none max-w-[480px]">
                        <CreateOrganization />
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
};
