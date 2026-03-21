import { Link } from "@tanstack/react-router";
import useShowMenu from "@/hooks/useShowMenu";
import { Button } from "@/components/ui/button";
import { MapPin, Menu, X, Bell, User } from "lucide-react";

export default function Navbar() {
    const { showMenu, toggleShowMenu } = useShowMenu();

    return (
        <nav className="sticky top-0 z-50 w-full bg-background border-b border-black/15 shadow-sm h-14 flex flex-col justify-center">
            <div className="container mx-auto px-4 sm:px-6 flex justify-between items-center h-full">
                {/* Logo */}
                <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight text-foreground">LabPoint</h1>
                </div>

                {/* Desktop Menu */}
                <div className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
                    <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Início
                    </Link>
                    <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                        Minhas Reservas
                    </Link>
                </div>

                {/* Desktop Actions */}
                <div className="hidden md:flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10 transition-colors">
                        <Bell className="w-5 h-5" />
                    </Button>
                    <Button variant="secondary" size="icon" className="rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
                        <User className="w-5 h-5" />
                    </Button>
                </div>

                {/* Mobile Icons & Toggle */}
                <div className="flex md:hidden items-center gap-1">
                    <Button variant="ghost" size="icon" className="rounded-full text-primary hover:bg-primary/10 transition-colors">
                        <Bell className="w-5 h-5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={toggleShowMenu} className="rounded-full text-primary hover:bg-primary/10 transition-colors">
                        {showMenu ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                    </Button>
                </div>
            </div>

            {/* Mobile Menu Dropdown */}
            {showMenu && (
                <div className="absolute top-14 left-0 w-full bg-background border-b border-black/20 shadow-lg flex flex-col md:hidden py-4 px-4 gap-4 z-40 animate-in slide-in-from-top-1 fade-in-0">
                    <div className="flex flex-col gap-2">
                        <Link 
                            to="/" 
                            className="text-sm font-semibold text-foreground px-3 py-2.5 bg-neutral-100 rounded-md shadow-md border border-black/10"
                            onClick={toggleShowMenu}
                        >
                            Início
                        </Link>
                        <Link 
                            to="/" 
                            className="text-sm font-semibold text-foreground px-3 py-2.5 bg-neutral-100 rounded-md shadow-md border border-black/10"
                            onClick={toggleShowMenu}
                        >
                            Minhas Reservas
                        </Link>
                    </div>
                    <div className="flex items-center gap-3 pt-3 border-t border-black/20">
                        <Button 
                            variant="secondary" 
                            className="w-full justify-start gap-2 bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors"
                            onClick={toggleShowMenu}
                        >
                            <User className="w-4 h-4" />
                            <span>Meu Perfil</span>
                        </Button>
                    </div>
                </div>
            )}
        </nav>
    );
}
