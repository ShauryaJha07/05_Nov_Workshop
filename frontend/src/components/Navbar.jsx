export default function Navbar({ user, users, onUserChange, page, onNavigate, registrationCount, tokenConnected, onTokenChange }) {
  const connect = () => {
    const value = window.prompt(tokenConnected ? 'Paste a new Supabase access token, or leave blank to disconnect:' : 'Paste your Supabase access token from your signed-in app:');
    if (value !== null) onTokenChange(value);
  };
  return <header className="topbar">
    <button className="brand" onClick={() => onNavigate('explore')} aria-label="QUADLY home"><span className="brand-mark"><span></span><span></span><span></span></span><span>QUADLY</span></button>
    <nav className="main-nav"><button className={page !== 'registrations' ? 'active' : ''} onClick={() => onNavigate('explore')}>Explore events</button><button className={page === 'registrations' ? 'active' : ''} onClick={() => onNavigate('registrations')}>My registrations <span className="nav-count">{registrationCount || ''}</span></button></nav>
    <div className="top-actions"><span className="semester-pill"><span className="live-dot"></span> Fall semester</span><button className="outline-button" onClick={connect}>{tokenConnected ? 'Account connected' : 'Connect account'}</button><label className="user-switch"><span className="avatar">{user.split(' ').map(part => part[0]).join('')}</span><select aria-label="Switch user" value={user} onChange={event => onUserChange(event.target.value)}>{users.map(person => <option key={person}>{person}</option>)}</select><span className="chevron">⌄</span></label></div>
    <label className="mobile-user"><span className="avatar">{user.split(' ').map(part => part[0]).join('')}</span><select aria-label="Switch user" value={user} onChange={event => onUserChange(event.target.value)}>{users.map(person => <option key={person}>{person}</option>)}</select></label>
  </header>;
}
