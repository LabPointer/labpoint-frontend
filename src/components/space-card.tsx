import { Users, TestTube, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export type SpaceCardProps = {
    name: string;
    capacity: number;
    resources: string[];
    onReserve: (name: string, capacity: number, resources: string[]) => void;
};

export default function SpaceCard({
    name,
    capacity,
    resources,
    onReserve,
}: SpaceCardProps) {
    const formattedName = name ? name.charAt(0).toUpperCase() + name.slice(1) : "";

    return (
        <Card className="flex flex-col h-full bg-background border-black/10 shadow-md hover:shadow-md transition-shadow overflow-hidden group">
            <CardHeader className="pb-4 border-b border-black/10 bg-muted/20">
                <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-primary/10 rounded-lg text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                            <TestTube className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground">
                                Laboratório
                            </span>
                            <CardTitle className="text-lg font-bold text-foreground leading-none">
                                {formattedName}
                            </CardTitle>
                        </div>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="flex-1 py-1 flex flex-col gap-2">
                {/* Capacidade */}
                <div className="flex items-center gap-3 bg-muted/30 p-2.5 rounded-lg border border-black/10 shadow-xs">
                    <div className="p-1.5 bg-background rounded-md shadow-sm border border-black/5 text-muted-foreground">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-[9px] font-bold uppercase text-muted-foreground">Capacidade</p>
                        <p className="text-sm font-semibold text-foreground leading-tight">{capacity} lugares</p>
                    </div>
                </div>

                {/* Recursos */}
                <div className="flex flex-col p-2.5 gap-2.5 rounded-lg border border-black/10 shadow-xs">
                    <div className="flex items-center gap-1.5">
                        <Box className="w-3.5 h-3.5 text-muted-foreground" />
                        <h4 className="text-[10px] font-bold uppercase text-muted-foreground tracking-wider">
                            Recursos Incluídos
                        </h4>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                        {resources.length > 0 ? (
                            resources.map((res) => (
                                <span
                                    key={res}
                                    className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-secondary text-secondary-foreground border border-black/5 shadow-xs"
                                >
                                    {res}
                                </span>
                            ))
                        ) : (
                            <span className="text-xs text-muted-foreground italic px-1">Padrão</span>
                        )}
                    </div>
                </div>
            </CardContent>
            <CardFooter className="pt-2 border-black/10">
                <Button
                    className="w-full font-semibold shadow-sm cursor-pointer"
                    onClick={() => onReserve(name, capacity, resources)}
                >
                    Reservar Agora
                </Button>
            </CardFooter>
        </Card>
    );
}
