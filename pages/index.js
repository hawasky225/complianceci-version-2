import React, { useState, useMemo } from 'react';
import { Mail, Search, ChevronRight, AlertCircle, Calendar, FileText, Target, Zap, ArrowLeft } from 'lucide-react';
import { textesEnrichis } from '../data/textes';

export default function Home() {
  const [view, setView] = useState('flux');
  const [selectedText, setSelectedText] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDomains, setSelectedDomains] = useState(['Tous']);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', company: '' });
  const [submitted, setSubmitted] = useState(false);

  const domains = ["Tous", "Données", "Travail", "Fiscalité", "Environnement", "Gouvernance", "Transport", "Assurance"];

  const filteredTexts = useMemo(() => {
    return textesEnrichis.filter(text => {
      const matchSearch = text.titre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDomain = selectedDomains.includes('Tous') || text.domaines.some(d => selectedDomains.includes(d));
      return matchSearch && matchDomain;
    });
  }, [searchTerm, selectedDomains]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowForm(false);
      setFormData({ name: '', email: '', company: '' });
      setSubmitted(false);
    }, 2000);
  };

  if (view === 'flux') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-3xl font-bold text-slate-900">ComplianceCI</h1>
                <p className="text-sm text-slate-600 mt-1">Veille réglementaire en temps réel</p>
              </div>
              <div className="flex gap-3">
                <button onClick={() => setView('dashboard')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-6 py-2 rounded-lg font-medium transition">Alertes</button>
                <button onClick={() => setShowForm(true)} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition flex items-center gap-2"><Mail size={18} /> S'abonner</button>
              </div>
            </div>
          </div>
        </header>

        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white py-16">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-4xl font-bold mb-3">La veille réglementaire qui vous informe avant les autres</h2>
            <p className="text-xl text-slate-300 mb-8">{textesEnrichis.length} textes réglementaires • Côte d'Ivoire • OHADA • Afrique</p>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search size={20} className="absolute left-3 top-3 text-slate-400" />
                <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 rounded-lg text-slate-900 font-medium" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white rounded-xl p-6 border border-slate-200"><h3 className="text-sm font-semibold text-slate-600 uppercase">Textes</h3><p className="text-4xl font-bold text-slate-900 mt-2">{textesEnrichis.length}</p></div>
            <div className="bg-white rounded-xl p-6 border border-slate-200"><h3 className="text-sm font-semibold text-slate-600 uppercase">Domaines</h3><p className="text-4xl font-bold text-slate-900 mt-2">8+</p></div>
            <div className="bg-white rounded-xl p-6 border border-slate-200"><h3 className="text-sm font-semibold text-slate-600 uppercase">Mise à jour</h3><p className="text-4xl font-bold text-slate-900 mt-2">Hebdo</p></div>
          </div>

          <div className="bg-white rounded-xl p-6 border border-slate-200 mb-8">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Filtrer par domaine</h3>
            <div className="flex flex-wrap gap-2">
              {domains.map(domain => (
                <button key={domain} onClick={() => setSelectedDomains(domain === 'Tous' ? ['Tous'] : [domain])} className={`px-4 py-2 rounded-full font-medium transition ${selectedDomains.includes(domain) ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>{domain}</button>
              ))}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-slate-900 mb-6">{filteredTexts.length} résultat{filteredTexts.length > 1 ? 's' : ''}</h2>
          <div className="space-y-4">
            {filteredTexts.map((text) => (
              <div key={text.id} onClick={() => { setSelectedText(text); setView('detail'); }} className="bg-white rounded-lg border border-slate-200 hover:border-blue-400 hover:shadow-lg transition p-6 cursor-pointer">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${text.badge === 'Nouveau' ? 'bg-green-100 text-green-700' : text.badge === 'Modifié' ? 'bg-yellow-100 text-yellow-700' : text.badge === 'Important' ? 'bg-red-100 text-red-700' : text.badge === 'Critique' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'}`}>{text.badge}</div>
                  </div>
                  <span className="text-xs text-slate-500 font-medium">{text.domaines[0]}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-2">{text.titre}</h3>
                <p className="text-sm text-slate-600 mb-4 line-clamp-2">{text.ceQuiChange[0]}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {text.impactRH && <span className="bg-blue-50 text-blue-700 text-xs px-2 py-1 rounded">RH</span>}
                  {text.impactFiscal && <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded">Fiscal</span>}
                  {text.impactHSE && <span className="bg-red-50 text-red-700 text-xs px-2 py-1 rounded">HSE</span>}
                  {text.impactJuridique && <span className="bg-purple-50 text-purple-700 text-xs px-2 py-1 rounded">Juridique</span>}
                </div>
                <div className="flex items-center justify-between text-sm text-slate-500"><span>📅 {text.datePublication}</span><ChevronRight size={18} /></div>
              </div>
            ))}
          </div>
        </div>

        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-8 max-w-md w-full">
              {submitted ? (
                <div className="text-center py-8"><div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">✓</span></div><h3 className="text-xl font-bold text-slate-900">Merci !</h3><p className="text-slate-600 mt-2">Vous recevrez les alertes par email</p></div>
              ) : (
                <><h2 className="text-2xl font-bold text-slate-900 mb-6">Recevoir les alertes</h2><form onSubmit={handleFormSubmit} className="space-y-4"><div><label className="block text-sm font-medium text-slate-700 mb-1">Nom</label><input type="text" name="name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Email</label><input type="email" name="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div><div><label className="block text-sm font-medium text-slate-700 mb-1">Entreprise</label><input type="text" name="company" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" /></div><div className="flex gap-4"><button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg font-medium transition">S'abonner</button><button type="button" onClick={() => setShowForm(false)} className="flex-1 border border-slate-300 text-slate-700 py-2 rounded-lg font-medium hover:bg-slate-50 transition">Annuler</button></div></form></>
              )}
            </div>
          </div>
        )}
      </div>
    );
  }

  if (view === 'detail' && selectedText) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button onClick={() => setView('flux')} className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"><ArrowLeft size={18} /> Retour</button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl p-8 border border-slate-200 mb-8">
            <div className="flex items-start justify-between gap-4 mb-4">
              <h1 className="text-3xl font-bold text-slate-900 flex-1">{selectedText.titre}</h1>
              <span className={`px-3 py-1 rounded-full text-sm font-semibold whitespace-nowrap ${selectedText.statut === 'En vigueur' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{selectedText.statut}</span>
            </div>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-slate-600 mb-6">
              <div><span className="font-semibold text-slate-900">Source:</span> {selectedText.source}</div>
              <div><span className="font-semibold text-slate-900">Ministère:</span> {selectedText.ministere}</div>
              <div><span className="font-semibold text-slate-900">Publication:</span> {selectedText.datePublication}</div>
              <div><span className="font-semibold text-slate-900">En vigueur:</span> {selectedText.dateEntreeVigueur}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedText.impactRH && <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1 rounded-full font-medium">Impact RH</span>}
              {selectedText.impactFiscal && <span className="bg-green-50 text-green-700 text-xs px-3 py-1 rounded-full font-medium">Impact Fiscal</span>}
              {selectedText.impactHSE && <span className="bg-red-50 text-red-700 text-xs px-3 py-1 rounded-full font-medium">Impact HSE</span>}
              {selectedText.impactJuridique && <span className="bg-purple-50 text-purple-700 text-xs px-3 py-1 rounded-full font-medium">Impact Juridique</span>}
            </div>
          </div>

          <div className="bg-white rounded-xl p-8 border border-slate-200 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Zap size={24} className="text-yellow-600" /> Ce qui change</h2>
            <ul className="space-y-3">
              {selectedText.ceQuiChange.map((change, i) => (<li key={i} className="flex gap-3"><span className="text-blue-600 font-bold">•</span><span className="text-slate-700">{change}</span></li>))}
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 border border-slate-200 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2"><Target size={24} className="text-blue-600" /> Obligations</h2>
            <ul className="space-y-3">
              {selectedText.obligationsPrincipales.map((obligation, i) => (<li key={i} className="flex gap-3"><span className="text-green-600 font-bold">✓</span><span className="text-slate-700">{obligation}</span></li>))}
            </ul>
          </div>

          <div className="bg-white rounded-xl p-8 border border-red-200">
            <h2 className="text-2xl font-bold text-red-900 mb-6 flex items-center gap-2"><AlertCircle size={24} /> Sanctions</h2>
            <ul className="space-y-3">
              {selectedText.sanctions.map((sanction, i) => (<li key={i} className="flex gap-3"><span className="text-red-600 font-bold">⚠️</span><span className="text-slate-700">{sanction}</span></li>))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'dashboard') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <button onClick={() => setView('flux')} className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2"><ArrowLeft size={18} /> Retour</button>
          </div>
        </header>

        <div className="max-w-4xl mx-auto px-4 py-12">
          <div className="bg-white rounded-xl p-8 border border-slate-200">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Mes alertes personnalisées</h1>
            <div className="space-y-6 mb-8">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Domaines d'intérêt</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {domains.filter(d => d !== 'Tous').map(domain => (<label key={domain} className="flex items-center cursor-pointer p-3 border border-slate-200 rounded-lg hover:bg-slate-50"><input type="checkbox" className="w-4 h-4 accent-blue-600" defaultChecked /><span className="ml-3 text-slate-700 font-medium">{domain}</span></label>))}
                </div>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-900 mb-4">Fréquence</h3>
                <div className="flex gap-4">
                  <label className="flex items-center cursor-pointer"><input type="radio" className="w-4 h-4 accent-blue-600" defaultChecked /><span className="ml-2 text-slate-700 font-medium">Quotidienne</span></label>
                  <label className="flex items-center cursor-pointer"><input type="radio" className="w-4 h-4 accent-blue-600" /><span className="ml-2 text-slate-700 font-medium">Hebdomadaire</span></label>
                  <label className="flex items-center cursor-pointer"><input type="radio" className="w-4 h-4 accent-blue-600" /><span className="ml-2 text-slate-700 font-medium">Mensuelle</span></label>
                </div>
              </div>
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition">💾 Sauvegarder</button>
            </div>

            <div className="border-t border-slate-200 pt-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Résumé ce mois</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-blue-50 rounded-lg p-4"><p className="text-sm text-slate-600 font-medium">Nouveautés Travail</p><p className="text-3xl font-bold text-blue-600 mt-2">8</p></div>
                <div className="bg-green-50 rounded-lg p-4"><p className="text-sm text-slate-600 font-medium">Fiscalité</p><p className="text-3xl font-bold text-green-600 mt-2">4</p></div>
                <div className="bg-purple-50 rounded-lg p-4"><p className="text-sm text-slate-600 font-medium">Données</p><p className="text-3xl font-bold text-purple-600 mt-2">2</p></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
