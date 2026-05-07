interface RecipeHeaderV2Props {
    name: string;
    description: string | null;
}

export default function RecipeHeaderV2({ name, description }: RecipeHeaderV2Props) {
    return (
        <div className="bg-primary rounded-xl shadow-lg border border-border-color p-4 md:p-6 lg:min-h-[14rem] lg:flex lg:items-center lg:justify-center">
            <div className="max-w-prose mx-auto text-center">
                <h1 className="text-2xl md:text-3xl font-bold text-text-primary">
                    {name}
                </h1>
                {description && (
                    <p className="text-sm md:text-base text-text-secondary mt-3 leading-relaxed">
                        {description}
                    </p>
                )}
            </div>
        </div>
    );
}
