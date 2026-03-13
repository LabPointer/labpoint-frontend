import { FaUserFriends } from "react-icons/fa";
import { GrResources } from "react-icons/gr";

export type ClassroomStatus = "available" | "occupied";

export type ClassroomCardProps = {
    name: string;
    capacity: number;
    resources: string[];
};

export default function ClassroomCard({
    name,
    capacity,
    resources,
}: ClassroomCardProps) {
    return (
        <article className="flex h-full min-h-[180px] flex-col justify-between rounded-2xl border border-black/10 bg-white p-5 shadow-sm shadow-black/20">
            <header className="mb-3 flex items-start justify-between gap-2">
                <div className="flex flex-col gap-1">
                    <h3 className="text-base font-semibold text-neutral-900">
                        {name}
                    </h3>
                    <div className="flex items-center gap-1 text-xs text-neutral-700">
                        <GrResources className="h-3.5 w-3.5 text-neutral-500" />
                        {resources.map((res) => (
                            <span className="bg-neutral-200 px-2 py-1 rounded-full shadow-md border border-black/5">
                                {res}
                            </span>
                        ))}
                        
                    </div>
                </div>
            </header>

            <div className="mb-4 flex flex-col gap-1 text-xs text-neutral-600">
                <div className="flex items-center gap-2">
                    <FaUserFriends className="h-3.5 w-3.5 text-neutral-400" />
                    <span>
                        Capacidade:{" "}
                        <span className="font-medium text-neutral-800">
                            {capacity}
                        </span>
                    </span>
                </div>
            </div>

            <div>
                <button
                    type="button"
                    className={`flex w-full items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold bg-indigo-700 text-white shadow-sm shadow-black/30 hover:bg-indigo-600 hover:cursor-pointer`}
                >
                    Reserve Agora
                </button>
            </div>
        </article>
    );
}

