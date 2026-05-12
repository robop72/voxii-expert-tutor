import React, { useEffect, useRef } from 'react';

declare global { interface Window { Desmos: any; } }

export interface GraphWidgetProps {
  equation: string;
  label?: string;
}

const DESMOS_SRC = 'https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6';

export default function GraphWidget({ equation, label }: GraphWidgetProps) {
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
        backgroundColor: '#111827',
      });
      calc.setExpression({ id: 'g1', latex: equation });
      calculatorRef.current = calc;
    }

    if (window.Desmos) {
      init();
    } else {
      let script = document.querySelector<HTMLScriptElement>('script[src*="desmos"]');
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
    <div className="my-4 rounded-xl overflow-hidden border border-gray-700">
      <div className="px-4 py-2 bg-gray-800/80 border-b border-gray-700 flex items-center gap-2">
        <span className="text-sm">📈</span>
        <span className="text-xs font-medium text-gray-300">{label ?? equation}</span>
      </div>
      <div ref={containerRef} style={{ height: 300, width: '100%' }} />
    </div>
  );
}
