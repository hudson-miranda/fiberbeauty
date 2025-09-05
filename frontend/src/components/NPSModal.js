import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import { npsService } from '../services/api';
import { StarIcon } from '@heroicons/react/24/solid';

const NPSModal = ({ isOpen, onClose, attendanceId, onSuccess }) => {
  const [score, setScore] = useState(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [existingRating, setExistingRating] = useState(null);

  useEffect(() => {
    const checkExistingRating = async () => {
      try {
        const response = await npsService.getByAttendanceId(attendanceId);
        if (response.data && response.data.npsRating) {
          setExistingRating(response.data.npsRating);
          setScore(response.data.npsRating.score);
          setComment(response.data.npsRating.comment || '');
        } else {
          // Se não há avaliação existente, limpar os campos
          setExistingRating(null);
          setScore(null);
          setComment('');
        }
      } catch (error) {
        console.error('Erro ao verificar avaliação existente:', error);
        // Em caso de erro, também limpar os campos
        setExistingRating(null);
        setScore(null);
        setComment('');
      }
    };

    if (isOpen && attendanceId) {
      checkExistingRating();
    } else if (isOpen) {
      // Se o modal está aberto mas não há attendanceId, limpar tudo
      setExistingRating(null);
      setScore(null);
      setComment('');
    }
  }, [isOpen, attendanceId]);

  // Efeito para limpar estado quando o modal fecha
  useEffect(() => {
    if (!isOpen) {
      setScore(null);
      setComment('');
      setExistingRating(null);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (score === null) {
      alert('Por favor, selecione uma nota de 0 a 10');
      return;
    }

    if (existingRating) {
      alert('Este atendimento já foi avaliado!');
      return;
    }

    setLoading(true);
    try {
      await npsService.create({
        attendanceId,
        score,
        comment: comment.trim()
      });
      
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Erro ao enviar avaliação:', error);
      alert('Erro ao enviar avaliação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setScore(null);
    setComment('');
    setExistingRating(null);
    onClose();
  };

  const getScoreColor = (value) => {
    if (value <= 6) return 'bg-red-500 text-white border-red-500';
    if (value <= 8) return 'bg-yellow-500 text-white border-yellow-500';
    return 'bg-green-500 text-white border-green-500';
  };

  const getScoreLabel = (value) => {
    if (value <= 6) return 'Não recomendaria';
    if (value <= 8) return 'Neutro';
    return 'Recomendaria';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Avalie seu Atendimento"
      size="xl"
    >
      {existingRating ? (
        <div className="text-center py-8">
          <div className="mb-4">
            <StarIcon className="h-16 w-16 text-yellow-500 mx-auto" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Obrigado pela sua avaliação!
          </h3>
          <p className="text-gray-600 mb-4">
            Você já avaliou este atendimento com nota {existingRating.score}/10
          </p>
          {existingRating.comment && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <p className="text-sm text-gray-700">
                <strong>Seu comentário:</strong> {existingRating.comment}
              </p>
            </div>
          )}
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Em uma escala de 0 a 10, o quanto você recomendaria nossos serviços?
            </label>
            
            {/* Escala de 0 a 10 */}
            <div>
              {/* Linha 1: 0 a 5 */}
              <div className="flex justify-center gap-3 mb-3">
                {[0, 1, 2, 3, 4, 5].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScore(value)}
                    className={`w-12 aspect-square flex items-center justify-center rounded-full border-2 font-medium transition-all hover:scale-105 ${
                      score === value
                        ? `${getScoreColor(value)} border-current shadow-lg`
                        : 'border-gray-300 text-gray-700 hover:border-primary-400 hover:text-primary-600 bg-white'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>

              {/* Linha 2: 6 a 10 */}
              <div className="flex justify-center gap-3">
                {[6, 7, 8, 9, 10].map((value) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setScore(value)}
                    className={`w-12 aspect-square flex items-center justify-center rounded-full border-2 font-medium transition-all hover:scale-105 ${
                      score === value
                        ? `${getScoreColor(value)} border-current shadow-lg`
                        : 'border-gray-300 text-gray-700 hover:border-primary-400 hover:text-primary-600 bg-white'
                    }`}
                  >
                    {value}
                  </button>
                ))}
              </div>

              {/* Labels da escala */}
              <div className="flex justify-between text-sm text-gray-500 mt-4 mb-4 px-1">
                <span>Não recomendaria</span>
                <span>Recomendaria totalmente</span>
              </div>
            </div>

            {/* Feedback visual da nota selecionada */}
            {score !== null && (
              <div className="text-center mb-4 p-3 rounded-lg bg-gray-50">
                <span className={`text-lg font-semibold ${
                  score <= 6 ? 'text-red-600' : 
                  score <= 8 ? 'text-yellow-600' : 
                  'text-green-600'
                }`}>
                  {score}/10 - {getScoreLabel(score)}
                </span>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
              Comentário (opcional)
            </label>
            <textarea
              id="comment"
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Conte-nos sobre sua experiência..."
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading || score === null}
              className="flex-1 py-2 px-4 bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
            >
              {loading ? 'Enviando...' : 'Enviar Avaliação'}
            </button>
          </div>
        </form>
      )}
    </Modal>
  );
};

export default NPSModal;
