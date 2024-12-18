export default function SubPart({
    title,
    children
}: {
    title: string,
    children?: React.ReactNode
}) {
    return (
        <div className="my-2">
            <h2 className="text-textPrimary font-semibold">{title}</h2>
            {children}
        </div>
    );
}
