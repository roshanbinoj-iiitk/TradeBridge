export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <nav style={{padding: '1rem', background: '#e0f2fe', display: 'flex', justifyContent: 'flex-end'}}>
        <a href="/profile" style={{marginRight: '1rem', color: '#2563eb', fontWeight: 'bold', textDecoration: 'underline'}}>Profile</a>
      </nav>
      {children}
    </div>
  );
}
