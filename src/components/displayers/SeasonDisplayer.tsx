import { SeasonEnum } from "../../api/enums/SeasonEnum";

const seasonColor = {
    [SeasonEnum.WINTER]: "bg-blue-300",
    [SeasonEnum.SPRING]: "bg-green-600",
    [SeasonEnum.SUMMER]: "bg-yellow-300",
    [SeasonEnum.FALL]: "bg-amber-800",
    [SeasonEnum.ALL]: "bg-white"
};

export default function SeasonDisplayer({
    seasons,
    className,
}: {
    seasons: SeasonEnum[];
    className?: string;
}) {
    switch (seasons.length) {
        case 0:
            return <div
                className={`relative rounded-full w-6 h-6 overflow-hidden bg-transparent ${className}`}
                title={seasons.map((s) => s).join(", ")}
            ></div>;
        case 1:
            return seasons[0] == SeasonEnum.ALL ? (
                <div
                    className={`relative rounded-full w-6 h-6 overflow-hidden ${className}`}
                    title={"Toute saison"}
                >
                    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-300"></div>
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-green-600"></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-300"></div>
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-amber-800"></div>
                </div>
            ) : (
                <div
                    className={`relative rounded-full w-6 h-6 overflow-hidden ${seasonColor[seasons[0]]} ${className}`}
                    title={seasons.map((s) => s).join(", ")}
                ></div>
            );
        case 2:
            return (
                <div
                    className={`relative rounded-full w-6 h-6 overflow-hidden ${className}`}
                    title={seasons.map((s) => s).join(", ")}
                >
                    <div className={`absolute left-0 w-1/2 h-full ${seasonColor[seasons[0]]}`}></div>
                    <div className={`absolute right-0 w-1/2 h-full ${seasonColor[seasons[1]]}`}></div>
                </div>
            );
        case 3:
            return (
                <div
                    className={`relative rounded-full w-6 h-6 overflow-hidden ${className}`}
                    title={seasons.map((s) => s).join(", ")}
                >
                    <div
                        className={`absolute w-full h-full rotate-120 ${seasonColor[seasons[0]]}`}
                        style={{ clipPath: "polygon(50% 0%, 100% 0%, 100% 78%, 50% 50%)" }}
                    ></div>
                    <div
                        className={`absolute w-full h-full ${seasonColor[seasons[1]]}`}
                        style={{ clipPath: "polygon(50% 0%, 100% 0%, 100% 78%, 50% 50%)" }}
                    ></div>
                    <div
                        className={`absolute w-full h-full rotate-240 ${seasonColor[seasons[2]]}`}
                        style={{ clipPath: "polygon(50% 0%, 100% 0%, 100% 78%, 50% 50%)" }}
                    ></div>
                </div>
            );
        case 4:
            return (
                <div
                    className={`relative rounded-full w-6 h-6 overflow-hidden ${className}`}
                    title={"Toute saison"}
                >
                    <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-blue-300"></div>
                    <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-green-600"></div>
                    <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-yellow-300"></div>
                    <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-amber-800"></div>
                </div>
            );
    }
}

export function SeasonDisplayerExplaination() {
    return (
        <div className="flex justify-center mt-2 mb-4">
            <SeasonDisplayer seasons={[SeasonEnum.WINTER]} className="" />: Hiver
            <SeasonDisplayer seasons={[SeasonEnum.SPRING]} className="ml-2" />: Printemps
            <SeasonDisplayer seasons={[SeasonEnum.SUMMER]} className="ml-2" />: Été
            <SeasonDisplayer seasons={[SeasonEnum.FALL]} className="ml-2" />: Automne
            <SeasonDisplayer seasons={[SeasonEnum.WINTER, SeasonEnum.SPRING, SeasonEnum.SUMMER, SeasonEnum.FALL]} className="ml-2" />: Toute saison
        </div>
    )
}
