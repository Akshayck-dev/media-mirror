import React, { useState } from 'react';
import { 
  Database, 
  Sparkles, 
  CheckCircle,
  Building,
  Mail,
  Phone,
  FileText
} from 'lucide-react';
import useStudioStore from '../store/studioStore';
import Card from '../components/ui/Card';
import confetti from 'canvas-confetti';

export const Settings: React.FC = () => {
  const { seedDatabase, appVersion } = useStudioStore();
  const [seeding, setSeeding] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  // Form states (mock options for local studio metadata)
  const [studioName, setStudioName] = useState('Media Mirror');
  const [email, setEmail] = useState('studio@mediamirror.com');
  const [phone, setPhone] = useState('+1 (555) 123-4567');
  const [address, setAddress] = useState('Studio A, Main Floor, 500 Aperture Way');

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedDatabase();
      setSuccessMsg(true);
      
      // Fire confetti to notify user!
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        setSuccessMsg(false);
      }, 4000);
    } catch (e) {
      alert('Failed to seed database.');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-left relative">
      {/* Success alert */}
      {successMsg && (
        <div className="fixed top-8 right-8 z-50 bg-indigo-600 text-white px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 border border-indigo-500 animate-bounce">
          <CheckCircle size={20} />
          <div>
            <p className="font-bold">Database Seeded Successfully</p>
            <p className="text-xs text-indigo-150">Realistic mockup data loaded into SQLite.</p>
          </div>
        </div>
      )}

      {/* Action Bar */}
      <div>
        <h2 className="text-page-title text-3xl font-extrabold text-studio-text tracking-tight">Studio Settings</h2>
        <p className="text-[18px] text-studio-muted mt-1 font-medium">Configure studio profiles, preferences, and local databases.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Studio Profile */}
        <div className="lg:col-span-7">
          <Card title="Studio Profile" subtitle="General photography studio credentials">
            <div className="space-y-5">
              <div className="flex flex-col">
                <label className="form-label text-[18px] font-semibold text-studio-text mb-2 flex items-center gap-2">
                  <Building size={16} className="text-studio-gold" /> Studio Name
                </label>
                <input
                  type="text"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className="h-[52px] w-full px-4 rounded-xl border border-studio-border text-[18px] focus:outline-none focus:ring-2 focus:ring-studio-accent/20 focus:border-studio-accent bg-white text-studio-text"
                />
              </div>

              <div className="flex flex-col">
                <label className="form-label text-[18px] font-semibold text-studio-text mb-2 flex items-center gap-2">
                  <Mail size={16} className="text-studio-gold" /> Studio Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-[52px] w-full px-4 rounded-xl border border-studio-border text-[18px] focus:outline-none focus:ring-2 focus:ring-studio-accent/20 focus:border-studio-accent bg-white text-studio-text"
                />
              </div>

              <div className="flex flex-col">
                <label className="form-label text-[18px] font-semibold text-studio-text mb-2 flex items-center gap-2">
                  <Phone size={16} className="text-studio-gold" /> Phone Number
                </label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="h-[52px] w-full px-4 rounded-xl border border-studio-border text-[18px] focus:outline-none focus:ring-2 focus:ring-studio-accent/20 focus:border-studio-accent bg-white text-studio-text"
                />
              </div>

              <div className="flex flex-col">
                <label className="form-label text-[18px] font-semibold text-studio-text mb-2 flex items-center gap-2">
                  <FileText size={16} className="text-studio-gold" /> Physical Address
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="h-[52px] w-full px-4 rounded-xl border border-studio-border text-[18px] focus:outline-none focus:ring-2 focus:ring-studio-accent/20 focus:border-studio-accent bg-white text-studio-text"
                />
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  onClick={() => alert('Profile settings saved locally.')}
                  className="h-[52px] px-8 rounded-xl bg-studio-accent text-white font-bold hover:bg-studio-accent/90 shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200"
                >
                  Save Profile
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column: Database Utilities & Diagnostics */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card title="Database Utilities" subtitle="Initialize and reset local datasets">
            <div className="flex flex-col gap-4 text-left">
              <p className="text-[15px] text-studio-muted leading-relaxed">
                If this is your first time loading the application, you can seed the database with realistic sample records matching the mockup system.
              </p>
              
              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex items-start gap-3">
                <Database size={20} className="text-amber-700 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-800 leading-snug font-medium">
                  <strong>Warning:</strong> Seeding the database will clear all existing logs and replace them with the sample portfolio data.
                </p>
              </div>

              <button
                onClick={handleSeed}
                disabled={seeding}
                className="h-[52px] w-full bg-studio-gold hover:bg-studio-goldHover disabled:opacity-50 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-amber-600/10 transition-all duration-200"
              >
                <Sparkles size={18} />
                {seeding ? 'Seeding Database...' : 'Seed Mockup Data'}
              </button>
            </div>
          </Card>

          <Card title="System Diagnostics" subtitle="Local application information">
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-studio-border">
                <span className="text-[15px] font-semibold text-studio-muted">Database Provider</span>
                <span className="text-[15px] font-bold text-studio-text">SQLite</span>
              </div>
              <div className="flex justify-between py-2 border-b border-studio-border">
                <span className="text-[15px] font-semibold text-studio-muted">ORM Layer</span>
                <span className="text-[15px] font-bold text-studio-text">Prisma v6</span>
              </div>
              <div className="flex justify-between py-2 border-b border-studio-border">
                <span className="text-[15px] font-semibold text-studio-muted">Runtime Platform</span>
                <span className="text-[15px] font-bold text-studio-text">Electron Desktop Shell</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[15px] font-semibold text-studio-muted">App Version</span>
                <span className="text-[15px] font-bold text-studio-text">v{appVersion}</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
