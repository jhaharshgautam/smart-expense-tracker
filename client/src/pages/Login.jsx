import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../api/axios';

export default function Login() {
  const [form, setForm] = useState({email:'',password:''});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async e => {
    e.preventDefault(); setLoading(true); setError('');
    try { const res=await API.post('/auth/login',form); login(res.data.user,res.data.token); navigate('/dashboard'); }
    catch(err) { setError(err.response?.data?.error||'Login failed'); }
    setLoading(false);
  };

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:'#080810',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',overflow:'hidden',color:'#f0f0ff'}}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <div style={{position:'fixed',inset:0,background:'radial-gradient(ellipse at 20% 30%, rgba(124,92,191,0.15) 0%, transparent 55%), radial-gradient(ellipse at 80% 70%, rgba(224,91,189,0.10) 0%, transparent 55%)',pointerEvents:'none'}}/>
      <div style={{position:'relative',zIndex:1,width:'100%',maxWidth:440,background:'linear-gradient(160deg,#151528,#0f0f1e)',border:'1px solid rgba(155,109,255,0.2)',borderRadius:28,padding:'48px 40px',boxShadow:'0 0 80px rgba(124,92,191,0.12)'}}>
        <div style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:22,background:'linear-gradient(135deg,#9b6dff,#e05bbd)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',marginBottom:8,textAlign:'center'}}>ExpenseIQ</div>
        <div style={{fontFamily:"'Syne',sans-serif",fontSize:28,fontWeight:800,letterSpacing:-1,textAlign:'center',marginBottom:6}}>Welcome back</div>
        <div style={{fontSize:14,color:'#6b6b85',textAlign:'center',marginBottom:36}}>Sign in to your account</div>
        {error&&<div style={{background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.25)',borderRadius:10,padding:'10px 14px',fontSize:13,color:'#f87171',marginBottom:16}}>⚠ {error}</div>}
        <form onSubmit={handleSubmit}>
          {[{k:'email',l:'Email',t:'email',p:'you@example.com'},{k:'password',l:'Password',t:'password',p:'••••••••'}].map(({k,l,t,p})=>(
            <div key={k} style={{marginBottom:16}}>
              <label style={{fontSize:11,fontWeight:600,color:'#6b6b85',marginBottom:6,letterSpacing:0.5,textTransform:'uppercase',display:'block'}}>{l}</label>
              <input type={t} placeholder={p} value={form[k]} onChange={e=>setForm({...form,[k]:e.target.value})} onFocus={()=>setFocused(k)} onBlur={()=>setFocused(null)} style={{width:'100%',background:'rgba(255,255,255,0.04)',border:`1px solid ${focused===k?'rgba(155,109,255,0.5)':'rgba(255,255,255,0.08)'}`,borderRadius:12,padding:'13px 16px',color:'#f0f0ff',fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'}}/>
            </div>
          ))}
          <button type="submit" disabled={loading} style={{width:'100%',padding:14,borderRadius:12,fontSize:15,fontWeight:700,cursor:'pointer',border:'none',background:'linear-gradient(135deg,#7c5cbf,#9b6dff)',color:'white',fontFamily:"'Syne',sans-serif",marginTop:8,opacity:loading?0.7:1}}>{loading?'Signing in...':'Sign In →'}</button>
        </form>
        <div style={{textAlign:'center',marginTop:20,fontSize:14,color:'#6b6b85'}}>No account? <Link to="/register" style={{color:'#9b6dff',fontWeight:600,textDecoration:'none'}}>Create one</Link></div>
      </div>
    </div>
  );
}
