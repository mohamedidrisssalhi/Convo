import { THEMES } from "../constants";
import { useThemeStore } from "../store/useThemeStore";

const PREVIEW_MESSAGES = [
  { id: 1, content: "Hey! How's it going?", isSent: false },
  { id: 2, content: "I'm doing great! Just working on some new features.", isSent: true },
];

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();

  return (
    <div>
      <h2>Theme</h2>
      <p>Choose a theme for your chat interface</p>
      <div>
        {THEMES.map((t) => (
          <button key={t} onClick={() => setTheme(t)}>{t}</button>
        ))}
      </div>
    </div>
  );
};
export default SettingsPage;
