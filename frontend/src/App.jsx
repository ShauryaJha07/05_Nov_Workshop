import { useEffect, useState } from 'react';
import AppShell from './components/AppShell';
import EventListPage from './pages/EventListPage';
import EventDetailsPage from './pages/EventDetailsPage';
import MyRegistrationsPage from './pages/MyRegistrationsPage';
import { demoUsers, previewEvents } from './data/events';
import { apiBase, apiFetch, getAccessToken, normalizeEvent } from './utils/events';

const initialRegistrations = () => { try { return JSON.parse(localStorage.getItem('quadly-registrations') || '{}'); } catch { return {}; } };
export default function App() {
  const [events,setEvents]=useState([]),[loading,setLoading]=useState(true),[loadError,setLoadError]=useState('');
  const [user,setUser]=useState(()=>localStorage.getItem('quadly-user')||demoUsers[0]),[registrations,setRegistrations]=useState(initialRegistrations);
  const [token,setToken]=useState(getAccessToken),[attendees,setAttendees]=useState(null),[attendeeError,setAttendeeError]=useState('');
  const [page,setPage]=useState('explore'),[selected,setSelected]=useState(null),[query,setQuery]=useState(''),[category,setCategory]=useState('All'),[format,setFormat]=useState('All formats'),[busy,setBusy]=useState(null),[result,setResult]=useState(null),[detailsError,setDetailsError]=useState('');
  const userRegistrations=registrations[user]||[];
  async function loadEvents(){setLoading(true);setLoadError('');try{const response=await fetch(`${apiBase}/api/events`);if(!response.ok)throw new Error(`Events could not be loaded (${response.status}).`);const data=await response.json();if(!Array.isArray(data))throw new Error('The events endpoint returned an unexpected response.');setEvents(data.map(normalizeEvent));}catch(error){setEvents(previewEvents.map(normalizeEvent));setLoadError(`${error.message} Showing a preview catalog until the API is available.`);}finally{setLoading(false);}}
  useEffect(()=>{loadEvents();},[]);
  useEffect(()=>{if(page!=='registrations'||!token)return;apiFetch('/api/me/registrations').then(async response=>{const body=await response.json().catch(()=>[]);if(!response.ok)throw new Error(body.error||`Could not load registrations (${response.status}).`);if(!Array.isArray(body))throw new Error('Unexpected registrations response.');setRegistrations(previous=>({...previous,[user]:body}));}).catch(error=>setDetailsError(error.message));},[page,token,user]);
  useEffect(()=>{localStorage.setItem('quadly-user',user);},[user]);
  useEffect(()=>{localStorage.setItem('quadly-registrations',JSON.stringify(registrations));},[registrations]);
  function navigate(next){setPage(next);setSelected(null);setResult(null);window.scrollTo({top:0,behavior:'smooth'});}
  async function openEvent(event){setSelected(event);setPage('detail');setResult(null);setDetailsError('');setAttendees(null);setAttendeeError('');window.scrollTo({top:0,behavior:'smooth'});try{const response=await apiFetch(`/api/events/${encodeURIComponent(event.id)}`);if(!response.ok)throw new Error(`Event details request failed (${response.status}).`);const details=await response.json();setSelected(normalizeEvent(details));}catch(error){setDetailsError(`${error.message} Showing the event-list data instead.`);}}
  async function loadAttendees(event){setAttendees(null);setAttendeeError('');try{const response=await apiFetch(`/api/events/${encodeURIComponent(event.id)}/registrations`);const body=await response.json().catch(()=>({}));if(!response.ok)throw new Error(body.error||`Could not load attendees (${response.status}).`);setAttendees(body);}catch(error){setAttendeeError(error.message);}}
  function saveLocal(event,id,status='demo'){setRegistrations(previous=>({...previous,[user]:[{event_id:event.id,id,status,created_at:new Date().toISOString()},...(previous[user]||[])]}));}
  async function register(event){
    if(!token){setResult({kind:'error',event,message:'Connect with a Supabase access token to register. Sign in through your app first.'});return;}
    if(userRegistrations.some(row=>String(row.event_id)===String(event.id))){setResult({kind:'duplicate',event});return;}
    if(event.seats===0){setResult({kind:'full',event});return;}
    setBusy(event.id);
    try{
      const response=await apiFetch('/api/registrations',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({event_id:event.id})});
      if(response.status===201){const row=await response.json();saveLocal(event,row.id||`REG-${crypto.randomUUID().slice(0,8).toUpperCase()}`,'confirmed');setResult({kind:'confirmed',event,reference:row.id||'Confirmed'});return;}
      if(response.status===409){setResult({kind:'duplicate',event});return;}
      if(response.status===400||response.status===404){const body=await response.json().catch(()=>({}));setResult({kind:'error',event,message:body.error||'This event is no longer available.'});return;}
      if(response.status===401){const body=await response.json().catch(()=>({}));setResult({kind:'error',event,message:body.error||'The backend requires a Supabase bearer token. This demo-user selection is not authenticated, so the registration was not saved.'});return;}
      throw new Error(`Registration failed (${response.status}).`);
    }catch(error){setResult({kind:'error',event,message:`Registration was not saved. ${error.message}`});}
    finally{setBusy(null);}
  }
  const categories=['All',...new Set(events.map(event=>event.category).filter(Boolean))];
  return <AppShell user={user} users={demoUsers} tokenConnected={Boolean(token)} onTokenChange={value=>{localStorage.setItem('quadly-access-token',value.trim());setToken(value.trim());}} onUserChange={next=>{setUser(next);setPage('explore');setSelected(null);setResult(null);}} page={page} onNavigate={navigate} registrationCount={userRegistrations.length} result={result} onCloseResult={()=>setResult(null)} onHistory={()=>navigate('registrations')} onExplore={()=>navigate('explore')}>
    {page==='explore'&&<EventListPage events={events} categories={categories} loading={loading} error={loadError} onRetry={loadEvents} query={query} onQuery={setQuery} category={category} onCategory={setCategory} format={format} onFormat={setFormat} registrations={userRegistrations} onOpen={openEvent} onNavigate={navigate}/>}
    {page==='detail'&&selected&&<EventDetailsPage event={selected} isRegistered={userRegistrations.some(row=>String(row.event_id)===String(selected.id))} busy={busy===selected.id} detailsError={detailsError} attendees={attendees} attendeeError={attendeeError} onLoadAttendees={()=>loadAttendees(selected)} onRegister={register} onBack={()=>navigate('explore')}/>}
    {page==='registrations'&&<MyRegistrationsPage user={user} registrations={userRegistrations} events={events} historyNotice={detailsError} onOpen={openEvent} onExplore={()=>navigate('explore')}/>}
  </AppShell>;
}
