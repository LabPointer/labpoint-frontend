import { useRouteContext, useRouter } from "@tanstack/react-router";
import { Computer, Moon, Sun } from "lucide-react";
import { setThemeServerFn } from "#/lib/theme";
import { Button } from "./ui/button";

export function ThemeToggle() {
	const router = useRouter();
	const { theme } = useRouteContext({ from: "__root__" });

	function toggleTheme() {
		const themes = ["light", "dark", "auto"] as const;
		const next = themes[(themes.indexOf(theme) + 1) % themes.length];
		setThemeServerFn({ data: next })
			.then(() => router.invalidate())
			.catch((error) => console.error("Unable to change theme", error));
	}

	return (
		<Button
			className="ml-auto rounded-full"
			variant={"outline"}
			size="icon-lg"
			onClick={toggleTheme}
		>
			{theme === "light" ? (
				<Sun className="size-5 text-yellow-500" />
			) : theme === "dark" ? (
				<Moon className="size-5 text-blue-300" />
			) : (
				<Computer className="size-5 text-yellow-500  dark:text-blue-300" />
			)}
		</Button>
	);
}
