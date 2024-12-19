export default function SubPart({
    title,
    line,
    children
}: {
    title: string,
    line?: boolean,
    children?: React.ReactNode
}) {
    return (
        line ?
            <div className="my-2 flex justify-center">
                <h2 className="text-textPrimary font-semibold pr-4 flex-1 text-right">{title}</h2>
                <div className="flex flex-1 justify-start">
                    {children}
                </div>
            </div>
            :
            <div className="my-2">
                <h2 className="text-textPrimary font-semibold">{title}</h2>
                {children}
            </div>
    );
}
