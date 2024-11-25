'use client';

import React, {useTransition} from "react";
import Image from 'next/image';
import {useLocale} from "next-intl";
import {Button} from "@/components/ui/Button";
import {usePathname, useRouter} from "@/i18n/routing";
import {useParams} from "next/navigation";

export const LanguageSwitchButton = () => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const locale = useLocale();
    const pathname = usePathname();
    const params = useParams();

    const onClick = async () => {
        startTransition(() => {
            router.replace(
                {pathname: pathname, query: params},
                {locale: locale === 'en' ? 'ru' : 'en'}
            );
        })
    };

    return (
        <Button
            disabled={isPending}
            onClick={onClick}
            variant="default"
            size="icon"
        >
            <Image
                src={`/language-${locale === 'en' ? 'uk' : 'russia'}-fill-colored.svg`}
                alt="Language Switch"
                width={28}
                height={28}
            />
        </Button>
    );
};
