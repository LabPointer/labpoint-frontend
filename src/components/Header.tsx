import { Link } from "@tanstack/react-router";
import { BookOpen, HomeIcon, MapPin, Bell, User, Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "#/components/ui/button";
import {
    Avatar,
    AvatarFallback,
    AvatarImage,
    AvatarBadge,
} from "#/components/ui/avatar";
import { Badge } from "#/components/ui/badge";

export default function Header() {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    return (
        <header className="sticky top-0 z-50 px-4 border-b border-indigo-100/40 shadow-sm bg-white">
            <nav className="w-full flex justify-center items-center">
                <div className="w-full max-w-5xl page-wrap flex items-center justify-between h-14 sm:h-16">
                    {/* ESQUERDA: Logotipo Labpoint */}
                    <div className="flex items-center justify-start flex-1">
                        <h2 className="m-0 shrink-0 text-base sm:text-lg font-bold tracking-tight">
                            <Link
                                to="/"
                                className="inline-flex items-center gap-2 text-indigo-700 hover:text-indigo-800 cursor-pointer group"
                            >
                                <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 fill-indigo-100 group-hover:scale-110" />
                                <span className="tracking-tighter">
                                    Labpoint
                                </span>
                            </Link>
                        </h2>
                    </div>

                    {/* CENTRO: Menu de Navegação (Desktop) */}
                    <div className="hidden md:flex items-center justify-center gap-2 lg:gap-4 flex-2">
                        <Button
                            variant="ghost"
                            size="lg"
                            nativeButton={false}
                            render={
                                <Link
                                    to="/"
                                    className="nav-link flex items-center gap-2 text-sm font-medium"
                                    activeProps={{
                                        className:
                                            "text-indigo-600 bg-indigo-100/60 shadow-inner",
                                    }}
                                />
                            }
                        >
                            <HomeIcon className="w-4 h-4" />
                            Início
                        </Button>
                        <Button
                            variant="ghost"
                            size="lg"
                            nativeButton={false}
                            render={
                                <Link
                                    to="/minhas-reservas"
                                    className="nav-link flex items-center gap-2 text-sm font-medium"
                                    activeProps={{
                                        className:
                                            "text-indigo-600 bg-indigo-100/60 shadow-inner",
                                    }}
                                />
                            }
                        >
                            <BookOpen className="w-4 h-4" />
                            Reservas
                        </Button>
                    </div>

                    {/* DIREITA: Notificações, Perfil e Hamburger */}
                    <div className="flex items-center justify-end gap-1 sm:gap-3 flex-1">
                        <div className="hidden sm:flex items-center gap-2">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                className="relative text-muted-foreground hover:text-indigo-600"
                            >
                                <Bell className="" />
                                <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center bg-indigo-600 scale-75">
                                    2
                                </Badge>
                            </Button>

                            <Avatar
                                size="default"
                                className="cursor-pointer border border-indigo-100"
                            >
                                <AvatarImage src="" />
                                <AvatarFallback className="bg-indigo-600 text-white">
                                    NM
                                </AvatarFallback>
                                <AvatarBadge className="bg-green-500" />
                            </Avatar>
                        </div>

                        {/* Botão Mobile Hamburger */}
                        <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="md:hidden text-indigo-600 relative z-50"
                        >
                            {isMenuOpen ? (
                                <X className="w-5 h-5 transition-all rotate-0 scale-100" />
                            ) : (
                                <Menu className="w-5 h-5 transition-all rotate-0 scale-100" />
                            )}
                            <span className="sr-only">Menu</span>
                        </Button>
                    </div>
                </div>
            </nav>

            {/* Menu Mobile "Gaveta" (Animação de Escala 0-100%) */}
            <div
                className={`
                    md:hidden absolute top-full left-0 w-full bg-white backdrop-blur-xl border-b border-indigo-100 shadow-2xl overflow-hidden
                    origin-top transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
                    ${isMenuOpen ? "scale-y-100 opacity-100" : "scale-y-0 opacity-0 pointer-events-none"}
                `}
            >
                <div className="flex flex-col gap-2 p-4">
                    <Button
                        variant="ghost"
                        className="justify-start gap-4 h-12 rounded-xl border border-black/10 shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                        nativeButton={false}
                        render={
                            <Link
                                to="/"
                                activeProps={{
                                    className: "bg-indigo-50 text-indigo-700",
                                }}
                            />
                        }
                    >
                        <HomeIcon className="w-5 h-5" />
                        Início
                    </Button>
                    <Button
                        variant="ghost"
                        className="justify-start gap-4 h-12 rounded-xl border border-black/10 shadow-sm"
                        onClick={() => setIsMenuOpen(false)}
                        nativeButton={false}
                        render={
                            <Link
                                to="/minhas-reservas"
                                activeProps={{
                                    className:
                                        "bg-indigo-50 text-indigo-700 border border-black/10",
                                }}
                            />
                        }
                    >
                        <BookOpen className="w-5 h-5" />
                        Minhas Reservas
                    </Button>

                    <div className="h-px bg-indigo-50 my-2 mx-4" />

                    <div className="flex flex-col gap-1">
                        <p className="text-[10px] font-bold text-indigo-400 px-4 mb-2 uppercase tracking-widest">
                            Conta
                        </p>
                        <Button
                            variant="ghost"
                            className="justify-start gap-4 h-12 rounded-xl text-muted-foreground border border-black/10 shadow-sm"
                        >
                            <Bell className="w-5 h-5 transition-colors" />
                            Notificações
                            <Badge className="ml-auto bg-indigo-600">2</Badge>
                        </Button>
                        <Button
                            variant="ghost"
                            className="justify-start gap-4 h-12 rounded-xl text-muted-foreground border border-black/10 shadow-sm"
                        >
                            <User className="w-5 h-5" />
                            Meu Perfil
                        </Button>
                    </div>
                </div>
            </div>
        </header>
    );
}
