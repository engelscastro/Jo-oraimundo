import React, { useState } from 'react';
import { Mail, Phone, MapPin, MessageCircle, Send, CheckCircle2, Calendar } from 'lucide-react';
import { BROKER_INFO, MACEIO_BAIRROS_BY_REGION } from '../data/properties';
import { useRealEstate } from '../context/RealEstateContext';

export const ContactSection: React.FC = () => {
  const { brokerInfo } = useRealEstate();
  const currentBroker = brokerInfo || BROKER_INFO;

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [interest, setInterest] = useState('comprar');
  const [neighborhood, setNeighborhood] = useState('Ponta Verde');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    const interestLabel = interest === 'comprar' 
      ? 'Comprar para morar' 
      : interest === 'investir' 
        ? 'Investimento / Aluguel por temporada' 
        : 'Vender meu imóvel';

    const text = `*Novo Contato via Landing Page:*
- Nome: ${name}
- WhatsApp: ${phone}
- E-mail: ${email || 'Não informado'}
- Interesse: ${interestLabel}
- Bairro de Preferência: ${neighborhood}
- Mensagem: ${message || 'Gostaria de agendar um atendimento personalizado.'}`;

    window.open(`https://wa.me/${currentBroker.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
    setSubmitted(true);
  };

  return (
    <section id="contato" className="py-20 bg-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            
            {/* Left Col: Contact Info & Value (5 cols) */}
            <div className="lg:col-span-5 bg-slate-900 text-white p-8 sm:p-10 lg:p-12 flex flex-col justify-between">
              
              <div className="space-y-6">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-2">
                    Fale com o Corretor
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                    Agende sua Consultoria ou Visita com João Raimundo
                  </h2>
                </div>

                <p className="text-sm text-slate-300 leading-relaxed">
                  Tire dúvidas sobre plantas, tabelas de pagamento direto com a construtora ou simulação de financiamento bancário para imóveis em Maceió.
                </p>

                <div className="space-y-4 pt-4 border-t border-slate-800 text-sm">
                  <div className="flex items-start gap-3">
                    <Phone className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">Telefone / WhatsApp</p>
                      <a href={`tel:${currentBroker.whatsappNumber}`} className="font-semibold text-white hover:text-teal-300 transition-colors">
                        {currentBroker.phoneFormatted}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">E-mail Direto</p>
                      <a href={`mailto:${currentBroker.email}`} className="font-semibold text-white hover:text-teal-300 transition-colors">
                        {currentBroker.email}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-teal-400 shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs text-slate-400">Atendimento Presencial em Maceió</p>
                      <p className="text-slate-200 text-xs leading-relaxed">
                        {BROKER_INFO.address}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-800 mt-8">
                <p className="text-xs text-slate-400">
                  Atendimento de segunda a sábado das 08h às 20h. Plantão exclusivo aos domingos para clientes agendados.
                </p>
              </div>

            </div>

            {/* Right Col: Lead Capture Form (7 cols) */}
            <div className="lg:col-span-7 p-8 sm:p-10 lg:p-12">
              
              <h3 className="text-xl font-bold text-slate-900 mb-2">
                Envie seus dados para atendimento imediato
              </h3>
              <p className="text-xs text-slate-500 mb-6">
                Seus dados serão tratados com absoluto sigilo profissional.
              </p>

              {submitted ? (
                <div className="p-8 rounded-2xl bg-teal-50 border border-teal-200 text-center space-y-4">
                  <CheckCircle2 className="w-12 h-12 text-teal-600 mx-auto" />
                  <h4 className="text-lg font-bold text-slate-900">
                    Mensagem enviada com sucesso!
                  </h4>
                  <p className="text-sm text-slate-600">
                    O WhatsApp do corretor João Raimundo foi aberto com os seus dados para início imediato do atendimento.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="px-4 py-2 text-xs font-semibold text-teal-800 bg-teal-100 rounded-lg hover:bg-teal-200"
                  >
                    Enviar outra mensagem
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  
                  {/* Interest radio tabs */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Qual é o seu objetivo?
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { id: 'comprar', label: 'Comprar para Morar' },
                        { id: 'investir', label: 'Investir / Renda' },
                        { id: 'vender', label: 'Vender Imóvel' }
                      ].map((item) => (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setInterest(item.id)}
                          className={`py-2 px-3 text-xs font-bold rounded-lg border transition-all text-center ${
                            interest === item.id
                              ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Seu Nome Completo *
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Ex: Carlos Eduardo"
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        WhatsApp / Celular com DDD *
                      </label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Ex: (82) 99999-9999"
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        E-mail
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seuemail@exemplo.com"
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-slate-700">
                        Bairro de Preferência
                      </label>
                      <select
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                      >
                        <option value="Ainda em dúvida / Qualquer bairro">Ainda em dúvida / Qualquer bairro de Maceió</option>
                        {MACEIO_BAIRROS_BY_REGION.map((group) => (
                          <optgroup key={group.region} label={group.region}>
                            {group.bairros.map((b) => (
                              <option key={b} value={b}>
                                {b}
                              </option>
                            ))}
                          </optgroup>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-700">
                      Mensagem ou Preferência de Horário para Visita
                    </label>
                    <textarea
                      rows={3}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Ex: Gostaria de visitar lançamentos de 3 suítes na orla neste sábado pela manhã..."
                      className="w-full text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm transition-colors flex items-center justify-center gap-2 shadow-md shadow-emerald-700/20"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span>Iniciar Conversa com João Raimundo</span>
                  </button>
                </form>
              )}

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
