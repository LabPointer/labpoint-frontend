import { useRouteContext, useRouter } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { setThemeServerFn } from "#/lib/theme";
import { Button } from "./ui/button";

export function ThemeToggle() {
	const router = useRouter();
	const { theme } = useRouteContext({ from: "__root__" });

	function toggleTheme() {
		const themes = ["light", "dark"] as const;
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
				<Sun className="size-5 text-yellow-600" />
			) : (
				<Moon className="size-5 text-blue-300" />
			)}
		</Button>
	);
}
