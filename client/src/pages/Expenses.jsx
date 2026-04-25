import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';

const CAT_ICONS={'Food':'🍔','Travel':'🚌','Shopping':'🛍️','Entertainment':'🎬','Health':'💊','Rent':'🏠','Subscriptions':'📱','Others':'📦'};
const CAT_BG={'Food':'rgba(251,191,36,0.12)','Travel':'rgba(56,217,192,0.12)','Shopping':'rgba(96,165,250,0.12)','Entertainment':'rgba(224,91,189,0.12)','Health':'rgba(74,222,128,0.12)','Rent':'rgba(155,109,255,0.12)','Subscriptions':'rgba(251,146,60,0.12)','Others':'rgba(148,163,184,0.12)'};

export default function Expenses() {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({amount:'',category_id:'1',description:'',date:new Date().toISOString().split('T')[0]});
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(null);
  const [focused, setFocused] = useState(null);

  useEffect(()=>{
    API.get('/expenses').then(r=>setExpenses(r.data)).catch(()=>{});
    API.get('/categories').then(r=>setCategories(r.data)).catch(()=>{});
  },[]);

  const handleAdd = async () => {
    if(!form.amount||!form.description) return;
    setLoading(true);
    try { const res=await API.post('/expenses',form); setExpenses([res.data,...expenses]); setForm({amount:'',category_id:'1',description:'',date:new Date().toISOString().split('T')[0]}); } catch(e){}
    setLoading(false);
  };

  const handleDelete = async id => { await API.delete(`/expenses/${id}`); setExpenses(expenses.filter(e=>e.id!==id)); };
  const total = expenses.reduce((s,e)=>s+parseFloat(e.amount||0),0);
  const inp = (focused,field) => ({width:'100%',background:'rgba(255,255,255,0.04)',border:`1px solid ${focused===field?'rgba(155,109,255,0.5)':'rgba(255,255,255,0.08)'}`,borderRadius:12,padding:'12px 14px',color:'#f0f0ff',fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',boxSizing:'border-box'});

  return (
    <div style={{fontFamily:"'DM Sans',sans-serif",background:'#080810',minHeight:'100vh',color:'#f0f0ff',position:'relative'}}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <div style={{position:'fixed',inset:0,background:'radial-gradient(ellipse at 15% 15%, rgba(124,92,191,0.10) 0%, transparent 50%)',pointerEvents:'none',zIndex:0}}/>
      <div style={{position:'relative',zIndex:1,maxWidth:900,margin:'0 auto',padding:'24px 28px'}}>
        <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',background:'rgba(255,255,255,0.03)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:20,marginBottom:28}}>
          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,background:'linear-gradient(135deg,#9b6dff,#e05bbd)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ExpenseIQ</span>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontSize:13,color:'#6b6b85'}}>Total: <span style={{color:'#f87171',fontWeight:700}}>₹{total.toLocaleString('en-IN',{maximumFractionDigits:0})}</span></span>
            <button onClick={()=>navigate('/dashboard')} style={{padding:'8px 16px',borderRadius:12,fontSize:13,fontWeight:500,cursor:'pointer',border:'1px solid rgba(155,109,255,0.3)',background:'rgba(124,92,191,0.1)',color:'#c4a8ff',fontFamily:"'DM Sans',sans-serif"}}>← Dashboard</button>
          </div>
        </nav>

        <div style={{background:'linear-gradient(160deg,#151528,#10101e)',border:'1px solid rgba(155,109,255,0.2)',borderRadius:24,padding:28,marginBottom:24,boxShadow:'0 0 40px rgba(124,92,191,0.1)'}}>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700,marginBottom:20,letterSpacing:-0.3}}>✦ Add New Expense</div>
          <div style={{display:'grid',gridTemplateColumns:'140px 1fr 1fr 160px',gap:12,marginBottom:12}}>
            <div><div style={{fontSize:11,fontWeight:600,color:'#6b6b85',marginBottom:6,letterSpacing:0.5,textTransform:'uppercase'}}>Amount (₹)</div><input type="number" placeholder="0.00" value={form.amount} onChange={e=>setForm({...form,amount:e.target.value})} onFocus={()=>setFocused('amount')} onBlur={()=>setFocused(null)} style={inp(focused,'amount')}/></div>
            <div><div style={{fontSize:11,fontWeight:600,color:'#6b6b85',marginBottom:6,letterSpacing:0.5,textTransform:'uppercase'}}>Description</div><input type="text" placeholder="What did you spend on?" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} onFocus={()=>setFocused('desc')} onBlur={()=>setFocused(null)} style={inp(focused,'desc')}/></div>
            <div><div style={{fontSize:11,fontWeight:600,color:'#6b6b85',marginBottom:6,letterSpacing:0.5,textTransform:'uppercase'}}>Category</div><select value={form.category_id} onChange={e=>setForm({...form,category_id:e.target.value})} style={{background:'#151528',border:'1px solid rgba(255,255,255,0.08)',borderRadius:12,padding:'12px 14px',color:'#f0f0ff',fontSize:14,fontFamily:"'DM Sans',sans-serif",outline:'none',width:'100%'}}>{categories.map(c=><option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
            <div><div style={{fontSize:11,fontWeight:600,color:'#6b6b85',marginBottom:6,letterSpacing:0.5,textTransform:'uppercase'}}>Date</div><input type="date" value={form.date} onChange={e=>setForm({...form,date:e.target.value})} onFocus={()=>setFocused('date')} onBlur={()=>setFocused(null)} style={{...inp(focused,'date'),colorScheme:'dark'}}/></div>
          </div>
          <button onClick={handleAdd} disabled={loading} style={{width:'100%',padding:13,borderRadius:12,fontSize:14,fontWeight:700,cursor:'pointer',border:'none',background:'linear-gradient(135deg,#7c5cbf,#9b6dff)',color:'white',fontFamily:"'Syne',sans-serif",opacity:loading?0.7:1}}>
            {loading?'Adding...':'+ Add Expense'}
          </button>
        </div>

        <div style={{background:'linear-gradient(160deg,#151528,#10101e)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:24,padding:28}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <div style={{fontFamily:"'Syne',sans-serif",fontSize:17,fontWeight:700,letterSpacing:-0.3}}>All Transactions</div>
            <div style={{fontSize:12,color:'#6b6b85',padding:'4px 10px',background:'rgba(255,255,255,0.05)',borderRadius:8}}>{expenses.length} expenses</div>
          </div>
          {!expenses.length?<div style={{textAlign:'center',padding:'56px 0',color:'#6b6b85'}}><div style={{fontSize:48,marginBottom:12}}>💳</div><div style={{fontSize:15,color:'#8888aa',marginBottom:6}}>No expenses yet</div><div style={{fontSize:13}}>Add your first expense above</div></div>:(
            expenses.map(e=>(
              <div key={e.id} style={{display:'flex',alignItems:'center',gap:14,padding:'14px 12px',borderRadius:14,background:hovered===e.id?'rgba(255,255,255,0.04)':'transparent',transition:'all 0.2s'}} onMouseEnter={()=>setHovered(e.id)} onMouseLeave={()=>setHovered(null)}>
                <div style={{width:44,height:44,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,background:CAT_BG[e.category_name]||'rgba(255,255,255,0.06)',flexShrink:0}}>{e.icon||CAT_ICONS[e.category_name]||'💳'}</div>
                <div style={{flex:1,minWidth:0}}>
                  <div style={{fontSize:14,fontWeight:500}}>{e.description||e.category_name}</div>
                  <div style={{fontSize:12,color:'#6b6b85',marginTop:3}}>{e.category_name} · {new Date(e.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
                </div>
                <div style={{display:'flex',alignItems:'center',gap:10,flexShrink:0}}>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:16,fontWeight:700,color:'#f87171'}}>-₹{parseFloat(e.amount).toLocaleString('en-IN')}</div>
                  <button onClick={()=>handleDelete(e.id)} style={{width:32,height:32,borderRadius:10,background:'rgba(248,113,113,0.1)',border:'1px solid rgba(248,113,113,0.2)',color:'#f87171',display:'flex',alignItems:'center',justifyContent:'center',cursor:'pointer',fontSize:14,opacity:hovered===e.id?1:0,transition:'opacity 0.2s'}}>✕</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
