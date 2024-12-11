import WeekProps from "../api/WeekInterface";
import Week from "../components/Week";

const config: WeekProps[] = [
    {
        name: "weekA",
        days: [
            { name: "Monday", meals: [{ covers: 20, price: 15 }, { covers: 25, price: 20 }] },
            { name: "Tuesday", meals: [{ covers: 15, price: 10 }, { covers: 30, price: 25 }] },
            { name: "Wednesday", meals: [{ covers: 10, price: 12 }, { covers: 40, price: 30 }] },
            { name: "Thursday", meals: [{ covers: 22, price: 18 }, { covers: 18, price: 14 }] },
            { name: "Friday", meals: [{ covers: 35, price: 25 }, { covers: 50, price: 40 }] },
            { name: "Saturday", meals: [{ covers: 60, price: 35 }, { covers: 45, price: 30 }] },
            { name: "Sunday", meals: [{ covers: 50, price: 20 }, { covers: 55, price: 22 }] },
        ]
    }
];

export default function Planning() {
    return (
        <div className="p-6 bg-gray-100">
            <h1 className="text-3xl font-bold mb-4 text-gray-800">Planning</h1>
            <div className="flex">
                {config.map((week) => (
                    <Week name={week.name} days={week.days} />
                ))}
            </div>
        </div>
    );
}
