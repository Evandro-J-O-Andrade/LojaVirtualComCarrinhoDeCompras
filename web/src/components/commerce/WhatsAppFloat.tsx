import { WhatsAppLogo } from './WhatsAppLogo'

const WHATSAPP_NUMERO = '5511963205776'
const WHATSAPP_MENSAGEM = encodeURIComponent(
  'Olá! Gostaria de mais informações sobre produtos e serviços da Angel Cosméticos.',
)

export function WhatsAppFloat() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMERO}?text=${WHATSAPP_MENSAGEM}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Falar no WhatsApp"
      className="fixed bottom-6 right-6 z-300 flex h-14 w-14 items-center justify-center
                 rounded-full bg-[#25D366] text-white shadow-2xl transition-all duration-300
                 hover:h-16 hover:w-16 hover:scale-110 hover:shadow-[0_0_20px_rgba(37,211,104,0.5)]
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <WhatsAppLogo className="h-7 w-7" />
    </a>
  )
}
