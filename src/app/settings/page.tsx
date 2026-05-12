export default function SettingsPage() {
  return (
    <div className="space-y-5 max-w-2xl">
      <div><h1 className="text-xl font-bold text-[#0f172a]">Settings</h1><p className="text-sm text-[#64748b]">Manage your account and preferences</p></div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-[#0f172a] mb-4">Profile</h2>
        <div className="flex items-center gap-4 pb-4 border-b border-[#f1f5f9]">
          <div className="w-14 h-14 rounded-full bg-[#2563eb] flex items-center justify-center text-white text-lg font-bold">VB</div>
          <div><div className="font-semibold text-[#0f172a]">Vikram B</div><div className="text-sm text-[#64748b]">Retail Ops Lead</div><div className="text-xs text-[#94a3b8] mt-0.5">ai.lab@campus-ai.in</div></div>
        </div>
        <div className="grid grid-cols-2 gap-4 pt-4">
          {([['Full Name','Vikram B'],['Email','ai.lab@campus-ai.in'],['Role','Retail Ops Lead'],['Vertical','CPA / CMA']] as [string,string][]).map(([l,v]) => (
            <div key={l}><label className="text-xs text-[#94a3b8] uppercase tracking-wide">{l}</label><div className="mt-1 border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] bg-[#f8fafc]">{v}</div></div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-[#0f172a] mb-4">Notifications</h2>
        <div className="space-y-3">
          {([['New entry submitted','Get notified when faculty submit entries',true],['Entry approved','Get notified when your entries are approved',true],['Daily digest','Receive a daily summary email',false]] as [string,string,boolean][]).map(([title, desc, on]) => (
            <div key={title} className="flex items-center justify-between py-2 border-b border-[#f8fafc] last:border-0">
              <div><div className="text-sm font-medium text-[#0f172a]">{title}</div><div className="text-xs text-[#94a3b8]">{desc}</div></div>
              <div className={`w-10 h-5 rounded-full transition-colors ${on ? 'bg-[#2563eb]' : 'bg-[#e2e8f0]'} relative cursor-pointer`}><div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${on ? 'translate-x-5' : 'translate-x-0.5'}`} /></div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-sm font-semibold text-[#0f172a] mb-4">Display</h2>
        <div className="grid grid-cols-2 gap-4">
          {([['Timezone','IST (UTC+5:30)'],['Date Format','DD MMM YYYY'],['Language','English (India)']] as [string,string][]).map(([l,v]) => (
            <div key={l}><label className="text-xs text-[#94a3b8] uppercase tracking-wide">{l}</label><div className="mt-1 border border-[#e2e8f0] rounded-lg px-3 py-2 text-sm text-[#0f172a] bg-[#f8fafc]">{v}</div></div>
          ))}
        </div>
      </div>
    </div>
  );
}
