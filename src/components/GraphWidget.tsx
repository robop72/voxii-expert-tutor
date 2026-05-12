import React, { useEffect, useRef } from 'react';

declare global {
  interface Window { Desmos: any; }
}

interface Props {
  equation: string;
  label?: string;
}

const DESMOS_SRC = 'https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';

export default function GraphWidget({ equation, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const calculatorRef = useRef<any>(null);

  useEffect(() => {
    function init() {
      if (!containerRef.current || !window.Desmos) return;
      calculatorRef.current?.destroy();
      const calc = window.Desmos.GraphingCalculator(containerRef.current, {
        expressions: false,
        settingsMenu: false,
        zoomButtons: true,
        border: false,
        backgroundColor: '#1a1f2e',
      });
      calc.setExpression({ id: 'g1', latex: equation });
      calculatorRef.current = calc;
    }

    if (window.Desmos) {
      init();
    } else {
      let script = document.querySelector<HTMLScriptElement>(`script[src*="desmos"]`);
      if (!script) {
        script = document.createElement('script');
        script.src = DESMOS_SRC;
        document.head.appendChild(script);
      }
      script.addEventListener('load', init);
    }

    return () => { calculatorRef.current?.destroy(); };
  }, [equation]);

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-gray-700 bg-[#1a1f2e]">
      {label && (
        <p className="px-4 py-2 text-xs text-gray-400 bg-gray-800/60 border-b border-gray-700">
          📈 {label}
        </p>
      )}
      <div ref={containerRef} style={{ height: 320, width: '100%' }} />
    </div>
  );
}
