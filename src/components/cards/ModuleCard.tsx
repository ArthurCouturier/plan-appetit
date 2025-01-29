export default function ModuleCard({
    moduleName,
    children
}: {
    moduleName: string,
    children?: React.ReactNode
}) {
    return (
        <div className="rounded-md border-border-color bg-secondary border-4 w-full h-full flex-1 text-text-secondary mx-2">
            <div className="text-text">
                <h1 className="text-text-primary text-xl font-semibold underline">{moduleName}</h1>
                {children}
            </div>
        </div>
    )
}
