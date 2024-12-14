export default function ModuleCard({
    moduleName,
    children
}: {
    moduleName: string,
    children?: React.ReactNode
}) {
    return (
        <div className="rounded-md border-borderColor bg-secondary border-4 w-[30vw]">
            <div className="text-textSecondary">
                <h1 className="text-textPrimary text-xl font-semibold underline">{moduleName}</h1>
                {children}
            </div>
        </div>
    )
}
