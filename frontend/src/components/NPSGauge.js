import React from 'react';

const NPSGauge = ({ 
  score, 
  size = 200, 
  showLabels = true, 
  showScore = true,
  className = ''
}) => {
  // Garantir que o score esteja entre -100 e 100
  const normalizedScore = Math.max(-100, Math.min(100, score || 0));
  
  // Calcular ângulo do ponteiro (semicírculo de 180°)
  // -100 = 0°, 0 = 90°, 100 = 180°
  const angle = ((normalizedScore + 100) / 200) * 180;
  
  // Raio e centro
  const radius = size / 2 - 20; // margem de 20px
  const centerX = size / 2;
  const centerY = size / 2;
  
  // Cores das zonas
  const detractorColor = '#EF4444'; // red-500
  const neutralColor = '#F59E0B';   // amber-500
  const promoterColor = '#10B981';  // emerald-500
  
  // Criar arco SVG
  const createArc = (startAngle, endAngle, color) => {
    const start = (startAngle * Math.PI) / 180;
    const end = (endAngle * Math.PI) / 180;
    
    const x1 = centerX + radius * Math.cos(Math.PI - start);
    const y1 = centerY - radius * Math.sin(Math.PI - start);
    const x2 = centerX + radius * Math.cos(Math.PI - end);
    const y2 = centerY - radius * Math.sin(Math.PI - end);
    
    const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;
    
    return `
      <path
        d="M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}"
        stroke="${color}"
        stroke-width="12"
        fill="none"
        stroke-linecap="round"
      />
    `;
  };
  
  // Posição do ponteiro
  const pointerAngle = (angle * Math.PI) / 180;
  const pointerLength = radius - 15;
  const pointerX = centerX + pointerLength * Math.cos(Math.PI - pointerAngle);
  const pointerY = centerY - pointerLength * Math.sin(Math.PI - pointerAngle);
  
  // Função para obter cor baseada no score
  const getScoreColor = (score) => {
    if (score < 0) return detractorColor;
    if (score < 50) return neutralColor;
    return promoterColor;
  };
  
  // Função para obter classificação
  const getClassification = (score) => {
    if (score < 0) return 'Crítico';
    if (score < 30) return 'Ruim';
    if (score < 50) return 'Regular';
    if (score < 70) return 'Bom';
    return 'Excelente';
  };

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="relative">
        <svg width={size} height={size * 0.65} viewBox={`0 0 ${size} ${size * 0.65}`}>
          {/* Zona Detratores (0° - 60°) */}
          <path
            d={`M ${centerX - radius} ${centerY} A ${radius} ${radius} 0 0 1 ${centerX + radius * Math.cos(Math.PI - (60 * Math.PI) / 180)} ${centerY - radius * Math.sin(Math.PI - (60 * Math.PI) / 180)}`}
            stroke={detractorColor}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Zona Neutros (60° - 120°) */}
          <path
            d={`M ${centerX + radius * Math.cos(Math.PI - (60 * Math.PI) / 180)} ${centerY - radius * Math.sin(Math.PI - (60 * Math.PI) / 180)} A ${radius} ${radius} 0 0 1 ${centerX + radius * Math.cos(Math.PI - (120 * Math.PI) / 180)} ${centerY - radius * Math.sin(Math.PI - (120 * Math.PI) / 180)}`}
            stroke={neutralColor}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Zona Promotores (120° - 180°) */}
          <path
            d={`M ${centerX + radius * Math.cos(Math.PI - (120 * Math.PI) / 180)} ${centerY - radius * Math.sin(Math.PI - (120 * Math.PI) / 180)} A ${radius} ${radius} 0 0 1 ${centerX + radius} ${centerY}`}
            stroke={promoterColor}
            strokeWidth="12"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Marcadores */}
          {[-100, -50, 0, 50, 100].map((value) => {
            const markAngle = ((value + 100) / 200) * 180;
            const markRad = (markAngle * Math.PI) / 180;
            const x1 = centerX + (radius - 8) * Math.cos(Math.PI - markRad);
            const y1 = centerY - (radius - 8) * Math.sin(Math.PI - markRad);
            const x2 = centerX + (radius + 8) * Math.cos(Math.PI - markRad);
            const y2 = centerY - (radius + 8) * Math.sin(Math.PI - markRad);
            
            return (
              <line
                key={value}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#6B7280"
                strokeWidth="2"
              />
            );
          })}
          
          {/* Ponteiro */}
          <g>
            {/* Sombra do ponteiro */}
            <line
              x1={centerX + 2}
              y1={centerY + 2}
              x2={pointerX + 2}
              y2={pointerY + 2}
              stroke="rgba(0,0,0,0.3)"
              strokeWidth="4"
              strokeLinecap="round"
            />
            
            {/* Ponteiro principal */}
            <line
              x1={centerX}
              y1={centerY}
              x2={pointerX}
              y2={pointerY}
              stroke={getScoreColor(normalizedScore)}
              strokeWidth="4"
              strokeLinecap="round"
            />
            
            {/* Centro do ponteiro */}
            <circle
              cx={centerX}
              cy={centerY}
              r="8"
              fill={getScoreColor(normalizedScore)}
              stroke="white"
              strokeWidth="2"
            />
          </g>
        </svg>
        
        {/* Score no centro */}
        {showScore && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center mt-8">
              <div className={`text-3xl font-bold`} style={{ color: getScoreColor(normalizedScore) }}>
                {normalizedScore}
              </div>
              <div className="text-sm text-gray-600 font-medium">
                {getClassification(normalizedScore)}
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Labels das zonas */}
      {showLabels && (
        <div className="flex justify-between w-full max-w-xs mt-4 text-xs font-medium">
          <div className="text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: detractorColor }}></div>
            <div className="text-gray-600">Detratores</div>
            <div className="text-gray-500">-100 a -1</div>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: neutralColor }}></div>
            <div className="text-gray-600">Neutros</div>
            <div className="text-gray-500">0 a 49</div>
          </div>
          <div className="text-center">
            <div className="w-3 h-3 rounded-full mx-auto mb-1" style={{ backgroundColor: promoterColor }}></div>
            <div className="text-gray-600">Promotores</div>
            <div className="text-gray-500">50 a 100</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NPSGauge;
