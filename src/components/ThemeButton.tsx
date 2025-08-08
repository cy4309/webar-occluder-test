import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState, AppDispatch } from "@/stores/store";
import { toggleTheme } from "@/stores/features/themeSlice";
import { Sun, Moon } from "lucide-react";

export default function ThemeButton() {
  const theme = useSelector((state: RootState) => state.theme.mode);
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(theme);
  }, [theme]);

  return (
    <button
      onClick={() => dispatch(toggleTheme())}
      className={`
        w-14 h-8 p-1 flex items-center rounded-full transition-colors duration-300
        ${theme === "light" ? "bg-yellow-300" : "bg-gray-700"}
      `}
      aria-label="切換主題"
    >
      <span
        className={`
          w-6 h-6 rounded-full shadow-md flex items-center justify-center transition-transform duration-300
          ${theme === "light" ? "translate-x-0" : "translate-x-6"}
        `}
      >
        {theme === "light" ? <Sun size={16} /> : <Moon size={16} />}
      </span>
    </button>
  );
}
