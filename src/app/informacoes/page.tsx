import { Calendar, MapPin, Clock, Bus, Home, Users, DollarSign, AlertTriangle, CheckCircle } from "lucide-react";

export default function InformacoesPage() {
  return (
    <div className="p-6 space-y-5 max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-800">Informações do Acampamento</h1>

      {/* Dados gerais */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <Calendar size={18} className="text-primary-600" /> Dados Gerais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-start gap-2">
            <Calendar size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500 text-xs">Data</p>
              <p className="font-medium">19 a 22 de novembro de 2026</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500 text-xs">Local</p>
              <p className="font-medium">Acampamento Monte Horebe</p>
              <p className="text-gray-500">Cesário Lange, SP</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500 text-xs">Check-in</p>
              <p className="font-medium">19/11 das 20h às 23h</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <Clock size={15} className="text-gray-400 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-gray-500 text-xs">Check-out</p>
              <p className="font-medium">22/11 até 18h</p>
            </div>
          </div>
        </div>
      </div>

      {/* Valores */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <DollarSign size={18} className="text-primary-600" /> Valores
        </h2>
        <div className="space-y-3 text-sm">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-semibold text-gray-700 mb-2">Acomodação Compartilhada (Quarto Coletivo)</p>
            <div className="space-y-1 text-gray-600">
              <p>• 0 a 5 anos: <strong className="text-green-600">Isento</strong></p>
              <p>• 6 a 10 anos: <strong>R$ 410,00</strong> (meia entrada)</p>
              <p>• 11 anos ou mais: <strong>R$ 820,00</strong></p>
              <p className="text-xs text-gray-500 mt-1">Parcelado em até 10x no cartão + juros</p>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-3 border border-orange-200">
            <p className="font-semibold text-gray-700 mb-2">Quarto Village (Casal) — vagas limitadas</p>
            <div className="space-y-1 text-gray-600">
              <p>• Por pessoa: <strong>R$ 1.050,00</strong></p>
              <p>• Exclusivo para casais. Permite 1 criança de 0–5 anos no quarto.</p>
              <p className="text-xs text-gray-500 mt-1">Parcelado em até 10x no cartão + juros</p>
            </div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <p className="font-semibold text-gray-700 mb-1 flex items-center gap-2">
              <Bus size={15} /> Transporte (opcional)
            </p>
            <p className="text-gray-600">+ R$ 150,00 por pessoa</p>
          </div>
          <div className="bg-yellow-50 rounded-lg p-3 border border-yellow-200">
            <p className="font-semibold text-gray-700 mb-1">Sinal de reserva</p>
            <p className="text-gray-600">R$ 100,00 por pessoa — pago pelo App Hermom.</p>
            <p className="text-xs text-gray-500 mt-1">
              O restante é quitado diretamente para a Igreja. O sinal não é reembolsável em caso de desistência.
            </p>
          </div>
        </div>
      </div>

      {/* Refeições */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
          <CheckCircle size={18} className="text-primary-600" /> Refeições Inclusas
        </h2>
        <p className="text-sm text-gray-600">Café da manhã, almoço, jantar e chá da noite.</p>
        <p className="text-xs text-gray-500 mt-1">
          Os valores consumidos na cantina devem ser pagos até a data final do evento por quem consumiu.
        </p>
      </div>

      {/* Regras */}
      <div className="card">
        <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
          <AlertTriangle size={18} className="text-primary-600" /> Regras e Informações Importantes
        </h2>
        <ul className="space-y-2.5 text-sm text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">•</span>
            Todas as opções de reserva exigem pagamento de um sinal de <strong>R$ 100,00 por pessoa</strong> pelo App Hermom. O restante é formalizado com o Wilton.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">•</span>
            Quem não tiver transporte próprio pode optar pelo transporte coletivo com custo extra de R$ 150,00/pessoa.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">•</span>
            Opção de quarto Village é <strong>exclusiva para casais</strong> (vagas limitadas). Selecionar o Ticket Village no momento da inscrição.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">•</span>
            <strong>Menores de 14 anos</strong> só podem participar acompanhados dos pais ou responsáveis.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">•</span>
            <strong>De 15 a 18 anos</strong> somente com autorização preenchida e entregue em mãos antes do evento. Use a aba <strong>"Autorização Menores"</strong>.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">•</span>
            Fazer a inscrição para todos que participarão, <strong>inclusive crianças isentas</strong>.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">•</span>
            A idade para fins de pagamento é calculada pela <strong>idade no dia do evento (19/11/2026)</strong>.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">•</span>
            Em caso de desistência, o sinal de R$ 100,00 <strong>não é reembolsável</strong>.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">•</span>
            A Igreja Hermom não se responsabiliza por objetos esquecidos, perdidos ou danificados.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">•</span>
            Objetos quebrados ou danificados serão cobrados do responsável.
          </li>
          <li className="flex items-start gap-2">
            <span className="text-primary-500 font-bold mt-0.5">•</span>
            Vagas sujeitas à disponibilidade.
          </li>
        </ul>
      </div>
    </div>
  );
}
