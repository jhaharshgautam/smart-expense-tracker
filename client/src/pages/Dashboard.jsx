import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import API from '../api/axios';

const COLORS = ['#9b6dff','#38d9c0','#e05bbd','#fbbf24','#f87171','#4ade80','#60a5fa','#fb923c'];
const CAT_ICONS = {'Food':'🍔','Travel':'🚌','Shopping':'🛍️','Entertainment':'🎬','Health':'💊','Rent':'🏠','Subscriptions':'📱','Others':'📦'};
const CAT_BG = {'Food':'rgba(251,191,36,0.12)','Travel':'rgba(56,217,192,0.12)','Shopping':'rgba(96,165,250,0.12)','Entertainment':'rgba(224,91,189,0.12)','Health':'rgba(74,222,128,0.12)','Rent':'rgba(155,109,255,0.12)','Subscriptions':'rgba(251,146,60,0.12)','Others':'rgba(148,163,184,0.12)'};

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [activeTab, setActiveTab] = useState('6M');
  const [hoveredStat, setHoveredStat] = useState(null);
  const [hoveredTx, setHoveredTx] = useState(null);

  useEffect(() => { API.get('/expenses').then(r => setExpenses(r.data)).catch(()=>{}); }, []);

  const total = expenses.reduce((s,e) => s + parseFloat(e.amount||0), 0);
  const thisMonth = expenses.filter(e => new Date(e.date).getMonth()===new Date().getMonth());
  const thisMonthTotal = thisMonth.reduce((s,e) => s + parseFloat(e.amount||0), 0);

  const monthlyMap = {};
  expenses.forEach(e => { const k = new Date(e.date).toLocaleString('default',{month:'short'}); monthlyMap[k]=(monthlyMap[k]||0)+parseFloat(e.amount||0); });
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let chartData = months.map(m => ({month:m, amount:monthlyMap[m]||0})).filter(d=>d.amount>0);
  if (!chartData.length) chartData = [{month:'Jan',amount:0},{month:'Feb',amount:0},{month:'Mar',amount:0}];

  const catMap = {};
  expenses.forEach(e => { const n=e.category_name||'Others'; catMap[n]=(catMap[n]||0)+parseFloat(e.amount||0); });
  const catData = Object.entries(catMap).sort((a,b)=>b[1]-a[1]);
  const maxCat = catData[0]?.[1]||1;

  const weekMap={Sun:0,Mon:0,Tue:0,Wed:0,Thu:0,Fri:0,Sat:0};
  const days=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  expenses.slice(0,30).forEach(e=>{const d=new Date(e.date);weekMap[days[d.getDay()]]+=parseFloat(e.amount||0);});
  const weekData=days.map(d=>({day:d,amount:weekMap[d]}));

  const app={fontFamily:"'DM Sans',sans-serif",background:'#080810',minHeight:'100vh',color:'#f0f0ff',position:'relative',overflow:'hidden'};
  const mesh={position:'fixed',top:0,left:0,right:0,bottom:0,background:'radial-gradient(ellipse at 15% 15%, rgba(124,92,191,0.12) 0%, transparent 50%), radial-gradient(ellipse at 85% 85%, rgba(224,91,189,0.08) 0%, transparent 50%)',pointerEvents:'none',zIndex:0};
  const wrap={position:'relative',zIndex:1,maxWidth:1280,margin:'0 auto',padding:'24px 28px'};
  const card={background:'linear-gradient(160deg,#151528 0%,#10101e 100%)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:20,padding:24};

  return (
    <div style={app}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <div style={mesh}/>
      <div style={wrap}>
        <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',background:'rgba(255,255,255,0.03)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:20,marginBottom:28}}>
          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,background:'linear-gradient(135deg,#9b6dff,#e05bbd)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ExpenseIQ</span>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#7c5cbf,#e05bbd)',display:'flex',alignItems:'center',justifyContent:'center',fontWeight:700,fontSize:14,color:'white'}}>{user?.name?.[0]?.toUpperCase()}</div>
            <span style={{fontSize:14,color:'#8888aa'}}>{user?.name}</span>
            <button onClick={()=>navigate('/insights')} style={{padding:'8px 18px',borderRadius:12,fontSize:13,fontWeight:600,cursor:'pointer',border:'1px solid rgba(56,217,192,0.4)',background:'rgba(56,217,192,0.1)',color:'#38d9c0',fontFamily:"'DM Sans',sans-serif"}}>🧠 Insights</button>
            <button onClick={()=>navigate('/expenses')} style={{padding:'8px 18px',borderRadius:12,fontSize:13,fontWeight:600,cursor:'pointer',border:'1px solid rgba(155,109,255,0.4)',background:'rgba(124,92,191,0.2)',color:'#c4a8ff',fontFamily:"'DM Sans',sans-serif"}}>+ Add Expense</button>
            <button onClick={()=>{logout();navigate('/login');}} style={{padding:'8px 16px',borderRadius:12,fontSize:13,fontWeight:500,cursor:'pointer',border:'1px solid rgba(248,113,113,0.25)',background:'rgba(248,113,113,0.08)',color:'#f87171',fontFamily:"'DM Sans',sans-serif"}}>Logout</button>
          </div>
        </nav>

        <div style={{background:'linear-gradient(135deg,#5b3fa6,#7c5cbf,#9b6dff,#c05ba8)',borderRadius:28,padding:'36px 40px',marginBottom:24,position:'relative',overflow:'hidden'}}>
          <div style={{position:'absolute',top:'-40%',right:'-10%',width:360,height:360,borderRadius:'50%',background:'rgba(255,255,255,0.07)',pointerEvents:'none'}}/>
          <div style={{fontSize:12,fontWeight:600,opacity:0.75,letterSpacing:1,textTransform:'uppercase',marginBottom:8}}>Total Spent This Month</div>
          <div style={{fontFamily:"'Syne',sans-serif",fontSize:56,fontWeight:800,lineHeight:1,letterSpacing:-2,marginBottom:14}}>
            <span style={{fontSize:26,opacity:0.65}}>₹</span>{thisMonthTotal.toLocaleString('en-IN',{minimumFractionDigits:2,maximumFractionDigits:2})}
          </div>
          <div style={{display:'inline-flex',alignItems:'center',gap:6,padding:'6px 14px',background:'rgba(255,255,255,0.15)',borderRadius:20,fontSize:13,fontWeight:600}}>📊 {expenses.length} transactions recorded</div>
          <div style={{position:'absolute',bottom:28,right:40,display:'flex',gap:8}}>
            <div style={{padding:'8px 16px',background:'rgba(255,255,255,0.15)',backdropFilter:'blur(8px)',borderRadius:12,fontSize:12,fontWeight:600,border:'1px solid rgba(255,255,255,0.2)'}}>All Time: ₹{total.toLocaleString('en-IN',{maximumFractionDigits:0})}</div>
            <div style={{padding:'8px 16px',background:'rgba(255,255,255,0.15)',backdropFilter:'blur(8px)',borderRadius:12,fontSize:12,fontWeight:600,border:'1px solid rgba(255,255,255,0.2)'}}>{catData.length} Categories</div>
          </div>
        </div>

        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:24}}>
          {[{icon:'💸',label:'Total Spent',val:`₹${total.toLocaleString('en-IN',{maximumFractionDigits:0})}`,bg:'rgba(155,109,255,0.12)'},{icon:'📅',label:'This Month',val:`₹${thisMonthTotal.toLocaleString('en-IN',{maximumFractionDigits:0})}`,bg:'rgba(56,217,192,0.12)'},{icon:'🧾',label:'Transactions',val:expenses.length,bg:'rgba(224,91,189,0.12)'},{icon:'📂',label:'Categories',val:catData.length||0,bg:'rgba(251,191,36,0.12)'}].map((st,i)=>(
            <div key={i} style={{background:'linear-gradient(160deg,#151528,#10101e)',border:`1px solid ${hoveredStat===i?'rgba(155,109,255,0.35)':'rgba(255,255,255,0.06)'}`,borderRadius:20,padding:20,transition:'all 0.25s',transform:hoveredStat===i?'translateY(-3px)':'none',boxShadow:hoveredStat===i?'0 0 30px rgba(124,92,191,0.15)':'none',cursor:'default'}} onMouseEnter={()=>setHoveredStat(i)} onMouseLeave={()=>setHoveredStat(null)}>
              <div style={{width:42,height:42,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,background:st.bg,marginBottom:14}}>{st.icon}</div>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:22,fontWeight:700,letterSpacing:-0.5,marginBottom:4}}>{st.val}</div>
              <div style={{fontSize:12,color:'#6b6b85',fontWeight:500}}>{st.label}</div>
            </div>
          ))}
        </div>

        <div style={{display:'grid',gridTemplateColumns:'1fr 320px',gap:20,marginBottom:20}}>
          <div style={card}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:20}}>
              <div><div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,letterSpacing:-0.3}}>Spending Trend</div><div style={{fontSize:12,color:'#6b6b85'}}>Monthly expense history</div></div>
              <div style={{display:'flex',gap:4}}>{['1M','3M','6M','1Y'].map(t=><button key={t} onClick={()=>setActiveTab(t)} style={{padding:'5px 12px',borderRadius:8,fontSize:11,fontWeight:600,border:activeTab===t?'1px solid rgba(155,109,255,0.4)':'1px solid transparent',background:activeTab===t?'rgba(124,92,191,0.2)':'none',color:activeTab===t?'#c4a8ff':'#6b6b85',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>{t}</button>)}</div>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={chartData} margin={{top:5,right:5,bottom:0,left:0}}>
                <defs><linearGradient id="ag" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#9b6dff" stopOpacity={0.35}/><stop offset="100%" stopColor="#9b6dff" stopOpacity={0}/></linearGradient></defs>
                <XAxis dataKey="month" tick={{fill:'#6b6b85',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#6b6b85',fontSize:11}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v}`}/>
                <Tooltip contentStyle={{background:'#1c1c35',border:'1px solid rgba(155,109,255,0.3)',borderRadius:12,color:'#f0f0ff',fontSize:12}}/>
                <Area type="monotone" dataKey="amount" stroke="#9b6dff" strokeWidth={2.5} fill="url(#ag)" dot={{fill:'#9b6dff',r:4,strokeWidth:0}} activeDot={{r:6,fill:'#9b6dff',strokeWidth:0}}/>
              </AreaChart>
            </ResponsiveContainer>
            <div style={{marginTop:20,paddingTop:16,borderTop:'1px solid rgba(255,255,255,0.05)'}}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:13,fontWeight:700,marginBottom:12}}>Weekly Pattern</div>
              <ResponsiveContainer width="100%" height={70}>
                <BarChart data={weekData} margin={{top:0,right:0,bottom:0,left:0}}>
                  <XAxis dataKey="day" tick={{fill:'#6b6b85',fontSize:10}} axisLine={false} tickLine={false}/>
                  <Tooltip contentStyle={{background:'#1c1c35',border:'1px solid rgba(155,109,255,0.3)',borderRadius:12,color:'#f0f0ff',fontSize:12}}/>
                  <Bar dataKey="amount" radius={[4,4,0,0]}>{weekData.map((_,i)=><Cell key={i} fill={i===new Date().getDay()?'#9b6dff':'rgba(155,109,255,0.2)'}/>)}</Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:16}}>
            <div style={card}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700}}>Category Mix</div>
              <div style={{fontSize:12,color:'#6b6b85',marginBottom:8}}>Spending distribution</div>
              {catData.length>0?(
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart><Pie data={catData.map(([name,value])=>({name,value}))} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                    {catData.map(([name],i)=><Cell key={i} fill={COLORS[i%COLORS.length]}/>)}
                  </Pie><Tooltip contentStyle={{background:'#1c1c35',border:'1px solid rgba(155,109,255,0.3)',borderRadius:12,color:'#f0f0ff',fontSize:12}} formatter={v=>[`₹${v.toLocaleString('en-IN')}`,'']}/>
                  </PieChart>
                </ResponsiveContainer>
              ):<div style={{height:170,display:'flex',alignItems:'center',justifyContent:'center',color:'#6b6b85',fontSize:13}}>No data yet</div>}
            </div>
            <div style={card}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,marginBottom:14}}>Top Categories</div>
              {catData.slice(0,5).map(([name,val],i)=>(
                <div key={name} style={{display:'flex',alignItems:'center',gap:12,padding:'10px 0',borderBottom:i<Math.min(catData.length,5)-1?'1px solid rgba(255,255,255,0.04)':'none'}}>
                  <div style={{width:36,height:36,borderRadius:10,display:'flex',alignItems:'center',justifyContent:'center',fontSize:17,background:CAT_BG[name]||'rgba(255,255,255,0.06)',flexShrink:0}}>{CAT_ICONS[name]||'📦'}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>{name}</div>
                    <div style={{height:3,background:'rgba(255,255,255,0.05)',borderRadius:2,overflow:'hidden'}}><div style={{height:'100%',borderRadius:2,width:`${(val/maxCat)*100}%`,background:COLORS[i%COLORS.length]}}/></div>
                  </div>
                  <div style={{fontSize:13,fontWeight:600,color:'#8888aa',flexShrink:0}}>₹{val.toLocaleString('en-IN',{maximumFractionDigits:0})}</div>
                </div>
              ))}
              {!catData.length&&<div style={{color:'#6b6b85',fontSize:13,textAlign:'center',padding:'20px 0'}}>Add expenses to see breakdown</div>}
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:20}}>
            <div><div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700}}>Recent Transactions</div><div style={{fontSize:12,color:'#6b6b85'}}>Your latest expenses</div></div>
            <button onClick={()=>navigate('/expenses')} style={{padding:'8px 16px',borderRadius:12,fontSize:12,fontWeight:600,border:'1px solid rgba(155,109,255,0.3)',background:'rgba(124,92,191,0.1)',color:'#c4a8ff',cursor:'pointer',fontFamily:"'DM Sans',sans-serif"}}>View All →</button>
          </div>
          {!expenses.length?<div style={{textAlign:'center',padding:'48px 0',color:'#6b6b85'}}><div style={{fontSize:40,marginBottom:12}}>💳</div><div style={{fontSize:15,color:'#8888aa',marginBottom:6}}>No expenses yet</div><div style={{fontSize:13}}>Click "Add Expense" to get started</div></div>:(
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'0 32px'}}>
              {expenses.slice(0,8).map(e=>(
                <div key={e.id} style={{display:'flex',alignItems:'center',gap:12,padding:'12px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',transition:'all 0.2s'}} onMouseEnter={()=>setHoveredTx(e.id)} onMouseLeave={()=>setHoveredTx(null)}>
                  <div style={{width:42,height:42,borderRadius:12,display:'flex',alignItems:'center',justifyContent:'center',fontSize:18,background:CAT_BG[e.category_name]||'rgba(255,255,255,0.06)',flexShrink:0}}>{e.icon||CAT_ICONS[e.category_name]||'💳'}</div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:14,fontWeight:500,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{e.description||e.category_name}</div>
                    <div style={{fontSize:11,color:'#6b6b85',marginTop:2}}>{e.category_name} · {new Date(e.date).toLocaleDateString('en-IN',{day:'numeric',month:'short'})}</div>
                  </div>
                  <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,color:'#f87171',flexShrink:0}}>-₹{parseFloat(e.amount).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
