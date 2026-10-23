import './borboletas-hero.css'

const BORBOLETAS = [
  { id: 'uma', classe: 'angel-butterflies__flight--one', asa: 'angel-butterflies__wings--rose' },
  { id: 'duas', classe: 'angel-butterflies__flight--two', asa: 'angel-butterflies__wings--pearl' },
  { id: 'tres', classe: 'angel-butterflies__flight--three', asa: 'angel-butterflies__wings--lilac' },
  { id: 'quatro', classe: 'angel-butterflies__flight--four', asa: 'angel-butterflies__wings--champagne' },
] as const

function Borboleta({ asa }: { asa: string }) {
  return (
    <svg
      className={`angel-butterflies__butterfly ${asa}`}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <g className="angel-butterflies__wings">
        <path
          className="angel-butterflies__wing angel-butterflies__wing--left"
          d="M23.5 23.5C18.8 13.2 7.1 5.9 4.8 14.1C2.6 21.7 12.4 28.2 23.5 27.2Z"
          fill="currentColor"
        />
        <path
          className="angel-butterflies__wing angel-butterflies__wing--right"
          d="M24.5 23.5C29.2 13.2 40.9 5.9 43.2 14.1C45.4 21.7 35.6 28.2 24.5 27.2Z"
          fill="currentColor"
        />
        <path
          className="angel-butterflies__wing angel-butterflies__wing--left-lower"
          d="M23.5 25.4C17.1 25.8 9.6 29.3 12.7 35.3C15.3 40.2 21.4 32.6 23.5 28.1Z"
          fill="currentColor"
        />
        <path
          className="angel-butterflies__wing angel-butterflies__wing--right-lower"
          d="M24.5 25.4C30.9 25.8 38.4 29.3 35.3 35.3C32.7 40.2 26.6 32.6 24.5 28.1Z"
          fill="currentColor"
        />
      </g>
      <path
        d="M24 22.8C22.7 26.4 23.1 30.2 24 33.2C24.9 30.2 25.3 26.4 24 22.8Z"
        fill="#6F4B59"
        opacity=".85"
      />
      <path
        d="M23.7 23.4C21.5 18.9 19.8 18.3 17.7 17.7M24.3 23.4C26.5 18.9 28.2 18.3 30.3 17.7"
        stroke="#6F4B59"
        strokeWidth="1"
        strokeLinecap="round"
        opacity=".65"
      />
    </svg>
  )
}

export function BorboletasHero() {
  return (
    <div className="angel-butterflies" aria-hidden="true">
      {BORBOLETAS.map((borboleta) => (
        <span
          className={`angel-butterflies__flight ${borboleta.classe}`}
          key={borboleta.id}
        >
          <Borboleta asa={borboleta.asa} />
        </span>
      ))}
    </div>
  )
}
