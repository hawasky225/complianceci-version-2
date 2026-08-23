import React, { useState } from 'react';
import {
  Mail, ExternalLink, MapPin, Users, Building2, Globe, Calendar,
  Shield, Bell, FileText, CheckCircle2, TrendingUp, Eye, BookOpen,
  Briefcase, Award, ArrowLeft, ChevronRight
} from 'lucide-react';

const COMPANY = {
  name: 'RegalertCI',
  tagline: 'Veille réglementaire HSE intelligente — Côte d\'Ivoire',
  industry: 'RegTech / Conformité réglementaire',
  size: '2-10 employés',
  founded: '2024',
  location: 'Abidjan, Côte d\'Ivoire',
  website: '#',
  specialties: [
    'Veille réglementaire HSE',
    'Conformité environnementale',
    'Sécurité au travail',
    'Registre réglementaire',
    'Alertes automatisées',
    'Droit ivoirien',
  ],
};

const STATS = [
  { label: 'Textes surveillés', value: '150+', icon: FileText },
  { label: 'Sources officielles', value: '12', icon: Globe },
  { label: 'Domaines HSE couverts', value: '8+', icon: Shield },
  { label: 'Mise à jour', value: 'Quotidienne', icon: Bell },
];

const ABOUT = `RegalertCI est la première plateforme de veille réglementaire dédiée aux professionnels HSE (Hygiène, Sécurité, Environnement) opérant en Côte d'Ivoire.

Notre mission : garantir que chaque entreprise ait accès, en temps réel, aux évolutions réglementaires qui impactent ses obligations HSE. Nous collectons, classifions et analysons automatiquement les textes de loi, décrets, arrêtés et actes administratifs publiés par les institutions ivoiriennes.

Fini les surprises réglementaires. Avec RegalertCI, vous êtes informé avant les autres.`;

const SERVICES = [
  {
    icon: Eye,
    title: 'Veille automatisée',
    description: 'Collecte quotidienne des textes réglementaires depuis les sources officielles ivoiriennes (Journal Officiel, ministères, agences).',
  },
  {
    icon: Bell,
    title: 'Alertes ciblées',
    description: 'Recevez uniquement les alertes pertinentes pour votre secteur. Filtrez par domaine HSE, nature du texte ou impact.',
  },
  {
    icon: BookOpen,
    title: 'Registre réglementaire',
    description: 'Accédez à un registre structuré et consultable de l\'ensemble des textes HSE en vigueur en Côte d\'Ivoire.',
  },
  {
    icon: CheckCircle2,
    title: 'Analyse d\'impact',
    description: 'Chaque texte est enrichi : obligations principales, sanctions encourues, impacts RH/HSE/juridique identifiés.',
  },
  {
    icon: TrendingUp,
    title: 'Suivi de conformité',
    description: 'Marquez les textes comme analysés, validés ou hors scope. Exportez votre registre pour vos audits.',
  },
  {
    icon: Shield,
    title: 'Couverture vérifiable',
    description: 'Journal de collecte transparent : chaque source, chaque run, chaque résultat est traçable et auditable.',
  },
];

const POSTS = [
  {
    date: '23 août 2024',
    title: 'Lancement de RegalertCI',
    content: 'Nous sommes fiers d\'annoncer le lancement de RegalertCI, la plateforme de veille réglementaire HSE dédiée à la Côte d\'Ivoire. Notre objectif : rendre la conformité accessible, automatique et vérifiable pour toutes les entreprises.',
    likes: 47,
    comments: 12,
  },
  {
    date: '15 août 2024',
    title: 'Nouveau : filtrage par statut de revue',
    content: 'Les équipes HSE peuvent désormais marquer chaque texte détecté comme "À analyser", "Validé", "Hors scope" ou "Ajouté à la base". Les décisions sont exportables pour les audits de conformité.',
    likes: 32,
    comments: 8,
  },
  {
    date: '5 août 2024',
    title: '12 sources officielles désormais couvertes',
    content: 'RegalertCI couvre maintenant 12 sources réglementaires officielles, incluant le Journal Officiel de Côte d\'Ivoire, le Ministère de l\'Environnement, le CIAPOL, et plus encore. Chaque collecte est journalisée pour garantir la transparence.',
    likes: 28,
    comments: 5,
  },
];

