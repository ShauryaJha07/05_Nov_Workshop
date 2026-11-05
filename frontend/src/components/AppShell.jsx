import Navbar from './Navbar';
import RegistrationResult from './RegistrationResult';
export default function AppShell({ children, user, users, onUserChange, page, onNavigate, registrationCount, tokenConnected, onTokenChange, result, onCloseResult, onHistory, onExplore }) {
  return <div className="app-shell"><Navbar user={user} users={users} onUserChange={onUserChange} page={page} onNavigate={onNavigate} registrationCount={registrationCount} tokenConnected={tokenConnected} onTokenChange={onTokenChange}/><main>{children}</main><footer><button className="brand footer-brand" onClick={() => onNavigate('explore')}><span className="brand-mark"><span></span><span></span><span></span></span><span>QUADLY</span></button><span>Made for the moments between classes.</span><span>© 2026 QUADLY</span></footer><RegistrationResult result={result} user={user} onClose={onCloseResult} onHistory={onHistory} onExplore={onExplore}/></div>;
}
