import { FaInstagram, FaYoutube, FaLinkedin, FaGithub } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <div className="w-full flex items-center justify-center p-8">
            <div className="flex flex-col items-center justify-center gap-4">
                <h2 className="text-center">
                    © {year} Nathan Miguel. Todos os direitos reservados.
                </h2>

                <h3 className="font-medium">REDES SOCIAIS</h3>

                <div className="flex gap-4 items-center justify-center">
                    <a href="https://x.com/nathancmig" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        <FaXTwitter className="w-6 h-6" />
                    </a>
                    <a href="https://www.youtube.com/@NathanMiguel1" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        <FaYoutube className="w-6 h-6" />
                    </a>
                    <a href="https://www.instagram.com/nathan_cmiguel/" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        <FaInstagram className="w-6 h-6" />
                    </a>
                    <a href="https://www.linkedin.com/in/nathan-miguel-488b462b1/" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        <FaLinkedin className="w-6 h-6" />
                    </a>
                    <a href="https://github.com/Cesio137" target="_blank" rel="noopener noreferrer" className="cursor-pointer">
                        <FaGithub className="w-6 h-6" />
                    </a>
                </div>
            </div>
        </div>
    );
}
