import "@/styles.css";

import { FaInstagram, FaYoutube, FaLinkedin } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
    return (
        <>
            <div className="w-full flex items-center justify-center p-8">
                <div className="flex flex-col items-center justify-center gap-4">
                    <h2 className="text-center">© 2025 Nathan Miguel. Todos os direitos reservados.</h2>

                    <h3 className="font-medium">REDES SOCIAIS</h3>

                    <div className="flex gap-4 items-center justify-center">
                        <a className="cursor-pointer"><FaXTwitter  className="w-6 h-6"/></a>
                        <a className="cursor-pointer"><FaYoutube className="w-6 h-6"/></a>
                        <a className="cursor-pointer"><FaInstagram className="w-6 h-6"/></a>
                        <a className="cursor-pointer"><FaLinkedin className="w-6 h-6"/></a>
                    </div>
                </div>
            </div>
        </>
    );
}