const TEAM = [
  { role: 'Fondateur & CEO', area: 'RegTech, Conformité HSE' },
  { role: 'Lead Developer', area: 'Automatisation, IA, NLP' },
  { role: 'Juriste HSE', area: 'Droit ivoirien, Environnement' },
];

export default function LinkedIn() {
  const [activeTab, setActiveTab] = useState('accueil');
  const [following, setFollowing] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Top nav */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <a href="/" className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 text-sm">
            <ArrowLeft size={16} /> Retour au tableau de bord
          </a>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium bg-slate-100 px-3 py-1 rounded-full">Page entreprise</span>
          </div>
        </div>
      </nav>

      {/* Cover + profile header */}
      <div className="bg-white border-b border-slate-200">
        {/* Cover image area */}
        <div className="max-w-5xl mx-auto">
          <div className="h-48 md:h-56 bg-gradient-to-r from-blue-700 via-blue-600 to-emerald-600 rounded-b-lg relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-8 left-12 w-32 h-32 border-2 border-white rounded-full" />
              <div className="absolute top-16 right-20 w-48 h-48 border-2 border-white rounded-full" />
              <div className="absolute bottom-4 left-1/3 w-24 h-24 border-2 border-white rounded-full" />
            </div>
            <div className="absolute bottom-6 left-8 text-white">
              <p className="text-sm font-medium opacity-80">Plateforme de conformité</p>
              <p className="text-2xl md:text-3xl font-bold">La veille HSE qui protège votre entreprise</p>
            </div>
          </div>
        </div>

        {/* Profile section */}
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16 pb-6">
            {/* Logo */}
            <div className="w-28 h-28 md:w-36 md:h-36 bg-white rounded-lg border-4 border-white shadow-lg flex items-center justify-center shrink-0">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1">
                  <Shield size={28} className="text-blue-600" />
                </div>
                <p className="text-lg md:text-xl font-bold text-slate-900 mt-1">Regalert</p>
                <p className="text-xs font-bold text-emerald-600">CI</p>
              </div>
            </div>

            {/* Company info */}
            <div className="flex-1 pt-2 md:pt-0">
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">{COMPANY.name}</h1>
              <p className="text-base text-slate-600 mt-1">{COMPANY.tagline}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                <span className="flex items-center gap-1"><Building2 size={14} /> {COMPANY.industry}</span>
                <span className="flex items-center gap-1"><MapPin size={14} /> {COMPANY.location}</span>
                <span className="flex items-center gap-1"><Users size={14} /> {COMPANY.size}</span>
                <span className="flex items-center gap-1"><Calendar size={14} /> Fondée en {COMPANY.founded}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 shrink-0 pb-1">
              <button
                onClick={() => setFollowing(!following)}
                className={`px-6 py-2 rounded-full font-semibold text-sm transition ${
                  following
                    ? 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
                }`}
              >
                {following ? 'Abonné(e)' : '+ Suivre'}
              </button>
              <a
                href="/"
                className="px-6 py-2 rounded-full font-semibold text-sm border-2 border-slate-300 text-slate-700 hover:bg-slate-50 transition"
              >
                Visiter le site
              </a>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-t border-slate-200 -mx-4 md:-mx-8 px-4 md:px-8 overflow-x-auto">
            {[
              { id: 'accueil', label: 'Accueil' },
              { id: 'a-propos', label: 'À propos' },
              { id: 'publications', label: 'Publications' },
              { id: 'emplois', label: 'Emplois' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-3 text-sm font-semibold whitespace-nowrap transition border-b-2 ${
                  activeTab === tab.id
                    ? 'text-emerald-700 border-emerald-600'
                    : 'text-slate-500 border-transparent hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
        {activeTab === 'accueil' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Main column */}
            <div className="md:col-span-2 space-y-6">
              {/* Stats bar */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {STATS.map(stat => (
                    <div key={stat.label} className="text-center">
                      <stat.icon size={20} className="mx-auto text-blue-600 mb-2" />
                      <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
                      <p className="text-xs text-slate-500 font-medium mt-1">{stat.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent posts */}
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-slate-900">Publications récentes</h2>
                {POSTS.map((post, i) => (
                  <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Shield size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900 text-sm">{COMPANY.name}</p>
                        <p className="text-xs text-slate-500">{post.date}</p>
                      </div>
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-2">{post.title}</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">{post.content}</p>
                    <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                      <span>{post.likes} mentions J'aime</span>
                      <span>{post.comments} commentaires</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* About card */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-3">À propos</h3>
                <p className="text-sm text-slate-600 leading-relaxed line-clamp-4">{ABOUT.split('\n\n')[0]}</p>
                <button onClick={() => setActiveTab('a-propos')} className="text-blue-600 hover:text-blue-700 text-sm font-semibold mt-3 flex items-center gap-1">
                  En savoir plus <ChevronRight size={14} />
                </button>
              </div>

              {/* Specialties */}
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-3">Spécialités</h3>
                <div className="flex flex-wrap gap-2">
                  {COMPANY.specialties.map(s => (
                    <span key={s} className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>

              {/* CTA */}
              <div className="bg-gradient-to-br from-blue-600 to-emerald-600 rounded-lg p-6 text-white">
                <h3 className="font-bold text-lg mb-2">Restez conforme</h3>
                <p className="text-sm text-blue-100 mb-4">Recevez les alertes HSE directement dans votre boîte mail.</p>
                <a href="/" className="block w-full bg-white text-blue-700 text-center py-2.5 rounded-lg font-semibold text-sm hover:bg-blue-50 transition">
                  S'abonner aux alertes
                </a>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'a-propos' && (
          <div className="grid md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              {/* Presentation */}
              <div className="bg-white rounded-lg border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-4">Présentation</h2>
                {ABOUT.split('\n\n').map((para, i) => (
                  <p key={i} className="text-slate-600 leading-relaxed mb-4 last:mb-0">{para}</p>
                ))}
              </div>

              {/* Services */}
              <div className="bg-white rounded-lg border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Nos services</h2>
                <div className="grid sm:grid-cols-2 gap-6">
                  {SERVICES.map(service => (
                    <div key={service.title} className="flex gap-4">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                        <service.icon size={20} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{service.title}</h3>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{service.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Values */}
              <div className="bg-white rounded-lg border border-slate-200 p-8">
                <h2 className="text-xl font-bold text-slate-900 mb-6">Nos valeurs</h2>
                <div className="space-y-4">
                  {[
                    { title: 'Transparence', desc: 'Chaque source, chaque collecte, chaque résultat est traçable. Rien n\'est caché.' },
                    { title: 'Rigueur', desc: 'Un texte non analysé est signalé comme tel. Nous ne publions jamais d\'analyse sans vérification.' },
                    { title: 'Accessibilité', desc: 'La conformité ne devrait pas être réservée aux grandes entreprises. Nous rendons la veille HSE accessible à tous.' },
                  ].map(v => (
                    <div key={v.title} className="flex gap-3">
                      <Award size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-semibold text-slate-900 text-sm">{v.title}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">{v.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Informations</h3>
                <dl className="space-y-3 text-sm">
                  <div>
                    <dt className="text-slate-500 font-medium">Site web</dt>
                    <dd><a href="/" className="text-blue-600 hover:text-blue-700 font-medium">regalertci.com</a></dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Secteur</dt>
                    <dd className="text-slate-900">{COMPANY.industry}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Taille</dt>
                    <dd className="text-slate-900">{COMPANY.size}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Siège</dt>
                    <dd className="text-slate-900">{COMPANY.location}</dd>
                  </div>
                  <div>
                    <dt className="text-slate-500 font-medium">Fondée en</dt>
                    <dd className="text-slate-900">{COMPANY.founded}</dd>
                  </div>
                </dl>
              </div>

              <div className="bg-white rounded-lg border border-slate-200 p-6">
                <h3 className="font-bold text-slate-900 mb-4">Spécialités</h3>
                <div className="flex flex-wrap gap-2">
                  {COMPANY.specialties.map(s => (
                    <span key={s} className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'publications' && (
          <div className="max-w-2xl space-y-4">
            <h2 className="text-lg font-bold text-slate-900">Toutes les publications</h2>
            {POSTS.map((post, i) => (
              <div key={i} className="bg-white rounded-lg border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Shield size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{COMPANY.name}</p>
                    <p className="text-xs text-slate-500">{post.date}</p>
                  </div>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">{post.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{post.content}</p>
                <div className="flex items-center gap-6 mt-4 pt-4 border-t border-slate-100 text-xs text-slate-500">
                  <span>{post.likes} mentions J'aime</span>
                  <span>{post.comments} commentaires</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'emplois' && (
          <div className="max-w-2xl space-y-6">
            <div className="bg-white rounded-lg border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Rejoignez l'équipe</h2>
              <p className="text-slate-600 mb-6">
                RegalertCI est une startup en pleine croissance. Nous recherchons des talents passionnés
                par la RegTech, le droit HSE et l'automatisation.
              </p>

              <div className="space-y-4">
                {[
                  {
                    title: 'Juriste HSE — Veille réglementaire',
                    type: 'CDI',
                    location: 'Abidjan / Télétravail',
                    desc: 'Analyser les textes réglementaires collectés, enrichir le registre et garantir la qualité des obligations identifiées.',
                  },
                  {
                    title: 'Développeur Full-Stack (Next.js)',
                    type: 'CDI',
                    location: 'Télétravail',
                    desc: 'Développer et maintenir la plateforme de veille, les pipelines de collecte et les interfaces utilisateur.',
                  },
                ].map((job, i) => (
                  <div key={i} className="border border-slate-200 rounded-lg p-5 hover:border-blue-300 hover:shadow-sm transition">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-semibold text-slate-900">{job.title}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1"><Briefcase size={12} /> {job.type}</span>
                          <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>
                        </div>
                        <p className="text-sm text-slate-600 mt-2">{job.desc}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-8">
              <h2 className="text-xl font-bold text-slate-900 mb-4">L'équipe</h2>
              <div className="space-y-4">
                {TEAM.map((member, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                      <Users size={20} className="text-slate-500" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm">{member.role}</p>
                      <p className="text-xs text-slate-500">{member.area}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 mt-12">
        <div className="max-w-5xl mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Shield size={20} className="text-blue-600" />
              <span className="font-bold text-slate-900">RegalertCI</span>
              <span className="text-sm text-slate-500">— Veille réglementaire HSE</span>
            </div>
            <div className="flex items-center gap-4 text-sm text-slate-500">
              <a href="/" className="hover:text-blue-600 transition">Accueil</a>
              <span>•</span>
              <a href="mailto:contact@regalertci.com" className="hover:text-blue-600 transition flex items-center gap-1">
                <Mail size={14} /> Contact
              </a>
            </div>
          </div>
          <p className="text-center text-xs text-slate-400 mt-4">
            &copy; {new Date().getFullYear()} RegalertCI. Tous droits réservés. Abidjan, Côte d'Ivoire.
          </p>
        </div>
      </footer>
    </div>
  );
}
