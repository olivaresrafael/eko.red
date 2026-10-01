// Icono de X (compartir) — next-share (hasta 0.27) solo trae TwitterIcon, así
// que se conserva TwitterShareButton (abre twitter.com/intent/tweet, que X
// sigue soportando) pero con el glifo de X en negro.
const XIcon = ({ size = 30, round = false, bgColor = '#000000' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    role="img"
    aria-label="X"
    style={round ? { backgroundColor: bgColor, borderRadius: '50%' } : undefined}
  >
    <path
      fill="#ffffff"
      transform="translate(4.8 4.8) scale(0.6)"
      d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
    />
  </svg>
)

export default XIcon
