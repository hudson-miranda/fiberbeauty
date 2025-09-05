import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { npsService } from '../services/api';
import { toast } from 'react-hot-toast';
import {
  StarIcon,
  ChatBubbleLeftRightIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';

const NPSRating = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const attendanceId = searchParams.get('attendanceId');
  
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState('');
  const [hoveredScore, setHoveredScore] = useState(null);

  useEffect(() => {
    if (!attendanceId) {
      toast.error('ID do atendimento não encontrado');
      navigate('/');
      return;
    }

    // Verificar se já foi avaliado
    checkExistingRating();
  }, [attendanceId, navigate]);

  const checkExistingRating = async () => {
    try {
      await npsService.getByAttendanceId(attendanceId);
      // Se chegou aqui, já existe uma avaliação
      setSubmitted(true);
    } catch (error) {
      // Se erro 404, significa que não foi avaliado ainda - isso é esperado
      if (error.response?.status !== 404) {
        console.error('Erro ao verificar avaliação:', error);
      }
    }
  };

  const handleSubmit = async () => {
    if (score === null) {
      toast.error('Por favor, selecione uma nota de 0 a 10');
      return;
    }

    try {
      setLoading(true);
      
      await npsService.create({
        attendanceId,
        score,
        comment: comment.trim() || null
      });

      setSubmitted(true);
      toast.success('Obrigado pela sua avaliação!');
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      
      if (error.response?.data?.code === 'ALREADY_RATED') {
        setSubmitted(true);
        toast.error('Este atendimento já foi avaliado');
      } else {
        toast.error('Erro ao enviar avaliação. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  const getScoreLabel = (scoreValue) => {
    if (scoreValue >= 0 && scoreValue <= 6) return 'Detrator';
    if (scoreValue >= 7 && scoreValue <= 8) return 'Neutro';
    if (scoreValue >= 9 && scoreValue <= 10) return 'Promotor';
    return '';
  };

  const getScoreColor = (scoreValue) => {
    if (scoreValue >= 0 && scoreValue <= 6) return 'text-red-600';
    if (scoreValue >= 7 && scoreValue <= 8) return 'text-yellow-600';
    if (scoreValue >= 9 && scoreValue <= 10) return 'text-green-600';
    return 'text-gray-600';
  };

  const getScoreMessage = (scoreValue) => {
    if (scoreValue >= 0 && scoreValue <= 6) return 'Lamentamos que não tenha gostado do atendimento. Seus comentários nos ajudam a melhorar.';
    if (scoreValue >= 7 && scoreValue <= 8) return 'Obrigado pela avaliação! Como podemos melhorar ainda mais?';
    if (scoreValue >= 9 && scoreValue <= 10) return 'Ficamos muito felizes que tenha gostado do atendimento!';
    return '';
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gold-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="mb-6">
            <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Avaliação Concluída!
            </h1>
            <p className="text-gray-600">
              Obrigado por avaliar nosso atendimento. Sua opinião é muito importante para nós!
            </p>
          </div>
          
          <button
            onClick={() => window.close()}
            className="w-full bg-primary-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-primary-700 transition-colors duration-200"
          >
            Fechar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-gold-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="bg-primary-100 rounded-full p-4 w-20 h-20 mx-auto mb-4 flex items-center justify-center">
            <StarIcon className="h-10 w-10 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Como foi seu atendimento?
          </h1>
          <p className="text-gray-600">
            Sua opinião nos ajuda a melhorar nossos serviços
          </p>
        </div>

        {/* Pergunta NPS */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-900 mb-4 text-center">
            Em uma escala de 0 a 10, o quanto você recomendaria nossos serviços para um amigo ou familiar?
          </h2>
          
          {/* Escala de 0-10 */}
          <div className="grid grid-cols-11 gap-2 mb-4">
            {[...Array(11)].map((_, index) => (
              <button
                key={index}
                onClick={() => setScore(index)}
                onMouseEnter={() => setHoveredScore(index)}
                onMouseLeave={() => setHoveredScore(null)}
                className={`
                  aspect-square rounded-lg border-2 font-bold text-lg transition-all duration-200 
                  ${score === index || hoveredScore === index
                    ? 'border-primary-500 bg-primary-500 text-white scale-110 shadow-lg'
                    : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300 hover:bg-primary-50'
                  }
                `}
              >
                {index}
              </button>
            ))}
          </div>

          {/* Labels */}
          <div className="flex justify-between text-sm text-gray-500 mb-4">
            <span>Pouco provável</span>
            <span>Muito provável</span>
          </div>

          {/* Categoria e mensagem */}
          {score !== null && (
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <p className={`font-medium ${getScoreColor(score)}`}>
                {getScoreLabel(score)}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {getScoreMessage(score)}
              </p>
            </div>
          )}
        </div>

        {/* Comentário */}
        <div className="mb-8">
          <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
            <ChatBubbleLeftRightIcon className="h-4 w-4 mr-2" />
            Comentários (opcional)
          </label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Conte-nos mais sobre sua experiência..."
            rows={4}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 caracteres
          </p>
        </div>

        {/* Botões */}
        <div className="space-y-3">
          <button
            onClick={handleSubmit}
            disabled={score === null || loading}
            className={`
              w-full py-3 px-6 rounded-lg font-medium transition-all duration-200
              ${score !== null && !loading
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }
            `}
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Enviando...
              </div>
            ) : (
              'Enviar Avaliação'
            )}
          </button>
          
          <button
            onClick={() => window.close()}
            className="w-full py-3 px-6 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors duration-200"
          >
            Pular avaliação
          </button>
        </div>

        {/* Nota sobre privacidade */}
        <div className="mt-6 p-3 bg-primary-50 rounded-lg">
          <div className="flex items-start">
            <ExclamationTriangleIcon className="h-5 w-5 text-primary-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-primary-800">
              Sua avaliação é anônima e será usada apenas para melhorar nossos serviços.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NPSRating;
