import React, { useState, useEffect } from 'react';
import { Calculator, DollarSign, Percent, Calendar, ShieldCheck, MessageCircle, HelpCircle } from 'lucide-react';
import { BROKER_INFO } from '../data/properties';

interface FinancingSimulatorProps {
  initialPrice?: number;
}

export const FinancingSimulator: React.FC<FinancingSimulatorProps> = ({ initialPrice = 850000 }) => {
  const [propertyPrice, setPropertyPrice] = useState<number>(initialPrice);
  const [downPaymentPercent, setDownPaymentPercent] = useState<number>(20); // 20%
  const [years, setYears] = useState<number>(30); // 30 years (360 months)
  const [annualInterestRate, setAnnualInterestRate] = useState<number>(9.99); // 9.99% a.a.
  const [systemType, setSystemType] = useState<'SAC' | 'PRICE'>('SAC');

  // Update if initialPrice changes externally (e.g. from a property card modal)
  useEffect(() => {
    if (initialPrice && initialPrice > 0) {
      setPropertyPrice(initialPrice);
    }
  }, [initialPrice]);

  // Derived financial calculations
  const downPaymentValue = (propertyPrice * downPaymentPercent) / 100;
  const loanAmount = Math.max(0, propertyPrice - downPaymentValue);
  const totalMonths = years * 12;
  const monthlyRate = Math.pow(1 + annualInterestRate / 100, 1 / 12) - 1;

  // Monthly installments
  let firstInstallment = 0;
  let lastInstallment = 0;

  if (loanAmount > 0 && totalMonths > 0) {
    if (systemType === 'SAC') {
      const principalAmortization = loanAmount / totalMonths;
      const firstInterest = loanAmount * monthlyRate;
      firstInstallment = principalAmortization + firstInterest;

      const lastInterest = principalAmortization * monthlyRate;
      lastInstallment = principalAmortization + lastInterest;
    } else {
      // PRICE
      firstInstallment = (loanAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -totalMonths));
      lastInstallment = firstInstallment;
    }
  }

  // Recommended family income (installments <= 30% of gross income)
  const recommendedIncome = firstInstallment / 0.3;

  const formatBRL = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(val);
  };

  const handleSendSimulationToWhatsApp = () => {
    const text = `Olá João Raimundo! Fiz uma simulação de financiamento no seu site:
- Valor do Imóvel: ${formatBRL(propertyPrice)}
- Entrada (${downPaymentPercent}%): ${formatBRL(downPaymentValue)}
- Financiamento: ${formatBRL(loanAmount)} em ${years} anos (${totalMonths} meses)
- Sistema: ${systemType === 'SAC' ? 'SAC (Parcelas Decrescentes)' : 'Tabela Price (Fixas)'}
- Primeira Parcela Estimada: ${formatBRL(firstInstallment)}
Gostaria da sua ajuda para aprovar meu crédito bancário com as melhores taxas do mercado.`;

    window.open(`https://wa.me/${BROKER_INFO.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <section id="simulador" className="py-20 bg-slate-900 text-white relative overflow-hidden">
      
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px]" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded bg-teal-500/20 text-teal-300 text-xs font-bold tracking-wider mb-3 border border-teal-500/30">
            <Calculator className="w-3.5 h-3.5" />
            <span>Ferramenta de Planejamento Financeiro</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Simulador de Financiamento Habitacional
          </h2>
          <p className="text-base text-slate-300 mt-3 leading-relaxed">
            Calcule estimativas reais de parcelas e descubra as melhores condições de financiamento para o seu novo imóvel em Maceió. João Raimundo cuida de toda a aprovação de crédito sem custos adicionais.
          </p>
        </div>

        {/* Calculator Main Box */}
        <div className="bg-slate-950/90 rounded-2xl border border-slate-800 p-6 sm:p-8 lg:p-10 shadow-2xl backdrop-blur-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Input Controls (7 columns) */}
            <div className="lg:col-span-7 space-y-6">
              
              {/* Property Value Slider & Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Valor do Imóvel
                  </label>
                  <span className="text-xl font-extrabold text-teal-400 tabular-nums">
                    {formatBRL(propertyPrice)}
                  </span>
                </div>
                <input
                  type="range"
                  min="300000"
                  max="4000000"
                  step="20000"
                  value={propertyPrice}
                  onChange={(e) => setPropertyPrice(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>R$ 300 mil</span>
                  <span>R$ 2 milhões</span>
                  <span>R$ 4 milhões</span>
                </div>
              </div>

              {/* Down Payment (% and R$) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Valor da Entrada ({downPaymentPercent}%)
                  </label>
                  <span className="text-lg font-bold text-white tabular-nums">
                    {formatBRL(downPaymentValue)}
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="80"
                  step="5"
                  value={downPaymentPercent}
                  onChange={(e) => setDownPaymentPercent(Number(e.target.value))}
                  className="w-full accent-teal-400 cursor-pointer h-2 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-500">
                  <span>20% (Mínimo exigido)</span>
                  <span>50%</span>
                  <span>80%</span>
                </div>
              </div>

              {/* Loan Term (Years) */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Prazo do Financiamento
                  </label>
                  <span className="text-base font-bold text-white tabular-nums">
                    {years} anos ({totalMonths} meses)
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  {[15, 20, 25, 30, 35].slice(0, 4).map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setYears(y)}
                      className={`py-2 text-xs font-bold rounded-lg transition-colors border ${
                        years === y
                          ? 'bg-teal-500 text-slate-950 border-teal-400'
                          : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800'
                      }`}
                    >
                      {y} anos
                    </button>
                  ))}
                </div>
              </div>

              {/* Amortization System (SAC vs PRICE) */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Sistema de Amortização
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSystemType('SAC')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      systemType === 'SAC'
                        ? 'border-teal-400 bg-teal-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Tabela SAC</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Parcelas decrescentes (começam mais altas e diminuem todo mês)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSystemType('PRICE')}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      systemType === 'PRICE'
                        ? 'border-teal-400 bg-teal-500/10 text-white'
                        : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-xs font-bold text-white">Tabela Price</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Parcelas fixas durante todo o período do financiamento
                    </div>
                  </button>
                </div>
              </div>

            </div>

            {/* Results Card (5 columns) */}
            <div className="lg:col-span-5 bg-gradient-to-b from-slate-900 to-slate-950 p-6 sm:p-8 rounded-xl border border-teal-500/30 space-y-6">
              
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-teal-400 block mb-1">
                  Resumo da Simulação
                </span>
                <div className="text-xs text-slate-400">
                  Taxa referencial média de <strong>{annualInterestRate}% a.a.</strong> (Caixa / Bancos Comerciais)
                </div>
              </div>

              <div className="space-y-4 pt-2 border-t border-slate-800">
                <div>
                  <span className="text-xs text-slate-400 block">Valor a ser Financiado</span>
                  <span className="text-2xl font-black text-white tabular-nums">
                    {formatBRL(loanAmount)}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                  <div>
                    <span className="text-[11px] text-slate-400 block">
                      {systemType === 'SAC' ? '1ª Parcela (Maior)' : 'Parcela Mensal Fixa'}
                    </span>
                    <span className="text-xl font-extrabold text-emerald-400 tabular-nums">
                      {formatBRL(firstInstallment)}
                    </span>
                  </div>

                  {systemType === 'SAC' && (
                    <div>
                      <span className="text-[11px] text-slate-400 block">Última Parcela</span>
                      <span className="text-xl font-extrabold text-teal-300 tabular-nums">
                        {formatBRL(lastInstallment)}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-3.5 rounded-lg bg-teal-950/40 border border-teal-800/40 text-xs text-teal-200">
                  <div className="font-semibold text-white mb-0.5">Renda Familiar Recomendada:</div>
                  Aproximadamente <strong className="text-teal-300">{formatBRL(recommendedIncome)}</strong> (pode ser composta por até 3 pessoas).
                </div>
              </div>

              {/* Submit CTA */}
              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleSendSimulationToWhatsApp}
                  className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs sm:text-sm transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar Simulação para João Raimundo</span>
                </button>

                <p className="text-[11px] text-slate-400 text-center leading-normal">
                  *Valores estimados para fins informativos. As taxas reais dependem do perfil cadastral e do banco escolhido (Caixa, Itaú, Bradesco, Santander).
                </p>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
