import "@css/navbar.css";
import { Link } from "@tanstack/react-router";
import useMatchMedia from "@/hooks/useMatchMedia";
import { FaBars, FaUser } from "react-icons/fa";
import useShowMenu from "@/hooks/useShowMenu";
import { FaX } from "react-icons/fa6";
import { MdLocationOn } from "react-icons/md";
import { IoNotifications } from "react-icons/io5";

function desktop() {
    return (
        <nav className="navbar">
            <div className="nav-desktop">
                <div className="nav-title justify-start">
                    <MdLocationOn />
                    <h1>LabPoint</h1>
                </div>

                <div className="nav-menu">
                    <Link to="/">Inicio</Link>
                    <Link to="/">Minhas Reservas</Link>
                </div>

                <div className="nav-action gap-x-2 pointer-events-auto">
                    <button
                        className="p-1.5 rounded-full shadow-inner hover:bg-black/10"
                        aria-label="Toggle theme"
                    >
                        <IoNotifications className="stroke-indigo-600 fill-indigo-600 w-7 h-7 hover:cursor-pointer" />
                    </button>
                    <Link
                        to="/"
                        className="p-2 rounded-full hover:shadow-inner hover:shadow-black/10 hover:bg-black/10"
                    >
                        <FaUser className="stroke-indigo-600 fill-indigo-600 w-6 h-6" />
                    </Link>
                </div>
            </div>
        </nav>
    );
}

function mobile(
    showMenu: boolean,
    toggleShowMenu: () => void,
) {
    return (
        <nav className={`navbar overflow-hidden`}>
            <div className="navbar-mobile">
                <div className="nav-mobile">
                    <div className="nav-leading">
                        <button className="p-2" onClick={toggleShowMenu}>
                            {showMenu ? (
                                <FaX className="stroke-indigo-600 fill-indigo-600  w-6 h-6" />
                            ) : (
                                <FaBars className="stroke-indigo-600 fill-indigo-600 w-6 h-6" />
                            )}
                        </button>
                    </div>

                    <div className="nav-title justify-center">
                        <MdLocationOn />
                        <h1>LabPoint</h1>
                    </div>

                    <div className="nav-action">
                        {/*
                        <button
                            className="p-2 rounded-full shadow-inner bg-black/10 dark:bg-white/10"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            {theme === "light" ? (
                                <FaMoon className="stroke-blue-300 fill-blue-300 w-6 h-6" />
                            ) : (
                                <FaSun className="stroke-yellow-300 fill-yellow-300 w-6 h-6" />
                            )}
                        </button>
                        */}
                        <button
                            className="p-1.5 rounded-full shadow-inner hover:bg-black/10"
                            aria-label="Toggle theme"
                        >
                            <IoNotifications className="stroke-indigo-600 fill-indigo-600 w-7 h-7 hover:cursor-pointer" />
                        </button>
                    </div>
                </div>

                <div
                    className={`nav-menu-mobile ${
                        showMenu
                            ? "h-39 mt-4 opacity-100 pointer-events-auto"
                            : "h-0 opacity-0 pointer-events-none"
                    }`}
                >
                    <div className="flex justify-end">
                        <Link
                            to="/"
                            className="p-2 rounded-full shadow-inner bg-indigo-600"
                        >
                            <FaUser className="stroke-white fill-white w-6 h-6" />
                        </Link>
                    </div>

                    <Link to="/">Inicio</Link>
                    <Link to="/">Minhas Reservas</Link>
                </div>
            </div>
        </nav>
    );
}

export default function Navbar() {
    const { isDesktop } = useMatchMedia();
    const { showMenu, toggleShowMenu } = useShowMenu();

    return (
        <>
            {isDesktop
                ? desktop()
                : mobile(showMenu, toggleShowMenu)}
        </>
    );
}
