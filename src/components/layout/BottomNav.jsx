import { NavLink } from 'react-router-dom'
const TABS = [
  { to:'/',           icon:'◉', label:'Pulso' },
  { to:'/registro',   icon:'+', label:'Anotar', primary:true },
  { to:'/tendencias', icon:'↗', label:'Flujo' },
  { to:'/refugio',    icon:'◎', label:'Metas' },
  { to:'/consultora', icon:'✦', label:'IA' },
]
export default function BottomNav() {
  return (
    <nav style={{
      position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',
      width:'100%',maxWidth:'430px',background:'var(--bg-card)',
      borderTop:'1px solid var(--border)',display:'flex',alignItems:'center',
      justifyContent:'space-around',padding:'10px 8px 18px',zIndex:100,
    }}>
      {TABS.map(tab=>(
        <NavLink key={tab.to} to={tab.to} end={tab.to==='/'} style={({isActive})=>({
          display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',
          textDecoration:'none',flex:tab.primary?'0 0 52px':1,
          color:isActive&&!tab.primary?'var(--accent)':'var(--text-3)',
          transition:'color var(--t)',
        })}>
          {tab.primary?(
            <span style={{
              width:'52px',height:'52px',background:'var(--text-1)',
              color:'var(--bg-card)',borderRadius:'50%',
              display:'flex',alignItems:'center',justifyContent:'center',
              fontSize:'26px',fontWeight:300,marginTop:'-22px',
              boxShadow:'0 8px 24px rgba(26,24,20,.22)',
            }}>{tab.icon}</span>
          ):(
            <>
              <span style={{fontSize:'19px',lineHeight:1}}>{tab.icon}</span>
              <span style={{fontSize:'10px',fontFamily:'var(--font)',letterSpacing:'.04em',fontWeight:500}}>{tab.label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
