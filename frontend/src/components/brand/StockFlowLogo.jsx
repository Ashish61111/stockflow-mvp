export default function StockFlowLogo({ className = "" }) {
  return (
    <div
      className={`brand-mark sf-brand-logo ${className}`}
      role="img"
      aria-label="StockFlow logo"
    >
      <span className="sf-logo-orbit" aria-hidden="true">
        <span className="sf-logo-ring sf-logo-ring-outer" />
        <span className="sf-logo-ring sf-logo-ring-middle" />
        <span className="sf-logo-ring sf-logo-ring-inner" />
        <span className="sf-logo-orbit-dot" />
        <span className="sf-logo-orbit-dot sf-logo-orbit-dot-two" />
      </span>

      <span className="sf-logo-particle-trail" aria-hidden="true" />

      <svg
        className="sf-brand-symbol"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <g className="sf-logo-cube sf-logo-cube-top">
          <path d="M24 4 L34 10 L24 16 L14 10 Z" />
          <path d="M14 10 V22 L24 28 V16" />
          <path d="M34 10 V22 L24 28" />
        </g>

        <g className="sf-logo-cube sf-logo-cube-left">
          <path d="M14 17 L24 23 L14 29 L4 23 Z" />
          <path d="M4 23 V35 L14 41 V29" />
          <path d="M24 23 V35 L14 41" />
        </g>

        <g className="sf-logo-cube sf-logo-cube-right">
          <path d="M34 17 L44 23 L34 29 L24 23 Z" />
          <path d="M24 23 V35 L34 41 V29" />
          <path d="M44 23 V35 L34 41" />
        </g>
      </svg>

      <span className="sf-logo-flash" aria-hidden="true" />
    </div>
  );
}
