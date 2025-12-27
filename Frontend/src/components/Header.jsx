export default function Header({ handleLogout }) {
  return (
    <header className="app-header animate-fade-in">
      <h1 className="header-title">
        Smart Code Review Bot
      </h1>

      <button
        onClick={handleLogout}
        className="logout-btn"
      >
        Logout
      </button>
    </header>
  );
}
