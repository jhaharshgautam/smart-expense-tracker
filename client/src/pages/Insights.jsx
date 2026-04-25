import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function Insights() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/insights').then(r => { setData(r.data); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const app = { fontFamily:"'DM Sans',sans-serif", background:'#080810', minHeight:'100vh', color:'#f0f0ff' };
  const mesh = { position:'fixed', inset:0, background:'radial-gradient(ellipse at 15% 15%, rgba(124,92,191,0.10) 0%, transparent 50%)', pointerEvents:'none', zIndex:0 };
  const wrap = { position:'relative', zIndex:1, maxWidth:900, margin:'0 auto', padding:'24px 28px' };
  const card = { background:'linear-gradient(160deg,#151528,#10101e)', border:'1px solid rgba(255,255,255,0.06)', borderRadius:20, padding:24, marginBottom:20 };

  const typeColor = { warning:'rgba(251,191,36,0.15)', success:'rgba(74,222,128,0.15)', info:'rgba(155,109,255,0.15)' };
  const typeBorder = { warning:'rgba(251,191,36,0.3)', success:'rgba(74,222,128,0.3)', info:'rgba(155,109,255,0.3)' };

  return (
    <div style={app}>
      <link href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap" rel="stylesheet"/>
      <div style={mesh}/>
      <div style={wrap}>
        <nav style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'14px 20px',background:'rgba(255,255,255,0.03)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.06)',borderRadius:20,marginBottom:28}}>
          <span style={{fontFamily:"'Syne',sans-serif",fontWeight:800,fontSize:18,background:'linear-gradient(135deg,#9b6dff,#e05bbd)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>ExpenseIQ</span>
          <button onClick={()=>navigate('/dashboard')} style={{padding:'8px 16px',borderRadius:12,fontSize:13,fontWeight:500,cursor:'pointer',border:'1px solid rgba(155,109,255,0.3)',background:'rgba(124,92,191,0.1)',color:'#c4a8ff',fontFamily:"'DM Sans',sans-serif"}}>← Dashboard</button>
        </nav>

        <div style={{fontFamily:"'Syne',sans-serif",fontSize:26,fontWeight:800,letterSpacing:-1,marginBottom:6}}>🧠 Smart Insights</div>
        <div style={{fontSize:14,color:'#6b6b85',marginBottom:24}}>AI-powered analysis of your spending habits</div>

        {loading ? (
          <div style={{textAlign:'center',padding:'60px 0',color:'#6b6b85'}}>Analyzing your data...</div>
        ) : (
          <>
            <div style={card}>
              <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,marginBottom:16}}>💡 Personalized Insights</div>
              {data?.insights?.map((ins, i) => (
                <div key={i} style={{display:'flex',alignItems:'flex-start',gap:14,padding:'14px 16px',background:typeColor[ins.type]||typeColor.info,border:`1px solid ${typeBorder[ins.type]||typeBorder.info}`,borderRadius:14,marginBottom:10}}>
                  <span style={{fontSize:22,flexShrink:0}}>{ins.icon}</span>
                  <span style={{fontSize:14,lineHeight:1.5,fontWeight:500}}>{ins.text}</span>
                </div>
              ))}
            </div>

            {data?.dailyData?.length > 0 && (
              <div style={card}>
                <div style={{fontFamily:"'Syne',sans-serif",fontSize:15,fontWeight:700,marginBottom:16}}>📅 Daily Spending (Last 30 Days)</div>
                <ResponsiveContainer width="100%" height={200}>
                  <AreaChart data={data.dailyData.map(d=>({day:new Date(d.day).toLocaleDateString('en-IN',{day:'numeric',month:'short'}),amount:parseFloat(d.total)}))} margin={{top:5,right:5,bottom:0,left:0}}>
                    <defs><linearGradient id="dg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#38d9c0" stopOpacity={0.35}/><stop offset="100%" stopColor="#38d9c0" stopOpacity={0}/></linearGradient></defs>
                    <XAxis dataKey="day" tick={{fill:'#6b6b85',fontSize:10}} axisLine={false} tickLine={false}/>
                    <YAxis tick={{fill:'#6b6b85',fontSize:10}} axisLine={false} tickLine={false} tickFormatter={v=>`₹${v}`}/>
                    <Tooltip contentStyle={{background:'#1c1c35',border:'1px solid rgba(56,217,192,0.3)',borderRadius:12,color:'#f0f0ff',fontSize:12}}/>
                    <Area type="monotone" dataKey="amount" stroke="#38d9c0" strokeWidth={2} fill="url(#dg)" dot={false}/>
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
