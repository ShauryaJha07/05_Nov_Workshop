import Icon from './Icon';
export default function SearchBar({ value, onChange }) { return <div className="search-box"><Icon name="search"/><input value={value} onChange={event => onChange(event.target.value)} placeholder="Search events, topics, places..."/><kbd>⌘ K</kbd></div>; }
