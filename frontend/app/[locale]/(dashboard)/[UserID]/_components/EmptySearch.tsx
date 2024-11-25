import {useTranslations} from "next-intl";

export const EmptySearch = () => {
    const t = useTranslations('search')

    return (
        <div className="h-full flex flex-col items-center justify-center">
            <h2 className="text-2xl font-semibold mt-6">
                {t("notFound")}
            </h2>

            <p className="text-muted-foreground text-sm mt-2">
                {t("tryAnother")}
            </p>
        </div>
    );
};
